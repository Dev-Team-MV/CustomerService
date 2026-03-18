import React                from 'react'
import { useTranslation }   from 'react-i18next'
import {
  Box, Paper, Typography,
  Grid, Card, CardContent,
  Alert
} from '@mui/material'
import {
  Payment, Upload,
  CheckCircle, Schedule, TrendingUp,
  Description, Info
} from '@mui/icons-material'
import { motion }           from 'framer-motion'

import DataTable from '@shared/components/table/DataTable';
import EmptyState from '@shared/components/table/EmptyState';
import UserCreatePayload from '../payloads/UserCreatePayload'
import PrimaryButton     from '../../constants/PrimaryButton'

import { usePaymentTab } from '../../hooks/usePayloads'  // ← mismo archivo
import { usePaymentTabColumns } from '../../constants/Columns/paymentTab'

const PaymentTab = ({ propertyDetails, payloads, loadingPayloads, onPaymentUploaded, user }) => {
  const { t } = useTranslation(['myProperty', 'common'])

  // ── Hook con toda la lógica ───────────────────────────────
  const {
    uploadPaymentDialog,
    handleOpenUploadPayment,
    handleCloseUploadPayment,
    paymentForm,
    handlePaymentFormChange,
    uploadingPayment,
    handleSubmitPayment,
  } = usePaymentTab({ propertyDetails, user, onPaymentUploaded })

  // ── Columns ───────────────────────────────────────────────
  const columns = usePaymentTabColumns({ t })

  // ── Guard ─────────────────────────────────────────────────
  if (!propertyDetails) {
    return <Box p={3}>{t('myProperty:loading', 'Loading...')}</Box>
  }

  // ── Stats cards ───────────────────────────────────────────
  const summaryCards = [
    {
      label: t('myProperty:totalPaid',       'Total Paid'),
      value: `$${propertyDetails.payment.totalPaid.toLocaleString()}`,
      color: '#8CA551',
      icon:  <CheckCircle />,
    },
    {
      label: t('myProperty:pendingAmount',   'Pending Amount'),
      value: `$${propertyDetails.payment.totalPending.toLocaleString()}`,
      color: '#E5863C',
      icon:  <Schedule />,
    },
    {
      label: t('myProperty:paymentProgress', 'Payment Progress'),
      value: `${Math.round(propertyDetails.payment.progress)}%`,
      color: '#333F1F',
      icon:  <TrendingUp />,
    },
  ]

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          background: 'white', borderRadius: 4,
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          gap={{ xs: 2, sm: 2, md: 3 }}
          mb={{ xs: 3, md: 4 }}
          pb={3}
          sx={{ borderBottom: '2px solid rgba(140, 165, 81, 0.2)' }}
        >
          <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2 }}>
            <Box
              sx={{
                width: { xs: 48, sm: 52, md: 56 },
                height: { xs: 48, sm: 52, md: 56 },
                borderRadius: 3, bgcolor: '#333F1F',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)', flexShrink: 0,
              }}
            >
              <Payment sx={{ fontSize: { xs: 24, sm: 26, md: 28 }, color: 'white' }} />
            </Box>
            <Box>
              <Typography
                variant="h5" fontWeight={700}
                sx={{
                  color: '#333F1F', fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                  letterSpacing: '0.5px'
                }}
              >
                {t('myProperty:paymentTab', 'Payment Status')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#706f6f', fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {t('myProperty:managePayments', 'Manage and track your payment history')}
              </Typography>
            </Box>
          </Box>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <PrimaryButton
              startIcon={<Upload sx={{ fontSize: { xs: 18, sm: 20 } }} />}
              onClick={handleOpenUploadPayment}
            >
              {t('myProperty:uploadPayment', 'Upload Payment')}
            </PrimaryButton>
          </motion.div>
        </Box>

        {/* ── Summary cards ──────────────────────────────── */}
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
                    borderRadius: 3, border: '1px solid #e0e0e0',
                    bgcolor: '#fafafa', boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: stat.color,
                      boxShadow: `0 8px 24px ${stat.color}20`,
                      bgcolor: 'white'
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                    <Box
                      display="flex" alignItems="center"
                      justifyContent="space-between"
                      mb={{ xs: 1.5, md: 2 }} flexWrap="wrap" gap={1}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#999999', fontWeight: 500,
                          textTransform: 'uppercase', letterSpacing: '1px',
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
                        }}
                      >
                        {stat.label}
                      </Typography>
                      <Box
                        sx={{
                          width: { xs: 40, sm: 44, md: 48 },
                          height: { xs: 40, sm: 44, md: 48 },
                          borderRadius: '50%', bgcolor: `${stat.color}10`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: stat.color, transition: 'all 0.3s ease'
                        }}
                      >
                        {React.cloneElement(stat.icon, {
                          sx: { fontSize: { xs: 20, sm: 22, md: 24 } }
                        })}
                      </Box>
                    </Box>
                    <Typography
                      variant="h3" fontWeight={700}
                      sx={{
                        color: stat.color, letterSpacing: '-0.5px',
                        fontFamily: '"Poppins", sans-serif',
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
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

        {/* ── Payment history ─────────────────────────────── */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 40, height: 40, borderRadius: 2,
                bgcolor: 'rgba(51, 63, 31, 0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Description sx={{ fontSize: 22, color: '#333F1F' }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: '#333F1F', fontWeight: 700,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                  letterSpacing: '0.5px'
                }}
              >
                {t('myProperty:paymentHistory', 'Payment History')}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#706f6f', fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}
              >
                {t('myProperty:transactions', { count: payloads.length })}
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
                  bgcolor: 'rgba(140, 165, 81, 0.08)',
                  border: '1px solid rgba(140, 165, 81, 0.3)',
                  fontSize: { xs: '0.85rem', md: '1rem' },
                  fontFamily: '"Poppins", sans-serif',
                  '& .MuiAlert-icon': { color: '#8CA551' }
                }}
              >
                {t('myProperty:noPayments', 'No payment transactions yet. Click "Upload Payment" to add your first payment.')}
              </Alert>
            }
            stickyHeader
            maxHeight={400}
          />
        </Box>
      </Paper>

      {/* ── Upload dialog ────────────────────────────────── */}
      <UserCreatePayload
        open={uploadPaymentDialog}
        onClose={handleCloseUploadPayment}
        onSubmit={handleSubmitPayment}
        paymentForm={paymentForm}
        handlePaymentFormChange={handlePaymentFormChange}
        uploadingPayment={uploadingPayment}
      />
    </>
  )
}

export default PaymentTab