// @shared/components/Resource/PaymentTab.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert
} from '@mui/material'
import {
  Payment,
  Upload,
  CheckCircle,
  Schedule,
  TrendingUp,
  Description,
  Info
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

import DataTable from '@shared/components/table/DataTable'
import UserCreatePayload from '@shared/components/Modals/UserCreatePayload'
import { usePaymentTab } from '@shared/hooks/usePayloads'

const PaymentTab = ({ details, payloads, loadingPayloads, onPaymentUploaded, user, config, resourceType }) => {
  const { t } = useTranslation([config.i18n.namespace, 'common'])
  const resourceId = details?.[resourceType]?._id ?? details?._id

  const {
    uploadPaymentDialog,
    handleOpenUploadPayment,
    handleCloseUploadPayment,
    paymentForm,
    handlePaymentFormChange,
    uploadingPayment,
    handlePaymentUpload
  } = usePaymentTab({
    resourceType,
    resourceId,
    user,
    onPaymentUploaded
  })

  // Columns for payment table
  const columns = [
    {
      field: 'amount',
      headerName: t(`${config.i18n.namespace}:amount`, 'Amount'),
      flex: 1,
      renderCell: (params) => `$${params.value?.toLocaleString() || '0'}`
    },
    {
      field: 'status',
      headerName: t(`${config.i18n.namespace}:status`, 'Status'),
      flex: 1,
      renderCell: (params) => (
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor:
              params.value === 'signed'
                ? '#e8f5e9'
                : params.value === 'pending'
                ? '#fff3e0'
                : '#ffebee',
            color:
              params.value === 'signed'
                ? '#2e7d32'
                : params.value === 'pending'
                ? '#e65100'
                : '#c62828'
          }}
        >
          {params.value}
        </span>
      )
    },
    {
      field: 'createdAt',
      headerName: t(`${config.i18n.namespace}:date`, 'Date'),
      flex: 1,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    }
  ]

  if (!details) {
    return <Box p={3}>{t(`${config.i18n.namespace}:loading`, 'Loading...')}</Box>
  }

// ...existing code...

// Calcula el total pagado sumando los amounts de los payloads con status 'signed'
const totalPaid = Array.isArray(details.payloads)
  ? details.payloads
      .filter(p => p.status === 'signed')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  : 0;

// Usa el pending y price directo del objeto details
const price = Number(details.price) || 0;
const pending = Number(details.pending) || (price - totalPaid);

// Calcula el progreso de pago
const progress = price > 0 ? (totalPaid / price) * 100 : 0;

const summaryCards = [
  {
    label: t(`${config.i18n.namespace}:totalPaid`, 'Total Paid'),
    value: `$${totalPaid.toLocaleString()}`,
    color: config.colors.secondary,
    icon: <CheckCircle />
  },
  {
    label: t(`${config.i18n.namespace}:pendingAmount`, 'Pending Amount'),
    value: `$${pending.toLocaleString()}`,
    color: config.colors.accent,
    icon: <Schedule />
  },
  {
    label: t(`${config.i18n.namespace}:paymentProgress`, 'Payment Progress'),
    value: `${Math.round(progress)}%`,
    color: config.colors.primary,
    icon: <TrendingUp />
  }
];

// ...existing code...

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          background: 'white',
          borderRadius: 4,
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}
      >
        {/* Header */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          gap={{ xs: 2, sm: 2, md: 3 }}
          mb={{ xs: 3, md: 4 }}
          pb={3}
          sx={{ borderBottom: `2px solid ${config.colors.secondary}33` }}
        >
          <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2 }}>
            <Box
              sx={{
                width: { xs: 48, sm: 52, md: 56 },
                height: { xs: 48, sm: 52, md: 56 },
                borderRadius: 3,
                bgcolor: config.colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${config.colors.primary}33`,
                flexShrink: 0
              }}
            >
              <Payment sx={{ fontSize: { xs: 24, sm: 26, md: 28 }, color: 'white' }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  color: config.colors.primary,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                  letterSpacing: '0.5px'
                }}
              >
                {t(`${config.i18n.namespace}:paymentTab`, 'Payment Status')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#706f6f',
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                {t(`${config.i18n.namespace}:managePayments`, 'Manage and track your payment history')}
              </Typography>
            </Box>
          </Box>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Box
              component="button"
              onClick={handleOpenUploadPayment}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1.5,
                borderRadius: 3,
                bgcolor: config.colors.primary,
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontFamily: '"Poppins", sans-serif',
                boxShadow: `0 4px 12px ${config.colors.primary}40`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: config.colors.secondary,
                  boxShadow: `0 8px 20px ${config.colors.secondary}60`
                }
              }}
            >
              <Upload sx={{ fontSize: { xs: 18, sm: 20 } }} />
              {t(`${config.i18n.namespace}:uploadPayment`, 'Upload Payment')}
            </Box>
          </motion.div>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
          {summaryCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #e0e0e0',
                    bgcolor: '#fafafa',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: stat.color,
                      boxShadow: `0 8px 24px ${stat.color}20`,
                      bgcolor: 'white'
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={{ xs: 1.5, md: 2 }}
                      flexWrap="wrap"
                      gap={1}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#999999',
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: { xs: '0.65rem', sm: '0.7rem' }
                        }}
                      >
                        {stat.label}
                      </Typography>
                      <Box
                        sx={{
                          width: { xs: 40, sm: 44, md: 48 },
                          height: { xs: 40, sm: 44, md: 48 },
                          borderRadius: '50%',
                          bgcolor: `${stat.color}10`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: stat.color,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {React.cloneElement(stat.icon, {
                          sx: { fontSize: { xs: 20, sm: 22, md: 24 } }
                        })}
                      </Box>
                    </Box>
                    <Typography
                      variant="h3"
                      fontWeight={700}
                      sx={{
                        color: stat.color,
                        letterSpacing: '-0.5px',
                        fontFamily: '"Poppins", sans-serif',
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Payment History */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: `${config.colors.primary}14`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Description sx={{ fontSize: 22, color: config.colors.primary }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: config.colors.primary,
                  fontWeight: 700,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                  letterSpacing: '0.5px'
                }}
              >
                {t(`${config.i18n.namespace}:paymentHistory`, 'Payment History')}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#706f6f',
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}
              >
                {payloads.length} {t(`${config.i18n.namespace}:transactions`, 'transactions')}
              </Typography>
            </Box>
          </Box>

          <DataTable
            columns={columns}
            data={payloads}
            loading={loadingPayloads}
            emptyState={
              <Alert
                severity="info"
                icon={<Info />}
                sx={{
                  borderRadius: 3,
                  bgcolor: `${config.colors.secondary}14`,
                  border: `1px solid ${config.colors.secondary}4D`,
                  fontSize: { xs: '0.85rem', md: '1rem' },
                  fontFamily: '"Poppins", sans-serif',
                  '& .MuiAlert-icon': { color: config.colors.secondary }
                }}
              >
                {t(`${config.i18n.namespace}:noPayments`, 'No payment transactions yet')}
              </Alert>
            }
            stickyHeader
            maxHeight={400}
          />
        </Box>
      </Paper>

      {/* Upload Dialog */}
      <UserCreatePayload
        open={uploadPaymentDialog}
        onClose={handleCloseUploadPayment}
        onSubmit={handlePaymentUpload}
        paymentForm={paymentForm}
        handlePaymentFormChange={handlePaymentFormChange}
        uploadingPayment={uploadingPayment}
      />
    </>
  )
}

PaymentTab.propTypes = {
  details: PropTypes.object.isRequired,
  payloads: PropTypes.array.isRequired,
  loadingPayloads: PropTypes.bool,
  onPaymentUploaded: PropTypes.func,
  user: PropTypes.object,
  config: PropTypes.object.isRequired,
  resourceType: PropTypes.string.isRequired
}

export default PaymentTab