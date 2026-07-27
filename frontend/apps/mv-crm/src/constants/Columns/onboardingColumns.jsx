import { Box, Chip, Typography, IconButton, Tooltip } from '@mui/material'
import { 
  CheckCircle, HourglassEmpty, RadioButtonUnchecked, 
  Visibility, Edit, Delete, Home, Apartment, Business 
} from '@mui/icons-material'

export const useOnboardingColumns = ({ t, propertiesMap = {}, onView, onEdit, onDelete }) => {
  const { lots = {}, models = {}, buildings = {}, apartments = {} } = propertiesMap

  return [
    {
      field: 'project',
      headerName: t('project', 'Proyecto'),
      minWidth: 150,
      renderCell: ({ row }) => {
        const project = row.projectId
        const name = project?.name || project?.title?.es || (typeof project === 'string' ? `ID: ${String(project).slice(-6)}` : 'N/A')
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Business fontSize="small" color="action" />
            <Typography variant="body2" fontWeight={600}>{name}</Typography>
          </Box>
        )
      }
    },
    {
      field: 'property',
      headerName: t('property', 'Propiedad'),
      minWidth: 220,
      renderCell: ({ row }) => {
        // ✅ CASO 1: Es un Apartamento
        const apt = row.apartmentId
        if (apt) {
          const buildingData = typeof apt.building === 'string' ? buildings[apt.building] : apt.building
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Apartment fontSize="small" sx={{ color: '#1976d2' }} />
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Apt {apt.apartmentNumber || (typeof apt === 'string' ? String(apt).slice(-6) : 'N/A')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {buildingData?.name || (typeof apt.building === 'string' ? `Edificio ID: ${String(apt.building).slice(-6)}` : 'Edificio')}
                </Typography>
              </Box>
            </Box>
          )
        }

        // ✅ CASO 2: Es una Propiedad / Lote
        const prop = row.propertyId
        if (prop) {
          // Subcaso A: prop es un string (ID directo de la propiedad). Lo buscamos en 'lots'
          if (typeof prop === 'string') {
            const propertyData = lots[prop] || {}
            const lotNumber = propertyData.lot?.number || propertyData.number || String(prop).slice(-6)
            const modelName = propertyData.model?.model || propertyData.model?.name || ''
            
            return (
              <Box display="flex" alignItems="center" gap={1}>
                <Home fontSize="small" sx={{ color: '#4a7c59' }} />
                <Box>
                  <Typography variant="body2" fontWeight={600}>Lote {lotNumber}</Typography>
                  {modelName && <Typography variant="caption" color="text.secondary">{modelName}</Typography>}
                </Box>
              </Box>
            )
          }

          // Subcaso B: prop es un objeto. Extraemos los IDs de lot y model
          const lotId = typeof prop.lot === 'string' ? prop.lot : prop.lot?._id
          const modelId = typeof prop.model === 'string' ? prop.model : prop.model?._id
          
          const lotData = lots[lotId] || prop.lot || {}
          const modelData = models[modelId] || prop.model || {}
          
          const lotNumber = lotData.number || lotData.lot?.number || (lotId ? String(lotId).slice(-6) : 'N/A')
          const modelName = modelData.model || modelData.name || modelData.model?.name || ''

          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Home fontSize="small" sx={{ color: '#4a7c59' }} />
              <Box>
                <Typography variant="body2" fontWeight={600}>Lote {lotNumber}</Typography>
                {modelName && <Typography variant="caption" color="text.secondary">{modelName}</Typography>}
              </Box>
            </Box>
          )
        }

        return <Typography variant="body2" color="text.secondary">N/A</Typography>
      }
    },
    {
      field: 'client',
      headerName: t('client', 'Cliente'),
      minWidth: 180,
      renderCell: ({ row }) => {
        const client = row.clientId
        const name = client && typeof client === 'object' 
          ? `${client.firstName || ''} ${client.lastName || ''}`.trim() 
          : (typeof client === 'string' ? `ID: ${String(client).slice(-6)}` : 'N/A')
        return <Typography variant="body2">{name}</Typography>
      }
    },
    {
      field: 'status',
      headerName: t('status', 'Estado'),
      minWidth: 150,
      renderCell: ({ row }) => {
        const statusColors = { not_started: 'default', in_progress: 'primary', completed: 'success' }
        const statusIcons = { 
          not_started: <RadioButtonUnchecked fontSize="small" />, 
          in_progress: <HourglassEmpty fontSize="small" />, 
          completed: <CheckCircle fontSize="small" /> 
        }
        return (
          <Chip 
            icon={statusIcons[row.status] || null}
            label={t(`onboarding.statuses.${row.status}`, row.status)} 
            size="small" 
            color={statusColors[row.status] || 'default'} 
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        )
      }
    },
    {
      field: 'progress',
      headerName: t('progress', 'Progreso'),
      minWidth: 150,
      renderCell: ({ row }) => {
        const items = row.items || []
        const completedCount = items.filter(i => i.completed).length
        const totalCount = items.length
        const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Box sx={{ flexGrow: 1, bgcolor: '#e0e0e0', borderRadius: 1, height: 6 }}>
              <Box 
                sx={{ 
                  bgcolor: progress === 100 ? '#4caf50' : '#1976d2', 
                  height: '100%', 
                  borderRadius: 1, 
                  width: `${progress}%`,
                  transition: 'width 0.3s ease-in-out'
                }} 
              />
            </Box>
            <Typography variant="caption" fontWeight={600} sx={{ minWidth: 35, textAlign: 'right' }}>
              {progress}%
            </Typography>
          </Box>
        )
      }
    },
    {
      field: 'createdAt',
      headerName: t('createdAt', 'Creado'),
      minWidth: 120,
      renderCell: ({ row }) => (
        <Typography variant="caption" color="text.secondary">
          {new Date(row.createdAt).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: t('actionstable', 'Acciones'),
      minWidth: 140,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('actions.view', 'Ver Detalles / Items')}>
            <IconButton size="small" color="primary" onClick={() => onView(row)}>
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