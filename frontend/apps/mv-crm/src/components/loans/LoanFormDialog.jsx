import { useState, useEffect, useMemo } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Grid, Typography,
  Autocomplete, CircularProgress, FormControl, InputLabel, Select, Box, IconButton
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { LOAN_TYPES } from '../../services/loanService'
import api from '@shared/services/api'
import { useProjects } from '@shared/hooks/useProjects'
import { getProjectById, getProjectBySlug } from '@shared/config/projectsConfig'

// ===== Helpers =====
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

const userLabel = (u) => {
  if (!u) return ''
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || ''
}

export default function LoanFormDialog({ open, onClose, onSubmit, loan = null }) {
  const { t } = useTranslation('loans')
  const { t: tCommon } = useTranslation('common')
  const isEdit = Boolean(loan)
  const { projects, loading: loadingProjects } = useProjects()

  // ===== State =====
  const [form, setForm] = useState({
    buyer: null, coBuyer: null, buyerContactInfo: '',
    projectId: '', propertyId: '', apartmentId: '', propertyAddress: '',
    assignedTo: null,
    purchasePrice: '', loanAmount: '', downPayment: '', downPaymentPercent: '',
    loanType: 'Conventional', interestRate: '', estimatedMonthlyPayment: '',
    contractDate: '', estimatedClosingDate: '',
    lender: '', loanOfficer: '', loanOfficerContact: '',
    processor: '', underwriter: '',
    titleCompany: '', insuranceCompany: '', appraisalCompany: '',
    pipelineStage: 'new_loan_buyer_added', specialStatus: '', internalNotes: ''
  })

  const [users, setUsers] = useState([])
  const [resources, setResources] = useState([]) // propiedades o apartamentos
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingResources, setLoadingResources] = useState(false)
  const [saving, setSaving] = useState(false)

  // ===== Configuración del proyecto =====
  const selectedProjectConfig = useMemo(() => {
    if (!form.projectId) return null
    const proj = projects.find(p => p._id === form.projectId)
    if (!proj) return null
    return getProjectById(proj._id) || getProjectBySlug(proj.slug)
  }, [form.projectId, projects])

  const isApartmentProject = selectedProjectConfig?.resourceType === 'apartment'
  const resourceLabel = isApartmentProject
    ? t('loans.form.fields.apartment', 'Apartment')
    : t('loans.form.fields.property', 'Property')

  // ===== Init form when dialog opens =====
  useEffect(() => {
    if (!open) return

    if (loan) {
      setForm({
        buyer: loan.buyer || null,
        coBuyer: loan.coBuyer || null,
        buyerContactInfo: loan.buyerContactInfo || '',
        projectId: loan.projectId?._id || loan.projectId || '',
        propertyId: loan.propertyId?._id || loan.propertyId || '',
        apartmentId: loan.apartmentId?._id || loan.apartmentId || '',
        propertyAddress: loan.propertyAddress || '',
        assignedTo: loan.assignedTo || null,
        purchasePrice: loan.purchasePrice || '',
        loanAmount: loan.loanAmount || '',
        downPayment: loan.downPayment || '',
        downPaymentPercent: loan.downPaymentPercent || '',
        loanType: loan.loanType || 'Conventional',
        interestRate: loan.interestRate || '',
        estimatedMonthlyPayment: loan.estimatedMonthlyPayment || '',
        contractDate: loan.contractDate ? new Date(loan.contractDate).toISOString().split('T')[0] : '',
        estimatedClosingDate: loan.estimatedClosingDate ? new Date(loan.estimatedClosingDate).toISOString().split('T')[0] : '',
        lender: loan.lender || '',
        loanOfficer: loan.loanOfficer || '',
        loanOfficerContact: loan.loanOfficerContact || '',
        processor: loan.processor || '',
        underwriter: loan.underwriter || '',
        titleCompany: loan.titleCompany || '',
        insuranceCompany: loan.insuranceCompany || '',
        appraisalCompany: loan.appraisalCompany || '',
        pipelineStage: loan.pipelineStage || 'new_loan_buyer_added',
        specialStatus: loan.specialStatus || '',
        internalNotes: loan.internalNotes || ''
      })
    } else {
      setForm({
        buyer: null, coBuyer: null, buyerContactInfo: '',
        projectId: '', propertyId: '', apartmentId: '', propertyAddress: '',
        assignedTo: null,
        purchasePrice: '', loanAmount: '', downPayment: '', downPaymentPercent: '',
        loanType: 'Conventional', interestRate: '', estimatedMonthlyPayment: '',
        contractDate: '', estimatedClosingDate: '',
        lender: '', loanOfficer: '', loanOfficerContact: '',
        processor: '', underwriter: '',
        titleCompany: '', insuranceCompany: '', appraisalCompany: '',
        pipelineStage: 'new_loan_buyer_added', specialStatus: '', internalNotes: ''
      })
    }
    fetchUsers()
  }, [open, loan])

  // ===== Fetch users (una sola vez al abrir) =====
  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await api.get('/users')
      setUsers(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  // ===== Fetch resources (properties/apartments) cuando cambia el proyecto =====
  useEffect(() => {
    if (!form.projectId || !selectedProjectConfig) {
      setResources([])
      return
    }
    const fetchResources = async () => {
      setLoadingResources(true)
      try {
        const endpoint = isApartmentProject ? '/apartments' : '/properties'
        const res = await api.get(endpoint, { params: { projectId: form.projectId } })
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data.properties || res.data.apartments || res.data.data || [])
        setResources(data)
      } catch (err) {
        console.error('Failed to fetch resources:', err)
        setResources([])
      } finally {
        setLoadingResources(false)
      }
    }
    fetchResources()
  }, [form.projectId, selectedProjectConfig, isApartmentProject])

  // ===== Usuarios filtrados por proyecto =====
  const filteredUsers = useMemo(() => {
    const base = users.filter(u => u.role === 'user')
    if (!form.projectId) return base
    return base.filter(u =>
      u.projectMemberships?.some(m => (m.project?._id || m.project) === form.projectId) ||
      u.projects?.some(p => (p._id || p) === form.projectId)
    )
  }, [users, form.projectId])

  // ===== Recursos filtrados por buyer =====
  const filteredResources = useMemo(() => {
    if (!form.buyer) return resources
    const buyerId = typeof form.buyer === 'object' ? form.buyer._id : form.buyer
    return resources.filter(r => {
      if (Array.isArray(r.users)) {
        return r.users.some(u => (u._id || u) === buyerId)
      }
      if (r.client && (r.client._id || r.client) === buyerId) return true
      return false
    })
  }, [resources, form.buyer])

  // ===== Handlers =====
  const change = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleProjectChange = (projectId) => {
    setForm(prev => ({
      ...prev,
      projectId,
      propertyId: '', apartmentId: '',
      propertyAddress: '', purchasePrice: '', loanAmount: '',
      downPayment: '', downPaymentPercent: '',
      buyer: null, coBuyer: null
    }))
  }

  const handleBuyerChange = (_, val) => {
    setForm(prev => ({
      ...prev,
      buyer: val,
      propertyId: '', apartmentId: ''
    }))
  }

  const handleResourceChange = (resourceId) => {
    const resource = resources.find(r => r._id === resourceId)
    const updates = {
      propertyId: isApartmentProject ? '' : resourceId,
      apartmentId: isApartmentProject ? resourceId : ''
    }
    if (resource) {
      if (isApartmentProject) {
        const aptNum = resource.apartmentNumber || '-'
        const floor = resource.floorNumber || ''
        const modelName = resource.apartmentModel?.name || resource.apartmentModel?.modelNumber || ''
        const buildingName = resource.building?.name || ''
        const parts = [`Apt ${aptNum}`]
        if (floor) parts.push(`Floor ${floor}`)
        if (buildingName) parts.push(buildingName)
        if (modelName) parts.push(modelName)
        updates.propertyAddress = parts.join(' — ')
        if (resource.price) updates.purchasePrice = resource.price
      } else {
        const lotNum = resource.lot?.number || '-'
        const modelName = resource.model?.name || resource.model?.model || ''
        updates.propertyAddress = [
          `Lot ${lotNum}`,
          modelName,
        ].filter(Boolean).join(' — ')
        if (resource.price) updates.purchasePrice = resource.price
      }
    }
    setForm(prev => ({ ...prev, ...updates }))
  }

  // ===== Cálculos financieros bidireccionales =====
  const handleFinancialChange = (field) => (e) => {
    const rawValue = e.target.value
    setForm(prev => {
      const next = { ...prev, [field]: rawValue }
      const pp = Number(next.purchasePrice) || 0

      // 1️⃣ Sincronización downPayment <-> downPaymentPercent
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

      // 2️⃣ Auto loanAmount = purchasePrice - downPayment
      const newPP = Number(next.purchasePrice) || 0
      const newDP = Number(next.downPayment) || 0
      if (field !== 'loanAmount' && newPP > 0) {
        next.loanAmount = String(Math.max(newPP - newDP, 0))
      }

      // 3️⃣ Auto estimatedMonthlyPayment (30 años fijos P&I)
      if (['loanAmount', 'interestRate', 'purchasePrice', 'downPayment', 'downPaymentPercent'].includes(field)) {
        const principal = Number(next.loanAmount) || 0
        const rate = Number(next.interestRate) || 0
        next.estimatedMonthlyPayment = principal > 0 ? calcMonthlyPayment(principal, rate) : ''
      }

      return next
    })
  }

  // ===== Submit =====
  const handleSubmit = async () => {
    if (!form.buyer || !form.projectId) return
    setSaving(true)
    try {
      const toId = (v) => v ? (typeof v === 'object' ? v._id : v) : null
      const activeResourceId = isApartmentProject ? form.apartmentId : form.propertyId

      const data = {
        buyer: toId(form.buyer),
        coBuyer: toId(form.coBuyer),
        assignedTo: toId(form.assignedTo),
        buyerContactInfo: form.buyerContactInfo || null,
        projectId: form.projectId,
        propertyAddress: form.propertyAddress || null,
        ...(isApartmentProject
          ? { apartmentId: activeResourceId || null }
          : { propertyId: activeResourceId || null }),
        loanType: form.loanType || 'Conventional',
        purchasePrice: Number(form.purchasePrice) || 0,
        loanAmount: Number(form.loanAmount) || 0,
        downPayment: Number(form.downPayment) || 0,
        downPaymentPercent: Number(form.downPaymentPercent) || 0,
        interestRate: Number(form.interestRate) || 0,
        estimatedMonthlyPayment: Number(form.estimatedMonthlyPayment) || 0,
        contractDate: form.contractDate || null,
        estimatedClosingDate: form.estimatedClosingDate || null,
        lender: form.lender || null,
        loanOfficer: form.loanOfficer || null,
        loanOfficerContact: form.loanOfficerContact || null,
        processor: form.processor || null,
        underwriter: form.underwriter || null,
        titleCompany: form.titleCompany || null,
        insuranceCompany: form.insuranceCompany || null,
        appraisalCompany: form.appraisalCompany || null,
        pipelineStage: form.pipelineStage || 'new_loan_buyer_added',
        specialStatus: form.specialStatus || null,
        internalNotes: form.internalNotes || null
      }

      await onSubmit(data)
      onClose()
    } catch (err) {
      console.error('Failed to save loan:', err)
    } finally {
      setSaving(false)
    }
  }

  // ===== Helpers de visual =====
  const getSelectedResource = () => {
    const id = isApartmentProject ? form.apartmentId : form.propertyId
    return resources.find(r => r._id === id) || null
  }

  const resourceOptionLabel = (opt) => {
    if (!opt) return ''
    if (isApartmentProject) {
      const apt = opt.apartmentNumber || '-'
      const floor = opt.floorNumber
      const model = opt.apartmentModel?.name || opt.apartmentModel?.modelNumber || ''
      return `Apt ${apt}${floor ? ` (Floor ${floor})` : ''}${model ? ` — ${model}` : ''}`
    }
    const lot = opt.lot?.number || '-'
    const model = opt.model?.name || opt.model?.model || ''
    return `Lot ${lot}${model ? ` — ${model}` : ''}${opt.price ? ` — $${opt.price.toLocaleString()}` : ''}`
  }

  // ===== Styles =====
  const inputSx = {
    fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0,
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem' },
    '& .MuiInputBase-input::placeholder': { fontFamily: '"Courier New", monospace', opacity: 1 },
    '& .MuiFormHelperText-root': { fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#8CA551' }
  }
  const selectSx = {
    fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0,
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiSelect-select': { fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem' }
  }
  const sectionTitleSx = {
    fontWeight: 700, mb: 1.5, color: '#004535',
    fontFamily: '"Courier New", monospace', textTransform: 'uppercase',
    fontSize: '0.7rem', letterSpacing: '1.5px'
  }
  const dividerSx = {
    my: 2, border: 'none', borderTop: '1px dashed #d0d0d0'
  }
  const unifiedButtonSx = {
    borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace',
    fontSize: '0.75rem', letterSpacing: '0.5px',
    '&:hover': { boxShadow: '4px 4px 0px rgba(0,0,0,0.1)' }
  }

  // ===== Valores para helper texts =====
  const ppNum = Number(form.purchasePrice) || 0
  const dpNum = Number(form.downPayment) || 0
  const dpPercentNum = Number(form.downPaymentPercent) || 0
  const hasResource = !!(isApartmentProject ? form.apartmentId : form.propertyId)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ececec', p: 3, bgcolor: '#f5f7f1' }}>
        <Typography variant="h6" sx={{ fontFamily: '"Courier New", monospace', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 700 }}>
          {isEdit ? t('loans.form.edit') : t('loans.form.create')}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ borderRadius: 0 }}><Close /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2}>

          {/* ============ SECCIÓN 1: PROJECT ============ */}
          <Grid item xs={12}>
            <Typography sx={sectionTitleSx}>1. {t('loans.form.sections.projectSelection', 'Project Selection')}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" sx={selectSx}>
              <InputLabel>{t('loans.form.fields.project')} *</InputLabel>
              <Select
                value={form.projectId || ''}
                onChange={(e) => handleProjectChange(e.target.value)}
                label={`${t('loans.form.fields.project')} *`}
              >
                <MenuItem value=""><em>{t('loans.common.notAvailable', 'TBD')}</em></MenuItem>
                {loadingProjects && <MenuItem disabled>{tCommon('loading', 'Loading...')}</MenuItem>}
                {projects.map(p => (
                  <MenuItem key={p._id} value={p._id}>{p.name || p.slug || p._id}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* ============ SECCIÓN 2: PARTIES ============ */}
          <Grid item xs={12}><hr style={dividerSx} /></Grid>
          <Grid item xs={12}>
            <Typography sx={sectionTitleSx}>2. {t('loans.form.sections.partiesInvolved', 'Parties Involved')}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              value={form.buyer}
              onChange={handleBuyerChange}
              options={filteredUsers}
              getOptionLabel={userLabel}
              isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
              loading={loadingUsers}
              disabled={!form.projectId}
              noOptionsText={form.projectId ? t('loans.form.noBuyersInProject', 'No buyers in this project') : t('loans.form.selectProjectFirst', 'Select a project first')}
              renderOption={(props, option) => (
                <li {...props} key={option._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '8px 12px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"Helvetica Neue", sans-serif' }}>{userLabel(option)}</Typography>
                  {option.email && <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{option.email}</Typography>}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`${t('loans.form.fields.buyer')} *`}
                  size="small"
                  sx={inputSx}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingUsers ? <CircularProgress size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              value={form.coBuyer}
              onChange={(_, val) => setForm(prev => ({ ...prev, coBuyer: val }))}
              options={filteredUsers}
              getOptionLabel={userLabel}
              isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
              loading={loadingUsers}
              disabled={!form.projectId}
              renderInput={(params) => <TextField {...params} label={t('loans.form.fields.coBuyer')} size="small" sx={inputSx} />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label={t('loans.form.fields.buyerContactInfo')} value={form.buyerContactInfo || ''} onChange={change('buyerContactInfo')} size="small" sx={inputSx} disabled={!form.projectId} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              value={form.assignedTo}
              onChange={(_, val) => setForm(prev => ({ ...prev, assignedTo: val }))}
              options={users.filter(u => u.role !== 'user')}
              getOptionLabel={userLabel}
              isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
              loading={loadingUsers}
              disabled={!form.projectId}
              renderInput={(params) => <TextField {...params} label={t('loans.form.fields.assignedTo')} size="small" sx={inputSx} />}
            />
          </Grid>

          {/* ============ SECCIÓN 3: RESOURCE (Property / Apartment) ============ */}
          <Grid item xs={12}><hr style={dividerSx} /></Grid>
          <Grid item xs={12}>
            <Typography sx={sectionTitleSx}>3. {resourceLabel} {t('loans.form.sections.details', 'Details')}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            {loadingResources ? (
              <Box sx={{ display: 'flex', alignItems: 'center', height: 40, px: 2 }}>
                <CircularProgress size={20} sx={{ color: '#004535', mr: 1 }} />
                <Typography variant="caption" sx={{ fontFamily: '"Courier New", monospace' }}>
                  {t('loans.form.loadingResources', { resource: resourceLabel.toLowerCase() })}
                </Typography>
              </Box>
            ) : (
              <Autocomplete
                value={getSelectedResource()}
                onChange={(_, val) => handleResourceChange(val ? val._id : '')}
                options={filteredResources}
                getOptionLabel={resourceOptionLabel}
                isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
                disabled={!form.projectId || !form.buyer}
                noOptionsText={
                  !form.projectId
                    ? t('loans.form.selectProjectFirst')
                    : !form.buyer
                    ? t('loans.form.selectBuyerFirst', { resource: resourceLabel.toLowerCase() })
                    : t('loans.form.noResourcesFound', 'No resources found')
                }
                renderInput={(params) => <TextField {...params} label={`${resourceLabel} *`} size="small" sx={inputSx} />}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('loans.form.fields.propertyAddress')}
              value={form.propertyAddress || ''}
              onChange={change('propertyAddress')}
              size="small"
              sx={inputSx}
              helperText={hasResource ? t('loans.form.autoFilled', 'Auto-filled from selection') : ' '}
            />
          </Grid>

          {/* ============ SECCIÓN 4: FINANCIAL (auto-calculated) ============ */}
          <Grid item xs={12}><hr style={dividerSx} /></Grid>
          <Grid item xs={12}>
            <Typography sx={sectionTitleSx}>
              4. {t('loans.form.sections.financialDetails')} <span style={{ color: '#8CA551', textTransform: 'none' }}>({t('loans.form.autoCalculated')})</span>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small" sx={selectSx}>
              <InputLabel>{t('loans.form.fields.loanType')}</InputLabel>
              <Select value={form.loanType || ''} onChange={change('loanType')} label={t('loans.form.fields.loanType')}>
                <MenuItem value=""><em>TBD</em></MenuItem>
                {(LOAN_TYPES || ['Conventional', 'FHA', 'VA', 'USDA', 'Jumbo', 'Other']).map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth type="number" label={t('loans.form.fields.purchasePrice')}
              value={form.purchasePrice || ''}
              onChange={handleFinancialChange('purchasePrice')}
              size="small" sx={inputSx}
              InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#706f6f' }}>$</Typography> }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth type="number" label={t('loans.form.fields.loanAmount')}
              value={form.loanAmount || ''}
              onChange={handleFinancialChange('loanAmount')}
              size="small" sx={inputSx}
              InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#706f6f' }}>$</Typography> }}
              helperText={ppNum > 0 ? t('loans.form.autoPriceMinusDown') : ' '}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth type="number" label={t('loans.form.fields.downPaymentPercent')}
              value={form.downPaymentPercent || ''}
              onChange={handleFinancialChange('downPaymentPercent')}
              size="small" sx={inputSx}
              inputProps={{ min: 0, max: 100, step: 0.5 }}
              InputProps={{ endAdornment: <Typography sx={{ ml: 1, color: '#706f6f' }}>%</Typography> }}
              helperText={ppNum > 0 && dpPercentNum > 0 ? `= $${round2((ppNum * dpPercentNum) / 100).toLocaleString()}` : ' '}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth type="number" label={t('loans.form.fields.downPayment')}
              value={form.downPayment || ''}
              onChange={handleFinancialChange('downPayment')}
              size="small" sx={inputSx}
              InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#706f6f' }}>$</Typography> }}
              helperText={ppNum > 0 && dpNum > 0 ? `= ${round2((dpNum / ppNum) * 100)}% ${t('loans.form.ofPrice', 'of price')}` : ' '}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth type="number" label={t('loans.form.fields.interestRate')}
              value={form.interestRate || ''}
              onChange={handleFinancialChange('interestRate')}
              size="small" sx={inputSx}
              inputProps={{ min: 0, max: 30, step: 0.125 }}
              InputProps={{ endAdornment: <Typography sx={{ ml: 1, color: '#706f6f' }}>%</Typography> }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth type="number" label={t('loans.form.fields.estimatedMonthlyPayment')}
              value={form.estimatedMonthlyPayment || ''}
              onChange={handleFinancialChange('estimatedMonthlyPayment')}
              size="small" sx={inputSx}
              InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#706f6f' }}>$</Typography> }}
              helperText={Number(form.loanAmount) > 0 && Number(form.interestRate) > 0 ? t('loans.form.auto30yr') : ' '}
            />
          </Grid>

          {/* ============ SECCIÓN 5: DATES & COMPANIES ============ */}
          <Grid item xs={12}><hr style={dividerSx} /></Grid>
          <Grid item xs={12}>
            <Typography sx={sectionTitleSx}>5. {t('loans.form.sections.datesCompanies')}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" label={t('loans.form.fields.contractDate')} value={form.contractDate || ''} onChange={change('contractDate')} size="small" InputLabelProps={{ shrink: true }} sx={inputSx} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" label={t('loans.form.fields.estimatedClosingDate')} value={form.estimatedClosingDate || ''} onChange={change('estimatedClosingDate')} size="small" InputLabelProps={{ shrink: true }} sx={inputSx} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label={t('loans.form.fields.lender')} value={form.lender || ''} onChange={change('lender')} size="small" sx={inputSx} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label={t('loans.form.fields.titleCompany')} value={form.titleCompany || ''} onChange={change('titleCompany')} size="small" sx={inputSx} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label={t('loans.form.fields.insuranceCompany')} value={form.insuranceCompany || ''} onChange={change('insuranceCompany')} size="small" sx={inputSx} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label={t('loans.form.fields.appraisalCompany')} value={form.appraisalCompany || ''} onChange={change('appraisalCompany')} size="small" sx={inputSx} />
          </Grid>

          {/* ============ SECCIÓN 6: CONTACTS, STATUS & NOTES ============ */}
          <Grid item xs={12}><hr style={dividerSx} /></Grid>
          <Grid item xs={12}>
            <Typography sx={sectionTitleSx}>6. {t('loans.form.sections.contactsStatusNotes')}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label={t('loans.form.fields.loanOfficer')} value={form.loanOfficer || ''} onChange={change('loanOfficer')} size="small" sx={inputSx} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label={t('loans.form.fields.loanOfficerContact')} value={form.loanOfficerContact || ''} onChange={change('loanOfficerContact')} size="small" sx={inputSx} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label={t('loans.form.fields.processor')} value={form.processor || ''} onChange={change('processor')} size="small" sx={inputSx} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label={t('loans.form.fields.underwriter')} value={form.underwriter || ''} onChange={change('underwriter')} size="small" sx={inputSx} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small" sx={selectSx}>
              <InputLabel>{t('loans.form.fields.pipelineStage')}</InputLabel>
              <Select value={form.pipelineStage || 'new_loan_buyer_added'} onChange={change('pipelineStage')} label={t('loans.form.fields.pipelineStage')}>
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
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small" sx={selectSx}>
              <InputLabel>{t('loans.form.fields.specialStatus')}</InputLabel>
              <Select value={form.specialStatus || ''} onChange={change('specialStatus')} label={t('loans.form.fields.specialStatus')}>
                <MenuItem value=""><em>{t('loans.common.none')}</em></MenuItem>
                <MenuItem value="on_hold">{t('loans.specialStatuses.on_hold')}</MenuItem>
                <MenuItem value="missing_documents">{t('loans.specialStatuses.missing_documents')}</MenuItem>
                <MenuItem value="buyer_action_required">{t('loans.specialStatuses.buyer_action_required')}</MenuItem>
                <MenuItem value="financing_issue">{t('loans.specialStatuses.financing_issue')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={3} label={t('loans.form.fields.internalNotes')} value={form.internalNotes || ''} onChange={change('internalNotes')} size="small" sx={inputSx} />
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #ececec', bgcolor: '#fafafa' }}>
        <Button onClick={onClose} disabled={saving} sx={{ ...unifiedButtonSx, color: '#000', border: '1px solid #000', '&:hover': { bgcolor: '#f5f5f5' } }}>
          {tCommon('actions.cancel', 'Cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!form.buyer || !form.projectId || !hasResource || saving}
          sx={{ ...unifiedButtonSx, color: '#fff' }}
        >
          {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : (isEdit ? t('loans.detail.saveChanges') : t('loans.form.saveButton'))}
        </Button>
      </DialogActions>
    </Dialog>
  )
}