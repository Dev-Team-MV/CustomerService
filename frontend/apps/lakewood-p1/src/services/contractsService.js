import api from './api'

const contractsService = {
  /**
   * Crear o actualizar contratos de una propiedad (batch upload)
   * POST /api/contracts
   * @param {string} propertyId - ID de la propiedad
   * @param {Array} contracts - Array de contratos [{type, fileUrl, uploadedAt}]
   * @returns {Promise} Contratos creados/actualizados
   */
  createContracts: async (propertyId, contracts) => {
    try {
      const response = await api.post('/contracts', {
        propertyId,
        contracts
      })
      return response.data
    } catch (error) {
      console.error('Error creating contracts:', error)
      throw error
    }
  },

  /**
   * Obtener todos los contratos de una propiedad
   * GET /api/contracts/property/:propertyId
   * @param {string} propertyId - ID de la propiedad
   * @returns {Promise} Array de contratos
   */
  getContractsByProperty: async (propertyId) => {
    try {
      const response = await api.get(`/contracts/property/${propertyId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching contracts by property:', error)
      throw error
    }
  },

  /**
   * Añadir o actualizar tipos de contratos (merge por tipo)
   * PUT /api/contracts/property/:propertyId
   * @param {string} propertyId - ID de la propiedad
   * @param {Array} contracts - Array de contratos a añadir/actualizar
   * @returns {Promise} Contratos actualizados
   */
  updateContractsByProperty: async (propertyId, contracts) => {
    try {
      const response = await api.put(`/contracts/property/${propertyId}`, {
        contracts
      })
      return response.data
    } catch (error) {
      console.error('Error updating contracts by property:', error)
      throw error
    }
  },

  /**
   * Obtener un contrato específico por ID
   * GET /api/contracts/:id
   * @param {string} contractId - ID del documento de contrato
   * @returns {Promise} Contrato
   */
  getContractById: async (contractId) => {
    try {
      const response = await api.get(`/contracts/${contractId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching contract by id:', error)
      throw error
    }
  },

  /**
   * Actualizar contratos por ID de documento (merge por tipo)
   * PUT /api/contracts/:id
   * @param {string} contractId - ID del documento de contrato
   * @param {Array} contracts - Array de contratos a actualizar
   * @returns {Promise} Contratos actualizados
   */
  updateContractsById: async (contractId, contracts) => {
    try {
      const response = await api.put(`/contracts/${contractId}`, {
        contracts
      })
      return response.data
    } catch (error) {
      console.error('Error updating contracts by id:', error)
      throw error
    }
  },

  /**
   * Eliminar documento de contratos
   * DELETE /api/contracts/:id
   * @param {string} contractId - ID del documento de contrato
   * @returns {Promise} Mensaje de confirmación
   */
  deleteContract: async (contractId) => {
    try {
      const response = await api.delete(`/contracts/${contractId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting contract:', error)
      throw error
    }
  },

  /**
   * Listar todos los contratos (opcional filtrar por propiedad)
   * GET /api/contracts?propertyId=xxx
   * @param {string} propertyId - (Opcional) ID de la propiedad
   * @returns {Promise} Array de contratos
   */
  getAllContracts: async (propertyId = null) => {
    try {
      const url = propertyId ? `/contracts?propertyId=${propertyId}` : '/contracts'
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error('Error fetching all contracts:', error)
      throw error
    }
  },

  /**
   * Descargar archivo de contrato por propiedad y tipo (vía backend para evitar CORS con GCS).
   * GET /api/contracts/property/:propertyId/download/:type
   * @param {string} propertyId - ID de la propiedad
   * @param {string} type - Tipo de contrato (promissoryNote, purchaseContract, agreement)
   * @param {string} [suggestedFilename] - Nombre sugerido para el archivo descargado
   * @returns {Promise<void>}
   */
  downloadContract: async (propertyId, type, suggestedFilename = null) => {
    const token = localStorage.getItem('token')
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
    const url = `${baseURL}/contracts/property/${propertyId}/download/${type}`
    const response = await fetch(url, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || `Download failed: ${response.status}`)
    }
    const blob = await response.blob()
    const disposition = response.headers.get('Content-Disposition')
    let filename = suggestedFilename || `${type}.pdf`
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
  }
}

export default contractsService