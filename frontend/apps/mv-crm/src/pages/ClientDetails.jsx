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
  Button
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
  const { t } = useTranslation('residents') // ✅ Cambiado a 'residents'
  const { user } = useAuth()
  const { createAppointment } = useAppointments()
  const { projects } = useProjects()
  const { agents } = useCrmAgents()

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
        <Alert severity="error" sx={{ m: 3 }}>
          {error || t('clients.notFound', 'Cliente no encontrado')}
        </Alert>
      </PageLayout>
    )
  }

  const clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email || t('clients.client', 'Cliente')

  return (
    <PageLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box mb={3} display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/clients')} sx={{ bgcolor: '#f5f5f5' }}>
            <ArrowBack />
          </IconButton>
          
          <Box flex={1}>
            <Typography
              sx={{
                fontFamily: '"Helvetica Neue", Arial, sans-serif',
                fontWeight: 200,
                fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                color: '#000',
                letterSpacing: '-0.04em',
                lineHeight: 1
              }}
            >
              {client.firstName} {client.lastName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: client.isActive ? '#4caf50' : '#f44336',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.3 }
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

          {/* Botón agendar cita */}
          <Button
            variant="outlined"
            startIcon={<Event />}
            onClick={handleScheduleAppointment}
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              textTransform: 'none',
              letterSpacing: '0.5px',
              borderColor: '#4caf50',
              color: '#4caf50',
              '&:hover': {
                borderColor: '#388e3c',
                bgcolor: '#e8f5e9'
              }
            }}
          >
            {t('clients.scheduleAppointment', 'Agendar cita')}
          </Button>
        </Box>

        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #ececec',
            borderRadius: 1,
            bgcolor: '#fff'
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: '1px solid #ececec',
              '& .MuiTab-root': {
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#888',
                '&.Mui-selected': {
                  color: '#000',
                  fontWeight: 700
                }
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#000',
                height: 3
              }
            }}
          >
            <Tab label={t('tabs.overview', 'Overview')} />
            <Tab label={t('tabs.payments', 'Pagos')} />
            <Tab label={t('tabs.activities', 'Actividades')} />
            <Tab label={t('tabs.notes', 'Notas')} />
            <Tab 
              label={t('tabs.history', 'Historial')} 
              icon={<History sx={{ fontSize: 16 }} />} 
              iconPosition="start" 
            />
          </Tabs>

          {/* TAB 1: OVERVIEW */}
          <TabPanel value={tabValue} index={0}>
            <ClientOverview client={client} properties={properties} />
          </TabPanel>

          {/* TAB 2: PAGOS */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3 }}>
              <ClientPaymentsTable clientId={id} />
            </Box>
          </TabPanel>

          {/* TAB 3: ACTIVIDADES */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.7rem',
                  color: '#888',
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
            <Box sx={{ p: 3 }}>
              <AuditLogTab 
                entity="Client" 
                entityId={client._id}
                entityName={clientName}
              />
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