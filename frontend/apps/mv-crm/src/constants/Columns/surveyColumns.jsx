import { Chip, Box, Typography, Rating, IconButton, Tooltip } from '@mui/material'
import { Apartment, Home, Visibility, Edit, Delete } from '@mui/icons-material'

export const useSurveyColumns = ({ t, propertiesMap = {}, onView, onEdit, onDelete }) => {
  const { lots = {}, models = {}, buildings = {}, apartments = {} } = propertiesMap

  return [
    {
      field: 'client',
      headerName: t('survey.client', 'Cliente'),
      minWidth: 180,
      tourId: 'survey-col-client', // ✅
      renderCell: ({ row }) => {
        const client = row.clientId
        const name = client && typeof client === 'object' 
          ? `${client.firstName || ''} ${client.lastName || ''}`.trim() 
          : (typeof client === 'string' ? `ID: ${client.slice(-6)}` : t('common.na', 'N/A'))
        return <Typography variant="body2" fontWeight={600}>{name}</Typography>
      }
    },
    {
      field: 'project',
      headerName: t('survey.project', 'Proyecto'),
      minWidth: 150,
      tourId: 'survey-col-project', // ✅
      renderCell: ({ row }) => {
        const project = row.projectId
        const name = project?.name || project?.title?.es || project?.title?.en || t('common.na', 'N/A')
        return <Typography variant="body2" fontWeight={600} color="primary">{name}</Typography>
      }
    },
    {
      field: 'propertyReference',
      headerName: t('survey.property', 'Unidad'),
      minWidth: 220,
      tourId: 'survey-col-property', // ✅
      renderCell: ({ row }) => {
        const apt = row.apartmentId
        if (apt) {
          const aptData = typeof apt === 'string' ? apartments[apt] : apt
          if (aptData) {
            const buildingData = typeof aptData.building === 'string' ? buildings[aptData.building] : aptData.building
            const buildingName = buildingData?.name || (typeof aptData.building === 'string' ? aptData.building.slice(-6) : t('common.na', 'N/A'))
            return (
              <Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Apartment fontSize="small" sx={{ color: '#1976d2' }} />
                  <Typography variant="body2" fontWeight={700}>{t('surveys.apartment', 'Apt')} {aptData.apartmentNumber || t('common.na', 'N/A')}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 3 }}>{buildingName} • {t('warranty.floor', 'Piso')} {aptData.floorNumber || t('common.na', 'N/A')}</Typography>
              </Box>
            )
          }
        }
        const prop = row.propertyId
        if (prop) {
          const lotData = typeof prop.lot === 'string' ? lots[prop.lot] : prop.lot
          const modelData = typeof prop.model === 'string' ? models[prop.model] : prop.model
          const lotNumber = lotData?.number || lotData?.name || (typeof prop.lot === 'string' ? prop.lot.slice(-6) : t('common.na', 'N/A'))
          const modelName = modelData?.name || modelData?.model || t('common.na', 'N/A')
          return (
            <Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Home fontSize="small" sx={{ color: '#4a7c59' }} />
                <Typography variant="body2" fontWeight={700}>{t('onboarding.lot', 'Lote')} {lotNumber}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 3 }}>{modelName}</Typography>
            </Box>
          )
        }
        return <Typography variant="body2" color="text.secondary">{t('common.na', 'N/A')}</Typography>
      }
    },
    {
      field: 'type',
      headerName: t('filters.type', 'Tipo'),
      minWidth: 120,
      tourId: 'survey-col-type', // ✅
      renderCell: ({ row }) => (
        <Typography variant="body2" textTransform="capitalize">{t(`survey.types.${row.type}`, row.type)}</Typography>
      )
    },
    {
      field: 'npsScore',
      headerName: t('survey.nps', 'NPS'),
      minWidth: 100,
      tourId: 'survey-col-nps', // ✅
      renderCell: ({ row }) => {
        const score = row.npsScore
        let color = 'error'
        let label = t('surveys.detractor', 'Detractor')
        if (score >= 9) { color = 'success'; label = t('surveys.promoter', 'Promotor') } 
        else if (score >= 7) { color = 'warning'; label = t('surveys.neutral', 'Neutro') }
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Chip label={score !== undefined && score !== null ? score : '-'} size="small" color={color} sx={{ fontWeight: 800, minWidth: 40, mb: 0.5 }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{label}</Typography>
          </Box>
        )
      }
    },
    {
      field: 'overallRating',
      headerName: t('survey.rating', 'Calificación'),
      minWidth: 150,
      tourId: 'survey-col-rating', // ✅
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Rating value={row.overallRating || 0} readOnly size="small" precision={0.5} sx={{ color: '#ffb300' }} />
          <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>({row.overallRating || 0}/5)</Typography>
        </Box>
      )
    },
    {
      field: 'createdAt',
      headerName: t('warranty.date', 'Fecha'),
      minWidth: 120,
      tourId: 'survey-col-date', // ✅
      renderCell: ({ row }) => (
        <Typography variant="caption" color="text.secondary">{new Date(row.createdAt).toLocaleDateString()}</Typography>
      )
    },
    {
      field: 'actions',
      headerName: t('filters.actionsTable', 'Acciones'),
      minWidth: 140,
      sortable: false,
      tourId: 'survey-col-actions', // ✅
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('actions.view', 'Ver Detalles')}>
            {/* ✅ ID específico para el botón de ver */}
            <IconButton id="survey-action-view" size="small" color="primary" onClick={() => onView(row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('actions.edit', 'Editar')}>
            <IconButton size="small" color="info" onClick={() => onEdit(row)}>
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