// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/services/projectService.js

import api from './api'

const projectService = {
  getAll: async () => {
    try {
      const response = await api.get('/projects')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching projects:', error)
      return []
    }
  },

  getBySlug: async (slug) => {
    try {
      const response = await api.get(`/projects/slug/${slug}`)
      return response.data
    } catch (error) {
      console.error('Error fetching project by slug:', error)
      return null
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching project by ID:', error)
      return null
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/projects', data)
      return response.data
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/projects/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/projects/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  },

  // 🆕 NUEVOS MÉTODOS PARA CATALOG-CONFIG

  /**
   * Obtener configuración de catálogo de un proyecto
   * @param {string} projectId - ID del proyecto
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object|Array>} Configuración(es) del catálogo
   */
  getCatalogConfig: async (projectId, filters = {}) => {
    try {
      const params = new URLSearchParams()
      if (filters.version) params.append('version', filters.version)
      if (filters.status) params.append('status', filters.status)
      if (filters.activeOnly) params.append('activeOnly', 'true')
      
      const queryString = params.toString()
      const url = `/projects/${projectId}/catalog-config${queryString ? `?${queryString}` : ''}`
      
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error('Error fetching catalog config:', error)
      return null
    }
  },

  /**
   * Crear nueva versión de configuración de catálogo
   * @param {string} projectId - ID del proyecto
   * @param {Object} configData - Datos de configuración
   * @returns {Promise<Object>} Configuración creada
   */
  createCatalogConfig: async (projectId, configData) => {
    try {
      const response = await api.post(
        `/projects/${projectId}/catalog-config`,
        configData
      )
      return response.data
    } catch (error) {
      console.error('Error creating catalog config:', error)
      throw error
    }
  },

  /**
   * Actualizar configuración existente
   * @param {string} projectId - ID del proyecto
   * @param {Object} configData - Datos de configuración
   * @returns {Promise<Object>} Configuración actualizada
   */
  updateCatalogConfig: async (projectId, configData) => {
    try {
      const response = await api.put(
        `/projects/${projectId}/catalog-config`,
        configData
      )
      return response.data
    } catch (error) {
      console.error('Error updating catalog config:', error)
      throw error
    }
  },

  /**
   * Publicar una versión de configuración
   * @param {string} projectId - ID del proyecto
   * @param {number} version - Número de versión a publicar
   * @returns {Promise<Object>} Configuración publicada
   */
  publishCatalogConfig: async (projectId, version) => {
    try {
      const response = await api.post(
        `/projects/${projectId}/catalog-config/publish`,
        { version }
      )
      return response.data
    } catch (error) {
      console.error('Error publishing catalog config:', error)
      throw error
    }
  }
}

export default projectService