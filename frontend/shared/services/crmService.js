// Stub/mock crmService para apps que no tienen CRM
// Este archivo será sobrescrito por el crmService real en mv-crm

const crmService = {
  getBalance: async () => {
    // Mock implementation - retorna null o datos vacíos
    return null
  }
}

export default crmService
