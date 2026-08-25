import { useState } from 'react'
import { Box, Typography, TextField, Button } from '@mui/material'
import { NoteAdd } from '@mui/icons-material'

export default function LoanNotes({ notes = '', onAddNote }) {
  const [newNote, setNewNote] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!newNote.trim()) return
    setSaving(true)
    try {
      await onAddNote?.(newNote.trim())
      setNewNote('')
    } finally {
      setSaving(false)
    }
  }

  const noteLines = notes ? notes.split('\n').filter(Boolean) : []

  return (
    <Box sx={{ border: '1px solid #e0e0e0', bgcolor: '#fff', mb: 3 }}>
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>
        <Typography
          sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#000' }}
        >
          Internal Notes
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            size="small"
            multiline
            rows={2}
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0, fontSize: '0.82rem' } }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) handleSubmit()
            }}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!newNote.trim() || saving}
            sx={{
              borderRadius: 0,
              minWidth: 44,
              bgcolor: '#000',
              alignSelf: 'flex-end',
              '&:hover': { bgcolor: '#222' }
            }}
          >
            <NoteAdd sx={{ fontSize: 18 }} />
          </Button>
        </Box>

        {noteLines.length > 0 && (
          <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
            {noteLines.map((line, i) => (
              <Box key={i} sx={{ py: 0.75, borderBottom: '1px solid #f5f5f5' }}>
                <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.82rem', color: '#333' }}>
                  {line}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {noteLines.length === 0 && (
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#aaa', textAlign: 'center', py: 1 }}>
            No notes yet
          </Typography>
        )}
      </Box>
    </Box>
  )
}
