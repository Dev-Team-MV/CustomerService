import { useState, useCallback } from 'react'

const useModalState = (initialData = null) => {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(initialData)

  const openModal = useCallback((payload = null) => {
    setData(payload ?? initialData)
    setOpen(true)
  }, [initialData])

  const closeModal = useCallback(() => {
    setOpen(false)
    // NO limpiamos data a null — restauramos al initialData
    // para evitar crashes en componentes que leen data mientras animan el cierre
    setTimeout(() => setData(initialData), 300)
  }, [initialData])

  return {
    open,
    data,
    setData,      // <-- Esta función debe usarse como setFormData
    openModal,
    closeModal
  }}

export default useModalState