// apps/mv-crm/src/pages/ClientDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { ArrowBack, Event, History } from '@mui/icons-material'
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
  const { user } = useAuth()
  const { createAppointment } = useAppointments()
  const { projects } = useProjects()
  const { agents } = useCrmAgents()
  
  // ✅ Hook para detectar tamaño de pantalla
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  const [tabValue, setTabValue] = useState(0)
  const [client, setClient] = useState(null)
  const [properties, setProperties] = useState([])
  const [activities, setActivities] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false)

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

  const handleNoteAdded = (newNote) => {
    setNotes(prev => [newNote, ...prev])
  }

  const handleScheduleAppointment = () => {
    setAppointmentModalOpen(true)
  }

  const handleSaveAppointment = async (id, data) => {
    await createAppointment(data)
    setAppointmentModalOpen(false)
  }

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
      {/* ✅ Padding responsive */}
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        
        {/* Header responsive */}
        <Box 
          mb={3} 
          display="flex" 
          alignItems={isMobile ? 'flex-start' : 'center'} 
          gap={2} 
          flexWrap="wrap"
        >
          <IconButton onClick={() => navigate('/clients')} sx={{ bgcolor: '#f5f5f5', borderRadius: 0 }}>
            <ArrowBack />
          </IconButton>
          
          <Box flex={1} minWidth={0}>
            <Typography
              sx={{
                fontFamily: '"Helvetica Neue", Arial, sans-serif',
                fontWeight: 200,
                fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' },
                color: '#000',
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                wordBreak: 'break-word'
              }}
            >
              {client.firstName} {client.lastName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: client.isActive ? '#4caf50' : '#f44336',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.3 },
                    '100%': { opacity: 1 }
                  }
                }}
              />
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.62rem',
                  color: '#000',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase'
                }}
              >
                {client.isActive ? t('clients.activeStatus', 'Activo') : t('clients.inactiveStatus', 'Inactivo')}
              </Typography>
            </Box>
          </Box>

          {/* ✅ Botón responsive: full width en móvil */}
          <Button
            variant="outlined"
            startIcon={<Event />}
            onClick={handleScheduleAppointment}
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              textTransform: 'none',
              letterSpacing: '0.5px',
              borderRadius: 0,
              borderColor: '#4caf50',
              color: '#4caf50',
              width: { xs: '100%', sm: 'auto' },
              '&:hover': {
                borderColor: '#388e3c',
                bgcolor: '#e8f5e9',
                boxShadow: '4px 4px 0px rgba(0,0,0,0.12)'
              }
            }}
          >
            {t('clients.scheduleAppointment', 'Agendar cita')}
          </Button>
        </Box>

        {/* Tabs container */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #ececec',
            borderRadius: 0, // ✅ Estética unificada
            bgcolor: '#fff'
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              borderBottom: '1px solid #ececec',
              '& .MuiTab-root': {
                fontFamily: '"Courier New", monospace',
                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#000000ff',
                minHeight: { xs: 40, sm: 48 },
                px: { xs: 1, sm: 2 },
                '&.Mui-selected': {
                  color: '#000',
                  fontWeight: 700
                }
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#000',
                height: 3
              },
              '& .MuiTabScrollButton-root': {
                color: '#000'
              }
            }}
          >
            <Tab label={isMobile ? t('tabs.overview', 'Info') : t('tabs.overview', 'Overview')} />
            <Tab label={t('tabs.payments', 'Pagos')} />
            <Tab label={t('tabs.activities', 'Actividades')} />
            <Tab label={t('tabs.notes', 'Notas')} />
            <Tab 
              label={isMobile ? t('tabs.history', 'Hist.') : t('tabs.history', 'Historial')} 
              icon={<History sx={{ fontSize: { xs: 14, sm: 16 } }} />} 
              iconPosition="start" 
            />
            <Tab label={isMobile ? t('tabs.documents', 'Docs') : t('tabs.documents', 'Documentos')} />
          </Tabs>

          {/* TAB 1: OVERVIEW */}
          <TabPanel value={tabValue} index={0}>
            <ClientOverview client={client} properties={properties} />
          </TabPanel>

          {/* TAB 2: PAGOS */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: { xs: 1, sm: 3 } }}>
              <ClientPaymentsTable clientId={id} />
            </Box>
          </TabPanel>

          {/* TAB 3: ACTIVIDADES */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: { xs: 1, sm: 3 } }}>
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.7rem',
                  color: '#000000ff',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  mb: 2
                }}
              >
                {t('timeline.title', 'Historial de actividades')} ({activities.length})
              </Typography>
              <ClientTimeline activities={activities} />
            </Box>
          </TabPanel>

          {/* TAB 4: NOTAS */}
          <TabPanel value={tabValue} index={3}>
            <ClientNotes 
              clientId={id} 
              notes={notes} 
              onNoteAdded={handleNoteAdded}
            />
          </TabPanel>

          {/* TAB 5: HISTORIAL DE CAMBIOS */}
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ p: { xs: 1, sm: 3 } }}>
              <AuditLogTab 
                entity="Client" 
                entityId={client._id}
                entityName={clientName}
              />
            </Box>
          </TabPanel>

          {/* TAB 6: DOCUMENTOS */}
          <TabPanel value={tabValue} index={5}>
            <Box sx={{ p: { xs: 1, sm: 3 } }}>
              <ClientDocuments clientId={client._id} clientName={clientName} />
            </Box>
          </TabPanel>
        </Paper>
      </Box>

      {/* Modal de cita */}
      <AppointmentModal
        open={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        onSave={handleSaveAppointment}
        prefillData={{
          clientId: client._id,
          assignedTo: user?._id
        }}
        projects={projects}
        agents={agents}
      />
    </PageLayout>
  )
}