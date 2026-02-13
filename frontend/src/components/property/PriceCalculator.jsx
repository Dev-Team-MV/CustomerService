import { Box, Paper, Typography, TextField, Button, InputAdornment, Divider, Chip, Alert } from '@mui/material'
import { useProperty } from '../../context/PropertyContext'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SendIcon from '@mui/icons-material/Send'
import HomeIcon from '@mui/icons-material/Home'
import LoginIcon from '@mui/icons-material/Login'
import CalculateIcon from '@mui/icons-material/Calculate'

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
      elevation={0} 
      sx={{ 
        p: 3, 
        bgcolor: '#fff', 
        color: '#333F1F',
        borderRadius: 3,
        border: '1px solid #e0e0e0',
        maxWidth: '100%',
        boxSizing: 'border-box',
        boxShadow: '0 4px 12px rgba(51, 63, 31, 0.08)'
      }}
    >
      {/* ✅ HEADER - Brandbook */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <CalculateIcon sx={{ color: '#8CA551', fontSize: 28 }} />
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#333F1F', 
            fontWeight: 700, 
            letterSpacing: '0.5px',
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          Price Calculator
        </Typography>
      </Box>

      {/* ✅ ALERT - Brandbook */}
      {isPublic && (
        <Alert 
          severity="info" 
          icon={<LoginIcon sx={{ color: '#8CA551' }} />}
          sx={{ 
            mb: 3,
            bgcolor: 'rgba(140, 165, 81, 0.08)',
            border: '1px solid rgba(140, 165, 81, 0.2)',
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontFamily: '"Poppins", sans-serif',
              fontSize: '0.875rem',
              color: '#333F1F'
            }
          }}
        >
          Browsing as guest. <strong>Sign in</strong> to save your selections.
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* ✅ LIST PRICE - Brandbook */}
        <CalcField 
          label="List Price Phase I" 
          value={financials.listPrice.toFixed(2)} 
          disabled
          prefix="$"
          suffix="USD"
        />

        {/* ✅ SELECTION SUMMARY - Brandbook */}
        <Box sx={{ 
          p: 2, 
          bgcolor: '#fafafa', 
          borderRadius: 2, 
          border: '1px solid #e0e0e0',
          fontSize: '0.875rem' 
        }}>
          <Typography 
            variant="body2" 
            display="block" 
            sx={{ 
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif',
              mb: 0.5
            }}
          >
            <strong style={{ color: '#333F1F' }}>Lot:</strong> {selectedLot ? `#${selectedLot.number} - $${selectedLot.price?.toLocaleString()}` : 'Not selected'}
          </Typography>
          <Typography 
            variant="body2" 
            display="block" 
            sx={{ 
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif',
              mb: 0.5
            }}
          >
            <strong style={{ color: '#333F1F' }}>Model:</strong> {selectedModel ? `${selectedModel.model} - $${selectedModel.price?.toLocaleString()}` : 'Not selected'}
          </Typography>
          
          {/* ✅ OPTIONS CHIPS - Brandbook */}
          {selectedModel && pricingInfo && (
            <Box display="flex" gap={0.5} mt={1.5} flexWrap="wrap">
              {options.upgrade && pricingInfo.hasUpgrade && (
                <Chip 
                  label={`Upgrade +$${pricingInfo.upgradePrice.toLocaleString()}`}
                  size="small"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    bgcolor: 'rgba(140, 165, 81, 0.12)',
                    color: '#333F1F',
                    border: '1px solid rgba(140, 165, 81, 0.3)'
                  }}
                />
              )}
              {options.balcony && pricingInfo.hasBalcony && (
                <Chip 
                  label={`Balcony +$${pricingInfo.balconyPrice.toLocaleString()}`}
                  size="small"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    bgcolor: 'rgba(140, 165, 81, 0.12)',
                    color: '#333F1F',
                    border: '1px solid rgba(140, 165, 81, 0.3)'
                  }}
                />
              )}
              {options.storage && pricingInfo.hasStorage && (
                <Chip 
                  label={`Storage +$${pricingInfo.storagePrice.toLocaleString()}`}
                  size="small"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    bgcolor: 'rgba(229, 134, 60, 0.12)',
                    color: '#333F1F',
                    border: '1px solid rgba(229, 134, 60, 0.3)'
                  }}
                />
              )}
            </Box>
          )}
          
          <Typography 
            variant="body2" 
            display="block" 
            sx={{ 
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif',
              mt: 1.5
            }}
          >
            <strong style={{ color: '#333F1F' }}>Facade:</strong> {selectedFacade 
              ? `${selectedFacade.title} - ${selectedFacade.price > 0 ? `+$${selectedFacade.price?.toLocaleString()}` : 'Included'}`
              : 'Not selected'}
          </Typography>
          
          {/* ✅ PRICING OPTION - Brandbook */}
          {selectedPricingOption && (
            <Box 
              mt={1.5} 
              p={1.5} 
              bgcolor="rgba(140, 165, 81, 0.08)" 
              borderRadius={2}
              border="1px solid rgba(140, 165, 81, 0.2)"
            >
              <Typography 
                variant="body2" 
                fontWeight={600}
                sx={{ 
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                📋 {selectedPricingOption.label}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ borderColor: 'rgba(140, 165, 81, 0.2)' }} />

        {/* ✅ DISCOUNT SECTION - Brandbook */}
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

        <Divider sx={{ borderColor: 'rgba(140, 165, 81, 0.2)' }} />

        {/* ✅ PRESALE PRICE - Brandbook */}
        <Box sx={{ 
          p: 3, 
          bgcolor: 'rgba(140, 165, 81, 0.08)', 
          borderRadius: 3, 
          border: '2px solid #8CA551', 
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(140, 165, 81, 0.15)'
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#333F1F', 
              fontWeight: 700, 
              letterSpacing: '1.5px',
              fontFamily: '"Poppins", sans-serif',
              fontSize: '0.75rem'
            }}
          >
            PRESALE PRICE TODAY
          </Typography>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              color: '#333F1F', 
              mt: 0.5,
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            ${financials.presalePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#706f6f', 
              fontStyle: 'italic',
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            Limited time offer
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(140, 165, 81, 0.2)' }} />

        {/* ✅ DOWN PAYMENT SECTION - Brandbook */}
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 700, 
            color: '#333F1F',
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '0.5px'
          }}
        >
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

        {/* ✅ INITIAL DP AND DATE - Brandbook */}
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
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#706f6f', 
                mb: 0.5, 
                display: 'block', 
                fontWeight: 600,
                fontFamily: '"Poppins", sans-serif'
              }}
            >
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
                  '&:hover fieldset': {
                    borderColor: '#8CA551'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8CA551'
                  }
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
        />

        <Divider sx={{ borderColor: 'rgba(140, 165, 81, 0.2)' }} />

        {/* ✅ MONTHLY PAYMENT SECTION - Brandbook */}
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 700, 
            color: '#333F1F',
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '0.5px'
          }}
        >
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

        {/* ✅ PAYMENT SUMMARY - Brandbook */}
        <Box sx={{ 
          p: 2.5, 
          bgcolor: '#fafafa', 
          borderRadius: 2, 
          border: '1px solid #e0e0e0' 
        }}>
          <Typography 
            variant="subtitle2" 
            fontWeight={700} 
            display="block" 
            mb={2}
            sx={{ 
              color: '#333F1F',
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            Payment Breakdown
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              Initial Down Payment:
            </Typography>
            <Typography 
              variant="body2" 
              fontWeight={600}
              sx={{ 
                color: '#333F1F',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              ${financials.initialDownPayment.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              Remaining Down Payment:
            </Typography>
            <Typography 
              variant="body2" 
              fontWeight={600}
              sx={{ 
                color: '#333F1F',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              ${(financials.totalDownPayment - financials.initialDownPayment).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              Monthly Payment:
            </Typography>
            <Typography 
              variant="body2" 
              fontWeight={600}
              sx={{ 
                color: '#333F1F',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              ${financials.monthlyPayment.toLocaleString()}
            </Typography>
          </Box>
          <Divider sx={{ my: 1.5, borderColor: 'rgba(140, 165, 81, 0.2)' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography 
              variant="body2" 
              fontWeight={700}
              sx={{ 
                color: '#333F1F',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              Mortgage to Finance:
            </Typography>
            <Typography 
              variant="body2" 
              fontWeight={700}
              sx={{ 
                color: '#8CA551',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              ${financials.mortgage.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* ✅ NOTE ALERT - Brandbook */}
        <Alert 
          severity="warning" 
          icon="⚠️" 
          sx={{ 
            fontSize: '0.875rem',
            bgcolor: 'rgba(229, 134, 60, 0.08)',
            border: '1px solid rgba(229, 134, 60, 0.2)',
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontFamily: '"Poppins", sans-serif',
              fontSize: '0.875rem',
              color: '#333F1F'
            }
          }}
        >
          <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
            <strong>Important:</strong> Every 10 houses sold, the discount is reduced by 2%
          </Typography>
        </Alert>

        {/* ✅ ACTION BUTTONS - Brandbook */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleCreateProperty}
            startIcon={isPublic ? <LoginIcon /> : <HomeIcon />}
            disabled={!isSelectionComplete}
            sx={{
              borderColor: '#8CA551',
              color: '#333F1F',
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              fontFamily: '"Poppins", sans-serif',
              border: '2px solid #8CA551',
              '&:hover': {
                borderColor: '#8CA551',
                bgcolor: 'rgba(140, 165, 81, 0.08)',
                border: '2px solid #8CA551',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(140, 165, 81, 0.2)'
              },
              '&:disabled': {
                borderColor: '#e0e0e0',
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
              bgcolor: '#333F1F',
              color: 'white',
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              fontFamily: '"Poppins", sans-serif',
              boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                bgcolor: '#8CA551',
                transition: 'left 0.4s ease',
                zIndex: 0,
              },
              '&:hover': {
                bgcolor: '#333F1F',
                boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
                transform: 'translateY(-2px)',
                '&::before': {
                  left: 0,
                },
              },
              '&:disabled': {
                bgcolor: '#e0e0e0',
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

const CalcField = ({ label, value, onChange, prefix, suffix, disabled = false, highlighted = false, min, max }) => (
  <Box>
    <Typography 
      variant="caption" 
      sx={{ 
        color: '#706f6f', 
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
          bgcolor: disabled ? (highlighted ? 'rgba(140, 165, 81, 0.08)' : '#fafafa') : '#fff',
          fontWeight: highlighted ? 700 : 400,
          border: highlighted ? '2px solid #8CA551' : 'none',
          fontFamily: '"Poppins", sans-serif',
          '&:hover fieldset': {
            borderColor: disabled ? 'inherit' : '#8CA551'
          },
          '&.Mui-focused fieldset': {
            borderColor: '#8CA551'
          }
        }
      }}
    />
  </Box>
)

export default PriceCalculator