/** Roles globales de la aplicación (User.role) */
export const APP_ROLES = Object.freeze(['superadmin', 'admin', 'owner', 'user'])

/** Roles por proyecto (User.projectMemberships[].role) — no confundir con APP_ROLES */
export const MEMBERSHIP_ROLES = Object.freeze(['resident', 'viewer'])

export const isAppRole = (role) => APP_ROLES.includes(role)

export const isStaffRole = (role) =>
  role === 'admin' || role === 'superadmin' || role === 'owner'

export const isSuperadminRole = (role) => role === 'superadmin'

export const isOwnerRole = (role) => role === 'owner'

/**
 * Rol permitido al crear usuario.
 * - Registro público: siempre `user`.
 * - Admin creando (skipPasswordSetup): según quién crea.
 */
export const resolveRoleForNewUser = (creatorRole, requestedRole) => {
  const requested = isAppRole(requestedRole) ? requestedRole : 'user'

  if (!creatorRole) {
    return 'user'
  }

  if (creatorRole === 'superadmin') {
    return requested
  }

  if (creatorRole === 'admin') {
    if (requested === 'superadmin') return 'user'
    if (requested === 'admin' || requested === 'owner' || requested === 'user') {
      return requested
    }
    return 'user'
  }

  return 'user'
}
