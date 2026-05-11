import { Paper, Typography, Grid } from '@mui/material'
import { useTranslation } from 'react-i18next'

const SelectedOptionsPanel = ({ customizationData, catalogConfig }) => {
  const { t } = useTranslation(['quote'])
  
  if (!customizationData) return null
  
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
      <Typography 
        variant="h6" 
        fontWeight={700} 
        mb={2} 
        sx={{ fontFamily: '"Poppins", sans-serif' }}
      >
        {t('selectedOptions.title')}
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(customizationData.selectedOptions).map(([levelKey, value]) => {
          const level = catalogConfig.structure.levels[levelKey]
          const selections = Array.isArray(value) ? value : [value]
          const labels = selections
            .map(id => level?.options?.find(opt => opt.id === id)?.label)
            .filter(Boolean)
          
          return (
            <Grid item xs={12} sm={6} key={levelKey}>
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
                variant="body2" 
                fontWeight={600} 
                color="primary"
                sx={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {labels.join(', ')}
              </Typography>
            </Grid>
          )
        })}
      </Grid>
    </Paper>
  )
}

export default SelectedOptionsPanel