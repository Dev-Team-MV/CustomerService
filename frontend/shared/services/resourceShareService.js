// @shared/services/resourceShareService.js
import api from './api'

/**
 * Generic service for sharing resources (properties or apartments)
 * @param {string} resourceType - 'property' or 'apartment'
 */
export const createResourceShareService = (resourceType) => {
  const endpoint = resourceType === 'apartment' ? 'apartments' : 'properties'
  const resourceLabel = resourceType === 'apartment' ? 'Apartment' : 'Property'

  return {
    /**
     * Share resource with a specific user
     * @param {string} resourceId - Resource ID
     * @param {string} userId - User ID to share with
     * @param {string} [familyGroupId] - Optional family group ID
     * @returns {Promise<Object>} Share record
     */
    async shareWithUser(resourceId, userId, familyGroupId = null) {
      try {
        const { data } = await api.post(`/${endpoint}/${resourceId}/share`, {
          sharedWithUserId: userId,
          familyGroupId
        })
        return data
      } catch (error) {
        throw this._handleError(error, `Failed to share ${resourceLabel.toLowerCase()}`)
      }
    },

    /**
     * Share resource with entire family group
     * @param {string} resourceId - Resource ID
     * @param {string} familyGroupId - Family group ID
     * @returns {Promise<Object>} Share result with count
     */
    // async shareWithGroup(resourceId, familyGroupId) {
    //   try {
    //     const { data } = await api.post(`/${endpoint}/${resourceId}/share`, {
    //       familyGroupId
    //     })
    //     return data
    //   } catch (error) {
    //     throw this._handleError(error, `Failed to share ${resourceLabel.toLowerCase()} with group`)
    //   }
    // },
    // @shared/services/resourceShareService.js

async shareWithGroup(resourceId, familyGroupId, groupMembers) {
  try {
    const results = []
    
    // Compartir con cada miembro del grupo secuencialmente
    for (const member of groupMembers) {
      const memberId = member.user?._id || member.user?.id || member.user
      
      try {
        const response = await api.post(`/${endpoint}/${resourceId}/share`, {
          sharedWithUserId: memberId,
          familyGroupId
        })
        results.push(response.data)
      } catch (err) {
        // Si ya existe el share (400), ignorar y continuar
        if (err.response?.status === 400) {
          console.warn(`Share already exists for user ${memberId}`)
          continue
        }
        throw err
      }
    }
    
    return { 
      count: results.length, 
      shares: results,
      message: `Shared with ${results.length} group member(s)`
    }
  } catch (error) {
    throw this._handleError(error, `Failed to share ${resourceLabel.toLowerCase()} with group`)
  }
},

    /**
     * Get all shares for a resource
     * @param {string} resourceId - Resource ID
     * @returns {Promise<Array>} List of shares
     */
    async getShares(resourceId) {
      try {
        const { data } = await api.get(`/${endpoint}/${resourceId}/shares`)
        return data
      } catch (error) {
        throw this._handleError(error, `Failed to fetch ${resourceLabel.toLowerCase()} shares`)
      }
    },

    /**
     * Revoke share from a specific user
     * @param {string} resourceId - Resource ID
     * @param {string} userId - User ID to revoke access from
     * @returns {Promise<Object>} Revocation result
     */
    async revokeUserShare(resourceId, userId) {
      try {
        const { data } = await api.delete(`/${endpoint}/${resourceId}/share/${userId}`)
        return data
      } catch (error) {
        throw this._handleError(error, `Failed to revoke ${resourceLabel.toLowerCase()} access`)
      }
    },

    /**
     * Revoke all shares from a family group
     * @param {string} resourceId - Resource ID
     * @param {string} familyGroupId - Family group ID
     * @returns {Promise<Object>} Revocation result with count
     */
    async revokeGroupShare(resourceId, familyGroupId) {
      try {
        const { data } = await api.delete(`/${endpoint}/${resourceId}/share/group/${familyGroupId}`)
        return data
      } catch (error) {
        throw this._handleError(error, `Failed to revoke group access to ${resourceLabel.toLowerCase()}`)
      }
    },

    /**
     * Handle API errors
     * @private
     */
    _handleError(error, defaultMessage) {
      const message = error.response?.data?.message || error.message || defaultMessage
      console.error(`[ResourceShareService:${resourceType}] ${defaultMessage}:`, error)
      return new Error(message)
    }
  }
}

// Export pre-configured instances
export const propertyShareService = createResourceShareService('property')
export const apartmentShareService = createResourceShareService('apartment')

export default createResourceShareService