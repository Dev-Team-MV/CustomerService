// frontend/apps/mv-crm/src/components/activities/SubActivityList.jsx
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
  PersonAdd,  // <-- Agregar
  Email,      // <-- Agregar
  Phone,      // <-- Agregar
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
  const isCompleted = sub.status === 'completed'
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

          {/* Meta info: fecha, asignado */}
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
{/* En SubActivityItem, reemplazar la sección de assignedTo */}
{(sub.assignedTo || sub.externalAssignee) && (
  <Tooltip title={
    sub.assignedTo 
      ? (sub.assignedTo.name || sub.assignedTo.email)
      : `${sub.externalAssignee.name} (externo)`
  }>
    <Chip
      avatar={
        <Avatar sx={{ 
          width: 16, 
          height: 16, 
          fontSize: 8,
          bgcolor: sub.assignedTo ? '#2196f3' : '#ff9800'
        }}>
          {(sub.assignedTo?.name || sub.externalAssignee?.name)?.charAt(0) || '?'}
        </Avatar>
      }
      label={
        sub.assignedTo 
          ? (sub.assignedTo.name?.split(' ')[0] || 'Asignado')
          : (sub.externalAssignee?.name?.split(' ')[0] || 'Externo')
      }
      size="small"
      sx={{ 
        height: 20, 
        fontSize: '0.65rem',
        bgcolor: sub.assignedTo ? undefined : '#ff980020',
        color: sub.assignedTo ? undefined : '#ff9800'
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
const SubActivityModal = ({ open, onClose, onSave, subActivity = null }) => {
  const [formData, setFormData] = useState({
    title: subActivity?.title || '',
    description: subActivity?.description || '',
    dueDate: subActivity?.dueDate ? new Date(subActivity.dueDate) : null,
    contactType: subActivity?.assignedTo ? 'registered' : subActivity?.externalAssignee ? 'external' : 'none',
    assignedTo: subActivity?.assignedTo || null,
    externalAssignee: subActivity?.externalAssignee || { name: '', email: '', phone: '' }
  })
  const [searchInput, setSearchInput] = useState('')

  // Obtener usuarios reales
  const { users, loading } = useResidents(null, { smsProjectId: import.meta.env.VITE_PROJECT_ID })

  // Transformar usuarios al formato esperado
  const userOptions = useMemo(() => {
    const filtered = searchInput.trim() 
      ? users.filter(u =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchInput.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchInput.toLowerCase())
        )
      : users
    
    return filtered.map(u => ({
      _id: u._id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      email: u.email,
      phone: u.phoneNumber || ''
    }))
  }, [users, searchInput])

  // Reset form cuando cambia subActivity
  useEffect(() => {
    setFormData({
      title: subActivity?.title || '',
      description: subActivity?.description || '',
      dueDate: subActivity?.dueDate ? new Date(subActivity.dueDate) : null,
      contactType: subActivity?.assignedTo ? 'registered' : subActivity?.externalAssignee ? 'external' : 'none',
      assignedTo: subActivity?.assignedTo || null,
      externalAssignee: subActivity?.externalAssignee || { name: '', email: '', phone: '' }
    })
    setSearchInput('')
  }, [subActivity, open])

  const handleSave = () => {
    if (!formData.title.trim()) return
    const payload = {
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      assignedTo: formData.contactType === 'registered' ? formData.assignedTo : null,
      externalAssignee: formData.contactType === 'external' ? formData.externalAssignee : null
    }
    onSave?.(payload, subActivity?._id)
    onClose()
  }

  const handleContactTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      contactType: type,
      assignedTo: null,
      externalAssignee: { name: '', email: '', phone: '' }
    }))
  }

  const handleExternalChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      externalAssignee: { ...prev.externalAssignee, [field]: value }
    }))
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
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
            />

            {/* Descripción */}
            <TextField
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
              placeholder="Detalles de la subtarea..."
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
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Asignar a
              </Typography>
              
              {/* Selector de tipo */}
              <Box display="flex" gap={1} mb={2}>
                <Chip
                  label="Sin asignar"
                  onClick={() => handleContactTypeChange('none')}
                  color={formData.contactType === 'none' ? 'primary' : 'default'}
                  variant={formData.contactType === 'none' ? 'filled' : 'outlined'}
                />
                <Chip
                  label="Usuario registrado"
                  icon={<Person sx={{ fontSize: 16 }} />}
                  onClick={() => handleContactTypeChange('registered')}
                  color={formData.contactType === 'registered' ? 'primary' : 'default'}
                  variant={formData.contactType === 'registered' ? 'filled' : 'outlined'}
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
              {formData.contactType === 'registered' && (
                <Autocomplete
                  options={userOptions}
                  loading={loading}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, val) => option._id === val?._id}
                  value={formData.assignedTo}
                  onChange={(_, newValue) => setFormData(prev => ({ ...prev, assignedTo: newValue }))}
                  onInputChange={(_, newInput) => setSearchInput(newInput)}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Buscar usuario"
                      placeholder="Nombre o email..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <Person />
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
                    <Box component="li" {...props} key={option._id} display="flex" alignItems="center" gap={1.5} py={1}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#2196f3' }}>
                        {option.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{option.email}</Typography>
                      </Box>
                    </Box>
                  )}
                />
              )}

              {/* Contacto externo */}
              {formData.contactType === 'external' && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fff8e1' }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <PersonAdd color="warning" />
                    <Typography variant="body2" color="warning.main" fontWeight={500}>
                      Contacto no registrado en el sistema
                    </Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                      label="Nombre"
                      value={formData.externalAssignee.name}
                      onChange={(e) => handleExternalChange('name', e.target.value)}
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Person /></InputAdornment>
                      }}
                    />
                    <Box display="flex" gap={2}>
                      <TextField
                        label="Email"
                        value={formData.externalAssignee.email}
                        onChange={(e) => handleExternalChange('email', e.target.value)}
                        fullWidth
                        type="email"
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Email /></InputAdornment>
                        }}
                      />
                      <TextField
                        label="Teléfono"
                        value={formData.externalAssignee.phone}
                        onChange={(e) => handleExternalChange('phone', e.target.value)}
                        fullWidth
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>
                        }}
                      />
                    </Box>
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
          disabled={!formData.title.trim()}
        >
          {subActivity ? 'Guardar' : 'Agregar'}
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
  readOnly = false 
}) => {
  const [expanded, setExpanded] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSub, setEditingSub] = useState(null)

  const completedCount = subActivities.filter(s => s.status === 'completed').length
  const totalCount = subActivities.length

  const handleToggleStatus = async (sub) => {
    const newStatus = sub.status === 'completed' ? 'pending' : 'completed'
    await onUpdate?.(sub._id, { status: newStatus })
  }

  const handleOpenModal = (sub = null) => {
    setEditingSub(sub)
    setModalOpen(true)
  }

  const handleSave = async (data, subId) => {
    if (subId) {
      await onUpdate?.(subId, data)
    } else {
      await onAdd?.(data)
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
        sx={{ cursor: 'pointer', mb: 1 }}
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
          <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
            Sin subtareas
          </Typography>
        )}

        {/* Botón agregar */}
        {!readOnly && (
          <Button
            startIcon={<Add />}
            size="small"
            onClick={() => handleOpenModal()}
            sx={{ textTransform: 'none', mt: 1 }}
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
      />
    </Box>
  )
}

export default SubActivityList