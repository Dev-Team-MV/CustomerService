import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, IconButton,
  Select, MenuItem, FormControl, InputLabel, Autocomplete, InputAdornment, Avatar,
  useMediaQuery, useTheme
} from '@mui/material'
import { Close, Save, Person, Email, Notes } from '@mui/icons-material'
import { useProjects } from '@shared/hooks/useProjects'
import { useResidents } from '@shared/hooks/useResidents'
import { LEAD_STAGES, STAGE_COLORS } from '../../services/leadService'

import SharedPhoneInput from '@shared/constants/SharedPhoneInput'
import ProjectSelector from '@shared/components/ProjectSelector'
import CountrySelector from '@shared/components/CountrySelector'

const LEAD_SOURCES = [
  { id: 'web', label: 'Web' },
  { id: 'referido', label: 'Referido' },
  { id: 'visita', label: 'Visita' },
  { id: 'llamada', label: 'Llamada' }
]

const initialFormData = {
  name: '', email: '', phone: '', country: '', stage: 'nuevo',
  projectId: null, assignedTo: null, source: 'web', notes: ''
}

const LeadModal = ({ open, onClose, lead = null, onSave }) => {
  const { t } = useTranslation('leads')
  const theme = useTheme()
  
  const [formData, setFormData] = useState(initialFormData)
  const [saving, setSaving] = useState(false)

  const isEditing = Boolean(lead?._id)
  const { projects } = useProjects()
  const { users, loading: loadingUsers } = useResidents(null, { smsProjectId: import.meta.env.VITE_PROJECT_ID })

  const adminUserOptions = users
    .filter(u => u.role === 'admin' || u.role === 'superadmin')
    .map(u => ({ _id: u._id, name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email, email: u.email }))

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '', email: lead.email || '', phone: lead.phone || '', country: lead.country || '',
        stage: lead.stage || 'nuevo', projectId: lead.projectId?._id || lead.projectId || null,
        assignedTo: lead.assignedTo?._id || lead.assignedTo || null, source: lead.source || 'web', notes: lead.notes || ''
      })
    } else {
      setFormData({ ...initialFormData })
    }
  }, [lead, open])

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    if (!formData.name.trim()) return
    setSaving(true)
    try {
      const formattedPhone = formData.phone && !formData.phone.startsWith('+') ? `+${formData.phone}` : formData.phone
      const payload = {
        ...formData, phone: formattedPhone, country: formData.country || undefined,
        projectId: formData.projectId || undefined, assignedTo: formData.assignedTo || undefined
      }
      await onSave?.(payload, lead?._id)
      onClose()
    } catch (err) {
      console.error('Error saving lead:', err)
    } finally {
      setSaving(false)
    }
  }

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
    // ✅ ID 1: Contenedor del Dialog
    <Dialog id="lead-modal-dialog" open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}>
      <DialogTitle sx={{ borderBottom: '1px solid #ececec', display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Courier New", monospace', fontSize: { xs: '0.8rem', sm: '0.85rem' }, letterSpacing: '1px', textTransform: 'uppercase' }}>
          {isEditing ? t('editLead') : t('newLead')}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ borderRadius: 0 }}><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" flexDirection="column" gap={2.5} py={1}>
          
          {/* ✅ ID 2: Nombre */}
          <TextField 
            id="lead-modal-name"
            label={t('form.name')} 
            value={formData.name} 
            onChange={(e) => handleChange('name', e.target.value)} 
            fullWidth required placeholder={t('form.namePlaceholder')} sx={inputSx} 
            InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#aaa' }} /></InputAdornment> }} 
          />

          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
            {/* ✅ ID 3: Email */}
            <Box sx={{ flex: 1 }} id="lead-modal-email">
              <TextField 
                label={t('form.email')} 
                value={formData.email} 
                onChange={(e) => handleChange('email', e.target.value)} 
                fullWidth type="email" sx={inputSx}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#aaa' }} /></InputAdornment> }} 
              />
            </Box>
            
            {/* ✅ ID 4: Teléfono */}
            <Box sx={{ flex: 1 }} id="lead-modal-phone">
              <SharedPhoneInput
                label={t('form.phone')}
                value={formData.phone}
                onChange={(value) => handleChange('phone', value)}
                country="us"
                inputStyle={{ height: '40px', fontSize: '0.875rem', borderRadius: 0, border: '1px solid #ececec', fontFamily: '"Helvetica Neue", sans-serif', paddingLeft: '55px' }}
                containerStyle={{ width: '100%' }}
                buttonStyle={{ borderRadius: 0, border: '1px solid #ececec', borderRight: 'none', height: '40px' }}
              />
            </Box>
          </Box>

          {/* ✅ ID 5: País */}
          <Box id="lead-modal-country">
            <CountrySelector
              value={formData.country}
              onChange={(value) => handleChange('country', value)}
              label={t('form.country', 'País')}
              placeholder={t('form.selectCountry', 'Selecciona un país...')}
            />
          </Box>

          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
            {/* ✅ ID 6: Proyecto */}
            <Box sx={{ flex: 1 }} id="lead-modal-project">
              <ProjectSelector
                value={formData.projectId}
                onChange={(value) => handleChange('projectId', value)}
                label={t('form.project')}
                includeGlobal={true}
                globalLabel={t('form.noProject', '')}
              />
            </Box>
            
            {/* ✅ ID 7: Asignado a */}
            <Box sx={{ flex: 1 }} id="lead-modal-assigned">
              <Autocomplete
                options={adminUserOptions} 
                loading={loadingUsers} 
                getOptionLabel={(option) => option.name || ''} 
                isOptionEqualToValue={(option, val) => option._id === val?._id}
                value={adminUserOptions.find(u => u._id === formData.assignedTo) || null} 
                onChange={(_, newValue) => handleChange('assignedTo', newValue?._id || null)} 
                fullWidth
                renderInput={(params) => <TextField {...params} label={t('form.assignedTo')} sx={inputSx} />}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option._id} display="flex" alignItems="center" gap={1} sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', '&:hover': { bgcolor: '#f5f5f5' } }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: '#000', borderRadius: 0, fontSize: '0.7rem' }}>{option.name?.charAt(0)}</Avatar>
                    {option.name}
                  </Box>
                )}
              />
            </Box>
          </Box>

          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
            {/* ✅ ID 8: Etapa */}
            <FormControl fullWidth id="lead-modal-stage">
              <InputLabel>{t('form.stage')}</InputLabel>
              <Select value={formData.stage} label={t('form.stage')} onChange={(e) => handleChange('stage', e.target.value)} required sx={inputSx}>
                {LEAD_STAGES.map(stageKey => (
                  <MenuItem key={stageKey} value={stageKey} sx={{ fontFamily: '"Courier New", monospace' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 10, height: 10, borderRadius: 0, bgcolor: STAGE_COLORS[stageKey] }} />
                      {stageKey.charAt(0).toUpperCase() + stageKey.slice(1).replace('_', ' ')}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* ✅ ID 9: Fuente */}
            <FormControl fullWidth id="lead-modal-source">
              <InputLabel>{t('form.source')}</InputLabel>
              <Select value={formData.source} label={t('form.source')} onChange={(e) => handleChange('source', e.target.value)} sx={inputSx}>
                {LEAD_SOURCES.map(source => <MenuItem key={source.id} value={source.id} sx={{ fontFamily: '"Courier New", monospace' }}>{source.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          {/* ✅ ID 10: Notas */}
          <TextField 
            id="lead-modal-notes"
            label={t('form.notes')} 
            value={formData.notes} 
            onChange={(e) => handleChange('notes', e.target.value)} 
            fullWidth multiline rows={3} placeholder={t('form.notesPlaceholder')} 
            sx={{ ...inputSx, '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' } }} 
            InputProps={{ startAdornment: <InputAdornment position="start"><Notes sx={{ color: '#aaa' }} /></InputAdornment> }} 
          />
        </Box>
      </DialogContent>

      {/* ✅ ID 11: Contenedor de Acciones */}
      <DialogActions id="lead-modal-actions" sx={{ p: 2, borderTop: '1px solid #ececec', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
        <Button id="lead-modal-cancel-btn" onClick={onClose} disabled={saving} sx={{ ...unifiedButtonSx, color: '#888' }}>
          {t('form.cancel')}
        </Button>
        <Button 
          id="lead-modal-save-btn"
          variant="contained" 
          onClick={handleSave} 
          disabled={!formData.name.trim() || saving} 
          startIcon={<Save />} 
          sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}
        >
          {saving ? t('saving') : isEditing ? t('form.update') : t('form.create')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LeadModal