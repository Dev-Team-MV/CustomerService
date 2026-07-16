import api from '@shared/services/api'

const crmService = {
  getBalance: async () => {
    console.log('📡 crmService: Calling GET /crm/balance')
    try {
      const res = await api.get('/crm/balance')
      console.log('✅ crmService: Balance response received')
      return res.data
    } catch (err) {
      console.error('❌ crmService: Error calling /crm/balance:', err)
      console.error('❌ Error details:', err.response?.data || err.message)
      throw err
    }
  },

  getClients: async (projectId = null) => {
    console.log('📡 crmService: Calling GET /crm/clients')
    const params = projectId ? { projectId } : {}
    const res = await api.get('/crm/clients', { params })
    return res.data
  },
}

export default crmService