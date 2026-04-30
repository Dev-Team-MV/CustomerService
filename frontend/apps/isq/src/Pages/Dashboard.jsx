import { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Grid, Box, Avatar, Typography, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import {
  Apartment, People, MeetingRoom, Group,
  Map, Newspaper, Settings, PersonAdd, HomeWork, TrendingUp
} from '@mui/icons-material'
import { useAuth } from '@shared/context/AuthContext'
import api from '@shared/services/api'
import useFetch from '@shared/hooks/useFetch'
import useStatusColor from '@shared/hooks/useStatusColor'
import DashboardHeader from '@shared/components/Dashboard/DashboardHeader'
import StatsCards from '@shared/components/statscard'
import QuickActionsPanel from '@shared/components/Dashboard/QuickActionsPanel'
import DashboardMapPanel from '@shared/components/Dashboard/DashboardMapPanel'
import RecentItemsPanel from '@shared/components/Dashboard/RecentitemsPanel'
import AmenitiesMap from '@shared/components/Amenities/AmenitiesMap'
import { OUTDOOR_AMENITIES } from '../Constants/amenities'

const PayloadRow = ({ payload, navigate }) => {
  const colors = useStatusColor(payload.status)
  const apt  = payload.apartment
  const prop = payload.property

  const resourceLabel = apt?.apartmentNumber
    ? `Apt ${apt.apartmentNumber}`
    : prop?.lot?.number
      ? `Lot ${prop.lot.number}`
      : 'N/A'

  const user = apt?.users?.[0] || prop?.user || payload.user

  return (
    <Box
      onClick={() => navigate('/payloads')}
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        py: 2.5, borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': { bgcolor: '#fafafa', borderRadius: 2, px: 2, mx: -2 },
        '&:last-child': { borderBottom: 'none' }
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar sx={{ bgcolor: '#e8f5ee', color: '#333F1F', fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
          {user?.firstName?.charAt(0) || 'U'}
        </Avatar>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif', color: '#333F1F' }}>
            {resourceLabel}
          </Typography>
          <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
            {user?.firstName} {user?.lastName}
            {' • '}
            {new Date(payload.date).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>
      <Box textAlign="right">
        <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', color: '#333F1F', mb: 0.5 }}>
          ${payload.amount?.toLocaleString()}
        </Typography>
        <Chip
          label={payload.status}
          size="small"
          sx={{
            fontWeight: 600, fontFamily: '"Poppins", sans-serif',
            fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px',
            bgcolor: colors.bg, color: colors.color, border: `1px solid ${colors.border}`
          }}
        />
      </Box>
    </Box>
  )
}
const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation(['dashboard', 'common'])
  const theme = useTheme()
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
  const projectId = import.meta.env.VITE_PROJECT_ID || user?.projects?.[0]?._id

const { data: payloads } = useFetch(
  useCallback(() => {
    if (!projectId) return Promise.resolve([])
    return api.get('/payloads', {
      params: {
        projectId,
        limit: 3,
        sort: '-date'
      }
    }).then(r => r.data)
  },
  [projectId]),
  { initialData: [] }
)

  const adminActions = useMemo(() => [
    { icon: <Apartment />, label: t('quickActions.buildings', 'Edificios'),  description: t('quickActions.buildingsDesc', 'Gestionar edificios'),    color: theme.palette.primary.main,   bgColor: `${theme.palette.primary.main}15`,   onClick: () => navigate('/buildings') },
    { icon: <PersonAdd />, label: t('quickActions.residents', 'Residentes'), description: t('quickActions.residentsDesc', 'Ver y crear residentes'), color: theme.palette.secondary.main, bgColor: `${theme.palette.secondary.main}15`, onClick: () => navigate('/residents') },
    { icon: <Map />,       label: t('quickActions.amenities', 'Amenidades'), description: t('quickActions.amenitiesDesc', 'Ver mapa de amenidades'), color: '#E5863C', bgColor: '#fff5e6', onClick: () => navigate('/amenities') },
    { icon: <Newspaper />, label: t('quickActions.news', 'Noticias'),        description: t('quickActions.newsDesc', 'Administrar noticias'),        color: theme.palette.primary.main,   bgColor: `${theme.palette.primary.main}15`,   onClick: () => navigate('/admin/news') },
    { icon: <Settings />,  label: t('quickActions.config', 'Configuración'), description: t('quickActions.configDesc', 'Ajustes del sistema'),       color: '#706f6f', bgColor: '#f5f5f5', onClick: () => navigate('/configuration') },
  ], [t, navigate, theme])

  const userActions = useMemo(() => [
    { icon: <MeetingRoom />, label: t('quickActions.myApartment', 'Mi Apartamento'), description: t('quickActions.myApartmentDesc', 'Ver mi apartamento'),    color: theme.palette.primary.main,   bgColor: `${theme.palette.primary.main}15`,   onClick: () => navigate('/my-apartment') },
    { icon: <Group />,       label: t('quickActions.familyGroup', 'Grupo Familiar'), description: t('quickActions.familyGroupDesc', 'Ver mi grupo familiar'), color: theme.palette.secondary.main, bgColor: `${theme.palette.secondary.main}15`, onClick: () => navigate('/family-group') },
    { icon: <Map />,         label: t('quickActions.amenities', 'Amenidades'),       description: t('quickActions.amenitiesDesc', 'Ver mapa de amenidades'), color: '#E5863C', bgColor: '#fff5e6', onClick: () => navigate('/amenities') },
    { icon: <Newspaper />,   label: t('quickActions.news', 'Noticias'),              description: t('quickActions.newsDesc', 'Ver noticias del proyecto'),   color: '#706f6f', bgColor: '#f5f5f5', onClick: () => navigate('/explore/news') },
  ], [t, navigate, theme])

  const statsCards = useMemo(() => [
    { label: t('stats.totalApartments', 'Total Apartamentos'), value: '—', icon: Apartment,  color: theme.palette.primary.main,   bgGradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,   bgColor: `${theme.palette.primary.main}15` },
    { label: t('stats.residents', 'Residentes Activos'),       value: '—', icon: People,     color: theme.palette.secondary.main, bgGradient: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)`, bgColor: `${theme.palette.secondary.main}15` },
    { label: t('stats.occupied', 'Ocupados'),                  value: '—', icon: HomeWork,   color: '#E5863C', bgGradient: 'linear-gradient(135deg, #E5863C 0%, #f5a563 100%)', bgColor: '#fff5e6' },
    { label: t('stats.occupancy', 'Tasa Ocupación'),           value: '—', icon: TrendingUp, color: '#706f6f', bgGradient: 'linear-gradient(135deg, #706f6f 0%, #8a8a8a 100%)', bgColor: '#f5f5f5' },
  ], [t, theme])

  return (
    <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
      <DashboardHeader
        user={user}
        icon={Apartment}
        title={t('welcome', 'Bienvenido, {{name}}', { name: user?.firstName })}
        subtitle={t('subtitle', 'Panel de control ISQ')}
      />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
        <Grid container spacing={3}>
          {isAdmin && (
            <Grid item xs={12}>
              <StatsCards stats={statsCards} />
            </Grid>
          )}

          <Grid item xs={12} md={8}>
            <DashboardMapPanel title={t('amenitiesMap', 'Mapa de Amenidades')}>
              <AmenitiesMap
                mapImage={null}
                amenities={OUTDOOR_AMENITIES}
                amenitySections={[]}
                isPublicView={!isAdmin}
              />
            </DashboardMapPanel>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }} whileHover={{ y: -4 }}>
              <QuickActionsPanel actions={isAdmin ? adminActions : userActions} />
            </motion.div>
          </Grid>

          {isAdmin && (
            <Grid item xs={12}>
              <RecentItemsPanel
                title={t('recentPayloads.title', 'Pagos Recientes')}
                items={payloads}
                viewAllPath="/payloads"
                emptyMessage={t('noRecentPayloads', 'No hay pagos recientes')}
                renderItem={(payload) => (
                  <PayloadRow key={payload._id} payload={payload} navigate={navigate} t={t} />
                )}
              />
            </Grid>
          )}
        </Grid>
      </motion.div>
    </Box>
  )
}

export default Dashboard