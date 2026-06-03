/**
 * projectMemberships y projectId (si hay exactamente uno) para respuestas de login/profile.
 */
export const formatMembershipsForAuthResponse = (memberships) =>
  (memberships || []).map((m) => ({
    project: m.project?._id || m.project,
    role: m.role || 'resident'
  }))

export const pickSingleProjectIdFromMemberships = (memberships) => {
  const ids = (memberships || [])
    .map((m) => m?.project?._id || m?.project)
    .filter(Boolean)
    .map((id) => String(id))
  const unique = [...new Set(ids)]
  return unique.length === 1 ? unique[0] : null
}

export const buildAuthProjectFields = (user) => {
  const projectMemberships = formatMembershipsForAuthResponse(user?.projectMemberships)
  const projectId = pickSingleProjectIdFromMemberships(projectMemberships)
  return { projectMemberships, projectId }
}
