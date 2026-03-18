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

  // Colores personalizados para el chip del language switcher
  const chipTheme = theme.palette.chipLanguageSwitcher || {}
  const bgDefault = chipTheme.bg || 'rgba(229,134,60,0.10)'
  const borderDefault = chipTheme.border || 'rgba(229,134,60,0.35)'
  const labelColorDefault = chipTheme.color || '#E5863C'
  const hoverBg = chipTheme.hoverBg || theme.palette.primary?.main || '#333F1F'
  const hoverBorder = chipTheme.hoverBorder || borderDefault
  const hoverShadow = chipTheme.hoverShadow || '0 4px 12px rgba(51, 63, 31, 0.2)'

  // Sidebar variant (puedes personalizar diferente si quieres)
  const bgSidebar = chipTheme.bgSidebar || bgDefault
  const borderSidebar = chipTheme.borderSidebar || borderDefault
  const labelColorSidebar = chipTheme.colorSidebar || labelColorDefault

  const bg = variant === 'sidebar' ? bgSidebar : bgDefault
  const border = variant === 'sidebar' ? borderSidebar : borderDefault
  const labelColor = variant === 'sidebar' ? labelColorSidebar : labelColorDefault

  return (
    <Tooltip title={`Language: ${current.label}`} placement="bottom">
      <IconButton
        onClick={handleToggle}
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2.5,
          bgcolor: bg,
          border: '2px solid',
          borderColor: border,
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