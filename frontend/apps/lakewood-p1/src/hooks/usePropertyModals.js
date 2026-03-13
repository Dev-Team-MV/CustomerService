import { useState, useCallback } from 'react'
import useModalState from './useModalState'

const usePropertyModals = () => {
  const phases    = useModalState()
  const contracts = useModalState()
  const details   = useModalState()

  // Edit modal necesita valores editables adicionales
  const [editModal, setEditModal]   = useState({ open: false, property: null })
  const [editValues, setEditValues] = useState({})
  const [savingEdit, setSavingEdit] = useState(false)

  const openEdit = useCallback((property) => {
    setEditValues({
      lot:            property.lot?._id          || '',
      model:          property.model?._id        || '',
      facade:         property.facade?._id       || '',
      users:          property.users?.map(u => u._id) || [],
      price:          property.price             ?? '',
      pending:        property.pending           ?? '',
      initialPayment: property.initialPayment    ?? '',
      status:         property.status            ?? '',
      saleDate:       property.saleDate ? property.saleDate.slice(0, 10) : '',
      hasBalcony:     property.hasBalcony        ?? false,
      modelType:      property.modelType         ?? 'basic',
      hasStorage:     property.hasStorage        ?? false,
    })
    setEditModal({ open: true, property })
  }, [])

  const closeEdit = useCallback(() => {
    setEditModal({ open: false, property: null })
    setEditValues({})
  }, [])

  return {
    phases,
    contracts,
    details,
    editModal,
    editValues,
    setEditValues,
    savingEdit,
    setSavingEdit,
    openEdit,
    closeEdit,
  }
}

export default usePropertyModals