// frontend/apps/mv-crm/src/components/activities/ActivityModal.jsx
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Chip
} from '@mui/material'
import { Close, Save } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { es } from 'date-fns/locale'
import { useResidents } from '@shared/hooks/useResidents'
import { ACTIVITY_PRIORITIES } from '../../constants/hooks/useActivities'

const initialFormData = {
  title: '',
  description: '',
  columnId: '',
  priority: 'medium',
  dueDate: null,
  assignedTo: null,
  tags: []
}

const ActivityModal = ({ 
  open, 
  onClose, 
  activity = null, 
  columns = [],
  onSave
}) => {
  const [formData, setFormData] = useState(initialFormData)
  const [saving, setSaving] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const isEditing = Boolean(activity?._id)

  // Obtener usuarios para asignar
  const { users, loading: loadingUsers } = useResidents(null, { 
    smsProjectId: import.meta.env.VITE_PROJECT_ID 
  })

  const userOptions = users.map(u => ({
    _id: u._id,
    name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
    email: u.email
  }))

  useEffect(() => {
    if (activity) {
      const assignee = activity.assignedTo
      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        columnId: typeof activity.columnId === 'object' 
          ? activity.columnId._id 
          : (activity.columnId || columns[0]?._id || ''),
        priority: activity.priority || 'medium',
        dueDate: activity.dueDate ? new Date(activity.dueDate) : null,
        assignedTo: assignee ? {
          _id: assignee._id,
          name: `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim(),
          email: assignee.email
        } : null,
        tags: activity.tags || []
      })
    } else {
      setFormData({
        ...initialFormData,
        columnId: columns[0]?._id || ''
      })
    }
  }, [activity, open, columns])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.columnId) return
    
    setSaving(true)
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        columnId: formData.columnId,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        assignedTo: formData.assignedTo?._id || undefined,
        tags: formData.tags
      }
      await onSave?.(payload, activity?._id)
      onClose()
    } catch (err) {
      console.error('Error saving activity:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            {isEditing ? 'Editar Actividad' : 'Nueva Actividad'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box display="flex" flexDirection="column" gap={2.5} py={1}>
            {/* Título */}
            <TextField
              label="Título"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              fullWidth
              required
              placeholder="Ej: Llamar al cliente"
            />

            {/* Descripción */}
            <TextField
              label="Descripción"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Detalles de la actividad..."
            />

            {/* Columna y Prioridad */}
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Columna</InputLabel>
                <Select
                  value={formData.columnId}
                  label="Columna"
                  onChange={(e) => handleChange('columnId', e.target.value)}
                >
                  {columns.map(col => (
                    <MenuItem key={col._id} value={col._id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: col.color }} />
                        {col.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={formData.priority}
                  label="Prioridad"
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  {ACTIVITY_PRIORITIES.map(p => (
                    <MenuItem key={p.id} value={p.id}>
                      <Chip 
                        label={p.label} 
                        size="small" 
                        sx={{ bgcolor: `${p.color}20`, color: p.color, height: 22 }} 
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Fecha y Asignado */}
            <Box display="flex" gap={2}>
              <DatePicker
                label="Fecha límite"
                value={formData.dueDate}
                onChange={(newValue) => handleChange('dueDate', newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />

              <Autocomplete
                options={userOptions}
                loading={loadingUsers}
                getOptionLabel={(option) => option.name || ''}
                isOptionEqualToValue={(option, val) => option._id === val?._id}
                value={formData.assignedTo}
                onChange={(_, newValue) => handleChange('assignedTo', newValue)}
                fullWidth
                renderInput={(params) => (
                  <TextField {...params} label="Asignar a" placeholder="Buscar usuario..." />
                )}
              />
            </Box>

            {/* Tags */}
            <Box>
              <Typography variant="subtitle2" mb={1}>Etiquetas</Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                {formData.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    onDelete={() => handleRemoveTag(tag)}
                  />
                ))}
              </Box>
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  placeholder="Nueva etiqueta..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  sx={{ flex: 1 }}
                />
                <Button variant="outlined" size="small" onClick={handleAddTag}>
                  Agregar
                </Button>
              </Box>
            </Box>
          </Box>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!formData.title.trim() || !formData.columnId || saving}
          startIcon={<Save />}
        >
          {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear actividad'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ActivityModal