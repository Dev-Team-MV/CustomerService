import { Grid, Box, Paper, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import PriceCalculator from '@shared/components/PropertyQuote/PriceCalculator'

const QuoteSidebar = ({ 
  currentStep, 
  isAuthenticated, 
  onBack, 
  onContinue 
}) => {
  const theme = useTheme()
  const { t } = useTranslation(['quote'])
  
  return (
    <Grid 
      item 
      xs={12} 
      lg={4} 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: 0
      }}
    >
      <Box 
        sx={{ 
          position: 'sticky',
          top: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            borderRadius: 3,
            maxHeight: 'calc(100vh - 280px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { 
              background: '#f1f1f1', 
              borderRadius: '10px' 
            },
            '&::-webkit-scrollbar-thumb': { 
              background: theme.palette.primary.main, 
              borderRadius: '10px',
              '&:hover': { background: theme.palette.primary.dark }
            }
          }}
        >
          <PriceCalculator />
        </Paper>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {currentStep > 0 && (
            <Button
              variant="outlined"
              fullWidth
              onClick={onBack}
              sx={{
                borderRadius: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontFamily: '"Poppins", sans-serif',
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: theme.palette.action.hover
                }
              }}
            >
              {t('buttons.back')}
            </Button>
          )}
          
          {currentStep === 2 && (
            <Button
              variant="contained"
              fullWidth
              onClick={onContinue}
              disabled={!isAuthenticated}
              sx={{
                borderRadius: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontFamily: '"Poppins", sans-serif',
                bgcolor: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark
                }
              }}
            >
              {isAuthenticated ? t('buttons.assignResident') : t('buttons.login')}
            </Button>
          )}
        </Box>
      </Box>
    </Grid>
  )
}

export default QuoteSidebar