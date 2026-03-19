import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material'
import { useAuth } from '@shared/context/AuthContext'
import LanguageSwitcher from '@shared/components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

const BG_IMAGE = '/assets/login-bg.jpg' // Cambia por la ruta de tu imagen real

const Login = () => {
  const { login } = useAuth()
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form.email, form.password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || t('loginFailed'))
    }
    setLoading(false)
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      bgcolor: 'background.default'
    }}>
      {/* Left Side - Image/Brand */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, #1A237E 0%, #00ACC1 100%), url(${BG_IMAGE}) center/cover no-repeat`,
          minHeight: '100vh',
          position: 'relative'
        }}
      >
        {/* Overlay for better contrast */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(26,35,126,0.55)'
          }}
        />
        {/* Logo and branding */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center'
          }}
        >
          <img
            src="/logo-phase2.svg"
            alt="Phase-2 Logo"
            style={{ width: 120, marginBottom: 24, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.18))' }}
          />
          <Typography variant="h4" color="white" fontWeight={700} sx={{ letterSpacing: 1 }}>
            Welcome to Phase-2
          </Typography>
          <Typography variant="subtitle1" color="white" sx={{ mt: 2, opacity: 0.85, fontWeight: 400 }}>
            Your next-generation CRM experience
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Login Panel */}
      <Box
        sx={{
          flex: 1,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          position: 'relative'
        }}
      >
        {/* Language Switcher */}
        <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
          <LanguageSwitcher />
        </Box>
        <Paper
          elevation={4}
          sx={{
            width: 360,
            p: 4,
            borderRadius: 4,
            boxShadow: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 2
          }}
        >
          <img
            src="/logo-phase2.svg"
            alt="Phase-2 Logo"
            style={{ width: 64, marginBottom: 16 }}
          />
          <Typography variant="h5" fontWeight={700} mb={2}>
            {t('signIn')}
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              label={t('emailAddress')}
              fullWidth
              margin="normal"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
            <TextField
              label={t('password')}
              type="password"
              fullWidth
              margin="normal"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2, fontWeight: 700 }}
              disabled={loading}
            >
              {loading ? t('signingIn') : t('signIn')}
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  )
}

export default Login