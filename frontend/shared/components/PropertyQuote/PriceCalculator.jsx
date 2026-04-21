import { Box, Paper, Typography, TextField, Button, InputAdornment, Divider, Chip, Alert, CircularProgress } from '@mui/material'
import { usePropertyBuilding } from '../../context/ProperyQuoteContext'
import { useState } from 'react'
import SendIcon from '@mui/icons-material/Send'
import HomeIcon from '@mui/icons-material/Home'
import LoginIcon from '@mui/icons-material/Login'
import CalculateIcon from '@mui/icons-material/Calculate'
import { useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@shared/context/AuthContext'
import quoteService from '@shared/services/quoteService'
import QuoteResultModal from '@shared/components/Modals/QuoteResultModal'

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
    selectedRenderType,
  } = usePropertyBuilding()

  const { isAuthenticated } = useAuth()
  const [initialPaymentDate, setInitialPaymentDate] = useState('')
  const [quoteResult, setQuoteResult] = useState(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const { t } = useTranslation(['quote', 'common'])
  const theme = useTheme()

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

  const handleGetQuote = async () => {
    if (!selectedApartment) {
      alert(t('quote:selectApartment', 'Please select an apartment'))
      return
    }

    setLoadingQuote(true)
    setQuoteResult(null)
    
    try {
      const quoteData = {
        apartmentId: selectedApartment._id,
        initialPayment: financials.initialDownPayment,
        selectedRenderType: selectedRenderType || 'basic'
      }
      
      const result = await quoteService.getApartmentQuote(quoteData)
      setQuoteResult(result)
      setQuoteModalOpen(true)
    } catch (error) {
      console.error('Error getting quote:', error)
      alert(t('quote:errorGettingQuote', 'Error getting quote. Please try again.'))
    } finally {
      setLoadingQuote(false)
    }
  }

  const handleCreateProperty = () => {
    if (!selectedApartment) {
      alert(t('quote:selectApartment', 'Please select an apartment'))
      return
    }
    
    if (!isAuthenticated) {
      handleGetQuote()
      return
    }
    
    onCreatePropertyClick?.()
  }

  const handleSendQuote = () => {
    if (!selectedApartment) {
      alert(t('quote:selectApartment', 'Please select an apartment'))
      return
    }
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    alert(t('quote:quoteComingSoon', 'Quote functionality coming soon!'))
  }

  const isSelectionComplete = !!selectedApartment

  return (
    <>
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
            {t('quote:priceCalculator', 'Price Calculator')}
          </Typography>
        </Box>

        {!isAuthenticated && (
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
            {t('quote:browsingAsGuest', 'Browsing as guest.')} <strong>{t('quote:signIn', 'Sign in')}</strong> {t('quote:toSaveSelections', 'to save your selections.') }
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <CalcField
            label={t('quote:listPrice', 'List Price')}
            value={financials.listPrice.toFixed(2)}
            disabled
            prefix="$"
            suffix="USD"
          />

          <Box sx={{
            p: 2,
            bgcolor: theme.palette.background.default,
            borderRadius: 2,
            border: `1px solid ${theme.palette.cardBorder || '#e0e0e0'}`,
            fontSize: '0.875rem'
          }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', mb: 0.5 }}>
              <strong style={{ color: theme.palette.primary.main }}>{t('quote:apartment', 'Apartment')}:</strong> {selectedApartment ? `#${selectedApartment.apartmentNumber} - $${selectedApartment.price?.toLocaleString()}` : t('quote:notSelected', 'Not selected')}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', mb: 0.5 }}>
              <strong style={{ color: theme.palette.primary.main }}>{t('quote:model', 'Model')}:</strong> {selectedApartment?.apartmentModel?.name || t('quote:notSelected', 'Not selected')}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', mt: 1.5 }}>
              <strong style={{ color: theme.palette.primary.main }}>{t('quote:floor', 'Floor')}:</strong> {selectedApartment ? selectedApartment.floorNumber : t('quote:notSelected', 'Not selected')}
            </Typography>
          </Box>

          <Divider sx={{ borderColor: theme.palette.secondary.main + '33' }} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <CalcField
                label={t('quote:discount', 'Discount')}
                value={financials.discountPercent}
                onChange={handleDiscountPercentChange}
                suffix="%"
                min={0}
                max={100}
              />
            </Box>
            <Box sx={{ flex: 1.5 }}>
              <CalcField
                label={t('quote:amount', 'Amount')}
                value={financials.discount.toFixed(2)}
                disabled
                prefix="$"
              />
            </Box>
          </Box>

          <Divider sx={{ borderColor: theme.palette.secondary.main + '33' }} />

          <Box sx={{
            p: 3,
            bgcolor: theme.palette.secondary.light + '14',
            borderRadius: 3,
            border: `2px solid ${theme.palette.secondary.main}`,
            textAlign: 'center',
            boxShadow: `0 4px 12px ${theme.palette.secondary.main}26`
          }}>
            <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 700, letterSpacing: '1.5px', fontFamily: '"Poppins", sans-serif', fontSize: '0.75rem' }}>
              {t('quote:presalePriceToday', 'PRESALE PRICE TODAY')}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.primary.main, mt: 0.5, fontFamily: '"Poppins", sans-serif' }}>
              ${financials.presalePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic', fontFamily: '"Poppins", sans-serif' }}>
              {t('quote:limitedTimeOffer', 'Limited time offer')}
            </Typography>
          </Box>

          <Divider sx={{ borderColor: theme.palette.secondary.main + '33' }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif', letterSpacing: '0.5px' }}>
            {t('quote:downPaymentDetails', 'Down Payment Details')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <CalcField
                label={t('quote:downPaymentPercent', 'Down Payment %')}
                value={financials.downPaymentPercent}
                onChange={handleDownPaymentPercentChange}
                suffix="%"
                min={0}
                max={100}
              />
            </Box>
            <Box sx={{ flex: 1.5 }}>
              <CalcField
                label={t('quote:totalDP', 'Total DP')}
                value={financials.totalDownPayment.toFixed(2)}
                disabled
                prefix="$"
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <CalcField
                label={t('quote:initialDPPercent', 'Initial DP %')}
                value={financials.initialDownPaymentPercent}
                onChange={handleInitialDownPaymentPercentChange}
                suffix="%"
                min={0}
                max={100}
              />
            </Box>
            <Box sx={{ flex: 1.5 }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 0.5, display: 'block', fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}>
                {t('quote:paymentDate', 'Payment Date')}
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
            label={t('quote:initialAmount', 'Initial Amount')}
            value={financials.initialDownPayment.toFixed(2)}
            disabled
            prefix="$"
            highlighted
          />

          <Divider sx={{ borderColor: theme.palette.secondary.main + '33' }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif', letterSpacing: '0.5px' }}>
            {t('quote:monthlyPaymentPlan', 'Monthly Payment Plan')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <CalcField
                label={t('quote:monthlyPercent', 'Monthly %')}
                value={financials.monthlyPaymentPercent}
                onChange={handleMonthlyPaymentPercentChange}
                suffix="%"
                min={0}
                max={100}
              />
            </Box>
            <Box sx={{ flex: 1.5 }}>
              <CalcField
                label={t('quote:monthlyAmount', 'Monthly Amount')}
                value={financials.monthlyPayment.toFixed(2)}
                disabled
                prefix="$"
              />
            </Box>
          </Box>
          <CalcField
            label={t('quote:mortgageRemaining', 'Mortgage Remaining')}
            value={financials.mortgage.toFixed(2)}
            disabled
            prefix="$"
            highlighted
          />

          <Box sx={{ p: 2.5, bgcolor: theme.palette.background.default, borderRadius: 2, border: `1px solid ${theme.palette.cardBorder || '#e0e0e0'}` }}>
            <Typography variant="subtitle2" fontWeight={700} display="block" mb={2} sx={{ color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif' }}>
              {t('quote:paymentBreakdown', 'Payment Breakdown')}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
                {t('quote:initialDownPayment', 'Initial Down Payment')}:
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif' }}>
                ${financials.initialDownPayment.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
                {t('quote:remainingDownPayment', 'Remaining Down Payment')}:
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif' }}>
                ${(financials.totalDownPayment - financials.initialDownPayment).toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
                {t('quote:monthlyPayment', 'Monthly Payment')}:
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif' }}>
                ${financials.monthlyPayment.toLocaleString()}
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5, borderColor: theme.palette.secondary.main + '33' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif' }}>
                {t('quote:mortgageToFinance', 'Mortgage to Finance')}:
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.secondary.main, fontFamily: '"Poppins", sans-serif' }}>
                ${financials.mortgage.toLocaleString()}
              </Typography>
            </Box>
          </Box>

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
                color: theme.palette.primary.main
              }
            }}
          >
            <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
              <strong>{t('quote:important', 'Important')}:</strong> {t('quote:discountNote', 'Every 10 apartments sold, the discount is reduced by 2%')}
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleCreateProperty}
              startIcon={loadingQuote ? <CircularProgress size={20} /> : (isAuthenticated ? <HomeIcon /> : <CalculateIcon />)}
              disabled={!isSelectionComplete || loadingQuote}
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
              {loadingQuote 
                ? t('quote:calculating', 'Calculating...')
                : isAuthenticated 
                  ? t('quote:createProperty', 'Create Property') 
                  : t('quote:getQuote', 'Get Quote')
              }
            </Button>

            <Button
              variant="contained"
              fullWidth
              onClick={handleSendQuote}
              startIcon={!isAuthenticated ? <LoginIcon /> : <SendIcon />}
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
                {!isAuthenticated ? t('quote:signInToSend', 'Sign In to Send Quote') : t('quote:generateAndSend', 'Generate & Send Quote')}
              </Box>
            </Button>
          </Box>
        </Box>
      </Paper>

      <QuoteResultModal
        open={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        quoteData={quoteResult}
        type="apartment"
        theme={theme}
      />
    </>
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