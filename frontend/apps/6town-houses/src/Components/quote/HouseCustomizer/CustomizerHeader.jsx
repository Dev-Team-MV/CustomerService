import { Box, Paper, Typography, Divider } from '@mui/material'
import { Home } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

const CustomizerHeader = ({ 
  currentLevel, 
  currentStep, 
  totalSteps, 
  estimatedPrice 
}) => {
  const theme = useTheme()
  const { t } = useTranslation(['quote'])

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: '#fafafa' }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Home sx={{ fontSize: 32, color: theme.palette.primary.main }} />
        <Box flex={1}>
          <Typography 
            variant="h5" 
            fontWeight={700} 
            sx={{ 
              fontFamily: '"Poppins", sans-serif', 
              color: theme.palette.primary.main 
            }}
          >
            {currentLevel?.label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('step.of', { current: currentStep + 1, total: totalSteps })}
          </Typography>
        </Box>
        {estimatedPrice && (
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary" display="block">
              {t('estimatedPrice')}
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary">
              ${estimatedPrice?.totalPrice?.toLocaleString() || '0'}
            </Typography>
          </Box>
        )}
      </Box>
      <Divider />
    </Paper>
  )
}

export default CustomizerHeader