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
  Divider,
  Chip
} from '@mui/material'
import { Close, Save } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { es } from 'date-fns/locale'
import ContactSelector from './ContactSelector'
import SubActivityList from './SubActivityList'
import { 
  ACTIVITY_STATUSES, 
  ACTIVITY_CATEGORIES, 
  ACTIVITY_PRIORITIES 
} from '../../constants/hooks/useActivities'

const initialFormData = {
  title: '',
  description: '',
  status: 'pending',
  category: 'task',
  priority: 'medium',
  project: null,
  dueDate: null,
  contact: { type: 'none', relatedUser: null, externalContact: null }
}

const ActivityModal = ({ 
  open, 
  onClose, 
  activity = null, 
  projects = [],
  onSave,
  onAddSubActivity,
  onUpdateSubActivity,
  onDeleteSubActivity
}) => {
  const [formData, setFormData] = useState(initialFormData)
  const [saving, setSaving] = useState(false)

  const isEditing = Boolean(activity)

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        status: activity.status || 'pending',
        category: activity.category || 'task',
        priority: activity.priority || 'medium',
        project: activity.project || null,
        dueDate: activity.dueDate ? new Date(activity.dueDate) : null,
        contact: {
          type: activity.relatedUser ? 'registered' : activity.externalContact ? 'external' : 'none',
          relatedUser: activity.relatedUser || null,
          externalContact: activity.externalContact || null
        }
      })
    } else {
      setFormData(initialFormData)
    }
  }, [activity, open])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) return
    
    setSaving(true)
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        category: formData.category,
        priority: formData.priority,
        project: formData.project,
        dueDate: formData.dueDate,
        relatedUser: formData.contact.type === 'registered' ? formData.contact.relatedUser : null,
        externalContact: formData.contact.type === 'external' ? formData.contact.externalContact : null
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
      maxWidth="md" 
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
          <Box display="flex" flexDirection="column" gap={3} py={1}>
            {/* Título */}
            <TextField
              label="Título"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              fullWidth
              required
              placeholder="Ej: Reunión con cliente potencial"
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

            {/* Fila: Estado, Categoría, Prioridad */}
            <Box display="flex" gap={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.status}
                  label="Estado"
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  {ACTIVITY_STATUSES.map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                        {s.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.category}
                  label="Categoría"
                  onChange={(e) => handleChange('category', e.target.value)}
                >
                  {ACTIVITY_CATEGORIES.map(c => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.icon} {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
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
                        sx={{ 
                          bgcolor: `${p.color}20`, 
                          color: p.color,
                          fontWeight: 600,
                          height: 22
                        }} 
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Fila: Proyecto, Fecha */}
            <Box display="flex" gap={2}>
              <Autocomplete
                options={projects}
                getOptionLabel={(option) => option.name || ''}
                value={formData.project}
                onChange={(_, newValue) => handleChange('project', newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Proyecto (opcional)" size="small" />
                )}
                sx={{ flex: 1 }}
              />

              <DatePicker
                label="Fecha límite"
                value={formData.dueDate}
                onChange={(newValue) => handleChange('dueDate', newValue)}
                slotProps={{ 
                  textField: { size: 'small', sx: { flex: 1 } } 
                }}
              />
            </Box>

            <Divider />

            {/* Selector de contacto */}
            <ContactSelector
              value={formData.contact}
              onChange={(newContact) => handleChange('contact', newContact)}
            />

            {/* SubActividades (solo en edición) */}
            {isEditing && activity?.subActivities && (
              <>
                <Divider />
                <SubActivityList
                  subActivities={activity.subActivities}
                  onAdd={(data) => onAddSubActivity?.(activity._id, data)}
                  onUpdate={(subId, data) => onUpdateSubActivity?.(activity._id, subId, data)}
                  onDelete={(subId) => onDeleteSubActivity?.(activity._id, subId)}
                />
              </>
            )}
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
          disabled={!formData.title.trim() || saving}
          startIcon={<Save />}
        >
          {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear actividad'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ActivityModal