import { Box, Typography, Chip, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'

export const useReferralColumns = ({ t, referrerMap = {}, projects = [], onAction }) => {
  return [
    {
      field: 'referrer',
      headerName: t('columns.referrer', 'Referidor'),
      minWidth: 180,
      renderCell: ({ row }) => {
        const refId = typeof row.referrerId === 'object' ? row.referrerId._id : row.referrerId
        const refName = typeof row.referrerId === 'object' 
          ? `${row.referrerId.firstName} ${row.referrerId.lastName}`.trim() 
          : referrerMap[refId]
        
        return (
          <Typography variant="body2" fontWeight={600}>
            {refName || (refId ? `ID: ${String(refId).slice(-6)}` : 'N/A')}
          </Typography>
        )
      }
    },
    {
      field: 'referred',
      headerName: t('columns.referred', 'Referido'),
      minWidth: 180,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{row.referredName || 'N/A'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.referredEmail || row.referredPhone || 'Sin contacto'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'project',
      headerName: t('columns.project', 'Proyecto'),
      minWidth: 150,
      renderCell: ({ row }) => {
        const projId = typeof row.projectId === 'object' ? row.projectId._id : row.projectId
        const projName = typeof row.projectId === 'object' ? row.projectId.name : projects.find(p => p._id === projId)?.name
        
        return <Typography variant="body2">{projName || 'N/A'}</Typography>
      }
    },
    {
      field: 'status',
      headerName: t('columns.status', 'Estado'),
      minWidth: 150,
      renderCell: ({ row }) => {
        const colors = {
          pending: 'default',
          contacted: 'info',
          qualified: 'primary',
          converted: 'success',
          reward_pending: 'warning',
          reward_paid: 'success',
          expired: 'error'
        }
        return (
          <Chip 
            label={t(`statuses.${row.status}`, row.status)} 
            size="small" 
            color={colors[row.status] || 'default'} 
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        )
      }
    },
    {
      field: 'reward',
      headerName: t('columns.reward', 'Recompensa'),
      minWidth: 150,
      renderCell: ({ row }) => {
        // ✅ Lógica adaptativa para Cash vs Descuento en Propiedad
        if (row.rewardType === 'property_discount' && row.discountPercent) {
          return (
            <Box>
              <Typography variant="body2" fontWeight={600} color="primary.main">
                {row.discountPercent}% {t('common.discount', 'Descuento')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('program.types.property_discount', 'En Propiedad')}
              </Typography>
            </Box>
          )
        }
        
        // Fallback para cash o valores por defecto
        const amount = row.rewardAmount || 0
        return (
          <Typography variant="body2" fontWeight={600} color={row.rewardPaidAt ? 'success.main' : 'text.primary'}>
            {amount > 0 ? `$${Number(amount).toLocaleString()}` : '-'}
          </Typography>
        )
      }
    },
    {
      field: 'actions',
      headerName: t('columns.actions', 'Acciones'),
      minWidth: 220,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {row.status !== 'converted' && row.status !== 'reward_paid' && row.status !== 'expired' && (
            <Button size="small" variant="outlined" color="primary" onClick={() => onAction(row, 'convert')}>
              {t('actions.convert')}
            </Button>
          )}
          {row.status === 'converted' && !row.rewardPaidAt && (
            <Button size="small" variant="outlined" color="success" onClick={() => onAction(row, 'approve')}>
              {t('actions.approveReward')}
            </Button>
          )}
        </Box>
      )
    }
  ]
}