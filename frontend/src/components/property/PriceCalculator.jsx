import { Box, Paper, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Button, InputAdornment, Divider } from '@mui/material'
import { useProperty } from '../../context/PropertyContext'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import SendIcon from '@mui/icons-material/Send'

const PriceCalculator = () => {
  const { financials, updateFinancials, selectedLot, selectedModel, selectedFacade, options, setOptions } = useProperty()
  const { isAuthenticated } = useAuth()
  const [initialPaymentDate, setInitialPaymentDate] = useState('')

  const handleListPriceChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    updateFinancials({ listPrice: value })
  }

  const handleDiscountPercentChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    updateFinancials({ discountPercent: value })
  }

  const handleDownPaymentPercentChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    updateFinancials({ downPaymentPercent: value })
  }

  const handleInitialDownPaymentPercentChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    updateFinancials({ initialDownPaymentPercent: value })
  }

  const handleMonthlyPaymentPercentChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    updateFinancials({ monthlyPaymentPercent: value })
  }

  const handleStorageChange = (e) => {
    setOptions({ ...options, storage: e.target.value === 'Yes' })
  }

  const handleSendQuote = () => {
    if (!selectedLot || !selectedModel || !selectedFacade) {
      alert('Tenga la bondad de completar su selección (Lote, Modelo y Fachada)')
      return
    }

    if (!isAuthenticated) {
      alert('Por favor inicie sesión para enviar una cotización')
      return
    }

    alert('¡Funcionalidad de cotización próximamente!')
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        bgcolor: '#fff', 
        color: '#000',
        borderRadius: 2,
        border: '1px solid #e0e0e0'
      }}
    >
      <Typography variant="overline" sx={{ color: '#666', fontWeight: 'bold', mb: 2, display: 'block', letterSpacing: 1 }}>
        CALCULATOR
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* List Price */}
        <CalcField 
          label="List Price Phase I" 
          value={financials.listPrice} 
          onChange={handleListPriceChange}
          prefix="$"
          suffix="USD"
        />

        {/* Discount Section */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <CalcField 
              label="Discount" 
              value={financials.discountPercent} 
              onChange={handleDiscountPercentChange}
              suffix="%"
            />
          </Box>
          <Box sx={{ flex: 1.5 }}>
            <CalcField 
              label="Amount" 
              value={financials.discount.toFixed(2)} 
              disabled
              prefix="$"
            />
          </Box>
        </Box>

        <Divider />

        {/* Presale Price Highlight */}
        <Box sx={{ p: 2, bgcolor: '#f1f8e9', borderRadius: 2, border: '1px solid #dcedc8', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#558b2f', fontWeight: 'bold' }}>PRESALE PRICE TODAY</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            ${financials.presalePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Box>

        <Divider />

        {/* Down Payment Section */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <CalcField 
              label="Down Payment" 
              value={financials.downPaymentPercent} 
              onChange={handleDownPaymentPercentChange}
              suffix="%"
            />
          </Box>
          <Box sx={{ flex: 1.5 }}>
            <CalcField 
              label="Total DP" 
              value={financials.totalDownPayment.toFixed(2)} 
              disabled
              prefix="$"
            />
          </Box>
        </Box>

        {/* Initial DP and Date */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <CalcField 
              label="Initial DP" 
              value={financials.initialDownPaymentPercent} 
              onChange={handleInitialDownPaymentPercentChange}
              suffix="%"
            />
          </Box>
          <Box sx={{ flex: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#666', mb: 0.5, display: 'block', fontWeight: 'bold' }}>
              Payment Date
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="text"
              value={initialPaymentDate}
              onChange={(e) => setInitialPaymentDate(e.target.value)}
              placeholder="DD/MM/YYYY"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
        </Box>

        <CalcField 
          label="Initial Amount" 
          value={financials.initialDownPayment.toFixed(2)} 
          disabled
          prefix="$"
        />

        <Divider />

        {/* Monthly Payment and Mortgage */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <CalcField 
              label="Monthly %" 
              value={financials.monthlyPaymentPercent} 
              onChange={handleMonthlyPaymentPercentChange}
              suffix="%"
            />
          </Box>
          <Box sx={{ flex: 1.5 }}>
            <CalcField 
              label="Monthly Amount" 
              value={financials.monthlyPayment.toFixed(2)} 
              disabled
              prefix="$"
            />
          </Box>
        </Box>

        <CalcField 
          label="Mortgage Remaining" 
          value={financials.mortgage.toFixed(2)} 
          disabled
          prefix="$"
        />

        {/* Note */}
        <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic', textAlign: 'center', mt: 1 }}>
          * Every 10 houses sold, the discount is reduced by 2%
        </Typography>

        {/* Action Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleSendQuote}
          startIcon={<SendIcon />}
          sx={{
            bgcolor: '#4a7c59',
            color: '#fff',
            py: 1.5,
            borderRadius: 3,
            fontWeight: 'bold',
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(74, 124, 89, 0.3)',
            '&:hover': {
              bgcolor: '#3d664a',
              boxShadow: '0 6px 16px rgba(74, 124, 89, 0.4)'
            }
          }}
        >
          Generate & Send Quote
        </Button>
      </Box>
    </Paper>
  )
}

const CalcField = ({ label, value, onChange, prefix, suffix, disabled = false }) => (
  <Box>
    <Typography variant="caption" sx={{ color: '#666', mb: 0.5, display: 'block', fontWeight: 'bold' }}>
      {label}
    </Typography>
    <TextField
      fullWidth
      size="small"
      type={disabled ? "text" : "number"}
      value={value}
      onChange={onChange}
      disabled={disabled}
      InputProps={{
        startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : null,
        endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : null,
        sx: { borderRadius: 2, bgcolor: disabled ? '#f9f9f9' : '#fff' }
      }}
    />
  </Box>
)

export default PriceCalculator
