// @shared/hooks/useFetch.js
import { useState, useEffect, useCallback } from 'react'

const useFetch = (fetchFn, options = {}) => {
  const { immediate = true, initialData = [] } = options
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      console.error('useFetch error:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    if (immediate) refetch()
  }, [immediate, refetch])

  return { data, loading, error, refetch, setData }
}

export default useFetch