// apps/mv-crm/src/pages/Payments.jsx
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TablePagination,
  Snackbar
} from '@mui/material'
import { Sms, FilterList } from '@mui/icons-material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '@shared/components/table/EmptyState'
import PaymentSummaryStrip from '../components/payments/PaymentSummaryStrip'
import paymentCrmService from '../services/paymentCrmService'
import { usePaymentColumns } from '../constants/Columns/payments'
import { useProjects } from '@shared/hooks/useProjects'
import ExportButton from '../components/ExportButton'
import crmReportsService from '../services/crmReportsService'

export default function Payments() {
  const { t } = useTranslation('payments')
  const { projects } = useProjects()

  const [summary, setSummary] = useState(null)
  const [payments, setPayments] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Filtros
  const [filters, setFilters] = useState({
    projectId: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  })

  // Modal de confirmación SMS
  const [smsDialog, setSmsDialog] = useState({ open: false, payment: null })
  const [sendingSms, setSendingSms] = useState(false)

  // Cargar resumen
  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await paymentCrmService.getSummary()
        setSummary(data)
      } catch (err) {
        console.error('Error loading summary:', err)
      }
    }
    loadSummary()
  }, [])

  // Cargar pagos
  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await paymentCrmService.getAll({
          ...filters,
          page: pagination.page,
          limit: pagination.limit
        })
        setPayments(data.payments)
        setPagination(prev => ({ ...prev, ...data.pagination }))
      } catch (err) {
        setError(err.response?.data?.message || t('payments.errors.loadFailed'))
      } finally {
        setLoading(false)
      }
    }
    loadPayments()
  }, [filters, pagination.page, pagination.limit])

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleClearFilters = () => {
    setFilters({ projectId: '', status: '', dateFrom: '', dateTo: '' })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage + 1 }))
  }

  const handleRowsPerPageChange = (event) => {
    setPagination(prev => ({ ...prev, limit: parseInt(event.target.value), page: 1 }))
  }

  const handleOpenSmsDialog = (payment) => {
    setSmsDialog({ open: true, payment })
  }

  const handleCloseSmsDialog = () => {
    setSmsDialog({ open: false, payment: null })
  }

  const handleSendSms = async () => {
    if (!smsDialog.payment) return

    setSendingSms(true)
    try {
      await paymentCrmService.sendReminder(
        smsDialog.payment._id,
        smsDialog.payment.clientPhone,
        smsDialog.payment.clientName,
        smsDialog.payment.amount,
        smsDialog.payment.dueDate
      )
      setSnackbar({
        open: true,
        message: t('payments.sms.success'),
        severity: 'success'
      })
      handleCloseSmsDialog()
    } catch (err) {
      setSnackbar({
        open: true,
        message: `${t('payments.sms.error')}: ${err.response?.data?.message || err.message}`,
        severity: 'error'
      })
    } finally {
      setSendingSms(false)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Calcular si está vencido
  const isOverdue = (payment) => {
    if (!payment.dueDate) return false
    const dueDate = new Date(payment.dueDate)
    const now = new Date()
    return dueDate < now && payment.status !== 'signed'
  }

  // Mapear datos para agregar isOverdue
  const tableData = useMemo(() => {
    return payments.map(payment => ({
      ...payment,
      isOverdue: isOverdue(payment)
    }))
  }, [payments])

  // Definir columnas
  const columns = usePaymentColumns({
    t,
    onSendSms: handleOpenSmsDialog
  })

  return (
    <PageLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography
              sx={{
                fontFamily: '"Helvetica Neue", Arial, sans-serif',
                fontWeight: 200,
                fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                color: '#000',
                letterSpacing: '-0.04em',
                lineHeight: 1
              }}
            >
              {t('payments.title')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#000',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.3 }
                  }
                }}
              />
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.62rem',
                  color: '#000',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase'
                }}
              >
                {t('payments.description')}
              </Typography>
            </Box>
          </Box>

          <ExportButton
            label={t('payments.exportButton')}
            exportFn={crmReportsService.exportPayments}
            withModal={true}
            filters={[
              {
                field: 'dateFrom',
                label: t('payments.filters.dateFrom'),
                type: 'date',
                required: true
              },
              {
                field: 'dateTo',
                label: t('payments.filters.dateTo'),
                type: 'date',
                required: true
              },
              {
                field: 'projectId',
                label: t('payments.filters.projectOptional'),
                type: 'select',
                placeholder: t('payments.filters.allProjects'),
                required: false,
                options: projects.map(p => ({ value: p._id, label: p.name }))
              }
            ]}
          />
        </Box>

        {/* KPIs */}
        <PaymentSummaryStrip summary={summary} loading={!summary} />

        {/* Filtros */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            border: '1px solid #ececec',
            borderRadius: 1,
            bgcolor: '#fff',
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
            <FilterList sx={{ fontSize: 16, color: '#888' }} />
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.6rem',
                color: '#888',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
            >
              {t('payments.filters.title')}
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
              {t('payments.filters.project')}
            </InputLabel>
            <Select
              value={filters.projectId}
              onChange={(e) => handleFilterChange('projectId', e.target.value)}
              label={t('payments.filters.project')}
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                borderRadius: 0,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec' }
              }}
            >
              <MenuItem value="">{t('payments.filters.allProjects')}</MenuItem>
              {projects.map(project => (
                <MenuItem key={project._id} value={project._id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
              {t('payments.filters.status')}
            </InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label={t('payments.filters.status')}
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                borderRadius: 0,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec' }
              }}
            >
              <MenuItem value="">{t('payments.filters.all')}</MenuItem>
              <MenuItem value="pending">{t('payments.status.pending')}</MenuItem>
              <MenuItem value="signed">{t('payments.status.signed')}</MenuItem>
              <MenuItem value="overdue">{t('payments.status.overdue')}</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="date"
            label={t('payments.filters.dateFrom')}
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: 160,
              '& .MuiInputBase-input': {
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem'
              },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec' }
            }}
          />

          <TextField
            size="small"
            type="date"
            label={t('payments.filters.dateTo')}
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: 160,
              '& .MuiInputBase-input': {
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem'
              },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec' }
            }}
          />

          <Button
            variant="text"
            size="small"
            onClick={handleClearFilters}
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem',
              color: '#888',
              textTransform: 'none',
              letterSpacing: '0.5px',
              '&:hover': { color: '#000', bgcolor: '#f5f5f5' }
            }}
          >
            {t('payments.filters.clear')}
          </Button>
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 0, border: '1px solid #f44336' }}>
            {error}
          </Alert>
        )}

        {/* Tabla con DataTable */}
        <DataTable
          columns={columns}
          data={tableData}
          loading={loading}
          emptyState={
            <EmptyState
              icon={Sms}
              title={t('payments.empty.title')}
              description={t('payments.empty.description')}
            />
          }
          stickyHeader
          maxHeight={600}
        />

        {/* Paginación */}
        {!loading && payments.length > 0 && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              border: '1px solid #ececec',
              bgcolor: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem',
                color: '#888',
                letterSpacing: '0.5px'
              }}
            >
              {t('payments.pagination.showing', {
                from: ((pagination.page - 1) * pagination.limit) + 1,
                to: Math.min(pagination.page * pagination.limit, pagination.total),
                total: pagination.total
              })}
            </Typography>

            <TablePagination
              component="div"
              count={pagination.total}
              page={pagination.page - 1}
              onPageChange={handlePageChange}
              rowsPerPage={pagination.limit}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[10, 20, 50, 100]}
              labelRowsPerPage={t('payments.pagination.rowsPerPage')}
              labelDisplayedRows={() => ''}
              sx={{
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.7rem'
                }
              }}
            />
          </Box>
        )}

        {/* Modal de confirmación SMS */}
        <Dialog
          open={smsDialog.open}
          onClose={handleCloseSmsDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}
        >
          <DialogTitle
            sx={{
              borderBottom: '1px solid #ececec',
              fontFamily: '"Helvetica Neue", sans-serif',
              fontWeight: 600
            }}
          >
            {t('payments.sms.dialogTitle')}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {smsDialog.payment && (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.65rem',
                      color: '#888',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      mb: 0.5
                    }}
                  >
                    {t('payments.sms.client')}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.95rem', fontWeight: 500 }}>
                    {smsDialog.payment.clientName}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.65rem',
                      color: '#888',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      mb: 0.5
                    }}
                  >
                    {t('payments.sms.phone')}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem' }}>
                    {smsDialog.payment.clientPhone}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.65rem',
                      color: '#888',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      mb: 0.5
                    }}
                  >
                    {t('payments.sms.amount')}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Helvetica Neue", sans-serif',
                      fontSize: '1.1rem',
                      fontWeight: 700
                    }}
                  >
                    ${smsDialog.payment.amount?.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.65rem',
                      color: '#888',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      mb: 0.5
                    }}
                  >
                    {t('payments.sms.dueDate')}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem' }}>
                    {new Date(smsDialog.payment.dueDate).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Typography>
                </Box>

                <Alert
                  severity="info"
                  sx={{
                    mt: 2,
                    borderRadius: 0,
                    border: '1px solid #1976d2',
                    bgcolor: '#e3f2fd',
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.75rem'
                  }}
                >
                  {t('payments.sms.info')}
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ borderTop: '1px solid #ececec', p: 2 }}>
            <Button
              onClick={handleCloseSmsDialog}
              disabled={sendingSms}
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                color: '#888',
                textTransform: 'none',
                letterSpacing: '0.5px'
              }}
            >
              {t('payments.sms.cancel')}
            </Button>
            <Button
              onClick={handleSendSms}
              variant="contained"
              startIcon={sendingSms ? <CircularProgress size={16} /> : <Sms />}
              disabled={sendingSms}
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                textTransform: 'none',
                letterSpacing: '0.5px',
                bgcolor: '#000',
                borderRadius: 0,
                '&:hover': { bgcolor: '#333' }
              }}
            >
              {sendingSms ? t('payments.sms.sending') : t('payments.sms.send')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ fontFamily: '"Helvetica Neue", sans-serif', borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageLayout>
  )
}