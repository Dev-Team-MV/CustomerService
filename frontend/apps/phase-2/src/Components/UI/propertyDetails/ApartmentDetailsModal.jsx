import { useState, useEffect } from 'react'
import {
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Typography,
  Paper
} from '@mui/material'
import {
  Construction,
  Payment,
  Visibility,
  AccountBalance
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import api from '@shared/services/api'
import PageHeader from '@shared/components/PageHeader'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '@shared/components/table/EmptyState'
import PayloadDialog from '@shared/components/Modals/PayloadDialog'

import { usePayloads } from '@shared/hooks/usePayloads'
import { usePayloadColumns } from '../../../Constants/Columns/payloads'

const paymentTypes = [
  "initial down payment",
  "complementary down payment",
  "monthly payment",
  "additional payment",
  "closing payment"
]

const ApartmentDetailsModal = ({ open, onClose, apartment }) => {
  const { t } = useTranslation(['myProperty', 'common', 'payloads'])
  const [activeTab, setActiveTab] = useState(0)
  const [apartmentDetails, setApartmentDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payloads, setPayloads] = useState([])
  const [loadingPayloads, setLoadingPayloads] = useState(false)

  // Hook para el modal de payloads
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

  useEffect(() => {
    if (open && apartment?._id) {
      fetchApartmentDetails()
      fetchPayloads()
    }
  }, [open, apartment?._id])

  const fetchApartmentDetails = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/apartments/${apartment._id}`)
      setApartmentDetails(res.data)
    } catch {
      setApartmentDetails(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayloads = async () => {
    setLoadingPayloads(true)
    try {
      const res = await api.get(`/payloads?apartment=${apartment._id}`)
      setPayloads(res.data)
    } catch {
      setPayloads([])
    } finally {
      setLoadingPayloads(false)
    }
  }

  const handleApproveWithRefresh = async (payload, e) => {
    await handleApprove(payload, e)
    await fetchApartmentDetails()
    await fetchPayloads()
  }

  const handleRejectWithRefresh = async (payload, e) => {
    await handleReject(payload, e)
    await fetchApartmentDetails()
    await fetchPayloads()
  }

  // Columnas para la tabla de pagos
  const paymentColumns = usePayloadColumns({
    t,
    onEdit: handleOpenDialog,
    onApprove: handleApproveWithRefresh,
    onReject: handleRejectWithRefresh,
    onDownload: handleDownload,
    resourceType: 'apartment'
  })

  const handlePayloadSubmit = async () => {
    await handleSubmit()
    fetchPayloads()
    fetchApartmentDetails()
  }

  if (!apartment) return null

  return (
    <Paper
      open={open}
      sx={{
        position: 'fixed',
        zIndex: 1300,
        left: 0, top: 0, width: '100vw', height: '100vh',
        bgcolor: 'rgba(0,0,0,0.15)',
        display: open ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      elevation={0}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 900,
          bgcolor: 'white',
          borderRadius: 4,
          boxShadow: 6,
          p: 0,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Header y Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
            {t('propertyDetails')} - {apartment?.apartmentNumber ? `Apt ${apartment.apartmentNumber}` : ''}
          </Typography>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="fullWidth"
            sx={{
              mt: 2,
              '& .MuiTab-root': {
                py: 2,
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                color: '#6c757d',
                fontFamily: '"Poppins", sans-serif',
                '&.Mui-selected': { color: '#4a7c59' }
              },
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '4px 4px 0 0',
                bgcolor: '#4a7c59'
              }
            }}
          >
            <Tab icon={<Payment />} label={t('paymentStatus')} iconPosition="start" />
            <Tab icon={<Visibility />} label={t('propertyDetailsTab')} iconPosition="start" />
            <Tab icon={<Construction />} label={t('constructionPhases')} iconPosition="start" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
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
                          apartment: apartment?._id || '',
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
                            apartment: apartment?._id || '',
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
                    resources={[apartment]}
                    resourceType="apartment"
                    selectedPayload={selectedPayload}
                    paymentTypes={paymentTypes}
                  />
                </Box>
              )}

              {activeTab !== 0 && (
                <Box py={6} textAlign="center">
                  <Typography
                    color="text.secondary"
                    fontWeight={700}
                    sx={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {t('En construcción...')}
                  </Typography>
                </Box>
              )}
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Botón cerrar */}
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#4a7c59'
            }}
            aria-label={t('common:close')}
          >
            ×
          </button>
        </Box>
      </Box>
    </Paper>
  )
}

export default ApartmentDetailsModal