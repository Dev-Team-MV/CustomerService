const LOCAL_API_URL = 'http://localhost:5001/api'
const PROD_API_URL = 'https://apics.michelangelodelvalle.com/api'
const DEV_API_URL = 'https://apicsdev.michelangelodelvalle.com/api'
const MICHELANGELO_DOMAIN = 'michelangelodelvalle.com'

const normalizeApiUrl = (url) => url.replace(/\/+$/, '')

const getBrowserHostname = () => {
  if (typeof window === 'undefined') return ''
  return window.location.hostname.toLowerCase()
}

const isLocalHostname = (hostname) => (
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === ''
)

const isMichelangeloProductionHost = (hostname) => {
  if (!hostname.endsWith(MICHELANGELO_DOMAIN)) return false

  const subdomain = hostname
    .slice(0, -MICHELANGELO_DOMAIN.length)
    .replace(/\.$/, '')

  return subdomain !== '' && !subdomain.includes('dev')
}

export const getApiUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL || LOCAL_API_URL
  const normalizedConfiguredUrl = normalizeApiUrl(configuredUrl)
  const hostname = getBrowserHostname()

  if (!isLocalHostname(hostname) && isMichelangeloProductionHost(hostname)) {
    return PROD_API_URL
  }

  if (normalizedConfiguredUrl === DEV_API_URL) {
    return DEV_API_URL
  }

  return normalizedConfiguredUrl
}

export const API_URL = getApiUrl()
