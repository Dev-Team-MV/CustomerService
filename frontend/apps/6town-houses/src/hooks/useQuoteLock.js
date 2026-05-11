import { useState, useEffect, useRef, useCallback } from 'react'
import buildingService from '@shared/services/buildingService'

/**
 * Hook para gestionar el ciclo de vida del quote-lock
 * - Adquiere lock automáticamente cuando se habilita (backend genera quoteId)
 * - Renueva el lock cada 10 minutos (antes de que expire a los 15)
 * - Libera el lock al desmontar o cuando se deshabilita
 * 
 * @param {string} buildingId - ID del building a lockear
 * @param {boolean} enabled - Si el lock debe estar activo
 * @returns {Object} Estado y funciones del lock
 */
const useQuoteLock = (buildingId, enabled = false) => {
  const [quoteId, setQuoteId] = useState(null) // Backend lo genera
  const [isLocked, setIsLocked] = useState(false)
  const [lockError, setLockError] = useState(null)
  const renewIntervalRef = useRef(null)
  const isMountedRef = useRef(true)

  // Adquirir lock inicial (backend genera quoteId)
  const acquireLock = useCallback(async () => {
    if (!buildingId || !enabled) return

    try {
      console.log(`🔒 Solicitando lock para building ${buildingId}`)
      
      // Backend genera y retorna el quoteId
      const response = await buildingService.acquireQuoteLock(
        buildingId, 
        null, // No enviamos quoteId, el backend lo genera
        15, 
        'Cotización en progreso'
      )
      
      if (isMountedRef.current) {
        setQuoteId(response.quoteId) // Guardar quoteId generado por el backend
        setIsLocked(true)
        setLockError(null)
        console.log('✅ Lock adquirido con quoteId:', response.quoteId)
      }
    } catch (error) {
      console.error('❌ Error adquiriendo lock:', error)
      
      if (!isMountedRef.current) return

      if (error.response?.status === 409) {
        setLockError('Esta propiedad ya no está disponible para cotización')
      } else if (error.response?.status === 404) {
        setLockError('Propiedad no encontrada')
      } else {
        setLockError('Error al reservar la propiedad')
      }
      setIsLocked(false)
    }
  }, [buildingId, enabled])

  // Renovar lock automáticamente cada 10 minutos
  const startAutoRenew = useCallback(() => {
    if (renewIntervalRef.current) {
      clearInterval(renewIntervalRef.current)
    }

    renewIntervalRef.current = setInterval(async () => {
      if (!buildingId || !quoteId || !isLocked || !isMountedRef.current) return

      try {
        console.log(`🔄 Renovando lock para building ${buildingId} con quoteId ${quoteId}`)
        await buildingService.renewQuoteLock(buildingId, quoteId, 15)
        console.log('✅ Lock renovado exitosamente')
      } catch (error) {
        console.error('❌ Error renovando lock:', error)
        
        if (!isMountedRef.current) return

        setIsLocked(false)
        setLockError('El lock de la propiedad expiró')
        
        if (renewIntervalRef.current) {
          clearInterval(renewIntervalRef.current)
        }
      }
    }, 10 * 60 * 1000) // Renovar cada 10 minutos
  }, [buildingId, quoteId, isLocked])

  // Liberar lock
  const releaseLock = useCallback(async (force = false) => {
    if (!buildingId || !quoteId) return

    // Detener renovación automática
    if (renewIntervalRef.current) {
      clearInterval(renewIntervalRef.current)
      renewIntervalRef.current = null
    }

    try {
      console.log(`🔓 Liberando lock para building ${buildingId} con quoteId ${quoteId}`)
      await buildingService.releaseQuoteLock(buildingId, quoteId, force)
      
      if (isMountedRef.current) {
        setIsLocked(false)
        setQuoteId(null)
        setLockError(null)
        console.log('✅ Lock liberado exitosamente')
      }
    } catch (error) {
      console.error('❌ Error liberando lock:', error)
      // No mostrar error al usuario si falla la liberación
      // El lock expirará automáticamente en el servidor
    }
  }, [buildingId, quoteId])

  // Adquirir lock cuando se habilita
  useEffect(() => {
    if (enabled && buildingId && !quoteId) {
      acquireLock()
    } else if (!enabled && isLocked && quoteId) {
      // Si se deshabilita, liberar el lock
      releaseLock()
    }
  }, [enabled, buildingId, quoteId]) // Incluir quoteId para evitar múltiples adquisiciones

  // Iniciar auto-renovación cuando se adquiere el lock
  useEffect(() => {
    if (isLocked && quoteId) {
      startAutoRenew()
    }

    return () => {
      if (renewIntervalRef.current) {
        clearInterval(renewIntervalRef.current)
      }
    }
  }, [isLocked, quoteId, startAutoRenew])

  // Liberar lock al desmontar el componente
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      
      if (renewIntervalRef.current) {
        clearInterval(renewIntervalRef.current)
      }
      
      // Liberar lock si está activo
      if (isLocked && buildingId && quoteId) {
        buildingService.releaseQuoteLock(buildingId, quoteId, false)
          .then(() => console.log('✅ Lock liberado en cleanup'))
          .catch(err => console.error('❌ Error liberando lock en cleanup:', err))
      }
    }
  }, []) // Solo al desmontar

  return {
    quoteId, // Ahora viene del backend
    isLocked,
    lockError,
    acquireLock,
    releaseLock
  }
}

export default useQuoteLock