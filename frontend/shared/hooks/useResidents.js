// import { useState, useEffect, useCallback, useMemo } from 'react'
// import { useTranslation } from 'react-i18next'
// import api from '@shared/services/api'

// // --- Helpers ---
// export const toE164 = (phone) => {
//   if (!phone) return ''
//   const digits = phone.replace(/\D/g, '')
//   if (!digits) return ''
//   return `+${digits}`
// }

// export const formatDisplay = (e164) => {
//   if (!e164) return ''
//   const digits = e164.replace(/\D/g, '')
//   if (digits.startsWith('1') && digits.length === 11) {
//     return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
//   }
//   if (digits.startsWith('52') && digits.length === 12) {
//     return `+52 (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`
//   }
//   if (digits.startsWith('57') && digits.length === 12) {
//     return `+57 (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`
//   }
//   return `+${digits}`
// }

// export const ONLY_COUNTRIES = ['us', 'mx', 'co']
// export const PREFERRED_COUNTRIES = ['us', 'mx', 'co']

// const DEFAULT_FORM = {
//   firstName: '',
//   lastName: '',
//   email: '',
//   phoneNumber: '',
//   birthday: '',
//   role: 'user',
//   password: ''
// }

// export const useResidents = () => {
//   const { t } = useTranslation(['residents', 'common'])

//   // --- State ---
//   const [users, setUsers] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [stats, setStats] = useState({ total: 0, superadmins: 0, admins: 0, residents: 0 })
//   const [openDialog, setOpenDialog] = useState(false)
//   const [selectedUser, setSelectedUser] = useState(null)
//   const [formData, setFormData] = useState(DEFAULT_FORM)
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
//   const [sendingSMS, setSendingSMS] = useState(false)

//   // --- Phone/E.164 ---
//   const [e164Value, setE164Value] = useState('')
//   const [displayVal, setDisplayVal] = useState('')
//   const [isPhoneValid, setIsPhoneValid] = useState(false)

//   // --- Fetch users ---
//   const fetchData = useCallback(async () => {
//     setLoading(true)
//     try {
//       const res = await api.get('/users')
//       setUsers(res.data)
//       setStats({
//         total: res.data.length,
//         superadmins: res.data.filter(u => u.role === 'superadmin').length,
//         admins: res.data.filter(u => u.role === 'admin').length,
//         residents: res.data.filter(u => u.role === 'user').length,
//       })
//     } catch (error) {
//       setSnackbar({ open: true, message: error.message, severity: 'error' })
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   useEffect(() => { fetchData() }, [fetchData])

//   // --- Dialog ---
//   const handleOpenDialog = useCallback((user = null) => {
//     if (user) {
//       setSelectedUser(user)
//       setFormData({
//         firstName: user.firstName || '',
//         lastName: user.lastName || '',
//         email: user.email || '',
//         phoneNumber: user.phoneNumber || '',
//         birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
//         role: user.role || 'user',
//         password: ''
//       })
//       setE164Value(toE164(user.phoneNumber))
//       setDisplayVal(formatDisplay(toE164(user.phoneNumber)))
//       setIsPhoneValid(!!user.phoneNumber)
//     } else {
//       setSelectedUser(null)
//       setFormData(DEFAULT_FORM)
//       setE164Value('')
//       setDisplayVal('')
//       setIsPhoneValid(false)
//     }
//     setOpenDialog(true)
//   }, [])

//   const handleCloseDialog = useCallback(() => {
//     setOpenDialog(false)
//     setSelectedUser(null)
//   }, [])

//   // --- Field Change ---
//   const handleFieldChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }))
//     // Si el campo es phoneNumber, actualiza E.164 y validación
//     if (field === 'phoneNumber') {
//       const e164 = toE164(value)
//       setE164Value(e164)
//       setDisplayVal(formatDisplay(e164))
//       setIsPhoneValid(e164.length >= 10)
//     }
//   }

//   // --- PhoneInput Change ---
//   const handlePhoneChange = (value) => {
//     setFormData(prev => ({
//       ...prev,
//       phoneNumber: value
//     }))
//     const e164 = toE164(value)
//     setE164Value(e164)
//     setDisplayVal(formatDisplay(e164))
//     setIsPhoneValid(e164.length >= 10)
//   }

//   // --- Email validation ---
//   const isEmailValid = useMemo(() => {
//     if (!formData.email) return false
//     // Simple regex
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
//   }, [formData.email])

//   // --- Form validation ---
//   const isFormValid = useMemo(() => {
//     return (
//       formData.firstName.trim().length > 0 &&
//       formData.lastName.trim().length > 0 &&
//       isEmailValid &&
//       formData.phoneNumber.trim().length > 0 &&
//       isPhoneValid
//     )
//   }, [formData, isEmailValid, isPhoneValid])

//   // --- Submit ---
//   const handleSubmit = useCallback(async () => {
//     try {
//       const payload = { ...formData }
//       payload.phoneNumber = e164Value || toE164(formData.phoneNumber)
//       if (selectedUser) {
//         if (!payload.password) delete payload.password
//         await api.put(`/users/${selectedUser._id}`, payload)
//         setSnackbar({ open: true, message: t('residents:snackbar.updated'), severity: 'success' })
//       } else {
//         await api.post('/auth/register', { ...payload, skipPasswordSetup: true })
//         setSnackbar({ open: true, message: t('residents:snackbar.created'), severity: 'success' })
//       }
//       handleCloseDialog()
//       fetchData()
//     } catch (error) {
//       setSnackbar({
//         open: true,
//         message: error.response?.data?.message || error.message,
//         severity: 'error'
//       })
//     }
//   }, [formData, selectedUser, handleCloseDialog, fetchData, t, e164Value])

//   // --- Delete ---
//   const handleDelete = useCallback(async (id) => {
//     if (!window.confirm(t('residents:confirmDelete'))) return
//     try {
//       await api.delete(`/users/${id}`)
//       fetchData()
//       setSnackbar({ open: true, message: t('common:actions.deleted'), severity: 'success' })
//     } catch (error) {
//       setSnackbar({ open: true, message: error.message, severity: 'error' })
//     }
//   }, [fetchData, t])

//   // --- SMS ---
//   const handleSendPasswordSMS = useCallback(async (user) => {
//     if (!user.phoneNumber) {
//       setSnackbar({ open: true, message: t('residents:snackbar.noPhone'), severity: 'error' })
//       return
//     }
//     setSendingSMS(true)
//     try {
//       await api.post(`/users/${user._id}/send-password-sms`)
//       setSnackbar({
//         open: true,
//         message: t('residents:snackbar.smsSent', { phone: user.phoneNumber }),
//         severity: 'success'
//       })
//     } catch (error) {
//       setSnackbar({
//         open: true,
//         message: error.response?.data?.message || t('residents:snackbar.smsError'),
//         severity: 'error'
//       })
//     } finally {
//       setSendingSMS(false)
//     }
//   }, [t])

//   // --- Filtrado y búsqueda ---
//   const getAvailableUsers = useCallback((group) => {
//     if (!group) return users
//     const memberIds = group.members.map(m => m.user._id)
//     return users.filter(u => !memberIds.includes(u._id))
//   }, [users])

//   const searchUsers = useCallback((query) => {
//     if (!query || query.length < 2) return []
//     return users.filter(u =>
//       u.firstName?.toLowerCase().includes(query.toLowerCase()) ||
//       u.lastName?.toLowerCase().includes(query.toLowerCase()) ||
//       u.email?.toLowerCase().includes(query.toLowerCase())
//     )
//   }, [users])

//   const getUsersByRole = useCallback((role) => {
//     return users.filter(u => u.role === role)
//   }, [users])

//   // --- Snackbar close ---
//   const handleCloseSnackbar = useCallback(() => {
//     setSnackbar(prev => ({ ...prev, open: false }))
//   }, [])

//   return {
//     users,
//     loading,
//     stats,
//     openDialog,
//     selectedUser,
//     setSelectedUser,
//     formData,
//     setFormData,
//     handleOpenDialog,
//     handleCloseDialog,
//     handleSubmit,
//     handleDelete,
//     handleSendPasswordSMS,
//     sendingSMS,
//     getAvailableUsers,
//     searchUsers,
//     getUsersByRole,
//     snackbar,
//     handleCloseSnackbar,
//     handleFieldChange,
//     handlePhoneChange,
//     isFormValid,
//     e164Value,
//     displayVal,
//     isPhoneValid,
//   }
// }

// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/hooks/useResidents.js
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@shared/services/api'

// --- Helpers ---
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

export const ONLY_COUNTRIES = ['us', 'mx', 'co']
export const PREFERRED_COUNTRIES = ['us', 'mx', 'co']

const DEFAULT_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  birthday: '',
  role: 'user',
  password: ''
}

/**
 * Hook para gestionar residentes con filtrado opcional por proyecto
 * @param {string} projectId - ID del proyecto para filtrar usuarios (opcional)
 */
export const useResidents = (projectId = null) => {
  const { t } = useTranslation(['residents', 'common'])

  // --- State ---
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, superadmins: 0, admins: 0, residents: 0 })
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [sendingSMS, setSendingSMS] = useState(false)

  // --- Phone/E.164 ---
  const [e164Value, setE164Value] = useState('')
  const [displayVal, setDisplayVal] = useState('')
  const [isPhoneValid, setIsPhoneValid] = useState(false)

  // --- Fetch users ---
  // const fetchData = useCallback(async () => {
  //   setLoading(true)
  //   try {
  //     // ✅ Construir URL con filtro de proyecto si existe
  //     const params = {}
  //     if (projectId) {
  //       params.projectId = projectId
  //     }
      
  //     const res = await api.get('/users', { params })
      
  //     // El backend ya devuelve usuarios filtrados por proyecto con campo 'projects'
  //     setUsers(res.data)
  //     setStats({
  //       total: res.data.length,
  //       superadmins: res.data.filter(u => u.role === 'superadmin').length,
  //       admins: res.data.filter(u => u.role === 'admin').length,
  //       residents: res.data.filter(u => u.role === 'user').length,
  //     })
  //   } catch (error) {
  //     setSnackbar({ open: true, message: error.message, severity: 'error' })
  //   } finally {
  //     setLoading(false)
  //   }
  // }, [projectId])
  const fetchData = useCallback(async () => {
  setLoading(true)
  try {
    if (projectId) {
      // ✅ Si hay projectId, hacer 3 llamadas en paralelo
      const [residentsRes, adminsRes, superadminsRes] = await Promise.all([
        api.get('/users', { params: { projectId } }), // Residentes del proyecto
        api.get('/users', { params: { role: 'admin' } }), // Todos los admins
        api.get('/users', { params: { role: 'superadmin' } }) // Todos los superadmins
      ])
 
      // Combinar resultados y eliminar duplicados por _id
      const allUsers = [...residentsRes.data, ...adminsRes.data, ...superadminsRes.data]
      const uniqueUsers = Array.from(
        new Map(allUsers.map(user => [user._id, user])).values()
      )
 
      setUsers(uniqueUsers)
      setStats({
        total: uniqueUsers.length,
        superadmins: uniqueUsers.filter(u => u.role === 'superadmin').length,
        admins: uniqueUsers.filter(u => u.role === 'admin').length,
        residents: uniqueUsers.filter(u => u.role === 'user').length,
      })
    } else {
      // ✅ Sin filtro de proyecto, obtener todos los usuarios
      const res = await api.get('/users')
      setUsers(res.data)
      setStats({
        total: res.data.length,
        superadmins: res.data.filter(u => u.role === 'superadmin').length,
        admins: res.data.filter(u => u.role === 'admin').length,
        residents: res.data.filter(u => u.role === 'user').length,
      })
    }
  } catch (error) {
    setSnackbar({ open: true, message: error.message, severity: 'error' })
  } finally {
    setLoading(false)
  }
}, [projectId])

  useEffect(() => { fetchData() }, [fetchData])

  // --- Dialog ---
  const handleOpenDialog = useCallback((user = null) => {
    if (user) {
      setSelectedUser(user)
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
        role: user.role || 'user',
        password: ''
      })
      setE164Value(toE164(user.phoneNumber))
      setDisplayVal(formatDisplay(toE164(user.phoneNumber)))
      setIsPhoneValid(!!user.phoneNumber)
    } else {
      setSelectedUser(null)
      setFormData(DEFAULT_FORM)
      setE164Value('')
      setDisplayVal('')
      setIsPhoneValid(false)
    }
    setOpenDialog(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)
    setSelectedUser(null)
  }, [])

  // --- Field Change ---
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (field === 'phoneNumber') {
      const e164 = toE164(value)
      setE164Value(e164)
      setDisplayVal(formatDisplay(e164))
      setIsPhoneValid(e164.length >= 10)
    }
  }

  // --- PhoneInput Change ---
  const handlePhoneChange = (value) => {
    setFormData(prev => ({
      ...prev,
      phoneNumber: value
    }))
    const e164 = toE164(value)
    setE164Value(e164)
    setDisplayVal(formatDisplay(e164))
    setIsPhoneValid(e164.length >= 10)
  }

  // --- Email validation ---
  const isEmailValid = useMemo(() => {
    if (!formData.email) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
  }, [formData.email])

  // --- Form validation ---
  const isFormValid = useMemo(() => {
    return (
      formData.firstName.trim().length > 0 &&
      formData.lastName.trim().length > 0 &&
      isEmailValid &&
      formData.phoneNumber.trim().length > 0 &&
      isPhoneValid
    )
  }, [formData, isEmailValid, isPhoneValid])

  // --- Submit ---
  const handleSubmit = useCallback(async () => {
    try {
      const payload = { ...formData }
      payload.phoneNumber = e164Value || toE164(formData.phoneNumber)
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
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message,
        severity: 'error'
      })
    }
  }, [formData, selectedUser, handleCloseDialog, fetchData, t, e164Value])

  // --- Delete ---
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

  // --- SMS ---
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

  // --- Filtrado y búsqueda ---
  const getAvailableUsers = useCallback((group) => {
    if (!group) return users
    const memberIds = group.members.map(m => m.user._id)
    return users.filter(u => !memberIds.includes(u._id))
  }, [users])

  const searchUsers = useCallback((query) => {
    if (!query || query.length < 2) return []
    return users.filter(u =>
      u.firstName?.toLowerCase().includes(query.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase())
    )
  }, [users])

  const getUsersByRole = useCallback((role) => {
    return users.filter(u => u.role === role)
  }, [users])

  // --- Snackbar close ---
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }, [])

  return {
    users,
    loading,
    stats,
    openDialog,
    selectedUser,
    setSelectedUser,
    formData,
    setFormData,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handleDelete,
    handleSendPasswordSMS,
    sendingSMS,
    getAvailableUsers,
    searchUsers,
    getUsersByRole,
    snackbar,
    handleCloseSnackbar,
    handleFieldChange,
    handlePhoneChange,
    isFormValid,
    e164Value,
    displayVal,
    isPhoneValid,
  }
}