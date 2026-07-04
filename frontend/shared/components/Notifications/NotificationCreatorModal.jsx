// @shared/components/Notifications/NotificationCreatorModal.jsx
import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Box,
  Chip,
  Typography,
  CircularProgress,
  Autocomplete
} from '@mui/material'
import { Send, Close } from '@mui/icons-material'
// ✅ IMPORTAR DESDE useNotifications
import useNotifications from '@shared/hooks/useNotifications'

const NOTIFICATION_TYPES = [
  { value: 'INFO', label: 'Información', color: '#2196f3' },
  { value: 'WARN', label: 'Advertencia', color: '#ff9800' },
  { value: 'ERROR', label: 'Error', color: '#f44336' },
  { value: 'CUSTOM', label: 'Personalizado', color: '#9c27b0' }
]

const USER_ROLES = [
  { value: 'superadmin', label: 'Super Administrador' },
  { value: 'admin', label: 'Administrador' },
  { value: 'owner', label: 'Propietario' },
  { value: 'user', label: 'Usuario' }
]

const NotificationCreatorModal = ({
  open,
  onClose,
  users = [],
  defaultMode = 'general',
  onCreated
}) => {
  // ✅ USAR useNotifications CON enabled: false (solo para crear)
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
  } = useNotifications({ enabled: false }) // ✅ enabled: false porque solo creamos

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
    if (!formData.title.trim()) {
      return
    }

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
        if (formData.targetRoles.length === 0) {
          return
        }
        if (formData.targetRoles.length === 1) {
          result = await createForRole(formData.targetRoles[0], baseData)
        } else {
          result = await createForMultipleRoles(formData.targetRoles, baseData)
        }
        break

      case 'user':
        if (formData.targetUsers.length !== 1) {
          return
        }
        result = await createForUser(formData.targetUsers[0]._id, baseData)
        break

      case 'multipleUsers':
        if (formData.targetUsers.length === 0) {
          return
        }
        const userIds = formData.targetUsers.map(u => u._id)
        result = await createForMultipleUsers(userIds, baseData)
        break

      default:
        return
    }

    if (result.success) {
      if (onCreated) {
        onCreated(result.data)
      }
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Send sx={{ color: 'primary.main' }} />
          <Typography variant="h6">Crear Notificación</Typography>
        </Box>
        <Button onClick={handleClose} size="small" startIcon={<Close />}>
          Cerrar
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {error && (
            <Alert severity="error" onClose={clearMessages}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" onClose={clearMessages}>
              {success}
            </Alert>
          )}

          <FormControl fullWidth>
            <InputLabel>Destinatarios</InputLabel>
            <Select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              label="Destinatarios"
              disabled={creating}
            >
              <MenuItem value="general">General (todos los usuarios)</MenuItem>
              <MenuItem value="role">Por Rol</MenuItem>
              <MenuItem value="user">Usuario Específico</MenuItem>
              <MenuItem value="multipleUsers">Múltiples Usuarios</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Título"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            fullWidth
            required
            disabled={creating}
            placeholder="Título de la notificación"
          />

          <TextField
            label="Mensaje"
            value={formData.body}
            onChange={(e) => handleChange('body', e.target.value)}
            fullWidth
            multiline
            rows={4}
            disabled={creating}
            placeholder="Contenido de la notificación (opcional)"
          />

          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              label="Tipo"
              disabled={creating}
            >
              {NOTIFICATION_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: type.color
                      }}
                    />
                    {type.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {mode === 'general' && (
            <FormControl fullWidth>
              <InputLabel>Audiencia</InputLabel>
              <Select
                value={formData.audience}
                onChange={(e) => handleChange('audience', e.target.value)}
                label="Audiencia"
                disabled={creating}
              >
                {USER_ROLES.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {mode === 'role' && (
            <FormControl fullWidth>
              <Autocomplete
                multiple
                options={USER_ROLES}
                getOptionLabel={(option) => option.label}
                value={USER_ROLES.filter(r => formData.targetRoles.includes(r.value))}
                onChange={(e, newValue) => {
                  handleChange('targetRoles', newValue.map(r => r.value))
                }}
                disabled={creating}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Roles"
                    placeholder="Selecciona roles"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.label}
                      {...getTagProps({ index })}
                      size="small"
                      color="primary"
                    />
                  ))
                }
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
                onChange={(e, newValue) => {
                  handleChange('targetUsers', mode === 'user' ? [newValue] : newValue)
                }}
                disabled={creating}
                loading={users.length === 0}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={mode === 'user' ? 'Usuario' : 'Usuarios'}
                    placeholder={mode === 'user' ? 'Selecciona un usuario' : 'Selecciona usuarios'}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={`${option.firstName} ${option.lastName}`}
                      {...getTagProps({ index })}
                      size="small"
                      color="primary"
                    />
                  ))
                }
              />
            </FormControl>
          )}

          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Vista previa:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: getTypeColor(formData.type)
                }}
              />
              <Typography variant="body2" fontWeight={600}>
                {formData.title || 'Título de ejemplo'}
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

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" disabled={creating}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={creating ? <CircularProgress size={20} /> : <Send />}
          disabled={creating || !formData.title.trim()}
        >
          {creating ? 'Enviando...' : 'Enviar Notificación'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default NotificationCreatorModal