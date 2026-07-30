// apps/mv-crm/src/components/clients/ClientPaymentsTable.jsx
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, TablePagination, useMediaQuery, useTheme } from '@mui/material'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '@shared/components/table/EmptyState'
import { Payment } from '@mui/icons-material'
import clientDetailService from '../../services/clientDetailService'
import { useClientPaymentColumns } from '../../constants/Columns/clientPayments'

const ClientPaymentsTable = ({ clientId }) => {
  const { t } = useTranslation('residents')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [payments, setPayments] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true)
      try {
        const data = await clientDetailService.getPayments(clientId, {
          page: pagination.page,
          limit: pagination.limit,
          status: statusFilter || undefined
        })
        setPayments(data.payments || [])
        setPagination(prev => ({ ...prev, ...data.pagination }))
      } catch (err) {
        console.error('Error loading payments:', err)
      } finally {
        setLoading(false)
      }
    }
    loadPayments()
  }, [clientId, pagination.page, pagination.limit, statusFilter])

  const isOverdue = (payment) => {
    if (!payment.dueDate) return false
    const dueDate = new Date(payment.dueDate)
    const now = new Date()
    return dueDate < now && payment.status !== 'signed'
  }

  const tableData = useMemo(() => {
    return payments.map(payment => ({ ...payment, isOverdue: isOverdue(payment) }))
  }, [payments])

  const columns = useClientPaymentColumns({ t })

  return (
    <Box sx={{ p: { xs: 1, sm: 0 } }}>
      {/* Filtro de estado (Responsive) */}
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
          <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
            {t('payments.filterStatus')}
          </InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            label={t('payments.filterStatus')}
            sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec' } }}
          >
            <MenuItem value="">{t('payments.all')}</MenuItem>
            <MenuItem value="pending">{t('payments.statusPending')}</MenuItem>
            <MenuItem value="signed">{t('payments.statusSigned')}</MenuItem>
            <MenuItem value="rejected">{t('payments.statusRejected')}</MenuItem>
          </Select>
        </FormControl>

        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#000000ff', letterSpacing: '0.5px' }}>
          {pagination.total} {pagination.total !== 1 ? t('payments.paymentsCountPlural') : t('payments.paymentsCount')}
        </Typography>
      </Box>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={tableData}
        loading={loading}
        emptyState={
          <EmptyState
            icon={Payment}
            title={t('payments.empty.title')}
            description={t('payments.empty.description')}
          />
        }
        stickyHeader
        maxHeight={500}
      />

      {/* Paginación (Responsive) */}
      {!loading && pagination.total > pagination.limit && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #ececec', borderRadius: 0, bgcolor: '#fff', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#000000ff', letterSpacing: '0.5px' }}>
            {t('payments.showing')} {((pagination.page - 1) * pagination.limit) + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} {t('payments.of')}{' '}
            {pagination.total} {pagination.total !== 1 ? t('payments.paymentsCountPlural') : t('payments.paymentsCount')}
          </Typography>

          <TablePagination
            component="div"
            count={pagination.total}
            page={pagination.page - 1}
            onPageChange={(e, newPage) => setPagination(prev => ({ ...prev, page: newPage + 1 }))}
            rowsPerPage={pagination.limit}
            onRowsPerPageChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage={t('payments.rowsPerPage')}
            labelDisplayedRows={() => ''}
            sx={{
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
              '& .MuiTablePagination-actions .MuiIconButton-root': { borderRadius: 0 }
            }}
          />
        </Box>
      )}
    </Box>
  )
}

export default ClientPaymentsTable