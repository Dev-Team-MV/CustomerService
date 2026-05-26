import { useTranslation } from 'react-i18next'
import { Box, Tooltip } from '@mui/material'

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
]

const LanguageSwitcher = ({ variant = 'default' }) => {
  const { i18n } = useTranslation()
  const currentLang = i18n.language?.split('-')[0] || 'en'

  const handleSelect = (code) => {
    if (code !== currentLang) i18n.changeLanguage(code)
  }

  // Sidebar keeps the compact box style
  if (variant === 'sidebar') {
    const current = languages.find(l => l.code === currentLang) || languages[0]
    const handleToggle = () => {
      const idx = languages.findIndex(l => l.code === currentLang)
      i18n.changeLanguage(languages[(idx + 1) % languages.length].code)
    }
    return (
      <Tooltip title={`Language: ${current.label}`} placement="bottom">
        <Box
          onClick={handleToggle}
          sx={{
            width: 40, height: 40,
            borderRadius: 2.5,
            bgcolor: 'rgba(140, 165, 81, 0.08)',
            border: '2px solid rgba(140, 165, 81, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': { bgcolor: '#333F1F', borderColor: '#333F1F', '& .lang-label': { color: 'white' } },
          }}
        >
          <Box className="lang-label" sx={{ fontSize: '0.75rem', fontWeight: 800, fontFamily: '"DM Sans", sans-serif', color: '#333F1F', transition: 'color 0.3s' }}>
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
            <Box component="span" sx={{ color: '#8CA551', fontSize: '0.8rem', fontFamily: '"DM Sans", sans-serif', userSelect: 'none' }}>
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
              color: lang.code === currentLang ? '#333F1F' : '#888',
              cursor: lang.code === currentLang ? 'default' : 'pointer',
              letterSpacing: '0.5px',
              transition: 'color 0.2s',
              '&:hover': lang.code !== currentLang ? { color: '#333F1F' } : {},
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
