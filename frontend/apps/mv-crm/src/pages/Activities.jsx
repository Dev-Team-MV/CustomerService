// frontend/apps/mv-crm/src/pages/Activities.jsx
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

const PROJECT_ID = import.meta.env.VITE_PROJECT_ID

export default function Activities() {
  const {currentProject} = useProjects()
  const projectId = currentProject?._id 
  const {
    columns,
    groupedByColumn,
    loading,
    error,
    createActivity,
    updateActivity,
    moveActivity,
    deleteActivity,
    fetchBoard
  } = useActivities(projectId)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [detailsActivity, setDetailsActivity] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')

  // Abrir modal para crear nueva actividad
  const handleAddActivity = (columnId) => {
    setEditingActivity({ columnId })
    setModalOpen(true)
  }

  // Abrir modal para editar
  const handleEditActivity = (activity) => {
    setEditingActivity(activity)
    setModalOpen(true)
    setDetailsActivity(null)
  }

  // Ver detalles
  const handleViewActivity = (activity) => {
    setDetailsActivity(activity)
  }

  // Guardar actividad (crear o editar)
  const handleSaveActivity = async (data, activityId) => {
    if (activityId) {
      await updateActivity(activityId, data)
    } else {
      await createActivity(data)
    }
    setModalOpen(false)
    setEditingActivity(null)
  }

  // Eliminar actividad
  const handleDeleteActivity = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta actividad?')) {
      await deleteActivity(id)
      setDetailsActivity(null)
    }
  }

  // Mover actividad (drag & drop)
  const handleMoveActivity = async (activityId, columnId) => {
    await moveActivity(activityId, columnId)
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
          /* Kanban Board */
          <KanbanBoard
            columns={columns}
            groupedByColumn={groupedByColumn}
            onActivityClick={handleViewActivity}
            onAddActivity={handleAddActivity}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
            onMoveActivity={handleMoveActivity}
          />
        )}

        {/* Modal Crear/Editar */}
        <ActivityModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingActivity(null) }}
          activity={editingActivity}
          columns={columns}
          onSave={handleSaveActivity}
        />

        {/* Panel de Detalles */}
        <ActivityDetails
          activity={detailsActivity}
          open={Boolean(detailsActivity)}
          onClose={() => setDetailsActivity(null)}
          onEdit={handleEditActivity}
          onDelete={handleDeleteActivity}
        />
      </Box>
    </PageLayout>
  )
}