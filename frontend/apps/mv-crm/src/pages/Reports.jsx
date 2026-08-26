import { useState, useRef, useEffect } from 'react' // ✅ Agregado useRef y useEffect
import { useTranslation } from 'react-i18next'
import { Box, Typography, Grid, useMediaQuery, useTheme } from '@mui/material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import ClientsReportSection from '../components/reports/ClientsReportSection'
import PaymentsReportSection from '../components/reports/PaymentsReportSection'
import LeadsReportSection from '../components/reports/LeadsReportSection'

// ✅ IMPORTS PARA EL TOUR
import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getReportsTourSteps, reportsTourConfig } from '../tours/modules/reportsTour'

export default function Reports() {
  const { t } = useTranslation('reports')
  const { t: tCommon } = useTranslation('common')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // ✅ ESTADOS DEL TOUR
  const [isTourMode, setIsTourMode] = useState(false)
  const { startTour, pauseTour, resumeTour } = useTour()
  const tourSteps = getReportsTourSteps(tCommon)
  const tourOptionsRef = useRef(null)

  // ✅ LÓGICA DE INTERCEPCIÓN DEL TOUR
  const handleTourNextClick = (driverObj) => {
    const currentIndex = driverObj.getActiveIndex()
    console.log('🔍 Tour Next Click - Índice actual:', currentIndex)
    setIsTourMode(true)

    // PASO 9: Botón Exportar Leads (Abrir modal)
    if (currentIndex === 9) {
      const exportBtn = document.getElementById('leads-report-export-btn')
      if (exportBtn) {
        console.log('✅ Botón de Exportar Leads encontrado. Simulando clic...')
        exportBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        pauseTour()
        
        const checkModal = setInterval(() => {
          if (document.getElementById('leads-export-modal')) {
            clearInterval(checkModal)
            console.log('✅ Modal de Exportación de Leads encontrado. Reanudando tour en paso 10...')
            setTimeout(() => {
              resumeTour(10, tourSteps, tourOptionsRef.current)
            }, 400)
          }
        }, 150)
      } else {
        console.warn('⚠️ Botón no encontrado. Avanzando...')
        driverObj.moveNext()
      }
      return
    }

    // PASO 11: Cerrar Modal de Leads
    if (currentIndex === 11) {
      const closeBtn = document.getElementById('leads-export-modal-close')
      if (closeBtn) {
        console.log('✅ Cerrando modal de Exportación de Leads...')
        closeBtn.click()
        setTimeout(() => {
          driverObj.moveNext() // Avanza al paso 12 (Finish)
        }, 400)
      } else {
        // Fallback: intentar cerrar haciendo clic fuera o buscando otro botón de cierre
        setTimeout(() => driverObj.moveNext(), 400)
      }
      return
    }

    // Para el resto de pasos, avance normal
    driverObj.moveNext()
  }

  const tourOptions = {
    onNextClick: handleTourNextClick,
    onPrevClick: (driverObj) => driverObj.movePrevious(),
    onDestroy: () => {
      console.log('🛑 Tour de Reportes destruido, limpiando modo tour')
      setIsTourMode(false)
      // Opcional: cerrar el modal de leads si quedó abierto
      const closeBtn = document.getElementById('leads-export-modal-close')
      if (closeBtn) closeBtn.click()
    }
  }
  tourOptionsRef.current = tourOptions

  return (
    <PageLayout
      title={t('title', 'Reportes')}
      subtitle={t('subtitle', 'Centro de exportación de datos')}
      topbarLabel={t('topbarLabel', 'Reportes y Exportación de Datos')}
    >
      {/* ✅ ID: Contenedor Principal */}
      <Box id="reports-page-container" sx={{ p: { xs: 2, sm: 3 } }}>
        
        {/* ✅ Botón del Tour */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <TourButton 
            tourId={reportsTourConfig.id}
            steps={tourSteps}
            label={tCommon('tour.reports.button', 'Ver guía de Reportes')}
            options={tourOptions}
          />
        </Box>

        {/* Secciones */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ClientsReportSection />
          </Grid>

          <Grid item xs={12}>
            <PaymentsReportSection />
          </Grid>

          <Grid item xs={12}>
            <LeadsReportSection />
          </Grid>
        </Grid>

        {/* ✅ Elemento invisible para el paso final */}
        <Box id="reports-finish" sx={{ height: 1, mt: 4 }} />
      </Box>
    </PageLayout>
  )
}