import { createTheme } from '@mui/material/styles'

export const BRAND = {
  PRIMARY: '#333F1F',
  SECONDARY: '#8CA551',
  ACCENT: '#E5863C',
  GRADIENT: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)'
}

// Estilo global para marcadores/puntos en mapas
export const markerSx = {
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  width: { xs: 24, sm: 32, md: 32 },
  height: { xs: 24, sm: 32, md: 32 },
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  bgcolor: BRAND.SECONDARY,
  color: '#fff',
  fontSize: { xs: '0.7rem', sm: '0.9rem', md: '1rem' },
  fontWeight: 'bold',
  boxShadow: '0 4px 12px rgba(140, 165, 81, 0.25)',
  border: '3px solid rgba(255,255,255,0.9)',
  transition: 'all 0.3s ease',
  zIndex: 1,
  '&:hover': {
    transform: 'translate(-50%, -50%) scale(1.2)',
    zIndex: 11,
    boxShadow: '0 6px 20px rgba(140, 165, 81, 0.4)',
    bgcolor: '#4a7c59'
  }
}

// Estilo global para la Box contenedora de mapas/planos
export const mapContainerSx = {
  mt: 2,
  width: '100%',
  maxWidth: '100%',
  paddingTop: '56.25%',
  bgcolor: '#f0f0f0',
  position: 'relative',
  cursor: 'grab',
  overflow: 'hidden',
  touchAction: 'none',
  boxSizing: 'border-box',
  borderRadius: 2
}

const theme = createTheme({
  palette: {
    primary: { main: BRAND.PRIMARY },
    secondary: { main: BRAND.SECONDARY },
    accent: { main: BRAND.ACCENT },
    background: {
      default: '#fff',
      paper: '#fff'
    }
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
    fontWeightBold: 800,
    fontWeightMedium: 600,
    fontWeightRegular: 500
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          borderColor: '#dbe7c9 !important',
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#fff',
            fontFamily: '"Poppins", sans-serif',
            '& fieldset': {
              borderColor: '#dbe7c9',
              borderWidth: '1.5px'
            },
            '&:hover fieldset': {
              borderColor: '#dbe7c9 !important'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#dbe7c9',
              borderWidth: '2px'
            }
          },
          '& .MuiInputLabel-root': {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 500,
            color: '#706f6f',
            '&.Mui-focused': {
              color: '#333F1F',
              fontWeight: 600
            }
          },
          '& .MuiFormHelperText-root': {
            fontFamily: '"Poppins", sans-serif'
          }
        }
      }
    },
    MuiButton: {
      variants: [
        {
          props: { variant: 'outlined', color: 'error' },
          style: {
            backgroundColor: '#fff',
            borderColor: '#d32f2f',
            color: '#d32f2f',
            '&:hover': {
              backgroundColor: '#fff',
              borderColor: '#b71c1c',
              color: '#b71c1c'
            }
          }
        },
        {
          props: { variant: 'outlined', color: 'primary' },
          style: {
            backgroundColor: '#fff',
            borderColor: '#333F1F',
            color: '#333F1F',
            '&:hover': {
              backgroundColor: '#fff',
              borderColor: '#8CA551',
              color: '#8CA551'
            }
          }
        },
        {
          props: { variant: 'outlined', color: 'secondary' },
          style: {
            backgroundColor: '#fff',
            borderColor: '#8CA551',
            color: '#8CA551',
            '&:hover': {
              backgroundColor: '#fff',
              borderColor: '#333F1F',
              color: '#333F1F'
            }
          }
        }
      ]
    },
        MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48
        },
        indicator: {
          height: 3,
          borderRadius: '4px 4px 0 0',
          backgroundColor: '#4a7c59'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '1rem',
          textTransform: 'none',
          color: '#6c757d',
          minHeight: 48,
          '&.Mui-selected': {
            color: '#4a7c59'
          },
          '&:hover': {
            backgroundColor: 'rgba(74, 124, 89, 0.05)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 5,
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          background: 'white'
        }
      }
    }
  }
})

export default theme