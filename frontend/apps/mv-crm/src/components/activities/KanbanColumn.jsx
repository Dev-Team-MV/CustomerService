// frontend/apps/mv-crm/src/components/activities/KanbanColumn.jsx
import { Box, Typography, IconButton, Chip } from '@mui/material'
import { Add } from '@mui/icons-material'
import ActivityCard from './ActivityCard'

const KanbanColumn = ({ 
  status, 
  activities, 
  onActivityClick, 
  onActivityMenuClick,
  onAddClick,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  return (
    <Box
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver?.(status.id)
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDrop?.(status.id)
      }}
      sx={{
        flex: '0 0 280px',
        minWidth: 280,
        maxWidth: 280,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8f9fa',
        borderRadius: 3,
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          pb: 1.5,
          borderBottom: '2px solid',
          borderColor: status.color
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: status.color
              }}
            />
            <Typography variant="subtitle2" fontWeight={700}>
              {status.label}
            </Typography>
            <Chip
              label={activities.length}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 600,
                bgcolor: `${status.color}20`,
                color: status.color
              }}
            />
          </Box>
          <IconButton 
            size="small" 
            onClick={() => onAddClick?.(status.id)}
            sx={{ 
              bgcolor: `${status.color}15`,
              '&:hover': { bgcolor: `${status.color}25` }
            }}
          >
            <Add sx={{ fontSize: 18, color: status.color }} />
          </IconButton>
        </Box>
      </Box>

      {/* Cards */}
      <Box 
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          p: 1.5,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': { 
            bgcolor: '#ccc', 
            borderRadius: 3 
          }
        }}
      >
        {activities.length === 0 ? (
          <Box 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              border: '2px dashed #e0e0e0',
              borderRadius: 2,
              color: '#9e9e9e'
            }}
          >
            <Typography variant="caption">
              Sin actividades
            </Typography>
          </Box>
        ) : (
          activities.map(activity => (
            <Box
              key={activity._id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('activityId', activity._id)
                onDragStart?.(activity)
              }}
            >
              <ActivityCard
                activity={activity}
                onClick={onActivityClick}
                onMenuClick={onActivityMenuClick}
              />
            </Box>
          ))
        )}
      </Box>
    </Box>
  )
}

export default KanbanColumn