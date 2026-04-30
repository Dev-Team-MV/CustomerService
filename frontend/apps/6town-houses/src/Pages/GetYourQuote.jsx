// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Pages/GetYourQuote.jsx

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Container, Stepper, Step, StepLabel, Paper, Typography, Alert, CircularProgress, Grid, Divider, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useCatalogConfig } from '@shared/hooks/useCatalogConfig'
import api from '@shared/services/api'
import { useAuth } from '@shared/context/AuthContext'
import { PropertyQuoteProvider, usePropertyBuilding } from '@shared/context/ProperyQuoteContext'
import quoteService from '@shared/services/quoteService'
import { calculateEstimatedPrice } from '@shared/utils/pricingEngine'
import LotSelector from '../Components/quote/LotSelector'
import HouseCustomizer from '../Components/quote/HouseCustomizer'
import PriceCalculator from '@shared/components/PropertyQuote/PriceCalculator'
import ResidentAssignment from '@shared/components/PropertyQuote/ResidentAsignment'

const STEPS = ['Selecciona Casa', 'Personaliza', 'Cotización', 'Asignar Residente']

const GetYourQuoteContent = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const projectId = import.meta.env.VITE_PROJECT_ID
  const { isAuthenticated } = useAuth()
  const { catalogConfig, loading: loadingConfig } = useCatalogConfig(projectId, { activeOnly: true })

  const {
    updateFinancials,
    setSelectedBuilding: setContextBuilding,
    setSelectedApartment: setContextApartment,
    setSelectedProject,
    setSelectedOptions: setContextOptions,
  } = usePropertyBuilding()

  const [currentStep, setCurrentStep] = useState(0)
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [customizationData, setCustomizationData] = useState(null)
  const [quoteResult, setQuoteResult] = useState(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [error, setError] = useState(null)
  const [residentExpanded, setResidentExpanded] = useState(false)
  const [modelFloors, setModelFloors] = useState([])
  const [projectData, setProjectData] = useState(null)

  useEffect(() => {
    if (selectedOptions && Object.keys(selectedOptions).length > 0) {
      setContextOptions(selectedOptions)
    }
  }, [selectedOptions, setContextOptions])

  useEffect(() => {
    if (projectId) {
      setSelectedProject(projectId)
    }
  }, [projectId, setSelectedProject])

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${projectId}`)
        setProjectData(response.data)
      } catch (err) {
        console.error('Error fetching project:', err)
      }
    }
    
    fetchProject()
  }, [projectId])

  useEffect(() => {
    const fetchModelFloors = async () => {
      if (!selectedBuilding?.model?._id) return
      
      try {
        const response = await api.get(`/models/${selectedBuilding.model._id}/floors`)
        setModelFloors(response.data.floors || [])
      } catch (err) {
        console.error('Error fetching model floors:', err)
      }
    }
    
    fetchModelFloors()
  }, [selectedBuilding])

  const facadeEnabled = projectData?.facadeEnabled ?? true
 
  const basePrice = useMemo(() => {
    if (!selectedBuilding) return 0
    const lotPrice = selectedBuilding.lot?.price || 0
    const modelPrice = selectedBuilding.model?.price || 0
    const facadePrice = facadeEnabled && selectedBuilding.facade?.price ? selectedBuilding.facade.price : 0
    return lotPrice + modelPrice + facadePrice
  }, [selectedBuilding, facadeEnabled])

  const estimatedPrice = useMemo(() => {
    if (!catalogConfig || !selectedBuilding || Object.keys(selectedOptions).length === 0) return null
    
    return calculateEstimatedPrice({
      basePrice,
      pricingRules: catalogConfig?.pricingRules || [],
      selectedOptions
    })
  }, [basePrice, catalogConfig, selectedOptions, selectedBuilding])

  // Mock apartment para PriceCalculator
  const mockApartment = useMemo(() => {
    if (!selectedBuilding) return null
    
    const price = estimatedPrice?.totalPrice || quoteResult?.breakdown?.totalPrice || basePrice || 0
    
    return {
      _id: selectedBuilding._id,
      apartmentNumber: selectedBuilding.name,
      price: price,
      apartmentModel: {
        name: selectedBuilding.model?.model || 'Casa',
        _id: selectedBuilding.model?._id
      },
      floorNumber: 1,
      pending: 0
    }
  }, [selectedBuilding, estimatedPrice, quoteResult, basePrice])

  // Sincronizar mock apartment al contexto
  useEffect(() => {
    if (mockApartment) {
      setContextApartment(mockApartment)
    }
  }, [mockApartment, setContextApartment])

  // Actualizar financials cuando cambia el precio estimado
  useEffect(() => {
    if (estimatedPrice && currentStep >= 1) {
      const totalPrice = estimatedPrice.totalPrice
      updateFinancials({
        listPrice: totalPrice,
        discount: 0,
        discountPercent: 0,
        presalePrice: totalPrice,
        totalDownPayment: totalPrice * 0.2,
        downPaymentPercent: 20,
        initialDownPayment: totalPrice * 0.1,
        initialDownPaymentPercent: 10,
        monthlyPayment: 0,
        monthlyPaymentPercent: 0,
        mortgage: totalPrice * 0.8,
        pending: 0
      })
    }
  }, [estimatedPrice, currentStep])

  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building)
    setContextBuilding(building)
    setCurrentStep(1)
    setError(null)
  }

  const handleCustomizationComplete = async (data) => {
    try {
      setLoadingQuote(true)
      setError(null)
      setCustomizationData(data)

      const quotePayload = {
        projectId,
        lot: selectedBuilding.quoteRef?.lot,
        model: selectedBuilding.quoteRef?.model,
        selectedOptions: data.selectedOptions
      }

      if (facadeEnabled && selectedBuilding.quoteRef?.facade) {
        quotePayload.facade = selectedBuilding.quoteRef.facade
      }

      console.log('📤 Quote payload:', quotePayload)

      const response = await quoteService.getHouseQuote(quotePayload)

      setQuoteResult(response)

      if (response.breakdown?.totalPrice) {
        const totalPrice = response.breakdown.totalPrice
        updateFinancials({
          listPrice: totalPrice,
          discount: 0,
          discountPercent: 0,
          presalePrice: totalPrice,
          totalDownPayment: totalPrice * 0.2,
          downPaymentPercent: 20,
          initialDownPayment: totalPrice * 0.1,
          initialDownPaymentPercent: 10,
          monthlyPayment: 0,
          monthlyPaymentPercent: 0,
          mortgage: totalPrice * 0.8,
          pending: 0
        })
      }

      setCurrentStep(2)
    } catch (err) {
      console.error('Error calculating quote:', err)
      setError(err.message || 'Error al calcular la cotización')
    } finally {
      setLoadingQuote(false)
    }
  }

  const handleOptionsChange = (options) => {
    setSelectedOptions(options)
  }

  const handleContinue = () => {
    if (currentStep === 2 && isAuthenticated) {
      setCurrentStep(3)
      setResidentExpanded(true)
    } else if (currentStep === 2 && !isAuthenticated) {
      navigate('/login')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (loadingConfig) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!catalogConfig) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">No se pudo cargar la configuración del catálogo</Alert>
      </Container>
    )
  }

return (
//   <Box sx={{ 
//     display: 'flex', 
//     flexDirection: 'column', 
//     height: '100vh', 
//     overflow: 'hidden',
//     bgcolor: theme.palette.background.default
//   }}>
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, py: 4 }}>

    {/* ========== HEADER SUPERIOR - FIJO ========== */}
    <Box component="header" sx={{ 
      flexShrink: 0,
      bgcolor: 'background.paper', 
      borderBottom: '1px solid', 
      borderColor: 'divider',
      px: 3,
      py: 2
    }}>
      <Container maxWidth="xl" disableGutters>
        <Typography variant="h4" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
          Cotiza tu Casa
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Personaliza y cotiza tu casa ideal en simples pasos
        </Typography>
      </Container>
    </Box>

    {/* ========== STEPPER - FIJO ========== */}
    <Box sx={{ 
      flexShrink: 0,
      bgcolor: 'background.paper',
      borderBottom: '1px solid',
      borderColor: 'divider',
      px: 3,
      py: 1
    }}>
      <Container maxWidth="xl" disableGutters>
        <Stepper activeStep={currentStep} sx={{ py: 1 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ 
                '& .MuiStepLabel-label': { 
                  fontFamily: '"Poppins", sans-serif', 
                  fontWeight: 600,
                  fontSize: '0.875rem'
                } 
              }}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Container>
    </Box>

    {/* ========== CONTENIDO PRINCIPAL - CON SCROLL INTERNO ========== */}
    <Box sx={{ 
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Container maxWidth="xl" sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        px: 3,
        py: 2
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2, flexShrink: 0 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
          
          {/* Columna Principal (Izquierda) - CON SCROLL */}
          <Grid item xs={12} lg={8} sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              pr: 1,
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '10px' },
              '&::-webkit-scrollbar-thumb': { 
                background: theme.palette.primary.main, 
                borderRadius: '10px'
              }
            }}>
              {/* Paso 1: LotSelector */}
              {currentStep === 0 && (
                <LotSelector
                  projectId={projectId}
                  onBuildingSelect={handleBuildingSelect}
                  facadeEnabled={facadeEnabled}
                />
              )}

              {/* Paso 2: HouseCustomizer */}
              {currentStep === 1 && selectedBuilding && (
                <HouseCustomizer
                  catalogConfig={catalogConfig}
                  selectedBuilding={selectedBuilding}
                  modelFloors={modelFloors}
                  onComplete={handleCustomizationComplete}
                  onBack={() => { setCurrentStep(0); setSelectedBuilding(null); setError(null) }}
                  onOptionsChange={handleOptionsChange}
                />
              )}

              {/* Paso 3: Quote Result */}
              {currentStep === 2 && quoteResult && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight={700} mb={2} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                      Desglose de Precio
                    </Typography>
                    <Grid container spacing={1}>
                      {quoteResult.lot && (
                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="space-between" py={0.5}>
                            <Typography variant="body2" color="text.secondary">Lote {quoteResult.lot.number}</Typography>
                            <Typography variant="body2" fontWeight={600}>${quoteResult.lot.price?.toLocaleString()}</Typography>
                          </Box>
                        </Grid>
                      )}
                      {quoteResult.model && (
                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="space-between" py={0.5}>
                            <Typography variant="body2" color="text.secondary">Modelo {quoteResult.model.model}</Typography>
                            <Typography variant="body2" fontWeight={600}>${quoteResult.model.price?.toLocaleString()}</Typography>
                          </Box>
                        </Grid>
                      )}
                      {facadeEnabled && quoteResult.facade && (
                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="space-between" py={0.5}>
                            <Typography variant="body2" color="text.secondary">Fachada {quoteResult.facade.title}</Typography>
                            <Typography variant="body2" fontWeight={600}>${quoteResult.facade.price?.toLocaleString()}</Typography>
                          </Box>
                        </Grid>
                      )}
                      {quoteResult.breakdown?.adjustments?.length > 0 && (
                        <>
                          <Grid item xs={12}><Divider sx={{ my: 1 }} /><Typography variant="body2" fontWeight={600} color="text.secondary">Ajustes:</Typography></Grid>
                          {quoteResult.breakdown.adjustments.map((adj, idx) => (
                            <Grid item xs={12} key={idx}>
                              <Box display="flex" justifyContent="space-between" py={0.5}>
                                <Typography variant="body2" color="text.secondary">{adj.label || adj.code}</Typography>
                                <Typography variant="body2" fontWeight={600} color={adj.amount >= 0 ? 'success.main' : 'error.main'}>
                                  {adj.amount >= 0 ? '+' : ''}${Math.abs(adj.amount || 0).toLocaleString()}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </>
                      )}
                    </Grid>
                  </Paper>

                  {customizationData && (
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                      <Typography variant="h6" fontWeight={700} mb={2} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                        Opciones Seleccionadas
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(customizationData.selectedOptions).map(([levelKey, value]) => {
                          const level = catalogConfig.structure.levels[levelKey]
                          const selections = Array.isArray(value) ? value : [value]
                          const labels = selections.map(id => level?.options?.find(opt => opt.id === id)?.label).filter(Boolean)
                          return (
                            <Grid item xs={12} sm={6} key={levelKey}>
                              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                                {level?.label}
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="primary">
                                {labels.join(', ')}
                              </Typography>
                            </Grid>
                          )
                        })}
                      </Grid>
                    </Paper>
                  )}
                </Box>
              )}

              {/* Paso 4: Resident Assignment */}
              {currentStep === 3 && (
                <ResidentAssignment
                  expanded={residentExpanded}
                  onToggle={() => setResidentExpanded(!residentExpanded)}
                  onBack={() => setCurrentStep(2)}
                  facadeEnabled={facadeEnabled}
                />
              )}
            </Box>
          </Grid>

          {/* Columna Sidebar (Derecha) - PriceCalculator FIJO con scroll interno */}
          <Grid item xs={12} lg={4} sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: 0
          }}>
            <Box sx={{ 
              position: 'sticky',
              top: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              {/* PriceCalculator con altura máxima y scroll propio */}
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  maxHeight: 'calc(100vh - 280px)', // 👈 Altura calculada: 100vh - header - stepper - padding
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '10px' },
                  '&::-webkit-scrollbar-thumb': { 
                    background: theme.palette.primary.main, 
                    borderRadius: '10px',
                    '&:hover': { background: theme.palette.primary.dark }
                  }
                }}
              >
                <PriceCalculator />
              </Paper>

              {/* Botones de navegación - SIEMPRE VISIBLES abajo del calculator */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                {currentStep > 0 && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleBack}
                    sx={{
                      borderRadius: 3,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontFamily: '"Poppins", sans-serif',
                      borderColor: theme.palette.divider,
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: theme.palette.action.hover
                      }
                    }}
                  >
                    Atrás
                  </Button>
                )}
                
                {currentStep === 2 && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleContinue}
                    disabled={!isAuthenticated}
                    sx={{
                      borderRadius: 3,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontFamily: '"Poppins", sans-serif',
                      bgcolor: theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark
                      }
                    }}
                  >
                    {isAuthenticated ? 'Asignar Residente' : 'Inicia sesión'}
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  </Box>
)
}

const GetYourQuote = () => (
  <PropertyQuoteProvider>
    <GetYourQuoteContent />
  </PropertyQuoteProvider>
)

export default GetYourQuote