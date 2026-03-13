import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@shared/services/api'

const DEFAULT_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  birthday: '',
  role: 'user',
  password: ''
}

// ── Helpers de formateo ───────────────────────────────────
export const toE164 = (phone) => {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  return `+${digits}`
}

export const formatDisplay = (e164) => {
  if (!e164) return ''
  const digits = e164.replace(/\D/g, '')

  if (digits.startsWith('1') && digits.length === 11) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  if (digits.startsWith('52') && digits.length === 12) {
    return `+52 (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`
  }
  if (digits.startsWith('57') && digits.length === 12) {
    return `+57 (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`
  }
  return `+${digits}`
}

// ── Constantes ────────────────────────────────────────────
export const ONLY_COUNTRIES = ['us', 'mx', 'co']
export const PREFERRED_COUNTRIES = ['us', 'mx', 'co']

export const useResidents = () => {
  const { t } = useTranslation(['residents', 'common'])

  // ── State ──────────────────────────────────────────────────
  const [users,       setUsers]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [stats,       setStats]       = useState({ total: 0, superadmins: 0, admins: 0, residents: 0 })
  const [openDialog,  setOpenDialog]  = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData,    setFormData]    = useState(DEFAULT_FORM)
  const [snackbar,    setSnackbar]    = useState({ open: false, message: '', severity: 'success' })
  const [sendingSMS,  setSendingSMS]  = useState(false)

  // ── Fetch ──────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/users')
      setUsers(res.data)
      setStats({
        total:       res.data.length,
        superadmins: res.data.filter(u => u.role === 'superadmin').length,
        admins:      res.data.filter(u => u.role === 'admin').length,
        residents:   res.data.filter(u => u.role === 'user').length,
      })
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Dialog ─────────────────────────────────────────────────
  const handleOpenDialog = useCallback((user = null) => {
    if (user) {
      setSelectedUser(user)
      setFormData({
        firstName:   user.firstName   || '',
        lastName:    user.lastName    || '',
        email:       user.email       || '',
        phoneNumber: user.phoneNumber || '',
        birthday:    user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
        role:        user.role || 'user',
        password:    ''
      })
    } else {
      setSelectedUser(null)
      setFormData(DEFAULT_FORM)
    }
    setOpenDialog(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)
    setSelectedUser(null)
  }, [])

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = useCallback(async (formattedData) => {
    try {
      const payload = { ...formattedData }

      if (selectedUser) {
        if (!payload.password) delete payload.password
        await api.put(`/users/${selectedUser._id}`, payload)
        setSnackbar({ open: true, message: t('residents:snackbar.updated'), severity: 'success' })
      } else {
        await api.post('/auth/register', { ...payload, skipPasswordSetup: true })
        setSnackbar({ open: true, message: t('residents:snackbar.created'), severity: 'success' })
      }

      handleCloseDialog()
      fetchData()
    } catch (error) {
      console.error('Error saving user:', error)
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message,
        severity: 'error'
      })
    }
  }, [selectedUser, handleCloseDialog, fetchData, t])

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm(t('residents:confirmDelete'))) return
    try {
      await api.delete(`/users/${id}`)
      fetchData()
      setSnackbar({ open: true, message: t('common:actions.deleted'), severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' })
    }
  }, [fetchData, t])

  // ── SMS ────────────────────────────────────────────────────
  const handleSendPasswordSMS = useCallback(async (user) => {
    if (!user.phoneNumber) {
      setSnackbar({ open: true, message: t('residents:snackbar.noPhone'), severity: 'error' })
      return
    }
    setSendingSMS(true)
    try {
      await api.post(`/users/${user._id}/send-password-sms`)
      setSnackbar({
        open: true,
        message: t('residents:snackbar.smsSent', { phone: user.phoneNumber }),
        severity: 'success'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || t('residents:snackbar.smsError'),
        severity: 'error'
      })
    } finally {
      setSendingSMS(false)
    }
  }, [t])

  // ── Filtrado de usuarios disponibles para grupo ─────────────
  const getAvailableUsers = useCallback((group) => {
    if (!group) return users
    const memberIds = group.members.map(m => m.user._id)
    return users.filter(u => !memberIds.includes(u._id))
  }, [users])

  // ── Búsqueda local ──────────────────────────────────────────
  const searchUsers = useCallback((query) => {
    if (!query || query.length < 2) return []
    return users.filter(u =>
      u.firstName?.toLowerCase().includes(query.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase())
    )
  }, [users])

  // ── Filtrado por rol ───────────────────────────────────────
  const getUsersByRole = useCallback((role) => {
    return users.filter(u => u.role === role)
  }, [users])

  // ── Snackbar close ─────────────────────────────────────────
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }, [])

  return {
    // data
    users,
    loading,
    stats,
    // dialog
    openDialog,
    selectedUser,
    formData,
    setFormData,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    // actions
    handleDelete,
    handleSendPasswordSMS,
    sendingSMS,
    // filtrado y búsqueda
    getAvailableUsers,
    searchUsers,
    getUsersByRole,
    // snackbar
    snackbar,
    handleCloseSnackbar,
  }
}