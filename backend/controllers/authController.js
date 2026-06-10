import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Project from '../models/Project.js'
import { sendSMSWithValidation } from '../services/twilioService.js'
import { resolveFrontendBaseUrl } from '../services/resolveFrontendBaseUrl.js'
import { resolveRoleForNewUser } from '../utils/roles.js'
import { buildAuthLoginResponse, buildAuthUserPayload } from '../utils/authUserPayload.js'

const generateToken = (userOrId) => {
  const payload =
    userOrId && typeof userOrId === 'object'
      ? { id: String(userOrId._id || userOrId.id), role: userOrId.role }
      : { id: String(userOrId) }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d'
  })
}

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, birthday, role, skipPasswordSetup, projectId } = req.body

    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    let currentUser = null

    // Si skipPasswordSetup es true, requiere autenticación de admin
    if (skipPasswordSetup) {
      let token

      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
          token = req.headers.authorization.split(' ')[1]
          const decoded = jwt.verify(token, process.env.JWT_SECRET)
          currentUser = await User.findById(decoded.id).select('-password')
        } catch (error) {
          return res.status(401).json({ message: 'Invalid or expired token' })
        }
      }

      if (!currentUser) {
        return res.status(401).json({ message: 'Authentication required to create users without password' })
      }

      if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: 'Admin access required to create users without password' })
      }

      if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required when skipPasswordSetup is true' })
      }
    }

    // Si es admin creando usuario y skipPasswordSetup es true, crear sin contraseña
    const isAdminCreating = skipPasswordSetup
    const creatorRole = isAdminCreating ? currentUser?.role : null
    const assignedRole = resolveRoleForNewUser(creatorRole, role)

    let userData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      birthday,
      role: assignedRole
    }

    if (projectId) {
      const exists = await Project.exists({ _id: projectId })
      if (!exists) {
        return res.status(404).json({ message: 'Project not found' })
      }
      userData.projectMemberships = [{ project: projectId, role: 'resident' }]
    }

    // Si no es admin creando usuario, requiere contraseña
    if (!isAdminCreating) {
      if (!password) {
        return res.status(400).json({ message: 'Password is required' })
      }
      userData.password = password
      userData.passwordSet = true
    } else {
      // Admin creando usuario sin contraseña - generar setup token
      const user = new User(userData)
      const setupToken = user.generateSetupToken()
      await user.save()

      // Enviar SMS con el link de setup
      if (phoneNumber) {
        try {
          const frontendUrl = await resolveFrontendBaseUrl(projectId)
          const setupLink = `${frontendUrl}/setup-password/${setupToken}`
          const message = `Hi ${firstName}, your account has been created. Please set your password by visiting this link: ${setupLink}`
          
          console.log('Sending SMS to:', phoneNumber)
          // await sendSMSWithValidation(phoneNumber, message)
        } catch (smsError) {
          console.error('Error sending setup SMS:', smsError.message)
          // No fallar la creación del usuario si falla el SMS
        }
      }

      return res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        message: 'User created successfully. Setup link sent via SMS.',
        setupToken: setupToken // Solo para desarrollo/testing, remover en producción
      })
    }

    const user = await User.create(userData)

    if (user) {
      res.status(201).json(buildAuthLoginResponse(user, generateToken(user)))
    } else {
      res.status(400).json({ message: 'Invalid user data' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body

    // Validar que se proporcione email o phoneNumber
    if (!email && !phoneNumber) {
      return res.status(400).json({ message: 'Email or phone number is required' })
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' })
    }

    // Buscar usuario por email o phoneNumber
    const query = email ? { email } : { phoneNumber }
    // Solo +password: incluir hash. No usar select('+password projectMemberships') — Mongoose
    // interpreta projectMemberships como lista exclusiva y omite role, email, etc.
    const user = await User.findOne(query).select('+password').populate('lots')

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Sin hash de contraseña: debe usar el enlace de setup (usuarios creados por admin).
    // Usuarios legacy pueden tener passwordSet=false aunque ya tengan contraseña.
    if (!user.password) {
      return res.status(403).json({ 
        message: 'Password not set. Please set your password using the setup link sent to your phone.',
        requiresPasswordSetup: true
      })
    }

    if (await user.matchPassword(password)) {
      if (!user.passwordSet) {
        user.passwordSet = true
        await user.save()
      }
      res.json(buildAuthLoginResponse(user, generateToken(user)))
    } else {
      res.status(401).json({ message: 'Invalid credentials' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Login exclusivo para usuarios con rol admin, superadmin u owner.
 * Misma interfaz que login (email o phoneNumber + password) pero rechaza a usuarios con rol "user".
 */
export const loginAdmin = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body

    if (!email && !phoneNumber) {
      return res.status(400).json({ message: 'Email or phone number is required' })
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' })
    }

    const query = email ? { email } : { phoneNumber }
    const user = await User.findOne(query).select('+password')

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied. Admin login only.' })
    }

    if (!user.password) {
      return res.status(403).json({
        message: 'Password not set. Please set your password first.',
        requiresPasswordSetup: true
      })
    }

    if (await user.matchPassword(password)) {
      if (!user.passwordSet) {
        user.passwordSet = true
        await user.save()
      }
      res.json(buildAuthLoginResponse(user, generateToken(user)))
    } else {
      res.status(401).json({ message: 'Invalid credentials' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('lots')
      .populate('projectMemberships.project', 'name slug phase type')

    if (user) {
      const userPayload = buildAuthUserPayload(user, {
        projectMemberships: (user.projectMemberships || []).map((m) => ({
          project: m.project?._id || m.project,
          membershipRole: m.role || 'resident',
          name: m.project?.name,
          slug: m.project?.slug
        }))
      })
      res.json({
        ...userPayload,
        user: userPayload
      })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' })
    }

    const user = await User.findById(req.user._id).select('+password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verificar que la contraseña actual sea correcta
    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    // Actualizar la contraseña
    user.password = newPassword
    user.passwordSet = true
    await user.save()

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const setupPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ message: 'Password is required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' })
    }

    // Hash del token para comparar
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Buscar usuario con el token válido y no expirado
    const user = await User.findOne({
      setupToken: hashedToken,
      setupTokenExpires: { $gt: Date.now() }
    }).select('+setupToken +setupTokenExpires')

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired setup token' })
    }

    // Establecer la contraseña
    user.password = password
    user.passwordSet = true
    user.setupToken = undefined
    user.setupTokenExpires = undefined
    await user.save()

    res.json({
      message: 'Password set successfully. You can now login.',
      ...buildAuthLoginResponse(user, generateToken(user))
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const verifySetupToken = async (req, res) => {
  try {
    const { token } = req.params

    // Hash del token para comparar
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Buscar usuario con el token válido y no expirado
    const user = await User.findOne({
      setupToken: hashedToken,
      setupTokenExpires: { $gt: Date.now() }
    }).select('firstName lastName email phoneNumber')

    if (!user) {
      return res.status(400).json({ 
        valid: false,
        message: 'Invalid or expired setup token' 
      })
    }

    res.json({
      valid: true,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Envía al propietario (usuario) un link para establecer su contraseña.
 * Solo administradores. Útil para usuarios creados sin contraseña (ej. cuando el SMS en registro estaba comentado).
 * Genera un nuevo setup token, lo guarda y envía por SMS el enlace.
 */
export const sendSetupPasswordLink = async (req, res) => {
  try {
    const { userId, email, projectId } = req.body

    if (!userId && !email) {
      return res.status(400).json({ message: 'userId or email is required' })
    }

    const query = userId ? { _id: userId } : { email: email.trim().toLowerCase() }
    const user = await User.findOne(query).select('+setupToken +setupTokenExpires')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (!user.phoneNumber) {
      return res.status(400).json({
        message: 'User has no phone number. Cannot send setup link via SMS.'
      })
    }

    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ message: 'Invalid projectId' })
      }

      const projectExists = await Project.exists({ _id: projectId })
      if (!projectExists) {
        return res.status(404).json({ message: 'Project not found' })
      }

      // Backfill membership for legacy users created before projectMemberships existed.
      const alreadyMember = user.projectMemberships?.some(
        (m) => m.project && String(m.project) === String(projectId)
      )
      if (!alreadyMember) {
        user.projectMemberships = [
          ...(user.projectMemberships || []),
          { project: projectId, role: 'resident' }
        ]
      }
    }

    const setupToken = user.generateSetupToken()
    await user.save()

    let frontendUrl
    try {
      frontendUrl = await resolveFrontendBaseUrl(projectId)
    } catch (resolveErr) {
      if (resolveErr.statusCode === 404) {
        return res.status(404).json({ message: resolveErr.message })
      }
      throw resolveErr
    }
    const setupLink = `${frontendUrl}/setup-password/${setupToken}`
    const message = `Hi ${user.firstName}, you can set your password by visiting this link: ${setupLink}`

    try {
      await sendSMSWithValidation(user.phoneNumber, message)
    } catch (smsError) {
      console.error('Error sending setup SMS:', smsError.message)
      return res.status(502).json({
        message: 'User and token updated, but SMS could not be sent.',
        setupLink,
        smsError: smsError.message
      })
    }

    return res.status(200).json({
      message: 'Setup link sent via SMS.',
      userId: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      setupLink // por si el admin necesita copiarlo (ej. si SMS falla o para pruebas)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
