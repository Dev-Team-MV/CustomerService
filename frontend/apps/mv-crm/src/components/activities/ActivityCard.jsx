import { Box, Typography, Chip, Avatar, IconButton, Tooltip, Menu, MenuItem } from '@mui/material'
import { AccessTime, Person, MoreVert, Phone, Email as EmailIcon } from '@mui/icons-material'
import { ACTIVITY_PRIORITIES } from '../../constants/hooks/useActivities'

const formatDate = (date) => {
  if (!date) return null
  const now = new Date()
  const due = new Date(date)
  const diffTime = due - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return { text: 'Vencido', color: '#d32f2f' }
  if (diffDays === 0) return { text: 'Hoy', color: '#f57c00' }
  if (diffDays === 1) return { text: 'Mañana', color: '#f9a825' }
  if (diffDays <= 7) return { text: `${diffDays}d`, color: '#1976d2' }
  return { text: due.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), color: '#666' }
}

const ActivityCard = ({ activity, onClick, onMenuClick, isDragging }) => {
  const priority = ACTIVITY_PRIORITIES.find(p => p.id === activity.priority)
  const dueInfo = formatDate(activity.dueDate)
  const assignee = activity.assignedTo
  const contact = activity.contact

  return (
    <Box
      onClick={() => onClick?.(activity)}
      sx={{
        bgcolor: 'white',
        borderRadius: 2,
        p: 2,
        mb: 1.5,
        cursor: 'pointer',
        border: '1px solid #e0e0e0',
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
        transform: isDragging ? 'rotate(3deg)' : 'none',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderColor: '#bdbdbd'
        }
      }}
    >
      {/* Header: Tags + Menú */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Box display="flex" gap={0.5} flexWrap="wrap" flex={1}>
          {activity.tags?.slice(0, 2).map((tag, idx) => (
            <Chip
              key={idx}
              label={tag}
              size="small"
              sx={{ 
                fontSize: '0.65rem',
                height: 20,
                bgcolor: '#f5f5f5',
                fontWeight: 500
              }}
            />
          ))}
          {activity.tags?.length > 2 && (
            <Chip
              label={`+${activity.tags.length - 2}`}
              size="small"
              sx={{ fontSize: '0.65rem', height: 20, bgcolor: '#e0e0e0' }}
            />
          )}
        </Box>
        <IconButton 
          size="small" 
          onClick={(e) => { e.stopPropagation(); onMenuClick?.(e, activity) }}
          sx={{ mt: -0.5, mr: -0.5 }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </Box>

      {/* Título */}
      <Typography 
        variant="subtitle2" 
        fontWeight={600} 
        sx={{ 
          mb: 1,
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {activity.title}
      </Typography>

      {/* Descripción corta */}
      {activity.description && (
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1
          }}
        >
          {activity.description}
        </Typography>
      )}

      {/* Contacto */}
      {contact && (
        <Box 
          display="flex" 
          alignItems="center" 
          gap={1} 
          mb={1} 
          p={0.8}
          bgcolor="#fff3e0"
          borderRadius={1}
        >
          <Person sx={{ fontSize: 16, color: '#ff9800' }} />
          <Box flex={1} minWidth={0}>
            <Typography 
              variant="caption" 
              fontWeight={500}
              sx={{ display: 'block', color: '#e65100' }}
              noWrap
            >
              {contact.name}
            </Typography>
            {contact.phone && (
              <Typography 
                variant="caption" 
                sx={{ fontSize: '0.6rem', color: '#ff9800' }}
                noWrap
              >
                {contact.phone}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* Asignado */}
      {assignee && (
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: '#2196f3' }}>
            {assignee.firstName?.charAt(0) || '?'}
          </Avatar>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1 }}>
            {`${assignee.firstName || ''} ${assignee.lastName || ''}`.trim()}
          </Typography>
        </Box>
      )}

      {/* Footer: Fecha + Prioridad + Subtareas */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5}>
        <Box display="flex" alignItems="center" gap={1}>
          {dueInfo ? (
            <Box display="flex" alignItems="center" gap={0.5}>
              <AccessTime sx={{ fontSize: 14, color: dueInfo.color }} />
              <Typography variant="caption" sx={{ color: dueInfo.color, fontWeight: 500 }}>
                {dueInfo.text}
              </Typography>
            </Box>
          ) : null}
          
          {activity.subtasks && activity.subtasks.length > 0 && (
            <Chip
              label={`${activity.subtasks.filter(s => s.completed).length}/${activity.subtasks.length}`}
              size="small"
              sx={{
                fontSize: '0.65rem',
                height: 18,
                bgcolor: '#f0f4f0',
                color: '#666'
              }}
            />
          )}
        </Box>
        
        <Chip
          label={priority?.label || 'Media'}
          size="small"
          sx={{
            fontSize: '0.65rem',
            height: 18,
            bgcolor: `${priority?.color || '#2196f3'}20`,
            color: priority?.color || '#2196f3',
            fontWeight: 600,
            border: `1px solid ${priority?.color || '#2196f3'}40`
          }}
        />
      </Box>
    </Box>
  )
}

export default ActivityCard