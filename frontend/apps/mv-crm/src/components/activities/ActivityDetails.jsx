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
  Business,
  Person,
  Email,
  Phone,
  Notes
} from '@mui/icons-material'
import SubActivityList from './SubActivityList'
import { 
  ACTIVITY_STATUSES, 
  ACTIVITY_CATEGORIES, 
  ACTIVITY_PRIORITIES 
} from '../../constants/hooks/useActivities'

const ActivityDetails = ({ 
  activity, 
  open, 
  onClose, 
  onEdit, 
  onDelete,
  onAddSubActivity,
  onUpdateSubActivity,
  onDeleteSubActivity
}) => {
  if (!activity) return null

  const status = ACTIVITY_STATUSES.find(s => s.id === activity.status)
  const category = ACTIVITY_CATEGORIES.find(c => c.id === activity.category)
  const priority = ACTIVITY_PRIORITIES.find(p => p.id === activity.priority)
  const contact = activity.relatedUser || activity.externalContact
  const isExternal = !activity.relatedUser && activity.externalContact

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
          bgcolor: status?.color || '#9e9e9e',
          color: 'white'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Chip
              label={`${category?.icon || '📌'} ${category?.label || activity.category}`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 1 }}
            />
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
        {/* Estado y Prioridad */}
        <Box display="flex" gap={1} mb={3}>
          <Chip
            label={status?.label || activity.status}
            sx={{
              bgcolor: `${status?.color}20`,
              color: status?.color,
              fontWeight: 600
            }}
          />
          <Chip
            label={priority?.label || 'Media'}
            sx={{
              bgcolor: `${priority?.color}20`,
              color: priority?.color,
              fontWeight: 600
            }}
          />
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

        {/* Proyecto */}
        {activity.project && (
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Business sx={{ fontSize: 20, color: '#757575' }} />
            <Typography variant="body2">
              {activity.project.name}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Contacto */}
        {contact && (
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
              {isExternal ? 'Contacto externo' : 'Usuario relacionado'}
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: isExternal ? '#ff9800' : '#2196f3' }}>
                  {contact.name?.charAt(0) || '?'}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>{contact.name}</Typography>
                  {contact.company && (
                    <Typography variant="caption" color="text.secondary">
                      {contact.company}
                    </Typography>
                  )}
                </Box>
              </Box>
              
              {contact.email && (
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Email sx={{ fontSize: 16, color: '#757575' }} />
                  <Typography variant="body2">{contact.email}</Typography>
                </Box>
              )}
              {contact.phone && (
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Phone sx={{ fontSize: 16, color: '#757575' }} />
                  <Typography variant="body2">{contact.phone}</Typography>
                </Box>
              )}
              {contact.notes && (
                <Box display="flex" alignItems="flex-start" gap={1} mt={1.5}>
                  <Notes sx={{ fontSize: 16, color: '#757575', mt: 0.3 }} />
                  <Typography variant="body2" color="text.secondary">
                    {contact.notes}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {/* SubActividades */}
        <SubActivityList
          subActivities={activity.subActivities || []}
          onAdd={(data) => onAddSubActivity?.(activity._id, data)}
          onUpdate={(subId, data) => onUpdateSubActivity?.(activity._id, subId, data)}
          onDelete={(subId) => onDeleteSubActivity?.(activity._id, subId)}
        />
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