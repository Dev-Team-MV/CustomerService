import { useMemo, useCallback } from 'react'
import {
  Box, Typography, Avatar, IconButton,
  LinearProgress, Tooltip, Chip, Button
} from '@mui/material'
import {
  Construction, PhotoLibrary, AttachMoney,
  Visibility, Edit as EditIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import useStatusColor from '../../hooks/useStatusColor'

const PhaseCell = ({ row, isAdmin, t, onOpenPhases }) => {
  const getPhaseProgress = useCallback((property) => {
    if (!property.phases?.length) return { current: 1, total: 9, percentage: 0, completed: 0 }
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
        <Construction sx={{ fontSize: 16, color: '#8CA551' }} />
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#333F1F', fontFamily: '"Poppins", sans-serif', fontSize: '0.8rem' }}>
          {t('property:table.phase')} {p.current} / {p.total}
        </Typography>
      </Box>
      <Tooltip title={t('property:table.phasesCompleted', { count: p.completed })}>
        <LinearProgress
          variant="determinate"
          value={p.percentage}
          sx={{
            height: 6, borderRadius: 1,
            bgcolor: 'rgba(140, 165, 81, 0.12)',
            '& .MuiLinearProgress-bar': { bgcolor: p.percentage === 100 ? '#8CA551' : '#333F1F', borderRadius: 1 }
          }}
        />
      </Tooltip>
      <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
        {p.completed} {t('property:table.completed')} • {p.percentage}%
      </Typography>
      <Button
        size="small"
        variant="outlined"
        startIcon={<PhotoLibrary sx={{ fontSize: 14 }} />}
        onClick={(e) => { e.stopPropagation(); onOpenPhases(row) }}
        sx={{
          mt: 1, fontSize: '0.7rem', textTransform: 'none',
          fontFamily: '"Poppins", sans-serif', fontWeight: 600,
          color: '#333F1F', borderColor: 'rgba(51, 63, 31, 0.3)',
          '&:hover': { borderColor: '#333F1F', bgcolor: 'rgba(51, 63, 31, 0.04)' }
        }}
      >
        {isAdmin ? t('property:actions.managePhases') : t('property:actions.viewProgress')}
      </Button>
    </Box>
  )
}

const StatusCell = ({ status, t }) => {
  const colors = useStatusColor(status)
  return (
    <Chip
      label={t(`property:status.${status || 'pending'}`)}
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
  isAdmin, t,
  onViewDetails, onEdit, onDelete,
  onOpenPhases, onOpenContracts
}) => {
  return useMemo(() => {
    const avatarSx = {
      width: 40, height: 40,
      bgcolor: 'transparent',
      background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
      color: 'white', fontWeight: 700,
      fontSize: '0.9rem',
      fontFamily: '"Poppins", sans-serif',
      border: '2px solid rgba(255, 255, 255, 0.9)',
      boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
    }

    const iconBtnSx = (color = '#8CA551', hoverBg = '#8CA551') => ({
      bgcolor: `rgba(140, 165, 81, 0.08)`,
      border: `1px solid rgba(140, 165, 81, 0.2)`,
      borderRadius: 2,
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: hoverBg,
        borderColor: hoverBg,
        transform: 'scale(1.1)',
        '& .MuiSvgIcon-root': { color: 'white' }
      }
    })

    const columns = [
      {
        field: 'lot',
        headerName: t('property:table.lotInfo'),
        minWidth: 150,
        renderCell: ({ row }) => (
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={avatarSx}>{row.lot?.number}</Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', fontFamily: '"Poppins", sans-serif' }}>
                {t('property:table.lot')} {row.lot?.number}
              </Typography>
              <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem' }}>
                {t('property:table.section')} {row.lot?.section || 'N/A'}
              </Typography>
            </Box>
          </Box>
        )
      },
      {
        field: 'model',
        headerName: t('property:table.model'),
        minWidth: 120,
        renderCell: ({ row }) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', fontFamily: '"Poppins", sans-serif' }}>
              {row.model?.model || 'N/A'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem' }}>
              {row.model?.bedrooms}BR / {row.model?.bathrooms}BA
            </Typography>
          </Box>
        )
      },
      {
        field: 'facade',
        headerName: t('property:table.facade'),
        minWidth: 120,
        renderCell: ({ row }) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a', fontFamily: '"Poppins", sans-serif' }}>
              {row.facade?.title || t('property:table.notSelected')}
            </Typography>
            {row.facade?.price > 0 && (
              <Typography variant="caption" sx={{ color: '#8CA551', fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: '0.7rem' }}>
                +${row.facade.price.toLocaleString()}
              </Typography>
            )}
          </Box>
        )
      },
      {
        field: 'user',
        headerName: t('property:table.residentOwner'),
        minWidth: 180,
        renderCell: ({ row }) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={avatarSx}>
              {row.users?.[0]?.firstName?.charAt(0) || row.client?.firstName?.charAt(0) || '?'}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a', fontFamily: '"Poppins", sans-serif' }}>
                {row.users?.[0]?.firstName || row.client?.firstName || 'N/A'}{' '}
                {row.users?.[0]?.lastName  || row.client?.lastName  || ''}
              </Typography>
              <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem' }}>
                {row.users?.[0]?.email || row.client?.email || t('property:table.noEmail')}
              </Typography>
            </Box>
          </Box>
        )
      },
      {
        field: 'status',
        headerName: t('property:table.status'),
        minWidth: 100,
        renderCell: ({ row }) => <StatusCell status={row.status} t={t} />
      },
      {
        field: 'phases',
        headerName: t('property:table.constructionPhase'),
        minWidth: 200,
        renderCell: ({ row }) => <PhaseCell row={row} isAdmin={isAdmin} t={t} onOpenPhases={onOpenPhases} />
      },
      {
        field: 'price',
        headerName: t('property:table.price'),
        minWidth: 140,
        renderCell: ({ row }) => (
          <Box>
            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
              <AttachMoney sx={{ fontSize: 16, color: '#8CA551' }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
                {(row.presalePrice || row.price)?.toLocaleString()}
              </Typography>
            </Box>
            {row.pending > 0 && (
              <Typography variant="caption" sx={{ color: '#E5863C', fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: '0.7rem', display: 'block' }}>
                {t('property:table.pending')}: ${row.pending?.toLocaleString()}
              </Typography>
            )}
            {row.initialPayment > 0 && (
              <Typography variant="caption" sx={{ color: '#8CA551', fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: '0.7rem', display: 'block' }}>
                {t('property:table.paid')}: ${row.initialPayment?.toLocaleString()}
              </Typography>
            )}
          </Box>
        )
      }
    ]

    if (isAdmin) {
      columns.push({
        field: 'contracts',
        headerName: t('property:table.contracts'),
        align: 'center',
        width: 100,
        renderCell: ({ row }) => (
          <Tooltip title={t('property:actions.manageContracts')} placement="top">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onOpenContracts(row) }} sx={iconBtnSx()}>
              <DescriptionIcon sx={{ fontSize: 18, color: '#8CA551' }} />
            </IconButton>
          </Tooltip>
        )
      })
    }

    columns.push({
      field: 'actions',
      headerName: t('property:table.actions'),
      align: 'center',
      width: 160,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title={t('property:actions.viewDetails')} placement="top">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onViewDetails(row) }} sx={iconBtnSx()}>
              <Visibility sx={{ fontSize: 18, color: '#8CA551' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('property:actions.editPrice')} placement="top">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(row) }} sx={iconBtnSx('#8CA551', '#333F1F')}>
              <EditIcon sx={{ fontSize: 18, color: '#8CA551' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('property:actions.deleteProperty')} placement="top">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(row) }}
              sx={{
                bgcolor: 'rgba(229, 134, 60, 0.08)',
                border: '1px solid rgba(229, 134, 60, 0.2)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': { bgcolor: '#E5863C', borderColor: '#E5863C', transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } }
              }}
            >
              <DeleteIcon sx={{ fontSize: 18, color: '#E5863C' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    })

    return columns
  }, [isAdmin, t, onViewDetails, onEdit, onDelete, onOpenPhases, onOpenContracts])
}