import { useState, useEffect, useCallback } from 'react'
import familyGroupService from '../services/familyGroup'
import { useAuth } from '@shared/context/AuthContext'
import { useTranslation } from 'react-i18next'

export const useFamilyGroup = () => {
  const { t } = useTranslation('FamilyGroup')
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
      setError(t('failedToLoadGroups'))
    } finally {
      setLoading(false)
    }
  }, [t])

  const handleCreateGroup = useCallback(async (groupName, closeModal) => {
    if (!groupName.trim()) {
      setError(t('groupNameRequired'))
      return
    }
    try {
      await familyGroupService.createFamilyGroup(groupName)
      setSuccess(t('groupCreatedSuccess'))
      closeModal()
      loadGroups()
    } catch (err) {
      setError(t('failedToCreateGroup'))
    }
  }, [loadGroups, t])

  const handleAddMember = useCallback(async (group, userToAdd, role, closeModal) => {
    if (!userToAdd) {
      setError(t('pleaseSelectUser'))
      return
    }
    try {
      await familyGroupService.addMemberToGroup(
        group._id,
        userToAdd._id,
        role
      )
      setSuccess(t('memberAddedSuccess'))
      closeModal()
      loadGroups()
    } catch (err) {
      setError(t('failedToAddMember'))
    }
  }, [loadGroups, t])

  const handleRemoveMember = useCallback(async (groupId, userId) => {
    if (!window.confirm(t('confirmRemoveMember'))) return
    try {
      await familyGroupService.removeMemberFromGroup(groupId, userId)
      setSuccess(t('memberRemovedSuccess'))
      loadGroups()
    } catch (err) {
      setError(t('failedToRemoveMember'))
    }
  }, [loadGroups, t])

  const handleDeleteGroup = useCallback(async (groupId) => {
    if (
      !window.confirm(
        t('confirmDeleteGroup')
      )
    )
      return
    try {
      await familyGroupService.deleteFamilyGroup(groupId)
      setSuccess(t('groupDeletedSuccess'))
      loadGroups()
    } catch (err) {
      setError(t('failedToDeleteGroup'))
    }
  }, [loadGroups, t])

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