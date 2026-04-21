import { useState, useEffect } from 'react'
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Paper,
} from '@mui/material'
import {
  Construction,
  Payment,
  Visibility,
  AccountBalance,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'

import api from '@shared/services/api'
import PageHeader from '@shared/components/PageHeader'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '@shared/components/table/EmptyState'
import PayloadDialog from '@shared/components/Modals/PayloadDialog'
import ConstructionTab from './ConstructionTab'
import ApartmentDetailsTab from './ApartmentDetailsTab'
import { useAuth } from '@shared/context/AuthContext'
import { usePayloads } from '@shared/hooks/usePayloads'

const paymentTypes = [
  "initial down payment",
  "complementary down payment",
  "monthly payment",
  "additional payment",
  "closing payment"
]

// usePayloadColumnsFn se inyecta como prop — cada app pasa la suya
// ISQ no la pasa → columns = [] (tab de pagos sin columnas custom)
const ApartmentDetailsModal = ({ open, onClose, apartment, usePayloadColumnsFn, projectId }) => {
  const { t } = useTranslation(['myProperty', 'common', 'payloads'])
  const theme = useTheme()

  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  const [activeTab, setActiveTab] = useState(0)
  const [apartmentDetails, setApartmentDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payloads, setPayloads] = useState([])
  const [loadingPayloads, setLoadingPayloads] = useState(false)

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
      const res = await api.get(`/payloads?apartment=${apartment._id}&projectId=${projectId}`)
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

  const paymentColumns = usePayloadColumnsFn?.({
    t,
    onEdit: handleOpenDialog,
    onApprove: handleApproveWithRefresh,
    onReject: handleRejectWithRefresh,
    onDownload: handleDownload,
    resourceType: 'apartment'
  }) ?? []

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
          maxWidth: '80%',
          maxHeight: '90vh',
          bgcolor: 'white',
          borderRadius: 4,
          boxShadow: 6,
          p: 0,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
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
                color: theme.palette.text.secondary,
                fontFamily: '"Poppins", sans-serif',
                transition: 'all 0.3s ease',
                '&.Mui-selected': { color: theme.palette.primary.main },
                '&:hover': { bgcolor: `${theme.palette.primary.main}08` }
              },
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '4px 4px 0 0',
                bgcolor: theme.palette.primary.main
              }
            }}
          >
            <Tab icon={<Payment />} label={t('paymentStatus')} iconPosition="start" />
            <Tab icon={<Visibility />} label={t('propertyDetailsTab')} iconPosition="start" />
            <Tab icon={<Construction />} label={t('constructionPhases')} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Content con scroll */}
        <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              {/* TAB 0: Payment Status */}
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
                    gradientColors={[theme.palette.primary.main, theme.palette.secondary.main, theme.palette.primary.main]}
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

              {/* TAB 1: Property Details */}
              {activeTab === 1 && (
                <ApartmentDetailsTab apartmentDetails={apartmentDetails} />
              )}

              {/* TAB 2: Construction Phases */}
              {activeTab === 2 && (
                <ConstructionTab
                  apartmentId={apartment?._id}
                  isAdmin={isAdmin}
                />
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
              color: theme.palette.primary.main
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