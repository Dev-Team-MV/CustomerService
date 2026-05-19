// frontend/apps/mv-crm/src/components/activities/ActivityCard.jsx
import { Box, Typography, Chip, Avatar, IconButton, Tooltip } from '@mui/material'
import { AccessTime, Person, MoreVert, Label } from '@mui/icons-material'
import { ACTIVITY_PRIORITIES } from '../../constants/hooks/useActivities'

const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  const now = new Date()
  const diff = d - now
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  
  if (days < 0) return { text: `Vencido hace ${Math.abs(days)}d`, color: '#f44336' }
  if (days === 0) return { text: 'Hoy', color: '#ff9800' }
  if (days === 1) return { text: 'Mañana', color: '#ff9800' }
  if (days <= 7) return { text: `En ${days} días`, color: '#2196f3' }
  return { text: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), color: '#9e9e9e' }
}

const ActivityCard = ({ activity, onClick, onMenuClick, isDragging }) => {
  const priority = ACTIVITY_PRIORITIES.find(p => p.id === activity.priority)
  const dueInfo = formatDate(activity.dueDate)
  
  // assignedTo viene populado del backend
  const assignee = activity.assignedTo

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
        <Box display="flex" gap={0.5} flexWrap="wrap">
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

      {/* Asignado (si existe) */}
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

      {/* Footer: Fecha + Prioridad */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5}>
        {dueInfo ? (
          <Box display="flex" alignItems="center" gap={0.5}>
            <AccessTime sx={{ fontSize: 14, color: dueInfo.color }} />
            <Typography variant="caption" sx={{ color: dueInfo.color, fontWeight: 500 }}>
              {dueInfo.text}
            </Typography>
          </Box>
        ) : (
          <Box />
        )}
        
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