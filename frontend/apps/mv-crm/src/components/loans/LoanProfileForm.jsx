import { useState, useEffect } from 'react'
import { Box, Grid, TextField, Typography, Button, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

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

export default function LoanProfileForm({ loan, onSave, formId }) {
  const { t } = useTranslation('loans')

  const [formData, setFormData] = useState({
    buyerContactInfo: '',
    propertyAddress: '',
    loanType: 'Conventional',
    purchasePrice: '',
    loanAmount: '',
    downPayment: '',
    downPaymentPercent: '',
    interestRate: '',
    estimatedMonthlyPayment: '',
    contractDate: '',
    estimatedClosingDate: '',
    lender: '',
    loanOfficer: '',
    loanOfficerContact: '',
    processor: '',
    underwriter: '',
    titleCompany: '',
    insuranceCompany: '',
    appraisalCompany: '',
    pipelineStage: 'new_loan_buyer_added',
    specialStatus: '',
    internalNotes: ''
  })

  useEffect(() => {
    if (loan) {
      setFormData({
        buyerContactInfo: loan.buyerContactInfo || '',
        propertyAddress: loan.propertyAddress || '',
        loanType: loan.loanType || 'Conventional',
        purchasePrice: loan.purchasePrice || '',
        loanAmount: loan.loanAmount || '',
        downPayment: loan.downPayment || '',
        downPaymentPercent: loan.downPaymentPercent || '',
        interestRate: loan.interestRate || '',
        estimatedMonthlyPayment: loan.estimatedMonthlyPayment || '',
        contractDate: loan.contractDate ? loan.contractDate.split('T')[0] : '',
        estimatedClosingDate: loan.estimatedClosingDate ? loan.estimatedClosingDate.split('T')[0] : '',
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
    }
  }, [loan])

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
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

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const payload = {
      buyerContactInfo: formData.buyerContactInfo || null,
      propertyAddress: formData.propertyAddress || null,
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

    if (onSave) onSave(payload)
  }

  const inputSx = {
    fontFamily: '"Courier New", monospace',
    fontSize: '0.75rem',
    borderRadius: 0,
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem' },
    '& .MuiInputBase-input::placeholder': { fontFamily: '"Courier New", monospace', opacity: 1 },
    '& .MuiFormHelperText-root': { fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#8CA551' }
  }

  // ✅ Loan types internacionalizados
  const loanTypeOptions = [
    { value: 'Conventional', label: t('loans.form.loanTypes.conventional') },
    { value: 'FHA', label: t('loans.form.loanTypes.fha') },
    { value: 'VA', label: t('loans.form.loanTypes.va') },
    { value: 'USDA', label: t('loans.form.loanTypes.usda') },
    { value: 'Jumbo', label: t('loans.form.loanTypes.jumbo') },
    { value: 'Other', label: t('loans.form.loanTypes.other') },
  ]

  // ✅ Información de solo lectura con manejo de Property Y Apartment
  const buyerName = loan?.buyer 
    ? `${loan.buyer.firstName} ${loan.buyer.lastName}` 
    : t('loans.common.notAvailable')
  
  const coBuyerName = loan?.coBuyer 
    ? `${loan.coBuyer.firstName} ${loan.coBuyer.lastName}` 
    : t('loans.common.notAvailable')
  
  const projectName = loan?.projectId?.name || t('loans.common.notAvailable')

  // ✅ Construir info del recurso según sea Property o Apartment
  let resourceLabel = t('loans.form.fields.property')
  let resourceInfo = t('loans.common.notAvailable')

  if (loan?.propertyId) {
    resourceLabel = t('loans.form.fields.property')
    const lotNum = loan.propertyId.lot?.number || t('loans.common.notAvailable')
    const modelName = loan.propertyId.model?.model || ''
    resourceInfo = `🏠 ${t('loans.form.fields.lot')} ${lotNum}${modelName ? ` - ${modelName}` : ''}`
  } else if (loan?.apartmentId) {
    resourceLabel = t('loans.form.fields.apartment')
    const aptNum = loan.apartmentId.apartmentNumber || t('loans.common.notAvailable')
    const floorNum = loan.apartmentId.floorNumber || ''
    const modelName = loan.apartmentId.apartmentModel?.name || loan.apartmentId.apartmentModel?.modelNumber || ''
    const buildingName = loan.apartmentId.building?.name || ''
    const parts = [`${t('loans.form.fields.apt')} ${aptNum}`]
    if (floorNum) parts.push(`(${t('loans.form.fields.floor')} ${floorNum})`)
    if (buildingName) parts.push(`- ${buildingName}`)
    if (modelName) parts.push(`Model ${modelName}`)
    resourceInfo = `🏢 ${parts.join(' ')}`
  }

  const ppNum = Number(formData.purchasePrice) || 0
  const dpNum = Number(formData.downPayment) || 0
  const dpPercentNum = Number(formData.downPaymentPercent) || 0

  return (
    <Box component="form" id={formId} onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        
        {/* --- SECCIÓN 1: INFORMACIÓN DE SOLO LECTURA --- */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#004535', fontFamily: '"Courier New", monospace', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>
            {t('loans.profileForm.readOnlyInfo')}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField 
            label={t('loans.form.fields.buyer')} 
            value={buyerName} 
            fullWidth size="small" 
            InputProps={{ readOnly: true }} 
            sx={{ ...inputSx, bgcolor: '#fafafa' }} 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField 
            label={t('loans.form.fields.coBuyer')} 
            value={coBuyerName} 
            fullWidth size="small" 
            InputProps={{ readOnly: true }} 
            sx={{ ...inputSx, bgcolor: '#fafafa' }} 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField 
            label={t('loans.form.fields.project')} 
            value={projectName} 
            fullWidth size="small" 
            InputProps={{ readOnly: true }} 
            sx={{ ...inputSx, bgcolor: '#fafafa' }} 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField 
            label={resourceLabel} 
            value={resourceInfo} 
            fullWidth size="small" 
            InputProps={{ readOnly: true }} 
            sx={{ ...inputSx, bgcolor: '#fafafa' }} 
          />
        </Grid>

        {/* --- SECCIÓN 2: INFORMACIÓN EDITABLE --- */}
        <Grid item xs={12} sx={{ mt: 1 }}><Divider sx={{ borderColor: '#ececec' }} /></Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#004535', fontFamily: '"Courier New", monospace', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>
            {t('loans.profileForm.editableInfo')}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField 
            label={t('loans.form.fields.buyerContactInfo')} 
            value={formData.buyerContactInfo} 
            onChange={handleChange('buyerContactInfo')} 
            fullWidth size="small" sx={inputSx} 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField 
            label={t('loans.form.fields.propertyAddress')} 
            value={formData.propertyAddress} 
            onChange={handleChange('propertyAddress')} 
            fullWidth size="small" sx={inputSx} 
          />
        </Grid>

        {/* --- SECCIÓN 3: DETALLES FINANCIEROS --- */}
        <Grid item xs={12} sx={{ mt: 1 }}><Divider sx={{ borderColor: '#ececec' }} /></Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#004535', fontFamily: '"Courier New", monospace', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>
            {t('loans.profileForm.financialDetails')} <span style={{ color: '#8CA551', textTransform: 'none' }}>({t('loans.form.autoCalculated')})</span>
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
            label={t('loans.form.fields.purchasePrice')} type="number" fullWidth size="small"
            value={formData.purchasePrice} 
            onChange={handleFinancialChange('purchasePrice')} 
            sx={inputSx} 
            InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#706f6f' }}>$</Typography> }} 
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField 
            label={t('loans.form.fields.downPaymentPercent')} type="number" fullWidth size="small"
            value={formData.downPaymentPercent} 
            onChange={handleFinancialChange('downPaymentPercent')} 
            sx={inputSx} 
            InputProps={{ endAdornment: <Typography sx={{ ml: 1, color: '#706f6f' }}>%</Typography> }} 
            helperText={ppNum > 0 && dpPercentNum > 0 ? `= $${round2((ppNum * dpPercentNum) / 100).toLocaleString()}` : ' '}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField 
            label={t('loans.form.fields.downPayment')} type="number" fullWidth size="small"
            value={formData.downPayment} 
            onChange={handleFinancialChange('downPayment')} 
            sx={inputSx} 
            InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#706f6f' }}>$</Typography> }} 
            helperText={ppNum > 0 && dpNum > 0 ? `= ${round2((dpNum / ppNum) * 100)}% ${t('loans.form.ofPrice', 'of price')}` : ' '}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField 
            label={t('loans.form.fields.loanAmount')} type="number" fullWidth size="small"
            value={formData.loanAmount} 
            onChange={handleFinancialChange('loanAmount')} 
            sx={inputSx} 
            InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#706f6f' }}>$</Typography> }} 
            helperText={ppNum > 0 ? t('loans.form.autoPriceMinusDown') : ' '}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField 
            label={t('loans.form.fields.interestRate')} type="number" fullWidth size="small"
            value={formData.interestRate} 
            onChange={handleFinancialChange('interestRate')} 
            sx={inputSx} 
            InputProps={{ endAdornment: <Typography sx={{ ml: 1, color: '#706f6f' }}>%</Typography> }} 
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField 
            label={t('loans.form.fields.estimatedMonthlyPayment')} type="number" fullWidth size="small"
            value={formData.estimatedMonthlyPayment} 
            onChange={handleFinancialChange('estimatedMonthlyPayment')} 
            sx={inputSx} 
            InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#706f6f' }}>$</Typography> }} 
            helperText={Number(formData.loanAmount) > 0 ? t('loans.form.auto30yr') : ' '}
          />
        </Grid>

        {/* --- SECCIÓN 4: FECHAS Y COMPAÑÍAS --- */}
        <Grid item xs={12} sx={{ mt: 1 }}><Divider sx={{ borderColor: '#ececec' }} /></Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#004535', fontFamily: '"Courier New", monospace', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>
            {t('loans.profileForm.datesCompanies')}
          </Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField 
            label={t('loans.form.fields.contractDate')} type="date" fullWidth size="small" 
            InputLabelProps={{ shrink: true }} 
            value={formData.contractDate} 
            onChange={handleChange('contractDate')} sx={inputSx} 
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField 
            label={t('loans.form.fields.estimatedClosingDate')} type="date" fullWidth size="small" 
            InputLabelProps={{ shrink: true }} 
            value={formData.estimatedClosingDate} 
            onChange={handleChange('estimatedClosingDate')} sx={inputSx} 
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField 
            label={t('loans.form.fields.lender')} 
            fullWidth size="small" 
            value={formData.lender} 
            onChange={handleChange('lender')} sx={inputSx} 
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField 
            label={t('loans.form.fields.titleCompany')} 
            fullWidth size="small" 
            value={formData.titleCompany} 
            onChange={handleChange('titleCompany')} sx={inputSx} 
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField 
            label={t('loans.form.fields.insuranceCompany')} 
            fullWidth size="small" 
            value={formData.insuranceCompany} 
            onChange={handleChange('insuranceCompany')} sx={inputSx} 
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField 
            label={t('loans.form.fields.appraisalCompany')} 
            fullWidth size="small" 
            value={formData.appraisalCompany} 
            onChange={handleChange('appraisalCompany')} sx={inputSx} 
          />
        </Grid>

        {/* --- SECCIÓN 5: CONTACTOS Y ESTADO --- */}
        <Grid item xs={12} sx={{ mt: 1 }}><Divider sx={{ borderColor: '#ececec' }} /></Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#004535', fontFamily: '"Courier New", monospace', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>
            {t('loans.profileForm.contactsStatus')}
          </Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField 
            label={t('loans.form.fields.loanOfficer')} 
            fullWidth size="small" 
            value={formData.loanOfficer} 
            onChange={handleChange('loanOfficer')} sx={inputSx} 
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField 
            label={t('loans.form.fields.loanOfficerContact')} 
            fullWidth size="small" 
            value={formData.loanOfficerContact} 
            onChange={handleChange('loanOfficerContact')} sx={inputSx} 
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField 
            label={t('loans.form.fields.processor')} 
            fullWidth size="small" 
            value={formData.processor} 
            onChange={handleChange('processor')} sx={inputSx} 
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField 
            label={t('loans.form.fields.underwriter')} 
            fullWidth size="small" 
            value={formData.underwriter} 
            onChange={handleChange('underwriter')} sx={inputSx} 
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small" sx={inputSx}>
            <InputLabel>{t('loans.form.fields.pipelineStage')}</InputLabel>
            <Select 
              value={formData.pipelineStage} 
              label={t('loans.form.fields.pipelineStage')} 
              onChange={handleChange('pipelineStage')}
            >
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
            <Select 
              value={formData.specialStatus} 
              label={t('loans.form.fields.specialStatus')} 
              onChange={handleChange('specialStatus')}
            >
              <MenuItem value=""><em>{t('loans.common.none')}</em></MenuItem>
              <MenuItem value="on_hold">{t('loans.specialStatuses.on_hold')}</MenuItem>
              <MenuItem value="missing_documents">{t('loans.specialStatuses.missing_documents')}</MenuItem>
              <MenuItem value="buyer_action_required">{t('loans.specialStatuses.buyer_action_required')}</MenuItem>
              <MenuItem value="financing_issue">{t('loans.specialStatuses.financing_issue')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField 
            label={t('loans.form.fields.internalNotes')} 
            fullWidth size="small" multiline rows={2} 
            value={formData.internalNotes} 
            onChange={handleChange('internalNotes')} sx={inputSx} 
          />
        </Grid>

      </Grid>
    </Box>
  )
}