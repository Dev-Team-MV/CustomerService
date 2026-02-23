import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  CircularProgress,
  Container
} from '@mui/material'
import {
  TrendingUp,
  Refresh,
  Home,
  CheckCircle,
  Schedule,
  AttachMoney,
  Analytics as AnalyticsIcon
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import StatCard from '../components/analitycs/StatCard'
import AnimatedProgressBar from '../components/analitycs/AnimatedProgressBar'
import ModelProgressBar from '../components/analitycs/ModelProgressBar'
import PageHeader from '../components/PageHeader'

const Analytics = () => {
  const { t } = useTranslation(['analytics', 'common'])
  
  const [stats, setStats] = useState({
    totalLots: 0,
    soldLots: 0,
    pendingLots: 0,
    occupancyRate: 0,
    targetRate: 92,
    avgLotPrice: 0,
    modelStats: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const timestamp = new Date().getTime()
      const [lotsResponse, propertiesResponse] = await Promise.all([
        api.get(`/lots?t=${timestamp}`),
        api.get(`/properties?t=${timestamp}`)
      ])
      
      const lots = Array.isArray(lotsResponse.data) ? lotsResponse.data : []
      const properties = Array.isArray(propertiesResponse.data) ? propertiesResponse.data : []

      // Calcular estadísticas básicas de LOTES
      const totalLots = lots.length
      const soldLots = lots.filter(lot => lot.status === 'sold').length
      const pendingLots = lots.filter(lot => lot.status === 'pending').length
      const occupancyRate = totalLots > 0 ? Math.round((soldLots / totalLots) * 100) : 0

      // Calcular promedio de precio de lotes
      const lotsWithPrice = lots.filter(lot => lot.price)
      const totalPrice = lotsWithPrice.reduce((sum, lot) => sum + lot.price, 0)
      const avgLotPrice = lotsWithPrice.length > 0 ? totalPrice / lotsWithPrice.length : 0

      // Relacionar properties con lots
      const modelMap = {}
      
      properties.forEach((property) => {
        // Extraer nombre del modelo
        let modelName = 'Unknown'
        if (property.model && typeof property.model === 'object') {
          modelName = property.model.model || property.model.name || 'Unknown'
        } else if (typeof property.model === 'string') {
          modelName = property.model
        }
        
        // Intentar encontrar el lot asociado
        let lotStatus = 'available'
        
        if (property.lot) {
          let lotId = null
          if (typeof property.lot === 'object') {
            lotId = property.lot._id || property.lot.id
          } else if (typeof property.lot === 'string') {
            lotId = property.lot
          }
          
          const associatedLot = lots.find(lot => lot._id === lotId || lot.id === lotId)
          
          if (associatedLot) {
            lotStatus = associatedLot.status
          }
        }
        
        // Inicializar modelo si no existe
        if (!modelMap[modelName]) {
          modelMap[modelName] = {
            name: modelName,
            total: 0,
            sold: 0,
            pending: 0
          }
        }
        
        modelMap[modelName].total++
        
        // Contar según el estado del LOT
        if (lotStatus === 'sold') {
          modelMap[modelName].sold++
        } else if (lotStatus === 'pending') {
          modelMap[modelName].pending++
        }
      })

      const modelStats = Object.values(modelMap)
        .filter(model => model.name !== 'Unknown')
        .map(model => ({
          name: model.name,
          sold: model.sold,
          pending: model.pending,
          total: model.total,
          soldPercentage: model.total > 0 ? Math.round((model.sold / model.total) * 100) : 0,
          pendingPercentage: model.total > 0 ? Math.round((model.pending / model.total) * 100) : 0
        }))
        .sort((a, b) => b.total - a.total)

      setStats({
        totalLots,
        soldLots,
        pendingLots,
        occupancyRate,
        targetRate: 92,
        avgLotPrice,
        modelStats
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const projectSoldPercentage = stats.totalLots > 0 ? (stats.soldLots / stats.totalLots) * 100 : 0

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <PageHeader
          icon={AnalyticsIcon}
          title={t('analytics:title')}
          subtitle={t('analytics:subtitle')}
          actionButton={{
            label: '',
            onClick: fetchAnalytics,
            icon: loading ? <CircularProgress size={24} /> : <Refresh />,
            tooltip: t('analytics:refreshData')
          }}
        />

        <AnimatePresence mode="wait">
          {loading && !stats.totalLots ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress size={60} sx={{ color: '#333F1F' }} />
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Grid container spacing={3}>
                {/* Stat Cards */}
                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    title={t('analytics:stats.totalInventory')}
                    value={stats.totalLots}
                    subtitle={t('analytics:stats.availableLots')}
                    icon={Home}
                    gradient="linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)"
                    delay={0}
                  />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    title={t('analytics:stats.propertiesSold')}
                    value={stats.soldLots}
                    subtitle={`${stats.occupancyRate}% ${t('analytics:stats.occupancy')}`}
                    icon={CheckCircle}
                    gradient="linear-gradient(135deg, #8CA551 0%, #a8bf6f 100%)"
                    delay={0.1}
                  />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    title={t('analytics:stats.pendingSales')}
                    value={stats.pendingLots}
                    subtitle={stats.pendingLots > 0 ? t('analytics:stats.actionRequired') : t('analytics:stats.allClear')}
                    icon={Schedule}
                    gradient="linear-gradient(135deg, #E5863C 0%, #f59c5a 100%)"
                    delay={0.2}
                  />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    title={t('analytics:stats.avgLotPrice')}
                    value={`$${stats.avgLotPrice > 0 ? (stats.avgLotPrice / 1000).toFixed(0) : 0}k`}
                    subtitle={`$${stats.avgLotPrice > 0 ? stats.avgLotPrice.toLocaleString('en-US', { maximumFractionDigits: 0 }) : 0}`}
                    icon={AttachMoney}
                    gradient="linear-gradient(135deg, #706f6f 0%, #8a8989 100%)"
                    delay={0.3}
                  />
                </Grid>

                {/* Progress Bars Section */}
                <Grid item xs={12} lg={6}>
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 3, md: 4 },
                        borderRadius: 4,
                        border: '1px solid rgba(0,0,0,0.08)',
                        height: '100%',
                        background: '#ffffff',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 12px 40px rgba(0,0,0,0.08)'
                        }
                      }}
                    >
                      <Box mb={3}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: '#333F1F',
                            fontFamily: '"Poppins", sans-serif',
                            fontSize: { xs: '1.1rem', md: '1.25rem' },
                            mb: 0.5
                          }}
                        >
                          {t('analytics:progress.title')}
                        </Typography>
                        <Box
                          sx={{
                            width: 60,
                            height: 3,
                            bgcolor: '#8CA551',
                            borderRadius: 3
                          }}
                        />
                      </Box>

                      <Box sx={{ mt: 4 }}>
                        <AnimatedProgressBar
                          label={t('analytics:progress.totalLotsSold')}
                          current={stats.soldLots}
                          target={stats.totalLots}
                          suffix={` ${t('analytics:progress.lots')}`}
                          height={14}
                        />
                      </Box>

                      <Box sx={{ mt: 5 }}>
                        <AnimatedProgressBar
                          label={t('analytics:progress.occupancyRate')}
                          current={stats.occupancyRate}
                          target={stats.targetRate}
                          suffix="%"
                          height={14}
                        />
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>

                {/* Summary Card */}
                <Grid item xs={12} lg={6}>
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 3, md: 4 },
                        borderRadius: 4,
                        border: '1px solid rgba(0,0,0,0.08)',
                        height: '100%',
                        background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 12px 40px rgba(140, 165, 81, 0.15)'
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -100,
                          right: -100,
                          width: 200,
                          height: 200,
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, rgba(140, 165, 81, 0.1) 0%, transparent 70%)',
                        }
                      }}
                    >
                      <Box mb={3}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: '#333F1F',
                            fontFamily: '"Poppins", sans-serif',
                            fontSize: { xs: '1.1rem', md: '1.25rem' },
                            mb: 0.5
                          }}
                        >
                          {t('analytics:summary.title')}
                        </Typography>
                        <Box
                          sx={{
                            width: 60,
                            height: 3,
                            bgcolor: '#8CA551',
                            borderRadius: 3
                          }}
                        />
                      </Box>

                      <Grid container spacing={3}>
                        {[
                          {
                            label: t('analytics:summary.totalProperties'),
                            value: stats.totalLots,
                            color: '#333F1F',
                            icon: Home
                          },
                          {
                            label: t('analytics:summary.sold'),
                            value: stats.soldLots,
                            color: '#8CA551',
                            icon: CheckCircle
                          },
                          {
                            label: t('analytics:summary.pending'),
                            value: stats.pendingLots,
                            color: '#E5863C',
                            icon: Schedule
                          },
                          {
                            label: t('analytics:summary.available'),
                            value: stats.totalLots - stats.soldLots - stats.pendingLots,
                            color: '#706f6f',
                            icon: TrendingUp
                          }
                        ].map((item, index) => (
                          <Grid item xs={6} key={index}>
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.6 + index * 0.1 }}
                            >
                              <Box
                                sx={{
                                  p: 2.5,
                                  borderRadius: 3,
                                  bgcolor: `${item.color}10`,
                                  border: `2px solid ${item.color}20`,
                                  textAlign: 'center',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 8px 24px ${item.color}30`
                                  }
                                }}
                              >
                                <item.icon sx={{ fontSize: 32, color: item.color, mb: 1 }} />
                                <Typography
                                  variant="h4"
                                  sx={{
                                    fontWeight: 800,
                                    color: item.color,
                                    fontFamily: '"Poppins", sans-serif',
                                    mb: 0.5
                                  }}
                                >
                                  {item.value}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#706f6f',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    fontFamily: '"Poppins", sans-serif',
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  {item.label}
                                </Typography>
                              </Box>
                            </motion.div>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </motion.div>
                </Grid>

                {/* Model Stats */}
                <Grid item xs={12}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 3, md: 4 },
                        borderRadius: 4,
                        border: '1px solid rgba(0,0,0,0.08)',
                        background: '#ffffff',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 12px 40px rgba(0,0,0,0.08)'
                        }
                      }}
                    >
                      <Box mb={4}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: '#333F1F',
                            fontFamily: '"Poppins", sans-serif',
                            fontSize: { xs: '1.1rem', md: '1.25rem' },
                            mb: 0.5
                          }}
                        >
                          {t('analytics:models.title')}
                        </Typography>
                        <Box
                          sx={{
                            width: 60,
                            height: 3,
                            bgcolor: '#8CA551',
                            borderRadius: 3
                          }}
                        />
                      </Box>

                      {loading ? (
                        <Box display="flex" justifyContent="center" p={6}>
                          <CircularProgress sx={{ color: '#333F1F' }} />
                        </Box>
                      ) : stats.modelStats.length > 0 ? (
                        <Grid container spacing={3}>
                          {stats.modelStats.map((model, index) => (
                            <Grid item xs={12} sm={6} lg={4} xl={3} key={model.name}>
                              <ModelProgressBar model={model} />
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Box
                          sx={{
                            textAlign: 'center',
                            py: 8,
                            color: '#999'
                          }}
                        >
                          <AnalyticsIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                          <Typography
                            variant="body1"
                            sx={{
                              fontFamily: '"Poppins", sans-serif',
                              color: '#706f6f'
                            }}
                          >
                            {t('analytics:models.noData')}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </motion.div>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  )
}

export default Analytics