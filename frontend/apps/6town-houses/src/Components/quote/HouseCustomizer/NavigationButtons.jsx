import { Box, Paper, Button } from '@mui/material'
import { ArrowBack, ArrowForward, Calculate } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

const NavigationButtons = ({ 
  currentStep, 
  isLastStep, 
  onPrevious, 
  onNext 
}) => {
  const theme = useTheme()
  const { t } = useTranslation(['quote'])

  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
      <Box display="flex" justifyContent="space-between" gap={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={onPrevious}
          sx={{ 
            minWidth: 120,
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
            textTransform: 'none',
            borderColor: theme.palette.divider,
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              bgcolor: theme.palette.action.hover
            }
          }}
        >
          {currentStep === 0 ? t('buttons.back') : t('previous')}
        </Button>
        <Button
          variant="contained"
          endIcon={isLastStep ? <Calculate /> : <ArrowForward />}
          onClick={onNext}
          sx={{ 
            minWidth: 120,
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
            textTransform: 'none',
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            }
          }}
        >
          {isLastStep ? t('getQuote') : t('next')}
        </Button>
      </Box>
    </Paper>
  )
}

export default NavigationButtons