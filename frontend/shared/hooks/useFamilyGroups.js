// @shared/hooks/useFamilyGroups.js
import { useState, useEffect, useCallback } from 'react'
import familyGroupService from '../services/familyGroupService'
import { useAuth } from '../context/AuthContext'

/**
 * Hook for managing family groups
 * Provides CRUD operations and state management for family groups
 */
export const useFamilyGroups = () => {
  const { user } = useAuth()
  
  // State
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [operationLoading, setOperationLoading] = useState(false)

  /**
   * Load all family groups
   */
  const loadGroups = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await familyGroupService.getAll()
      setGroups(data)
    } catch (err) {
      setError(err.message)
      console.error('[useFamilyGroups] Load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load groups on mount
  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  /**
   * Create a new family group
   * @param {string} name - Group name
   * @returns {Promise<Object|null>} Created group or null on error
   */
  const createGroup = useCallback(async (name) => {
    if (!name?.trim()) {
      setError('Group name is required')
      return null
    }

    try {
      setOperationLoading(true)
      setError(null)
      const newGroup = await familyGroupService.create(name.trim())
      setGroups(prev => [...prev, newGroup])
      setSuccess('Group created successfully')
      return newGroup
    } catch (err) {
      setError(err.message)
      console.error('[useFamilyGroups] Create error:', err)
      return null
    } finally {
      setOperationLoading(false)
    }
  }, [])

  /**
   * Update a family group
   * @param {string} groupId - Group ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated group or null on error
   */
  const updateGroup = useCallback(async (groupId, updates) => {
    try {
      setOperationLoading(true)
      setError(null)
      const updatedGroup = await familyGroupService.update(groupId, updates)
      setGroups(prev => prev.map(g => g._id === groupId ? updatedGroup : g))
      setSuccess('Group updated successfully')
      return updatedGroup
    } catch (err) {
      setError(err.message)
      console.error('[useFamilyGroups] Update error:', err)
      return null
    } finally {
      setOperationLoading(false)
    }
  }, [])

  /**
   * Delete a family group
   * @param {string} groupId - Group ID
   * @returns {Promise<boolean>} Success status
   */
  const deleteGroup = useCallback(async (groupId) => {
    try {
      setOperationLoading(true)
      setError(null)
      await familyGroupService.delete(groupId)
      setGroups(prev => prev.filter(g => g._id !== groupId))
      setSuccess('Group deleted successfully')
      return true
    } catch (err) {
      setError(err.message)
      console.error('[useFamilyGroups] Delete error:', err)
      return false
    } finally {
      setOperationLoading(false)
    }
  }, [])

  /**
   * Add a member to a group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID to add
   * @param {string} role - Member role ('admin' | 'member')
   * @returns {Promise<Object|null>} Updated group or null on error
   */
  const addMember = useCallback(async (groupId, userId, role = 'member') => {
    if (!userId) {
      setError('User is required')
      return null
    }

    try {
      setOperationLoading(true)
      setError(null)
      const updatedGroup = await familyGroupService.addMember(groupId, userId, role)
      setGroups(prev => prev.map(g => g._id === groupId ? updatedGroup : g))
      setSuccess('Member added successfully')
      return updatedGroup
    } catch (err) {
      setError(err.message)
      console.error('[useFamilyGroups] Add member error:', err)
      return null
    } finally {
      setOperationLoading(false)
    }
  }, [])

  /**
   * Remove a member from a group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID to remove
   * @returns {Promise<Object|null>} Updated group or null on error
   */
  const removeMember = useCallback(async (groupId, userId) => {
    try {
      setOperationLoading(true)
      setError(null)
      const updatedGroup = await familyGroupService.removeMember(groupId, userId)
      setGroups(prev => prev.map(g => g._id === groupId ? updatedGroup : g))
      setSuccess('Member removed successfully')
      return updatedGroup
    } catch (err) {
      setError(err.message)
      console.error('[useFamilyGroups] Remove member error:', err)
      return null
    } finally {
      setOperationLoading(false)
    }
  }, [])

  /**
   * Update member role in a group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID
   * @param {string} role - New role ('admin' | 'member')
   * @returns {Promise<Object|null>} Updated group or null on error
   */
  const updateMemberRole = useCallback(async (groupId, userId, role) => {
    try {
      setOperationLoading(true)
      setError(null)
      const updatedGroup = await familyGroupService.updateMemberRole(groupId, userId, role)
      setGroups(prev => prev.map(g => g._id === groupId ? updatedGroup : g))
      setSuccess('Member role updated successfully')
      return updatedGroup
    } catch (err) {
      setError(err.message)
      console.error('[useFamilyGroups] Update role error:', err)
      return null
    } finally {
      setOperationLoading(false)
    }
  }, [])

  /**
   * Check if current user is admin of a group
   * @param {Object} group - Group object
   * @returns {boolean} True if user is admin
   */
// @shared/hooks/useFamilyGroups.js - línea ~195

const isGroupAdmin = useCallback((group) => {
  if (!group || !user) return false
  
  // Superadmin siempre es admin
  if (user.role === 'superadmin') return true
  
  // Obtener IDs de forma flexible (soporta _id o id)
  const userId = user._id || user.id
  const creatorId = group.createdBy?._id || group.createdBy?.id || group.createdBy
  
  // Verificar si es el creador
  if (userId && creatorId && userId === creatorId) return true
  
  // Verificar si es admin en members
  return group.members?.some(m => {
    const memberId = m.user?._id || m.user?.id || m.user
    return memberId === userId && m.role === 'admin'
  })
}, [user])
  /**
   * Check if current user is member of a group
   * @param {Object} group - Group object
   * @returns {boolean} True if user is member
   */
  const isGroupMember = useCallback((group) => {
    if (!group || !user) return false
    if (group.createdBy?._id === user._id || group.createdBy === user._id) return true
    return group.members?.some(
      m => m.user?._id === user._id || m.user === user._id
    )
  }, [user])

  /**
   * Get group by ID from current state
   * @param {string} groupId - Group ID
   * @returns {Object|null} Group object or null
   */
  const getGroupById = useCallback((groupId) => {
    return groups.find(g => g._id === groupId) || null
  }, [groups])

  /**
   * Clear alert messages
   */
  const clearAlerts = useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  /**
   * Clear success message after timeout
   */
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  return {
    // State
    groups,
    loading,
    error,
    success,
    operationLoading,
    
    // Actions
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    updateMemberRole,
    
    // Helpers
    isGroupAdmin,
    isGroupMember,
    getGroupById,
    clearAlerts,
    refetch: loadGroups
  }
}