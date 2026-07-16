// apps/mv-crm/src/constants/hooks/useQuotes.js
import { useState, useEffect, useCallback, useMemo } from 'react'
import quoteService from '../../services/quoteService'

export const useQuotes = (initialParams = {}) => {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const paramsString = useMemo(() => JSON.stringify(initialParams), [initialParams])

  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await quoteService.getQuotes(initialParams)
      setQuotes(data.quotes || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar cotizaciones')
    } finally {
      setLoading(false)
    }
  }, [paramsString])

  useEffect(() => { 
    fetchQuotes() 
  }, [fetchQuotes])

  const createQuote = async (data) => {
    const res = await quoteService.createQuote(data)
    fetchQuotes()
    return res
  }

  const updateQuote = async (id, data) => {
    const res = await quoteService.updateQuote(id, data)
    fetchQuotes()
    return res
  }

  const deleteQuote = async (id) => {
    await quoteService.deleteQuote(id)
    fetchQuotes()
  }

  // ✅ Nuevas acciones
  const sendQuote = async (id, data) => {
    const res = await quoteService.sendQuote(id, data)
    fetchQuotes()
    return res
  }

  const convertToSale = async (id, data) => {
    const res = await quoteService.convertToSale(id, data)
    fetchQuotes()
    return res
  }

  return { 
    quotes, loading, error, fetchQuotes, 
    createQuote, updateQuote, deleteQuote, 
    sendQuote, convertToSale 
  }
}

export default useQuotes