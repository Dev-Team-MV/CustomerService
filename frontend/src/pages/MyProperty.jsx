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
//   Button
// } from '@mui/material'
// import {
//   Home,
//   Construction,
//   Payment,
//   Visibility,
//   ArrowBack
// } from '@mui/icons-material'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import userPropertyService from '../services/userPropertyService'

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

//   useEffect(() => {
//     fetchData()
//   }, [])

//   const fetchData = async () => {
//     try {
//       setLoading(true)
      
//       // Obtener propiedades del usuario
//       const props = await userPropertyService.getMyProperties()
//       setProperties(props)

//       // Obtener resumen financiero
//       const summary = await userPropertyService.getFinancialSummary()
//       setFinancialSummary(summary)

//       // Si hay propiedades, seleccionar la primera
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

//   const handleTabChange = (event, newValue) => {
//     setActiveTab(newValue)
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
//             {activeTab === 0 && (
//               <Paper elevation={2} sx={{ p: 3 }}>
//                 <Typography variant="h6" gutterBottom>
//                   Construction Progress
//                 </Typography>
//                 <Alert severity="info">
//                   Construction timeline component will be displayed here.
//                   {propertyDetails.construction.completedPhases} of {propertyDetails.construction.totalPhases} phases completed.
//                 </Alert>
//               </Paper>
//             )}

//             {activeTab === 1 && (
//               <Paper elevation={2} sx={{ p: 3 }}>
//                 <Typography variant="h6" gutterBottom>
//                   Payment Status
//                 </Typography>
//                 <Grid container spacing={2}>
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

//                 <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
//                   Payment History ({propertyDetails.payloads.length} transactions)
//                 </Typography>
//                 {propertyDetails.payloads.length > 0 ? (
//                   <Alert severity="success">
//                     {propertyDetails.payloads.filter(p => p.status === 'cleared').length} cleared payments
//                   </Alert>
//                 ) : (
//                   <Alert severity="info">No payments registered yet</Alert>
//                 )}
//               </Paper>
//             )}

//             {activeTab === 2 && (
//               <Paper elevation={2} sx={{ p: 3 }}>
//                 <Typography variant="h6" gutterBottom>
//                   Property Details
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
  MenuItem
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
  Cancel
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import userPropertyService from '../services/userPropertyService'
import api from '../services/api'

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
  
  // Estados para fases de construcción
  const [phases, setPhases] = useState([])
  const [loadingPhases, setLoadingPhases] = useState(false)
  
  // Estados para pagos
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

      if (props.length > 0) {
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
    } catch (error) {
      console.error('Error fetching property details:', error)
      setError(error.message || 'Failed to load property details')
    } finally {
      setLoading(false)
    }
  }

  const fetchPhases = async () => {
    try {
      setLoadingPhases(true)
      const response = await api.get(`/phases/property/${selectedProperty}`)
      
      // Asegurar que existan las 9 fases
      const existingPhases = response.data
      const allPhases = []
      
      for (let i = 1; i <= 9; i++) {
        const existingPhase = existingPhases.find(p => p.phaseNumber === i)
        if (existingPhase) {
          allPhases.push(existingPhase)
        } else {
          allPhases.push({
            phaseNumber: i,
            title: `Phase ${i}`,
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
    setPaymentForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmitPayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    try {
      setUploadingPayment(true)

      // Si hay un archivo de soporte, subirlo primero
      let supportUrl = paymentForm.support
      if (paymentForm.supportFile) {
        const formData = new FormData()
        formData.append('image', paymentForm.supportFile)
        
        const uploadResponse = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        supportUrl = uploadResponse.data.url
      }

      // Crear el payload
      await api.post('/payloads', {
        property: selectedProperty,
        amount: parseFloat(paymentForm.amount),
        date: paymentForm.date,
        support: supportUrl,
        notes: paymentForm.notes,
        status: 'pending' // Los usuarios solo pueden crear pagos pendientes
      })

      alert('✅ Payment uploaded successfully! Awaiting approval.')
      handleCloseUploadPayment()
      fetchPayloads()
      fetchData() // Refresh financial summary
      
    } catch (error) {
      console.error('Error submitting payment:', error)
      alert('❌ Error uploading payment. Please try again.')
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

  if (loading && !propertyDetails) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    )
  }

  if (error && properties.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </Container>
    )
  }

  if (properties.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          No properties found. Contact administration to get a property assigned.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header con resumen financiero */}
      {financialSummary && (
        <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            My Properties Dashboard
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Total Investment
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    ${financialSummary.totalInvestment.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Total Paid
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    ${financialSummary.totalPaid.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(financialSummary.paymentProgress)}% completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="warning.main">
                    ${financialSummary.totalPending.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Properties
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {financialSummary.properties}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Selector de propiedades si tiene múltiples */}
      {properties.length > 1 && (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Select a property:
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            {properties.map((prop) => (
              <Button
                key={prop._id}
                variant={selectedProperty === prop._id ? 'contained' : 'outlined'}
                onClick={() => handleSelectProperty(prop._id)}
                startIcon={<Home />}
              >
                Lot {prop.lot?.number} - {prop.model?.model || 'No Model'}
              </Button>
            ))}
          </Box>
        </Paper>
      )}

      {/* Detalles de la propiedad seleccionada */}
      {propertyDetails && (
        <>
          {/* Header de la propiedad */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Home sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {propertyDetails.model?.model || 'Model Not Assigned'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Lot #{propertyDetails.property.lot?.number} - Section {propertyDetails.property.lot?.section}
                    </Typography>
                    <Box display="flex" gap={1} mt={1}>
                      {propertyDetails.construction.currentPhase && (
                        <Chip
                          label={`Phase ${propertyDetails.construction.currentPhase.phaseNumber}: ${propertyDetails.construction.currentPhase.title}`}
                          color="primary"
                          size="small"
                        />
                      )}
                      <Chip
                        label={`${Math.round(propertyDetails.construction.progress)}% Complete`}
                        color="success"
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'primary.50' }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Property Value
                    </Typography>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      ${propertyDetails.property.price?.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* Tabs de información */}
          <Paper elevation={2} sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<Construction />} label="Construction" iconPosition="start" />
              <Tab icon={<Payment />} label="Payments" iconPosition="start" />
              <Tab icon={<Visibility />} label="Details" iconPosition="start" />
            </Tabs>
          </Paper>

          {/* Contenido de las tabs */}
          <Box>
            {/* TAB 1: CONSTRUCTION PHASES */}
            {activeTab === 0 && (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  🏗️ Construction Progress
                </Typography>
                
                {loadingPhases ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Stepper activeStep={phases.findIndex(p => p.constructionPercentage < 100)} orientation="vertical">
                    {phases.map((phase) => {
                      const isCompleted = phase.constructionPercentage === 100
                      const description = PHASE_DESCRIPTIONS[phase.phaseNumber - 1]

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
                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                              <Typography variant="subtitle1" fontWeight="bold">
                                {phase.title}
                              </Typography>
                              {isCompleted && (
                                <Chip label="100% Complete" color="success" size="small" />
                              )}
                              {!isCompleted && phase.constructionPercentage > 0 && (
                                <Chip 
                                  label={`${phase.constructionPercentage}% Complete`} 
                                  color="primary" 
                                  size="small" 
                                />
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                              {description}
                            </Typography>
                          </StepLabel>

                          <StepContent>
                            <Box sx={{ mb: 2 }}>
                              {/* Progress Bar */}
                              <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                  <Typography variant="caption" color="text.secondary">
                                    Construction Progress:
                                  </Typography>
                                  <Chip 
                                    label={`${phase.constructionPercentage}%`}
                                    color={phase.constructionPercentage === 100 ? 'success' : 'primary'}
                                    size="small"
                                  />
                                </Box>
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
                                {phase.mediaItems && phase.mediaItems.length > 0 && (
                                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                    📷 {phase.mediaItems.length} image{phase.mediaItems.length !== 1 ? 's' : ''} uploaded
                                  </Typography>
                                )}
                              </Paper>

                              {/* Images Display */}
                              {phase.mediaItems && phase.mediaItems.length > 0 ? (
                                <Box>
                                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                    📷 Progress Images ({phase.mediaItems.length})
                                  </Typography>
                                  <ImageList cols={3} gap={12} sx={{ maxHeight: 400 }}>
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
                                          sx={{
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                                            borderRadius: '0 0 8px 8px'
                                          }}
                                        />
                                      </ImageListItem>
                                    ))}
                                  </ImageList>
                                </Box>
                              ) : (
                                <Alert severity="info">
                                  📭 No images uploaded for this phase yet
                                </Alert>
                              )}
                            </Box>
                          </StepContent>
                        </Step>
                      )
                    })}
                  </Stepper>
                )}
              </Paper>
            )}

            {/* TAB 2: PAYMENTS */}
            {activeTab === 1 && (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight="bold">
                    💳 Payment Status
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Upload />}
                    onClick={handleOpenUploadPayment}
                    sx={{
                      bgcolor: '#4a7c59',
                      '&:hover': { bgcolor: '#3d664a' }
                    }}
                  >
                    Upload Payment
                  </Button>
                </Box>

                {/* Payment Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">
                          Total Paid
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="success.main">
                          ${propertyDetails.payment.totalPaid.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">
                          Pending
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="warning.main">
                          ${propertyDetails.payment.totalPending.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="primary.main">
                          {Math.round(propertyDetails.payment.progress)}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Payment History Table */}
                <Typography variant="subtitle1" sx={{ mb: 2 }} fontWeight="bold">
                  Payment History ({payloads.length} transactions)
                </Typography>
                
                {loadingPayloads ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : payloads.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Support</TableCell>
                          <TableCell>Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {payloads.map((payload) => (
                          <TableRow key={payload._id} hover>
                            <TableCell>
                              {new Date(payload.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="600">
                                ${payload.amount.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getStatusIcon(payload.status)}
                                label={payload.status}
                                color={getStatusColor(payload.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {payload.support ? (
                                <Button
                                  size="small"
                                  href={payload.support}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View
                                </Button>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  N/A
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {payload.notes || 'No notes'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">No payments registered yet</Alert>
                )}
              </Paper>
            )}

            {/* TAB 3: DETAILS */}
            {activeTab === 2 && (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  🏡 Property Details
                </Typography>
                {propertyDetails.model && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Model: {propertyDetails.model.model}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {propertyDetails.model.description}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Bedrooms
                        </Typography>
                        <Typography variant="h6">{propertyDetails.model.bedrooms}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Bathrooms
                        </Typography>
                        <Typography variant="h6">{propertyDetails.model.bathrooms}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Square Feet
                        </Typography>
                        <Typography variant="h6">{propertyDetails.model.sqft}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            )}
          </Box>
        </>
      )}

      {/* Dialog para subir pagos */}
      <Dialog open={uploadPaymentDialog} onClose={handleCloseUploadPayment} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CloudUpload color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Upload Payment
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) => handlePaymentFormChange('amount', e.target.value)}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={paymentForm.date}
                onChange={(e) => handlePaymentFormChange('date', e.target.value)}
                InputLabelProps={{
                  shrink: true
                }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<Upload />}
              >
                Upload Receipt/Support Document
                <input
                  type="file"
                  hidden
                  accept="image/*,application/pdf"
                  onChange={(e) => handlePaymentFormChange('supportFile', e.target.files[0])}
                />
              </Button>
              {paymentForm.supportFile && (
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Selected: {paymentForm.supportFile.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (optional)"
                multiline
                rows={3}
                value={paymentForm.notes}
                onChange={(e) => handlePaymentFormChange('notes', e.target.value)}
                placeholder="Add any additional information about this payment"
              />
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>
            Your payment will be reviewed and approved by administration.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadPayment}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitPayment}
            disabled={uploadingPayment || !paymentForm.amount}
          >
            {uploadingPayment ? 'Uploading...' : 'Submit Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default MyProperty