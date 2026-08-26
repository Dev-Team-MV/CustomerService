import { useState, useEffect, useRef } from 'react' // ✅ Agregado useRef
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box, Typography, Tabs, Tab, Paper, CircularProgress, Alert, 
  IconButton, Button, useMediaQuery, useTheme
} from '@mui/material'
import { ArrowBack, Event, History, HelpOutline } from '@mui/icons-material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import ClientOverview from '../components/clients/ClientOverview'
import ClientPaymentsTable from '../components/clients/ClientPaymentsTable'
import ClientTimeline from '../components/clients/ClientTimeline'
import ClientNotes from '../components/clients/ClientNotes'
import AppointmentModal from '../components/appointments/AppointmentModal'
import AuditLogTab from '../components/clients/AuditLogTab'
import clientDetailService from '../services/clientDetailService'
import { useAppointments } from '../constants/hooks/useAppointments'
import { useProjects } from '@shared/hooks/useProjects'
import { useCrmAgents } from '../constants/hooks/useCrmAgents'
import { useAuth } from '@shared/context/AuthContext'
import ClientDocuments from '../components/clients/ClientDocuments'

// ✅ NUEVO: Imports para el Tour
import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getClientDetailTourSteps, clientDetailTourConfig } from '../tours/modules/clientDetailTour'
// ✅ IMPORTS FALTANTES - Agrégalos junto a los otros imports del tour
import { getAppointmentTourSteps, appointmentTourConfig } from '../tours/features/appointmentTour'
import { getDocumentUploadTourSteps, documentUploadTourConfig } from '../tours/features/documentUploadTour'

function TabPanel({ children, value, index }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ py: 0 }}>
      {value === index && children}
    </Box>
  )
}

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation('residents')
  const { t: tCommon } = useTranslation('common')
  const { user } = useAuth()
  const { createAppointment } = useAppointments()
  const { projects } = useProjects()
  const { agents } = useCrmAgents()
  
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [tabValue, setTabValue] = useState(0)
  const [client, setClient] = useState(null)
  const [properties, setProperties] = useState([])
  const [activities, setActivities] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false)

  // ✅ Hooks del Tour
  const { startTour, pauseTour, resumeTour } = useTour()
  const tourSteps = getClientDetailTourSteps(tCommon)
  const appointmentSteps = getAppointmentTourSteps(tCommon) // ✅ FALTABA ESTA LÍNEA
  const docUploadSteps = getDocumentUploadTourSteps(tCommon) // ✅ Por si lo usas
  const tourOptionsRef = useRef(null)

  useEffect(() => {
    const loadClientDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await clientDetailService.getDetail(id)
        setClient(data.client)
        setProperties(data.properties || [])
        setActivities(data.activities || [])
        setNotes(data.notes || [])
      } catch (err) {
        setError(err.response?.data?.message || t('clients.errorLoading', 'Error al cargar cliente'))
      } finally {
        setLoading(false)
      }
    }
    loadClientDetail()
  }, [id])

  const handleNoteAdded = (newNote) => setNotes(prev => [newNote, ...prev])
  const handleScheduleAppointment = () => setAppointmentModalOpen(true)
  const handleSaveAppointment = async (id, data) => {
    await createAppointment(data)
    setAppointmentModalOpen(false)
  }

useEffect(() => {
  const handleResume = () => {
    // 28 es el índice de '#client-docs-filters', el paso después del botón de subir
    resumeTour(28, tourSteps, tourOptionsRef.current)
  }
  window.addEventListener('tour-resume-document-upload', handleResume)
  return () => window.removeEventListener('tour-resume-document-upload', handleResume)
}, [resumeTour, tourSteps])

// ✅ 1. Corregir la reanudación: Ir al paso 28 (Filtros), no al 26
useEffect(() => {
  const handleResume = () => {
    // 28 es el índice de '#client-docs-filters', el paso después del botón de subir
    resumeTour(28, tourSteps, tourOptionsRef.current)
  }
  window.addEventListener('tour-resume-document-upload', handleResume)
  return () => window.removeEventListener('tour-resume-document-upload', handleResume)
}, [resumeTour, tourSteps])
// ✅ NUEVO: Escuchar reanudación desde el subtour de Citas (FALTABA ESTO)
useEffect(() => {
  const handleResume = () => {
    // Reanuda en el índice 2 (#client-detail-tabs-container)
    resumeTour(2, tourSteps, tourOptionsRef.current)
  }
  window.addEventListener('tour-resume-appointment', handleResume)
  return () => window.removeEventListener('tour-resume-appointment', handleResume)
}, [resumeTour, tourSteps])

// ✅ 2. Corregir la interceptación: El índice de '#client-docs-upload-btn' es 27
const handleTourNextClick = (driverObj) => {
  const currentIndex = driverObj.getActiveIndex()
  
  // 1. Intercepta el botón de Agendar Cita (índice 1)
  if (currentIndex === 1) {
    setAppointmentModalOpen(true)
    pauseTour()
    setTimeout(() => {
      startTour(appointmentTourConfig.id, appointmentSteps, {
        onCloseClick: () => window.dispatchEvent(new CustomEvent('tour-resume-appointment')),
        onDestroyStarted: () => window.dispatchEvent(new CustomEvent('tour-resume-appointment'))
      })
    }, 400)
    return
  }

  // 2. Intercepta el botón de Subir Documento (índice 27)
  if (currentIndex === 27) { 
    // Verificamos que el modal no esté ya abierto para evitar duplicados
    if (!document.querySelector('[aria-labelledby*="upload"]')) {
        window.dispatchEvent(new CustomEvent('trigger-doc-upload-tour'))
    } else {
        // Si ya está abierto, simplemente avanzamos al siguiente paso
        driverObj.moveNext()
    }
    return
  }

  // 3. Lógica de pestañas (índices: 3, 8, 12, 17, 22, 26)
  const tabStepIndices = [3, 8, 12, 17, 22, 26]
  if (tabStepIndices.includes(currentIndex)) {
    const currentStep = driverObj.getConfig().steps[currentIndex]
    const tabElement = document.querySelector(currentStep.element)
    if (tabElement) {
      tabElement.click()
      setTimeout(() => { driverObj.moveNext() }, 400)
      return
    }
  }
  driverObj.moveNext()
}

// ✅ 3. Corregir también el botón "Anterior"
const handleTourPrevClick = (driverObj) => {
  const currentIndex = driverObj.getActiveIndex()
  const tabStepIndices = [3, 8, 12, 17, 22, 26]

  if (tabStepIndices.includes(currentIndex)) {
    const currentStep = driverObj.getConfig().steps[currentIndex]
    const tabElement = document.querySelector(currentStep.element)
    if (tabElement) {
      tabElement.click()
      setTimeout(() => { driverObj.movePrevious() }, 400)
      return
    }
  }
  driverObj.movePrevious()
}

  const tourOptions = {
    onNextClick: handleTourNextClick,
    onPrevClick: handleTourPrevClick
  }
  tourOptionsRef.current = tourOptions

  if (loading) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </PageLayout>
    )
  }

  if (error || !client) {
    return (
      <PageLayout>
        <Alert severity="error" sx={{ m: 3, borderRadius: 0, border: '1px solid' }}>
          {error || t('clients.notFound', 'Cliente no encontrado')}
        </Alert>
      </PageLayout>
    )
  }

  const clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email || t('clients.client', 'Cliente')

  return (
    <PageLayout>
      <Box id="client-detail-content" sx={{ p: { xs: 2, sm: 3 } }}>
        
        <Box id="client-detail-header" mb={3} display="flex" alignItems={isMobile ? 'flex-start' : 'center'} gap={2} flexWrap="wrap">
          <IconButton onClick={() => navigate('/clients')} sx={{ bgcolor: '#f5f5f5', borderRadius: 0 }}>
            <ArrowBack />
          </IconButton>
          
          <Box flex={1} minWidth={0}>
            <Typography sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 200, fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' }, color: '#000', letterSpacing: '-0.04em', lineHeight: 1.1, wordBreak: 'break-word' }}>
              {client.firstName} {client.lastName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: client.isActive ? '#4caf50' : '#f44336', animation: 'pulse 2s infinite', '@keyframes pulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.3 }, '100%': { opacity: 1 } } }} />
              <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#000', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                {client.isActive ? t('clients.activeStatus', 'Activo') : t('clients.inactiveStatus', 'Inactivo')}
              </Typography>
            </Box>
          </Box>

          <Button
            id="client-detail-btn-appointment"
            variant="outlined"
            startIcon={<Event />}
            onClick={handleScheduleAppointment}
            sx={{
              fontFamily: '"Courier New", monospace', fontSize: '0.75rem', textTransform: 'none', letterSpacing: '0.5px', borderRadius: 0,
              borderColor: '#4caf50', color: '#4caf50', width: { xs: '100%', sm: 'auto' },
              '&:hover': { borderColor: '#388e3c', bgcolor: '#e8f5e9', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' }
            }}
          >
            {t('clients.scheduleAppointment', 'Agendar cita')}
          </Button>
        </Box>

        <Paper id="client-detail-tabs-container" elevation={0} sx={{ border: '1px solid #ececec', borderRadius: 0, bgcolor: '#fff', position: 'relative' }}>
          
          {/* ✅ Botón del Tour */}
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
            <TourButton 
              tourId={clientDetailTourConfig.id}
              steps={tourSteps}
              label=""
              options={tourOptions} // ✅ Pasamos las opciones con la lógica de clic
              sx={{ minWidth: 'auto', p: 0.5, bgcolor: '#fff', border: '1px solid #ececec', '&:hover': { bgcolor: '#f5f5f5' } }}
            />
          </Box>

          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              borderBottom: '1px solid #ececec',
              '& .MuiTab-root': {
                fontFamily: '"Courier New", monospace', fontSize: { xs: '0.65rem', sm: '0.75rem' }, letterSpacing: '1px', textTransform: 'uppercase',
                color: '#000000ff', minHeight: { xs: 40, sm: 48 }, px: { xs: 1, sm: 2 }, '&.Mui-selected': { color: '#000', fontWeight: 700 }
              },
              '& .MuiTabs-indicator': { bgcolor: '#000', height: 3 },
              '& .MuiTabScrollButton-root': { color: '#000' }
            }}
          >
            <Tab id="client-detail-tab-overview" label={isMobile ? t('tabs.overview', 'Info') : t('tabs.overview', 'Overview')} />
            <Tab id="client-detail-tab-payments" label={t('tabs.payments', 'Pagos')} />
            <Tab id="client-detail-tab-activities" label={t('tabs.activities', 'Actividades')} />
            <Tab id="client-detail-tab-notes" label={t('tabs.notes', 'Notas')} />
            <Tab id="client-detail-tab-history" label={isMobile ? t('tabs.history', 'Hist.') : t('tabs.history', 'Historial')} icon={<History sx={{ fontSize: { xs: 14, sm: 16 } }} />} iconPosition="start" />
            <Tab id="client-detail-tab-documents" label={isMobile ? t('tabs.documents', 'Docs') : t('tabs.documents', 'Documentos')} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <ClientOverview client={client} properties={properties} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: { xs: 1, sm: 3 } }}>
              <ClientPaymentsTable clientId={id} />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: { xs: 1, sm: 3 } }}>
              <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#000000ff', letterSpacing: '1.5px', textTransform: 'uppercase', mb: 2 }}>
                {t('timeline.title', 'Historial de actividades')} ({activities.length})
              </Typography>
              <ClientTimeline activities={activities} />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <ClientNotes clientId={id} notes={notes} onNoteAdded={handleNoteAdded} />
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Box sx={{ p: { xs: 1, sm: 3 } }}>
              <AuditLogTab entity="Client" entityId={client._id} entityName={clientName} />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <Box sx={{ p: { xs: 1, sm: 3 } }}>
              <ClientDocuments clientId={client._id} clientName={clientName} />
            </Box>
          </TabPanel>
        </Paper>
      </Box>

      <AppointmentModal
        open={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        onSave={handleSaveAppointment}
        prefillData={{ clientId: client._id, assignedTo: user?._id }}
        projects={projects}
        agents={agents}
      />
    </PageLayout>
  )
}