// apps/mv-crm/src/components/postSale/WarrantyClaimForm.jsx
import { useState, useEffect, useMemo } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Chip, IconButton, Typography, Grid
} from '@mui/material'
import { CloudUpload, Delete, Image as ImageIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import api from '@shared/services/api'
import uploadService from '@shared/services/uploadService'
import { useProjects } from '@shared/hooks/useProjects'
import { useResidents } from '@shared/hooks/useResidents'
import { useLeads } from '../../constants/hooks/useLeads'
import { getProjectById, getProjectBySlug } from '@shared/config/projectsConfig'

// ✅ Componente compartido
import ProjectSelector from '@shared/components/ProjectSelector'

export default function WarrantyClaimForm({ open, onClose, onSuccess, initialData = null }) {
  const { t } = useTranslation('postSale')
  const { projects } = useProjects()
  const { users: residents } = useResidents(null)
  const { leads } = useLeads()

  const [formData, setFormData] = useState({
    projectId: '', clientId: '', leadId: '', propertyId: '', apartmentId: '',
    category: 'structural', description: '', photoUrls: [], priority: 'low'
  })

  const [linkType, setLinkType] = useState('none')
  const [availableResources, setAvailableResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          projectId: initialData.projectId?._id || (typeof initialData.projectId === 'string' ? initialData.projectId : ''),
          clientId: initialData.clientId?._id || (typeof initialData.clientId === 'string' ? initialData.clientId : ''),
          leadId: initialData.leadId?._id || (typeof initialData.leadId === 'string' ? initialData.leadId : ''),
          propertyId: initialData.propertyId?._id || (typeof initialData.propertyId === 'string' ? initialData.propertyId : ''),
          apartmentId: initialData.apartmentId?._id || (typeof initialData.apartmentId === 'string' ? initialData.apartmentId : ''),
          category: initialData.category || 'structural', description: initialData.description || '',
          photoUrls: initialData.photoUrls || [], priority: initialData.priority || 'low'
        })
        if (initialData.leadId) setLinkType('lead')
        else if (initialData.clientId) setLinkType('client')
        else setLinkType('none')
      } else {
        setFormData({ projectId: '', clientId: '', leadId: '', propertyId: '', apartmentId: '', category: 'structural', description: '', photoUrls: [], priority: 'low' })
        setLinkType('none'); setError(''); setAvailableResources([])
      }
    }
  }, [open, initialData])

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
    const fetchResources = async () => {
      if (!formData.projectId || !selectedProjectConfig) { setAvailableResources([]); return }
      if (formData.clientId && residents.length === 0) return

      setLoadingResources(true)
      try {
        let resources = []
        if (selectedProjectConfig.resourceType === 'property' || selectedProjectConfig.catalogType === 'houses') {
          const res = await api.get('/properties', { params: { projectId: formData.projectId } })
          resources = Array.isArray(res.data) ? res.data : (res.data.properties || res.data.data || [])
        } else {
          const res = await api.get('/apartments', { params: { projectId: formData.projectId } })
          resources = Array.isArray(res.data) ? res.data : (res.data.apartments || res.data.data || [])
        }

        if (formData.clientId) {
          resources = resources.filter(res => {
            if (Array.isArray(res.users)) return res.users.some(u => (u._id || u) === formData.clientId)
            if ((selectedProjectConfig.resourceType === 'property' || selectedProjectConfig.catalogType === 'houses') && selectedClient) {
              const clientPropertyIds = (selectedClient.lots || selectedClient.properties || []).map(p => p._id || p)
              return clientPropertyIds.includes(res._id)
            }
            return false
          })
        }
        setAvailableResources(resources)
      } catch (err) {
        setError(t('warranty.loadResourcesError'))
      } finally { setLoadingResources(false) }
    }
    fetchResources()
  }, [formData.projectId, formData.clientId, selectedProjectConfig, selectedClient, residents.length, t])

  const filteredLeads = useMemo(() => formData.projectId ? leads.filter(l => l.projectId === formData.projectId) : leads, [leads, formData.projectId])
  const filteredResidents = useMemo(() => {
    if (!formData.projectId) return residents.filter(r => r.role === 'user')
    return residents.filter(r => r.role === 'user' && (r.projects?.some(p => p._id === formData.projectId) || r.projectMemberships?.some(m => m.project?._id === formData.projectId || m.project === formData.projectId)))
  }, [residents, formData.projectId])

  const handleLinkTypeChange = (value) => {
    setLinkType(value)
    setFormData(prev => ({ ...prev, leadId: value === 'lead' ? prev.leadId : '', clientId: value === 'client' ? prev.clientId : '', propertyId: '', apartmentId: '' }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    setUploading(true)
    try {
      const urls = await Promise.all(files.map(file => uploadService.uploadImage(file, 'warranties', '', true)))
      setFormData(prev => ({ ...prev, photoUrls: [...prev.photoUrls, ...urls] }))
    } catch (err) { setError(t('warranty.uploadImageError')) }
    finally { setUploading(false) }
  }

  const handleRemoveImage = (index) => setFormData(prev => ({ ...prev, photoUrls: prev.photoUrls.filter((_, i) => i !== index) }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (!formData.projectId || (!formData.clientId && !formData.leadId) || (!formData.propertyId && !formData.apartmentId) || !formData.description) {
      return setError(t('warranty.requiredFieldsError'))
    }

    setSubmitting(true)
    try {
      const payload = { ...formData }
      if (selectedProjectConfig?.resourceType === 'property' || selectedProjectConfig?.catalogType === 'houses') delete payload.apartmentId
      else delete payload.propertyId

      if (initialData?._id) await api.put(`/warranties/${initialData._id}`, payload)
      else await api.post('/warranties', payload)
      if (onSuccess) onSuccess()
    } catch (err) { setError(err.response?.data?.message || t('warranty.saveError')) }
    finally { setSubmitting(false) }
  }

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  // ✅ Estilos unificados
  const unifiedButtonSx = { borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }
  const inputSx = { fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }, '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' }, '& .MuiOutlinedInput-root': { borderRadius: 0 } }
  const menuItemSx = { fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, '&:hover': { bgcolor: '#f5f5f5' } }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ececec', p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {initialData ? t('warranty.editClaim') : t('warranty.newClaim')}
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 0, border: '1px solid' }}>{error}</Alert>}

          {/* ✅ ProjectSelector Integrado */}
          <ProjectSelector
            value={formData.projectId}
            onChange={(value) => handleChange('projectId', value)}
            label={`${t('form.project')} *`}
            includeGlobal={false}
            fullWidth
            size="small"
          />

          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{t('warranty.linkTo')}</Typography>
            <Box display="flex" gap={2} mb={1} flexWrap="wrap">
              <Button variant={linkType === 'none' ? 'contained' : 'outlined'} size="small" onClick={() => handleLinkTypeChange('none')} sx={{ ...unifiedButtonSx, border: '1px solid #000', color: linkType === 'none' ? '#fff' : '#000', bgcolor: linkType === 'none' ? '#000' : '#fff' }}>{t('warranty.none')}</Button>
              <Button variant={linkType === 'lead' ? 'contained' : 'outlined'} size="small" onClick={() => handleLinkTypeChange('lead')} sx={{ ...unifiedButtonSx, border: '1px solid #000', color: linkType === 'lead' ? '#fff' : '#000', bgcolor: linkType === 'lead' ? '#000' : '#fff' }}>{t('warranty.lead')}</Button>
              <Button variant={linkType === 'client' ? 'contained' : 'outlined'} size="small" onClick={() => handleLinkTypeChange('client')} sx={{ ...unifiedButtonSx, border: '1px solid #000', color: linkType === 'client' ? '#fff' : '#000', bgcolor: linkType === 'client' ? '#000' : '#fff' }}>{t('warranty.client')}</Button>
            </Box>

            {linkType === 'lead' && (
              <FormControl fullWidth required>
                <InputLabel>{t('warranty.selectLead')}</InputLabel>
                <Select value={formData.leadId} onChange={(e) => handleChange('leadId', e.target.value)} label={t('warranty.selectLead')} sx={inputSx}>
                  <MenuItem value="" sx={menuItemSx}>{t('form.select')}</MenuItem>
                  {filteredLeads.map(lead => <MenuItem key={lead._id} value={lead._id} sx={menuItemSx}>{lead.name} {lead.phone && `(${lead.phone})`}</MenuItem>)}
                </Select>
              </FormControl>
            )}

            {linkType === 'client' && (
              <FormControl fullWidth required>
                <InputLabel>{t('warranty.selectClient')}</InputLabel>
                <Select value={formData.clientId} onChange={(e) => handleChange('clientId', e.target.value)} label={t('warranty.selectClient')} sx={inputSx}>
                  <MenuItem value="" sx={menuItemSx}>{t('form.select')}</MenuItem>
                  {filteredResidents.map(client => <MenuItem key={client._id} value={client._id} sx={menuItemSx}>{client.firstName} {client.lastName}</MenuItem>)}
                </Select>
              </FormControl>
            )}
          </Box>

          {formData.projectId && selectedProjectConfig && (
            <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 0, border: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle2" fontWeight={600} mb={1.5} sx={{ fontFamily: '"Courier New", monospace' }}>
                {selectedProjectConfig.resourceType === 'apartment' ? t('warranty.apartment') : t('warranty.property')}
              </Typography>
              {loadingResources ? (
                <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
              ) : (
                <FormControl fullWidth required>
                  <InputLabel>{selectedProjectConfig.resourceType === 'apartment' ? t('warranty.apartment') : t('warranty.property')}</InputLabel>
                  <Select
                    value={selectedProjectConfig.resourceType === 'property' || selectedProjectConfig.catalogType === 'houses' ? formData.propertyId : formData.apartmentId}
                    onChange={(e) => {
                      if (selectedProjectConfig.resourceType === 'property' || selectedProjectConfig.catalogType === 'houses') { handleChange('propertyId', e.target.value); handleChange('apartmentId', '') }
                      else { handleChange('apartmentId', e.target.value); handleChange('propertyId', '') }
                    }}
                    label={selectedProjectConfig.resourceType === 'apartment' ? t('warranty.apartment') : t('warranty.property')}
                    sx={inputSx}
                  >
                    <MenuItem value="" sx={menuItemSx}><em>{t('form.select')}</em></MenuItem>
                    {availableResources.length > 0 ? availableResources.map(res => {
                      if (selectedProjectConfig.resourceType === 'property' || selectedProjectConfig.catalogType === 'houses') {
                        const lotNumber = res.lot?.number || res.lot || t('common.na')
                        const modelName = res.model?.model || res.model?.name || ''
                        return <MenuItem key={res._id} value={res._id} sx={menuItemSx}>{t('warranty.property')} {lotNumber} {modelName ? `- ${modelName}` : ''}</MenuItem>
                      } else {
                        return <MenuItem key={res._id} value={res._id} sx={menuItemSx}>{t('warranty.apartment')} {res.apartmentNumber}{res.floorNumber ? ` (${t('warranty.floor')} ${res.floorNumber})` : ''}</MenuItem>
                      }
                    }) : <MenuItem disabled sx={menuItemSx}><em>{t('warranty.noResources')}</em></MenuItem>}
                  </Select>
                </FormControl>
              )}
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('warranty.category')}</InputLabel>
                <Select value={formData.category} onChange={(e) => handleChange('category', e.target.value)} label={t('warranty.category')} sx={inputSx}>
                  {['structural', 'plumbing', 'electrical', 'finish', 'appliance', 'landscaping', 'other'].map(c => (
                    <MenuItem key={c} value={c} sx={menuItemSx}>{t(`warranty.categories.${c}`)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('warranty.priority')}</InputLabel>
                <Select value={formData.priority} onChange={(e) => handleChange('priority', e.target.value)} label={t('warranty.priority')} sx={inputSx}>
                  {['low', 'medium', 'high', 'emergency'].map(p => <MenuItem key={p} value={p} sx={menuItemSx}>{t(`warranty.priorities.${p}`)}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField required multiline rows={4} label={t('warranty.description')} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} sx={inputSx} />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{t('warranty.photos')}</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              {formData.photoUrls.map((url, idx) => (
                <Box key={idx} sx={{ position: 'relative', width: 80, height: 80, borderRadius: 0, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                  <img src={url} alt={`evidence-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <IconButton size="small" color="error" onClick={() => handleRemoveImage(idx)} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white', boxShadow: 1, borderRadius: 0 }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button variant="outlined" component="label" disabled={uploading} sx={{ width: 80, height: 80, borderStyle: 'dashed', flexDirection: 'column', borderRadius: 0, borderColor: '#ccc', '&:hover': { borderColor: '#000', bgcolor: '#f5f5f5' } }}>
                {uploading ? <CircularProgress size={20} /> : <ImageIcon />}
                <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #ececec', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
        <Button onClick={onClose} disabled={submitting || uploading} sx={{ ...unifiedButtonSx, color: '#888', width: { xs: '100%', sm: 'auto' } }}>{t('form.cancel')}</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting || uploading} startIcon={submitting ? <CircularProgress size={16} /> : null} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', width: { xs: '100%', sm: 'auto' }, '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
          {submitting ? t('form.saving') : (initialData ? t('form.update') : t('form.create'))}
        </Button>
      </DialogActions>
    </Dialog>
  )
}