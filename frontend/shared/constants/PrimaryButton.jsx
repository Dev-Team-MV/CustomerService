import { Button, CircularProgress, Box, useTheme } from '@mui/material'

const PrimaryButton = ({
  children,
  loading = false,
  disabled = false,
  startIcon,
  onClick,
  variant = 'contained',
  color = 'primary',
  sx,
  ...props
}) => {
  const theme = useTheme()
  // Usa colores del theme si están disponibles
  const containedPrimarySx = {
    borderRadius: 3,
    bgcolor: theme.palette?.primary?.main || '#333F1F',
    color: theme.palette?.primary?.contrastText || 'white',
    fontWeight: 600,
    textTransform: 'none',
    letterSpacing: '1px',
    fontFamily: '"Poppins", sans-serif',
    px: 3,
    py: 1.5,
    boxShadow: `0 4px 12px ${theme.palette?.primary?.main ? theme.palette.primary.main + '40' : 'rgba(51, 63, 31, 0.25)'}`,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      bgcolor: theme.palette?.secondary?.main || '#8CA551',
      transition: 'left 0.4s ease',
      zIndex: 0
    },
    '&:hover': {
      bgcolor: theme.palette?.primary?.main || '#333F1F',
      boxShadow: `0 8px 20px ${theme.palette?.primary?.main ? theme.palette.primary.main + '60' : 'rgba(51, 63, 31, 0.35)'}`,
      '&::before': {
        left: 0
      },
      '& .MuiButton-startIcon': {
        color: theme.palette?.primary?.contrastText || 'white'
      }
    },
    '& .MuiButton-startIcon': {
      position: 'relative',
      zIndex: 1,
      color: theme.palette?.primary?.contrastText || 'white'
    }
  }

  const defaultSx = {
    borderRadius: 3,
    fontFamily: '"Poppins", sans-serif',
    fontWeight: 600,
    textTransform: 'none',
    letterSpacing: '1px',
    px: 3,
    py: 1.5
  }

  const customSx =
    variant === 'contained' && color === 'primary'
      ? { ...containedPrimarySx, ...sx }
      : { ...defaultSx, ...sx }

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
        {loading ? (
          <CircularProgress
            size={20}
            sx={{
              color:
                variant === 'contained' && color === 'primary'
                  ? theme.palette?.primary?.contrastText || 'white'
                  : 'inherit',
              mr: 2
            }}
          />
        ) : null}
        {children}
      </Box>
    </Button>
  )
}

export default PrimaryButton