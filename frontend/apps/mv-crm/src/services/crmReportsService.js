// apps/mv-crm/src/services/crmReportsService.js
import api from '@shared/services/api'

const crmReportsService = {
  // ═══════════════════════════════════════════════════════════
  // CLIENTS EXPORT
  // ═══════════════════════════════════════════════════════════

  /**
   * GET /api/crm/reports/clients/export
   * Exporta reporte de clientes en formato JSON o CSV
   * @param {Object} options
   * @param {string} [options.projectId] - Filtro opcional por proyecto
   * @param {'json'|'csv'} [options.format='json'] - Formato de exportación
   * @returns {Promise<Object|Blob>}
   */
  exportClients: async ({ projectId, format = 'json' } = {}) => {
    const params = { format }
    if (projectId) params.projectId = projectId

    if (format === 'csv') {
      const res = await api.get('/crm/reports/clients/export', {
        params,
        responseType: 'blob'
      })
      return res.data
    }

    const res = await api.get('/crm/reports/clients/export', { params })
    return res.data
  },

  // ═══════════════════════════════════════════════════════════
  // PAYMENTS EXPORT
  // ═══════════════════════════════════════════════════════════

  /**
   * GET /api/crm/reports/payments/export
   * Exporta pagos en un rango de fechas
   * @param {Object} options
   * @param {string} options.dateFrom - Fecha inicio (ISO string)
   * @param {string} options.dateTo - Fecha fin (ISO string)
   * @param {string} [options.projectId] - Filtro opcional por proyecto
   * @param {'json'|'csv'} [options.format='json'] - Formato de exportación
   * @returns {Promise<Object|Blob>}
   */
  exportPayments: async ({ dateFrom, dateTo, projectId, format = 'json' } = {}) => {
    if (!dateFrom || !dateTo) {
      throw new Error('dateFrom and dateTo are required')
    }

    const params = {
      dateFrom: new Date(dateFrom).toISOString(),
      dateTo: new Date(dateTo).toISOString(),
      format
    }
    if (projectId) params.projectId = projectId

    if (format === 'csv') {
      const res = await api.get('/crm/reports/payments/export', {
        params,
        responseType: 'blob'
      })
      return res.data
    }

    const res = await api.get('/crm/reports/payments/export', { params })
    return res.data
  },

  // ═══════════════════════════════════════════════════════════
  // LEADS EXPORT
  // ═══════════════════════════════════════════════════════════

  /**
   * GET /api/crm/reports/leads/export
   * Exporta leads con filtros opcionales
   * @param {Object} options
   * @param {string} [options.fromDate] - Fecha inicio
   * @param {string} [options.toDate] - Fecha fin
   * @param {string} [options.projectId] - Filtro por proyecto
   * @param {string} [options.stage] - Filtro por stage (nuevo, contactado, etc.)
   * @param {string} [options.assignedTo] - Filtro por agente asignado
   * @param {'json'|'csv'} [options.format='json'] - Formato de exportación
   * @returns {Promise<Object|Blob>}
   */
  exportLeads: async ({
    fromDate,
    toDate,
    projectId,
    stage,
    assignedTo,
    format = 'json'
  } = {}) => {
    const params = { format }
    if (fromDate) params.fromDate = new Date(fromDate).toISOString()
    if (toDate) params.toDate = new Date(toDate).toISOString()
    if (projectId) params.projectId = projectId
    if (stage) params.stage = stage
    if (assignedTo) params.assignedTo = assignedTo

    if (format === 'csv') {
      const res = await api.get('/crm/reports/leads/export', {
        params,
        responseType: 'blob'
      })
      return res.data
    }

    const res = await api.get('/crm/reports/leads/export', { params })
    return res.data
  },

  // ═══════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════

  /**
   * Descarga un blob como archivo
   * @param {Blob} blob - Contenido del archivo
   * @param {string} filename - Nombre del archivo
   */
  downloadBlob: (blob, filename) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  /**
   * Exporta y descarga automáticamente como CSV
   * @param {Function} exportFn - Función de exportación del servicio
   * @param {Object} params - Parámetros de la exportación
   * @param {string} filename - Nombre del archivo
   */
  exportAndDownload: async (exportFn, params, filename) => {
    const blob = await exportFn({ ...params, format: 'csv' })
    crmReportsService.downloadBlob(blob, filename)
    return blob
  }
}

export default crmReportsService