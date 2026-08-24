// apps/mv-crm/src/components/activities/KanbanBoard.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Menu, MenuItem, ListItemIcon, ListItemText, Button, IconButton } from '@mui/material'
import { Edit, Delete, Visibility, Add, MoreVert } from '@mui/icons-material'
import { DragDropContext } from '@hello-pangea/dnd' // ✅ Importar DragDropContext
import KanbanColumn from './KanbanColumn'

const KanbanBoard = ({ 
  columns = [],
  groupedByColumn = {},
  onActivityClick,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onMoveActivity,
  onAddColumn,
  onEditColumn,
  onDeleteColumn
}) => {
  const { t } = useTranslation('activities')
  
  const [activityMenuAnchor, setActivityMenuAnchor] = useState(null)
  const [menuActivity, setMenuActivity] = useState(null)
  const [columnMenuAnchor, setColumnMenuAnchor] = useState(null)
  const [menuColumn, setMenuColumn] = useState(null)

  // ✅ Manejador de finalización del arrastre (funciona en móvil y desktop)
  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const targetColumnId = destination.droppableId

    // Buscar la actividad para verificar su columna actual
    const activity = Object.values(groupedByColumn)
      .flat()
      .find(a => a._id === draggableId)

    if (activity && onMoveActivity) {
      const currentColumnId = typeof activity.columnId === 'object'
        ? activity.columnId._id
        : activity.columnId
      
      // Solo llamar a la API si realmente cambió de columna
      if (currentColumnId !== targetColumnId) {
        await onMoveActivity(draggableId, targetColumnId)
      }
    }
  }

  const handleActivityMenuClick = (event, activity) => {
    event.stopPropagation()
    setActivityMenuAnchor(event.currentTarget)
    setMenuActivity(activity)
  }

  const handleActivityMenuClose = () => {
    setActivityMenuAnchor(null)
    setMenuActivity(null)
  }

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
        if (!window.confirm(`${t('activities.deleteColumnConfirm')} ${activitiesInColumn} ${t('activities.activities')}. ¿${t('activities.deleteAnyway') || 'Eliminar de todos modos'}?`)) {
          handleColumnMenuClose()
          return
        }
      }
      onDeleteColumn?.(menuColumn._id)
    }
    handleColumnMenuClose()
  }

  return (
    // ✅ Wrap principal con DragDropContext
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box 
      id="activities-kanban-board"
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
        {columns.map(column => (
          <KanbanColumn
            key={column._id}
            column={column}
            activities={groupedByColumn[column._id] || []}
            onActivityClick={onActivityClick}
            onActivityMenuClick={handleActivityMenuClick}
            onAddClick={() => onAddActivity?.(column._id)}
            onColumnMenuClick={handleColumnMenuClick}
          />
        ))}

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
              borderRadius: 0, // ✅ Estética unificada
              '&:hover': {
                borderColor: '#000',
                color: '#000',
                bgcolor: '#f5f5f5'
              }
            }}
          >
            {t('activities.form.addColumn')}
          </Button>
        </Box>
      </Box>

      {/* Context Menu - Actividades */}
      <Menu anchorEl={activityMenuAnchor} open={Boolean(activityMenuAnchor)} onClose={handleActivityMenuClose}>
        <MenuItem onClick={() => { onActivityClick?.(menuActivity); handleActivityMenuClose() }}>
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
          <ListItemText>{t('activities.viewDetails')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onEditActivity?.(menuActivity); handleActivityMenuClose() }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>{t('activities.form.edit')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onDeleteActivity?.(menuActivity._id); handleActivityMenuClose() }} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>{t('activities.form.delete')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Context Menu - Columnas */}
      <Menu anchorEl={columnMenuAnchor} open={Boolean(columnMenuAnchor)} onClose={handleColumnMenuClose}>
        <MenuItem onClick={() => { onEditColumn?.(menuColumn); handleColumnMenuClose() }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>{t('activities.editColumn')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteColumn} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>{t('activities.deleteColumn')}</ListItemText>
        </MenuItem>
      </Menu>
    </DragDropContext>
  )
}

export default KanbanBoard