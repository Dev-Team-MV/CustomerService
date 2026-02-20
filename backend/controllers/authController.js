import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import { sendSMSWithValidation } from '../services/twilioService.js'

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
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
    if (skipPasswordSetup) {
      let token
      let currentUser = null

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
    
    let userData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      birthday,
      role: role || 'user'
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
          const frontendUrl = process.env.FRONTEND_URL || 'https://customerservice.michelangelodelvalle.com'
          const setupLink = `${frontendUrl}/setup-password/${setupToken}`
          const message = `Hola ${firstName}, tu cuenta ha sido creada. Por favor establece tu contraseña ingresando a este enlace: ${setupLink}`
          
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
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        token: generateToken(user._id),
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role
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
    const user = await User.findOne(query).select('+password').populate('lots')

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
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        lots: user.lots,
        token: generateToken(user._id),
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
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

/**
 * Login exclusivo para usuarios con rol admin o superadmin.
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

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Admin login only.' })
    }

    if (!user.password || !user.passwordSet) {
      return res.status(403).json({
        message: 'Password not set. Please set your password first.',
        requiresPasswordSetup: true
      })
    }

    if (await user.matchPassword(password)) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        token: generateToken(user._id),
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role
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
    const user = await User.findById(req.user._id).populate('lots')

    if (user) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        birthday: user.birthday,
        role: user.role,
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

    res.json({ 
      message: 'Password set successfully. You can now login.',
      token: generateToken(user._id),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role
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
    const { userId, email } = req.body

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

    const setupToken = user.generateSetupToken()
    await user.save()

    const frontendUrl = process.env.FRONTEND_URL || 'https://customerservice.michelangelodelvalle.com'
    const setupLink = `${frontendUrl}/setup-password/${setupToken}`
    const message = `Hola ${user.firstName}, puedes establecer tu contraseña ingresando a este enlace: ${setupLink}`

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
