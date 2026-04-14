import {
  Box, Container, Grid, Stepper, Step, StepLabel,
  Paper, Typography, Alert, IconButton, Divider, useTheme, useMediaQuery
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ApartmentIcon from '@mui/icons-material/Apartment'
import LayersIcon from '@mui/icons-material/Layers'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import TuneIcon from '@mui/icons-material/Tune'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PropertyQuoteProvider, usePropertyBuilding } from '../../context/ProperyQuoteContext'
import BuildingSelector    from './BuildingSelector'
import FloorSelector       from './FloorSelector'
import ApartmentSelector   from './ApartmentSelector'
import ApartmentCustomizer from './ApartmentCustomizer'
import PriceCalculator     from './PriceCalculator'
import ResidentAsignment  from './ResidentAsignment'
import PageHeader          from '@shared/components/PageHeader'

const STEPS = [
  { label: 'building',  icon: ApartmentIcon  },
  { label: 'floor',     icon: LayersIcon     },
  { label: 'apartment', icon: MeetingRoomIcon },
  { label: 'customize', icon: TuneIcon       },
]

const PropertyQuoteContent = ({ projectId }) => {
  const theme = useTheme()
  const isMob = useMediaQuery(theme.breakpoints.down('md'))
  const { t }  = useTranslation(['quote', 'common'])

  const {
    currentStep, isQuoteComplete, error,
    goToPrevStep, setCurrentStep,
  } = usePropertyBuilding()

  const [residentOpen, setResidentOpen] = useState(false)

  const stepComponents = [
    <BuildingSelector   key="building"  projectId={projectId} />,
    <FloorSelector      key="floor"     />,
    <ApartmentSelector  key="apartment" />,
    <ApartmentCustomizer key="customize" />,
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, pb: 6 }}>
      <Container maxWidth="xl">
        {/* Back button */}
        <Box pt={3} pb={1} display="flex" alignItems="center">
          <IconButton
            onClick={goToPrevStep}
            disabled={currentStep === 0}
            sx={{ mr: 1, bgcolor: '#f5f5f5', borderRadius: 2, border: '1px solid #e0e0e0', '&:hover': { bgcolor: '#e9e9e9' } }}
          >
            <ArrowBackIcon sx={{ color: currentStep === 0 ? '#ccc' : theme.palette.primary.main }} />
          </IconButton>
          <Typography variant="h6" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700 }}>
            {t('quote:back', 'Back')}
          </Typography>
        </Box>

        <Box pb={2}>
          <PageHeader
            icon={ApartmentIcon}
            title={t('quote:title', 'Get Your Quote')}
            subtitle={t('quote:subtitle', 'Select your building, floor, apartment and customize your future home')}
          />
        </Box>

        {/* Stepper */}
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <Stepper activeStep={currentStep} alternativeLabel={!isMob} orientation={isMob ? 'vertical' : 'horizontal'}>
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
                          width: 36, height: 36, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: isCompleted ? theme.palette.secondary.main : isActive ? theme.palette.primary.main : theme.palette.divider,
                          color: isCompleted || isActive ? '#fff' : '#9e9e9e',
                          transition: 'all 0.3s ease',
                          boxShadow: isActive ? `0 4px 12px ${theme.palette.primary.main}33` : 'none',
                          cursor: isCompleted ? 'pointer' : 'default',
                        }}
                        onClick={() => isCompleted && setCurrentStep(i)}
                      >
                        <Icon sx={{ fontSize: 18 }} />
                      </Box>
                    )}
                  >
                    <Typography
                      sx={{
                        fontFamily: '"Poppins", sans-serif', fontSize: '0.75rem',
                        fontWeight: isActive ? 700 : isCompleted ? 600 : 400,
                        color: isActive ? theme.palette.primary.main : isCompleted ? theme.palette.secondary.main : '#9e9e9e',
                        letterSpacing: '0.5px', cursor: isCompleted ? 'pointer' : 'default',
                      }}
                      onClick={() => isCompleted && setCurrentStep(i)}
                    >
                      {t(`quote:step.${step.label}`, step.label.charAt(0).toUpperCase() + step.label.slice(1))}
                    </Typography>
                  </StepLabel>
                </Step>
              )
            })}
          </Stepper>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Grid container spacing={3}>
          {/* LEFT — Step content */}
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
                </Box>
              </motion.div>
            </AnimatePresence>

            <Box mt={4}>
              <ResidentAsignment
                expanded={residentOpen}
                onToggle={() => isQuoteComplete && setResidentOpen(prev => !prev)}
              />
            </Box>
          </Grid>

          {/* RIGHT — Price calculator sticky */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: { md: 'sticky' }, top: { md: 24 }, maxHeight: { md: 'calc(100vh - 48px)' }, overflowY: { md: 'auto' }, pr: { md: 1 } }}>
              <PriceCalculator />
              {currentStep === 3 && !isMob && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <ApartmentCustomizer />
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

const PropertyQuotePage = ({ projectSlug, projectId }) => (
  <PropertyQuoteProvider projectSlug={projectSlug} projectId={projectId}>
    <PropertyQuoteContent projectId={projectId} />
  </PropertyQuoteProvider>
)

export default PropertyQuotePage