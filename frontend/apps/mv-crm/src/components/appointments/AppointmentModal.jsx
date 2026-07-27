// apps/mv-crm/src/components/appointments/AppointmentModal.jsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material'
import { Close, Event, Person, TrendingUp, AccessTime } from '@mui/icons-material'
import useLeads from '../../constants/hooks/useLeads'
import { useResidents } from '@shared/hooks/useResidents'

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIONES (labels como fallback)
// ═══════════════════════════════════════════════════════════════

const APPOINTMENT_TYPES = [
  { value: 'visita', labelKey: 'types.visita', color: '#4caf50' },
  { value: 'llamada', labelKey: 'types.llamada', color: '#2196f3' },
  { value: 'reunion', labelKey: 'types.reunion', color: '#ff9800' }
]

const APPOINTMENT_STATUSES = [
  { value: 'pendiente', labelKey: 'statuses.pendiente', color: '#ff9800' },
  { value: 'confirmada', labelKey: 'statuses.confirmada', color: '#2196f3' },
  { value: 'completada', labelKey: 'statuses.completada', color: '#4caf50' },
  { value: 'cancelada', labelKey: 'statuses.cancelada', color: '#f44336' }
]

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const formatDateLocal = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatTimeLocal = (date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const combineDateAndTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null
  const [year, month, day] = dateStr.split('-')
  const [hours, minutes] = timeStr.split(':')
  const localDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes))
  return localDate.toISOString()
}

const validateAppointmentDuration = (startDate, startTime, endDate, endTime, t) => {
  if (!startDate || !startTime) {
    return { 
      valid: false, 
      error: t('validation.startDateRequired', 'La fecha y hora de inicio son obligatorias') 
    }
  }

  const startDateTime = combineDateAndTime(startDate, startTime)
  const start = new Date(startDateTime)

  if (!endDate || !endTime) {
    return { valid: true, duration: 60 }
  }

  const endDateTime = combineDateAndTime(endDate, endTime)
  const end = new Date(endDateTime)
  const diffMinutes = Math.round((end - start) / (1000 * 60))

  if (diffMinutes < 60) {
    return { valid: false, error: t('duration.minError', { minutes: diffMinutes }) }
  }

  if (diffMinutes >= 1440) {
    return { valid: false, error: t('duration.maxError') }
  }

  return { valid: true, duration: diffMinutes }
}

const formatDuration = (minutes, t) => {
  if (minutes < 60) {
    return t('duration.minutes', { count: minutes, defaultValue: `${minutes} minutos` })
  }
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (mins === 0) {
    return t('duration.hours', { count: hours, defaultValue: `${hours} horas` })
  }
  
  return t('duration.hoursMinutes', { 
    hours, 
    minutes: mins,
    defaultValue: `${hours}h ${mins}min`
  })
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const AppointmentModal = ({
  open,
  onClose,
  appointment = null,
  onSave,
  onDelete,
  prefillData = {},
  projects = [],
  agents = []
}) => {
  const { t } = useTranslation('appointments')
  const { leads } = useLeads()
  const { users: residents } = useResidents()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'visita',
    notes: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    leadId: '',
    clientId: '',
    projectId: '',
    assignedTo: '',
    status: 'pendiente'
  })
  
  const [contactType, setContactType] = useState(0)
  const [durationInfo, setDurationInfo] = useState(null)

  const isEditing = Boolean(appointment?._id)

  useEffect(() => {
    if (appointment) {
      const startDate = new Date(appointment.startDate)
      const endDate = new Date(appointment.endDate)
      
      // ✅ CORRECCIÓN: Usar optional chaining (?.) para evitar errores si la propiedad es null
      // typeof null === 'object', por lo que la validación anterior fallaba.
      const projectId = appointment.projectId?._id || appointment.projectId || ''
      const assignedToId = appointment.assignedTo?._id || appointment.assignedTo || ''
      const leadId = appointment.leadId?._id || appointment.leadId || ''
      const clientId = appointment.clientId?._id || appointment.clientId || ''
      
      setFormData({
        title: appointment.title || '',
        type: appointment.type || 'visita',
        notes: appointment.notes || '',
        startDate: formatDateLocal(startDate),
        startTime: formatTimeLocal(startDate),
        endDate: formatDateLocal(endDate),
        endTime: formatTimeLocal(endDate),
        leadId: leadId,
        clientId: clientId,
        projectId: projectId,
        assignedTo: assignedToId,
        status: appointment.status || 'pendiente'
      })
      
      setContactType(clientId ? 1 : 0)
    } else if (prefillData) {
      const prefillDate = prefillData.startDate 
        ? new Date(prefillData.startDate)
        : prefillData.date 
          ? new Date(prefillData.date) 
          : null
      
      setFormData(prev => ({
        ...prev,
        leadId: prefillData.leadId || '',
        clientId: prefillData.clientId || '',
        projectId: prefillData.projectId || '',
        assignedTo: prefillData.assignedTo || '',
        startDate: prefillDate ? formatDateLocal(prefillDate) : '',
        startTime: prefillDate ? formatTimeLocal(prefillDate) : '',
        endDate: prefillDate ? formatDateLocal(prefillDate) : '',
        endTime: prefillDate 
          ? formatTimeLocal(new Date(prefillDate.getTime() + 60 * 60000))
          : ''
      }))
      
      setContactType(prefillData.clientId ? 1 : 0)
    } else {
      setFormData({
        title: '',
        type: 'visita',
        notes: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        leadId: '',
        clientId: '',
        projectId: '',
        assignedTo: '',
        status: 'pendiente'
      })
      setContactType(0)
    }
    setError(null)
    setDurationInfo(null)
  }, [appointment, prefillData, open])

  useEffect(() => {
    if (formData.startDate && formData.startTime) {
      const validation = validateAppointmentDuration(
        formData.startDate,
        formData.startTime,
        formData.endDate,
        formData.endTime,
        t
      )
      
      if (validation.valid) {
        setDurationInfo({
          valid: true,
          duration: validation.duration,
          formatted: formatDuration(validation.duration, t)
        })
      } else {
        setDurationInfo({
          valid: false,
          error: validation.error
        })
      }
    } else {
      setDurationInfo(null)
    }
  }, [formData.startDate, formData.startTime, formData.endDate, formData.endTime, t])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleContactTypeChange = (event, newValue) => {
    setContactType(newValue)
    if (newValue === 0) {
      setFormData(prev => ({ ...prev, clientId: '' }))
    } else {
      setFormData(prev => ({ ...prev, leadId: '' }))
    }
  }

  const handleSubmit = async () => {
    if (!formData.title) {
      setError(t('validation.titleRequired'))
      return
    }
    if (!formData.type) {
      setError(t('validation.typeRequired'))
      return
    }
    if (!formData.startDate || !formData.startTime) {
      setError(t('validation.startDateRequired'))
      return
    }
    if (!formData.projectId) {
      setError(t('validation.projectRequired'))
      return
    }
    if (!formData.assignedTo) {
      setError(t('validation.assignedToRequired'))
      return
    }
    if (!formData.leadId && !formData.clientId) {
      setError(t('validation.contactRequired'))
      return
    }

    const durationValidation = validateAppointmentDuration(
      formData.startDate,
      formData.startTime,
      formData.endDate,
      formData.endTime,
      t
    )

    if (!durationValidation.valid) {
      setError(durationValidation.error)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const startDateISO = combineDateAndTime(formData.startDate, formData.startTime)
      const endDateISO = formData.endDate && formData.endTime
        ? combineDateAndTime(formData.endDate, formData.endTime)
        : new Date(new Date(startDateISO).getTime() + 60 * 60000).toISOString()
      
      const payload = {
        title: formData.title,
        type: formData.type,
        notes: formData.notes,
        startDate: startDateISO,
        endDate: endDateISO,
        projectId: formData.projectId,
        assignedTo: formData.assignedTo,
        status: formData.status
      }
      
      if (contactType === 0 && formData.leadId) {
        payload.leadId = formData.leadId
      } else if (contactType === 1 && formData.clientId) {
        payload.clientId = formData.clientId
      }

      if (isEditing) {
        await onSave?.(appointment._id, payload)
      } else {
        await onSave?.(null, payload)
      }
      
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('validation.saveError'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(t('confirmDelete'))) return

    setLoading(true)
    try {
      await onDelete?.(appointment._id)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('validation.deleteError'))
    } finally {
      setLoading(false)
    }
  }

  const currentStatusConfig = APPOINTMENT_STATUSES.find(s => s.value === formData.status) || APPOINTMENT_STATUSES[0]

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0, // ✅ Bordes afilados
          border: '1px solid #ececec'
        }
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: '1px solid #ececec',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Event sx={{ fontSize: 20 }} />
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            {isEditing ? t('editTitle') : t('createTitle')}
          </Typography>
          {isEditing && (
            <Box
              sx={{
                ml: 1,
                px: 1,
                py: 0.3,
                bgcolor: currentStatusConfig.color,
                color: '#fff',
                fontFamily: '"Courier New", monospace',
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                borderRadius: 0 // ✅ Bordes afilados
              }}
            >
              {t(currentStatusConfig.labelKey)}
            </Box>
          )}
        </Box>
        <IconButton onClick={onClose} size="small" disabled={loading}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ m: 3, mb: 0, borderRadius: 0 }}>
            {error}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={2.5} sx={{ p: 3 }}>
          {/* Título */}
          <TextField
            label={`${t('form.title')} *`}
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem'
              },
              '& .MuiOutlinedInput-root': { borderRadius: 0 }
            }}
          />

          {/* Tipo y Estado */}
          <Box display="flex" gap={2}>
            <FormControl size="small" fullWidth required>
              <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                {`${t('form.type')} *`}
              </InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                label={`${t('form.type')} *`}
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.75rem',
                  borderRadius: 0
                }}
              >
                {APPOINTMENT_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 10, height: 10, borderRadius: 0, bgcolor: type.color }} />
                      {t(type.labelKey)}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth required>
              <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                {`${t('form.status')} *`}
              </InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                label={`${t('form.status')} *`}
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.75rem',
                  borderRadius: 0
                }}
              >
                {APPOINTMENT_STATUSES.map(status => (
                  <MenuItem key={status.value} value={status.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 10, height: 10, borderRadius: 0, bgcolor: status.color }} />
                      {t(status.labelKey)}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Contacto */}
          <Box>
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                mb: 1,
                color: '#666'
              }}
            >
              {`${t('contact.title')} *`}
            </Typography>
            
            <Tabs
              value={contactType}
              onChange={handleContactTypeChange}
              sx={{
                borderBottom: '1px solid #ececec',
                mb: 2,
                '& .MuiTab-root': {
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  textTransform: 'none',
                  minHeight: 40
                }
              }}
            >
              <Tab icon={<TrendingUp sx={{ fontSize: 18 }} />} iconPosition="start" label={t('contact.lead')} />
              <Tab icon={<Person sx={{ fontSize: 18 }} />} iconPosition="start" label={t('contact.client')} />
            </Tabs>

            {contactType === 0 ? (
              <FormControl size="small" fullWidth required>
                <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                  {`${t('contact.lead')} *`}
                </InputLabel>
                <Select
                  value={formData.leadId}
                  onChange={(e) => handleChange('leadId', e.target.value)}
                  label={`${t('contact.lead')} *`}
                  sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0 }}
                >
                  <MenuItem value=""><em>{t('form.selectLead')}</em></MenuItem>
                  {leads.map(lead => (
                    <MenuItem key={lead._id} value={lead._id}>
                      {lead.name} {lead.phone && `- ${lead.phone}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <FormControl size="small" fullWidth required>
                <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                  {`${t('contact.client')} *`}
                </InputLabel>
                <Select
                  value={formData.clientId}
                  onChange={(e) => handleChange('clientId', e.target.value)}
                  label={`${t('contact.client')} *`}
                  sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0 }}
                >
                  <MenuItem value=""><em>{t('form.selectClient')}</em></MenuItem>
                  {residents.filter(r => r.role === 'user').map(client => (
                    <MenuItem key={client._id} value={client._id}>
                      {client.firstName} {client.lastName} {client.email && `- ${client.email}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>

          {/* Proyecto */}
          <FormControl size="small" fullWidth required>
            <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
              {`${t('form.project')} *`}
            </InputLabel>
            <Select
              value={formData.projectId}
              onChange={(e) => handleChange('projectId', e.target.value)}
              label={`${t('form.project')} *`}
              sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0 }}
            >
              {projects.map(project => (
                <MenuItem key={project._id} value={project._id}>{project.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Asesor asignado */}
          <FormControl size="small" fullWidth required>
            <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
              {`${t('form.assignedTo')} *`}
            </InputLabel>
            <Select
              value={formData.assignedTo}
              onChange={(e) => handleChange('assignedTo', e.target.value)}
              label={`${t('form.assignedTo')} *`}
              sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0 }}
            >
              {agents.map(agent => (
                <MenuItem key={agent._id} value={agent._id}>{agent.firstName} {agent.lastName}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Fecha y hora de inicio */}
          <Box>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', mb: 1, color: '#666' }}>
              {`${t('dateTime.startTitle')} *`}
            </Typography>
            <Box display="flex" gap={2}>
              <TextField
                label={`${t('form.startDate')} *`}
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
                sx={{ '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
              <TextField
                label={`${t('form.startTime')} *`}
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
                sx={{ '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
            </Box>
          </Box>

          {/* Fecha y hora de fin */}
          <Box>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', mb: 1, color: '#666' }}>
              {t('dateTime.endTitle')}
            </Typography>
            <Box display="flex" gap={2}>
              <TextField
                label={t('form.endDate')}
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{ '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
              <TextField
                label={t('form.endTime')}
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{ '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
            </Box>

            {/* Info de duración */}
            {durationInfo && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  bgcolor: durationInfo.valid ? '#e8f5e9' : '#ffebee',
                  border: `1px solid ${durationInfo.valid ? '#4caf50' : '#f44336'}`,
                  borderRadius: 0, // ✅ Bordes afilados
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <AccessTime sx={{ fontSize: 16, color: durationInfo.valid ? '#2e7d32' : '#c62828' }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: durationInfo.valid ? '#2e7d32' : '#c62828'
                  }}
                >
                  {durationInfo.valid ? t('duration.valid', { formatted: durationInfo.formatted }) : durationInfo.error}
                </Typography>
              </Box>
            )}

            {!formData.endDate && !formData.endTime && formData.startDate && formData.startTime && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#888', fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                {t('dateTime.autoEndHint')}
              </Typography>
            )}
          </Box>

          {/* Notas */}
          <TextField
            label={t('form.notes')}
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{
              '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' },
              '& .MuiOutlinedInput-root': { borderRadius: 0 }
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #ececec', p: 2, gap: 1 }}>
        {isEditing && (
          <Button
            onClick={handleDelete}
            disabled={loading}
            sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: '#d32f2f', textTransform: 'none', letterSpacing: '0.5px', mr: 'auto' }}
          >
            {t('form.delete')}
          </Button>
        )}
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: '#888', textTransform: 'none', letterSpacing: '0.5px' }}
        >
          {t('form.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <Event />}
          disabled={loading || (durationInfo && !durationInfo.valid)}
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            textTransform: 'none',
            letterSpacing: '0.5px',
            bgcolor: '#000',
            borderRadius: 0, // ✅ Bordes afilados
            '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' }
          }}
        >
          {loading ? t('form.saving') : isEditing ? t('form.update') : t('form.create')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AppointmentModal