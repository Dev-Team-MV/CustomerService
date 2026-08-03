// apps/mv-crm/src/components/leads/KanbanColumn.jsx
import { useTranslation } from 'react-i18next'
import { Box, Typography, IconButton, Badge, Tooltip } from '@mui/material'
import { Add, DragIndicator } from '@mui/icons-material'
import { Droppable, Draggable } from '@hello-pangea/dnd' // ✅ Importar Droppable y Draggable
import LeadCard from './LeadCard'

const KanbanColumn = ({ 
  column,
  leads, 
  onLeadClick, 
  onMenuClick,
  onAddClick,
  onScoreUpdate
}) => {
  const { t } = useTranslation('leads')

  const COLUMN_KEYS = {
    'nuevo': 'stages.nuevo',
    'contactado': 'stages.contactado',
    'visita_agendada': 'stages.visita_agendada',
    'propuesta': 'stages.propuesta',
    'vendido': 'stages.vendido',
    'perdido': 'stages.perdido'
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
        minWidth: 320,
        maxWidth: 320,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#f5f5f5',
        borderRadius: 0, // ✅ Estética unificada
        p: 2,
        border: '1px solid #e0e0e0'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          pb: 1.5,
          borderBottom: `2px solid ${column.color}`
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ width: 12, height: 12, borderRadius: 0, bgcolor: column.color }} />
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#000' }}>
            {getColumnName()}
          </Typography>
          <Badge
            badgeContent={leads.length}
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: column.color,
                color: '#fff',
                fontFamily: '"Courier New", monospace',
                fontSize: '0.65rem',
                fontWeight: 700,
                height: 18,
                minWidth: 18,
                padding: '0 4px',
                borderRadius: 0
              }
            }}
          />
        </Box>

        <Tooltip title={t('addLead', 'Agregar lead')}>
          <IconButton size="small" onClick={onAddClick} sx={{ color: '#000', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 0 } }}>
            <Add fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ✅ Área Droppable */}
      <Droppable droppableId={column.key}>
        {(provided, snapshot) => (
          <Box 
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{ 
              flex: 1, 
              overflowY: 'auto', 
              p: 1,
              bgcolor: snapshot.isDraggingOver ? '#e3f2fd' : 'transparent',
              transition: 'background-color 0.2s ease',
              borderRadius: 0,
              border: snapshot.isDraggingOver ? '2px dashed #2196f3' : '2px solid transparent',
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: 0 }
            }}
          >
            {leads.map((lead, index) => (
              // ✅ Cada tarjeta es Draggable
              <Draggable key={lead._id} draggableId={lead._id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <Box
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    sx={{
                      marginBottom: 1.5,
                      ...dragProvided.draggableProps.style,
                      opacity: dragSnapshot.isDragging ? 0.8 : 1,
                      transform: dragSnapshot.isDragging ? 'rotate(2deg)' : 'none',
                      transition: dragSnapshot.isDragging ? 'none' : 'all 0.2s ease'
                    }}
                  >
                    <LeadCard
                      lead={lead}
                      onClick={onLeadClick}
                      onMenuClick={onMenuClick}
                      onScoreUpdate={onScoreUpdate}
                      isDragging={dragSnapshot.isDragging}
                    />
                  </Box>
                )}
              </Draggable>
            ))}
            
            {leads.length === 0 && !snapshot.isDraggingOver && (
              <Box sx={{ p: 4, textAlign: 'center', border: '2px dashed #e0e0e0', borderRadius: 0, bgcolor: '#fafafa' }}>
                <DragIndicator sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888', letterSpacing: '0.5px' }}>
                  {t('noLeads', 'Sin leads')}
                </Typography>
              </Box>
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