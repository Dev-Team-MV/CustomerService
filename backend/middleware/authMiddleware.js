import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { canUserAccessProject } from '../utils/projectAccess.js'

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
      next()
    } catch (error) {
      console.error(error)
      res.status(401).json({ message: 'Unauthorized, invalid token' })
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token' })
  }
}

/** Same as protect but does not return 401: if token is valid sets req.user, otherwise continues without user. */
export const optionalProtect = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
    return next()
  }
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
  } catch (error) {
    // Token missing/invalid: continue without req.user, do not send 401
  }
  next()
}

export const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next()
  } else {
    res.status(403).json({ message: 'Not authorized as admin' })
  }
}

export const superadmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next()
  } else {
    res.status(403).json({ message: 'Not authorized as superadmin' })
  }
}

/**
 * Tras `protect`: exige `projectId` en query o params y comprueba acceso al proyecto
 * (admin/superadmin pasan; user debe tener vínculo vía propiedades/apartamentos o projectMemberships).
 */
export const requireProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.projectId ?? req.query.projectId
    if (!projectId) {
      return res.status(400).json({ message: 'projectId is required' })
    }
    const ok = await canUserAccessProject(req.user._id, projectId, { role: req.user.role })
    if (!ok) {
      return res.status(403).json({ message: 'No access to this project' })
    }
    next()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message })
  }
}
