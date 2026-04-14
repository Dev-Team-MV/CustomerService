import { Box, Container, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Home as HomeIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

const NotFound = () => {
  const { t } = useTranslation(['common'])
  const navigate = useNavigate()

  return (
    <Container>
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <Typography variant="h1" sx={{ fontSize: '8rem', fontWeight: 700, color: 'primary.main' }}>
          404
        </Typography>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          {t('common:notFound.title', 'Página No Encontrada')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
          {t('common:notFound.description', 'Lo sentimos, la página que buscas no existe.')}
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/dashboard')}
        >
          {t('common:notFound.goHome', 'Ir al Inicio')}
        </Button>
      </Box>
    </Container>
  )
}

export default NotFound