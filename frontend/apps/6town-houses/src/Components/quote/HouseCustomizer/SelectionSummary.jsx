import { Box, Paper, Typography, Grid, Divider } from '@mui/material'
import { useTranslation } from 'react-i18next'

const SelectionSummary = ({ selectedOptions, levels }) => {
  const { t } = useTranslation(['quote'])

  if (Object.keys(selectedOptions).length === 0) {
    return null
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5', borderRadius: 3 }}>
      <Typography 
        variant="h6" 
        fontWeight={700} 
        mb={2} 
        sx={{ fontFamily: '"Poppins", sans-serif' }}
      >
        {t('selectedOptions.title')}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {Object.entries(selectedOptions).map(([levelKey, value]) => {
          const level = levels[levelKey]
          const selections = Array.isArray(value) ? value : [value]
          const labels = selections
            .map(id => level?.options?.find(opt => opt.id === id)?.label)
            .filter(Boolean)
          
          return (
            <Grid item xs={12} sm={6} md={3} key={levelKey}>
              <Box>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    textTransform: 'uppercase', 
                    fontWeight: 600, 
                    fontFamily: '"Poppins", sans-serif' 
                  }}
                >
                  {level?.label}
                </Typography>
                <Typography 
                  variant="body1" 
                  fontWeight={600} 
                  color="primary"
                  sx={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  {labels.join(', ')}
                </Typography>
              </Box>
            </Grid>
          )
        })}
      </Grid>
    </Paper>
  )
}

export default SelectionSummary