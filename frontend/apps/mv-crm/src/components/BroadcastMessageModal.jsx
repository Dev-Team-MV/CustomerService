// frontend/apps/mv-crm/src/components/clients/BroadcastMessageModal.jsx
import { useState, useMemo, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Chip,
  Avatar,
  Autocomplete,
  Paper,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Close,
  Send,
  Sms,
  Email,
  People,
  PersonAdd,
  UploadFile,
  Delete,
  CheckCircle
} from '@mui/icons-material'

const BroadcastMessageModal = ({ 
  open, 
  onClose, 
  users = [],
  onSend 
}) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    sendSms: false,
    sendEmail: false,
    sendToAll: false,
    selectedUsers: []
  })
  const [uploadedFile, setUploadedFile] = useState(null)
  const [sending, setSending] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const fileInputRef = useRef(null)

  // Filtrar usuarios para el autocomplete
  const filteredUsers = useMemo(() => {
    if (!searchInput.trim()) return users
    const q = searchInput.toLowerCase()
    return users.filter(u =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phoneNumber?.includes(q)
    )
  }, [users, searchInput])

  // Transformar usuarios al formato del chip
  const userOptions = useMemo(() => {
    return filteredUsers.map(u => ({
      _id: u._id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      email: u.email,
      phone: u.phoneNumber || ''
    }))
  }, [filteredUsers])

  // Manejar carga de archivo
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const validTypes = ['text/plain', 'text/html', 'text/htm']
    const validExtensions = ['.txt', '.html', '.htm']
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))

    if (!validTypes.includes(file.type) && !hasValidExtension) {
      alert('Solo se permiten archivos .txt o .html')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setFormData(prev => ({ ...prev, content: e.target.result }))
      setUploadedFile(file.name)
    }
    reader.readAsText(file)
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setFormData(prev => ({ ...prev, content: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Manejar selección de usuarios
  const handleUserSelect = (_, newValue) => {
    setFormData(prev => ({ ...prev, selectedUsers: newValue }))
  }

  const handleRemoveUser = (userId) => {
    setFormData(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.filter(u => u._id !== userId)
    }))
  }

  // Validación
  const isValid = useMemo(() => {
    const hasChannel = formData.sendSms || formData.sendEmail
    const hasRecipients = formData.sendToAll || formData.selectedUsers.length > 0
    const hasContent = formData.content.trim().length > 0
    return hasChannel && hasRecipients && hasContent
  }, [formData])

  // Conteo de destinatarios
  const recipientCount = formData.sendToAll 
    ? users.length 
    : formData.selectedUsers.length

  // Enviar
  const handleSend = async () => {
    if (!isValid) return
    setSending(true)
    try {
      await onSend?.({
        title: formData.title,
        content: formData.content,
        channels: {
          sms: formData.sendSms,
          email: formData.sendEmail
        },
        recipients: formData.sendToAll 
          ? users.map(u => u._id) 
          : formData.selectedUsers.map(u => u._id),
        sendToAll: formData.sendToAll
      })
      // Reset y cerrar
      handleClose()
    } catch (err) {
      console.error('Error sending:', err)
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      sendSms: false,
      sendEmail: false,
      sendToAll: false,
      selectedUsers: []
    })
    setUploadedFile(null)
    setSearchInput('')
    onClose()
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Send color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Enviar Mensaje Masivo
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={3}>
          
          {/* Sección: Canal de envío */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Canal de envío
            </Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.sendSms}
                    onChange={(e) => setFormData(prev => ({ ...prev, sendSms: e.target.checked }))}
                    icon={<Sms color="disabled" />}
                    checkedIcon={<Sms color="primary" />}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography>SMS</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.sendEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, sendEmail: e.target.checked }))}
                    icon={<Email color="disabled" />}
                    checkedIcon={<Email color="primary" />}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography>Correo electrónico</Typography>
                  </Box>
                }
              />
            </FormGroup>
            {!formData.sendSms && !formData.sendEmail && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Selecciona al menos un canal de envío
              </Alert>
            )}
          </Box>

          <Divider />

          {/* Sección: Destinatarios */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Destinatarios
            </Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.sendToAll}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      sendToAll: e.target.checked,
                      selectedUsers: e.target.checked ? [] : prev.selectedUsers
                    }))}
                    icon={<People color="disabled" />}
                    checkedIcon={<People color="success" />}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography>Enviar a todos</Typography>
                    <Chip label={`${users.length} usuarios`} size="small" />
                  </Box>
                }
              />
            </FormGroup>

            {/* Selector de usuarios específicos */}
            {!formData.sendToAll && (
              <Box mt={2}>
                <Autocomplete
                  multiple
                  options={userOptions}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, val) => option._id === val?._id}
                  value={formData.selectedUsers}
                  onChange={handleUserSelect}
                  onInputChange={(_, newInput) => setSearchInput(newInput)}
                  disableCloseOnSelect
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Buscar y seleccionar usuarios"
                      placeholder="Nombre, email o teléfono..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <PersonAdd sx={{ ml: 1, mr: 0.5, color: '#757575' }} />
                            {params.InputProps.startAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  renderOption={(props, option, { selected }) => (
                    <Box 
                      component="li" 
                      {...props} 
                      key={option._id}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5,
                        bgcolor: selected ? '#e3f2fd' : 'transparent'
                      }}
                    >
                      <Checkbox checked={selected} size="small" />
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#2196f3' }}>
                        {option.name?.charAt(0)}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={500}>{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email} {option.phone && `• ${option.phone}`}
                        </Typography>
                      </Box>
                      {selected && <CheckCircle color="primary" fontSize="small" />}
                    </Box>
                  )}
                  renderTags={() => null}
                />

                {/* Chips de usuarios seleccionados */}
                {formData.selectedUsers.length > 0 && (
                  <Paper variant="outlined" sx={{ mt: 2, p: 1.5, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" mb={1} display="block">
                      {formData.selectedUsers.length} usuario(s) seleccionado(s)
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {formData.selectedUsers.map(user => (
                        <Chip
                          key={user._id}
                          avatar={<Avatar>{user.name?.charAt(0)}</Avatar>}
                          label={user.name}
                          onDelete={() => handleRemoveUser(user._id)}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Paper>
                )}
              </Box>
            )}
          </Box>

          <Divider />

          {/* Sección: Contenido del mensaje */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Contenido del mensaje
            </Typography>

            {/* Título (opcional, principalmente para email) */}
            {formData.sendEmail && (
              <TextField
                label="Asunto del correo"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                fullWidth
                sx={{ mb: 2 }}
                placeholder="Asunto del correo electrónico..."
              />
            )}

            {/* Área de contenido */}
            <TextField
              label="Mensaje"
              value={formData.content}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, content: e.target.value }))
                setUploadedFile(null)
              }}
              fullWidth
              multiline
              rows={6}
              placeholder="Escribe el contenido del mensaje aquí..."
              helperText={
                formData.sendSms && formData.content.length > 0
                  ? `${formData.content.length} caracteres (SMS: ~${Math.ceil(formData.content.length / 160)} mensaje(s))`
                  : ''
              }
            />

            {/* Carga de archivo */}
            <Box mt={2} display="flex" alignItems="center" gap={2}>
              <input
                type="file"
                accept=".txt,.html,.htm"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                ref={fileInputRef}
              />
              <Button
                variant="outlined"
                startIcon={<UploadFile />}
                onClick={() => fileInputRef.current?.click()}
                size="small"
              >
                Cargar archivo (.txt, .html)
              </Button>
              {uploadedFile && (
                <Chip
                  label={uploadedFile}
                  onDelete={handleRemoveFile}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Box>

        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Box>
          {recipientCount > 0 && (formData.sendSms || formData.sendEmail) && (
            <Typography variant="body2" color="text.secondary">
              Se enviará a <strong>{recipientCount}</strong> destinatario(s) por{' '}
              {[
                formData.sendSms && 'SMS',
                formData.sendEmail && 'Email'
              ].filter(Boolean).join(' y ')}
            </Typography>
          )}
        </Box>
        <Box display="flex" gap={1}>
          <Button onClick={handleClose} disabled={sending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={!isValid || sending}
            startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <Send />}
          >
            {sending ? 'Enviando...' : 'Enviar mensaje'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default BroadcastMessageModal