import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box, Container, Grid, Paper, Alert,
  Button, Chip, Typography, Tabs, Tab
} from '@mui/material'
import {
  Home, Construction, Payment,
  Visibility, ArrowBack, AutoAwesome
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

import { useAuth } from '../context/AuthContext'
import useMyProperty from '../hooks/useMyProperty'

import Loader from '../components/Loader'
import PropertyCard from '../components/myProperty/PropertyCard'
import FinancialHeader from '../components/myProperty/FinancialHeader'
import PropertyDetailHeader from '../components/myProperty/PropertyDetailHeader'
import ConstructionTab from '../components/myProperty/ConstructionTab'
import PaymentTab from '../components/myProperty/PaymentTab'
import PropertyDetailsTab from '../components/myProperty/propertyDetails'

// ── constante única de negocio ─────────────────────────────
const MODEL_10_ID = '6977c7bbd1f24768968719de'

// ── MyProperty ─────────────────────────────────────────────
const MyProperty = () => {
  const { t }    = useTranslation(['myProperty', 'common'])
  const { user } = useAuth()
  const navigate = useNavigate()

  const {
    loading, error,
    properties, financialSummary,
    selectedProperty, propertyDetails,
    phases, loadingPhases,
    payloads, loadingPayloads,
    activeTab, setActiveTab,
    hoveredCard, setHoveredCard,
    isModel10,
    selectProperty,
    deselectProperty,
    fetchPayloads,
  } = useMyProperty()

  const balconyLabels = isModel10
    ? { chipLabel: t('myProperty:study'),   icon: Home,       color: '#2196f3' }
    : { chipLabel: t('myProperty:balcony'), icon: AutoAwesome, color: '#4a7c59' }

  // ── early returns ──────────────────────────────────────────
  if (loading && properties.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <Loader size="large" message={t('myProperty:loading')} fullHeight />
      </Box>
    )
  }

  if (error && properties.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', p: 4 }}>
        <Container maxWidth="md">
          <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>
          <Button variant="contained" startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
            {t('myProperty:goToDashboard')}
          </Button>
        </Container>
      </Box>
    )
  }

  if (properties.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', p: 4 }}>
        <Container maxWidth="md">
          <Alert severity="info" sx={{ mb: 3 }}>{t('myProperty:noProperties')}</Alert>
          <Button variant="contained" startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
            {t('myProperty:goToDashboard')}
          </Button>
        </Container>
      </Box>
    )
  }

  // ── main render ────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', p: 3 }}>
      <Container maxWidth="xl">

        {/* FINANCIAL HEADER — siempre visible */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
          <FinancialHeader financialSummary={financialSummary} user={user} t={t} />
        </motion.div>

        {/* PROPERTY SELECTOR / DETAIL */}
        <AnimatePresence mode="wait">

          {/* ── GRID DE PROPIEDADES ── */}
          {!selectedProperty && (
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
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <AutoAwesome sx={{ color: '#4a7c59', fontSize: 32 }} />
                  </motion.div>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#2c3e50' }}>
                    {t('myProperty:selectProperty')}
                  </Typography>
                </Box>
                <Chip
                  label={`${properties.length} ${properties.length === 1 ? t('myProperty:property') : t('myProperty:properties')}`}
                  sx={{ bgcolor: '#4a7c59', color: 'white', fontWeight: 700, px: 2, height: 36 }}
                />
              </Box>

              <Grid container spacing={3}>
                {properties.map(property => (
                  <Grid item xs={12} md={6} lg={4} key={property._id}>
                    <PropertyCard
                      property={property}
                      hovered={hoveredCard === property._id}
                      onHoverStart={() => setHoveredCard(property._id)}
                      onHoverEnd={() => setHoveredCard(null)}
                      onClick={() => selectProperty(property._id)}
                    />
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}

          {/* ── DETALLE DE PROPIEDAD ── */}
          {selectedProperty && (
            <motion.div
              key="property-detail"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              {/* Back button */}
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={deselectProperty}
                  sx={{
                    mb: 3, color: '#333F1F', fontWeight: 700,
                    textTransform: 'none', fontSize: '1rem',
                    px: 3, py: 1.2, borderRadius: 3,
                    border: '2px solid #8CA551', bgcolor: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#8CA551', color: 'white',
                      transform: 'translateX(-8px)',
                      boxShadow: '0 8px 20px rgba(74,124,89,0.3)'
                    }
                  }}
                >
                  {t('myProperty:backToProperties')}
                </Button>
              </motion.div>

              {propertyDetails && (
                <>
                  {/* Property detail header */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <PropertyDetailHeader
                      propertyDetails={propertyDetails}
                      isModel10={isModel10}
                      balconyLabels={balconyLabels}
                    />
                  </motion.div>

                  {/* Tabs navigation */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Paper elevation={0} sx={{
                      mb: 3, background: 'white',
                      borderRadius: { xs: 3, md: 5 },
                      overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                    }}>
                      <Tabs
                        value={activeTab}
                        onChange={(_, v) => setActiveTab(v)}
                        variant="fullWidth"
                        sx={{
                          '& .MuiTab-root': {
                            py: { xs: 2, sm: 2.5, md: 3 },
                            px: { xs: 1.5, sm: 2, md: 3 },
                            fontWeight: 700,
                            fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1rem' },
                            textTransform: 'none',
                            color: '#6c757d',
                            transition: 'all 0.3s ease',
                            minHeight: { xs: 56, sm: 64, md: 72 },
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: { xs: 0.3, sm: 1 },
                            '&.Mui-selected': { color: '#4a7c59' },
                            '&:hover': { bgcolor: 'rgba(74,124,89,0.05)' },
                            '& .MuiSvgIcon-root': { fontSize: { xs: 16, sm: 20, md: 24 } }
                          },
                          '& .MuiTabs-indicator': {
                            height: { xs: 3, md: 4 },
                            borderRadius: '4px 4px 0 0',
                            bgcolor: '#4a7c59'
                          }
                        }}
                      >
                        <Tab icon={<Construction />} label={t('myProperty:constructionTab')} iconPosition="start" />
                        <Tab icon={<Payment />}      label={t('myProperty:paymentTab')}      iconPosition="start" />
                        <Tab icon={<Visibility />}   label={t('myProperty:detailsTab')}      iconPosition="start" />
                      </Tabs>
                    </Paper>
                  </motion.div>

                  {/* Tab content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.4 }}
                    >
                      {activeTab === 0 && (
                        <ConstructionTab phases={phases} loadingPhases={loadingPhases} />
                      )}
                      {activeTab === 1 && (
                        <PaymentTab
                          propertyDetails={propertyDetails}
                          payloads={payloads}
                          loadingPayloads={loadingPayloads}
                          onPaymentUploaded={fetchPayloads}
                          user={user}
                        />
                      )}
                      {activeTab === 2 && (
                        <PropertyDetailsTab
                          propertyDetails={propertyDetails}
                          isModel10={isModel10}
                          balconyLabels={balconyLabels}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </Container>
    </Box>
  )
}

export default MyProperty