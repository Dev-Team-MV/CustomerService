import api from '@shared/services/api'

const crmService = {
  getBalance: async () => {
    const res = await api.get('/crm/balance')
    return res.data
  },

  getClients: async (projectId = null) => {
    const params = projectId ? { projectId } : {}
    const res = await api.get('/crm/clients', { params })
    return res.data
  },
}

export default crmService