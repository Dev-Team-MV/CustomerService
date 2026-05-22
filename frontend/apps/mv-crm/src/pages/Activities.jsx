import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material'
import { Add, Search, FilterList } from '@mui/icons-material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import KanbanBoard from '../components/activities/KanbanBoard'
import ActivityModal from '../components/activities/ActivityModal'
import ActivityDetails from '../components/activities/ActivityDetails'
import { useActivities, ACTIVITY_PRIORITIES } from '../constants/hooks/useActivities'
import { useProjects } from '@shared/hooks/useProjects'
import activityService from '../services/activityService'
import ColumnModal from '../components/activities/ColumnModal'

export default function Activities() {
  const { currentProject } = useProjects()
  const projectId = currentProject?._id || null

  const {
    columns,
    groupedByColumn,
    loading,
    error,
    createActivity,
    updateActivity,
    moveActivity,
    deleteActivity,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    addThreadMessage,
    fetchBoard,
      createColumn,
  updateColumn,
  deleteColumn
  } = useActivities(projectId)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [detailsActivity, setDetailsActivity] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')

  // Dentro del componente, agregar estados:
  const [columnModalOpen, setColumnModalOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState(null)

  const handleAddActivity = (columnId) => {
    setEditingActivity({ columnId })
    setModalOpen(true)
  }

  const handleEditActivity = (activity) => {
    setEditingActivity(activity)
    setModalOpen(true)
    setDetailsActivity(null)
  }

  const handleViewActivity = (activity) => {
    setDetailsActivity(activity)
  }

  const handleSaveActivity = async (data, activityId) => {
    try {
      if (activityId) {
        await updateActivity(activityId, data)
      } else {
        await createActivity(data)
      }
      setModalOpen(false)
      setEditingActivity(null)
      // ✅ Refrescar el tablero después de guardar
      await fetchBoard()
    } catch (err) {
      console.error('Error saving activity:', err)
    }
  }

  const handleDeleteActivity = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta actividad?')) {
      try {
        await deleteActivity(id)
        setDetailsActivity(null)
        await fetchBoard()
      } catch (err) {
        console.error('Error deleting activity:', err)
      }
    }
  }

  const handleMoveActivity = async (activityId, columnId) => {
    await moveActivity(activityId, columnId)
  }

  // ✅ CORREGIDO: Usar getById en lugar de getActivityById
  const handleRefreshActivityDetails = async () => {
    if (!detailsActivity?._id) return
    try {
      const updated = await activityService.getById(detailsActivity._id)
      setDetailsActivity(updated)
    } catch (err) {
      console.error('Error refreshing activity:', err)
    }
  }

  const handleAddColumn = () => {
  setEditingColumn(null)
  setColumnModalOpen(true)
}


  const handleEditColumn = (column) => {
  setEditingColumn(column)
  setColumnModalOpen(true)
}
 
const handleSaveColumn = async (data, columnId) => {
  try {
    if (columnId) {
      await updateColumn(columnId, data)
    } else {
      await createColumn(data)
    }
    setColumnModalOpen(false)
    setEditingColumn(null)
    await fetchBoard()
  } catch (err) {
    console.error('Error saving column:', err)
  }
}
 
const handleDeleteColumn = async (id) => {
  try {
    await deleteColumn(id)
    await fetchBoard()
  } catch (err) {
    console.error('Error deleting column:', err)
  }
}
 

  return (
    <PageLayout>
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Actividades
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestiona tus tareas y seguimientos
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleAddActivity(columns[0]?._id)}
            disabled={columns.length === 0}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Nueva Actividad
          </Button>
        </Box>

        {/* Filtros */}
        <Box display="flex" gap={2} mb={3}>
          <TextField
            placeholder="Buscar actividades..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              displayEmpty
              startAdornment={
                <InputAdornment position="start">
                  <FilterList fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">Todas las prioridades</MenuItem>
              {ACTIVITY_PRIORITIES.map(p => (
                <MenuItem key={p.id} value={p.id}>
                  <Chip
                    label={p.label}
                    size="small"
                    sx={{ bgcolor: `${p.color}20`, color: p.color, height: 20 }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
            <CircularProgress />
          </Box>
        ) : (
<KanbanBoard
  columns={columns}
  groupedByColumn={groupedByColumn}
  onActivityClick={handleViewActivity}
  onAddActivity={handleAddActivity}
  onEditActivity={handleEditActivity}
  onDeleteActivity={handleDeleteActivity}
  onMoveActivity={handleMoveActivity}
  // Nuevas props
  onAddColumn={handleAddColumn}
  onEditColumn={handleEditColumn}
  onDeleteColumn={handleDeleteColumn}
/>
        )}

        {/* Modal Crear/Editar */}
        <ActivityModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditingActivity(null)
          }}
          activity={editingActivity}
          columns={columns}
          onSave={handleSaveActivity}
          onAddSubtask={addSubtask}
          onUpdateSubtask={updateSubtask}
          onDeleteSubtask={deleteSubtask}
        />

<ColumnModal
  open={columnModalOpen}
  onClose={() => { setColumnModalOpen(false); setEditingColumn(null) }}
  column={editingColumn}
  onSave={handleSaveColumn}
/>

        {/* Drawer Detalles */}
        <ActivityDetails
          activity={detailsActivity}
          open={Boolean(detailsActivity)}
          onClose={() => setDetailsActivity(null)}
          onEdit={handleEditActivity}
          onDelete={handleDeleteActivity}
          onAddSubtask={addSubtask}
          onUpdateSubtask={updateSubtask}
          onDeleteSubtask={deleteSubtask}
          onAddThreadMessage={addThreadMessage}
          onRefresh={handleRefreshActivityDetails}
          columns={columns}
        />
      </Box>
    </PageLayout>
  )
}