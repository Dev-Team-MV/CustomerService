import { useState, useRef, useEffect, useCallback } from 'react'
import { Box, Tabs, Tab, Paper, Snackbar, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'

import OnboardingPanel from '../components/postSale/tabs/OnboardingPanel'
import WarrantiesPanel from '../components/postSale/tabs/WarrantiesPanel'
import SurveysPanel from '../components/postSale/tabs/SurveysPanel'

import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getPostSaleTourSteps, postSaleTourConfig } from '../tours/modules/postSaleTour'
import { getOnboardingFormTourSteps, onboardingFormTourConfig } from '../tours/features/onboardingFormTour'
import { getOnboardingDetailTourSteps, onboardingDetailTourConfig } from '../tours/features/onboardingDetailTour' // ✅
import { getWarrantyFormTourSteps, warrantyFormTourConfig } from '../tours/features/warrantyFormTour'
import { getWarrantyDetailTourSteps, warrantyDetailTourConfig } from '../tours/features/warrantyDetailTour'
import { getSurveyTemplateFormTourSteps, surveyTemplateFormTourConfig } from '../tours/features/surveyTemplateFormTour'

export default function PostSale() {
  const { t } = useTranslation('postSale')
  const { t: tCommon } = useTranslation('common')
  
  const [tabValue, setTabValue] = useState(0)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const [isTourMode, setIsTourMode] = useState(false)
  const { startTour, pauseTour, resumeTour } = useTour()
  
  // ✅ AHORA SÍ ESTÁN TODOS LOS PASOS INSTANCIADOS
  const tourSteps = getPostSaleTourSteps(tCommon)
  const formSteps = getOnboardingFormTourSteps(tCommon)
  const onboardingDetailSteps = getOnboardingDetailTourSteps(tCommon) // ✅ AGREGADO
  const warrantyFormSteps = getWarrantyFormTourSteps(tCommon)
  const warrantyDetailSteps = getWarrantyDetailTourSteps(tCommon)
  const surveyTemplateFormSteps = getSurveyTemplateFormTourSteps(tCommon)
  
  const tourOptionsRef = useRef(null)

  // ✅ Callbacks estables para los listeners
  const handleResumeFromOnboardingView = useCallback(() => resumeTour(13, tourSteps, tourOptionsRef.current), [resumeTour, tourSteps])
  const handleResumeFromOnboardingForm = useCallback(() => resumeTour(16, tourSteps, tourOptionsRef.current), [resumeTour, tourSteps])
  const handleResumeFromWarrantyForm = useCallback(() => resumeTour(19, tourSteps, tourOptionsRef.current), [resumeTour, tourSteps])
  const handleResumeFromWarrantyDetail = useCallback(() => resumeTour(29, tourSteps, tourOptionsRef.current), [resumeTour, tourSteps])
  const handleResumeFromSurveyDetail = useCallback(() => resumeTour(44, tourSteps, tourOptionsRef.current), [resumeTour, tourSteps])

  useEffect(() => {
    window.addEventListener('tour-resume-onboarding-view', handleResumeFromOnboardingView)
    window.addEventListener('tour-resume-onboarding-form', handleResumeFromOnboardingForm)
    window.addEventListener('tour-resume-warranty-form', handleResumeFromWarrantyForm)
    window.addEventListener('tour-resume-warranty-detail', handleResumeFromWarrantyDetail)
    window.addEventListener('tour-resume-survey-detail', handleResumeFromSurveyDetail)

    return () => {
      window.removeEventListener('tour-resume-onboarding-view', handleResumeFromOnboardingView)
      window.removeEventListener('tour-resume-onboarding-form', handleResumeFromOnboardingForm)
      window.removeEventListener('tour-resume-warranty-form', handleResumeFromWarrantyForm)
      window.removeEventListener('tour-resume-warranty-detail', handleResumeFromWarrantyDetail)
      window.removeEventListener('tour-resume-survey-detail', handleResumeFromSurveyDetail)
    }
  }, [handleResumeFromOnboardingView, handleResumeFromOnboardingForm, handleResumeFromWarrantyForm, handleResumeFromWarrantyDetail, handleResumeFromSurveyDetail])

  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return
    setSnackbar({ ...snackbar, open: false })
  }

  const handleTourNextClick = (driverObj) => {
    const currentIndex = driverObj.getActiveIndex()
    console.log('🔍 Tour Next Click - Índice actual:', currentIndex)
    setIsTourMode(true)

    // ==========================================
    // 1. SECCIÓN ONBOARDING
    // ==========================================
    if (currentIndex === 12) { // ✅ VER DETALLES ONBOARDING (CORREGIDO)
      const viewBtn = document.getElementById('onboarding-action-view')
      if (viewBtn) {
        viewBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        pauseTour()
        setTimeout(() => {
          startTour(onboardingDetailTourConfig.id, onboardingDetailSteps, {
            onNextClick: (driver) => driver.moveNext(),
            onCloseClick: () => { 
              document.getElementById('onboarding-detail-close')?.click()
              window.dispatchEvent(new CustomEvent('tour-resume-onboarding-view')) 
            },
            onDestroyStarted: () => { 
              document.getElementById('onboarding-detail-close')?.click()
              window.dispatchEvent(new CustomEvent('tour-resume-onboarding-view')) 
            }
          })
        }, 800)
      } else {
        driverObj.moveNext()
      }
      return
    }

    if (currentIndex === 13 || currentIndex === 14) { // Editar / Eliminar
      driverObj.moveNext()
      return
    }

    if (currentIndex === 15) { // Nuevo Onboarding
      const newBtn = document.getElementById('onboarding-new-btn')
      if (newBtn) {
        newBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        pauseTour()
        setTimeout(() => {
          startTour(onboardingFormTourConfig.id, formSteps, {
            onNextClick: (driver) => driver.moveNext(),
            onCloseClick: () => { 
              document.getElementById('onboarding-form-close-btn')?.click()
              window.dispatchEvent(new CustomEvent('tour-resume-onboarding-form')) 
            },
            onDestroyStarted: () => { 
              document.getElementById('onboarding-form-close-btn')?.click()
              window.dispatchEvent(new CustomEvent('tour-resume-onboarding-form')) 
            }
          })
        }, 800)
      }
      return
    }

    // ==========================================
    // 2. TRANSICIÓN A GARANTÍAS
    // ==========================================
    if (currentIndex === 16) { // Pestaña Garantías
      const tab = document.getElementById('post-sale-tab-warranties')
      if (tab) {
        tab.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        setTimeout(() => driverObj.moveNext(), 300)
      }
      return
    }

    if (currentIndex === 18) { // Crear Reclamo
      const createBtn = document.getElementById('warranties-create-btn')
      if (createBtn) {
        createBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        pauseTour()
        setTimeout(() => {
          startTour(warrantyFormTourConfig.id, warrantyFormSteps, {
            onNextClick: (driver) => driver.moveNext(),
            onCloseClick: () => { 
              document.getElementById('warranty-form-close-btn')?.click()
              window.dispatchEvent(new CustomEvent('tour-resume-warranty-form')) 
            },
            onDestroyStarted: () => { 
              document.getElementById('warranty-form-close-btn')?.click()
              window.dispatchEvent(new CustomEvent('tour-resume-warranty-form')) 
            }
          })
        }, 800)
      }
      return
    }

    if (currentIndex === 28) { // Ver Detalles Garantía
      const viewBtn = document.getElementById('warranty-action-view')
      if (viewBtn) {
        viewBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        pauseTour()
        setTimeout(() => {
          startTour(warrantyDetailTourConfig.id, warrantyDetailSteps, {
            onNextClick: (driver) => driver.moveNext(),
            onCloseClick: () => { 
              document.getElementById('warranty-detail-close-btn')?.click()
              window.dispatchEvent(new CustomEvent('tour-resume-warranty-detail')) 
            },
            onDestroyStarted: () => { 
              document.getElementById('warranty-detail-close-btn')?.click()
              window.dispatchEvent(new CustomEvent('tour-resume-warranty-detail')) 
            }
          })
        }, 800)
      } else { 
        driverObj.moveNext() 
      }
      return
    }

    // ==========================================
    // 3. TRANSICIÓN A ENCUESTAS
    // ==========================================
    if (currentIndex === 29) { // Pestaña Encuestas
      const tab = document.getElementById('post-sale-tab-surveys')
      if (tab) {
        tab.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        setTimeout(() => driverObj.moveNext(), 300)
      }
      return
    }
    
    if (currentIndex === 41) { // Botón Ver Detalles Encuesta
      const viewBtn = document.getElementById('survey-action-view')
      if (viewBtn) {
        viewBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        const checkModal = setInterval(() => {
          if (document.getElementById('survey-detail-modal')) {
            clearInterval(checkModal)
            console.log('✅ Modal de detalles encontrado, avanzando al paso 42')
            driverObj.moveNext()
          }
        }, 100)
      } else { 
        driverObj.moveNext() 
      }
      return
    }

    if (currentIndex === 47) { // Botón de cerrar del modal de detalles de encuesta
      const closeBtn = document.getElementById('survey-detail-close-btn')
      if (closeBtn) {
        closeBtn.click()
        setTimeout(() => driverObj.moveNext(), 500)
      } else {
        driverObj.moveNext()
      }
      return
    }

    // ==========================================
    // 4. TRANSICIÓN A PLANTILLAS
    // ==========================================
    if (currentIndex === 48) { // Pestaña Plantillas
      const tab = document.getElementById('surveys-tab-templates')
      if (tab) {
        tab.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        setTimeout(() => driverObj.moveNext(), 300)
      }
      return
    }
    
    if (currentIndex === 50) { // Botón Nueva Plantilla (ABRIR MODAL)
      const newBtn = document.getElementById('templates-new-btn')
      if (newBtn) {
        newBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        const checkModal = setInterval(() => {
          if (document.getElementById('survey-template-form-modal')) {
            clearInterval(checkModal)
            console.log('✅ Modal de plantillas encontrado, avanzando al paso 51')
            driverObj.moveNext()
          }
        }, 100)
      } else { 
        driverObj.moveNext() 
      }
      return
    }

    if (currentIndex === 55) { // Botón de cerrar del modal de plantillas
      const closeBtn = document.getElementById('survey-template-form-close-btn')
      if (closeBtn) {
        closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        setTimeout(() => {
          driverObj.moveNext() // Avanza al paso 56 (#post-sale-finish)
        }, 500)
      } else {
        driverObj.moveNext()
      }
      return
    }

    // ==========================================
    // 5. FINAL
    // ==========================================
    driverObj.moveNext()
  }

  const tourOptions = {
    onNextClick: handleTourNextClick,
    onPrevClick: (driverObj) => driverObj.movePrevious(),
    onDestroy: () => {
      console.log('🛑 Tour principal destruido, limpiando modo tour')
      setIsTourMode(false)
    }
  }
  tourOptionsRef.current = tourOptions

  return (
    <PageLayout title={t('page.title')} subtitle={t('page.subtitle')} topbarLabel={t('page.topbarlabel')}>
      <Box id="post-sale-page-container">
        <Paper sx={{ borderRadius: 0, overflow: 'hidden', border: '1px solid #ececec', mx: { xs: 2, sm: 3 }, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, pb: 0 }}>
            <TourButton 
              tourId={postSaleTourConfig.id}
              steps={tourSteps}
              label={tCommon('tour.postSale.button', 'Ver guía de Post-Venta')}
              options={tourOptions}
            />
          </Box>

          <Tabs id="post-sale-tabs" value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: '1px solid #ececec', px: 2, bgcolor: '#fafafa' }}>
            <Tab id="post-sale-tab-onboarding" label={t('tabs.onboarding')} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.8rem', letterSpacing: '0.5px' }} />
            <Tab id="post-sale-tab-warranties" label={t('tabs.warranties')} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.8rem', letterSpacing: '0.5px' }} />
            <Tab id="post-sale-tab-surveys" label={t('tabs.surveys')} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.8rem', letterSpacing: '0.5px' }} />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && <OnboardingPanel onNotify={showNotification} isTourMode={isTourMode} />}
            {tabValue === 1 && <WarrantiesPanel onNotify={showNotification} isTourMode={isTourMode} />}
            {tabValue === 2 && <SurveysPanel onNotify={showNotification} isTourMode={isTourMode} />}
          </Box>
        </Paper>

        <Box id="post-sale-finish" sx={{ height: 1 }} />
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 0, border: '1px solid', fontFamily: '"Courier New", monospace', fontSize: '0.8rem' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  )
}