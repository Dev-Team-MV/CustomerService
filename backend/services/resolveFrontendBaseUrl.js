import Project from '../models/Project.js'

/**
 * Mapa slug de proyecto → URL base del SPA (mismo criterio que NODE_ENV del backend).
 * Si un slug no está aquí, se usa Project.frontendBaseUrl o FRONTEND_URL.
 */
const FRONTEND_BY_SLUG = {
  'lakewood-p1': {
    development: 'https://devlakewoodp1.michelangelodelvalle.com',
    production: 'https://lakewoodp1.michelangelodelvalle.com'
  },
  'mv-crm': {
    development: 'https://devcrm.michelangelodelvalle.com',
    production: 'https://crm.michelangelodelvalle.com'
  },
  'phase-2': {
    development: 'https://devlakewoodp2.michelangelodelvalle.com',
    production: 'https://lakewoodp2.michelangelodelvalle.com'
  }
}

function stripTrailingSlash(url) {
  return url.replace(/\/$/, '')
}

export function getDefaultFrontendBaseUrlOrThrow() {
  const u = process.env.FRONTEND_URL
  if (!u?.trim()) {
    throw new Error('FRONTEND_URL is not configured')
  }
  return stripTrailingSlash(u.trim())
}

function isProductionDeploy() {
  return process.env.NODE_ENV === 'production'
}

/**
 * @param {string|undefined|null} projectId
 * @returns {Promise<string>} URL base sin barra final
 */
export async function resolveFrontendBaseUrl(projectId) {
  if (!projectId) {
    return getDefaultFrontendBaseUrlOrThrow()
  }

  const project = await Project.findById(projectId).select('slug frontendBaseUrl').lean()
  if (!project) {
    const err = new Error('Project not found')
    err.statusCode = 404
    throw err
  }

  const custom = project.frontendBaseUrl?.trim()
  if (custom) {
    return stripTrailingSlash(custom)
  }

  const entry = FRONTEND_BY_SLUG[project.slug]
  if (entry) {
    const key = isProductionDeploy() ? 'production' : 'development'
    return entry[key]
  }

  return getDefaultFrontendBaseUrlOrThrow()
}
