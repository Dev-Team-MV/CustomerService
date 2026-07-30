// apps/mv-crm/src/constants/hooks/useVendors.js
import { useState, useEffect, useCallback } from 'react'
import vendorService from '../../services/vendorService'

export const useVendors = (initialFilters = {}) => {
  const [vendors, setVendors] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    projectId: initialFilters.projectId || '',
    scope: initialFilters.scope || '',
    location: '',
    search: '',
    status: 'active'
  })

  const fetchCategories = useCallback(async () => {
    try {
      const data = await vendorService.getCategories()
      setCategories(data)
    } catch (err) {
      console.error('Error fetching vendor categories:', err)
    }
  }, [])

  const fetchVendors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await vendorService.getVendors(filters)
      setVendors(Array.isArray(data) ? data : data.vendors || [])
    } catch (err) {
      console.error('Error fetching vendors:', err)
      setError(err.response?.data?.message || 'Error al cargar el directorio de proveedores')
      setVendors([])
    } finally {
      setLoading(false)
    }
  }, [filters]) // ✅ Se ejecuta cada vez que 'filters' cambia

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  // ✅ Limpia TODOS los filtros, incluyendo projectId y scope
  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      subcategory: '',
      projectId: '',
      scope: '',
      location: '',
      search: '',
      status: 'active'
    })
  }, [])

  const handleCreate = useCallback(async (data) => {
    const newVendor = await vendorService.createVendor(data)
    setVendors(prev => [newVendor, ...prev])
    return newVendor
  }, [])

  const handleUpdate = useCallback(async (id, data) => {
    const updatedVendor = await vendorService.updateVendor(id, data)
    setVendors(prev => prev.map(v => v._id === id ? updatedVendor : v))
    return updatedVendor
  }, [])

  const handleDelete = useCallback(async (id) => {
    await vendorService.deleteVendor(id)
    setVendors(prev => prev.filter(v => v._id !== id))
  }, [])

  return {
    vendors,
    categories,
    loading,
    error,
    filters, // ✅ Exponemos los filtros para que el componente los use directamente
    updateFilter,
    clearFilters,
    refetch: fetchVendors,
    createVendor: handleCreate,
    updateVendor: handleUpdate,
    deleteVendor: handleDelete,
    uploadPhoto: vendorService.uploadImage
  }
}

export default useVendors