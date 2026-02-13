// import { useState, useEffect } from 'react'
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Box,
//   Typography,
//   IconButton,
//   Stepper,
//   Step,
//   StepLabel,
//   StepContent,
//   CircularProgress,
//   Paper,
//   Chip
// } from '@mui/material'
// import {
//   Close,
//   Description,
//   AttachFile,
//   Delete,
//   CheckCircle,
//   CloudUpload,
//   Download,
//   Cancel
// } from '@mui/icons-material'
// import api from '../services/api'
// import uploadService from '../services/uploadService'

// const DOCUMENT_TYPES = [
//   { key: 'promissoryNote', label: 'Promissory note', icon: '📄' },
//   { key: 'purchaseContract', label: 'Purchase contract', icon: '📝' },
//   { key: 'agreement', label: 'Agreement', icon: '📋' }
// ]

// const ContractsModal = ({ open, onClose, property, onContractUpdated }) => {
//   const [documents, setDocuments] = useState({})
//   const [activeStep, setActiveStep] = useState(0)
//   const [loading, setLoading] = useState(false)
//   const [uploading, setUploading] = useState(false)

//   useEffect(() => {
//     if (open && property) {
//       fetchContracts()
//     }
//   }, [open, property])

//   const fetchContracts = async () => {
//     try {
//       setLoading(true)
//       const response = await api.get(`/contracts/property/${property._id}`)
      
//       // Organizar por tipo de documento
//       const organizedDocs = {}
//       response.data.forEach(contract => {
//         organizedDocs[contract.type] = contract
//       })
      
//       setDocuments(organizedDocs)
//     } catch (error) {
//       console.error('Error fetching contracts:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleFileChange = async (docType, file) => {
//     if (!file) return

//     try {
//       setUploading(true)

//       // Upload file to GCS
//       const [fileUrl] = await uploadService.uploadContractFiles([file])

//       // Create/Update contract
//       const contractData = {
//         property: property._id,
//         type: docType.key,
//         title: docType.label,
//         fileUrl,
//         status: 'pending'
//       }

//       if (documents[docType.key]?._id) {
//         // Update existing
//         await api.put(`/contracts/${documents[docType.key]._id}`, contractData)
//       } else {
//         // Create new
//         await api.post('/contracts', contractData)
//       }

//       alert('✅ Contract uploaded successfully!')
//       fetchContracts()
//       if (onContractUpdated) onContractUpdated()
//     } catch (error) {
//       console.error('Error uploading contract:', error)
//       alert(`❌ Error: ${error.response?.data?.message || error.message}`)
//     } finally {
//       setUploading(false)
//     }
//   }

//   const handleRemoveFile = async (docType) => {
//     if (!window.confirm('Are you sure you want to delete this contract?')) return

//     try {
//       await api.delete(`/contracts/${documents[docType.key]._id}`)
//       alert('✅ Contract deleted')
//       fetchContracts()
//       if (onContractUpdated) onContractUpdated()
//     } catch (error) {
//       console.error('Error deleting contract:', error)
//       alert('❌ Error deleting contract')
//     }
//   }

//   const handleDownload = (docType) => {
//     const contract = documents[docType.key]
//     if (contract?.fileUrl) {
//       window.open(contract.fileUrl, '_blank')
//     }
//   }

//   const getCompletedCount = () => {
//     return DOCUMENT_TYPES.filter(doc => documents[doc.key]).length
//   }

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="md"
//       fullWidth
//       PaperProps={{
//         sx: {
//           borderRadius: 4,
//           boxShadow: '0 20px 60px rgba(51, 63, 31, 0.15)'
//         }
//       }}
//     >
//       {/* ✅ DIALOG TITLE - Mismo estilo que Payloads */}
//       <DialogTitle>
//         <Box display="flex" justifyContent="space-between" alignItems="center">
//           <Box display="flex" alignItems="center" gap={2}>
//             <Box
//               sx={{
//                 width: 48,
//                 height: 48,
//                 borderRadius: 3,
//                 bgcolor: '#333F1F',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)',
//               }}
//             >
//               <Description sx={{ color: 'white', fontSize: 24 }} />
//             </Box>
//             <Box>
//               <Typography
//                 variant="h6"
//                 fontWeight={700}
//                 sx={{
//                   color: '#333F1F',
//                   fontFamily: '"Poppins", sans-serif'
//                 }}
//               >
//                 Contract Management
//               </Typography>
//               <Typography
//                 variant="caption"
//                 sx={{
//                   color: '#706f6f',
//                   fontFamily: '"Poppins", sans-serif'
//                 }}
//               >
//                 Upload and manage property contracts - Lot {property?.lot?.number}
//               </Typography>
//             </Box>
//           </Box>
//           <IconButton
//             onClick={onClose}
//             sx={{
//               color: '#706f6f',
//               '&:hover': {
//                 bgcolor: 'rgba(112, 111, 111, 0.08)',
//                 transform: 'scale(1.05)'
//               }
//             }}
//           >
//             <Close />
//           </IconButton>
//         </Box>
//       </DialogTitle>

//       <DialogContent sx={{ pt: 3 }}>
//         {loading ? (
//           <Box display="flex" justifyContent="center" p={4}>
//             <CircularProgress sx={{ color: '#8CA551' }} />
//           </Box>
//         ) : (
//           <>
//             {/* ✅ PROGRESS INDICATOR */}
//             <Paper
//               elevation={0}
//               sx={{
//                 p: 2.5,
//                 mb: 3,
//                 bgcolor: '#fafafa',
//                 borderRadius: 3,
//                 border: '1px solid #e0e0e0',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'space-between'
//               }}
//             >
//               <Box>
//                 <Typography
//                   variant="body2"
//                   fontWeight={600}
//                   sx={{
//                     color: '#333F1F',
//                     fontFamily: '"Poppins", sans-serif',
//                     mb: 0.5
//                   }}
//                 >
//                   Contract Upload Progress
//                 </Typography>
//                 <Typography
//                   variant="caption"
//                   sx={{
//                     color: '#706f6f',
//                     fontFamily: '"Poppins", sans-serif'
//                   }}
//                 >
//                   {getCompletedCount()} of {DOCUMENT_TYPES.length} contracts uploaded
//                 </Typography>
//               </Box>
//               <Chip
//                 label={`${Math.round((getCompletedCount() / DOCUMENT_TYPES.length) * 100)}%`}
//                 sx={{
//                   bgcolor: getCompletedCount() === DOCUMENT_TYPES.length
//                     ? 'rgba(140, 165, 81, 0.12)'
//                     : 'rgba(229, 134, 60, 0.12)',
//                   color: '#333F1F',
//                   border: `1px solid ${getCompletedCount() === DOCUMENT_TYPES.length ? '#8CA551' : '#E5863C'}`,
//                   fontWeight: 700,
//                   fontSize: '1rem',
//                   fontFamily: '"Poppins", sans-serif',
//                   px: 2
//                 }}
//               />
//             </Paper>

//             {/* ✅ STEPPER TIMELINE - Brandbook Style */}
//             <Stepper 
//               activeStep={activeStep} 
//               orientation="vertical"
//               sx={{
//                 '& .MuiStepLabel-root': {
//                   cursor: 'pointer'
//                 },
//                 '& .MuiStepConnector-line': {
//                   borderColor: 'rgba(140, 165, 81, 0.3)',
//                   borderWidth: '2px',
//                   minHeight: 24
//                 },
//                 '& .MuiStepLabel-label': {
//                   fontFamily: '"Poppins", sans-serif',
//                   fontWeight: 600,
//                   color: '#706f6f',
//                   '&.Mui-active': {
//                     color: '#333F1F',
//                     fontWeight: 700
//                   },
//                   '&.Mui-completed': {
//                     color: '#8CA551',
//                     fontWeight: 600
//                   }
//                 }
//               }}
//             >
//               {DOCUMENT_TYPES.map((docType, idx) => {
//                 const contract = documents[docType.key]
//                 const isCompleted = !!contract

//                 return (
//                   <Step key={docType.key} completed={isCompleted}>
//                     <StepLabel
//                       StepIconComponent={() => (
//                         <Box
//                           sx={{
//                             width: 40,
//                             height: 40,
//                             borderRadius: 2,
//                             bgcolor: isCompleted ? '#8CA551' : '#e0e0e0',
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             boxShadow: isCompleted ? '0 4px 12px rgba(140, 165, 81, 0.25)' : 'none',
//                             transition: 'all 0.3s ease'
//                           }}
//                         >
//                           {isCompleted ? (
//                             <CheckCircle sx={{ fontSize: 24, color: 'white' }} />
//                           ) : (
//                             <Typography fontSize="1.2rem">{docType.icon}</Typography>
//                           )}
//                         </Box>
//                       )}
//                       onClick={() => setActiveStep(idx)}
//                     >
//                       <Box display="flex" alignItems="center" gap={1.5}>
//                         <Typography
//                           variant="body1"
//                           fontWeight={activeStep === idx ? 700 : 600}
//                           sx={{
//                             color: isCompleted ? '#8CA551' : (activeStep === idx ? '#333F1F' : '#706f6f'),
//                             fontFamily: '"Poppins", sans-serif'
//                           }}
//                         >
//                           {docType.label}
//                         </Typography>
//                         {isCompleted && (
//                           <Chip
//                             label="Uploaded"
//                             size="small"
//                             sx={{
//                               bgcolor: 'rgba(140, 165, 81, 0.12)',
//                               color: '#8CA551',
//                               border: '1px solid #8CA551',
//                               fontWeight: 600,
//                               fontFamily: '"Poppins", sans-serif',
//                               height: 22
//                             }}
//                           />
//                         )}
//                       </Box>
//                     </StepLabel>

//                     <StepContent>
//                       <Paper
//                         elevation={0}
//                         sx={{
//                           p: 2.5,
//                           mt: 1.5,
//                           mb: 2,
//                           bgcolor: '#fafafa',
//                           border: '1px solid #e0e0e0',
//                           borderRadius: 2
//                         }}
//                       >
//                         {contract ? (
//                           // ✅ DOCUMENTO YA SUBIDO
//                           <Box>
//                             <Typography
//                               variant="body2"
//                               sx={{
//                                 color: '#333F1F',
//                                 fontFamily: '"Poppins", sans-serif',
//                                 fontWeight: 600,
//                                 mb: 1.5
//                               }}
//                             >
//                               {contract.title}
//                             </Typography>
//                             <Box display="flex" gap={1}>
//                               <Button
//                                 variant="outlined"
//                                 size="small"
//                                 startIcon={<Download />}
//                                 onClick={() => handleDownload(docType)}
//                                 sx={{
//                                   borderRadius: 2,
//                                   textTransform: 'none',
//                                   fontWeight: 600,
//                                   fontFamily: '"Poppins", sans-serif',
//                                   borderColor: 'rgba(140, 165, 81, 0.3)',
//                                   borderWidth: '2px',
//                                   color: '#333F1F',
//                                   '&:hover': {
//                                     borderColor: '#8CA551',
//                                     borderWidth: '2px',
//                                     bgcolor: 'rgba(140, 165, 81, 0.08)'
//                                   }
//                                 }}
//                               >
//                                 Download
//                               </Button>
//                               <Button
//                                 variant="outlined"
//                                 size="small"
//                                 startIcon={<Delete />}
//                                 onClick={() => handleRemoveFile(docType)}
//                                 sx={{
//                                   borderRadius: 2,
//                                   textTransform: 'none',
//                                   fontWeight: 600,
//                                   fontFamily: '"Poppins", sans-serif',
//                                   borderColor: 'rgba(229, 134, 60, 0.3)',
//                                   borderWidth: '2px',
//                                   color: '#E5863C',
//                                   '&:hover': {
//                                     borderColor: '#E5863C',
//                                     borderWidth: '2px',
//                                     bgcolor: 'rgba(229, 134, 60, 0.08)'
//                                   }
//                                 }}
//                               >
//                                 Remove
//                               </Button>
//                             </Box>
//                           </Box>
//                         ) : (
//                           // ✅ FORMULARIO PARA SUBIR
//                           <Box>
//                             <Typography
//                               variant="body2"
//                               sx={{
//                                 color: '#706f6f',
//                                 fontFamily: '"Poppins", sans-serif',
//                                 mb: 2
//                               }}
//                             >
//                               Upload the {docType.label} document for this property
//                             </Typography>
//                             <Button
//                               component="label"
//                               variant="contained"
//                               fullWidth
//                               startIcon={uploading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <CloudUpload />}
//                               disabled={uploading}
//                               sx={{
//                                 borderRadius: 3,
//                                 bgcolor: '#333F1F',
//                                 color: 'white',
//                                 fontWeight: 600,
//                                 textTransform: 'none',
//                                 letterSpacing: '1px',
//                                 fontFamily: '"Poppins", sans-serif',
//                                 py: 1.5,
//                                 boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
//                                 position: 'relative',
//                                 overflow: 'hidden',
//                                 '&::before': {
//                                   content: '""',
//                                   position: 'absolute',
//                                   top: 0,
//                                   left: '-100%',
//                                   width: '100%',
//                                   height: '100%',
//                                   bgcolor: '#8CA551',
//                                   transition: 'left 0.4s ease',
//                                   zIndex: 0,
//                                 },
//                                 '&:hover': {
//                                   bgcolor: '#333F1F',
//                                   boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
//                                   '&::before': {
//                                     left: 0,
//                                   },
//                                 },
//                                 '&:disabled': {
//                                   bgcolor: '#e0e0e0',
//                                   color: '#706f6f',
//                                   boxShadow: 'none'
//                                 },
//                                 '& .MuiButton-startIcon': {
//                                   position: 'relative',
//                                   zIndex: 1,
//                                 }
//                               }}
//                             >
//                               <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
//                                 {uploading ? 'Uploading...' : 'Select & Upload File'}
//                               </Box>
//                               <input
//                                 type="file"
//                                 hidden
//                                 accept=".pdf,.doc,.docx"
//                                 onChange={(e) => {
//                                   if (e.target.files[0]) {
//                                     handleFileChange(docType, e.target.files[0])
//                                   }
//                                   e.target.value = ''
//                                 }}
//                               />
//                             </Button>
//                           </Box>
//                         )}
//                       </Paper>
//                     </StepContent>
//                   </Step>
//                 )
//               })}
//             </Stepper>
//           </>
//         )}
//       </DialogContent>

//       {/* ✅ DIALOG ACTIONS - Mismo estilo que Payloads */}
//       <DialogActions sx={{ p: 3, gap: 2 }}>
//         <Button
//           onClick={onClose}
//           sx={{
//             borderRadius: 3,
//             textTransform: 'none',
//             fontWeight: 600,
//             px: 3,
//             py: 1.2,
//             color: '#706f6f',
//             fontFamily: '"Poppins", sans-serif',
//             border: '2px solid #e0e0e0',
//             '&:hover': {
//               bgcolor: 'rgba(112, 111, 111, 0.05)',
//               borderColor: '#706f6f'
//             }
//           }}
//         >
//           Close
//         </Button>
//       </DialogActions>
//     </Dialog>
//   )
// }

// export default ContractsModal


import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Paper,
  Chip,
  Alert
} from '@mui/material'
import {
  Close,
  Description,
  Delete,
  CheckCircle,
  CloudUpload,
  Send,
  AttachFile
} from '@mui/icons-material'
import contractsService from '../services/contractsService'
import uploadService from '../services/uploadService'

const DOCUMENT_TYPES = [
  { key: 'promissoryNote', label: 'Promissory note', icon: '📄' },
  { key: 'purchaseContract', label: 'Purchase contract', icon: '📝' },
  { key: 'agreement', label: 'Agreement', icon: '📋' }
]

const ContractsModal = ({ open, onClose, property, onContractUpdated }) => {
  const [existingContracts, setExistingContracts] = useState({})
  const [pendingFiles, setPendingFiles] = useState({})
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open && property) {
      fetchContracts()
      setPendingFiles({})
      setError(null)
    }
  }, [open, property])

  // ✅ FETCH EXISTING CONTRACTS
  const fetchContracts = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📥 Fetching existing contracts for property:', property._id)
      
      const response = await contractsService.getContractsByProperty(property._id)
      
      // Organizar por tipo de documento
      const organizedDocs = {}
      if (response?.contracts && Array.isArray(response.contracts)) {
        response.contracts.forEach(contract => {
          organizedDocs[contract.type] = contract
        })
      }
      
      setExistingContracts(organizedDocs)
      console.log('✅ Existing contracts loaded:', organizedDocs)
    } catch (error) {
      console.error('❌ Error fetching contracts:', error)
      // No mostrar error si simplemente no hay contratos
      if (error.response?.status !== 404) {
        setError('Failed to load existing contracts')
      }
    } finally {
      setLoading(false)
    }
  }

  // ✅ SELECCIONAR ARCHIVO
  const handleFileSelect = (docType, file) => {
    if (!file) return

    // Validar tipo de archivo
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(file.type)) {
      alert('⚠️ Please select a valid file (PDF, DOC, or DOCX)')
      return
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('⚠️ File size must be less than 10MB')
      return
    }

    console.log('📎 File selected:', {
      type: docType.key,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      fileType: file.type
    })

    setPendingFiles(prev => ({
      ...prev,
      [docType.key]: file
    }))
  }

  // ✅ REMOVER ARCHIVO PENDIENTE
  const handleRemovePendingFile = (docType) => {
    setPendingFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[docType.key]
      return newFiles
    })
    console.log('🗑️ Removed pending file:', docType.key)
  }

  // ✅ SUBMIT ALL CONTRACTS (batch upload)
  const handleSubmitContracts = async () => {
    if (Object.keys(pendingFiles).length === 0) {
      alert('⚠️ No files selected to upload')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      console.log('📤 Starting batch upload...')
      console.log('Files to upload:', Object.keys(pendingFiles))

      // 1️⃣ Subir archivos a GCS
      const filesToUpload = Object.values(pendingFiles)
      console.log('📤 Uploading files to GCS...')
      const fileUrls = await uploadService.uploadContractFiles(filesToUpload)
      console.log('✅ Files uploaded to GCS:', fileUrls)

      // 2️⃣ Crear array de contratos con las URLs
      const contractsToUpload = Object.entries(pendingFiles).map(([type, file], index) => ({
        type,
        fileUrl: fileUrls[index],
        uploadedAt: new Date().toISOString()
      }))

      console.log('📦 Contracts to upload:', contractsToUpload)

      // 3️⃣ Verificar si ya existen contratos para esta propiedad
      let response
      const hasExistingContracts = Object.keys(existingContracts).length > 0

      if (hasExistingContracts) {
        // PUT: Actualizar/añadir tipos de contratos (merge)
        console.log('🔄 Updating existing contracts (merge by type)...')
        response = await contractsService.updateContractsByProperty(
          property._id,
          contractsToUpload
        )
        console.log('✅ Contracts updated:', response)
      } else {
        // POST: Crear nuevo documento de contratos
        console.log('➕ Creating new contracts document...')
        response = await contractsService.createContracts(
          property._id,
          contractsToUpload
        )
        console.log('✅ Contracts created:', response)
      }

      // 4️⃣ Limpiar y recargar
      setPendingFiles({})
      await fetchContracts()

      alert(`✅ ${contractsToUpload.length} contract(s) uploaded successfully!`)

      if (onContractUpdated) onContractUpdated()
    } catch (error) {
      console.error('❌ Upload error:', error)
      setError(error.response?.data?.message || 'Failed to upload contracts')
      alert(`❌ Error: ${error.response?.data?.message || error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const getPendingCount = () => Object.keys(pendingFiles).length
  const getExistingCount = () => Object.keys(existingContracts).length
  const getTotalProgress = () => {
    const total = DOCUMENT_TYPES.length
    const completed = getExistingCount()
    return Math.round((completed / total) * 100)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(51, 63, 31, 0.15)'
        }
      }}
    >
      {/* ✅ DIALOG TITLE */}
      <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: '#333F1F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)',
              }}
            >
              <Description sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                Contract Management
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#706f6f',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                Upload and manage property contracts - Lot {property?.lot?.number || 'N/A'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            disabled={submitting}
            sx={{
              color: '#706f6f',
              '&:hover': {
                bgcolor: 'rgba(112, 111, 111, 0.08)',
                transform: 'scale(1.05)'
              },
              '&:disabled': {
                opacity: 0.5
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress sx={{ color: '#8CA551' }} />
          </Box>
        ) : (
          <>
            {/* ✅ ERROR ALERT */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  fontFamily: '"Poppins", sans-serif'
                }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            {/* ✅ PROGRESS INDICATOR */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 3,
                bgcolor: '#fafafa',
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif',
                    mb: 0.5
                  }}
                >
                  Upload Progress
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {getExistingCount()} uploaded • {getPendingCount()} pending
                </Typography>
              </Box>
              <Chip
                label={`${getTotalProgress()}%`}
                sx={{
                  bgcolor: getTotalProgress() === 100
                    ? 'rgba(140, 165, 81, 0.12)'
                    : 'rgba(229, 134, 60, 0.12)',
                  color: '#333F1F',
                  border: `1px solid ${getTotalProgress() === 100 ? '#8CA551' : '#E5863C'}`,
                  fontWeight: 700,
                  fontSize: '1rem',
                  fontFamily: '"Poppins", sans-serif',
                  px: 2
                }}
              />
            </Paper>

            {/* ✅ PENDING FILES ALERT */}
            {getPendingCount() > 0 && (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  fontFamily: '"Poppins", sans-serif',
                  bgcolor: 'rgba(140, 165, 81, 0.08)',
                  border: '1px solid rgba(140, 165, 81, 0.3)',
                  '& .MuiAlert-icon': {
                    color: '#8CA551'
                  }
                }}
              >
                <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {getPendingCount()} file(s) ready to upload
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  Click "Submit All Contracts" to complete the upload
                </Typography>
              </Alert>
            )}

            {/* ✅ STEPPER TIMELINE */}
            <Stepper 
              activeStep={activeStep} 
              orientation="vertical"
              sx={{
                '& .MuiStepLabel-root': {
                  cursor: 'pointer'
                },
                '& .MuiStepConnector-line': {
                  borderColor: 'rgba(140, 165, 81, 0.3)',
                  borderWidth: '2px',
                  minHeight: 24
                },
                '& .MuiStepLabel-label': {
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600,
                  color: '#706f6f',
                  '&.Mui-active': {
                    color: '#333F1F',
                    fontWeight: 700
                  },
                  '&.Mui-completed': {
                    color: '#8CA551',
                    fontWeight: 600
                  }
                }
              }}
            >
              {DOCUMENT_TYPES.map((docType, idx) => {
                const existingContract = existingContracts[docType.key]
                const pendingFile = pendingFiles[docType.key]
                const isCompleted = !!existingContract

                return (
                  <Step key={docType.key} completed={isCompleted}>
                    <StepLabel
                      StepIconComponent={() => (
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: isCompleted ? '#8CA551' : (pendingFile ? '#E5863C' : '#e0e0e0'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: (isCompleted || pendingFile) ? '0 4px 12px rgba(140, 165, 81, 0.25)' : 'none',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {isCompleted ? (
                            <CheckCircle sx={{ fontSize: 24, color: 'white' }} />
                          ) : pendingFile ? (
                            <AttachFile sx={{ fontSize: 20, color: 'white' }} />
                          ) : (
                            <Typography fontSize="1.2rem">{docType.icon}</Typography>
                          )}
                        </Box>
                      )}
                      onClick={() => setActiveStep(idx)}
                    >
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Typography
                          variant="body1"
                          fontWeight={activeStep === idx ? 700 : 600}
                          sx={{
                            color: isCompleted ? '#8CA551' : (pendingFile ? '#E5863C' : (activeStep === idx ? '#333F1F' : '#706f6f')),
                            fontFamily: '"Poppins", sans-serif'
                          }}
                        >
                          {docType.label}
                        </Typography>
                        {isCompleted && (
                          <Chip
                            label="Uploaded"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(140, 165, 81, 0.12)',
                              color: '#8CA551',
                              border: '1px solid #8CA551',
                              fontWeight: 600,
                              fontFamily: '"Poppins", sans-serif',
                              height: 22
                            }}
                          />
                        )}
                        {!isCompleted && pendingFile && (
                          <Chip
                            label="Pending"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(229, 134, 60, 0.12)',
                              color: '#E5863C',
                              border: '1px solid #E5863C',
                              fontWeight: 600,
                              fontFamily: '"Poppins", sans-serif',
                              height: 22
                            }}
                          />
                        )}
                      </Box>
                    </StepLabel>

                    <StepContent>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          mt: 1.5,
                          mb: 2,
                          bgcolor: '#fafafa',
                          border: '1px solid #e0e0e0',
                          borderRadius: 2
                        }}
                      >
                        {existingContract ? (
                          // ✅ YA ESTÁ SUBIDO
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#8CA551',
                                fontFamily: '"Poppins", sans-serif',
                                fontWeight: 600,
                                mb: 0.5
                              }}
                            >
                              ✅ {docType.label} uploaded
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#706f6f',
                                fontFamily: '"Poppins", sans-serif',
                                display: 'block'
                              }}
                            >
                              Uploaded on {new Date(existingContract.uploadedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </Typography>
                          </Box>
                        ) : pendingFile ? (
                          // ✅ ARCHIVO SELECCIONADO (pendiente de submit)
                          <Box>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                p: 2,
                                bgcolor: 'rgba(229, 134, 60, 0.08)',
                                borderRadius: 2,
                                border: '1px solid rgba(229, 134, 60, 0.2)',
                                mb: 2
                              }}
                            >
                              <AttachFile sx={{ color: '#E5863C', fontSize: 20 }} />
                              <Box flex={1}>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  sx={{
                                    color: '#333F1F',
                                    fontFamily: '"Poppins", sans-serif',
                                    mb: 0.3
                                  }}
                                >
                                  {pendingFile.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#706f6f',
                                    fontFamily: '"Poppins", sans-serif'
                                  }}
                                >
                                  {(pendingFile.size / (1024 * 1024)).toFixed(2)} MB
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => handleRemovePendingFile(docType)}
                                sx={{
                                  color: '#E5863C',
                                  '&:hover': {
                                    bgcolor: 'rgba(229, 134, 60, 0.12)'
                                  }
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#706f6f',
                                fontFamily: '"Poppins", sans-serif',
                                fontStyle: 'italic'
                              }}
                            >
                              File ready. Click "Submit All Contracts" to upload.
                            </Typography>
                          </Box>
                        ) : (
                          // ✅ SELECCIONAR ARCHIVO
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#706f6f',
                                fontFamily: '"Poppins", sans-serif',
                                mb: 2
                              }}
                            >
                              Select the {docType.label} document for this property
                            </Typography>
                            <Button
                              component="label"
                              variant="outlined"
                              fullWidth
                              startIcon={<CloudUpload />}
                              disabled={submitting}
                              sx={{
                                borderRadius: 3,
                                borderColor: 'rgba(140, 165, 81, 0.3)',
                                borderWidth: '2px',
                                color: '#333F1F',
                                fontWeight: 600,
                                textTransform: 'none',
                                fontFamily: '"Poppins", sans-serif',
                                py: 1.5,
                                '&:hover': {
                                  borderColor: '#8CA551',
                                  borderWidth: '2px',
                                  bgcolor: 'rgba(140, 165, 81, 0.08)'
                                },
                                '&:disabled': {
                                  opacity: 0.5
                                }
                              }}
                            >
                              Select File
                              <input
                                type="file"
                                hidden
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                  if (e.target.files[0]) {
                                    handleFileSelect(docType, e.target.files[0])
                                  }
                                  e.target.value = ''
                                }}
                              />
                            </Button>
                          </Box>
                        )}
                      </Paper>
                    </StepContent>
                  </Step>
                )
              })}
            </Stepper>
          </>
        )}
      </DialogContent>

      {/* ✅ DIALOG ACTIONS */}
      <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0', gap: 2 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.2,
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif',
            border: '2px solid #e0e0e0',
            '&:hover': {
              bgcolor: 'rgba(112, 111, 111, 0.05)',
              borderColor: '#706f6f'
            },
            '&:disabled': {
              opacity: 0.5
            }
          }}
        >
          Close
        </Button>

        <Button
          onClick={handleSubmitContracts}
          disabled={getPendingCount() === 0 || submitting}
          variant="contained"
          startIcon={submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Send />}
          sx={{
            borderRadius: 3,
            bgcolor: '#333F1F',
            color: 'white',
            fontWeight: 600,
            textTransform: 'none',
            fontFamily: '"Poppins", sans-serif',
            px: 3,
            py: 1.2,
            boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
            '&:hover': {
              bgcolor: '#8CA551',
              boxShadow: '0 6px 16px rgba(140, 165, 81, 0.35)'
            },
            '&:disabled': {
              bgcolor: '#e0e0e0',
              color: '#706f6f',
              boxShadow: 'none'
            }
          }}
        >
          {submitting ? 'Submitting...' : `Submit ${getPendingCount() > 0 ? `${getPendingCount()} ` : ''}Contract${getPendingCount() !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ContractsModal