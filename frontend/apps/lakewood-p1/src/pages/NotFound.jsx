import { Box, Typography, Button, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Home } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

const NotFound = () => {
  const navigate = useNavigate()
  const { t } = useTranslation('common')

  return (
    <Container>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center'
        }}
      >
        <Typography variant="h1" fontWeight="bold" color="primary" sx={{ fontSize: '8rem' }}>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          {t('notFound.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {t('notFound.description')}
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<Home />}
          onClick={() => navigate('/dashboard')}
        >
          {t('notFound.goHome')}
        </Button>
      </Box>
    </Container>
  )
}

export default NotFound
