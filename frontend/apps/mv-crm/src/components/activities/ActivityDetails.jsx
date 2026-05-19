// frontend/apps/mv-crm/src/components/activities/ActivityDetails.jsx
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Divider,
  Button,
  Paper
} from '@mui/material'
import { 
  Close, 
  Edit, 
  Delete,
  AccessTime,
  Person,
  Email,
  Phone,
  Label
} from '@mui/icons-material'
import { ACTIVITY_PRIORITIES } from '../../constants/hooks/useActivities'

const ActivityDetails = ({ 
  activity, 
  open, 
  onClose, 
  onEdit, 
  onDelete
}) => {
  if (!activity) return null

  const priority = ACTIVITY_PRIORITIES.find(p => p.id === activity.priority)
  
  // columnId viene populado del backend
  const column = typeof activity.columnId === 'object' ? activity.columnId : null
  
  // assignedTo viene populado del backend
  const assignee = activity.assignedTo

  const formatDate = (date) => {
    if (!date) return 'Sin fecha'
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 420, p: 0 } }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: column?.color || '#757575',
          color: 'white'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            {column && (
              <Chip
                label={column.name}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 1 }}
              />
            )}
            <Typography variant="h6" fontWeight={700}>
              {activity.title}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
        {/* Prioridad y Tags */}
        <Box display="flex" gap={1} mb={3} flexWrap="wrap">
          <Chip
            label={priority?.label || 'Media'}
            sx={{
              bgcolor: `${priority?.color || '#2196f3'}20`,
              color: priority?.color || '#2196f3',
              fontWeight: 600
            }}
          />
          {activity.tags?.map((tag, idx) => (
            <Chip
              key={idx}
              label={tag}
              size="small"
              icon={<Label sx={{ fontSize: 14 }} />}
              variant="outlined"
            />
          ))}
        </Box>

        {/* Descripción */}
        {activity.description && (
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Descripción
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activity.description}
            </Typography>
          </Box>
        )}

        {/* Fecha */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <AccessTime sx={{ fontSize: 20, color: '#757575' }} />
          <Typography variant="body2">
            {formatDate(activity.dueDate)}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Asignado */}
        {assignee && (
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
              Asignado a
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: '#2196f3' }}>
                  {assignee.firstName?.charAt(0) || '?'}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>
                    {`${assignee.firstName || ''} ${assignee.lastName || ''}`.trim()}
                  </Typography>
                  {assignee.email && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Email sx={{ fontSize: 14, color: '#757575' }} />
                      <Typography variant="caption" color="text.secondary">
                        {assignee.email}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Info adicional */}
        <Box mb={2}>
          <Typography variant="caption" color="text.secondary">
            Posición: {activity.position}
          </Typography>
        </Box>
      </Box>

      {/* Footer Actions */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => onEdit?.(activity)}
            fullWidth
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => onDelete?.(activity._id)}
            fullWidth
          >
            Eliminar
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default ActivityDetails