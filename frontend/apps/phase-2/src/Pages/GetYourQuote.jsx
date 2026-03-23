import {
  Box, Container, Grid, Stepper, Step, StepLabel,
  Paper, Typography, Button, useTheme, useMediaQuery,
  Alert, CircularProgress, IconButton, Divider
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ApartmentIcon from '@mui/icons-material/Apartment'
import LayersIcon from '@mui/icons-material/Layers'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import TuneIcon from '@mui/icons-material/Tune'
import SendIcon from '@mui/icons-material/Send'
import { motion, AnimatePresence } from 'framer-motion'

import { PropertyBuildingProvider, usePropertyBuilding } from '../Context/PropertyBuildingContext'
import BuildingSelector   from '../Components/UI/GetYourQuote/BuildingSelector'
import FloorSelector      from '../Components/UI/GetYourQuote/FloorSelector'
import ApartmentSelector  from '../Components/UI/GetYourQuote/ApartmentSelector'
import ApartmentCustomizer from '../Components/UI/GetYourQuote/ApartmentCustomizer'
import QuoteSummaryCard   from '../Components/UI/GetYourQuote/QuoteSummaryCard'
import PriceCalculator    from '../Components/UI/GetYourQuote/PriceCalculatorPhase2'
import PageHeader         from '@shared/components/PageHeader'

// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Building',   icon: ApartmentIcon  },
  { label: 'Floor',      icon: LayersIcon     },
  { label: 'Apartment',  icon: MeetingRoomIcon },
  { label: 'Customize',  icon: TuneIcon       },
]

const GetYourQuoteContent = () => {
  const theme   = useTheme()
  const isMob   = useMediaQuery(theme.breakpoints.down('md'))

  const {
    currentStep,
    isQuoteComplete,
    selectedBuilding,
    selectedFloor,
    selectedApartment,
    apartmentType,
    resetQuote,
    loadingBuildings,
    error,
    goToPrevStep, // Debe estar en tu contexto, si no, agrégalo
  } = usePropertyBuilding()

  const stepComponents = [
    <BuildingSelector    key="building"   />,
    <FloorSelector       key="floor"      />,
    <ApartmentSelector   key="apartment"  />,
    <ApartmentCustomizer key="customize"  />,
  ]

return (
  <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, pb: 6 }}>
    <Container maxWidth="xl">
      {/* Back button */}
      <Box pt={3} pb={1} display="flex" alignItems="center">
        <IconButton
          onClick={goToPrevStep}
          disabled={currentStep === 0}
          sx={{
            mr: 1,
            bgcolor: '#f5f5f5',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            '&:hover': { bgcolor: '#e9e9e9' }
          }}
        >
          <ArrowBackIcon sx={{ color: currentStep === 0 ? '#ccc' : '#333F1F' }} />
        </IconButton>
        <Typography variant="h6" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700 }}>
          Back
        </Typography>
      </Box>

      {/* Page header */}
      <Box pb={2}>
        <PageHeader
          icon={ApartmentIcon}
          title="Get Your Quote"
          subtitle="Select your building, floor, apartment and customize your future home"
        />
      </Box>

      {/* Stepper */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 4,
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        <Stepper
          activeStep={currentStep}
          alternativeLabel={!isMob}
          orientation={isMob ? 'vertical' : 'horizontal'}
        >
          {STEPS.map((step, i) => {
            const Icon = step.icon
            const isCompleted = i < currentStep
            const isActive    = i === currentStep
            return (
              <Step key={step.label} completed={isCompleted}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isCompleted
                          ? '#8CA551'
                          : isActive
                            ? '#333F1F'
                            : '#e0e0e0',
                        color: isCompleted || isActive ? '#fff' : '#9e9e9e',
                        transition: 'all 0.3s ease',
                        boxShadow: isActive ? '0 4px 12px rgba(51,63,31,0.3)' : 'none',
                        cursor: isCompleted ? 'pointer' : 'default'
                      }}
                      onClick={() => {
                        if (isCompleted && typeof setCurrentStep === 'function') {
                          setCurrentStep(i)
                        }
                      }}
                    >
                      <Icon sx={{ fontSize: 18 }} />
                    </Box>
                  )}
                >
                  <Typography
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 700 : isCompleted ? 600 : 400,
                      color: isActive ? '#333F1F' : isCompleted ? '#8CA551' : '#9e9e9e',
                      letterSpacing: '0.5px',
                      cursor: isCompleted ? 'pointer' : 'default'
                    }}
                    onClick={() => {
                      if (isCompleted && typeof setCurrentStep === 'function') setCurrentStep(i)
                    }}
                  >
                    {step.label}
                  </Typography>
                </StepLabel>
              </Step>
            )
          })}
        </Stepper>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
      )}

      {/* Two-column layout */}
      <Grid container spacing={3}>
        {/* LEFT — Main step content */}
        <Grid item xs={12} md={8}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <Box display="flex" flexDirection="column" gap={3}>
                {stepComponents[currentStep]}
                {currentStep === 3 && isMob && <ApartmentCustomizer />}
              </Box>
            </motion.div>
          </AnimatePresence>
        </Grid>

        {/* RIGHT — Mejor distribución y scroll solo aquí */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              position: { md: 'sticky' },
              top: { md: 24 },
              height: { md: 'calc(100vh - 48px)' },
              maxHeight: { md: 'calc(100vh - 48px)' },
              overflowY: { md: 'auto' },
              pr: { md: 1 }
            }}
          >
            {/* 1. Resumen compacto arriba */}
            <QuoteSummaryCard compact />

            {/* 2. Calculadora con todos los detalles */}
            <PriceCalculator />

            {/* 3. Customizer solo en el último paso */}
            {currentStep === 3 && !isMob && (
              <>
                <Divider sx={{ my: 2 }} />
                <ApartmentCustomizer />
              </>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Quote complete CTA */}
      {isQuoteComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Box mt={4} display="flex" justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<SendIcon />}
              sx={{
                bgcolor: '#333F1F',
                color: '#fff',
                py: 2,
                px: 5,
                borderRadius: 3,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                fontFamily: '"Poppins", sans-serif',
                boxShadow: '0 8px 24px rgba(51,63,31,0.3)',
                '&:hover': {
                  bgcolor: '#8CA551',
                  boxShadow: '0 12px 28px rgba(140,165,81,0.35)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.25s ease',
              }}
              onClick={() => {
                alert('Quote complete! Send/save logic coming soon.')
              }}
            >
              Generate & Send Quote
            </Button>
          </Box>
        </motion.div>
      )}
    </Container>
  </Box>
)
}

const GetYourQuote = () => (
  <PropertyBuildingProvider>
    <GetYourQuoteContent />
  </PropertyBuildingProvider>
)

export default GetYourQuote