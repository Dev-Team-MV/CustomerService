import { useState, useEffect, useMemo } from 'react'
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  Box, TextField, FormControl, InputLabel, Select, MenuItem, 
  CircularProgress, Alert, Typography 
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import referralService from '@shared/services/referralService'
import { useProjects } from '@shared/hooks/useProjects'
import { useResidents } from '@shared/hooks/useResidents'

// ✅ Importar el autocompletado de Google Places
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import SharedPhoneInput from '@shared/constants/SharedPhoneInput'

export default function SubmitReferralModal({ open, onClose, onSuccess, mode = 'customer' }) {
  const { t } = useTranslation('referrals')
  const { projects } = useProjects()
  const { users: residents } = useResidents(null)

  const envProjectId = import.meta.env.VITE_PROJECT_ID || ''
  const [projectId, setProjectId] = useState(mode === 'customer' ? envProjectId : '')
  const [referrerId, setReferrerId] = useState('')
  
  const [formData, setFormData] = useState({
    referredName: '',
    referredPhone: '',
    referredEmail: '',
    country: '', // ✅ Mantenemos 'country' en el estado interno del formulario
    
    notes: '',
    rewardType: 'cash',
    rewardPerReferral: 0,
    discountPercent: 0
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const filteredReferrers = useMemo(() => {
    if (mode === 'customer' || !projectId) return []
    return residents.filter(r => 
      r.role === 'user' && 
      (r.projects?.some(p => p._id === projectId) || 
       r.projectMemberships?.some(m => m.project?._id === projectId || m.project === projectId))
    )
  }, [mode, projectId, residents])

  useEffect(() => {
    if (open) {
      setProjectId(mode === 'customer' ? envProjectId : '')
      setReferrerId('')
      setFormData({ 
        referredName: '', 
        referredPhone: '', 
        referredEmail: '', 
        country: '', // ✅ Resetear campo
        notes: '',
        rewardType: 'cash', 
        rewardPerReferral: 0, 
        discountPercent: 0
      })
      setError('')
    }
  }, [open, mode, envProjectId])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // ✅ Manejador específico para el autocompletado de Google
  const handleCountryChange = (newValue) => {
    const countryName = newValue ? newValue.label : ''
    handleChange('country', countryName)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!projectId) return setError(t('errors.projectRequired'))
    if (mode === 'crm' && !referrerId) return setError(t('errors.referrerRequired'))
    if (!formData.referredName || !formData.referredPhone) return setError(t('errors.contactRequired'))

    setSubmitting(true)
    setError('')

    try {
      const formattedPhone = formData.referredPhone && !formData.referredPhone.startsWith('+') 
        ? `+${formData.referredPhone}` 
        : formData.referredPhone

      if (mode === 'customer') {
        await referralService.submit({
          projectId,
          referredName: formData.referredName,
          referredPhone: formattedPhone,
          referredEmail: formData.referredEmail || undefined,
          referredCountry: formData.country || undefined, // ✅ CORREGIDO: Nombre exacto que espera el backend
          notes: formData.notes || undefined
        })
      } else {
        const payload = {
          referrerId,
          projectId,
          referredName: formData.referredName,
          referredPhone: formattedPhone,
          referredEmail: formData.referredEmail || undefined,
          referredCountry: formData.country || undefined, // ✅ CORREGIDO: Nombre exacto que espera el backend
          notes: formData.notes || undefined,
          rewardType: formData.rewardType
        }
        
        if (formData.rewardType === 'cash') {
          payload.rewardPerReferral = Number(formData.rewardPerReferral)
        } else if (formData.rewardType === 'property_discount') {
          payload.discountPercent = Number(formData.discountPercent)
        }
        
        await referralService.create(payload)
      }
      
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Error submitting referral:', err)
      setError(err.response?.data?.message || t('errors.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === 'customer' ? t('modal.submitTitle') : t('modal.createTitle')}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {mode === 'crm' && (
              <FormControl fullWidth required>
                <InputLabel>{t('fields.project')}</InputLabel>
                <Select 
                  value={projectId} 
                  onChange={(e) => { setProjectId(e.target.value); setReferrerId('') }} 
                  label={t('fields.project')}
                >
                  <MenuItem value=""><em>{t('common.select')}</em></MenuItem>
                  {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
            )}

            {mode === 'crm' && (
              <FormControl fullWidth required disabled={!projectId}>
                <InputLabel>{t('fields.referrer')}</InputLabel>
                <Select 
                  value={referrerId} 
                  onChange={(e) => setReferrerId(e.target.value)} 
                  label={t('fields.referrer')}
                >
                  <MenuItem value=""><em>{t('common.select')}</em></MenuItem>
                  {filteredReferrers.map(client => (
                    <MenuItem key={client._id} value={client._id}>
                      {client.firstName} {client.lastName}
                    </MenuItem>
                  ))}
                </Select>
                {projectId && filteredReferrers.length === 0 && (
                  <Typography variant="caption" color="warning.main" sx={{ mt: 0.5 }}>
                    {t('warnings.noReferrers')}
                  </Typography>
                )}
              </FormControl>
            )}

            <TextField 
              required 
              fullWidth 
              size="small" 
              label={t('fields.referredName')} 
              value={formData.referredName} 
              onChange={(e) => handleChange('referredName', e.target.value)} 
            />
            
            <SharedPhoneInput
              label={t('fields.referredPhone')}
              value={formData.referredPhone}
              onChange={(value) => handleChange('referredPhone', value)}
              required={true}
              country="co"
            />
            
            <TextField 
              fullWidth 
              size="small" 
              label={t('fields.referredEmail')} 
              type="email" 
              value={formData.referredEmail} 
              onChange={(e) => handleChange('referredEmail', e.target.value)} 
            />

            {/* ✅ Campo de País */}
            <Box>
              <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: 'text.secondary', fontFamily: '"DM Sans", sans-serif' }}>
                {t('fields.country', 'País')}
              </Typography>
              <GooglePlacesAutocomplete
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                selectProps={{
                  value: formData.country ? { label: formData.country, value: formData.country } : null,
                  onChange: handleCountryChange,
                  placeholder: t('fields.selectCountry', 'Selecciona un país...'),
                  styles: {
                    control: (provided) => ({
                      ...provided,
                      borderRadius: 4,
                      border: '1px solid rgba(0, 0, 0, 0.23)',
                      fontFamily: '"DM Sans", sans-serif',
                      minHeight: 40, // Tamaño small de MUI
                      boxShadow: 'none',
                      '&:hover': { borderColor: 'rgba(0, 0, 0, 0.87)' },
                      padding: '0 8px',
                      '& .MuiInputBase-input': { padding: '8px 6px' }
                    }),
                    menu: (provided) => ({
                      ...provided,
                      fontFamily: '"DM Sans", sans-serif',
                      borderRadius: 4,
                      marginTop: 4,
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

            {mode === 'crm' && (
              <>
                <FormControl fullWidth required>
                  <InputLabel>{t('fields.rewardType')}</InputLabel>
                  <Select 
                    value={formData.rewardType} 
                    onChange={(e) => handleChange('rewardType', e.target.value)} 
                    label={t('fields.rewardType')}
                  >
                    <MenuItem value="cash">Efectivo (Cash)</MenuItem>
                    <MenuItem value="property_discount">Descuento en Propiedad</MenuItem>
                  </Select>
                </FormControl>

                {formData.rewardType === 'cash' && (
                  <TextField 
                    required 
                    fullWidth 
                    type="number" 
                    size="small" 
                    label={t('fields.rewardPerReferral')} 
                    value={formData.rewardPerReferral} 
                    onChange={(e) => handleChange('rewardPerReferral', Number(e.target.value))} 
                  />
                )}

                {formData.rewardType === 'property_discount' && (
                  <TextField 
                    required 
                    fullWidth 
                    type="number" 
                    size="small" 
                    label={t('fields.discountPercent')} 
                    value={formData.discountPercent} 
                    onChange={(e) => handleChange('discountPercent', Number(e.target.value))} 
                  />
                )}
              </>
            )}

            <TextField 
              fullWidth 
              size="small" 
              multiline 
              rows={3} 
              label={t('fields.notes')} 
              value={formData.notes} 
              onChange={(e) => handleChange('notes', e.target.value)} 
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Button onClick={onClose} disabled={submitting}>
            {t('actions.cancel')}
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={submitting}
            startIcon={submitting && <CircularProgress size={16} />}
          >
            {submitting ? t('actions.saving') : t('actions.submit')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}