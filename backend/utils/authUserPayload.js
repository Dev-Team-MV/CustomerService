import { buildAuthProjectFields } from './authProjectContext.js'

/**
 * Formato de usuario para login/profile/localStorage (compatible con frontends existentes).
 * Siempre incluye role global (superadmin|admin|owner|user), nunca confundir con membershipRole.
 */
export const buildAuthUserPayload = (user, extra = {}) => {
  const id = user._id || user.id
  const { projectMemberships, projectId } = buildAuthProjectFields(user)

  return {
    id,
    _id: id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    birthday: user.birthday,
    role: user.role,
    lots: user.lots || [],
    projectMemberships: extra.projectMemberships ?? projectMemberships,
    projectId: extra.projectId !== undefined ? extra.projectId : projectId,
    ...extra
  }
}

/** Respuesta de login/register: campos en raíz + objeto user idéntico (legacy). */
export const buildAuthLoginResponse = (user, token, extra = {}) => {
  const userPayload = buildAuthUserPayload(user, extra)
  return {
    ...userPayload,
    token,
    user: userPayload
  }
}
