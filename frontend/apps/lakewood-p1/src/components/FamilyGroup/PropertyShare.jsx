import React, { useState, useEffect } from 'react'
import {
  Box, Typography, List, ListItem, ListItemAvatar, Avatar, Chip, Divider,
  Stack, CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel
} from '@mui/material'
import {
  Group as GroupIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Home as HomeIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import familyGroupService from '../../services/familyGroup'
import api from '@shared/services/api'
import { useTranslation } from 'react-i18next'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'

const PropertyShareDialog = ({ open, onClose, group, currentUser }) => {
  const { t } = useTranslation('familyGroup')
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
      setLoadingProperties(true)
      api.get('/properties').then(res => {
        setMyProperties(res.data)
        // Buscar shares de todas las propiedades del usuario
        Promise.all(
          res.data.map(p => familyGroupService.getPropertyShares(p._id))
        ).then(allSharesArrays => {
          // Unifica todos los shares
          const allShares = allSharesArrays.flat()
          setShares(allShares)
          // Busca si ya hay una propiedad compartida con este grupo
          const alreadySharedProperty = allShares.find(s => s.familyGroup?._id === group._id)
          if (alreadySharedProperty) {
            setSelectedPropertyId(alreadySharedProperty.property?._id || alreadySharedProperty.property)
          } else if (res.data.length > 0) {
            setSelectedPropertyId(res.data[0]._id)
          }
        }).finally(() => setLoadingProperties(false))
      })
    }
    // eslint-disable-next-line
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
    // No resetear selectedPropertyId aquí
    setError(null)
    setSuccess(null)
    onClose()
  }

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
    const groupMemberIds = group.members.map(m => m.user?._id || m._id)
  const sharesForGroup = shares.filter(s => s.familyGroup?._id === group._id)
  const sharedUserIds = sharesForGroup.map(s => s.sharedWith?._id)
  
  const membersWithAccess = group.members.filter(m => sharedUserIds.includes(m.user?._id || m._id))
  const membersWithoutAccess = group.members.filter(m => !sharedUserIds.includes(m.user?._id || m._id))
  return (
    <ModalWrapper
      open={open}
      onClose={handleClose}
      icon={ShareIcon}
      title={t('shareProperty')}
      subtitle={t('sharingWithGroup', { group: group?.name })}
      actions={
        <PrimaryButton onClick={handleClose}>
          {t('close')}
        </PrimaryButton>
      }
      maxWidth="sm"
      fullWidth
    >
      <Stack spacing={2.5} sx={{ mt: 1 }}>
        {error && <Alert severity="error" onClose={() => setError(null)}>{t(error)}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess(null)}>{t(success)}</Alert>}

        {/* Step 1: Seleccionar propiedad */}
        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
          <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
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
            >
              {myProperties.length === 0 ? (
                <MenuItem disabled value="">
                  {t('noPropertiesFound')}
                </MenuItem>
              ) : (
                myProperties.map((p) => (
                  <MenuItem key={p._id} value={p._id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <HomeIcon fontSize="small" color="secondary" />
                      {getPropertyLabel(p)}
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Box>

        {/* Step 2: Share / revoke */}
        {selectedPropertyId && (
          <>
            <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
              {alreadyShared ? (
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Chip
                    icon={<GroupIcon />}
                    label={t('alreadySharedWithGroup', { group: group?.name })}
                    color="success"
                  />
                  <PrimaryButton
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={handleRevokeGroup}
                  >
                    {t('revokeGroup')}
                  </PrimaryButton>
                </Stack>
              ) : (
                <PrimaryButton
                  variant="contained"
                  startIcon={<ShareIcon />}
                  onClick={handleShare}
                  disabled={sharing}
                  fullWidth
                  loading={sharing}
                >
                  {t('shareWithAllMembers', { group: group?.name })}
                </PrimaryButton>
              )}
            </Box>

            {/* Miembros con acceso */}
            {groupMembers.length > 0 && (
              <>
                <Divider />
                <Typography variant="subtitle2" fontWeight={600}>
                  {t('membersWithAccess', { count: groupMembers.length })}
                </Typography>
                {loadingShares ? (
                  <Box display="flex" justifyContent="center" py={1}>
                    <CircularProgress size={20} />
                  </Box>
                ) : (
                  <List dense disablePadding>
                    {group.members.map((member) => {
                      const hasAccess = sharedUserIds.includes(member.user?._id || member._id)
                      return (
                        <ListItem
                          key={member.user?._id || member._id}
                          sx={{
                            bgcolor: '#f8f9fa',
                            borderRadius: 2,
                            mb: 0.5,
                            border: '1px solid rgba(0,0,0,0.05)',
                            opacity: hasAccess ? 1 : 0.5
                          }}
                          secondaryAction={
                            hasAccess ? (
                              <PrimaryButton
                                color="error"
                                variant="outlined"
                                size="small"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleRevokeUser(member.user?._id || member._id)}
                              >
                                {t('revokeUser')}
                              </PrimaryButton>
                            ) : (
                              <Chip label={t('noAccess')} color="warning" size="small" />
                            )
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: '#8CA551', fontSize: '0.75rem' }}>
                              {member.user?.firstName?.[0] || member.firstName?.[0]}
                            </Avatar>
                          </ListItemAvatar>
                          <Typography variant="body2" fontWeight={600}>
                            {`${member.user?.firstName || member.firstName} ${member.user?.lastName || member.lastName}`}
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
      </Stack>
    </ModalWrapper>
  )
}

export default PropertyShareDialog