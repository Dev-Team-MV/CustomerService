// apps/mv-crm/src/components/leads/KanbanBoard.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import { Edit, Delete, Visibility, Add } from '@mui/icons-material'
import KanbanColumn from './KanbanColumn'

const KanbanBoard = ({ 
  stages = [],
  groupedByStage = {},
  onLeadClick,
  onAddLead,
  onEditLead,
  onDeleteLead,
  onMoveLead,
  onConvertLead
}) => {
  const { t } = useTranslation('leads')
  const [draggedLead, setDraggedLead] = useState(null)
  
  // Menú de lead
  const [leadMenuAnchor, setLeadMenuAnchor] = useState(null)
  const [menuLead, setMenuLead] = useState(null)

  const handleDragStart = (lead) => {
    setDraggedLead(lead)
  }

  const handleDrop = async (targetStageKey) => {
    if (draggedLead) {
      const currentStageKey = draggedLead.stage
      if (currentStageKey !== targetStageKey) {
        await onMoveLead?.(draggedLead._id, targetStageKey)
      }
    }
    setDraggedLead(null)
  }

  // Lead menu handlers
  const handleLeadMenuClick = (event, lead) => {
    setLeadMenuAnchor(event.currentTarget)
    setMenuLead(lead)
  }

  const handleLeadMenuClose = () => {
    setLeadMenuAnchor(null)
    setMenuLead(null)
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        gap: 2, 
        overflowX: 'auto',
        pb: 2,
        height: 'calc(100vh - 200px)',
        '&::-webkit-scrollbar': { height: 8 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: 4 }
      }}
    >
      {stages.map(stage => (
        <KanbanColumn
          key={stage.key}
          column={stage}
          leads={groupedByStage[stage.key] || []}
          onLeadClick={onLeadClick}
          onLeadMenuClick={handleLeadMenuClick}
          onAddClick={() => onAddLead?.(stage.key)}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
        />
      ))}

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
    </Box>
  )
}

export default KanbanBoard