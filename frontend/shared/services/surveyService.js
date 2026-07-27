import api from '@shared/services/api'

const surveyService = {
  // ==========================================
  // PLANTILLAS DE ENCUESTAS (NUEVO)
  // ==========================================
  
  // Listar plantillas (Admin ve todas, Usuario solo ve isActive: true)
  getTemplates: async (params = {}) => {
    const res = await api.get('/surveys/templates', { params })
    return res.data
  },

  // Crear plantilla (Solo Admin)
  createTemplate: async (data) => {
    const res = await api.post('/surveys/templates', data)
    return res.data
  },

  // Obtener plantilla por ID (Usuario solo si isActive: true)
  getTemplateById: async (id) => {
    const res = await api.get(`/surveys/templates/${id}`)
    return res.data
  },

  // Actualizar plantilla (Solo Admin)
  updateTemplate: async (id, data) => {
    const res = await api.put(`/surveys/templates/${id}`, data)
    return res.data
  },

  // Eliminar plantilla (Solo Admin)
  deleteTemplate: async (id) => {
    const res = await api.delete(`/surveys/templates/${id}`)
    return res.data
  },

  // ==========================================
  // ENCUESTAS (RESPUESTAS)
  // ==========================================

  // Listar encuestas respondidas (filtros: projectId, propertyId, apartmentId, clientId, templateId, type)
  getList: async (params = {}) => {
    const res = await api.get('/surveys', { params })
    return res.data
  },

  // Responder una encuesta (Usuario: requiere templateId + responses con questionKey. Admin: puede ser free-form)
  create: async (data) => {
    const res = await api.post('/surveys', data)
    return res.data
  },

  // Obtener una encuesta específica por ID
  getById: async (id) => {
    const res = await api.get(`/surveys/${id}`)
    return res.data
  },

  // Actualizar respuestas de una encuesta (Usuario: solo rating/comment/overall/nps. Admin: todo)
  update: async (id, data) => {
    const res = await api.put(`/surveys/${id}`, data)
    return res.data
  },

  // Eliminar una encuesta (Admin)
  delete: async (id) => {
    const res = await api.delete(`/surveys/${id}`)
    return res.data
  },

  // ==========================================
  // ESTADÍSTICAS
  // ==========================================
  
  // Obtener estadísticas y promedios de NPS por proyecto (Ahora incluye byQuestion)
  getStats: async (projectId, params = {}) => {
    const res = await api.get(`/surveys/stats/${projectId}`, { params })
    return res.data
  }
}

export default surveyService