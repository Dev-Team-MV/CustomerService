import { useState, useEffect } from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Divider,
  Button,
  Paper,
  TextField,
  CircularProgress,
  Checkbox
} from '@mui/material'
import { 
  Close, 
  Edit, 
  Delete,
  AccessTime,
  Email,
  Label,
  Send,
  Person,
  Phone
} from '@mui/icons-material'
import { ACTIVITY_PRIORITIES } from '../../constants/hooks/useActivities'
import SubActivityList from './SubActivityList'
import activityService from '../../services/activityService'

const formatDate = (date) => {
  if (!date) return 'Sin fecha'
  const due = new Date(date)
  return due.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const ActivityDetails = ({ 
  activity, 
  open, 
  onClose, 
  onEdit, 
  onDelete,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onAddThreadMessage,
  columns = []
}) => {
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [currentActivity, setCurrentActivity] = useState(activity)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    setCurrentActivity(activity)
  }, [activity])

  if (!currentActivity) return null

  const priority = ACTIVITY_PRIORITIES.find(p => p.id === currentActivity.priority)
const columnId = typeof currentActivity.columnId === 'object' 
  ? currentActivity.columnId._id 
  : currentActivity.columnId
const column = columns.find(c => c._id === columnId) || 
  (typeof currentActivity.columnId === 'object' ? currentActivity.columnId : null)
  
  const assignee = currentActivity.assignedTo
  const contact = currentActivity.contact
  const creator = currentActivity.createdBy

  // ✅ NUEVA FUNCIÓN: Refrescar la actividad desde el backend
  const handleRefreshActivity = async () => {
    if (!currentActivity?._id) return
    setRefreshing(true)
    try {
      const updated = await activityService.getById(currentActivity._id)
      setCurrentActivity(updated)
    } catch (err) {
      console.error('Error refreshing activity:', err)
    } finally {
      setRefreshing(false)
    }
  }

  // ✅ Agregar subtarea y refrescar
  const handleAddSubtaskWithRefresh = async (activityId, data) => {
    try {
      await onAddSubtask?.(activityId, data)
      // Refrescar después de agregar
      await handleRefreshActivity()
    } catch (error) {
      console.error('Error adding subtask:', error)
    }
  }

  // ✅ Actualizar subtarea y refrescar
  const handleUpdateSubtaskWithRefresh = async (activityId, subtaskId, data) => {
    try {
      await onUpdateSubtask?.(activityId, subtaskId, data)
      // Refrescar después de actualizar
      await handleRefreshActivity()
    } catch (error) {
      console.error('Error updating subtask:', error)
    }
  }

  // ✅ Eliminar subtarea y refrescar
  const handleDeleteSubtaskWithRefresh = async (activityId, subtaskId) => {
    try {
      await onDeleteSubtask?.(activityId, subtaskId)
      // Refrescar después de eliminar
      await handleRefreshActivity()
    } catch (error) {
      console.error('Error deleting subtask:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    setSendingMessage(true)
    try {
      await onAddThreadMessage?.(currentActivity._id, { content: newMessage })
      setNewMessage('')
      // Refrescar para mostrar el nuevo mensaje
      await handleRefreshActivity()
    } finally {
      setSendingMessage(false)
    }
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 450 }, p: 0, display: 'flex', flexDirection: 'column' } }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: column?.color || '#757575',
          color: 'white',
          flexShrink: 0
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            {column && (
              <Chip
                label={column.name}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 1 }}
              />
            )}
            <Typography variant="h6" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
              {currentActivity.title}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white', flexShrink: 0 }}>
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* Content - Scrollable */}
      <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
        {/* Prioridad y Tags */}
        <Box display="flex" gap={1} mb={3} flexWrap="wrap">
          <Chip
            label={priority?.label || 'Media'}
            sx={{
              bgcolor: `${priority?.color || '#2196f3'}20`,
              color: priority?.color || '#2196f3',
              fontWeight: 600
            }}
          />
          {currentActivity.tags?.map((tag, idx) => (
            <Chip
              key={idx}
              label={tag}
              size="small"
              icon={<Label sx={{ fontSize: 14 }} />}
              variant="outlined"
            />
          ))}
        </Box>

        {/* Descripción */}
        {currentActivity.description && (
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Descripción
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentActivity.description}
            </Typography>
          </Box>
        )}

        {/* Fecha */}
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <AccessTime sx={{ fontSize: 20, color: '#757575' }} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Fecha de vencimiento
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatDate(currentActivity.dueDate)}
            </Typography>
          </Box>
        </Box>

        {/* Asignado */}
        {assignee && (
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
              Asignado a
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: '#2196f3', width: 36, height: 36 }}>
                  {assignee.firstName?.charAt(0) || '?'}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>
                    {`${assignee.firstName || ''} ${assignee.lastName || ''}`.trim()}
                  </Typography>
                  {assignee.email && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Email sx={{ fontSize: 14, color: '#757575' }} />
                      <Typography variant="caption" color="text.secondary">
                        {assignee.email}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Contacto asociado */}
        {contact && (
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
              Contacto asociado
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: '#fff8e1',
                borderColor: '#ffb74d'
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: '#ff9800', width: 36, height: 36 }}>
                  <Person />
                </Avatar>
                <Box flex={1}>
                  <Typography fontWeight={600} sx={{ color: '#e65100' }}>
                    {contact.name}
                  </Typography>
                  {contact.phone && (
                    <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                      <Phone sx={{ fontSize: 14, color: '#ff9800' }} />
                      <Typography variant="caption" color="text.secondary">
                        {contact.phone}
                      </Typography>
                    </Box>
                  )}
                  {contact.email && (
                    <Box display="flex" alignItems="center" gap={0.5} mt={0.3}>
                      <Email sx={{ fontSize: 14, color: '#ff9800' }} />
                      <Typography variant="caption" color="text.secondary">
                        {contact.email}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Creado por */}
        {creator && (
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
              Creado por
            </Typography>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar sx={{ bgcolor: '#4caf50', width: 28, height: 28, fontSize: 12 }}>
                {creator.firstName?.charAt(0) || '?'}
              </Avatar>
              <Box>
                <Typography variant="caption" fontWeight={600}>
                  {`${creator.firstName || ''} ${creator.lastName || ''}`.trim()}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {creator.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Subtareas - ✅ CON REFRESH AUTOMÁTICO */}
        <SubActivityList
          subActivities={currentActivity.subtasks || []}
          parentActivityId={currentActivity._id}
          onAdd={handleAddSubtaskWithRefresh}
          onUpdate={handleUpdateSubtaskWithRefresh}
          onDelete={handleDeleteSubtaskWithRefresh}
          readOnly={false}
        />

        <Divider sx={{ my: 2 }} />

        {/* Comentarios */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} mb={2}>
            Comentarios ({currentActivity.threads?.length || 0})
          </Typography>
          
          {currentActivity.threads?.length > 0 ? (
            <Box sx={{ mb: 2, maxHeight: 300, overflowY: 'auto' }}>
              {currentActivity.threads.map((thread, idx) => (
                <Paper 
                  key={thread._id || idx} 
                  variant="outlined" 
                  sx={{ p: 1.5, mb: 1, borderRadius: 2, bgcolor: '#f5f5f5' }}
                >
                  <Box display="flex" gap={1.5}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: '#2196f3', flexShrink: 0 }}>
                      {thread.createdBy?.firstName?.charAt(0) || '?'}
                    </Avatar>
                    <Box flex={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="caption" fontWeight={600}>
                          {thread.createdBy?.firstName || 'Usuario'} {thread.createdBy?.lastName || ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {thread.createdAt ? new Date(thread.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : ''}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {thread.content}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Sin comentarios
            </Typography>
          )}

          {/* Input para nuevo mensaje */}
          <Box display="flex" gap={1}>
            <TextField
              size="small"
              placeholder="Escribe un comentario..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              fullWidth
              multiline
              maxRows={3}
            />
            <IconButton 
              color="primary" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendingMessage || refreshing}
              sx={{ alignSelf: 'flex-end' }}
            >
              {sendingMessage || refreshing ? <CircularProgress size={20} /> : <Send />}
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Footer Actions */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', flexShrink: 0, display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={() => onEdit?.(currentActivity)}
          fullWidth
          size="small"
        >
          Editar
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={() => {
            if (window.confirm('¿Eliminar esta actividad?')) {
              onDelete?.(currentActivity._id)
              onClose()
            }
          }}
          fullWidth
          size="small"
        >
          Eliminar
        </Button>
      </Box>
    </Drawer>
  )
}

export default ActivityDetails