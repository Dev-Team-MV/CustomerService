import api from './api'

const familyGroupService = {
  // Get all family groups for the logged-in user
  getFamilyGroups: async () => {
    try {
      console.log('📋 Getting family groups...')
      const response = await api.get('/family-groups')
      console.log(`✅ Found ${response.data?.length || 0} family groups`)
      return response.data
    } catch (error) {
      console.error('❌ Error getting family groups:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to get family groups')
    }
  },

  // Create a new family group
  createFamilyGroup: async (name) => {
    try {
      console.log(`📝 Creating family group: ${name}`)
      const response = await api.post('/family-groups', { name })
      console.log('✅ Family group created:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error creating family group:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to create family group')
    }
  },

  // Add a member to a family group
  addMemberToGroup: async (groupId, userId, role = 'member') => {
    try {
      console.log(`👥 Adding member ${userId} to group ${groupId} with role ${role}`)
      const response = await api.post(`/family-groups/${groupId}/members`, {
        userId,
        role
      })
      console.log('✅ Member added successfully')
      return response.data
    } catch (error) {
      console.error('❌ Error adding member to group:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to add member to group')
    }
  },

  // Remove a member from a family group
  removeMemberFromGroup: async (groupId, userId) => {
    try {
      console.log(`🗑️ Removing member ${userId} from group ${groupId}`)
      const response = await api.delete(`/family-groups/${groupId}/members/${userId}`)
      console.log('✅ Member removed successfully')
      return response.data
    } catch (error) {
      console.error('❌ Error removing member from group:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to remove member from group')
    }
  },

  // Delete a family group
  deleteFamilyGroup: async (groupId) => {
    try {
      console.log(`🗑️ Deleting family group ${groupId}`)
      const response = await api.delete(`/family-groups/${groupId}`)
      console.log('✅ Family group deleted successfully')
      return response.data
    } catch (error) {
      console.error('❌ Error deleting family group:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to delete family group')
    }
  },

  // Share property with family group
  // ...existing code...
  
    // Share property with family group
    sharePropertyWithGroup: async (propertyId, familyGroupId, groupMembers) => {
      try {
        console.log(`🏠 Sharing property ${propertyId} with family group ${familyGroupId}`)
        
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
  
        console.log(`✅ Property shared with ${results.length} members`)
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
      console.log(`🚫 Revoking property ${propertyId} access from family group ${familyGroupId}`)
      const response = await api.delete(`/properties/${propertyId}/share/group/${familyGroupId}`)
      console.log('✅ Property access revoked from family group')
      return response.data
    } catch (error) {
      console.error('❌ Error revoking property from group:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to revoke property from group')
    }
  },

  // Get property shares
  getPropertyShares: async (propertyId) => {
    try {
      console.log(`📋 Getting shares for property ${propertyId}`)
      const response = await api.get(`/properties/${propertyId}/shares`)
      console.log(`✅ Found ${response.data?.length || 0} shares`)
      return response.data
    } catch (error) {
      console.error('❌ Error getting property shares:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to get property shares')
    }
  },

  // Revoke property access from a single user
  revokePropertyFromUser: async (propertyId, userId) => {
    try {
      console.log(`🚫 Revoking property ${propertyId} access from user ${userId}`)
      const response = await api.delete(`/properties/${propertyId}/share/${userId}`)
      console.log('✅ Property access revoked from user')
      return response.data
    } catch (error) {
      console.error('❌ Error revoking property from user:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to revoke property from user')
    }
  }
}

export default familyGroupService