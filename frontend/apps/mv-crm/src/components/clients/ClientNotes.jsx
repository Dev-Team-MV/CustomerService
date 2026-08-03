// apps/mv-crm/src/components/clients/ClientNotes.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Paper, TextField, Button, CircularProgress, Alert, Divider, FormControl, InputLabel, Select, MenuItem, Avatar, Chip, useMediaQuery, useTheme } from '@mui/material'
import { Note, Send, Business, Person } from '@mui/icons-material'
import clientDetailService from '../../services/clientDetailService'
import { useProjects } from '@shared/hooks/useProjects'

const ClientNotes = ({ clientId, notes, onNoteAdded }) => {
  const { t } = useTranslation('residents')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { projects } = useProjects()
  
  const [newNote, setNewNote] = useState({ title: '', text: '', projectId: '' })
  const [addingNote, setAddingNote] = useState(false)
  const [noteSuccess, setNoteSuccess] = useState(false)

  const handleAddNote = async () => {
    if (!newNote.text.trim()) return
    setAddingNote(true)
    try {
      const noteData = { text: newNote.text, title: newNote.title || t('notes.noTitle'), projectId: newNote.projectId || undefined }
      const createdNote = await clientDetailService.addNote(clientId, noteData)
      if (onNoteAdded) onNoteAdded(createdNote)
      setNewNote({ title: '', text: '', projectId: '' })
      setNoteSuccess(true)
      setTimeout(() => setNoteSuccess(false), 3000)
    } catch (err) {
      alert(`${t('notes.error')}: ${err.response?.data?.message || err.message}`)
    } finally {
      setAddingNote(false)
    }
  }

  const getRelatedProjects = (note) => {
    const projectNames = []
    if (note.projectId) {
      const project = projects.find(p => p._id === note.projectId)
      if (project) projectNames.push(project.name)
    }
    if (note.relatedProjects && note.relatedProjects.length > 0) {
      note.relatedProjects.forEach(projectId => {
        const project = projects.find(p => p._id === projectId)
        if (project && !projectNames.includes(project.name)) projectNames.push(project.name)
      })
    }
    return projectNames
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      {/* FORMULARIO PARA AGREGAR NOTA */}
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 3, border: '1px solid #ececec', borderRadius: 0, bgcolor: '#fafafa' }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Note sx={{ fontSize: 18, color: '#000000ff' }} />
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#000000ff', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            {t('notes.addNew')}
          </Typography>
        </Box>

        {noteSuccess && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 0, border: '1px solid #4caf50', fontFamily: '"Courier New", monospace' }}>
            {t('notes.success')}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
            <TextField size="small" label={t('notes.noteTitle')} value={newNote.title} onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))} sx={{ flex: 1, '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec', borderRadius: 0 } }} />
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{t('notes.project')}</InputLabel>
              <Select value={newNote.projectId} onChange={(e) => setNewNote(prev => ({ ...prev, projectId: e.target.value }))} label={t('notes.project')} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec' } }}>
                <MenuItem value="">{t('notes.noProject')}</MenuItem>
                {projects.map(project => <MenuItem key={project._id} value={project._id}>{project.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <TextField size="small" label={t('notes.content')} value={newNote.text} onChange={(e) => setNewNote(prev => ({ ...prev, text: e.target.value }))} multiline rows={3} required placeholder={t('notes.placeholder')} sx={{ '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec', borderRadius: 0 } }} />

          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button variant="text" onClick={() => setNewNote({ title: '', text: '', projectId: '' })} disabled={addingNote} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: '#000000ff', textTransform: 'none', letterSpacing: '0.5px', borderRadius: 0 }}>
              {t('notes.clear')}
            </Button>
            <Button variant="contained" startIcon={addingNote ? <CircularProgress size={16} /> : <Send />} onClick={handleAddNote} disabled={addingNote || !newNote.text.trim()} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', textTransform: 'none', letterSpacing: '0.5px', borderRadius: 0, bgcolor: '#000', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
              {addingNote ? t('notes.saving') : t('notes.save')}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* HISTORIAL DE NOTAS */}
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#000000ff', letterSpacing: '1.5px', textTransform: 'uppercase', mb: 2 }}>
        {t('notes.history')} ({notes.length})
      </Typography>

      {notes.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center', border: '1px dashed #ececec', borderRadius: 0 }}>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: '#aaa', letterSpacing: '0.5px' }}>
            {t('notes.noNotesRegistered')}
          </Typography>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {notes.map((note) => {
            const relatedProjectNames = getRelatedProjects(note)
            return (
              <Paper key={note._id} elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, border: '1px solid #ececec', borderRadius: 0, bgcolor: '#fff', transition: 'all 0.2s', '&:hover': { boxShadow: '4px 4px 0px rgba(0,0,0,0.08)', borderColor: '#ff9800' } }}>
                {/* Header */}
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'flex-start' }} gap={1} mb={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Note sx={{ fontSize: 18, color: '#ff9800' }} />
                    <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '1rem', fontWeight: 600, color: '#000' }}>
                      {note.title || t('notes.noTitle')}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000000ff', letterSpacing: '0.5px' }}>
                    {formatDate(note.createdAt)}
                  </Typography>
                </Box>

                {/* Contenido */}
                {note.description && (
                  <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.9rem', color: '#444', lineHeight: 1.6, mb: 1.5, pl: { xs: 0, sm: 3.5 } }}>
                    {note.description}
                  </Typography>
                )}

                {/* Metadata */}
                <Box display="flex" gap={1} flexWrap="wrap" mb={1.5} pl={{ xs: 0, sm: 3.5 }}>
                  {relatedProjectNames.map((projectName, idx) => (
                    <Box key={idx} display="flex" alignItems="center" gap={0.5}>
                      <Business sx={{ fontSize: 14, color: '#2196f3' }} />
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#2196f3', letterSpacing: '0.5px' }}>
                        {projectName}
                      </Typography>
                    </Box>
                  ))}

                  {note.columnId && (
                    <Chip label={typeof note.columnId === 'object' ? note.columnId.name : t('notes.column')} size="small" sx={{ borderRadius: 0, bgcolor: '#f5f5f5', color: '#666', fontFamily: '"Courier New", monospace', fontSize: '0.6rem', height: 20 }} />
                  )}

                  {note.priority && (
                    <Chip label={t(`timeline.priority.${note.priority}`, note.priority)} size="small" sx={{ borderRadius: 0, bgcolor: note.priority === 'high' ? '#ffebee' : note.priority === 'medium' ? '#fff3e0' : '#e8f5e9', color: note.priority === 'high' ? '#c62828' : note.priority === 'medium' ? '#f57c00' : '#2e7d32', fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 600, height: 20, textTransform: 'uppercase' }} />
                  )}
                </Box>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <Box display="flex" gap={0.5} flexWrap="wrap" mb={1.5} pl={{ xs: 0, sm: 3.5 }}>
                    {note.tags.map((tag, idx) => (
                      <Box key={idx} sx={{ px: 1, py: 0.3, bgcolor: '#f5f5f5', borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#666', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        {tag}
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Asignado a + Creado por */}
                <Box display="flex" gap={2} alignItems="center" pl={{ xs: 0, sm: 3.5 }} flexWrap="wrap">
                  {note.assignedTo && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Person sx={{ fontSize: 14, color: '#4caf50' }} />
                      <Avatar sx={{ width: 18, height: 18, borderRadius: 0, fontSize: '0.55rem', bgcolor: '#4caf50' }}>
                        {note.assignedTo.firstName?.charAt(0) || '?'}
                      </Avatar>
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#4caf50', letterSpacing: '0.5px' }}>
                        {t('notes.assignedTo')}: {note.assignedTo.firstName} {note.assignedTo.lastName}
                      </Typography>
                    </Box>
                  )}

                  {note.createdBy && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Avatar sx={{ width: 18, height: 18, borderRadius: 0, fontSize: '0.55rem', bgcolor: '#757575' }}>
                        {note.createdBy.firstName?.charAt(0) || '?'}
                      </Avatar>
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000000ff', letterSpacing: '0.5px' }}>
                        {t('notes.createdBy')}: {note.createdBy.firstName} {note.createdBy.lastName}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            )
          })}
        </Box>
      )}
    </Box>
  )
}

export default ClientNotes