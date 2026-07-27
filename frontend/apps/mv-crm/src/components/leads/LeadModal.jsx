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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  InputAdornment
} from '@mui/material'
import { 
  Close, 
  Save, 
  Person, 
  Email, 
  Phone, 
  Business,
  Notes
} from '@mui/icons-material'
import { useProjects } from '@shared/hooks/useProjects'
import { useResidents } from '@shared/hooks/useResidents'
import { LEAD_STAGES, STAGE_COLORS } from '../../services/leadService'

// ✅ Importar el autocompletado de Google Places
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import SharedPhoneInput from '@shared/constants/SharedPhoneInput'

const LEAD_SOURCES = [
  { id: 'web', label: 'Web' },
  { id: 'referido', label: 'Referido' },
  { id: 'visita', label: 'Visita' },
  { id: 'llamada', label: 'Llamada' }
]

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  country: '', // ✅ Nuevo campo
  stage: 'nuevo',
  projectId: null,
  assignedTo: null,
  source: 'web',
  notes: ''
}

const LeadModal = ({ 
  open, 
  onClose, 
  lead = null, 
  onSave
}) => {
  const { t } = useTranslation('leads')
  const [formData, setFormData] = useState(initialFormData)
  const [saving, setSaving] = useState(false)

  const isEditing = Boolean(lead?._id)

  const { projects, loading: loadingProjects } = useProjects()
  const { users, loading: loadingUsers } = useResidents(null, { 
    smsProjectId: import.meta.env.VITE_PROJECT_ID 
  })

  const adminUserOptions = users
    .filter(u => u.role === 'admin' || u.role === 'superadmin')
    .map(u => ({
      _id: u._id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      email: u.email
    }))

  const projectOptions = projects.map(p => ({
    _id: p._id,
    name: p.name || p.title?.es || p.title?.en || p.slug || 'Sin nombre'
  }))

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        country: lead.country || '', // ✅ Cargar país al editar
        stage: lead.stage || 'nuevo',
        projectId: lead.projectId?._id || lead.projectId || null,
        assignedTo: lead.assignedTo?._id || lead.assignedTo || null,
        source: lead.source || 'web',
        notes: lead.notes || ''
      })
    } else {
      setFormData({ ...initialFormData })
    }
  }, [lead, open])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // ✅ Manejador específico para el autocompletado de Google
  const handleCountryChange = (newValue) => {
    const countryName = newValue ? newValue.label : ''
    handleChange('country', countryName)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) return
    
    setSaving(true)
    try {
      const formattedPhone = formData.phone && !formData.phone.startsWith('+') 
        ? `+${formData.phone}` 
        : formData.phone

      const payload = {
        ...formData,
        phone: formattedPhone,
        country: formData.country || undefined, // ✅ Incluir en payload
        projectId: formData.projectId || undefined,
        assignedTo: formData.assignedTo || undefined
      }
      
      await onSave?.(payload, lead?._id)
      onClose()
    } catch (err) {
      console.error('Error saving lead:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            {isEditing ? t('editLead') : t('newLead')}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2.5} py={1}>
          {/* Nombre */}
          <TextField
            label={t('form.name')}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
            required
            placeholder={t('form.namePlaceholder')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              )
            }}
          />

          {/* Email y Teléfono */}
          <Box display="flex" gap={2}>
            <TextField
              label={t('form.email')}
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              fullWidth
              type="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                )
              }}
            />
            
            <SharedPhoneInput
              label={t('form.phone')}
              value={formData.phone}
              onChange={(value) => handleChange('phone', value)}
              country="us"
              inputStyle={{ height: '56px', fontSize: '16px', borderRadius: '4px' }}
              containerStyle={{ width: '100%' }}
            />
          </Box>

          {/* ✅ NUEVO: Campo de País */}
          <Box>
            <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: 'text.secondary', fontFamily: '"DM Sans", sans-serif' }}>
              {t('form.country', 'País')}
            </Typography>
            <GooglePlacesAutocomplete
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
              selectProps={{
                value: formData.country ? { label: formData.country, value: formData.country } : null,
                onChange: handleCountryChange,
                placeholder: t('form.selectCountry', 'Selecciona un país...'),
                styles: {
                  control: (provided) => ({
                    ...provided,
                    borderRadius: 4,
                    border: '1px solid rgba(0, 0, 0, 0.23)',
                    fontFamily: '"DM Sans", sans-serif',
                    minHeight: 56,
                    boxShadow: 'none',
                    '&:hover': { borderColor: 'rgba(0, 0, 0, 0.87)' },
                    padding: '0 14px',
                    '& .MuiInputBase-input': { padding: '16.5px 14px' }
                  }),
                  menu: (provided) => ({
                    ...provided,
                    fontFamily: '"DM Sans", sans-serif',
                    borderRadius: 4,
                    marginTop: 8,
                    zIndex: 9999,
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    fontFamily: '"DM Sans", sans-serif',
                    backgroundColor: state.isSelected ? '#1976d2' : state.isFocused ? '#f5f5f5' : 'white',
                    color: state.isSelected ? 'white' : 'black',
                  })
                }
              }}
              autocompletionRequest={{ types: ['country'] }}
            />
          </Box>

          {/* Proyecto y Asesor */}
          <Box display="flex" gap={2}>
            <Autocomplete
              options={projectOptions}
              loading={loadingProjects}
              getOptionLabel={(option) => option.name || ''}
              isOptionEqualToValue={(option, val) => option._id === val}
              value={projectOptions.find(p => p._id === formData.projectId) || null}
              onChange={(_, newValue) => handleChange('projectId', newValue?._id || null)}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} label={t('form.project')} />
              )}
            />

            <Autocomplete
              options={adminUserOptions}
              loading={loadingUsers}
              getOptionLabel={(option) => option.name || ''}
              isOptionEqualToValue={(option, val) => option._id === val}
              value={adminUserOptions.find(u => u._id === formData.assignedTo) || null}
              onChange={(_, newValue) => handleChange('assignedTo', newValue?._id || null)}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} label={t('form.assignedTo')} />
              )}
            />
          </Box>

          {/* Stage y Fuente */}
          <Box display="flex" gap={2}>
            <FormControl fullWidth>
              <InputLabel>{t('form.stage')}</InputLabel>
              <Select
                value={formData.stage}
                label={t('form.stage')}
                onChange={(e) => handleChange('stage', e.target.value)}
                required
              >
                {LEAD_STAGES.map(stageKey => (
                  <MenuItem key={stageKey} value={stageKey}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: STAGE_COLORS[stageKey] }} />
                      {stageKey.charAt(0).toUpperCase() + stageKey.slice(1).replace('_', ' ')}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t('form.source')}</InputLabel>
              <Select
                value={formData.source}
                label={t('form.source')}
                onChange={(e) => handleChange('source', e.target.value)}
              >
                {LEAD_SOURCES.map(source => (
                  <MenuItem key={source.id} value={source.id}>
                    {source.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Notas */}
          <TextField
            label={t('form.notes')}
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder={t('form.notesPlaceholder')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Notes />
                </InputAdornment>
              )
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          {t('form.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!formData.name.trim() || saving}
          startIcon={<Save />}
        >
          {saving ? t('saving') : isEditing ? t('form.update') : t('form.create')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LeadModal