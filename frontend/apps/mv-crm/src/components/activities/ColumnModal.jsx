import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton
} from '@mui/material'
import { Close, Save, ViewColumn } from '@mui/icons-material'

const PRESET_COLORS = [
  '#9e9e9e', '#2196f3', '#ff9800', '#4caf50', '#f44336',
  '#9c27b0', '#00bcd4', '#795548', '#607d8b', '#e91e63'
]

const ColumnModal = ({ open, onClose, column = null, onSave }) => {
  const { t } = useTranslation('activities')
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    color: '#2196f3',
    order: 0
  })
  const [saving, setSaving] = useState(false)

  const isEditing = Boolean(column?._id)

  useEffect(() => {
    if (column) {
      setFormData({
        name: column.name || '',
        key: column.key || '',
        color: column.color || '#2196f3',
        order: column.order || 0
      })
    } else {
      setFormData({
        name: '',
        key: '',
        color: '#2196f3',
        order: 0
      })
    }
  }, [column, open])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === 'name' && !isEditing) {
      const key = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
      setFormData(prev => ({ ...prev, key }))
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) return
    
    setSaving(true)
    try {
      await onSave?.(formData, column?._id)
      onClose()
    } catch (err) {
      console.error('Error saving column:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <ViewColumn sx={{ color: formData.color }} />
            <Typography variant="h6" fontWeight={700}>
              {isEditing ? t('activities.editColumn') : t('activities.newColumn')}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2.5} py={1}>
          <TextField
            label={t('activities.form.name')}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
            required
            placeholder={t('activities.columnNamePlaceholder')}
            autoFocus
          />

          <TextField
            label={t('activities.form.key')}
            value={formData.key}
            onChange={(e) => handleChange('key', e.target.value)}
            fullWidth
            placeholder="ej: in_progress"
            helperText={t('activities.keyHelperText')}
            disabled={isEditing}
          />

          <TextField
            label={t('activities.form.order')}
            type="number"
            value={formData.order}
            onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
            fullWidth
            inputProps={{ min: 0 }}
            helperText={t('activities.orderHelperText')}
          />

          {/* Color */}
          <Box>
            <Typography variant="subtitle2" mb={1}>{t('activities.form.color')}</Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {PRESET_COLORS.map(color => (
                <Box
                  key={color}
                  onClick={() => handleChange('color', color)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: color,
                    cursor: 'pointer',
                    border: formData.color === color ? '3px solid #333' : '2px solid transparent',
                    transition: 'transform 0.15s',
                    '&:hover': { transform: 'scale(1.15)' }
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Preview */}
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: '#f5f5f5',
              borderLeft: `4px solid ${formData.color}`
            }}
          >
            <Typography variant="caption" color="text.secondary">{t('activities.form.preview')}</Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: formData.color }} />
              <Typography fontWeight={600}>
                {formData.name || t('activities.columnNameDefault')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          {t('activities.form.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!formData.name.trim() || saving}
          startIcon={<Save />}
        >
          {saving ? t('activities.saving') : isEditing ? t('activities.form.update') : t('activities.form.create')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ColumnModal