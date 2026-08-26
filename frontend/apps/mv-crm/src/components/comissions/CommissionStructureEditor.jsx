import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Alert, CircularProgress, Switch, FormControlLabel, Divider,
  useMediaQuery, useTheme
} from '@mui/material'
import { Close, Add, Delete, CardGiftcard } from '@mui/icons-material'
import commissionService from '../../services/commissionService'

const CommissionStructureEditor = ({ open, onClose, structure, projectId, onRefresh, isTourMode = false }) => {
  const { t } = useTranslation('commissions')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isEdit = Boolean(structure?._id)
  
  const [formData, setFormData] = useState({
    projectId: projectId || '',
    name: '',
    type: 'percentage',
    flatAmount: 0,
    percentageRate: 0,
    tiers: [{ minAmount: 0, maxAmount: 0, rate: 0 }],
    bonusRules: [],
    isDefault: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (structure) {
      setFormData({
        projectId: structure.projectId || projectId || '',
        name: structure.name || '',
        type: structure.type || 'percentage',
        flatAmount: structure.flatAmount || 0,
        percentageRate: structure.percentageRate || 0,
        tiers: structure.tiers?.length ? structure.tiers : [{ minAmount: 0, maxAmount: 0, rate: 0 }],
        bonusRules: structure.bonusRules || [],
        isDefault: structure.isDefault || false
      })
    } else {
      setFormData({
        projectId: projectId || '',
        name: '',
        type: 'percentage',
        flatAmount: 0,
        percentageRate: 0,
        tiers: [{ minAmount: 0, maxAmount: 0, rate: 0 }],
        bonusRules: [],
        isDefault: false
      })
    }
    setError(null)
  }, [structure, projectId, open])

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const handleTierChange = (index, field, value) => {
    const newTiers = [...formData.tiers]
    if (field === 'maxAmount' && value === '') {
      newTiers[index][field] = ''
    } else {
      newTiers[index][field] = Number(value)
    }
    setFormData(prev => ({ ...prev, tiers: newTiers }))
  }

  const addTier = () => setFormData(prev => ({ 
    ...prev, 
    tiers: [...prev.tiers, { minAmount: 0, maxAmount: '', rate: 0 }]
  }))
  
  const removeTier = (index) => setFormData(prev => ({ 
    ...prev, 
    tiers: prev.tiers.filter((_, i) => i !== index) 
  }))

  const handleBonusRuleChange = (index, field, value) => {
    const newRules = [...formData.bonusRules]
    newRules[index][field] = typeof value === 'string' && isNaN(value) ? value : Number(value)
    setFormData(prev => ({ ...prev, bonusRules: newRules }))
  }
  
  const addBonusRule = () => setFormData(prev => ({ 
    ...prev, 
    bonusRules: [...prev.bonusRules, { name: '', bonusType: 'flat', value: 0, minSaleAmount: 0, maxSaleAmount: 0 }] 
  }))
  
  const removeBonusRule = (index) => setFormData(prev => ({ 
    ...prev, 
    bonusRules: prev.bonusRules.filter((_, i) => i !== index) 
  }))

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = { ...formData }
      
      if (payload.type !== 'flat') payload.flatAmount = 0
      if (payload.type !== 'percentage') payload.percentageRate = 0
      
      if (payload.type === 'tiered') {
        payload.tiers = payload.tiers.map(tier => ({
          minAmount: Number(tier.minAmount) || 0,
          maxAmount: (!tier.maxAmount || tier.maxAmount === 0 || tier.maxAmount === '') ? null : Number(tier.maxAmount),
          rate: Number(tier.rate) || 0
        }))
      } else {
        payload.tiers = []
      }
      
      if (!Array.isArray(payload.bonusRules)) payload.bonusRules = []

      if (isEdit) {
        await commissionService.updateStructure(structure._id, payload)
      } else {
        await commissionService.createStructure(payload)
      }
      
      onRefresh()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || t('errors.saveFailed'))
    } finally {
      setLoading(false)
    }
  }

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
    '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' },
    '& .MuiOutlinedInput-root': { borderRadius: 0 },
    '& .MuiFormHelperText-root': { fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ececec', p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Courier New", monospace', letterSpacing: '1px', textTransform: 'uppercase', fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
          {isEdit ? t('structures.edit') : t('structures.create')}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ borderRadius: 0 }}><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0, border: '1px solid', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>{error}</Alert>}
        
        <Box display="flex" flexDirection="column" gap={3}>
          
          {/* ✅ ID 1: Nombre y Tipo */}
          <Box id="structure-editor-name-type" display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
            <TextField 
              label={t('structures.name')} 
              value={formData.name} 
              onChange={(e) => handleChange('name', e.target.value)} 
              fullWidth required size="small" 
              sx={inputSx}
            />
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
              <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{t('structures.type')}</InputLabel>
              <Select 
                value={formData.type} 
                onChange={(e) => handleChange('type', e.target.value)} 
                label={t('structures.type')}
                sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0 }}
              >
                <MenuItem value="flat" sx={{ fontFamily: '"Courier New", monospace' }}>{t('structures.types.flat')}</MenuItem>
                <MenuItem value="percentage" sx={{ fontFamily: '"Courier New", monospace' }}>{t('structures.types.percentage')}</MenuItem>
                <MenuItem value="tiered" sx={{ fontFamily: '"Courier New", monospace' }}>{t('structures.types.tiered')}</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* ✅ ID 2: Configuración de Tasas (Envuelve las 3 opciones condicionales) */}
          <Box id="structure-editor-rates" display="flex" flexDirection="column" gap={2}>
            {formData.type === 'flat' && (
              <TextField 
                label={t('structures.flatAmount')} 
                type="number" 
                value={formData.flatAmount} 
                onChange={(e) => handleChange('flatAmount', Number(e.target.value))} 
                fullWidth size="small" 
                InputProps={{ startAdornment: <Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontFamily: '"Courier New", monospace' }}>$</Typography> }}
                sx={inputSx}
              />
            )}

            {formData.type === 'percentage' && (
              <TextField 
                label={t('structures.percentageRate')} 
                type="number" 
                value={formData.percentageRate} 
                onChange={(e) => handleChange('percentageRate', Number(e.target.value))} 
                fullWidth size="small" 
                InputProps={{ endAdornment: <Typography variant="caption" sx={{ fontFamily: '"Courier New", monospace' }}>%</Typography> }}
                sx={inputSx}
              />
            )}

            {formData.type === 'tiered' && (
              <Box sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: '#f9f9f9', borderRadius: 0, border: '1px solid #e0e0e0' }}>
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={1.5} gap={1}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ fontFamily: '"Courier New", monospace' }}>{t('structures.tiers')}</Typography>
                  <Button size="small" startIcon={<Add />} onClick={addTier} sx={{ ...unifiedButtonSx, border: '1px solid #000', color: '#000', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#555', color: '#555', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' } }}>
                    {t('structures.addTier')}
                  </Button>
                </Box>
                {formData.tiers.map((tier, index) => (
                  <Box key={index} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ xs: 'stretch', sm: 'center' }} mb={1}>
                    <TextField label={t('structures.minAmount')} type="number" size="small" value={tier.minAmount} onChange={(e) => handleTierChange(index, 'minAmount', e.target.value)} sx={{ flex: 1, ...inputSx }} />
                    <TextField label={t('structures.maxAmount')} type="number" size="small" value={tier.maxAmount} onChange={(e) => handleTierChange(index, 'maxAmount', e.target.value)} sx={{ flex: 1, ...inputSx }} />
                    <TextField label={t('structures.rate')} type="number" size="small" value={tier.rate} onChange={(e) => handleTierChange(index, 'rate', e.target.value)} sx={{ width: { xs: '100%', sm: 100 }, ...inputSx }} InputProps={{ endAdornment: <Typography variant="caption" sx={{ fontFamily: '"Courier New", monospace' }}>%</Typography> }} />
                    <IconButton size="small" color="error" onClick={() => removeTier(index)} sx={{ borderRadius: 0, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Divider />

          {/* ✅ ID 3: Reglas de Bonificación */}
          <Box id="structure-editor-bonus">
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={1.5} gap={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <CardGiftcard sx={{ fontSize: 20, color: '#ff9800' }} />
                <Typography variant="subtitle2" fontWeight={600} sx={{ fontFamily: '"Courier New", monospace' }}>{t('structures.bonusRules')}</Typography>
              </Box>
              <Button size="small" startIcon={<Add />} onClick={addBonusRule} sx={{ ...unifiedButtonSx, border: '1px solid #000', color: '#000', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#555', color: '#555', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' } }}>
                {t('structures.addBonusRule')}
              </Button>
            </Box>

            {formData.bonusRules.length === 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', fontFamily: '"Courier New", monospace' }}>
                {t('structures.noBonusRules')}
              </Typography>
            )}

            {formData.bonusRules.map((rule, index) => (
              <Box key={index} sx={{ p: 1.5, bgcolor: '#fff8e1', borderRadius: 0, border: '1px solid #ffe0b2', mb: 1 }}>
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1} mb={1}>
                  <TextField 
                    label={t('structures.bonusName')} 
                    size="small" 
                    value={rule.name} 
                    onChange={(e) => handleBonusRuleChange(index, 'name', e.target.value)} 
                    sx={{ flex: { xs: '1 1 100%', sm: 2 }, ...inputSx }} 
                    placeholder="Ej: Bono por venta rápida"
                  />
                  <FormControl size="small" sx={{ flex: { xs: '1 1 100%', sm: 1 } }}>
                    <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{t('structures.bonusType')}</InputLabel>
                    <Select 
                      value={rule.bonusType} 
                      onChange={(e) => handleBonusRuleChange(index, 'bonusType', e.target.value)} 
                      label={t('structures.bonusType')}
                      sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0 }}
                    >
                      <MenuItem value="flat" sx={{ fontFamily: '"Courier New", monospace' }}>Monto Fijo ($)</MenuItem>
                      <MenuItem value="percentage" sx={{ fontFamily: '"Courier New", monospace' }}>Porcentaje (%)</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField 
                    label={t('structures.bonusValue')} 
                    type="number" 
                    size="small" 
                    value={rule.value} 
                    onChange={(e) => handleBonusRuleChange(index, 'value', e.target.value)} 
                    sx={{ width: { xs: '100%', sm: 120 }, ...inputSx }} 
                  />
                  <IconButton size="small" color="error" onClick={() => removeBonusRule(index)} sx={{ borderRadius: 0, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1}>
                  <TextField 
                    label={t('structures.minSaleAmount')} 
                    type="number" 
                    size="small" 
                    value={rule.minSaleAmount} 
                    onChange={(e) => handleBonusRuleChange(index, 'minSaleAmount', e.target.value)} 
                    sx={{ flex: 1, ...inputSx }} 
                    helperText="Venta mínima para aplicar"
                  />
                  <TextField 
                    label={t('structures.maxSaleAmount')} 
                    type="number" 
                    size="small" 
                    value={rule.maxSaleAmount} 
                    onChange={(e) => handleBonusRuleChange(index, 'maxSaleAmount', e.target.value)} 
                    sx={{ flex: 1, ...inputSx }} 
                    helperText="0 = sin límite"
                  />
                </Box>
              </Box>
            ))}
          </Box>

          <FormControlLabel 
            control={<Switch checked={formData.isDefault} onChange={(e) => handleChange('isDefault', e.target.checked)} />} 
            label={<Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>{t('structures.isDefault')}</Typography>} 
          />
        </Box>
      </DialogContent>

      {/* ✅ ID 4: Acciones del Modal */}
      <DialogActions id="structure-editor-actions" sx={{ p: 2, gap: 1, borderTop: '1px solid #ececec', flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button onClick={onClose} disabled={loading} sx={{ ...unifiedButtonSx, color: '#888' }}>
          {t('actions.cancel')}
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit} 
          disabled={loading || !formData.name} 
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}
        >
          {isEdit ? t('actions.update') : t('actions.create')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CommissionStructureEditor