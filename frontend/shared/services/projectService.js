// /Users/oficina/MV-CRM/CustomerService/frontend/shared/services/projectService.js

import api from './api'
import { API_URL } from './apiUrl'

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

  // ═══════════════════════════════════════════════════════════════
  // ✅ VARIABLES DE PROYECTO (Message Template Variables)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtener todas las variables de un proyecto
   * @param {string} projectId - ID del proyecto
   * @param {string} [categoria] - Filtrar por categoría (opcional)
   * @returns {Promise<Array>} Lista de variables
   */
  getVariables: async (projectId, categoria = null) => {
    try {
      const params = {}
      if (categoria) params.categoria = categoria
      
      const response = await api.get(`/projects/${projectId}/variables`, { params })
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching project variables:', error)
      throw error
    }
  },

  /**
   * Crear una nueva variable para el proyecto
   * @param {string} projectId - ID del proyecto
   * @param {Object} data - { name, recorrido, categoria }
   * @returns {Promise<Object>} Variable creada
   */
  createVariable: async (projectId, data) => {
    try {
      const response = await api.post(`/projects/${projectId}/variables`, data)
      return response.data
    } catch (error) {
      console.error('Error creating project variable:', error)
      throw error
    }
  },

  /**
   * Actualizar una variable existente
   * @param {string} projectId - ID del proyecto
   * @param {string} variableId - ID de la variable
   * @param {Object} data - { name, recorrido, categoria }
   * @returns {Promise<Object>} Variable actualizada
   */
  updateVariable: async (projectId, variableId, data) => {
    try {
      const response = await api.put(`/projects/${projectId}/variables/${variableId}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating project variable:', error)
      throw error
    }
  },

  /**
   * Eliminar una variable
   * @param {string} projectId - ID del proyecto
   * @param {string} variableId - ID de la variable
   * @returns {Promise<Object>} Respuesta de eliminación
   */
  deleteVariable: async (projectId, variableId) => {
    try {
      const response = await api.delete(`/projects/${projectId}/variables/${variableId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting project variable:', error)
      throw error
    }
  },

    /**
   * Obtener las raíces del recorrido de variables
   * @param {string} projectId - ID del proyecto
   * @param {string} [lang='es'] - Idioma (es/en)
   * @returns {Promise<Array>} Lista de raíces (user, client, lot, etc.)
   */
  getVariableRoots: async (projectId, lang = 'es') => {
    try {
      const response = await api.get(`/projects/${projectId}/variables/recorridos`, {
        params: { lang }
      })
      return Array.isArray(response.data?.roots) ? response.data.roots : []
    } catch (error) {
      console.error('Error fetching variable roots:', error)
      throw error
    }
  },

  /**
   * Obtener los segmentos siguientes de un path
   * @param {string} projectId - ID del proyecto
   * @param {string} path - Path actual (ej: "lot" o "lot.model")
   * @param {string} [lang='es'] - Idioma (es/en)
   * @returns {Promise<Object>} { path, node, parentLabel, items }
   */
  getVariableSegments: async (projectId, path, lang = 'es') => {
    try {
      const response = await api.get(`/projects/${projectId}/variables/recorridos/segments`, {
        params: { path, lang }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching variable segments:', error)
      throw error
    }
  },

  downloadAccountStatementPdf: async (projectId, suggestedFilename = null) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}/projects/${projectId}/account-statement/pdf`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || `Download failed: ${response.status}`)
    }

    const blob = await response.blob()
    const disposition = response.headers.get('Content-Disposition')
    let filename = suggestedFilename || `project-statement-${projectId}.pdf`
    if (disposition) {
      const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i) || disposition.match(/filename="?([^";\n]+)"?/i)
      if (match && match[1]) filename = match[1].trim().replace(/^["']|["']$/g, '')
    }

    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(objectUrl)
  },

  // ═══════════════════════════════════════════════════════════════
  // 🆕 MÉTODOS PARA CATALOG-CONFIG (existentes)
  // ═══════════════════════════════════════════════════════════════

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