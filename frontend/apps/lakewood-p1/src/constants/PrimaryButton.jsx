import { Button, CircularProgress, Box } from '@mui/material'

const PrimaryButton = ({
  children,
  loading = false,
  disabled = false,
  startIcon,
  onClick,
  variant = 'contained',
  color = 'primary',
  ...props
}) => {
  // Solo estilos especiales para contained primary
  const customSx =
    variant === 'contained' && color === 'primary'
      ? {
          borderRadius: 3,
          bgcolor: '#333F1F',
          color: 'white',
          fontWeight: 600,
          textTransform: 'none',
          letterSpacing: '1px',
          fontFamily: '"Poppins", sans-serif',
          px: 3,
          py: 1.5,
          boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            bgcolor: '#8CA551',
            transition: 'left 0.4s ease',
            zIndex: 0
          },
          '&:hover': {
            bgcolor: '#333F1F',
            boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
            '&::before': {
              left: 0
            },
            '& .MuiButton-startIcon': {
              color: 'white'
            }
          },
          '& .MuiButton-startIcon': {
            position: 'relative',
            zIndex: 1,
            color: 'white'
          }
        }
      : {
          borderRadius: 3,
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 600,
          textTransform: 'none',
          letterSpacing: '1px',
          px: 3,
          py: 1.5
        }

  return (
    <Button
      variant={variant}
      color={color}
      onClick={onClick}
      startIcon={startIcon}
      disabled={disabled || loading}
      sx={customSx}
      {...props}
    >
      <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
        {loading ? <CircularProgress size={20} sx={{ color: variant === 'contained' && color === 'primary' ? 'white' : 'inherit', mr: 2 }} /> : null}
        {children}
      </Box>
    </Button>
  )
}

export default PrimaryButton