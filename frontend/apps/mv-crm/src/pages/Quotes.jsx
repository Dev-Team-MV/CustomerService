import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Button, Chip, CircularProgress, Alert, Paper } from '@mui/material'
import { Add, Description } from '@mui/icons-material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import DataTable from '@shared/components/table/DataTable'
import QuoteBuilderModal from '../components/quotes/QuoteBuilderModal'
import SendQuoteModal from '../components/quotes/SendQuoteModal'
import ConvertToSaleModal from '../components/quotes/ConvertToSaleModal'
import { useQuoteColumns } from '../constants/Columns/quoteColumns'
import { useQuotes } from '../constants/hooks/useQuotes'
import { useProjects } from '@shared/hooks/useProjects'
import { useLeads } from '../constants/hooks/useLeads'
import { useResidents } from '@shared/hooks/useResidents'
import quoteService from '../services/quoteService'

// ✅ IMPORTS PARA EL TOUR
import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getQuoteTourSteps, quoteTourConfig } from '../tours/modules/quoteTour'
import { getQuoteBuilderTourSteps, quoteBuilderTourConfig } from '../tours/features/quoteBuilderTour'
import { getSendQuoteTourSteps, sendQuoteTourConfig } from '../tours/features/sendQuoteTour'
import { getConvertToSaleTourSteps, convertToSaleTourConfig } from '../tours/features/convertToSaleTour'

export default function Quotes() {
  const { t } = useTranslation('quoteCrm')
  const { t: tCommon } = useTranslation('common')
  const { projects } = useProjects()
  const { leads } = useLeads()
  const { users: clients } = useResidents()

  const { 
    quotes, loading, error, fetchQuotes,
    createQuote, updateQuote, deleteQuote
  } = useQuotes()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [convertModalOpen, setConvertModalOpen] = useState(false)

  // ✅ ESTADOS DEL TOUR
  const [isTourMode, setIsTourMode] = useState(false)
  const { startTour, pauseTour, resumeTour } = useTour()
  const tourSteps = getQuoteTourSteps(tCommon)
  const builderSteps = getQuoteBuilderTourSteps(tCommon)
  const sendSteps = getSendQuoteTourSteps(tCommon)
  const convertSteps = getConvertToSaleTourSteps(tCommon)
  const tourOptionsRef = useRef(null)

  // ✅ ESCUCHAR REANUDACIÓN DESDE LOS SUBTOURS
  useEffect(() => {
    const handleResumeBuilder = () => resumeTour(3, tourSteps, tourOptionsRef.current) // Vuelve a la tabla
    const handleResumeSend = () => resumeTour(12, tourSteps, tourOptionsRef.current)   // Vuelve al botón Convertir
    const handleResumeConvert = () => resumeTour(13, tourSteps, tourOptionsRef.current) // Vuelve al botón PDF

    window.addEventListener('tour-resume-quote-builder', handleResumeBuilder)
    window.addEventListener('tour-resume-send-quote', handleResumeSend)
    window.addEventListener('tour-resume-convert-sale', handleResumeConvert)

    return () => {
      window.removeEventListener('tour-resume-quote-builder', handleResumeBuilder)
      window.removeEventListener('tour-resume-send-quote', handleResumeSend)
      window.removeEventListener('tour-resume-convert-sale', handleResumeConvert)
    }
  }, [resumeTour, tourSteps])

  const handleCreate = () => {
    setSelectedQuote(null)
    setModalOpen(true)
  }

  const handleEdit = (quote) => {
    setSelectedQuote(quote)
    setModalOpen(true)
  }

  const handleSave = async (id, data) => {
    if (id) await updateQuote(id, data)
    else await createQuote(data)
  }

  const handleDelete = async (id) => {
    if (window.confirm(t('confirmDelete', '¿Estás seguro de eliminar esta cotización?'))) {
      await deleteQuote(id)
    }
  }

  const handleSend = (quote) => {
    setSelectedQuote(quote)
    setSendModalOpen(true)
  }

  const handleConvert = (quote) => {
    setSelectedQuote(quote)
    setConvertModalOpen(true)
  }

  const handleDownload = async (quote) => {
    try {
      await quoteService.downloadPdf(quote._id)
    } catch (err) {
      alert('Error al descargar el PDF')
    }
  }

  // ✅ FUNCIÓN PARA ABRIR EL BUILDER DESDE EL TOUR
  const handleCreateForTour = () => {
    setSelectedQuote(null)
    setIsTourMode(true)
    setModalOpen(true)
  }

  // ✅ LÓGICA DE INTERCEPCIÓN DEL TOUR (Múltiples subtours)
  const handleTourNextClick = (driverObj) => {
    const currentIndex = driverObj.getActiveIndex()
    
    // Índice 2: Botón "Nueva Cotización"
    // Índice 2: Botón "Nueva Cotización"
    if (currentIndex === 2) {
      handleCreateForTour()
      pauseTour()
      setTimeout(() => {
        startTour(quoteBuilderTourConfig.id, builderSteps, {
          onNextClick: (driver) => {
            const step = driver.getActiveIndex()
            console.log('🎯 Quote Builder Tour - Paso actual:', step)
            
            // ✅ Paso 0 (Stepper): Solo avanzamos el tour, NO tocamos el modal
            if (step === 0) {
              driver.moveNext()
              return
            }
            
            // ✅ Paso 1 (Propiedad): Avanzamos el modal Y el tour
            if (step === 1) {
              const nextBtn = document.querySelector('#quote-builder-actions button:nth-last-child(1)')
              if (nextBtn) { 
                nextBtn.click() // Dispara handleNext -> modal pasa a activeStep 1
                setTimeout(() => driver.moveNext(), 600) 
              } else { 
                driver.moveNext() 
              }
              return
            }
            
            // ✅ Paso 2 (Financiamiento): Avanzamos el modal Y el tour
            if (step === 2) {
              const nextBtn = document.querySelector('#quote-builder-actions button:nth-last-child(1)')
              if (nextBtn) { 
                nextBtn.click() // Dispara handleNext -> modal pasa a activeStep 2
                setTimeout(() => driver.moveNext(), 600) 
              } else { 
                driver.moveNext() 
              }
              return
            }
            
            // ✅ Paso 3 (Vista Previa): Cerramos el modal simulando "Crear"
            if (step === 3) {
              const createBtn = document.querySelector('#quote-builder-actions button:last-child')
              if (createBtn) { 
                createBtn.click() // Dispara handleSubmit (simulado) -> cierra el modal
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('tour-resume-quote-builder'))
                }, 600) 
              } else { 
                window.dispatchEvent(new CustomEvent('tour-resume-quote-builder')) 
              }
              return
            }
            
            // Cualquier otro paso: solo avanzar
            driver.moveNext()
          },
          onCloseClick: () => { setModalOpen(false); setSelectedQuote(null); setIsTourMode(false); window.dispatchEvent(new CustomEvent('tour-resume-quote-builder')) },
          onDestroyStarted: () => { setModalOpen(false); setSelectedQuote(null); setIsTourMode(false); window.dispatchEvent(new CustomEvent('tour-resume-quote-builder')) }
        })
      }, 400)
      return
    }

    // Índice 11: Botón Enviar
    if (currentIndex === 11) {
      const sendBtn = document.querySelector('#quotes-action-send button') || document.querySelector('#quotes-action-send')
      if (sendBtn) {
        sendBtn.click()
        pauseTour()
        setTimeout(() => {
          startTour(sendQuoteTourConfig.id, sendSteps, {
            onNextClick: (driver) => driver.moveNext(),
            onCloseClick: () => { setSendModalOpen(false); setSelectedQuote(null); window.dispatchEvent(new CustomEvent('tour-resume-send-quote')) },
            onDestroyStarted: () => { setSendModalOpen(false); setSelectedQuote(null); window.dispatchEvent(new CustomEvent('tour-resume-send-quote')) }
          })
        }, 400)
      } else { driverObj.moveNext() }
      return
    }

    // Índice 12: Botón Convertir
    if (currentIndex === 12) {
      const convertBtn = document.querySelector('#quotes-action-convert button') || document.querySelector('#quotes-action-convert')
      if (convertBtn) {
        convertBtn.click()
        pauseTour()
        setTimeout(() => {
          startTour(convertToSaleTourConfig.id, convertSteps, {
            onNextClick: (driver) => driver.moveNext(),
            onCloseClick: () => { setConvertModalOpen(false); setSelectedQuote(null); window.dispatchEvent(new CustomEvent('tour-resume-convert-sale')) },
            onDestroyStarted: () => { setConvertModalOpen(false); setSelectedQuote(null); window.dispatchEvent(new CustomEvent('tour-resume-convert-sale')) }
          })
        }, 400)
      } else { driverObj.moveNext() }
      return
    }

    driverObj.moveNext()
  }

  const tourOptions = {
    onNextClick: handleTourNextClick,
    onPrevClick: (driverObj) => driverObj.movePrevious()
  }
  tourOptionsRef.current = tourOptions

  const columns = useQuoteColumns({ 
    t, 
    onEdit: handleEdit, 
    onDelete: handleDelete,
    onSend: handleSend,
    onConvert: handleConvert,
    onDownload: handleDownload
  })

  const activeCount = quotes.filter(q => q.status === 'converted' || q.status === 'sent').length

  return (
    <PageLayout
      title={t('title', 'Cotizaciones')}
      titleBold={t('titleBold', 'Ventas')}
      topbarLabel={t('topbarLabel', 'Gestión de Cotizaciones')}
      subtitle={t('subtitle', 'Crea, envía y convierte cotizaciones con tablas de amortización')}
    >
      {/* ✅ ID: Contenedor principal */}
      <Box id="quotes-page-container" sx={{ p: 3 }}>
        
        {/* ✅ Botón del Tour */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <TourButton 
            tourId={quoteTourConfig.id}
            steps={tourSteps}
            label={tCommon('tour.quotes.button', 'Ver guía de cotizaciones')}
            options={tourOptions}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          {/* ✅ ID: Estadísticas */}
          <Box id="quotes-stats" display="flex" gap={1} alignItems="center">
            <Chip label={`${quotes.length} ${t('total', 'Total')}`} size="small" sx={{ bgcolor: '#000', color: '#fff', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', fontWeight: 600 }} />
            <Chip label={`${activeCount} ${t('active', 'Convertidas o Enviadas')}`} size="small" sx={{ bgcolor: '#4caf50', color: '#fff', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', fontWeight: 600 }} />
          </Box>
          
          {/* ✅ ID: Botón Crear */}
          <Button 
            id="quotes-create-btn" 
            variant="contained" 
            startIcon={<Add />} 
            onClick={handleCreate} 
            sx={{ borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}
          >
            {t('createQuote', 'Nueva Cotización')}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
        ) : quotes.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, border: '1px solid #ececec', borderRadius: 1, textAlign: 'center' }}>
            <Description sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', color: '#888', mb: 1 }}>{t('empty.title', 'No hay cotizaciones')}</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={handleCreate} sx={{ borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace' }}>
              {t('createQuote', 'Nueva Cotización')}
            </Button>
          </Paper>
        ) : (
          /* ✅ ID: Tabla de Datos */
          <DataTable 
            id="quotes-data-table" 
            columns={columns} 
            data={quotes} 
            loading={loading} 
            rowKey="_id" 
            emptyMessage={t('empty.description', 'No se encontraron cotizaciones')} 
          />
        )}

        {/* ✅ Elemento invisible para el paso final del tour */}
        <Box id="quotes-finish" sx={{ height: 1 }} />

        {/* Modales */}
        <QuoteBuilderModal 
          open={modalOpen} 
          isTourMode={isTourMode} // ✅ Prop crítica para la simulación
          onClose={() => { 
            setModalOpen(false); 
            setSelectedQuote(null); 
            setIsTourMode(false); 
          }} 
          quote={selectedQuote} 
          onSave={handleSave} 
          projects={projects} 
          leads={leads} 
          clients={clients.filter(c => c.role === 'user')} 
        />
        
        <SendQuoteModal 
          open={sendModalOpen} 
          onClose={() => { setSendModalOpen(false); setSelectedQuote(null) }} 
          quote={selectedQuote} 
          onSuccess={fetchQuotes} 
        />
        
        <ConvertToSaleModal 
          open={convertModalOpen} 
          onClose={() => { setConvertModalOpen(false); setSelectedQuote(null) }} 
          quote={selectedQuote} 
          onSuccess={fetchQuotes} 
        />
      </Box>
    </PageLayout>
  )
}