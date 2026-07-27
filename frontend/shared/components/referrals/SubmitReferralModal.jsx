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

import SharedPhoneInput from '@shared/constants/SharedPhoneInput' // Ajusta la ruta si es necesario

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validaciones usando las claves del JSON
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
          notes: formData.notes || undefined
        })
      } else {
        const payload = {
          referrerId,
          projectId,
          referredName: formData.referredName,
          referredPhone: formattedPhone,
          referredEmail: formData.referredEmail || undefined,
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