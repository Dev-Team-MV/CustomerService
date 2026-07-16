// apps/mv-crm/src/constants/hooks/useGlobalSearch.js
import { useState, useEffect, useCallback, useRef } from 'react'
import searchService from '../../services/searchService'

export const useGlobalSearch = ({ debounceMs = 300 } = {}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({
    clients: [],
    leads: [],
    activities: [],
    projects: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [total, setTotal] = useState(0)
  const debounceTimerRef = useRef(null)

  // Función de búsqueda con debounce
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults({
        clients: [],
        leads: [],
        activities: [],
        projects: []
      })
      setTotal(0)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await searchService.search(searchQuery)
      
      console.log('[GlobalSearch] Raw response:', data)
      
      // El backend devuelve: { q, results: { clients, leads, activities, projects }, total }
      const searchResults = data.results || {}
      
      const formattedResults = {
        clients: searchResults.clients || [],
        leads: searchResults.leads || [],
        activities: searchResults.activities || [],
        projects: searchResults.projects || []
      }
      
      console.log('[GlobalSearch] Formatted results:', formattedResults)
      
      setResults(formattedResults)
      setTotal(data.total || 0)
    } catch (err) {
      console.error('[GlobalSearch] Error searching:', err)
      setError(err.response?.data?.message || err.message)
      setResults({
        clients: [],
        leads: [],
        activities: [],
        projects: []
      })
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  // Efecto para manejar el debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (query.trim().length >= 2) {
      setLoading(true)
      debounceTimerRef.current = setTimeout(() => {
        performSearch(query)
      }, debounceMs)
    } else {
      setResults({
        clients: [],
        leads: [],
        activities: [],
        projects: []
      })
      setTotal(0)
      setLoading(false)
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query, debounceMs, performSearch])

  // Abrir/cerrar modal
  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setResults({
      clients: [],
      leads: [],
      activities: [],
      projects: []
    })
    setTotal(0)
    setError(null)
  }, [])

  const toggle = useCallback(() => {
    if (isOpen) {
      close()
    } else {
      open()
    }
  }, [isOpen, open, close])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    isOpen,
    open,
    close,
    toggle,
    total,
    performSearch
  }
}

export default useGlobalSearch