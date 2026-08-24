import { useState, useEffect, useMemo } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Button,
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Typography, IconButton
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import api from '@shared/services/api'
import { useProjects } from '@shared/hooks/useProjects'
import { useResidents } from '@shared/hooks/useResidents'
import { getProjectById, getProjectBySlug } from '@shared/config/projectsConfig'

// ✅ Componente compartido
import ProjectSelector from '@shared/components/ProjectSelector'

export default function OnboardingForm({ open, onClose, onSuccess, initialData = null, isTourMode = false }) {
  const { t } = useTranslation('postSale')
  const { projects } = useProjects()
  const { users: residents } = useResidents(null)

  const [formData, setFormData] = useState({ projectId: '', clientId: '', propertyId: '', apartmentId: '' })
  const [availableResources, setAvailableResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const selectedProjectConfig = useMemo(() => {
    if (!formData.projectId) return null
    const proj = projects.find(p => p._id === formData.projectId)
    if (!proj) return null
    return getProjectById(proj._id) || getProjectBySlug(proj.slug)
  }, [formData.projectId, projects])

  const selectedClient = useMemo(() => {
    if (!formData.clientId) return null
    return residents.find(r => r._id === formData.clientId)
  }, [formData.clientId, residents])

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        projectId: initialData.projectId?._id || initialData.projectId || '',
        clientId: initialData.clientId?._id || initialData.clientId || '',
        propertyId: initialData.propertyId?._id || initialData.propertyId || '',
        apartmentId: initialData.apartmentId?._id || initialData.apartmentId || ''
      })
    } else if (open) {
      setFormData({ projectId: '', clientId: '', propertyId: '', apartmentId: '' })
    }
  }, [open, initialData])

  useEffect(() => {
    const fetchResources = async () => {
      if (!formData.projectId || !selectedProjectConfig) { 
        setAvailableResources([])
        return 
      }
      setLoadingResources(true)
      try {
        let resources = []
        const isHouse = selectedProjectConfig.resourceType === 'property' || selectedProjectConfig.catalogType === 'houses'
        
        if (isHouse) {
          const res = await api.get('/properties', { params: { projectId: formData.projectId } })
          resources = Array.isArray(res.data) ? res.data : (res.data.properties || res.data.data || [])
        } else {
          const res = await api.get('/apartments', { params: { projectId: formData.projectId } })
          resources = Array.isArray(res.data) ? res.data : (res.data.apartments || res.data.data || [])
        }

        if (formData.clientId) {
          resources = resources.filter(res => {
            if (Array.isArray(res.users)) return res.users.some(u => (u._id || u) === formData.clientId)
            if (isHouse && selectedClient) {
              const clientProps = (selectedClient.lots || selectedClient.properties || []).map(p => p._id || p)
              return clientProps.includes(res._id)
            }
            return false
          })
        }
        setAvailableResources(resources)
      } catch (err) { 
        console.error('Error fetching resources:', err)
        setError(t('onboarding.errorResources', 'No se pudieron cargar los recursos.'))
      } finally { 
        setLoadingResources(false) 
      }
    }
    fetchResources()
  }, [formData.projectId, formData.clientId, selectedProjectConfig, selectedClient, residents.length])

  const filteredResidents = useMemo(() => {
    if (!formData.projectId) return residents.filter(r => r.role === 'user')
    return residents.filter(r => 
      r.role === 'user' && 
      (r.projects?.some(p => p._id === formData.projectId) || 
       r.projectMemberships?.some(m => m.project?._id === formData.projectId || m.project === formData.projectId))
    )
  }, [residents, formData.projectId])

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.projectId || !formData.clientId || (!formData.propertyId && !formData.apartmentId)) {
      return setError(t('onboarding.errorValidation', 'Por favor completa Proyecto, Cliente y Propiedad.'))
    }

    if (isTourMode) {
      console.log('🎭 Modo tour: Simulando creación de onboarding...')
      setTimeout(() => {
        onSuccess()
      }, 500)
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        projectId: formData.projectId, 
        clientId: formData.clientId,
        propertyId: formData.propertyId || undefined, 
        apartmentId: formData.apartmentId || undefined
      }
      
      if (initialData?._id) {
        await api.put(`/onboarding/${initialData._id}`, payload)
      } else {
        await api.post('/onboarding', payload)
      }
      onSuccess()
    } catch (err) { 
      setError(err.response?.data?.message || t('onboarding.errorSave', 'Error al guardar el onboarding.'))
    } finally { 
      setSubmitting(false) 
    }
  }

  const unifiedButtonSx = { 
    borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', letterSpacing: '0.5px', 
    '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } 
  }
  const inputSx = { 
    fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, 
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' },
    '& .MuiOutlinedInput-root': { borderRadius: 0 }
  }
  const menuItemSx = { 
    fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, 
    '&:hover': { bgcolor: '#f5f5f5' } 
  }

  return (
    <Dialog id="onboarding-form-modal" open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}>
      
      {/* ✅ CORRECCIÓN CLAVE: Usar Typography explícito para el texto y evitar el <span> crudo dentro del flex */}
      <DialogTitle sx={{ 
        borderBottom: '1px solid #ececec', 
        p: { xs: 2, sm: 3 },
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: '"Courier New", monospace', 
            fontSize: '0.85rem', 
            letterSpacing: '1px', 
            textTransform: 'uppercase' 
          }}
        >
          {initialData?._id ? t('onboarding.editChecklist') : t('onboarding.newChecklist')}
        </Typography>
        
        <IconButton id="onboarding-form-close-btn" onClick={onClose} size="small" sx={{ borderRadius: 0 }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 0, border: '1px solid' }}>{error}</Alert>}

          <Box id="onboarding-form-project">
            <ProjectSelector
              value={formData.projectId}
              onChange={(value) => { 
                handleChange('projectId', value)
                handleChange('clientId', '')
                handleChange('propertyId', '')
                handleChange('apartmentId', '')
              }}
              label={`${t('filters.project')} *`}
              includeGlobal={false}
              fullWidth
              size="small"
            />
          </Box>

          <Box id="onboarding-form-client">
            <FormControl fullWidth required disabled={!formData.projectId}>
              <InputLabel sx={{ 
            fontFamily: '"Courier New", monospace' }} >{t('filters.client')} *</InputLabel>
              <Select 
                value={formData.clientId} 
                onChange={(e) => { 
                  handleChange('clientId', e.target.value)
                  handleChange('propertyId', '')
                  handleChange('apartmentId', '')
                }} 
                label={t('filters.client')} 
                sx={inputSx}
              >
                <MenuItem value="" sx={menuItemSx}><em>{t('onboarding.selectClient', 'Seleccionar...')}</em></MenuItem>
                {filteredResidents.map(client => (
                  <MenuItem key={client._id} value={client._id} sx={menuItemSx}>
                    {client.firstName} {client.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box id="onboarding-form-property">
            {formData.projectId && selectedProjectConfig && (
              <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 0, border: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, fontFamily: '"Courier New", monospace' }}>
                  {selectedProjectConfig.resourceType === 'apartment' 
                    ? t('upload.apartment', 'Apartamento') 
                    : t('upload.property', 'Propiedad')}
                </Typography>
                {loadingResources ? (
                  <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
                ) : (
                  <FormControl fullWidth required>
                    <InputLabel>
                      {selectedProjectConfig.resourceType === 'apartment' 
                        ? t('upload.apartment', 'Apartamento') 
                        : t('upload.property', 'Propiedad')}
                    </InputLabel>
                    <Select
                      value={selectedProjectConfig.resourceType === 'property' || selectedProjectConfig.catalogType === 'houses' 
                        ? formData.propertyId 
                        : formData.apartmentId}
                      onChange={(e) => {
                        if (selectedProjectConfig.resourceType === 'property' || selectedProjectConfig.catalogType === 'houses') { 
                          handleChange('propertyId', e.target.value)
                          handleChange('apartmentId', '')
                        } else { 
                          handleChange('apartmentId', e.target.value)
                          handleChange('propertyId', '')
                        }
                      }}
                      label={selectedProjectConfig.resourceType === 'apartment' 
                        ? t('upload.apartment', 'Apartamento') 
                        : t('upload.property', 'Propiedad')}
                      sx={inputSx}
                    >
                      <MenuItem value="" sx={menuItemSx}><em>{t('onboarding.selectProperty', 'Seleccionar...')}</em></MenuItem>
                      {availableResources.length > 0 ? availableResources.map(res => {
                        if (selectedProjectConfig.resourceType === 'property' || selectedProjectConfig.catalogType === 'houses') {
                          return (
                            <MenuItem key={res._id} value={res._id} sx={menuItemSx}>
                              Lote {res.lot?.number || res.lot || 'N/A'}
                            </MenuItem>
                          )
                        } else {
                          return (
                            <MenuItem key={res._id} value={res._id} sx={menuItemSx}>
                              Apto {res.apartmentNumber} (Piso {res.floorNumber})
                            </MenuItem>
                          )
                        }
                      }) : (
                        <MenuItem disabled sx={menuItemSx}>
                          <em>{t('onboarding.noResources', 'No hay recursos asignados')}</em>
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions id="onboarding-form-actions" sx={{ p: 2, borderTop: '1px solid #ececec', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={submitting} 
          sx={{ ...unifiedButtonSx, color: '#888', width: { xs: '100%', sm: 'auto' } }}
        >
          {t('actions.cancel')}
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit} 
          disabled={submitting} 
          startIcon={submitting ? <CircularProgress size={16} /> : null} 
          sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', width: { xs: '100%', sm: 'auto' }, '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}
        >
          {submitting ? t('actions.saving') : (initialData?._id ? t('actions.update') : t('actions.create'))}
        </Button>
      </DialogActions>
    </Dialog>
  )
}