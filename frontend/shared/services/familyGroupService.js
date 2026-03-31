// @shared/services/familyGroupService.js
import api from './api'

/**
 * Service for managing family groups
 * Handles all CRUD operations for family groups and their members
 */
const familyGroupService = {
  /**
   * Get all family groups for the current user
   * @returns {Promise<Array>} List of family groups
   */
  async getAll() {
    try {
      const { data } = await api.get('/family-groups')
      return data
    } catch (error) {
      throw this._handleError(error, 'Failed to fetch family groups')
    }
  },

  /**
   * Get a single family group by ID
   * @param {string} groupId - Group ID
   * @returns {Promise<Object>} Family group details
   */
  async getById(groupId) {
    try {
      const { data } = await api.get(`/family-groups/${groupId}`)
      return data
    } catch (error) {
      throw this._handleError(error, 'Failed to fetch group details')
    }
  },

  /**
   * Create a new family group
   * @param {string} name - Group name
   * @returns {Promise<Object>} Created group
   */
  async create(name) {
    try {
      const { data } = await api.post('/family-groups', { name })
      return data
    } catch (error) {
      throw this._handleError(error, 'Failed to create group')
    }
  },

  /**
   * Update family group details
   * @param {string} groupId - Group ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated group
   */
  async update(groupId, updates) {
    try {
      const { data } = await api.put(`/family-groups/${groupId}`, updates)
      return data
    } catch (error) {
      throw this._handleError(error, 'Failed to update group')
    }
  },

  /**
   * Delete a family group
   * @param {string} groupId - Group ID
   * @returns {Promise<Object>} Deletion result
   */
  async delete(groupId) {
    try {
      const { data } = await api.delete(`/family-groups/${groupId}`)
      return data
    } catch (error) {
      throw this._handleError(error, 'Failed to delete group')
    }
  },

  /**
   * Add a member to a family group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID to add
   * @param {string} role - Member role ('admin' | 'member')
   * @returns {Promise<Object>} Updated group
   */
  async addMember(groupId, userId, role = 'member') {
    try {
      const { data } = await api.post(`/family-groups/${groupId}/members`, {
        userId,
        role
      })
      return data
    } catch (error) {
      throw this._handleError(error, 'Failed to add member')
    }
  },

  /**
   * Remove a member from a family group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID to remove
   * @returns {Promise<Object>} Updated group
   */
  async removeMember(groupId, userId) {
    try {
      const { data } = await api.delete(`/family-groups/${groupId}/members/${userId}`)
      return data
    } catch (error) {
      throw this._handleError(error, 'Failed to remove member')
    }
  },

  /**
   * Update member role in a family group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID
   * @param {string} role - New role ('admin' | 'member')
   * @returns {Promise<Object>} Updated group
   */
  async updateMemberRole(groupId, userId, role) {
    try {
      const { data } = await api.put(`/family-groups/${groupId}/members/${userId}`, { role })
      return data
    } catch (error) {
      throw this._handleError(error, 'Failed to update member role')
    }
  },

  /**
   * Handle API errors with consistent format
   * @private
   */
  _handleError(error, defaultMessage) {
    const message = error.response?.data?.message || error.message || defaultMessage
    console.error(`[FamilyGroupService] ${defaultMessage}:`, error)
    return new Error(message)
  }
}

export default familyGroupService