import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box, Typography, TextField, Button, MenuItem, Grid, Divider
} from '@mui/material'
import { Save, Edit, Close } from '@mui/icons-material'
import { LOAN_TYPES, STAGE_LABELS, LOAN_PIPELINE_STAGES, SPECIAL_STATUS_LABELS, LOAN_SPECIAL_STATUSES } from '../../services/loanService'

function personLabel(p) {
  if (!p) return ''
  if (typeof p === 'object') return [p.firstName, p.lastName].filter(Boolean).join(' ') || p.email || ''
  return String(p)
}

const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 0, fontSize: '0.82rem' } }

const SectionTitle = ({ children }) => (
  <Typography
    sx={{
      fontFamily: '"Courier New", monospace',
      fontSize: '0.62rem',
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
      color: '#888',
      mt: 3,
      mb: 1.5
    }}
  >
    {children}
  </Typography>
)

export default function LoanProfileForm({ loan, onSave, onStageChange, onStatusChange }) {
  const { t } = useTranslation('loans')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})

  const handleEdit = () => {
    setForm({
      buyerContactInfo: loan.buyerContactInfo || '',
      propertyAddress: loan.propertyAddress || '',
      purchasePrice: loan.purchasePrice || '',
      loanAmount: loan.loanAmount || '',
      downPayment: loan.downPayment || '',
      downPaymentPercent: loan.downPaymentPercent || '',
      loanType: loan.loanType || '',
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
      appraisalCompany: loan.appraisalCompany || ''
    })
    setEditing(true)
  }

  const handleSave = () => {
    const data = { ...form }
    if (data.purchasePrice) data.purchasePrice = Number(data.purchasePrice)
    if (data.loanAmount) data.loanAmount = Number(data.loanAmount)
    if (data.downPayment) data.downPayment = Number(data.downPayment)
    if (data.downPaymentPercent) data.downPaymentPercent = Number(data.downPaymentPercent)
    if (data.interestRate) data.interestRate = Number(data.interestRate)
    if (data.estimatedMonthlyPayment) data.estimatedMonthlyPayment = Number(data.estimatedMonthlyPayment)
    onSave?.(data)
    setEditing(false)
  }

  const change = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const ReadField = ({ label, value }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', color: '#000' }}>
        {value || '—'}
      </Typography>
    </Box>
  )

  return (
    <Box id="loan-profile-form" sx={{ border: '1px solid #e0e0e0', bgcolor: '#fff', p: 2.5, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#000' }}>
          {t('loans.detail.profile')}
        </Typography>
        {!editing ? (
          <Button size="small" startIcon={<Edit sx={{ fontSize: 14 }} />} onClick={handleEdit}
            sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', textTransform: 'none', borderRadius: 0, color: '#000' }}>
            {t('loans.actions.edit')}
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" startIcon={<Save sx={{ fontSize: 14 }} />} onClick={handleSave} variant="contained"
              sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', textTransform: 'none', borderRadius: 0, bgcolor: '#000', '&:hover': { bgcolor: '#222' } }}>
              {t('loans.detail.saveChanges')}
            </Button>
            <Button size="small" startIcon={<Close sx={{ fontSize: 14 }} />} onClick={() => setEditing(false)}
              sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', textTransform: 'none', borderRadius: 0, color: '#000' }}>
              {t('common:actions.cancel', 'Cancel')}
            </Button>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          label={t('loans.form.fields.pipelineStage')}
          value={loan.pipelineStage || ''}
          onChange={(e) => onStageChange?.(e.target.value)}
          size="small"
          sx={{ minWidth: 250, ...fieldSx }}
        >
          <MenuItem value=""><em>{t('loans.common.notAvailable', 'TBD')}</em></MenuItem>
          {LOAN_PIPELINE_STAGES.map(s => (
            <MenuItem key={s} value={s}>{STAGE_LABELS[s]}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label={t('loans.form.fields.specialStatus')}
          value={loan.specialStatus || ''}
          onChange={(e) => onStatusChange?.(e.target.value || null)}
          size="small"
          sx={{ minWidth: 200, ...fieldSx }}
        >
          <MenuItem value=""><em>{t('loans.common.notAvailable', 'TBD')}</em></MenuItem>
          {LOAN_SPECIAL_STATUSES.map(s => (
            <MenuItem key={s} value={s}>{SPECIAL_STATUS_LABELS[s]}</MenuItem>
          ))}
        </TextField>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {!editing ? (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <ReadField label={t('loans.form.fields.buyer')} value={personLabel(loan.buyer)} />
            <ReadField label={t('loans.form.fields.coBuyer')} value={personLabel(loan.coBuyer)} />
            <ReadField label={t('loans.form.fields.buyerContactInfo')} value={loan.buyerContactInfo} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ReadField label={t('loans.form.fields.propertyAddress')} value={loan.propertyAddress} />
            <ReadField label={t('loans.form.fields.purchasePrice')} value={loan.purchasePrice ? `$${loan.purchasePrice.toLocaleString()}` : null} />
            <ReadField label={t('loans.form.fields.loanAmount')} value={loan.loanAmount ? `$${loan.loanAmount.toLocaleString()}` : null} />
            <ReadField label={t('loans.form.fields.downPayment')} value={loan.downPayment ? `$${loan.downPayment.toLocaleString()} (${loan.downPaymentPercent || 0}%)` : null} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ReadField label={t('loans.form.fields.loanType')} value={loan.loanType} />
            <ReadField label={t('loans.form.fields.interestRate')} value={loan.interestRate ? `${loan.interestRate}%` : null} />
            <ReadField label={t('loans.form.fields.estimatedMonthlyPayment')} value={loan.estimatedMonthlyPayment ? `$${loan.estimatedMonthlyPayment.toLocaleString()}` : null} />
            <ReadField label={t('loans.form.fields.contractDate')} value={loan.contractDate ? new Date(loan.contractDate).toLocaleDateString() : null} />
            <ReadField label={t('loans.form.fields.estimatedClosingDate')} value={loan.estimatedClosingDate ? new Date(loan.estimatedClosingDate).toLocaleDateString() : null} />
          </Grid>

          <Grid item xs={12}>
            <SectionTitle>{t('loans.profileForm.thirdParties', 'Third Parties')}</SectionTitle>
          </Grid>
          <Grid item xs={12} sm={6} md={3}><ReadField label={t('loans.form.fields.lender')} value={loan.lender} /></Grid>
          <Grid item xs={12} sm={6} md={3}><ReadField label={t('loans.form.fields.loanOfficer')} value={loan.loanOfficer} /></Grid>
          <Grid item xs={12} sm={6} md={3}><ReadField label={t('loans.form.fields.loanOfficerContact')} value={loan.loanOfficerContact} /></Grid>
          <Grid item xs={12} sm={6} md={3}><ReadField label={t('loans.form.fields.processor')} value={loan.processor} /></Grid>
          <Grid item xs={12} sm={6} md={3}><ReadField label={t('loans.form.fields.underwriter')} value={loan.underwriter} /></Grid>
          <Grid item xs={12} sm={6} md={3}><ReadField label={t('loans.form.fields.titleCompany')} value={loan.titleCompany} /></Grid>
          <Grid item xs={12} sm={6} md={3}><ReadField label={t('loans.form.fields.insuranceCompany')} value={loan.insuranceCompany} /></Grid>
          <Grid item xs={12} sm={6} md={3}><ReadField label={t('loans.form.fields.appraisalCompany')} value={loan.appraisalCompany} /></Grid>
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}><SectionTitle>{t('loans.profileForm.buyerInfo', 'Buyer Info')}</SectionTitle></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label={t('loans.form.fields.buyerContactInfo')} value={form.buyerContactInfo} onChange={change('buyerContactInfo')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label={t('loans.form.fields.propertyAddress')} value={form.propertyAddress} onChange={change('propertyAddress')} size="small" sx={fieldSx} /></Grid>

          <Grid item xs={12}><SectionTitle>{t('loans.profileForm.financialDetails')}</SectionTitle></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth type="number" label={t('loans.form.fields.purchasePrice')} value={form.purchasePrice} onChange={change('purchasePrice')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth type="number" label={t('loans.form.fields.loanAmount')} value={form.loanAmount} onChange={change('loanAmount')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label={t('loans.form.fields.downPaymentPercent')}
              value={form.downPaymentPercent}
              onChange={(e) => {
                const pct = e.target.value
                const price = Number(form.purchasePrice) || 0
                const dp = price > 0 && pct ? Math.round((pct / 100) * price * 100) / 100 : ''
                setForm(prev => ({ ...prev, downPaymentPercent: pct, downPayment: dp }))
              }}
              size="small"
              sx={fieldSx}
              inputProps={{ min: 0, max: 100, step: 0.5 }}
              helperText={
                form.downPayment && Number(form.downPayment) > 0
                  ? `$${Number(form.downPayment).toLocaleString()}`
                  : form.purchasePrice ? t('loans.form.enterPercentToCalculate', 'Enter % to calculate') : t('loans.form.setPurchasePriceFirst', 'Set purchase price first')
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth select label={t('loans.form.fields.loanType')} value={form.loanType} onChange={change('loanType')} size="small" sx={fieldSx}>
              <MenuItem value=""><em>{t('loans.common.notAvailable', 'TBD')}</em></MenuItem>
              {LOAN_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth type="number" label={t('loans.form.fields.interestRate')} value={form.interestRate} onChange={change('interestRate')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth type="number" label={t('loans.form.fields.estimatedMonthlyPayment')} value={form.estimatedMonthlyPayment} onChange={change('estimatedMonthlyPayment')} size="small" sx={fieldSx} /></Grid>

          <Grid item xs={12}><SectionTitle>{t('loans.profileForm.datesCompanies', 'Dates')}</SectionTitle></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth type="date" label={t('loans.form.fields.contractDate')} value={form.contractDate} onChange={change('contractDate')} size="small" InputLabelProps={{ shrink: true }} sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth type="date" label={t('loans.form.fields.estimatedClosingDate')} value={form.estimatedClosingDate} onChange={change('estimatedClosingDate')} size="small" InputLabelProps={{ shrink: true }} sx={fieldSx} /></Grid>

          <Grid item xs={12}><SectionTitle>{t('loans.profileForm.thirdParties', 'Third Parties')}</SectionTitle></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth label={t('loans.form.fields.lender')} value={form.lender} onChange={change('lender')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth label={t('loans.form.fields.loanOfficer')} value={form.loanOfficer} onChange={change('loanOfficer')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth label={t('loans.form.fields.loanOfficerContact')} value={form.loanOfficerContact} onChange={change('loanOfficerContact')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth label={t('loans.form.fields.processor')} value={form.processor} onChange={change('processor')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth label={t('loans.form.fields.underwriter')} value={form.underwriter} onChange={change('underwriter')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth label={t('loans.form.fields.titleCompany')} value={form.titleCompany} onChange={change('titleCompany')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth label={t('loans.form.fields.insuranceCompany')} value={form.insuranceCompany} onChange={change('insuranceCompany')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth label={t('loans.form.fields.appraisalCompany')} value={form.appraisalCompany} onChange={change('appraisalCompany')} size="small" sx={fieldSx} /></Grid>
        </Grid>
      )}
    </Box>
  )
}