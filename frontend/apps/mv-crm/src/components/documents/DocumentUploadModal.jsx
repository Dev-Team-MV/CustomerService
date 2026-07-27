// // apps/mv-crm/src/components/documents/DocumentUploadModal.jsx
// import { useState, useEffect, useMemo } from 'react'
// import { useTranslation } from 'react-i18next'
// import {
//   Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
//   TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Chip
// } from '@mui/material'
// import { CloudUpload, Close } from '@mui/icons-material'
// import documentService from '../../services/documentService'
// import api from '@shared/services/api'
// import { useProjects } from '@shared/hooks/useProjects'
// import { useResidents } from '@shared/hooks/useResidents'
// import { useLeads } from '../../constants/hooks/useLeads'
// import { getProjectById, getProjectBySlug } from '@shared/config/projectsConfig'

// const CATEGORIES = ['contract', 'id_document', 'deed', 'appraisal', 'receipt', 'insurance', 'permit', 'blueprint', 'other']

// export default function DocumentUploadModal({ 
//   open, 
//   onClose, 
//   defaultProjectId, 
//   defaultClientId,
//   defaultLeadId,
//   defaultPropertyId,
//   defaultApartmentId,
//   defaultFiles = [],
//   onUploadSuccess 
// }) {
//   const { t } = useTranslation('documents')
//   const { projects } = useProjects()
//   const { users: residents } = useResidents(null)
//   const { leads } = useLeads()
  
//   const [files, setFiles] = useState([])
//   const [linkType, setLinkType] = useState('none')
//   const [currentTag, setCurrentTag] = useState('') // ✅ Nuevo estado para el input de tags
  
//   const [formData, setFormData] = useState({
//     projectId: defaultProjectId || '',
//     clientId: defaultClientId || '',
//     leadId: defaultLeadId || '',
//     propertyId: defaultPropertyId || '',
//     apartmentId: defaultApartmentId || '',
//     category: 'contract',
//     title: '',
//     description: '',
//     tags: [], // ✅ Ahora es un array de strings
//     expiresAt: ''
//   })
  
//   const [loading, setLoading] = useState(false)
//   const [loadingResources, setLoadingResources] = useState(false)
//   const [error, setError] = useState('')
//   const [availableResources, setAvailableResources] = useState([])

//   // ✅ 1. Configuración del proyecto seleccionado
//   const selectedProjectConfig = useMemo(() => {
//     if (!formData.projectId) return null
//     const proj = projects.find(p => p._id === formData.projectId)
//     if (!proj) return null
//     return getProjectById(proj._id) || getProjectBySlug(proj.slug)
//   }, [formData.projectId, projects])

//   // ✅ 2. Objeto completo del cliente seleccionado
//   const selectedClient = useMemo(() => {
//     if (!formData.clientId) return null
//     return residents.find(r => r._id === formData.clientId)
//   }, [formData.clientId, residents])

//   // ✅ 3. CONSULTA REAL y FILTRADO PRECISO por usuario (ROBUSTO)
//   useEffect(() => {
//     const fetchResources = async () => {
//       if (!formData.projectId || !selectedProjectConfig) {
//         setAvailableResources([])
//         return
//       }

//       setLoadingResources(true)
//       try {
//         let resources = []
        
//         if (selectedProjectConfig.resourceType === 'property') {
//           const res = await api.get('/properties', { params: { projectId: formData.projectId } })
//           const data = res.data
//           resources = Array.isArray(data) ? data : (data.properties || data.data || [])
//         } else {
//           const res = await api.get('/apartments', { params: { projectId: formData.projectId } })
//           const data = res.data
//           resources = Array.isArray(data) ? data : (data.apartments || data.data || [])
//         }

//         if (formData.clientId) {
//           resources = resources.filter(res => {
//             if (Array.isArray(res.users)) {
//               return res.users.some(u => (u._id || u) === formData.clientId)
//             }
//             if (selectedProjectConfig.resourceType === 'property' && selectedClient) {
//               const clientPropertyIds = (selectedClient.lots || selectedClient.properties || []).map(p => p._id || p)
//               return clientPropertyIds.includes(res._id)
//             }
//             return false
//           })
//         }

//         setAvailableResources(resources)
//       } catch (err) {
//         console.error('Error fetching resources:', err)
//         setAvailableResources([])
//       } finally {
//         setLoadingResources(false)
//       }
//     }

//     fetchResources()
//   }, [formData.projectId, formData.clientId, selectedProjectConfig, selectedClient])

//   // ✅ Inicializar estados basados en props por defecto y manejar defaultFiles
//   useEffect(() => {
//     if (open) {
//       if (defaultLeadId) setLinkType('lead')
//       else if (defaultClientId) setLinkType('client')
//       else setLinkType('none')

//       setFormData(prev => ({
//         ...prev,
//         projectId: defaultProjectId || prev.projectId,
//         clientId: defaultClientId || '',
//         leadId: defaultLeadId || '',
//         propertyId: defaultPropertyId || '',
//         apartmentId: defaultApartmentId || '',
//         tags: [], // Resetear tags al abrir
//         title: !prev.title && defaultFiles?.length > 0 ? defaultFiles[0].name : prev.title
//       }))
      
//       setFiles(defaultFiles || [])
//       setCurrentTag('')
//     } else {
//       setFiles([])
//       setCurrentTag('')
//     }
//   }, [open, defaultProjectId, defaultClientId, defaultLeadId, defaultPropertyId, defaultApartmentId, defaultFiles])

//   // ✅ Manejador para agregar tags con Enter
//   const handleAddTag = (e) => {
//     if (e.key === 'Enter') {
//       e.preventDefault()
//       const rawValue = currentTag.trim()
//       if (!rawValue) return
      
//       // Soportar separación por comas si el usuario pega una lista
//       const newTags = rawValue.split(',').map(t => t.trim()).filter(t => t.length > 0)
      
//       setFormData(prev => {
//         const uniqueTags = [...prev.tags]
//         newTags.forEach(tag => {
//           if (!uniqueTags.includes(tag)) {
//             uniqueTags.push(tag)
//           }
//         })
//         return { ...prev, tags: uniqueTags }
//       })
//       setCurrentTag('')
//     }
//   }

//   // ✅ Manejador para eliminar una tag específica
//   const handleRemoveTag = (tagToRemove) => {
//     setFormData(prev => ({
//       ...prev,
//       tags: prev.tags.filter(tag => tag !== tagToRemove)
//     }))
//   }

//   const handleDrop = (e) => {
//     e.preventDefault()
//     const droppedFiles = Array.from(e.dataTransfer.files)
//     setFiles(prev => [...prev, ...droppedFiles])
//     if (droppedFiles.length > 0 && !formData.title) {
//       setFormData(prev => ({ ...prev, title: droppedFiles[0].name }))
//     }
//   }

//   const handleFileSelect = (e) => {
//     const selectedFiles = Array.from(e.target.files)
//     setFiles(prev => [...prev, ...selectedFiles])
//     if (selectedFiles.length > 0 && !formData.title) {
//       setFormData(prev => ({ ...prev, title: selectedFiles[0].name }))
//     }
//   }

//   const removeFile = (index) => {
//     setFiles(prev => prev.filter((_, i) => i !== index))
//   }

//   const handleChange = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }))
//   }

//   const handleLinkTypeChange = (value) => {
//     setLinkType(value)
//     setFormData(prev => ({
//       ...prev,
//       leadId: value === 'lead' ? prev.leadId : '',
//       clientId: value === 'client' ? prev.clientId : '',
//       propertyId: '',
//       apartmentId: ''
//     }))
//   }

//   const handleResourceChange = (value) => {
//     if (selectedProjectConfig.resourceType === 'property') {
//       handleChange('propertyId', value)
//       handleChange('apartmentId', '')
//     } else {
//       handleChange('apartmentId', value)
//       handleChange('propertyId', '')
//     }
//   }

//   const handleUpload = async () => {
//     if (files.length === 0) {
//       setError(t('upload.errorNoFile', 'Selecciona al menos un archivo'))
//       return
//     }
//     if (!formData.projectId) {
//       setError(t('upload.errorNoProject', 'El proyecto es obligatorio'))
//       return
//     }
//     if (!formData.category) {
//       setError(t('upload.errorNoCategory', 'La categoría es obligatoria'))
//       return
//     }

//     setLoading(true)
//     setError('')

//     try {
//       for (const file of files) {
//         const formDataToSend = new FormData()
//         formDataToSend.append('file', file)
//         formDataToSend.append('title', formData.title || file.name)
//         if (formData.description) formDataToSend.append('description', formData.description)
//         formDataToSend.append('category', formData.category)
//         formDataToSend.append('projectId', formData.projectId)
        
//         if (formData.leadId) formDataToSend.append('leadId', formData.leadId)
//         if (formData.clientId) formDataToSend.append('clientId', formData.clientId)
        
//         if (selectedProjectConfig.resourceType === 'property' && formData.propertyId) {
//           formDataToSend.append('propertyId', formData.propertyId)
//         } else if (selectedProjectConfig.resourceType !== 'property' && formData.apartmentId) {
//           formDataToSend.append('apartmentId', formData.apartmentId)
//         }
        
//         // ✅ Enviar tags como múltiples valores o string separado por comas
//         if (formData.tags && formData.tags.length > 0) {
//           formData.tags.forEach(tag => formDataToSend.append('tags', tag))
//         }
        
//         if (formData.expiresAt) formDataToSend.append('expiresAt', new Date(formData.expiresAt).toISOString())

//         await documentService.uploadDocument(formDataToSend)
//       }
      
//       onUploadSuccess()
//       handleClose()
//     } catch (err) {
//       setError(err.response?.data?.message || t('upload.errorUpload', 'Error al subir documentos'))
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleClose = () => {
//     setFiles([])
//     setLinkType('none')
//     setCurrentTag('')
//     setFormData({
//       projectId: defaultProjectId || '',
//       clientId: '',
//       leadId: '',
//       propertyId: '',
//       apartmentId: '',
//       category: 'contract',
//       title: '',
//       description: '',
//       tags: [],
//       expiresAt: ''
//     })
//     setError('')
//     onClose()
//   }

//   const filteredLeads = useMemo(() => 
//     formData.projectId ? leads.filter(l => l.projectId === formData.projectId) : leads,
//   [leads, formData.projectId])

//   const filteredResidents = useMemo(() => {
//     if (!formData.projectId) return residents.filter(r => r.role === 'user')
//     return residents.filter(r => 
//       r.role === 'user' && 
//       (r.projects?.some(p => p._id === formData.projectId) || 
//        r.projectMemberships?.some(m => m.project?._id === formData.projectId || m.project === formData.projectId))
//     )
//   }, [residents, formData.projectId])

//   const resourceLabel = selectedProjectConfig?.resourceType === 'apartment' ? t('upload.apartment', 'Apartamento') : t('upload.property', 'Propiedad')

//   return (
//     <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
//       <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Typography variant="h6" fontWeight={700}>{t('upload.title')}</Typography>
//         <Close sx={{ cursor: 'pointer' }} onClick={handleClose} />
//       </DialogTitle>
//       <DialogContent dividers>
//         {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
//         {/* Drop Zone */}
//         <Box
//           onDrop={handleDrop}
//           onDragOver={(e) => e.preventDefault()}
//           sx={{
//             border: '2px dashed #ccc', borderRadius: 2, p: 4, textAlign: 'center', mb: 3,
//             bgcolor: files.length > 0 ? '#e3f2fd' : 'transparent', cursor: 'pointer',
//             '&:hover': { borderColor: '#1976d2', bgcolor: '#f5f5f5' }
//           }}
//           onClick={() => document.getElementById('file-input').click()}
//         >
//           <CloudUpload sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
//           <Typography variant="body1" fontWeight={600}>{t('upload.dragDrop')}</Typography>
//           <Typography variant="caption" color="text.secondary">
//             {files.length > 0 ? `${files.length} ${t('upload.filesSelected')}` : 'PDF, JPG, PNG hasta 10MB'}
//           </Typography>
//           <input id="file-input" type="file" multiple hidden onChange={handleFileSelect} />
//         </Box>

//         {/* Lista de archivos */}
//         {files.length > 0 && (
//           <Box sx={{ mb: 3, maxHeight: 150, overflowY: 'auto' }}>
//             {files.map((file, idx) => (
//               <Box key={idx} display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1, mb: 1 }}>
//                 <Typography variant="body2" noWrap sx={{ flex: 1 }}>{file.name}</Typography>
//                 <Button size="small" color="error" onClick={() => removeFile(idx)}>{t('actions.remove', 'Eliminar')}</Button>
//               </Box>
//             ))}
//           </Box>
//         )}

//         {/* Campos del formulario */}
//         <Box display="flex" flexDirection="column" gap={2.5}>
//           <TextField
//             size="small"
//             label={t('form.title')}
//             value={formData.title}
//             onChange={(e) => handleChange('title', e.target.value)}
//             placeholder={t('form.titlePlaceholder')}
//             fullWidth
//             required
//           />

//           <FormControl size="small" fullWidth required>
//             <InputLabel>{t('form.category')}</InputLabel>
//             <Select 
//               value={formData.category} 
//               onChange={(e) => handleChange('category', e.target.value)} 
//               label={t('form.category')}
//             >
//               {CATEGORIES.map(cat => (
//                 <MenuItem key={cat} value={cat}>{t(`categories.${cat}`)}</MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           <FormControl size="small" fullWidth required>
//             <InputLabel>{t('form.project')}</InputLabel>
//             <Select 
//               value={formData.projectId} 
//               onChange={(e) => handleChange('projectId', e.target.value)} 
//               label={t('form.project')}
//             >
//               {projects.map(p => (
//                 <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           {/* ── VINCULAR A LEAD O CLIENTE ── */}
//           <Box>
//             <Typography variant="subtitle2" fontWeight={600} mb={1}>{t('upload.linkToPerson')}</Typography>
//             <Box display="flex" gap={2} mb={1}>
//               <Button variant={linkType === 'none' ? 'contained' : 'outlined'} size="small" onClick={() => handleLinkTypeChange('none')}>{t('upload.none')}</Button>
//               <Button variant={linkType === 'lead' ? 'contained' : 'outlined'} size="small" onClick={() => handleLinkTypeChange('lead')}>{t('upload.lead')}</Button>
//               <Button variant={linkType === 'client' ? 'contained' : 'outlined'} size="small" onClick={() => handleLinkTypeChange('client')}>{t('upload.client')}</Button>
//             </Box>

//             {linkType === 'lead' && (
//               <FormControl size="small" fullWidth>
//                 <InputLabel>{t('upload.selectLead')}</InputLabel>
//                 <Select value={formData.leadId} onChange={(e) => handleChange('leadId', e.target.value)} label={t('upload.selectLead')}>
//                   <MenuItem value="">{t('upload.noLead')}</MenuItem>
//                   {filteredLeads.map(lead => (
//                     <MenuItem key={lead._id} value={lead._id}>{lead.name} {lead.phone && `(${lead.phone})`}</MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             )}

//             {linkType === 'client' && (
//               <FormControl size="small" fullWidth>
//                 <InputLabel>{t('upload.selectClient')}</InputLabel>
//                 <Select value={formData.clientId} onChange={(e) => handleChange('clientId', e.target.value)} label={t('upload.selectClient')}>
//                   <MenuItem value="">{t('upload.noClient')}</MenuItem>
//                   {filteredResidents.map(client => (
//                     <MenuItem key={client._id} value={client._id}>{client.firstName} {client.lastName}</MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             )}
//           </Box>

//           {/* ── VINCULAR A PROPIEDAD O APARTAMENTO ── */}
//           {formData.projectId && selectedProjectConfig && (
//             <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px solid #e0e0e0' }}>
//               <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
//                 {t('upload.linkToResource')} {resourceLabel}
//               </Typography>
              
//               {loadingResources ? (
//                 <Box display="flex" justifyContent="center" py={2}>
//                   <CircularProgress size={24} />
//                 </Box>
//               ) : (
//                 <FormControl size="small" fullWidth>
//                   <InputLabel>{resourceLabel} {formData.clientId ? t('upload.clientResource') : ''}</InputLabel>
//                   <Select
//                     value={selectedProjectConfig.resourceType === 'property' ? formData.propertyId : formData.apartmentId}
//                     onChange={(e) => handleResourceChange(e.target.value)}
//                     label={resourceLabel}
//                   >
//                     <MenuItem value=""><em>{t('upload.unspecified')}</em></MenuItem>
//                     {availableResources.length > 0 ? (
//                       availableResources.map(res => {
//                         if (selectedProjectConfig.resourceType === 'property') {
//                           const lotNumber = res.lot?.number || res.lot || 'N/A'
//                           const modelName = res.model?.model || res.model?.name || ''
//                           return (
//                             <MenuItem key={res._id} value={res._id}>
//                               Lote {lotNumber} {modelName ? `- ${modelName}` : ''}
//                             </MenuItem>
//                           )
//                         } else {
//                           return (
//                             <MenuItem key={res._id} value={res._id}>
//                               Apto {res.apartmentNumber}{res.floorNumber ? ` (Piso ${res.floorNumber})` : ''}
//                             </MenuItem>
//                           )
//                         }
//                       })
//                     ) : (
//                       <MenuItem disabled>
//                         <em>{t('upload.noResourcesFound')}</em>
//                       </MenuItem>
//                     )}
//                   </Select>
                  
//                   {availableResources.length === 0 && formData.clientId && (
//                     <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
//                       * {t('upload.noResourcesAssigned')}
//                     </Typography>
//                   )}
//                 </FormControl>
//               )}
//             </Box>
//           )}

//           {/* ✅ NUEVO: Input de Tags con Chips */}
//           <Box>
//             <TextField
//               size="small"
//               label={t('form.tags')}
//               value={currentTag}
//               onChange={(e) => setCurrentTag(e.target.value)}
//               onKeyDown={handleAddTag}
//               placeholder={t('form.tagsPlaceholder', 'Escribe una etiqueta y presiona Enter')}
//               fullWidth
//               sx={{ mb: 1 }}
//             />
//             {formData.tags.length > 0 && (
//               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                 {formData.tags.map((tag, idx) => (
//                   <Chip
//                     key={idx}
//                     label={tag}
//                     size="small"
//                     onDelete={() => handleRemoveTag(tag)}
//                     sx={{ 
//                       bgcolor: '#e3f2fd', 
//                       color: '#1976d2',
//                       fontWeight: 500,
//                       '& .MuiChip-deleteIcon': {
//                         color: '#1976d2',
//                         '&:hover': { color: '#1565c0' }
//                       }
//                     }}
//                   />
//                 ))}
//               </Box>
//             )}
//           </Box>

//           <TextField
//             size="small"
//             type="date"
//             label={t('form.expiresAt')}
//             value={formData.expiresAt}
//             onChange={(e) => handleChange('expiresAt', e.target.value)}
//             InputLabelProps={{ shrink: true }}
//             fullWidth
//             helperText={t('form.expiresAtHelper')}
//           />
//         </Box>
//       </DialogContent>
//       <DialogActions sx={{ p: 2 }}>
//         <Button onClick={handleClose} disabled={loading}>{t('actions.cancel')}</Button>
//         <Button 
//           variant="contained" 
//           onClick={handleUpload} 
//           disabled={files.length === 0 || loading || !formData.projectId} 
//           startIcon={loading ? <CircularProgress size={16} /> : <CloudUpload />}
//           sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
//         >
//           {loading ? t('upload.uploading') : t('upload.title')}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   )
// }

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Chip
} from '@mui/material'
import { CloudUpload, Close } from '@mui/icons-material'
import documentService from '../../services/documentService'
import api from '@shared/services/api'
import { useProjects } from '@shared/hooks/useProjects'
import { useResidents } from '@shared/hooks/useResidents'
import { useLeads } from '../../constants/hooks/useLeads'
import { getProjectById, getProjectBySlug } from '@shared/config/projectsConfig'

const CATEGORIES = ['contract', 'id_document', 'deed', 'appraisal', 'receipt', 'insurance', 'permit', 'blueprint', 'other']

// ✅ CORRECCIÓN 1: Eliminar "= []" de defaultFiles para evitar nuevas referencias en cada render
export default function DocumentUploadModal({ 
  open, 
  onClose, 
  defaultProjectId, 
  defaultClientId,
  defaultLeadId,
  defaultPropertyId,
  defaultApartmentId,
  defaultFiles, 
  onUploadSuccess 
}) {
  const { t } = useTranslation('documents')
  const { projects } = useProjects()
  const { users: residents } = useResidents(null)
  const { leads } = useLeads()
  
  const [files, setFiles] = useState([])
  const [linkType, setLinkType] = useState('none')
  const [currentTag, setCurrentTag] = useState('')
  
  const [formData, setFormData] = useState({
    projectId: defaultProjectId || '',
    clientId: defaultClientId || '',
    leadId: defaultLeadId || '',
    propertyId: defaultPropertyId || '',
    apartmentId: defaultApartmentId || '',
    category: 'contract',
    title: '',
    description: '',
    tags: [],
    expiresAt: ''
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
          const data = res.data
          resources = Array.isArray(data) ? data : (data.properties || data.data || [])
        } else {
          const res = await api.get('/apartments', { params: { projectId: formData.projectId } })
          const data = res.data
          resources = Array.isArray(data) ? data : (data.apartments || data.data || [])
        }

        if (formData.clientId) {
          resources = resources.filter(res => {
            if (Array.isArray(res.users)) {
              return res.users.some(u => (u._id || u) === formData.clientId)
            }
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

  // ✅ CORRECCIÓN 2: Manejo seguro de defaultFiles y eliminación de su dependencia para evitar bucles infinitos
  useEffect(() => {
    if (open) {
      if (defaultLeadId) setLinkType('lead')
      else if (defaultClientId) setLinkType('client')
      else setLinkType('none')

      const safeFiles = defaultFiles && defaultFiles.length > 0 ? defaultFiles : []

      setFormData(prev => ({
        ...prev,
        projectId: defaultProjectId || prev.projectId,
        clientId: defaultClientId || '',
        leadId: defaultLeadId || '',
        propertyId: defaultPropertyId || '',
        apartmentId: defaultApartmentId || '',
        tags: [],
        title: !prev.title && safeFiles.length > 0 ? safeFiles[0].name : prev.title
      }))
      
      setFiles(safeFiles)
      setCurrentTag('')
    } else {
      setFiles([])
      setCurrentTag('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultProjectId, defaultClientId, defaultLeadId, defaultPropertyId, defaultApartmentId])

  const handleAddTag = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const rawValue = currentTag.trim()
      if (!rawValue) return
      
      const newTags = rawValue.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      
      setFormData(prev => {
        const uniqueTags = [...prev.tags]
        newTags.forEach(tag => {
          if (!uniqueTags.includes(tag)) {
            uniqueTags.push(tag)
          }
        })
        return { ...prev, tags: uniqueTags }
      })
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

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

  const handleResourceChange = (value) => {
    if (selectedProjectConfig.resourceType === 'property' || selectedProjectConfig.catalogType === 'houses') {
      handleChange('propertyId', value)
      handleChange('apartmentId', '')
    } else {
      handleChange('apartmentId', value)
      handleChange('propertyId', '')
    }
  }

  // ✅ CORRECCIÓN 3: Capturar la respuesta del backend y pasar el ID al componente padre
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
        
        if (formData.tags && formData.tags.length > 0) {
          formData.tags.forEach(tag => formDataToSend.append('tags', tag))
        }
        
        if (formData.expiresAt) formDataToSend.append('expiresAt', new Date(formData.expiresAt).toISOString())

        // Subimos el documento y guardamos la respuesta
        const response = await documentService.uploadDocument(formDataToSend)
        uploadResults.push(response.data || response)
      }
      
      // Si es un solo archivo (como en Onboarding), pasamos el objeto directo. 
      // Si son varios (como en Documentos), pasamos el array. El padre sabrá manejarlo.
      if (onUploadSuccess) {
        onUploadSuccess(uploadResults.length === 1 ? uploadResults[0] : uploadResults)
      }
      
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
    setCurrentTag('')
    setFormData({
      projectId: defaultProjectId || '',
      clientId: '',
      leadId: '',
      propertyId: '',
      apartmentId: '',
      category: 'contract',
      title: '',
      description: '',
      tags: [],
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
                    value={selectedProjectConfig.resourceType === 'property' || selectedProjectConfig.catalogType === 'houses' ? formData.propertyId : formData.apartmentId}
                    onChange={(e) => handleResourceChange(e.target.value)}
                    label={resourceLabel}
                  >
                    <MenuItem value=""><em>{t('upload.unspecified')}</em></MenuItem>
                    {availableResources.length > 0 ? (
                      availableResources.map(res => {
                        if (selectedProjectConfig.resourceType === 'property' || selectedProjectConfig.catalogType === 'houses') {
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

          <Box>
            <TextField
              size="small"
              label={t('form.tags')}
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={t('form.tagsPlaceholder', 'Escribe una etiqueta y presiona Enter')}
              fullWidth
              sx={{ mb: 1 }}
            />
            {formData.tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.tags.map((tag, idx) => (
                  <Chip
                    key={idx}
                    label={tag}
                    size="small"
                    onDelete={() => handleRemoveTag(tag)}
                    sx={{ 
                      bgcolor: '#e3f2fd', 
                      color: '#1976d2',
                      fontWeight: 500,
                      '& .MuiChip-deleteIcon': {
                        color: '#1976d2',
                        '&:hover': { color: '#1565c0' }
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

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