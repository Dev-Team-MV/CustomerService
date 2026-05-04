import { Box, Container, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

const QuoteHeader = () => {
  const { t } = useTranslation(['quote'])
  
  return (
    <Box 
      component="header" 
      sx={{ 
        flexShrink: 0,
        bgcolor: 'background.paper', 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        px: 3,
        py: 2
      }}
    >
      <Container maxWidth="xl" disableGutters>
        <Typography 
          variant="h4" 
          fontWeight={700} 
          sx={{ fontFamily: '"Poppins", sans-serif' }}
        >
          {t('header.title')}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ fontFamily: '"Poppins", sans-serif' }}
        >
          {t('header.subtitle')}
        </Typography>
      </Container>
    </Box>
  )
}

export default QuoteHeader