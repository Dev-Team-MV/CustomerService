// /Users/oficina/MV-CRM/CustomerService/frontend/apps/lakewood-p1/src/pages/Dashboard.jsx
import { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Chip } from '@mui/material'
import {
  HomeWork, TrendingUp, AttachMoney, Inbox,
  Business, PersonAdd, BarChart, Deck, Article, GroupAdd
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAuth } from '@shared/context/AuthContext'
import api from '@shared/services/api'

// ✅ IMPORTS DEL TOUR
import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getLakewoodDashboardTourSteps, lakewoodDashboardTourConfig } from '../tours/modules/dashboardTour'
import { getLayoutTourSteps, layoutTourConfig } from '@shared/tours/shared/layoutTour'

import useFetch from '../hooks/useFetch'
import useDashboardStats from '../hooks/useDashboardStats'
import { useResidents } from '@shared/hooks/useResidents'
import ResidentDialog from '../../../../shared/components/Modals/ResidentDialog'

import DashboardMap from '../components/DashboardMap'
import MapInventory from '../components/MapInventory'

import StatsCards from '../components/statscard'
import Loader from '../components/Loader'
import RecentPayloadsPanel from '../components/RecentPayloadsPanel'
import { getLakewoodProjectId } from '../utils/projectId'
import PageSection from '@shared/components/PageSection'
import SubmitReferralModal from '@shared/components/referrals/SubmitReferralModal'

// ─── colors ────────────────────────────────────────────────────────────────────
const C = {
  dark:    '#004535',
  green:   '#004535',
  orange:  '#E5863C',
  gray:    '#706f6f',
  bg:      '#eef2e8',
  bgLight: '#f5f7f1',
  border:  '#d6ddc9',
}

// ✅ ÍNDICES DEL TOUR
const LAYOUT_SUBTOUR_STEP_INDEX = 0
const RESUME_AFTER_LAYOUT_STEP_INDEX = 1

// ─── main component ─────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const { t } = useTranslation('dashboard')
  const { t: tCommon } = useTranslation('common')   
  const isAdmin   = user?.role === 'admin' || user?.role === 'superadmin'
  const projectId = getLakewoodProjectId(user)

  // ✅ ESTADOS DEL TOUR
  const [activeSubTour, setActiveSubTour] = useState(null)
  const [isTourTransitioning, setIsTourTransitioning] = useState(false)
  const { startTour, pauseTour, resumeTour, isPaused } = useTour()
  const tourOptionsRef = useRef(null)

  const dashboardSteps = getLakewoodDashboardTourSteps(tCommon) // ✅ Usa tCommon
  const layoutSteps = getLayoutTourSteps(tCommon)

  // ✅ ESCUCHAR REANUDACIÓN DESDE EL SUBTOUR DEL LAYOUT
  useEffect(() => {
    const handleResume = () => {
      const success = resumeTour(RESUME_AFTER_LAYOUT_STEP_INDEX, dashboardSteps, tourOptionsRef.current)
      if (success) {
        setIsTourTransitioning(false)
        setActiveSubTour(null)
      }
    }
    window.addEventListener('tour-resume-layout', handleResume)
    return () => window.removeEventListener('tour-resume-layout', handleResume)
  }, [resumeTour, dashboardSteps])

  // ── fetching ────────────────────────────────────────────────
  const { data: lots, loading: lotsLoading } = useFetch(
    useCallback(() => {
      if (!projectId) return Promise.resolve([])
      return api.get('/lots', { params: { projectId } }).then(r => r.data)
    }, [projectId])
  )

  const { data: payloads, loading: payloadsLoading } = useFetch(
    useCallback(() => {
      if (!projectId) return Promise.resolve([])
      return api.get('/payloads', {
        params: { projectId, limit: 3, sort: '-date' }
      }).then(r => r.data)
    }, [projectId]),
    { initialData: [] }
  )

  const loading = lotsLoading || payloadsLoading

  // ── stats ───────────────────────────────────────────────────
  const stats = useDashboardStats(lots)

  const [referralModalOpen, setReferralModalOpen] = useState(false)

  const {
    openDialog, selectedUser, formData, setFormData,
    handleOpenDialog, handleCloseDialog, handleSubmit,
    handleFieldChange, handlePhoneChange,
    isFormValid, e164Value, displayVal, isPhoneValid,
  } = useResidents(projectId, { requireProjectId: true })

  // ── quick actions ───────────────────────────────────────────
  const adminActions = useMemo(() => [
    { icon: <Business />,  label: t('quickActions.addProperty'), description: t('quickActions.addPropertyDesc'), color: C.dark,   bgColor: '#e8f5ee', onClick: () => navigate('/properties/select') },
    { 
      icon: <GroupAdd />,  
      label: t('quickActions.referrals'), 
      description: t('quickActions.referralsDesc'), 
      color: C.dark,   
      bgColor: '#e8f5ee', 
      onClick: () => setReferralModalOpen(true) 
    },
    { icon: <PersonAdd />, label: t('quickActions.inviteUser'),  description: t('quickActions.inviteUserDesc'),  color: C.green,  bgColor: '#f0f7e8', onClick: () => handleOpenDialog() },
    { icon: <BarChart />,  label: t('quickActions.analytics'),   description: t('quickActions.analyticsDesc'),   color: C.orange, bgColor: '#fff5e6', onClick: () => navigate('/analytics') },
    { icon: <Deck />,      label: t('quickActions.amenities'),   description: t('quickActions.amenitiesDesc'),   color: C.green,  bgColor: '#f0f7e8', onClick: () => navigate('/amenities') },
    { icon: <Article />,   label: t('quickActions.manageNews'),  description: t('quickActions.manageNewsDesc'),  color: C.orange, bgColor: '#fff5e6', onClick: () => navigate('/admin/news') },
  ], [t, navigate, handleOpenDialog])

  const userActions = useMemo(() => [
    { icon: <Deck />,    label: t('quickActions.amenities'), description: t('quickActions.amenitiesDesc'), color: C.green,  bgColor: '#f0f7e8', onClick: () => navigate('/amenities') },
    { icon: <Article />, label: t('quickActions.newsFeed'),  description: t('quickActions.newsFeedDesc'),  color: C.orange, bgColor: '#fff5e6', onClick: () => navigate('/explore/news') },
    
    // ✅ ACCIÓN DE REFERIDOS: Abre el modal directamente
    { 
      icon: <GroupAdd />,  
      label: t('quickActions.referrals'), 
      description: t('quickActions.referralsDesc'), 
      color: C.dark,   
      bgColor: '#e8f5ee', 
      onClick: () => setReferralModalOpen(true) 
    },
  ], [t, navigate])

  // ── stats cards ─────────────────────────────────────────────
  const statsCards = useMemo(() => [
    {
      label: t('stats.lotsListedSold'),
      value: `${stats.soldLots} / ${stats.totalLots}`,
      icon: HomeWork,
      color: C.dark,
      bgGradient: `linear-gradient(135deg, ${C.dark} 0%, #4a5d3a 100%)`,
      bgColor: '#e8f5ee',
      sub: stats.soldDifference !== 0
        ? `${stats.soldDifference >= 0 ? '+' : ''}${stats.soldDifference} this month`
        : t('stats.noChangeThisMonth'),
      subColor: stats.soldDifference !== 0 ? (stats.soldDifference >= 0 ? C.green : C.orange) : C.gray,
      trend: stats.soldDifference >= 0 ? 'up' : 'down'
    },
    {
      label: t('stats.monthlyRevenue'),
      value: `$${(stats.currentMonthRevenue / 1_000_000).toFixed(1)}M`,
      icon: AttachMoney,
      color: C.green,
      bgGradient: `linear-gradient(135deg, ${C.green} 0%, #a8c76f 100%)`,
      bgColor: '#f0f7e8',
      sub: stats.revenuePercentageChange !== 0
        ? `${stats.revenuePercentageChange >= 0 ? '+' : ''}${stats.revenuePercentageChange}% vs last month`
        : t('stats.noChangeVsLastMonth'),
      subColor: stats.revenuePercentageChange !== 0 ? (stats.revenuePercentageChange >= 0 ? C.green : C.orange) : C.gray,
      trend: stats.revenuePercentageChange >= 0 ? 'up' : 'down'
    },
    {
      label: t('stats.lotsOnHold'),
      value: stats.holdLots,
      icon: Inbox,
      color: C.orange,
      bgGradient: `linear-gradient(135deg, ${C.orange} 0%, #f5a563 100%)`,
      bgColor: '#fff5e6',
      sub: stats.totalLots > 0
        ? `${((stats.holdLots / stats.totalLots) * 100).toFixed(1)}% ${t('stats.ofTotalInventory')}`
        : `0% ${t('stats.ofTotalInventory')}`,
      subColor: C.gray,
      trend: null
    },
    {
      label: t('stats.occupancyRate'),
      value: `${stats.occupancyRate}%`,
      icon: TrendingUp,
      color: stats.occupancyRate >= 50 ? C.green : C.gray,
      bgGradient: stats.occupancyRate >= 50
        ? `linear-gradient(135deg, ${C.green} 0%, #a8c76f 100%)`
        : 'linear-gradient(135deg, #706f6f 0%, #8a8a8a 100%)',
      bgColor: stats.occupancyRate >= 50 ? '#f0f7e8' : '#f5f5f5',
      sub: t('stats.ofSold', { sold: stats.soldLots, total: stats.totalLots }),
      subColor: C.gray,
      trend: null
    }
  ], [stats, t])

  // ✅ FUNCIÓN PARA DISPARAR EL SUBTOUR DEL LAYOUT (Arquitectura Robusta con Custom Events)
  const triggerLayoutSubtour = () => {
    if (isTourTransitioning) return
    setIsTourTransitioning(true)
    pauseTour()
    
    // 1. Disparamos el evento para que el Layout abra el sidebar usando su estado de React
    window.dispatchEvent(new CustomEvent('tour-open-sidebar'))
    
    // 2. Esperamos a que la animación termine e iniciamos el subtour
    setTimeout(() => {
      startTour(layoutTourConfig.id, layoutSteps, {
        onNextClick: (driverObj) => {
          const currentIndex = driverObj.getActiveIndex()
          const currentElement = layoutSteps[currentIndex]?.element

          // Lógica interactiva DENTRO del subtour del Layout
          if (currentElement === '#layout-sidebar-drawer') {
            window.dispatchEvent(new CustomEvent('tour-close-drawers'))
            setTimeout(() => driverObj.moveNext(), 400)
          } else if (currentElement === '#layout-notifications-btn') {
            window.dispatchEvent(new CustomEvent('tour-open-notifications'))
            setTimeout(() => driverObj.moveNext(), 400)
          } else if (currentElement === '#notification-drawer-container') {
            window.dispatchEvent(new CustomEvent('tour-close-drawers'))
            setTimeout(() => driverObj.moveNext(), 400)
          } else if (currentElement === '#layout-user-menu-btn') {
            document.querySelector('#layout-user-menu-btn')?.click()
            setTimeout(() => driverObj.moveNext(), 400)
          } else {
            driverObj.moveNext()
          }
        },
        onCloseClick: () => {
          window.dispatchEvent(new CustomEvent('tour-close-drawers'))
          window.dispatchEvent(new CustomEvent('tour-resume-layout'))
        },
        onDestroyStarted: () => {
          window.dispatchEvent(new CustomEvent('tour-close-drawers'))
          window.dispatchEvent(new CustomEvent('tour-resume-layout'))
        }
      })
      setIsTourTransitioning(false)
    }, 400) // 400ms coincide con la transición CSS de MUI
  }

  // ✅ HANDLER UNIFICADO DEL TOUR PRINCIPAL
  const handleTourNextClick = (driverObj) => {
    const currentIndex = driverObj.getActiveIndex()
    console.log('🔍 Tour Next - Índice:', currentIndex, '| SubTour:', activeSubTour)

    if (currentIndex === LAYOUT_SUBTOUR_STEP_INDEX) {
      triggerLayoutSubtour()
    } else {
      // Avance normal para el resto de pasos del dashboard
      driverObj.moveNext()
    }
  }

  const tourOptions = {
    onNextClick: handleTourNextClick,
    onPrevClick: (driverObj) => driverObj.movePrevious(),
  }
  tourOptionsRef.current = tourOptions

  // ── render ──────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh' }}>
        <Loader size="large" message={t('loading')} fullHeight />
      </Box>
    )
  }

  const actions = isAdmin ? adminActions : userActions

  return (
    // ✅ ID 1: Contenedor principal del Dashboard
    <Box id="lakewood-dashboard-container" sx={{ minHeight: '100vh' }}>

      {/* ✅ Botón del Tour */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: { xs: 3, md: 6 }, pt: 2 }}>
        <TourButton 
          tourId={lakewoodDashboardTourConfig.id}
          steps={dashboardSteps}
          label={tCommon('tour.lakewoodDashboard.button', 'Guía del Dashboard')}
          options={tourOptions}
        />
      </Box>

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ px: { xs: 3, md: 6 }, pt: { xs: 4, md: 5 }, pb: 3 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 300,
              color: C.dark,
              fontSize: { xs: '2.4rem', md: '3.5rem' },
              fontFamily: '"DM Sans", sans-serif',
              lineHeight: 1.1,
            }}
          >
            {t('welcomeUser', { name: '' }).trim()}{' '}
            <Box component="span" sx={{ fontWeight: 800 }}>
              {user?.firstName}
            </Box>
          </Typography>

          <Box display="flex" alignItems="center" gap={1.5} mt={1.5}>
            <Typography
              variant="body2"
              sx={{ color: C.gray, fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem' }}
            >
              {t('overviewSubtitle')}
            </Typography>
            <Chip
              label={user?.role || 'User'}
              sx={{
                bgcolor: C.dark,
                color: 'white',
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 24,
                fontFamily: '"DM Sans", sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                borderRadius: 1,
              }}
            />
          </Box>
        </Box>
      </motion.div>

      {/* Elemento invisible que sirve como ancla para el Paso 0 (Subtour del Layout) */}
      <Box id="lakewood-layout-intro-trigger" sx={{ height: 1, width: 1 }} />

      {/* ── STATS (admin only) ── */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <Box sx={{ px: { xs: 3, md: 6 }, pb: 2 }}>
            <StatsCards stats={statsCards} loading={loading} />
          </Box>
        </motion.div>
      )}

      {/* ── MAP SECTION ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* ✅ ID 2: Sección del Mapa */}
        <Box id="lakewood-map-section">
          <PageSection
            title={t('propertyMap').split(' ')[0]}
            bold={t('propertyMap').split(' ').slice(1).join(' ')}
            description="Here you will find all the information about our properties, as well as details about your specific property and its specifications."
            bgcolor="white"
            topBorderColor={C.green}
            dividerColor={C.border}
            primaryColor={C.dark}
          >
            <MapInventory />
          </PageSection>
        </Box>
      </motion.div>

      {/* ── QUICK ACTIONS ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* ✅ ID 3: Sección de Acciones Rápidas */}
        <Box id="lakewood-quick-actions">
          <PageSection
            title={t('quickActions.title').split(' ')[0]}
            bold={t('quickActions.title').split(' ').slice(1).join(' ')}
            description={t('quickActions.subtitle')}
            topBorderColor={C.green}
            dividerColor={C.border}
            primaryColor={C.dark}
            contentPy={0}
          >
            {/* Numbered actions grid — 2 per row */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                py: 4,
              }}
            >
              {actions.map((action, index) => {
                const col = index % 2
                const row = Math.floor(index / 2)
                const isLastRow = Math.floor((actions.length - 1) / 2) === row
                return (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: { xs: 2, md: 3 },
                      borderLeft: { xs: 'none', sm: col === 1 ? `1px solid ${C.border}` : 'none' },
                      borderBottom: isLastRow ? 'none' : `1px solid ${C.border}`,
                      pl: { xs: 0, sm: col === 1 ? 5 : 0 },
                      pr: { xs: 0, sm: col === 0 ? 5 : 0 },
                      py: 4,
                    }}
                  >
                    {/* Number */}
                    <Typography
                      sx={{
                        fontSize: { xs: '4rem', md: '5.5rem' },
                        fontWeight: 400,
                        color: C.dark,
                        fontFamily: '"DM Sans", sans-serif',
                        lineHeight: 1,
                        minWidth: { xs: 72, md: 96 },
                        letterSpacing: '-2px',
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </Typography>

                    {/* Text */}
                    <Box flex={1}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: C.dark,
                          fontFamily: '"DM Sans", sans-serif',
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          mb: 0.5,
                        }}
                      >
                        {action.label}
                      </Typography>
                      <Typography
                        sx={{
                          color: C.gray,
                          fontFamily: '"DM Sans", sans-serif',
                          fontSize: '0.82rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {action.description}
                      </Typography>
                    </Box>

                    {/* Arrow button */}
                    <Box
                      component={motion.div}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={action.onClick}
                      sx={{
                        width: { xs: 52, md: 60 },
                        height: { xs: 52, md: 60 },
                        bgcolor: '#C4DB99',
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        color: C.dark,
                        fontSize: '1.3rem',
                        transition: 'background 0.2s',
                        '&:hover': { bgcolor: C.green, color: 'white' },
                      }}
                    >
                      ↗
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </PageSection>
        </Box>
      </motion.div>

      {/* ── RECENT PAYLOADS (admin only) ── */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* ✅ ID 4: Sección de Payloads Recientes */}
          <Box id="lakewood-recent-payloads" sx={{ px: { xs: 3, md: 6 }, py: 4 }}>
            <RecentPayloadsPanel payloads={payloads} t={t} />
          </Box>
        </motion.div>
      )}

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

      {/* ✅ MODAL DE ENVÍO DE REFERIDOS (Modo Customer) */}
      <SubmitReferralModal
        open={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        mode="customer" // 👈 Esto asegura que use el .env y oculte selectores de admin
        onSuccess={() => {
          // Opcional: Mostrar notificación de éxito o recargar datos si es necesario
          setReferralModalOpen(false)
        }}
      />
    </Box>
  )
}

export default Dashboard