// @shared/components/Notifications/NotificationCreatorModal.jsx
import { useState, useEffect } from 'react' // ✅ Agregado useEffect
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Alert, Box, Chip, Typography, CircularProgress, Autocomplete
} from '@mui/material'
import { Send, Close } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import useNotifications from '@shared/hooks/useNotifications'


const NOTIFICATION_TYPES = [
  { value: 'INFO', labelKey: 'notifications.creator.typeInfo', color: '#2196f3' },
  { value: 'WARN', labelKey: 'notifications.creator.typeWarn', color: '#ff9800' },
  { value: 'ERROR', labelKey: 'notifications.creator.typeError', color: '#f44336' },
  { value: 'CUSTOM', labelKey: 'notifications.creator.typeCustom', color: '#9c27b0' }
]

const USER_ROLES = [
  { value: 'superadmin', labelKey: 'notifications.creator.roleSuperadmin' },
  { value: 'admin', labelKey: 'notifications.creator.roleAdmin' },
  { value: 'owner', labelKey: 'notifications.creator.roleOwner' },
  { value: 'user', labelKey: 'notifications.creator.roleUser' }
]

const NotificationCreatorModal = ({
  open,
  onClose,
  users = [],
  defaultMode = 'general',
  onCreated
}) => {
  const { t } = useTranslation('common')

  const {
    creating,
    error,
    success,
    createNotification,
    createForRole,
    createForUser,
    createForMultipleUsers,
    createForMultipleRoles,
    clearMessages
  } = useNotifications({ enabled: false })

  const [mode, setMode] = useState(defaultMode)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'INFO',
    audience: 'user',
    targetRoles: [],
    targetUsers: []
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) return

    const baseData = {
      title: formData.title.trim(),
      body: formData.body.trim(),
      type: formData.type
    }

    let result

    switch (mode) {
      case 'general':
        result = await createNotification({
          ...baseData,
          audience: formData.audience
        })
        break
      case 'role':
        if (formData.targetRoles.length === 0) return
        if (formData.targetRoles.length === 1) {
          result = await createForRole(formData.targetRoles[0], baseData)
        } else {
          result = await createForMultipleRoles(formData.targetRoles, baseData)
        }
        break
      case 'user':
        if (formData.targetUsers.length !== 1) return
        result = await createForUser(formData.targetUsers[0]._id, baseData)
        break
      case 'multipleUsers':
        if (formData.targetUsers.length === 0) return
        const userIds = formData.targetUsers.map(u => u._id)
        result = await createForMultipleUsers(userIds, baseData)
        break
      default:
        return
    }

    if (result.success) {
      if (onCreated) onCreated(result.data)
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      body: '',
      type: 'INFO',
      audience: 'user',
      targetRoles: [],
      targetUsers: []
    })
    setMode(defaultMode)
    clearMessages()
    onClose()
  }

  const getTypeColor = (type) => {
    const typeConfig = NOTIFICATION_TYPES.find(t => t.value === type)
    return typeConfig?.color || '#2196f3'
  }

   // ✅ NUEVO: Escuchar el evento para cerrar el modal cuando el tour termine
  useEffect(() => {
    const handleTourResume = () => {
      handleClose() // Esto ejecutará la lógica de limpieza y llamará a onClose()
    }
    window.addEventListener('tour-resume-notification-creator', handleTourResume)
    return () => window.removeEventListener('tour-resume-notification-creator', handleTourResume)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Send sx={{ color: 'primary.main' }} />
          <Typography variant="h6">{t('notifications.creator.title')}</Typography>
        </Box>
        <Button onClick={handleClose} size="small" startIcon={<Close />}>
          {t('notifications.creator.close')}
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {/* ... (Alerts de error/success se mantienen igual) ... */}

          {/* ✅ ID: Modo de destinatarios */}
          <FormControl id="notif-creator-mode" fullWidth>
            <InputLabel>{t('notifications.creator.recipients')}</InputLabel>
            <Select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              label={t('notifications.creator.recipients')}
              disabled={creating}
            >
              <MenuItem value="general">{t('notifications.creator.modeGeneral')}</MenuItem>
              <MenuItem value="role">{t('notifications.creator.modeRole')}</MenuItem>
              <MenuItem value="user">{t('notifications.creator.modeUser')}</MenuItem>
              <MenuItem value="multipleUsers">{t('notifications.creator.modeMultipleUsers')}</MenuItem>
            </Select>
          </FormControl>

          {/* ✅ ID: Título */}
          <TextField
            id="notif-creator-title"
            label={t('notifications.creator.titleLabel')}
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            fullWidth
            required
            disabled={creating}
            placeholder={t('notifications.creator.titlePlaceholder')}
          />

          {/* ✅ ID: Cuerpo del mensaje */}
          <TextField
            id="notif-creator-body"
            label={t('notifications.creator.bodyLabel')}
            value={formData.body}
            onChange={(e) => handleChange('body', e.target.value)}
            fullWidth
            multiline
            rows={4}
            disabled={creating}
            placeholder={t('notifications.creator.bodyPlaceholder')}
          />

          {/* ✅ ID: Tipo de notificación */}
          <FormControl id="notif-creator-type" fullWidth>
            <InputLabel>{t('notifications.creator.typeLabel')}</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              label={t('notifications.creator.typeLabel')}
              disabled={creating}
            >
              {NOTIFICATION_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: type.color }} />
                    {t(type.labelKey)}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* ✅ ID: Audiencia dinámica (Roles o Usuarios) */}
          <Box id="notif-creator-audience">
            {mode === 'general' && (
              <FormControl fullWidth>
                <InputLabel>{t('notifications.creator.audienceLabel')}</InputLabel>
                <Select
                  value={formData.audience}
                  onChange={(e) => handleChange('audience', e.target.value)}
                  label={t('notifications.creator.audienceLabel')}
                  disabled={creating}
                >
                  {USER_ROLES.map((role) => (
                    <MenuItem key={role.value} value={role.value}>{t(role.labelKey)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {mode === 'role' && (
              <FormControl fullWidth>
                <Autocomplete
                  multiple
                  options={USER_ROLES}
                  getOptionLabel={(option) => t(option.labelKey)}
                  value={USER_ROLES.filter(r => formData.targetRoles.includes(r.value))}
                  onChange={(e, newValue) => handleChange('targetRoles', newValue.map(r => r.value))}
                  disabled={creating}
                  renderInput={(params) => (
                    <TextField {...params} label={t('notifications.creator.rolesLabel')} placeholder={t('notifications.creator.rolesPlaceholder')} />
                  )}
                  renderTags={(value, getTagProps) => value.map((option, index) => (
                    <Chip label={t(option.labelKey)} {...getTagProps({ index })} size="small" color="primary" />
                  ))}
                />
              </FormControl>
            )}

            {(mode === 'user' || mode === 'multipleUsers') && (
              <FormControl fullWidth>
                <Autocomplete
                  multiple={mode === 'multipleUsers'}
                  options={users}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email})`}
                  value={mode === 'user' ? formData.targetUsers[0] || null : formData.targetUsers}
                  onChange={(e, newValue) => handleChange('targetUsers', mode === 'user' ? [newValue] : newValue)}
                  disabled={creating}
                  loading={users.length === 0}
                  renderInput={(params) => (
                    <TextField {...params} label={mode === 'user' ? t('notifications.creator.userLabel') : t('notifications.creator.usersLabel')} placeholder={mode === 'user' ? t('notifications.creator.userPlaceholder') : t('notifications.creator.usersPlaceholder')} />
                  )}
                  renderTags={(value, getTagProps) => value.map((option, index) => (
                    <Chip label={`${option.firstName} ${option.lastName}`} {...getTagProps({ index })} size="small" color="primary" />
                  ))}
                />
              </FormControl>
            )}
          </Box>

          {/* ✅ ID: Vista previa */}
          <Box id="notif-creator-preview" sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              {t('notifications.creator.preview')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getTypeColor(formData.type) }} />
              <Typography variant="body2" fontWeight={600}>
                {formData.title || t('notifications.creator.titleExample')}
              </Typography>
            </Box>
            {formData.body && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 2 }}>
                {formData.body}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      {/* ✅ ID: Acciones finales */}
      <DialogActions id="notif-creator-actions" sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" disabled={creating}>
          {t('notifications.creator.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={creating ? <CircularProgress size={20} /> : <Send />}
          disabled={creating || !formData.title.trim()}
        >
          {creating ? t('notifications.creator.sending') : t('notifications.creator.send')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default NotificationCreatorModal