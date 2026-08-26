import { useState } from 'react'
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
    <Box sx={{ border: '1px solid #e0e0e0', bgcolor: '#fff', p: 2.5, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#000' }}>
          Loan Profile
        </Typography>
        {!editing ? (
          <Button size="small" startIcon={<Edit sx={{ fontSize: 14 }} />} onClick={handleEdit}
            sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', textTransform: 'none', borderRadius: 0, color: '#000' }}>
            Edit
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" startIcon={<Save sx={{ fontSize: 14 }} />} onClick={handleSave} variant="contained"
              sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', textTransform: 'none', borderRadius: 0, bgcolor: '#000', '&:hover': { bgcolor: '#222' } }}>
              Save
            </Button>
            <Button size="small" startIcon={<Close sx={{ fontSize: 14 }} />} onClick={() => setEditing(false)}
              sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', textTransform: 'none', borderRadius: 0, color: '#000' }}>
              Cancel
            </Button>
          </Box>
        )}
      </Box>

      {/* Pipeline Stage & Special Status selectors */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Pipeline Stage"
          value={loan.pipelineStage || ''}
          onChange={(e) => onStageChange?.(e.target.value)}
          size="small"
          sx={{ minWidth: 250, ...fieldSx }}
        >
          <MenuItem value=""><em>TBD</em></MenuItem>
          {LOAN_PIPELINE_STAGES.map(s => (
            <MenuItem key={s} value={s}>{STAGE_LABELS[s]}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Special Status"
          value={loan.specialStatus || ''}
          onChange={(e) => onStatusChange?.(e.target.value || null)}
          size="small"
          sx={{ minWidth: 200, ...fieldSx }}
        >
          <MenuItem value=""><em>TBD</em></MenuItem>
          {LOAN_SPECIAL_STATUSES.map(s => (
            <MenuItem key={s} value={s}>{SPECIAL_STATUS_LABELS[s]}</MenuItem>
          ))}
        </TextField>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {!editing ? (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <ReadField label="Buyer" value={personLabel(loan.buyer)} />
            <ReadField label="Co-Buyer" value={personLabel(loan.coBuyer)} />
            <ReadField label="Contact Info" value={loan.buyerContactInfo} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ReadField label="Property Address" value={loan.propertyAddress} />
            <ReadField label="Purchase Price" value={loan.purchasePrice ? `$${loan.purchasePrice.toLocaleString()}` : null} />
            <ReadField label="Loan Amount" value={loan.loanAmount ? `$${loan.loanAmount.toLocaleString()}` : null} />
            <ReadField label="Down Payment" value={loan.downPayment ? `$${loan.downPayment.toLocaleString()} (${loan.downPaymentPercent || 0}%)` : null} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ReadField label="Loan Type" value={loan.loanType} />
            <ReadField label="Interest Rate" value={loan.interestRate ? `${loan.interestRate}%` : null} />
            <ReadField label="Est. Monthly Payment" value={loan.estimatedMonthlyPayment ? `$${loan.estimatedMonthlyPayment.toLocaleString()}` : null} />
            <ReadField label="Contract Date" value={loan.contractDate ? new Date(loan.contractDate).toLocaleDateString() : null} />
            <ReadField label="Est. Closing Date" value={loan.estimatedClosingDate ? new Date(loan.estimatedClosingDate).toLocaleDateString() : null} />
          </Grid>

          <Grid item xs={12}>
            <SectionTitle>Third Parties</SectionTitle>
          </Grid>
          <Grid item xs={12} sm={6} md={3}><ReadField label="Lender" value={loan.lender} /></Grid>
          <Grid item xs={12} sm={6} md={3}><ReadField label="Loan Officer" value={loan.loanOfficer} /></Grid>
          <Grid item xs={12} sm={6} md={3}><ReadField label="Officer Contact" value={loan.loanOfficerContact} /></Grid>
          <Grid item xs={12} sm={6} md={3}><ReadField label="Processor" value={loan.processor} /></Grid>
          <Grid item xs={12} sm={6} md={3}><ReadField label="Underwriter" value={loan.underwriter} /></Grid>
          <Grid item xs={12} sm={6} md={3}><ReadField label="Title Company" value={loan.titleCompany} /></Grid>
          <Grid item xs={12} sm={6} md={3}><ReadField label="Insurance Company" value={loan.insuranceCompany} /></Grid>
          <Grid item xs={12} sm={6} md={3}><ReadField label="Appraisal Company" value={loan.appraisalCompany} /></Grid>
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}><SectionTitle>Buyer Info</SectionTitle></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Contact Info" value={form.buyerContactInfo} onChange={change('buyerContactInfo')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Property Address" value={form.propertyAddress} onChange={change('propertyAddress')} size="small" sx={fieldSx} /></Grid>

          <Grid item xs={12}><SectionTitle>Financial</SectionTitle></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth type="number" label="Purchase Price" value={form.purchasePrice} onChange={change('purchasePrice')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth type="number" label="Loan Amount" value={form.loanAmount} onChange={change('loanAmount')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Down Payment %"
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
                  : form.purchasePrice ? 'Enter % to calculate' : 'Set purchase price first'
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth select label="Loan Type" value={form.loanType} onChange={change('loanType')} size="small" sx={fieldSx}>
              <MenuItem value=""><em>TBD</em></MenuItem>
              {LOAN_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth type="number" label="Interest Rate (%)" value={form.interestRate} onChange={change('interestRate')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth type="number" label="Est. Monthly Payment" value={form.estimatedMonthlyPayment} onChange={change('estimatedMonthlyPayment')} size="small" sx={fieldSx} /></Grid>

          <Grid item xs={12}><SectionTitle>Dates</SectionTitle></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth type="date" label="Contract Date" value={form.contractDate} onChange={change('contractDate')} size="small" InputLabelProps={{ shrink: true }} sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth type="date" label="Est. Closing Date" value={form.estimatedClosingDate} onChange={change('estimatedClosingDate')} size="small" InputLabelProps={{ shrink: true }} sx={fieldSx} /></Grid>

          <Grid item xs={12}><SectionTitle>Third Parties</SectionTitle></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Lender" value={form.lender} onChange={change('lender')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Loan Officer" value={form.loanOfficer} onChange={change('loanOfficer')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Officer Contact" value={form.loanOfficerContact} onChange={change('loanOfficerContact')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Processor" value={form.processor} onChange={change('processor')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Underwriter" value={form.underwriter} onChange={change('underwriter')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Title Company" value={form.titleCompany} onChange={change('titleCompany')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Insurance Company" value={form.insuranceCompany} onChange={change('insuranceCompany')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Appraisal Company" value={form.appraisalCompany} onChange={change('appraisalCompany')} size="small" sx={fieldSx} /></Grid>
        </Grid>
      )}
    </Box>
  )
}
