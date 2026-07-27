// apps/mv-crm/src/components/Agents/TargetSetterModal.jsx
import { useState, useEffect, useMemo } from 'react'
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
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  LinearProgress
} from '@mui/material'
import { Close, Flag, TrendingUp, Save } from '@mui/icons-material'
import { useAgentTargets } from '../../constants/hooks/useAgentTargets'
import crmAgentsService from '../../services/crmAgentsService'

// ✅ Meses como array de valores (las labels se traducen)
const MONTH_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

// Generar años (últimos 2 años + próximos 2)
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

// Campos del formulario con sus claves de traducción
const TARGET_FIELDS = [
  { key: 'leads', labelKey: 'targets.leads', helperKey: 'targets.leadsHelper' },
  { key: 'conversions', labelKey: 'targets.conversions', helperKey: 'targets.conversionsHelper' },
  { key: 'appointments', labelKey: 'targets.appointments', helperKey: 'targets.appointmentsHelper' },
  { key: 'smsCount', labelKey: 'targets.smsCount', helperKey: 'targets.smsCountHelper' }
]

const TargetSetterModal = ({ 
  open, 
  onClose, 
  agent,
  onSuccess 
}) => {
  const { t } = useTranslation('agents')
  
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  
  const [formData, setFormData] = useState({
    leads: '',
    conversions: '',
    appointments: '',
    smsCount: ''
  })
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const { targets, loading: loadingTargets } = useAgentTargets(
    agent?._id,
    { month: selectedMonth, year: selectedYear }
  )

  useEffect(() => {
    if (open && agent) {
      setError(null)
      setSuccess(false)
      setFormData({
        leads: '',
        conversions: '',
        appointments: '',
        smsCount: ''
      })
    }
  }, [open, agent])

  useEffect(() => {
    if (targets?.targets) {
      setFormData({
        leads: targets.targets.leads?.toString() || '',
        conversions: targets.targets.conversions?.toString() || '',
        appointments: targets.targets.appointments?.toString() || '',
        smsCount: targets.targets.smsCount?.toString() || ''
      })
    }
  }, [targets])

  const handleFieldChange = (field, value) => {
    const numValue = value === '' ? '' : Math.max(0, parseInt(value) || 0)
    setFormData(prev => ({ ...prev, [field]: numValue.toString() }))
  }

  const handleSave = async () => {
    if (!agent?._id) return

    const hasValue = Object.values(formData).some(v => v !== '' && parseInt(v) > 0)
    if (!hasValue) {
      setError(t('targets.validation.atLeastOne'))
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const payload = {
        month: selectedMonth,
        year: selectedYear
      }
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && parseInt(value) > 0) {
          payload[key] = parseInt(value)
        }
      })

      await crmAgentsService.setTargets(agent._id, payload)
      
      setSuccess(true)
      
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message || t('targets.validation.saveError'))
    } finally {
      setSaving(false)
    }
  }

  if (!agent) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          border: '1px solid #e0e0e0'
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Flag sx={{ fontSize: 24, color: '#ff9800' }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {t('targets.title')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('targets.subtitle')}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={saving}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Info del agente */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: '#fafafa',
            border: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: agent.role === 'superadmin' ? '#FF7043' : '#000',
              fontSize: '0.9rem',
              fontWeight: 700
            }}
          >
            {agent.firstName?.charAt(0)}{agent.lastName?.charAt(0)}
          </Avatar>
          <Box flex={1}>
            <Typography fontWeight={600}>
              {agent.firstName} {agent.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {agent.email}
            </Typography>
          </Box>
          <Chip
            label={agent.role === 'superadmin' ? t('metrics.role.superadmin') : t('metrics.role.admin')}
            size="small"
            sx={{
              bgcolor: agent.role === 'superadmin' ? 'rgba(255,112,67,0.1)' : 'rgba(85,85,85,0.1)',
              color: agent.role === 'superadmin' ? '#FF7043' : '#555',
              fontWeight: 600
            }}
          />
        </Paper>

        {/* Selector de mes/año */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('targets.month')}</InputLabel>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                label={t('targets.month')}
              >
                {MONTH_VALUES.map(m => (
                  <MenuItem key={m} value={m}>
                    {t(`months.${m}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('targets.year')}</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                label={t('targets.year')}
              >
                {YEARS.map(y => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Loading de targets existentes */}
        {loadingTargets && (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Progreso actual */}
        {targets && !loadingTargets && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: '#e8f5e9',
              border: '1px solid #4caf50'
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <TrendingUp sx={{ fontSize: 18, color: '#2e7d32' }} />
              <Typography variant="subtitle2" fontWeight={700} color="#2e7d32">
                {t('targets.currentProgress')}
              </Typography>
            </Box>
            
            <Grid container spacing={1}>
              {Object.entries(targets.targets || {}).map(([key, target]) => {
                if (!target || target === 0) return null
                const progress = targets.progress?.[key] || 0
                const completion = targets.completion?.[key] || 0
                
                return (
                  <Grid item xs={6} key={key}>
                    <Box>
                      <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                        {t(`targets.metrics.${key}`, key)}:
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(completion, 100)}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: '#c8e6c9',
                          mb: 0.3,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#4caf50'
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {progress} / {target} ({completion.toFixed(0)}%)
                      </Typography>
                    </Box>
                  </Grid>
                )
              })}
            </Grid>
          </Paper>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Formulario de metas */}
        <Typography variant="subtitle2" fontWeight={700} mb={2}>
          {t('targets.setTargets')}
        </Typography>

        <Grid container spacing={2}>
          {TARGET_FIELDS.map(field => (
            <Grid item xs={12} sm={6} key={field.key}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={t(field.labelKey)}
                value={formData[field.key]}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                inputProps={{ min: 0 }}
                helperText={t(field.helperKey)}
              />
            </Grid>
          ))}
        </Grid>

        {/* Errores y éxito */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {t('targets.savedSuccess')}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{ textTransform: 'none' }}
        >
          {t('targets.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || success}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
          sx={{
            bgcolor: '#ff9800',
            textTransform: 'none',
            '&:hover': { bgcolor: '#f57c00' }
          }}
        >
          {saving ? t('targets.saving') : t('targets.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TargetSetterModal