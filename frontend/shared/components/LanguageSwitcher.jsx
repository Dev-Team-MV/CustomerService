import { useTranslation } from 'react-i18next'
import { Box, Tooltip } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  // Add more languages here as needed:
  // { code: 'fr', label: 'FR' },
]

const LanguageSwitcher = ({ variant = 'default' }) => {
  const { i18n } = useTranslation()
  const theme = useTheme()
  const currentLang = i18n.language?.split('-')[0] || 'en'

  const handleSelect = (code) => {
    if (code !== currentLang) i18n.changeLanguage(code)
  }

  // Sidebar: full-width pill that fits the sidebar aesthetic
  if (variant === 'sidebar') {
    const current = languages.find(l => l.code === currentLang) || languages[0]
    const next = languages[(languages.findIndex(l => l.code === currentLang) + 1) % languages.length]
    const handleToggle = () => i18n.changeLanguage(next.code)
    return (
      <Tooltip title={`Language: ${current.label}`} placement="right">
        <Box
          onClick={handleToggle}
          sx={{
            width: '100%',
            py: 1,
            px: 2,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.12)',
              borderColor: 'rgba(255,255,255,0.2)',
            },
          }}
        >
          <Box sx={{
            fontSize: '0.7rem', fontWeight: 600,
            fontFamily: '"Courier New", monospace',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '1.5px', textTransform: 'uppercase',
          }}>
            Idioma
          </Box>
          <Box sx={{
            fontSize: '0.75rem', fontWeight: 800,
            fontFamily: '"DM Sans", sans-serif',
            color: '#fff',
            letterSpacing: '0.5px',
          }}>
            {current.label}
          </Box>
        </Box>
      </Tooltip>
    )
  }

  // Default: "ES | EN" inline text
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1 }}>
      {languages.map((lang, i) => (
        <Box key={lang.code} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {i > 0 && (
            <Box
              component="span"
              sx={{
                color: theme.palette.secondary?.main || '#8CA551',
                fontSize: '0.8rem',
                fontFamily: '"DM Sans", sans-serif',
                userSelect: 'none',
              }}
            >
              |
            </Box>
          )}
          <Box
            component="span"
            onClick={() => handleSelect(lang.code)}
            sx={{
              fontSize: '0.8rem',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: lang.code === currentLang ? 800 : 400,
              color: lang.code === currentLang
                ? theme.palette.text.primary
                : theme.palette.text.disabled,
              cursor: lang.code === currentLang ? 'default' : 'pointer',
              letterSpacing: '0.5px',
              transition: 'color 0.2s',
              '&:hover': lang.code !== currentLang
                ? { color: theme.palette.text.primary }
                : {},
            }}
          >
            {lang.label}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default LanguageSwitcher
