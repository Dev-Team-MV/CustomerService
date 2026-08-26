import { useState, useEffect } from 'react'
import { Box, Typography, Paper, TextField, Button, CircularProgress, Autocomplete } from '@mui/material'
import { Flag, CalendarToday, Person, Save, Edit, Close } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useResidents } from '@shared/hooks/useResidents'

export default function LoanNextAction({ action, onUpdate, loanId }) {
  const { t } = useTranslation('loans')
  const { users } = useResidents(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    responsiblePerson: null,
    deadline: ''
  })

  // Sincroniza el estado con la data real cada vez que `action` cambia
  useEffect(() => {
    if (action) {
      setFormData({
        description: action.description || '',
        responsiblePerson: action.responsiblePerson || null,
        deadline: action.deadline ? action.deadline.split('T')[0] : ''
      })
    }
  }, [action])

  const getUserById = (id) => users?.find(u => u._id === id) || (typeof id === 'object' ? id : null)

  const handleSave = async () => {
    setLoading(true)
    try {
      await onUpdate({
        description: formData.description || null,
        responsiblePerson: formData.responsiblePerson?._id || formData.responsiblePerson || null,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      })
      setIsEditing(false)
    } catch (err) {
      console.error('Error saving next action:', err)
    } finally {
      setLoading(false)
    }
  }

  const inputSx = {
    fontFamily: '"Courier New", monospace',
    fontSize: '0.75rem',
    borderRadius: 0,
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem' }
  }

  const unifiedButtonSx = {
    borderRadius: 0,
    textTransform: 'none',
    fontFamily: '"Courier New", monospace',
    fontSize: '0.7rem',
    letterSpacing: '0.5px'
  }

  // Si no hay acción aún, mostramos estado vacío editable
  if (!action && !isEditing) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: '2px dashed #E5863C', borderRadius: 0, bgcolor: '#fff' }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Flag sx={{ color: '#E5863C', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#E5863C', textTransform: 'uppercase', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px' }}>
            {t('loans.nextAction.title', 'Next Action')}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', mb: 2 }}>
          {t('loans.nextAction.empty', 'No next action defined yet.')}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={() => setIsEditing(true)}
          sx={{ ...unifiedButtonSx, borderColor: '#E5863C', color: '#E5863C', '&:hover': { borderColor: '#d4752e', bgcolor: '#fff5eb' } }}
        >
          {t('loans.nextAction.define', 'Define Next Action')}
        </Button>
      </Paper>
    )
  }

  // ✅ MODO EDICIÓN
  if (isEditing) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: '2px solid #E5863C', borderRadius: 0, bgcolor: '#fff5eb' }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Flag sx={{ color: '#E5863C', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#E5863C', textTransform: 'uppercase', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px' }}>
            {t('loans.nextAction.editing', 'Editing Next Action')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('loans.nextAction.description', 'Task Description')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            size="small"
            sx={inputSx}
          />
          <Box display="flex" gap={2} flexWrap="wrap">
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Autocomplete
                options={users || []}
                getOptionLabel={(opt) => `${opt.firstName} ${opt.lastName}`}
                isOptionEqualToValue={(option, value) => option._id === value?._id || option._id === value}
                value={getUserById(formData.responsiblePerson)}
                onChange={(e, v) => setFormData({ ...formData, responsiblePerson: v ? v._id : null })}
                renderInput={(params) => <TextField {...params} label={t('loans.nextAction.responsible', 'Responsible Person')} size="small" sx={inputSx} />}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                label={t('loans.nextAction.deadline', 'Deadline')}
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={inputSx}
              />
            </Box>
          </Box>

          <Box display="flex" gap={2} justifyContent="flex-end" mt={1}>
            <Button
              onClick={() => {
                setIsEditing(false)
                // Restaurar valores originales
                setFormData({
                  description: action?.description || '',
                  responsiblePerson: action?.responsiblePerson || null,
                  deadline: action?.deadline ? action.deadline.split('T')[0] : ''
                })
              }}
              startIcon={<Close />}
              sx={{ ...unifiedButtonSx, color: '#706f6f', border: '1px solid #e0e0e0' }}
            >
              {t('common:actions.cancel', 'Cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={14} /> : <Save />}
              sx={{ ...unifiedButtonSx, bgcolor: '#E5863C', color: '#fff', '&:hover': { bgcolor: '#d4752e' } }}
            >
              {t('loans.nextAction.save', 'Save Action')}
            </Button>
          </Box>
        </Box>
      </Paper>
    )
  }

  // ✅ MODO VISUALIZACIÓN
  const responsibleUser = getUserById(action.responsiblePerson)
  const responsibleName = responsibleUser 
    ? `${responsibleUser.firstName} ${responsibleUser.lastName}` 
    : (action.responsiblePerson || t('loans.nextAction.unassigned', 'Unassigned'))

  const isOverdue = action.deadline && new Date(action.deadline) < new Date()

  return (
    <Paper elevation={0} sx={{ p: 3, border: `2px solid ${isOverdue ? '#f44336' : '#E5863C'}`, borderRadius: 0, bgcolor: isOverdue ? '#fff5f5' : '#fff5eb' }}>
      <Box display="flex" alignItems="center" gap={1} mb={2} justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
          <Flag sx={{ color: isOverdue ? '#f44336' : '#E5863C', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isOverdue ? '#f44336' : '#E5863C', textTransform: 'uppercase', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px' }}>
            {isOverdue ? t('loans.nextAction.overdue', 'Overdue Action') : t('loans.nextAction.title', 'Next Critical Action')}
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<Edit />}
          onClick={() => setIsEditing(true)}
          sx={{ ...unifiedButtonSx, color: isOverdue ? '#f44336' : '#E5863C', borderColor: isOverdue ? '#f44336' : '#E5863C', '&:hover': { bgcolor: isOverdue ? '#ffebee' : '#fff5eb' } }}
          variant="outlined"
        >
          {t('loans.nextAction.edit', 'Edit')}
        </Button>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 2, fontFamily: '"Helvetica Neue", sans-serif' }}>
        {action.description || t('loans.nextAction.noDescription', 'No description')}
      </Typography>

      <Box display="flex" gap={4} mb={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={1}>
          <CalendarToday sx={{ fontSize: 16, color: isOverdue ? '#f44336' : '#706f6f' }} />
          <Typography variant="body2" sx={{ color: isOverdue ? '#f44336' : '#706f6f', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', fontWeight: isOverdue ? 700 : 400 }}>
            {t('loans.nextAction.due', 'Due')}: {action.deadline ? new Date(action.deadline).toLocaleDateString() : t('loans.nextAction.noDeadline', 'No deadline')}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Person sx={{ fontSize: 16, color: '#706f6f' }} />
          <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
            {t('loans.nextAction.assigned', 'Assigned')}: {responsibleName}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}