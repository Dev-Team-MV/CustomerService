import { useCallback, useMemo }  from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Grid, Paper, Box, Typography, Chip } from '@mui/material'
import {
  HomeWork, TrendingUp, AttachMoney, Inbox,
  Business, PersonAdd, BarChart, Deck, Article
} from '@mui/icons-material'
import { motion } from 'framer-motion'
// import { useAuth } from '../context/AuthContext'
import { useAuth } from '@shared/context/AuthContext'
// import api from '../services/api'
import api from '@shared/services/api'

import useFetch from '../hooks/useFetch'
import useDashboardStats from '../hooks/useDashboardStats'

// ✅ Mismo import que Residents.jsx
// import { useResidents } from '../hooks/useResidents'
import { useResidents } from '@shared/hooks/useResidents'
import ResidentDialog from '../../../../shared/components/Modals/ResidentDialog'

import DashboardMap from '../components/DashboardMap'
import StatsCards from '../components/statscard'
import Loader from '../components/Loader'
import QuickActionsPanel from '../components/QuickActionsPanel'
import RecentPayloadsPanel from '../components/RecentPayloadsPanel'

// ─── helpers ──────────────────────────────────────────────────────────────────
const MapPanel = ({ t }) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3, duration: 0.6 }}
    whileHover={{ y: -4 }}
  >
    <Paper
      elevation={0}
      sx={{
        p: 3, height: '100%', borderRadius: 4,
        bgcolor: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #e5e7eb',
        position: 'relative', overflow: 'hidden',
        '&::before': {
        content: '""', position: 'absolute',
          top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #333F1F 0%, #8CA551 100%)'
        }
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', color: '#333F1F', letterSpacing: '0.5px', mb: 2 }}
      >
        {t('propertyMap')}
      </Typography>
      <DashboardMap />
    </Paper>
  </motion.div>
)

// ─── main component ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const { t }       = useTranslation(['dashboard', 'common'])
  const isAdmin     = user?.role === 'admin' || user?.role === 'superadmin'

  // ── fetching ────────────────────────────────────────────────
  const { data: lots,     loading: lotsLoading }     = useFetch(
    useCallback(() => api.get('/lots').then(r => r.data), [])
  )
const { data: payloads } = useFetch(
  useCallback(() =>
    api.get('/payloads', {
      params: {
        projectId: import.meta.env.VITE_PROJECT_ID,
        limit: 3,
        sort: '-date'
      }
    }).then(r => r.data),
  []),
  { initialData: [] }
)

  const loading = lotsLoading || payloads.loading

  // ── stats ───────────────────────────────────────────────────
  const stats = useDashboardStats(lots)

  const projectId = import.meta.env.VITE_PROJECT_ID

  // ✅ Mismo hook que Residents.jsx (projectId → SMS / registro con URL correcta)
  const {
    openDialog,
    selectedUser,
    formData,
    setFormData,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handleFieldChange,
    handlePhoneChange,
    isFormValid,
    e164Value,
    displayVal,
    isPhoneValid,
  } = useResidents(projectId)

  // ── quick actions ───────────────────────────────────────────
  const adminActions = useMemo(() => [
    { icon: <Business />,  label: t('quickActions.addProperty'), description: t('quickActions.addPropertyDesc'), color: '#333F1F', bgColor: '#e8f5ee', onClick: () => navigate('/properties/select') },
    { icon: <PersonAdd />, label: t('quickActions.inviteUser'),  description: t('quickActions.inviteUserDesc'),  color: '#8CA551', bgColor: '#f0f7e8', onClick: () => handleOpenDialog() },
    { icon: <BarChart />,  label: t('quickActions.analytics'),   description: t('quickActions.analyticsDesc'),   color: '#E5863C', bgColor: '#fff5e6', onClick: () => navigate('/analytics') },
    { icon: <Deck />,      label: t('quickActions.amenities'),   description: t('quickActions.amenitiesDesc'),   color: '#8CA551', bgColor: '#f0f7e8', onClick: () => navigate('/amenities') },
    { icon: <Article />,   label: t('quickActions.manageNews'),  description: t('quickActions.manageNewsDesc'),  color: '#E5863C', bgColor: '#fff5e6', onClick: () => navigate('/admin/news') },
  ], [t, navigate, handleOpenDialog])

  const userActions = useMemo(() => [
    { icon: <Deck />,    label: t('quickActions.amenities'), description: t('quickActions.amenitiesDesc'), color: '#8CA551', bgColor: '#f0f7e8', onClick: () => navigate('/amenities') },
    { icon: <Article />, label: t('quickActions.newsFeed'),  description: t('quickActions.newsFeedDesc'),  color: '#E5863C', bgColor: '#fff5e6', onClick: () => navigate('/explore/news') },
  ], [t, navigate])

  // ── stats cards ─────────────────────────────────────────────
  const statsCards = useMemo(() => [
    {
      label: t('stats.lotsListedSold'),
      value: `${stats.soldLots} / ${stats.totalLots}`,
      icon: HomeWork,
      color: '#333F1F',
      bgGradient: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)',
      bgColor: '#e8f5ee',
      sub: stats.soldDifference !== 0
        ? `${stats.soldDifference >= 0 ? '+' : ''}${stats.soldDifference} this month`
        : t('stats.noChangeThisMonth'),
      subColor: stats.soldDifference !== 0 ? (stats.soldDifference >= 0 ? '#8CA551' : '#E5863C') : '#706f6f',
      trend: stats.soldDifference >= 0 ? 'up' : 'down'
    },
    {
      label: t('stats.monthlyRevenue'),
      value: `$${(stats.currentMonthRevenue / 1_000_000).toFixed(1)}M`,
      icon: AttachMoney,
      color: '#8CA551',
      bgGradient: 'linear-gradient(135deg, #8CA551 0%, #a8c76f 100%)',
      bgColor: '#f0f7e8',
      sub: stats.revenuePercentageChange !== 0
        ? `${stats.revenuePercentageChange >= 0 ? '+' : ''}${stats.revenuePercentageChange}% vs last month`
        : t('stats.noChangeVsLastMonth'),
      subColor: stats.revenuePercentageChange !== 0 ? (stats.revenuePercentageChange >= 0 ? '#8CA551' : '#E5863C') : '#706f6f',
      trend: stats.revenuePercentageChange >= 0 ? 'up' : 'down'
    },
    {
      label: t('stats.lotsOnHold'),
      value: stats.holdLots,
      icon: Inbox,
      color: '#E5863C',
      bgGradient: 'linear-gradient(135deg, #E5863C 0%, #f5a563 100%)',
      bgColor: '#fff5e6',
      sub: stats.totalLots > 0
        ? `${((stats.holdLots / stats.totalLots) * 100).toFixed(1)}% ${t('stats.ofTotalInventory')}`
        : `0% ${t('stats.ofTotalInventory')}`,
      subColor: '#706f6f',
      trend: null
    },
    {
      label: t('stats.occupancyRate'),
      value: `${stats.occupancyRate}%`,
      icon: TrendingUp,
      color: stats.occupancyRate >= 50 ? '#8CA551' : '#706f6f',
      bgGradient: stats.occupancyRate >= 50
        ? 'linear-gradient(135deg, #8CA551 0%, #a8c76f 100%)'
        : 'linear-gradient(135deg, #706f6f 0%, #8a8a8a 100%)',
      bgColor: stats.occupancyRate >= 50 ? '#f0f7e8' : '#f5f5f5',
      sub: t('stats.ofSold', { sold: stats.soldLots, total: stats.totalLots }),
      subColor: '#706f6f',
      trend: null
    }
  ], [stats, t])

  // ── render ──────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh' }}>
        <Loader size="large" message={t('loading')} fullHeight />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 }, mb: 4,
            background: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 12px 40px rgba(51, 63, 31, 0.15)',
            overflow: 'hidden', position: 'relative'
          }}
        >
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, bgcolor: 'rgba(140, 165, 81, 0.1)', borderRadius: '50%', filter: 'blur(60px)' }} />
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} gap={{ xs: 2, sm: 3 }} position="relative" zIndex={1}>
            <motion.div whileHover={{ scale: 1.05, rotate: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Box sx={{ width: { xs: 64, md: 72 }, height: { xs: 64, md: 72 }, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <HomeWork sx={{ fontSize: { xs: 32, md: 40 }, color: 'white' }} />
              </Box>
            </motion.div>
            <Box flex={1}>
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, letterSpacing: '1px', mb: 0.5, fontSize: { xs: '1.75rem', md: '2.5rem' }, fontFamily: '"Poppins", sans-serif', textTransform: 'uppercase' }}>
                {t('welcomeUser', { name: user?.firstName })}
              </Typography>
              <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 400, fontSize: { xs: '0.9rem', md: '1rem' }, fontFamily: '"Poppins", sans-serif' }}>
                  {t('overviewSubtitle')}
                </Typography>
                <Chip
                  label={user?.role || 'User'}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', fontWeight: 600, fontSize: { xs: '0.7rem', md: '0.75rem' }, height: { xs: 24, md: 26 }, border: '1px solid rgba(255,255,255,0.3)', fontFamily: '"Poppins", sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* CONTENT */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
        <Grid container spacing={3}>

          {isAdmin && (
            <Grid item xs={12}>
              <StatsCards stats={statsCards} loading={loading} />
            </Grid>
          )}

          <Grid item xs={12} md={8}>
            <MapPanel t={t} />
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }} whileHover={{ y: -4 }}>
              <QuickActionsPanel
                actions={isAdmin ? adminActions : userActions}
                t={t}
              />
            </motion.div>
          </Grid>

          {isAdmin && (
            <Grid item xs={12}>
              <RecentPayloadsPanel payloads={payloads} t={t} />
            </Grid>
          )}

        </Grid>
      </motion.div>

      {/* ✅ Mismo uso que Residents.jsx */}
      <ResidentDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        selectedUser={selectedUser}
        handleFieldChange={handleFieldChange}
        handlePhoneChange={handlePhoneChange}
        isFormValid={isFormValid}
        e164Value={e164Value}
        displayVal={displayVal}
        isPhoneValid={isPhoneValid}
      />
    </Box>
  )
}

export default Dashboard