import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, IconButton,
  Chip, Paper, Divider, Alert, CircularProgress
} from '@mui/material'
import { Close, Save, Info, Code } from '@mui/icons-material'
import VariableInserter from '@shared/components/VariableInserter'
import ProjectSelector from '@shared/components/ProjectSelector'

const MessageTemplateModal = ({ 
  open, 
  onClose, 
  template = null, 
  onSave,
  initialProjectId = null
}) => {
  const { t } = useTranslation('sms')
  const templateRef = useRef(null)
  
  const [formData, setFormData] = useState({
    name: '',
    template: '',
    category: '',
    description: '',
    projectId: initialProjectId || ''
  })
  const [saving, setSaving] = useState(false)
  const [warnings, setWarnings] = useState([])

  const isEditing = Boolean(template?._id)

  useEffect(() => {
    if (template) {
      const rawProjectId = template.projectId
      const normalizedProjectId = typeof rawProjectId === 'object' && rawProjectId !== null 
        ? rawProjectId._id 
        : (rawProjectId || initialProjectId || '')

      setFormData({
        name: template.name || '',
        template: template.template || '',
        category: template.category || '',
        description: template.description || '',
        projectId: normalizedProjectId
      })
    } else {
      setFormData({
        name: '',
        template: '',
        category: '',
        description: '',
        projectId: initialProjectId || ''
      })
    }
    setWarnings([])
  }, [template, open, initialProjectId])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleInsertVariable = (varName) => {
    const textarea = templateRef.current?.querySelector('textarea')
    if (!textarea) {
      handleChange('template', formData.template + `{{${varName}}}`)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.template
    const insertion = `{{${varName}}}`
    
    const newText = text.substring(0, start) + insertion + text.substring(end)
    handleChange('template', newText)
    
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + insertion.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.template.trim()) return
    
    setSaving(true)
    setWarnings([])
    try {
      const result = await onSave?.(formData, template?._id)
      
      if (result?.warnings?.unknownPlaceholders?.length > 0) {
        setWarnings(result.warnings.unknownPlaceholders)
      }
      
      onClose()
    } catch (err) {
      console.error('Error saving template:', err)
    } finally {
      setSaving(false)
    }
  }

  const detectedVariables = (formData.template.match(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g) || [])
    .map(m => m.replace(/[{}]/g, '').trim())

  const unifiedButtonSx = { 
    borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', letterSpacing: '0.5px', width: { xs: '100%', sm: 'auto' },
    '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } 
  }
  
  const inputSx = { 
    fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, width: '100%',
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' },
    '& .MuiOutlinedInput-root': { borderRadius: 0 }
  }

  return (
    <Dialog 
      id="message-template-modal"
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #ececec', display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {isEditing ? t('sms.templateModal.editTitle') : t('sms.templateModal.newTitle')}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ borderRadius: 0 }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" flexDirection="column" gap={2.5} py={1}>
          <TextField
            id="message-template-modal-name"
            label={t('sms.templateModal.name')}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
            required
            placeholder={t('sms.templateModal.namePlaceholder')}
            autoFocus
            sx={inputSx}
          />

          <Box id="message-template-modal-project">
            <ProjectSelector
              value={formData.projectId}
              onChange={(value) => handleChange('projectId', value)}
              label={t('sms.templateModal.project', 'Proyecto (opcional)')}
              includeGlobal={true}
              globalLabel={t('sms.templateModal.globalTemplate', 'Template global (sin proyecto)')}
              fullWidth
              size="small"
            />
          </Box>

          <TextField
            label={t('sms.templateModal.category')}
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            fullWidth
            placeholder={t('sms.templateModal.categoryPlaceholder')}
            sx={inputSx}
          />

          <TextField
            label={t('sms.templateModal.description')}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder={t('sms.templateModal.descriptionPlaceholder')}
            sx={{ ...inputSx, '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' } }}
          />

          <Divider />

          {formData.projectId && (
            <VariableInserter
              projectId={formData.projectId}
              onInsert={handleInsertVariable}
            />
          )}

          <Box id="message-template-modal-content" ref={templateRef}>
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
              sx={{ ...inputSx, '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace' }, '& .MuiFormHelperText-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' } }}
            />
          </Box>

          {detectedVariables.length > 0 && (
            <Paper id="message-template-modal-variables" variant="outlined" sx={{ p: 2, borderRadius: 0, border: '1px solid #bbdefb', bgcolor: '#e3f2fd' }}>
              <Box display="flex" alignItems="flex-start" gap={1}>
                <Code fontSize="small" sx={{ mt: 0.5, color: '#1976d2' }} />
                <Box flex={1}>
                  <Typography variant="caption" fontWeight={600} color="#1976d2" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    {t('sms.content.variablesDetected')} ({detectedVariables.length})
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                    {detectedVariables.map(v => (
                      <Chip 
                        key={v} 
                        label={`{{${v}}}`} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', borderRadius: 0, borderColor: '#1976d2' }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>
          )}

          {warnings.length > 0 && (
            <Alert severity="warning" sx={{ borderRadius: 0, border: '1px solid', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
              <Typography variant="body2" fontWeight={600} gutterBottom sx={{ fontFamily: '"Courier New", monospace' }}>
                {t('sms.templateModal.unknownPlaceholders', 'Variables no reconocidas')}
              </Typography>
              <Typography variant="caption" display="block" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                {t('sms.templateModal.unknownPlaceholdersHelper', 'Las siguientes variables no están definidas en el proyecto y podrían no resolverse al enviar:')}
              </Typography>
              <Box display="flex" gap={0.5} flexWrap="wrap" mt={1}>
                {warnings.map(w => (
                  <Chip 
                    key={w} 
                    label={`{{${w}}}`} 
                    size="small" 
                    sx={{ 
                      bgcolor: '#fff3e0', 
                      color: '#e65100',
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.7rem',
                      borderRadius: 0,
                      border: '1px solid #ffe0b2'
                    }}
                  />
                ))}
              </Box>
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions id="message-template-modal-actions" sx={{ p: 2, borderTop: '1px solid #ececec', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
        <Button onClick={onClose} disabled={saving} sx={{ ...unifiedButtonSx, color: '#888' }}>
          {t('sms.actions.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!formData.name.trim() || !formData.template.trim() || saving}
          startIcon={saving ? <CircularProgress size={16} /> : <Save />}
          sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}
        >
          {saving ? t('sms.templateModal.saving') : isEditing ? t('sms.templateModal.updateBtn') : t('sms.templateModal.createBtn')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MessageTemplateModal