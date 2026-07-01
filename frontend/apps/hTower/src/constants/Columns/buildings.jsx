import {
  Box, Typography, Avatar, IconButton,
  Chip, Tooltip, LinearProgress
} from '@mui/material'
import {
  Business, Layers, Apartment, GridOn,
  Visibility, Edit as EditIcon, Delete as DeleteIcon
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

const StatusChip = ({ status }) => {
  const theme = useTheme()
  const colors = status === 'active'
    ? { bg: theme.palette.chipAdmin.bg, color: theme.palette.chipAdmin.color, border: theme.palette.chipAdmin.border }
    : { bg: theme.palette.chipResident.bg, color: theme.palette.chipResident.color, border: theme.palette.chipResident.border }
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        fontWeight: 600,
        fontFamily: '"Poppins", sans-serif',
        height: 28, px: 1.5, fontSize: '0.75rem',
        letterSpacing: '0.5px', borderRadius: 2,
        textTransform: 'capitalize',
        bgcolor: colors.bg, color: colors.color,
        border: `1px solid ${colors.border}`
      }}
    />
  )
}

export const getBuildingColumns = ({ onViewDetail, onEdit, onDelete, theme }) => {
  const iconBtnSx = (hoverBg = theme.palette.accent.main) => ({
    bgcolor: theme.palette.chipAdmin.bg,
    border: `1px solid ${theme.palette.chipAdmin.border}`,
    borderRadius: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: hoverBg,
      borderColor: hoverBg,
      transform: 'scale(1.1)',
      '& .MuiSvgIcon-root': { color: theme.palette.primary.contrastText }
    }
  })

  return [
    {
      field: 'name',
      headerName: 'Building',
      minWidth: 200,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{
            width: 40, height: 40,
            background: theme.palette.gradient,
            color: theme.palette.primary.contrastText,
            fontWeight: 700,
            fontFamily: '"Poppins", sans-serif',
            boxShadow: theme.palette.avatarShadow
          }}>
            <Business sx={{ fontSize: 20 }} />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              fontFamily: '"Poppins", sans-serif'
            }}>
              {row.name}
            </Typography>
            {row.section && (
              <Typography variant="caption" sx={{
                color: theme.palette.text.secondary,
                fontFamily: '"Poppins", sans-serif'
              }}>
                {row.section}
              </Typography>
            )}
          </Box>
        </Box>
      )
    },
    {
      field: 'floors',
      headerName: 'Floors',
      minWidth: 100,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <Layers sx={{ fontSize: 16, color: theme.palette.secondary.main }} />
          <Typography variant="body2" sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontFamily: '"Poppins", sans-serif'
          }}>
            {row.floors ?? '—'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'totalApartments',
      headerName: 'Apartments',
      minWidth: 120,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <Apartment sx={{ fontSize: 16, color: theme.palette.info.main }} />
          <Typography variant="body2" sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontFamily: '"Poppins", sans-serif'
          }}>
            {row.totalApartments ?? '—'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'floorPlans',
      headerName: 'Floor Plans',
      minWidth: 150,
      renderCell: ({ row }) => {
        const uploaded = row.floorPlans?.length ?? 0
        const total = row.floors ?? 0
        const pct = total > 0 ? Math.round((uploaded / total) * 100) : 0
        return (
          <Box sx={{ minWidth: 120 }}>
            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
              <GridOn sx={{ fontSize: 14, color: theme.palette.accent.main }} />
              <Typography variant="caption" sx={{
                fontWeight: 600,
                fontFamily: '"Poppins", sans-serif',
                color: theme.palette.text.primary
              }}>
                {uploaded} / {total} uploaded
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                height: 4, borderRadius: 1,
                bgcolor: theme.palette.chipAdmin.bg,
                '& .MuiLinearProgress-bar': {
                  bgcolor: pct === 100 ? theme.palette.accent.main : theme.palette.secondary.main,
                  borderRadius: 1
                }
              }}
            />
          </Box>
        )
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 110,
      renderCell: ({ row }) => <StatusChip status={row.status} />
    },
    {
      field: 'actions',
      headerName: 'Actions',
      align: 'center',
      width: 150,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="View Detail" placement="top">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onViewDetail?.(row) }}
              sx={iconBtnSx()}
            >
              <Visibility sx={{ fontSize: 18, color: theme.palette.accent.main }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit" placement="top">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onEdit?.(row) }}
              sx={iconBtnSx(theme.palette.primary.main)}
            >
              <EditIcon sx={{ fontSize: 18, color: theme.palette.accent.main }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" placement="top">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete?.(row) }}
              sx={{
                bgcolor: theme.palette.chipSuperadmin.bg,
                border: `1px solid ${theme.palette.chipSuperadmin.border}`,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: theme.palette.warning.main,
                  borderColor: theme.palette.warning.main,
                  transform: 'scale(1.1)',
                  '& .MuiSvgIcon-root': { color: '#fff' }
                }
              }}
            >
              <DeleteIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]
}