/**
 * Formatea una fecha al formato MM/DD/YYYY
 * @param {Date | string} date - Fecha a formatear
 * @returns {string} Fecha en formato MM/DD/YYYY o '-' si no es válida
 */
export const formatDateMMDDYYYY = (date) => {
  if (!date) return '-'
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'
    
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const year = d.getFullYear()
    
    return `${month}/${day}/${year}`
  } catch (err) {
    console.error('Error formatting date:', err)
    return '-'
  }
}

/**
 * Formatea una fecha con hora al formato MM/DD/YYYY HH:mm
 * @param {Date | string} date - Fecha a formatear
 * @returns {string} Fecha con hora o '-' si no es válida
 */
export const formatDateTimeMMDDYYYY = (date) => {
  if (!date) return '-'
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'
    
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    
    return `${month}/${day}/${year} ${hours}:${minutes}`
  } catch (err) {
    console.error('Error formatting date:', err)
    return '-'
  }
}

/**
 * Formatea una fecha en formato corto MM/DD
 * @param {Date | string} date - Fecha a formatear
 * @returns {string} Fecha en formato MM/DD o '-' si no es válida
 */
export const formatDateShort = (date) => {
  if (!date) return '-'
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'
    
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    
    return `${month}/${day}`
  } catch (err) {
    console.error('Error formatting date:', err)
    return '-'
  }
}

/**
 * Calcula los días restantes desde una fecha
 * @param {Date | string} date - Fecha de comparación
 * @returns {number} Número de días (negativo si es pasado, positivo si es futuro)
 */
export const getDaysFromNow = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    d.setHours(0, 0, 0, 0)
    
    const diff = d.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  } catch (err) {
    console.error('Error calculating days:', err)
    return null
  }
}

/**
 * Obtiene el estado de la fecha (pasado, hoy, futuro)
 * @param {Date | string} date - Fecha a evaluar
 * @returns {string} 'past' | 'today' | 'future'
 */
export const getDateStatus = (date) => {
  const days = getDaysFromNow(date)
  if (days === null) return 'unknown'
  if (days < 0) return 'past'
  if (days === 0) return 'today'
  return 'future'
}