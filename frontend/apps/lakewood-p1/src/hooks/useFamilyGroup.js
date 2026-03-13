import { useState, useEffect, useCallback } from 'react'
import familyGroupService from '../services/familyGroup'
import { useAuth } from '../context/AuthContext'

export const useFamilyGroup = () => {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true)
      const data = await familyGroupService.getFamilyGroups()
      setGroups(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load family groups')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCreateGroup = useCallback(async (groupName, closeModal) => {
    if (!groupName.trim()) {
      setError('Group name is required')
      return
    }
    try {
      await familyGroupService.createFamilyGroup(groupName)
      setSuccess('Family group created successfully')
      closeModal()
      loadGroups()
    } catch (err) {
      setError(err.message || 'Failed to create group')
    }
  }, [loadGroups])

  const handleAddMember = useCallback(async (group, user, role, closeModal) => {
    if (!user) {
      setError('Please select a user')
      return
    }
    try {
      await familyGroupService.addMemberToGroup(
        group._id,
        user._id,
        role
      )
      setSuccess('Member added successfully')
      closeModal()
      loadGroups()
    } catch (err) {
      setError(err.message || 'Failed to add member')
    }
  }, [loadGroups])

  const handleRemoveMember = useCallback(async (groupId, userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return
    try {
      await familyGroupService.removeMemberFromGroup(groupId, userId)
      setSuccess('Member removed successfully')
      loadGroups()
    } catch (err) {
      setError(err.message || 'Failed to remove member')
    }
  }, [loadGroups])

  const handleDeleteGroup = useCallback(async (groupId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this group? This will remove all shared properties.'
      )
    )
      return
    try {
      await familyGroupService.deleteFamilyGroup(groupId)
      setSuccess('Family group deleted successfully')
      loadGroups()
    } catch (err) {
      setError(err.message || 'Failed to delete group')
    }
  }, [loadGroups])

  const isGroupAdmin = useCallback((group) => {
    if (user?.role === 'superadmin') return true
    if (group.createdBy._id === user?._id) return true
    return group.members.some(
      (m) => m.user._id === user?._id && m.role === 'admin'
    )
  }, [user])

  const clearAlerts = () => {
    setError(null)
    setSuccess(null)
  }

  return {
    groups,
    loading,
    error,
    success,
    handleCreateGroup,
    handleAddMember,
    handleRemoveMember,
    handleDeleteGroup,
    isGroupAdmin,
    clearAlerts,
  }
}