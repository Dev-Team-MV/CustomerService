// import { useState, useEffect } from 'react'
// import {
//   Container,
//   Grid,
//   Paper,
//   Typography,
//   Box,
//   Tab,
//   Tabs,
//   Alert,
//   CircularProgress,
//   Card,
//   CardContent,
//   Chip,
//   Button,
//   Stepper,
//   Step,
//   StepLabel,
//   StepContent,
//   ImageList,
//   ImageListItem,
//   ImageListItemBar,
//   LinearProgress,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   MenuItem
// } from '@mui/material'
// import {
//   Home,
//   Construction,
//   Payment,
//   Visibility,
//   ArrowBack,
//   CheckCircle,
//   Lock,
//   LockOpen,
//   Upload,
//   CloudUpload,
//   Receipt,
//   Pending,
//   CheckCircleOutline,
//   Cancel
// } from '@mui/icons-material'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import userPropertyService from '../services/userPropertyService'
// import api from '../services/api'

// import uploadService from '../services/uploadService'


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

// const MyProperty = () => {
//   const { user } = useAuth()
//   const navigate = useNavigate()
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [properties, setProperties] = useState([])
//   const [selectedProperty, setSelectedProperty] = useState(null)
//   const [propertyDetails, setPropertyDetails] = useState(null)
//   const [activeTab, setActiveTab] = useState(0)
//   const [financialSummary, setFinancialSummary] = useState(null)
  
//   // Estados para fases de construcción
//   const [phases, setPhases] = useState([])
//   const [loadingPhases, setLoadingPhases] = useState(false)
  
//   // Estados para pagos
//   const [payloads, setPayloads] = useState([])
//   const [loadingPayloads, setLoadingPayloads] = useState(false)
//   const [uploadPaymentDialog, setUploadPaymentDialog] = useState(false)
//   const [paymentForm, setPaymentForm] = useState({
//     amount: '',
//     date: new Date().toISOString().split('T')[0],
//     support: '',
//     notes: ''
//   })
//   const [uploadingPayment, setUploadingPayment] = useState(false)

//   useEffect(() => {
//     fetchData()
//   }, [])

//   useEffect(() => {
//     if (selectedProperty) {
//       fetchPhases()
//       fetchPayloads()
//     }
//   }, [selectedProperty])

//   const fetchData = async () => {
//     try {
//       setLoading(true)
      
//       const props = await userPropertyService.getMyProperties()
//       setProperties(props)

//       const summary = await userPropertyService.getFinancialSummary()
//       setFinancialSummary(summary)

//       if (props.length > 0) {
//         handleSelectProperty(props[0]._id)
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error)
//       setError(error.message || 'Failed to load properties')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSelectProperty = async (propertyId) => {
//     try {
//       setLoading(true)
//       const details = await userPropertyService.getPropertyDetails(propertyId)
//       setPropertyDetails(details)
//       setSelectedProperty(propertyId)
//     } catch (error) {
//       console.error('Error fetching property details:', error)
//       setError(error.message || 'Failed to load property details')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchPhases = async () => {
//     try {
//       setLoadingPhases(true)
//       const response = await api.get(`/phases/property/${selectedProperty}`)
      
//       // Asegurar que existan las 9 fases
//       const existingPhases = response.data
//       const allPhases = []
      
//       for (let i = 1; i <= 9; i++) {
//         const existingPhase = existingPhases.find(p => p.phaseNumber === i)
//         if (existingPhase) {
//           allPhases.push(existingPhase)
//         } else {
//           allPhases.push({
//             phaseNumber: i,
//             title: `Phase ${i}`,
//             constructionPercentage: 0,
//             mediaItems: [],
//             property: selectedProperty
//           })
//         }
//       }
      
//       setPhases(allPhases)
//     } catch (error) {
//       console.error('Error fetching phases:', error)
//     } finally {
//       setLoadingPhases(false)
//     }
//   }

//   const fetchPayloads = async () => {
//     try {
//       setLoadingPayloads(true)
//       const response = await api.get(`/payloads?property=${selectedProperty}`)
//       setPayloads(response.data)
//     } catch (error) {
//       console.error('Error fetching payloads:', error)
//     } finally {
//       setLoadingPayloads(false)
//     }
//   }

//   const handleTabChange = (event, newValue) => {
//     setActiveTab(newValue)
//   }

//   const handleOpenUploadPayment = () => {
//     setUploadPaymentDialog(true)
//   }

//   const handleCloseUploadPayment = () => {
//     setUploadPaymentDialog(false)
//     setPaymentForm({
//       amount: '',
//       date: new Date().toISOString().split('T')[0],
//       support: '',
//       notes: ''
//     })
//   }

//   const handlePaymentFormChange = (field, value) => {
//     setPaymentForm(prev => ({
//       ...prev,
//       [field]: value
//     }))
//   }

// // Actualizar la función handleSubmitPayment
// const handleSubmitPayment = async () => {
//   if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
//     alert('Please enter a valid amount')
//     return
//   }

//   try {
//     setUploadingPayment(true)

//     // ✅ Subir imagen de soporte si existe
//     let supportUrl = paymentForm.support
//     if (paymentForm.supportFile) {
//       console.log('📤 Uploading payment receipt...')
//       supportUrl = await uploadService.uploadPaymentImage(paymentForm.supportFile)
//       console.log('✅ Receipt uploaded:', supportUrl)
//     }

//     // Crear el payload con la URL de la imagen
//     await api.post('/payloads', {
//       property: selectedProperty,
//       amount: parseFloat(paymentForm.amount),
//       date: paymentForm.date,
//       support: supportUrl, // URL retornada por GCS
//       notes: paymentForm.notes,
//       status: 'pending'
//     })

//     alert('✅ Payment uploaded successfully! Awaiting approval.')
//     handleCloseUploadPayment()
//     fetchPayloads()
//     fetchData()
    
//   } catch (error) {
//     console.error('❌ Error submitting payment:', error)
//     alert(`❌ Error: ${error.message}`)
//   } finally {
//     setUploadingPayment(false)
//   }
// }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'cleared': return 'success'
//       case 'pending': return 'warning'
//       case 'rejected': return 'error'
//       default: return 'default'
//     }
//   }

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'cleared': return <CheckCircleOutline />
//       case 'pending': return <Pending />
//       case 'rejected': return <Cancel />
//       default: return <Receipt />
//     }
//   }

//   if (loading && !propertyDetails) {
//     return (
//       <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
//         <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
//           <CircularProgress size={60} />
//         </Box>
//       </Container>
//     )
//   }

//   if (error && properties.length === 0) {
//     return (
//       <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
//         <Alert severity="warning" sx={{ mb: 3 }}>
//           {error}
//         </Alert>
//         <Button
//           variant="contained"
//           startIcon={<ArrowBack />}
//           onClick={() => navigate('/dashboard')}
//         >
//           Go to Dashboard
//         </Button>
//       </Container>
//     )
//   }

//   if (properties.length === 0) {
//     return (
//       <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
//         <Alert severity="info" sx={{ mb: 3 }}>
//           No properties found. Contact administration to get a property assigned.
//         </Alert>
//         <Button
//           variant="contained"
//           startIcon={<ArrowBack />}
//           onClick={() => navigate('/dashboard')}
//         >
//           Go to Dashboard
//         </Button>
//       </Container>
//     )
//   }

//   return (
//     <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
//       {/* Header con resumen financiero */}
//       {financialSummary && (
//         <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
//           <Typography variant="h4" fontWeight="bold" gutterBottom>
//             My Properties Dashboard
//           </Typography>
//           <Grid container spacing={3} sx={{ mt: 2 }}>
//             <Grid item xs={12} md={3}>
//               <Card>
//                 <CardContent>
//                   <Typography variant="caption" color="text.secondary">
//                     Total Investment
//                   </Typography>
//                   <Typography variant="h5" fontWeight="bold" color="primary.main">
//                     ${financialSummary.totalInvestment.toLocaleString()}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//             <Grid item xs={12} md={3}>
//               <Card>
//                 <CardContent>
//                   <Typography variant="caption" color="text.secondary">
//                     Total Paid
//                   </Typography>
//                   <Typography variant="h5" fontWeight="bold" color="success.main">
//                     ${financialSummary.totalPaid.toLocaleString()}
//                   </Typography>
//                   <Typography variant="caption" color="text.secondary">
//                     {Math.round(financialSummary.paymentProgress)}% completed
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//             <Grid item xs={12} md={3}>
//               <Card>
//                 <CardContent>
//                   <Typography variant="caption" color="text.secondary">
//                     Pending
//                   </Typography>
//                   <Typography variant="h5" fontWeight="bold" color="warning.main">
//                     ${financialSummary.totalPending.toLocaleString()}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//             <Grid item xs={12} md={3}>
//               <Card>
//                 <CardContent>
//                   <Typography variant="caption" color="text.secondary">
//                     Properties
//                   </Typography>
//                   <Typography variant="h5" fontWeight="bold">
//                     {financialSummary.properties}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//           </Grid>
//         </Paper>
//       )}

//       {/* Selector de propiedades si tiene múltiples */}
//       {properties.length > 1 && (
//         <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
//           <Typography variant="subtitle1" gutterBottom>
//             Select a property:
//           </Typography>
//           <Box display="flex" gap={2} flexWrap="wrap">
//             {properties.map((prop) => (
//               <Button
//                 key={prop._id}
//                 variant={selectedProperty === prop._id ? 'contained' : 'outlined'}
//                 onClick={() => handleSelectProperty(prop._id)}
//                 startIcon={<Home />}
//               >
//                 Lot {prop.lot?.number} - {prop.model?.model || 'No Model'}
//               </Button>
//             ))}
//           </Box>
//         </Paper>
//       )}

//       {/* Detalles de la propiedad seleccionada */}
//       {propertyDetails && (
//         <>
//           {/* Header de la propiedad */}
//           <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
//             <Grid container spacing={3} alignItems="center">
//               <Grid item xs={12} md={8}>
//                 <Box display="flex" alignItems="center" gap={2}>
//                   <Home sx={{ fontSize: 40, color: 'primary.main' }} />
//                   <Box>
//                     <Typography variant="h5" fontWeight="bold">
//                       {propertyDetails.model?.model || 'Model Not Assigned'}
//                     </Typography>
//                     <Typography variant="body1" color="text.secondary">
//                       Lot #{propertyDetails.property.lot?.number} - Section {propertyDetails.property.lot?.section}
//                     </Typography>
//                     <Box display="flex" gap={1} mt={1}>
//                       {propertyDetails.construction.currentPhase && (
//                         <Chip
//                           label={`Phase ${propertyDetails.construction.currentPhase.phaseNumber}: ${propertyDetails.construction.currentPhase.title}`}
//                           color="primary"
//                           size="small"
//                         />
//                       )}
//                       <Chip
//                         label={`${Math.round(propertyDetails.construction.progress)}% Complete`}
//                         color="success"
//                         size="small"
//                       />
//                     </Box>
//                   </Box>
//                 </Box>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Card sx={{ bgcolor: 'primary.50' }}>
//                   <CardContent>
//                     <Typography variant="caption" color="text.secondary">
//                       Property Value
//                     </Typography>
//                     <Typography variant="h4" color="primary.main" fontWeight="bold">
//                       ${propertyDetails.property.price?.toLocaleString()}
//                     </Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Paper>

//           {/* Tabs de información */}
//           <Paper elevation={2} sx={{ mb: 3 }}>
//             <Tabs
//               value={activeTab}
//               onChange={handleTabChange}
//               variant="fullWidth"
//               sx={{ borderBottom: 1, borderColor: 'divider' }}
//             >
//               <Tab icon={<Construction />} label="Construction" iconPosition="start" />
//               <Tab icon={<Payment />} label="Payments" iconPosition="start" />
//               <Tab icon={<Visibility />} label="Details" iconPosition="start" />
//             </Tabs>
//           </Paper>

//           {/* Contenido de las tabs */}
//           <Box>
//             {/* TAB 1: CONSTRUCTION PHASES */}
//             {activeTab === 0 && (
//               <Paper elevation={2} sx={{ p: 3 }}>
//                 <Typography variant="h6" gutterBottom fontWeight="bold">
//                   🏗️ Construction Progress
//                 </Typography>
                
//                 {loadingPhases ? (
//                   <Box display="flex" justifyContent="center" p={4}>
//                     <CircularProgress />
//                   </Box>
//                 ) : (
//                   <Stepper activeStep={phases.findIndex(p => p.constructionPercentage < 100)} orientation="vertical">
//                     {phases.map((phase) => {
//                       const isCompleted = phase.constructionPercentage === 100
//                       const description = PHASE_DESCRIPTIONS[phase.phaseNumber - 1]

//                       return (
//                         <Step key={phase.phaseNumber} expanded={true}>
//                           <StepLabel
//                             StepIconComponent={() => (
//                               isCompleted ? (
//                                 <CheckCircle color="success" sx={{ fontSize: 28 }} />
//                               ) : phase.constructionPercentage > 0 ? (
//                                 <LockOpen color="primary" sx={{ fontSize: 28 }} />
//                               ) : (
//                                 <Lock color="disabled" sx={{ fontSize: 28 }} />
//                               )
//                             )}
//                           >
//                             <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
//                               <Typography variant="subtitle1" fontWeight="bold">
//                                 {phase.title}
//                               </Typography>
//                               {isCompleted && (
//                                 <Chip label="100% Complete" color="success" size="small" />
//                               )}
//                               {!isCompleted && phase.constructionPercentage > 0 && (
//                                 <Chip 
//                                   label={`${phase.constructionPercentage}% Complete`} 
//                                   color="primary" 
//                                   size="small" 
//                                 />
//                               )}
//                             </Box>
//                             <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
//                               {description}
//                             </Typography>
//                           </StepLabel>

//                           <StepContent>
//                             <Box sx={{ mb: 2 }}>
//                               {/* Progress Bar */}
//                               <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
//                                 <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
//                                   <Typography variant="caption" color="text.secondary">
//                                     Construction Progress:
//                                   </Typography>
//                                   <Chip 
//                                     label={`${phase.constructionPercentage}%`}
//                                     color={phase.constructionPercentage === 100 ? 'success' : 'primary'}
//                                     size="small"
//                                   />
//                                 </Box>
//                                 <LinearProgress 
//                                   variant="determinate" 
//                                   value={phase.constructionPercentage}
//                                   sx={{ 
//                                     height: 8, 
//                                     borderRadius: 1,
//                                     bgcolor: 'grey.200',
//                                     '& .MuiLinearProgress-bar': {
//                                       bgcolor: phase.constructionPercentage === 100 ? 'success.main' : 'primary.main'
//                                     }
//                                   }}
//                                 />
//                                 {phase.mediaItems && phase.mediaItems.length > 0 && (
//                                   <Typography variant="caption" color="text.secondary" display="block" mt={1}>
//                                     📷 {phase.mediaItems.length} image{phase.mediaItems.length !== 1 ? 's' : ''} uploaded
//                                   </Typography>
//                                 )}
//                               </Paper>

//                               {/* Images Display */}
//                               {phase.mediaItems && phase.mediaItems.length > 0 ? (
//                                 <Box>
//                                   <Typography variant="subtitle2" gutterBottom fontWeight="bold">
//                                     📷 Progress Images ({phase.mediaItems.length})
//                                   </Typography>
//                                   <ImageList cols={3} gap={12} sx={{ maxHeight: 400 }}>
//                                     {phase.mediaItems.map((media, index) => (
//                                       <ImageListItem key={media._id || index}>
//                                         <img
//                                           src={media.url}
//                                           alt={media.title}
//                                           loading="lazy"
//                                           style={{ height: 200, objectFit: 'cover', borderRadius: 8 }}
//                                         />
//                                         <ImageListItemBar
//                                           title={media.title}
//                                           subtitle={media.percentage ? `+${media.percentage}%` : null}
//                                           sx={{
//                                             background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
//                                             borderRadius: '0 0 8px 8px'
//                                           }}
//                                         />
//                                       </ImageListItem>
//                                     ))}
//                                   </ImageList>
//                                 </Box>
//                               ) : (
//                                 <Alert severity="info">
//                                   📭 No images uploaded for this phase yet
//                                 </Alert>
//                               )}
//                             </Box>
//                           </StepContent>
//                         </Step>
//                       )
//                     })}
//                   </Stepper>
//                 )}
//               </Paper>
//             )}

//             {/* TAB 2: PAYMENTS */}
//             {activeTab === 1 && (
//               <Paper elevation={2} sx={{ p: 3 }}>
//                 <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//                   <Typography variant="h6" fontWeight="bold">
//                     💳 Payment Status
//                   </Typography>
//                   <Button
//                     variant="contained"
//                     startIcon={<Upload />}
//                     onClick={handleOpenUploadPayment}
//                     sx={{
//                       bgcolor: '#4a7c59',
//                       '&:hover': { bgcolor: '#3d664a' }
//                     }}
//                   >
//                     Upload Payment
//                   </Button>
//                 </Box>

//                 {/* Payment Summary Cards */}
//                 <Grid container spacing={2} sx={{ mb: 3 }}>
//                   <Grid item xs={12} md={4}>
//                     <Card>
//                       <CardContent>
//                         <Typography variant="caption" color="text.secondary">
//                           Total Paid
//                         </Typography>
//                         <Typography variant="h5" fontWeight="bold" color="success.main">
//                           ${propertyDetails.payment.totalPaid.toLocaleString()}
//                         </Typography>
//                       </CardContent>
//                     </Card>
//                   </Grid>
//                   <Grid item xs={12} md={4}>
//                     <Card>
//                       <CardContent>
//                         <Typography variant="caption" color="text.secondary">
//                           Pending
//                         </Typography>
//                         <Typography variant="h5" fontWeight="bold" color="warning.main">
//                           ${propertyDetails.payment.totalPending.toLocaleString()}
//                         </Typography>
//                       </CardContent>
//                     </Card>
//                   </Grid>
//                   <Grid item xs={12} md={4}>
//                     <Card>
//                       <CardContent>
//                         <Typography variant="caption" color="text.secondary">
//                           Progress
//                         </Typography>
//                         <Typography variant="h5" fontWeight="bold" color="primary.main">
//                           {Math.round(propertyDetails.payment.progress)}%
//                         </Typography>
//                       </CardContent>
//                     </Card>
//                   </Grid>
//                 </Grid>

//                 {/* Payment History Table */}
//                 <Typography variant="subtitle1" sx={{ mb: 2 }} fontWeight="bold">
//                   Payment History ({payloads.length} transactions)
//                 </Typography>
                
//                 {loadingPayloads ? (
//                   <Box display="flex" justifyContent="center" p={4}>
//                     <CircularProgress />
//                   </Box>
//                 ) : payloads.length > 0 ? (
//                   <TableContainer>
//                     <Table>
//                       <TableHead>
//                         <TableRow>
//                           <TableCell>Date</TableCell>
//                           <TableCell>Amount</TableCell>
//                           <TableCell>Status</TableCell>
//                           <TableCell>Support</TableCell>
//                           <TableCell>Notes</TableCell>
//                         </TableRow>
//                       </TableHead>
//                       <TableBody>
//                         {payloads.map((payload) => (
//                           <TableRow key={payload._id} hover>
//                             <TableCell>
//                               {new Date(payload.date).toLocaleDateString()}
//                             </TableCell>
//                             <TableCell>
//                               <Typography variant="body2" fontWeight="600">
//                                 ${payload.amount.toLocaleString()}
//                               </Typography>
//                             </TableCell>
//                             <TableCell>
//                               <Chip
//                                 icon={getStatusIcon(payload.status)}
//                                 label={payload.status}
//                                 color={getStatusColor(payload.status)}
//                                 size="small"
//                               />
//                             </TableCell>
//                             <TableCell>
//                               {payload.support ? (
//                                 <Button
//                                   size="small"
//                                   href={payload.support}
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                 >
//                                   View
//                                 </Button>
//                               ) : (
//                                 <Typography variant="caption" color="text.secondary">
//                                   N/A
//                                 </Typography>
//                               )}
//                             </TableCell>
//                             <TableCell>
//                               <Typography variant="caption" color="text.secondary">
//                                 {payload.notes || 'No notes'}
//                               </Typography>
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </TableContainer>
//                 ) : (
//                   <Alert severity="info">No payments registered yet</Alert>
//                 )}
//               </Paper>
//             )}

//             {/* TAB 3: DETAILS */}
//             {activeTab === 2 && (
//               <Paper elevation={2} sx={{ p: 3 }}>
//                 <Typography variant="h6" gutterBottom fontWeight="bold">
//                   🏡 Property Details
//                 </Typography>
//                 {propertyDetails.model && (
//                   <Box>
//                     <Typography variant="subtitle1" gutterBottom>
//                       Model: {propertyDetails.model.model}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" paragraph>
//                       {propertyDetails.model.description}
//                     </Typography>
//                     <Grid container spacing={2}>
//                       <Grid item xs={4}>
//                         <Typography variant="caption" color="text.secondary">
//                           Bedrooms
//                         </Typography>
//                         <Typography variant="h6">{propertyDetails.model.bedrooms}</Typography>
//                       </Grid>
//                       <Grid item xs={4}>
//                         <Typography variant="caption" color="text.secondary">
//                           Bathrooms
//                         </Typography>
//                         <Typography variant="h6">{propertyDetails.model.bathrooms}</Typography>
//                       </Grid>
//                       <Grid item xs={4}>
//                         <Typography variant="caption" color="text.secondary">
//                           Square Feet
//                         </Typography>
//                         <Typography variant="h6">{propertyDetails.model.sqft}</Typography>
//                       </Grid>
//                     </Grid>
//                   </Box>
//                 )}
//               </Paper>
//             )}
//           </Box>
//         </>
//       )}

//       {/* Dialog para subir pagos */}
//       <Dialog open={uploadPaymentDialog} onClose={handleCloseUploadPayment} maxWidth="sm" fullWidth>
//         <DialogTitle>
//           <Box display="flex" alignItems="center" gap={1}>
//             <CloudUpload color="primary" />
//             <Typography variant="h6" fontWeight="bold">
//               Upload Payment
//             </Typography>
//           </Box>
//         </DialogTitle>
//         <DialogContent>
//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="Amount"
//                 type="number"
//                 value={paymentForm.amount}
//                 onChange={(e) => handlePaymentFormChange('amount', e.target.value)}
//                 InputProps={{
//                   startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
//                 }}
//                 required
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="Payment Date"
//                 type="date"
//                 value={paymentForm.date}
//                 onChange={(e) => handlePaymentFormChange('date', e.target.value)}
//                 InputLabelProps={{
//                   shrink: true
//                 }}
//                 required
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Button
//                 variant="outlined"
//                 component="label"
//                 fullWidth
//                 startIcon={<Upload />}
//               >
//                 Upload Receipt/Support Document
//                 <input
//                   type="file"
//                   hidden
//                   accept="image/*,application/pdf"
//                   onChange={(e) => handlePaymentFormChange('supportFile', e.target.files[0])}
//                 />
//               </Button>
//               {paymentForm.supportFile && (
//                 <Typography variant="caption" color="text.secondary" display="block" mt={1}>
//                   Selected: {paymentForm.supportFile.name}
//                 </Typography>
//               )}
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="Notes (optional)"
//                 multiline
//                 rows={3}
//                 value={paymentForm.notes}
//                 onChange={(e) => handlePaymentFormChange('notes', e.target.value)}
//                 placeholder="Add any additional information about this payment"
//               />
//             </Grid>
//           </Grid>
//           <Alert severity="info" sx={{ mt: 2 }}>
//             Your payment will be reviewed and approved by administration.
//           </Alert>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseUploadPayment}>Cancel</Button>
//           <Button
//             variant="contained"
//             onClick={handleSubmitPayment}
//             disabled={uploadingPayment || !paymentForm.amount}
//           >
//             {uploadingPayment ? 'Uploading...' : 'Submit Payment'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Container>
//   )
// }

// export default MyProperty

import { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CardActions,
  Avatar,
  Divider
} from '@mui/material'
import {
  Home,
  Construction,
  Payment,
  Visibility,
  ArrowBack,
  CheckCircle,
  Lock,
  LockOpen,
  Upload,
  CloudUpload,
  Receipt,
  Pending,
  CheckCircleOutline,
  Cancel,
  ChevronRight,
  LocationOn,
  SquareFoot,
  Bed,
  Bathtub,
  TrendingUp,
  AttachMoney,
  Star,
  Layers,
  AccountBalance,
  AutoAwesome,
  Schedule,
  Info,
  Image as ImageIcon,
  Description,
  OpenInNew
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import userPropertyService from '../services/userPropertyService'
import api from '../services/api'
import uploadService from '../services/uploadService'

const PHASE_DESCRIPTIONS = [
  'Clearing and grading the land, setting up utilities and access',
  'Pouring concrete foundation and slab work',
  'Building the structure frame, walls, and roof structure',
  'Installing roof materials and waterproofing systems',
  'Installing plumbing lines, electrical wiring, and HVAC systems',
  'Adding insulation and hanging drywall throughout the home',
  'Installing flooring, painting, cabinets, and interior fixtures',
  'Completing siding, exterior painting, and landscaping',
  'Final walkthrough, quality checks, and project completion'
]

const PHASE_TITLES = [
  'Site Preparation',
  'Foundation',
  'Framing',
  'Roofing',
  'MEP Installation',
  'Drywall & Insulation',
  'Interior Finishes',
  'Exterior Completion',
  'Final Inspection'
]

const MyProperty = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [properties, setProperties] = useState([])
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [propertyDetails, setPropertyDetails] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [financialSummary, setFinancialSummary] = useState(null)
  const [phases, setPhases] = useState([])
  const [loadingPhases, setLoadingPhases] = useState(false)
  const [payloads, setPayloads] = useState([])
  const [loadingPayloads, setLoadingPayloads] = useState(false)
  const [uploadPaymentDialog, setUploadPaymentDialog] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    support: '',
    notes: ''
  })
  const [uploadingPayment, setUploadingPayment] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedProperty) {
      fetchPhases()
      fetchPayloads()
    }
  }, [selectedProperty])

  const fetchData = async () => {
    try {
      setLoading(true)
      const props = await userPropertyService.getMyProperties()
      setProperties(props)
      const summary = await userPropertyService.getFinancialSummary()
      setFinancialSummary(summary)
      if (props.length === 1) {
        handleSelectProperty(props[0]._id)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error.message || 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectProperty = async (propertyId) => {
    try {
      setLoading(true)
      const details = await userPropertyService.getPropertyDetails(propertyId)
      setPropertyDetails(details)
      setSelectedProperty(propertyId)
      setActiveTab(0)
    } catch (error) {
      console.error('Error fetching property details:', error)
      setError(error.message || 'Failed to load property details')
    } finally {
      setLoading(false)
    }
  }

  const handleDeselectProperty = () => {
    setSelectedProperty(null)
    setPropertyDetails(null)
    setActiveTab(0)
  }

  const fetchPhases = async () => {
    try {
      setLoadingPhases(true)
      const response = await api.get(`/phases/property/${selectedProperty}`)
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
            property: selectedProperty
          })
        }
      }
      setPhases(allPhases)
    } catch (error) {
      console.error('Error fetching phases:', error)
    } finally {
      setLoadingPhases(false)
    }
  }

  const fetchPayloads = async () => {
    try {
      setLoadingPayloads(true)
      const response = await api.get(`/payloads?property=${selectedProperty}`)
      setPayloads(response.data)
    } catch (error) {
      console.error('Error fetching payloads:', error)
    } finally {
      setLoadingPayloads(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleOpenUploadPayment = () => {
    setUploadPaymentDialog(true)
  }

  const handleCloseUploadPayment = () => {
    setUploadPaymentDialog(false)
    setPaymentForm({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      support: '',
      notes: ''
    })
  }

  const handlePaymentFormChange = (field, value) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitPayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }
    try {
      setUploadingPayment(true)
      let supportUrl = paymentForm.support
      if (paymentForm.supportFile) {
        supportUrl = await uploadService.uploadPaymentImage(paymentForm.supportFile)
      }
      await api.post('/payloads', {
        property: selectedProperty,
        amount: parseFloat(paymentForm.amount),
        date: paymentForm.date,
        support: supportUrl,
        notes: paymentForm.notes,
        status: 'pending'
      })
      alert('✅ Payment uploaded successfully!')
      handleCloseUploadPayment()
      fetchPayloads()
      fetchData()
    } catch (error) {
      console.error('❌ Error submitting payment:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setUploadingPayment(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'cleared': return 'success'
      case 'pending': return 'warning'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'cleared': return <CheckCircleOutline />
      case 'pending': return <Pending />
      case 'rejected': return <Cancel />
      default: return <Receipt />
    }
  }

  if (loading && properties.length === 0) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box textAlign="center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <CircularProgress size={70} thickness={3} sx={{ color: '#4a7c59' }} />
            </motion.div>
            <Typography variant="h6" sx={{ mt: 3, color: '#4a7c59', fontWeight: 600 }}>
              Loading your properties...
            </Typography>
          </Box>
        </motion.div>
      </Box>
    )
  }

  if (error && properties.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', p: 4 }}>
        <Container maxWidth="md">
          <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>
          <Button variant="contained" startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </Container>
      </Box>
    )
  }

  if (properties.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', p: 4 }}>
        <Container maxWidth="md">
          <Alert severity="info" sx={{ mb: 3 }}>
            No properties found. Contact administration.
          </Alert>
          <Button variant="contained" startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
        py: 4
      }}
    >
      <Container maxWidth="xl">
        {/* ========== HEADER CON ESTADÍSTICAS ========== */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
          {financialSummary && (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: 6,
                border: '1px solid rgba(74, 124, 89, 0.08)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '40%',
                  height: '100%',
                  opacity: 0.03,
                  backgroundImage: 'radial-gradient(circle, #4a7c59 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              />

              <Box display="flex" alignItems="center" gap={3} mb={4} position="relative" zIndex={1}>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Box
                    sx={{
                      width: 90,
                      height: 90,
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 12px 40px rgba(74, 124, 89, 0.3)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -3,
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                        opacity: 0.3,
                        filter: 'blur(10px)'
                      }
                    }}
                  >
                    <Home sx={{ fontSize: 45, color: 'white' }} />
                  </Box>
                </motion.div>
                <Box>
                  <Typography 
                    variant="h3" 
                    fontWeight="800" 
                    sx={{ 
                      color: '#2c3e50',
                      letterSpacing: '-1px',
                      mb: 0.5
                    }}
                  >
                    My Properties
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" sx={{ color: '#6c757d', fontWeight: 400 }}>
                      Welcome back,
                    </Typography>
                    <Chip
                      label={user?.firstName || 'Investor'}
                      sx={{
                        background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        height: 32
                      }}
                      icon={<Star sx={{ color: 'white !important' }} />}
                    />
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={3}>
                {[
                  { 
                    label: 'Total Investment', 
                    value: `$${financialSummary.totalInvestment.toLocaleString()}`, 
                    icon: <AccountBalance />,
                    color: '#4a7c59',
                    bgGradient: 'linear-gradient(135deg, #4a7c59 0%, #5a9269 100%)'
                  },
                  { 
                    label: 'Total Paid', 
                    value: `$${financialSummary.totalPaid.toLocaleString()}`, 
                    icon: <CheckCircle />, 
                    sub: `${Math.round(financialSummary.paymentProgress)}% completed`,
                    color: '#8bc34a',
                    bgGradient: 'linear-gradient(135deg, #8bc34a 0%, #9ccc65 100%)'
                  },
                  { 
                    label: 'Pending Amount', 
                    value: `$${financialSummary.totalPending.toLocaleString()}`, 
                    icon: <Pending />,
                    color: '#ff9800',
                    bgGradient: 'linear-gradient(135deg, #ff9800 0%, #ffa726 100%)'
                  },
                  { 
                    label: 'Properties Owned', 
                    value: financialSummary.properties, 
                    icon: <Home />,
                    color: '#2196f3',
                    bgGradient: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)'
                  }
                ].map((stat, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: index * 0.1, 
                        duration: 0.5,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        y: -8,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <Card
                        sx={{
                          height: '100%',
                          borderRadius: 4,
                          border: '1px solid rgba(0, 0, 0, 0.06)',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            boxShadow: `0 16px 48px ${stat.color}30`,
                            borderColor: stat.color,
                            transform: 'translateY(-4px)'
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: stat.bgGradient
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: '#6c757d',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                fontSize: '0.7rem'
                              }}
                            >
                              {stat.label}
                            </Typography>
                            <motion.div
                              whileHover={{ rotate: 360, scale: 1.1 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Box
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 3,
                                  background: `${stat.color}15`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: stat.color
                                }}
                              >
                                {stat.icon}
                              </Box>
                            </motion.div>
                          </Box>
                          <Typography 
                            variant="h4" 
                            fontWeight="800" 
                            sx={{ 
                              color: stat.color,
                              mb: 0.5,
                              letterSpacing: '-0.5px'
                            }}
                          >
                            {stat.value}
                          </Typography>
                          {stat.sub && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <TrendingUp sx={{ fontSize: 14, color: stat.color }} />
                              <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600 }}>
                                {stat.sub}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </motion.div>

        {/* ========== GRID DE PROPIEDADES / DETALLES ========== */}
        <AnimatePresence mode="wait">
          {!selectedProperty ? (
            <motion.div
              key="property-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
                <Box display="flex" alignItems="center" gap={2}>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <AutoAwesome sx={{ color: '#4a7c59', fontSize: 32 }} />
                  </motion.div>
                  <Typography 
                    variant="h4" 
                    fontWeight="700" 
                    sx={{ color: '#2c3e50' }}
                  >
                    Select Your Property
                  </Typography>
                </Box>
                <Chip
                  label={`${properties.length} ${properties.length === 1 ? 'Property' : 'Properties'}`}
                  sx={{
                    bgcolor: '#4a7c59',
                    color: 'white',
                    fontWeight: 700,
                    px: 2,
                    height: 36
                  }}
                />
              </Box>

              <Grid container spacing={3}>
                {properties.map((property, index) => (
                  <Grid item xs={12} md={6} lg={4} key={property._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: index * 0.15, 
                        duration: 0.6,
                        type: "spring"
                      }}
                      whileHover={{ scale: 1.02 }}
                      onHoverStart={() => setHoveredCard(property._id)}
                      onHoverEnd={() => setHoveredCard(null)}
                    >
                      <Card
                        onClick={() => handleSelectProperty(property._id)}
                        sx={{
                          height: '100%',
                          borderRadius: 5,
                          cursor: 'pointer',
                          border: hoveredCard === property._id 
                            ? '2px solid #4a7c59'
                            : '1px solid rgba(0, 0, 0, 0.06)',
                          boxShadow: hoveredCard === property._id
                            ? '0 24px 60px rgba(74, 124, 89, 0.25)'
                            : '0 8px 24px rgba(0, 0, 0, 0.08)',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          overflow: 'hidden',
                          position: 'relative',
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                        }}
                      >
                        <motion.div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 5,
                            background: 'linear-gradient(90deg, #4a7c59, #8bc34a, #4a7c59)',
                            backgroundSize: '200% 100%'
                          }}
                          animate={hoveredCard === property._id ? {
                            backgroundPosition: ['0% 50%', '100% 50%']
                          } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />

                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="center" gap={2} mb={3}>
                            <motion.div
                              animate={hoveredCard === property._id ? {
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                              } : {}}
                              transition={{ duration: 0.6 }}
                            >
                              <Avatar
                                sx={{
                                  width: 70,
                                  height: 70,
                                  background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                                  boxShadow: '0 8px 24px rgba(74, 124, 89, 0.3)'
                                }}
                              >
                                <Home sx={{ fontSize: 35, color: 'white' }} />
                              </Avatar>
                            </motion.div>
                            <Box flex={1}>
                              <Typography 
                                variant="h6" 
                                fontWeight="bold" 
                                sx={{ 
                                  color: '#2c3e50',
                                  mb: 0.5
                                }}
                              >
                                {property.model?.model || 'Model N/A'}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <LocationOn sx={{ fontSize: 16, color: '#4a7c59' }} />
                                <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 500 }}>
                                  Lot #{property.lot?.number} • Sec {property.lot?.section}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          {property.model && (
                            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                              {[
                                { icon: <Bed />, value: property.model.bedrooms, label: 'Bedrooms' },
                                { icon: <Bathtub />, value: property.model.bathrooms, label: 'Bathrooms' },
                                { icon: <SquareFoot />, value: property.model.sqft, label: 'Sq Ft' }
                              ].map((spec, idx) => (
                                <Grid item xs={4} key={idx}>
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                  >
                                    <Paper
                                      elevation={0}
                                      sx={{
                                        p: 1.5,
                                        textAlign: 'center',
                                        bgcolor: '#f8f9fa',
                                        borderRadius: 2.5,
                                        border: '1px solid rgba(74, 124, 89, 0.1)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          bgcolor: 'rgba(74, 124, 89, 0.05)',
                                          borderColor: '#4a7c59',
                                          transform: 'translateY(-2px)'
                                        }
                                      }}
                                    >
                                      <Box sx={{ color: '#4a7c59', mb: 0.5 }}>
                                        {spec.icon}
                                      </Box>
                                      <Typography variant="h6" fontWeight="700" color="#2c3e50">
                                        {spec.value}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#6c757d' }}>
                                        {spec.label}
                                      </Typography>
                                    </Paper>
                                  </motion.div>
                                </Grid>
                              ))}
                            </Grid>
                          )}

                          <Divider sx={{ my: 2 }} />

                          <Box
                            sx={{
                              p: 2.5,
                              borderRadius: 3,
                              background: 'linear-gradient(135deg, rgba(74, 124, 89, 0.08) 0%, rgba(139, 195, 74, 0.08) 100%)',
                              border: '1px solid rgba(74, 124, 89, 0.15)',
                              textAlign: 'center',
                              mb: 2
                            }}
                          >
                            <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, display: 'block', mb: 0.5 }}>
                              Property Value
                            </Typography>
                            <Typography 
                              variant="h4" 
                              fontWeight="800" 
                              sx={{ 
                                color: '#4a7c59',
                                letterSpacing: '-0.5px'
                              }}
                            >
                              ${property.price?.toLocaleString()}
                            </Typography>
                          </Box>

                          <Box display="flex" justifyContent="center">
                            <Chip
                              label={property.status === 'sold' ? 'Active Property' : 'In Progress'}
                              color={property.status === 'sold' ? 'success' : 'primary'}
                              sx={{ fontWeight: 700, px: 2 }}
                            />
                          </Box>
                        </CardContent>

                        <Divider />

                        <CardActions sx={{ p: 2.5 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            endIcon={
                              <motion.div
                                animate={hoveredCard === property._id ? { x: [0, 5, 0] } : {}}
                                transition={{ duration: 0.6, repeat: Infinity }}
                              >
                                <ChevronRight />
                              </motion.div>
                            }
                            sx={{
                              py: 1.5,
                              borderRadius: 3,
                              background: 'linear-gradient(135deg, #4a7c59 0%, #5a9269 100%)',
                              color: 'white',
                              fontWeight: 700,
                              textTransform: 'none',
                              fontSize: '1rem',
                              boxShadow: '0 8px 20px rgba(74, 124, 89, 0.3)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #3d664a 0%, #4a7c59 100%)',
                                boxShadow: '0 12px 28px rgba(74, 124, 89, 0.4)',
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            View Full Details
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          ) : (
            /* ========== PROPIEDAD SELECCIONADA ========== */
            <motion.div
              key="property-detail"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  startIcon={<ArrowBack />}
                  onClick={handleDeselectProperty}
                  sx={{
                    mb: 3,
                    color: '#4a7c59',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    px: 3,
                    py: 1.2,
                    borderRadius: 3,
                    border: '2px solid #4a7c59',
                    bgcolor: 'white',
                    '&:hover': {
                      bgcolor: '#4a7c59',
                      color: 'white',
                      transform: 'translateX(-8px)',
                      boxShadow: '0 8px 20px rgba(74, 124, 89, 0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Back to Properties
                </Button>
              </motion.div>

              {propertyDetails && (
                <>
                  {/* Property Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        mb: 3,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        borderRadius: 6,
                        border: '1px solid rgba(74, 124, 89, 0.15)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      <motion.div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 5,
                          background: 'linear-gradient(90deg, #4a7c59, #8bc34a, #4a7c59)',
                          backgroundSize: '200% 100%'
                        }}
                        animate={{
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />

                      <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <Box display="flex" alignItems="center" gap={3}>
                            <motion.div
                              animate={{
                                y: [0, -10, 0],
                                scale: [1, 1.05, 1]
                              }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              <Avatar
                                sx={{
                                  width: 100,
                                  height: 100,
                                  background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                                  boxShadow: '0 15px 40px rgba(74, 124, 89, 0.4)',
                                  border: '4px solid white'
                                }}
                              >
                                <Home sx={{ fontSize: 50, color: 'white' }} />
                              </Avatar>
                            </motion.div>
                            <Box>
                              <Typography 
                                variant="h3" 
                                fontWeight="800" 
                                sx={{ 
                                  color: '#2c3e50',
                                  letterSpacing: '-1px',
                                  mb: 1
                                }}
                              >
                                {propertyDetails.model?.model || 'Model N/A'}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <LocationOn sx={{ color: '#4a7c59' }} />
                                <Typography variant="h6" sx={{ color: '#6c757d', fontWeight: 500 }}>
                                  Lot #{propertyDetails.property.lot?.number} • Section {propertyDetails.property.lot?.section}
                                </Typography>
                              </Box>
                              <Box display="flex" gap={1} flexWrap="wrap">
                                {propertyDetails.construction.currentPhase && (
                                  <Chip
                                    label={`Phase ${propertyDetails.construction.currentPhase.phaseNumber}: ${propertyDetails.construction.currentPhase.title}`}
                                    sx={{
                                      bgcolor: '#4a7c59',
                                      color: 'white',
                                      fontWeight: 700
                                    }}
                                    icon={<Layers sx={{ color: 'white !important' }} />}
                                  />
                                )}
                                <Chip
                                  label={`${Math.round(propertyDetails.construction.progress)}% Complete`}
                                  sx={{
                                    bgcolor: '#8bc34a',
                                    color: 'white',
                                    fontWeight: 700
                                  }}
                                  icon={<Construction sx={{ color: 'white !important' }} />}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Card
                              sx={{
                                background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                                color: 'white',
                                borderRadius: 4,
                                boxShadow: '0 12px 40px rgba(74, 124, 89, 0.4)'
                              }}
                            >
                              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>
                                  Property Value
                                </Typography>
                                <Typography 
                                  variant="h2" 
                                  fontWeight="900"
                                  sx={{ letterSpacing: '-1px' }}
                                >
                                  ${propertyDetails.property.price?.toLocaleString()}
                                </Typography>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Grid>
                      </Grid>
                    </Paper>
                  </motion.div>

                  {/* Tabs */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        mb: 3,
                        background: 'white',
                        borderRadius: 5,
                        overflow: 'hidden',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)'
                      }}
                    >
                      <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                          '& .MuiTab-root': {
                            py: 3,
                            fontWeight: 700,
                            fontSize: '1rem',
                            textTransform: 'none',
                            color: '#6c757d',
                            transition: 'all 0.3s ease',
                            '&.Mui-selected': {
                              color: '#4a7c59'
                            },
                            '&:hover': {
                              bgcolor: 'rgba(74, 124, 89, 0.05)'
                            }
                          },
                          '& .MuiTabs-indicator': {
                            height: 4,
                            borderRadius: '4px 4px 0 0',
                            bgcolor: '#4a7c59'
                          }
                        }}
                      >
                        <Tab icon={<Construction />} label="Construction Progress" iconPosition="start" />
                        <Tab icon={<Payment />} label="Payment Status" iconPosition="start" />
                        <Tab icon={<Visibility />} label="Property Details" iconPosition="start" />
                      </Tabs>
                    </Paper>
                  </motion.div>

                  {/* Tab Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.4 }}
                    >
                      {/* TAB 0: CONSTRUCTION */}
                      {activeTab === 0 && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 4,
                            background: 'white',
                            borderRadius: 5,
                            border: '1px solid rgba(0, 0, 0, 0.06)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)'
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={2} mb={4}>
                            <Box
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 20px rgba(74, 124, 89, 0.3)'
                              }}
                            >
                              <Construction sx={{ fontSize: 28, color: 'white' }} />
                            </Box>
                            <Box>
                              <Typography variant="h5" fontWeight="700" sx={{ color: '#2c3e50' }}>
                                Construction Progress
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                Track each phase of your property construction
                              </Typography>
                            </Box>
                          </Box>

                          {loadingPhases ? (
                            <Box display="flex" justifyContent="center" p={4}>
                              <CircularProgress sx={{ color: '#4a7c59' }} />
                            </Box>
                          ) : (
                            <Stepper 
                              activeStep={phases.findIndex(p => p.constructionPercentage < 100)} 
                              orientation="vertical"
                              sx={{
                                '& .MuiStepConnector-line': {
                                  borderColor: '#e0e0e0',
                                  minHeight: 40
                                }
                              }}
                            >
                              {phases.map((phase, index) => {
                                const isCompleted = phase.constructionPercentage === 100
                                const isInProgress = phase.constructionPercentage > 0 && phase.constructionPercentage < 100
                                const description = PHASE_DESCRIPTIONS[phase.phaseNumber - 1]

                                return (
                                  <Step key={phase.phaseNumber} expanded={true}>
                                    <StepLabel
                                      StepIconComponent={() => (
                                        <motion.div
                                          whileHover={{ scale: 1.1, rotate: 5 }}
                                          transition={{ type: "spring", stiffness: 300 }}
                                        >
                                          {isCompleted ? (
                                            <CheckCircle sx={{ fontSize: 32, color: '#8bc34a' }} />
                                          ) : isInProgress ? (
                                            <Box
                                              sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem'
                                              }}
                                            >
                                              {phase.phaseNumber}
                                            </Box>
                                          ) : (
                                            <Lock sx={{ fontSize: 32, color: '#ccc' }} />
                                          )}
                                        </motion.div>
                                      )}
                                    >
                                      <Box>
                                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={0.5}>
                                          <Typography variant="h6" fontWeight="700" sx={{ color: '#2c3e50' }}>
                                            Phase {phase.phaseNumber}: {phase.title}
                                          </Typography>
                                          {isCompleted && (
                                            <Chip 
                                              label="100% Complete" 
                                              size="small"
                                              sx={{
                                                bgcolor: '#8bc34a',
                                                color: 'white',
                                                fontWeight: 700
                                              }}
                                            />
                                          )}
                                          {isInProgress && (
                                            <Chip 
                                              label={`${phase.constructionPercentage}% Complete`} 
                                              size="small"
                                              sx={{
                                                bgcolor: '#ff9800',
                                                color: 'white',
                                                fontWeight: 700
                                              }}
                                            />
                                          )}
                                        </Box>
                                        <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                          {description}
                                        </Typography>
                                      </Box>
                                    </StepLabel>

                                    <StepContent>
                                      <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4 }}
                                      >
                                        <Paper
                                          elevation={0}
                                          sx={{
                                            p: 3,
                                            mb: 3,
                                            bgcolor: '#f8f9fa',
                                            borderRadius: 3,
                                            border: '1px solid rgba(74, 124, 89, 0.1)'
                                          }}
                                        >
                                          {/* Progress Bar */}
                                          <Box mb={3}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                              <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600 }}>
                                                Construction Progress
                                              </Typography>
                                              <Chip 
                                                label={`${phase.constructionPercentage}%`}
                                                size="small"
                                                sx={{
                                                  bgcolor: isCompleted ? '#8bc34a' : '#4a7c59',
                                                  color: 'white',
                                                  fontWeight: 700
                                                }}
                                              />
                                            </Box>
                                            <LinearProgress 
                                              variant="determinate" 
                                              value={phase.constructionPercentage}
                                              sx={{ 
                                                height: 10, 
                                                borderRadius: 2,
                                                bgcolor: '#e0e0e0',
                                                '& .MuiLinearProgress-bar': {
                                                  background: 'linear-gradient(90deg, #4a7c59 0%, #8bc34a 100%)',
                                                  borderRadius: 2
                                                }
                                              }}
                                            />
                                            {phase.mediaItems && phase.mediaItems.length > 0 && (
                                              <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                                                <ImageIcon sx={{ fontSize: 16, color: '#4a7c59' }} />
                                                <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600 }}>
                                                  {phase.mediaItems.length} image{phase.mediaItems.length !== 1 ? 's' : ''} uploaded
                                                </Typography>
                                              </Box>
                                            )}
                                          </Box>

                                          {/* Images Gallery */}
                                          {phase.mediaItems && phase.mediaItems.length > 0 ? (
                                            <Box>
                                              <Typography variant="subtitle2" sx={{ color: '#2c3e50', fontWeight: 700, mb: 2 }}>
                                                Progress Images ({phase.mediaItems.length})
                                              </Typography>
                                              <ImageList cols={3} gap={12} sx={{ maxHeight: 450, borderRadius: 3, overflow: 'hidden' }}>
                                                {phase.mediaItems.map((media, idx) => (
                                                  <motion.div
                                                    key={media._id || idx}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    whileHover={{ scale: 1.05 }}
                                                  >
                                                    <ImageListItem
                                                      sx={{
                                                        cursor: 'pointer',
                                                        borderRadius: 3,
                                                        overflow: 'hidden',
                                                        border: '2px solid transparent',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                          borderColor: '#4a7c59',
                                                          boxShadow: '0 8px 20px rgba(74, 124, 89, 0.3)'
                                                        }
                                                      }}
                                                      onClick={() => setSelectedImage(media.url)}
                                                    >
                                                      <img
                                                        src={media.url}
                                                        alt={media.title}
                                                        loading="lazy"
                                                        style={{ 
                                                          height: 220, 
                                                          objectFit: 'cover'
                                                        }}
                                                      />
                                                      <ImageListItemBar
                                                        title={media.title}
                                                        subtitle={media.percentage ? `+${media.percentage}%` : null}
                                                        actionIcon={
                                                          <IconButton sx={{ color: 'white' }}>
                                                            <OpenInNew />
                                                          </IconButton>
                                                        }
                                                        sx={{
                                                          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)'
                                                        }}
                                                      />
                                                    </ImageListItem>
                                                  </motion.div>
                                                ))}
                                              </ImageList>
                                            </Box>
                                          ) : (
                                            <Alert 
                                              severity="info" 
                                              icon={<ImageIcon />}
                                              sx={{
                                                borderRadius: 3,
                                                bgcolor: 'rgba(33, 150, 243, 0.08)',
                                                border: '1px solid rgba(33, 150, 243, 0.2)'
                                              }}
                                            >
                                              No images uploaded for this phase yet. Images will appear here once construction progresses.
                                            </Alert>
                                          )}
                                        </Paper>
                                      </motion.div>
                                    </StepContent>
                                  </Step>
                                )
                              })}
                            </Stepper>
                          )}
                        </Paper>
                      )}

                      {/* TAB 1: PAYMENTS */}
                      {activeTab === 1 && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 4,
                            background: 'white',
                            borderRadius: 5,
                            border: '1px solid rgba(0, 0, 0, 0.06)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)'
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Box
                                sx={{
                                  width: 56,
                                  height: 56,
                                  borderRadius: 3,
                                  background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 8px 20px rgba(33, 150, 243, 0.3)'
                                }}
                              >
                                <Payment sx={{ fontSize: 28, color: 'white' }} />
                              </Box>
                              <Box>
                                <Typography variant="h5" fontWeight="700" sx={{ color: '#2c3e50' }}>
                                  Payment Status
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                  Manage and track your payment history
                                </Typography>
                              </Box>
                            </Box>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="contained"
                                startIcon={<Upload />}
                                onClick={handleOpenUploadPayment}
                                sx={{
                                  py: 1.5,
                                  px: 3,
                                  borderRadius: 3,
                                  background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                                  color: 'white',
                                  fontWeight: 700,
                                  textTransform: 'none',
                                  boxShadow: '0 8px 20px rgba(74, 124, 89, 0.3)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #3d664a 0%, #7ba843 100%)',
                                    boxShadow: '0 12px 28px rgba(74, 124, 89, 0.4)'
                                  }
                                }}
                              >
                                Upload Payment
                              </Button>
                            </motion.div>
                          </Box>

                          {/* Payment Summary Cards */}
                          <Grid container spacing={3} sx={{ mb: 4 }}>
                            {[
                              {
                                label: 'Total Paid',
                                value: `$${propertyDetails.payment.totalPaid.toLocaleString()}`,
                                color: '#8bc34a',
                                icon: <CheckCircle />
                              },
                              {
                                label: 'Pending Amount',
                                value: `$${propertyDetails.payment.totalPending.toLocaleString()}`,
                                color: '#ff9800',
                                icon: <Schedule />
                              },
                              {
                                label: 'Payment Progress',
                                value: `${Math.round(propertyDetails.payment.progress)}%`,
                                color: '#2196f3',
                                icon: <TrendingUp />
                              }
                            ].map((stat, index) => (
                              <Grid item xs={12} md={4} key={index}>
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ y: -5 }}
                                >
                                  <Card
                                    sx={{
                                      borderRadius: 4,
                                      border: `2px solid ${stat.color}30`,
                                      boxShadow: `0 8px 24px ${stat.color}20`,
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        borderColor: stat.color,
                                        boxShadow: `0 12px 32px ${stat.color}30`
                                      }
                                    }}
                                  >
                                    <CardContent sx={{ p: 3 }}>
                                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                        <Typography 
                                          variant="caption" 
                                          sx={{ 
                                            color: '#6c757d',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                          }}
                                        >
                                          {stat.label}
                                        </Typography>
                                        <Box
                                          sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 3,
                                            background: `${stat.color}15`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: stat.color
                                          }}
                                        >
                                          {stat.icon}
                                        </Box>
                                      </Box>
                                      <Typography 
                                        variant="h3" 
                                        fontWeight="800" 
                                        sx={{ 
                                          color: stat.color,
                                          letterSpacing: '-0.5px'
                                        }}
                                      >
                                        {stat.value}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              </Grid>
                            ))}
                          </Grid>

                          {/* Payment History Table */}
                          <Box>
                            <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 700, mb: 2 }}>
                              Payment History ({payloads.length} transaction{payloads.length !== 1 ? 's' : ''})
                            </Typography>
                            
                            {loadingPayloads ? (
                              <Box display="flex" justifyContent="center" p={4}>
                                <CircularProgress sx={{ color: '#4a7c59' }} />
                              </Box>
                            ) : payloads.length > 0 ? (
                              <TableContainer 
                                component={Paper}
                                elevation={0}
                                sx={{
                                  borderRadius: 4,
                                  border: '1px solid rgba(0, 0, 0, 0.06)',
                                  overflow: 'hidden'
                                }}
                              >
                                <Table>
                                  <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                      <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Date</TableCell>
                                      <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Amount</TableCell>
                                      <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Status</TableCell>
                                      <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Support</TableCell>
                                      <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Notes</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {payloads.map((payload, index) => (
                                      <motion.tr
                                        key={payload._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        component={TableRow}
                                        sx={{
                                          '&:hover': { bgcolor: 'rgba(74, 124, 89, 0.05)' },
                                          transition: 'all 0.3s ease'
                                        }}
                                      >
                                        <TableCell>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {new Date(payload.date).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric'
                                            })}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="h6" sx={{ color: '#4a7c59', fontWeight: 700 }}>
                                            ${payload.amount.toLocaleString()}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Chip
                                            icon={getStatusIcon(payload.status)}
                                            label={payload.status.toUpperCase()}
                                            color={getStatusColor(payload.status)}
                                            sx={{ fontWeight: 700 }}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          {payload.support ? (
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              href={payload.support}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              startIcon={<Description />}
                                              sx={{
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600
                                              }}
                                            >
                                              View Receipt
                                            </Button>
                                          ) : (
                                            <Typography variant="caption" sx={{ color: '#999' }}>
                                              No document
                                            </Typography>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                            {payload.notes || 'No notes'}
                                          </Typography>
                                        </TableCell>
                                      </motion.tr>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            ) : (
                              <Alert 
                                severity="info"
                                icon={<Info />}
                                sx={{
                                  borderRadius: 3,
                                  bgcolor: 'rgba(33, 150, 243, 0.08)',
                                  border: '1px solid rgba(33, 150, 243, 0.2)'
                                }}
                              >
                                No payment transactions yet. Click "Upload Payment" to add your first payment.
                              </Alert>
                            )}
                          </Box>
                        </Paper>
                      )}

                      {/* TAB 2: PROPERTY DETAILS */}
                      {activeTab === 2 && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 4,
                            background: 'white',
                            borderRadius: 5,
                            border: '1px solid rgba(0, 0, 0, 0.06)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)'
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={2} mb={4}>
                            <Box
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 20px rgba(103, 58, 183, 0.3)'
                              }}
                            >
                              <Visibility sx={{ fontSize: 28, color: 'white' }} />
                            </Box>
                            <Box>
                              <Typography variant="h5" fontWeight="700" sx={{ color: '#2c3e50' }}>
                                Property Details
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                Complete specifications of your property
                              </Typography>
                            </Box>
                          </Box>

                          {propertyDetails.model ? (
                            <Grid container spacing={3}>
                              {/* Model Information Card */}
                              <Grid item xs={12}>
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                >
                                  <Card
                                    sx={{
                                      borderRadius: 4,
                                      border: '1px solid rgba(74, 124, 89, 0.15)',
                                      boxShadow: '0 8px 24px rgba(74, 124, 89, 0.1)',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        p: 3,
                                        background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                                        color: 'white'
                                      }}
                                    >
                                      <Typography variant="h5" fontWeight="800">
                                        {propertyDetails.model.model}
                                      </Typography>
                                      <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                                        Model Information
                                      </Typography>
                                    </Box>
                                    <CardContent sx={{ p: 3 }}>
                                      <Typography variant="body1" sx={{ color: '#6c757d', mb: 3, lineHeight: 1.8 }}>
                                        {propertyDetails.model.description || 'No description available.'}
                                      </Typography>

                                      <Divider sx={{ my: 3 }} />

                                      <Grid container spacing={3}>
                                        {[
                                          { 
                                            icon: <Bed />, 
                                            label: 'Bedrooms', 
                                            value: propertyDetails.model.bedrooms,
                                            color: '#4a7c59'
                                          },
                                          { 
                                            icon: <Bathtub />, 
                                            label: 'Bathrooms', 
                                            value: propertyDetails.model.bathrooms,
                                            color: '#2196f3'
                                          },
                                          { 
                                            icon: <SquareFoot />, 
                                            label: 'Square Feet', 
                                            value: `${propertyDetails.model.sqft} ft²`,
                                            color: '#ff9800'
                                          },
                                          { 
                                            icon: <Home />, 
                                            label: 'Lot Number', 
                                            value: `#${propertyDetails.property.lot?.number}`,
                                            color: '#9c27b0'
                                          },
                                          { 
                                            icon: <LocationOn />, 
                                            label: 'Section', 
                                            value: propertyDetails.property.lot?.section,
                                            color: '#f44336'
                                          },
                                          { 
                                            icon: <AttachMoney />, 
                                            label: 'Property Value', 
                                            value: `$${propertyDetails.property.price?.toLocaleString()}`,
                                            color: '#4caf50'
                                          }
                                        ].map((spec, index) => (
                                          <Grid item xs={12} sm={6} md={4} key={index}>
                                            <motion.div
                                              initial={{ opacity: 0, scale: 0.9 }}
                                              animate={{ opacity: 1, scale: 1 }}
                                              transition={{ delay: index * 0.1 }}
                                              whileHover={{ scale: 1.05 }}
                                            >
                                              <Paper
                                                elevation={0}
                                                sx={{
                                                  p: 3,
                                                  textAlign: 'center',
                                                  borderRadius: 3,
                                                  border: `2px solid ${spec.color}30`,
                                                  bgcolor: `${spec.color}08`,
                                                  transition: 'all 0.3s ease',
                                                  '&:hover': {
                                                    borderColor: spec.color,
                                                    bgcolor: `${spec.color}15`,
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: `0 8px 20px ${spec.color}30`
                                                  }
                                                }}
                                              >
                                                <Box
                                                  sx={{
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: 3,
                                                    background: `${spec.color}20`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: spec.color,
                                                    margin: '0 auto',
                                                    mb: 2
                                                  }}
                                                >
                                                  {spec.icon}
                                                </Box>
                                                <Typography 
                                                  variant="caption" 
                                                  sx={{ 
                                                    color: '#6c757d',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    display: 'block',
                                                    mb: 1
                                                  }}
                                                >
                                                  {spec.label}
                                                </Typography>
                                                <Typography 
                                                  variant="h4" 
                                                  fontWeight="800" 
                                                  sx={{ 
                                                    color: spec.color,
                                                    letterSpacing: '-0.5px'
                                                  }}
                                                >
                                                  {spec.value}
                                                </Typography>
                                              </Paper>
                                            </motion.div>
                                          </Grid>
                                        ))}
                                      </Grid>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              </Grid>
                            </Grid>
                          ) : (
                            <Alert 
                              severity="warning"
                              sx={{
                                borderRadius: 3,
                                border: '1px solid rgba(255, 152, 0, 0.2)'
                              }}
                            >
                              No model details available for this property.
                            </Alert>
                          )}
                        </Paper>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== UPLOAD PAYMENT DIALOG ========== */}
        <Dialog 
          open={uploadPaymentDialog} 
          onClose={handleCloseUploadPayment} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)'
            }
          }}
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CloudUpload sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="700">
                  Upload Payment
                </Typography>
                <Typography variant="caption" sx={{ color: '#6c757d' }}>
                  Submit your payment information for approval
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Payment Amount"
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => handlePaymentFormChange('amount', e.target.value)}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1, color: '#4a7c59', fontWeight: 700 }}>$</Typography>
                  }}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      '&.Mui-focused fieldset': {
                        borderColor: '#4a7c59'
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Payment Date"
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) => handlePaymentFormChange('date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      '&.Mui-focused fieldset': {
                        borderColor: '#4a7c59'
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<Upload />}
                  sx={{
                    py: 2,
                    borderRadius: 3,
                    borderColor: '#4a7c59',
                    color: '#4a7c59',
                    fontWeight: 600,
                    borderWidth: 2,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#3d664a',
                      bgcolor: 'rgba(74, 124, 89, 0.05)',
                      borderWidth: 2
                    }
                  }}
                >
                  Upload Receipt / Support Document
                  <input
                    type="file"
                    hidden
                    accept="image/*,application/pdf"
                    onChange={(e) => handlePaymentFormChange('supportFile', e.target.files[0])}
                  />
                </Button>
                {paymentForm.supportFile && (
                  <Alert 
                    severity="success" 
                    sx={{ mt: 2, borderRadius: 2 }}
                    icon={<CheckCircle />}
                  >
                    <Typography variant="body2" fontWeight="600">
                      File selected: {paymentForm.supportFile.name}
                    </Typography>
                  </Alert>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  multiline
                  rows={3}
                  value={paymentForm.notes}
                  onChange={(e) => handlePaymentFormChange('notes', e.target.value)}
                  placeholder="Add any additional information about this payment..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      '&.Mui-focused fieldset': {
                        borderColor: '#4a7c59'
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Alert 
              severity="info" 
              sx={{ mt: 3, borderRadius: 3 }}
              icon={<Info />}
            >
              Your payment will be reviewed and approved by administration within 24-48 hours.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={handleCloseUploadPayment}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitPayment}
              disabled={uploadingPayment || !paymentForm.amount}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                color: 'white',
                fontWeight: 700,
                textTransform: 'none',
                px: 4,
                py: 1.5,
                boxShadow: '0 8px 20px rgba(74, 124, 89, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3d664a 0%, #7ba843 100%)',
                  boxShadow: '0 12px 28px rgba(74, 124, 89, 0.4)'
                },
                '&:disabled': {
                  background: '#ccc'
                }
              }}
            >
              {uploadingPayment ? 'Uploading...' : 'Submit Payment'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ========== IMAGE LIGHTBOX DIALOG ========== */}
        <Dialog
          open={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          maxWidth="lg"
          PaperProps={{
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              overflow: 'visible'
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <Box sx={{ position: 'relative' }}>
              <IconButton
                onClick={() => setSelectedImage(null)}
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: 0,
                  color: 'white',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)'
                  }
                }}
              >
                <Cancel />
              </IconButton>
              <img
                src={selectedImage}
                alt="Full size"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  borderRadius: 16,
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                }}
              />
            </Box>
          </motion.div>
        </Dialog>
      </Container>
    </Box>
  )
}

export default MyProperty