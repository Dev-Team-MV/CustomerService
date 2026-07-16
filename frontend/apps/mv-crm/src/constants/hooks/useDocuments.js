import { useState, useEffect, useCallback } from 'react'
import documentService from '../../services/documentService'
import api from '@shared/services/api'

export const useDocuments = (initialFilters = {}) => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [search, setSearch] = useState('')

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Limpiamos filtros vacíos para no ensuciar la query string
      const cleanFilters = Object.fromEntries(
        Object.entries({ ...filters, q: search }).filter(([_, v]) => v != null && v !== '')
      )
      
      const data = await documentService.getDocuments(cleanFilters)
      let docs = data.documents || []
      
      // ✅ ENRIQUECIMIENTO: Resolver lotes/modelos si vienen como strings
      const needsEnrichment = docs.some(d => d.propertyId && typeof d.propertyId.lot === 'string')
      
      if (needsEnrichment && cleanFilters.projectId) {
        try {
          const propsData = await api.get('/properties', { params: { projectId: cleanFilters.projectId } })
          const properties = Array.isArray(propsData.data) 
            ? propsData.data 
            : (propsData.data.properties || propsData.data.data || [])
          
          const propertyMap = {}
          properties.forEach(p => {
            propertyMap[p._id] = {
              lotNumber: typeof p.lot === 'object' ? p.lot?.number : p.lot,
              modelName: typeof p.model === 'object' ? (p.model?.model || p.model?.name) : p.model
            }
          })
          
          docs = docs.map(doc => {
            if (doc.propertyId && typeof doc.propertyId === 'object' && propertyMap[doc.propertyId._id]) {
              const enriched = propertyMap[doc.propertyId._id]
              return {
                ...doc,
                propertyId: {
                  ...doc.propertyId,
                  lot: { number: enriched.lotNumber },
                  model: { model: enriched.modelName }
                }
              }
            }
            return doc
          })
        } catch (err) {
          console.error('Error enriqueciendo propiedades:', err)
        }
      }
      
      setDocuments(docs)
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError(err.response?.data?.message || 'Error al cargar documentos')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [filters, search])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    const fixedFilters = Object.fromEntries(
      Object.entries(initialFilters).filter(([_, v]) => v != null && v !== '')
    )
    setFilters(fixedFilters)
    setSearch('')
  }, [initialFilters])

  return {
    documents,
    loading,
    error,
    filters,
    search,
    setSearch,
    updateFilter,
    clearFilters,
    refetch: fetchDocuments
  }
}