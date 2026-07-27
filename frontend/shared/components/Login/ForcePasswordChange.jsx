// /Users/oficina/MV-CRM/CustomerService/frontend/shared/components/Login/ForcePasswordChange.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  Container
} from '@mui/material'
import { Visibility, VisibilityOff, LockReset, CheckCircle } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'

const ForcePasswordChange = () => {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  
  // ✅ Eliminamos currentPassword y showCurrentPassword
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (newPassword.length < 6) {
      setError(t('passwordTooShort', 'La contraseña debe tener al menos 6 caracteres'))
      return
    }

    if (newPassword !== confirmPassword) {
      setError(t('passwordsDoNotMatch', 'Las contraseñas no coinciden'))
      return
    }

    setLoading(true)

    try {
      // ✅ Llamar al nuevo endpoint específico para contraseñas temporales
      const data = await authService.completeRequiredPassword(newPassword)

      // ✅ Actualizar el contexto y localStorage con la nueva data del usuario 
      // (El backend debería devolver { token, user: { ...mustChangePassword: false } })
      if (data && data.user) {
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        if (data.token) {
          localStorage.setItem('token', data.token)
        }
      } else {
        // Fallback por si el backend no devuelve el objeto user completo
        const updatedUser = { ...user, mustChangePassword: false }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }

      setSuccess(true)

      // Esperar un momento y redirigir
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 2000)
      
    } catch (err) {
      // Manejo de errores específicos del backend (400, 403)
      const errorMsg = err.response?.data?.message || t('passwordChangeError', 'Error al cambiar la contraseña')
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
              <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                {t('passwordChangedSuccess', 'Contraseña cambiada exitosamente')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('redirecting', 'Redirigiendo...')}
              </Typography>
            </Paper>
          </motion.div>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <LockReset sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                {t('mustChangePassword', 'Debe cambiar su contraseña')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('forcePasswordChangeInfo', 'Por seguridad, debe establecer una nueva contraseña antes de continuar')}
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {/* ✅ NUEVA Contraseña (Ya no hay "Contraseña actual") */}
              <TextField
                required
                fullWidth
                type={showNewPassword ? 'text' : 'password'}
                label={t('newPassword', 'Nueva contraseña')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* Confirmar Contraseña */}
              <TextField
                required
                fullWidth
                type={showConfirmPassword ? 'text' : 'password'}
                label={t('confirmPassword', 'Confirmar contraseña')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 4 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ py: 1.5, borderRadius: 2, fontSize: '1rem', fontWeight: 600 }}
              >
                {loading ? t('saving', 'Guardando...') : t('changePassword', 'Cambiar contraseña')}
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Box>    
    </Container>
  )
}

export default ForcePasswordChange