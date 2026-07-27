import api from '@shared/services/api'

const warrantyService = {
  // Listar reclamaciones de garantía (con filtros de estado, categoría, prioridad, etc.)
  getList: async (params = {}) => {
    const res = await api.get('/warranties', { params })
    return res.data
  },

  // Enviar una nueva reclamación de garantía
  create: async (data) => {
    const res = await api.post('/warranties', data)
    return res.data
  },

  // Obtener detalle de una reclamación por ID
  getById: async (id) => {
    const res = await api.get(`/warranties/${id}`)
    return res.data
  },

  // Actualizar una reclamación (Usuarios editan descripción/fotos; Admins pueden todo)
  update: async (id, data) => {
    const res = await api.put(`/warranties/${id}`, data)
    return res.data
  },

  // Resolver o rechazar una reclamación (Admin)
  resolve: async (id, data) => {
    const res = await api.post(`/warranties/${id}/resolve`, data)
    return res.data
  },

  // Eliminar una reclamación (Admin)
  delete: async (id) => {
    const res = await api.delete(`/warranties/${id}`)
    return res.data
  }
}

export default warrantyService