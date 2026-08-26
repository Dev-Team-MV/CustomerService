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
  IconButton,
  useTheme
} from '@mui/material'
import { Close, Save, ViewColumn } from '@mui/icons-material'

const PRESET_COLORS = [
  '#9e9e9e', '#2196f3', '#ff9800', '#4caf50', '#f44336',
  '#9c27b0', '#00bcd4', '#795548', '#607d8b', '#e91e63'
]

const ColumnModal = ({ open, onClose, column = null, onSave }) => {
  const { t } = useTranslation('activities')
  const theme = useTheme()
  
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

  // ✅ Estilos unificados (idénticos a ActivityModal)
  const unifiedButtonSx = { 
    borderRadius: 0, 
    textTransform: 'none', 
    fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', 
    letterSpacing: '0.5px', 
    width: { xs: '100%', sm: 'auto' },
    '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } 
  }
  
  const inputSx = { 
    fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', 
    borderRadius: 0, 
    width: '100%',
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' },
    '& .MuiOutlinedInput-root': { borderRadius: 0 }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{ 
        sx: { 
          borderRadius: 0, 
          border: '1px solid #ececec' 
        } 
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #ececec', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: { xs: 2, sm: 3 }
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <ViewColumn sx={{ color: formData.color, fontSize: 20 }} />
          <Typography variant="h6" fontWeight={700} sx={{ 
            fontFamily: '"Courier New", monospace', 
            fontSize: { xs: '0.8rem', sm: '0.85rem' }, 
            letterSpacing: '1px', 
            textTransform: 'uppercase' 
          }}>
            {isEditing ? t('activities.editColumn') : t('activities.newColumn')}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ borderRadius: 0 }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" flexDirection="column" gap={2.5} py={1}>
          <TextField
            label={t('activities.form.name')}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
            required
            placeholder={t('activities.columnNamePlaceholder')}
            autoFocus
            sx={inputSx}
          />

          <TextField
            label={t('activities.form.key')}
            value={formData.key}
            onChange={(e) => handleChange('key', e.target.value)}
            fullWidth
            placeholder="ej: in_progress"
            helperText={t('activities.keyHelperText')}
            disabled={isEditing}
            sx={inputSx}
          />

          <TextField
            label={t('activities.form.order')}
            type="number"
            value={formData.order}
            onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
            fullWidth
            inputProps={{ min: 0 }}
            helperText={t('activities.orderHelperText')}
            sx={inputSx}
          />

          {/* Selector de Color */}
          <Box>
            <Typography variant="subtitle2" mb={1} sx={{ 
              fontFamily: '"Courier New", monospace', 
              fontSize: '0.7rem', 
              letterSpacing: '1px', 
              textTransform: 'uppercase' 
            }}>
              {t('activities.form.color')}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {PRESET_COLORS.map(color => (
                <Box
                  key={color}
                  onClick={() => handleChange('color', color)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 0, // ✅ Cuadrado para mantener coherencia brutalista
                    bgcolor: color,
                    cursor: 'pointer',
                    border: formData.color === color ? '3px solid #000' : '1px solid #e0e0e0',
                    transition: 'all 0.15s',
                    '&:hover': { transform: 'scale(1.1)', borderColor: '#000' }
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Vista Previa */}
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: 0, // ✅ Bordes afilados
              bgcolor: '#f5f5f5',
              border: '1px solid #e0e0e0',
              borderLeft: `4px solid ${formData.color}`
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ 
              fontFamily: '"Courier New", monospace', 
              fontSize: '0.7rem' 
            }}>
              {t('activities.form.preview')}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Box sx={{ width: 10, height: 10, borderRadius: 0, bgcolor: formData.color }} />
              <Typography fontWeight={600} sx={{ 
                fontFamily: '"Helvetica Neue", sans-serif', 
                fontSize: '0.85rem' 
              }}>
                {formData.name || t('activities.columnNameDefault')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 2, 
        borderTop: '1px solid #ececec', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 1 
      }}>
        <Button 
          onClick={onClose} 
          disabled={saving}
          sx={{ ...unifiedButtonSx, color: '#888' }}
        >
          {t('activities.form.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!formData.name.trim() || saving}
          startIcon={<Save />}
          sx={{ 
            ...unifiedButtonSx, 
            bgcolor: '#000', 
            color: '#fff', 
            '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } 
          }}
        >
          {saving ? t('activities.saving') : isEditing ? t('activities.form.update') : t('activities.form.create')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ColumnModal