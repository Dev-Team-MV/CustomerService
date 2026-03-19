import { useTranslation } from 'react-i18next'
import { Box, IconButton, Tooltip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'

const languages = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
  // Add more languages here as needed:
  // { code: 'fr', label: 'FR', flag: '🇫🇷' },
  // { code: 'pt', label: 'PT', flag: '🇧🇷' },
]

const LanguageSwitcher = ({ variant = 'default' }) => {
  const { i18n } = useTranslation()
  const theme = useTheme()
  const currentLang = i18n.language?.split('-')[0] || 'en'

  const handleToggle = () => {
    const currentIndex = languages.findIndex(l => l.code === currentLang)
    const nextIndex = (currentIndex + 1) % languages.length
    i18n.changeLanguage(languages[nextIndex].code)
  }

  const current = languages.find(l => l.code === currentLang) || languages[0]

  // Elegir colores del theme según el variant
  const bgSidebar = theme.palette.chipAdmin?.bg || 'rgba(140, 165, 81, 0.08)'
  const borderSidebar = theme.palette.chipAdmin?.border || 'rgba(140, 165, 81, 0.2)'
  const bgDefault = theme.palette.chipResident?.bg || 'rgba(51, 63, 31, 0.06)'
  const borderDefault = theme.palette.chipAdmin?.border || 'rgba(140, 165, 81, 0.15)'
  const hoverBg = theme.palette.primary?.main || '#333F1F'
  const hoverBorder = theme.palette.primary?.main || '#333F1F'
  const hoverShadow = theme.palette.avatarShadow || '0 4px 12px rgba(51, 63, 31, 0.2)'
  const labelColor = theme.palette.primary?.main || '#333F1F'

  return (
    <Tooltip title={`Language: ${current.label}`} placement="bottom">
      <IconButton
        onClick={handleToggle}
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2.5,
          bgcolor: variant === 'sidebar' ? bgSidebar : bgDefault,
          border: '2px solid',
          borderColor: variant === 'sidebar' ? borderSidebar : borderDefault,
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          '&:hover': {
            bgcolor: hoverBg,
            borderColor: hoverBorder,
            transform: 'scale(1.08)',
            boxShadow: hoverShadow,
            '& .lang-label': {
              color: theme.palette.primary?.contrastText || 'white',
            },
          },
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.code}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Box
              className="lang-label"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 800,
                fontFamily: '"Poppins", sans-serif',
                color: labelColor,
                letterSpacing: '0.5px',
                lineHeight: 1,
                transition: 'color 0.3s',
              }}
            >
              {current.label}
            </Box>
          </motion.div>
        </AnimatePresence>
      </IconButton>
    </Tooltip>
  )
}

export default LanguageSwitcher