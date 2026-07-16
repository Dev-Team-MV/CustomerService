// apps/mv-crm/src/components/quotes/QuoteBuilderModal.jsx
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography,
  TextField, Button, IconButton, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, Stepper, Step, StepLabel, Grid, Divider
} from '@mui/material'
import { Close, AutoAwesome, Home, Apartment, Business } from '@mui/icons-material'
import quoteService from '../../services/quoteService'
import propertyService from '@shared/services/propertyService'
import buildingService from '@shared/services/buildingService'
import api from '@shared/services/api'
import AmortizationTable from './AmortizationTable'
import { useCatalogConfig } from '@shared/hooks/useCatalogConfig'
import { calculateEstimatedPrice } from '@shared/utils/pricingEngine'

const STEPS = ['Propiedad', 'Financiamiento', 'Vista Previa']

export default function QuoteBuilderModal({ open, onClose, quote = null, onSave, projects = [], leads = [], clients = [] }) {
  const { t } = useTranslation('quoteCrm')
  const isEditing = Boolean(quote?._id)
  
  // ✅ 1. Helper definitivo para extraer SIEMPRE un string ID
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

  const [formData, setFormData] = useState({
    leadId: '', clientId: '', projectId: '',
    lotId: '', modelId: '', facadeId: '', deckId: '', buildingId: '', apartmentId: '',
    selectedRenderType: 'basic', // ✅ Campo para el tipo de acabado
    selectedOptions: {},
    totalPrice: 0, downPayment: 0, interestRate: 5, termMonths: 120,
    amortizationMethod: 'fixed', balloonAmount: 0, balloonMonth: 0,
    startDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '', status: 'draft'
  })

  // ✅ 2. Obtener el ID limpio del proyecto
  const cleanProjectId = getId(formData.projectId)
  const selectedProjectObj = projects.find(p => p._id === cleanProjectId)
  const { catalogConfig } = useCatalogConfig(cleanProjectId, { activeOnly: true })

  // Determinar tipo de proyecto
  const projectType = useMemo(() => {
    if (!cleanProjectId) return null
    if (selectedProjectObj?.slug === '6town-houses') return '6town'
    if (selectedProjectObj?.slug === 'lakewood') return 'lakewood'
    if (selectedProjectObj?.type === 'apartments' || selectedProjectObj?.slug?.includes('tower') || selectedProjectObj?.slug?.includes('isq') || selectedProjectObj?.slug?.includes('shepherd')) {
      return 'apartment'
    }
    return 'property'
  }, [cleanProjectId, selectedProjectObj])

  // 3. Cargar datos iniciales si es edición
  useEffect(() => {
    if (quote) {
      setFormData({
        leadId: getId(quote.leadId),
        clientId: getId(quote.clientId),
        projectId: getId(quote.projectId), 
        lotId: getId(quote.lotId),
        modelId: getId(quote.modelId),
        facadeId: getId(quote.facadeId),
        deckId: getId(quote.deckId),
        buildingId: getId(quote.buildingId),
        apartmentId: getId(quote.apartmentId),
        selectedRenderType: quote.selectedRenderType || 'basic',
        selectedOptions: quote.selectedOptions || {},
        totalPrice: quote.totalPrice || 0,
        downPayment: quote.downPayment || 0,
        interestRate: quote.interestRate || 5,
        termMonths: quote.termMonths || 120,
        amortizationMethod: quote.amortizationMethod || 'fixed',
        balloonAmount: quote.balloonAmount || 0,
        balloonMonth: quote.balloonMonth || 0,
        startDate: quote.startDate ? quote.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        validUntil: quote.validUntil ? quote.validUntil.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: quote.notes || '',
        status: quote.status || 'draft'
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
      leadId: '', clientId: '', projectId: '',
      lotId: '', modelId: '', facadeId: '', deckId: '', buildingId: '', apartmentId: '',
      selectedRenderType: 'basic',
      selectedOptions: {},
      totalPrice: 0, downPayment: 0, interestRate: 5, termMonths: 120,
      amortizationMethod: 'fixed', balloonAmount: 0, balloonMonth: 0,
      startDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '', status: 'draft'
    })
    setLots([]); setBuildings([]); setModels([]); setApartments([]); setFacades([])
    setPreviewData(null)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 4. Carga en cascada: Al seleccionar Proyecto
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
          const availableLots = (lotsData || []).filter(l => l.status === 'available')
          setLots(availableLots)
          setModels(modelsData || [])
          setFacades(facadesData || [])
          setBuildings([])
          setApartments([])
        } else if (projectType === 'apartment') {
          const buildingsData = await buildingService.getAll({ projectId: formData.projectId }).catch(() => [])
          setBuildings(buildingsData || [])
          setLots([]); setModels([]); setFacades([]); setApartments([])
        } else if (projectType === '6town') {
          const [buildingsData, modelsData, lotsData] = await Promise.all([
            buildingService.getAll({ projectId: formData.projectId }).catch(() => []),
            propertyService.getModels(formData.projectId).catch(() => []),
            propertyService.getLots(formData.projectId).catch(() => [])
          ])
          const availableBuildings = (buildingsData || []).filter(b => b.availabilityStatus === 'available' || b.isAvailableForQuote)
          setBuildings(availableBuildings)
          setModels(modelsData || [])
          setLots(lotsData || [])
          setFacades([])
          setApartments([])
        }
      } catch (err) {
        console.error('Error loading properties:', err)
      } finally {
        setLoadingProperties(false)
      }
    }
    loadProperties()
  }, [formData.projectId, projectType])

  // ✅ 5. Lógica en cascada para LakeWood/Propiedades
  useEffect(() => {
    if ((projectType === 'lakewood' || projectType === 'property') && formData.lotId) {
      const selectedLot = lots.find(l => l._id === formData.lotId)
      const modelId = (selectedLot?.model !== null && typeof selectedLot?.model === 'object') ? selectedLot.model._id : selectedLot?.model
      setFormData(prev => ({ ...prev, modelId: modelId || '', facadeId: '', deckId: '' }))
    }
  }, [formData.lotId, lots, projectType])

  // ✅ 6. Lógica en cascada para 6Town
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

  // 7. Carga de apartments cuando se selecciona edificio
  useEffect(() => {
    if (projectType === 'apartment' && formData.buildingId) {
      const loadApartments = async () => {
        try {
          const aptsData = await buildingService.getApartments(formData.buildingId)
          setApartments(aptsData || [])
        } catch (err) {
          console.error('Error loading apartments:', err)
        }
      }
      loadApartments()
    } else if (projectType !== 'apartment') {
      setApartments([])
      setFormData(prev => ({ ...prev, apartmentId: '', selectedRenderType: 'basic' }))
    }
  }, [formData.buildingId, projectType])

  // ✅ 8. Actualizar selectedRenderType cuando se selecciona un apartamento
  useEffect(() => {
    if (formData.apartmentId) {
      const selectedApt = apartments.find(a => a._id === formData.apartmentId)
      if (selectedApt) {
        setFormData(prev => ({
          ...prev,
          selectedRenderType: selectedApt.selectedRenderType || 'basic'
        }))
      }
    }
  }, [formData.apartmentId, apartments])

  // ✅ 9. CÁLCULO AUTOMÁTICO DEL PRECIO TOTAL (CORREGIDO PARA APARTAMENTOS)
  useEffect(() => {
    let newTotalPrice = 0

    if (projectType === 'lakewood' || projectType === 'property') {
      if (formData.lotId) {
        const selectedLot = lots.find(l => l._id === formData.lotId)
        newTotalPrice += selectedLot?.price || 0
        if (formData.modelId) {
          const selectedModel = models.find(m => m._id === formData.modelId)
          newTotalPrice += selectedModel?.price || 0
        }
        if (formData.facadeId) {
          const selectedFacade = facades.find(f => f._id === formData.facadeId)
          newTotalPrice += selectedFacade?.price || 0
          if (formData.deckId && selectedFacade?.decks) {
            const selectedDeck = selectedFacade.decks.find(d => d._id === formData.deckId)
            newTotalPrice += selectedDeck?.price || 0
          }
        }
      }
    } else if (projectType === '6town' && formData.buildingId) {
      const selectedBuilding = buildings.find(b => b._id === formData.buildingId)
      if (selectedBuilding?.quoteRef) {
        const modelId = typeof selectedBuilding.quoteRef.model === 'object' ? selectedBuilding.quoteRef.model._id : selectedBuilding.quoteRef.model
        const lotId = typeof selectedBuilding.quoteRef.lot === 'object' ? selectedBuilding.quoteRef.lot._id : selectedBuilding.quoteRef.lot
        const selectedModel = models.find(m => m._id === modelId)
        const selectedLot = lots.find(l => l._id === lotId)
        let basePrice = (selectedModel?.price || 0) + (selectedLot?.price || 0)
        
        if (catalogConfig && formData.selectedOptions && Object.keys(formData.selectedOptions).length > 0) {
          try {
            const estimated = calculateEstimatedPrice({
              basePrice,
              pricingRules: catalogConfig?.pricingRules || [],
              selectedOptions: formData.selectedOptions
            })
            newTotalPrice = estimated?.totalPrice || basePrice
          } catch (err) {
            console.error('Error calculating estimated price:', err)
            newTotalPrice = basePrice
          }
        } else {
          newTotalPrice = basePrice
        }
      }
    } else if (projectType === 'apartment' && formData.apartmentId) {
      // ✅ CORRECCIÓN CLAVE: Sumar el upgradePrice si se selecciona upgrade
      const selectedApt = apartments.find(a => a._id === formData.apartmentId)
      const basePrice = selectedApt?.price || 0
      const isUpgrade = formData.selectedRenderType === 'upgrade'
      const upgradeExtra = isUpgrade ? (selectedApt?.upgradePrice || 0) : 0
      
      newTotalPrice = basePrice + upgradeExtra
    }

    setFormData(prev => ({ ...prev, totalPrice: newTotalPrice }))
  }, [
    formData.lotId, formData.modelId, formData.facadeId, formData.deckId, 
    formData.apartmentId, formData.buildingId, formData.selectedOptions, 
    formData.selectedRenderType, // ✅ Agregado a las dependencias
    lots, models, facades, apartments, buildings, projectType, catalogConfig
  ])

  // 10. Cálculo financiero en tiempo real
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
        } else {
          balance -= principal
        }
        if (balance < 0) balance = 0

        const date = new Date(formData.startDate)
        date.setMonth(date.getMonth() + i)

        schedule.push({ 
          monthNumber: i, 
          date: date.toISOString(), 
          principal: Math.round(principal * 100) / 100, 
          interest: Math.round(interest * 100) / 100, 
          payment: Math.round(payment * 100) / 100, 
          balance: Math.round(balance * 100) / 100, 
          isBalloon: formData.balloonMonth === i 
        })
      }

      setPreviewData({ 
        ...formData, 
        financedAmount: financed, 
        monthlyPayment: schedule[0]?.payment || 0, 
        downPaymentPercentage: formData.totalPrice > 0 ? ((formData.downPayment / formData.totalPrice) * 100).toFixed(1) : 0, 
        schedule 
      })
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
      const payload = { ...formData, ...previewData }
      console.log('📤 [CRM] Sending payload to save:', payload)
      if (isEditing) {
        await onSave(quote._id, payload)
      } else {
        await onSave(null, payload)
      }
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
    if (projectType === '6town' && formData.buildingId) {
      const building = buildings.find(b => b._id === formData.buildingId)
      return building?.name || '6Town House'
    }
    if (formData.lotId) {
      const lot = lots.find(l => l._id === formData.lotId)
      const model = models.find(m => m._id === formData.modelId) || lot?.model
      const lotNumber = lot?.lot?.number || lot?.number || ''
      const modelName = (model && typeof model === 'object') ? (model.model || model.modelNumber) : ''
      return `Lote ${lotNumber} ${modelName ? `— ${modelName}` : ''}`
    }
    if (formData.apartmentId) {
      const apt = apartments.find(a => a._id === formData.apartmentId)
      const renderLabel = formData.selectedRenderType === 'upgrade' ? ' (Upgrade)' : ''
      return `Apto ${apt?.apartmentNumber || ''} ${apt?.floorNumber ? `(Piso ${apt.floorNumber})` : ''}${renderLabel}`
    }
    return 'No seleccionada'
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}>
      <DialogTitle sx={{ borderBottom: '1px solid #ececec', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoAwesome sx={{ fontSize: 20 }} />
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {isEditing ? t('editTitle', 'Editar Cotización') : t('createTitle', 'Nueva Cotización')}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={loading}><Close fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && <Alert severity="error" sx={{ m: 3, mb: 0, borderRadius: 0 }}>{error}</Alert>}
        
        <Box sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {STEPS.map(label => <Step key={label}><StepLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>{label}</StepLabel></Step>)}
          </Stepper>

          {/* PASO 1: Selección de Proyecto y Propiedad */}
          {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('form.lead')}</InputLabel>
                  <Select value={formData.leadId} onChange={(e) => handleChange('leadId', e.target.value)} label={t('form.lead')}>
                    <MenuItem value="">{t('none', 'Ninguno')}</MenuItem>
                    {leads.map(l => <MenuItem key={l._id} value={l._id}>{l.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('form.client')}</InputLabel>
                  <Select value={formData.clientId} onChange={(e) => handleChange('clientId', e.target.value)} label={t('form.client')}>
                    <MenuItem value="">{t('none', 'Ninguno')}</MenuItem>
                    {clients.map(c => <MenuItem key={c._id} value={c._id}>{c.firstName} {c.lastName}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontFamily: '"Courier New", monospace' }}>Selección de Propiedad</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('form.project')} *</InputLabel>
                  <Select value={formData.projectId} onChange={(e) => handleChange('projectId', e.target.value)} label={t('form.project')} disabled={loadingProperties}>
                    {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              {/* LAKEWOOD / PROPIEDADES */}
              {(projectType === 'lakewood' || projectType === 'property') && formData.projectId && lots.length > 0 && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t('form.lot', 'Lote')}</InputLabel>
                      <Select value={formData.lotId} onChange={(e) => handleChange('lotId', e.target.value)} label={t('form.lot', 'Lote')} disabled={loadingProperties}>
                        <MenuItem value="">{t('none', 'Ninguno')}</MenuItem>
                        {lots.map(l => {
                          const modelName = (l.model && typeof l.model === 'object') ? l.model.model : ''
                          return (
                            <MenuItem key={l._id} value={l._id}>
                              Lote {l.lot?.number || l.number || 'N/A'} {modelName ? `— ${modelName}` : ''}
                            </MenuItem>
                          )
                        })}
                      </Select>
                    </FormControl>
                  </Grid>

                  {formData.modelId && models.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{t('form.model', 'Modelo')}</InputLabel>
                        <Select value={formData.modelId} onChange={(e) => handleChange('modelId', e.target.value)} label={t('form.model', 'Modelo')} disabled>
                          {models.map(m => (
                            <MenuItem key={m._id} value={m._id}>
                              {m.model || m.name || `Model ${m.modelNumber}`}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {formData.modelId && availableFacades.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{t('form.facade', 'Fachada')}</InputLabel>
                        <Select value={formData.facadeId} onChange={(e) => { handleChange('facadeId', e.target.value); handleChange('deckId', '') }} label={t('form.facade', 'Fachada')}>
                          <MenuItem value="">{t('none', 'Ninguno')}</MenuItem>
                          {availableFacades.map(f => (
                            <MenuItem key={f._id} value={f._id}>
                              {f.title} {f.price > 0 ? `(+ $${f.price.toLocaleString()})` : ''}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {formData.facadeId && availableDecks.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{t('form.deck', 'Opción / Deck')}</InputLabel>
                        <Select value={formData.deckId} onChange={(e) => handleChange('deckId', e.target.value)} label={t('form.deck', 'Opción / Deck')}>
                          {availableDecks.map(d => (
                            <MenuItem key={d._id} value={d._id}>
                              {d.name} {d.price > 0 ? `(+ $${d.price.toLocaleString()})` : ''}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </>
              )}

              {/* 6TOWN */}
              {projectType === '6town' && formData.projectId && buildings.length > 0 && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Casa / Propiedad</InputLabel>
                    <Select value={formData.buildingId} onChange={(e) => handleChange('buildingId', e.target.value)} label="Casa / Propiedad" disabled={loadingProperties}>
                      <MenuItem value="">{t('none', 'Ninguno')}</MenuItem>
                      {buildings.map(b => {
                        const lotRef = typeof b.quoteRef?.lot === 'object' ? b.quoteRef.lot.number : b.quoteRef?.lot
                        return <MenuItem key={b._id} value={b._id}>{b.name} {lotRef ? `(Lote ${lotRef})` : ''}</MenuItem>
                      })}
                    </Select>
                  </FormControl>

                  {formData.buildingId && (() => {
                    const selectedBuilding = buildings.find(b => b._id === formData.buildingId)
                    const modelId = typeof selectedBuilding?.quoteRef?.model === 'object' ? selectedBuilding.quoteRef.model._id : selectedBuilding?.quoteRef?.model
                    const selectedModel = models.find(m => m._id === modelId)
                    if (!selectedModel?.floors) return null

                    return (
                      <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>Personalización de Pisos</Typography>
                        {selectedModel.floors.filter(f => f.isCustomizable).map((floor) => (
                          <Box key={floor.key} sx={{ mb: 2 }}>
                            <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block' }}>{floor.label}</Typography>
                            <FormControl fullWidth size="small">
                              <InputLabel>{floor.label}</InputLabel>
                              <Select
                                value={formData.selectedOptions?.[floor.key] || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, selectedOptions: { ...prev.selectedOptions, [floor.key]: e.target.value } }))}
                                label={floor.label}
                              >
                                {floor.options?.map(option => (
                                  <MenuItem key={option.key} value={option.key}>{option.label}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                        ))}
                      </Box>
                    )
                  })()}
                </Grid>
              )}

              {/* ✅ APARTAMENTOS: Edificios, Apartments y Tipo de Acabado */}
              {projectType === 'apartment' && formData.projectId && buildings.length > 0 && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t('form.building', 'Edificio')}</InputLabel>
                      <Select value={formData.buildingId} onChange={(e) => handleChange('buildingId', e.target.value)} label={t('form.building', 'Edificio')} disabled={loadingProperties}>
                        <MenuItem value="">{t('none', 'Ninguno')}</MenuItem>
                        {buildings.map(b => <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {formData.buildingId && apartments.length > 0 && (
                    <>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t('form.apartment', 'Apartamento')}</InputLabel>
                          <Select value={formData.apartmentId} onChange={(e) => handleChange('apartmentId', e.target.value)} label={t('form.apartment', 'Apartamento')}>
                            <MenuItem value="">{t('none', 'Ninguno')}</MenuItem>
                            {apartments.map(a => <MenuItem key={a._id} value={a._id}>Apto {a.apartmentNumber} {a.floorNumber ? `(Piso ${a.floorNumber})` : ''}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* ✅ SELECTOR DE TIPO DE ACABADO (RENDER TYPE) */}
                      {formData.apartmentId && (
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>{t('form.renderType', 'Tipo de Acabado')}</InputLabel>
                            <Select 
                              value={formData.selectedRenderType || 'basic'} 
                              onChange={(e) => handleChange('selectedRenderType', e.target.value)} 
                              label={t('form.renderType', 'Tipo de Acabado')}
                            >
                              <MenuItem value="basic">{t('renderTypes.basic', 'Básico')}</MenuItem>
                              <MenuItem value="upgrade">{t('renderTypes.upgrade', 'Upgrade / Premium')}</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                    </>
                  )}
                </>
              )}
              
              {formData.projectId && lots.length === 0 && buildings.length === 0 && apartments.length === 0 && !loadingProperties && (
                <Grid item xs={12}>
                  <Alert severity="info">Este proyecto no tiene propiedades disponibles configuradas aún.</Alert>
                </Grid>
              )}
            </Grid>
          )}

          {/* PASO 2: Configuración Financiera */}
          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
                  Propiedad seleccionada: <strong>{getPropertyName()}</strong>
                </Alert>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label={t('form.totalPrice')} type="number" fullWidth size="small" value={formData.totalPrice} onChange={(e) => handleChange('totalPrice', Number(e.target.value))} InputProps={{ startAdornment: <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>$</Typography> }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label={`${t('form.downPayment')} (${previewData?.downPaymentPercentage || 0}%)`} type="number" fullWidth size="small" value={formData.downPayment} onChange={(e) => handleChange('downPayment', Number(e.target.value))} InputProps={{ startAdornment: <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>$</Typography> }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label={t('form.interestRate')} type="number" fullWidth size="small" value={formData.interestRate} onChange={(e) => handleChange('interestRate', Number(e.target.value))} InputProps={{ endAdornment: <Typography variant="caption">%</Typography> }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label={t('form.termMonths')} type="number" fullWidth size="small" value={formData.termMonths} onChange={(e) => handleChange('termMonths', Number(e.target.value))} InputProps={{ endAdornment: <Typography variant="caption">meses</Typography> }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('form.amortizationMethod')}</InputLabel>
                  <Select value={formData.amortizationMethod} onChange={(e) => handleChange('amortizationMethod', e.target.value)} label={t('form.amortizationMethod')}>
                    <MenuItem value="fixed">{t('form.fixed', 'Cuota Fija')}</MenuItem>
                    <MenuItem value="declining">{t('form.declining', 'Cuota Decreciente')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {/* PASO 3: Vista Previa */}
          {activeStep === 2 && previewData && (
            <Box>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 3, border: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Resumen de la Cotización</Typography>
                <Typography variant="body2" color="text.secondary">Propiedad: {getPropertyName()}</Typography>
                <Typography variant="body2" color="text.secondary">Monto Financiado: <strong>${previewData.financedAmount?.toLocaleString()}</strong></Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  Cuota Mensual: ${previewData.monthlyPayment?.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </Typography>
              </Box>
              
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontFamily: '"Courier New", monospace' }}>Tabla de Amortización</Typography>
              <AmortizationTable schedule={previewData.schedule} />
              
              <TextField label={t('form.notes')} multiline rows={3} fullWidth size="small" sx={{ mt: 3 }} value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Términos, condiciones o notas adicionales..." />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #ececec', p: 2, gap: 1 }}>
        {activeStep > 0 && <Button onClick={handleBack} disabled={loading}>{t('back', 'Atrás')}</Button>}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} disabled={loading}>{t('cancel', 'Cancelar')}</Button>
        {activeStep < 2 ? (
          <Button variant="contained" onClick={handleNext} sx={{ borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace' }}>
            {t('next', 'Siguiente')}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSubmit} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : <AutoAwesome />} sx={{ borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace' }}>
            {loading ? t('saving', 'Guardando...') : (isEditing ? t('update', 'Actualizar') : t('create', 'Crear'))}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}