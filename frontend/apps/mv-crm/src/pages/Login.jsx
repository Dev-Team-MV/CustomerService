import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, TextField, Button,
  InputAdornment, IconButton, Alert
} from '@mui/material'
import { Visibility, VisibilityOff, ArrowForward } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useAuth } from '@shared/context/AuthContext'
import LanguageSwitcher from '@shared/components/LanguageSwitcher'  // ← shared

import mvLogo from '../../../../public/images/logos/LOGO_MICHELANGELO_PNG_Mesa de trabajo 1.png'


const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useTranslation('auth')  // ← namespace auth de shared

  const [loginMethod, setLoginMethod] = useState('email')
  const [formData, setFormData] = useState({ email: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [focusedField, setFocusedField] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()      // ← debe ser lo primero, antes de cualquier async
    e.stopPropagation()     // ← añadir esto también
    
    setError('')
    setLoading(true)

    const credential = loginMethod === 'email'
      ? formData.email.trim()
      : `+${formData.phone}`

    console.log('🔐 Login attempt:', { loginMethod, credential, hasPassword: !!formData.password })

    try {
      const result = await login(credential, formData.password)
      console.log('📡 Login result:', result)

      if (result?.success) {
        navigate('/dashboard')
      } else {
        setError(
          result?.requiresPasswordSetup
            ? t('mvPasswordNotSet')
            : result?.error || t('mvLoginFailed')
        )
      }
    } catch (err) {
      console.error('❌ Login error:', err)
      setError(err?.response?.data?.message || t('mvLoginFailed'))
    } finally {
      setLoading(false)
    }

    return false  // ← previene cualquier submit nativo residual
  }

  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const formatDate = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' }).toUpperCase()

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      fontFamily: '"Helvetica Neue", sans-serif',
      borderRadius: 0, background: '#fff',
      transition: 'box-shadow 0.25s',
      '& fieldset': { borderColor: '#ddd', borderWidth: 1 },
      '&:hover fieldset': { borderColor: '#000' },
      '&.Mui-focused fieldset': { borderColor: '#000', borderWidth: 2 },
      '&.Mui-focused': { boxShadow: '4px 4px 0px rgba(0,0,0,0.06)' },
      '& input': {
        color: '#000', py: 1.8, fontSize: '0.95rem', fontWeight: 300,
        '&::placeholder': { color: '#ccc', opacity: 1 }
      }
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', background: '#fafafa', position: 'relative', overflow: 'hidden' }}>

      {/* ...grid bg y accent lines — existing code sin cambios... */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)`,
        backgroundSize: '48px 48px'
      }} />
      <motion.div animate={{ scaleY: [1, 1.08, 1], opacity: [0.07, 0.13, 0.07] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', left: '30%', top: 0, bottom: 0, width: 1, background: '#000', pointerEvents: 'none', transformOrigin: 'top' }} />
      <motion.div animate={{ scaleY: [1, 1.05, 1], opacity: [0.04, 0.09, 0.04] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ position: 'absolute', left: '65%', top: 0, bottom: 0, width: 1, background: '#000', pointerEvents: 'none' }} />

      {/* ─── LEFT PANEL — sin cambios ─── */}
      <Box sx={{ flex: { xs: 0, md: 1 }, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between', p: '56px 64px', borderRight: '1px solid rgba(0,0,0,0.08)', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 20, height: 1, bgcolor: '#000' }} />
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.68rem', letterSpacing: '2px', color: '#999', textTransform: 'uppercase' }}>
              {t('mvPlatform')}
            </Typography>
          </Box>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
          <Box sx={{ maxWidth: 520 }}>

            {/* Logo — reemplaza "Master Control" + stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Box
                component="img"
                src={mvLogo}
                alt="Michelangelo Del Valle"
                sx={{
                  width: '100%',
                  maxWidth: 400,
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  mb: 6,
                }}
              />
            </motion.div>

            {/* Línea divisora animada */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'left' }}
            >
              <Box sx={{ width: 80, height: 2, bgcolor: '#000', mb: 5 }} />
            </motion.div>

            <Typography sx={{
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontSize: '1.05rem', color: '#555', lineHeight: 1.75,
              fontWeight: 300, maxWidth: 380
            }}>
              Enterprise-grade multi-project management. Every decision, every project, every result — centralized.
            </Typography>

          </Box>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#000' }} />
              </motion.div>
              <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.68rem', color: '#999', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                {t('mvOperational')}
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.68rem', color: '#ccc', letterSpacing: '1px' }}>
              {formatDate(currentTime)}
            </Typography>
          </Box>
        </motion.div>
      </Box>

      {/* ─── RIGHT PANEL ─── */}
      <Box sx={{ flex: { xs: 1, md: '0 0 480px' }, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, sm: 6 }, position: 'relative', zIndex: 1 }}>

        {/* Language switcher */}
        <Box sx={{ position: 'absolute', top: 24, right: 28, zIndex: 10 }}>
          <LanguageSwitcher />
        </Box>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} style={{ width: '100%', maxWidth: 400 }}>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 8 }}>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: '#bbb', letterSpacing: '2px' }}>
              {formatTime(currentTime)}
            </Typography>
          </Box>

          {/* Mobile header */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 7 }}>
            <Box sx={{ width: 3, height: 50, bgcolor: '#000', mb: 3 }} />
            <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 200, fontSize: '2.2rem', color: '#000', letterSpacing: '-0.03em' }}>
              Master<br /><Box component="span" sx={{ fontWeight: 700 }}>Control</Box>
            </Typography>
          </Box>

          {/* Form header */}
          <Box sx={{ mb: 5 }}>
            <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 400, fontSize: '1.4rem', color: '#000', letterSpacing: '-0.02em', mb: 0.5 }}>
              {t('mvAuthentication')}
            </Typography>
            <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.875rem', color: '#888', fontWeight: 300 }}>
              {t('mvAuthorizedOnly')}
            </Typography>
          </Box>

          {/* ─── Method toggle ─── */}
          <Box sx={{ display: 'flex', mb: 5, border: '1px solid #e0e0e0' }}>
            {[
              { key: 'email', label: `[01] ${t('mvEmailAddress')}` },
              { key: 'phone', label: `[02] ${t('mvPhone')}` }
            ].map((m) => {
              const isActive = loginMethod === m.key
              return (
                <motion.div key={m.key} style={{ flex: 1 }} whileTap={{ scale: 0.98 }}>
                  <Box
                    onClick={() => { setLoginMethod(m.key); setError('') }}
                    sx={{
                      py: 1.2, textAlign: 'center', cursor: 'pointer',
                      background: isActive ? '#000' : '#fff',
                      borderRight: m.key === 'email' ? '1px solid #e0e0e0' : 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': { background: isActive ? '#000' : '#f7f7f7' }
                    }}
                  >
                    <Typography sx={{
                      fontFamily: '"Courier New", monospace', fontSize: '0.62rem',
                      letterSpacing: '2px', textTransform: 'uppercase',
                      color: isActive ? '#fff' : '#aaa',
                      fontWeight: isActive ? 700 : 400, transition: 'color 0.2s'
                    }}>
                      {m.label}
                    </Typography>
                  </Box>
                </motion.div>
              )
            })}
          </Box>

          {/* Phone hint */}
          <AnimatePresence>
            {loginMethod === 'phone' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, p: '10px 14px', border: '1px solid #f0f0f0', background: '#fafafa' }}>
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#aaa', flexShrink: 0 }} />
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#aaa', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    {t('mvOrUsePhone')}
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 24 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} transition={{ duration: 0.3 }}>
                  <Alert severity="error" sx={{ borderRadius: 0, border: '1px solid #000', background: '#fff', color: '#000', fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', '& .MuiAlert-icon': { color: '#000' } }}>
                    {error}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Credential field */}
            <AnimatePresence mode="wait">
              {loginMethod === 'email' ? (
                <motion.div key="email" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.25 }}>
                  <motion.div animate={focusedField === 'email' ? { x: 2 } : { x: 0 }} transition={{ duration: 0.2 }}>
                    <Box sx={{ mb: 4 }}>
                      <Typography sx={{ fontFamily: '"Courier New", monospace', color: focusedField === 'email' ? '#000' : '#aaa', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', mb: 1.5, display: 'block', transition: 'color 0.2s' }}>
                        [01] {t('mvEmailAddress')}
                      </Typography>
                      <TextField fullWidth type="email" value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                        required placeholder="user@domain.com" sx={fieldSx} />
                    </Box>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="phone" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.25 }}>
                  <Box sx={{ mb: 4 }}>
                    <Typography sx={{ fontFamily: '"Courier New", monospace', color: focusedField === 'phone' ? '#000' : '#aaa', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', mb: 1.5, display: 'block', transition: 'color 0.2s' }}>
                      [02] {t('mvPhone')}
                    </Typography>
  <PhoneInput
    country="us"
    value={formData.phone}
    onChange={(val) => {
      // ✅ PhoneInput devuelve el número SIN el +
      // ej: "15551234567" → nosotros agregamos + al submit
      setFormData({ ...formData, phone: val })
    }}
    onFocus={() => setFocusedField('phone')}
    onBlur={() => setFocusedField(null)}
    inputProps={{ name: 'phone', required: true, autoFocus: true }}
    containerStyle={{ width: '100%' }}
    inputStyle={{
      width: '100%', height: '52px', fontSize: '0.95rem', fontWeight: 300,
      borderRadius: 0,
      border: `${focusedField === 'phone' ? '2px' : '1px'} solid ${focusedField === 'phone' ? '#000' : '#ddd'}`,
      fontFamily: '"Helvetica Neue", sans-serif', color: '#000', background: '#fff',
      boxShadow: focusedField === 'phone' ? '4px 4px 0px rgba(0,0,0,0.06)' : 'none',
      transition: 'all 0.25s'
    }}
    buttonStyle={{
      borderRadius: 0,
      border: `${focusedField === 'phone' ? '2px' : '1px'} solid ${focusedField === 'phone' ? '#000' : '#ddd'}`,
      borderRight: 'none', background: '#fff', transition: 'all 0.25s'
    }}
    dropdownStyle={{ borderRadius: 0, fontFamily: '"Helvetica Neue", sans-serif' }}
  />
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password */}
            <motion.div animate={focusedField === 'password' ? { x: 2 } : { x: 0 }} transition={{ duration: 0.2 }}>
              <Box sx={{ mb: 6 }}>
                <Typography sx={{ fontFamily: '"Courier New", monospace', color: focusedField === 'password' ? '#000' : '#aaa', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', mb: 1.5, display: 'block', transition: 'color 0.2s' }}>
                  {loginMethod === 'email' ? '[02]' : '[03]'} {t('mvPassword')}
                </Typography>
                <TextField fullWidth type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                  required placeholder="••••••••"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#999', '&:hover': { color: '#000', background: 'transparent' } }}>
                          {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={fieldSx}
                />
              </Box>
            </motion.div>

            {/* Submit */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button fullWidth type="submit" disabled={loading}
                endIcon={loading ? null : (
                  <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                    <ArrowForward sx={{ fontSize: 18 }} />
                  </motion.div>
                )}
                sx={{
                  py: 2.2, borderRadius: 0,
                  background: loading ? '#e0e0e0' : '#000',
                  color: loading ? '#999' : '#fff',
                  fontFamily: '"Helvetica Neue", sans-serif',
                  fontWeight: 400, fontSize: '0.9rem',
                  textTransform: 'none', letterSpacing: '1.5px',
                  transition: 'all 0.25s ease',
                  '&:hover': { background: loading ? '#e0e0e0' : '#222', boxShadow: loading ? 'none' : '6px 6px 0px rgba(0,0,0,0.12)' },
                  '&::after': {
                    content: '""', position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.06) 50%,transparent 100%)',
                    transform: loading ? 'translateX(100%)' : 'translateX(-100%)',
                    transition: 'transform 0.6s ease'
                  }
                }}
              >
                {loading ? t('mvSigningIn') : t('mvSignIn')}
              </Button>
            </motion.div>
          </Box>

          {/* Footer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.6 }}>
            <Box sx={{ mt: 7, pt: 4, borderTop: '1px solid #ececec', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: '"Courier New", monospace', color: '#ccc', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                {t('mvSecure')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}>
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#ccc' }} />
                  </motion.div>
                ))}
              </Box>
            </Box>
          </motion.div>
        </motion.div>
      </Box>
    </Box>
  )
}

export default Login