import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Project from '../models/Project.js'
import { sendSMSWithValidation } from '../services/twilioService.js'
import { sendPasswordResetOtpEmail, isEmailConfigured } from '../services/emailService.js'
import { resolveFrontendBaseUrl } from '../services/resolveFrontendBaseUrl.js'
import { resolveRoleForNewUser } from '../utils/roles.js'
import { buildAuthLoginResponse, buildAuthUserPayload } from '../utils/authUserPayload.js'
import { notifyUserCreatedByAdmin } from '../utils/notificationTriggers.js'
import { getClientIp, writeAuditLog } from '../middleware/logAction.js'
import { generateToken } from '../utils/jwtUtils.js'
import { isValidObjectId } from '../utils/crmHelpers.js'

const IMPERSONATION_BLOCKED_ROLES = new Set(['superadmin', 'owner'])

const FORGOT_PASSWORD_GENERIC_MESSAGE =
  'If an account with that email exists, a verification code has been sent.'

const normalizeEmail = (email) => String(email || '').trim().toLowerCase()

const hashResetValue = (value) =>
  crypto.createHash('sha256').update(String(value).trim()).digest('hex')

function resolvePasswordResetChannel (requestedChannel, user) {
  const channel = requestedChannel === 'email' || requestedChannel === 'sms'
    ? requestedChannel
    : (user.phoneNumber ? 'sms' : 'email')

  if (channel === 'sms' && !user.phoneNumber) {
    return { channel: 'email', fallbackFromSms: true }
  }
  if (channel === 'email' && !isEmailConfigured()) {
    if (user.phoneNumber) {
      return { channel: 'sms', fallbackFromEmail: true }
    }
    return { channel: 'email', unavailable: true }
  }
  return { channel }
}

async function sendPasswordResetOtp (user, channel) {
  const code = user.generatePasswordResetOtp()
  await user.save()

  if (channel === 'sms') {
    const message = `Hi ${user.firstName}, your password reset verification code is: ${code}. It expires in 10 minutes.`
    await sendSMSWithValidation(user.phoneNumber, message)
    return { channel: 'sms', maskedDestination: maskPhone(user.phoneNumber) }
  }

  await sendPasswordResetOtpEmail({
    to: user.email,
    firstName: user.firstName,
    code
  })
  return { channel: 'email', maskedDestination: maskEmail(user.email) }
}

function maskEmail (email) {
  const [local, domain] = String(email).split('@')
  if (!local || !domain) return '***'
  const visible = local.length <= 2 ? local[0] : `${local.slice(0, 2)}***`
  return `${visible}@${domain}`
}

function maskPhone (phone) {
  const digits = String(phone).replace(/\D/g, '')
  if (digits.length < 4) return '***'
  return `***${digits.slice(-4)}`
}

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, country, birthday, role, skipPasswordSetup, projectId } = req.body

    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    let currentUser = null
    const hasBearer = Boolean(req.headers.authorization?.startsWith('Bearer'))

    if (hasBearer) {
      try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        currentUser = await User.findById(decoded.id).select('-password')
      } catch (error) {
        if (skipPasswordSetup) {
          return res.status(401).json({ message: 'Invalid or expired token' })
        }
      }
    }

    const isStaffCreator =
      currentUser &&
      (currentUser.role === 'admin' || currentUser.role === 'superadmin')

    // Admin creando usuario sin contraseña → flujo SMS / setup link
    if (skipPasswordSetup) {
      if (!currentUser) {
        return res.status(401).json({ message: 'Authentication required to create users without password' })
      }
      if (!isStaffCreator) {
        return res.status(403).json({ message: 'Admin access required to create users without password' })
      }
      if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required when skipPasswordSetup is true' })
      }

      const assignedRole = resolveRoleForNewUser(currentUser.role, role)
      const userData = {
        firstName,
        lastName,
        email,
        phoneNumber,
        country,
        birthday,
        role: assignedRole,
        passwordSet: false,
        mustChangePassword: false
      }

      if (projectId) {
        const exists = await Project.exists({ _id: projectId })
        if (!exists) {
          return res.status(404).json({ message: 'Project not found' })
        }
        userData.projectMemberships = [{ project: projectId, role: 'resident' }]
      }

      const user = new User(userData)
      const setupToken = user.generateSetupToken()
      await user.save()

      notifyUserCreatedByAdmin({ user })

      if (phoneNumber) {
        try {
          const frontendUrl = await resolveFrontendBaseUrl(projectId)
          const setupLink = `${frontendUrl}/setup-password/${setupToken}`
          const message = `Hi ${firstName}, your account has been created. Please set your password by visiting this link: ${setupLink}`

          console.log('Sending SMS to:', phoneNumber)
          // await sendSMSWithValidation(phoneNumber, message)
        } catch (smsError) {
          console.error('Error sending setup SMS:', smsError.message)
        }
      }

      return res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        country: user.country,
        role: user.role,
        passwordSet: false,
        mustChangePassword: false,
        requiresPasswordSetup: true,
        message: 'User created successfully. Setup link sent via SMS.',
        setupToken: setupToken // Solo para desarrollo/testing, remover en producción
      })
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' })
    }

    // Admin autenticado asigna contraseña temporal → usuario debe cambiarla al entrar
    if (isStaffCreator) {
      const assignedRole = resolveRoleForNewUser(currentUser.role, role)
      const userData = {
        firstName,
        lastName,
        email,
        phoneNumber,
        country,
        birthday,
        role: assignedRole,
        password,
        passwordSet: true,
        mustChangePassword: true
      }

      if (projectId) {
        const exists = await Project.exists({ _id: projectId })
        if (!exists) {
          return res.status(404).json({ message: 'Project not found' })
        }
        userData.projectMemberships = [{ project: projectId, role: 'resident' }]
      }

      const user = await User.create(userData)
      notifyUserCreatedByAdmin({ user })

      return res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        country: user.country,
        role: user.role,
        passwordSet: true,
        mustChangePassword: true,
        message: 'User created successfully with temporary password. User must change it on next login.'
      })
    }

    // Registro público: contraseña definitiva, sin forzar cambio
    const userData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      country,
      birthday,
      role: resolveRoleForNewUser(null, role),
      password,
      passwordSet: true,
      mustChangePassword: false
    }

    if (projectId) {
      const exists = await Project.exists({ _id: projectId })
      if (!exists) {
        return res.status(404).json({ message: 'Project not found' })
      }
      userData.projectMemberships = [{ project: projectId, role: 'resident' }]
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
      writeAuditLog({
        userId: user._id,
        action: 'login',
        entity: 'Client',
        entityId: user._id,
        changes: { before: null, after: { role: user.role } },
        ip: getClientIp(req)
      })
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
      writeAuditLog({
        userId: user._id,
        action: 'login',
        entity: 'Client',
        entityId: user._id,
        changes: { before: null, after: { role: user.role } },
        ip: getClientIp(req)
      })
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

      const response = {
        ...userPayload,
        user: userPayload
      }

      if (req.isImpersonating && req.impersonatedBy) {
        response.impersonation = {
          active: true,
          impersonatedBy: buildAuthUserPayload(req.impersonatedBy)
        }
      }

      res.json(response)
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const startImpersonation = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can impersonate users' })
    }

    if (req.isImpersonating) {
      return res.status(400).json({ message: 'Stop current impersonation before starting a new one' })
    }

    const { userId } = req.params
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user id' })
    }

    if (String(userId) === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot impersonate yourself' })
    }

    const targetUser = await User.findOne({
      _id: userId,
      isActive: { $ne: false }
    })
      .populate('lots')
      .populate('projectMemberships.project', 'name slug phase type')

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (IMPERSONATION_BLOCKED_ROLES.has(targetUser.role)) {
      return res.status(403).json({ message: 'Cannot impersonate this user role' })
    }

    const token = generateToken(targetUser, { impersonatedBy: req.user._id })
    const userPayload = buildAuthUserPayload(targetUser, {
      projectMemberships: (targetUser.projectMemberships || []).map((m) => ({
        project: m.project?._id || m.project,
        membershipRole: m.role || 'resident',
        name: m.project?.name,
        slug: m.project?.slug
      }))
    })
    const impersonatedByPayload = buildAuthUserPayload(req.user)

    writeAuditLog({
      userId: req.user._id,
      action: 'impersonation_started',
      entity: 'Client',
      entityId: targetUser._id,
      changes: {
        before: null,
        after: {
          targetUserId: targetUser._id,
          targetRole: targetUser.role,
          targetEmail: targetUser.email
        }
      },
      ip: getClientIp(req)
    })

    res.json({
      ...userPayload,
      token,
      user: userPayload,
      impersonation: {
        active: true,
        impersonatedBy: impersonatedByPayload
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const stopImpersonation = async (req, res) => {
  try {
    if (!req.isImpersonating || !req.impersonatedBy) {
      return res.status(400).json({ message: 'Not currently impersonating a user' })
    }

    const superadmin = await User.findById(req.impersonatedBy._id)
      .populate('lots')
      .populate('projectMemberships.project', 'name slug phase type')

    if (!superadmin || superadmin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Original superadmin session is no longer valid' })
    }

    writeAuditLog({
      userId: superadmin._id,
      action: 'impersonation_stopped',
      entity: 'Client',
      entityId: req.user._id,
      changes: {
        before: {
          impersonatedUserId: req.user._id,
          impersonatedRole: req.user.role
        },
        after: null
      },
      ip: getClientIp(req)
    })

    const token = generateToken(superadmin)
    const userPayload = buildAuthUserPayload(superadmin, {
      projectMemberships: (superadmin.projectMemberships || []).map((m) => ({
        project: m.project?._id || m.project,
        membershipRole: m.role || 'resident',
        name: m.project?.name,
        slug: m.project?.slug
      }))
    })

    res.json({
      ...userPayload,
      token,
      user: userPayload,
      impersonation: {
        active: false
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const changePassword = async (req, res) => {
  try {
    if (req.isImpersonating) {
      return res.status(403).json({ message: 'Cannot change password while impersonating a user' })
    }

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
    user.mustChangePassword = false
    await user.save()

    res.json({
      message: 'Password changed successfully',
      mustChangePassword: false
    })
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
    user.mustChangePassword = false
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

/**
 * Paso 1 — solicitar recuperación de contraseña.
 * Body: { email, channel?: 'sms' | 'email' }
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email)
    const requestedChannel = req.body?.channel

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }
    if (requestedChannel && requestedChannel !== 'sms' && requestedChannel !== 'email') {
      return res.status(400).json({ message: 'channel must be sms or email' })
    }

    const user = await User.findOne({ email, isActive: { $ne: false } })
      .select('+passwordResetOtp +passwordResetOtpExpires +passwordResetToken +passwordResetTokenExpires')

    if (!user) {
      return res.status(200).json({
        message: FORGOT_PASSWORD_GENERIC_MESSAGE
      })
    }

    const { channel, fallbackFromSms, fallbackFromEmail, unavailable } =
      resolvePasswordResetChannel(requestedChannel, user)

    if (unavailable) {
      return res.status(503).json({
        message: 'Password reset via email is not available. Contact support or try SMS if you have a phone on file.'
      })
    }

    try {
      const delivery = await sendPasswordResetOtp(user, channel)
      return res.status(200).json({
        message: FORGOT_PASSWORD_GENERIC_MESSAGE,
        channel: delivery.channel,
        maskedDestination: delivery.maskedDestination,
        ...(fallbackFromSms && { note: 'SMS unavailable for this account; code sent via email.' }),
        ...(fallbackFromEmail && { note: 'Email unavailable; code sent via SMS.' })
      })
    } catch (deliveryError) {
      console.error('Password reset delivery error:', deliveryError.message)
      return res.status(502).json({
        message: 'Could not send verification code. Please try again later or use the other channel.',
        error: deliveryError.message
      })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Paso 2 — verificar código OTP (2FA).
 * Body: { email, code }
 */
export const verifyPasswordResetCode = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email)
    const code = String(req.body?.code || '').trim()

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' })
    }

    const hashedCode = hashResetValue(code)
    const user = await User.findOne({
      email,
      passwordResetOtp: hashedCode,
      passwordResetOtpExpires: { $gt: Date.now() },
      isActive: { $ne: false }
    }).select('+passwordResetOtp +passwordResetOtpExpires +passwordResetToken +passwordResetTokenExpires')

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' })
    }

    const resetToken = user.generatePasswordResetToken()
    await user.save()

    return res.status(200).json({
      message: 'Verification code accepted. You can now set a new password.',
      resetToken,
      expiresInMinutes: 15
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Paso 3 — establecer nueva contraseña con resetToken.
 * Body: { resetToken, password }
 */
export const resetPassword = async (req, res) => {
  try {
    const resetToken = String(req.body?.resetToken || '').trim()
    const password = req.body?.password

    if (!resetToken || !password) {
      return res.status(400).json({ message: 'resetToken and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' })
    }

    const hashedToken = hashResetValue(resetToken)
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { $gt: Date.now() },
      isActive: { $ne: false }
    }).select('+passwordResetToken +passwordResetTokenExpires +password +setupToken +setupTokenExpires')

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' })
    }

    user.password = password
    user.passwordSet = true
    user.mustChangePassword = false
    user.setupToken = undefined
    user.setupTokenExpires = undefined
    user.clearPasswordResetFields()
    await user.save()

    return res.status(200).json({
      message: 'Password reset successfully. You can now login.',
      ...buildAuthLoginResponse(user, generateToken(user))
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
