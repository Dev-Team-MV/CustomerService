// apps/mv-crm/src/components/documents/DocumentUploadModal.jsx
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Chip, IconButton
} from '@mui/material'
import { CloudUpload, Close } from '@mui/icons-material'
import documentService from '../../services/documentService'
import api from '@shared/services/api'
import { useProjects } from '@shared/hooks/useProjects'
import { useResidents } from '@shared/hooks/useResidents'
import { useLeads } from '../../constants/hooks/useLeads'
import { getProjectById, getProjectBySlug } from '@shared/config/projectsConfig'

// ✅ Componente compartido
import ProjectSelector from '@shared/components/ProjectSelector'

const CATEGORIES = ['contract', 'id_document', 'deed', 'appraisal', 'receipt', 'insurance', 'permit', 'blueprint', 'other']

export default function DocumentUploadModal({ 
  open, onClose, defaultProjectId, defaultClientId, defaultLeadId,
  defaultPropertyId, defaultApartmentId, defaultFiles, onUploadSuccess 
}) {
  const { t } = useTranslation('documents')
  const { projects } = useProjects() // Se mantiene para la lógica de recursos
  const { users: residents } = useResidents(null)
  const { leads } = useLeads()
  
  const [files, setFiles] = useState([])
  const [linkType, setLinkType] = useState('none')
  const [currentTag, setCurrentTag] = useState('')
  
  const [formData, setFormData] = useState({
    projectId: defaultProjectId || '', clientId: defaultClientId || '',
    leadId: defaultLeadId || '', propertyId: defaultPropertyId || '',
    apartmentId: defaultApartmentId || '', category: 'contract',
    title: '', description: '', tags: [], expiresAt: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [loadingResources, setLoadingResources] = useState(false)
  const [error, setError] = useState('')
  const [availableResources, setAvailableResources] = useState([])

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
      if (!formData.projectId || !selectedProjectConfig) {
        setAvailableResources([])
        return
      }
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
        console.error('Error fetching resources:', err)
        setAvailableResources([])
      } finally {
        setLoadingResources(false)
      }
    }
    fetchResources()
  }, [formData.projectId, formData.clientId, selectedProjectConfig, selectedClient, residents.length])

  useEffect(() => {
    if (open) {
      if (defaultLeadId) setLinkType('lead')
      else if (defaultClientId) setLinkType('client')
      else setLinkType('none')

      const safeFiles = defaultFiles && defaultFiles.length > 0 ? defaultFiles : []
      setFormData(prev => ({
        ...prev, projectId: defaultProjectId || prev.projectId, clientId: defaultClientId || '',
        leadId: defaultLeadId || '', propertyId: defaultPropertyId || '', apartmentId: defaultApartmentId || '',
        tags: [], title: !prev.title && safeFiles.length > 0 ? safeFiles[0].name : prev.title
      }))
      setFiles(safeFiles)
      setCurrentTag('')
    } else {
      setFiles([]); setLinkType('none'); setCurrentTag('')
      setFormData({ projectId: defaultProjectId || '', clientId: '', leadId: '', propertyId: '', apartmentId: '', category: 'contract', title: '', description: '', tags: [], expiresAt: '' })
      setError('')
    }
  }, [open, defaultProjectId, defaultClientId, defaultLeadId, defaultPropertyId, defaultApartmentId])

  const handleAddTag = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const rawValue = currentTag.trim()
      if (!rawValue) return
      const newTags = rawValue.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      setFormData(prev => {
        const uniqueTags = [...prev.tags]
        newTags.forEach(tag => { if (!uniqueTags.includes(tag)) uniqueTags.push(tag) })
        return { ...prev, tags: uniqueTags }
      })
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove) => setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...droppedFiles])
    if (droppedFiles.length > 0 && !formData.title) setFormData(prev => ({ ...prev, title: droppedFiles[0].name }))
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selectedFiles])
    if (selectedFiles.length > 0 && !formData.title) setFormData(prev => ({ ...prev, title: selectedFiles[0].name }))
  }

  const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index))
  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const handleLinkTypeChange = (value) => {
    setLinkType(value)
    setFormData(prev => ({ ...prev, leadId: value === 'lead' ? prev.leadId : '', clientId: value === 'client' ? prev.clientId : '', propertyId: '', apartmentId: '' }))
  }

  const handleResourceChange = (value) => {
    if (selectedProjectConfig.resourceType === 'property' || selectedProjectConfig.catalogType === 'houses') {
      handleChange('propertyId', value)
      handleChange('apartmentId', '')
    } else {
      handleChange('apartmentId', value)
      handleChange('propertyId', '')
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return setError(t('upload.errorNoFile', 'Selecciona al menos un archivo'))
    if (!formData.projectId) return setError(t('upload.errorNoProject', 'El proyecto es obligatorio'))
    if (!formData.category) return setError(t('upload.errorNoCategory', 'La categoría es obligatoria'))

    setLoading(true)
    setError('')
    try {
      const uploadResults = []
      for (const file of files) {
        const formDataToSend = new FormData()
        formDataToSend.append('file', file)
        formDataToSend.append('title', formData.title || file.name)
        if (formData.description) formDataToSend.append('description', formData.description)
        formDataToSend.append('category', formData.category)
        formDataToSend.append('projectId', formData.projectId)
        if (formData.leadId) formDataToSend.append('leadId', formData.leadId)
        if (formData.clientId) formDataToSend.append('clientId', formData.clientId)
        if ((selectedProjectConfig.resourceType === 'property' || selectedProjectConfig.catalogType === 'houses') && formData.propertyId) {
          formDataToSend.append('propertyId', formData.propertyId)
        } else if (formData.apartmentId) {
          formDataToSend.append('apartmentId', formData.apartmentId)
        }
        if (formData.tags && formData.tags.length > 0) formData.tags.forEach(tag => formDataToSend.append('tags', tag))
        if (formData.expiresAt) formDataToSend.append('expiresAt', new Date(formData.expiresAt).toISOString())

        const response = await documentService.uploadDocument(formDataToSend)
        uploadResults.push(response.data || response)
      }
      if (onUploadSuccess) onUploadSuccess(uploadResults.length === 1 ? uploadResults[0] : uploadResults)
      handleClose()
    } catch (err) {
      setError(err.response?.data?.message || t('upload.errorUpload', 'Error al subir documentos'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFiles([]); setLinkType('none'); setCurrentTag('')
    setFormData({ projectId: defaultProjectId || '', clientId: '', leadId: '', propertyId: '', apartmentId: '', category: 'contract', title: '', description: '', tags: [], expiresAt: '' })
    setError('')
    onClose()
  }

  const filteredLeads = useMemo(() => formData.projectId ? leads.filter(l => l.projectId === formData.projectId) : leads, [leads, formData.projectId])
  const filteredResidents = useMemo(() => {
    if (!formData.projectId) return residents.filter(r => r.role === 'user')
    return residents.filter(r => r.role === 'user' && (r.projects?.some(p => p._id === formData.projectId) || r.projectMemberships?.some(m => m.project?._id === formData.projectId || m.project === formData.projectId)))
  }, [residents, formData.projectId])

  const resourceLabel = selectedProjectConfig?.resourceType === 'apartment' ? t('upload.apartment', 'Apartamento') : t('upload.property', 'Propiedad')
  
  // ✅ Estilos unificados
  const unifiedButtonSx = { borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }
  const inputSx = { '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }, '& .MuiOutlinedInput-root': { borderRadius: 0 } }
  const menuItemSx = { fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, '&:hover': { bgcolor: '#f5f5f5' } }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ececec', p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Courier New", monospace', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>{t('upload.title')}</Typography>
        <IconButton onClick={handleClose} size="small" sx={{ borderRadius: 0 }}><Close /></IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0, border: '1px solid' }}>{error}</Alert>}
        
        <Box onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} sx={{ border: '2px dashed #ccc', borderRadius: 0, p: 4, textAlign: 'center', mb: 3, bgcolor: files.length > 0 ? '#f5f5f5' : 'transparent', cursor: 'pointer', '&:hover': { borderColor: '#000', bgcolor: '#fafafa' } }} onClick={() => document.getElementById('file-input').click()}>
          <CloudUpload sx={{ fontSize: 48, color: '#000', mb: 1 }} />
          <Typography variant="body1" fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>{t('upload.dragDrop')}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>
            {files.length > 0 ? `${files.length} ${t('upload.filesSelected')}` : t('upload.supportedFormats')}
          </Typography>
          <input id="file-input" type="file" multiple hidden onChange={handleFileSelect} />
        </Box>

        {files.length > 0 && (
          <Box sx={{ mb: 3, maxHeight: 150, overflowY: 'auto' }}>
            {files.map((file, idx) => (
              <Box key={idx} display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 0, border: '1px solid #e0e0e0', mb: 1 }}>
                <Typography variant="body2" noWrap sx={{ flex: 1, fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>{file.name}</Typography>
                <Button size="small" color="error" onClick={() => removeFile(idx)} sx={{ ...unifiedButtonSx, color: '#f44336', '&:hover': { bgcolor: '#ffebee' } }}>{t('actions.remove', 'Eliminar')}</Button>
              </Box>
            ))}
          </Box>
        )}

        <Box display="flex" flexDirection="column" gap={2.5}>
          <TextField size="small" label={t('form.title')} value={formData.title} onChange={(e) => handleChange('title', e.target.value)} placeholder={t('form.titlePlaceholder')} fullWidth required sx={inputSx} />

          <FormControl size="small" fullWidth required>
            <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{t('form.category')}</InputLabel>
            <Select value={formData.category} onChange={(e) => handleChange('category', e.target.value)} label={t('form.category')} sx={{ ...inputSx, width: '100%' }}>
              {CATEGORIES.map(cat => <MenuItem key={cat} value={cat} sx={menuItemSx}>{t(`categories.${cat}`)}</MenuItem>)}
            </Select>
          </FormControl>

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
            <Typography variant="subtitle2" fontWeight={600} mb={1} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{t('upload.linkToPerson')}</Typography>
            <Box display="flex" gap={2} mb={1} flexWrap="wrap">
              <Button variant={linkType === 'none' ? 'contained' : 'outlined'} size="small" onClick={() => handleLinkTypeChange('none')} sx={{ ...unifiedButtonSx, border: '1px solid #000', color: linkType === 'none' ? '#fff' : '#000', bgcolor: linkType === 'none' ? '#000' : '#fff' }}>{t('upload.none')}</Button>
              <Button variant={linkType === 'lead' ? 'contained' : 'outlined'} size="small" onClick={() => handleLinkTypeChange('lead')} sx={{ ...unifiedButtonSx, border: '1px solid #000', color: linkType === 'lead' ? '#fff' : '#000', bgcolor: linkType === 'lead' ? '#000' : '#fff' }}>{t('upload.lead')}</Button>
              <Button variant={linkType === 'client' ? 'contained' : 'outlined'} size="small" onClick={() => handleLinkTypeChange('client')} sx={{ ...unifiedButtonSx, border: '1px solid #000', color: linkType === 'client' ? '#fff' : '#000', bgcolor: linkType === 'client' ? '#000' : '#fff' }}>{t('upload.client')}</Button>
            </Box>

            {linkType === 'lead' && (
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{t('upload.selectLead')}</InputLabel>
                <Select value={formData.leadId} onChange={(e) => handleChange('leadId', e.target.value)} label={t('upload.selectLead')} sx={{ ...inputSx, width: '100%' }}>
                  <MenuItem value="" sx={menuItemSx}>{t('upload.noLead')}</MenuItem>
                  {filteredLeads.map(lead => <MenuItem key={lead._id} value={lead._id} sx={menuItemSx}>{lead.name} {lead.phone && `(${lead.phone})`}</MenuItem>)}
                </Select>
              </FormControl>
            )}

            {linkType === 'client' && (
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{t('upload.selectClient')}</InputLabel>
                <Select value={formData.clientId} onChange={(e) => handleChange('clientId', e.target.value)} label={t('upload.selectClient')} sx={{ ...inputSx, width: '100%' }}>
                  <MenuItem value="" sx={menuItemSx}>{t('upload.noClient')}</MenuItem>
                  {filteredResidents.map(client => <MenuItem key={client._id} value={client._id} sx={menuItemSx}>{client.firstName} {client.lastName}</MenuItem>)}
                </Select>
              </FormControl>
            )}
          </Box>

          {formData.projectId && selectedProjectConfig && (
            <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 0, border: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle2" fontWeight={600} mb={1.5} sx={{ fontFamily: '"Courier New", monospace' }}>{t('upload.linkToResource')} {resourceLabel}</Typography>
              {loadingResources ? (
                <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
              ) : (
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{resourceLabel} {formData.clientId ? t('upload.clientResource') : ''}</InputLabel>
                  <Select value={selectedProjectConfig.resourceType === 'property' || selectedProjectConfig.catalogType === 'houses' ? formData.propertyId : formData.apartmentId} onChange={(e) => handleResourceChange(e.target.value)} label={resourceLabel} sx={{ ...inputSx, width: '100%' }}>
                    <MenuItem value="" sx={menuItemSx}><em>{t('upload.unspecified')}</em></MenuItem>
                    {availableResources.length > 0 ? availableResources.map(res => {
                      if (selectedProjectConfig.resourceType === 'property' || selectedProjectConfig.catalogType === 'houses') {
                        const lotNumber = res.lot?.number || res.lot || 'N/A'
                        const modelName = res.model?.model || res.model?.name || ''
                        return <MenuItem key={res._id} value={res._id} sx={menuItemSx}>Lote {lotNumber} {modelName ? `- ${modelName}` : ''}</MenuItem>
                      } else {
                        return <MenuItem key={res._id} value={res._id} sx={menuItemSx}>Apto {res.apartmentNumber}{res.floorNumber ? ` (Piso ${res.floorNumber})` : ''}</MenuItem>
                      }
                    }) : <MenuItem disabled sx={menuItemSx}><em>{t('upload.noResourcesFound')}</em></MenuItem>}
                  </Select>
                  {availableResources.length === 0 && formData.clientId && <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block', fontFamily: '"Courier New", monospace' }}>* {t('upload.noResourcesAssigned')}</Typography>}
                </FormControl>
              )}
            </Box>
          )}

          <Box>
            <TextField size="small" label={t('form.tags')} value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={handleAddTag} placeholder={t('form.tagsPlaceholder', 'Escribe una etiqueta y presiona Enter')} fullWidth sx={{ mb: 1, ...inputSx }} />
            {formData.tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.tags.map((tag, idx) => (
                  <Chip key={idx} label={tag} size="small" onDelete={() => handleRemoveTag(tag)} sx={{ bgcolor: '#f5f5f5', color: '#000', fontWeight: 500, borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem', '& .MuiChip-deleteIcon': { color: '#000', '&:hover': { color: '#555' } } }} />
                ))}
              </Box>
            )}
          </Box>

          <TextField size="small" type="date" label={t('form.expiresAt')} value={formData.expiresAt} onChange={(e) => handleChange('expiresAt', e.target.value)} InputLabelProps={{ shrink: true }} fullWidth helperText={t('form.expiresAtHelper')} sx={inputSx} />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: '1px solid #ececec', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ ...unifiedButtonSx, color: '#888', width: { xs: '100%', sm: 'auto' } }}>{t('actions.cancel')}</Button>
        <Button variant="contained" onClick={handleUpload} disabled={files.length === 0 || loading || !formData.projectId} startIcon={loading ? <CircularProgress size={16} /> : <CloudUpload />} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', width: { xs: '100%', sm: 'auto' }, '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
          {loading ? t('upload.uploading') : t('upload.title')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}