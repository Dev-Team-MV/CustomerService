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
import { useActivities, ACTIVITY_CATEGORIES } from '../constants/hooks/useActivities'

export default function Activities() {
  const {
    groupedByStatus,
    loading,
    error,
    projects,
    filters,
    setFilters,
    createActivity,
    updateActivity,
    changeStatus,
    deleteActivity,
    addSubActivity,
    updateSubActivity,
    deleteSubActivity
  } = useActivities()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [detailsActivity, setDetailsActivity] = useState(null)
  const [searchValue, setSearchValue] = useState('')

  // Abrir modal para crear nueva actividad
  const handleAddActivity = (initialStatus = 'pending') => {
    setEditingActivity({ status: initialStatus })
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
    if (activityId && activityId !== 'new') {
      await updateActivity(activityId, data)
    } else {
      await createActivity(data)
    }
  }

  // Eliminar actividad
  const handleDeleteActivity = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta actividad?')) {
      await deleteActivity(id)
      setDetailsActivity(null)
    }
  }

  // Buscar
  const handleSearch = (value) => {
    setSearchValue(value)
    setFilters(prev => ({ ...prev, search: value }))
  }

  // Filtrar por categoría
  const handleCategoryFilter = (category) => {
    setFilters(prev => ({ 
      ...prev, 
      category: category === 'all' ? undefined : category 
    }))
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
              Gestiona tus tareas, reuniones y seguimientos
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleAddActivity()}
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
            onChange={(e) => handleSearch(e.target.value)}
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
              value={filters.category || 'all'}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              displayEmpty
              startAdornment={
                <InputAdornment position="start">
                  <FilterList fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">Todas las categorías</MenuItem>
              {ACTIVITY_CATEGORIES.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.icon} {c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {filters.category && (
            <Chip
              label={`Filtro: ${ACTIVITY_CATEGORIES.find(c => c.id === filters.category)?.label}`}
              onDelete={() => handleCategoryFilter('all')}
              size="small"
            />
          )}
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
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
            groupedByStatus={groupedByStatus}
            onActivityClick={handleViewActivity}
            onAddActivity={handleAddActivity}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
            onStatusChange={changeStatus}
          />
        )}

        {/* Modal Crear/Editar */}
        <ActivityModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingActivity(null) }}
          activity={editingActivity}
          projects={projects}
          onSave={handleSaveActivity}
          onAddSubActivity={addSubActivity}
          onUpdateSubActivity={updateSubActivity}
          onDeleteSubActivity={deleteSubActivity}
        />

        {/* Panel de Detalles */}
        <ActivityDetails
          activity={detailsActivity}
          open={Boolean(detailsActivity)}
          onClose={() => setDetailsActivity(null)}
          onEdit={handleEditActivity}
          onDelete={handleDeleteActivity}
          onAddSubActivity={addSubActivity}
          onUpdateSubActivity={updateSubActivity}
          onDeleteSubActivity={deleteSubActivity}
        />
      </Box>
    </PageLayout>
  )
}