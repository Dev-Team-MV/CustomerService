// frontend/apps/mv-crm/src/services/messageTemplateService.js
import api from '@shared/services/api'

const messageTemplateService = {
  // Obtener todos los templates
  getAll: async () => {
    const res = await api.get('/sms-templates')
    return res.data
  },

  // Obtener template por ID
  getById: async (id) => {
    const res = await api.get(`/sms-templates/${id}`)
    return res.data
  },

  // Crear template
  create: async (data) => {
    const res = await api.post('/sms-templates', data)
    return res.data
  },

  // Actualizar template
  update: async (id, data) => {
    const res = await api.put(`/sms-templates/${id}`, data)
    return res.data
  },

  // Eliminar template
  delete: async (id) => {
    const res = await api.delete(`/sms-templates/${id}`)
    return res.data
  }
}

export default messageTemplateService