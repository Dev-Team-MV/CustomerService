// apps/mv-crm/src/components/commissions/CommissionStructureModal.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Alert, CircularProgress, Switch, FormControlLabel
} from '@mui/material'
import { Close, Add, Delete } from '@mui/icons-material'
import commissionService from '../../services/commissionService'

const CommissionStructureModal = ({ open, onClose, structure, projectId, onRefresh }) => {
  const { t } = useTranslation('commissions')
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
        projectId: structure.projectId || projectId,
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

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTierChange = (index, field, value) => {
    const newTiers = [...formData.tiers]
    newTiers[index][field] = Number(value)
    setFormData(prev => ({ ...prev, tiers: newTiers }))
  }

  const addTier = () => {
    setFormData(prev => ({
      ...prev,
      tiers: [...prev.tiers, { minAmount: 0, maxAmount: 0, rate: 0 }]
    }))
  }

  const removeTier = (index) => {
    const newTiers = formData.tiers.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, tiers: newTiers }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      if (isEdit) {
        await commissionService.updateStructure(structure._id, formData)
      } else {
        await commissionService.createStructure(formData)
      }
      onRefresh()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la estructura')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>
          {isEdit ? t('structures.edit') : t('structures.create')}
        </Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box display="flex" flexDirection="column" gap={2.5}>
          <TextField
            label={t('structures.name')}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
            required
            size="small"
          />

          <FormControl size="small" fullWidth>
            <InputLabel>{t('structures.type')}</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              label={t('structures.type')}
            >
              <MenuItem value="flat">{t('structures.types.flat')}</MenuItem>
              <MenuItem value="percentage">{t('structures.types.percentage')}</MenuItem>
              <MenuItem value="tiered">{t('structures.types.tiered')}</MenuItem>
            </Select>
          </FormControl>

          {formData.type === 'flat' && (
            <TextField
              label={t('structures.flatAmount')}
              type="number"
              value={formData.flatAmount}
              onChange={(e) => handleChange('flatAmount', Number(e.target.value))}
              fullWidth
              size="small"
            />
          )}

          {formData.type === 'percentage' && (
            <TextField
              label={t('structures.percentageRate')}
              type="number"
              value={formData.percentageRate}
              onChange={(e) => handleChange('percentageRate', Number(e.target.value))}
              fullWidth
              size="small"
              InputProps={{ endAdornment: <Typography variant="caption">%</Typography> }}
            />
          )}

          {formData.type === 'tiered' && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" fontWeight={600}>{t('structures.tiers')}</Typography>
                <Button size="small" startIcon={<Add />} onClick={addTier}>{t('structures.addTier')}</Button>
              </Box>
              {formData.tiers.map((tier, index) => (
                <Box key={index} display="flex" gap={1} alignItems="center" mb={1}>
                  <TextField
                    label={t('structures.minAmount')}
                    type="number"
                    size="small"
                    value={tier.minAmount}
                    onChange={(e) => handleTierChange(index, 'minAmount', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label={t('structures.maxAmount')}
                    type="number"
                    size="small"
                    value={tier.maxAmount}
                    onChange={(e) => handleTierChange(index, 'maxAmount', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label={t('structures.rate')}
                    type="number"
                    size="small"
                    value={tier.rate}
                    onChange={(e) => handleTierChange(index, 'rate', e.target.value)}
                    sx={{ width: 100 }}
                    InputProps={{ endAdornment: <Typography variant="caption">%</Typography> }}
                  />
                  <IconButton size="small" color="error" onClick={() => removeTier(index)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={formData.isDefault}
                onChange={(e) => handleChange('isDefault', e.target.checked)}
              />
            }
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
        >
          {isEdit ? t('actions.update') : t('actions.create')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CommissionStructureModal