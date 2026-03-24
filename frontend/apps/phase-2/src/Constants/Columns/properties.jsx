import { useMemo, useCallback } from 'react'
import {
  Box, Typography, Avatar, IconButton,
  LinearProgress, Tooltip, Chip, Button
} from '@mui/material'
import {
  Construction, PhotoLibrary, AttachMoney,
  Visibility, Edit as EditIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  Person
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

// Mock status color hook
const useStatusColor = (status) => {
  const theme = useTheme()
  if (status === 'active') {
    return { bg: theme.palette.chipAdmin.bg, color: theme.palette.chipAdmin.color, border: theme.palette.chipAdmin.border }
  }
  if (status === 'sold') {
    return { bg: theme.palette.chipSuperadmin.bg, color: theme.palette.chipSuperadmin.color, border: theme.palette.chipSuperadmin.border }
  }
  return { bg: theme.palette.chipResident.bg, color: theme.palette.chipResident.color, border: theme.palette.chipResident.border }
}

const PhaseCell = ({ row, isAdmin, t, onOpenPhases }) => {
  const theme = useTheme()
  const getPhaseProgress = useCallback((property) => {
    if (!property.phases?.length) return { current: 1, total: 5, percentage: 0, completed: 0 }
    const totalPhases     = property.phases.length
    const completedPhases = property.phases.filter(p => p.constructionPercentage === 100).length
    const avgProgress     = property.phases.reduce((s, p) => s + (p.constructionPercentage || 0), 0) / totalPhases
    const firstIncomplete = property.phases.findIndex(p => p.constructionPercentage < 100)
    return {
      current:    firstIncomplete === -1 ? totalPhases : firstIncomplete + 1,
      completed:  completedPhases,
      total:      totalPhases,
      percentage: Math.round(avgProgress)
    }
  }, [])

  const p = getPhaseProgress(row)
  return (
    <Box sx={{ minWidth: 140 }}>
      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
        <Construction sx={{ fontSize: 16, color: theme.palette.accent.main }} />
        <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif', fontSize: '0.8rem' }}>
          {t ? t('property:table.phase') : 'Phase'} {p.current} / {p.total}
        </Typography>
      </Box>
      <Tooltip title={t ? t('property:table.phasesCompleted', { count: p.completed }) : `${p.completed} completed`}>
        <LinearProgress
          variant="determinate"
          value={p.percentage}
          sx={{
            height: 6, borderRadius: 1,
            bgcolor: theme.palette.chipAdmin.bg,
            '& .MuiLinearProgress-bar': { bgcolor: p.percentage === 100 ? theme.palette.accent.main : theme.palette.primary.main, borderRadius: 1 }
          }}
        />
      </Tooltip>
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
        {p.completed} {t ? t('property:table.completed') : 'completed'} • {p.percentage}%
      </Typography>
      <Button
        size="small"
        variant="outlined"
        startIcon={<PhotoLibrary sx={{ fontSize: 14 }} />}
        onClick={(e) => { e.stopPropagation(); onOpenPhases && onOpenPhases(row) }}
        sx={{
          mt: 1, fontSize: '0.7rem', textTransform: 'none',
          fontFamily: '"Poppins", sans-serif', fontWeight: 600,
          color: theme.palette.primary.main, borderColor: theme.palette.primary.main,
          '&:hover': { borderColor: theme.palette.accent.main, bgcolor: theme.palette.chipAdmin.bg }
        }}
      >
        {isAdmin ? (t ? t('property:actions.managePhases') : 'Manage phases') : (t ? t('property:actions.viewProgress') : 'View progress')}
      </Button>
    </Box>
  )
}

const StatusCell = ({ status, t }) => {
  const colors = useStatusColor(status)
  return (
    <Chip
      label={t ? t(`property:status.${status || 'pending'}`) : status}
      size="small"
      sx={{
        fontWeight: 600, fontFamily: '"Poppins", sans-serif',
        height: 28, px: 1.5, fontSize: '0.75rem',
        letterSpacing: '0.5px', borderRadius: 2,
        textTransform: 'capitalize',
        bgcolor: colors.bg, color: colors.color,
        border: `1px solid ${colors.border}`
      }}
    />
  )
}

export const usePropertyColumns = ({
  isAdmin = false, t,
  onViewDetails, onEdit, onDelete,
  onOpenPhases, onOpenContracts
}) => {
  const theme = useTheme()
  return useMemo(() => {
    const avatarSx = {
      width: 40, height: 40,
      bgcolor: 'transparent',
      background: theme.palette.gradientInfo,
      color: theme.palette.primary.contrastText,
      fontWeight: 700,
      fontSize: '0.9rem',
      fontFamily: '"Poppins", sans-serif',
      border: `2px solid ${theme.palette.background.paper}`,
      boxShadow: theme.palette.avatarShadow
    }

    const iconBtnSx = (color = theme.palette.accent.main, hoverBg = theme.palette.accent.main) => ({
      bgcolor: theme.palette.chipAdmin.bg,
      border: `1px solid ${theme.palette.chipAdmin.border}`,
      borderRadius: 2,
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: hoverBg,
        borderColor: hoverBg,
        transform: 'scale(1.1)',
        '& .MuiSvgIcon-root': { color: theme.palette.secondary.contrastText }
      }
    })

    const columns = [
      {
        field: 'name',
        headerName: t ? t('property:table.name') : 'Name',
        minWidth: 160,
        renderCell: ({ row }) => (
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={avatarSx}>
              <Person />
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary, fontFamily: '"Poppins", sans-serif' }}>
              {row.name}
            </Typography>
          </Box>
        )
      },
      {
        field: 'status',
        headerName: t ? t('property:table.status') : 'Status',
        minWidth: 100,
        renderCell: ({ row }) => <StatusCell status={row.status} t={t} />
      },
      {
        field: 'building',
        headerName: t ? t('property:table.building') : 'Building',
        minWidth: 140,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary, fontFamily: '"Poppins", sans-serif' }}>
            {row.building}
          </Typography>
        )
      },
      {
        field: 'model',
        headerName: t ? t('property:table.model') : 'Model',
        minWidth: 120,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary, fontFamily: '"Poppins", sans-serif' }}>
            {row.model}
          </Typography>
        )
      },
      {
        field: 'resident',
        headerName: t ? t('property:table.resident') : 'Resident',
        minWidth: 140,
        renderCell: ({ row }) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.info.main, fontSize: '1rem' }}>
              <Person />
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.info.main, fontFamily: '"Poppins", sans-serif' }}>
              {row.resident}
            </Typography>
          </Box>
        )
      },
      {
        field: 'phases',
        headerName: t ? t('property:table.constructionPhase') : 'Phases',
        minWidth: 200,
        renderCell: ({ row }) => <PhaseCell row={row} isAdmin={isAdmin} t={t} onOpenPhases={onOpenPhases} />
      },
      {
        field: 'price',
        headerName: t ? t('property:table.price') : 'Price',
        minWidth: 100,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontFamily: '"Poppins", sans-serif' }}>
            ${row.price?.toLocaleString()}
          </Typography>
        )
      }
    ]

    if (isAdmin) {
      columns.push({
        field: 'contracts',
        headerName: t ? t('property:table.contracts') : 'Contracts',
        align: 'center',
        width: 100,
        renderCell: ({ row }) => (
          <Tooltip title={t ? t('property:actions.manageContracts') : 'Manage contracts'} placement="top">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onOpenContracts && onOpenContracts(row) }} sx={iconBtnSx()}>
              <DescriptionIcon sx={{ fontSize: 18, color: theme.palette.accent.main }} />
            </IconButton>
          </Tooltip>
        )
      })
    }

    columns.push({
      field: 'actions',
      headerName: t ? t('property:table.actions') : 'Actions',
      align: 'center',
      width: 160,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title={t ? t('property:actions.viewDetails') : 'View'} placement="top">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onViewDetails && onViewDetails(row) }} sx={iconBtnSx()}>
              <Visibility sx={{ fontSize: 18, color: theme.palette.accent.main }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t ? t('property:actions.editPrice') : 'Edit'} placement="top">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit && onEdit(row) }} sx={iconBtnSx(theme.palette.accent.main, theme.palette.primary.main)}>
              <EditIcon sx={{ fontSize: 18, color: theme.palette.accent.main }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t ? t('property:actions.deleteProperty') : 'Delete'} placement="top">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete && onDelete(row) }}
              sx={{
                bgcolor: theme.palette.chipSuperadmin.bg,
                border: `1px solid ${theme.palette.chipSuperadmin.border}`,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': { bgcolor: theme.palette.warning.main, borderColor: theme.palette.warning.main, transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: theme.palette.secondary.contrastText } }
              }}
            >
              <DeleteIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    })

    return columns
  }, [isAdmin, t, onViewDetails, onEdit, onDelete, onOpenPhases, onOpenContracts, theme])
}