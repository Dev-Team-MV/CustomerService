// apps/mv-crm/src/pages/Activities.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
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
  const { t } = useTranslation('activities')
  const { currentProject } = useProjects()
  const projectId = currentProject?._id || null
  
  const [searchParams, setSearchParams] = useSearchParams()
  const activityIdFromUrl = searchParams.get('activityId')

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
  const [columnModalOpen, setColumnModalOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState(null)

  useEffect(() => {
    if (activityIdFromUrl && columns.length > 0) {
      loadActivityFromUrl(activityIdFromUrl)
    }
  }, [activityIdFromUrl, columns])

  const loadActivityFromUrl = async (activityId) => {
    try {
      for (const column of columns) {
        const activity = column.activities?.find(a => a._id === activityId)
        if (activity) {
          setDetailsActivity(activity)
          return
        }
      }
      const activity = await activityService.getById(activityId)
      if (activity) setDetailsActivity(activity)
    } catch (err) {
      console.error('Error loading activity from URL:', err)
    }
  }

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
      if (activityId) await updateActivity(activityId, data)
      else await createActivity(data)
      setModalOpen(false)
      setEditingActivity(null)
      await fetchBoard()
    } catch (err) {
      console.error('Error saving activity:', err)
    }
  }

  const handleDeleteActivity = async (id) => {
    if (window.confirm(t('activities.deleteConfirm'))) {
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
      if (columnId) await updateColumn(columnId, data)
      else await createColumn(data)
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

  // ✅ Estilos unificados
  const unifiedButtonSx = { borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }
  const inputSx = { 
    fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, 
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' }
  }

  return (
    <PageLayout
      title={t('activities.title')}
      subtitle={t('activities.description')}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* ✅ FILA UNIFICADA: Filtros a la izquierda, Botón a la derecha */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          
          {/* Grupo de Filtros (Izquierda) */}
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              placeholder={t('activities.searchPlaceholder')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              size="small"
              sx={{ width: 300, ...inputSx }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#aaa' }} />
                  </InputAdornment>
                )
              }}
            />

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                displayEmpty
                sx={inputSx}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterList fontSize="small" sx={{ color: '#aaa' }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="all" sx={{ fontFamily: '"Courier New", monospace' }}>{t('activities.allPriorities')}</MenuItem>
                {ACTIVITY_PRIORITIES.map(p => (
                  <MenuItem key={p.id} value={p.id} sx={{ fontFamily: '"Courier New", monospace' }}>
                    <Chip
                      label={t(`activities.priority.${p.id}`)}
                      size="small"
                      sx={{ bgcolor: `${p.color}20`, color: p.color, height: 20, borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Botón de Nueva Actividad (Derecha) */}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleAddActivity(columns[0]?._id)}
            disabled={columns.length === 0}
            sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', fontWeight: 600, '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}
          >
            {t('activities.newActivity')}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 0, border: '1px solid', fontFamily: '"Courier New", monospace' }} onClose={() => {}}>
            {error}
          </Alert>
        )}

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
            onAddColumn={handleAddColumn}
            onEditColumn={handleEditColumn}
            onDeleteColumn={handleDeleteColumn}
          />
        )}

        <ActivityModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingActivity(null) }}
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