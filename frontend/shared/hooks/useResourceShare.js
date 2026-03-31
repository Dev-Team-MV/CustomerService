// @shared/hooks/useResourceShare.js
import { useState, useEffect, useCallback } from 'react'
import { createResourceShareService } from '../services/resourceShareService'

/**
 * Hook for managing resource sharing (properties or apartments)
 * @param {string} resourceType - 'property' or 'apartment'
 * @param {string} resourceId - Resource ID
 */
export const useResourceShare = (resourceType, resourceId) => {
  const [shares, setShares] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [operationLoading, setOperationLoading] = useState(false)

  // Create service instance
  const service = createResourceShareService(resourceType)

  /**
   * Load shares for the resource
   */
  const loadShares = useCallback(async () => {
    if (!resourceId) return

    try {
      setLoading(true)
      setError(null)
      const data = await service.getShares(resourceId)
      setShares(data)
    } catch (err) {
      setError(err.message)
      console.error('[useResourceShare] Load error:', err)
    } finally {
      setLoading(false)
    }
  }, [resourceId, service])

  // Load shares on mount and when resourceId changes
  useEffect(() => {
    loadShares()
  }, [loadShares])

  /**
   * Share resource with a specific user
   * @param {string} userId - User ID to share with
   * @param {string} [familyGroupId] - Optional family group ID
   * @returns {Promise<Object|null>} Share record or null on error
   */
  const shareWithUser = useCallback(async (userId, familyGroupId = null) => {
    if (!userId) {
      setError('User is required')
      return null
    }

    try {
      setOperationLoading(true)
      setError(null)
      const share = await service.shareWithUser(resourceId, userId, familyGroupId)
      setSuccess(`${resourceType} shared successfully`)
      await loadShares()
      return share
    } catch (err) {
      setError(err.message)
      console.error('[useResourceShare] Share with user error:', err)
      return null
    } finally {
      setOperationLoading(false)
    }
  }, [resourceId, resourceType, service, loadShares])

  /**
   * Share resource with entire family group
   * @param {string} familyGroupId - Family group ID
   * @returns {Promise<Object|null>} Share result or null on error
   */
//   const shareWithGroup = useCallback(async (familyGroupId) => {
//     if (!familyGroupId) {
//       setError('Family group is required')
//       return null
//     }

//     try {
//       setOperationLoading(true)
//       setError(null)
//       const result = await service.shareWithGroup(resourceId, familyGroupId)
//       setSuccess(result.message || `${resourceType} shared with group successfully`)
//       await loadShares()
//       return result
//     } catch (err) {
//       setError(err.message)
//       console.error('[useResourceShare] Share with group error:', err)
//       return null
//     } finally {
//       setOperationLoading(false)
//     }
//   }, [resourceId, resourceType, service, loadShares])
const shareWithGroup = useCallback(async (familyGroupId, groupMembers) => {
  if (!familyGroupId) {
    setError('Family group is required')
    return null
  }
 
  if (!groupMembers || groupMembers.length === 0) {
    setError('Group has no members to share with')
    return null
  }
 
  try {
    setOperationLoading(true)
    setError(null)
    const result = await service.shareWithGroup(resourceId, familyGroupId, groupMembers)
    setSuccess(result.message || `${resourceType} shared with ${result.count} group member(s)`)
    await loadShares()
    return result
  } catch (err) {
    setError(err.message)
    console.error('[useResourceShare] Share with group error:', err)
    return null
  } finally {
    setOperationLoading(false)
  }
}, [resourceId, resourceType, service, loadShares])

  /**
   * Revoke share from a specific user
   * @param {string} userId - User ID to revoke access from
   * @returns {Promise<boolean>} Success status
   */
  const revokeUserShare = useCallback(async (userId) => {
    try {
      setOperationLoading(true)
      setError(null)
      await service.revokeUserShare(resourceId, userId)
      setShares(prev => prev.filter(s => 
        s.sharedWith?._id !== userId && s.sharedWith !== userId
      ))
      setSuccess('Access revoked successfully')
      return true
    } catch (err) {
      setError(err.message)
      console.error('[useResourceShare] Revoke user error:', err)
      return false
    } finally {
      setOperationLoading(false)
    }
  }, [resourceId, service])

  /**
   * Revoke all shares from a family group
   * @param {string} familyGroupId - Family group ID
   * @returns {Promise<Object|null>} Revocation result or null on error
   */
  const revokeGroupShare = useCallback(async (familyGroupId) => {
    try {
      setOperationLoading(true)
      setError(null)
      const result = await service.revokeGroupShare(resourceId, familyGroupId)
      setShares(prev => prev.filter(s => 
        s.familyGroup?._id !== familyGroupId && s.familyGroup !== familyGroupId
      ))
      setSuccess(result.message || 'Group access revoked successfully')
      return result
    } catch (err) {
      setError(err.message)
      console.error('[useResourceShare] Revoke group error:', err)
      return null
    } finally {
      setOperationLoading(false)
    }
  }, [resourceId, service])

  /**
   * Get shares grouped by family group
   * @returns {Object} Shares grouped by familyGroup
   */
  const getSharesByGroup = useCallback(() => {
    const grouped = {
      withGroup: {},
      withoutGroup: []
    }

    shares.forEach(share => {
      if (share.familyGroup) {
        const groupId = share.familyGroup._id || share.familyGroup
        if (!grouped.withGroup[groupId]) {
          grouped.withGroup[groupId] = {
            group: share.familyGroup,
            shares: []
          }
        }
        grouped.withGroup[groupId].shares.push(share)
      } else {
        grouped.withoutGroup.push(share)
      }
    })

    return grouped
  }, [shares])

  /**
   * Check if resource is shared with a specific user
   * @param {string} userId - User ID to check
   * @returns {boolean} True if shared
   */
  const isSharedWith = useCallback((userId) => {
    return shares.some(s => 
      s.sharedWith?._id === userId || s.sharedWith === userId
    )
  }, [shares])

  /**
   * Check if resource is shared with a family group
   * @param {string} familyGroupId - Family group ID to check
   * @returns {boolean} True if shared
   */
  const isSharedWithGroup = useCallback((familyGroupId) => {
    return shares.some(s => 
      s.familyGroup?._id === familyGroupId || s.familyGroup === familyGroupId
    )
  }, [shares])

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
    shares,
    loading,
    error,
    success,
    operationLoading,
    
    // Actions
    shareWithUser,
    shareWithGroup,
    revokeUserShare,
    revokeGroupShare,
    
    // Helpers
    getSharesByGroup,
    isSharedWith,
    isSharedWithGroup,
    clearAlerts,
    refetch: loadShares
  }
}