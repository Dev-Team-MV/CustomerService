import { useTranslation } from 'react-i18next'
import { Box, Typography, Avatar, Paper, Chip } from '@mui/material'
import { EventNote, Note, Phone, Email, Business, Person } from '@mui/icons-material'
import { useProjects } from '@shared/hooks/useProjects'

const ClientTimeline = ({ activities = [] }) => {
  const { t } = useTranslation('residents')
  const { projects } = useProjects()
  
  const getIcon = (activity) => {
    const tags = activity.tags || []
    if (tags.includes('nota')) return <Note sx={{ fontSize: 16 }} />
    if (tags.includes('sms')) return <Phone sx={{ fontSize: 16 }} />
    if (tags.includes('email')) return <Email sx={{ fontSize: 16 }} />
    return <EventNote sx={{ fontSize: 16 }} />
  }

  const getColor = (activity) => {
    const tags = activity.tags || []
    if (tags.includes('nota')) return '#ff9800'
    if (tags.includes('sms')) return '#2196f3'
    if (tags.includes('email')) return '#4caf50'
    if (tags.includes('automation')) return '#9c27b0'
    return '#757575'
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const getRelatedProjects = (activity) => {
    const projectNames = []
    if (activity.projectId) {
      if (typeof activity.projectId === 'object') {
        projectNames.push(activity.projectId.name || activity.projectId.title?.es || 'Proyecto')
      } else {
        const project = projects.find(p => p._id === activity.projectId)
        if (project) projectNames.push(project.name)
      }
    }
    if (activity.relatedProjects && activity.relatedProjects.length > 0) {
      activity.relatedProjects.forEach(projectId => {
        const project = projects.find(p => p._id === projectId)
        if (project && !projectNames.includes(project.name)) projectNames.push(project.name)
      })
    }
    return projectNames
  }

  const getColumnName = (activity) => {
    if (!activity.columnId) return null
    if (typeof activity.columnId === 'object') return activity.columnId.name
    return null
  }

  const getPriorityLabel = (priority) => {
    const priorityKey = `timeline.priority.${priority}`
    return t(priorityKey, priority)
  }

  if (activities.length === 0) {
    return (
      <Box id="client-timeline-empty" sx={{ py: 6, textAlign: 'center', border: '1px dashed #ececec', borderRadius: 1 }}>
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: '#aaa', letterSpacing: '0.5px' }}>
          {t('timeline.noActivities')}
        </Typography>
      </Box>
    )
  }

  return (
    <Box id="client-timeline-container" sx={{ position: 'relative' }}>
      {/* Línea vertical */}
      <Box sx={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 2, bgcolor: '#ececec' }} />

      {/* Items */}
      {activities.map((activity, index) => {
        const isFirst = index === 0 // ✅ Detectar el primer elemento para el tour
        const color = getColor(activity)
        const relatedProjectNames = getRelatedProjects(activity)
        const columnName = getColumnName(activity)
        
        return (
          <Box key={activity._id || index} sx={{ position: 'relative', pl: 6, pb: 3, '&:last-child': { pb: 0 } }}>
            
            {/* ✅ Punto en la línea (ID para el tour) */}
            <Box
              id={isFirst ? 'timeline-first-item-marker' : undefined}
              sx={{
                position: 'absolute', left: 12, top: 8, width: 18, height: 18, borderRadius: '50%',
                bgcolor: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', border: '2px solid #fff', boxShadow: '0 0 0 2px ' + color
              }}
            >
              {getIcon(activity)}
            </Box>

            {/* ✅ Card principal (ID para el tour) */}
            <Paper
              id={isFirst ? 'timeline-first-item-card' : undefined}
              elevation={0}
              sx={{
                p: 2, border: '1px solid #ececec', borderRadius: 1, bgcolor: '#fff',
                transition: 'all 0.2s', '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderColor: color }
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#000', flex: 1 }}>
                  {activity.title || t('timeline.noTitle')}
                </Typography>
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000000ff', letterSpacing: '0.5px', ml: 2 }}>
                  {formatDate(activity.createdAt)}
                </Typography>
              </Box>

              {activity.description && (
                <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', color: '#444', lineHeight: 1.5, mb: 1 }}>
                  {activity.description}
                </Typography>
              )}

              {/* ✅ Metadata: Proyectos, Columna, Prioridad (ID para el tour) */}
              <Box id={isFirst ? 'timeline-first-item-metadata' : undefined} display="flex" gap={1} flexWrap="wrap" mb={1}>
                {relatedProjectNames.map((projectName, idx) => (
                  <Box key={idx} display="flex" alignItems="center" gap={0.5}>
                    <Business sx={{ fontSize: 14, color: '#2196f3' }} />
                    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#2196f3', letterSpacing: '0.5px' }}>
                      {projectName}
                    </Typography>
                  </Box>
                ))}
                {columnName && (
                  <Chip label={columnName} size="small" sx={{ bgcolor: '#f5f5f5', color: '#666', fontFamily: '"Courier New", monospace', fontSize: '0.6rem', height: 20 }} />
                )}
                {activity.priority && (
                  <Chip
                    label={getPriorityLabel(activity.priority)}
                    size="small"
                    sx={{
                      bgcolor: activity.priority === 'high' ? '#ffebee' : activity.priority === 'medium' ? '#fff3e0' : '#e8f5e9',
                      color: activity.priority === 'high' ? '#c62828' : activity.priority === 'medium' ? '#f57c00' : '#2e7d32',
                      fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 600, height: 20, textTransform: 'uppercase'
                    }}
                  />
                )}
              </Box>

              {/* Tags */}
              {activity.tags && activity.tags.length > 0 && (
                <Box display="flex" gap={0.5} flexWrap="wrap" mb={1}>
                  {activity.tags.map((tag, idx) => (
                    <Box key={idx} sx={{ px: 1, py: 0.3, bgcolor: tag === 'automation' ? '#f3e5f5' : '#f5f5f5', color: tag === 'automation' ? '#9c27b0' : '#666', borderRadius: 0.5, fontFamily: '"Courier New", monospace', fontSize: '0.6rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      {tag}
                    </Box>
                  ))}
                </Box>
              )}

              {/* ✅ Asignado a + Creado por (ID para el tour) */}
              <Box id={isFirst ? 'timeline-first-item-users' : undefined} display="flex" gap={2} alignItems="center" mt={1.5} flexWrap="wrap">
                {activity.assignedTo && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Person sx={{ fontSize: 14, color: '#4caf50' }} />
                    <Avatar sx={{ width: 18, height: 18, fontSize: '0.55rem', bgcolor: '#4caf50' }}>
                      {activity.assignedTo.firstName?.charAt(0) || '?'}
                    </Avatar>
                    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#4caf50', letterSpacing: '0.5px' }}>
                      {t('timeline.assignedTo')}: {activity.assignedTo.firstName} {activity.assignedTo.lastName}
                    </Typography>
                  </Box>
                )}
                {activity.createdBy && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Avatar sx={{ width: 18, height: 18, fontSize: '0.55rem', bgcolor: '#757575' }}>
                      {activity.createdBy.firstName?.charAt(0) || '?'}
                    </Avatar>
                    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000000ff', letterSpacing: '0.5px' }}>
                      {t('timeline.createdBy')}: {activity.createdBy.firstName} {activity.createdBy.lastName}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        )
      })}
    </Box>
  )
}

export default ClientTimeline