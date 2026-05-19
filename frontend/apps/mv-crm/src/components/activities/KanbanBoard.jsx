// frontend/apps/mv-crm/src/components/activities/KanbanBoard.jsx
import { useState } from 'react'
import { Box, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import { Edit, Delete, Visibility } from '@mui/icons-material'
import KanbanColumn from './KanbanColumn'
import { ACTIVITY_STATUSES } from '../../constants/hooks/useActivities'

const KanbanBoard = ({ 
  groupedByStatus, 
  onActivityClick,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onStatusChange
}) => {
  const [draggedActivity, setDraggedActivity] = useState(null)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuActivity, setMenuActivity] = useState(null)

  const handleDragStart = (activity) => {
    setDraggedActivity(activity)
  }

  const handleDrop = async (newStatus) => {
    if (draggedActivity && draggedActivity.status !== newStatus) {
      await onStatusChange?.(draggedActivity._id, newStatus)
    }
    setDraggedActivity(null)
  }

  const handleMenuClick = (event, activity) => {
    setMenuAnchor(event.currentTarget)
    setMenuActivity(activity)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setMenuActivity(null)
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
        '&::-webkit-scrollbar-thumb': { 
          bgcolor: '#ccc', 
          borderRadius: 4 
        }
      }}
    >
      {ACTIVITY_STATUSES.map(status => (
        <KanbanColumn
          key={status.id}
          status={status}
          activities={groupedByStatus[status.id] || []}
          onActivityClick={onActivityClick}
          onActivityMenuClick={handleMenuClick}
          onAddClick={(statusId) => onAddActivity?.(statusId)}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
        />
      ))}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onActivityClick?.(menuActivity); handleMenuClose() }}>
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onEditActivity?.(menuActivity); handleMenuClose() }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => { onDeleteActivity?.(menuActivity._id); handleMenuClose() }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default KanbanBoard