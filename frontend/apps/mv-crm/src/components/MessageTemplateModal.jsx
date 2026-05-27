import { useState, useEffect } from 'react'
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
  Chip,
  Paper
} from '@mui/material'
import { Close, Save, Info } from '@mui/icons-material'

const AVAILABLE_VARIABLES = [
  { key: 'firstName', label: 'firstName' },
  { key: 'lastName', label: 'lastName' },
  { key: 'email', label: 'email' },
  { key: 'phoneNumber', label: 'phoneNumber' }
]

const MessageTemplateModal = ({ open, onClose, template = null, onSave }) => {
  const { t } = useTranslation('sms')
  
  const [formData, setFormData] = useState({
    name: '',
    template: '',
    category: '',
    description: ''
  })
  const [saving, setSaving] = useState(false)

  const isEditing = Boolean(template?._id)

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        template: template.template || '',
        category: template.category || '',
        description: template.description || ''
      })
    } else {
      setFormData({
        name: '',
        template: '',
        category: '',
        description: ''
      })
    }
  }, [template, open])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleInsertVariable = (variable) => {
    setFormData(prev => ({
      ...prev,
      template: prev.template + `{{${variable}}}`
    }))
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.template.trim()) return
    
    setSaving(true)
    try {
      await onSave?.(formData, template?._id)
      onClose()
    } catch (err) {
      console.error('Error saving template:', err)
    } finally {
      setSaving(false)
    }
  }

  const detectedVariables = (formData.template.match(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g) || [])
    .map(m => m.replace(/[{}]/g, '').trim())

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            {isEditing ? t('sms.templateModal.editTitle') : t('sms.templateModal.newTitle')}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2.5} py={1}>
          <TextField
            label={t('sms.templateModal.name')}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
            required
            placeholder={t('sms.templateModal.namePlaceholder')}
            autoFocus
          />

          <TextField
            label={t('sms.templateModal.category')}
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            fullWidth
            placeholder={t('sms.templateModal.categoryPlaceholder')}
          />

          <TextField
            label={t('sms.templateModal.description')}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder={t('sms.templateModal.descriptionPlaceholder')}
          />

          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              {t('sms.content.variablesLabel')}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {AVAILABLE_VARIABLES.map(v => (
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
                />
              ))}
            </Box>
          </Box>

          <TextField
            label={t('sms.templateModal.template')}
            value={formData.template}
            onChange={(e) => handleChange('template', e.target.value)}
            fullWidth
            multiline
            rows={6}
            required
            placeholder={t('sms.templateModal.templatePlaceholder')}
            helperText={`${formData.template.length} ${t('sms.content.chars')} (SMS: ~${Math.ceil(formData.template.length / 160)} ${t('sms.content.messages')})`}
          />

          {detectedVariables.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#e3f2fd' }}>
              <Box display="flex" alignItems="flex-start" gap={1}>
                <Info fontSize="small" sx={{ mt: 0.5, color: '#1976d2' }} />
                <Box flex={1}>
                  <Typography variant="caption" fontWeight={600} color="#1976d2">
                    {t('sms.content.variablesDetected')}
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                    {detectedVariables.map(v => (
                      <Chip key={v} label={v} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          {t('sms.actions.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!formData.name.trim() || !formData.template.trim() || saving}
          startIcon={<Save />}
        >
          {saving ? t('sms.templateModal.saving') : isEditing ? t('sms.templateModal.updateBtn') : t('sms.templateModal.createBtn')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MessageTemplateModal