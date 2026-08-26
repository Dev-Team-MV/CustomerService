import { useState } from 'react'
import { Box, Typography, TextField, Button, List, ListItem, Avatar, Divider, CircularProgress } from '@mui/material'
import { Send } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

export default function LoanNotes({ notes = [], onAddNote }) {
  const { t } = useTranslation('loans')
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    setLoading(true)
    try {
      await onAddNote(newNote)
      setNewNote('')
    } catch (err) {
      console.error('Error adding note:', err)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (user) => {
    if (!user) return '?'
    const first = user.firstName?.charAt(0) || ''
    const last = user.lastName?.charAt(0) || ''
    return `${first}${last}`.toUpperCase() || '?'
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const inputSx = {
    fontFamily: '"Courier New", monospace',
    fontSize: '0.75rem',
    borderRadius: 0,
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem' },
    '& .MuiInputBase-input::placeholder': { fontFamily: '"Courier New", monospace', opacity: 1 }
  }

  const unifiedButtonSx = {
    borderRadius: 0,
    textTransform: 'none',
    fontFamily: '"Courier New", monospace',
    fontSize: '0.75rem',
    letterSpacing: '0.5px',
    '&:hover': { boxShadow: '4px 4px 0px rgba(0,0,0,0.1)' }
  }

  return (
    <Box sx={{ border: '1px solid #ececec', borderRadius: 0, bgcolor: '#fff', p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder={t('loans.notes.placeholder', 'Add an internal note...')}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          sx={inputSx}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            variant="contained"
            size="small"
            endIcon={loading ? <CircularProgress size={14} /> : <Send />}
            onClick={handleAddNote}
            disabled={!newNote.trim() || loading}
            sx={{ ...unifiedButtonSx, color: '#fff' }}
          >
            {t('loans.notes.postNote', 'Post Note')}
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 2, borderColor: '#ececec' }} />

      {notes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
            {t('loans.notes.noNotes', 'No notes yet')}
          </Typography>
        </Box>
      ) : (
        <List sx={{ p: 0, maxHeight: 400, overflowY: 'auto' }}>
          {notes.map((note, index) => (
            <ListItem key={note._id || index} sx={{ px: 0, py: 1.5, alignItems: 'flex-start', borderBottom: '1px solid #f0f0f0', '&:last-child': { borderBottom: 'none' } }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2', fontSize: '0.75rem', mr: 1.5, flexShrink: 0, fontWeight: 700 }}>
                {getInitials(note.author || note.performedBy)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1a1a', fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem' }}>
                    {note.author?.firstName || note.performedBy?.firstName || 'Unknown'} {note.author?.lastName || note.performedBy?.lastName || ''}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9e9e9e', fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }}>
                    {formatDate(note.createdAt || note.timestamp)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#424242', lineHeight: 1.5, whiteSpace: 'pre-wrap', fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', wordBreak: 'break-word' }}>
                  {note.metadata?.note || note.text || note.note || 'No content'}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}