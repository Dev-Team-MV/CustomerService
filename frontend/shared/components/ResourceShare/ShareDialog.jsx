import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Tabs, Tab, Autocomplete, TextField, CircularProgress,
  Avatar, Alert, Divider, Select, MenuItem, FormControl, InputLabel, List,
  ListItem, ListItemAvatar, Chip, Stack
} from '@mui/material'
import {
  Share, Person, Group, CheckCircle, Home, Apartment as ApartmentIcon, Delete
} from '@mui/icons-material'
import ModalWrapper from '../../constants/ModalWrapper'
import PrimaryButton from '../../constants/PrimaryButton'
import api from '../../services/api'
import { propertyShareService, apartmentShareService } from '../../services/resourceShareService'
import { useTranslation } from 'react-i18next'

export const ShareDialog = ({
  open,
  onClose,
  resourceType = 'property',
  resourceId = null,
  resourceName = null,
  preSelectedGroup = null,
  availableUsers = [],
  availableGroups = [],
  onShareWithUser,
  onShareWithGroup,
  loading = false,
  loadingUsers = false,
  loadingGroups = false
}) => {
  const { t } = useTranslation(['share', 'common', 'family'])
  const isGroupMode = !!preSelectedGroup
  const isResourceMode = !!resourceId && !preSelectedGroup

  const [tab, setTab] = useState(isGroupMode ? 1 : 0)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(preSelectedGroup)
  const [success, setSuccess] = useState(false)
  const [myResources, setMyResources] = useState([])
  const [selectedResourceId, setSelectedResourceId] = useState(resourceId || '')
  const [shares, setShares] = useState([])
  const [loadingResources, setLoadingResources] = useState(false)
  const [loadingShares, setLoadingShares] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [error, setError] = useState(null)

  const service = resourceType === 'apartment' ? apartmentShareService : propertyShareService
  const endpoint = resourceType === 'apartment' ? '/apartments' : '/properties'
  const ResourceIcon = resourceType === 'apartment' ? ApartmentIcon : Home
  const resourceLabel = t(`share:${resourceType}`, resourceType === 'apartment' ? 'Apartment' : 'Property')

  useEffect(() => {
    if (!open) {
      setTab(isGroupMode ? 1 : 0)
      setSelectedUser(null)
      setSelectedGroup(preSelectedGroup)
      setSuccess(false)
      setError(null)
      setSelectedResourceId(resourceId || '')
    }
  }, [open, preSelectedGroup, resourceId, isGroupMode])

  useEffect(() => {
    if (open && isGroupMode) loadResources()
  }, [open, isGroupMode])

  useEffect(() => {
    if (isGroupMode && selectedResourceId) loadShares(selectedResourceId)
  }, [selectedResourceId, isGroupMode])

  const loadResources = async () => {
    try {
      setLoadingResources(true)
      const response = await api.get(endpoint)
      setMyResources(response.data)
      if (response.data.length > 0 && !selectedResourceId) setSelectedResourceId(response.data[0]._id)
    } catch (err) {
      setError(t('share:loadResourcesError', 'Failed to load resources'))
    } finally {
      setLoadingResources(false)
    }
  }

  const loadShares = async (resId) => {
    try {
      setLoadingShares(true)
      const data = await service.getShares(resId)
      setShares(data)
    } catch (err) {
      setShares([])
    } finally {
      setLoadingShares(false)
    }
  }

  const handleShareResourceMode = async () => {
    let result = null
    if (tab === 0 && selectedUser) result = await onShareWithUser(selectedUser._id)
    else if (tab === 1 && selectedGroup) result = await onShareWithGroup(selectedGroup._id)
    if (result) {
      setSuccess(true)
      setSelectedUser(null)
      setSelectedGroup(preSelectedGroup)
      setTimeout(() => onClose(), 1500)
    }
  }

  const handleShareGroupMode = async () => {
    if (!selectedResourceId || !preSelectedGroup) return
    if (!preSelectedGroup.members || preSelectedGroup.members.length === 0) {
      setError(t('share:noGroupMembers', 'This group has no members to share with'))
      return
    }
    try {
      setSharing(true)
      setError(null)
      const groupId = preSelectedGroup._id || preSelectedGroup.id || preSelectedGroup
      await service.shareWithGroup(selectedResourceId, groupId, preSelectedGroup.members)
      setSuccess(true)
      loadShares(selectedResourceId)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('share:shareError', 'Failed to share resource'))
    } finally {
      setSharing(false)
    }
  }

  const handleRevokeGroup = async () => {
    if (!window.confirm(t('share:revokeGroupConfirm', { resource: resourceLabel, group: preSelectedGroup.name }, 'Revoke access to this {{resource}} for the entire group "{{group}}"?'))) return
    try {
      setError(null)
      await service.revokeGroupShare(selectedResourceId, preSelectedGroup._id)
      setSuccess(true)
      loadShares(selectedResourceId)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || t('share:revokeGroupError', 'Failed to revoke group access'))
    }
  }

  const handleRevokeUser = async (userId) => {
    if (!window.confirm(t('share:revokeUserConfirm', 'Revoke access for this user?'))) return
    try {
      setError(null)
      await service.revokeUserShare(selectedResourceId, userId)
      loadShares(selectedResourceId)
    } catch (err) {
      setError(err.message || t('share:revokeUserError', 'Failed to revoke user access'))
    }
  }

  const getResourceLabel = (resource) => {
    if (resourceType === 'apartment') {
      return `${resource.apartmentModel?.model || t('share:apartment', 'Apartment')} - ${resource.number || resource.apartmentNumber || ''}`
    } else {
      const model = resource.model?.model || resource.model || ''
      const lot = resource.lot?.number || resource.number || ''
      return [model, lot && `${t('share:lot', 'Lot')} ${lot}`].filter(Boolean).join(' · ') || resource._id
    }
  }

  // Check if already shared with group (MODE 2)
  const alreadyShared = isGroupMode && shares.some((s) => s.familyGroup?._id === preSelectedGroup?._id)
  const groupShares = isGroupMode ? shares.filter((s) => s.familyGroup?._id === preSelectedGroup?._id) : []
  const sharedUserIds = groupShares.map(s => s.sharedWith?._id)

  // --- ModalWrapper actions ---
  const actions = [
    <PrimaryButton key="cancel" onClick={onClose} variant="outlined">
      {t('common:cancel', 'Cancel')}
    </PrimaryButton>
  ]
  if (isResourceMode) {
    actions.push(
      <PrimaryButton
        key="share"
        loading={loading}
        onClick={handleShareResourceMode}
        disabled={
          loading ||
          (tab === 0 && !selectedUser) ||
          (tab === 1 && !selectedGroup)
        }
        startIcon={<Share />}
      >
        {t('share:share', { resource: resourceLabel }, 'Share {{resource}}')}
      </PrimaryButton>
    )
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={Share}
      title={
        isGroupMode
          ? t('share:shareWithGroupTitle', { resource: resourceLabel, group: preSelectedGroup?.name }, 'Share {{resource}} with {{group}}')
          : t('share:shareTitle', { resource: resourceLabel }, 'Share {{resource}}')
      }
      subtitle={
        isGroupMode
          ? t('share:selectResourceToShare', { resource: resourceLabel }, 'Select which {{resource}} to share')
          : resourceName || t('share:shareSubtitle', { resource: resourceLabel }, 'Share this {{resource}} with users or groups')
      }
      actions={actions}
      maxWidth="sm"
    >
      {/* Success/Error Messages */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {t('share:sharedSuccessfully', 'Shared Successfully!')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isGroupMode
              ? t('share:sharedWithGroup', { resource: resourceLabel, group: preSelectedGroup?.name }, '{{resource}} shared with {{group}}')
              : t('share:sharedSuccess', { resource: resourceLabel }, '{{resource}} shared successfully')
            }
          </Typography>
        </Box>
      )}

      {!success && (
        <>
          {/* MODE 2: Group Mode - Select Resource */}
          {isGroupMode && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
                {t('share:selectResourceToShare', { resource: resourceLabel }, 'Select {{resource}} to Share')}
              </Typography>
              <FormControl size="small" fullWidth disabled={loadingResources}>
                <InputLabel>
                  {loadingResources ? t('share:loading', 'Loading...') : t('share:chooseResource', { resource: resourceLabel }, 'Choose {{resource}}')}
                </InputLabel>
                <Select
                  value={selectedResourceId}
                  onChange={(e) => setSelectedResourceId(e.target.value)}
                  label={loadingResources ? t('share:loading', 'Loading...') : t('share:chooseResource', { resource: resourceLabel }, 'Choose {{resource}}')}
                >
                  {myResources.length === 0 ? (
                    <MenuItem disabled value="">
                      {t('share:noResourcesFound', { resource: resourceLabel }, 'No {{resource}}s found')}
                    </MenuItem>
                  ) : (
                    myResources.map((resource) => (
                      <MenuItem key={resource._id} value={resource._id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <ResourceIcon fontSize="small" color="secondary" />
                          {getResourceLabel(resource)}
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* MODE 1: Resource Mode - Select User or Group */}
          {isResourceMode && (
            <>
              <Tabs
                value={tab}
                onChange={(_, newValue) => setTab(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
              >
                <Tab
                  icon={<Person />}
                  label={t('share:shareWithUser', 'Share with User')}
                  iconPosition="start"
                />
                <Tab
                  icon={<Group />}
                  label={t('share:shareWithGroup', 'Share with Group')}
                  iconPosition="start"
                />
              </Tabs>

              {/* Share with User */}
              {tab === 0 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    {t('share:shareWithUserInfo', { resource: resourceLabel }, 'Share this {{resource}} with a specific user')}
                  </Alert>
                  <Autocomplete
                    value={selectedUser}
                    onChange={(_, newValue) => setSelectedUser(newValue)}
                    options={availableUsers}
                    getOptionLabel={(option) =>
                      `${option.firstName} ${option.lastName} (${option.email})`
                    }
                    loading={loadingUsers}
                    disabled={loading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('share:selectUser', 'Select User')}
                        placeholder={t('share:searchUserPlaceholder', 'Search by name or email')}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingUsers ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          )
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {option.firstName?.[0]}{option.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {option.firstName} {option.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.email}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                </Box>
              )}

              {/* Share with Group */}
              {tab === 1 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    {t('share:shareWithGroupInfo', { resource: resourceLabel }, 'Share this {{resource}} with all members of a family group')}
                  </Alert>
                  <Autocomplete
                    value={selectedGroup}
                    onChange={(_, newValue) => setSelectedGroup(newValue)}
                    options={availableGroups}
                    getOptionLabel={(option) => option.name}
                    loading={loadingGroups}
                    disabled={loading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('share:selectFamilyGroup', 'Select Family Group')}
                        placeholder={t('share:searchGroupPlaceholder', 'Search groups')}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingGroups ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          )
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          <Group />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {option.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(option.members?.length || 0) + 1} {t('share:members', 'members')}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                </Box>
              )}
            </>
          )}

          {/* MODE 2: Share/Revoke Actions and Members List */}
          {isGroupMode && selectedResourceId && (
            <>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, mb: 2 }}>
                {alreadyShared ? (
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Chip
                      icon={<Group />}
                      label={t('share:alreadySharedWithGroup', { group: preSelectedGroup?.name }, 'Already shared with {{group}}')}
                      color="success"
                    />
                    <PrimaryButton
                      color="error"
                      variant="outlined"
                      size="small"
                      startIcon={<Delete />}
                      onClick={handleRevokeGroup}
                    >
                      {t('share:revokeGroup', 'Revoke Group')}
                    </PrimaryButton>
                  </Stack>
                ) : (
                  <PrimaryButton
                    variant="contained"
                    startIcon={<Share />}
                    onClick={handleShareGroupMode}
                    disabled={sharing}
                    fullWidth
                  >
                    {sharing
                      ? t('share:sharing', 'Sharing...')
                      : t('share:shareWithGroup', { group: preSelectedGroup?.name }, 'Share with {{group}}')}
                  </PrimaryButton>
                )}
              </Box>

              {/* Members with Access */}
              {groupShares.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>
                    {t('share:membersWithAccess', { count: groupShares.length }, 'Members with Access ({{count}})')}
                  </Typography>
                  {loadingShares ? (
                    <Box display="flex" justifyContent="center" py={2}>
                      <CircularProgress size={20} />
                    </Box>
                  ) : (
                    <List dense disablePadding>
                      {preSelectedGroup.members.map((member) => {
                        const hasAccess = sharedUserIds.includes(member.user?._id || member._id)
                        return (
                          <ListItem
                            key={member.user?._id || member._id}
                            sx={{
                              bgcolor: 'grey.50',
                              borderRadius: 2,
                              mb: 0.5,
                              opacity: hasAccess ? 1 : 0.5
                            }}
                            secondaryAction={
                              hasAccess ? (
                                <PrimaryButton
                                  color="error"
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Delete />}
                                  onClick={() => handleRevokeUser(member.user?._id || member._id)}
                                >
                                  {t('share:revoke', 'Revoke')}
                                </PrimaryButton>
                              ) : (
                                <Chip label={t('share:noAccess', 'No Access')} color="warning" size="small" />
                              )
                            }
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {member.user?.firstName?.[0]}
                              </Avatar>
                            </ListItemAvatar>
                            <Typography variant="body2" fontWeight={500}>
                              {member.user?.firstName} {member.user?.lastName}
                            </Typography>
                          </ListItem>
                        )
                      })}
                    </List>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </ModalWrapper>
  )
}

export default ShareDialog