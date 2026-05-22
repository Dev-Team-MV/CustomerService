// frontend/apps/mv-crm/src/components/messageTemplates/MessageTemplateModal.jsx
import { useState, useEffect } from 'react'
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
  { key: 'firstName', label: 'Nombre', example: 'Juan' },
  { key: 'lastName', label: 'Apellido', example: 'Pérez' },
  { key: 'email', label: 'Email', example: 'juan@email.com' },
  { key: 'phoneNumber', label: 'Teléfono', example: '+521555...' }
]

const MessageTemplateModal = ({ open, onClose, template = null, onSave }) => {
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
            {isEditing ? 'Editar Template' : 'Nuevo Template'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2.5} py={1}>
          <TextField
            label="Nombre del template"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
            required
            placeholder="Ej: Bienvenida a clientes"
            autoFocus
          />

          <TextField
            label="Categoría"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            fullWidth
            placeholder="Ej: Marketing, Soporte, Notificaciones..."
          />

          <TextField
            label="Descripción"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Descripción opcional del template..."
          />

          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Variables disponibles (clic para insertar)
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
            label="Contenido del template"
            value={formData.template}
            onChange={(e) => handleChange('template', e.target.value)}
            fullWidth
            multiline
            rows={6}
            required
            placeholder="Escribe el contenido... Usa {{firstName}}, {{lastName}}, etc."
            helperText={`${formData.template.length} caracteres (SMS: ~${Math.ceil(formData.template.length / 160)} mensaje(s))`}
          />

          {detectedVariables.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#e3f2fd' }}>
              <Box display="flex" alignItems="flex-start" gap={1}>
                <Info fontSize="small" sx={{ mt: 0.5, color: '#1976d2' }} />
                <Box flex={1}>
                  <Typography variant="caption" fontWeight={600} color="#1976d2">
                    Variables detectadas
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
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!formData.name.trim() || !formData.template.trim() || saving}
          startIcon={<Save />}
        >
          {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear template'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MessageTemplateModal