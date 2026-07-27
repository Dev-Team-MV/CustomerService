import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Box, Button, Typography, CircularProgress, Alert, 
  Chip, Divider, TextField, Grid, Container, Tabs, Tab, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, ImageList, ImageListItem,
  FormControl, InputLabel, Select, MenuItem, IconButton
} from '@mui/material'
import { ArrowBack, Add, Visibility, CheckCircle, Build, Cancel } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'

import { useAuth } from '@shared/context/AuthContext'
import warrantyService from '@shared/services/warrantyService'
import uploadService from '@shared/services/uploadService'
import { useWarranties } from '@shared/hooks/useWarranties'
import { useResolvedProperties } from '@shared/hooks/useResolvedProperties'
import PageSection from '@shared/components/PageSection'
import Loader from '@shared/components/Loader'
import CustomerWarrantyTimeline from '@shared/components/Warranties/CustomerWarrantyTimeline'

import api from '@shared/services/api'
import { getProjectById, RESOURCE_TYPES } from '@shared/config/projectsConfig'

const C = {
  dark:    '#004535',
  green:   '#004535',
  orange:  '#E5863C',
  gray:    '#706f6f',
  bg:      '#eef2e8',
  bgLight: '#f5f7f1',
  border:  '#d6ddc9',
}

export default function CustomerWarrantyPage() {
  const { t } = useTranslation('postSale')
  const { user } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()

  const PROJECTID = import.meta.env.VITE_PROJECT_ID || ''
  const [tabValue, setTabValue] = useState(0)

  const [formData, setFormData] = useState({
    projectId: PROJECTID,
    propertyId: '',
    apartmentId: '',
    category: 'structural',
    priority: 'medium',
    description: '',
    photoUrls: []
  })
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const { data: warranties, loading: warrantiesLoading, refresh: refreshWarranties } = useWarranties({
    clientId: user?._id,
    projectId: PROJECTID 
  })

  const { propertiesMap, loading: resolvingProperties } = useResolvedProperties(warranties || [])
  const [userProperties, setUserProperties] = useState([])
  const [loadingProperties, setLoadingProperties] = useState(false)

  useEffect(() => {
    const fetchUserProperties = async () => {
      if (!user?._id || !PROJECTID) return
      setLoadingProperties(true)
      try {
        const projectConfig = getProjectById(PROJECTID)
        const isApartmentProject = projectConfig?.resourceType === RESOURCE_TYPES.APARTMENT
        let fetchedProps = []
        
        if (isApartmentProject) {
          const res = await api.get('/apartments', { params: { projectId: PROJECTID } })
          const data = Array.isArray(res.data) ? res.data : (res.data.apartments || res.data.data || [])
          fetchedProps = data.filter(p => {
            if (p.userId === user._id) return true
            if (p.users && Array.isArray(p.users)) {
              return p.users.some(u => (typeof u === 'object' ? u._id : u) === user._id)
            }
            return false
          })
        } else {
          const res = await api.get('/properties', { params: { projectId: PROJECTID } })
          const data = Array.isArray(res.data) ? res.data : (res.data.properties || res.data.data || [])
          fetchedProps = data.filter(p => {
            if (p.userId === user._id) return true
            if (p.users && Array.isArray(p.users)) {
              return p.users.some(u => (typeof u === 'object' ? u._id : u) === user._id)
            }
            return false
          })
        }
        
        const mappedProps = fetchedProps.map(p => {
          const isObj = typeof p === 'object' && p !== null
          const id = isObj ? p._id : p
          const isApt = isObj && (p.apartmentNumber || p.floorNumber || p.building)
          const type = isApt ? 'apartment' : 'property'
          let label = t('common.na', 'N/A')
          
          if (type === 'apartment') {
            const bldgName = isObj && typeof p.building === 'object' ? p.building.name : t('warranty.building', 'Edificio')
            label = `${t('warranty.apt', 'Apt')} ${p.apartmentNumber || t('common.na', 'N/A')} ${bldgName !== t('warranty.building', 'Edificio') ? `- ${bldgName}` : ''}`
          } else {
            const lotNum = isObj ? (p.number || p.lot?.number) : (typeof p === 'string' ? p.slice(-6) : t('common.na', 'N/A'))
            const modelName = isObj && p.model ? (p.model.name || p.model.model) : ''
            label = `${t('warranty.lot', 'Lote')} ${lotNum} ${modelName ? `- ${modelName}` : ''}`
          }
          return { _id: id, type, label }
        })
        
        setUserProperties(mappedProps)
        if (mappedProps.length === 1) {
          if (mappedProps[0].type === 'apartment') {
            setFormData(prev => ({ ...prev, apartmentId: mappedProps[0]._id, propertyId: '' }))
          } else {
            setFormData(prev => ({ ...prev, propertyId: mappedProps[0]._id, apartmentId: '' }))
          }
        }
      } catch (err) {
        console.error('Error fetching user properties:', err)
      } finally {
        setLoadingProperties(false)
      }
    }
    fetchUserProperties()
  }, [user, PROJECTID, t])

  const getPropertyLabel = (warranty) => {
    const { lots = {}, models = {}, buildings = {}, apartments = {} } = propertiesMap

    if (warranty.apartmentId) {
      const aptId = typeof warranty.apartmentId === 'string' ? warranty.apartmentId : warranty.apartmentId?._id
      const apt = apartments[aptId] || (typeof warranty.apartmentId === 'object' ? warranty.apartmentId : null)
      if (apt) {
        const bldgId = typeof apt.building === 'string' ? apt.building : apt.building?._id
        const bldg = buildings[bldgId] || (typeof apt.building === 'object' ? apt.building : null)
        return `${t('warranty.apartment', 'Apartamento')} ${apt.apartmentNumber || t('common.na', 'N/A')} - ${bldg?.name || t('warranty.building', 'Edificio')}`
      }
      return `${t('warranty.apartment', 'Apartamento')} ${aptId ? String(aptId).slice(-6) : t('common.na', 'N/A')}`
    }

    if (warranty.propertyId) {
      const propId = typeof warranty.propertyId === 'string' ? warranty.propertyId : warranty.propertyId?._id
      const prop = lots[propId] || (typeof warranty.propertyId === 'object' ? warranty.propertyId : null)
      if (prop) {
        const lotId = typeof prop.lot === 'string' ? prop.lot : prop.lot?._id
        const modelId = typeof prop.model === 'string' ? prop.model : prop.model?._id
        const lotData = lots[lotId] || prop
        const modelData = models[modelId] || (typeof prop.model === 'object' ? prop.model : null)
        const lotNumber = lotData?.number || lotData?.lot?.number || t('common.na', 'N/A')
        const modelName = modelData?.name || modelData?.model || ''
        return `${t('warranty.lot', 'Lote')} ${lotNumber} ${modelName ? `- ${modelName}` : ''}`
      }
      return `${t('warranty.lot', 'Lote')} ${propId ? String(propId).slice(-6) : t('common.na', 'N/A')}`
    }
    return t('warranty.unspecifiedProperty', 'Propiedad no especificada')
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const urls = await Promise.all(files.map(file => uploadService.uploadImage(file, 'warranties', '', true)))
      setFormData(prev => ({ ...prev, photoUrls: [...prev.photoUrls, ...urls] }))
    } catch (err) {
      setError(t('warranty.uploadError', 'Error al subir las imágenes.'))
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (index) => {
    setFormData(prev => ({ ...prev, photoUrls: prev.photoUrls.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async () => {
    setError(null)
    if ((!formData.propertyId && !formData.apartmentId) || !formData.description) {
      setError(t('warranty.requiredFields', 'Por favor selecciona una propiedad y describe el problema.'))
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        clientId: user._id,
        projectId: PROJECTID,
        propertyId: formData.propertyId || undefined,
        apartmentId: formData.apartmentId || undefined,
        category: formData.category,
        priority: formData.priority,
        description: formData.description,
        photoUrls: formData.photoUrls,
        status: 'submitted'
      }
      await warrantyService.create(payload)
      setSuccess(true)
      refreshWarranties()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Error creating warranty:', err)
      setError(err.response?.data?.message || t('warranty.submitError', 'Error al enviar el reclamo.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    if (newValue === 0) setSuccess(false)
  }

  const [selectedWarranty, setSelectedWarranty] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleViewDetails = (warranty) => {
    setSelectedWarranty(warranty)
    setDetailOpen(true)
  }

  // ✅ CORRECCIÓN 1: useMemo movido al nivel superior para cumplir las Reglas de Hooks
  const timelineEvents = useMemo(() => {
    if (!selectedWarranty) return []
    const events = []
    events.push({
      status: 'submitted',
      createdAt: selectedWarranty.createdAt,
      notes: 'Reclamo registrado en el sistema',
      user: 'Usuario'
    })
    if (selectedWarranty.status !== 'submitted') {
      events.push({
        status: selectedWarranty.status,
        createdAt: selectedWarranty.updatedAt || selectedWarranty.createdAt,
        notes: selectedWarranty.resolution || `Estado actualizado a: ${selectedWarranty.status}`,
        user: 'Administración'
      })
    }
    return events
  }, [selectedWarranty])

  const isLoading = warrantiesLoading || resolvingProperties

  // ✅ CORRECCIÓN 2: Validación segura para evitar errores si warranties es undefined
  if (isLoading && (!warranties || warranties.length === 0)) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size="large" message={t('common.loading', 'Cargando...')} fullHeight={false} />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ px: { xs: 3, md: 6 }, pt: { xs: 4, md: 5 }, pb: 3 }}>
          <Typography variant="h2" sx={{ fontWeight: 300, color: C.dark, fontSize: { xs: '2.2rem', md: '3rem' }, fontFamily: '"DM Sans", sans-serif', lineHeight: 1.1 }}>
            {t('warranty.title', 'Centro de')}{' '}
            <Box component="span" sx={{ fontWeight: 800 }}>{t('warranty.titleBold', 'Garantías')}</Box>
          </Typography>
          <Box display="flex" alignItems="center" gap={1.5} mt={1.5}>
            <Typography variant="body2" sx={{ color: C.gray, fontFamily: '"DM Sans", sans-serif', fontSize: '0.95rem' }}>
              {t('warranty.subtitle', 'Gestiona y da seguimiento a tus solicitudes de garantía de forma sencilla.')}
            </Typography>
          </Box>
        </Box>
      </motion.div>

      <Box sx={{ px: { xs: 3, md: 6 }, mb: 3 }}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: '1px solid #ececec', bgcolor: '#fafafa' }}>
            <Tab label={t('warranty.tabNew', 'Nuevo Reclamo')} sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, py: 2 }} />
            <Tab label={t('warranty.tabMyClaims', `Mis Reclamos (${warranties?.length || 0})`)} sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, py: 2 }} />
          </Tabs>
        </Paper>
      </Box>

      <AnimatePresence mode="wait">
        {tabValue === 0 && (
          <motion.div key="create" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            {success ? (
              <Box sx={{ px: { xs: 3, md: 6 } }}>
                <PageSection title="" bold="" bgcolor="white" topBorderColor={C.green} dividerColor={C.border} primaryColor={C.dark} contentPy={6}>
                  <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
                    <CheckCircle sx={{ fontSize: 80, color: C.green, mb: 2 }} />
                    <Typography variant="h3" fontWeight={800} sx={{ mb: 2, fontFamily: '"DM Sans", sans-serif', color: C.dark }}>
                      {t('warranty.successTitle', '¡Reclamo Enviado!')}
                    </Typography>
                    <Typography variant="body1" color={C.gray} sx={{ mb: 4, fontFamily: '"DM Sans", sans-serif', fontSize: '1.1rem', lineHeight: 1.6 }}>
                      {t('warranty.successMessage', 'Hemos recibido tu solicitud. Nuestro equipo la revisará pronto y te mantendremos informado sobre el progreso.')}
                    </Typography>
                    <Button variant="contained" size="large" onClick={() => { setSuccess(false); setFormData(prev => ({ ...prev, propertyId: '', apartmentId: '', description: '', photoUrls: [] })) }} sx={{ px: 4, py: 1.5, borderRadius: '50px', bgcolor: C.dark, color: 'white', fontWeight: 700, fontFamily: '"DM Sans", sans-serif', textTransform: 'none', '&:hover': { bgcolor: C.green } }}>
                      {t('warranty.createNew', 'Crear Otro Reclamo')}
                    </Button>
                  </Box>
                </PageSection>
              </Box>
            ) : (
              <Box sx={{ px: { xs: 3, md: 6 } }}>
                <PageSection title="01" bold={t('warranty.selectProperty', 'Selecciona tu Propiedad')} description={t('warranty.selectPropertyDesc', 'Indica sobre qué propiedad surge el inconveniente.')} bgcolor="white" topBorderColor={C.green} dividerColor={C.border} primaryColor={C.dark} contentPy={4}>
                  {loadingProperties ? (
                    <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
                  ) : userProperties.length === 0 ? (
                    <Alert severity="warning" sx={{ fontFamily: '"DM Sans", sans-serif' }}>{t('warranty.noProperties', 'No tienes propiedades asignadas en este proyecto. Contacta a administración.')}</Alert>
                  ) : (
                    <Grid container spacing={3}>
                      {userProperties.map((prop) => (
                        <Grid item xs={12} md={6} key={prop._id}>
                          <Box 
                            onClick={() => setFormData(prev => ({ ...prev, propertyId: prop.type === 'property' ? prop._id : '', apartmentId: prop.type === 'apartment' ? prop._id : '' }))}
                            sx={{ 
                              p: 3, 
                              bgcolor: ((prop.type === 'property' && formData.propertyId === prop._id) || (prop.type === 'apartment' && formData.apartmentId === prop._id)) ? C.bg : 'white', 
                              borderRadius: '16px', 
                              border: `2px solid ${((prop.type === 'property' && formData.propertyId === prop._id) || (prop.type === 'apartment' && formData.apartmentId === prop._id)) ? C.green : C.border}`, 
                              cursor: 'pointer', 
                              transition: 'all 0.3s ease', 
                              '&:hover': { borderColor: C.green, transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0, 69, 53, 0.08)' } 
                            }}
                          >
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 1, fontFamily: '"DM Sans", sans-serif', color: C.dark }}>{prop.label}</Typography>
                            <Typography variant="body2" color={C.gray} fontFamily='"DM Sans", sans-serif'>{prop.type === 'apartment' ? t('warranty.apartment', 'Apartamento') : `${t('warranty.lot', 'Lote')} / Casa`}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </PageSection>

                <PageSection title="02" bold={t('warranty.claimDetails', 'Detalles del Reclamo')} description={t('warranty.claimDetailsDesc', 'Describe el problema y adjunta evidencia fotográfica.')} bgcolor="white" topBorderColor={C.orange} dividerColor={C.border} primaryColor={C.dark} contentPy={4} sx={{ mt: 3 }}>
                  <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                    {error && <Alert severity="error" sx={{ mb: 3, fontFamily: '"DM Sans", sans-serif' }}>{error}</Alert>}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>{t('warranty.category', 'Categoría')}</InputLabel>
                          <Select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} label={t('warranty.category', 'Categoría')} sx={{ fontFamily: '"DM Sans", sans-serif', borderRadius: '12px' }}>
                            {['structural', 'plumbing', 'electrical', 'finish', 'appliance', 'landscaping', 'other'].map(c => (
                              <MenuItem key={c} value={c}>{t(`warranty.categories.${c}`, c)}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>{t('warranty.priority', 'Prioridad')}</InputLabel>
                          <Select value={formData.priority} onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))} label={t('warranty.priority', 'Prioridad')} sx={{ fontFamily: '"DM Sans", sans-serif', borderRadius: '12px' }}>
                            {['low', 'medium', 'high', 'emergency'].map(p => <MenuItem key={p} value={p}>{t(`warranty.priorities.${p}`, p)}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    <TextField required fullWidth multiline rows={4} label={t('warranty.description', 'Descripción detallada del problema')} value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: '"DM Sans", sans-serif' } }} />

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}>{t('warranty.photos', 'Evidencia Fotográfica')}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {formData.photoUrls.map((url, idx) => (
                          <Box key={idx} sx={{ position: 'relative', width: 100, height: 100 }}>
                            <img src={url} alt={`evidence-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                            <IconButton size="small" color="error" onClick={() => handleRemoveImage(idx)} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white', boxShadow: 1, border: '1px solid #eee' }}>
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                        <Button variant="outlined" component="label" disabled={uploading} sx={{ width: 100, height: 100, borderStyle: 'dashed', borderRadius: '12px', flexDirection: 'column', color: C.gray, borderColor: C.border, '&:hover': { borderColor: C.green, color: C.green, bgcolor: C.bg } }}>
                          {uploading ? <CircularProgress size={20} /> : <Add fontSize="large" />}
                          <Typography variant="caption" sx={{ mt: 0.5 }}>{t('warranty.addPhoto', 'Agregar')}</Typography>
                          <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
                        </Button>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Button variant="contained" size="large" onClick={handleSubmit} disabled={submitting || uploading} startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />} sx={{ px: 6, py: 1.5, borderRadius: '50px', bgcolor: C.dark, color: 'white', fontWeight: 700, fontFamily: '"DM Sans", sans-serif', fontSize: '1rem', textTransform: 'none', boxShadow: '0 4px 12px rgba(0, 69, 53, 0.2)', transition: 'all 0.3s ease', '&:hover': { bgcolor: C.green, transform: 'translateY(-2px)' }, '&:disabled': { bgcolor: C.gray } }}>
                        {submitting ? t('actions.saving', 'Enviando...') : t('actions.create', 'Enviar Reclamo')}
                      </Button>
                    </Box>
                  </Box>
                </PageSection>
              </Box>
            )}
          </motion.div>
        )}

        {tabValue === 1 && (
          <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <Box sx={{ px: { xs: 3, md: 6 } }}>
              {(!warranties || warranties.length === 0) ? (
                <PageSection title="" bold="" bgcolor="white" topBorderColor={C.green} dividerColor={C.border} primaryColor={C.dark} contentPy={6}>
                  <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
                    <Build sx={{ fontSize: 80, color: C.gray, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 2, fontFamily: '"DM Sans", sans-serif', color: C.dark }}>
                      {t('warranty.noClaims', 'No tienes reclamos registrados')}
                    </Typography>
                    <Typography variant="body1" color={C.gray} sx={{ mb: 4, fontFamily: '"DM Sans", sans-serif' }}>
                      {t('warranty.noClaimsDesc', 'Cuando crees un reclamo, aparecerá aquí para que puedas darle seguimiento en tiempo real.')}
                    </Typography>
                    <Button variant="contained" onClick={() => setTabValue(0)} sx={{ px: 4, py: 1.5, borderRadius: '50px', bgcolor: C.dark, color: 'white', fontWeight: 700, fontFamily: '"DM Sans", sans-serif', textTransform: 'none', '&:hover': { bgcolor: C.green } }}>
                      {t('warranty.createNew', 'Crear Nuevo Reclamo')}
                    </Button>
                  </Box>
                </PageSection>
              ) : (
                <Grid container spacing={3}>
                  {warranties.map((warranty) => (
                    <Grid item xs={12} md={6} lg={4} key={warranty._id}>
                      <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #e0e0e0', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 24px rgba(0, 69, 53, 0.08)', borderColor: C.green } }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Chip label={t(`warranty.categories.${warranty.category}`, warranty.category)} size="small" sx={{ bgcolor: C.bg, color: C.dark, fontWeight: 600, fontFamily: '"DM Sans", sans-serif' }} />
                          <Chip label={t(`warranty.statuses.${warranty.status}`, warranty.status)} size="small" color={warranty.status === 'resolved' ? 'success' : warranty.status === 'rejected' ? 'error' : 'primary'} variant="outlined" sx={{ fontWeight: 600, fontFamily: '"DM Sans", sans-serif' }} />
                        </Box>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 1, fontFamily: '"DM Sans", sans-serif', color: C.dark, lineHeight: 1.3 }}>
                          {getPropertyLabel(warranty)}
                        </Typography>
                        <Typography variant="body2" color={C.gray} sx={{ mb: 2, fontFamily: '"DM Sans", sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {warranty.description}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                          <Typography variant="caption" color={C.gray} fontFamily='"DM Sans", sans-serif'>
                            {new Date(warranty.createdAt).toLocaleDateString()}
                          </Typography>
                          <Button size="small" variant="outlined" startIcon={<Visibility />} onClick={() => handleViewDetails(warranty)} sx={{ borderRadius: '50px', textTransform: 'none', fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}>
                            {t('actions.view', 'Ver Detalles')}
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        {selectedWarranty && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: C.bg }}>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"DM Sans", sans-serif', color: C.dark }}>
                  {t('warranty.claimDetails', 'Detalle de Reclamo')} #{selectedWarranty._id.slice(-6)}
                </Typography>
                <Typography variant="caption" color={C.gray} sx={{ fontFamily: '"DM Sans", sans-serif' }}>
                  {new Date(selectedWarranty.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Chip label={t(`warranty.statuses.${selectedWarranty.status}`, selectedWarranty.status)} color={selectedWarranty.status === 'resolved' ? 'success' : selectedWarranty.status === 'rejected' ? 'error' : 'primary'} />
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color={C.gray} sx={{ mb: 1, fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}>{t('warranty.description', 'Descripción')}</Typography>
                  <Box sx={{ p: 2, bgcolor: C.bg, borderRadius: '12px', mb: 3 }}>
                    <Typography variant="body2" sx={{ fontFamily: '"DM Sans", sans-serif', lineHeight: 1.6 }}>{selectedWarranty.description}</Typography>
                  </Box>
                  
                  <Typography variant="subtitle2" color={C.gray} sx={{ mb: 1, fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}>{t('warranty.category', 'Categoría')} & {t('warranty.priority', 'Prioridad')}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    <Chip label={t(`warranty.categories.${selectedWarranty.category}`, selectedWarranty.category)} size="small" variant="outlined" sx={{ fontFamily: '"DM Sans", sans-serif' }} />
                    <Chip label={t(`warranty.priorities.${selectedWarranty.priority}`, selectedWarranty.priority)} size="small" color={selectedWarranty.priority === 'high' || selectedWarranty.priority === 'emergency' ? 'error' : 'default'} sx={{ fontFamily: '"DM Sans", sans-serif' }} />
                  </Box>

                  <Typography variant="subtitle2" color={C.gray} sx={{ mb: 1, fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}>{t('warranty.property', 'Propiedad')}</Typography>
                  <Box sx={{ p: 2, bgcolor: C.bgLight, borderRadius: '12px', mb: 3, border: `1px solid ${C.border}` }}>
                    <Typography variant="body1" fontWeight={600} sx={{ fontFamily: '"DM Sans", sans-serif', color: C.dark }}>
                      {getPropertyLabel(selectedWarranty)}
                    </Typography>
                  </Box>

                  {selectedWarranty.photoUrls && selectedWarranty.photoUrls.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color={C.gray} sx={{ mb: 1, fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}>{t('warranty.photos', 'Evidencia')}</Typography>
                      <ImageList sx={{ width: '100%', height: 'auto' }} cols={3} rowHeight={120}>
                        {selectedWarranty.photoUrls.map((url, index) => (
                          <ImageListItem key={index}>
                            <img src={url} alt={`Evidencia ${index + 1}`} style={{ borderRadius: '8px', objectFit: 'cover', width: '100%', height: '100%', cursor: 'pointer' }} onClick={() => window.open(url, '_blank')} />
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color={C.gray} sx={{ mb: 2, fontFamily: '"DM Sans", sans-serif', fontWeight: 700 }}>
                    {t('warranty.timeline', 'Historial de Seguimiento')}
                  </Typography>
                  <Box sx={{ bgcolor: 'white', borderRadius: '16px', border: '1px solid #e0e0e0', p: 3 }}>
                    {/* ✅ CORRECCIÓN 3: Usar la variable calculada en lugar de llamar al hook dentro del JSX */}
                    <CustomerWarrantyTimeline events={timelineEvents} />
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: C.bg }}>
              <Button onClick={() => setDetailOpen(false)} sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, color: C.dark }}>{t('actions.close', 'Cerrar')}</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}