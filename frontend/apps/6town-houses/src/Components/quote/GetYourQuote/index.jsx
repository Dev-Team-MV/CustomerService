import { Box, Container, Alert, CircularProgress, Grid } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { PropertyQuoteProvider } from '@shared/context/ProperyQuoteContext'
import LotSelector from '../LotSelector/index'
import HouseCustomizer from '../HouseCustomizer/index'
import ResidentAssignment from '@shared/components/PropertyQuote/ResidentAsignment'
import QuoteHeader from './QuoteHeader'
import QuoteStepper from './QuoteStepper'
import QuoteResultPanel from './QuoteResultPanel'
import QuoteSidebar from './QuoteSidebar'
import useQuoteFlow from '../../../hooks/useQuoteFlow'

const GetYourQuoteContent = () => {
  const theme = useTheme()
  
  const {
    currentStep,
    selectedBuilding,
    quoteResult,
    customizationData,
    error,
    residentExpanded,
    modelFloors,
    catalogConfig,
    loadingConfig,
    facadeEnabled,
    isAuthenticated,
    STEPS,
    projectId,
    handleBuildingSelect,
    handleCustomizationComplete,
    handleOptionsChange,
    handleContinue,
    handleBack,
    setResidentExpanded,
    setCurrentStep,
    setSelectedBuilding,
    setError
  } = useQuoteFlow()
  
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
        <Alert severity="error">Error loading configuration</Alert>
      </Container>
    )
  }
  
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, py: 4 }}>
      <QuoteHeader />
      <QuoteStepper currentStep={currentStep} steps={STEPS} />
      
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Container 
          maxWidth="xl" 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden', 
            px: 3, 
            py: 2 
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, flexShrink: 0 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
            {/* Columna Principal (Izquierda) - CON SCROLL */}
            <Grid 
              item 
              xs={12} 
              lg={8} 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                minHeight: 0,
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  flex: 1,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  pr: 1,
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-track': { 
                    background: '#f1f1f1', 
                    borderRadius: '10px' 
                  },
                  '&::-webkit-scrollbar-thumb': { 
                    background: theme.palette.primary.main, 
                    borderRadius: '10px'
                  }
                }}
              >
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
                    onBack={() => { 
                      setCurrentStep(0)
                      setSelectedBuilding(null)
                      setError(null)
                    }}
                    onOptionsChange={handleOptionsChange}
                  />
                )}

                {/* Paso 3: Quote Result */}
                {currentStep === 2 && quoteResult && (
                  <QuoteResultPanel
                    quoteResult={quoteResult}
                    customizationData={customizationData}
                    catalogConfig={catalogConfig}
                    facadeEnabled={facadeEnabled}
                  />
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

            {/* Columna Sidebar (Derecha) - PriceCalculator FIJO */}
            <QuoteSidebar
              currentStep={currentStep}
              isAuthenticated={isAuthenticated}
              onBack={handleBack}
              onContinue={handleContinue}
            />
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