import api from '@shared/services/api'

const referralService = {
  // ==========================================
  // PROGRAMAS DE REFERIDOS
  // ==========================================
  getPrograms: async (params = {}) => {
    const res = await api.get('/referrals/programs', { params })
    return res.data
  },

  getProgram: async (id) => {
    const res = await api.get(`/referrals/programs/${id}`)
    return res.data
  },

  createProgram: async (data) => {
    const res = await api.post('/referrals/programs', data)
    return res.data
  },

  updateProgram: async (id, data) => {
    const res = await api.put(`/referrals/programs/${id}`, data)
    return res.data
  },

  deleteProgram: async (id) => {
    const res = await api.delete(`/referrals/programs/${id}`)
    return res.data
  },

  // ==========================================
  // REFERIDOS (General y Admin)
  // ==========================================
  getList: async (params = {}) => {
    const res = await api.get('/referrals', { params })
    return res.data
  },

  getByReferrer: async (userId, params = {}) => {
    const res = await api.get(`/referrals/by-referrer/${userId}`, { params })
    return res.data
  },

  getById: async (id) => {
    const res = await api.get(`/referrals/${id}`)
    return res.data
  },

  submit: async (data) => {
    // Endpoint para que usuarios o admin envíen un referido (crea lead automáticamente)
    const res = await api.post('/referrals/submit', data)
    return res.data
  },

  create: async (data) => {
    // Endpoint Admin para crear manualmente un referido con datos completos
    const res = await api.post('/referrals', data)
    return res.data
  },

  update: async (id, data) => {
    const res = await api.put(`/referrals/${id}`, data)
    return res.data
  },

  delete: async (id) => {
    const res = await api.delete(`/referrals/${id}`)
    return res.data
  },

  convert: async (id, data) => {
    // Marca como convertido y vincula propiedad
    const res = await api.post(`/referrals/${id}/convert`, data)
    return res.data
  },

  approveReward: async (id, data) => {
    // Marca la recompensa como pagada
    const res = await api.post(`/referrals/${id}/approve-reward`, data)
    return res.data
  },

  // ==========================================
  // ESTADÍSTICAS
  // ==========================================
  getStats: async (projectId) => {
    const res = await api.get(`/referrals/stats/${projectId}`)
    return res.data
  }
}

export default referralService