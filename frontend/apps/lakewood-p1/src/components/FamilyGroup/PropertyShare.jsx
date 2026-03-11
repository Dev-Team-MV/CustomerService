import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, IconButton, List, ListItem,
  ListItemText, ListItemAvatar, Avatar, Chip, Divider,
  Stack, CircularProgress, Alert, Select, MenuItem,
  FormControl, InputLabel
} from '@mui/material'
import {
  Close as CloseIcon,
  Group as GroupIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Home as HomeIcon
} from '@mui/icons-material'
import familyGroupService from '../../services/familyGroup'
import api from '@shared/services/api'
import { useTranslation } from 'react-i18next'


const PropertyShareDialog = ({ open, onClose, group, currentUser }) => {
  const { t } = useTranslation('propertyShare')
  const [myProperties, setMyProperties] = useState([])
  const [shares, setShares] = useState([])
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [loadingProperties, setLoadingProperties] = useState(false)
  const [loadingShares, setLoadingShares] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (open && group) {
      loadMyProperties()
    }
  }, [open, group])

  useEffect(() => {
    if (selectedPropertyId) {
      loadShares(selectedPropertyId)
    } else {
      setShares([])
    }
  }, [selectedPropertyId])

  const loadMyProperties = async () => {
    try {
      setLoadingProperties(true)
      const response = await api.get('/properties')
      console.log('🏠 Properties raw:', response.data)
      // El backend ya devuelve solo las visibles para el usuario — las mostramos todas
      setMyProperties(response.data)
    } catch (err) {
      console.error('Failed to load properties:', err)
      setError('Failed to load properties')
    } finally {
      setLoadingProperties(false)
    }
  }

  const loadShares = async (propertyId) => {
    try {
      setLoadingShares(true)
      const data = await familyGroupService.getPropertyShares(propertyId)
      console.log('🔗 Shares for property:', data)
      setShares(data)
    } catch (err) {
      console.error('Failed to load shares:', err)
      setShares([])
    } finally {
      setLoadingShares(false)
    }
  }

  // ¿Ya está compartida esta propiedad con este grupo?
  const alreadyShared = shares.some((s) => s.familyGroup?._id === group?._id)

  // Shares que corresponden a este grupo
  const groupMembers = shares.filter((s) => s.familyGroup?._id === group?._id)

// ...existing code...

  const handleShare = async () => {
    if (!selectedPropertyId) return
    try {
      setSharing(true)
      setError(null)
      await familyGroupService.sharePropertyWithGroup(
        selectedPropertyId,
        group._id,
        group.members  // ← array con { user: { _id, ... }, role }
      )
      setSuccess(`Property shared with "${group.name}" successfully`)
      loadShares(selectedPropertyId)
    } catch (err) {
      setError(err.message || 'Failed to share property')
    } finally {
      setSharing(false)
    }
  }

// ...existing code...

  const handleRevokeGroup = async () => {
    if (!window.confirm(`Revoke access to this property for the entire group "${group.name}"?`)) return
    try {
      setError(null)
      await familyGroupService.revokePropertyFromGroup(selectedPropertyId, group._id)
      setSuccess('Group access revoked successfully')
      loadShares(selectedPropertyId)
    } catch (err) {
      setError(err.message || 'Failed to revoke group access')
    }
  }

  const handleRevokeUser = async (userId) => {
    if (!window.confirm('Revoke access for this user?')) return
    try {
      setError(null)
      await familyGroupService.revokePropertyFromUser(selectedPropertyId, userId)
      setSuccess('User access revoked successfully')
      loadShares(selectedPropertyId)
    } catch (err) {
      setError(err.message || 'Failed to revoke user access')
    }
  }

  const handleClose = () => {
    setShares([])
    setSelectedPropertyId('')
    setError(null)
    setSuccess(null)
    onClose()
  }

  // Nombre a mostrar de la propiedad
// ...existing code...

  // Nombre a mostrar de la propiedad
  const getPropertyLabel = (p) => {
    const model = p.model?.model || p.model || ''
    const lot = p.lot?.number || p.number || ''
    const modelType = p.modelType || ''

    if (model || lot) {
      return [
        model && `${model}`,
        lot && `Lot ${lot}`,
        modelType && modelType.charAt(0).toUpperCase() + modelType.slice(1)
      ]
        .filter(Boolean)
        .join(' · ')
    }

    // fallback
    return p.title || p.name || p.address || p._id
  }

// ...existing code...
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <ShareIcon sx={{ color: '#8CA551' }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}
            >
        {t('shareProperty')}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        {/* Muestra el grupo al que se va a compartir */}
        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
          <GroupIcon sx={{ fontSize: 14, color: '#8CA551' }} />
          <Typography
            variant="caption"
            sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}
          >
      {t('sharingWithGroup', { group: group?.name })}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Alerts */}
{error && <Alert severity="error" onClose={() => setError(null)}>{t(error)}</Alert>}
{success && <Alert severity="success" onClose={() => setSuccess(null)}>{t(success)}</Alert>}

          {/* Step 1: Seleccionar propiedad */}
          <Box
            sx={{
              p: 2,
              bgcolor: '#f8f9fa',
              borderRadius: 2,
              border: '1px solid rgba(0,0,0,0.06)'
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: '#333F1F', mb: 1.5, fontFamily: '"Poppins", sans-serif' }}
            >
  {t('selectPropertyToShare')}
            </Typography>

            <FormControl size="small" fullWidth disabled={loadingProperties}>
              <InputLabel>
  {loadingProperties ? t('loadingProperties') : t('chooseProperty')}
              </InputLabel>
              <Select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                label={loadingProperties ? t('loadingProperties') : t('chooseProperty')}
                sx={{ borderRadius: 2 }}
              >
                {myProperties.length === 0 ? (
                  <MenuItem disabled value="">
                    {t('noPropertiesFound')}
                  </MenuItem>
                ) : (
                  myProperties.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <HomeIcon fontSize="small" sx={{ color: '#8CA551' }} />
                        {getPropertyLabel(p)}
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>

          {/* Step 2: Share / revoke — solo si hay propiedad seleccionada */}
          {selectedPropertyId && (
            <>
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#f8f9fa',
                  borderRadius: 2,
                  border: '1px solid rgba(0,0,0,0.06)'
                }}
              >
                {alreadyShared ? (
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Chip
                      icon={<GroupIcon />}
  label={t('alreadySharedWithGroup', { group: group?.name })}
                      sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }}
                    />
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={handleRevokeGroup}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                        {t('revokeGroup')}
                    </Button>
                  </Stack>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={sharing ? null : <ShareIcon />}
                    onClick={handleShare}
                    disabled={sharing}
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      bgcolor: '#333F1F',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#8CA551' },
                    }}
                  >
                      {sharing
    ? <CircularProgress size={18} color="inherit" />
    : t('shareWithAllMembers', { group: group?.name })
  }
                  </Button>
                )}
              </Box>

              {/* Miembros con acceso */}
              {groupMembers.length > 0 && (
                <>
                  <Divider />
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}
                  >
                    {t('membersWithAccess', { count: groupMembers.length })}
                    </Typography>

                  {loadingShares ? (
                    <Box display="flex" justifyContent="center" py={1}>
                      <CircularProgress size={20} />
                    </Box>
                  ) : (
                    <List dense disablePadding>
                      {groupMembers.map((share) => (
                        <ListItem
                          key={share._id}
                          sx={{
                            bgcolor: '#f8f9fa',
                            borderRadius: 2,
                            mb: 0.5,
                            border: '1px solid rgba(0,0,0,0.05)',
                          }}
                          secondaryAction={
                            <IconButton
                              size="small"
                              onClick={() => handleRevokeUser(share.sharedWith._id)}
                              sx={{ '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' } }}
                            >
                              <DeleteIcon fontSize="small" sx={{ color: '#bbb' }} />
                            </IconButton>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: '#8CA551',
                                fontSize: '0.75rem'
                              }}
                            >
                              {share.sharedWith?.firstName?.[0]}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${share.sharedWith?.firstName} ${share.sharedWith?.lastName}`}
                            secondary={share.sharedWith?.email}
                            primaryTypographyProps={{
                              variant: 'body2',
                              fontWeight: 600,
                              fontFamily: '"Poppins", sans-serif',
                            }}
                            secondaryTypographyProps={{
                              variant: 'caption',
                              fontFamily: '"Poppins", sans-serif',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </>
              )}
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
            {t('close')}

        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PropertyShareDialog