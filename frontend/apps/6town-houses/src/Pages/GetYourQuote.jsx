import { useState, useMemo, useEffect } from 'react'
import {
  Container, Paper, Box, CircularProgress, Alert, Typography,
  Button, Grid, Divider, Stepper, Step, StepLabel
} from '@mui/material'
import { ArrowBack, AttachMoney, CheckCircle } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import { useCatalogConfig } from '@shared/hooks/useCatalogConfig'
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
  setSelectedOptions: setContextOptions,  // AGREGAR
} = usePropertyBuilding()

  // ✅ PRIMERO: Declarar todos los estados
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [customizationData, setCustomizationData] = useState(null)
  const [quoteResult, setQuoteResult] = useState(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [error, setError] = useState(null)
  const [residentExpanded, setResidentExpanded] = useState(false)
 
  // ✅ DESPUÉS: useEffect que usa selectedOptions
  useEffect(() => {
    if (setContextOptions && selectedOptions) {
      setContextOptions(selectedOptions)
    }
  }, [selectedOptions, setContextOptions])
 
  // ✅ Setear projectId en el contexto al montar
  useEffect(() => {
    if (setSelectedProject && projectId) {
      setSelectedProject(projectId)
    }
  }, [projectId, setSelectedProject])
 
  // Precio base de la casa seleccionada
  const basePrice = useMemo(() => {
    if (!selectedBuilding?.quoteRef) return 0
    return (
      (selectedBuilding.quoteRef.lotPrice || 0) +
      (selectedBuilding.quoteRef.modelPrice || 0) +
      (selectedBuilding.quoteRef.facadePrice || 0)
    )
  }, [selectedBuilding])
 
  // Precio estimado en tiempo real según opciones seleccionadas
  const estimatedPrice = useMemo(() => {
    if (!selectedBuilding?.quoteRef) return null
    return calculateEstimatedPrice({
      basePrice,
      pricingRules: catalogConfig?.pricingRules || [],
      selectedOptions
    })
  }, [basePrice, selectedOptions, catalogConfig])

  // Sincronizar precio estimado con el contexto (para PriceCalculator)
  useEffect(() => {
    if (!estimatedPrice || currentStep !== 1) return
    updateFinancials({
      listPrice: estimatedPrice.totalPrice,
      discount: 0,
      discountPercent: 0,
      presalePrice: estimatedPrice.totalPrice,
      totalDownPayment: estimatedPrice.totalPrice * 0.2,
      downPaymentPercent: 20,
      initialDownPayment: estimatedPrice.totalPrice * 0.1,
      initialDownPaymentPercent: 10,
      monthlyPayment: 0,
      monthlyPaymentPercent: 0,
      mortgage: estimatedPrice.totalPrice * 0.8,
      pending: 0
    })
  }, [estimatedPrice, currentStep])

  // Mock apartment para que ResidentAssignment y PriceCalculator funcionen
  const mockApartment = useMemo(() => {
    if (!selectedBuilding) return null
    const price = quoteResult?.totals?.totalPrice || quoteResult?.totalPrice || estimatedPrice?.totalPrice || 0
    return {
      _id: selectedBuilding._id,
      apartmentNumber: selectedBuilding.name,
      price,
      apartmentModel: {
        name: quoteResult?.model?.model || 'Casa',
        _id: quoteResult?.model?._id
      },
      floorNumber: 1,
      pending: 0
    }
  }, [selectedBuilding, quoteResult, estimatedPrice])

  // Sincronizar building y apartment al contexto
  useEffect(() => {
    if (selectedBuilding) setContextBuilding(selectedBuilding)
  }, [selectedBuilding])

  useEffect(() => {
    if (mockApartment) setContextApartment(mockApartment)
  }, [mockApartment])

  // ── Handlers ────────────────────────────────────────────────

  const handleLotSelect = (building) => {
    if (!building.quoteRef?.lot || !building.quoteRef?.model || !building.quoteRef?.facade) {
      setError('Esta casa no tiene configuración de cotización completa. Por favor contacta con ventas.')
      return
    }
    setSelectedBuilding(building)
    setSelectedOptions({})
    setError(null)
    setCurrentStep(1)
  }

  const handleCustomizationComplete = async (customization) => {
    setLoadingQuote(true)
    setError(null)
    setCustomizationData(customization)

    try {
      const result = await quoteService.getHouseQuote({
        projectId,
        lot: selectedBuilding.quoteRef.lot,
        model: selectedBuilding.quoteRef.model,
        facade: selectedBuilding.quoteRef.facade,
        selectedOptions: customization.selectedOptions
      })

      setQuoteResult(result)

      const finalPrice = result.totals?.totalPrice || result.totalPrice || result.basePrice || 0
      updateFinancials({
        listPrice: finalPrice,
        discount: 0,
        discountPercent: 0,
        presalePrice: finalPrice,
        totalDownPayment: finalPrice * 0.2,
        downPaymentPercent: 20,
        initialDownPayment: finalPrice * 0.1,
        initialDownPaymentPercent: 10,
        monthlyPayment: 0,
        monthlyPaymentPercent: 0,
        mortgage: finalPrice * 0.8,
        pending: 0
      })

      setCurrentStep(2)
    } catch (err) {
      setError(err.message || 'Error al calcular el precio. Intenta de nuevo.')
    } finally {
      setLoadingQuote(false)
    }
  }

  const handleStartOver = () => {
    setCurrentStep(0)
    setSelectedBuilding(null)
    setSelectedOptions({})
    setCustomizationData(null)
    setQuoteResult(null)
    setError(null)
    setResidentExpanded(false)
    updateFinancials({
      listPrice: 0, discount: 0, discountPercent: 0,
      presalePrice: 0, totalDownPayment: 0, downPaymentPercent: 20,
      initialDownPayment: 0, initialDownPaymentPercent: 10,
      monthlyPayment: 0, monthlyPaymentPercent: 0, mortgage: 0, pending: 0
    })
  }

  // ── Loading / Error guards ───────────────────────────────────

  if (loadingConfig) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>Cargando configuración...</Typography>
        </Box>
      </Container>
    )
  }

  if (!catalogConfig) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">No hay configuración de catálogo disponible. Por favor contacta con el administrador.</Alert>
      </Container>
    )
  }

  // ── Render ───────────────────────────────────────────────────

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>

        {/* Stepper */}
        <Box mb={4}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Layout 2 columnas */}
        <Grid container spacing={3}>

          {/* Columna principal */}
          <Grid item xs={12} md={8}>

            {/* Step 0: Seleccionar Casa */}
            {currentStep === 0 && (
              <LotSelector projectId={projectId} onSelectLot={handleLotSelect} />
            )}

            {/* Step 1: Personalizar */}
            {currentStep === 1 && !loadingQuote && (
              <HouseCustomizer
                catalogConfig={catalogConfig}
                selectedBuilding={selectedBuilding}
                onComplete={handleCustomizationComplete}
                onBack={() => { setCurrentStep(0); setSelectedBuilding(null); setError(null) }}
                onOptionsChange={setSelectedOptions}
              />
            )}

            {/* Loading */}
            {loadingQuote && (
              <Box textAlign="center" py={8}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>Calculando tu cotización...</Typography>
              </Box>
            )}

            {/* Step 2: Resultado */}
            {currentStep === 2 && quoteResult && (
              <Box>
                <Box display="flex" alignItems="center" gap={2} mb={4}>
                  <AttachMoney sx={{ fontSize: 50, color: theme.palette.success.main }} />
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>Tu Cotización</Typography>
                    <Typography variant="body1" color="text.secondary">{selectedBuilding?.name}</Typography>
                  </Box>
                </Box>

                <Alert severity="success" sx={{ mb: 4, borderRadius: 3 }}>¡Cotización generada exitosamente!</Alert>

                {/* Desglose de precio */}
                <Paper elevation={2} sx={{ p: 4, mb: 4, bgcolor: '#f5f5f5', borderRadius: 3 }}>
                  <Typography variant="h5" fontWeight={700} mb={3} color="primary">
                    Total: ${(quoteResult.totals?.totalPrice || quoteResult.totalPrice)?.toLocaleString()}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" fontWeight={700} mb={2}>Desglose:</Typography>

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
                    {quoteResult.facade && (
                      <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" py={0.5}>
                          <Typography variant="body2" color="text.secondary">Fachada {quoteResult.facade.title}</Typography>
                          <Typography variant="body2" fontWeight={600}>${quoteResult.facade.price?.toLocaleString()}</Typography>
                        </Box>
                      </Grid>
                    )}
                   {quoteResult.breakdown?.adjustments?.length > 0 && (
  <>
    <Grid item xs={12}><Divider sx={{ my: 1 }} /><Typography variant="body2" fontWeight={600} color="text.secondary">Ajustes por Customización:</Typography></Grid>
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

                {/* Opciones seleccionadas */}
                {customizationData && (
                  <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight={700} mb={2}>Opciones Seleccionadas:</Typography>
                    <Grid container spacing={1}>
                      {Object.entries(customizationData.selectedOptions).map(([level, option]) => (
                        <Grid item xs={12} sm={6} key={level}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CheckCircle fontSize="small" color="success" />
                            <Typography variant="body2"><strong>{level}:</strong> {option}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                )}

                {/* Acciones */}
                <Box display="flex" gap={2} justifyContent="center">
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<ArrowBack />}
                    onClick={() => { setCurrentStep(1); setQuoteResult(null); setError(null) }}
                    sx={{ px: 4, py: 1.5, fontFamily: '"Poppins", sans-serif', textTransform: 'none', borderRadius: 3 }}
                  >
                    Modificar
                  </Button>
                  {isAuthenticated ? (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<CheckCircle />}
                      onClick={() => { setCurrentStep(3); setResidentExpanded(true) }}
                      sx={{ px: 4, py: 1.5, fontFamily: '"Poppins", sans-serif', textTransform: 'none', borderRadius: 3 }}
                    >
                      Asignar Residente
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/login')}
                      sx={{ px: 4, py: 1.5, fontFamily: '"Poppins", sans-serif', textTransform: 'none', borderRadius: 3 }}
                    >
                      Iniciar Sesión para Continuar
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            {/* Step 3: Asignar residente */}
            {currentStep === 3 && (
              <Box>
                <ResidentAssignment
                  expanded={residentExpanded}
                  onToggle={() => setResidentExpanded(!residentExpanded)}
                />
                <Box mt={3} display="flex" justifyContent="center">
                  <Button
                    variant="outlined"
                    onClick={handleStartOver}
                    sx={{ fontFamily: '"Poppins", sans-serif', textTransform: 'none' }}
                  >
                    Nueva Cotización
                  </Button>
                </Box>
              </Box>
            )}

          </Grid>

          {/* Columna PriceCalculator */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 24 }}>
              <PriceCalculator onCreatePropertyClick={() => setCurrentStep(3)} />
            </Box>
          </Grid>

        </Grid>
      </Paper>
    </Container>
  )
}

const GetYourQuote = () => (
  <PropertyQuoteProvider >
    <GetYourQuoteContent />
  </PropertyQuoteProvider>
)

export default GetYourQuote