// apps/mv-crm/src/components/documents/DocumentUploadModal.jsx
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert
} from '@mui/material'
import { CloudUpload, Close } from '@mui/icons-material'
import documentService from '../../services/documentService'
import api from '@shared/services/api'
import { useProjects } from '@shared/hooks/useProjects'
import { useResidents } from '@shared/hooks/useResidents'
import { useLeads } from '../../constants/hooks/useLeads'
import { getProjectById, getProjectBySlug } from '@shared/config/projectsConfig'

const CATEGORIES = ['contract', 'id_document', 'deed', 'appraisal', 'receipt', 'insurance', 'permit', 'blueprint', 'other']

export default function DocumentUploadModal({ 
  open, 
  onClose, 
  defaultProjectId, 
  defaultClientId,
  defaultLeadId,
  defaultPropertyId,
  defaultApartmentId,
  defaultFiles = [], // ✅ Prop para recibir archivos del Drag & Drop
  onUploadSuccess 
}) {
  const { t } = useTranslation('documents')
  const { projects } = useProjects()
  const { users: residents } = useResidents(null)
  const { leads } = useLeads()
  
  const [files, setFiles] = useState([])
  const [linkType, setLinkType] = useState('none')
  
  const [formData, setFormData] = useState({
    projectId: defaultProjectId || '',
    clientId: defaultClientId || '',
    leadId: defaultLeadId || '',
    propertyId: defaultPropertyId || '',
    apartmentId: defaultApartmentId || '',
    category: 'contract',
    title: '',
    description: '',
    tags: '',
    expiresAt: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [loadingResources, setLoadingResources] = useState(false)
  const [error, setError] = useState('')
  const [availableResources, setAvailableResources] = useState([])

  // ✅ 1. Configuración del proyecto seleccionado
  const selectedProjectConfig = useMemo(() => {
    if (!formData.projectId) return null
    const proj = projects.find(p => p._id === formData.projectId)
    if (!proj) return null
    return getProjectById(proj._id) || getProjectBySlug(proj.slug)
  }, [formData.projectId, projects])

  // ✅ 2. Objeto completo del cliente seleccionado
  const selectedClient = useMemo(() => {
    if (!formData.clientId) return null
    return residents.find(r => r._id === formData.clientId)
  }, [formData.clientId, residents])

  // ✅ 3. CONSULTA REAL y FILTRADO PRECISO por usuario (ROBUSTO)
  useEffect(() => {
    const fetchResources = async () => {
      if (!formData.projectId || !selectedProjectConfig) {
        setAvailableResources([])
        return
      }

      setLoadingResources(true)
      try {
        let resources = []
        
        // ✅ Consultar el endpoint correcto y extraer datos sin importar si vienen en array o en objeto { data: [] }
        if (selectedProjectConfig.resourceType === 'property') {
          const res = await api.get('/properties', { params: { projectId: formData.projectId } })
          const data = res.data
          resources = Array.isArray(data) ? data : (data.properties || data.data || [])
        } else {
          const res = await api.get('/apartments', { params: { projectId: formData.projectId } })
          const data = res.data
          resources = Array.isArray(data) ? data : (data.apartments || data.data || [])
        }

        // ✅ 4. FILTRADO INTELIGENTE: Si hay cliente, mostrar SOLO sus recursos
        if (formData.clientId) {
          resources = resources.filter(res => {
            // Método 1 (Principal): El recurso tiene un array 'users' (funciona para apartments Y properties)
            if (Array.isArray(res.users)) {
              return res.users.some(u => (u._id || u) === formData.clientId)
            }
            // Método 2 (Fallback para properties): Usar el objeto del cliente seleccionado si tiene 'lots' o 'properties'
            if (selectedProjectConfig.resourceType === 'property' && selectedClient) {
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
  }, [formData.projectId, formData.clientId, selectedProjectConfig, selectedClient])

  // ✅ Inicializar estados basados en props por defecto y manejar defaultFiles (Drag & Drop)
  useEffect(() => {
    if (open) {
      if (defaultLeadId) setLinkType('lead')
      else if (defaultClientId) setLinkType('client')
      else setLinkType('none')

      setFormData(prev => ({
        ...prev,
        projectId: defaultProjectId || prev.projectId,
        clientId: defaultClientId || '',
        leadId: defaultLeadId || '',
        propertyId: defaultPropertyId || '',
        apartmentId: defaultApartmentId || '',
        // ✅ Si hay archivos por defecto y no hay título, usar el nombre del primero
        title: !prev.title && defaultFiles?.length > 0 ? defaultFiles[0].name : prev.title
      }))
      
      // ✅ Pre-cargar archivos si vienen del Drag & Drop
      setFiles(defaultFiles || [])
    } else {
      // Limpiar al cerrar el modal
      setFiles([])
    }
  }, [open, defaultProjectId, defaultClientId, defaultLeadId, defaultPropertyId, defaultApartmentId, defaultFiles])

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...droppedFiles])
    if (droppedFiles.length > 0 && !formData.title) {
      setFormData(prev => ({ ...prev, title: droppedFiles[0].name }))
    }
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selectedFiles])
    if (selectedFiles.length > 0 && !formData.title) {
      setFormData(prev => ({ ...prev, title: selectedFiles[0].name }))
    }
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLinkTypeChange = (value) => {
    setLinkType(value)
    setFormData(prev => ({
      ...prev,
      leadId: value === 'lead' ? prev.leadId : '',
      clientId: value === 'client' ? prev.clientId : '',
      propertyId: '',
      apartmentId: ''
    }))
  }

  // ✅ 5. Manejador específico para evitar que se pisen propertyId y apartmentId
  const handleResourceChange = (value) => {
    if (selectedProjectConfig.resourceType === 'property') {
      handleChange('propertyId', value)
      handleChange('apartmentId', '')
    } else {
      handleChange('apartmentId', value)
      handleChange('propertyId', '')
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError(t('upload.errorNoFile', 'Selecciona al menos un archivo'))
      return
    }
    if (!formData.projectId) {
      setError(t('upload.errorNoProject', 'El proyecto es obligatorio'))
      return
    }
    if (!formData.category) {
      setError(t('upload.errorNoCategory', 'La categoría es obligatoria'))
      return
    }

    setLoading(true)
    setError('')

    try {
      for (const file of files) {
        const formDataToSend = new FormData()
        formDataToSend.append('file', file)
        formDataToSend.append('title', formData.title || file.name)
        if (formData.description) formDataToSend.append('description', formData.description)
        formDataToSend.append('category', formData.category)
        formDataToSend.append('projectId', formData.projectId)
        
        if (formData.leadId) formDataToSend.append('leadId', formData.leadId)
        if (formData.clientId) formDataToSend.append('clientId', formData.clientId)
        
        // ✅ Enviar propertyId o apartmentId según corresponda
        if (selectedProjectConfig.resourceType === 'property' && formData.propertyId) {
          formDataToSend.append('propertyId', formData.propertyId)
        } else if (selectedProjectConfig.resourceType !== 'property' && formData.apartmentId) {
          formDataToSend.append('apartmentId', formData.apartmentId)
        }
        
        if (formData.tags) formDataToSend.append('tags', formData.tags)
        if (formData.expiresAt) formDataToSend.append('expiresAt', new Date(formData.expiresAt).toISOString())

        await documentService.uploadDocument(formDataToSend)
      }
      
      onUploadSuccess()
      handleClose()
    } catch (err) {
      setError(err.response?.data?.message || t('upload.errorUpload', 'Error al subir documentos'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFiles([])
    setLinkType('none')
    setFormData({
      projectId: defaultProjectId || '',
      clientId: '',
      leadId: '',
      propertyId: '',
      apartmentId: '',
      category: 'contract',
      title: '',
      description: '',
      tags: '',
      expiresAt: ''
    })
    setError('')
    onClose()
  }

  const filteredLeads = useMemo(() => 
    formData.projectId ? leads.filter(l => l.projectId === formData.projectId) : leads,
  [leads, formData.projectId])

  const filteredResidents = useMemo(() => {
    if (!formData.projectId) return residents.filter(r => r.role === 'user')
    return residents.filter(r => 
      r.role === 'user' && 
      (r.projects?.some(p => p._id === formData.projectId) || 
       r.projectMemberships?.some(m => m.project?._id === formData.projectId || m.project === formData.projectId))
    )
  }, [residents, formData.projectId])

  const resourceLabel = selectedProjectConfig?.resourceType === 'apartment' ? t('upload.apartment', 'Apartamento') : t('upload.property', 'Propiedad')

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>{t('upload.title')}</Typography>
        <Close sx={{ cursor: 'pointer' }} onClick={handleClose} />
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {/* Drop Zone */}
        <Box
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          sx={{
            border: '2px dashed #ccc', borderRadius: 2, p: 4, textAlign: 'center', mb: 3,
            bgcolor: files.length > 0 ? '#e3f2fd' : 'transparent', cursor: 'pointer',
            '&:hover': { borderColor: '#1976d2', bgcolor: '#f5f5f5' }
          }}
          onClick={() => document.getElementById('file-input').click()}
        >
          <CloudUpload sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
          <Typography variant="body1" fontWeight={600}>{t('upload.dragDrop')}</Typography>
          <Typography variant="caption" color="text.secondary">
            {files.length > 0 ? `${files.length} ${t('upload.filesSelected')}` : 'PDF, JPG, PNG hasta 10MB'}
          </Typography>
          <input id="file-input" type="file" multiple hidden onChange={handleFileSelect} />
        </Box>

        {/* Lista de archivos */}
        {files.length > 0 && (
          <Box sx={{ mb: 3, maxHeight: 150, overflowY: 'auto' }}>
            {files.map((file, idx) => (
              <Box key={idx} display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1, mb: 1 }}>
                <Typography variant="body2" noWrap sx={{ flex: 1 }}>{file.name}</Typography>
                <Button size="small" color="error" onClick={() => removeFile(idx)}>{t('actions.remove', 'Eliminar')}</Button>
              </Box>
            ))}
          </Box>
        )}

        {/* Campos del formulario */}
        <Box display="flex" flexDirection="column" gap={2.5}>
          <TextField
            size="small"
            label={t('form.title')}
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder={t('form.titlePlaceholder')}
            fullWidth
            required
          />

          <FormControl size="small" fullWidth required>
            <InputLabel>{t('form.category')}</InputLabel>
            <Select 
              value={formData.category} 
              onChange={(e) => handleChange('category', e.target.value)} 
              label={t('form.category')}
            >
              {CATEGORIES.map(cat => (
                <MenuItem key={cat} value={cat}>{t(`categories.${cat}`)}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth required>
            <InputLabel>{t('form.project')}</InputLabel>
            <Select 
              value={formData.projectId} 
              onChange={(e) => handleChange('projectId', e.target.value)} 
              label={t('form.project')}
            >
              {projects.map(p => (
                <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* ── VINCULAR A LEAD O CLIENTE ── */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>{t('upload.linkToPerson')}</Typography>
            <Box display="flex" gap={2} mb={1}>
              <Button variant={linkType === 'none' ? 'contained' : 'outlined'} size="small" onClick={() => handleLinkTypeChange('none')}>{t('upload.none')}</Button>
              <Button variant={linkType === 'lead' ? 'contained' : 'outlined'} size="small" onClick={() => handleLinkTypeChange('lead')}>{t('upload.lead')}</Button>
              <Button variant={linkType === 'client' ? 'contained' : 'outlined'} size="small" onClick={() => handleLinkTypeChange('client')}>{t('upload.client')}</Button>
            </Box>

            {linkType === 'lead' && (
              <FormControl size="small" fullWidth>
                <InputLabel>{t('upload.selectLead')}</InputLabel>
                <Select value={formData.leadId} onChange={(e) => handleChange('leadId', e.target.value)} label={t('upload.selectLead')}>
                  <MenuItem value="">{t('upload.noLead')}</MenuItem>
                  {filteredLeads.map(lead => (
                    <MenuItem key={lead._id} value={lead._id}>{lead.name} {lead.phone && `(${lead.phone})`}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {linkType === 'client' && (
              <FormControl size="small" fullWidth>
                <InputLabel>{t('upload.selectClient')}</InputLabel>
                <Select value={formData.clientId} onChange={(e) => handleChange('clientId', e.target.value)} label={t('upload.selectClient')}>
                  <MenuItem value="">{t('upload.noClient')}</MenuItem>
                  {filteredResidents.map(client => (
                    <MenuItem key={client._id} value={client._id}>{client.firstName} {client.lastName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>

          {/* ── VINCULAR A PROPIEDAD O APARTAMENTO (FILTRADO REAL) ── */}
          {formData.projectId && selectedProjectConfig && (
            <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
                {t('upload.linkToResource')} {resourceLabel}
              </Typography>
              
              {loadingResources ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <FormControl size="small" fullWidth>
                  <InputLabel>{resourceLabel} {formData.clientId ? t('upload.clientResource') : ''}</InputLabel>
                  <Select
                    value={selectedProjectConfig.resourceType === 'property' ? formData.propertyId : formData.apartmentId}
                    onChange={(e) => handleResourceChange(e.target.value)}
                    label={resourceLabel}
                  >
                    <MenuItem value=""><em>{t('upload.unspecified')}</em></MenuItem>
                    {availableResources.length > 0 ? (
                      availableResources.map(res => {
                        // ✅ Formato legible según el tipo de recurso
                        if (selectedProjectConfig.resourceType === 'property') {
                          const lotNumber = res.lot?.number || res.lot || 'N/A'
                          const modelName = res.model?.model || res.model?.name || ''
                          return (
                            <MenuItem key={res._id} value={res._id}>
                              Lote {lotNumber} {modelName ? `- ${modelName}` : ''}
                            </MenuItem>
                          )
                        } else {
                          return (
                            <MenuItem key={res._id} value={res._id}>
                              Apto {res.apartmentNumber}{res.floorNumber ? ` (Piso ${res.floorNumber})` : ''}
                            </MenuItem>
                          )
                        }
                      })
                    ) : (
                      <MenuItem disabled>
                        <em>{t('upload.noResourcesFound')}</em>
                      </MenuItem>
                    )}
                  </Select>
                  
                  {availableResources.length === 0 && formData.clientId && (
                    <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                      * {t('upload.noResourcesAssigned')}
                    </Typography>
                  )}
                </FormControl>
              )}
            </Box>
          )}

          <TextField
            size="small"
            label={t('form.tags')}
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder={t('form.tagsPlaceholder')}
            helperText={t('form.tagsHelper')}
            fullWidth
          />

          <TextField
            size="small"
            type="date"
            label={t('form.expiresAt')}
            value={formData.expiresAt}
            onChange={(e) => handleChange('expiresAt', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            helperText={t('form.expiresAtHelper')}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading}>{t('actions.cancel')}</Button>
        <Button 
          variant="contained" 
          onClick={handleUpload} 
          disabled={files.length === 0 || loading || !formData.projectId} 
          startIcon={loading ? <CircularProgress size={16} /> : <CloudUpload />}
          sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
        >
          {loading ? t('upload.uploading') : t('upload.title')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}