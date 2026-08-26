import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box, Typography, Button, TextField, IconButton
} from '@mui/material'
import { Edit, Save, Close, Flag } from '@mui/icons-material'

function personName(p) {
  if (!p) return '—'
  if (typeof p === 'object') return [p.firstName, p.lastName].filter(Boolean).join(' ') || p.email || '—'
  return String(p)
}

export default function LoanNextAction({ nextAction = {}, onSave }) {
  const { t } = useTranslation('loans')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    description: nextAction?.description || '',
    deadline: nextAction?.deadline ? new Date(nextAction.deadline).toISOString().split('T')[0] : ''
  })

  const deadline = nextAction?.deadline ? new Date(nextAction.deadline) : null
  const isOverdue = deadline && deadline < new Date()
  const isSoon = deadline && !isOverdue && (deadline - new Date()) < 3 * 24 * 60 * 60 * 1000

  const handleSave = () => {
    onSave?.({
      description: form.description,
      deadline: form.deadline || null
    })
    setEditing(false)
  }

  return (
    <Box
    id="loan-next-action"
      sx={{
        border: isOverdue ? '2px solid #f44336' : isSoon ? '2px solid #ff9800' : '1px solid #e0e0e0',
        bgcolor: isOverdue ? '#fff5f5' : isSoon ? '#fff8e1' : '#fff',
        p: 2,
        mb: 3
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Flag sx={{ fontSize: 16, color: isOverdue ? '#f44336' : isSoon ? '#ff9800' : '#2196f3' }} />
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.65rem',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#000'
            }}
          >
            {t('loans.nextAction.title')}
          </Typography>
        </Box>
        {!editing ? (
          <IconButton size="small" onClick={() => setEditing(true)}>
            <Edit sx={{ fontSize: 14 }} />
          </IconButton>
        ) : (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={handleSave}><Save sx={{ fontSize: 14 }} /></IconButton>
            <IconButton size="small" onClick={() => setEditing(false)}><Close sx={{ fontSize: 14 }} /></IconButton>
          </Box>
        )}
      </Box>

      {editing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder={t('loans.nextAction.placeholder', 'What needs to happen next...')}
            size="small"
            multiline
            rows={2}
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0, fontSize: '0.82rem' } }}
          />
          <TextField
            type="date"
            value={form.deadline}
            onChange={(e) => setForm(prev => ({ ...prev, deadline: e.target.value }))}
            label={t('loans.nextAction.deadline')}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ maxWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 0, fontSize: '0.82rem' } }}
          />
        </Box>
      ) : (
        <Box>
          <Typography
            sx={{
              fontFamily: '"Helvetica Neue", sans-serif',
              fontSize: '0.95rem',
              fontWeight: 400,
              color: '#000',
              mb: 0.5
            }}
          >
            {nextAction?.description || t('loans.nextAction.empty')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#888' }}>
              {t('loans.nextAction.responsible')}: {personName(nextAction?.responsiblePerson)}
            </Typography>
            {deadline && (
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.65rem',
                  color: isOverdue ? '#f44336' : isSoon ? '#ff9800' : '#888',
                  fontWeight: isOverdue || isSoon ? 700 : 400
                }}
              >
                {t('loans.nextAction.due')}: {deadline.toLocaleDateString()}
                {isOverdue && ` (${t('loans.nextAction.overdue')})`}
                {isSoon && ` (${t('loans.nextAction.soon')})`}
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}