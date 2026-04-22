import { createTheme } from '@mui/material/styles'

// --- Brand Colors & Gradients ---
export const BRAND = {
  PRIMARY: '#FF6B35',      // Naranja vibrante
  SECONDARY: '#F7931E',    // Naranja dorado
  ACCENT: '#FFB84D',       // Naranja claro/amarillo
  INFO: '#FF8C42',         // Naranja medio
  WARNING: '#FF4500',      // Naranja rojizo
  SUCCESS: '#43A047',      // Verde

  // Gradientes principales
  GRADIENT: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
  GRADIENT_SECTION: 'linear-gradient(90deg, hsla(18, 100%, 90%, 1) 0%, hsla(30, 100%, 95%, 1) 50%, hsla(0, 0%, 96%, 1) 100%)',

  GRADIENT_SECONDARY: 'linear-gradient(135deg, #F7931E 0%, #FFB84D 100%)',
  GRADIENT_ACCENT: 'linear-gradient(135deg, #FFB84D 0%, #FFD699 100%)',
  GRADIENT_INFO: 'linear-gradient(135deg, #FF8C42 0%, #FFAD70 100%)',

  // Chips y badges
  CHIP_SUPERADMIN: {
    bg: 'rgba(255,69,0,0.08)',
    border: 'rgba(255,69,0,0.3)',
    color: '#FF4500'
  },
  CHIP_ADMIN: {
    bg: 'rgba(247,147,30,0.08)',
    border: 'rgba(247,147,30,0.3)',
    color: '#F7931E'
  },
  CHIP_RESIDENT: {
    bg: 'rgba(255,107,53,0.08)',
    border: 'rgba(255,107,53,0.3)',
    color: '#FF6B35'
  },

  // Otros estilos reutilizables
  CARD_BG: '#f5f7fa',
  CARD_BORDER: '#e0e0e0',
  AVATAR_SHADOW: '0 8px 24px rgba(255, 107, 53, 0.18)',
}

// --- Global Styles for Maps ---
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
  boxShadow: '0 4px 12px rgba(247, 147, 30, 0.25)',
  border: '3px solid rgba(255,255,255,0.9)',
  transition: 'all 0.3s ease',
  zIndex: 1,
  '&:hover': {
    transform: 'translate(-50%, -50%) scale(1.2)',
    zIndex: 11,
    boxShadow: '0 6px 20px rgba(247, 147, 30, 0.4)',
    bgcolor: '#FF8C42'
  }
}

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

// --- MUI Theme ---
const theme = createTheme({
  palette: {
    primary: { main: BRAND.PRIMARY },
    secondary: { main: BRAND.SECONDARY },
    accent: { main: BRAND.ACCENT },
    info: { main: BRAND.INFO },
    warning: { main: BRAND.WARNING },
    success: { main: BRAND.SUCCESS },
    gradient: BRAND.GRADIENT,
    gradientSection: BRAND.GRADIENT_SECTION,
    gradientSecondary: BRAND.GRADIENT_SECONDARY,
    gradientAccent: BRAND.GRADIENT_ACCENT,
    gradientInfo: BRAND.GRADIENT_INFO,
    chipSuperadmin: BRAND.CHIP_SUPERADMIN,
    chipAdmin: BRAND.CHIP_ADMIN,
    chipResident: BRAND.CHIP_RESIDENT,
    cardBg: BRAND.CARD_BG,
    cardBorder: BRAND.CARD_BORDER,
    avatarShadow: BRAND.AVATAR_SHADOW,
    background: {
      default: '#fff',
      paper: '#fff'
    },
    chipLanguageSwitcher: {
      bg: 'rgba(255,107,53,0.08)',
      border: 'rgba(255,107,53,0.3)',
      color: '#FF6B35',
      hoverBg: '#FF6B35',
      hoverBorder: '#FF6B35',
      hoverShadow: '0 4px 12px rgba(255,107,53,0.18)'
    },
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
          borderColor: '#e0e0e0 !important',
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#fff',
            fontFamily: '"Poppins", sans-serif',
            '& fieldset': {
              borderColor: '#e0e0e0',
              borderWidth: '1.5px'
            },
            '&:hover fieldset': {
              borderColor: '#e0e0e0 !important'
            },
            '&.Mui-focused fieldset': {
              borderColor: BRAND.SECONDARY,
              borderWidth: '2px'
            }
          },
          '& .MuiInputLabel-root': {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 500,
            color: '#6c757d',
            '&.Mui-focused': {
              color: BRAND.PRIMARY,
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
            borderColor: BRAND.WARNING,
            color: BRAND.WARNING,
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
            borderColor: BRAND.PRIMARY,
            color: BRAND.PRIMARY,
            '&:hover': {
              backgroundColor: '#fff',
              borderColor: BRAND.SECONDARY,
              color: BRAND.SECONDARY
            }
          }
        },
        {
          props: { variant: 'outlined', color: 'secondary' },
          style: {
            backgroundColor: '#fff',
            borderColor: BRAND.SECONDARY,
            color: BRAND.SECONDARY,
            '&:hover': {
              backgroundColor: '#fff',
              borderColor: BRAND.PRIMARY,
              color: BRAND.PRIMARY
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
          backgroundColor: BRAND.SECONDARY
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
            color: BRAND.SECONDARY
          },
          '&:hover': {
            backgroundColor: 'rgba(247,147,30,0.05)'
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
  },
  brand: BRAND
})

export default theme