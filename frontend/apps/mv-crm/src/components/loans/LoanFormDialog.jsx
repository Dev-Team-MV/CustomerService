import { useState, useEffect, useMemo } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Grid, Typography,
  Autocomplete, CircularProgress, FormControl, InputLabel, Select
} from '@mui/material'
import { LOAN_TYPES } from '../../services/loanService'
import api from '@shared/services/api'
import { useProjects } from '@shared/hooks/useProjects'

const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 0, fontSize: '0.82rem' } }
const selectSx = { borderRadius: 0, fontSize: '0.82rem' }

function propertyLabel(prop) {
  if (!prop) return ''
  const parts = []
  if (prop.lot?.number) parts.push(`Lot ${prop.lot.number}`)
  if (prop.model?.name || prop.model?.model) parts.push(prop.model.name || prop.model.model)
  if (prop.price) parts.push(`$${prop.price.toLocaleString()}`)
  if (parts.length) return parts.join(' — ')
  return prop._id
}

function userLabel(u) {
  if (!u) return ''
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || ''
}

export default function LoanFormDialog({ open, onClose, onSubmit, loan = null }) {
  const isEdit = Boolean(loan)
  const { projects, loading: loadingProjects } = useProjects()

  const [form, setForm] = useState({})
  const [users, setUsers] = useState([])
  const [properties, setProperties] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingProperties, setLoadingProperties] = useState(false)
  const [saving, setSaving] = useState(false)

  // Init form when dialog opens
  useEffect(() => {
    if (open) {
      setForm({
        buyer: loan?.buyer || null,
        coBuyer: loan?.coBuyer || null,
        buyerContactInfo: loan?.buyerContactInfo || '',
        projectId: loan?.projectId?._id || loan?.projectId || '',
        propertyId: loan?.propertyId?._id || loan?.propertyId || '',
        propertyAddress: loan?.propertyAddress || '',
        purchasePrice: loan?.purchasePrice || '',
        loanAmount: loan?.loanAmount || '',
        downPayment: loan?.downPayment || '',
        loanType: loan?.loanType || 'Conventional',
        interestRate: loan?.interestRate || '',
        estimatedMonthlyPayment: loan?.estimatedMonthlyPayment || '',
        contractDate: loan?.contractDate ? new Date(loan.contractDate).toISOString().split('T')[0] : '',
        estimatedClosingDate: loan?.estimatedClosingDate ? new Date(loan.estimatedClosingDate).toISOString().split('T')[0] : '',
        lender: loan?.lender || '',
        loanOfficer: loan?.loanOfficer || '',
        loanOfficerContact: loan?.loanOfficerContact || ''
      })
      fetchUsers()
    }
  }, [open])

  // Fetch properties when project changes
  useEffect(() => {
    if (!form.projectId) {
      setProperties([])
      return
    }
    const fetchProperties = async () => {
      setLoadingProperties(true)
      try {
        const res = await api.get('/properties', { params: { projectId: form.projectId } })
        const data = Array.isArray(res.data) ? res.data : (res.data.properties || res.data.data || [])
        setProperties(data)
      } catch (err) {
        console.error('Failed to fetch properties:', err)
        setProperties([])
      } finally {
        setLoadingProperties(false)
      }
    }
    fetchProperties()
  }, [form.projectId])

  // Filter buyers: users that own properties in the selected project
  const filteredBuyers = useMemo(() => {
    if (!form.projectId) return users.filter(u => u.role === 'user')

    return users.filter(u => {
      if (u.role !== 'user') return false
      // User has projectMemberships for this project
      if (u.projectMemberships?.some(m =>
        (m.project?._id || m.project) === form.projectId
      )) return true
      // User owns a property in the loaded properties list
      if (properties.some(p =>
        Array.isArray(p.users) && p.users.some(pu => (pu._id || pu) === u._id)
      )) return true
      return false
    })
  }, [users, form.projectId, properties])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await api.get('/users')
      setUsers(res.data || [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleProjectChange = (projectId) => {
    setForm(prev => ({
      ...prev,
      projectId,
      propertyId: '',
      propertyAddress: '',
      purchasePrice: '',
      buyer: null,
      coBuyer: null
    }))
  }

  const handlePropertyChange = (propertyId) => {
    const prop = properties.find(p => p._id === propertyId)
    const updates = { propertyId }
    if (prop) {
      // Auto-fill address and price from selected property
      const addressParts = []
      if (prop.lot?.number) addressParts.push(`Lot ${prop.lot.number}`)
      if (prop.model?.name || prop.model?.model) addressParts.push(prop.model.name || prop.model.model)
      updates.propertyAddress = addressParts.join(' — ') || ''
      if (prop.price) updates.purchasePrice = prop.price
    }
    setForm(prev => ({ ...prev, ...updates }))
  }

  const change = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.buyer || !form.projectId) return
    setSaving(true)
    try {
      const data = {
        ...form,
        buyer: typeof form.buyer === 'object' ? form.buyer._id : form.buyer,
        coBuyer: form.coBuyer ? (typeof form.coBuyer === 'object' ? form.coBuyer._id : form.coBuyer) : null,
        propertyId: form.propertyId || null
      }
      if (data.purchasePrice) data.purchasePrice = Number(data.purchasePrice)
      if (data.loanAmount) data.loanAmount = Number(data.loanAmount)
      if (data.downPayment) data.downPayment = Number(data.downPayment)
      if (data.interestRate) data.interestRate = Number(data.interestRate)
      if (data.estimatedMonthlyPayment) data.estimatedMonthlyPayment = Number(data.estimatedMonthlyPayment)

      await onSubmit(data)
      onClose()
    } catch (err) {
      console.error('Failed to save loan:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 0 } }}
    >
      <DialogTitle
        sx={{
          fontFamily: '"Helvetica Neue", sans-serif',
          fontWeight: 200,
          fontSize: '1.3rem',
          letterSpacing: '-0.02em',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        {isEdit ? 'Edit Loan' : 'New Loan'}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2} sx={{ mt: 0 }}>

          {/* Project Select */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel>Project *</InputLabel>
              <Select
                value={form.projectId || ''}
                onChange={(e) => handleProjectChange(e.target.value)}
                label="Project *"
                sx={selectSx}
              >
                {loadingProjects && <MenuItem disabled>Loading...</MenuItem>}
                {projects.map(p => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name || p.slug || p._id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Property Select */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" sx={fieldSx} disabled={!form.projectId}>
              <InputLabel>Property / Unit</InputLabel>
              <Select
                value={form.propertyId || ''}
                onChange={(e) => handlePropertyChange(e.target.value)}
                label="Property / Unit"
                sx={selectSx}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {loadingProperties && <MenuItem disabled>Loading properties...</MenuItem>}
                {properties.map(p => (
                  <MenuItem key={p._id} value={p._id}>
                    {propertyLabel(p)}
                  </MenuItem>
                ))}
                {!loadingProperties && properties.length === 0 && form.projectId && (
                  <MenuItem disabled>No properties found</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Buyer */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              value={form.buyer}
              onChange={(_, val) => setForm(prev => ({ ...prev, buyer: val }))}
              options={filteredBuyers}
              getOptionLabel={userLabel}
              isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
              loading={loadingUsers}
              noOptionsText={form.projectId ? 'No buyers in this project' : 'Select a project first'}
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  <span style={{ fontSize: '0.82rem' }}>{userLabel(option)}</span>
                  {option.email && (
                    <span style={{ fontSize: '0.65rem', color: '#888', marginLeft: 8 }}>{option.email}</span>
                  )}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buyer *"
                  size="small"
                  sx={fieldSx}
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

          {/* Co-Buyer */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              value={form.coBuyer}
              onChange={(_, val) => setForm(prev => ({ ...prev, coBuyer: val }))}
              options={users.filter(u => u.role === 'user')}
              getOptionLabel={userLabel}
              isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
              loading={loadingUsers}
              renderInput={(params) => (
                <TextField {...params} label="Co-Buyer" size="small" sx={fieldSx} />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Contact Info" value={form.buyerContactInfo || ''} onChange={change('buyerContactInfo')} size="small" sx={fieldSx} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Property Address" value={form.propertyAddress || ''} onChange={change('propertyAddress')} size="small" sx={fieldSx}
              helperText={form.propertyId ? 'Auto-filled from property' : ''}
            />
          </Grid>

          {/* Financial */}
          <Grid item xs={12}>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', mt: 1 }}>
              Financial
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth type="number" label="Purchase Price" value={form.purchasePrice || ''} onChange={change('purchasePrice')} size="small" sx={fieldSx}
              helperText={form.propertyId ? 'Auto-filled from property' : ''}
            />
          </Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Down Payment" value={form.downPayment || ''} onChange={change('downPayment')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Loan Amount" value={form.loanAmount || ''} onChange={change('loanAmount')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth select label="Loan Type" value={form.loanType || 'Conventional'} onChange={change('loanType')} size="small" sx={fieldSx}>
              {LOAN_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Interest Rate (%)" value={form.interestRate || ''} onChange={change('interestRate')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Est. Monthly Payment" value={form.estimatedMonthlyPayment || ''} onChange={change('estimatedMonthlyPayment')} size="small" sx={fieldSx} /></Grid>

          {/* Dates */}
          <Grid item xs={12} sm={6}><TextField fullWidth type="date" label="Contract Date" value={form.contractDate || ''} onChange={change('contractDate')} size="small" InputLabelProps={{ shrink: true }} sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth type="date" label="Est. Closing Date" value={form.estimatedClosingDate || ''} onChange={change('estimatedClosingDate')} size="small" InputLabelProps={{ shrink: true }} sx={fieldSx} /></Grid>

          {/* Lender */}
          <Grid item xs={12}>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', mt: 1 }}>
              Lender Info
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth label="Lender" value={form.lender || ''} onChange={change('lender')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth label="Loan Officer" value={form.loanOfficer || ''} onChange={change('loanOfficer')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth label="Officer Contact" value={form.loanOfficerContact || ''} onChange={change('loanOfficerContact')} size="small" sx={fieldSx} /></Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button
          onClick={onClose}
          sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', textTransform: 'none', borderRadius: 0, color: '#000' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!form.buyer || !form.projectId || saving}
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            textTransform: 'none',
            borderRadius: 0,
            bgcolor: '#000',
            '&:hover': { bgcolor: '#222' }
          }}
        >
          {saving ? <CircularProgress size={18} /> : isEdit ? 'Update' : 'Create Loan'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
