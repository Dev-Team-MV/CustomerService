import { useState, useCallback } from 'react'
import { useTranslation }        from 'react-i18next'
import api                       from '@shared/services/api'
import uploadService             from '../services/uploadService'
import useFetch                  from './useFetch'
import { getFileUrl }            from '../constants/Columns/payloads'

const EMPTY_FORM = {
  property: '',
  date:     new Date().toISOString().split('T')[0],
  amount:   0,
  status:   'pending',
  type:     '',
  notes:    ''
}

const EMPTY_PAYMENT_FORM = {
  amount:  '',
  date:    new Date().toISOString().split('T')[0],
  type:    '',
  support: null,
  notes:   '',
}

// ─────────────────────────────────────────────────────────────
// usePayloads — modo admin (Payloads.jsx)
// ─────────────────────────────────────────────────────────────
export const usePayloads = () => {
  const { t } = useTranslation(['payloads', 'common'])

  // ── Remote data ───────────────────────────────────────────
  const {
    data: payloads,
    loading: loadingPayloads,
    refetch: refetchPayloads
  } = useFetch(useCallback(() => api.get('/payloads').then(r => r.data), []))

  const {
    data: properties,
    loading: loadingProperties
  } = useFetch(useCallback(() => api.get('/properties').then(r => r.data), []))

  const {
    data: statsData,
    refetch: refetchStats
  } = useFetch(useCallback(() => api.get('/payloads/stats').then(r => r.data), []))

  const loading = loadingPayloads || loadingProperties

  const stats = statsData ?? {
    totalCollected:   0,
    pendingPayloads:  0,
    rejectedPayloads: 0,
    recentFailures:   0
  }

  // ── Dialog state ──────────────────────────────────────────
  const [openDialog,      setOpenDialog]      = useState(false)
  const [selectedPayload, setSelectedPayload] = useState(null)
  const [formData,        setFormData]        = useState(EMPTY_FORM)

  // ── Refetch all ───────────────────────────────────────────
  const refetch = useCallback(() => {
    refetchPayloads()
    refetchStats()
  }, [refetchPayloads, refetchStats])

  // ── Dialog handlers ───────────────────────────────────────
  const handleOpenDialog = useCallback((payload = null) => {
    if (payload) {
      setSelectedPayload(payload)
      setFormData({
        property: payload.property._id,
        date:     new Date(payload.date).toISOString().split('T')[0],
        amount:   payload.amount,
        status:   payload.status,
        type:     payload.type  || '',
        notes:    payload.notes || ''
      })
    } else {
      setSelectedPayload(null)
      setFormData(EMPTY_FORM)
    }
    setOpenDialog(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)
    setSelectedPayload(null)
  }, [])

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    try {
      if (selectedPayload) {
        await api.put(`/payloads/${selectedPayload._id}`, formData)
      } else {
        await api.post('/payloads', formData)
      }
      handleCloseDialog()
      refetch()
    } catch (error) {
      console.error('Error saving payload:', error)
    }
  }, [selectedPayload, formData, handleCloseDialog, refetch])

  // ── Approve ───────────────────────────────────────────────
  const handleApprove = useCallback(async (payload, e) => {
    e.stopPropagation()
    if (!payload) return
    if (!window.confirm(t('payloads:confirmApprove'))) return
    try {
      await api.put(`/payloads/${payload._id}`, { status: 'signed' })
      refetch()
    } catch (err) {
      console.error('Error approving payload:', err)
    }
  }, [refetch, t])

  // ── Reject ────────────────────────────────────────────────
  const handleReject = useCallback(async (payload, e) => {
    e.stopPropagation()
    if (!payload) return
    if (!window.confirm(t('payloads:confirmReject'))) return
    try {
      await api.put(`/payloads/${payload._id}`, { status: 'rejected' })
      refetch()
    } catch (err) {
      console.error('Error rejecting payload:', err)
    }
  }, [refetch, t])

  // ── Download ──────────────────────────────────────────────
  const handleDownload = useCallback((payload) => {
    const url = getFileUrl(payload)
    if (!url) { alert('No attached file available for this payload.'); return }
    window.open(url, '_blank', 'noopener')
  }, [])

  return {
    payloads, properties, stats, loading,
    openDialog, selectedPayload, formData, setFormData,
    handleOpenDialog, handleCloseDialog, handleSubmit,
    handleApprove, handleReject, handleDownload,
  }
}

// ─────────────────────────────────────────────────────────────
// usePaymentTab — modo usuario (PaymentTab.jsx)
// Reutiliza la misma lógica base pero adaptada al contexto
// del residente: upload de soporte + validación por rol
// ─────────────────────────────────────────────────────────────
export const usePaymentTab = ({ propertyDetails, user, onPaymentUploaded }) => {
  const { t } = useTranslation(['myProperty', 'common'])

  // ── Role helpers ──────────────────────────────────────────
  const isAdminUser   = user?.role === 'admin' || user?.role === 'superadmin'
  const requiresSupport = !isAdminUser

  // ── Dialog state ──────────────────────────────────────────
  const [uploadPaymentDialog, setUploadPaymentDialog] = useState(false)
  const [uploadingPayment,    setUploadingPayment]    = useState(false)
  const [paymentForm,         setPaymentForm]         = useState(EMPTY_PAYMENT_FORM)

  // ── Open / Close ──────────────────────────────────────────
  const handleOpenUploadPayment = useCallback(() => {
    setPaymentForm(EMPTY_PAYMENT_FORM)
    setUploadPaymentDialog(true)
  }, [])

  const handleCloseUploadPayment = useCallback(() => {
    setUploadPaymentDialog(false)
    setPaymentForm(EMPTY_PAYMENT_FORM)
  }, [])

  // ── Form field change ─────────────────────────────────────
  const handlePaymentFormChange = useCallback((field, value) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }))
  }, [])

  // ── Submit ────────────────────────────────────────────────
  const handleSubmitPayment = useCallback(async () => {
    if (!paymentForm.amount || !paymentForm.type) {
      alert(t('myProperty:pleaseFillAmountType'))
      return
    }
    if (requiresSupport && !paymentForm.support) {
      alert(t('myProperty:pleaseAttachSupport'))
      return
    }

    setUploadingPayment(true)
    try {
      let urls = []

      // Residentes suben soporte, admins no lo necesitan
      if (requiresSupport && paymentForm.support) {
        const url = await uploadService.uploadPaymentImage(paymentForm.support)
        urls = [url]
      }

      const propertyId = propertyDetails?.property?._id ?? propertyDetails?._id

      await api.post('/payloads', {
        property: propertyId,
        amount:   paymentForm.amount,
        date:     paymentForm.date,
        type:     paymentForm.type,
        status:   'pending',
        urls,
        notes:    paymentForm.notes,
      })

      handleCloseUploadPayment()
      onPaymentUploaded?.()
      alert(t('myProperty:paymentSubmitted'))
    } catch (err) {
      console.error('Error submitting payment:', err)
      alert(t('myProperty:paymentError'))
    } finally {
      setUploadingPayment(false)
    }
  }, [paymentForm, requiresSupport, propertyDetails, handleCloseUploadPayment, onPaymentUploaded, t])

  return {
    // dialog
    uploadPaymentDialog,
    handleOpenUploadPayment,
    handleCloseUploadPayment,
    // form
    paymentForm,
    handlePaymentFormChange,
    // submit
    uploadingPayment,
    handleSubmitPayment,
    // role
    isAdminUser,
    requiresSupport,
  }
}