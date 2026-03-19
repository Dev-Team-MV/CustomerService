import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Button,
  CircularProgress,
  Typography,
  IconButton,
  Paper
} from '@mui/material'
import {
  Construction,
  Payment,
  Visibility,
  AccountBalance,
  Close
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import api from '../../services/api'
import PageHeader from '../PageHeader'
import DataTable from '../table/DataTable'
import EmptyState from '../table/EmptyState'
import PayloadDialog from '../payloads/createPayload'
import AdminPropertyDetails from './AdminPropertyDetails'
import { ConstructionPhasesContent } from '../ConstructionPhasesContent'
import ModalWrapper from '../../constants/ModalWrapper'

// ── Hook y columnas centralizados ─────────────────────────
import { usePayloads } from '../../hooks/usePayloads'
import { usePayloadColumns } from '../../constants/Columns/payloads'

const PropertyDetailsModal = ({ open, onClose, property, isAdmin }) => {
  const { t } = useTranslation(['myProperty', 'common'])
  const [activeTab, setActiveTab] = useState(0)
  const [propertyDetails, setPropertyDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payloads, setPayloads] = useState([])
  const [loadingPayloads, setLoadingPayloads] = useState(false)

  // ── Model constants ───────────────────────────────────────
  const MODEL_10_ID = "6977c7bbd1f24768968719de"
  const isModel10 = propertyDetails?.model?._id === MODEL_10_ID
  const balconyLabels = isModel10
    ? { chipLabel: "Estudio", icon: Visibility, color: "#2196f3" }
    : { chipLabel: "Balcony", icon: Visibility, color: "#4a7c59" }

  // ── Hook con handlers de payloads ─────────────────────────
  const {
    openDialog,
    selectedPayload,
    formData,
    setFormData,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handleApprove,
    handleReject,
    handleDownload,
  } = usePayloads()

  // ── Fetch data ────────────────────────────────────────────
  useEffect(() => {
    if (open && property?._id) {
      fetchPropertyDetails()
      fetchPayloads()
    }
  }, [open, property?._id])

  const fetchPropertyDetails = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/properties/${property._id}`)
      setPropertyDetails(res.data)
    } catch {
      setPropertyDetails(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayloads = async () => {
    setLoadingPayloads(true)
    try {
      const res = await api.get(`/payloads?property=${property._id}`)
      setPayloads(res.data)
    } catch {
      setPayloads([])
    } finally {
      setLoadingPayloads(false)
    }
  }

  const handleApproveWithRefresh = async (payload, e) => {
    await handleApprove(payload, e)
    await fetchPropertyDetails()
    await fetchPayloads()
  }

  const handleRejectWithRefresh = async (payload, e) => {
    await handleReject(payload, e)
    await fetchPropertyDetails()
    await fetchPayloads()
  }

  // ── Columnas reutilizables ────────────────────────────────
  const paymentColumns = usePayloadColumns({
    t,
    onEdit: handleOpenDialog,
    onApprove: handleApproveWithRefresh,
    onReject: handleRejectWithRefresh,
    onDownload: handleDownload,
  })

  // ── Submit handler ────────────────────────────────────────
  const handlePayloadSubmit = async () => {
    await handleSubmit()
    fetchPayloads()
    fetchPropertyDetails()
  }

  // ── Guard ─────────────────────────────────────────────────
  if (!property) return null

  // ── Render ────────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 4 },
          maxHeight: { xs: '100vh', sm: '90vh' },
          m: { xs: 0, sm: 2 },
          width: { xs: '100%', sm: 'calc(100% - 32px)' }
        }
      }}
    >
      {/* ── Header sticky ────────────────────────────────── */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'white',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          p: { xs: 2, sm: 3 }
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
        >
          <Box display="flex" alignItems="center" gap={2} flex={1} minWidth={0}>
            <Visibility sx={{ color: '#8CA551', fontSize: { xs: 24, sm: 28 } }} />
            <Box flex={1} minWidth={0}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                {t('propertyDetails')} - {t('lot')} #{property.lot?.number}
              </Typography>
              {propertyDetails?.model && (
                <Typography
                  variant="caption"
                  sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}
                >
                  {propertyDetails.model.model}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: '#706f6f',
              '&:hover': { bgcolor: 'rgba(112,111,111,0.08)', color: '#333F1F' }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress sx={{ color: '#8CA551' }} />
          </Box>
        ) : (
          <>
            {/* ── Tabs ──────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Paper
                elevation={0}
                sx={{
                  m: { xs: 2, sm: 3 },
                  mb: 0,
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
                      px: { xs: 1.5, sm: 2, md: 3 },
                      fontWeight: 700,
                      fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1rem' },
                      textTransform: 'none',
                      color: '#6c757d',
                      transition: 'all 0.3s ease',
                      minHeight: { xs: 56, sm: 64, md: 72 },
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 0.3, sm: 1 },
                      fontFamily: '"Poppins", sans-serif',
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
                  <Tab icon={<Payment />} label={t('paymentStatus')} iconPosition="start" />
                  <Tab icon={<Visibility />} label={t('propertyDetailsTab')} iconPosition="start" />
                  <Tab icon={<Construction />} label={t('constructionPhases')} iconPosition="start" />
                </Tabs>
              </Paper>
            </motion.div>

            {/* ── Tab content ───────────────────────────────── */}
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* ── Tab 0: Payments ────────────────────────── */}
                  {activeTab === 0 && (
                    <Box>
                      <PageHeader
                        icon={AccountBalance}
                        title={t('paymentHistory')}
                        subtitle={t('paymentHistorySubtitle')}
                        actionButton={{
                          label: t('common:addPayment'),
                          onClick: () => {
                            handleOpenDialog()
                            setFormData({
                              property: property?._id || '',
                              amount: '',
                              date: new Date().toISOString().split('T')[0],
                              status: 'pending',
                              type: '',
                              notes: ''
                            })
                          },
                          icon: <AccountBalance />,
                          tooltip: t('common:addNewPayment')
                        }}
                        animateIcon={false}
                        gradientColors={['#333F1F', '#8CA551', '#333F1F']}
                      />
                      <DataTable
                        columns={paymentColumns}
                        data={payloads}
                        loading={loadingPayloads}
                        emptyState={
                          <EmptyState
                            title={t('noPayments')}
                            description={t('noPaymentsDescription')}
                            actionLabel={t('common:addPayment')}
                            onAction={() => {
                              handleOpenDialog()
                              setFormData({
                                property: property?._id || '',
                                amount: '',
                                date: new Date().toISOString().split('T')[0],
                                status: 'pending',
                                type: '',
                                notes: ''
                              })
                            }}
                          />
                        }
                        maxHeight={350}
                      />
                      <PayloadDialog
                        open={openDialog}
                        onClose={handleCloseDialog}
                        onSubmit={handlePayloadSubmit}
                        formData={formData}
                        setFormData={setFormData}
                        properties={[property]}
                        selectedPayload={selectedPayload}
                      />
                    </Box>
                  )}

                  {/* ── Tab 1: Property Details ─────────────────── */}
                  {activeTab === 1 && propertyDetails && (
                    <AdminPropertyDetails
                      propertyDetails={propertyDetails}
                      isModel10={isModel10}
                      balconyLabels={balconyLabels}
                    />
                  )}
                  {activeTab === 1 && !propertyDetails && (
                    <Box py={6} textAlign="center">
                      <Typography
                        color="error"
                        fontWeight={700}
                        sx={{ fontFamily: '"Poppins", sans-serif' }}
                      >
                        {t('noAccessToDetails')}
                      </Typography>
                    </Box>
                  )}

                  {/* ── Tab 2: Construction ──────────────────────── */}
                  {activeTab === 2 && (
                    <ConstructionPhasesContent property={property} isAdmin={isAdmin} />
                  )}
                </motion.div>
              </AnimatePresence>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: { xs: 2, sm: 3 }, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <Button
          onClick={onClose}
          color="inherit"
          sx={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
            textTransform: 'none'
          }}
        >
          {t('common:close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PropertyDetailsModal