// apps/mv-crm/src/services/vendorService.js
import api from '@shared/services/api' // Ajusta la ruta si tu instancia de axios se llama diferente

export const vendorService = {
  /**
   * Obtiene la taxonomía completa (categorías y subcategorías con labels en/en/es)
   */
  getCategories: async () => {
    const response = await api.get('/vendors/categories')
    return response.data
  },

  /**
   * Lista proveedores con filtros.
   * @param {Object} params - { category, subcategory, projectId, scope, location, search, status }
   * Nota: Si se envía projectId, la API devuelve los del proyecto + los generales.
   * Usa scope='project' para solo los del proyecto, o scope='general' para solo los globales.
   */
  getVendors: async (params = {}) => {
    // Limpiamos parámetros vacíos para no enviar ?category= a la API
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    )
    const response = await api.get('/vendors', { params: cleanParams })
    return response.data
  },

  /**
   * Obtiene un proveedor específico por su ID
   */
  getVendorById: async (id) => {
    const response = await api.get(`/vendors/${id}`)
    return response.data
  },

  /**
   * Crea un nuevo proveedor (Requiere rol Admin)
   */
  createVendor: async (data) => {
    const response = await api.post('/vendors', data)
    return response.data
  },

  /**
   * Actualiza un proveedor existente (Requiere rol Admin)
   */
  updateVendor: async (id, data) => {
    const response = await api.put(`/vendors/${id}`, data)
    return response.data
  },

  /**
   * Elimina un proveedor (Requiere rol Admin)
   */
  deleteVendor: async (id) => {
    const response = await api.delete(`/vendors/${id}`)
    return response.data
  },

  /**
   * Helper para subir la foto del proveedor a la carpeta 'vendors'
   * @param {File} file - El archivo de imagen
   */
  uploadVendorPhoto: async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('folder', 'vendors')
    
    const response = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data // Se espera que devuelva la URL de la imagen
  }
}

export default vendorService