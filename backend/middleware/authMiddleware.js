import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password').populate('tenant', 'name slug')
      next()
    } catch (error) {
      console.error(error)
      return res.status(401).json({ message: 'No autorizado, token inválido' })
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no hay token' })
  }
}

/**
 * Establece req.tenantId para multi-tenant.
 * - Admin/User: usa el tenant del usuario.
 * - Superadmin: puede enviar X-Tenant-ID para actuar en nombre de un tenant.
 */
export const requireTenant = (req, res, next) => {
  const headerTenantId = req.get('X-Tenant-ID')
  const userTenant = req.user?.tenant

  if (req.user?.role === 'superadmin' && headerTenantId) {
    req.tenantId = headerTenantId
    return next()
  }
  if (userTenant) {
    req.tenantId = userTenant._id?.toString() || userTenant.toString()
    return next()
  }
  return res.status(403).json({ message: 'Tenant context required. Set X-Tenant-ID header or ensure user has a tenant.' })
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
