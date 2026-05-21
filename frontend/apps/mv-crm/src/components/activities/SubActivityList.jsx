import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Checkbox,
  Chip,
  Button,
  Collapse,
  Paper,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  CircularProgress,
  InputAdornment
} from '@mui/material'
import { 
  Add, 
  Delete, 
  Edit,
  SubdirectoryArrowRight,
  ExpandMore,
  ExpandLess,
  AccessTime,
  Person,
  PersonAdd,
  Email,
  Phone,
  Notes
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { es } from 'date-fns/locale'
import { useResidents } from '@shared/hooks/useResidents'

const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

const SubActivityItem = ({ sub, onToggle, onEdit, onDelete, readOnly }) => {
  const isCompleted = sub.completed || sub.status === 'completed'
  const isOverdue = sub.dueDate && new Date(sub.dueDate) < new Date() && !isCompleted

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 1,
        borderRadius: 2,
        bgcolor: isCompleted ? '#f5f5f5' : 'white',
        borderColor: isOverdue ? '#f44336' : '#e0e0e0',
        borderLeftWidth: 3,
        borderLeftColor: isCompleted ? '#4caf50' : isOverdue ? '#f44336' : '#2196f3'
      }}
    >
      <Box display="flex" alignItems="flex-start" gap={1}>
        {/* Checkbox */}
        <Checkbox
          checked={isCompleted}
          onChange={() => onToggle?.(sub)}
          disabled={readOnly}
          size="small"
          sx={{
            mt: -0.5,
            color: '#9e9e9e',
            '&.Mui-checked': { color: '#4caf50' }
          }}
        />

        {/* Content */}
        <Box flex={1} minWidth={0}>
          {/* Título */}
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{
              textDecoration: isCompleted ? 'line-through' : 'none',
              color: isCompleted ? '#9e9e9e' : 'inherit'
            }}
          >
            {sub.title}
          </Typography>

          {/* Descripción */}
          {sub.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mt: 0.5
              }}
            >
              {sub.description}
            </Typography>
          )}

          {/* Meta info: fecha, asignado, contacto */}
          <Box display="flex" alignItems="center" gap={1.5} mt={1} flexWrap="wrap">
            {sub.dueDate && (
              <Chip
                icon={<AccessTime sx={{ fontSize: 12 }} />}
                label={formatDate(sub.dueDate)}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  bgcolor: isOverdue ? '#f4433620' : '#2196f320',
                  color: isOverdue ? '#f44336' : '#2196f3',
                  '& .MuiChip-icon': { color: 'inherit' }
                }}
              />
            )}

            {/* Asignado a usuario */}
            {sub.assignedTo && (
              <Tooltip title={`${sub.assignedTo.firstName || ''} ${sub.assignedTo.lastName || ''}`}>
                <Chip
                  avatar={
                    <Avatar sx={{ 
                      width: 16, 
                      height: 16, 
                      fontSize: 8,
                      bgcolor: '#2196f3'
                    }}>
                      {sub.assignedTo.firstName?.charAt(0) || '?'}
                    </Avatar>
                  }
                  label={sub.assignedTo.firstName?.split(' ')[0] || 'Usuario'}
                  size="small"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.65rem'
                  }}
                />
              </Tooltip>
            )}

            {/* Contacto externo */}
            {sub.contact && (
              <Tooltip title={`${sub.contact.name} (${sub.contact.phone})`}>
                <Chip
                  avatar={
                    <Avatar sx={{ 
                      width: 16, 
                      height: 16, 
                      fontSize: 8,
                      bgcolor: '#ff9800'
                    }}>
                      {sub.contact.name?.charAt(0) || '?'}
                    </Avatar>
                  }
                  label={sub.contact.name?.split(' ')[0] || 'Contacto'}
                  size="small"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.65rem',
                    bgcolor: '#ff980020',
                    color: '#ff9800'
                  }}
                />
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Actions */}
        {!readOnly && (
          <Box display="flex" gap={0.5}>
            <IconButton size="small" onClick={() => onEdit?.(sub)}>
              <Edit sx={{ fontSize: 16, color: '#757575' }} />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete?.(sub._id)}>
              <Delete sx={{ fontSize: 16, color: '#f44336' }} />
            </IconButton>
          </Box>
        )}
      </Box>
    </Paper>
  )
}

// Modal para crear/editar subactividad
const SubActivityModal = ({ open, onClose, onSave, subActivity = null, parentActivityId = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: null,
    assignedTo: null,
    contactType: 'none', // 'none', 'user', 'external'
    contact: {
      user: null,
      name: '',
      phone: '',
      email: ''
    }
  })
  const [searchInput, setSearchInput] = useState('')
  const [saving, setSaving] = useState(false)

  // Obtener usuarios
  const { users, loading } = useResidents(null, { smsProjectId: import.meta.env.VITE_PROJECT_ID })

  // Transformar usuarios
  const userOptions = useMemo(() => {
    const filtered = searchInput.trim() 
      ? users.filter(u =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchInput.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchInput.toLowerCase())
        )
      : users
    
    return filtered
  }, [users, searchInput])

  // Reset form
  useEffect(() => {
    if (subActivity) {
      setFormData({
        title: subActivity.title || '',
        description: subActivity.description || '',
        dueDate: subActivity.dueDate ? new Date(subActivity.dueDate) : null,
        assignedTo: subActivity.assignedTo || null,
        contactType: subActivity.contact ? 'external' : (subActivity.assignedTo ? 'user' : 'none'),
        contact: subActivity.contact || {
          user: subActivity.assignedTo?._id || null,
          name: subActivity.contact?.name || '',
          phone: subActivity.contact?.phone || '',
          email: subActivity.contact?.email || ''
        }
      })
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: null,
        assignedTo: null,
        contactType: 'none',
        contact: {
          user: null,
          name: '',
          phone: '',
          email: ''
        }
      })
    }
    setSearchInput('')
  }, [subActivity, open])

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('El título es obligatorio')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate
      }

      // Agregar asignado según el tipo
      if (formData.contactType === 'user' && formData.assignedTo) {
        payload.assignedTo = formData.assignedTo._id || formData.assignedTo
        payload.contact = {
          user: formData.assignedTo._id || formData.assignedTo,
          name: `${formData.assignedTo.firstName || ''} ${formData.assignedTo.lastName || ''}`.trim(),
          email: formData.assignedTo.email || '',
          phone: formData.assignedTo.phoneNumber || ''
        }
      } else if (formData.contactType === 'external' && formData.contact.name) {
        payload.contact = {
          user: null,
          name: formData.contact.name,
          phone: formData.contact.phone,
          email: formData.contact.email
        }
      }

      await onSave?.(payload, subActivity?._id)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleContactTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      contactType: type,
      assignedTo: null,
      contact: {
        user: null,
        name: '',
        phone: '',
        email: ''
      }
    }))
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>
        {subActivity ? 'Editar Subtarea' : 'Nueva Subtarea'}
      </DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
            {/* Título */}
            <TextField
              label="Título"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              required
              autoFocus
              placeholder="Ej: Confirmar disponibilidad del cliente"
            />

            {/* Descripción */}
            <TextField
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
              placeholder="Detalles adicionales de la subtarea..."
            />

            {/* Fecha límite */}
            <DatePicker
              label="Fecha límite"
              value={formData.dueDate}
              onChange={(newValue) => setFormData(prev => ({ ...prev, dueDate: newValue }))}
              slotProps={{ textField: { fullWidth: true } }}
            />

            {/* Sección de asignación */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
                Asignar a
              </Typography>
              
              {/* Selector de tipo */}
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                <Chip
                  label="Sin asignar"
                  onClick={() => handleContactTypeChange('none')}
                  color={formData.contactType === 'none' ? 'primary' : 'default'}
                  variant={formData.contactType === 'none' ? 'filled' : 'outlined'}
                />
                <Chip
                  label="Usuario registrado"
                  icon={<Person sx={{ fontSize: 16 }} />}
                  onClick={() => handleContactTypeChange('user')}
                  color={formData.contactType === 'user' ? 'primary' : 'default'}
                  variant={formData.contactType === 'user' ? 'filled' : 'outlined'}
                />
                <Chip
                  label="Contacto externo"
                  icon={<PersonAdd sx={{ fontSize: 16 }} />}
                  onClick={() => handleContactTypeChange('external')}
                  color={formData.contactType === 'external' ? 'warning' : 'default'}
                  variant={formData.contactType === 'external' ? 'filled' : 'outlined'}
                />
              </Box>

              {/* Usuario registrado */}
              {formData.contactType === 'user' && (
                <Autocomplete
                  options={userOptions}
                  loading={loading}
                  getOptionLabel={(option) => `${option.firstName || ''} ${option.lastName || ''} (${option.email})`}
                  isOptionEqualToValue={(option, val) => option._id === val?._id}
                  value={formData.assignedTo}
                  onChange={(_, newValue) => setFormData(prev => ({ ...prev, assignedTo: newValue }))}
                  onInputChange={(_, newInput) => setSearchInput(newInput)}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Buscar usuario"
                      placeholder="Por nombre o email..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <Person fontSize="small" />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                        endAdornment: (
                          <>
                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} display="flex" alignItems="center" gap={1.5} py={1}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#2196f3', fontSize: 12 }}>
                        {option.firstName?.charAt(0) || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {option.firstName} {option.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              )}

              {/* Contacto externo */}
              {formData.contactType === 'external' && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fff8e1' }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <PersonAdd color="warning" fontSize="small" />
                    <Typography variant="body2" color="warning.main" fontWeight={500}>
                      Contacto no registrado
                    </Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    <TextField
                      label="Nombre"
                      value={formData.contact.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, name: e.target.value }
                      }))}
                      fullWidth
                      required
                      size="small"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment>
                      }}
                    />
                    <TextField
                      label="Email"
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, email: e.target.value }
                      }))}
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Email fontSize="small" /></InputAdornment>
                      }}
                    />
                    <TextField
                      label="Teléfono"
                      value={formData.contact.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, phone: e.target.value }
                      }))}
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Phone fontSize="small" /></InputAdornment>
                      }}
                    />
                  </Box>
                </Paper>
              )}
            </Box>
          </Box>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={!formData.title.trim() || saving}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {subActivity ? 'Guardar cambios' : 'Agregar subtarea'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const SubActivityList = ({ 
  subActivities = [], 
  onAdd, 
  onUpdate, 
  onDelete,
  parentActivityId = null,
  readOnly = false 
}) => {
  const [expanded, setExpanded] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSub, setEditingSub] = useState(null)

  const completedCount = subActivities.filter(s => s.completed || s.status === 'completed').length
  const totalCount = subActivities.length

  const handleToggleStatus = async (sub) => {
    const newStatus = (sub.completed || sub.status === 'completed') ? false : true
    await onUpdate?.(sub._id, { completed: newStatus })
  }

  const handleOpenModal = (sub = null) => {
    setEditingSub(sub)
    setModalOpen(true)
  }

  const handleSave = async (data, subId) => {
    if (subId) {
      // Editar
      await onUpdate?.(subId, data)
    } else {
      // Crear
      await onAdd?.(parentActivityId, data)
    }
    setModalOpen(false)
    setEditingSub(null)
  }

  return (
    <Box>
      {/* Header */}
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between"
        onClick={() => setExpanded(!expanded)}
        sx={{ cursor: 'pointer', mb: 1, p: 1, borderRadius: 1, '&:hover': { bgcolor: '#f5f5f5' } }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <SubdirectoryArrowRight sx={{ fontSize: 20, color: '#757575' }} />
          <Typography variant="subtitle2" fontWeight={600}>
            Subtareas
          </Typography>
          {totalCount > 0 && (
            <Chip
              label={`${completedCount}/${totalCount}`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: completedCount === totalCount ? '#4caf5020' : '#ff980020',
                color: completedCount === totalCount ? '#4caf50' : '#ff9800',
                fontWeight: 600
              }}
            />
          )}
        </Box>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        {/* Lista de subtareas */}
        {totalCount > 0 ? (
          <Box>
            {subActivities.map((sub) => (
              <SubActivityItem
                key={sub._id}
                sub={sub}
                onToggle={handleToggleStatus}
                onEdit={handleOpenModal}
                onDelete={onDelete}
                readOnly={readOnly}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ pl: 1, display: 'block', py: 1 }}>
            Sin subtareas
          </Typography>
        )}

        {/* Botón agregar */}
        {!readOnly && (
          <Button
            startIcon={<Add />}
            size="small"
            onClick={() => handleOpenModal()}
            sx={{ textTransform: 'none', mt: 1, ml: 0.5 }}
          >
            Agregar subtarea
          </Button>
        )}
      </Collapse>

      {/* Modal */}
      <SubActivityModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingSub(null) }}
        onSave={handleSave}
        subActivity={editingSub}
        parentActivityId={parentActivityId}
      />
    </Box>
  )
}

export default SubActivityList