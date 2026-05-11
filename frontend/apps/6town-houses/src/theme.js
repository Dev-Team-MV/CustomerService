import { createTheme } from '@mui/material/styles'

// --- Brand Colors & Gradients ---
export const BRAND = {
  PRIMARY: '#4A5568',      // Gris metálico oscuro
  SECONDARY: '#718096',    // Gris metálico medio
  ACCENT: '#A0AEC0',       // Gris metálico claro
  INFO: '#63707E',         // Gris azulado
  WARNING: '#E2A03F',      // Dorado metálico (para advertencias)
  SUCCESS: '#48BB78',      // Verde (para éxito)

  // Gradientes principales
  GRADIENT: 'linear-gradient(135deg, #4A5568 0%, #718096 100%)',
  GRADIENT_SECTION: 'linear-gradient(90deg, hsla(210, 14%, 89%, 1) 0%, hsla(210, 16%, 93%, 1) 50%, hsla(0, 0%, 96%, 1) 100%)',

  GRADIENT_SECONDARY: 'linear-gradient(135deg, #718096 0%, #A0AEC0 100%)',
  GRADIENT_ACCENT: 'linear-gradient(135deg, #A0AEC0 0%, #CBD5E0 100%)',
  GRADIENT_INFO: 'linear-gradient(135deg, #63707E 0%, #8A95A5 100%)',

  // Chips y badges
  CHIP_SUPERADMIN: {
    bg: 'rgba(74, 85, 104, 0.08)',
    border: 'rgba(74, 85, 104, 0.3)',
    color: '#4A5568'
  },
  CHIP_ADMIN: {
    bg: 'rgba(113, 128, 150, 0.08)',
    border: 'rgba(113, 128, 150, 0.3)',
    color: '#718096'
  },
  CHIP_RESIDENT: {
    bg: 'rgba(160, 174, 192, 0.08)',
    border: 'rgba(160, 174, 192, 0.3)',
    color: '#A0AEC0'
  },

  // Otros estilos reutilizables
  CARD_BG: '#F7FAFC',
  CARD_BORDER: '#E2E8F0',
  AVATAR_SHADOW: '0 8px 24px rgba(74, 85, 104, 0.18)',
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
  boxShadow: '0 4px 12px rgba(113, 128, 150, 0.25)',
  border: '3px solid rgba(255,255,255,0.9)',
  transition: 'all 0.3s ease',
  zIndex: 1,
  '&:hover': {
    transform: 'translate(-50%, -50%) scale(1.2)',
    zIndex: 11,
    boxShadow: '0 6px 20px rgba(113, 128, 150, 0.4)',
    bgcolor: BRAND.PRIMARY
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
      default: '#FFFFFF',
      paper: '#FFFFFF'
    },
    chipLanguageSwitcher: {
      bg: 'rgba(113, 128, 150, 0.08)',
      border: 'rgba(113, 128, 150, 0.3)',
      color: '#718096',
      hoverBg: '#718096',
      hoverBorder: '#718096',
      hoverShadow: '0 4px 12px rgba(113, 128, 150, 0.18)'
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
          borderColor: '#E2E8F0 !important',
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#fff',
            fontFamily: '"Poppins", sans-serif',
            '& fieldset': {
              borderColor: '#E2E8F0',
              borderWidth: '1.5px'
            },
            '&:hover fieldset': {
              borderColor: '#CBD5E0 !important'
            },
            '&.Mui-focused fieldset': {
              borderColor: BRAND.SECONDARY,
              borderWidth: '2px'
            }
          },
          '& .MuiInputLabel-root': {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 500,
            color: '#718096',
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
              borderColor: '#D69E2E',
              color: '#D69E2E'
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
          color: '#718096',
          minHeight: 48,
          '&.Mui-selected': {
            color: BRAND.PRIMARY
          },
          '&:hover': {
            backgroundColor: 'rgba(113, 128, 150, 0.05)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 5,
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 12px rgba(74, 85, 104, 0.08)',
          background: 'white'
        }
      }
    }
  },
  brand: BRAND
})

export default theme




