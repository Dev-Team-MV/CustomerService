// /Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/pages/Dashboard.jsx
import { useMemo, useCallback, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Chip, useTheme } from '@mui/material'
import {
  Apartment, People, MeetingRoom, Group,
  Map, Newspaper, Settings, PersonAdd, HomeWork, TrendingUp
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAuth } from '@shared/context/AuthContext'
import api from '@shared/services/api'

// ✅ IMPORTS DEL TOUR
import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getPhase2DashboardTourSteps, phase2DashboardTourConfig } from '../tours/modules/dashboardTour'
import { getLayoutTourSteps, layoutTourConfig } from '@shared/tours/shared/layoutTour'

import useFetch from '@shared/hooks/useFetch'
import useStatusColor from '@shared/hooks/useStatusColor'
import PageSection from '@shared/components/PageSection'
import AmenitiesMap from '@shared/components/Amenities/AmenitiesMap'
import { OUTDOOR_AMENITIES } from '../Constants/amenities'

// ─── main component ──────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation('dashboard')
  const { t: tCommon } = useTranslation('common')
  const theme = useTheme() // ✅ Usamos el tema de Phase 2
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
  const projectId = import.meta.env.VITE_PROJECT_ID || user?.projects?.[0]?._id

  // ✅ Colores dinámicos basados en el theme de Phase 2
  const C = {
    primary: theme.palette.primary.main,
    primaryBg: `${theme.palette.primary.main}15`,
    primaryGradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light || theme.palette.primary.main} 100%)`,
    
    secondary: theme.palette.secondary.main,
    secondaryBg: `${theme.palette.secondary.main}15`,
    secondaryGradient: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light || theme.palette.secondary.main} 100%)`,
    
    accent: '#E5863C', // Color de acento original de Phase 2
    accentBg: '#fff5e6',
    accentGradient: 'linear-gradient(135deg, #E5863C 0%, #f5a563 100%)',
    
    gray: '#706f6f',
    grayBg: '#f5f5f5',
    grayGradient: 'linear-gradient(135deg, #706f6f 0%, #8a8a8a 100%)',
    
    bg: theme.palette.background.default || '#fafafa',
    bgLight: theme.palette.action.hover || '#f0f0f0',
    border: theme.palette.divider || '#e0e0e0',
    fontFamily: theme.typography.fontFamily || '"Poppins", sans-serif'
  }

  // ✅ ESTADOS DEL TOUR
  const [activeSubTour, setActiveSubTour] = useState(null)
  const { startTour, pauseTour, resumeTour } = useTour()
  const tourOptionsRef = useRef(null)

  const dashboardSteps = getPhase2DashboardTourSteps(tCommon)
  const layoutSteps = getLayoutTourSteps(tCommon)

  const { data: payloads, loading: payloadsLoading } = useFetch(
    useCallback(() => {
      if (!projectId) return Promise.resolve([])
      return api.get('/payloads', {
        params: { projectId, limit: 3, sort: '-date' }
      }).then(r => r.data)
    }, [projectId]),
    { initialData: [] }
  )

  const loading = payloadsLoading

  // ── Payload Row (Estilizado con colores del theme) ────────────────────────
  const PayloadRow = ({ payload }) => {
    const colors = useStatusColor(payload.status)
    const apt = payload.apartment
    const prop = payload.property

    const resourceLabel = apt?.apartmentNumber
      ? `Apt ${apt.apartmentNumber}`
      : prop?.lot?.number
        ? `Lot ${prop.lot.number}`
        : 'N/A'

    const userPayload = apt?.users?.[0] || prop?.user || payload.user

    return (
      <Box
        onClick={() => navigate('/payloads')}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          py: 2.5, borderBottom: `1px solid ${C.border}`, cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': { bgcolor: C.bgLight, borderRadius: 2, px: 2, mx: -2 },
          '&:last-child': { borderBottom: 'none' }
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ 
            width: 44, height: 44, borderRadius: 2, 
            bgcolor: C.primaryBg, color: C.primary, 
            fontWeight: 700, fontFamily: C.fontFamily, 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            {userPayload?.firstName?.charAt(0) || 'U'}
          </Box>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: C.fontFamily, color: C.primary, mb: 0.5 }}>
              {resourceLabel}
            </Typography>
            <Typography variant="caption" sx={{ color: C.gray, fontFamily: C.fontFamily }}>
              {userPayload?.firstName} {userPayload?.lastName}
              {' • '}
              {new Date(payload.date).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
        <Box textAlign="right">
          <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: C.fontFamily, color: C.primary, mb: 0.5 }}>
            ${payload.amount?.toLocaleString()}
          </Typography>
          <Chip
            label={payload.status}
            size="small"
            sx={{
              fontWeight: 600, fontFamily: C.fontFamily,
              fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px',
              bgcolor: colors.bg, color: colors.color, border: `1px solid ${colors.border}`, borderRadius: 1
            }}
          />
        </Box>
      </Box>
    )
  }

  // ── quick actions (Colores dinámicos del theme) ───────────────────────────
  const adminActions = useMemo(() => [
    { icon: <Apartment />, label: t('quickActions.buildings', 'Edificios'), description: t('quickActions.buildingsDesc', 'Gestionar edificios'), color: C.primary, bgColor: C.primaryBg, onClick: () => navigate('/buildings') },
    { icon: <PersonAdd />, label: t('quickActions.residents', 'Residentes'), description: t('quickActions.residentsDesc', 'Ver y crear residentes'), color: C.secondary, bgColor: C.secondaryBg, onClick: () => navigate('/residents') },
    { icon: <Map />, label: t('quickActions.amenities', 'Amenidades'), description: t('quickActions.amenitiesDesc', 'Ver mapa de amenidades'), color: C.accent, bgColor: C.accentBg, onClick: () => navigate('/amenities') },
    { icon: <Newspaper />, label: t('quickActions.news', 'Noticias'), description: t('quickActions.newsDesc', 'Administrar noticias'), color: C.primary, bgColor: C.primaryBg, onClick: () => navigate('/admin/news') },
    { icon: <Settings />, label: t('quickActions.config', 'Configuración'), description: t('quickActions.configDesc', 'Ajustes del sistema'), color: C.gray, bgColor: C.grayBg, onClick: () => navigate('/configuration') },
  ], [t, navigate, C])

  const userActions = useMemo(() => [
    { icon: <MeetingRoom />, label: t('quickActions.myApartment', 'Mi Apartamento'), description: t('quickActions.myApartmentDesc', 'Ver mi apartamento'), color: C.primary, bgColor: C.primaryBg, onClick: () => navigate('/my-apartment') },
    { icon: <Group />, label: t('quickActions.familyGroup', 'Grupo Familiar'), description: t('quickActions.familyGroupDesc', 'Ver mi grupo familiar'), color: C.secondary, bgColor: C.secondaryBg, onClick: () => navigate('/family-group') },
    { icon: <Map />, label: t('quickActions.amenities', 'Amenidades'), description: t('quickActions.amenitiesDesc', 'Ver mapa de amenidades'), color: C.accent, bgColor: C.accentBg, onClick: () => navigate('/amenities') },
    { icon: <Newspaper />, label: t('quickActions.news', 'Noticias'), description: t('quickActions.newsDesc', 'Ver noticias del proyecto'), color: C.gray, bgColor: C.grayBg, onClick: () => navigate('/explore/news') },
  ], [t, navigate, C])

  // ── stats cards (Colores dinámicos del theme) ─────────────────────────────
  const statsCards = useMemo(() => [
    {
      label: t('stats.totalApartments', 'Total Apartamentos'), value: '—', icon: Apartment, color: C.primary,
      bgGradient: C.primaryGradient, bgColor: C.primaryBg,
      sub: t('stats.noChangeThisMonth', 'Sin cambios este mes'), subColor: C.gray, trend: null
    },
    {
      label: t('stats.residents', 'Residentes Activos'), value: '—', icon: People, color: C.secondary,
      bgGradient: C.secondaryGradient, bgColor: C.secondaryBg,
      sub: t('stats.noChangeVsLastMonth', 'Sin cambios vs mes anterior'), subColor: C.gray, trend: null
    },
    {
      label: t('stats.occupied', 'Ocupados'), value: '—', icon: HomeWork, color: C.accent,
      bgGradient: C.accentGradient, bgColor: C.accentBg,
      sub: `0% ${t('stats.ofTotalInventory', 'del inventario total')}`, subColor: C.gray, trend: null
    },
    {
      label: t('stats.occupancy', 'Tasa Ocupación'), value: '—', icon: TrendingUp, color: C.gray,
      bgGradient: C.grayGradient, bgColor: C.grayBg,
      sub: '0%', subColor: C.gray, trend: null
    }
  ], [t, C])

  // ✅ LÓGICA DEL TOUR CON SUBTOUR (Idéntica a Lakewood)
  const handleTourNextClick = (driverObj) => {
    const currentIndex = driverObj.getActiveIndex()
    console.log('🔍 Tour Next - Índice:', currentIndex, '| SubTour:', activeSubTour)

    if (activeSubTour === 'layout') {
      if (currentIndex === layoutSteps.length - 1) setActiveSubTour(null)
      driverObj.moveNext()
      return
    }

    if (currentIndex === 0) {
      pauseTour()
      setActiveSubTour('layout')
      setTimeout(() => {
        startTour(layoutTourConfig.id, layoutSteps, {
          onNextClick: (driver) => driver.moveNext(),
          onCloseClick: () => {
            setActiveSubTour(null)
            setTimeout(() => resumeTour(1, dashboardSteps, tourOptionsRef.current), 400)
          },
          onDestroyStarted: () => {
            setActiveSubTour(null)
            setTimeout(() => resumeTour(1, dashboardSteps, tourOptionsRef.current), 400)
          }
        })
      }, 500)
      return
    }

    driverObj.moveNext()
  }

  const tourOptions = {
    onNextClick: handleTourNextClick,
    onPrevClick: (driverObj) => driverObj.movePrevious(),
  }
  tourOptionsRef.current = tourOptions

  if (loading) {
    return <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</Box>
  }

  const actions = isAdmin ? adminActions : userActions

  return (
    // ✅ ID 1: Contenedor principal del Dashboard
    <Box id="phase2-dashboard-container" sx={{ minHeight: '100vh', bgcolor: C.bg }}>
      
      {/* ✅ Botón del Tour */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: { xs: 3, md: 6 }, pt: 2 }}>
        <TourButton 
          tourId={phase2DashboardTourConfig.id}
          steps={dashboardSteps}
          label={tCommon('tour.phase2Dashboard.button', 'Guía del Dashboard')}
          options={tourOptions}
        />
      </Box>

      {/* ── HEADER (Estructura de Lakewood, colores de Phase 2) ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ px: { xs: 3, md: 6 }, pt: { xs: 4, md: 5 }, pb: 3 }}>
          <Typography variant="h2" sx={{ fontWeight: 300, color: C.primary, fontSize: { xs: '2.4rem', md: '3.5rem' }, fontFamily: C.fontFamily, lineHeight: 1.1 }}>
            {t('welcome', { name: '' }).trim()}{' '}
            <Box component="span" sx={{ fontWeight: 800 }}>
              {user?.firstName}
            </Box>
          </Typography>

          <Box display="flex" alignItems="center" gap={1.5} mt={1.5}>
            <Typography variant="body2" sx={{ color: C.gray, fontFamily: C.fontFamily, fontSize: '0.9rem' }}>
              {t('subtitle', 'Panel de control Phase 2')}
            </Typography>
            <Chip
              label={user?.role || 'User'}
              sx={{
                bgcolor: C.primary, color: 'white', fontWeight: 700, fontSize: '0.65rem', height: 24,
                fontFamily: C.fontFamily, textTransform: 'uppercase', letterSpacing: '1.5px', borderRadius: 1,
              }}
            />
          </Box>
        </Box>
      </motion.div>

      {/* Elemento invisible para el Paso 0 (Subtour del Layout) */}
      <Box id="phase2-layout-intro-trigger" sx={{ height: 1, width: 1 }} />

      {/* ── STATS (admin only) ── */}
      {isAdmin && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
          <Box sx={{ px: { xs: 3, md: 6 }, pb: 2 }}>
            {/* Si tienes un componente StatsCards compartido, úsalo aquí. Si no, este es el placeholder estructural */}
            {/* <StatsCards stats={statsCards} loading={loading} /> */}
          </Box>
        </motion.div>
      )}

      {/* ── MAP SECTION ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
        {/* ✅ ID 2: Sección del Mapa */}
        <Box id="phase2-map-section">
          <PageSection
            title={t('amenitiesMap', 'Mapa de Amenidades').split(' ')[0]}
            bold={t('amenitiesMap', 'Mapa de Amenidades').split(' ').slice(1).join(' ')}
            description="Explora las amenidades del proyecto de forma interactiva."
            bgcolor="white"
            topBorderColor={C.primary}
            dividerColor={C.border}
            primaryColor={C.primary}
          >
            <AmenitiesMap
              mapImage="/phase2.jpeg"
              amenities={OUTDOOR_AMENITIES}
              amenitySections={[]}
              isPublicView={!isAdmin}
            />
          </PageSection>
        </Box>
      </motion.div>

      {/* ── QUICK ACTIONS ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
        {/* ✅ ID 3: Sección de Acciones Rápidas */}
        <Box id="phase2-quick-actions">
          <PageSection
            title={t('quickActions.title', 'Acciones').split(' ')[0]}
            bold={t('quickActions.title', 'Acciones Rápidas').split(' ').slice(1).join(' ')}
            description={t('quickActions.subtitle', 'Accede directamente a las funciones más utilizadas.')}
            topBorderColor={C.primary}
            dividerColor={C.border}
            primaryColor={C.primary}
            contentPy={0}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, py: 4 }}>
              {actions.map((action, index) => {
                const col = index % 2
                const row = Math.floor(index / 2)
                const isLastRow = Math.floor((actions.length - 1) / 2) === row
                return (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 3 }, borderLeft: { xs: 'none', sm: col === 1 ? `1px solid ${C.border}` : 'none' }, borderBottom: isLastRow ? 'none' : `1px solid ${C.border}`, pl: { xs: 0, sm: col === 1 ? 5 : 0 }, pr: { xs: 0, sm: col === 0 ? 5 : 0 }, py: 4 }}>
                    <Typography sx={{ fontSize: { xs: '4rem', md: '5.5rem' }, fontWeight: 400, color: C.primary, fontFamily: C.fontFamily, lineHeight: 1, minWidth: { xs: 72, md: 96 }, letterSpacing: '-2px' }}>
                      {String(index + 1).padStart(2, '0')}
                    </Typography>
                    <Box flex={1}>
                      <Typography sx={{ fontWeight: 700, color: C.primary, fontFamily: C.fontFamily, fontSize: { xs: '1rem', md: '1.1rem' }, mb: 0.5 }}>
                        {action.label}
                      </Typography>
                      <Typography sx={{ color: C.gray, fontFamily: C.fontFamily, fontSize: '0.82rem', lineHeight: 1.5 }}>
                        {action.description}
                      </Typography>
                    </Box>
                    <Box component={motion.div} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} onClick={action.onClick} sx={{ width: { xs: 52, md: 60 }, height: { xs: 52, md: 60 }, bgcolor: '#C4DB99', borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: C.primary, fontSize: '1.3rem', transition: 'background 0.2s', '&:hover': { bgcolor: C.primary, color: 'white' } }}>
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
      {isAdmin && payloads?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
          {/* ✅ ID 4: Sección de Payloads Recientes */}
          <Box id="phase2-recent-payloads" sx={{ px: { xs: 3, md: 6 }, py: 4 }}>
            <PageSection
              title={t('recentPayloads.title', 'Pagos').split(' ')[0]}
              bold={t('recentPayloads.title', 'Pagos Recientes').split(' ').slice(1).join(' ')}
              description={t('recentPayloads.subtitle', 'Monitorea las últimas transacciones del sistema.')}
              topBorderColor={C.primary}
              dividerColor={C.border}
              primaryColor={C.primary}
            >
              <Box sx={{ py: 2 }}>
                {payloads.map((payload) => (
                  <PayloadRow key={payload._id} payload={payload} />
                ))}
              </Box>
            </PageSection>
          </Box>
        </motion.div>
      )}
    </Box>
  )
}

export default Dashboard