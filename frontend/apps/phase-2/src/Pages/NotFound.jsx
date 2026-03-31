import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h2" color="primary" fontWeight={700}>
          404
        </Typography>
        <Typography variant="h5" fontWeight={500}>
          Página no encontrada
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          La página que buscas no existe o fue movida.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')}>
          Ir al Dashboard
        </Button>
      </Box>
  )
}

export default NotFound