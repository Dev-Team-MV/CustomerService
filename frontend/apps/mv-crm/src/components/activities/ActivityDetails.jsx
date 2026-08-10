import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  Tooltip
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
  Phone,
  Business
} from '@mui/icons-material'
import { ACTIVITY_PRIORITIES } from '../../constants/hooks/useActivities'
import SubActivityList from './SubActivityList'
import activityService from '../../services/activityService'

const formatDate = (date, locale = 'es-ES') => {
  if (!date) return 'Sin fecha'
  const due = new Date(date)
  return due.toLocaleDateString(locale, {
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
  const { t, i18n } = useTranslation('activities')
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

  const getRelatedProjects = () => {
    if (!currentActivity.relatedProjects || currentActivity.relatedProjects.length === 0) return []
    
    return currentActivity.relatedProjects.map(project => {
      if (typeof project === 'object') {
        return {
          id: project._id,
          name: project.name || project.title?.es || project.title?.en || 'Proyecto',
          phase: project.phase || null
        }
      }
      return { id: project, name: 'Proyecto', phase: null }
    })
  }

  const relatedProjects = getRelatedProjects()

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

  const handleAddSubtaskWithRefresh = async (activityId, data) => {
    try {
      await onAddSubtask?.(activityId, data)
      await handleRefreshActivity()
    } catch (error) {
      console.error('Error adding subtask:', error)
    }
  }

  const handleUpdateSubtaskWithRefresh = async (activityId, subtaskId, data) => {
    try {
      await onUpdateSubtask?.(activityId, subtaskId, data)
      await handleRefreshActivity()
    } catch (error) {
      console.error('Error updating subtask:', error)
    }
  }

  const handleDeleteSubtaskWithRefresh = async (activityId, subtaskId) => {
    try {
      await onDeleteSubtask?.(activityId, subtaskId)
      await handleRefreshActivity()
    } catch (error) {
      console.error('Error deleting subtask:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    setSendingMessage(true)
    try {
      await onAddThreadMessage?.(currentActivity._id, { message: newMessage })
      setNewMessage('')
      await handleRefreshActivity()
    } finally {
      setSendingMessage(false)
    }
  }

  const locale = i18n.language === 'es' ? 'es-ES' : 'en-US'

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
          flexShrink: 0,
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            {column && (
              <Chip
                label={column.name}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 1, borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }}
              />
            )}
            <Typography variant="h6" fontWeight={700} sx={{ wordBreak: 'break-word', fontFamily: '"Helvetica Neue", sans-serif', fontSize: '1.1rem' }}>
              {currentActivity.title}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white', flexShrink: 0, borderRadius: 0 }}>
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* Content - Scrollable */}
      <Box sx={{ p: { xs: 2, sm: 3 }, overflowY: 'auto', flex: 1 }}>
        {/* Prioridad y Tags */}
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip
            label={t(`activities.priority.${priority?.id}`) || t('activities.priority.medium')}
            sx={{
              bgcolor: `${priority?.color || '#2196f3'}20`,
              color: priority?.color || '#2196f3',
              fontWeight: 600,
              borderRadius: 0,
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem'
            }}
          />
          {currentActivity.tags?.map((tag, idx) => (
            <Chip
              key={idx}
              label={tag}
              size="small"
              icon={<Label sx={{ fontSize: 14 }} />}
              variant="outlined"
              sx={{
                borderRadius: 0,
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem',
                borderColor: tag === 'automation' ? '#9c27b0' : tag === 'nota' ? '#ff9800' : '#e0e0e0',
                color: tag === 'automation' ? '#9c27b0' : tag === 'nota' ? '#ff9800' : '#666'
              }}
            />
          ))}
        </Box>

        {/* Proyectos Relacionados */}
        {relatedProjects.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {t('activities.details.relatedProjects', 'Proyectos Relacionados')}
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {relatedProjects.map((project) => (
                <Paper
                  key={project.id}
                  variant="outlined"
                  sx={{ p: 1.5, borderRadius: 0, bgcolor: '#e3f2fd', borderColor: '#2196f3' }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Business sx={{ fontSize: 20, color: '#2196f3' }} />
                    <Box flex={1}>
                      <Typography fontWeight={600} sx={{ color: '#1976d2', fontSize: '0.9rem', fontFamily: '"Helvetica Neue", sans-serif' }}>
                        {project.name}
                      </Typography>
                      {project.phase && (
                        <Typography variant="caption" sx={{ color: '#2196f3', fontFamily: '"Courier New", monospace' }}>
                          Fase: {project.phase}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        {/* Descripción */}
        {currentActivity.description && (
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {t('activities.form.description')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Helvetica Neue", sans-serif', lineHeight: 1.6 }}>
              {currentActivity.description}
            </Typography>
          </Box>
        )}

        {/* Fecha */}
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <AccessTime sx={{ fontSize: 20, color: '#757575' }} />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', textTransform: 'uppercase' }}>
              {t('activities.form.dueDate')}
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
              {formatDate(currentActivity.dueDate, locale)}
            </Typography>
          </Box>
        </Box>

        {/* Asignado */}
        {assignee && (
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {t('activities.form.assignedTo')}
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 0, border: '1px solid #e0e0e0' }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: '#000', width: 36, height: 36, borderRadius: 0, fontSize: '0.9rem' }}>
                  {assignee.firstName?.charAt(0) || '?'}
                </Avatar>
                <Box>
                  <Typography fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                    {`${assignee.firstName || ''} ${assignee.lastName || ''}`.trim()}
                  </Typography>
                  {assignee.email && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Email sx={{ fontSize: 14, color: '#757575' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
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
            <Typography variant="subtitle2" fontWeight={600} mb={1.5} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {t('activities.details.associatedContact')}
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 0, bgcolor: '#fff8e1', borderColor: '#ffe0b2' }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: '#ff9800', width: 36, height: 36, borderRadius: 0 }}>
                  <Person sx={{ color: '#fff' }} />
                </Avatar>
                <Box flex={1}>
                  <Typography fontWeight={600} sx={{ color: '#e65100', fontFamily: '"Helvetica Neue", sans-serif' }}>
                    {contact.name}
                  </Typography>
                  {contact.phone && (
                    <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                      <Phone sx={{ fontSize: 14, color: '#ff9800' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                        {contact.phone}
                      </Typography>
                    </Box>
                  )}
                  {contact.email && (
                    <Box display="flex" alignItems="center" gap={0.5} mt={0.3}>
                      <Email sx={{ fontSize: 14, color: '#ff9800' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
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
            <Typography variant="subtitle2" fontWeight={600} mb={1.5} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {t('activities.details.createdBy')}
            </Typography>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar sx={{ bgcolor: '#4caf50', width: 28, height: 28, fontSize: 12, borderRadius: 0 }}>
                {creator.firstName?.charAt(0) || '?'}
              </Avatar>
              <Box>
                <Typography variant="caption" fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                  {`${creator.firstName || ''} ${creator.lastName || ''}`.trim()}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }}>
                  {creator.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Subtareas */}
        <SubActivityList
          subActivities={currentActivity.subtasks || []}
          parentActivityId={currentActivity._id}
          onAdd={handleAddSubtaskWithRefresh}
          onUpdate={handleUpdateSubtaskWithRefresh}
          onDelete={handleDeleteSubtaskWithRefresh}
          readOnly={false}
        />

        <Divider sx={{ my: 2 }} />

        {/* ✅ Comentarios (CORREGIDO) */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} mb={2} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {t('activities.details.comments')} ({currentActivity.threads?.length || 0})
          </Typography>
          
          {currentActivity.threads?.length > 0 ? (
            <Box sx={{ mb: 2, maxHeight: 300, overflowY: 'auto' }}>
              {currentActivity.threads.map((thread, idx) => (
                <Paper 
                  key={thread._id || idx} 
                  variant="outlined" 
                  sx={{ p: 1.5, mb: 1, borderRadius: 0, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }}
                >
                  <Box display="flex" gap={1.5}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: '#000', borderRadius: 0, flexShrink: 0 }}>
                      {thread.createdBy?.firstName?.charAt(0) || '?'}
                    </Avatar>
                    <Box flex={1} minWidth={0}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="caption" fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                          {thread.createdBy?.firstName || t('activities.user')} {thread.createdBy?.lastName || ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }}>
                          {thread.createdAt ? new Date(thread.createdAt).toLocaleDateString(locale, {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : ''}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: '"Helvetica Neue", sans-serif', wordBreak: 'break-word', lineHeight: 1.5 }}>
                        {/* ✅ CORRECCIÓN PRINCIPAL: thread.content -> thread.message */}
                        {thread.message}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
              {t('activities.details.noComments')}
            </Typography>
          )}

          {/* Input para nuevo mensaje */}
          <Box display="flex" gap={1}>
            <TextField
              size="small"
              placeholder={t('activities.details.writeComment')}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              fullWidth
              multiline
              maxRows={3}
              sx={{ 
                '& .MuiOutlinedInput-root': { borderRadius: 0 },
                '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem' }
              }}
            />
            <IconButton 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendingMessage || refreshing}
              sx={{ 
                alignSelf: 'flex-end', 
                borderRadius: 0, 
                bgcolor: '#000', 
                color: '#fff', 
                '&:hover': { bgcolor: '#222' }, 
                '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' } 
              }}
            >
              {sendingMessage || refreshing ? <CircularProgress size={20} color="inherit" /> : <Send sx={{ fontSize: 18 }} />}
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Footer Actions */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', flexShrink: 0, display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={() => onEdit?.(currentActivity)}
          sx={{ 
            flex: 1, 
            borderRadius: 0, 
            textTransform: 'none', 
            fontFamily: '"Courier New", monospace', 
            fontSize: '0.75rem',
            border: '1px solid #000',
            color: '#000',
            '&:hover': { bgcolor: '#f5f5f5', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' }
          }}
        >
          {t('activities.form.edit')}
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={() => {
            if (window.confirm(t('activities.deleteConfirm'))) {
              onDelete?.(currentActivity._id)
              onClose()
            }
          }}
          sx={{ 
            flex: 1, 
            borderRadius: 0, 
            textTransform: 'none', 
            fontFamily: '"Courier New", monospace', 
            fontSize: '0.75rem',
            border: '1px solid #f44336',
            color: '#f44336',
            '&:hover': { bgcolor: '#ffebee', boxShadow: '4px 4px 0px rgba(244,67,54,0.12)' }
          }}
        >
          {t('activities.form.delete')}
        </Button>
      </Box>
    </Drawer>
  )
}

export default ActivityDetails