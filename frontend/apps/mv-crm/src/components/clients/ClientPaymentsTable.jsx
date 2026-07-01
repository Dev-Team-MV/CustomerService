// apps/mv-crm/src/components/clients/ClientPaymentsTable.jsx
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination
} from '@mui/material'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '@shared/components/table/EmptyState'
import { Payment } from '@mui/icons-material'
import clientDetailService from '../../services/clientDetailService'
import { useClientPaymentColumns } from '../../constants/Columns/clientPayments'

const ClientPaymentsTable = ({ clientId }) => {
  const { t } = useTranslation('clients')
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
  const columns = useClientPaymentColumns({ t })

  return (
    <Box>
      {/* Filtro de estado */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
            {t('clients.payments.filterStatus', 'Estado')}
          </InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            label={t('clients.payments.filterStatus', 'Estado')}
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              borderRadius: 0,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec' }
            }}
          >
            <MenuItem value="">{t('clients.payments.all', 'Todos')}</MenuItem>
            <MenuItem value="pending">{t('clients.payments.statusPending', 'Pendiente')}</MenuItem>
            <MenuItem value="signed">{t('clients.payments.statusSigned', 'Firmado')}</MenuItem>
            <MenuItem value="rejected">{t('clients.payments.statusRejected', 'Rechazado')}</MenuItem>
          </Select>
        </FormControl>

        <Typography
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.7rem',
            color: '#888',
            letterSpacing: '0.5px'
          }}
        >
          {pagination.total} {t('clients.payments.paymentsCount', 'pago')}
          {pagination.total !== 1 ? 's' : ''}
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
            title={t('clients.payments.empty.title', 'Sin pagos')}
            description={t('clients.payments.empty.description', 'Este cliente no tiene pagos registrados')}
          />
        }
        stickyHeader
        maxHeight={500}
      />

      {/* Paginación */}
      {!loading && pagination.total > pagination.limit && (
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
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} pagos
          </Typography>

          <TablePagination
            component="div"
            count={pagination.total}
            page={pagination.page - 1}
            onPageChange={(e, newPage) => setPagination(prev => ({ ...prev, page: newPage + 1 }))}
            rowsPerPage={pagination.limit}
            onRowsPerPageChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage={t('clients.payments.rowsPerPage', 'Filas por página')}
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
    </Box>
  )
}

export default ClientPaymentsTable