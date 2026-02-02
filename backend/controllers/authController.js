import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import { sendSMSWithValidation } from '../services/twilioService.js'

const generateToken = (id, tenantId = null) => {
  const payload = tenantId ? { id, tenantId } : { id }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d'
  })
}

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, birthday, role, skipPasswordSetup } = req.body

    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Si skipPasswordSetup es true, requiere autenticación de admin
    let currentUser = null
    if (skipPasswordSetup) {
      let token

      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
          token = req.headers.authorization.split(' ')[1]
          const decoded = jwt.verify(token, process.env.JWT_SECRET)
          currentUser = await User.findById(decoded.id).select('-password').populate('tenant', 'name slug')
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

    // Tenant: body.tenant o (si admin creando usuario) tenant del admin
    const tenantId = req.body.tenant || (currentUser && (currentUser.tenant?._id || currentUser.tenant))

    // Si es admin creando usuario y skipPasswordSetup es true, crear sin contraseña
    const isAdminCreating = skipPasswordSetup
    
    let userData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      birthday,
      role: role || 'user',
      ...(tenantId && { tenant: tenantId })
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
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
          const setupLink = `${frontendUrl}/setup-password/${setupToken}`
          const message = `Hola ${firstName}, tu cuenta ha sido creada. Por favor establece tu contraseña ingresando a este enlace: ${setupLink}`
          
          await sendSMSWithValidation(phoneNumber, message)
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
        tenant: user.tenant,
        message: 'User created successfully. Setup link sent via SMS.',
        setupToken: setupToken // Solo para desarrollo/testing, remover en producción
      })
    }

    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant is required for registration. Send tenant (id) in body.' })
    }

    const user = await User.create(userData)

    if (user) {
      const uid = user.tenant?._id || user.tenant
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        tenant: user.tenant,
        token: generateToken(user._id, uid),
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          tenant: user.tenant
        }
      })
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
    const user = await User.findOne(query).select('+password').populate('lots').populate('tenant', 'name slug')

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Verificar si el usuario tiene contraseña establecida
    if (!user.password || !user.passwordSet) {
      return res.status(403).json({ 
        message: 'Password not set. Please set your password using the setup link sent to your phone.',
        requiresPasswordSetup: true
      })
    }

    if (await user.matchPassword(password)) {
      const tenantId = user.tenant?._id || user.tenant
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        tenant: user.tenant,
        lots: user.lots,
        token: generateToken(user._id, tenantId),
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          tenant: user.tenant,
          lots: user.lots
        }
      })
    } else {
      res.status(401).json({ message: 'Invalid credentials' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('lots').populate('tenant', 'name slug')

    if (user) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        birthday: user.birthday,
        role: user.role,
        tenant: user.tenant,
        lots: user.lots
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

    const tenantId = user.tenant?._id || user.tenant
    res.json({ 
      message: 'Password set successfully. You can now login.',
      token: generateToken(user._id, tenantId),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        tenant: user.tenant
      }
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
    }).select('firstName lastName email')

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
        email: user.email
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
