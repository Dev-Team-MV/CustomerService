// @shared/components/ResourceShare/ShareDialog.jsx
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Autocomplete,
  TextField,
  CircularProgress,
  Avatar,
  Alert,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  Chip,
  Stack
} from '@mui/material'
import {
  Close,
  Share,
  Person,
  Group,
  CheckCircle,
  Home,
  Apartment as ApartmentIcon,
  Delete
} from '@mui/icons-material'
import api from '../../services/api'
import { propertyShareService, apartmentShareService } from '../../services/resourceShareService'

/**
 * Dynamic Share Dialog - Supports two modes:
 * 
 * MODE 1: Share a known resource (from PropertyDetails/ApartmentDetails)
 *   - resourceId is provided
 *   - User selects WHO to share with (user or group)
 * 
 * MODE 2: Share with a known group (from FamilyGroupCard)
 *   - preSelectedGroup is provided
 *   - User selects WHAT resource to share
 *   - Shows members with/without access
 */
export const ShareDialog = ({
  open,
  onClose,
  resourceType = 'property', // 'property' or 'apartment'
  resourceId = null, // MODE 1: Known resource ID
  resourceName = null, // MODE 1: Known resource name
  preSelectedGroup = null, // MODE 2: Pre-selected group
  availableUsers = [],
  availableGroups = [],
  onShareWithUser,
  onShareWithGroup,
  loading = false,
  loadingUsers = false,
  loadingGroups = false
}) => {
  // Determine mode
  const isGroupMode = !!preSelectedGroup // MODE 2: Sharing with a specific group
  const isResourceMode = !!resourceId && !preSelectedGroup // MODE 1: Sharing a specific resource

  // Common state
  const [tab, setTab] = useState(isGroupMode ? 1 : 0) // Start on group tab if group mode
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(preSelectedGroup)
  const [success, setSuccess] = useState(false)

  // MODE 2 specific state (group mode)
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
  const resourceLabel = resourceType === 'apartment' ? 'Apartment' : 'Property'

  // Reset state when dialog opens/closes
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

  // MODE 2: Load user's resources when in group mode
  useEffect(() => {
    if (open && isGroupMode) {
      loadResources()
    }
  }, [open, isGroupMode])

  // MODE 2: Load shares when resource is selected
  useEffect(() => {
    if (isGroupMode && selectedResourceId) {
      loadShares(selectedResourceId)
    }
  }, [selectedResourceId, isGroupMode])

  const loadResources = async () => {
    try {
      setLoadingResources(true)
      const response = await api.get(endpoint)
      setMyResources(response.data)
      
      if (response.data.length > 0 && !selectedResourceId) {
        setSelectedResourceId(response.data[0]._id)
      }
    } catch (err) {
      console.error(`Failed to load ${resourceType}s:`, err)
      setError(`Failed to load ${resourceType}s`)
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
      console.error('Failed to load shares:', err)
      setShares([])
    } finally {
      setLoadingShares(false)
    }
  }

  // MODE 1: Share known resource
  const handleShareResourceMode = async () => {
    let result = null

    if (tab === 0 && selectedUser) {
      result = await onShareWithUser(selectedUser._id)
    } else if (tab === 1 && selectedGroup) {
      result = await onShareWithGroup(selectedGroup._id)
    }

    if (result) {
      setSuccess(true)
      setSelectedUser(null)
      setSelectedGroup(preSelectedGroup)
      
      setTimeout(() => {
        onClose()
      }, 1500)
    }
  }

  // MODE 2: Share with group
// @shared/components/ResourceShare/ShareDialog.jsx - línea 172-189

// const handleShareGroupMode = async () => {
//   if (!selectedResourceId || !preSelectedGroup) return
  
//   try {
//     setSharing(true)
//     setError(null)
    
//     // Asegurar que solo enviamos el ID, no el objeto completo
//     const groupId = preSelectedGroup._id || preSelectedGroup.id || preSelectedGroup
    
//     console.log('Sharing apartment:', selectedResourceId)
//     console.log('With group ID:', groupId)
//     console.log('Group object:', preSelectedGroup)
    
//     await service.shareWithGroup(selectedResourceId, groupId)
//     setSuccess(true)
//     loadShares(selectedResourceId)
    
//     setTimeout(() => {
//       setSuccess(false)
//     }, 3000)
//   } catch (err) {
//     console.error('Share error:', err)
//     // Mostrar error más descriptivo
//     const errorMessage = err.response?.data?.message || err.message || `Failed to share ${resourceType}`
//     setError(errorMessage)
//   } finally {
//     setSharing(false)
//   }
// }
// @shared/components/ResourceShare/ShareDialog.jsx - línea 172-203

const handleShareGroupMode = async () => {
  if (!selectedResourceId || !preSelectedGroup) return
  
  // Validar que el grupo tenga miembros
  if (!preSelectedGroup.members || preSelectedGroup.members.length === 0) {
    setError('This group has no members to share with')
    return
  }
  
  try {
    setSharing(true)
    setError(null)
    
    const groupId = preSelectedGroup._id || preSelectedGroup.id || preSelectedGroup
    
    console.log('Sharing resource:', selectedResourceId)
    console.log('With group ID:', groupId)
    console.log('Group members:', preSelectedGroup.members)
    
    // Pasar los miembros del grupo al servicio
    await service.shareWithGroup(selectedResourceId, groupId, preSelectedGroup.members)
    
    setSuccess(true)
    loadShares(selectedResourceId)
    
    setTimeout(() => {
      setSuccess(false)
    }, 3000)
  } catch (err) {
    console.error('Share error:', err)
    const errorMessage = err.response?.data?.message || err.message || `Failed to share ${resourceType}`
    setError(errorMessage)
  } finally {
    setSharing(false)
  }
}

  const handleRevokeGroup = async () => {
    if (!window.confirm(`Revoke access to this ${resourceType} for the entire group "${preSelectedGroup.name}"?`)) return
    
    try {
      setError(null)
      await service.revokeGroupShare(selectedResourceId, preSelectedGroup._id)
      setSuccess(true)
      loadShares(selectedResourceId)
      
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err.message || 'Failed to revoke group access')
    }
  }

  const handleRevokeUser = async (userId) => {
    if (!window.confirm('Revoke access for this user?')) return
    
    try {
      setError(null)
      await service.revokeUserShare(selectedResourceId, userId)
      loadShares(selectedResourceId)
    } catch (err) {
      setError(err.message || 'Failed to revoke user access')
    }
  }

  const getResourceLabel = (resource) => {
    if (resourceType === 'apartment') {
      return `${resource.apartmentModel?.model || 'Apartment'} - ${resource.number || resource.apartmentNumber || ''}`
    } else {
      const model = resource.model?.model || resource.model || ''
      const lot = resource.lot?.number || resource.number || ''
      return [model, lot && `Lot ${lot}`].filter(Boolean).join(' · ') || resource._id
    }
  }

  // Check if already shared with group (MODE 2)
  const alreadyShared = isGroupMode && shares.some((s) => s.familyGroup?._id === preSelectedGroup?._id)
  const groupShares = isGroupMode ? shares.filter((s) => s.familyGroup?._id === preSelectedGroup?._id) : []
  const sharedUserIds = groupShares.map(s => s.sharedWith?._id)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Share sx={{ color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {isGroupMode 
                  ? `Share ${resourceLabel} with ${preSelectedGroup?.name}`
                  : `Share ${resourceLabel}`
                }
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isGroupMode 
                  ? `Select which ${resourceLabel.toLowerCase()} to share`
                  : resourceName || `Share this ${resourceLabel.toLowerCase()} with users or groups`
                }
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Success/Error Messages */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={4}
          >
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Shared Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isGroupMode 
                ? `${resourceLabel} shared with ${preSelectedGroup?.name}`
                : `${resourceLabel} shared successfully`
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
                  Select {resourceLabel} to Share
                </Typography>
                <FormControl size="small" fullWidth disabled={loadingResources}>
                  <InputLabel>
                    {loadingResources ? 'Loading...' : `Choose ${resourceLabel}`}
                  </InputLabel>
                  <Select
                    value={selectedResourceId}
                    onChange={(e) => setSelectedResourceId(e.target.value)}
                    label={loadingResources ? 'Loading...' : `Choose ${resourceLabel}`}
                  >
                    {myResources.length === 0 ? (
                      <MenuItem disabled value="">
                        No {resourceLabel}s found
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
                    label="Share with User"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<Group />}
                    label="Share with Group"
                    iconPosition="start"
                  />
                </Tabs>

                {/* Share with User */}
                {tab === 0 && (
                  <Box>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Share this {resourceLabel.toLowerCase()} with a specific user
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
                          label="Select User"
                          placeholder="Search by name or email"
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
                      Share this {resourceLabel.toLowerCase()} with all members of a family group
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
                          label="Select Family Group"
                          placeholder="Search groups"
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
                              {(option.members?.length || 0) + 1} members
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
                        label={`Already shared with ${preSelectedGroup?.name}`}
                        color="success"
                      />
                      <Button
                        color="error"
                        variant="outlined"
                        size="small"
                        startIcon={<Delete />}
                        onClick={handleRevokeGroup}
                      >
                        Revoke Group
                      </Button>
                    </Stack>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<Share />}
                      onClick={handleShareGroupMode}
                      disabled={sharing}
                      fullWidth
                    >
                      {sharing ? 'Sharing...' : `Share with ${preSelectedGroup?.name}`}
                    </Button>
                  )}
                </Box>

                {/* Members with Access */}
                {groupShares.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>
                      Members with Access ({groupShares.length})
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
                                  <Button
                                    color="error"
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Delete />}
                                    onClick={() => handleRevokeUser(member.user?._id || member._id)}
                                  >
                                    Revoke
                                  </Button>
                                ) : (
                                  <Chip label="No Access" color="warning" size="small" />
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
      </DialogContent>

      {!success && (
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={loading || sharing}>
            Cancel
          </Button>
          {isResourceMode && (
            <Button
              variant="contained"
              onClick={handleShareResourceMode}
              disabled={
                loading ||
                (tab === 0 && !selectedUser) ||
                (tab === 1 && !selectedGroup)
              }
              startIcon={loading ? <CircularProgress size={16} /> : <Share />}
            >
              {loading ? 'Sharing...' : `Share ${resourceLabel}`}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  )
}

export default ShareDialog