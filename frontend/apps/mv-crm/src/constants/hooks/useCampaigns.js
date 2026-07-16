// apps/mv-crm/src/constants/hooks/useCampaigns.js
import { useState, useEffect, useCallback, useRef } from 'react'
import campaignService from '../../services/campaignService'

export const useCampaigns = ({ enabled = true } = {}) => {
  const [campaigns, setCampaigns] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const pollingRef = useRef(null)

  const fetchCampaigns = useCallback(async (filters = {}) => {
    if (!enabled) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await campaignService.getAll(filters)
      setCampaigns(data.campaigns || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('[Campaigns] Error fetching:', err)
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  const createCampaign = useCallback(async (data) => {
    try {
      const newCampaign = await campaignService.create(data)
      setCampaigns(prev => [newCampaign, ...prev])
      setTotal(prev => prev + 1)
      return newCampaign
    } catch (err) {
      console.error('[Campaigns] Error creating:', err)
      throw err
    }
  }, [])

  const updateCampaign = useCallback(async (id, data) => {
    try {
      const updated = await campaignService.update(id, data)
      setCampaigns(prev => prev.map(c => c._id === id ? updated : c))
      return updated
    } catch (err) {
      console.error('[Campaigns] Error updating:', err)
      throw err
    }
  }, [])

  const deleteCampaign = useCallback(async (id) => {
    try {
      await campaignService.delete(id)
      setCampaigns(prev => prev.filter(c => c._id !== id))
      setTotal(prev => prev - 1)
      return { success: true }
    } catch (err) {
      console.error('[Campaigns] Error deleting:', err)
      throw err
    }
  }, [])

  const previewCampaign = useCallback(async (id) => {
    try {
      const data = await campaignService.preview(id)
      return data
    } catch (err) {
      console.error('[Campaigns] Error previewing:', err)
      throw err
    }
  }, [])

  const sendCampaign = useCallback(async (id) => {
    try {
      const result = await campaignService.send(id)
      // Actualizar status localmente
      setCampaigns(prev => prev.map(c => 
        c._id === id ? { ...c, status: 'enviando', stats: result.stats } : c
      ))
      return result
    } catch (err) {
      console.error('[Campaigns] Error sending:', err)
      throw err
    }
  }, [])

  // ✅ NUEVO: Polling para stats en tiempo real
  const startStatsPolling = useCallback((id, onStatsUpdate, interval = 3000) => {
    // Limpiar polling anterior
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }

    const poll = async () => {
      try {
        const stats = await campaignService.getStats(id)
        onStatsUpdate?.(stats)
        
        // Detener polling si ya no está enviando
        if (stats.status !== 'enviando') {
          stopStatsPolling()
        }
      } catch (err) {
        console.error('[Campaigns] Error polling stats:', err)
        stopStatsPolling()
      }
    }

    // Ejecutar inmediatamente
    poll()
    
    // Luego cada intervalo
    pollingRef.current = setInterval(poll, interval)
  }, [])

  const stopStatsPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      fetchCampaigns()
    }
    
    return () => {
      stopStatsPolling()
    }
  }, [enabled, fetchCampaigns, stopStatsPolling])

  return {
    campaigns,
    total,
    loading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    previewCampaign,
    sendCampaign,
    startStatsPolling,
    stopStatsPolling
  }
}

export default useCampaigns