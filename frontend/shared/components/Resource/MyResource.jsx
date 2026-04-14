// @shared/components/Resource/MyResource.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Container,
  Grid,
  Paper,
  Alert,
  Button,
  Chip,
  Typography,
  Tabs,
  Tab
} from '@mui/material'
import {
  Construction,
  Payment,
  Visibility,
  ArrowBack,
  AutoAwesome
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'

import { useAuth } from '@shared/context/AuthContext'
import { useResource } from '@shared/hooks/useResource'
import Loader from '@shared/components/Loader'
import ResourceCard from './ResourceCard'
import FinancialHeader from './FinancialHeader'
import ConstructionTab from './Tabs/ConstructionTab'
import PaymentTab from './Tabs/PaymentTab'
import DetailsTab from './Tabs/DetailsTab'
import ResourceDetailHeader from './ResourceDetailHeader'

export const MyResource = ({ resourceConfig, resourceType }) => {
  const { t } = useTranslation([resourceConfig.i18n.namespace, 'common'])
  const { user } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()

  const themedConfig = {
    ...resourceConfig,
    colors: {
      primary:   theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      accent:    theme.palette.warning?.main  || resourceConfig.colors.accent,
      border:    theme.palette.divider        || resourceConfig.colors.border,
      gradient:  `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`
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
    activeTab,
    setActiveTab,
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
    <Box sx={{ minHeight: '100vh', p: 3 }}>
      <Container maxWidth="xl">
        {/* Financial Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <FinancialHeader
            financialSummary={financialSummary}
            user={user}
            config={themedConfig}
            t={t}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Grid View */}
          {!selectedItem && (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={4}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <AutoAwesome
                      sx={{ color: themedConfig.colors.secondary, fontSize: 32 }}
                    />
                  </motion.div>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ color: '#2c3e50' }}
                  >
                    {t(`${resourceConfig.i18n.namespace}:${resourceConfig.i18n.keys.selectTitle}`)}
                  </Typography>
                </Box>
                <Chip
                  label={`${items.length} ${t(
                    `${resourceConfig.i18n.namespace}:${
                      items.length === 1
                        ? resourceConfig.i18n.keys.property
                        : resourceConfig.i18n.keys.properties
                    }`
                  )}`}
                  sx={{
                    bgcolor: themedConfig.colors.secondary,
                    color: 'white',
                    fontWeight: 700,
                    px: 2,
                    height: 36
                  }}
                />
              </Box>

              <Grid container spacing={3}>
{items.map((item) => {
  const transformedResource = resourceConfig.transformers.toCard(item)
  console.log(`🎴 [MyResource:${resourceConfig.type}] Original item:`, item)
  console.log(`🎴 [MyResource:${resourceConfig.type}] Transformed card data:`, transformedResource)
  
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
            </motion.div>
          )}

          {/* Detail View */}
          {selectedItem && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              {/* Back button */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  startIcon={<ArrowBack />}
                  onClick={deselectItem}
                  sx={{
                    mb: 3,
                    color: themedConfig.colors.primary,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    px: 3,
                    py: 1.2,
                    borderRadius: 3,
                    border: `2px solid ${themedConfig.colors.secondary}`,
                    bgcolor: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: themedConfig.colors.secondary,
                      color: 'white',
                      transform: 'translateX(-8px)',
                      boxShadow: `0 8px 20px ${themedConfig.colors.secondary}4D`
                    }
                  }}
                >
                  {t(`${resourceConfig.i18n.namespace}:${resourceConfig.i18n.keys.backButton}`)}
                </Button>
              </motion.div>

              {itemDetails && (
                <>
                    {/* Resource Detail Header */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <ResourceDetailHeader
        details={itemDetails}
        resourceType={resourceType}
        config={themedConfig}
      />
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
                        borderRadius: { xs: 3, md: 5 },
                        overflow: 'hidden',
                        border: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                      }}
                    >
                      <Tabs
                        value={activeTab}
                        onChange={(_, v) => setActiveTab(v)}
                        variant="fullWidth"
                        sx={{
                          '& .MuiTab-root': {
                            py: { xs: 2, sm: 2.5, md: 3 },
                            fontWeight: 700,
                            textTransform: 'none',
                            '&.Mui-selected': {
                              color: themedConfig.colors.secondary
                            }
                          },
                          '& .MuiTabs-indicator': {
                            bgcolor: themedConfig.colors.secondary
                          }
                        }}
                      >
                        <Tab
                          icon={<Construction />}
                          label={t(`${resourceConfig.i18n.namespace}:${resourceConfig.i18n.keys.constructionTab}`)}
                          iconPosition="start"
                        />
                        <Tab
                          icon={<Payment />}
                          label={t(`${resourceConfig.i18n.namespace}:${resourceConfig.i18n.keys.paymentTab}`)}
                          iconPosition="start"
                        />
                        <Tab
                          icon={<Visibility />}
                          label={t(`${resourceConfig.i18n.namespace}:${resourceConfig.i18n.keys.detailsTab}`)}
                          iconPosition="start"
                        />
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
                      {activeTab === 0 && (
                        <ConstructionTab
                          resourceId={selectedItem}
                          resourceType={resourceType}
                          config={themedConfig}
                        />
                      )}
                      {activeTab === 1 && (
                        <PaymentTab
                          details={itemDetails}
                          payloads={payloads}
                          loadingPayloads={loadingPayloads}
                          onPaymentUploaded={fetchPayloads}
                          user={user}
                          config={themedConfig}
                          resourceType={resourceType}
                        />
                      )}
                      {activeTab === 2 && (
                        <DetailsTab
                          details={itemDetails}
                          config={themedConfig}
                          resourceType={resourceType}
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

MyResource.propTypes = {
  resourceConfig: PropTypes.object.isRequired,
  resourceType: PropTypes.string.isRequired
}

export default MyResource