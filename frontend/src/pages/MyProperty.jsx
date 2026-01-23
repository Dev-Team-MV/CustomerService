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
  Button
} from '@mui/material'
import {
  Home,
  Construction,
  Payment,
  Visibility,
  ArrowBack
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import userPropertyService from '../services/userPropertyService'

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

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Obtener propiedades del usuario
      const props = await userPropertyService.getMyProperties()
      setProperties(props)

      // Obtener resumen financiero
      const summary = await userPropertyService.getFinancialSummary()
      setFinancialSummary(summary)

      // Si hay propiedades, seleccionar la primera
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
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
            {activeTab === 0 && (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Construction Progress
                </Typography>
                <Alert severity="info">
                  Construction timeline component will be displayed here.
                  {propertyDetails.construction.completedPhases} of {propertyDetails.construction.totalPhases} phases completed.
                </Alert>
              </Paper>
            )}

            {activeTab === 1 && (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Payment Status
                </Typography>
                <Grid container spacing={2}>
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

                <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
                  Payment History ({propertyDetails.payloads.length} transactions)
                </Typography>
                {propertyDetails.payloads.length > 0 ? (
                  <Alert severity="success">
                    {propertyDetails.payloads.filter(p => p.status === 'cleared').length} cleared payments
                  </Alert>
                ) : (
                  <Alert severity="info">No payments registered yet</Alert>
                )}
              </Paper>
            )}

            {activeTab === 2 && (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Property Details
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
    </Container>
  )
}

export default MyProperty