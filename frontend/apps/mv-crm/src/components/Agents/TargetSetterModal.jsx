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
  LinearProgress,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { Close, Flag, TrendingUp, Save } from '@mui/icons-material'
import { useAgentTargets } from '../../constants/hooks/useAgentTargets'
import crmAgentsService from '../../services/crmAgentsService'

const MONTH_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
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

  // ✅ Estilos unificados
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
    '& .MuiOutlinedInput-root': { borderRadius: 0 },
    '& .MuiFormHelperText-root': { fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }
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
          borderRadius: 0,
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
          pb: 2,
          p: { xs: 2, sm: 3 }
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Flag sx={{ fontSize: 24, color: '#ff9800' }} />
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Courier New", monospace', fontSize: { xs: '0.85rem', sm: '1rem' }, letterSpacing: '1px', textTransform: 'uppercase' }}>
              {t('targets.title')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
              {t('targets.subtitle')}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={saving} sx={{ borderRadius: 0 }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Info del agente */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: '#fafafa',
            border: '1px solid #e0e0e0',
            borderRadius: 0,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: agent.role === 'superadmin' ? '#FF7043' : '#000',
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: 0
            }}
          >
            {agent.firstName?.charAt(0)}{agent.lastName?.charAt(0)}
          </Avatar>
          <Box flex={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Typography fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
              {agent.firstName} {agent.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>
              {agent.email}
            </Typography>
          </Box>
          <Chip
            label={agent.role === 'superadmin' ? t('metrics.role.superadmin') : t('metrics.role.admin')}
            size="small"
            sx={{
              bgcolor: agent.role === 'superadmin' ? 'rgba(255,112,67,0.1)' : 'rgba(85,85,85,0.1)',
              color: agent.role === 'superadmin' ? '#FF7043' : '#555',
              fontWeight: 600,
              borderRadius: 0,
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem'
            }}
          />
        </Paper>

        {/* Selector de mes/año */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{t('targets.month')}</InputLabel>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                label={t('targets.month')}
                sx={{ ...inputSx, minWidth: '100%' }}
              >
                {MONTH_VALUES.map(m => (
                  <MenuItem key={m} value={m} sx={{ fontFamily: '"Courier New", monospace' }}>
                    {t(`months.${m}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{t('targets.year')}</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                label={t('targets.year')}
                sx={{ ...inputSx, minWidth: '100%' }}
              >
                {YEARS.map(y => (
                  <MenuItem key={y} value={y} sx={{ fontFamily: '"Courier New", monospace' }}>
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
              border: '1px solid #4caf50',
              borderRadius: 0
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <TrendingUp sx={{ fontSize: 18, color: '#2e7d32' }} />
              <Typography variant="subtitle2" fontWeight={700} color="#2e7d32" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {t('targets.currentProgress')}
              </Typography>
            </Box>
            
            <Grid container spacing={1}>
              {Object.entries(targets.targets || {}).map(([key, target]) => {
                if (!target || target === 0) return null
                const progress = targets.progress?.[key] || 0
                const completion = targets.completion?.[key] || 0
                
                return (
                  <Grid item xs={12} sm={6} key={key}>
                    <Box>
                      <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 600, fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                        {t(`targets.metrics.${key}`, key)}:
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(completion, 100)}
                        sx={{
                          height: 4,
                          borderRadius: 0,
                          bgcolor: '#c8e6c9',
                          mb: 0.3,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#4caf50',
                            borderRadius: 0
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
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
        <Typography variant="subtitle2" fontWeight={700} mb={2} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
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
                sx={inputSx}
              />
            </Grid>
          ))}
        </Grid>

        {/* Errores y éxito */}
        {error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 0, border: '1px solid', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2, borderRadius: 0, border: '1px solid', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
            {t('targets.savedSuccess')}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{ ...unifiedButtonSx, color: '#888' }}
        >
          {t('targets.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || success}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
          sx={{
            ...unifiedButtonSx,
            bgcolor: '#ff9800',
            color: '#fff',
            '&:hover': { bgcolor: '#f57c00', boxShadow: '6px 6px 0px rgba(255,152,0,0.3)' }
          }}
        >
          {saving ? t('targets.saving') : t('targets.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TargetSetterModal