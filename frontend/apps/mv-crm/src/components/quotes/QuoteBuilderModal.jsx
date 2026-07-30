// apps/mv-crm/src/components/quotes/QuoteBuilderModal.jsx
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography,
  TextField, Button, IconButton, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, Stepper, Step, StepLabel, Grid, Divider, Switch, FormControlLabel, Chip,
  useMediaQuery, useTheme
} from '@mui/material'
import { Close, AutoAwesome, Home, Apartment, Business } from '@mui/icons-material'
import quoteService from '../../services/quoteService'
import propertyService from '@shared/services/propertyService'
import buildingService from '@shared/services/buildingService'
import api from '@shared/services/api'
import AmortizationTable from './AmortizationTable'
import { useCatalogConfig } from '@shared/hooks/useCatalogConfig'
import { calculateEstimatedPrice } from '@shared/utils/pricingEngine'

// ✅ Componente compartido
import ProjectSelector from '@shared/components/ProjectSelector'

const STEPS = ['Propiedad', 'Financiamiento', 'Vista Previa']

export default function QuoteBuilderModal({ open, onClose, quote = null, onSave, projects = [], leads = [], clients = [] }) {
  const { t } = useTranslation('quoteCrm')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isEditing = Boolean(quote?._id)
  
  const getId = (val) => (typeof val === 'object' && val !== null ? val._id : val) || ''

  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [previewData, setPreviewData] = useState(null)

  const [lots, setLots] = useState([])
  const [buildings, setBuildings] = useState([])
  const [models, setModels] = useState([])
  const [apartments, setApartments] = useState([])
  const [facades, setFacades] = useState([])
  const [loadingProperties, setLoadingProperties] = useState(false)
  const [modelPricingOptions, setModelPricingOptions] = useState(null)

  const [formData, setFormData] = useState({
    leadId: '', clientId: '', projectId: '',
    lotId: '', modelId: '', facadeId: '', deckId: '', buildingId: '', apartmentId: '',
    selectedRenderType: 'basic', selectedOptions: {},
    hasModelUpgrade: false, hasModelBalcony: false, hasModelStorage: false,
    modelUpgradeId: null, modelBalconyId: null, modelStorageId: null,
    totalPrice: 0, downPayment: 0, interestRate: 5, termMonths: 120,
    amortizationMethod: 'fixed', balloonAmount: 0, balloonMonth: 0,
    startDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '', status: 'draft'
  })

  const cleanProjectId = getId(formData.projectId)
  const selectedProjectObj = projects.find(p => p._id === cleanProjectId)
  const { catalogConfig } = useCatalogConfig(cleanProjectId, { activeOnly: true })

  const projectType = useMemo(() => {
    if (!cleanProjectId) return null
    if (selectedProjectObj?.slug === '6town-houses') return '6town'
    if (selectedProjectObj?.slug === 'lakewood') return 'lakewood'
    if (selectedProjectObj?.type === 'apartments' || selectedProjectObj?.slug?.includes('tower') || selectedProjectObj?.slug?.includes('isq') || selectedProjectObj?.slug?.includes('shepherd')) {
      return 'apartment'
    }
    return 'property'
  }, [cleanProjectId, selectedProjectObj])

  useEffect(() => {
    if (quote) {
      setFormData({
        leadId: getId(quote.leadId), clientId: getId(quote.clientId), projectId: getId(quote.projectId), 
        lotId: getId(quote.lotId), modelId: getId(quote.modelId), facadeId: getId(quote.facadeId),
        deckId: getId(quote.deckId), buildingId: getId(quote.buildingId), apartmentId: getId(quote.apartmentId),
        selectedRenderType: quote.selectedRenderType || 'basic', selectedOptions: quote.selectedOptions || {},
        hasModelUpgrade: quote.modelType === 'upgrade' || quote.hasModelUpgrade || false,
        hasModelBalcony: quote.hasBalcony || quote.hasModelBalcony || false,
        hasModelStorage: quote.hasStorage || quote.hasModelStorage || false,
        modelUpgradeId: quote.selectedOptions?.upgradeId || quote.modelUpgradeId || null,
        modelBalconyId: quote.selectedOptions?.balconyId || quote.modelBalconyId || null,
        modelStorageId: quote.selectedOptions?.storageId || quote.modelStorageId || null,
        totalPrice: quote.totalPrice || 0, downPayment: quote.downPayment || 0, interestRate: quote.interestRate || 5,
        termMonths: quote.termMonths || 120, amortizationMethod: quote.amortizationMethod || 'fixed',
        balloonAmount: quote.balloonAmount || 0, balloonMonth: quote.balloonMonth || 0,
        startDate: quote.startDate ? quote.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        validUntil: quote.validUntil ? quote.validUntil.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: quote.notes || '', status: quote.status || 'draft'
      })
      setPreviewData(quote)
    } else {
      resetForm()
    }
    setActiveStep(0)
    setError(null)
  }, [quote, open])

  const resetForm = () => {
    setFormData({
      leadId: '', clientId: '', projectId: '', lotId: '', modelId: '', facadeId: '', deckId: '', buildingId: '', apartmentId: '',
      selectedRenderType: 'basic', selectedOptions: {}, hasModelUpgrade: false, hasModelBalcony: false, hasModelStorage: false,
      modelUpgradeId: null, modelBalconyId: null, modelStorageId: null, totalPrice: 0, downPayment: 0, interestRate: 5, termMonths: 120,
      amortizationMethod: 'fixed', balloonAmount: 0, balloonMonth: 0,
      startDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '', status: 'draft'
    })
    setLots([]); setBuildings([]); setModels([]); setApartments([]); setFacades([])
    setModelPricingOptions(null)
    setPreviewData(null)
  }

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  useEffect(() => {
    if (formData.modelId) {
      const fetchPricingOptions = async () => {
        try {
          const res = await api.get(`/models/${formData.modelId}/pricing-options`)
          setModelPricingOptions(res.data)
          setFormData(prev => ({ ...prev, hasModelUpgrade: false, hasModelBalcony: false, hasModelStorage: false, modelUpgradeId: null, modelBalconyId: null, modelStorageId: null }))
        } catch (err) {
          console.error('Error fetching pricing options:', err)
          setModelPricingOptions(null)
        }
      }
      fetchPricingOptions()
    } else {
      setModelPricingOptions(null)
      setFormData(prev => ({ ...prev, hasModelUpgrade: false, hasModelBalcony: false, hasModelStorage: false, modelUpgradeId: null, modelBalconyId: null, modelStorageId: null }))
    }
  }, [formData.modelId])

  const handleModelCustomizationToggle = (optionName) => {
    const hasKey = `hasModel${optionName.charAt(0).toUpperCase() + optionName.slice(1)}`
    const idKey = `model${optionName.charAt(0).toUpperCase() + optionName.slice(1)}Id`
    const newValue = !formData[hasKey]
    let newId = null
    
    if (newValue && modelPricingOptions?.availableOptions) {
      const available = modelPricingOptions.availableOptions
      if (optionName === 'upgrade' && available.upgrades?.[0]) newId = available.upgrades[0]._id
      if (optionName === 'balcony' && available.balconies?.[0]) newId = available.balconies[0]._id
      if (optionName === 'storage' && available.storages?.[0]) newId = available.storages[0]._id
    }
    setFormData(prev => ({ ...prev, [hasKey]: newValue, [idKey]: newId }))
  }

  useEffect(() => {
    const loadProperties = async () => {
      if (!formData.projectId) {
        setLots([]); setBuildings([]); setModels([]); setApartments([]); setFacades([])
        setFormData(prev => ({ ...prev, lotId: '', modelId: '', facadeId: '', deckId: '', buildingId: '', apartmentId: '', selectedOptions: {} }))
        return
      }
      setLoadingProperties(true)
      try {
        if (projectType === 'lakewood' || projectType === 'property') {
          const [lotsData, modelsData, facadesData] = await Promise.all([
            propertyService.getLots(formData.projectId).catch(() => []),
            propertyService.getModels(formData.projectId).catch(() => []),
            api.get('/facades', { params: { projectId: formData.projectId } }).then(res => res.data).catch(() => [])
          ])
          setLots((lotsData || []).filter(l => l.status === 'available'))
          setModels(modelsData || [])
          setFacades(facadesData || [])
          setBuildings([]); setApartments([])
        } else if (projectType === 'apartment') {
          setBuildings(await buildingService.getAll({ projectId: formData.projectId }).catch(() => []))
          setLots([]); setModels([]); setFacades([]); setApartments([])
        } else if (projectType === '6town') {
          const [buildingsData, modelsData, lotsData] = await Promise.all([
            buildingService.getAll({ projectId: formData.projectId }).catch(() => []),
            propertyService.getModels(formData.projectId).catch(() => []),
            propertyService.getLots(formData.projectId).catch(() => [])
          ])
          setBuildings((buildingsData || []).filter(b => b.availabilityStatus === 'available' || b.isAvailableForQuote))
          setModels(modelsData || [])
          setLots(lotsData || [])
          setFacades([]); setApartments([])
        }
      } catch (err) {
        console.error('Error loading properties:', err)
      } finally {
        setLoadingProperties(false)
      }
    }
    loadProperties()
  }, [formData.projectId, projectType])

  useEffect(() => {
    if ((projectType === 'lakewood' || projectType === 'property') && formData.lotId) {
      const selectedLot = lots.find(l => l._id === formData.lotId)
      const modelId = (selectedLot?.model !== null && typeof selectedLot?.model === 'object') ? selectedLot.model._id : selectedLot?.model
      setFormData(prev => ({ ...prev, modelId: modelId || '', facadeId: '', deckId: '' }))
    }
  }, [formData.lotId, lots, projectType])

  useEffect(() => {
    if (projectType === '6town' && formData.buildingId) {
      const selectedBuilding = buildings.find(b => b._id === formData.buildingId)
      if (selectedBuilding?.quoteRef) {
        const modelId = typeof selectedBuilding.quoteRef.model === 'object' ? selectedBuilding.quoteRef.model._id : selectedBuilding.quoteRef.model
        const lotId = typeof selectedBuilding.quoteRef.lot === 'object' ? selectedBuilding.quoteRef.lot._id : selectedBuilding.quoteRef.lot
        const selectedModel = models.find(m => m._id === modelId)
        const defaultOptions = {}
        if (selectedModel?.floors) {
          selectedModel.floors.forEach(floor => {
            if (floor.isCustomizable && floor.options && floor.options.length > 0) {
              defaultOptions[floor.key] = floor.options[0].key
            }
          })
        }
        setFormData(prev => ({ ...prev, modelId: modelId || '', lotId: lotId || '', selectedOptions: defaultOptions }))
      }
    }
  }, [formData.buildingId, buildings, models, projectType])

  useEffect(() => {
    if (projectType === 'apartment' && formData.buildingId) {
      buildingService.getApartments(formData.buildingId).then(aptsData => setApartments(aptsData || [])).catch(() => setApartments([]))
    } else if (projectType !== 'apartment') {
      setApartments([])
      setFormData(prev => ({ ...prev, apartmentId: '', selectedRenderType: 'basic' }))
    }
  }, [formData.buildingId, projectType])

  useEffect(() => {
    if (formData.apartmentId) {
      const selectedApt = apartments.find(a => a._id === formData.apartmentId)
      if (selectedApt) setFormData(prev => ({ ...prev, selectedRenderType: selectedApt.selectedRenderType || 'basic' }))
    }
  }, [formData.apartmentId, apartments])

  useEffect(() => {
    let newTotalPrice = 0
    if (projectType === 'lakewood' || projectType === 'property') {
      if (formData.lotId) {
        const selectedLot = lots.find(l => l._id === formData.lotId)
        newTotalPrice += selectedLot?.price || 0
        if (formData.modelId) newTotalPrice += (models.find(m => m._id === formData.modelId)?.price || 0)
        if (formData.facadeId) {
          const selectedFacade = facades.find(f => f._id === formData.facadeId)
          newTotalPrice += selectedFacade?.price || 0
          if (formData.deckId && selectedFacade?.decks) newTotalPrice += (selectedFacade.decks.find(d => d._id === formData.deckId)?.price || 0)
        }
        if (modelPricingOptions?.availableOptions) {
          const { upgrades, balconies, storages } = modelPricingOptions.availableOptions
          if (formData.hasModelUpgrade && upgrades?.[0]) newTotalPrice += upgrades[0].price
          if (formData.hasModelBalcony && balconies?.[0]) newTotalPrice += balconies[0].price
          if (formData.hasModelStorage && storages?.[0]) newTotalPrice += storages[0].price
        }
      }
    } else if (projectType === '6town' && formData.buildingId) {
      const selectedBuilding = buildings.find(b => b._id === formData.buildingId)
      if (selectedBuilding?.quoteRef) {
        const modelId = typeof selectedBuilding.quoteRef.model === 'object' ? selectedBuilding.quoteRef.model._id : selectedBuilding.quoteRef.model
        const lotId = typeof selectedBuilding.quoteRef.lot === 'object' ? selectedBuilding.quoteRef.lot._id : selectedBuilding.quoteRef.lot
        let basePrice = (models.find(m => m._id === modelId)?.price || 0) + (lots.find(l => l._id === lotId)?.price || 0)
        if (catalogConfig && formData.selectedOptions && Object.keys(formData.selectedOptions).length > 0) {
          try {
            const estimated = calculateEstimatedPrice({ basePrice, pricingRules: catalogConfig?.pricingRules || [], selectedOptions: formData.selectedOptions })
            newTotalPrice = estimated?.totalPrice || basePrice
          } catch { newTotalPrice = basePrice }
        } else { newTotalPrice = basePrice }
      }
    } else if (projectType === 'apartment' && formData.apartmentId) {
      const selectedApt = apartments.find(a => a._id === formData.apartmentId)
      newTotalPrice = (selectedApt?.price || 0) + (formData.selectedRenderType === 'upgrade' ? (selectedApt?.upgradePrice || 0) : 0)
    }
    setFormData(prev => ({ ...prev, totalPrice: newTotalPrice }))
  }, [formData.lotId, formData.modelId, formData.facadeId, formData.deckId, formData.apartmentId, formData.buildingId, formData.selectedOptions, formData.selectedRenderType, formData.hasModelUpgrade, formData.hasModelBalcony, formData.hasModelStorage, lots, models, facades, apartments, buildings, projectType, catalogConfig, modelPricingOptions])

  useEffect(() => {
    if (formData.totalPrice > 0 && formData.termMonths > 0 && activeStep >= 1) {
      const financed = Math.max(0, formData.totalPrice - formData.downPayment)
      const monthlyRate = formData.interestRate / 100 / 12
      let schedule = []
      let balance = financed
      for (let i = 1; i <= formData.termMonths; i++) {
        let interest = balance * monthlyRate
        let principal = formData.amortizationMethod === 'fixed' 
          ? (financed * monthlyRate * Math.pow(1 + monthlyRate, formData.termMonths)) / (Math.pow(1 + monthlyRate, formData.termMonths) - 1) - interest
          : financed / formData.termMonths
        let payment = principal + interest
        if (formData.balloonMonth && i === formData.balloonMonth) {
          principal = balance - formData.balloonAmount
          payment = principal + interest + formData.balloonAmount
          balance = 0
        } else { balance -= principal }
        if (balance < 0) balance = 0
        const date = new Date(formData.startDate)
        date.setMonth(date.getMonth() + i)
        schedule.push({ monthNumber: i, date: date.toISOString(), principal: Math.round(principal * 100) / 100, interest: Math.round(interest * 100) / 100, payment: Math.round(payment * 100) / 100, balance: Math.round(balance * 100) / 100, isBalloon: formData.balloonMonth === i })
      }
      setPreviewData({ ...formData, financedAmount: financed, monthlyPayment: schedule[0]?.payment || 0, downPaymentPercentage: formData.totalPrice > 0 ? ((formData.downPayment / formData.totalPrice) * 100).toFixed(1) : 0, schedule })
    }
  }, [formData.totalPrice, formData.downPayment, formData.interestRate, formData.termMonths, formData.amortizationMethod, formData.balloonAmount, formData.balloonMonth, formData.startDate, activeStep])

  const handleNext = () => {
    if (activeStep === 0) {
      const hasProperty = formData.lotId || formData.apartmentId || formData.buildingId
      if (!formData.projectId || !hasProperty) {
        setError('Debes seleccionar un proyecto y una propiedad')
        return
      }
    }
    setError(null)
    setActiveStep(prev => prev + 1)
  }

  const handleBack = () => {
    setError(null)
    setActiveStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      let payload = { ...formData, ...previewData }
      if (projectType === 'lakewood' || projectType === 'property') {
        payload = {
          ...payload, hasBalcony: formData.hasModelBalcony, hasStorage: formData.hasModelStorage,
          modelType: formData.hasModelUpgrade ? 'upgrade' : 'basic',
          selectedOptions: { upgradeId: formData.modelUpgradeId || null, balconyId: formData.modelBalconyId || null, storageId: formData.modelStorageId || null }
        }
      }
      if (isEditing) await onSave(quote._id, payload)
      else await onSave(null, payload)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la cotización')
    } finally {
      setLoading(false)
    }
  }

  const availableFacades = useMemo(() => {
    if (!formData.modelId) return []
    return facades.filter(f => {
      const facadeModelId = (f.model !== null && typeof f.model === 'object') ? f.model._id : f.model
      return facadeModelId === formData.modelId
    })
  }, [formData.modelId, facades])

  const availableDecks = useMemo(() => {
    if (!formData.facadeId) return []
    const selectedFacade = facades.find(f => f._id === formData.facadeId)
    return selectedFacade?.decks || []
  }, [formData.facadeId, facades])

  const getPropertyName = () => {
    if (projectType === '6town' && formData.buildingId) return buildings.find(b => b._id === formData.buildingId)?.name || '6Town House'
    if (formData.lotId) {
      const lot = lots.find(l => l._id === formData.lotId)
      const model = models.find(m => m._id === formData.modelId) || lot?.model
      const lotNumber = lot?.lot?.number || lot?.number || ''
      const modelName = (model && typeof model === 'object') ? (model.model || model.modelNumber) : ''
      return `Lote ${lotNumber} ${modelName ? `— ${modelName}` : ''}`
    }
    if (formData.apartmentId) {
      const apt = apartments.find(a => a._id === formData.apartmentId)
      return `Apto ${apt?.apartmentNumber || ''} ${apt?.floorNumber ? `(Piso ${apt.floorNumber})` : ''}${formData.selectedRenderType === 'upgrade' ? ' (Upgrade)' : ''}`
    }
    return 'No seleccionada'
  }

  // ✅ Estilos unificados
  const unifiedButtonSx = { 
    borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', letterSpacing: '0.5px', width: { xs: '100%', sm: 'auto' },
    '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } 
  }
  
  const inputSx = { 
    fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, 
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' },
    '& .MuiOutlinedInput-root': { borderRadius: 0 }
  }

  const menuItemSx = {
    fontFamily: '"Courier New", monospace',
    fontSize: '0.75rem',
    borderRadius: 0,
    '&:hover': { bgcolor: '#f5f5f5' }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}>
      <DialogTitle sx={{ borderBottom: '1px solid #ececec', display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: { xs: 2, sm: 3 } }}>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoAwesome sx={{ fontSize: 20 }} />
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: { xs: '0.75rem', sm: '0.85rem' }, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {isEditing ? t('editTitle', 'Editar Cotización') : t('createTitle', 'Nueva Cotización')}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={loading} sx={{ borderRadius: 0 }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
        {error && <Alert severity="error" sx={{ m: { xs: 1, sm: 3 }, mb: { xs: 1, sm: 0 }, borderRadius: 0, border: '1px solid', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>{error}</Alert>}
        
        <Box sx={{ p: { xs: 1, sm: 0 } }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4, '& .MuiStepLabel-label': { fontSize: { xs: '0.65rem', sm: '0.75rem' } } }}>
            {STEPS.map(label => (
              <Step key={label}>
                <StepLabel sx={{ fontFamily: '"Courier New", monospace', letterSpacing: '0.5px' }}>{isMobile && label.length > 10 ? label.substring(0, 10) + '...' : label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('form.lead')}</InputLabel>
                  <Select value={formData.leadId} onChange={(e) => handleChange('leadId', e.target.value)} label={t('form.lead')} sx={inputSx}>
                    <MenuItem value="">{t('none', 'Ninguno')}</MenuItem>
                    {leads.map(l => <MenuItem key={l._id} value={l._id} sx={menuItemSx}>{l.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('form.client')}</InputLabel>
                  <Select value={formData.clientId} onChange={(e) => handleChange('clientId', e.target.value)} label={t('form.client')} sx={inputSx}>
                    <MenuItem value="">{t('none', 'Ninguno')}</MenuItem>
                    {clients.map(c => <MenuItem key={c._id} value={c._id} sx={menuItemSx}>{c.firstName} {c.lastName}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}><Divider sx={{ my: 1 }} /><Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontFamily: '"Courier New", monospace', letterSpacing: '1px', textTransform: 'uppercase' }}>Selección de Propiedad</Typography></Grid>

              {/* ✅ ProjectSelector Integrado */}
              <Grid item xs={12} md={6}>
                <ProjectSelector
                  value={formData.projectId}
                  onChange={(value) => handleChange('projectId', value)}
                  label={`${t('form.project')} *`}
                  includeGlobal={false}
                  fullWidth
                  size="small"
                />
              </Grid>

              {(projectType === 'lakewood' || projectType === 'property') && formData.projectId && lots.length > 0 && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t('form.lot', 'Lote')}</InputLabel>
                      <Select value={formData.lotId} onChange={(e) => handleChange('lotId', e.target.value)} label={t('form.lot', 'Lote')} disabled={loadingProperties} sx={inputSx}>
                        <MenuItem value="">{t('none', 'Ninguno')}</MenuItem>
                        {lots.map(l => {
                          const modelName = (l.model && typeof l.model === 'object') ? l.model.model : ''
                          return <MenuItem key={l._id} value={l._id} sx={menuItemSx}>Lote {l.lot?.number || l.number || 'N/A'} {modelName ? `— ${modelName}` : ''}</MenuItem>
                        })}
                      </Select>
                    </FormControl>
                  </Grid>

                  {formData.modelId && models.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{t('form.model', 'Modelo')}</InputLabel>
                        <Select value={formData.modelId} label={t('form.model', 'Modelo')} disabled sx={inputSx}>
                          {models.map(m => <MenuItem key={m._id} value={m._id} sx={menuItemSx}>{m.model || m.name || `Model ${m.modelNumber}`}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {formData.modelId && availableFacades.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{t('form.facade', 'Fachada')}</InputLabel>
                        <Select value={formData.facadeId} onChange={(e) => { handleChange('facadeId', e.target.value); handleChange('deckId', '') }} label={t('form.facade', 'Fachada')} sx={inputSx}>
                          <MenuItem value="">{t('none', 'Ninguno')}</MenuItem>
                          {availableFacades.map(f => <MenuItem key={f._id} value={f._id} sx={menuItemSx}>{f.title} {f.price > 0 ? `(+ $${f.price.toLocaleString()})` : ''}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {formData.facadeId && availableDecks.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{t('form.deck', 'Opción / Deck')}</InputLabel>
                        <Select value={formData.deckId} onChange={(e) => handleChange('deckId', e.target.value)} label={t('form.deck', 'Opción / Deck')} sx={inputSx}>
                          {availableDecks.map(d => <MenuItem key={d._id} value={d._id} sx={menuItemSx}>{d.name} {d.price > 0 ? `(+ $${d.price.toLocaleString()})` : ''}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {formData.modelId && modelPricingOptions?.availableOptions && (
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 0, border: '1px solid #e0e0e0' }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                          {t('form.customization', 'Opciones de Personalización')}
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={1.5}>
                          {modelPricingOptions.availableOptions.upgrades?.length > 0 && (
                            <FormControlLabel control={<Switch checked={formData.hasModelUpgrade} onChange={() => handleModelCustomizationToggle('upgrade')} color="primary" />} label={<Box display="flex" alignItems="center" gap={1}><Typography variant="body2" sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>{modelPricingOptions.availableOptions.upgrades[0].name || t('form.upgrade', 'Upgrade')}</Typography><Chip label={`+$${modelPricingOptions.availableOptions.upgrades[0].price?.toLocaleString()}`} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.7rem', borderRadius: 0, fontFamily: '"Courier New", monospace' }} /></Box>} />
                          )}
                          {modelPricingOptions.availableOptions.balconies?.length > 0 && (
                            <FormControlLabel control={<Switch checked={formData.hasModelBalcony} onChange={() => handleModelCustomizationToggle('balcony')} color="primary" />} label={<Box display="flex" alignItems="center" gap={1}><Typography variant="body2" sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>{modelPricingOptions.availableOptions.balconies[0].name || t('form.balcony', 'Balcón')}</Typography><Chip label={`+$${modelPricingOptions.availableOptions.balconies[0].price?.toLocaleString()}`} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.7rem', borderRadius: 0, fontFamily: '"Courier New", monospace' }} /></Box>} />
                          )}
                          {modelPricingOptions.availableOptions.storages?.length > 0 && (
                            <FormControlLabel control={<Switch checked={formData.hasModelStorage} onChange={() => handleModelCustomizationToggle('storage')} color="primary" />} label={<Box display="flex" alignItems="center" gap={1}><Typography variant="body2" sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>{modelPricingOptions.availableOptions.storages[0].name || t('form.storage', 'Storage')}</Typography><Chip label={`+$${modelPricingOptions.availableOptions.storages[0].price?.toLocaleString()}`} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.7rem', borderRadius: 0, fontFamily: '"Courier New", monospace' }} /></Box>} />
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </>
              )}

              {projectType === '6town' && formData.projectId && buildings.length > 0 && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Casa / Propiedad</InputLabel>
                    <Select value={formData.buildingId} onChange={(e) => handleChange('buildingId', e.target.value)} label="Casa / Propiedad" disabled={loadingProperties} sx={inputSx}>
                      <MenuItem value="">{t('none', 'Ninguno')}</MenuItem>
                      {buildings.map(b => {
                        const lotRef = typeof b.quoteRef?.lot === 'object' ? b.quoteRef.lot.number : b.quoteRef?.lot
                        return <MenuItem key={b._id} value={b._id} sx={menuItemSx}>{b.name} {lotRef ? `(Lote ${lotRef})` : ''}</MenuItem>
                      })}
                    </Select>
                  </FormControl>
                  {formData.buildingId && (() => {
                    const selectedBuilding = buildings.find(b => b._id === formData.buildingId)
                    const modelId = typeof selectedBuilding?.quoteRef?.model === 'object' ? selectedBuilding.quoteRef.model._id : selectedBuilding?.quoteRef?.model
                    const selectedModel = models.find(m => m._id === modelId)
                    if (!selectedModel?.floors) return null
                    return (
                      <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 0, bgcolor: '#f9f9f9' }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ fontFamily: '"Courier New", monospace' }}>Personalización de Pisos</Typography>
                        {selectedModel.floors.filter(f => f.isCustomizable).map((floor) => (
                          <Box key={floor.key} sx={{ mb: 2 }}>
                            <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block', fontFamily: '"Courier New", monospace' }}>{floor.label}</Typography>
                            <FormControl fullWidth size="small">
                              <InputLabel>{floor.label}</InputLabel>
                              <Select value={formData.selectedOptions?.[floor.key] || ''} onChange={(e) => setFormData(prev => ({ ...prev, selectedOptions: { ...prev.selectedOptions, [floor.key]: e.target.value } }))} label={floor.label} sx={inputSx}>
                                {floor.options?.map(option => <MenuItem key={option.key} value={option.key} sx={menuItemSx}>{option.label}</MenuItem>)}
                              </Select>
                            </FormControl>
                          </Box>
                        ))}
                      </Box>
                    )
                  })()}
                </Grid>
              )}

              {projectType === 'apartment' && formData.projectId && buildings.length > 0 && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t('form.building', 'Edificio')}</InputLabel>
                      <Select value={formData.buildingId} onChange={(e) => handleChange('buildingId', e.target.value)} label={t('form.building', 'Edificio')} disabled={loadingProperties} sx={inputSx}>
                        <MenuItem value="">{t('none', 'Ninguno')}</MenuItem>
                        {buildings.map(b => <MenuItem key={b._id} value={b._id} sx={menuItemSx}>{b.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  {formData.buildingId && apartments.length > 0 && (
                    <>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t('form.apartment', 'Apartamento')}</InputLabel>
                          <Select value={formData.apartmentId} onChange={(e) => handleChange('apartmentId', e.target.value)} label={t('form.apartment', 'Apartamento')} sx={inputSx}>
                            <MenuItem value="">{t('none', 'Ninguno')}</MenuItem>
                            {apartments.map(a => <MenuItem key={a._id} value={a._id} sx={menuItemSx}>Apto {a.apartmentNumber} {a.floorNumber ? `(Piso ${a.floorNumber})` : ''}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      {formData.apartmentId && (
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>{t('form.renderType', 'Tipo de Acabado')}</InputLabel>
                            <Select value={formData.selectedRenderType || 'basic'} onChange={(e) => handleChange('selectedRenderType', e.target.value)} label={t('form.renderType', 'Tipo de Acabado')} sx={inputSx}>
                              <MenuItem value="basic" sx={menuItemSx}>{t('renderTypes.basic', 'Básico')}</MenuItem>
                              <MenuItem value="upgrade" sx={menuItemSx}>{t('renderTypes.upgrade', 'Upgrade / Premium')}</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                    </>
                  )}
                </>
              )}
              
              {formData.projectId && lots.length === 0 && buildings.length === 0 && apartments.length === 0 && !loadingProperties && (
                <Grid item xs={12}><Alert severity="info" sx={{ borderRadius: 0, border: '1px solid', fontFamily: '"Courier New", monospace' }}>Este proyecto no tiene propiedades disponibles configuradas aún.</Alert></Grid>
              )}
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12}><Alert severity="info" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, border: '1px solid' }}>Propiedad seleccionada: <strong style={{ fontFamily: '"Helvetica Neue", sans-serif' }}>{getPropertyName()}</strong></Alert></Grid>
              <Grid item xs={12} md={6}>
                <TextField label={t('form.totalPrice')} type="number" fullWidth size="small" value={formData.totalPrice} onChange={(e) => handleChange('totalPrice', Number(e.target.value))} sx={inputSx} InputProps={{ startAdornment: <Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontFamily: '"Courier New", monospace' }}>$</Typography> }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label={`${t('form.downPayment')} (${previewData?.downPaymentPercentage || 0}%)`} type="number" fullWidth size="small" value={formData.downPayment} onChange={(e) => handleChange('downPayment', Number(e.target.value))} sx={inputSx} InputProps={{ startAdornment: <Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontFamily: '"Courier New", monospace' }}>$</Typography> }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label={t('form.interestRate')} type="number" fullWidth size="small" value={formData.interestRate} onChange={(e) => handleChange('interestRate', Number(e.target.value))} sx={inputSx} InputProps={{ endAdornment: <Typography variant="caption" sx={{ fontFamily: '"Courier New", monospace' }}>%</Typography> }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label={t('form.termMonths')} type="number" fullWidth size="small" value={formData.termMonths} onChange={(e) => handleChange('termMonths', Number(e.target.value))} sx={inputSx} InputProps={{ endAdornment: <Typography variant="caption" sx={{ fontFamily: '"Courier New", monospace' }}>meses</Typography> }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('form.amortizationMethod')}</InputLabel>
                  <Select value={formData.amortizationMethod} onChange={(e) => handleChange('amortizationMethod', e.target.value)} label={t('form.amortizationMethod')} sx={inputSx}>
                    <MenuItem value="fixed" sx={menuItemSx}>{t('form.fixed', 'Cuota Fija')}</MenuItem>
                    <MenuItem value="declining" sx={menuItemSx}>{t('form.declining', 'Cuota Decreciente')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && previewData && (
            <Box>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 0, mb: 3, border: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ fontFamily: '"Courier New", monospace' }}>Resumen de la Cotización</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>Propiedad: {getPropertyName()}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>Monto Financiado: <strong>${previewData.financedAmount?.toLocaleString()}</strong></Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1, fontFamily: '"Helvetica Neue", sans-serif' }}>Cuota Mensual: ${previewData.monthlyPayment?.toLocaleString(undefined, {minimumFractionDigits: 2})}</Typography>
              </Box>
              
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontFamily: '"Courier New", monospace', letterSpacing: '1px', textTransform: 'uppercase' }}>Tabla de Amortización</Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <AmortizationTable schedule={previewData.schedule} />
              </Box>
              
              <TextField label={t('form.notes')} multiline rows={3} fullWidth size="small" sx={{ mt: 3, ...inputSx }} value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Términos, condiciones o notas adicionales..." />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #ececec', p: 2, gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading} sx={{ ...unifiedButtonSx, color: '#888' }}>
            {t('back', 'Atrás')}
          </Button>
        )}
        <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
        <Button onClick={onClose} disabled={loading} sx={{ ...unifiedButtonSx, color: '#888' }}>
          {t('cancel', 'Cancelar')}
        </Button>
        {activeStep < 2 ? (
          <Button variant="contained" onClick={handleNext} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
            {t('next', 'Siguiente')}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSubmit} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : <AutoAwesome />} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
            {loading ? t('saving', 'Guardando...') : (isEditing ? t('update', 'Actualizar') : t('create', 'Crear'))}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}