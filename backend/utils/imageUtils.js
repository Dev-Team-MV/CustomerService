/**
 * Normaliza un ítem de imagen (legacy string o { url, isPublic }) a { url, isPublic }.
 * @param {string|{ url: string, isPublic?: boolean }|null} item
 * @returns {{ url: string, isPublic: boolean }|null}
 */
export function normalizeImageItem (item) {
  if (item == null) return null
  if (typeof item === 'string') return { url: item, isPublic: true }
  if (typeof item === 'object' && typeof item.url === 'string') {
    return { url: item.url, isPublic: item.isPublic !== false }
  }
  return null
}

/**
 * Normaliza un array de imágenes a [{ url, isPublic }].
 * @param {Array<string|{ url: string, isPublic?: boolean }>|undefined} arr
 * @returns {Array<{ url: string, isPublic: boolean }>}
 */
export function normalizeImageArray (arr) {
  if (!Array.isArray(arr)) return []
  return arr.map(normalizeImageItem).filter(Boolean)
}
