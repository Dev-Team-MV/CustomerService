import { Box, Typography, Chip, Button, IconButton, Tooltip } from '@mui/material'
import { Edit, Delete, CheckCircle, Cancel } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

export const useReferralProgramColumns = ({ t, onEdit, onDelete }) => {
  return [
    {
      field: 'project',
      headerName: t('columns.project', 'Proyecto'),
      minWidth: 180,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight={600}>
          {row.projectId?.name || (typeof row.projectId === 'string' ? row.projectId.slice(-6) : 'N/A')}
        </Typography>
      )
    },
    {
      field: 'name',
      headerName: t('program.name', 'Nombre del Programa'),
      minWidth: 200,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight={500}>{row.name}</Typography>
      )
    },
    {
      field: 'reward',
      headerName: t('program.reward', 'Recompensa'),
      minWidth: 180,
      renderCell: ({ row }) => (
        <Box>
          {/* ✅ Lógica adaptativa para mostrar Cash o Descuento */}
          {row.rewardType === 'property_discount' ? (
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {row.discountPercent || 0}% {t('common.discount', 'Descuento')}
            </Typography>
          ) : (
            <Typography variant="body2" fontWeight={600}>
              ${Number(row.rewardPerReferral || 0).toLocaleString()}
            </Typography>
          )}
          
          <Typography variant="caption" color="text.secondary" textTransform="capitalize">
            {row.rewardType === 'property_discount' 
              ? t('program.types.property_discount', 'Descuento en Propiedad') 
              : t('program.types.cash', 'Efectivo')}
          </Typography>
        </Box>
      )
    },
    {
      field: 'maxReferrals',
      headerName: t('program.maxReferrals', 'Máx. por Usuario'),
      minWidth: 150,
      renderCell: ({ row }) => (
        <Typography variant="body2">
          {row.maxReferralsPerUser > 0 ? row.maxReferralsPerUser : t('common.unlimited', 'Ilimitado')}
        </Typography>
      )
    },
    {
      field: 'isActive',
      headerName: t('program.isActive', 'Estado'),
      minWidth: 120,
      renderCell: ({ row }) => (
        <Chip 
          icon={row.isActive ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
          label={row.isActive ? t('common.active', 'Activo') : t('common.inactive', 'Inactivo')}
          size="small"
          color={row.isActive ? 'success' : 'default'}
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      )
    },
    {
      field: 'actions',
      headerName: t('columns.actions', 'Acciones'),
      minWidth: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('actions.edit', 'Editar')}>
            <IconButton size="small" color="primary" onClick={() => onEdit(row)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('actions.delete', 'Eliminar')}>
            <IconButton size="small" color="error" onClick={() => onDelete(row)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]
}