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
  Settings
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

const PayloadRow = ({ payload, navigate, t }) => {
  const statusColors = {
    pending: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    approved: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
    rejected: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }
  }
  
  const colors = statusColors[payload.status] || statusColors.pending
  
  // Extraer datos de apartment (estructura de Sheperd)
  const apartment = payload.apartment
  const apartmentModel = apartment?.apartmentModel
  const apartmentNumber = apartment?.apartmentNumber
  const customer = apartment?.users?.[0]

  // Construir el label del apartamento
  const apartmentLabel = apartmentModel?.name && apartmentNumber
    ? `${apartmentModel.name} - ${apartmentNumber}`
    : apartmentModel?.name || t('dashboard:recentQuotes.property')

  return (
    <Box
      onClick={() => navigate('/payloads')}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2.5,
        borderBottom: '1px solid #f0f0f0',
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': { bgcolor: '#fff7ed', borderRadius: 2, px: 2, mx: -2 },
        '&:last-child': { borderBottom: 'none' }
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar 
          sx={{ 
            bgcolor: '#FF6B3520', 
            color: '#FF6B35', 
            fontWeight: 700, 
            fontFamily: '"Poppins", sans-serif' 
          }}
        >
          {customer?.firstName?.charAt(0) || apartmentNumber?.charAt(0) || 'A'}
        </Avatar>
        <Box>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 600, 
              fontFamily: '"Poppins", sans-serif', 
              color: '#FF6B35' 
            }}
          >
            {apartmentLabel}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#6c757d', 
              fontFamily: '"Poppins", sans-serif' 
            }}
          >
            {customer?.firstName && customer?.lastName 
              ? `${customer.firstName} ${customer.lastName}`
              : t('dashboard:recentQuotes.customer')
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
              color: '#FF6B35', 
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
  const { t } = useTranslation(['common', 'dashboard'])
  const projectId = import.meta.env.VITE_PROJECT_ID
  const { masterPlanData, loading, fetchMasterPlan } = useMasterPlan()
 
  useEffect(() => {
    if (projectId) {
      fetchMasterPlan(projectId)
    }
  }, [projectId, fetchMasterPlan])
 
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
 
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
 
  const adminQuickActions = [
    {
      label: t('dashboard:quickActions.newQuote', 'New Quote'),
      description: t('dashboard:quickActions.newQuoteDesc', 'Create a new property quote'),
      icon: <RequestQuote />,
      color: '#FF6B35',
      bgColor: '#FF6B3515',
      onClick: () => navigate('/get-your-quote')
    },
    {
      label: t('dashboard:quickActions.viewProperties', 'Properties'),
      description: t('dashboard:quickActions.viewPropertiesDesc', 'View all properties'),
      icon: <Home />,
      color: '#F7931E',
      bgColor: '#F7931E15',
      onClick: () => navigate('/properties')
    },
    {
      label: t('dashboard:quickActions.residents', 'Residents'),
      description: t('dashboard:quickActions.residentsDesc', 'Manage residents'),
      icon: <People />,
      color: '#FFB84D',
      bgColor: '#FFB84D15',
      onClick: () => navigate('/residents')
    },
    {
      label: t('dashboard:quickActions.news', 'News'),
      description: t('dashboard:quickActions.newsDesc', 'View latest news'),
      icon: <Newspaper />,
      color: '#FF8C42',
      bgColor: '#FF8C4215',
      onClick: () => navigate('/news')
    },
    {
      label: t('dashboard:quickActions.configuration', 'Configuration'),
      description: t('dashboard:quickActions.configurationDesc', 'System settings'),
      icon: <Settings />,
      color: '#43A047',
      bgColor: '#43A04715',
      onClick: () => navigate('/configuration')
    }
  ]
 
  const userQuickActions = [
    {
      label: t('dashboard:quickActions.myApartment', 'My Apartment'),
      description: t('dashboard:quickActions.myApartmentDesc', 'View your apartment'),
      icon: <Home />,
      color: '#F7931E',
      bgColor: '#F7931E15',
      onClick: () => navigate('/my-apartment')
    },
    {
      label: t('dashboard:quickActions.news', 'News'),
      description: t('dashboard:quickActions.newsDesc', 'View latest news'),
      icon: <Newspaper />,
      color: '#FF8C42',
      bgColor: '#FF8C4215',
      onClick: () => navigate('/news')
    }
  ]
 
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
        title={t('common:dashboard.title', 'Dashboard')}
        subtitle={t('common:dashboard.subtitle', 'Welcome to Sheperd Residences')}
        icon={DashboardIcon}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <DashboardMapPanel title={t('dashboard:masterPlan.title', 'Master Plan')}>
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
                  bgcolor: '#fff7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #fed7aa'
                }}
              >
                <Box textAlign="center">
                  <Home sx={{ fontSize: 64, color: '#fdba74', mb: 2 }} />
                  <Box sx={{ color: '#c2410c', fontSize: '0.95rem', fontWeight: 500 }}>
                    {t('dashboard:masterPlan.noImage', 'No Master Plan Available')}
                  </Box>
                  <Box sx={{ color: '#fdba74', fontSize: '0.8rem', mt: 0.5 }}>
                    {t('dashboard:masterPlan.noImageDesc', 'Upload a master plan image to get started')}
                  </Box>
                </Box>
              </Box>
            )}
          </DashboardMapPanel>
        </Grid>

        <Grid item xs={12} lg={4}>
          <QuickActionsPanel
            title={t('dashboard:quickActions.title', 'Quick Actions')}
            subtitle={t('dashboard:quickActions.subtitle', 'Access key features')}
            actions={quickActions}
          />
        </Grid>
      </Grid>

      {isAdmin && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <RecentItemsPanel
              title={t('dashboard:recentPayloads.title', 'Recent Payloads')}
              items={payloads}
              viewAllPath="/payloads"
              emptyMessage={t('dashboard:recentQuotes.noQuotes')}
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