import { Box, Typography, Button, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Home } from '@mui/icons-material'

const NotFound = () => {
  const navigate = useNavigate()

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
          Página No Encontrada
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Lo sentimos, la página que buscas no existe.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<Home />}
          onClick={() => navigate('/dashboard')}
        >
          Volver al Inicio
        </Button>
      </Box>
    </Container>
  )
}

export default NotFound
