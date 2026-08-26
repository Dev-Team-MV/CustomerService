import { useState, useEffect, useMemo } from 'react'
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  TextField, Autocomplete, Box, Typography, Grid, FormControl, 
  InputLabel, Select, MenuItem, CircularProgress 
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useProjects } from '@shared/hooks/useProjects'
import { useResidents } from '@shared/hooks/useResidents'
import { getProjectById, getProjectBySlug } from '@shared/config/projectsConfig'
import api from '@shared/services/api'

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100

const calcMonthlyPayment = (principal, annualRate, years = 30) => {
  const P = Number(principal) || 0
  const r = (Number(annualRate) || 0) / 100 / 12
  const n = years * 12
  if (P <= 0) return ''
  if (r === 0) return String(round2(P / n))
  const factor = Math.pow(1 + r, n)
  return String(round2((P * r * factor) / (factor - 1)))
}

export default function LoanFormDialog({ open, onClose, onSave, initialData }) {
  const { t } = useTranslation('loans')
  const { t: tCommon } = useTranslation('common')
  const { projects } = useProjects()
  const { users: allUsers } = useResidents(null)

  const [formData, setFormData] = useState({
    buyer: null, coBuyer: null, buyerContactInfo: '', projectId: null,
    propertyId: null, apartmentId: null, propertyAddress: '', assignedTo: null,
    loanType: 'Conventional', purchasePrice: '', loanAmount: '',
    downPayment: '', downPaymentPercent: '', interestRate: '',
    estimatedMonthlyPayment: '', contractDate: '', estimatedClosingDate: '',
    lender: '', loanOfficer: '', loanOfficerContact: '', processor: '',
    underwriter: '', titleCompany: '', insuranceCompany: '',
    appraisalCompany: '', pipelineStage: 'new_loan_buyer_added',
    specialStatus: '', internalNotes: ''
  })

  const [availableResources, setAvailableResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(false)

  const selectedProjectConfig = useMemo(() => {
    if (!formData.projectId) return null
    const proj = projects.find(p => p._id === formData.projectId)
    if (!proj) return null
    return getProjectById(proj._id) || getProjectBySlug(proj.slug)
  }, [formData.projectId, projects])

  const filteredUsers = useMemo(() => {
    if (!formData.projectId) return allUsers || []
    return (allUsers || []).filter(u => 
      u.projects?.some(p => p._id === formData.projectId) || 
      u.projectMemberships?.some(m => m.project?._id === formData.projectId || m.project === formData.projectId)
    )
  }, [formData.projectId, allUsers])

  useEffect(() => {
    const fetchResources = async () => {
      if (!formData.projectId || !selectedProjectConfig) {
        setAvailableResources([])
        return
      }
      setLoadingResources(true)
      try {
        const isProperty = selectedProjectConfig.resourceType === 'property' || selectedProjectConfig.catalogType === 'houses'
        const endpoint = isProperty ? '/properties' : '/apartments'
        const res = await api.get(endpoint, { params: { projectId: formData.projectId } })
        const resources = Array.isArray(res.data) ? res.data : (res.data.properties || res.data.apartments || res.data.data || [])
        setAvailableResources(resources)
      } catch (err) {
        console.error('Error fetching resources for loan:', err)
        setAvailableResources([])
      } finally {
        setLoadingResources(false)
      }
    }
    fetchResources()
  }, [formData.projectId, selectedProjectConfig])

  const filteredResources = useMemo(() => {
    if (!formData.buyer) return availableResources
    return availableResources.filter(resource => {
      if (Array.isArray(resource.users)) {
        return resource.users.some(u => (u._id || u) === formData.buyer)
      }
      if (resource.client && (resource.client._id || resource.client) === formData.buyer) {
        return true
      }
      return false
    })
  }, [formData.buyer, availableResources])

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(prev => ({ ...prev, ...initialData }))
      } else {
        setFormData({
          buyer: null, coBuyer: null, buyerContactInfo: '', projectId: null, propertyId: null, apartmentId: null,
          propertyAddress: '', assignedTo: null, loanType: 'Conventional', purchasePrice: '',
          loanAmount: '', downPayment: '', downPaymentPercent: '', interestRate: '',
          estimatedMonthlyPayment: '', contractDate: '', estimatedClosingDate: '', lender: '',
          loanOfficer: '', loanOfficerContact: '', processor: '', underwriter: '', titleCompany: '',
          insuranceCompany: '', appraisalCompany: '', pipelineStage: 'new_loan_buyer_added',
          specialStatus: '', internalNotes: ''
        })
        setAvailableResources([])
      }
    }
  }, [open, initialData])

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleResourceChange = (value) => {
    const isProperty = selectedProjectConfig?.resourceType === 'property' || selectedProjectConfig?.catalogType === 'houses'
    if (isProperty) {
      setFormData(prev => ({ ...prev, propertyId: value, apartmentId: null }))
    } else {
      setFormData(prev => ({ ...prev, apartmentId: value, propertyId: null }))
    }
  }

  const getSelectedResourceId = () => {
    const isProperty = selectedProjectConfig?.resourceType === 'property' || selectedProjectConfig?.catalogType === 'houses'
    return isProperty ? formData.propertyId : formData.apartmentId
  }

  const handleFinancialChange = (field) => (e) => {
    const rawValue = e.target.value
    setFormData(prev => {
      const next = { ...prev, [field]: rawValue }
      const pp = Number(next.purchasePrice) || 0

      if (field === 'purchasePrice') {
        const percent = Number(next.downPaymentPercent) || 0
        const amount = Number(next.downPayment) || 0
        if (percent > 0) {
          next.downPayment = pp > 0 ? String(round2((pp * percent) / 100)) : ''
        } else if (amount > 0 && pp > 0) {
          next.downPaymentPercent = String(round2((amount / pp) * 100))
        }
      } else if (field === 'downPaymentPercent') {
        const percent = Number(rawValue) || 0
        next.downPayment = pp > 0 ? String(round2((pp * percent) / 100)) : ''
      } else if (field === 'downPayment') {
        const amount = Number(rawValue) || 0
        next.downPaymentPercent = pp > 0 ? String(round2((amount / pp) * 100)) : ''
      }

      const newPP = Number(next.purchasePrice) || 0
      const newDP = Number(next.downPayment) || 0
      if (field !== 'loanAmount' && newPP > 0) {
        next.loanAmount = String(Math.max(newPP - newDP, 0))
      }

      if (['loanAmount', 'interestRate', 'purchasePrice', 'downPayment', 'downPaymentPercent'].includes(field)) {
        const principal = Number(next.loanAmount) || 0
        const rate = Number(next.interestRate) || 0
        next.estimatedMonthlyPayment = principal > 0 ? calcMonthlyPayment(principal, rate) : ''
      }

      return next
    })
  }

  const handleSave = () => {
    const isProperty = selectedProjectConfig?.resourceType === 'property' || selectedProjectConfig?.catalogType === 'houses'
    
    const payload = {
      buyer: formData.buyer || null,
      coBuyer: formData.coBuyer || null,
      buyerContactInfo: formData.buyerContactInfo || null,
      projectId: formData.projectId || null,
      ...(isProperty && formData.propertyId ? { propertyId: formData.propertyId } : {}),
      ...(!isProperty && formData.apartmentId ? { apartmentId: formData.apartmentId } : {}),
      propertyAddress: formData.propertyAddress || null,
      assignedTo: formData.assignedTo || null,
      loanType: formData.loanType,
      purchasePrice: Number(formData.purchasePrice) || 0,
      loanAmount: Number(formData.loanAmount) || 0,
      downPayment: Number(formData.downPayment) || 0,
      downPaymentPercent: Number(formData.downPaymentPercent) || 0,
      interestRate: Number(formData.interestRate) || 0,
      estimatedMonthlyPayment: Number(formData.estimatedMonthlyPayment) || 0,
      contractDate: formData.contractDate || null,
      estimatedClosingDate: formData.estimatedClosingDate || null,
      lender: formData.lender || null,
      loanOfficer: formData.loanOfficer || null,
      loanOfficerContact: formData.loanOfficerContact || null,
      processor: formData.processor || null,
      underwriter: formData.underwriter || null,
      titleCompany: formData.titleCompany || null,
      insuranceCompany: formData.insuranceCompany || null,
      appraisalCompany: formData.appraisalCompany || null,
      pipelineStage: formData.pipelineStage,
      specialStatus: formData.specialStatus || null,
      internalNotes: formData.internalNotes || null
    }
    onSave(payload)
  }

  const inputSx = { 
    fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0,
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }, 
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem' },
    '& .MuiInputBase-input::placeholder': { fontFamily: '"Courier New", monospace', opacity: 1 },
    '& .MuiFormHelperText-root': { fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#8CA551' }
  }

  const unifiedButtonSx = { 
    borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '4px 4px 0px rgba(0,0,0,0.1)' } 
  }

  const getUserById = (id) => filteredUsers.find(u => u._id === id) || (typeof id === 'object' ? id : null)
  const getProjectByIdLocal = (id) => projects.find(p => p._id === id) || (typeof id === 'object' ? id : null)
  const getResourceById = (id) => availableResources.find(r => r._id === id) || (typeof id === 'object' ? id : null)

  const loanTypeOptions = [
    { value: 'Conventional', label: t('loans.form.loanTypes.conventional') },
    { value: 'FHA', label: t('loans.form.loanTypes.fha') },
    { value: 'VA', label: t('loans.form.loanTypes.va') },
    { value: 'USDA', label: t('loans.form.loanTypes.usda') },
    { value: 'Jumbo', label: t('loans.form.loanTypes.jumbo') },
    { value: 'Other', label: t('loans.form.loanTypes.other') },
  ]

  const isProperty = selectedProjectConfig?.resourceType === 'property' || selectedProjectConfig?.catalogType === 'houses'
  const resourceLabel = isProperty ? t('loans.form.fields.property') : t('loans.form.fields.apartment')
  const selectedResourceId = getSelectedResourceId()
  const hasResource = !!selectedResourceId

  const ppNum = Number(formData.purchasePrice) || 0
  const dpNum = Number(formData.downPayment) || 0
  const dpPercentNum = Number(formData.downPaymentPercent) || 0

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 0 } }}>
      <DialogTitle sx={{ fontWeight: 700, fontFamily: '"Courier New", monospace', letterSpacing: '0.5px', borderBottom: '1px solid #e0e0e0' }}>
        {initialData ? t('loans.form.edit') : t('loans.form.create')}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, maxHeight: '70vh', overflowY: 'auto' }}>
        <Grid container spacing={2} sx={{mt:1}}>
          
          {/* --- SECCIÓN 1: PROYECTO --- */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#004535', fontFamily: '"Courier New", monospace', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              {t('loans.form.sections.projectSelection', '1. Project Selection')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete 
              options={projects || []} 
              getOptionLabel={(opt) => opt.name || ''} 
              isOptionEqualToValue={(option, value) => option._id === value?._id || option._id === value} 
              value={getProjectByIdLocal(formData.projectId)} 
              onChange={(e, v) => {
                setFormData(prev => ({ 
                  ...prev, projectId: v ? v._id : null, 
                  buyer: null, coBuyer: null, assignedTo: null, 
                  propertyId: null, apartmentId: null 
                }))
              }} 
              renderInput={(params) => <TextField {...params} label={t('loans.form.fields.project')} required size="small" sx={inputSx} />} 
            />
          </Grid>

          {/* --- SECCIÓN 2: PERSONAS --- */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#004535', fontFamily: '"Courier New", monospace', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              {t('loans.form.sections.partiesInvolved', '2. Parties Involved')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete 
              options={filteredUsers} 
              getOptionLabel={(opt) => `${opt.firstName} ${opt.lastName} (${opt.email})`} 
              isOptionEqualToValue={(option, value) => option._id === value?._id || option._id === value} 
              value={getUserById(formData.buyer)} 
              onChange={(e, v) => {
                setFormData(prev => ({ ...prev, buyer: v ? v._id : null, propertyId: null, apartmentId: null }))
              }}
              renderInput={(params) => <TextField {...params} label={t('loans.form.fields.buyer')} required size="small" sx={inputSx} />} 
              disabled={!formData.projectId}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete 
              options={filteredUsers} 
              getOptionLabel={(opt) => `${opt.firstName} ${opt.lastName} (${opt.email})`} 
              isOptionEqualToValue={(option, value) => option._id === value?._id || option._id === value} 
              value={getUserById(formData.coBuyer)} 
              onChange={(e, v) => setFormData(prev => ({ ...prev, coBuyer: v ? v._id : null }))} 
              renderInput={(params) => <TextField {...params} label={t('loans.form.fields.coBuyer')} size="small" sx={inputSx} />} 
              disabled={!formData.projectId}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label={t('loans.form.fields.buyerContactInfo')} size="small" fullWidth value={formData.buyerContactInfo} onChange={handleChange('buyerContactInfo')} sx={inputSx} disabled={!formData.projectId} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete 
              options={filteredUsers} 
              getOptionLabel={(opt) => `${opt.firstName} ${opt.lastName}`} 
              isOptionEqualToValue={(option, value) => option._id === value?._id || option._id === value} 
              value={getUserById(formData.assignedTo)} 
              onChange={(e, v) => setFormData(prev => ({ ...prev, assignedTo: v ? v._id : null }))} 
              renderInput={(params) => <TextField {...params} label={t('loans.form.fields.assignedTo')} size="small" sx={inputSx} />} 
              disabled={!formData.projectId}
            />
          </Grid>

          {/* --- SECCIÓN 3: RECURSO --- */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#004535', fontFamily: '"Courier New", monospace', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              {t('loans.form.sections.resourceDetails', '3. {{resource}} Details', { resource: resourceLabel })}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            {loadingResources ? (
              <Box sx={{ display: 'flex', alignItems: 'center', height: 40, px: 2 }}>
                <CircularProgress size={20} sx={{ color: '#004535', mr: 1 }} />
                <Typography variant="caption" sx={{ fontFamily: '"Courier New", monospace' }}>
                  {t('loans.form.loadingResources', 'Loading {{resource}}s...', { resource: resourceLabel.toLowerCase() })}
                </Typography>
              </Box>
            ) : (
              <Autocomplete 
                options={filteredResources} 
                getOptionLabel={(opt) => {
                  if (!opt) return ''
                  if (!isProperty) {
                    return `${t('loans.form.fields.apt', 'Apt')} ${opt.apartmentNumber || 'N/A'} ${opt.floorNumber ? `(${t('loans.form.fields.floor', 'Floor')} ${opt.floorNumber})` : ''}`
                  }
                  const lotNum = opt.lot?.number || opt.lot || 'N/A'
                  const modelName = opt.model?.model || opt.model?.name || ''
                  return `${t('loans.form.fields.lot', 'Lot')} ${lotNum} ${modelName ? `- ${modelName}` : ''}`
                }} 
                isOptionEqualToValue={(option, value) => option._id === value?._id || option._id === value} 
                value={getResourceById(selectedResourceId)} 
                onChange={(e, v) => handleResourceChange(v ? v._id : null)} 
                renderInput={(params) => <TextField {...params} label={`${resourceLabel} *`} required size="small" sx={inputSx} />} 
                disabled={!formData.projectId || !formData.buyer}
              />
            )}
            {!formData.buyer && formData.projectId && (
              <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block', fontFamily: '"Courier New", monospace' }}>
                * {t('loans.form.selectBuyerFirst', 'Select a Buyer first to see their {{resource}}s', { resource: resourceLabel.toLowerCase() })}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label={t('loans.form.fields.propertyAddress')} size="small" fullWidth value={formData.propertyAddress} onChange={handleChange('propertyAddress')} sx={inputSx} />
          </Grid>

          {/* --- SECCIÓN 4: DETALLES FINANCIEROS --- */}
          <Grid item xs={12} sx={{ mt: 1 }}><hr style={{ border: '0', borderTop: '1px dashed #ccc' }} /></Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#004535', fontFamily: '"Courier New", monospace', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              {t('loans.form.sections.financialDetails')} <span style={{ color: '#8CA551', textTransform: 'none' }}>({t('loans.form.autoCalculated', 'auto-calculated')})</span>
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small" sx={inputSx}>
              <InputLabel>{t('loans.form.fields.loanType')}</InputLabel>
              <Select value={formData.loanType} label={t('loans.form.fields.loanType')} onChange={handleChange('loanType')}>
                {loanTypeOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField 
              label={t('loans.form.fields.purchasePrice')} type="number" size="small" fullWidth 
              value={formData.purchasePrice} onChange={handleFinancialChange('purchasePrice')} 
              sx={inputSx} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#706f6f' }}>$</Typography> }} 
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField 
              label={t('loans.form.fields.downPaymentPercent')} type="number" size="small" fullWidth 
              value={formData.downPaymentPercent} onChange={handleFinancialChange('downPaymentPercent')} 
              sx={inputSx} InputProps={{ endAdornment: <Typography sx={{ ml: 1, color: '#706f6f' }}>%</Typography> }} 
              helperText={ppNum > 0 && dpPercentNum > 0 ? `= $${round2((ppNum * dpPercentNum) / 100).toLocaleString()}` : ' '}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField 
              label={t('loans.form.fields.downPayment')} type="number" size="small" fullWidth 
              value={formData.downPayment} onChange={handleFinancialChange('downPayment')} 
              sx={inputSx} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#706f6f' }}>$</Typography> }} 
              helperText={ppNum > 0 && dpNum > 0 ? `= ${round2((dpNum / ppNum) * 100)}% of price` : ' '}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField 
              label={t('loans.form.fields.loanAmount')} type="number" size="small" fullWidth required 
              value={formData.loanAmount} onChange={handleFinancialChange('loanAmount')} 
              sx={inputSx} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#706f6f' }}>$</Typography> }} 
              helperText={ppNum > 0 ? t('loans.form.autoPriceMinusDown', 'Auto: Price − Down Payment') : ' '}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField 
              label={t('loans.form.fields.interestRate')} type="number" size="small" fullWidth 
              value={formData.interestRate} onChange={handleFinancialChange('interestRate')} 
              sx={inputSx} InputProps={{ endAdornment: <Typography sx={{ ml: 1, color: '#706f6f' }}>%</Typography> }} 
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField 
              label={t('loans.form.fields.estimatedMonthlyPayment')} type="number" size="small" fullWidth 
              value={formData.estimatedMonthlyPayment} onChange={handleFinancialChange('estimatedMonthlyPayment')} 
              sx={inputSx} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#706f6f' }}>$</Typography> }} 
              helperText={Number(formData.loanAmount) > 0 ? t('loans.form.auto30yr', 'Auto: 30-yr fixed (P&I)') : ' '}
            />
          </Grid>

          {/* --- SECCIÓN 5: FECHAS Y COMPAÑÍAS --- */}
          <Grid item xs={12} sx={{ mt: 1 }}><hr style={{ border: '0', borderTop: '1px dashed #ccc' }} /></Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#004535', fontFamily: '"Courier New", monospace', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              {t('loans.form.sections.datesCompanies')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label={t('loans.form.fields.contractDate')} type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} value={formData.contractDate} onChange={handleChange('contractDate')} sx={inputSx} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label={t('loans.form.fields.estimatedClosingDate')} type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} value={formData.estimatedClosingDate} onChange={handleChange('estimatedClosingDate')} sx={inputSx} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label={t('loans.form.fields.lender')} size="small" fullWidth value={formData.lender} onChange={handleChange('lender')} sx={inputSx} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label={t('loans.form.fields.titleCompany')} size="small" fullWidth value={formData.titleCompany} onChange={handleChange('titleCompany')} sx={inputSx} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label={t('loans.form.fields.insuranceCompany')} size="small" fullWidth value={formData.insuranceCompany} onChange={handleChange('insuranceCompany')} sx={inputSx} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label={t('loans.form.fields.appraisalCompany')} size="small" fullWidth value={formData.appraisalCompany} onChange={handleChange('appraisalCompany')} sx={inputSx} />
          </Grid>

          {/* --- SECCIÓN 6: CONTACTOS, ESTADO Y NOTAS --- */}
          <Grid item xs={12} sx={{ mt: 1 }}><hr style={{ border: '0', borderTop: '1px dashed #ccc' }} /></Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#004535', fontFamily: '"Courier New", monospace', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              {t('loans.form.sections.contactsStatusNotes')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label={t('loans.form.fields.loanOfficer')} size="small" fullWidth value={formData.loanOfficer} onChange={handleChange('loanOfficer')} sx={inputSx} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label={t('loans.form.fields.loanOfficerContact')} size="small" fullWidth value={formData.loanOfficerContact} onChange={handleChange('loanOfficerContact')} sx={inputSx} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label={t('loans.form.fields.processor')} size="small" fullWidth value={formData.processor} onChange={handleChange('processor')} sx={inputSx} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label={t('loans.form.fields.underwriter')} size="small" fullWidth value={formData.underwriter} onChange={handleChange('underwriter')} sx={inputSx} />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small" sx={inputSx}>
              <InputLabel>{t('loans.form.fields.pipelineStage')}</InputLabel>
              <Select value={formData.pipelineStage} label={t('loans.form.fields.pipelineStage')} onChange={handleChange('pipelineStage')}>
                <MenuItem value="new_loan_buyer_added">{t('loans.pipelineStages.new_loan_buyer_added')}</MenuItem>
                <MenuItem value="loan_application_started">{t('loans.pipelineStages.loan_application_started')}</MenuItem>
                <MenuItem value="loan_application_completed">{t('loans.pipelineStages.loan_application_completed')}</MenuItem>
                <MenuItem value="pre_qualified">{t('loans.pipelineStages.pre_qualified')}</MenuItem>
                <MenuItem value="pre_approved">{t('loans.pipelineStages.pre_approved')}</MenuItem>
                <MenuItem value="processing">{t('loans.pipelineStages.processing')}</MenuItem>
                <MenuItem value="documents_received">{t('loans.pipelineStages.documents_received')}</MenuItem>
                <MenuItem value="submitted_to_underwriting">{t('loans.pipelineStages.submitted_to_underwriting')}</MenuItem>
                <MenuItem value="underwriting_review">{t('loans.pipelineStages.underwriting_review')}</MenuItem>
                <MenuItem value="conditional_approval">{t('loans.pipelineStages.conditional_approval')}</MenuItem>
                <MenuItem value="clear_to_close">{t('loans.pipelineStages.clear_to_close')}</MenuItem>
                <MenuItem value="closing_scheduled">{t('loans.pipelineStages.closing_scheduled')}</MenuItem>
                <MenuItem value="closing_documents_signed">{t('loans.pipelineStages.closing_documents_signed')}</MenuItem>
                <MenuItem value="loan_funded">{t('loans.pipelineStages.loan_funded')}</MenuItem>
                <MenuItem value="completed">{t('loans.pipelineStages.completed')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small" sx={inputSx}>
              <InputLabel>{t('loans.form.fields.specialStatus')}</InputLabel>
              <Select value={formData.specialStatus} label={t('loans.form.fields.specialStatus')} onChange={handleChange('specialStatus')}>
                <MenuItem value=""><em>{t('loans.common.none')}</em></MenuItem>
                <MenuItem value="on_hold">{t('loans.specialStatuses.on_hold')}</MenuItem>
                <MenuItem value="missing_documents">{t('loans.specialStatuses.missing_documents')}</MenuItem>
                <MenuItem value="buyer_action_required">{t('loans.specialStatuses.buyer_action_required')}</MenuItem>
                <MenuItem value="financing_issue">{t('loans.specialStatuses.financing_issue')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label={t('loans.form.fields.internalNotes')} size="small" fullWidth multiline rows={2} value={formData.internalNotes} onChange={handleChange('internalNotes')} sx={inputSx} />
          </Grid>

        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
        <Button onClick={onClose} sx={{ ...unifiedButtonSx, color: '#000', border: '1px solid #000', '&:hover': { bgcolor: '#f5f5f5' } }}>
          {tCommon('actions.cancel', 'Cancel')}
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={!formData.projectId || !formData.buyer || !hasResource || !formData.loanAmount}
          sx={{ ...unifiedButtonSx, color: '#fff'}}
        >
          {t('loans.form.saveButton')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}