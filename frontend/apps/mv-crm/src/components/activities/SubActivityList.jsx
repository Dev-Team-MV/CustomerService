import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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
  InputAdornment,
  useTheme
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
  Phone
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { es, enUS } from 'date-fns/locale'
import { useResidents } from '@shared/hooks/useResidents'

const formatDate = (date, locale = 'es') => {
  if (!date) return null
  const d = new Date(date)
  return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { 
    day: 'numeric', 
    month: 'short'
  })
}

// ══════════════════════════════════════════════════════════════
// COMPONENTE: SubActivityItem (Item individual de subactividad)
// ═══════════════════════════════════════════════════════════════

const SubActivityItem = ({ sub, onToggle, onEdit, onDelete, readOnly, t }) => {
  const isCompleted = sub.completed || sub.status === 'completed'
  const isOverdue = sub.dueDate && new Date(sub.dueDate) < new Date() && !isCompleted

  // ✅ Estilos unificados
  const theme = useTheme()

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 1,
        borderRadius: 0, // ✅ Bordes afilados
        bgcolor: isCompleted ? '#f5f5f5' : 'white',
        borderColor: isOverdue ? '#f44336' : '#e0e0e0',
        borderLeftWidth: 3,
        borderLeftColor: isCompleted ? '#4caf50' : isOverdue ? '#f44336' : '#2196f3',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: isCompleted ? 'none' : '4px 4px 0px rgba(0,0,0,0.08)',
          borderColor: isOverdue ? '#f44336' : '#000'
        }
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
            '&.Mui-checked': { color: '#4caf50' },
            borderRadius: 0
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
              color: isCompleted ? '#9e9e9e' : '#000',
              fontFamily: '"Helvetica Neue", sans-serif'
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
                mt: 0.5,
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem'
              }}
            >
              {sub.description}
            </Typography>
          )}

          {/* Meta info: fecha, asignado, contacto */}
          <Box display="flex" alignItems="center" gap={1.5} mt={1} flexWrap="wrap">
            {sub.dueDate && (
              <Tooltip title={isOverdue ? t('activities.subActivities.status.overdue') : ''}>
                <Chip
                  icon={<AccessTime sx={{ fontSize: 12 }} />}
                  label={formatDate(sub.dueDate)}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: isOverdue ? '#f4433620' : '#2196f320',
                    color: isOverdue ? '#f44336' : '#2196f3',
                    borderRadius: 0, // ✅ Bordes afilados
                    fontFamily: '"Courier New", monospace',
                    '& .MuiChip-icon': { color: 'inherit' }
                  }}
                />
              </Tooltip>
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
                      bgcolor: '#2196f3',
                      borderRadius: 0 // ✅ Bordes afilados
                    }}>
                      {sub.assignedTo.firstName?.charAt(0) || '?'}
                    </Avatar>
                  }
                  label={sub.assignedTo.firstName?.split(' ')[0] || t('activities.user')}
                  size="small"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.65rem',
                    borderRadius: 0, // ✅ Bordes afilados
                    fontFamily: '"Courier New", monospace',
                    bgcolor: '#e3f2fd'
                  }}
                />
              </Tooltip>
            )}

            {/* Contacto externo */}
            {sub.contact && !sub.assignedTo && (
              <Tooltip title={`${sub.contact.name} (${sub.contact.phone})`}>
                <Chip
                  avatar={
                    <Avatar sx={{ 
                      width: 16, 
                      height: 16, 
                      fontSize: 8,
                      bgcolor: '#ff9800',
                      borderRadius: 0 // ✅ Bordes afilados
                    }}>
                      {sub.contact.name?.charAt(0) || '?'}
                    </Avatar>
                  }
                  label={sub.contact.name?.split(' ')[0] || t('activities.contact.noContact')}
                  size="small"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.65rem',
                    borderRadius: 0, // ✅ Bordes afilados
                    fontFamily: '"Courier New", monospace',
                    bgcolor: '#fff3e0',
                    color: '#f57c00'
                  }}
                />
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Actions */}
        {!readOnly && (
          <Box display="flex" gap={0.5}>
            <Tooltip title={t('activities.form.edit')}>
              <IconButton size="small" onClick={() => onEdit?.(sub)} sx={{ borderRadius: 0 }}>
                <Edit sx={{ fontSize: 16, color: '#757575' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('activities.form.delete')}>
              <IconButton size="small" onClick={() => onDelete?.(sub._id)} sx={{ borderRadius: 0 }}>
                <Delete sx={{ fontSize: 16, color: '#f44336' }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Paper>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE: SubActivityModal (Modal para crear/editar)
// ═══════════════════════════════════════════════════════════════

const SubActivityModal = ({ open, onClose, onSave, subActivity = null, parentActivityId = null }) => {
  const { t, i18n } = useTranslation('activities')
  const theme = useTheme()
  
  const [formData, setFormData] = useState({
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
  const [searchInput, setSearchInput] = useState('')
  const [saving, setSaving] = useState(false)

  const { users, loading } = useResidents(null, { smsProjectId: import.meta.env.VITE_PROJECT_ID })

  const userOptions = useMemo(() => {
    const filtered = searchInput.trim() 
      ? users.filter(u =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchInput.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchInput.toLowerCase())
        )
      : users
    
    return filtered
  }, [users, searchInput])

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
      alert(t('activities.subActivities.alerts.titleRequired'))
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate
      }

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

  const dateLocale = i18n.language === 'es' ? es : enUS

  // ✅ Estilos unificados (idénticos a ActivityModal)
  const unifiedButtonSx = { 
    borderRadius: 0, 
    textTransform: 'none', 
    fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', 
    letterSpacing: '0.5px',
    '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } 
  }
  
  const inputSx = { 
    fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', 
    borderRadius: 0, 
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' },
    '& .MuiOutlinedInput-root': { borderRadius: 0 }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ 
        sx: { 
          borderRadius: 0, 
          border: '1px solid #ececec' 
        } 
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #ececec', 
        p: 3,
        fontFamily: '"Courier New", monospace',
        fontSize: '0.85rem',
        letterSpacing: '1px',
        textTransform: 'uppercase'
      }}>
        {subActivity 
          ? t('activities.subActivities.editSubActivity') 
          : t('activities.subActivities.newSubActivity')}
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
          <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
            {/* Título */}
            <TextField
              label={t('activities.subActivities.form.title')}
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              required
              autoFocus
              placeholder={t('activities.subActivities.form.titlePlaceholder')}
              sx={inputSx}
            />

            {/* Descripción */}
            <TextField
              label={t('activities.subActivities.form.description')}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
              placeholder={t('activities.subActivities.form.descriptionPlaceholder')}
              sx={inputSx}
            />

            {/* Fecha límite */}
            <DatePicker
              label={t('activities.subActivities.form.dueDate')}
              value={formData.dueDate}
              onChange={(newValue) => setFormData(prev => ({ ...prev, dueDate: newValue }))}
              slotProps={{ 
                textField: { 
                  fullWidth: true,
                  sx: inputSx 
                } 
              }}
            />

            {/* Sección de asignación */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1.5} sx={{ 
                fontFamily: '"Courier New", monospace', 
                fontSize: '0.7rem', 
                letterSpacing: '1px', 
                textTransform: 'uppercase' 
              }}>
                {t('activities.subActivities.form.assignTo')}
              </Typography>
              
              {/* Selector de tipo */}
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                <Chip
                  label={t('activities.subActivities.form.noAssignment')}
                  onClick={() => handleContactTypeChange('none')}
                  color={formData.contactType === 'none' ? 'primary' : 'default'}
                  variant={formData.contactType === 'none' ? 'filled' : 'outlined'}
                  sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}
                />
                <Chip
                  label={t('activities.subActivities.form.registeredUser')}
                  icon={<Person sx={{ fontSize: 16 }} />}
                  onClick={() => handleContactTypeChange('user')}
                  color={formData.contactType === 'user' ? 'primary' : 'default'}
                  variant={formData.contactType === 'user' ? 'filled' : 'outlined'}
                  sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}
                />
                <Chip
                  label={t('activities.subActivities.form.externalContact')}
                  icon={<PersonAdd sx={{ fontSize: 16 }} />}
                  onClick={() => handleContactTypeChange('external')}
                  color={formData.contactType === 'external' ? 'warning' : 'default'}
                  variant={formData.contactType === 'external' ? 'filled' : 'outlined'}
                  sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}
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
                      label={t('activities.subActivities.form.searchUser')}
                      placeholder={t('activities.subActivities.form.searchByName')}
                      sx={inputSx}
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
                    <Box component="li" {...props} display="flex" alignItems="center" gap={1.5} py={1} sx={{ borderRadius: 0 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#2196f3', fontSize: 12, borderRadius: 0 }}>
                        {option.firstName?.charAt(0) || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                          {option.firstName} {option.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>
                          {option.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              )}

              {/* Contacto externo */}
              {formData.contactType === 'external' && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 0, bgcolor: '#fff8e1', border: '1px solid #ffe0b2' }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <PersonAdd color="warning" fontSize="small" />
                    <Typography variant="body2" color="warning.main" fontWeight={500} sx={{ fontFamily: '"Courier New", monospace' }}>
                      {t('activities.subActivities.form.unregisteredContact')}
                    </Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    <TextField
                      label={t('activities.subActivities.form.name')}
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
                      sx={inputSx}
                    />
                    <TextField
                      label={t('activities.subActivities.form.email')}
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
                      sx={inputSx}
                    />
                    <TextField
                      label={t('activities.subActivities.form.phone')}
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
                      sx={inputSx}
                    />
                  </Box>
                </Paper>
              )}
            </Box>
          </Box>
        </LocalizationProvider>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: '1px solid #ececec', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={saving}
          sx={{ ...unifiedButtonSx, color: '#888' }}
        >
          {t('activities.subActivities.form.cancel')}
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={!formData.title.trim() || saving}
          startIcon={saving ? <CircularProgress size={20} /> : null}
          sx={{ 
            ...unifiedButtonSx, 
            bgcolor: '#000', 
            color: '#fff',
            '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } 
          }}
        >
          {subActivity 
            ? t('activities.subActivities.form.saveChanges') 
            : t('activities.subActivities.form.addSubtask')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: SubActivityList
// ═══════════════════════════════════════════════════════════════

const SubActivityList = ({ 
  subActivities = [], 
  onAdd, 
  onUpdate, 
  onDelete,
  parentActivityId = null,
  readOnly = false 
}) => {
  const { t } = useTranslation('activities')
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
      await onUpdate?.(subId, data)
    } else {
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
        sx={{ 
          cursor: 'pointer', 
          mb: 1, 
          p: 1, 
          borderRadius: 0, // ✅ Bordes afilados
          '&:hover': { bgcolor: '#f5f5f5' } 
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <SubdirectoryArrowRight sx={{ fontSize: 20, color: '#757575' }} />
          <Typography variant="subtitle2" fontWeight={600} sx={{ 
            fontFamily: '"Courier New", monospace', 
            fontSize: '0.7rem', 
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            {t('activities.subActivities.title')}
          </Typography>
          {totalCount > 0 && (
            <Chip
              label={`${completedCount}/${totalCount}`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                bgcolor: completedCount === totalCount ? '#4caf5020' : '#ff980020',
                color: completedCount === totalCount ? '#4caf50' : '#ff9800',
                fontWeight: 600,
                borderRadius: 0, // ✅ Bordes afilados
                fontFamily: '"Courier New", monospace'
              }}
            />
          )}
        </Box>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }} sx={{ borderRadius: 0 }}>
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
                t={t}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ pl: 1, display: 'block', py: 1, fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
            {t('activities.subActivities.noSubActivities')}
          </Typography>
        )}

        {/* Botón agregar */}
        {!readOnly && (
          <Button
            startIcon={<Add />}
            size="small"
            onClick={() => handleOpenModal()}
            sx={{ 
              textTransform: 'none', 
              mt: 1, 
              ml: 0.5,
              borderRadius: 0, // ✅ Bordes afilados
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              border: '1px solid #000',
              color: '#000',
              '&:hover': { 
                bgcolor: '#f5f5f5', 
                boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' 
              } 
            }}
          >
            {t('activities.subActivities.addSubActivity')}
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