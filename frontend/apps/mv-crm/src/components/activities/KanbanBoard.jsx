import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Menu, MenuItem, ListItemIcon, ListItemText, Button, IconButton, Tooltip } from '@mui/material'
import { Edit, Delete, Visibility, Add, ViewColumn, MoreVert } from '@mui/icons-material'
import KanbanColumn from './KanbanColumn'

const KanbanBoard = ({ 
  columns = [],
  groupedByColumn = {},
  onActivityClick,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onMoveActivity,
  // Nuevas props para columnas
  onAddColumn,
  onEditColumn,
  onDeleteColumn
}) => {
  const { t } = useTranslation('activities')
  const [draggedActivity, setDraggedActivity] = useState(null)
  
  // Menú de actividad
  const [activityMenuAnchor, setActivityMenuAnchor] = useState(null)
  const [menuActivity, setMenuActivity] = useState(null)
  
  // Menú de columna
  const [columnMenuAnchor, setColumnMenuAnchor] = useState(null)
  const [menuColumn, setMenuColumn] = useState(null)

  const handleDragStart = (activity) => {
    setDraggedActivity(activity)
  }

  const handleDrop = async (targetColumnId) => {
    if (draggedActivity) {
      const currentColumnId = typeof draggedActivity.columnId === 'object'
        ? draggedActivity.columnId._id
        : draggedActivity.columnId
      
      if (currentColumnId !== targetColumnId) {
        await onMoveActivity?.(draggedActivity._id, targetColumnId)
      }
    }
    setDraggedActivity(null)
  }

  // Activity menu handlers
  const handleActivityMenuClick = (event, activity) => {
    setActivityMenuAnchor(event.currentTarget)
    setMenuActivity(activity)
  }

  const handleActivityMenuClose = () => {
    setActivityMenuAnchor(null)
    setMenuActivity(null)
  }

  // Column menu handlers
  const handleColumnMenuClick = (event, column) => {
    event.stopPropagation()
    setColumnMenuAnchor(event.currentTarget)
    setMenuColumn(column)
  }

  const handleColumnMenuClose = () => {
    setColumnMenuAnchor(null)
    setMenuColumn(null)
  }

  const handleDeleteColumn = () => {
    if (menuColumn) {
      const activitiesInColumn = groupedByColumn[menuColumn._id]?.length || 0
      if (activitiesInColumn > 0) {
        if (!window.confirm(`${t('activities.deleteColumnConfirm')} ${activitiesInColumn} ${t('activities.activities')}. ¿${t('activities.deletAnyway')}?`)) {
          handleColumnMenuClose()
          return
        }
      }
      onDeleteColumn?.(menuColumn._id)
    }
    handleColumnMenuClose()
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
      {columns.map(column => (
        <KanbanColumn
          key={column._id}
          column={column}
          activities={groupedByColumn[column._id] || []}
          onActivityClick={onActivityClick}
          onActivityMenuClick={handleActivityMenuClick}
          onAddClick={() => onAddActivity?.(column._id)}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onColumnMenuClick={handleColumnMenuClick}
        />
      ))}

      {/* Botón para agregar nueva columna */}
      <Box
        sx={{
          flex: '0 0 280px',
          minWidth: 280,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pt: 2
        }}
      >
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={onAddColumn}
          sx={{
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: '#bdbdbd',
            color: '#757575',
            py: 1.5,
            px: 3,
            borderRadius: 2,
            '&:hover': {
              borderColor: '#2196f3',
              color: '#2196f3',
              bgcolor: '#e3f2fd'
            }
          }}
        >
          {t('activities.form.addColumn')}
        </Button>
      </Box>

      {/* Context Menu - Actividades */}
      <Menu
        anchorEl={activityMenuAnchor}
        open={Boolean(activityMenuAnchor)}
        onClose={handleActivityMenuClose}
      >
        <MenuItem onClick={() => { onActivityClick?.(menuActivity); handleActivityMenuClose() }}>
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
          <ListItemText>{t('activities.viewDetails')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onEditActivity?.(menuActivity); handleActivityMenuClose() }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>{t('activities.form.edit')}</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => { onDeleteActivity?.(menuActivity._id); handleActivityMenuClose() }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>{t('activities.form.delete')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Context Menu - Columnas */}
      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={handleColumnMenuClose}
      >
        <MenuItem onClick={() => { onEditColumn?.(menuColumn); handleColumnMenuClose() }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>{t('activities.editColumn')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteColumn} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>{t('activities.deleteColumn')}</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default KanbanBoard