import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button, CircularProgress,
  Box, Typography, Chip
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import api from '@shared/services/api'

const CrossProjectResidentDialog = ({ open, onClose, currentProjectId, onSelectUser }) => {
  const { t } = useTranslation(['residents', 'common'])
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Cargar proyectos al abrir
  useEffect(() => {
    if (open) {
      fetchProjects()
    } else {
      // Reset al cerrar
      setSelectedProjectId('')
      setSelectedUserId('')
      setUsers([])
    }
  }, [open])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await api.get('/projects')
      // Filtrar proyectos diferentes al actual
      const otherProjects = res.data.filter(p => p._id !== currentProjectId)
      setProjects(otherProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar usuarios cuando se selecciona un proyecto
  useEffect(() => {
    if (selectedProjectId) {
      fetchUsers(selectedProjectId)
    } else {
      setUsers([])
      setSelectedUserId('')
    }
  }, [selectedProjectId])

  const fetchUsers = async (projectId) => {
    setLoadingUsers(true)
    try {
      const res = await api.get('/users', { params: { projectId } })
      setUsers(res.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleConfirm = () => {
    const user = users.find(u => u._id === selectedUserId)
    if (user) {
      onSelectUser(user)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={600}>
          Seleccionar Residente de Otro Proyecto
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Asignar un residente que pertenece a otro proyecto
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Selector de proyecto */}
          <TextField
            fullWidth
            select
            label="Proyecto"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={loading}
            sx={{ mb: 3 }}
            helperText="Selecciona el proyecto del residente"
          >
            {loading ? (
              <MenuItem disabled>Cargando proyectos...</MenuItem>
            ) : projects.length === 0 ? (
              <MenuItem disabled>No hay otros proyectos disponibles</MenuItem>
            ) : (
              projects.map((project) => (
                <MenuItem key={project._id} value={project._id}>
                  {project.name}
                  <Chip 
                    label={project.slug || 'N/A'} 
                    size="small" 
                    sx={{ ml: 1 }} 
                  />
                </MenuItem>
              ))
            )}
          </TextField>

          {/* Selector de usuario */}
          {selectedProjectId && (
            <TextField
              fullWidth
              select
              label="Residente"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={loadingUsers}
              helperText="Selecciona el residente a asignar"
            >
              {loadingUsers ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Cargando residentes...
                </MenuItem>
              ) : users.length === 0 ? (
                <MenuItem disabled>No hay residentes en este proyecto</MenuItem>
              ) : (
                users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} - {user.email}
                    {user.phoneNumber && ` 📱 ${user.phoneNumber}`}
                  </MenuItem>
                ))
              )}
            </TextField>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedUserId}
        >
          Seleccionar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CrossProjectResidentDialog