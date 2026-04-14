import { Box, Typography, Avatar, Chip, IconButton, Tooltip, CircularProgress } from '@mui/material'
import {
  AdminPanelSettings, VerifiedUser, Home,
  Edit, Delete, Sms
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

const getRoleColor = (role, theme) => {
  switch (role) {
    case 'superadmin': return { color: '#E5863C', icon: AdminPanelSettings }
    case 'admin':      return { color: '#8CA551', icon: VerifiedUser }
    default:           return { color: '#1976d2', icon: Home }
  }
}

const formatPhoneDisplay = (e164) => {
  if (!e164) return ''
  const digits = e164.replace(/\D/g, '')
  if (digits.startsWith('1')  && digits.length === 11)
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  if (digits.startsWith('52') && digits.length === 12)
    return `+52 (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`
  if (digits.startsWith('57') && digits.length === 12)
    return `+57 (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`
  return `+${digits}`
}

export const useResidentColumns = ({
  t,
  sendingSMS,
  onEdit,
  onDelete,
  onSendSMS,
}) => {
  const theme = useTheme()

  return [
    {
      field: 'name',
      headerName: t('residents:table.name'),
      minWidth: 180,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            sx={{
              width: 48, height: 48,
              bgcolor: 'transparent',
              background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
              color: 'white', fontWeight: 700, fontSize: '1rem',
              fontFamily: '"Poppins", sans-serif',
              border: '2px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.12)'
            }}
          >
            {row.firstName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography fontWeight={600} fontFamily='"Poppins", sans-serif'>
              {row.firstName} {row.lastName}
            </Typography>
            <Typography variant="caption" color="#706f6f" fontFamily='"Poppins", sans-serif'>
              {row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'email',
      headerName: t('residents:table.email'),
      minWidth: 180,
      renderCell: ({ row }) => row.email
    },
    {
      field: 'phoneNumber',
      headerName: t('residents:table.phone'),
      minWidth: 140,
      renderCell: ({ row }) => formatPhoneDisplay(row.phoneNumber) || '-'
    },
    {
      field: 'role',
      headerName: t('residents:table.role'),
      minWidth: 120,
      renderCell: ({ row }) => {
        const { color, icon: Icon } = getRoleColor(row.role, theme)
        return (
          <Chip
            label={t(`residents:role.${row.role}`)}
            icon={<Icon sx={{ color }} />}
            sx={{
              bgcolor: `${color}10`, color,
              fontWeight: 600, fontFamily: '"Poppins", sans-serif',
              border: `1px solid ${color}40`
            }}
            size="small"
          />
        )
      }
    },
    {
      field: 'lots',
      headerName: t('residents:table.properties'),
      minWidth: 120,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Home sx={{ fontSize: 16, color: '#8CA551' }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: '#7c3aed', fontFamily: '"Poppins", sans-serif' }}
          >
            {row.lots?.length || 0}
          </Typography>
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: t('residents:table.actions'),
      align: 'center',
      minWidth: 120,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {/* Send SMS */}
          <Tooltip title={t('residents:actions.sendSMS')} placement="top">
            <span>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onSendSMS(row) }}
                disabled={sendingSMS}
                sx={{
                  bgcolor: '#a78bfa14',
                  border: '1px solid #a78bfa33',
                  borderRadius: 2, transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#a78bfa',
                    borderColor: '#a78bfa',
                    transform: 'scale(1.1)',
                    '& .MuiSvgIcon-root': { color: 'white' }
                  },
                  '&:disabled': { opacity: 0.5 }
                }}
              >
                {sendingSMS
                  ? <CircularProgress size={16} />
                  : <Sms sx={{ fontSize: 18, color: '#a78bfa' }} />}
              </IconButton>
            </span>
          </Tooltip>
          {/* Edit */}
          <Tooltip title={t('residents:actions.edit')} placement="top">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onEdit(row) }}
              sx={{
                bgcolor: '#a78bfa14',
                border: '1px solid #a78bfa33',
                borderRadius: 2, transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#a78bfa',
                  borderColor: '#a78bfa',
                  transform: 'scale(1.1)',
                  '& .MuiSvgIcon-root': { color: 'white' }
                }
              }}
            >
              <Edit sx={{ fontSize: 18, color: '#a78bfa' }} />
            </IconButton>
          </Tooltip>
          {/* Delete */}
          <Tooltip title={t('residents:actions.delete')} placement="top">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(row._id) }}
              sx={{
                bgcolor: '#E5863C14',
                border: '1px solid #E5863C33',
                borderRadius: 2, transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#E5863C',
                  borderColor: '#E5863C',
                  transform: 'scale(1.1)',
                  '& .MuiSvgIcon-root': { color: 'white' }
                }
              }}
            >
              <Delete sx={{ fontSize: 18, color: '#E5863C' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]
}