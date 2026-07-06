// apps/mv-crm/src/components/clients/ClientTimeline.jsx
import { Box, Typography, Avatar, Paper } from '@mui/material'
import { EventNote, Note, Phone, Email } from '@mui/icons-material'

const ClientTimeline = ({ activities = [] }) => {
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
    return '#757575'
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (activities.length === 0) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: 'center',
          border: '1px dashed #ececec',
          borderRadius: 1
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            color: '#aaa',
            letterSpacing: '0.5px'
          }}
        >
          No hay actividades registradas
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Línea vertical */}
      <Box
        sx={{
          position: 'absolute',
          left: 20,
          top: 0,
          bottom: 0,
          width: 2,
          bgcolor: '#ececec'
        }}
      />

      {/* Items */}
      {activities.map((activity, index) => {
        const color = getColor(activity)
        return (
          <Box
            key={activity._id || index}
            sx={{
              position: 'relative',
              pl: 6,
              pb: 3,
              '&:last-child': { pb: 0 }
            }}
          >
            {/* Punto en la línea */}
            <Box
              sx={{
                position: 'absolute',
                left: 12,
                top: 8,
                width: 18,
                height: 18,
                borderRadius: '50%',
                bgcolor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                border: '2px solid #fff',
                boxShadow: '0 0 0 2px ' + color
              }}
            >
              {getIcon(activity)}
            </Box>

            {/* Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: '1px solid #ececec',
                borderRadius: 1,
                bgcolor: '#fff',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  borderColor: color
                }
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Typography
                  sx={{
                    fontFamily: '"Helvetica Neue", sans-serif',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: '#000',
                    flex: 1
                  }}
                >
                  {activity.title || 'Sin título'}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.65rem',
                    color: '#888',
                    letterSpacing: '0.5px',
                    ml: 2
                  }}
                >
                  {formatDate(activity.createdAt)}
                </Typography>
              </Box>

              {activity.description && (
                <Typography
                  sx={{
                    fontFamily: '"Helvetica Neue", sans-serif',
                    fontSize: '0.85rem',
                    color: '#444',
                    lineHeight: 1.5,
                    mb: 1
                  }}
                >
                  {activity.description}
                </Typography>
              )}

              {/* Tags */}
              {activity.tags && activity.tags.length > 0 && (
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {activity.tags.map((tag, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        px: 1,
                        py: 0.3,
                        bgcolor: '#f5f5f5',
                        borderRadius: 0.5,
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.6rem',
                        color: '#666',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {tag}
                    </Box>
                  ))}
                </Box>
              )}

              {/* Creado por */}
              {activity.createdBy && (
                <Box display="flex" alignItems="center" gap={1} mt={1.5}>
                  <Avatar
                    sx={{
                      width: 20,
                      height: 20,
                      fontSize: '0.6rem',
                      bgcolor: '#757575'
                    }}
                  >
                    {activity.createdBy.firstName?.charAt(0) || '?'}
                  </Avatar>
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.65rem',
                      color: '#888',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {activity.createdBy.firstName} {activity.createdBy.lastName}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )
      })}
    </Box>
  )
}

export default ClientTimeline