// import { useState, useEffect } from 'react'
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Box,
//   Typography,
//   Button,
//   Stepper,
//   Step,
//   StepLabel,
//   StepContent,
//   IconButton,
//   ImageList,
//   ImageListItem,
//   ImageListItemBar,
//   Chip,
//   Alert,
//   CircularProgress,
//   Paper,
//   TextField,
//   Grid
// } from '@mui/material'
// import {
//   Close,
//   CheckCircle,
//   Lock,
//   Upload,
//   Delete,
//   Construction,
//   LockOpen,
//   CloudUpload
// } from '@mui/icons-material'
// import api from '../services/api'

// const PHASE_DESCRIPTIONS = [
//   'Clearing and grading the land, setting up utilities and access',
//   'Pouring concrete foundation and slab work',
//   'Building the structure frame, walls, and roof structure',
//   'Installing roof materials and waterproofing systems',
//   'Installing plumbing lines, electrical wiring, and HVAC systems',
//   'Adding insulation and hanging drywall throughout the home',
//   'Installing flooring, painting, cabinets, and interior fixtures',
//   'Completing siding, exterior painting, and landscaping',
//   'Final walkthrough, quality checks, and project completion'
// ]

// const ConstructionPhasesModal = ({ open, property, onClose, isAdmin }) => {
//   const [phases, setPhases] = useState([])
//   const [activeStep, setActiveStep] = useState(0)
//   const [loading, setLoading] = useState(false)
//   const [uploading, setUploading] = useState(false)
//   const [selectedFiles, setSelectedFiles] = useState([])
//   const [mediaTitle, setMediaTitle] = useState('')

//   useEffect(() => {
//     if (open && property) {
//       fetchPhases()
//     }
//   }, [open, property])

//   const fetchPhases = async () => {
//     try {
//       setLoading(true)
//       const response = await api.get(`/phases/property/${property._id}`)
      
//       // Asegurar que existan las 9 fases
//       const existingPhases = response.data
//       const allPhases = []
      
//       for (let i = 1; i <= 9; i++) {
//         const existingPhase = existingPhases.find(p => p.phaseNumber === i)
//         if (existingPhase) {
//           allPhases.push(existingPhase)
//         } else {
//           // Crear fase vacía local si no existe en DB
//           allPhases.push({
//             phaseNumber: i,
//             title: `Phase ${i}`, // Título por defecto si no existe
//             constructionPercentage: 0,
//             mediaItems: [],
//             property: property._id,
//             _isNew: true
//           })
//         }
//       }
      
//       setPhases(allPhases)
      
//       // Set active step to first incomplete phase
//       const firstIncomplete = allPhases.findIndex(p => p.constructionPercentage < 100)
//       setActiveStep(firstIncomplete >= 0 ? firstIncomplete : allPhases.length - 1)
//     } catch (error) {
//       console.error('Error fetching phases:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleFileSelect = (event) => {
//     const files = Array.from(event.target.files)
//     setSelectedFiles(files)
//   }

//   const handleUploadImages = async (phaseNumber) => {
//     if (selectedFiles.length === 0 || !mediaTitle) {
//       alert('Please select images and enter a title')
//       return
//     }

//     try {
//       setUploading(true)
//       const formData = new FormData()
      
//       selectedFiles.forEach(file => {
//         formData.append('images', file)
//       })
      
//       formData.append('phaseNumber', phaseNumber)
//       formData.append('title', mediaTitle)

//       const response = await api.post(
//         `/upload/phase-images/${property._id}`, 
//         formData,
//         {
//           headers: { 'Content-Type': 'multipart/form-data' }
//         }
//       )

//       // Mostrar mensaje de éxito
//       alert(`✅ ${selectedFiles.length} image(s) uploaded successfully!`)

//       // Limpiar estado
//       setSelectedFiles([])
//       setMediaTitle('')
      
//       // Refrescar datos
//       await fetchPhases()
      
//     } catch (error) {
//       console.error('Error uploading images:', error)
//       const errorMessage = error.response?.data?.message || 'Error uploading images. Please try again.'
//       alert(`❌ ${errorMessage}`)
//     } finally {
//       setUploading(false)
//     }
//   }

//   const handleDeleteMediaItem = async (phaseId, mediaItemId) => {
//     if (!window.confirm('Are you sure you want to delete this image?')) return

//     try {
//       await api.delete(`/phases/${phaseId}/media/${mediaItemId}`)
      
//       // Mostrar mensaje de éxito
//       alert('✅ Image deleted successfully!')
      
//       await fetchPhases()
//     } catch (error) {
//       console.error('Error deleting media:', error)
//       alert('❌ Error deleting image. Please try again.')
//     }
//   }

//   const canUploadToPhase = (phaseNumber) => {
//     if (!isAdmin) return false
//     if (phaseNumber === 1) return true
    
//     const previousPhase = phases.find(p => p.phaseNumber === phaseNumber - 1)
//     return previousPhase?.constructionPercentage === 100
//   }

//   const isPhaseCompleted = (phaseNumber) => {
//     const phase = phases.find(p => p.phaseNumber === phaseNumber)
//     return phase?.constructionPercentage === 100
//   }

//   return (
//     <Dialog 
//       open={open} 
//       onClose={onClose}
//       maxWidth="lg"
//       fullWidth
//       PaperProps={{
//         sx: { minHeight: '85vh', maxHeight: '90vh' }
//       }}
//     >
//       <DialogTitle>
//         <Box display="flex" justifyContent="space-between" alignItems="center">
//           <Box display="flex" alignItems="center" gap={2}>
//             <Construction color="primary" sx={{ fontSize: 32 }} />
//             <Box>
//               <Typography variant="h6" fontWeight="bold">
//                 Construction Progress - Lot {property.lot?.number}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 {property.model?.model} • {property.user?.firstName} {property.user?.lastName}
//               </Typography>
//             </Box>
//           </Box>
//           <IconButton onClick={onClose}>
//             <Close />
//           </IconButton>
//         </Box>
//       </DialogTitle>

//       <DialogContent sx={{ pb: 3 }}>
//         {loading ? (
//           <Box display="flex" justifyContent="center" p={4}>
//             <CircularProgress />
//           </Box>
//         ) : (
//           <Stepper activeStep={activeStep} orientation="vertical">
//             {phases.map((phase) => {
//               const canUpload = canUploadToPhase(phase.phaseNumber)
//               const isCompleted = isPhaseCompleted(phase.phaseNumber)
//               const isLocked = !canUpload && !isCompleted && phase.phaseNumber !== 1
//               const description = PHASE_DESCRIPTIONS[phase.phaseNumber - 1]

//               return (
//                 <Step key={phase.phaseNumber} expanded={true}>
//                   <StepLabel
//                     StepIconComponent={() => (
//                       isCompleted ? (
//                         <CheckCircle color="success" sx={{ fontSize: 28 }} />
//                       ) : isLocked ? (
//                         <Lock color="disabled" sx={{ fontSize: 28 }} />
//                       ) : (
//                         <LockOpen color="primary" sx={{ fontSize: 28 }} />
//                       )
//                     )}
//                   >
//                     <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
//                       <Typography variant="subtitle1" fontWeight="bold">
//                         {phase.title}
//                       </Typography>
//                       {isCompleted && (
//                         <Chip label="100% Complete" color="success" size="small" />
//                       )}
//                       {isLocked && (
//                         <Chip label="Locked" size="small" icon={<Lock />} />
//                       )}
//                       {!isCompleted && !isLocked && (
//                         <Chip 
//                           label={`${phase.constructionPercentage}% Complete`} 
//                           color="primary" 
//                           size="small" 
//                         />
//                       )}
//                     </Box>
//                     <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
//                       {description}
//                     </Typography>
//                   </StepLabel>

//                   <StepContent>
//                     <Box sx={{ mb: 2 }}>
//                       {isLocked && (
//                         <Alert severity="warning" sx={{ mb: 2 }}>
//                           Complete {phases[phase.phaseNumber - 2]?.title} (100%) before uploading to this phase
//                         </Alert>
//                       )}

//                       {/* Admin Upload Section */}
//                       {isAdmin && (canUpload || phase.phaseNumber === 1) && !isCompleted && (
//                         <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
//                           <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
//                             📸 Upload Progress Images
//                           </Typography>
                          
//                           <Grid container spacing={2} sx={{ mb: 2 }}>
//                             <Grid item xs={12}>
//                               <TextField
//                                 fullWidth
//                                 size="small"
//                                 label="Image Title/Description"
//                                 value={mediaTitle}
//                                 onChange={(e) => setMediaTitle(e.target.value)}
//                                 placeholder="e.g., Foundation poured - West section"
//                               />
//                             </Grid>
//                           </Grid>

//                           <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
//                             <Button
//                               variant="outlined"
//                               component="label"
//                               startIcon={<CloudUpload />}
//                             >
//                               Select Images
//                               <input
//                                 type="file"
//                                 hidden
//                                 multiple
//                                 accept="image/*"
//                                 onChange={handleFileSelect}
//                               />
//                             </Button>
//                             {selectedFiles.length > 0 && (
//                               <>
//                                 <Typography variant="body2">
//                                   {selectedFiles.length} file(s) selected
//                                 </Typography>
//                                 <Button
//                                   variant="contained"
//                                   onClick={() => handleUploadImages(phase.phaseNumber)}
//                                   disabled={uploading || !mediaTitle}
//                                   startIcon={<Upload />}
//                                 >
//                                   {uploading ? 'Uploading...' : 'Upload'}
//                                 </Button>
//                               </>
//                             )}
//                           </Box>
//                         </Paper>
//                       )}

//                       {/* Progress Info (Read-only for all) */}
//                       <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
//                         <Box display="flex" justifyContent="space-between" alignItems="center">
//                           <Typography variant="body2" color="text.secondary">
//                             Construction Progress:
//                           </Typography>
//                           <Chip 
//                             label={`${phase.constructionPercentage}%`}
//                             color={phase.constructionPercentage === 100 ? 'success' : 'primary'}
//                             size="small"
//                           />
//                         </Box>
//                         {phase.mediaItems && phase.mediaItems.length > 0 && (
//                           <Typography variant="caption" color="text.secondary" display="block" mt={1}>
//                             {phase.mediaItems.length} image{phase.mediaItems.length !== 1 ? 's' : ''} uploaded
//                           </Typography>
//                         )}
//                       </Paper>

//                       {/* Images Display */}
//                       {phase.mediaItems && phase.mediaItems.length > 0 ? (
//                         <Box>
//                           <Typography variant="subtitle2" gutterBottom fontWeight="bold">
//                             📷 Progress Images ({phase.mediaItems.length})
//                           </Typography>
//                           <ImageList cols={3} gap={12} sx={{ maxHeight: 400 }}>
//                             {phase.mediaItems.map((media, index) => (
//                               <ImageListItem key={media._id || index}>
//                                 <img
//                                   src={media.url}
//                                   alt={media.title}
//                                   loading="lazy"
//                                   style={{ height: 200, objectFit: 'cover', borderRadius: 8 }}
//                                 />
//                                 <ImageListItemBar
//                                   title={media.title}
//                                   subtitle={media.percentage ? `Progress: ${media.percentage}%` : null}
//                                   actionIcon={
//                                     isAdmin && (
//                                       <IconButton
//                                         sx={{ color: 'white' }}
//                                         onClick={() => handleDeleteMediaItem(phase._id, media._id)}
//                                       >
//                                         <Delete />
//                                       </IconButton>
//                                     )
//                                   }
//                                   sx={{
//                                     background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
//                                     borderRadius: '0 0 8px 8px'
//                                   }}
//                                 />
//                               </ImageListItem>
//                             ))}
//                           </ImageList>
//                         </Box>
//                       ) : (
//                         <Alert severity="info">
//                           📭 No images uploaded for this phase yet
//                         </Alert>
//                       )}
//                     </Box>
//                   </StepContent>
//                 </Step>
//               )
//             })}
//           </Stepper>
//         )}
//       </DialogContent>

//       <DialogActions sx={{ px: 3, py: 2 }}>
//         <Button onClick={onClose} variant="outlined">
//           Close
//         </Button>
//       </DialogActions>
//     </Dialog>
//   )
// }

// export default ConstructionPhasesModal


import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  LinearProgress,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Chip,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material'
import {
  Close,
  CloudUpload,
  Delete,
  CheckCircle,
  Lock,
  LockOpen
} from '@mui/icons-material'
import api from '../services/api'
import uploadService from '../services/uploadService'

const PHASE_TITLES = [
  'Site Preparation',
  'Foundation',
  'Framing',
  'Roofing',
  'MEP Installation',
  'Insulation & Drywall',
  'Interior Finishes',
  'Exterior Finishes',
  'Final Inspection'
]

const ConstructionPhasesModal = ({ open, property, onClose, isAdmin }) => {
  const [phases, setPhases] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState(null)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    percentage: 0,
    images: []
  })

  useEffect(() => {
    if (open && property) {
      fetchPhases()
    }
  }, [open, property])

  const fetchPhases = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/phases/property/${property._id}`)
      
      // Asegurar 9 fases
      const existingPhases = response.data
      const allPhases = []
      
      for (let i = 1; i <= 9; i++) {
        const existingPhase = existingPhases.find(p => p.phaseNumber === i)
        if (existingPhase) {
          allPhases.push(existingPhase)
        } else {
          allPhases.push({
            phaseNumber: i,
            title: PHASE_TITLES[i - 1],
            constructionPercentage: 0,
            mediaItems: [],
            property: property._id
          })
        }
      }
      
      setPhases(allPhases)
    } catch (error) {
      console.error('Error fetching phases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenUploadDialog = (phase) => {
    setSelectedPhase(phase)
    setUploadForm({
      title: '',
      percentage: 0,
      images: []
    })
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setUploadForm(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }))
  }

  const handleRemoveImage = (index) => {
    setUploadForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

const handleUploadImages = async () => {
  if (!uploadForm.images.length) {
    alert('Please select at least one image')
    return
  }

  try {
    setUploading(true)

    // ✅ 1. Subir imágenes a GCS
    console.log(`📤 Uploading ${uploadForm.images.length} images for Phase ${selectedPhase.phaseNumber}...`)
    const urls = await uploadService.uploadPhaseImages(uploadForm.images)
    console.log('✅ Images uploaded to GCS:', urls)

    // ✅ 2. Calcular nuevo porcentaje
    const currentPercentage = selectedPhase.constructionPercentage || 0
    const addedPercentage = parseFloat(uploadForm.percentage) || 0
    const newPercentage = Math.min(100, currentPercentage + addedPercentage)

    console.log('📊 Percentage calculation:', {
      current: currentPercentage,
      added: addedPercentage,
      new: newPercentage
    })

    // ✅ 3. Actualizar o crear la fase
    let phaseId = selectedPhase._id

    if (!phaseId) {
      // Fase NO existe - Crear primero
      console.log('➕ Creating new phase')
      
      const createResponse = await api.post('/phases', {
        property: property._id,
        phaseNumber: selectedPhase.phaseNumber,
        title: selectedPhase.title,
        constructionPercentage: newPercentage
      })

      phaseId = createResponse.data._id
      console.log('✅ Phase created with ID:', phaseId)
    } else {
      // Fase existe - Actualizar porcentaje primero
      console.log('🔄 Updating phase percentage')
      
      await api.put(`/phases/${phaseId}`, {
        constructionPercentage: newPercentage
      })
      
      console.log('✅ Phase percentage updated')
    }

    // ✅ 4. Agregar cada mediaItem individualmente usando el endpoint correcto
    console.log(`📤 Adding ${urls.length} media items to phase ${phaseId}`)
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      const mediaItemData = {
        url,
        title: uploadForm.title || `Phase ${selectedPhase.phaseNumber} - Image ${i + 1}`,
        percentage: addedPercentage / urls.length, // Distribuir el porcentaje entre todas las imágenes
        mediaType: 'image'
      }

      console.log(`📤 Adding media item ${i + 1}/${urls.length}:`, mediaItemData)

      // Usar el endpoint POST /phases/:id/media
      await api.post(`/phases/${phaseId}/media`, mediaItemData)
      
      console.log(`✅ Media item ${i + 1} added`)
    }

    console.log('✅ All media items added successfully')
    alert('✅ Images uploaded successfully!')
    
    setSelectedPhase(null)
    setUploadForm({ title: '', percentage: 0, images: [] })
    fetchPhases()
    
  } catch (error) {
    console.error('❌ Error uploading images:', error)
    console.error('❌ Error details:', error.response?.data)
    alert(`❌ Error: ${error.response?.data?.message || error.message}`)
  } finally {
    setUploading(false)
  }
}

  const handleDeleteMedia = async (phaseId, mediaId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return

    try {
      const phase = phases.find(p => p._id === phaseId)
      const updatedMediaItems = phase.mediaItems.filter(m => m._id !== mediaId)

      await api.put(`/phases/${phaseId}`, {
        mediaItems: updatedMediaItems
      })

      alert('✅ Image deleted')
      fetchPhases()
    } catch (error) {
      console.error('Error deleting media:', error)
      alert('❌ Error deleting image')
    }
  }

  return (
    <>
      {/* Modal principal de fases */}
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              🏗️ Construction Phases - Lot {property?.lot?.number}
            </Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Stepper activeStep={phases.findIndex(p => p.constructionPercentage < 100)} orientation="vertical">
              {phases.map((phase) => {
                const isCompleted = phase.constructionPercentage === 100
                
                return (
                  <Step key={phase.phaseNumber} expanded={true}>
                    <StepLabel
                      StepIconComponent={() => (
                        isCompleted ? (
                          <CheckCircle color="success" sx={{ fontSize: 28 }} />
                        ) : phase.constructionPercentage > 0 ? (
                          <LockOpen color="primary" sx={{ fontSize: 28 }} />
                        ) : (
                          <Lock color="disabled" sx={{ fontSize: 28 }} />
                        )
                      )}
                    >
                      <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Phase {phase.phaseNumber}: {phase.title}
                          </Typography>
                          <Chip 
                            label={`${phase.constructionPercentage}% Complete`}
                            color={phase.constructionPercentage === 100 ? 'success' : 'primary'}
                            size="small"
                          />
                        </Box>
                        {isAdmin && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CloudUpload />}
                            onClick={() => handleOpenUploadDialog(phase)}
                          >
                            Upload Images
                          </Button>
                        )}
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ mb: 2 }}>
                        {/* Progress Bar */}
                        <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={phase.constructionPercentage}
                            sx={{ 
                              height: 8, 
                              borderRadius: 1,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: phase.constructionPercentage === 100 ? 'success.main' : 'primary.main'
                              }
                            }}
                          />
                        </Paper>

                        {/* Images Grid */}
                        {phase.mediaItems && phase.mediaItems.length > 0 ? (
                          <ImageList cols={3} gap={12}>
                            {phase.mediaItems.map((media, index) => (
                              <ImageListItem key={media._id || index}>
                                <img
                                  src={media.url}
                                  alt={media.title}
                                  loading="lazy"
                                  style={{ height: 200, objectFit: 'cover', borderRadius: 8 }}
                                />
                                <ImageListItemBar
                                  title={media.title}
                                  subtitle={media.percentage ? `+${media.percentage}%` : null}
                                  actionIcon={
                                    isAdmin && (
                                      <IconButton
                                        sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                                        onClick={() => handleDeleteMedia(phase._id, media._id)}
                                      >
                                        <Delete />
                                      </IconButton>
                                    )
                                  }
                                  sx={{
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                                    borderRadius: '0 0 8px 8px'
                                  }}
                                />
                              </ImageListItem>
                            ))}
                          </ImageList>
                        ) : (
                          <Alert severity="info">No images uploaded yet</Alert>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                )
              })}
            </Stepper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para subir imágenes */}
      <Dialog 
        open={!!selectedPhase} 
        onClose={() => setSelectedPhase(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Images - Phase {selectedPhase?.phaseNumber}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Image Title/Description"
              value={uploadForm.title}
              onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Construction Progress Added (%)"
              value={uploadForm.percentage}
              onChange={(e) => setUploadForm(prev => ({ ...prev, percentage: e.target.value }))}
              inputProps={{ min: 0, max: 100 }}
              sx={{ mb: 2 }}
              helperText="How much progress does this update represent?"
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUpload />}
              sx={{ mb: 2 }}
            >
              Select Images
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleFileSelect}
              />
            </Button>
            {uploadForm.images.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Selected files: {uploadForm.images.length}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                  {uploadForm.images.map((file, index) => (
                    <Paper key={index} sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" noWrap>
                        {file.name}
                      </Typography>
                      <IconButton size="small" onClick={() => handleRemoveImage(index)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPhase(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUploadImages}
            disabled={uploading || !uploadForm.images.length}
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ConstructionPhasesModal