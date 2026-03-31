import api from './api'

const contractsService = {
  // POST /api/contracts (propertyId o apartmentId)
  createContracts: async (resourceType, resourceId, contracts) => {
    try {
      const body = {
        contracts
      }
      if (resourceType === 'apartment') body.apartmentId = resourceId
      else body.propertyId = resourceId
      const response = await api.post('/contracts', body)
      return response.data
    } catch (error) {
      console.error('Error creating contracts:', error)
      throw error
    }
  },

  // GET /api/contracts/property/:id o /api/contracts/apartment/:id
  getContractsByResource: async (resourceType, resourceId) => {
    try {
      const url = resourceType === 'apartment'
        ? `/contracts/apartment/${resourceId}`
        : `/contracts/property/${resourceId}`
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error('Error fetching contracts:', error)
      throw error
    }
  },

getContractById: async (contractId) => {
    try {
      const response = await api.get(`/contracts/${contractId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching contract by id:', error)
      throw error
    }
  },

    // GET /api/contracts?apartmentId=...&propertyId=...
  getAllContracts: async (params = {}) => {
    try {
      const response = await api.get('/contracts', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching all contracts:', error)
      throw error
    }
  },

  // PUT /api/contracts/property/:id o /api/contracts/apartment/:id
  updateContractsByResource: async (resourceType, resourceId, contracts) => {
    try {
      const url = resourceType === 'apartment'
        ? `/contracts/apartment/${resourceId}`
        : `/contracts/property/${resourceId}`
      const response = await api.put(url, { contracts })
      return response.data
    } catch (error) {
      console.error('Error updating contracts:', error)
      throw error
    }
  },

    // DELETE /api/contracts/:contractId
  deleteContract: async (contractId) => {
    try {
      const response = await api.delete(`/contracts/${contractId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting contract:', error)
      throw error
    }
  },

  // Descargar archivo de contrato
  downloadContract: async (resourceType, resourceId, type, suggestedFilename = null) => {
    const token = localStorage.getItem('token')
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
    const url = resourceType === 'apartment'
      ? `${baseURL}/contracts/apartment/${resourceId}/download/${type}`
      : `${baseURL}/contracts/property/${resourceId}/download/${type}`
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