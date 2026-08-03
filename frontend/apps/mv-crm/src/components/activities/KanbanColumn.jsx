// apps/mv-crm/src/components/activities/KanbanColumn.jsx
import { useTranslation } from 'react-i18next'
import { Box, Typography, IconButton, Chip, Tooltip } from '@mui/material'
import { Add, MoreVert } from '@mui/icons-material'
import { Droppable, Draggable } from '@hello-pangea/dnd' // ✅ Importar Droppable y Draggable
import ActivityCard from './ActivityCard'

const KanbanColumn = ({ 
  column,
  activities, 
  onActivityClick, 
  onActivityMenuClick,
  onAddClick,
  onColumnMenuClick
}) => {
  const { t } = useTranslation('activities')
  const color = column.color || '#757575'

  const COLUMN_KEYS = {
    'backlog': 'activities.columns.backlog',
    'todo': 'activities.columns.todo',
    'in_progress': 'activities.columns.inProgress',
    'done': 'activities.columns.done',
    'aprobado': 'activities.columns.approved'
  }

  const getColumnName = () => {
    const translationKey = COLUMN_KEYS[column.key]
    if (translationKey) {
      const translated = t(translationKey)
      if (translated !== translationKey) return translated
    }
    return column.name
  }

  return (
    <Box
      sx={{
        flex: '0 0 280px',
        minWidth: 280,
        maxWidth: 280,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8f9fa',
        borderRadius: 0, // ✅ Estética unificada
        height: '100%',
        overflow: 'hidden',
        border: '1px solid #e0e0e0'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, pb: 1.5, borderBottom: '3px solid', borderColor: color }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={0}>
            <Box sx={{ width: 10, height: 10, borderRadius: 0, bgcolor: color, flexShrink: 0 }} />
            <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
              {getColumnName()}
            </Typography>
            <Chip
              label={activities.length}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 600,
                bgcolor: `${color}20`,
                color: color,
                borderRadius: 0,
                flexShrink: 0
              }}
            />
          </Box>
          
          <Box display="flex" alignItems="center" gap={0.5}>
            <Tooltip title={t('activities.columnOptions')}>
              <IconButton 
                size="small" 
                onClick={(e) => onColumnMenuClick?.(e, column)}
                sx={{ opacity: 0.5, '&:hover': { opacity: 1, bgcolor: '#e0e0e0', borderRadius: 0 } }}
              >
                <MoreVert sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={t('activities.addActivity')}>
              <IconButton 
                size="small" 
                onClick={onAddClick}
                sx={{ bgcolor: `${color}15`, '&:hover': { bgcolor: `${color}25` }, borderRadius: 0 }}
              >
                <Add sx={{ fontSize: 18, color: color }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* ✅ Área Droppable (Donde se sueltan las tarjetas) */}
      <Droppable droppableId={column._id}>
        {(provided, snapshot) => (
          <Box 
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{ 
              flex: 1, 
              overflowY: 'auto', 
              p: 1.5,
              bgcolor: snapshot.isDraggingOver ? '#f0f0f0' : 'transparent',
              transition: 'background-color 0.2s ease',
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: 0 }
            }}
          >
            {activities.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', border: '2px dashed #e0e0e0', borderRadius: 0, color: '#9e9e9e' }}>
                <Typography variant="caption" sx={{ fontFamily: '"Courier New", monospace' }}>{t('activities.noActivities')}</Typography>
              </Box>
            ) : (
              activities.map((activity, index) => (
                // ✅ Cada tarjeta es Draggable
                <Draggable key={activity._id} draggableId={activity._id} index={index}>
                  {(dragProvided, dragSnapshot) => (
                    <Box
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      sx={{
                        marginBottom: 1.5,
                        // Fusionar estilos de arrastre con estilos personalizados
                        ...dragProvided.draggableProps.style,
                        opacity: dragSnapshot.isDragging ? 0.8 : 1,
                        transform: dragSnapshot.isDragging ? 'rotate(2deg)' : 'none',
                        transition: dragSnapshot.isDragging ? 'none' : 'all 0.2s ease'
                      }}
                    >
                      <ActivityCard
                        activity={activity}
                        onClick={onActivityClick}
                        onMenuClick={onActivityMenuClick}
                        isDragging={dragSnapshot.isDragging}
                      />
                    </Box>
                  )}
                </Draggable>
              ))
            )}
            {/* ✅ Placeholder necesario para que el espacio se reserve al arrastrar */}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Box>
  )
}

export default KanbanColumn