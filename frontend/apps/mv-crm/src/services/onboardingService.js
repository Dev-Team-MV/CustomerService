import api from '@shared/services/api'

const onboardingService = {
  // Listar checklists de onboarding (Admin ve todos, usuario solo los suyos)
  getList: async (params = {}) => {
    const res = await api.get('/onboarding', { params })
    return res.data
  },

  // Crear un nuevo checklist de onboarding
  create: async (data) => {
    const res = await api.post('/onboarding', data)
    return res.data
  },

  // Obtener checklist por ID de propiedad
  getByProperty: async (propertyId, params = {}) => {
    const res = await api.get(`/onboarding/property/${propertyId}`, { params })
    return res.data
  },

  // Obtener checklist por su ID único
  getById: async (id) => {
    const res = await api.get(`/onboarding/${id}`)
    return res.data
  },

  // Actualizar checklist completo (Admin)
  update: async (id, data) => {
    const res = await api.put(`/onboarding/${id}`, data)
    return res.data
  },

  // Marcar o desmarcar un ítem específico del checklist como completado
  toggleItemComplete: async (id, key, data) => {
    const res = await api.post(`/onboarding/${id}/items/${key}/complete`, data)
    return res.data
  },

  // Eliminar un checklist (Admin)
  delete: async (id) => {
    const res = await api.delete(`/onboarding/${id}`)
    return res.data
  }
}

export default onboardingService