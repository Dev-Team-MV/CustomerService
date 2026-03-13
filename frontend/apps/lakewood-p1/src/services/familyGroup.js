import api from './api'

const familyGroupService = {
  // Get all family groups for the logged-in user
  getFamilyGroups: async () => {
    try {
      const response = await api.get('/family-groups')
      return response.data
    } catch (error) {
      console.error('❌ Error getting family groups:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to get family groups')
    }
  },

  // Create a new family group
  createFamilyGroup: async (name) => {
    try {
      const response = await api.post('/family-groups', { name })
      return response.data
    } catch (error) {
      console.error('❌ Error creating family group:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to create family group')
    }
  },

  // Add a member to a family group
  addMemberToGroup: async (groupId, userId, role = 'member') => {
    try {
      const response = await api.post(`/family-groups/${groupId}/members`, {
        userId,
        role
      })
      return response.data
    } catch (error) {
      console.error('❌ Error adding member to group:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to add member to group')
    }
  },

  // Remove a member from a family group
  removeMemberFromGroup: async (groupId, userId) => {
    try {
      const response = await api.delete(`/family-groups/${groupId}/members/${userId}`)
      return response.data
    } catch (error) {
      console.error('❌ Error removing member from group:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to remove member from group')
    }
  },

  // Delete a family group
  deleteFamilyGroup: async (groupId) => {
    try {
      const response = await api.delete(`/family-groups/${groupId}`)
      return response.data
    } catch (error) {
      console.error('❌ Error deleting family group:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to delete family group')
    }
  },

    // Share property with family group
    sharePropertyWithGroup: async (propertyId, familyGroupId, groupMembers) => {
      try {        
        const results = []
        for (const member of groupMembers) {
          const memberId = member.user._id
          try {
            const response = await api.post(`/properties/${propertyId}/share`, {
              sharedWithUserId: memberId,
              familyGroupId
            })
            results.push(response.data)
          } catch (err) {
            // Si ya existe el share (400), ignorar y continuar
            if (err.response?.status === 400) continue
            throw err
          }
        }
        return results
      } catch (error) {
        console.error('❌ Error sharing property with group:', error.response?.data || error.message)
        throw new Error(error.response?.data?.message || 'Failed to share property with group')
      }
    },
  
  // ...existing code...

  // Revoke property access from entire group
  revokePropertyFromGroup: async (propertyId, familyGroupId) => {
    try {
      const response = await api.delete(`/properties/${propertyId}/share/group/${familyGroupId}`)
      return response.data
    } catch (error) {
      console.error('❌ Error revoking property from group:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to revoke property from group')
    }
  },

  // Get property shares
  getPropertyShares: async (propertyId) => {
    try {
      const response = await api.get(`/properties/${propertyId}/shares`)
      return response.data
    } catch (error) {
      console.error('❌ Error getting property shares:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to get property shares')
    }
  },

  // Revoke property access from a single user
  revokePropertyFromUser: async (propertyId, userId) => {
    try {
      const response = await api.delete(`/properties/${propertyId}/share/${userId}`)
      return response.data
    } catch (error) {
      console.error('❌ Error revoking property from user:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to revoke property from user')
    }
  }
}

export default familyGroupService