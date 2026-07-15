// apps/mv-crm/src/components/sms/BroadcastMessageModal.jsx
import { useState, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  CircularProgress,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import {
  Close,
  Send,
  Sms,
  Email,
  People,
  PersonAdd,
  CheckCircle,
  Error as ErrorIcon,
  Info,
  FilterList
} from '@mui/icons-material'
import messageTemplateService from '../services/messageTemplateService'
import VariableInserter from '@shared/components/VariableInserter'

const GLOBAL_VARIABLES = [
  { key: 'firstName', label: 'firstName' },
  { key: 'lastName', label: 'lastName' },
  { key: 'email', label: 'email' },
  { key: 'phoneNumber', label: 'phoneNumber' }
]

const BroadcastMessageModal = ({ 
  open, 
  onClose, 
  users = [],
  projects = [],
  onSend 
}) => {
  const { t } = useTranslation('sms')
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    sendSms: false,
    sendEmail: false,
    sendToAll: false,
    selectedUsers: [],
    projectId: ''
  })
  const [sending, setSending] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0 })
  const [results, setResults] = useState(null)
  const fileInputRef = useRef(null)
  const contentRef = useRef(null)

  const [templates, setTemplates] = useState([])
  const [allTemplates, setAllTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [loadingTemplates, setLoadingTemplates] = useState(false)

  const selectedProjectName = projects.find(p => p._id === formData.projectId)?.name || ''

  // ✅ NUEVO: Filtrar usuarios por proyecto seleccionado CON LOGS
  const usersByProject = useMemo(() => {
    console.log('🔍 usersByProject - Calculando...')
    console.log('  - Total users recibidos:', users.length)
    console.log('  - projectId seleccionado:', formData.projectId)
    
    if (!formData.projectId) {
      console.log('  - Sin proyecto seleccionado, retornando todos los usuarios')
      return users
    }
    
    const filtered = users.filter(user => {
      // Verificar si el usuario tiene el proyecto en su array de projects
      if (Array.isArray(user.projects)) {
        const hasProject = user.projects.some(p => {
          const projectId = typeof p === 'object' ? p._id : p
          const match = projectId === formData.projectId
          if (match) {
            console.log(`  ✅ Usuario ${user.firstName} ${user.lastName} MATCH con proyecto`)
          }
          return match
        })
        return hasProject
      }
      console.log(`  ❌ Usuario ${user.firstName} ${user.lastName} NO tiene array projects`)
      return false
    })
    
    console.log('  - Usuarios filtrados:', filtered.length)
    return filtered
  }, [users, formData.projectId])

  // ✅ NUEVO: Log cuando cambia el proyecto
  useEffect(() => {
    console.log('🔄 Proyecto seleccionado:', formData.projectId)
    console.log('📊 Usuarios en proyecto:', usersByProject.length)
  }, [formData.projectId, usersByProject])

  // ✅ NUEVO: Estadísticas de filtrado
  const filterStats = useMemo(() => {
    const total = users.length
    const filtered = usersByProject.length
    const withPhone = usersByProject.filter(u => u.phoneNumber?.startsWith('+')).length
    
    return {
      total,
      filtered,
      withPhone,
      isFiltered: !!formData.projectId
    }
  }, [users, usersByProject, formData.projectId])

  const filteredTemplates = useMemo(() => {
    if (!formData.projectId) return allTemplates
    
    return allTemplates.filter(template => {
      if (!template.projectId) return true
      
      const templateProjectId = typeof template.projectId === 'object' 
        ? template.projectId._id 
        : template.projectId
      return templateProjectId === formData.projectId
    })
  }, [allTemplates, formData.projectId])

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true)
      try {
        const data = await messageTemplateService.getAll()
        setAllTemplates(data || [])
      } catch (err) {
        console.error('Error loading templates:', err)
      } finally {
        setLoadingTemplates(false)
      }
    }
    if (open) {
      fetchTemplates()
    }
  }, [open])

  useEffect(() => {
    if (selectedTemplate && formData.projectId) {
      const templateProjectId = typeof selectedTemplate.projectId === 'object'
        ? selectedTemplate.projectId._id
        : selectedTemplate.projectId
      
      if (templateProjectId && templateProjectId !== formData.projectId) {
        setSelectedTemplate(null)
      }
    }
  }, [formData.projectId, selectedTemplate])

  useEffect(() => {
    if (formData.projectId && formData.selectedUsers.length > 0) {
      const validUsers = formData.selectedUsers.filter(user => {
        if (Array.isArray(user.projects)) {
          return user.projects.some(p => {
            const projectId = typeof p === 'object' ? p._id : p
            return projectId === formData.projectId
          })
        }
        return false
      })
      
      if (validUsers.length !== formData.selectedUsers.length) {
        setFormData(prev => ({ ...prev, selectedUsers: validUsers }))
      }
    }
  }, [formData.projectId, formData.selectedUsers])

  const detectedVariables = useMemo(() => {
    const matches = formData.content.match(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g) || []
    return [...new Set(matches.map(m => m.replace(/[{}]/g, '').trim()))]
  }, [formData.content])

  const availableVariables = useMemo(() => {
    if (formData.projectId) {
      return []
    }
    return GLOBAL_VARIABLES.map(v => ({
      ...v,
      example: v.key === 'firstName' ? 'Juan' 
              : v.key === 'lastName' ? 'Pérez'
              : v.key === 'email' ? 'juan@email.com'
              : '+521555...'
    }))
  }, [formData.projectId])

  const filteredUsers = useMemo(() => {
    if (!searchInput.trim()) return usersByProject
    const q = searchInput.toLowerCase()
    return usersByProject.filter(u =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phoneNumber?.includes(q)
    )
  }, [usersByProject, searchInput])

const userOptions = useMemo(() => {
  return filteredUsers.map(u => ({
    _id: u._id,
    name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
    email: u.email,
    phone: u.phoneNumber || '',
    firstName: u.firstName,
    lastName: u.lastName,
    // ✅ AGREGAR: Mantener referencia al usuario original
    projects: u.projects,
    phoneNumber: u.phoneNumber,
    lots: u.lots
  }))
}, [filteredUsers])

  const usersWithValidPhone = useMemo(() => {
    const targetUsers = formData.sendToAll 
      ? usersByProject 
      : usersByProject.filter(u => formData.selectedUsers.some(s => s._id === u._id))
    return targetUsers.filter(u => u.phoneNumber?.startsWith('+'))
  }, [usersByProject, formData.sendToAll, formData.selectedUsers])

  const handleUserSelect = (_, newValue) => {
    setFormData(prev => ({ ...prev, selectedUsers: newValue }))
  }

  const handleRemoveUser = (userId) => {
    setFormData(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.filter(u => u._id !== userId)
    }))
  }

  const handleApplyTemplate = (template) => {
    if (!template) return
    setFormData(prev => ({
      ...prev,
      content: template.template,
      title: template.name
    }))
    setSelectedTemplate(template)
  }

  const handleInsertVariable = (varName) => {
    const textarea = contentRef.current?.querySelector('textarea')
    const currentContent = formData.content || ''
    
    if (!textarea) {
      setFormData(prev => ({
        ...prev,
        content: currentContent + `{{${varName}}}`
      }))
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const insertion = `{{${varName}}}`
    
    const newText = currentContent.substring(0, start) + insertion + currentContent.substring(end)
    setFormData(prev => ({ ...prev, content: newText }))
    
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + insertion.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const isValid = useMemo(() => {
    const hasChannel = formData.sendSms || formData.sendEmail
    const hasRecipients = formData.sendToAll || formData.selectedUsers.length > 0
    const hasContent = formData.content.trim().length > 0
    return hasChannel && hasRecipients && hasContent
  }, [formData])

  const recipientCount = formData.sendToAll 
    ? usersByProject.length 
    : formData.selectedUsers.length

  const messagePreview = useMemo(() => {
    if (!formData.content || detectedVariables.length === 0) return null
    
    let preview = formData.content
    availableVariables.forEach(v => {
      const regex = new RegExp(`\\{\\{\\s*${v.key}\\s*\\}\\}`, 'g')
      preview = preview.replace(regex, `[${v.example}]`)
    })
    return preview
  }, [formData.content, detectedVariables, availableVariables])

  const handleSend = async () => {
    if (!isValid) return
    setSending(true)
    setProgress({ current: 0, total: recipientCount, percent: 0 })
    setResults(null)

    try {
      const sendResults = await onSend?.({
        title: formData.title,
        content: formData.content,
        projectId: formData.projectId || null,
        channels: {
          sms: formData.sendSms,
          email: formData.sendEmail
        },
        recipients: formData.sendToAll 
          ? usersByProject.map(u => u._id) 
          : formData.selectedUsers.map(u => u._id),
        sendToAll: formData.sendToAll,
        hasTemplateVariables: detectedVariables.length > 0
      }, (prog) => {
        setProgress(prog)
      })

      setResults(sendResults)
    } catch (err) {
      console.error('Error sending:', err)
      setResults({ success: [], failed: [{ error: err.message }] })
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    if (sending) return
    setFormData({
      title: '',
      content: '',
      sendSms: false,
      sendEmail: false,
      sendToAll: false,
      selectedUsers: [],
      projectId: ''
    })
    setSearchInput('')
    setProgress({ current: 0, total: 0, percent: 0 })
    setResults(null)
    setSelectedTemplate(null)
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
              {t('sms.title')}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small" disabled={sending}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {results && (
          <Alert 
            severity={results.failed?.length > 0 ? 'warning' : 'success'}
            sx={{ mb: 3 }}
            onClose={() => setResults(null)}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              {t('sms.results.title')}
            </Typography>
            <Box display="flex" gap={2} mt={1}>
              <Chip 
                icon={<CheckCircle />} 
                label={`${results.success?.length || 0} ${t('sms.results.sent')}`} 
                color="success" 
                size="small" 
              />
              {results.failed?.length > 0 && (
                <Chip 
                  icon={<ErrorIcon />} 
                  label={`${results.failed.length} ${t('sms.results.failed')}`} 
                  color="error" 
                  size="small" 
                />
              )}
            </Box>
          </Alert>
        )}

        {sending && (
          <Box sx={{ mb: 3 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                {t('sms.progress.sending')}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {progress.current}/{progress.total}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress.percent} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        <Box display="flex" flexDirection="column" gap={3}>
          
          {/* Selector de Proyecto */}
          {projects.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                {t('sms.project.title', 'Proyecto (opcional)')}
              </Typography>
              <FormControl size="small" fullWidth>
                <InputLabel>{t('sms.project.label', 'Seleccionar proyecto')}</InputLabel>
                <Select
                  value={formData.projectId}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                  label={t('sms.project.label', 'Seleccionar proyecto')}
                  disabled={sending}
                >
                  <MenuItem value="">
                    <em>{t('sms.project.global', 'Sin proyecto (global)')}</em>
                  </MenuItem>
                  {projects.map(project => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Banner informativo con estadísticas */}
              {formData.projectId && (
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.5,
                    bgcolor: '#e8f5e9',
                    borderRadius: 1,
                    border: '1px solid #4caf50',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Info sx={{ fontSize: 16, color: '#2e7d32' }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#2e7d32',
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      {t('sms.project.active', 'Mensaje vinculado al proyecto: {{projectName}}', { projectName: selectedProjectName })}
                    </Typography>
                  </Box>
                  
                  {/* Estadísticas de filtrado */}
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip
                      icon={<FilterList sx={{ fontSize: 14 }} />}
                      label={`${filterStats.filtered} de ${filterStats.total} usuarios`}
                      size="small"
                      sx={{
                        bgcolor: '#fff',
                        color: '#2e7d32',
                        fontSize: '0.7rem',
                        fontWeight: 600
                      }}
                    />
                    <Chip
                      icon={<Sms sx={{ fontSize: 14 }} />}
                      label={`${filterStats.withPhone} con teléfono válido`}
                      size="small"
                      sx={{
                        bgcolor: '#fff',
                        color: '#1976d2',
                        fontSize: '0.7rem',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          )}

          <Divider />

          {/* Canal de envío */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              {t('sms.channel.title')}
            </Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.sendSms}
                    onChange={(e) => setFormData(prev => ({ ...prev, sendSms: e.target.checked }))}
                    icon={<Sms color="disabled" />}
                    checkedIcon={<Sms color="primary" />}
                    disabled={sending}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography>{t('sms.channel.sms')}</Typography>
                    {formData.sendSms && usersWithValidPhone.length < recipientCount && (
                      <Chip 
                        label={`${usersWithValidPhone.length} ${t('sms.channel.validPhone')}`} 
                        size="small" 
                        color="warning"
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    )}
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
                    disabled={sending}
                  />
                }
                label={t('sms.channel.email')}
              />
            </FormGroup>
            {!formData.sendSms && !formData.sendEmail && (
              <Alert severity="info" sx={{ mt: 1 }}>
                {t('sms.channel.selectAtLeastOne')}
              </Alert>
            )}
          </Box>

          <Divider />

          {/* Destinatarios */}
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" fontWeight={600}>
                {t('sms.recipients.title')}
              </Typography>
              {formData.projectId && (
                <Chip
                  icon={<People sx={{ fontSize: 14 }} />}
                  label={`${usersByProject.length} usuarios en proyecto`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Box>
            
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
                    disabled={sending}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography>
                      {formData.projectId 
                        ? t('sms.recipients.sendAllInProject', 'Enviar a todos del proyecto')
                        : t('sms.recipients.sendAll')}
                    </Typography>
                    <Chip 
                      label={`${usersByProject.length} ${t('sms.recipients.users')}`} 
                      size="small" 
                      color={formData.projectId ? 'primary' : 'default'}
                    />
                  </Box>
                }
              />
            </FormGroup>

            {formData.projectId && usersByProject.length === 0 && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                {t('sms.recipients.noUsersInProject', 'No hay usuarios asociados a este proyecto')}
              </Alert>
            )}

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
                  disabled={sending}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('sms.recipients.searchLabel')}
                      placeholder={t('sms.recipients.searchPlaceholder')}
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

                {formData.selectedUsers.length > 0 && (
                  <Paper variant="outlined" sx={{ mt: 2, p: 1.5, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" mb={1} display="block">
                      {formData.selectedUsers.length} {t('sms.recipients.selected')}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {formData.selectedUsers.map(user => (
                        <Chip
                          key={user._id}
                          avatar={<Avatar>{user.name?.charAt(0)}</Avatar>}
                          label={user.name}
                          onDelete={() => handleRemoveUser(user._id)}
                          size="small"
                          disabled={sending}
                        />
                      ))}
                    </Box>
                  </Paper>
                )}
              </Box>
            )}
          </Box>

          <Divider />

          {/* Template */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              {t('sms.template.title')}
            </Typography>
            <Autocomplete
              options={filteredTemplates}
              getOptionLabel={(option) => option.name || ''}
              value={selectedTemplate}
              onChange={(_, newValue) => {
                setSelectedTemplate(newValue)
                if (newValue) handleApplyTemplate(newValue)
              }}
              loading={loadingTemplates}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={t('sms.template.selectPlaceholder')}
                  size="small"
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option._id}>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {option.name}
                      </Typography>
                      {option.projectId ? (
                        <Chip 
                          label="proyecto" 
                          size="small" 
                          sx={{ 
                            bgcolor: '#e3f2fd', 
                            color: '#1976d2',
                            fontSize: '0.6rem',
                            height: 18
                          }}
                        />
                      ) : (
                        <Chip 
                          label="global" 
                          size="small" 
                          sx={{ 
                            bgcolor: '#f5f5f5', 
                            color: '#666',
                            fontSize: '0.6rem',
                            height: 18
                          }}
                        />
                      )}
                    </Box>
                    {option.category && (
                      <Chip 
                        label={option.category} 
                        size="small" 
                        sx={{ height: 16, fontSize: '0.6rem', mr: 1, mt: 0.5 }} 
                      />
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {option.template.substring(0, 60)}...
                    </Typography>
                  </Box>
                </Box>
              )}
              disabled={sending}
            />
            {!formData.projectId && filteredTemplates.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {t('sms.template.filterHint', 'Selecciona un proyecto para filtrar plantillas específicas')}
              </Typography>
            )}
          </Box>

          <Divider />

          {/* Contenido */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              {t('sms.content.title')}
            </Typography>

            <Box mb={2}>
              {formData.projectId ? (
                <VariableInserter
                  projectId={formData.projectId}
                  onInsert={handleInsertVariable}
                  compact={false}
                  maxHeight={150}
                />
              ) : (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    {t('sms.content.variablesLabel')}
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {GLOBAL_VARIABLES.map(v => (
                      <Chip
                        key={v.key}
                        label={`{{${v.key}}}`}
                        size="small"
                        onClick={() => handleInsertVariable(v.key)}
                        sx={{ 
                          cursor: 'pointer',
                          bgcolor: '#e3f2fd',
                          '&:hover': { bgcolor: '#bbdefb' },
                          fontFamily: '"Courier New", monospace',
                          fontSize: '0.7rem'
                        }}
                        disabled={sending}
                      />
                    ))}
                  </Box>
                  {projects.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {t('sms.content.globalVariablesHint', 'Selecciona un proyecto para usar variables específicas del proyecto')}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {formData.sendEmail && (
              <TextField
                label={t('sms.content.emailSubject')}
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                fullWidth
                sx={{ mb: 2 }}
                placeholder={t('sms.content.emailSubjectPlaceholder')}
                disabled={sending}
              />
            )}

            <Box ref={contentRef}>
              <TextField
                label={t('sms.content.messageLabel')}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                fullWidth
                multiline
                rows={6}
                placeholder={t('sms.content.messagePlaceholder')}
                helperText={
                  formData.sendSms && formData.content.length > 0
                    ? `${formData.content.length} ${t('sms.content.chars')} (SMS: ~${Math.ceil(formData.content.length / 160)} ${t('sms.content.messages')})`
                    : ''
                }
                disabled={sending}
              />
            </Box>

            {messagePreview && detectedVariables.length > 0 && (
              <Paper variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: '#f5f5f5' }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Info fontSize="small" color="info" />
                  <Typography variant="caption" fontWeight={600}>
                    {t('sms.content.preview')}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {messagePreview}
                </Typography>
              </Paper>
            )}

            {detectedVariables.length > 0 && (
              <Alert severity="info" sx={{ mt: 2 }} icon={<Info />}>
                <Typography variant="caption">
                  {t('sms.content.variablesDetected')}: <strong>{detectedVariables.join(', ')}</strong>
                  <br />
                  {formData.projectId 
                    ? t('sms.content.variablesWillResolveFromProject', 'Las variables se resolverán desde los datos del proyecto')
                    : t('sms.content.variablesWillReplace', 'Las variables se reemplazarán con los datos de cada destinatario')}
                </Typography>
              </Alert>
            )}
          </Box>

        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Box>
          {recipientCount > 0 && (formData.sendSms || formData.sendEmail) && (
            <Typography variant="body2" color="text.secondary">
              {t('sms.summary.willSendTo')} <strong>{formData.sendSms ? usersWithValidPhone.length : recipientCount}</strong> {t('sms.summary.recipients')} {' '}
              {[
                formData.sendSms && t('sms.channel.sms'),
                formData.sendEmail && t('sms.channel.email')
              ].filter(Boolean).join(` ${t('sms.summary.and')} `)}
            </Typography>
          )}
        </Box>
        <Box display="flex" gap={1}>
          <Button onClick={handleClose} disabled={sending}>
            {results ? t('sms.actions.close') : t('sms.actions.cancel')}
          </Button>
          {!results && (
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={!isValid || sending || (formData.projectId && usersByProject.length === 0)}
              startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <Send />}
            >
              {sending ? `${t('sms.actions.sending')} ${progress.percent}%` : t('sms.actions.send')}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default BroadcastMessageModal