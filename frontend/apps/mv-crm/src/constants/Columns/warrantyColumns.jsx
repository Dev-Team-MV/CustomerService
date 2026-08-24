import { Chip, Typography, Box, IconButton, Tooltip } from '@mui/material'
import { 
  Warning, PriorityHigh, Emergency, 
  Visibility, Delete, CheckCircle 
} from '@mui/icons-material'

export const useWarrantyColumns = ({ t, propertiesMap = {}, onView, onEdit, onDelete, onResolve }) => {
  const { lots = {}, models = {}, buildings = {}, apartments = {} } = propertiesMap

  return [
    {
      field: 'client',
      headerName: t('warranty.client', 'Cliente'),
      tourId: 'warranty-col-client',
      minWidth: 150,
      renderCell: ({ row }) => {
        const client = row.clientId
        const name = client && typeof client === 'object' 
          ? `${client.firstName || ''} ${client.lastName || ''}`.trim() 
          : (typeof client === 'string' ? client : 'N/A')
        return (
          <Typography variant="body2" fontWeight={600}>
            {name}
          </Typography>
        )
      }
    },
    {
      field: 'project',
      headerName: t('filters.project', 'Proyecto'),
      tourId: 'warranty-col-project',
      minWidth: 150,
      renderCell: ({ row }) => {
        const project = row.projectId
        const name = project?.name || project?.title?.es || project?.title?.en || 'N/A'
        return (
          <Typography variant="body2" fontWeight={600} color="primary">
            {name}
          </Typography>
        )
      }
    },
    {
      field: 'property',
      headerName: t('warranty.property', 'Unidad'),
      tourId: 'warranty-col-property',
      minWidth: 200,
      renderCell: ({ row }) => {
        const apt = row.apartmentId || row.apartment
        if (apt) {
          const aptData = typeof apt === 'string' ? apartments[apt] : apt
          if (aptData) {
            const buildingData = typeof aptData.building === 'string' ? buildings[aptData.building] : aptData.building
            const buildingName = buildingData?.name || buildingData?._id?.slice(-6) || 'Edificio'
            return (
              <Box>
                <Typography variant="body2" fontWeight={700}>Apt {aptData.apartmentNumber || 'N/A'}</Typography>
                <Typography variant="caption" color="text.secondary">{buildingName} • Piso {aptData.floorNumber || 'N/A'}</Typography>
              </Box>
            )
          }
        }

        const prop = row.propertyId || row.property
        if (prop) {
          const lotData = typeof prop.lot === 'string' ? lots[prop.lot] : prop.lot
          const modelData = typeof prop.model === 'string' ? models[prop.model] : prop.model
          const lotLabel = lotData?.number || lotData?.name || (typeof prop.lot === 'string' ? prop.lot.slice(-6) : 'N/A')
          const modelLabel = modelData?.name || modelData?.model || 'Modelo'
          
          return (
            <Box>
              <Typography variant="body2" fontWeight={700}>Lote {lotLabel}</Typography>
              <Typography variant="caption" color="text.secondary">{modelLabel}</Typography>
            </Box>
          )
        }
        return <Typography variant="body2">N/A</Typography>
      }
    },
    {
      field: 'category',
      headerName: t('warranty.category', 'Categoría'),
      tourId: 'warranty-col-category',
      minWidth: 140,
      renderCell: ({ row }) => (
        <Typography variant="body2" textTransform="capitalize">
          {t(`warranty.categories.${row.category}`, row.category)}
        </Typography>
      )
    },
    {
      field: 'priority',
      headerName: t('warranty.priority', 'Prioridad'),
      tourId: 'warranty-col-priority',
      minWidth: 130,
      renderCell: ({ row }) => {
        const config = {
          low: { color: 'default', icon: null },
          medium: { color: 'info', icon: <Warning fontSize="small" /> },
          high: { color: 'warning', icon: <PriorityHigh fontSize="small" /> },
          emergency: { color: 'error', icon: <Emergency fontSize="small" /> }
        }
        const c = config[row.priority] || config.low
        
        return (
          <Chip 
            icon={c.icon}
            label={t(`warranty.priorities.${row.priority}`, row.priority)} 
            size="small" 
            color={c.color}
            sx={{ fontWeight: 700, textTransform: 'capitalize' }}
          />
        )
      }
    },
    {
      field: 'status',
      headerName: t('filters.status', 'Estado'),
      tourId: 'warranty-col-status',
      minWidth: 140,
      renderCell: ({ row }) => {
        const statusColors = {
          submitted: 'default',
          under_review: 'info',
          approved: 'primary',
          in_progress: 'warning',
          resolved: 'success',
          rejected: 'error'
        }
        
        return (
          <Chip 
            label={t(`warranty.statuses.${row.status}`, row.status)} 
            size="small" 
            color={statusColors[row.status] || 'default'} 
            variant="outlined"
            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
          />
        )
      }
    },
    {
      field: 'createdAt',
      headerName: t('warranty.date', 'Fecha'),
      tourId: 'warranty-col-date',
      minWidth: 120,
      renderCell: ({ row }) => (
        <Typography variant="caption" color="text.secondary">
          {new Date(row.createdAt).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: t('filters.actionsTable', 'Acciones'),
      minWidth: 120, // Reducido un poco ya que a veces solo habrá 1 botón
      tourId: 'warranty-col-actions',
      sortable: false,
      renderCell: ({ row }) => {
        // ✅ Verificamos si el reclamo ya fue finalizado
        const isFinalized = row.status === 'resolved' || row.status === 'rejected'

        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {/* El botón de Ver Detalles siempre se muestra */}
            <Tooltip title={t('actions.view', 'Ver Detalles')}>
              <IconButton id="warranty-action-view" size="small" color="primary" onClick={() => onView(row)}>
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            
            {/* Los botones de Resolver y Eliminar SOLO se muestran si NO está finalizado */}
            {!isFinalized && (
              <>
                <Tooltip title={t('actions.resolve', 'Resolver/Rechazar')}>
                  <IconButton  size="small" color="success" onClick={() => onResolve(row)}>
                    <CheckCircle fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title={t('actions.delete', 'Eliminar')}>
                  <IconButton size="small" color="error" onClick={() => onDelete(row)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        )
      }
    }
  ]
}