import { useState, useCallback } from 'react'
import payloadService from '../services/payloadService'

const EMPTY_FORM = {
  property: '',
  apartment: '',
  date: new Date().toISOString().split('T')[0],
  amount: '',
  status: 'pending',
  type: '',
  notes: ''
}

// Helper para obtener la URL del archivo principal (soporte)
function getPayloadFileUrl(payload) {
  if (payload?.images && payload.images.length > 0) return payload.images[0]
  if (payload?.urls && payload.urls.length > 0) return payload.urls[0]
  if (payload?.support && typeof payload.support === 'string') return payload.support
  return null
}

// ─────────────────────────────────────────────────────────────
// Hook para administración (admin)
// ─────────────────────────────────────────────────────────────
export const usePayloads = ({
  resourceType = 'property', // o 'apartment'
  fetchResources,            // función para obtener lista de propiedades o apartamentos
  fetchStats                 // función para obtener stats (opcional)
} = {}) => {
  const [payloads, setPayloads] = useState([])
  const [resources, setResources] = useState([])
  const [stats, setStats] = useState({
    totalCollected: 0,
    pendingPayloads: 0,
    rejectedPayloads: 0,
    recentFailures: 0
  })
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedPayload, setSelectedPayload] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [files, setFiles] = useState([])
  const [error, setError] = useState(null)

  // Fetch all data
// ...existing code...

const fetchAll = useCallback(async () => {
  setLoading(true)
  setError(null)
  try {
    // Para admin: resourceId = undefined para traer todos
    const [payloadsData, resourcesData, statsData] = await Promise.all([
      payloadService.getPayloadsByResource(resourceType, undefined),
      fetchResources ? fetchResources() : [],
      fetchStats ? fetchStats() : []
    ])
    setPayloads(payloadsData)
    setResources(resourcesData || [])
    if (statsData) setStats(statsData)
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}, [resourceType, fetchResources, fetchStats])
// ...existing code...
  // Dialog handlers
  const handleOpenDialog = useCallback((payload = null) => {
    if (payload) {
      setSelectedPayload(payload)
      setFormData({
        ...EMPTY_FORM,
        [resourceType]: payload[resourceType]?._id,
        date: new Date(payload.date).toISOString().split('T')[0],
        amount: payload.amount,
        status: payload.status,
        type: payload.type || '',
        notes: payload.notes || ''
      })
    } else {
      setSelectedPayload(null)
      setFormData(EMPTY_FORM)
    }
    setFiles([])
    setOpenDialog(true)
  }, [resourceType])

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)
    setSelectedPayload(null)
    setFormData(EMPTY_FORM)
    setFiles([])
    setError(null)
  }, [])

  // Submit (create/update)
  const handleSubmit = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = {
        ...formData,
        [resourceType]: formData[resourceType]
      }
      if (selectedPayload) {
        await payloadService.updatePayload(selectedPayload._id, data, files)
      } else {
        await payloadService.createPayload(data, files)
      }
      handleCloseDialog()
      await fetchAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [formData, files, resourceType, selectedPayload, handleCloseDialog, fetchAll])

  // Approve
  const handleApprove = useCallback(async (payload, e) => {
    if (e) e.stopPropagation()
    if (!payload) return
    if (!window.confirm('Approve this payment?')) return
    setLoading(true)
    try {
      await payloadService.updatePayload(payload._id, { status: 'signed' })
      await fetchAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [fetchAll])

  // Reject
  const handleReject = useCallback(async (payload, e) => {
    if (e) e.stopPropagation()
    if (!payload) return
    if (!window.confirm('Reject this payment?')) return
    setLoading(true)
    try {
      await payloadService.updatePayload(payload._id, { status: 'rejected' })
      await fetchAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [fetchAll])

  // Download
  const handleDownload = useCallback((payload) => {
    const url = getPayloadFileUrl(payload)
    if (!url) { alert('No attached file available for this payload.'); return }
    window.open(url, '_blank', 'noopener')
  }, [])

  // File handlers
  const handleFilesChange = useCallback((newFiles) => {
    setFiles(Array.from(newFiles))
  }, [])

  // Form field change
  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  return {
    payloads,
    resources,
    stats,
    loading,
    error,
    openDialog,
    selectedPayload,
    formData,
    setFormData,
    files,
    setFiles,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handleApprove,
    handleReject,
    handleDownload,
    handleFilesChange,
    handleFormChange,
    fetchAll
  }
}

// ─────────────────────────────────────────────────────────────
// Hook para usuarios finales (residentes)
// ─────────────────────────────────────────────────────────────
export const usePaymentTab = ({
  resourceType,
  resourceId,
  user,
  onPaymentUploaded,
  requiresSupport = true
}) => {
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    support: null,
    type: '',
  })
  const [uploadingPayment, setUploadingPayment] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [uploadPaymentDialog, setUploadPaymentDialog] = useState(false) // <-- Estado para el modal

  // Validación: soporte obligatorio si no es admin
  const isAdmin = user?.role === 'admin' || user?.isAdmin

  const handlePaymentFormChange = (field, value) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }))
  }

  const handleOpenUploadPayment = () => setUploadPaymentDialog(true)
  const handleCloseUploadPayment = () => {
    setUploadPaymentDialog(false)
    setError(null)
    setSuccess(null)
    setPaymentForm({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      support: null,
      type: '',
    })
  }

  const handlePaymentUpload = async () => {
    setUploadingPayment(true)
    setError(null)
    setSuccess(null)
    try {
      if (!paymentForm.amount || !paymentForm.date) {
        setError('Amount and date are required.')
        setUploadingPayment(false)
        return
      }
      if (requiresSupport && !isAdmin && !paymentForm.support) {
        setError('Support file is required.')
        setUploadingPayment(false)
        return
      }
      const data = {
        amount: paymentForm.amount,
        date: paymentForm.date,
        notes: paymentForm.notes,
        type: paymentForm.type,
        [resourceType]: resourceId,
      }
      const files = paymentForm.support ? [paymentForm.support] : []
      await payloadService.createPayload(data, files)
      setSuccess('Payment uploaded successfully!')
      setPaymentForm({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        support: null,
        type: '',
      })
      if (onPaymentUploaded) onPaymentUploaded()
      setUploadPaymentDialog(false) // <-- Cierra el modal al terminar
    } catch (err) {
      setError(err.message)
    } finally {
      setUploadingPayment(false)
    }
  }

  return {
    paymentForm,
    setPaymentForm,
    uploadingPayment,
    error,
    success,
    uploadPaymentDialog,           // <-- Estado del modal
    handleOpenUploadPayment,       // <-- Abrir modal
    handleCloseUploadPayment,      // <-- Cerrar modal
    handlePaymentFormChange,
    handlePaymentUpload,
  }
}