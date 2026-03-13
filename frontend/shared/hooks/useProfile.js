import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { authService } from '@shared/services/authService'
import userService from '@shared/services/userService'

export function useProfile() {
  const { t } = useTranslation('profile')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Obtener perfil
  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const data = await authService.getProfile()
      setProfile(data)
    } catch (error) {
      setSnackbar({ open: true, message: t('errorLoading'), severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [t])

  // Editar perfil
  const updateProfile = useCallback(async (fields) => {
    setLoading(true)
    try {
      await userService.updateProfile(profile._id, fields)
      await fetchProfile()
      setSnackbar({ open: true, message: t('profileUpdated'), severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || t('profileUpdateError'), severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [profile, fetchProfile, t])

  // Cambiar contraseña
  const changePassword = useCallback(async (current, newPass) => {
    setLoading(true)
    try {
      await authService.changePassword(current, newPass)
      setSnackbar({ open: true, message: t('passwordChanged'), severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || t('passwordChangeError'), severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [t])

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }))

  return {
    profile,
    loading,
    snackbar,
    fetchProfile,
    updateProfile,
    changePassword,
    handleCloseSnackbar,
  }
}