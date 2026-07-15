// apps/mv-crm/src/services/quoteService.js
import api from '@shared/services/api'

const quoteService = {
  // Previsualizar amortización sin guardar
  previewAmortization: async (data) => {
    const res = await api.post('/quotes/preview', data)
    return res.data
  },

  // Listar cotizaciones
  getQuotes: async (params = {}) => {
    const res = await api.get('/quotes', { params })
    return res.data
  },

  // Obtener por ID
  getQuoteById: async (id) => {
    const res = await api.get(`/quotes/${id}`)
    return res.data
  },

  // Crear cotización
  createQuote: async (data) => {
    const res = await api.post('/quotes', data)
    return res.data
  },

  // Actualizar cotización
  updateQuote: async (id, data) => {
    const res = await api.put(`/quotes/${id}`, data)
    return res.data
  },

  // Eliminar
  deleteQuote: async (id) => {
    const res = await api.delete(`/quotes/${id}`)
    return res.data
  },

  // Descargar PDF
  downloadPdf: async (id) => {
    const res = await api.get(`/quotes/${id}/pdf`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `cotizacion-${id}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  },

  // ✅ NUEVO: Enviar cotización
  sendQuote: async (id, data) => {
    const res = await api.post(`/quotes/${id}/send`, data)
    return res.data
  },

  // ✅ NUEVO: Convertir a venta (maneja el propertyCreateHint)
  convertToSale: async (id, data = {}) => {
    const res = await api.post(`/quotes/${id}/convert-to-sale`, data)
    return res.data
  },

  // Obtener por lead
  getByLead: async (leadId) => {
    const res = await api.get(`/quotes/by-lead/${leadId}`)
    return res.data
  },

  // Obtener expiradas
  getExpired: async (projectId) => {
    const res = await api.get('/quotes/expired', { params: { projectId } })
    return res.data
  }
}

export default quoteService