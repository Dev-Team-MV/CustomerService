// @shared/components/Resource/MyResource.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Grid,
  Alert,
  Button,
  Chip,
  Typography,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'

import { useAuth } from '@shared/context/AuthContext'
import { useResource } from '@shared/hooks/useResource'
import Loader from '@shared/components/Loader'
import PageSection from '@shared/components/PageSection'
import ResourceCard from './ResourceCard'
import FinancialHeader from './FinancialHeader'
import ConstructionTab from './Tabs/ConstructionTab'
import PaymentTab from './Tabs/PaymentTab'
import ResourceDetailHeader from './ResourceDetailHeader'

export const MyResource = ({ resourceConfig, resourceType }) => {
  const { t } = useTranslation([resourceConfig.i18n.namespace, 'common'])
  const { user } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()

  const themedConfig = {
    ...resourceConfig,
    colors: {
      primary:    theme.palette.primary.main,
      secondary:  theme.palette.secondary.main,
      accent:     theme.palette.warning?.main  || resourceConfig.colors.accent,
      border:     theme.palette.divider        || resourceConfig.colors.border,
      gradient:   `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
      // Light accent for numbers/icons on dark stat cards — use chipAdmin color if available
      cardAccent: theme.palette.chipAdmin?.color || '#8CA551',
    }
  }

  const {
    loading,
    error,
    items,
    financialSummary,
    selectedItem,
    itemDetails,
    phases,
    loadingPhases,
    payloads,
    loadingPayloads,
    hoveredCard,
    setHoveredCard,
    selectItem,
    deselectItem,
    fetchPayloads
  } = useResource(resourceConfig)

  // Early returns
  if (loading && items.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <Loader
          size="large"
          message={t(`${resourceConfig.i18n.namespace}:${resourceConfig.i18n.keys.loading}`)}
          fullHeight
        />
      </Box>
    )
  }

  if (error && items.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', p: 4 }}>
        <Container maxWidth="md">
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
          >
            {t(`${resourceConfig.i18n.namespace}:${resourceConfig.i18n.keys.goToDashboard}`)}
          </Button>
        </Container>
      </Box>
    )
  }

  if (items.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', p: 4 }}>
        <Container maxWidth="md">
          <Alert severity="info" sx={{ mb: 3 }}>
            {t(`${resourceConfig.i18n.namespace}:${resourceConfig.i18n.keys.noItems}`)}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
          >
            {t(`${resourceConfig.i18n.namespace}:${resourceConfig.i18n.keys.goToDashboard}`)}
          </Button>
        </Container>
      </Box>
    )
  }

  // Main render
  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* ── Financial Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box sx={{ px: { xs: 3, md: 6 }, pt: { xs: 4, md: 5 }, pb: 4 }}>
          <FinancialHeader
            financialSummary={financialSummary}
            user={user}
            config={themedConfig}
            t={t}
          />
        </Box>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Grid View */}
        {!selectedItem && (() => {
          const selectText  = t(`${resourceConfig.i18n.namespace}:${resourceConfig.i18n.keys.selectTitle}`)
          const selectWords = selectText.split(' ')
          const firstWord   = selectWords[0]
          const restWords   = selectWords.slice(1).join(' ')
          const countLabel  = `${items.length} ${t(`${resourceConfig.i18n.namespace}:${items.length === 1 ? resourceConfig.i18n.keys.property : resourceConfig.i18n.keys.properties}`)}`
          return (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <PageSection
                title={firstWord}
                bold={restWords}
                topBorderColor={themedConfig.colors.primary}
                dividerColor="#d6ddc9"
                primaryColor={themedConfig.colors.primary}
                bgcolor="white"
                contentPy={4}
                mt={0}
                description={
                  <Chip
                    label={countLabel}
                    sx={{
                      bgcolor: themedConfig.colors.primary,
                      color: 'white',
                      fontWeight: 700,
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '0.8rem',
                      px: 1,
                      height: 32,
                      borderRadius: 2,
                    }}
                  />
                }
              >
                <Grid container spacing={3}>
                  {items.map((item) => {
                    const transformedResource = resourceConfig.transformers.toCard(item)
                    return (
                      <Grid item xs={12} md={6} lg={4} key={item._id}>
                        <ResourceCard
                          resource={transformedResource}
                          config={themedConfig}
                          hovered={hoveredCard === item._id}
                          onHoverStart={() => setHoveredCard(item._id)}
                          onHoverEnd={() => setHoveredCard(null)}
                          onClick={() => selectItem(item._id)}
                        />
                      </Grid>
                    )
                  })}
                </Grid>
              </PageSection>
            </motion.div>
          )
        })()}

        {/* Detail View */}
        {selectedItem && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <Box sx={{ px: { xs: 3, md: 6 } }}>
              {/* Back button */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
                  onClick={deselectItem}
                  sx={{
                    mb: 3,
                    color: themedConfig.colors.primary,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    px: 2.5,
                    py: 1,
                    borderRadius: '50px',
                    border: `1.5px solid ${themedConfig.colors.primary}40`,
                    bgcolor: 'white',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      bgcolor: themedConfig.colors.primary,
                      color: 'white',
                      borderColor: themedConfig.colors.primary,
                    }
                  }}
                >
                  {t(`${resourceConfig.i18n.namespace}:${resourceConfig.i18n.keys.backButton}`)}
                </Button>
              </motion.div>

              {itemDetails && (
                <>
                  {/* ── Property summary card ── */}
                  <ResourceDetailHeader
                    details={itemDetails}
                    resourceType={resourceType}
                    config={themedConfig}
                  />

                  {/* ── 01 Construction Progress ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Box
                      sx={{
                        bgcolor: '#eef2e8',
                        borderRadius: '16px',
                        mb: 2,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Numbered header */}
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        gap={3}
                        sx={{ px: { xs: 3, md: 4 }, pt: 3, pb: 2.5 }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: '3rem', md: '4rem' },
                            fontWeight: 300,
                            color: themedConfig.colors.primary,
                            fontFamily: '"DM Sans", sans-serif',
                            lineHeight: 1,
                            letterSpacing: '-2px',
                            flexShrink: 0,
                          }}
                        >
                          01
                        </Typography>
                        <Box pt={0.5}>
                          <Typography
                            sx={{
                              fontSize: '1.1rem',
                              fontWeight: 700,
                              color: themedConfig.colors.primary,
                              fontFamily: '"DM Sans", sans-serif',
                              lineHeight: 1.2,
                            }}
                          >
                            {t(`${resourceConfig.i18n.namespace}:${resourceConfig.i18n.keys.constructionTab}`)}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.82rem',
                              color: '#706f6f',
                              fontFamily: '"DM Sans", sans-serif',
                              mt: 0.3,
                            }}
                          >
                            Track each phase of your property construction.
                          </Typography>
                        </Box>
                      </Box>
                      {/* Content */}
                      <Box sx={{ bgcolor: 'white', borderRadius: '0 0 16px 16px' }}>
                        <ConstructionTab
                          resourceId={selectedItem}
                          resourceType={resourceType}
                          config={themedConfig}
                        />
                      </Box>
                    </Box>
                  </motion.div>

                  {/* ── 02 Payment Status ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Box
                      sx={{
                        bgcolor: '#eef2e8',
                        borderRadius: '16px',
                        mb: 2,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Numbered header */}
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        gap={3}
                        sx={{ px: { xs: 3, md: 4 }, pt: 3, pb: 2.5 }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: '3rem', md: '4rem' },
                            fontWeight: 300,
                            color: themedConfig.colors.primary,
                            fontFamily: '"DM Sans", sans-serif',
                            lineHeight: 1,
                            letterSpacing: '-2px',
                            flexShrink: 0,
                          }}
                        >
                          02
                        </Typography>
                        <Box pt={0.5}>
                          <Typography
                            sx={{
                              fontSize: '1.1rem',
                              fontWeight: 700,
                              color: themedConfig.colors.primary,
                              fontFamily: '"DM Sans", sans-serif',
                              lineHeight: 1.2,
                            }}
                          >
                            {t(`${resourceConfig.i18n.namespace}:${resourceConfig.i18n.keys.paymentTab}`)}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.82rem',
                              color: '#706f6f',
                              fontFamily: '"DM Sans", sans-serif',
                              mt: 0.3,
                            }}
                          >
                            Manage and track your payment history.
                          </Typography>
                        </Box>
                      </Box>
                      {/* Content */}
                      <Box sx={{ bgcolor: 'white', borderRadius: '0 0 16px 16px' }}>
                        <PaymentTab
                          details={itemDetails}
                          payloads={payloads}
                          loadingPayloads={loadingPayloads}
                          onPaymentUploaded={fetchPayloads}
                          user={user}
                          config={themedConfig}
                          resourceType={resourceType}
                        />
                      </Box>
                    </Box>
                  </motion.div>
                </>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}

MyResource.propTypes = {
  resourceConfig: PropTypes.object.isRequired,
  resourceType: PropTypes.string.isRequired
}

export default MyResource