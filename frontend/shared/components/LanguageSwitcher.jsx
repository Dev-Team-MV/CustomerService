import { useTranslation } from 'react-i18next'
import { Box, IconButton, Tooltip } from '@mui/material'
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
  const currentLang = i18n.language?.split('-')[0] || 'en'

  const handleToggle = () => {
    const currentIndex = languages.findIndex(l => l.code === currentLang)
    const nextIndex = (currentIndex + 1) % languages.length
    i18n.changeLanguage(languages[nextIndex].code)
  }

  const current = languages.find(l => l.code === currentLang) || languages[0]

  return (
    <Tooltip title={`Language: ${current.label}`} placement="bottom">
      <IconButton
        onClick={handleToggle}
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2.5,
          bgcolor: variant === 'sidebar'
            ? 'rgba(140, 165, 81, 0.08)'
            : 'rgba(51, 63, 31, 0.06)',
          border: '2px solid',
          borderColor: variant === 'sidebar'
            ? 'rgba(140, 165, 81, 0.2)'
            : 'rgba(140, 165, 81, 0.15)',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          '&:hover': {
            bgcolor: '#333F1F',
            borderColor: '#333F1F',
            transform: 'scale(1.08)',
            boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)',
            '& .lang-label': {
              color: 'white',
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
                color: '#333F1F',
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
