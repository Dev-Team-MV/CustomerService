import jwt from 'jsonwebtoken'

const DEFAULT_EXPIRY = '30d'
const IMPERSONATION_EXPIRY = '4h'

export function generateToken(userOrId, options = {}) {
  const payload =
    userOrId && typeof userOrId === 'object'
      ? { id: String(userOrId._id || userOrId.id), role: userOrId.role }
      : { id: String(userOrId) }

  if (options.impersonatedBy) {
    payload.impersonatedBy = String(options.impersonatedBy)
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: options.impersonatedBy ? IMPERSONATION_EXPIRY : DEFAULT_EXPIRY
  })
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}
