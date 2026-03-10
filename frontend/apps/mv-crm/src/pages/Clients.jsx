import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Box, Button, Typography, Avatar, IconButton, Tooltip,
  TextField, InputAdornment, CircularProgress, Snackbar, Alert
} from '@mui/material'
import { Search, CheckCircle, Cancel, Delete, Edit, Sms } from '@mui/icons-material'
import { motion } from 'framer-motion'
import DataTable from '@shared/components/table/DataTable'
import userService from '@shared/services/userService'
import api from '@shared/services/api'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import StatsStrip from '@shared/components/LayoutComponents/StatsStrip'
import ResidentDialog from '@shared/components/Modals/ResidentDialog'
import { useTranslation } from 'react-i18next'
import { authService } from '@shared/services/authService'

const ROLE_STYLES = {
  superadmin: { bg: '#000',    color: '#fff' },
  admin:      { bg: '#1a1a1a', color: '#fff' },
  user:       { bg: '#f0f0f0', color: '#555' },
  default:    { bg: '#f5f5f5', color: '#888' },
}

export default function Clients() {
  const { t } = useTranslation('residents')

  const [clients, setClients]   = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  const [sendingSMS, setSendingSMS] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })


  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    birthday: '',
    role: 'user',
    password: ''
  })

  const fetchClients = useCallback(async () => {
    setLoading(true)
    const data = await userService.getAll()
    setClients(data)
    setFiltered(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  useEffect(() => {
    if (!search.trim()) { setFiltered(clients); return }
    const q = search.toLowerCase()
    setFiltered(clients.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phoneNumber?.includes(q) ||
      c.role?.toLowerCase().includes(q)
    ))
  }, [search, clients])

  const handleDelete = useCallback(async (row) => {
    if (!window.confirm(t('clients.confirmDelete', { name: `${row.firstName} ${row.lastName}` }))) return
    const result = await userService.delete(row._id)
    if (result.success) setClients(prev => prev.filter(c => c._id !== row._id))
  }, [t])

    const handleSendPasswordSMS = useCallback(async (user) => {
    if (!user.phoneNumber) {
      setSnackbar({ open: true, message: t('clients.snackbar.noPhone'), severity: 'error' })
      return
    }
    setSendingSMS(true)
    try {
      await api.post(`/users/${user._id}/send-password-sms`)
      setSnackbar({
        open: true,
        message: t('clients.snackbar.smsSent', { phone: user.phoneNumber }),
        severity: 'success'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || t('clients.snackbar.smsError'),
        severity: 'error'
      })
    } finally {
      setSendingSMS(false)
    }
  }, [t])

  // Utilidad para mostrar el teléfono en formato visual
const formatPhoneDisplay = (e164) => {
  if (!e164) return ''
  const digits = e164.replace(/\D/g, '')
  // USA/Canada: +1 (XXX) XXX-XXXX
  if (digits.startsWith('1') && digits.length === 11)
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  // México: +52 (XXX) XXX-XXXX
  if (digits.startsWith('52') && digits.length === 12)
    return `+52 (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`
  // Colombia: +57 (XXX) XXX-XXXX
  if (digits.startsWith('57') && digits.length === 12)
    return `+57 (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`
  return `+${digits}`
}

  const columns = useMemo(() => [
    {
      field: 'name', headerName: t('clients.client'), minWidth: 220,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#000', borderRadius: 0, fontSize: '0.65rem', fontWeight: 700, fontFamily: '"Courier New", monospace', flexShrink: 0 }}>
            {`${row.firstName?.[0] || ''}${row.lastName?.[0] || ''}`.toUpperCase()}
          </Avatar>
          <Box>
            <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.88rem', fontWeight: 500, color: '#000', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              {row.firstName} {row.lastName}
            </Typography>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#aaa', letterSpacing: '0.5px' }}>
              {row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'phoneNumber', headerName: t('clients.phone'), minWidth: 160,
      renderCell: ({ row }) => (
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.78rem', color: row.phoneNumber ? '#444' : '#ccc', letterSpacing: '0.5px' }}>
          {/* {row.phoneNumber || '—'} */}
          {formatPhoneDisplay(row.phoneNumber) || '—'}  
        </Typography>
      )
    },
    {
      field: 'role', headerName: t('clients.role'), minWidth: 130,
      renderCell: ({ row }) => {
        const style = ROLE_STYLES[row.role] || ROLE_STYLES.default
        return (
          <Box sx={{ display: 'inline-flex', px: 1.5, py: 0.4, background: style.bg }}>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: style.color, fontWeight: 600 }}>
              {row.role || 'user'}
            </Typography>
          </Box>
        )
      }
    },
    {
      field: 'lots', headerName: t('clients.lots'), minWidth: 110,
      renderCell: ({ row }) => (
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.78rem', color: '#666' }}>
          {row.lots?.length > 0 ? `${row.lots.length} ${t('clients.assigned')}` : '—'}
        </Typography>
      )
    },
    {
      field: 'isActive', headerName: t('clients.status'), minWidth: 110,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          {row.isActive ? <CheckCircle sx={{ fontSize: 13, color: '#000' }} /> : <Cancel sx={{ fontSize: 13, color: '#ccc' }} />}
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', letterSpacing: '1px', textTransform: 'uppercase', color: row.isActive ? '#000' : '#bbb' }}>
            {row.isActive ? t('clients.activeStatus') : t('clients.inactiveStatus')}
          </Typography>
        </Box>
      )
    },
    {
      field: 'createdAt', headerName: t('clients.joined'), minWidth: 130,
      renderCell: ({ row }) => (
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#999', letterSpacing: '0.5px' }}>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : '—'}
        </Typography>
      )
    },
    {
      field: 'actions', headerName: t('clients.actions'), minWidth: 80, align: 'center',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {/* SMS */}
          <Tooltip title={t('clients.sendSMS')} placement="top">
            <span>
              <IconButton
                size="small"
                disabled={sendingSMS}
                onClick={(e) => { e.stopPropagation(); handleSendPasswordSMS(row) }}
                sx={{
                  color: '#aaa', borderRadius: 0,
                  '&:hover': { color: '#4a7c59', background: '#f0f4f0' },
                  '&:disabled': { opacity: 0.4 }
                }}
              >
                {sendingSMS
                  ? <CircularProgress size={14} sx={{ color: '#4a7c59' }} />
                  : <Sms sx={{ fontSize: 15 }} />
                }
              </IconButton>
            </span>
          </Tooltip>

          {/* Edit */}
          <Tooltip title={t('clients.edit')}>
            <IconButton
              size="small"
              onClick={() => {
                setSelectedClient(row)
                setFormData({
                  firstName: row.firstName || '',
                  lastName: row.lastName || '',
                  email: row.email || '',
                  phoneNumber: row.phoneNumber || '',
                  birthday: row.birthday || '',
                  role: row.role || 'user',
                  password: ''
                })
                setDialogOpen(true)
              }}
              sx={{ color: '#aaa', borderRadius: 0, '&:hover': { color: '#000', background: '#f5f5f5' } }}
            >
              <Edit sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>

          {/* Delete */}
          <Tooltip title={t('clients.delete')} placement="left">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleDelete(row) }}
              sx={{ color: '#ccc', borderRadius: 0, '&:hover': { color: '#000', background: '#f5f5f5' } }}
            >
              <Delete sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [handleDelete, handleSendPasswordSMS, sendingSMS, t])

  const activeCount   = clients.filter(c => c.isActive).length
  const adminCount    = clients.filter(c => ['admin', 'superadmin'].includes(c.role)).length
  const withLotsCount = clients.filter(c => c.lots?.length > 0).length

  return (
    <PageLayout
      title={t('clients.title')}
      titleBold={t('clients.titleBold')}
      topbarLabel={t('clients.topbarLabel')}
      subtitle={t('clients.subtitle')}
    >

      {/* ── Stats ── */}
      <StatsStrip stats={[
        { label: t('clients.total'), value: clients.length },
        { label: t('clients.active'), value: activeCount },
        { label: t('clients.admins'), value: adminCount },
        { label: t('clients.withLots'), value: withLotsCount },
      ]} />

      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        onClick={() => {
          setSelectedClient(null)
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            birthday: '',
            role: 'user',
            password: ''
          })
          setDialogOpen(true)
        }}
      >
        + {t('clients.addClient')}
      </Button>
<ResidentDialog
  open={dialogOpen}
  onClose={() => setDialogOpen(false)}
  onSubmit={async () => {
    try {
      const payload = { ...formData }
      if (selectedClient && selectedClient._id) {
        // Editar usuario
        if (!payload.password) delete payload.password
        await userService.update(selectedClient._id, payload)
      } else {
        // Crear usuario (registro)
        await authService.register(
          payload.firstName,
          payload.lastName,
          payload.email,
          '', // password vacío
          payload.phoneNumber,
          true // skipPasswordSetup
        )
      }
      setDialogOpen(false)
      fetchClients()
    } catch (error) {
      alert(error.response?.data?.message || error.message)
    }
  }}
  formData={formData}
  setFormData={setFormData}
  selectedUser={selectedClient}
/>
      {/* ── Search ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('clients.searchPlaceholder')}
            size="small"
            sx={{
              width: 360,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0, background: '#fff',
                fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.875rem',
                '& fieldset': { borderColor: '#ddd' },
                '&:hover fieldset': { borderColor: '#000' },
                '&.Mui-focused fieldset': { borderColor: '#000', borderWidth: 2 }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: '#bbb' }} />
                </InputAdornment>
              )
            }}
          />
          {search && (
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#aaa', letterSpacing: '1.5px' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {/* ── Table ── */}
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          rowKey="_id"
          onRowClick={(row) => console.log('row clicked:', row)}
          sx={{
            background: '#fff', border: '1px solid #e8e8e8', borderRadius: 0,
            '& .MuiTableHead-root': { background: '#0a0a0a' },
            '& .MuiTableHead-root .MuiTableCell-root': { fontFamily: '"Courier New", monospace', fontSize: '0.58rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.08)', py: 1.8, fontWeight: 400 },
            '& .MuiTableBody-root .MuiTableRow-root': { transition: 'background 0.15s ease', cursor: 'pointer', '&:hover': { background: '#f7f7f7' } },
            '& .MuiTableBody-root .MuiTableCell-root': { borderBottom: '1px solid #f2f2f2', py: 1.6 },
            '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': { background: '#fdfdfd' },
            '& .MuiTableSortLabel-root': { color: 'rgba(255,255,255,0.45)', '&:hover': { color: '#fff' }, '&.Mui-active': { color: '#fff' }, '& .MuiTableSortLabel-icon': { color: 'rgba(255,255,255,0.3) !important' } },
            '& .MuiTablePagination-root': { fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#aaa', borderTop: '1px solid #ececec', background: '#fafafa' },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: '0.5px', color: '#aaa' },
            '& .MuiTablePagination-actions .MuiIconButton-root': { color: '#aaa', borderRadius: 0, '&:hover': { background: '#f0f0f0', color: '#000' } }
          }}
        />
      </motion.div>

            {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ fontFamily: '"Helvetica Neue", sans-serif', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  )
}