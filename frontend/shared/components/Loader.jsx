import { Box, CircularProgress, Typography } from '@mui/material'

/**
 * Loader Component - Base reusable loader
 * @param {string} size - 'small' | 'medium' | 'large'
 * @param {string} message - Optional loading message
 * @param {string} color - Color del loader (default: primary)
 * @param {boolean} fullHeight - Si debe ocupar toda la altura disponible
 */
const Loader = ({ 
  size = 'medium', 
  message = '', 
  color = 'primary',
  fullHeight = false 
}) => {
  const sizes = {
    small: 24,
    medium: 40,
    large: 60
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        // ✅ Solo aplicar minHeight si fullHeight es true
        ...(fullHeight && {
          minHeight: '100vh'
        }),
        // ✅ Si no es fullHeight, usar padding más pequeño
        py: fullHeight ? 0 : 4,
        px: 2
      }}
    >
      <CircularProgress 
        size={sizes[size]} 
        sx={{
          color: color === 'primary' ? '#8CA551' : color
        }}
      />
      {message && (
        <Typography
          variant="body2"
          sx={{
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 500,
            textAlign: 'center'
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  )
}

export default Loader