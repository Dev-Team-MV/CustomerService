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

  CHIP_SUPERADMIN: { bg: 'rgba(255,112,67,0.08)', border: 'rgba(255,112,67,0.3)', color: '#FF7043' },
  CHIP_ADMIN: { bg: 'rgba(85,85,85,0.08)', border: 'rgba(85,85,85,0.3)', color: '#555555' },
  CHIP_RESIDENT: { bg: 'rgba(0,0,0,0.08)', border: 'rgba(0,0,0,0.3)', color: '#000000' },

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
    background: { default: '#fafafa', paper: '#ffffff' },
  },
  typography: {
    // ✅ UNIFICACIÓN: Usamos la tipografía del Login como estándar global
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
    h1: { fontWeight: 200, letterSpacing: '-0.03em' },
    h2: { fontWeight: 300, letterSpacing: '-0.02em' },
    h3: { fontWeight: 400, letterSpacing: '-0.02em' },
    h4: { fontWeight: 400, letterSpacing: '-0.02em' },
    h5: { fontWeight: 400, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    body1: { fontWeight: 300, lineHeight: 1.75 },
    body2: { fontWeight: 300, lineHeight: 1.6 },
  },
  components: {
    // ✅ UNIFICACIÓN: Inputs cuadrados y elegantes como en el Login
MuiTextField: {
  styleOverrides: {
    root: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 0,
        backgroundColor: '#fff',
        fontFamily: '"Helvetica Neue", sans-serif',
        transition: 'box-shadow 0.25s, border-color 0.25s',
        '& fieldset': {
          borderColor: '#ddd',
          borderWidth: '1px',
        },
        '&:hover fieldset': {
          borderColor: '#000',
        },
        '&.Mui-focused fieldset': {
          borderColor: BRAND.PRIMARY,
          borderWidth: '2px',
        },
        '&.Mui-focused': {
          boxShadow: '4px 4px 0px rgba(0,0,0,0.06)',
        },
        '& input': {
          color: '#000',
          padding: '18px 14px',
          fontSize: '0.95rem',
          fontWeight: 300,
          fontFamily: '"Helvetica Neue", sans-serif', // ← asegura la fuente base
          '&::placeholder': {
            color: '#ccc',
            opacity: 1,
            fontFamily: '"Helvetica Neue", sans-serif', // ← FUENTE DEL PLACEHOLDER
            fontWeight: 300,
          },
        },
      },
      '& .MuiInputLabel-root': {
        fontFamily: '"Helvetica Neue", sans-serif',
        fontWeight: 400,
        color: '#888',
        '&.Mui-focused': {
          color: BRAND.PRIMARY,
          fontWeight: 600,
        },
      },
    },
  },
},
    
    // ✅ UNIFICACIÓN: Botones cuadrados, sin mayúsculas forzadas y con hover específico
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Bordes afilados
          textTransform: 'none', // Evita que MUI fuerce mayúsculas
          fontFamily: '"Helvetica Neue", sans-serif',
          fontWeight: 400,
          fontSize: '0.9rem',
          letterSpacing: '1.5px',
          padding: '14px 24px',
          transition: 'all 0.25s ease',
          '&:hover': {
            boxShadow: '6px 6px 0px rgba(0,0,0,0.12)', // Efecto hover del login
          },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            backgroundColor: BRAND.PRIMARY,
            color: '#fff',
            '&:hover': { backgroundColor: '#222' },
          },
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
              color: BRAND.ACCENT,
            },
          },
        },
        {
          props: { variant: 'outlined', color: 'error' },
          style: {
            backgroundColor: '#fff',
            borderColor: BRAND.WARNING,
            color: BRAND.WARNING,
            '&:hover': {
              backgroundColor: '#fff',
              borderColor: '#b71c1c',
              color: '#b71c1c',
            },
          },
        },
      ],
    },

    // ✅ UNIFICACIÓN: Tabs minimalistas
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 48 },
        indicator: {
          height: 2,
          borderRadius: 0, // Indicador afilado
          backgroundColor: BRAND.ACCENT,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 400,
          fontSize: '0.9rem',
          textTransform: 'none',
          letterSpacing: '1px',
          color: '#888',
          minHeight: 48,
          '&.Mui-selected': {
            color: BRAND.PRIMARY,
            fontWeight: 600,
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
          },
        },
      },
    },

    // ✅ UNIFICACIÓN: Cards/Papeles con bordes afilados y sombra limpia
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Bordes afilados
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
          backgroundColor: '#ffffff',
        },
      },
    },
    
    // ✅ UNIFICACIÓN: Alertas con bordes afilados para mantener consistencia
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '1px solid',
        },
      },
    },
  },
  brand: BRAND,
})

export default theme