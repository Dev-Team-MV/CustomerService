// apps/mv-crm/src/components/clients/ClientNotes.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { Note, Send } from '@mui/icons-material'
import ClientTimeline from './ClientTimeline'
import clientDetailService from '../../services/clientDetailService'
import { useProjects } from '@shared/hooks/useProjects'

const ClientNotes = ({ clientId, notes, onNoteAdded }) => {
  const { t } = useTranslation('clients')
  const { projects } = useProjects() // ✅ Cargar proyectos
  const [newNote, setNewNote] = useState({ title: '', text: '', projectId: '' })
  const [addingNote, setAddingNote] = useState(false)
  const [noteSuccess, setNoteSuccess] = useState(false)

  const handleAddNote = async () => {
    if (!newNote.text.trim()) return

    setAddingNote(true)
    try {
      const noteData = {
        text: newNote.text,
        title: newNote.title || 'Nota',
        projectId: newNote.projectId || undefined
      }
      const createdNote = await clientDetailService.addNote(clientId, noteData)
      
      if (onNoteAdded) {
        onNoteAdded(createdNote)
      }
      
      setNewNote({ title: '', text: '', projectId: '' })
      setNoteSuccess(true)
      setTimeout(() => setNoteSuccess(false), 3000)
    } catch (err) {
      alert('Error al agregar nota: ' + (err.response?.data?.message || err.message))
    } finally {
      setAddingNote(false)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* ═══════════════════════════════════════════════════════════
          FORMULARIO PARA AGREGAR NOTA
          ═══════════════════════════════════════════════════════════ */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          border: '1px solid #ececec',
          borderRadius: 1,
          bgcolor: '#fafafa'
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Note sx={{ fontSize: 18, color: '#888' }} />
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem',
              color: '#888',
              letterSpacing: '1.5px',
              textTransform: 'uppercase'
            }}
          >
            {t('clients.notes.addNew', 'Agregar nueva nota')}
          </Typography>
        </Box>

        {noteSuccess && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 0, border: '1px solid #4caf50' }}>
            {t('clients.notes.success', 'Nota agregada exitosamente')}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" gap={2}>
            <TextField
              size="small"
              label={t('clients.notes.title', 'Título (opcional)')}
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              sx={{
                flex: 1,
                '& .MuiInputBase-input': {
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.75rem'
                },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec' }
              }}
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                {t('clients.notes.project', 'Proyecto (opcional)')}
              </InputLabel>
              <Select
                value={newNote.projectId}
                onChange={(e) => setNewNote(prev => ({ ...prev, projectId: e.target.value }))}
                label={t('clients.notes.project', 'Proyecto (opcional)')}
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.75rem',
                  borderRadius: 0,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec' }
                }}
              >
                <MenuItem value="">{t('clients.notes.noProject', 'Sin proyecto')}</MenuItem>
                {projects.map(project => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            size="small"
            label={t('clients.notes.content', 'Contenido de la nota')}
            value={newNote.text}
            onChange={(e) => setNewNote(prev => ({ ...prev, text: e.target.value }))}
            multiline
            rows={3}
            required
            placeholder={t('clients.notes.placeholder', 'Escribe aquí la nota interna...')}
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem'
              },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec' }
            }}
          />

          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="text"
              onClick={() => setNewNote({ title: '', text: '', projectId: '' })}
              disabled={addingNote}
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                color: '#888',
                textTransform: 'none',
                letterSpacing: '0.5px'
              }}
            >
              {t('clients.notes.clear', 'Limpiar')}
            </Button>
            <Button
              variant="contained"
              startIcon={addingNote ? <CircularProgress size={16} /> : <Send />}
              onClick={handleAddNote}
              disabled={addingNote || !newNote.text.trim()}
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                textTransform: 'none',
                letterSpacing: '0.5px',
                bgcolor: '#000',
                borderRadius: 0,
                '&:hover': { bgcolor: '#333' }
              }}
            >
              {addingNote ? t('clients.notes.saving', 'Guardando...') : t('clients.notes.save', 'Guardar nota')}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* ═══════════════════════════════════════════════════════════
          HISTORIAL DE NOTAS
          ═══════════════════════════════════════════════════════════ */}
      <Typography
        sx={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.7rem',
          color: '#888',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          mb: 2
        }}
      >
        {t('clients.notes.history', 'Historial de notas')} ({notes.length})
      </Typography>

      <ClientTimeline activities={notes} />
    </Box>
  )
}

export default ClientNotes