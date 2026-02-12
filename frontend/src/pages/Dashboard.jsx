import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

import React,{ useState, useEffect } from 'react'
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  HomeWork,
  TrendingUp,
  AttachMoney,
  Inbox,
    Star,

} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import DashboardMap from '../components/DashboardMap'
import { motion, AnimatePresence } from 'framer-motion'


const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalLots: 0,
    availableLots: 0,
    holdLots: 0,
    soldLots: 0,
    occupancyRate: 0,
    soldDifference: 0,
    soldPercentageChange: 0,
    currentMonthRevenue: 0,
    revenuePercentageChange: 0
  })
  const [recentPayloads, setRecentPayloads] = useState([])
  const [loading, setLoading] = useState(true)

  // Estados para modal de User
  const [openUserDialog, setOpenUserDialog] = useState(false)
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    birthday: '',
    role: 'user'
  })

  useEffect(() => {
    fetchStats()
    fetchRecentPayloads()
  }, [user])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const lotsResponse = await api.get('/lots')
      const lots = Array.isArray(lotsResponse.data) ? lotsResponse.data : []

      const totalLots = lots.length
      const availableLots = lots.filter(lot => lot.status === 'available').length
      const holdLots = lots.filter(lot => lot.status === 'pending').length
      const soldLots = lots.filter(lot => lot.status === 'sold').length

      const occupancyRate = totalLots > 0 ? ((soldLots / totalLots) * 100).toFixed(1) : 0

      const currentDate = new Date()
      const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

      const soldLotsWithDates = lots.filter(lot => lot.status === 'sold' && lot.updatedAt)
      
      const currentMonthSold = soldLotsWithDates.filter(lot => {
        const lotDate = new Date(lot.updatedAt)
        return lotDate >= currentMonthStart
      }).length

      const lastMonthSold = soldLotsWithDates.filter(lot => {
        const lotDate = new Date(lot.updatedAt)
        return lotDate >= lastMonthStart && lotDate < lastMonthEnd
      }).length

      const soldDifference = currentMonthSold - lastMonthSold
      const soldPercentageChange = lastMonthSold > 0 
        ? (((currentMonthSold - lastMonthSold) / lastMonthSold) * 100).toFixed(1)
        : currentMonthSold > 0 ? 100 : 0

      const currentMonthRevenueLots = soldLotsWithDates.filter(lot => {
        const lotDate = new Date(lot.updatedAt)
        return lotDate >= currentMonthStart
      })

      const currentMonthRevenue = currentMonthRevenueLots.reduce((sum, lot) => {
        const price = lot.totalPrice || lot.price || lot.basePrice || 0
        return sum + price
      }, 0)

      const lastMonthRevenue = soldLotsWithDates
        .filter(lot => {
          const lotDate = new Date(lot.updatedAt)
          return lotDate >= lastMonthStart && lotDate < lastMonthEnd
        })
        .reduce((sum, lot) => sum + (lot.totalPrice || lot.price || lot.basePrice || 0), 0)

      const revenuePercentageChange = lastMonthRevenue > 0
        ? (((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
        : currentMonthRevenue > 0 ? 100 : 0

      const newStats = {
        totalLots,
        availableLots,
        holdLots,
        soldLots,
        occupancyRate: parseFloat(occupancyRate),
        soldDifference,
        soldPercentageChange: parseFloat(soldPercentageChange),
        currentMonthRevenue,
        revenuePercentageChange: parseFloat(revenuePercentageChange)
      }

      setStats(newStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentPayloads = async () => {
    try {
      const response = await api.get('/payloads?limit=3&sort=-date')
      setRecentPayloads(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      setRecentPayloads([])
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'cleared': return 'success'
      case 'pending': return 'warning'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'cleared': return 'Cleared'
      case 'pending': return 'Pending'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  // Handlers para User Dialog
  const handleOpenUserDialog = () => {
    setUserFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
      birthday: '',
      role: 'user'
    })
    setOpenUserDialog(true)
  }

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false)
  }

  const handleSubmitUser = async () => {
    try {
      await api.post('/auth/register', {
        ...userFormData,
        phoneNumber: `+${userFormData.phoneNumber}`,
        skipPasswordSetup: true
      })
      handleCloseUserDialog()
      alert('✅ User invited successfully! They will receive an SMS with setup instructions.')
    } catch (error) {
      alert(error.response?.data?.message || 'Error inviting user')
    }
  }

  // Quick Actions para admin/superadmin
  const quickActions = [
    { 
      icon: '🏠', 
      label: 'Add Property', 
      color: '#3b82f6',
      onClick: () => navigate('/properties/select')
    },
    { 
      icon: '👥', 
      label: 'Invite User', 
      color: '#10b981',
      onClick: handleOpenUserDialog
    },
    { 
      icon: '📊', 
      label: 'Analytics', 
      color: '#8b5cf6',
      onClick: () => navigate('/analytics')
    },
    { 
      icon: '🏡', 
      label: 'Models', 
      color: '#4a7c59', 
      onClick: () => navigate('/view-models') 
    },
    { 
      icon: '�️', 
      label: 'Amenities', 
      color: '#2196f3', 
      onClick: () => navigate('/amenities') 
    },
    { 
      icon: '📰', 
      label: 'Manage News', 
      color: '#f59e0b', 
      onClick: () => navigate('/news') // ✅ Admin panel para crear/editar
    }
  ]
  
  // Quick Actions para user propietario
  const userQuickActions = [
    { 
      icon: '🏡', 
      label: 'Models', 
      color: '#4a7c59', 
      onClick: () => navigate('/view-models') 
    },
    { 
      icon: '🏛️', 
      label: 'Amenities', 
      color: '#2196f3', 
      onClick: () => navigate('/amenities') 
    },
    { 
      icon: '📰', 
      label: 'News Feed', 
      color: '#f59e0b', 
      onClick: () => navigate('/explore/news')  // ✅ Vista pública del feed
    }
  ]

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
    sx={{p: 3}}
    >
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                mb: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: { xs: 4, md: 6 },
                border: '1px solid rgba(74, 124, 89, 0.08)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Patrón decorativo - Solo en pantallas grandes */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '40%',
                  height: '100%',
                  opacity: 0.03,
                  backgroundImage: 'radial-gradient(circle, #4a7c59 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  display: { xs: 'none', md: 'block' }, // ✅ Ocultar en mobile
                }}
              />
          
              {/* HEADER RESPONSIVE */}
              <Box
                display="flex"
                flexDirection={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                gap={{ xs: 2, sm: 3 }}
                mb={2}
                position="relative"
                zIndex={1}
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Box
                    sx={{
                      width: { xs: 60, sm: 70, md: 90 },
                      height: { xs: 60, sm: 70, md: 90 },
                      borderRadius: { xs: 3, md: 4 },
                      background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 12px 40px rgba(74, 124, 89, 0.3)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -3,
                        borderRadius: { xs: 3, md: 4 },
                        background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                        opacity: 0.3,
                        filter: 'blur(10px)'
                      }
                    }}
                  >
                    <HomeWork 
                      sx={{ 
                        fontSize: { xs: 30, sm: 38, md: 45 }, 
                        color: 'white' 
                      }} 
                    />
                  </Box>
                </motion.div>
          
                <Box flex={1}>
                  <Typography 
                    variant="h3" 
                    fontWeight="800" 
                    sx={{ 
                      color: '#2c3e50',
                      letterSpacing: '-1px',
                      mb: { xs: 0.5, sm: 0.5 },
                      fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }
                    }}
                  >
                    Welcome, {user?.firstName}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#6c757d', 
                        fontWeight: 400,
                        fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }
                      }}
                    >
                      Your Dashboard
                    </Typography>
                    <Chip
                      label={user?.firstName || 'User'}
                      sx={{
                        background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                        height: { xs: 26, sm: 30, md: 32 }
                      }}
                      icon={
                        <Star 
                          sx={{ 
                            color: 'white !important',
                            fontSize: { xs: 16, sm: 18, md: 20 }
                          }} 
                        />
                      }
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </motion.div>

      {user?.role === 'user' ? (
        <>
          {/* GRID animado */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Grid container spacing={3}>
              {/* MAPA */}
              <Grid item xs={12} md={8}>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Paper 
                    sx={{ 
                      p: 3,
                      height: '100%', 
                      borderRadius: 6,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafb 100%)',
                      boxShadow: '0 12px 40px rgba(74,124,89,0.08)',
                      border: '1px solid rgba(74,124,89,0.08)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: 'linear-gradient(90deg, #4a7c59 0%, #8bc34a 100%)'
                      }
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" fontWeight="bold">
                        Property Map
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="primary" 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate('/explore/properties')}
                      >
                        View Full Map
                      </Typography>
                    </Box>
                    <DashboardMap />
                  </Paper>
                </motion.div>
              </Grid>
      
              {/* QUICK ACTIONS */}
              <Grid item xs={12} md={4}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Paper 
                    sx={{ 
                      p: 3,
                      height: '100%', 
                      borderRadius: 6,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafb 100%)',
                      boxShadow: '0 12px 40px rgba(74,124,89,0.08)',
                      border: '1px solid rgba(74,124,89,0.08)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: 'linear-gradient(90deg, #4a7c59 0%, #8bc34a 100%)'
                      }
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      <Typography 
                        variant="h6"
                        fontWeight="800" 
                        sx={{ 
                          color: '#2c3e50',
                          letterSpacing: '-0.5px',
                          mb: 0.5
                        }}
                      >
                        Quick Actions
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6c757d' }}>
                        Shortcuts to common tasks
                      </Typography>
                    </Box>
              
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {userQuickActions.map((action, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ 
                            scale: 1.02,
                            transition: { type: "spring", stiffness: 400 }
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card
                            onClick={action.onClick}
                            sx={{
                              cursor: 'pointer',
                              borderRadius: 3,
                              border: '1px solid transparent',
                              background: 'white',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              position: 'relative',
                              overflow: 'hidden',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: 3,
                                background: action.color,
                                transform: 'scaleY(0)',
                                transition: 'transform 0.3s ease'
                              },
                              '&:hover': {
                                borderColor: action.color,
                                boxShadow: `0 8px 20px ${action.color}20`,
                                transform: 'translateY(-2px)',
                                '&::before': {
                                  transform: 'scaleY(1)'
                                }
                              }
                            }}
                          >
                            <CardContent sx={{ p: 1.8, '&:last-child': { pb: 1.8 } }}>
                              <Box display="flex" alignItems="center" gap={1.5}>
                                <Box
                                  sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 2.5,
                                    background: `linear-gradient(135deg, ${action.color}15 0%, ${action.color}05 100%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.4rem',
                                    position: 'relative',
                                    transition: 'all 0.3s',
                                    '&::after': {
                                      content: '""',
                                      position: 'absolute',
                                      inset: -2,
                                      borderRadius: 2.5,
                                      background: `linear-gradient(135deg, ${action.color}30, transparent)`,
                                      opacity: 0,
                                      transition: 'opacity 0.3s'
                                    },
                                    '&:hover::after': {
                                      opacity: 1
                                    }
                                  }}
                                >
                                  {action.icon}
                                </Box>
                                <Box flex={1}>
                                  <Typography 
                                    variant="body2"
                                    fontWeight={700} 
                                    sx={{ 
                                      color: '#2c3e50',
                                      letterSpacing: '-0.3px',
                                      mb: 0.3,
                                      fontSize: '0.9rem'
                                    }}
                                  >
                                    {action.label}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#6c757d', fontSize: '0.7rem' }}>
                                    {action.label === 'Models' ? 'Browse designs' :
                                     action.label === 'Amenities' ? 'View facilities' :
                                     'Latest updates'}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    background: `${action.color}10`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: action.color,
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                      background: action.color,
                                      color: 'white'
                                    }
                                  }}
                                >
                                  ›
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </>
      ) : (
        <>          
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
        <Grid container spacing={3}>
          {/* Stats Cards */}

            {[
              {
                label: 'Lots Listed / Sold',
                value: `${stats.soldLots} / ${stats.totalLots}`,
                icon: <HomeWork />,
                color: '#4a7c59',
                bgGradient: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                sub: stats.soldDifference !== 0
                  ? `${stats.soldDifference >= 0 ? '+' : ''}${stats.soldDifference} this month` +
                    (stats.soldPercentageChange !== 0 && stats.soldPercentageChange !== 100
                      ? ` (${stats.soldPercentageChange >= 0 ? '+' : ''}${stats.soldPercentageChange}%)`
                      : '')
                  : 'No change this month',
                subColor: stats.soldDifference !== 0
                  ? (stats.soldDifference >= 0 ? 'success.main' : 'error.main')
                  : 'text.secondary'
              },
              {
                label: 'Monthly Revenue',
                value: `$${(stats.currentMonthRevenue / 1000000).toFixed(1)}M`,
                icon: <AttachMoney />,
                color: '#f59e0b',
                bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #ffe082 100%)',
                sub: stats.revenuePercentageChange !== 0
                  ? `${stats.revenuePercentageChange >= 0 ? '+' : ''}${stats.revenuePercentageChange}% vs last month`
                  : 'No change vs last month',
                subColor: stats.revenuePercentageChange !== 0
                  ? (stats.revenuePercentageChange >= 0 ? 'success.main' : 'error.main')
                  : 'text.secondary'
              },
              {
                label: 'Lots on Hold',
                value: stats.holdLots,
                icon: <Inbox />,
                color: '#2196f3',
                bgGradient: 'linear-gradient(135deg, #2196f3 0%, #90caf9 100%)',
                sub: stats.totalLots > 0
                  ? `${((stats.holdLots / stats.totalLots) * 100).toFixed(1)}% of total inventory`
                  : '0% of total inventory',
                subColor: 'primary.main'
              },
              {
                label: 'Occupancy Rate',
                value: `${stats.occupancyRate}%`,
                icon: <TrendingUp />,
                color: stats.occupancyRate >= 50 ? '#43a047' : '#0288d1',
                bgGradient: stats.occupancyRate >= 50
                  ? 'linear-gradient(135deg, #43a047 0%, #a5d6a7 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #b3e5fc 100%)',
                sub: `${stats.soldLots} of ${stats.totalLots} sold`,
                subColor: 'text.secondary'
              }
            ].map((stat, idx) => (
              <Grid item xs={6} sm={6} md={3} key={stat.label}>
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: idx * 0.1,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100,
                  }}
                  whileHover={{
                    y: -8,
                    transition: { duration: 0.2 },
                  }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: { xs: 3, md: 4 },
                      border: "1px solid rgba(0, 0, 0, 0.06)",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      overflow: "hidden",
                      "&:hover": {
                        boxShadow: `0 16px 48px ${stat.color}30`,
                        borderColor: stat.color,
                        transform: "translateY(-4px)",
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: { xs: 3, md: 4 },
                        background: stat.bgGradient,
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        justifyContent="space-between"
                        mb={{ xs: 1.5, md: 2 }}
                        flexDirection={{ xs: "column", sm: "row" }}
                        gap={{ xs: 1, sm: 0 }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#6c757d",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            fontSize: { xs: "0.65rem", sm: "0.7rem" },
                          }}
                        >
                          {stat.label}
                        </Typography>
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Box
                            sx={{
                              width: { xs: 36, sm: 42, md: 48 },
                              height: { xs: 36, sm: 42, md: 48 },
                              borderRadius: { xs: 2, md: 3 },
                              background: `${stat.color}15`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: stat.color,
                            }}
                          >
                            {React.cloneElement(stat.icon, {
                              sx: {
                                fontSize: { xs: 18, sm: 20, md: 24 },
                              },
                            })}
                          </Box>
                        </motion.div>
                      </Box>
                      <Typography
                        variant="h4"
                        fontWeight="800"
                        sx={{
                          color: stat.color,
                          mb: 0.5,
                          letterSpacing: "-0.5px",
                          fontSize: {
                            xs: "1.25rem",
                            sm: "1.5rem",
                            md: "2rem",
                          },
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <TrendingUp
                          sx={{
                            fontSize: { xs: 12, sm: 14 },
                            color: stat.subColor,
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: stat.subColor,
                            fontWeight: 600,
                            fontSize: { xs: "0.65rem", sm: "0.75rem" },
                          }}
                        >
                          {stat.sub}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          {/* Map Section */}
<Grid item xs={12} md={8}>
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3, duration: 0.6 }}
    whileHover={{ scale: 1.01 }}
  >
    <Paper 
      sx={{ 
        p: 3, // ✅ Reducido de 4 a 3
        height: '100%', 
        borderRadius: 6,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafb 100%)',
        boxShadow: '0 12px 40px rgba(74,124,89,0.08)',
        border: '1px solid rgba(74,124,89,0.08)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3, // ✅ Reducido de 4 a 3
          background: 'linear-gradient(90deg, #4a7c59 0%, #8bc34a 100%)'
        }
      }}
    >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Property Map
                </Typography>
                <Typography 
                  variant="body2" 
                  color="primary" 
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate('/property-selection')}
                >
                  View Full Map
                </Typography>
              </Box>
              <DashboardMap />
            </Paper>
          </motion.div>
          </Grid>
          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              whileHover={{ scale: 1.01 }}
            >
              <Paper 
                sx={{ 
                  p: 3, // ✅ Reducido de 4 a 3
                  height: '100%', 
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafb 100%)',
                  boxShadow: '0 12px 40px rgba(74,124,89,0.08)',
                  border: '1px solid rgba(74,124,89,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3, // ✅ Reducido de 4 a 3
                    background: 'linear-gradient(90deg, #4a7c59 0%, #8bc34a 100%)'
                  }
                }}
              >
                <Box sx={{ mb: 2 }}> {/* ✅ Reducido de 3 a 2 */}
                  <Typography 
                    variant="h6" // ✅ Cambiado de h5 a h6
                    fontWeight="800" 
                    sx={{ 
                      color: '#2c3e50',
                      letterSpacing: '-0.5px',
                      mb: 0.5
                    }}
                  >
                    Quick Actions
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6c757d' }}> {/* ✅ Cambiado de body2 a caption */}
                    Shortcuts to common tasks
                  </Typography>
                </Box>
          
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}> {/* ✅ Reducido de 2 a 1.5 */}
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { type: "spring", stiffness: 400 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        onClick={action.onClick}
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 3, // ✅ Reducido de 4 a 3
                          border: '1px solid transparent', // ✅ Reducido de 1.5px a 1px
                          background: 'white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)', // ✅ Sombra más sutil
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 3, // ✅ Reducido de 4 a 3
                            background: action.color,
                            transform: 'scaleY(0)',
                            transition: 'transform 0.3s ease'
                          },
                          '&:hover': {
                            borderColor: action.color,
                            boxShadow: `0 8px 20px ${action.color}20`, // ✅ Sombra más compacta
                            transform: 'translateY(-2px)',
                            '&::before': {
                              transform: 'scaleY(1)'
                            }
                          }
                        }}
                      >
                        <CardContent sx={{ p: 1.8, '&:last-child': { pb: 1.8 } }}> {/* ✅ Reducido de 2.5 a 1.8 */}
                          <Box display="flex" alignItems="center" gap={1.5}> {/* ✅ Reducido de 2 a 1.5 */}
                            <Box
                              sx={{
                                width: 44, // ✅ Reducido de 56 a 44
                                height: 44, // ✅ Reducido de 56 a 44
                                borderRadius: 2.5, // ✅ Reducido de 3 a 2.5
                                background: `linear-gradient(135deg, ${action.color}15 0%, ${action.color}05 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.4rem', // ✅ Reducido de 1.75rem a 1.4rem
                                position: 'relative',
                                transition: 'all 0.3s',
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  inset: -2,
                                  borderRadius: 2.5,
                                  background: `linear-gradient(135deg, ${action.color}30, transparent)`,
                                  opacity: 0,
                                  transition: 'opacity 0.3s'
                                },
                                '&:hover::after': {
                                  opacity: 1
                                }
                              }}
                            >
                              {action.icon}
                            </Box>
                            <Box flex={1}>
                              <Typography 
                                variant="body2" // ✅ Cambiado de body1 a body2
                                fontWeight={700} 
                                sx={{ 
                                  color: '#2c3e50',
                                  letterSpacing: '-0.3px',
                                  mb: 0.3, // ✅ Reducido de 0.5 a 0.3
                                  fontSize: '0.9rem' // ✅ Tamaño específico
                                }}
                              >
                                {action.label}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6c757d', fontSize: '0.7rem' }}> {/* ✅ Tamaño reducido */}
                                {action.label === 'Add Property' ? 'Create new property' :
                                 action.label === 'Invite User' ? 'Send invitation' :
                                 action.label === 'Analytics' ? 'View reports' :
                                 action.label === 'Models' ? 'Browse designs' :
                                 action.label === 'Club House' ? 'Amenities' :
                                 'Latest updates'}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                width: 28, // ✅ Reducido de 32 a 28
                                height: 28, // ✅ Reducido de 32 a 28
                                borderRadius: '50%',
                                background: `${action.color}10`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: action.color,
                                fontSize: '1rem', // ✅ Reducido de 1.2rem a 1rem
                                fontWeight: 'bold',
                                transition: 'all 0.3s',
                                '&:hover': {
                                  background: action.color,
                                  color: 'white'
                                }
                              }}
                            >
                              ›
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </Box>
              </Paper>
            </motion.div>
          </Grid>
          {/* Recent Payloads */}
<Grid item xs={12} md={8}>
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3, duration: 0.6 }}
    whileHover={{ scale: 1.01 }}
  >
    <Paper 
      sx={{ 
        p: 3, // ✅ Reducido de 4 a 3
        height: '100%', 
        borderRadius: 6,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafb 100%)',
        boxShadow: '0 12px 40px rgba(74,124,89,0.08)',
        border: '1px solid rgba(74,124,89,0.08)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3, // ✅ Reducido de 4 a 3
          background: 'linear-gradient(90deg, #4a7c59 0%, #8bc34a 100%)'
        }
      }}
    >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Payloads
                </Typography>
                <Typography 
                  variant="body2" 
                  color="primary" 
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate('/payloads')}
                >
                  View all
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                {recentPayloads.length > 0 ? (
                  recentPayloads.map((payload) => (
                    <Box
                      key={payload._id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 2,
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: '#f9fafb'
                        }
                      }}
                      onClick={() => navigate('/payloads')}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          {payload.property?.user?.firstName?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="500">
                            {payload.property?.lot?.number ? `Lot ${payload.property.lot.number}` : 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {payload.property?.user?.firstName} {payload.property?.user?.lastName} • {new Date(payload.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body1" fontWeight="600">
                          ${payload.amount?.toLocaleString()}
                        </Typography>
                        <Chip
                          label={getStatusLabel(payload.status)}
                          color={getStatusColor(payload.status)}
                          size="small"
                        />
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box py={4} textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      No recent payloads found
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
            </motion.div>
          </Grid>
        </Grid>
        </motion.div></>
      )}

      {/* Invite User Dialog (styled) */}
      <Dialog
        open={openUserDialog}
        onClose={handleCloseUserDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Inbox sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Invite New User
              </Typography>
              <Typography variant="caption" sx={{ color: '#6c757d' }}>
                The user will receive an SMS with a link to set their password
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            The user will receive an SMS with a link to set their password
          </Alert>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={userFormData.firstName}
                onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&.Mui-focused fieldset': { borderColor: '#4a7c59' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={userFormData.lastName}
                onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&.Mui-focused fieldset': { borderColor: '#4a7c59' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&.Mui-focused fieldset': { borderColor: '#4a7c59' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Phone Number *
                </Typography>
                <PhoneInput
                  country={'us'}
                  value={userFormData.phoneNumber}
                  onChange={(value) => setUserFormData({ ...userFormData, phoneNumber: value })}
                  inputProps={{
                    name: 'phone',
                    required: true
                  }}
                  containerStyle={{ width: '100%' }}
                  inputStyle={{
                    width: '100%',
                    height: '56px',
                    fontSize: '16px',
                    border: '1px solid #c4c4c4',
                    borderRadius: 6
                  }}
                  buttonStyle={{ border: '1px solid #c4c4c4', borderRight: 'none' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Birthday"
                value={userFormData.birthday}
                onChange={(e) => setUserFormData({ ...userFormData, birthday: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&.Mui-focused fieldset': { borderColor: '#4a7c59' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Role"
                value={userFormData.role}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&.Mui-focused fieldset': { borderColor: '#4a7c59' }
                  }
                }}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="superadmin">Super Admin</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCloseUserDialog}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmitUser}
            variant="contained"
            disabled={
              !userFormData.firstName ||
              !userFormData.lastName ||
              !userFormData.email ||
              !userFormData.phoneNumber
            }
            sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
              color: 'white',
              fontWeight: 700,
              textTransform: 'none',
              px: 4,
              py: 1.5,
              boxShadow: '0 8px 20px rgba(74, 124, 89, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3d664a 0%, #7ba843 100%)',
                boxShadow: '0 12px 28px rgba(74, 124, 89, 0.4)'
              },
              '&:disabled': { background: '#ccc' }
            }}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Dashboard