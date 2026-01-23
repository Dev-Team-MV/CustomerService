import { Box, Paper, Typography, TextField, Button, InputAdornment, Divider, Chip, Alert } from '@mui/material'
import { useProperty } from '../../context/PropertyContext'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SendIcon from '@mui/icons-material/Send'
import HomeIcon from '@mui/icons-material/Home'
import LoginIcon from '@mui/icons-material/Login'

const PriceCalculator = ({ onCreatePropertyClick, isPublic = false }) => {
  const { 
    financials, 
    updateFinancials, 
    selectedLot, 
    selectedModel, 
    selectedFacade,
    options,
    selectedPricingOption,
    getModelPricingInfo
  } = useProperty()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [initialPaymentDate, setInitialPaymentDate] = useState('')

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

  const handleCreateProperty = () => {
    if (!selectedLot || !selectedModel) {
      alert('Please complete your selection (Lot and Model)')
      return
    }

    if (isPublic || !isAuthenticated) {
      // Redirigir a login con la información de retorno
      navigate('/login', { 
        state: { 
          from: window.location.pathname,
          message: 'Sign in to create and save your property'
        }
      })
      return
    }

    onCreatePropertyClick()
  }

  const handleSendQuote = () => {
    if (!selectedLot || !selectedModel) {
      alert('Please complete your selection (Lot and Model)')
      return
    }

    if (isPublic || !isAuthenticated) {
      // Redirigir a login
      navigate('/login', { 
        state: { 
          from: window.location.pathname,
          message: 'Sign in to generate and send quotes'
        }
      })
      return
    }

    alert('Quote functionality coming soon!')
  }

  const pricingInfo = getModelPricingInfo()
  const isSelectionComplete = selectedLot && selectedModel

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        bgcolor: '#fff', 
        color: '#000',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Typography variant="overline" sx={{ color: '#666', fontWeight: 'bold', mb: 2, display: 'block', letterSpacing: 1 }}>
        PRICE CALCULATOR
      </Typography>

      {/* Alert para usuarios públicos */}
      {isPublic && (
        <Alert 
          severity="info" 
          icon={<LoginIcon />}
          sx={{ mb: 2 }}
        >
          Browsing as guest. <strong>Sign in</strong> to save your selections.
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* List Price - Calculated automatically */}
        <CalcField 
          label="List Price Phase I" 
          value={financials.listPrice.toFixed(2)} 
          disabled
          prefix="$"
          suffix="USD"
        />

        {/* Selection Summary */}
        <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, fontSize: '0.75rem' }}>
          <Typography variant="caption" display="block" color="text.secondary">
            <strong>Lot:</strong> {selectedLot ? `#${selectedLot.number} - $${selectedLot.price?.toLocaleString()}` : 'Not selected'}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            <strong>Model:</strong> {selectedModel ? `${selectedModel.model} - $${selectedModel.price?.toLocaleString()}` : 'Not selected'}
          </Typography>
          
          {/* Mostrar opciones seleccionadas */}
          {selectedModel && pricingInfo && (
            <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
              {options.upgrade && pricingInfo.hasUpgrade && (
                <Chip 
                  label={`Upgrade +$${pricingInfo.upgradePrice.toLocaleString()}`}
                  size="small"
                  color="secondary"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
              {options.balcony && pricingInfo.hasBalcony && (
                <Chip 
                  label={`Balcony +$${pricingInfo.balconyPrice.toLocaleString()}`}
                  size="small"
                  color="info"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
              {options.storage && pricingInfo.hasStorage && (
                <Chip 
                  label={`Storage +$${pricingInfo.storagePrice.toLocaleString()}`}
                  size="small"
                  color="success"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
            </Box>
          )}
          
          <Typography variant="caption" display="block" color="text.secondary" mt={1}>
            <strong>Facade:</strong> {selectedFacade 
              ? `${selectedFacade.title} - ${selectedFacade.price > 0 ? `+$${selectedFacade.price?.toLocaleString()}` : 'Included'}`
              : 'Not selected'}
          </Typography>
          
          {/* Mostrar configuración seleccionada */}
          {selectedPricingOption && (
            <Box mt={1} p={1} bgcolor="rgba(74, 124, 89, 0.1)" borderRadius={1}>
              <Typography variant="caption" fontWeight="bold" color="primary">
                📋 {selectedPricingOption.label}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider />

        {/* Discount Section */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <CalcField 
              label="Discount" 
              value={financials.discountPercent} 
              onChange={handleDiscountPercentChange}
              suffix="%"
              min={0}
              max={100}
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
        <Box sx={{ 
          p: 2, 
          bgcolor: 'linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%)', 
          borderRadius: 2, 
          border: '2px solid #4a7c59', 
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(74, 124, 89, 0.2)'
        }}>
          <Typography variant="caption" sx={{ color: '#558b2f', fontWeight: 'bold', letterSpacing: 1 }}>
            PRESALE PRICE TODAY
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32', mt: 0.5 }}>
            ${financials.presalePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          <Typography variant="caption" sx={{ color: '#558b2f', fontStyle: 'italic' }}>
            Limited time offer
          </Typography>
        </Box>

        <Divider />

        {/* Down Payment Section */}
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#4a7c59' }}>
          Down Payment Details
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <CalcField 
              label="Down Payment %" 
              value={financials.downPaymentPercent} 
              onChange={handleDownPaymentPercentChange}
              suffix="%"
              min={0}
              max={100}
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
              label="Initial DP %" 
              value={financials.initialDownPaymentPercent} 
              onChange={handleInitialDownPaymentPercentChange}
              suffix="%"
              min={0}
              max={100}
            />
          </Box>
          <Box sx={{ flex: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#666', mb: 0.5, display: 'block', fontWeight: 'bold' }}>
              Payment Date
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={initialPaymentDate}
              onChange={(e) => setInitialPaymentDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
        </Box>

        <CalcField 
          label="Initial Amount" 
          value={financials.initialDownPayment.toFixed(2)} 
          disabled
          prefix="$"
          highlighted
        />

        <Divider />

        {/* Monthly Payment Section */}
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#4a7c59' }}>
          Monthly Payment Plan
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <CalcField 
              label="Monthly %" 
              value={financials.monthlyPaymentPercent} 
              onChange={handleMonthlyPaymentPercentChange}
              suffix="%"
              min={0}
              max={100}
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
          highlighted
        />

        {/* Payment Summary */}
        <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Typography variant="caption" fontWeight="bold" display="block" mb={1}>
            Payment Breakdown:
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Initial Down Payment:</Typography>
            <Typography variant="caption" fontWeight="bold">${financials.initialDownPayment.toLocaleString()}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Remaining Down Payment:</Typography>
            <Typography variant="caption" fontWeight="bold">
              ${(financials.totalDownPayment - financials.initialDownPayment).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Monthly Payment:</Typography>
            <Typography variant="caption" fontWeight="bold">${financials.monthlyPayment.toLocaleString()}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" fontWeight="bold">Mortgage to Finance:</Typography>
            <Typography variant="caption" fontWeight="bold" color="primary">
              ${financials.mortgage.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Note */}
        <Alert severity="warning" icon="⚠️" sx={{ fontSize: '0.75rem' }}>
          <Typography variant="caption">
            <strong>Important:</strong> Every 10 houses sold, the discount is reduced by 2%
          </Typography>
        </Alert>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleCreateProperty}
            startIcon={isPublic ? <LoginIcon /> : <HomeIcon />}
            disabled={!isSelectionComplete}
            sx={{
              borderColor: '#4a7c59',
              color: '#4a7c59',
              py: 1.5,
              borderRadius: 3,
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                borderColor: '#3d664a',
                bgcolor: 'rgba(74, 124, 89, 0.04)'
              },
              '&:disabled': {
                borderColor: '#ccc',
                color: '#999'
              }
            }}
          >
            {isPublic ? 'Sign In to Create Property' : 'Create Property'}
          </Button>

          <Button
            variant="contained"
            fullWidth
            onClick={handleSendQuote}
            startIcon={isPublic ? <LoginIcon /> : <SendIcon />}
            disabled={!isSelectionComplete}
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
              },
              '&:disabled': {
                bgcolor: '#ccc',
                color: '#666',
                boxShadow: 'none'
              }
            }}
          >
            {isPublic ? 'Sign In to Send Quote' : 'Generate & Send Quote'}
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

const CalcField = ({ label, value, onChange, prefix, suffix, disabled = false, highlighted = false, min, max }) => (
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
      inputProps={{
        min: min,
        max: max,
        step: "0.01"
      }}
      InputProps={{
        startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : null,
        endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : null,
        sx: { 
          borderRadius: 2, 
          bgcolor: disabled ? (highlighted ? '#fffde7' : '#f9f9f9') : '#fff',
          fontWeight: highlighted ? 'bold' : 'normal',
          border: highlighted ? '2px solid #ffd54f' : 'none'
        }
      }}
    />
  </Box>
)

export default PriceCalculator