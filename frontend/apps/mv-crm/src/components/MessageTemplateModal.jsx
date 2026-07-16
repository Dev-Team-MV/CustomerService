// /Users/oficina/MV-CRM/CustomerService/frontend/shared/components/sms/MessageTemplateModal.jsx

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, IconButton,
  Chip, Paper, FormControl, InputLabel, Select, MenuItem,
  Divider, Alert, CircularProgress
} from '@mui/material'
import { Close, Save, Info, Code } from '@mui/icons-material'
import VariableInserter from '@shared/components/VariableInserter'
import { useProjects } from '@shared/hooks/useProjects' // ✅ NUEVO: Hook para obtener proyectos

const MessageTemplateModal = ({ 
  open, 
  onClose, 
  template = null, 
  onSave,
  projects: externalProjects = null, // ✅ RENOMBRADO: Proyectos externos (opcional)
  initialProjectId = null
}) => {
  const { t } = useTranslation('sms')
  const templateRef = useRef(null)
  
  // ✅ NUEVO: Obtener proyectos automáticamente si no se pasan como prop
  const { projects: hookProjects } = useProjects()
  const projects = externalProjects || hookProjects || []
  
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
      setFormData({
        name: template.name || '',
        template: template.template || '',
        category: template.category || '',
        description: template.description || '',
        projectId: template.projectId || initialProjectId || ''
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

          {/* ✅ CORREGIDO: Selector de Proyecto - siempre visible si hay proyectos */}
          {projects.length > 0 && (
            <FormControl size="small" fullWidth>
              <InputLabel>{t('sms.templateModal.project', 'Proyecto (opcional)')}</InputLabel>
              <Select
                value={formData.projectId}
                onChange={(e) => handleChange('projectId', e.target.value)}
                label={t('sms.templateModal.project', 'Proyecto (opcional)')}
              >
                <MenuItem value="">
                  <em>{t('sms.templateModal.globalTemplate', 'Template global (sin proyecto)')}</em>
                </MenuItem>
                {projects.map(project => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {t('sms.templateModal.projectHelper', 'Los templates de proyecto solo pueden usar variables definidas en ese proyecto')}
              </Typography>
            </FormControl>
          )}

          {/* ✅ NUEVO: Debug info cuando no hay proyectos */}
          {projects.length === 0 && (
            <Alert severity="info" sx={{ borderRadius: 0 }}>
              <Typography variant="body2">
                {t('sms.templateModal.noProjects', 'No hay proyectos disponibles. Los templates serán globales.')}
              </Typography>
            </Alert>
          )}

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

          <Divider />

          {formData.projectId && (
            <VariableInserter
              projectId={formData.projectId}
              onInsert={handleInsertVariable}
            />
          )}

          <Box ref={templateRef}>
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
          </Box>

          {detectedVariables.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#e3f2fd' }}>
              <Box display="flex" alignItems="flex-start" gap={1}>
                <Code fontSize="small" sx={{ mt: 0.5, color: '#1976d2' }} />
                <Box flex={1}>
                  <Typography variant="caption" fontWeight={600} color="#1976d2">
                    {t('sms.content.variablesDetected')} ({detectedVariables.length})
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                    {detectedVariables.map(v => (
                      <Chip 
                        key={v} 
                        label={`{{${v}}}`} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>
          )}

          {warnings.length > 0 && (
            <Alert severity="warning" sx={{ borderRadius: 0 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                {t('sms.templateModal.unknownPlaceholders', 'Variables no reconocidas')}
              </Typography>
              <Typography variant="caption" display="block">
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
                      fontSize: '0.7rem'
                    }}
                  />
                ))}
              </Box>
            </Alert>
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
          startIcon={saving ? <CircularProgress size={16} /> : <Save />}
        >
          {saving ? t('sms.templateModal.saving') : isEditing ? t('sms.templateModal.updateBtn') : t('sms.templateModal.createBtn')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MessageTemplateModal