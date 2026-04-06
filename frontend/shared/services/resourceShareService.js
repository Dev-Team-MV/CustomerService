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
    // Dejar que el backend maneje la iteración de miembros
    const response = await api.post(`/${endpoint}/${resourceId}/share`, {
      familyGroupId  // Solo enviar el ID del grupo, sin sharedWithUserId
    })
    return response.data
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