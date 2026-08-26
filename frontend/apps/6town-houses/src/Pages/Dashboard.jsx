// // @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Pages/Dashboard.jsx

// import { Box, Grid, CircularProgress, Avatar, Typography, Chip } from '@mui/material'
// import { useAuth } from '@shared/context/AuthContext'
// import { useNavigate } from 'react-router-dom'
// import { useEffect, useCallback } from 'react'
// import { 
//   Dashboard as DashboardIcon, 
//   Home, 
//   RequestQuote, 
//   People, 
//   Newspaper,
//   Description
// } from '@mui/icons-material'
// import { useTheme } from '@mui/material/styles'
// import DashboardHeader from '@shared/components/Dashboard/DashboardHeader'
// import QuickActionsPanel from '@shared/components/Dashboard/QuickActionsPanel'
// import RecentItemsPanel from '@shared/components/Dashboard/RecentitemsPanel'
// import DashboardMapPanel from '@shared/components/Dashboard/DashboardMapPanel'
// import PolygonImagePreview from '@shared/components/PolygonImagePreview'
// import { useMasterPlan } from '@shared/hooks/useMasterPlan'
// import useFetch from '@shared/hooks/useFetch'
// import api from '@shared/services/api'
// import { useTranslation } from 'react-i18next'

// // Modificar el componente PayloadRow en Dashboard.jsx (líneas 25-122)

// const PayloadRow = ({ payload, navigate, t }) => {
//   const statusColors = {
//     pending: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
//     approved: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
//     rejected: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }
//   }
  
//   const colors = statusColors[payload.status] || statusColors.pending
  
//   // Extraer datos correctamente de la estructura
//   const property = payload.property
//   const lot = property?.lot
//   const model = property?.model
//   const customer = property?.users?.[0] || payload.customer

//   // Construir el label del lote
//   const lotLabel = lot?.number 
//     ? `${model?.model || 'Propiedad'} - ${lot.number}`
//     : model?.model || t('recentQuotes.property')

//   return (
//     <Box
//       onClick={() => navigate('/properties')}
//       sx={{
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         py: 2.5,
//         borderBottom: '1px solid #f0f0f0',
//         cursor: 'pointer',
//         transition: 'all 0.3s',
//         '&:hover': { bgcolor: '#fafafa', borderRadius: 2, px: 2, mx: -2 },
//         '&:last-child': { borderBottom: 'none' }
//       }}
//     >
//       <Box display="flex" alignItems="center" gap={2}>
//         <Avatar 
//           sx={{ 
//             bgcolor: '#8CA55120', 
//             color: '#8CA551', 
//             fontWeight: 700, 
//             fontFamily: '"Poppins", sans-serif' 
//           }}
//         >
//           {customer?.firstName?.charAt(0) || lot?.number?.charAt(0) || 'P'}
//         </Avatar>
//         <Box>
//           <Typography 
//             variant="body1" 
//             sx={{ 
//               fontWeight: 600, 
//               fontFamily: '"Poppins", sans-serif', 
//               color: '#333F1F' 
//             }}
//           >
//             {lotLabel}
//           </Typography>
//           <Typography 
//             variant="caption" 
//             sx={{ 
//               color: '#706f6f', 
//               fontFamily: '"Poppins", sans-serif' 
//             }}
//           >
//             {customer?.firstName && customer?.lastName 
//               ? `${customer.firstName} ${customer.lastName}`
//               : t('recentQuotes.customer')
//             }
//             {' • '}
//             {new Date(payload.date).toLocaleDateString()}
//           </Typography>
//         </Box>
//       </Box>

//       <Box textAlign="right">
//         {payload.amount && (
//           <Typography 
//             variant="body1" 
//             sx={{ 
//               fontWeight: 700, 
//               fontFamily: '"Poppins", sans-serif', 
//               color: '#333F1F', 
//               mb: 0.5 
//             }}
//           >
//             ${payload.amount.toLocaleString()}
//           </Typography>
//         )}
//         <Chip
//           label={t(`common:status.${payload.status}`, payload.status)}
//           size="small"
//           sx={{
//             fontWeight: 600,
//             fontFamily: '"Poppins", sans-serif',
//             fontSize: '0.7rem',
//             textTransform: 'uppercase',
//             letterSpacing: '0.5px',
//             bgcolor: colors.bg,
//             color: colors.text,
//             border: `1px solid ${colors.border}`
//           }}
//         />
//       </Box>
//     </Box>
//   )
// }

// const Dashboard = () => {
//   const { user } = useAuth()
//   const navigate = useNavigate()
//   const theme = useTheme()
//   const { t } = useTranslation(['dashboard', 'common'])
//   const projectId = import.meta.env.VITE_PROJECT_ID
//   const { masterPlanData, loading, fetchMasterPlan } = useMasterPlan()
 
//   useEffect(() => {
//     if (projectId) {
//       fetchMasterPlan(projectId)
//     }
//   }, [projectId, fetchMasterPlan])
 
//   // ✅ Verificar si el usuario es admin o superadmin
//   const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
 
//   // ✅ Solo cargar payloads si es admin
//   const { data: payloads = [] } = useFetch(
//     useCallback(() => {
//       if (!projectId || !isAdmin) return Promise.resolve([])
//       return api.get('/payloads', {
//         params: {
//           projectId,
//           limit: 5,
//           sort: '-date'
//         }
//       }).then(r => r.data)
//     }, [projectId, isAdmin]),
//     { initialData: [] }
//   )
 
//   // ✅ Quick Actions completas (para admin/superadmin)
//   const adminQuickActions = [
//     {
//       label: t('quickActions.newQuote'),
//       description: t('quickActions.newQuoteDesc'),
//       icon: <RequestQuote />,
//       color: '#8CA551',
//       bgColor: '#8CA55115',
//       onClick: () => navigate('/get-your-quote')
//     },
//     {
//       label: t('quickActions.viewProperties'),
//       description: t('quickActions.viewPropertiesDesc'),
//       icon: <Home />,
//       color: '#E5863C',
//       bgColor: '#E5863C15',
//       onClick: () => navigate('/properties')
//     },
//     {
//       label: t('quickActions.clients'),
//       description: t('quickActions.clientsDesc'),
//       icon: <People />,
//       color: '#2196f3',
//       bgColor: '#2196f315',
//       onClick: () => navigate('/residents')
//     },
//     {
//       label: t('quickActions.news'),
//       description: t('quickActions.newsDesc'),
//       icon: <Newspaper />,
//       color: '#9c27b0',
//       bgColor: '#9c27b015',
//       onClick: () => navigate('/news')
//     }
//   ]
 
//   // ✅ Quick Actions limitadas (para usuarios regulares)
//   const userQuickActions = [
//     // {
//     //   label: t('quickActions.newQuote'),
//     //   description: t('quickActions.newQuoteDesc'),
//     //   icon: <RequestQuote />,
//     //   color: '#8CA551',
//     //   bgColor: '#8CA55115',
//     //   onClick: () => navigate('/get-your-quote')
//     // },
//     {
//       label: t('quickActions.viewProperties'),
//       description: t('quickActions.viewPropertiesDesc'),
//       icon: <Home />,
//       color: '#E5863C',
//       bgColor: '#E5863C15',
//       onClick: () => navigate('/my-property')
//     },
//     {
//       label: t('quickActions.news'),
//       description: t('quickActions.newsDesc'),
//       icon: <Newspaper />,
//       color: '#9c27b0',
//       bgColor: '#9c27b015',
//       onClick: () => navigate('/news')
//     },
//   ]
 
//   // ✅ Seleccionar las acciones según el rol
//   const quickActions = isAdmin ? adminQuickActions : userQuickActions
 

//   const preparePolygonsForPreview = () => {
//     if (!masterPlanData?.buildings) return []
//     return masterPlanData.buildings
//       .filter(building => building.polygon && building.polygon.length > 0)
//       .map(building => {
//         const points = building.polygon.flatMap(point => [point.x, point.y])
//         return {
//           id: building._id,
//           name: building.name,
//           points: points,
//           color: building.polygonColor || theme.palette.primary.main,
//           stroke: building.polygonStrokeColor || theme.palette.secondary.main,
//           strokeWidth: 3,
//           opacity: building.polygonOpacity !== undefined ? building.polygonOpacity : 0.5,
//           fill: (building.polygonColor || theme.palette.primary.main) + '88',
//         }
//       })
//   }

//   const previewPolygons = preparePolygonsForPreview()

//   return (
//     <Box sx={{ p: 3 }}>
//       <DashboardHeader
//         user={user}
//         title={t('title')}
//         subtitle={t('subtitle')}
//         icon={DashboardIcon}
//       />

//       <Grid container spacing={3} sx={{ mb: 3 }}>
//         <Grid item xs={12} lg={8}>
//           <DashboardMapPanel title={t('masterPlan.title')}>
//             {loading ? (
//               <Box
//                 sx={{
//                   height: 400,
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}
//               >
//                 <CircularProgress size={48} sx={{ color: theme.palette.primary.main }} />
//               </Box>
//             ) : masterPlanData?.masterPlanImage ? (
//               <Box
//                 sx={{
//                   width: '100%',
//                   position: 'relative',
//                   bgcolor: '#f5f5f5',
//                   borderRadius: 2,
//                   overflow: 'hidden',
//                   minHeight: 400
//                 }}
//               >
//                 <PolygonImagePreview
//                   imageUrl={masterPlanData.masterPlanImage}
//                   polygons={previewPolygons}
//                   maxWidth={1200}
//                   maxHeight={800}
//                   showLabels={true}
//                   onPolygonClick={(poly) => navigate('/master-plan')}
//                   onPolygonHover={(polyId) => console.log('Building hovered:', polyId)}
//                 />
//               </Box>
//             ) : (
//               <Box
//                 sx={{
//                   height: 400,
//                   borderRadius: 3,
//                   bgcolor: '#f9fafb',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   border: '2px dashed #e5e7eb'
//                 }}
//               >
//                 <Box textAlign="center">
//                   <Home sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
//                   <Box sx={{ color: '#9ca3af', fontSize: '0.95rem', fontWeight: 500 }}>
//                     {t('masterPlan.noImage')}
//                   </Box>
//                   <Box sx={{ color: '#d1d5db', fontSize: '0.8rem', mt: 0.5 }}>
//                     {t('masterPlan.noImageDesc')}
//                   </Box>
//                 </Box>
//               </Box>
//             )}
//           </DashboardMapPanel>
//         </Grid>

//         <Grid item xs={12} lg={4}>
//           <QuickActionsPanel
//             title={t('quickActions.title')}
//             subtitle={t('quickActions.subtitle')}
//             actions={quickActions}
//           />
//         </Grid>
//       </Grid>

//       {/* ✅ Solo mostrar RecentPayloads si es admin */}
//       {isAdmin && (
//         <Grid container spacing={3}>
//           <Grid item xs={12}>
//             <RecentItemsPanel
//               title={t('recentPayloads.title')}
//               items={payloads}
//               viewAllPath="/payloads"
//               emptyMessage={t('recentQuotes.noQuotes')}
//               renderItem={(payload) => (
//                 <PayloadRow key={payload._id} payload={payload} navigate={navigate} t={t} />
//               )}
//             />
//           </Grid>
//         </Grid>
//       )}
//     </Box>
//   )
// }

// export default Dashboard

// /Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Pages/Dashboard.jsx
import { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Chip, CircularProgress, useTheme } from '@mui/material'
import { Home, RequestQuote, People, Newspaper } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAuth } from '@shared/context/AuthContext'
import api from '@shared/services/api'

// ✅ IMPORTS DEL TOUR
import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { get6townDashboardTourSteps, sixtownDashboardTourConfig } from '../tours/modules/dashboardTour'
import { getLayoutTourSteps, layoutTourConfig } from '@shared/tours/shared/layoutTour'

import useFetch from '@shared/hooks/useFetch'
import { useMasterPlan } from '@shared/hooks/useMasterPlan'
import PolygonImagePreview from '@shared/components/PolygonImagePreview'
import PageSection from '@shared/components/PageSection'

// ─── Payload Row (Lógica de 6town, estética de Lakewood) ───────────────────
const PayloadRow = ({ payload, navigate, t, tCommon, C }) => {
  const statusColors = {
    pending: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
    approved: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
    rejected: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }
  }
  
  const colors = statusColors[payload.status] || statusColors.pending
  const property = payload.property
  const lot = property?.lot
  const model = property?.model
  const customer = property?.users?.[0] || payload.customer

  const lotLabel = lot?.number 
    ? `${model?.model || 'Propiedad'} - ${lot.number}`
    : model?.model || t('recentQuotes.property', 'Property')

  return (
    <Box
      onClick={() => navigate('/properties')}
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
          bgcolor: `${C.green}20`, color: C.green, 
          fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {customer?.firstName?.charAt(0) || lot?.number?.charAt(0) || 'P'}
        </Box>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: '"DM Sans", sans-serif', color: C.dark }}>
            {lotLabel}
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

  // ✅ Colores: Estructura de Lakewood, valores del theme de 6town con fallbacks
  const C = {
    dark:    theme.palette.primary.main || '#333F1F',
    green:   theme.palette.primary.main || '#8CA551',
    orange:  theme.palette.secondary.main || '#E5863C',
    gray:    '#706f6f',
    bg:      theme.palette.background.default || '#fafafa',
    bgLight: theme.palette.action.hover || '#f5f7f1',
    border:  theme.palette.divider || '#d6ddc9',
  }

  // ✅ ESTADOS DEL TOUR
  const [activeSubTour, setActiveSubTour] = useState(null)
  const { startTour, pauseTour, resumeTour } = useTour()
  const tourOptionsRef = useRef(null)

  const dashboardSteps = get6townDashboardTourSteps(tCommon)
  const layoutSteps = getLayoutTourSteps(tCommon)

  useEffect(() => {
    if (projectId) {
      fetchMasterPlan(projectId)
    }
  }, [projectId, fetchMasterPlan])

  const { data: payloads = [], loading: payloadsLoading } = useFetch(
    useCallback(() => {
      if (!projectId || !isAdmin) return Promise.resolve([])
      return api.get('/payloads', {
        params: { projectId, limit: 5, sort: '-date' }
      }).then(r => r.data)
    }, [projectId, isAdmin]),
    { initialData: [] }
  )

  const loadingData = loading || payloadsLoading

  // ── quick actions ───────────────────────────────────────────
  const adminActions = useMemo(() => [
    { icon: <RequestQuote />, label: t('quickActions.newQuote', 'New Quote'), description: t('quickActions.newQuoteDesc', 'Create a new property quote'), color: C.green, bgColor: `${C.green}15`, onClick: () => navigate('/get-your-quote') },
    { icon: <Home />, label: t('quickActions.viewProperties', 'Properties'), description: t('quickActions.viewPropertiesDesc', 'View all properties'), color: C.orange, bgColor: `${C.orange}15`, onClick: () => navigate('/properties') },
    { icon: <People />, label: t('quickActions.clients', 'Clients'), description: t('quickActions.clientsDesc', 'Manage clients'), color: '#2196f3', bgColor: '#2196f315', onClick: () => navigate('/residents') },
    { icon: <Newspaper />, label: t('quickActions.news', 'News'), description: t('quickActions.newsDesc', 'View latest news'), color: '#9c27b0', bgColor: '#9c27b015', onClick: () => navigate('/news') }
  ], [t, navigate, C])

  const userActions = useMemo(() => [
    { icon: <Home />, label: t('quickActions.viewProperties', 'My Property'), description: t('quickActions.viewPropertiesDesc', 'View my property'), color: C.orange, bgColor: `${C.orange}15`, onClick: () => navigate('/my-property') },
    { icon: <Newspaper />, label: t('quickActions.news', 'News'), description: t('quickActions.newsDesc', 'View latest news'), color: '#9c27b0', bgColor: '#9c27b015', onClick: () => navigate('/news') }
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
          color: building.polygonColor || C.green,
          stroke: building.polygonStrokeColor || C.orange,
          strokeWidth: 3,
          opacity: building.polygonOpacity !== undefined ? building.polygonOpacity : 0.5,
          fill: (building.polygonColor || C.green) + '88',
        }
      })
  }

  const previewPolygons = preparePolygonsForPreview()

  // ✅ LÓGICA DEL TOUR CON SUBTOUR
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
            console.log('🔙 Subtour Layout cerrado')
            setActiveSubTour(null)
            setTimeout(() => resumeTour(1, dashboardSteps, tourOptionsRef.current), 400)
          },
          onDestroyStarted: () => {
            console.log('🔙 Subtour Layout destruido')
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
        <CircularProgress size={48} sx={{ color: C.green }} />
      </Box>
    )
  }

  return (
    // ✅ ID 1: Contenedor principal del Dashboard (usando "sixtown" no "6town")
    <Box id="sixtown-dashboard-container" sx={{ minHeight: '100vh', bgcolor: C.bg }}>

      {/* ✅ Botón del Tour */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: { xs: 3, md: 6 }, pt: 2 }}>
        <TourButton 
          tourId={sixtownDashboardTourConfig.id}
          steps={dashboardSteps}
          label={tCommon('tour.sixtownDashboard.button', 'Guía del Dashboard')}
          options={tourOptions}
        />
      </Box>

      {/* ── HEADER (Estilo Lakewood) ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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
            <Typography variant="body2" sx={{ color: C.gray, fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem' }}>
              {t('subtitle', 'Welcome to 6town Houses')}
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
      <Box id="sixtown-layout-intro-trigger" sx={{ height: 1, width: 1 }} />

      {/* ── MAP SECTION ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <Box id="sixtown-map-section" sx={{ px: { xs: 3, md: 6 }, pb: 4 }}>
          <PageSection
            title={t('masterPlan.title', 'Master Plan').split(' ')[0]}
            bold={t('masterPlan.title', 'Master Plan').split(' ').slice(1).join(' ')}
            description={t('masterPlan.subtitle', 'Interactive overview of the property layout.')}
            bgcolor="white"
            topBorderColor={C.green}
            dividerColor={C.border}
            primaryColor={C.dark}
          >
            {masterPlanData?.masterPlanImage ? (
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
              <Box sx={{ height: 400, borderRadius: 3, bgcolor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px dashed ${C.border}` }}>
                <Box textAlign="center">
                  <Home sx={{ fontSize: 64, color: C.gray, mb: 2, opacity: 0.5 }} />
                  <Box sx={{ color: C.dark, fontSize: '0.95rem', fontWeight: 500 }}>
                    {t('masterPlan.noImage', 'No Master Plan Available')}
                  </Box>
                  <Box sx={{ color: C.gray, fontSize: '0.8rem', mt: 0.5 }}>
                    {t('masterPlan.noImageDesc', 'Upload a master plan image to get started')}
                  </Box>
                </Box>
              </Box>
            )}
          </PageSection>
        </Box>
      </motion.div>

      {/* ── QUICK ACTIONS ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <Box id="sixtown-quick-actions" sx={{ px: { xs: 3, md: 6 }, pb: 4 }}>
          <PageSection
            title={t('quickActions.title', 'Quick Actions').split(' ')[0]}
            bold={t('quickActions.title', 'Quick Actions').split(' ').slice(1).join(' ')}
            description={t('quickActions.subtitle', 'Access key features')}
            topBorderColor={C.green}
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
                    <Typography sx={{ fontSize: { xs: '4rem', md: '5.5rem' }, fontWeight: 400, color: C.dark, fontFamily: '"DM Sans", sans-serif', lineHeight: 1, minWidth: { xs: 72, md: 96 }, letterSpacing: '-2px' }}>
                      {String(index + 1).padStart(2, '0')}
                    </Typography>

                    <Box flex={1}>
                      <Typography sx={{ fontWeight: 700, color: C.dark, fontFamily: '"DM Sans", sans-serif', fontSize: { xs: '1rem', md: '1.1rem' }, mb: 0.5 }}>
                        {action.label}
                      </Typography>
                      <Typography sx={{ color: C.gray, fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', lineHeight: 1.5 }}>
                        {action.description}
                      </Typography>
                    </Box>

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
      {isAdmin && payloads?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
          <Box id="sixtown-recent-payloads" sx={{ px: { xs: 3, md: 6 }, pb: 6 }}>
            <PageSection
              title={t('recentPayloads.title', 'Recent Payloads').split(' ')[0]}
              bold={t('recentPayloads.title', 'Recent Payloads').split(' ').slice(1).join(' ')}
              description={t('recentPayloads.subtitle', 'Monitor the latest transactions and system movements.')}
              topBorderColor={C.green}
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