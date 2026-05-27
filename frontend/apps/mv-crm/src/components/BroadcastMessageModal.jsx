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
  LinearProgress
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
  Info
} from '@mui/icons-material'
import messageTemplateService from '../services/messageTemplateService'

const BroadcastMessageModal = ({ 
  open, 
  onClose, 
  users = [],
  onSend 
}) => {
  const { t } = useTranslation('sms')
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    sendSms: false,
    sendEmail: false,
    sendToAll: false,
    selectedUsers: []
  })
  const [sending, setSending] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0 })
  const [results, setResults] = useState(null)
  const fileInputRef = useRef(null)

  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [loadingTemplates, setLoadingTemplates] = useState(false)

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true)
      try {
        const data = await messageTemplateService.getAll()
        setTemplates(data || [])
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

  const detectedVariables = useMemo(() => {
    const matches = formData.content.match(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g) || []
    return [...new Set(matches.map(m => m.replace(/[{}]/g, '').trim()))]
  }, [formData.content])

  const availableVariables = [
    { key: 'firstName', label: t('sms.variables.firstName'), example: 'Juan' },
    { key: 'lastName', label: t('sms.variables.lastName'), example: 'Pérez' },
    { key: 'email', label: t('sms.variables.email'), example: 'juan@email.com' },
    { key: 'phoneNumber', label: t('sms.variables.phone'), example: '+521555...' }
  ]

  const filteredUsers = useMemo(() => {
    if (!searchInput.trim()) return users
    const q = searchInput.toLowerCase()
    return users.filter(u =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phoneNumber?.includes(q)
    )
  }, [users, searchInput])

  const userOptions = useMemo(() => {
    return filteredUsers.map(u => ({
      _id: u._id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      email: u.email,
      phone: u.phoneNumber || '',
      firstName: u.firstName,
      lastName: u.lastName
    }))
  }, [filteredUsers])

  const usersWithValidPhone = useMemo(() => {
    const targetUsers = formData.sendToAll 
      ? users 
      : users.filter(u => formData.selectedUsers.some(s => s._id === u._id))
    return targetUsers.filter(u => u.phoneNumber?.startsWith('+'))
  }, [users, formData.sendToAll, formData.selectedUsers])

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

  const handleInsertVariable = (variable) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + `{{${variable}}}`
    }))
  }

  const isValid = useMemo(() => {
    const hasChannel = formData.sendSms || formData.sendEmail
    const hasRecipients = formData.sendToAll || formData.selectedUsers.length > 0
    const hasContent = formData.content.trim().length > 0
    return hasChannel && hasRecipients && hasContent
  }, [formData])

  const recipientCount = formData.sendToAll 
    ? users.length 
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
        channels: {
          sms: formData.sendSms,
          email: formData.sendEmail
        },
        recipients: formData.sendToAll 
          ? users.map(u => u._id) 
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
      selectedUsers: []
    })
    setSearchInput('')
    setProgress({ current: 0, total: 0, percent: 0 })
    setResults(null)
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
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              {t('sms.recipients.title')}
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
                    disabled={sending}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography>{t('sms.recipients.sendAll')}</Typography>
                    <Chip label={`${users.length} ${t('sms.recipients.users')}`} size="small" />
                  </Box>
                }
              />
            </FormGroup>

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
              options={templates}
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
                    <Typography variant="body2" fontWeight={500}>
                      {option.name}
                    </Typography>
                    {option.category && (
                      <Chip label={option.category} size="small" sx={{ height: 16, fontSize: '0.6rem', mr: 1 }} />
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {option.template.substring(0, 60)}...
                    </Typography>
                  </Box>
                </Box>
              )}
              disabled={sending}
            />
          </Box>

          <Divider />

          {/* Contenido */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              {t('sms.content.title')}
            </Typography>

            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                {t('sms.content.variablesLabel')}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {availableVariables.map(v => (
                  <Chip
                    key={v.key}
                    label={`{{${v.key}}}`}
                    size="small"
                    onClick={() => handleInsertVariable(v.key)}
                    sx={{ 
                      cursor: 'pointer',
                      bgcolor: '#e3f2fd',
                      '&:hover': { bgcolor: '#bbdefb' }
                    }}
                    disabled={sending}
                  />
                ))}
              </Box>
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
                  {t('sms.content.variablesWillReplace')}
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
              disabled={!isValid || sending}
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