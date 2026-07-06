// apps/mv-crm/src/components/leads/LeadCard.jsx
import { useTranslation } from 'react-i18next'
import { Box, Typography, Chip, Avatar, IconButton } from '@mui/material'
import { Phone, Email, MoreVert, CalendarToday } from '@mui/icons-material'

const formatDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays <= 7) return `Hace ${diffDays} días`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

const LeadCard = ({ lead, onClick, onMenuClick, isDragging }) => {
  const { t } = useTranslation('leads')

  // Obtener nombre del proyecto
  const projectName = lead.projectId?.name || 
                     lead.projectId?.title?.es || 
                     lead.projectId?.title?.en ||
                     null

  // Obtener nombre del asesor
  const assigneeName = lead.assignedTo 
    ? `${lead.assignedTo.firstName || ''} ${lead.assignedTo.lastName || ''}`.trim()
    : null

  return (
    <Box
      onClick={() => onClick?.(lead)}
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
      {/* Header: Nombre + Menú */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Typography 
          variant="subtitle2" 
          fontWeight={600} 
          sx={{ 
            flex: 1,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {lead.name}
        </Typography>
        <IconButton 
          size="small" 
          onClick={(e) => { e.stopPropagation(); onMenuClick?.(e, lead) }}
          sx={{ mt: -0.5, mr: -0.5 }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </Box>

      {/* Proyecto */}
      {projectName && (
        <Box mb={1}>
          <Chip
            label={projectName}
            size="small"
            sx={{ 
              fontSize: '0.65rem',
              height: 20,
              bgcolor: '#e3f2fd',
              color: '#1976d2',
              fontWeight: 500
            }}
          />
        </Box>
      )}

      {/* Teléfono y Email */}
      <Box display="flex" flexDirection="column" gap={0.5} mb={1}>
        {lead.phone && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Phone sx={{ fontSize: 14, color: '#757575' }} />
            <Typography variant="caption" color="text.secondary">
              {lead.phone}
            </Typography>
          </Box>
        )}
        {lead.email && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Email sx={{ fontSize: 14, color: '#757575' }} />
            <Typography variant="caption" color="text.secondary" noWrap>
              {lead.email}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Asesor asignado */}
      {lead.assignedTo && (
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: '#2196f3' }}>
            {lead.assignedTo.firstName?.charAt(0) || '?'}
          </Avatar>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1 }}>
            {assigneeName}
          </Typography>
        </Box>
      )}

      {/* Footer: Fecha + Source */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <CalendarToday sx={{ fontSize: 14, color: '#9e9e9e' }} />
          <Typography variant="caption" sx={{ color: '#9e9e9e' }}>
            {formatDate(lead.createdAt)}
          </Typography>
        </Box>
        
        <Chip
          label={t(`source.${lead.source}`) || lead.source}
          size="small"
          sx={{
            fontSize: '0.65rem',
            height: 18,
            bgcolor: '#f5f5f5',
            color: '#666'
          }}
        />
      </Box>
    </Box>
  )
}

export default LeadCard