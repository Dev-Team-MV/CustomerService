import { API_URL } from './apiUrl'

/**
 * GET público sin headers personalizados → no dispara preflight CORS.
 * Útil cuando nginx del API no incluye un origen en OPTIONS pero Express sí en GET.
 */
export const fetchPublicGet = async (path, params = {}) => {
  const baseUrl = String(API_URL || '').replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${baseUrl}${normalizedPath}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  })

  const response = await fetch(url.toString(), {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
    cache: 'no-store'
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const data = await response.json()
      if (data?.message) message = data.message
    } catch (_) {
      // noop
    }
    throw new Error(message)
  }

  return response.json()
}
