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
  IconButton
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import ClientOverview from '../components/clients/ClientOverview'
import ClientPaymentsTable from '../components/clients/ClientPaymentsTable'
import ClientTimeline from '../components/clients/ClientTimeline'
import ClientNotes from '../components/clients/ClientNotes'
import clientDetailService from '../services/clientDetailService'

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
  const { t } = useTranslation('clients')

  const [tabValue, setTabValue] = useState(0)
  const [client, setClient] = useState(null)
  const [properties, setProperties] = useState([])
  const [activities, setActivities] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        setError(err.response?.data?.message || 'Error al cargar cliente')
      } finally {
        setLoading(false)
      }
    }
    loadClientDetail()
  }, [id])

  const handleNoteAdded = (newNote) => {
    setNotes(prev => [newNote, ...prev])
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
          {error || 'Cliente no encontrado'}
        </Alert>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <Box sx={{ p: 3 }}>
        {/* Header con botón de regreso */}
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
                {client.isActive ? 'Activo' : 'Inactivo'}
              </Typography>
            </Box>
          </Box>
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
            <Tab label="Overview" />
            <Tab label="Pagos" />
            <Tab label="Actividades" />
            <Tab label="Notas" />
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
                Historial de actividades ({activities.length})
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
        </Paper>
      </Box>
    </PageLayout>
  )
}