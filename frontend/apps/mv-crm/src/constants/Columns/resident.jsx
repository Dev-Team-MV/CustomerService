import { Box, Typography, Avatar, IconButton, Tooltip, Chip, CircularProgress } from '@mui/material'
import { Edit, Delete, Sms, CheckCircle, Cancel } from '@mui/icons-material'

const ROLE_STYLES = {
  superadmin: { bg: '#000',    color: '#fff' },
  admin:      { bg: '#1a1a1a', color: '#fff' },
  user:       { bg: '#f0f0f0', color: '#555' },
  default:    { bg: '#f5f5f5', color: '#888' },
}

const formatPhoneDisplay = (e164) => {
  if (!e164) return ''
  const digits = e164.replace(/\D/g, '')
  if (digits.startsWith('1') && digits.length === 11)
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  if (digits.startsWith('52') && digits.length === 12)
    return `+52 (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`
  if (digits.startsWith('57') && digits.length === 12)
    return `+57 (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`
  return `+${digits}`
}

export const useClientColumns = ({
  t,
  sendingSMS,
  onEdit,
  onDelete,
  onSendSMS,
}) => [
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
              onClick={(e) => { e.stopPropagation(); onSendSMS(row) }}
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
            onClick={() => onEdit(row)}
            sx={{ color: '#aaa', borderRadius: 0, '&:hover': { color: '#000', background: '#f5f5f5' } }}
          >
            <Edit sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>

        {/* Delete */}
        <Tooltip title={t('clients.delete')} placement="left">
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onDelete(row._id) }}            
            sx={{ color: '#ccc', borderRadius: 0, '&:hover': { color: '#000', background: '#f5f5f5' } }}
          >
            <Delete sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>
    )
  }
]