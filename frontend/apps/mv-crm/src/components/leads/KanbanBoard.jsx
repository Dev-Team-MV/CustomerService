// apps/mv-crm/src/components/leads/KanbanBoard.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import { Edit, Delete, Visibility, Add } from '@mui/icons-material'
import { DragDropContext } from '@hello-pangea/dnd' // ✅ Importar DragDropContext
import KanbanColumn from './KanbanColumn'

const KanbanBoard = ({ 
  stages = [],
  groupedByStage = {},
  onLeadClick,
  onAddLead,
  onEditLead,
  onDeleteLead,
  onMoveLead,
  onConvertLead,
  onScoreUpdate
}) => {
  const { t } = useTranslation('leads')
  
  const [leadMenuAnchor, setLeadMenuAnchor] = useState(null)
  const [menuLead, setMenuLead] = useState(null)

  // ✅ Manejador de finalización del arrastre (funciona en móvil y desktop)
  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const targetStageKey = destination.droppableId

    if (onMoveLead) {
      await onMoveLead(draggableId, targetStageKey)
    }
  }

  const handleLeadMenuClick = (event, lead) => {
    event.stopPropagation()
    setLeadMenuAnchor(event.currentTarget)
    setMenuLead(lead)
  }

  const handleLeadMenuClose = () => {
    setLeadMenuAnchor(null)
    setMenuLead(null)
  }

  return (
    // ✅ Wrap principal con DragDropContext
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 2, 
          overflowX: 'auto',
          pb: 2,
          height: 'calc(100vh - 200px)',
          '&::-webkit-scrollbar': { height: 8 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: 0 }
        }}
      >
        {stages.map(stage => (
          <KanbanColumn
            key={stage.key}
            column={stage}
            leads={groupedByStage[stage.key] || []}
            onLeadClick={onLeadClick}
            onAddClick={() => onAddLead(stage.key)}
            onMenuClick={handleLeadMenuClick}
            onScoreUpdate={onScoreUpdate}
          />
        ))}
      </Box>

      {/* Context Menu - Leads */}
      <Menu
        anchorEl={leadMenuAnchor}
        open={Boolean(leadMenuAnchor)}
        onClose={handleLeadMenuClose}
      >
        <MenuItem onClick={() => { onLeadClick?.(menuLead); handleLeadMenuClose() }}>
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
          <ListItemText>{t('viewDetails')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onEditLead?.(menuLead); handleLeadMenuClose() }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>{t('edit')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onConvertLead?.(menuLead); handleLeadMenuClose() }}>
          <ListItemIcon><Add fontSize="small" /></ListItemIcon>
          <ListItemText>{t('convertToCustomer')}</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => { onDeleteLead?.(menuLead._id); handleLeadMenuClose() }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>{t('delete')}</ListItemText>
        </MenuItem>
      </Menu>
    </DragDropContext>
  )
}

export default KanbanBoard