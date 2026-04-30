import { PROJECT_IDS } from '@shared/config/projectsConfig'

const INVALID_PROJECT_VALUES = new Set(['', 'undefined', 'null'])

export const normalizeProjectId = (value) => {
  if (typeof value !== 'string') return ''
  const normalized = value.trim()
  return INVALID_PROJECT_VALUES.has(normalized) ? '' : normalized
}

export const extractProjectId = (projectValue) => {
  if (!projectValue) return ''
  if (typeof projectValue === 'object') {
    return normalizeProjectId(projectValue._id || projectValue.id || '')
  }
  return normalizeProjectId(String(projectValue))
}

export const getLakewoodProjectId = (user = null) => {
  const envProjectId = normalizeProjectId(import.meta.env.VITE_PROJECT_ID)
  if (envProjectId) return envProjectId

  const userLakewoodProjectId = user?.projects?.find((project) => project.slug === 'lakewood')?._id
  const normalizedUserProjectId = normalizeProjectId(userLakewoodProjectId || '')
  if (normalizedUserProjectId) return normalizedUserProjectId

  // Fallback seguro para la app de Lakewood (evita mezclar con otros proyectos)
  return PROJECT_IDS.LAKEWOOD
}
