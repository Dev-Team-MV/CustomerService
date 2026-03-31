import { createTheme } from '@mui/material/styles'

export const BRAND = {
  PRIMARY: '#000000',
  SECONDARY: '#ffffff',
  ACCENT: '#555555',
  INFO: '#1976d2',
  WARNING: '#FF7043',
  SUCCESS: '#43A047',

  GRADIENT: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
  GRADIENT_SECONDARY: 'linear-gradient(135deg, #e0e0e0 0%, #ffffff 100%)',
  GRADIENT_ACCENT: 'linear-gradient(135deg, #555555 0%, #aaaaaa 100%)',
  GRADIENT_INFO: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',

  CHIP_SUPERADMIN: {
    bg: 'rgba(255,112,67,0.08)',
    border: 'rgba(255,112,67,0.3)',
    color: '#FF7043'
  },
  CHIP_ADMIN: {
    bg: 'rgba(85,85,85,0.08)',
    border: 'rgba(85,85,85,0.3)',
    color: '#555555'
  },
  CHIP_RESIDENT: {
    bg: 'rgba(0,0,0,0.08)',
    border: 'rgba(0,0,0,0.3)',
    color: '#000000'
  },

  CARD_BG: '#ffffff',
  CARD_BORDER: '#e0e0e0',
  AVATAR_SHADOW: '0 8px 24px rgba(0,0,0,0.12)',
}

const theme = createTheme({
  palette: {
    primary: { main: BRAND.PRIMARY },
    secondary: { main: BRAND.SECONDARY },
    accent: { main: BRAND.ACCENT },
    info: { main: BRAND.INFO },
    warning: { main: BRAND.WARNING },
    success: { main: BRAND.SUCCESS },
    // Gradientes y colores extendidos
    gradient: BRAND.GRADIENT,
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
        bg: 'rgba(255, 255, 255, 0.08)',          // Gris translúcido
        border: 'rgba(85,85,85,0.3)',       // Gris más fuerte
        color: '#ffffffff',                   // Gris principal
        hoverBg: '#555555',                 // Gris sólido al hover
        hoverBorder: '#555555',
        hoverShadow: '0 4px 12px rgba(85,85,85,0.18)'
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
              borderColor: BRAND.ACCENT,
              borderWidth: '2px'
            }
          },
          '& .MuiInputLabel-root': {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 500,
            color: '#555',
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
              borderColor: BRAND.ACCENT,
              color: BRAND.ACCENT
            }
          }
        },
        {
          props: { variant: 'outlined', color: 'secondary' },
          style: {
            backgroundColor: '#fff',
            borderColor: BRAND.ACCENT,
            color: BRAND.ACCENT,
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
          backgroundColor: BRAND.ACCENT
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '1rem',
          textTransform: 'none',
          color: '#555',
          minHeight: 48,
          '&.Mui-selected': {
            color: BRAND.ACCENT
          },
          '&:hover': {
            backgroundColor: 'rgba(85, 85, 85, 0.05)'
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