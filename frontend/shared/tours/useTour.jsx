import { createContext, useContext, useCallback, useRef } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

const TourContext = createContext(null)

export const TourProvider = ({ children }) => {
  const driverRef = useRef(null)
  const pausedTourRef = useRef(null)
  const activeTourIdRef = useRef(null)
  const currentStepsRef = useRef(null)

  const startTour = useCallback((tourId, steps, options = {}) => {
    if (driverRef.current) {
      driverRef.current.destroy()
    }

    activeTourIdRef.current = tourId
    currentStepsRef.current = steps

    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.7,
      animate: true,
      steps: steps,
      nextBtnText: options.nextBtnText || 'Siguiente →',
      prevBtnText: options.prevBtnText || '← Anterior',
      doneBtnText: options.doneBtnText || 'Finalizar',
      
      // ✅ CORRECCIÓN: Ejecutar callback PRIMERO, luego destruir
      onCloseClick: () => {
        // 1. PRIMERO ejecutamos el callback personalizado (dispara el evento de reanudación)
        options.onCloseClick?.()
        
        // 2. LUEGO limpiamos y destruimos
        driverObj.destroy()
        activeTourIdRef.current = null
        currentStepsRef.current = null
        // NO borramos pausedTourRef aquí - dejamos que resumeTour lo haga
      },
      
      // ✅ CORRECCIÓN: Ejecutar callback PRIMERO, luego destruir
      onDestroyStarted: () => {
        // 1. PRIMERO ejecutamos el callback personalizado si existe
        if (options.onDestroyStarted) {
          options.onDestroyStarted()
        } else {
          driverObj.destroy()
        }
        
        // 2. LUEGO limpiamos
        activeTourIdRef.current = null
        currentStepsRef.current = null
        // NO borramos pausedTourRef aquí
      },
      
      onPrevClick: () => {
        if (options.onPrevClick) {
          options.onPrevClick(driverObj)
        } else {
          driverObj.movePrevious()
        }
      },
      
      onNextClick: () => {
        if (options.onNextClick) {
          options.onNextClick(driverObj)
        } else {
          driverObj.moveNext()
        }
      }
    })

    driverRef.current = driverObj
    driverObj.drive(options.startIndex || 0)
    
    return driverObj
  }, [])

  const pauseTour = useCallback(() => {
    if (driverRef.current && activeTourIdRef.current) {
      const currentIndex = driverRef.current.getActiveIndex()
      const currentSteps = currentStepsRef.current
      
      console.log('[Tour] Pausing at index:', currentIndex, 'Total steps:', currentSteps?.length)
      
      pausedTourRef.current = {
        tourId: activeTourIdRef.current,
        steps: currentSteps,
        currentIndex
      }
      
      driverRef.current.destroy()
      driverRef.current = null
      activeTourIdRef.current = null
      currentStepsRef.current = null
      return true
    }
    return false
  }, [])

  const resumeTour = useCallback((startFromStep, tourSteps, tourOptions = {}) => {
    const paused = pausedTourRef.current
    if (!paused) {
      console.log('[Tour] No paused tour to resume')
      return false
    }

    const stepsToUse = tourSteps || paused.steps
    const startAt = startFromStep ?? (paused.currentIndex + 1)
    const { tourId } = paused
    
    console.log('[Tour] Resuming from step:', startAt)
    
    // ✅ AHORA SÍ lo limpiamos, porque ya lo vamos a reanudar
    pausedTourRef.current = null

    if (!stepsToUse || startAt >= stepsToUse.length) {
      localStorage.setItem(`tour_${tourId}_completed`, 'true')
      return false
    }

    setTimeout(() => {
      startTour(tourId, stepsToUse, { ...tourOptions, startIndex: startAt })
    }, 200)
    
    return true
  }, [startTour])

  const stopTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy()
      driverRef.current = null
      activeTourIdRef.current = null
      currentStepsRef.current = null
    }
    pausedTourRef.current = null
  }, [])

  const hasCompletedTour = useCallback((tourId) => {
    return localStorage.getItem(`tour_${tourId}_completed`) === 'true'
  }, [])

  const resetTour = useCallback((tourId) => {
    localStorage.removeItem(`tour_${tourId}_completed`)
  }, [])

  const isPaused = useCallback(() => {
    return pausedTourRef.current !== null
  }, [])

  return (
    <TourContext.Provider value={{ 
      startTour, 
      stopTour, 
      hasCompletedTour,
      resetTour,
      pauseTour,
      resumeTour,
      isPaused
    }}>
      {children}
    </TourContext.Provider>
  )
}

export const useTour = () => {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour must be used within a TourProvider')
  }
  return context
}