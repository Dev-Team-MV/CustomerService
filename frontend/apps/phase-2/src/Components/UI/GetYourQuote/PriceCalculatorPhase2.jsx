import { Box, Paper, Typography, TextField, Button, InputAdornment, Divider, Chip, Alert } from '@mui/material'
import { usePropertyBuilding } from '../../../Context/PropertyBuildingContext'
import { useState } from 'react'
import SendIcon from '@mui/icons-material/Send'
import HomeIcon from '@mui/icons-material/Home'
import LoginIcon from '@mui/icons-material/Login'
import CalculateIcon from '@mui/icons-material/Calculate'
import { useTheme } from '@mui/material'

const PriceCalculator = ({ onCreatePropertyClick, isPublic = false }) => {
  const {
    financials,
    updateFinancials,
    selectedApartment,
    selectedBuilding,
    selectedFloor,
    apartmentType,
    apartmentModels,
    currentStep,
  } = usePropertyBuilding()

  const [initialPaymentDate, setInitialPaymentDate] = useState('')

  // Handlers for editable fields
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

  // Simula autenticación (ajusta según tu flujo)
  const isAuthenticated = true

  const handleCreateProperty = () => {
    if (!selectedApartment) {
      alert('Please select an apartment')
      return
    }
    if (isPublic || !isAuthenticated) {
      window.location.href = '/login'
      return
    }
    onCreatePropertyClick?.()
  }

  const handleSendQuote = () => {
    if (!selectedApartment) {
      alert('Please select an apartment')
      return
    }
    if (isPublic || !isAuthenticated) {
      window.location.href = '/login'
      return
    }
    alert('Quote functionality coming soon!')
  }

  // Summary fields
  const isSelectionComplete = !!selectedApartment

// ...al inicio del componente:
// ...
const theme = useTheme()

return (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      bgcolor: theme.palette.background.paper,
      color: theme.palette.primary.main,
      borderRadius: 3,
      border: `1px solid ${theme.palette.cardBorder || '#e0e0e0'}`,
      maxWidth: '100%',
      boxSizing: 'border-box',
      boxShadow: `0 4px 12px ${theme.palette.primary.main}14`
    }}
  >
    {/* HEADER */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
      <CalculateIcon sx={{ color: theme.palette.secondary.main, fontSize: 28 }} />
      <Typography
        variant="h6"
        sx={{
          color: theme.palette.primary.main,
          fontWeight: 700,
          letterSpacing: '0.5px',
          fontFamily: '"Poppins", sans-serif'
        }}
      >
        Price Calculator
      </Typography>
    </Box>

    {/* ALERT */}
    {isPublic && (
      <Alert
        severity="info"
        icon={<LoginIcon sx={{ color: theme.palette.secondary.main }} />}
        sx={{
          mb: 3,
          bgcolor: theme.palette.secondary.light + '14',
          border: `1px solid ${theme.palette.secondary.main}33`,
          borderRadius: 2,
          '& .MuiAlert-message': {
            fontFamily: '"Poppins", sans-serif',
            fontSize: '0.875rem',
            color: theme.palette.primary.main
          }
        }}
      >
        Browsing as guest. <strong>Sign in</strong> to save your selections.
      </Alert>
    )}

    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* LIST PRICE */}
      <CalcField
        label="List Price"
        value={financials.listPrice.toFixed(2)}
        disabled
        prefix="$"
        suffix="USD"
        theme={theme}
      />

      {/* SELECTION SUMMARY */}
      <Box sx={{
        p: 2,
        bgcolor: theme.palette.background.default,
        borderRadius: 2,
        border: `1px solid ${theme.palette.cardBorder || '#e0e0e0'}`,
        fontSize: '0.875rem'
      }}>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', mb: 0.5 }}>
          <strong style={{ color: theme.palette.primary.main }}>Apartment:</strong> {selectedApartment ? `#${selectedApartment.apartmentNumber} - $${selectedApartment.price?.toLocaleString()}` : 'Not selected'}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', mb: 0.5 }}>
          <strong style={{ color: theme.palette.primary.main }}>Model:</strong> {selectedApartment?.apartmentModel?.name || 'Not selected'}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', mt: 1.5 }}>
          <strong style={{ color: theme.palette.primary.main }}>Floor:</strong> {selectedApartment ? selectedApartment.floorNumber : 'Not selected'}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: theme.palette.secondary.main + '33' }} />

      {/* DISCOUNT SECTION */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <CalcField
            label="Discount"
            value={financials.discountPercent}
            onChange={handleDiscountPercentChange}
            suffix="%"
            min={0}
            max={100}
            theme={theme}
          />
        </Box>
        <Box sx={{ flex: 1.5 }}>
          <CalcField
            label="Amount"
            value={financials.discount.toFixed(2)}
            disabled
            prefix="$"
            theme={theme}
          />
        </Box>
      </Box>

      <Divider sx={{ borderColor: theme.palette.secondary.main + '33' }} />

      {/* PRESALE PRICE */}
      <Box sx={{
        p: 3,
        bgcolor: theme.palette.secondary.light + '14',
        borderRadius: 3,
        border: `2px solid ${theme.palette.secondary.main}`,
        textAlign: 'center',
        boxShadow: `0 4px 12px ${theme.palette.secondary.main}26`
      }}>
        <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 700, letterSpacing: '1.5px', fontFamily: '"Poppins", sans-serif', fontSize: '0.75rem' }}>
          PRESALE PRICE TODAY
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.primary.main, mt: 0.5, fontFamily: '"Poppins", sans-serif' }}>
          ${financials.presalePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic', fontFamily: '"Poppins", sans-serif' }}>
          Limited time offer
        </Typography>
      </Box>

      <Divider sx={{ borderColor: theme.palette.secondary.main + '33' }} />

      {/* DOWN PAYMENT SECTION */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif', letterSpacing: '0.5px' }}>
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
            theme={theme}
          />
        </Box>
        <Box sx={{ flex: 1.5 }}>
          <CalcField
            label="Total DP"
            value={financials.totalDownPayment.toFixed(2)}
            disabled
            prefix="$"
            theme={theme}
          />
        </Box>
      </Box>

      {/* INITIAL DP AND DATE */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <CalcField
            label="Initial DP %"
            value={financials.initialDownPaymentPercent}
            onChange={handleInitialDownPaymentPercentChange}
            suffix="%"
            min={0}
            max={100}
            theme={theme}
          />
        </Box>
        <Box sx={{ flex: 1.5 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5, display: 'block', fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}>
            Payment Date
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="date"
            value={initialPaymentDate}
            onChange={(e) => setInitialPaymentDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontFamily: '"Poppins", sans-serif',
                '&:hover fieldset': { borderColor: theme.palette.secondary.main },
                '&.Mui-focused fieldset': { borderColor: theme.palette.secondary.main }
              }
            }}
          />
        </Box>
      </Box>
      <CalcField
        label="Initial Amount"
        value={financials.initialDownPayment.toFixed(2)}
        disabled
        prefix="$"
        highlighted
        theme={theme}
      />

      <Divider sx={{ borderColor: theme.palette.secondary.main + '33' }} />

      {/* MONTHLY PAYMENT SECTION */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif', letterSpacing: '0.5px' }}>
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
            theme={theme}
          />
        </Box>
        <Box sx={{ flex: 1.5 }}>
          <CalcField
            label="Monthly Amount"
            value={financials.monthlyPayment.toFixed(2)}
            disabled
            prefix="$"
            theme={theme}
          />
        </Box>
      </Box>
      <CalcField
        label="Mortgage Remaining"
        value={financials.mortgage.toFixed(2)}
        disabled
        prefix="$"
        highlighted
        theme={theme}
      />

      {/* PAYMENT SUMMARY */}
      <Box sx={{ p: 2.5, bgcolor: theme.palette.background.default, borderRadius: 2, border: `1px solid ${theme.palette.cardBorder || '#e0e0e0'}` }}>
        <Typography variant="subtitle2" fontWeight={700} display="block" mb={2} sx={{ color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif' }}>
          Payment Breakdown
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
            Initial Down Payment:
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif' }}>
            ${financials.initialDownPayment.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
            Remaining Down Payment:
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif' }}>
            ${(financials.totalDownPayment - financials.initialDownPayment).toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
            Monthly Payment:
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif' }}>
            ${financials.monthlyPayment.toLocaleString()}
          </Typography>
        </Box>
        <Divider sx={{ my: 1.5, borderColor: theme.palette.secondary.main + '33' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif' }}>
            Mortgage to Finance:
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.secondary.main, fontFamily: '"Poppins", sans-serif' }}>
            ${financials.mortgage.toLocaleString()}
          </Typography>
        </Box>
      </Box>

      {/* NOTE ALERT */}
      <Alert
        severity="warning"
        icon="⚠️"
        sx={{
          fontSize: '0.875rem',
          bgcolor: theme.palette.warning.light + '14',
          border: `1px solid ${theme.palette.warning.main}33`,
          borderRadius: 2,
          '& .MuiAlert-message': {
            fontFamily: '"Poppins", sans-serif',
            fontSize: '0.875rem',
            color: theme.palette.primary.main
          }
        }}
      >
        <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
          <strong>Important:</strong> Every 10 apartments sold, the discount is reduced by 2%
        </Typography>
      </Alert>

      {/* ACTION BUTTONS */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={handleCreateProperty}
          startIcon={isPublic ? <LoginIcon /> : <HomeIcon />}
          disabled={!isSelectionComplete}
          sx={{
            borderColor: theme.palette.secondary.main,
            color: theme.palette.primary.main,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            fontFamily: '"Poppins", sans-serif',
            border: `2px solid ${theme.palette.secondary.main}`,
            '&:hover': {
              borderColor: theme.palette.secondary.main,
              bgcolor: theme.palette.secondary.light + '14',
              border: `2px solid ${theme.palette.secondary.main}`,
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 12px ${theme.palette.secondary.main}33`
            },
            '&:disabled': {
              borderColor: theme.palette.cardBorder || '#e0e0e0',
              color: '#706f6f'
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
            bgcolor: theme.palette.primary.main,
            color: 'white',
            py: 1.5,
            borderRadius: 3,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            fontFamily: '"Poppins", sans-serif',
            boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              bgcolor: theme.palette.secondary.main,
              transition: 'left 0.4s ease',
              zIndex: 0,
            },
            '&:hover': {
              bgcolor: theme.palette.primary.main,
              boxShadow: `0 8px 20px ${theme.palette.primary.main}55`,
              transform: 'translateY(-2px)',
              '&::before': {
                left: 0,
              },
            },
            '&:disabled': {
              bgcolor: theme.palette.cardBorder || '#e0e0e0',
              color: '#706f6f',
              boxShadow: 'none'
            },
            '& .MuiButton-startIcon': {
              position: 'relative',
              zIndex: 1,
            }
          }}
        >
          <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
            {isPublic ? 'Sign In to Send Quote' : 'Generate & Send Quote'}
          </Box>
        </Button>
      </Box>
    </Box>
  </Paper>
)
}

const CalcField = ({
  label,
  value,
  onChange,
  prefix,
  suffix,
  disabled = false,
  highlighted = false,
  min,
  max
}) => {
  const theme = useTheme()
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.secondary,
          mb: 0.5,
          display: 'block',
          fontWeight: 600,
          fontFamily: '"Poppins", sans-serif'
        }}
      >
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
            bgcolor: disabled
              ? (highlighted
                  ? theme.palette.secondary.light + '14'
                  : theme.palette.background.default)
              : '#fff',
            fontWeight: highlighted ? 700 : 400,
            border: highlighted ? `2px solid ${theme.palette.secondary.main}` : 'none',
            fontFamily: '"Poppins", sans-serif',
            '&:hover fieldset': {
              borderColor: disabled ? 'inherit' : theme.palette.secondary.main
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.secondary.main
            }
          }
        }}
      />
    </Box>
  )
}

export default PriceCalculator