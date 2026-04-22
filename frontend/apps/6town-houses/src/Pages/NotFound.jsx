import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { BRAND } from '../theme'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3
      }}
    >
      <Typography 
        variant="h1" 
        sx={{ 
          fontSize: '8rem', 
          fontWeight: 700, 
          color: BRAND.SECONDARY 
        }}
      >
        404
      </Typography>
      <Typography variant="h4" gutterBottom sx={{ color: BRAND.PRIMARY }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The page you're looking for doesn't exist.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/dashboard')}
        sx={{
          bgcolor: BRAND.PRIMARY,
          '&:hover': {
            bgcolor: BRAND.SECONDARY
          }
        }}
      >
        Go to Dashboard
      </Button>
    </Box>
  )
}

export default NotFound