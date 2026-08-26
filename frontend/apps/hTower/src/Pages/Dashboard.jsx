// /Users/oficina/MV-CRM/CustomerService/frontend/apps/htower/src/pages/Dashboard.jsx
import { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Chip, CircularProgress, useTheme } from '@mui/material'
import { 
  Home, RequestQuote, People, Newspaper, Settings, Dashboard as DashboardIcon 
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAuth } from '@shared/context/AuthContext'
import api from '@shared/services/api'

// ✅ IMPORTS DEL TOUR
import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getHtowerDashboardTourSteps, htowerDashboardTourConfig } from '../tours/modules/dashboardTour'
import { getLayoutTourSteps, layoutTourConfig } from '@shared/tours/shared/layoutTour'

import useFetch from '@shared/hooks/useFetch'
import { useMasterPlan } from '@shared/hooks/useMasterPlan'
import DashboardMapPanel from '@shared/components/Dashboard/DashboardMapPanel'
import PolygonImagePreview from '@shared/components/PolygonImagePreview'
import PageSection from '@shared/components/PageSection'

// ─── Payload Row (Adaptado a la estructura de apartamentos) ───────────────────
const PayloadRow = ({ payload, navigate, t, tCommon, C }) => {
  const statusColors = {
    pending: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
    approved: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
    rejected: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }
  }
  
  const colors = statusColors[payload.status] || statusColors.pending
  const apartment = payload.apartment
  const apartmentModel = apartment?.apartmentModel
  const apartmentNumber = apartment?.apartmentNumber
  const customer = apartment?.users?.[0] || payload.customer

  const apartmentLabel = apartmentModel?.name && apartmentNumber
    ? `${apartmentModel.name} - ${apartmentNumber}`
    : apartmentModel?.name || t('recentQuotes.property', 'Property')

  return (
    <Box
      onClick={() => navigate('/payloads')}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2.5,
        borderBottom: `1px solid ${C.border}`,
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': { bgcolor: C.bgLight, borderRadius: 2, px: 2, mx: -2 },
        '&:last-child': { borderBottom: 'none' }
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Box sx={{ 
          width: 44, height: 44, borderRadius: 2, 
          bgcolor: `${C.primary}20`, color: C.primary, 
          fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {customer?.firstName?.charAt(0) || apartmentNumber?.charAt(0) || 'P'}
        </Box>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: '"DM Sans", sans-serif', color: C.dark }}>
            {apartmentLabel}
          </Typography>
          <Typography variant="caption" sx={{ color: C.gray, fontFamily: '"DM Sans", sans-serif' }}>
            {customer?.firstName && customer?.lastName 
              ? `${customer.firstName} ${customer.lastName}`
              : t('recentQuotes.customer', 'Customer')
            }
            {' • '}
            {new Date(payload.date).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      <Box textAlign="right">
        {payload.amount && (
          <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: '"DM Sans", sans-serif', color: C.dark, mb: 0.5 }}>
            ${payload.amount.toLocaleString()}
          </Typography>
        )}
        <Chip
          label={tCommon(`status.${payload.status}`, payload.status)}
          size="small"
          sx={{
            fontWeight: 600,
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            bgcolor: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: 1
          }}
        />
      </Box>
    </Box>
  )
}

// ─── main component ─────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation('dashboard')
  const { t: tCommon } = useTranslation('common')
  const theme = useTheme()
  const projectId = import.meta.env.VITE_PROJECT_ID
  const { masterPlanData, loading, fetchMasterPlan } = useMasterPlan()
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  // ✅ Colores dinámicos basados en el theme de hTower
  const C = {
    dark:    theme.palette.primary.main || '#1A237E',
    primary: theme.palette.primary.main || '#1A237E',
    secondary: theme.palette.secondary.main || '#00ACC1',
    orange:  '#E5863C',
    gray:    '#706f6f',
    bg:      theme.palette.background.default || '#fafafa',
    bgLight: theme.palette.action.hover || '#f5f7f1',
    border:  theme.palette.divider || '#e0e0e0',
  }

  // ✅ ESTADOS DEL TOUR
  const [activeSubTour, setActiveSubTour] = useState(null)
  const { startTour, pauseTour, resumeTour } = useTour()
  const tourOptionsRef = useRef(null)

  const dashboardSteps = getHtowerDashboardTourSteps(tCommon)
  const layoutSteps = getLayoutTourSteps(tCommon)

  useEffect(() => {
    if (projectId) {
      fetchMasterPlan(projectId)
    }
  }, [projectId, fetchMasterPlan])

  const { data: payloads = [], loading: payloadsLoading } = useFetch(
    useCallback(() => {
      if (!projectId || !isAdmin) return Promise.resolve([])
      return api.get('/payloads', { params: { projectId, limit: 5, sort: '-date' } }).then(r => r.data)
    }, [projectId, isAdmin]),
    { initialData: [] }
  )

  const loadingData = loading || payloadsLoading

  // ── Quick Actions ───────────────────────────────────────────
  const adminActions = useMemo(() => [
    { icon: <Home />, label: t('quickActions.properties', 'Propiedades'), description: t('quickActions.propertiesDesc', 'Gestionar unidades'), color: C.primary, bgColor: `${C.primary}15`, onClick: () => navigate('/properties') },
    { icon: <People />, label: t('quickActions.residents', 'Residentes'), description: t('quickActions.residentsDesc', 'Administrar residentes'), color: C.secondary, bgColor: `${C.secondary}15`, onClick: () => navigate('/residents') },
    { icon: <Newspaper />, label: t('quickActions.news', 'Noticias'), description: t('quickActions.newsDesc', 'Gestionar comunicados'), color: C.orange, bgColor: '#fff5e6', onClick: () => navigate('/news') },
    { icon: <Settings />, label: t('quickActions.config', 'Configuración'), description: t('quickActions.configDesc', 'Ajustes del sistema'), color: C.gray, bgColor: C.bgLight, onClick: () => navigate('/configuration') }
  ], [t, navigate, C])

  const userActions = useMemo(() => [
    { icon: <Home />, label: t('quickActions.myUnit', 'Mi Unidad'), description: t('quickActions.myUnitDesc', 'Ver detalles de mi departamento'), color: C.primary, bgColor: `${C.primary}15`, onClick: () => navigate('/my-unit') },
    { icon: <Newspaper />, label: t('quickActions.news', 'Noticias'), description: t('quickActions.newsDesc', 'Ver comunicados recientes'), color: C.orange, bgColor: '#fff5e6', onClick: () => navigate('/news') }
  ], [t, navigate, C])

  const actions = isAdmin ? adminActions : userActions

  const preparePolygonsForPreview = () => {
    if (!masterPlanData?.buildings) return []
    return masterPlanData.buildings
      .filter(building => building.polygon && building.polygon.length > 0)
      .map(building => {
        const points = building.polygon.flatMap(point => [point.x, point.y])
        return {
          id: building._id,
          name: building.name,
          points: points,
          color: building.polygonColor || C.primary,
          stroke: building.polygonStrokeColor || C.secondary,
          strokeWidth: 3,
          opacity: building.polygonOpacity !== undefined ? building.polygonOpacity : 0.5,
          fill: (building.polygonColor || C.primary) + '88',
        }
      })
  }

  const previewPolygons = preparePolygonsForPreview()

  // ✅ LÓGICA DEL TOUR CON SUBTOUR
  const handleTourNextClick = (driverObj) => {
    const currentIndex = driverObj.getActiveIndex()
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

  if (loadingData) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={48} sx={{ color: C.primary }} />
      </Box>
    )
  }

  return (
    // ✅ ID 1: Contenedor principal (Empieza con letra, selector CSS válido)
    <Box id="htower-dashboard-container" sx={{ minHeight: '100vh', bgcolor: C.bg }}>

      {/* ✅ Botón del Tour */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: { xs: 3, md: 6 }, pt: 2 }}>
        <TourButton 
          tourId={htowerDashboardTourConfig.id}
          steps={dashboardSteps}
          label={tCommon('tour.htowerDashboard.button', 'Guía del Dashboard')}
          options={tourOptions}
        />
      </Box>

      {/* ── HEADER (Estilo Lakewood) ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ px: { xs: 3, md: 6 }, pt: { xs: 4, md: 5 }, pb: 3 }}>
          <Typography variant="h2" sx={{ fontWeight: 300, color: C.dark, fontSize: { xs: '2.4rem', md: '3.5rem' }, fontFamily: '"DM Sans", sans-serif', lineHeight: 1.1 }}>
            {t('welcomeUser', { name: '' }).trim()}{' '}
            <Box component="span" sx={{ fontWeight: 800 }}>{user?.firstName}</Box>
          </Typography>
          <Box display="flex" alignItems="center" gap={1.5} mt={1.5}>
            <Typography variant="body2" sx={{ color: C.gray, fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem' }}>
              {t('subtitle', 'Welcome to hTower')}
            </Typography>
            <Chip label={user?.role || 'User'} sx={{ bgcolor: C.dark, color: 'white', fontWeight: 700, fontSize: '0.65rem', height: 24, fontFamily: '"DM Sans", sans-serif', textTransform: 'uppercase', letterSpacing: '1.5px', borderRadius: 1 }} />
          </Box>
        </Box>
      </motion.div>

      {/* Elemento invisible para el Paso 0 (Subtour del Layout) */}
      <Box id="htower-layout-intro-trigger" sx={{ height: 1, width: 1 }} />

      {/* ── MAP SECTION (Usando DashboardMapPanel exactamente como en el original) ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <Box id="htower-map-section" sx={{ px: { xs: 3, md: 6 }, pb: 4 }}>
          <DashboardMapPanel title={t('masterPlan.title', 'Master Plan')}>
            {loading ? (
              <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={48} sx={{ color: theme.palette.primary.main }} />
              </Box>
            ) : masterPlanData?.masterPlanImage ? (
              <Box sx={{ width: '100%', position: 'relative', bgcolor: '#f5f5f5', borderRadius: 2, overflow: 'hidden', minHeight: 400 }}>
                <PolygonImagePreview
                  imageUrl={masterPlanData.masterPlanImage}
                  polygons={previewPolygons}
                  maxWidth={1200}
                  maxHeight={800}
                  showLabels={true}
                  onPolygonClick={() => navigate('/master-plan')}
                  onPolygonHover={(polyId) => console.log('Building hovered:', polyId)}
                />
              </Box>
            ) : (
              <Box sx={{ height: 400, borderRadius: 3, bgcolor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #fed7aa' }}>
                <Box textAlign="center">
                  <Home sx={{ fontSize: 64, color: '#fdba74', mb: 2 }} />
                  <Box sx={{ color: '#c2410c', fontSize: '0.95rem', fontWeight: 500 }}>
                    {t('masterPlan.noImage', 'No Master Plan Available')}
                  </Box>
                  <Box sx={{ color: '#fdba74', fontSize: '0.8rem', mt: 0.5 }}>
                    {t('masterPlan.noImageDesc', 'Upload a master plan image to get started')}
                  </Box>
                </Box>
              </Box>
            )}
          </DashboardMapPanel>
        </Box>
      </motion.div>

      {/* ── QUICK ACTIONS (Grid numerado estilo Lakewood) ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <Box id="htower-quick-actions" sx={{ px: { xs: 3, md: 6 }, pb: 4 }}>
          <PageSection
            title={t('quickActions.title', 'Acciones').split(' ')[0]}
            bold={t('quickActions.title', 'Acciones Rápidas').split(' ').slice(1).join(' ')}
            description={t('quickActions.subtitle', 'Accede a las funciones principales.')}
            topBorderColor={C.primary}
            dividerColor={C.border}
            primaryColor={C.dark}
            contentPy={0}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, py: 4 }}>
              {actions.map((action, index) => {
                const col = index % 2
                const row = Math.floor(index / 2)
                const isLastRow = Math.floor((actions.length - 1) / 2) === row
                return (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 3 }, borderLeft: { xs: 'none', sm: col === 1 ? `1px solid ${C.border}` : 'none' }, borderBottom: isLastRow ? 'none' : `1px solid ${C.border}`, pl: { xs: 0, sm: col === 1 ? 5 : 0 }, pr: { xs: 0, sm: col === 0 ? 5 : 0 }, py: 4 }}>
                    <Typography sx={{ fontSize: { xs: '4rem', md: '5.5rem' }, fontWeight: 400, color: C.dark, fontFamily: '"DM Sans", sans-serif', lineHeight: 1, minWidth: { xs: 72, md: 96 }, letterSpacing: '-2px' }}>
                      {String(index + 1).padStart(2, '0')}
                    </Typography>
                    <Box flex={1}>
                      <Typography sx={{ fontWeight: 700, color: C.dark, fontFamily: '"DM Sans", sans-serif', fontSize: { xs: '1rem', md: '1.1rem' }, mb: 0.5 }}>{action.label}</Typography>
                      <Typography sx={{ color: C.gray, fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', lineHeight: 1.5 }}>{action.description}</Typography>
                    </Box>
                    <Box component={motion.div} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} onClick={action.onClick} sx={{ width: { xs: 52, md: 60 }, height: { xs: 52, md: 60 }, bgcolor: '#C4DB99', borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: C.dark, fontSize: '1.3rem', transition: 'background 0.2s', '&:hover': { bgcolor: C.primary, color: 'white' } }}>
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
          <Box id="htower-recent-payloads" sx={{ px: { xs: 3, md: 6 }, pb: 6 }}>
            <PageSection
              title={t('recentPayloads.title', 'Actividad').split(' ')[0]}
              bold={t('recentPayloads.title', 'Actividad Reciente').split(' ').slice(1).join(' ')}
              description={t('recentPayloads.subtitle', 'Últimos movimientos del sistema.')}
              topBorderColor={C.primary}
              dividerColor={C.border}
              primaryColor={C.dark}
            >
              <Box sx={{ py: 2 }}>
                {payloads.map((payload) => (
                  <PayloadRow key={payload._id} payload={payload} navigate={navigate} t={t} tCommon={tCommon} C={C} />
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