// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Pages/Dashboard.jsx

import { Box, Grid, CircularProgress, Avatar, Typography, Chip } from '@mui/material'
import { useAuth } from '@shared/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
import { 
  Dashboard as DashboardIcon, 
  Home, 
  RequestQuote, 
  People, 
  Newspaper,
  Description
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import DashboardHeader from '@shared/components/Dashboard/DashboardHeader'
import QuickActionsPanel from '@shared/components/Dashboard/QuickActionsPanel'
import RecentItemsPanel from '@shared/components/Dashboard/RecentitemsPanel'
import DashboardMapPanel from '@shared/components/Dashboard/DashboardMapPanel'
import PolygonImagePreview from '@shared/components/PolygonImagePreview'
import { useMasterPlan } from '@shared/hooks/useMasterPlan'
import useFetch from '@shared/hooks/useFetch'
import api from '@shared/services/api'
import { useTranslation } from 'react-i18next'

// Modificar el componente PayloadRow en Dashboard.jsx (líneas 25-122)

const PayloadRow = ({ payload, navigate, t }) => {
  const statusColors = {
    pending: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
    approved: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
    rejected: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }
  }
  
  const colors = statusColors[payload.status] || statusColors.pending
  
  // Extraer datos correctamente de la estructura
  const property = payload.property
  const lot = property?.lot
  const model = property?.model
  const customer = property?.users?.[0] || payload.customer

  // Construir el label del lote
  const lotLabel = lot?.number 
    ? `${model?.model || 'Propiedad'} - ${lot.number}`
    : model?.model || t('recentQuotes.property')

  return (
    <Box
      onClick={() => navigate('/properties')}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2.5,
        borderBottom: '1px solid #f0f0f0',
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': { bgcolor: '#fafafa', borderRadius: 2, px: 2, mx: -2 },
        '&:last-child': { borderBottom: 'none' }
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar 
          sx={{ 
            bgcolor: '#8CA55120', 
            color: '#8CA551', 
            fontWeight: 700, 
            fontFamily: '"Poppins", sans-serif' 
          }}
        >
          {customer?.firstName?.charAt(0) || lot?.number?.charAt(0) || 'P'}
        </Avatar>
        <Box>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 600, 
              fontFamily: '"Poppins", sans-serif', 
              color: '#333F1F' 
            }}
          >
            {lotLabel}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#706f6f', 
              fontFamily: '"Poppins", sans-serif' 
            }}
          >
            {customer?.firstName && customer?.lastName 
              ? `${customer.firstName} ${customer.lastName}`
              : t('recentQuotes.customer')
            }
            {' • '}
            {new Date(payload.date).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      <Box textAlign="right">
        {payload.amount && (
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 700, 
              fontFamily: '"Poppins", sans-serif', 
              color: '#333F1F', 
              mb: 0.5 
            }}
          >
            ${payload.amount.toLocaleString()}
          </Typography>
        )}
        <Chip
          label={t(`common:status.${payload.status}`, payload.status)}
          size="small"
          sx={{
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            bgcolor: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`
          }}
        />
      </Box>
    </Box>
  )
}

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const { t } = useTranslation(['dashboard', 'common'])
  const projectId = import.meta.env.VITE_PROJECT_ID
  const { masterPlanData, loading, fetchMasterPlan } = useMasterPlan()
 
  useEffect(() => {
    if (projectId) {
      fetchMasterPlan(projectId)
    }
  }, [projectId, fetchMasterPlan])
 
  // ✅ Verificar si el usuario es admin o superadmin
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
 
  // ✅ Solo cargar payloads si es admin
  const { data: payloads = [] } = useFetch(
    useCallback(() => {
      if (!projectId || !isAdmin) return Promise.resolve([])
      return api.get('/payloads', {
        params: {
          projectId,
          limit: 5,
          sort: '-date'
        }
      }).then(r => r.data)
    }, [projectId, isAdmin]),
    { initialData: [] }
  )
 
  // ✅ Quick Actions completas (para admin/superadmin)
  const adminQuickActions = [
    {
      label: t('quickActions.newQuote'),
      description: t('quickActions.newQuoteDesc'),
      icon: <RequestQuote />,
      color: '#8CA551',
      bgColor: '#8CA55115',
      onClick: () => navigate('/get-your-quote')
    },
    {
      label: t('quickActions.viewProperties'),
      description: t('quickActions.viewPropertiesDesc'),
      icon: <Home />,
      color: '#E5863C',
      bgColor: '#E5863C15',
      onClick: () => navigate('/properties')
    },
    {
      label: t('quickActions.clients'),
      description: t('quickActions.clientsDesc'),
      icon: <People />,
      color: '#2196f3',
      bgColor: '#2196f315',
      onClick: () => navigate('/residents')
    },
    {
      label: t('quickActions.news'),
      description: t('quickActions.newsDesc'),
      icon: <Newspaper />,
      color: '#9c27b0',
      bgColor: '#9c27b015',
      onClick: () => navigate('/news')
    }
  ]
 
  // ✅ Quick Actions limitadas (para usuarios regulares)
  const userQuickActions = [
    // {
    //   label: t('quickActions.newQuote'),
    //   description: t('quickActions.newQuoteDesc'),
    //   icon: <RequestQuote />,
    //   color: '#8CA551',
    //   bgColor: '#8CA55115',
    //   onClick: () => navigate('/get-your-quote')
    // },
    {
      label: t('quickActions.viewProperties'),
      description: t('quickActions.viewPropertiesDesc'),
      icon: <Home />,
      color: '#E5863C',
      bgColor: '#E5863C15',
      onClick: () => navigate('/my-property')
    },
    {
      label: t('quickActions.news'),
      description: t('quickActions.newsDesc'),
      icon: <Newspaper />,
      color: '#9c27b0',
      bgColor: '#9c27b015',
      onClick: () => navigate('/news')
    },
  ]
 
  // ✅ Seleccionar las acciones según el rol
  const quickActions = isAdmin ? adminQuickActions : userQuickActions
 

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
          color: building.polygonColor || theme.palette.primary.main,
          stroke: building.polygonStrokeColor || theme.palette.secondary.main,
          strokeWidth: 3,
          opacity: building.polygonOpacity !== undefined ? building.polygonOpacity : 0.5,
          fill: (building.polygonColor || theme.palette.primary.main) + '88',
        }
      })
  }

  const previewPolygons = preparePolygonsForPreview()

  return (
    <Box sx={{ p: 3 }}>
      <DashboardHeader
        user={user}
        title={t('title')}
        subtitle={t('subtitle')}
        icon={DashboardIcon}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <DashboardMapPanel title={t('masterPlan.title')}>
            {loading ? (
              <Box
                sx={{
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CircularProgress size={48} sx={{ color: theme.palette.primary.main }} />
              </Box>
            ) : masterPlanData?.masterPlanImage ? (
              <Box
                sx={{
                  width: '100%',
                  position: 'relative',
                  bgcolor: '#f5f5f5',
                  borderRadius: 2,
                  overflow: 'hidden',
                  minHeight: 400
                }}
              >
                <PolygonImagePreview
                  imageUrl={masterPlanData.masterPlanImage}
                  polygons={previewPolygons}
                  maxWidth={1200}
                  maxHeight={800}
                  showLabels={true}
                  onPolygonClick={(poly) => navigate('/master-plan')}
                  onPolygonHover={(polyId) => console.log('Building hovered:', polyId)}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  height: 400,
                  borderRadius: 3,
                  bgcolor: '#f9fafb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #e5e7eb'
                }}
              >
                <Box textAlign="center">
                  <Home sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
                  <Box sx={{ color: '#9ca3af', fontSize: '0.95rem', fontWeight: 500 }}>
                    {t('masterPlan.noImage')}
                  </Box>
                  <Box sx={{ color: '#d1d5db', fontSize: '0.8rem', mt: 0.5 }}>
                    {t('masterPlan.noImageDesc')}
                  </Box>
                </Box>
              </Box>
            )}
          </DashboardMapPanel>
        </Grid>

        <Grid item xs={12} lg={4}>
          <QuickActionsPanel
            title={t('quickActions.title')}
            subtitle={t('quickActions.subtitle')}
            actions={quickActions}
          />
        </Grid>
      </Grid>

      {/* ✅ Solo mostrar RecentPayloads si es admin */}
      {isAdmin && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <RecentItemsPanel
              title={t('recentPayloads.title')}
              items={payloads}
              viewAllPath="/payloads"
              emptyMessage={t('recentQuotes.noQuotes')}
              renderItem={(payload) => (
                <PayloadRow key={payload._id} payload={payload} navigate={navigate} t={t} />
              )}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default Dashboard