// apps/mv-crm/src/components/commissions/CommissionStructureEditor.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Alert, CircularProgress, Switch, FormControlLabel, Divider
} from '@mui/material'
import { Close, Add, Delete, CardGiftcard } from '@mui/icons-material'
import commissionService from '../../services/commissionService'

const CommissionStructureEditor = ({ open, onClose, structure, projectId, onRefresh }) => {
  const { t } = useTranslation('commissions')
  const isEdit = Boolean(structure?._id)
  
  const [formData, setFormData] = useState({
    projectId: projectId || '',
    name: '',
    type: 'percentage',
    flatAmount: 0,
    percentageRate: 0,
    tiers: [{ minAmount: 0, maxAmount: 0, rate: 0 }],
    bonusRules: [], // ✅ AGREGADO: Soporte para reglas de bonificación
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
        bonusRules: structure.bonusRules || [], // ✅ Cargar reglas existentes
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

  // ─── Manejo de Tiers ───
  const handleTierChange = (index, field, value) => {
    const newTiers = [...formData.tiers]
    newTiers[index][field] = Number(value)
    setFormData(prev => ({ ...prev, tiers: newTiers }))
  }
  const addTier = () => setFormData(prev => ({ ...prev, tiers: [...prev.tiers, { minAmount: 0, maxAmount: 0, rate: 0 }] }))
  const removeTier = (index) => setFormData(prev => ({ ...prev, tiers: prev.tiers.filter((_, i) => i !== index) }))

  // ─── Manejo de Bonus Rules ───
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
      
      // Limpiar campos que no aplican según el tipo
      if (payload.type !== 'flat') payload.flatAmount = 0
      if (payload.type !== 'percentage') payload.percentageRate = 0
      if (payload.type !== 'tiered') payload.tiers = []
      
      // Asegurar que bonusRules sea un array válido (incluso vacío)
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>{isEdit ? t('structures.edit') : t('structures.create')}</Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Campos Básicos */}
          <Box display="flex" gap={2}>
            <TextField 
              label={t('structures.name')} 
              value={formData.name} 
              onChange={(e) => handleChange('name', e.target.value)} 
              fullWidth required size="small" 
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t('structures.type')}</InputLabel>
              <Select value={formData.type} onChange={(e) => handleChange('type', e.target.value)} label={t('structures.type')}>
                <MenuItem value="flat">{t('structures.types.flat')}</MenuItem>
                <MenuItem value="percentage">{t('structures.types.percentage')}</MenuItem>
                <MenuItem value="tiered">{t('structures.types.tiered')}</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Campos específicos por tipo */}
          {formData.type === 'flat' && (
            <TextField 
              label={t('structures.flatAmount')} 
              type="number" 
              value={formData.flatAmount} 
              onChange={(e) => handleChange('flatAmount', Number(e.target.value))} 
              fullWidth size="small" 
              InputProps={{ startAdornment: <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>$</Typography> }}
            />
          )}

          {formData.type === 'percentage' && (
            <TextField 
              label={t('structures.percentageRate')} 
              type="number" 
              value={formData.percentageRate} 
              onChange={(e) => handleChange('percentageRate', Number(e.target.value))} 
              fullWidth size="small" 
              InputProps={{ endAdornment: <Typography variant="caption">%</Typography> }}
            />
          )}

          {/* Sección de Tiers */}
          {formData.type === 'tiered' && (
            <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px solid #e0e0e0' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle2" fontWeight={600}>{t('structures.tiers')}</Typography>
                <Button size="small" startIcon={<Add />} onClick={addTier}>{t('structures.addTier')}</Button>
              </Box>
              {formData.tiers.map((tier, index) => (
                <Box key={index} display="flex" gap={1} alignItems="center" mb={1}>
                  <TextField label={t('structures.minAmount')} type="number" size="small" value={tier.minAmount} onChange={(e) => handleTierChange(index, 'minAmount', e.target.value)} sx={{ flex: 1 }} />
                  <TextField label={t('structures.maxAmount')} type="number" size="small" value={tier.maxAmount} onChange={(e) => handleTierChange(index, 'maxAmount', e.target.value)} sx={{ flex: 1 }} />
                  <TextField label={t('structures.rate')} type="number" size="small" value={tier.rate} onChange={(e) => handleTierChange(index, 'rate', e.target.value)} sx={{ width: 100 }} InputProps={{ endAdornment: <Typography variant="caption">%</Typography> }} />
                  <IconButton size="small" color="error" onClick={() => removeTier(index)}><Delete fontSize="small" /></IconButton>
                </Box>
              ))}
            </Box>
          )}

          <Divider />

          {/* ✅ Sección de Bonus Rules */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <CardGiftcard sx={{ fontSize: 20, color: '#ff9800' }} />
                <Typography variant="subtitle2" fontWeight={600}>{t('structures.bonusRules')}</Typography>
              </Box>
              <Button size="small" startIcon={<Add />} onClick={addBonusRule}>{t('structures.addBonusRule')}</Button>
            </Box>

            {formData.bonusRules.length === 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {t('structures.noBonusRules')}
              </Typography>
            )}

            {formData.bonusRules.map((rule, index) => (
              <Box key={index} sx={{ p: 1.5, bgcolor: '#fff8e1', borderRadius: 1, border: '1px solid #ffe0b2', mb: 1 }}>
                <Box display="flex" gap={1} mb={1}>
                  <TextField 
                    label={t('structures.bonusName')} 
                    size="small" 
                    value={rule.name} 
                    onChange={(e) => handleBonusRuleChange(index, 'name', e.target.value)} 
                    sx={{ flex: 2 }} 
                    placeholder="Ej: Bono por venta rápida"
                  />
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel>{t('structures.bonusType')}</InputLabel>
                    <Select 
                      value={rule.bonusType} 
                      onChange={(e) => handleBonusRuleChange(index, 'bonusType', e.target.value)} 
                      label={t('structures.bonusType')}
                    >
                      <MenuItem value="flat">Monto Fijo ($)</MenuItem>
                      <MenuItem value="percentage">Porcentaje (%)</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField 
                    label={t('structures.bonusValue')} 
                    type="number" 
                    size="small" 
                    value={rule.value} 
                    onChange={(e) => handleBonusRuleChange(index, 'value', e.target.value)} 
                    sx={{ width: 120 }} 
                  />
                  <IconButton size="small" color="error" onClick={() => removeBonusRule(index)}><Delete fontSize="small" /></IconButton>
                </Box>
                <Box display="flex" gap={1}>
                  <TextField 
                    label={t('structures.minSaleAmount')} 
                    type="number" 
                    size="small" 
                    value={rule.minSaleAmount} 
                    onChange={(e) => handleBonusRuleChange(index, 'minSaleAmount', e.target.value)} 
                    sx={{ flex: 1 }} 
                    helperText="Venta mínima para aplicar"
                  />
                  <TextField 
                    label={t('structures.maxSaleAmount')} 
                    type="number" 
                    size="small" 
                    value={rule.maxSaleAmount} 
                    onChange={(e) => handleBonusRuleChange(index, 'maxSaleAmount', e.target.value)} 
                    sx={{ flex: 1 }} 
                    helperText="0 = sin límite"
                  />
                </Box>
              </Box>
            ))}
          </Box>

          <FormControlLabel 
            control={<Switch checked={formData.isDefault} onChange={(e) => handleChange('isDefault', e.target.checked)} />} 
            label={t('structures.isDefault')} 
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>{t('actions.cancel')}</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit} 
          disabled={loading || !formData.name} 
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
        >
          {isEdit ? t('actions.update') : t('actions.create')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CommissionStructureEditor