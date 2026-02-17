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
  ArrowUpward,
  ArrowDownward,
  // ✅ NUEVOS ICONOS PARA QUICK ACTIONS
  Business,
  PersonAdd,
  BarChart,
  Deck,
  Article
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import DashboardMap from '../components/DashboardMap'
import { motion, AnimatePresence } from 'framer-motion'
import StatsCards from '../components/statscard'
import ResidentDialog from '../components/ResidentDialog'

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
      case 'signed': return 'success'
      case 'pending': return 'warning'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'signed': return 'Signed'
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

  // ✅ QUICK ACTIONS PARA ADMIN/SUPERADMIN
const quickActions = [
  { 
    icon: <Business />, 
    label: 'Add Property', 
    color: '#333F1F',
    bgColor: '#e8f5ee',
    onClick: () => navigate('/properties/select')
  },
  { 
    icon: <PersonAdd />, 
    label: 'Invite User', 
    color: '#8CA551',
    bgColor: '#f0f7e8',
    onClick: handleOpenUserDialog
  },
  { 
    icon: <BarChart />, 
    label: 'Analytics', 
    color: '#E5863C',
    bgColor: '#fff5e6',
    onClick: () => navigate('/analytics')
  },
  { 
    icon: <HomeWork />, 
    label: 'Models', 
    color: '#333F1F', 
    bgColor: '#e8f5ee',
    onClick: () => navigate('/view-models') 
  },
  { 
    icon: <Deck />, 
    label: 'Amenities', 
    color: '#8CA551', 
    bgColor: '#f0f7e8',
    onClick: () => navigate('/amenities') 
  },
  { 
    icon: <Article />, 
    label: 'Manage News', 
    color: '#E5863C', 
    bgColor: '#fff5e6',
    onClick: () => navigate('/news')
  }
]

// ✅ QUICK ACTIONS PARA USER
const userQuickActions = [
  { 
    icon: <HomeWork />, 
    label: 'Models', 
    color: '#333F1F', 
    bgColor: '#e8f5ee',
    onClick: () => navigate('/view-models') 
  },
  { 
    icon: <Deck />, 
    label: 'Amenities', 
    color: '#8CA551', 
    bgColor: '#f0f7e8',
    onClick: () => navigate('/amenities') 
  },
  { 
    icon: <Article />, 
    label: 'News Feed', 
    color: '#E5863C', 
    bgColor: '#fff5e6',
    onClick: () => navigate('/explore/news')
  }
]

// ✅ REEMPLAZAR el array de stats por:
const dashboardStats = [
  {
    label: 'Lots Listed / Sold',
    value: `${stats.soldLots} / ${stats.totalLots}`,
    icon: HomeWork,
    color: '#333F1F',
    bgGradient: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)',
    bgColor: '#e8f5ee',
    sub: stats.soldDifference !== 0
      ? `${stats.soldDifference >= 0 ? '+' : ''}${stats.soldDifference} this month` +
        (stats.soldPercentageChange !== 0 && stats.soldPercentageChange !== 100
          ? ` (${stats.soldPercentageChange >= 0 ? '+' : ''}${stats.soldPercentageChange}%)`
          : '')
      : 'No change this month',
    subColor: stats.soldDifference !== 0
      ? (stats.soldDifference >= 0 ? '#8CA551' : '#E5863C')
      : '#706f6f',
    trend: stats.soldDifference >= 0 ? 'up' : 'down'
  },
  {
    label: 'Monthly Revenue',
    value: `$${(stats.currentMonthRevenue / 1000000).toFixed(1)}M`,
    icon: AttachMoney,
    color: '#8CA551',
    bgGradient: 'linear-gradient(135deg, #8CA551 0%, #a8c76f 100%)',
    bgColor: '#f0f7e8',
    sub: stats.revenuePercentageChange !== 0
      ? `${stats.revenuePercentageChange >= 0 ? '+' : ''}${stats.revenuePercentageChange}% vs last month`
      : 'No change vs last month',
    subColor: stats.revenuePercentageChange !== 0
      ? (stats.revenuePercentageChange >= 0 ? '#8CA551' : '#E5863C')
      : '#706f6f',
    trend: stats.revenuePercentageChange >= 0 ? 'up' : 'down'
  },
  {
    label: 'Lots on Hold',
    value: stats.holdLots,
    icon: Inbox,
    color: '#E5863C',
    bgGradient: 'linear-gradient(135deg, #E5863C 0%, #f5a563 100%)',
    bgColor: '#fff5e6',
    sub: stats.totalLots > 0
      ? `${((stats.holdLots / stats.totalLots) * 100).toFixed(1)}% of total inventory`
      : '0% of total inventory',
    subColor: '#706f6f',
    trend: null
  },
  {
    label: 'Occupancy Rate',
    value: `${stats.occupancyRate}%`,
    icon: TrendingUp,
    color: stats.occupancyRate >= 50 ? '#8CA551' : '#706f6f',
    bgGradient: stats.occupancyRate >= 50
      ? 'linear-gradient(135deg, #8CA551 0%, #a8c76f 100%)'
      : 'linear-gradient(135deg, #706f6f 0%, #8a8a8a 100%)',
    bgColor: stats.occupancyRate >= 50 ? '#f0f7e8' : '#f5f5f5',
    sub: `${stats.soldLots} of ${stats.totalLots} sold`,
    subColor: '#706f6f',
    trend: null
  }
];



  // ✅ REEMPLAZAR CON ESTE LOADING STATE SIMPLE
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#333F1F' }} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* ✅ HEADER REDESIGNED - Más sobrio y elegante */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            background: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 12px 40px rgba(51, 63, 31, 0.15)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Patrón decorativo sutil */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              bgcolor: 'rgba(140, 165, 81, 0.1)',
              borderRadius: '50%',
              filter: 'blur(60px)'
            }}
          />

          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={{ xs: 2, sm: 3 }}
            position="relative"
            zIndex={1}
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Box
                sx={{
                  width: { xs: 64, md: 72 },
                  height: { xs: 64, md: 72 },
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <HomeWork 
                  sx={{ 
                    fontSize: { xs: 32, md: 40 }, 
                    color: 'white' 
                  }} 
                />
              </Box>
            </motion.div>

            <Box flex={1}>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: 'white',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  mb: 0.5,
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  fontFamily: '"Poppins", sans-serif',
                  textTransform: 'uppercase'
                }}
              >
                Welcome, {user?.firstName}
              </Typography>
              
              <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.85)', 
                    fontWeight: 400,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  Your Dashboard Overview
                </Typography>
                <Chip
                  label={user?.role || 'User'}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', md: '0.75rem' },
                    height: { xs: 24, md: 26 },
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontFamily: '"Poppins", sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {user?.role === 'user' ? (
        <>
          {/* USER VIEW */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Grid container spacing={3}>
              {/* MAPA */}
              <Grid item xs={12} md={8}>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  whileHover={{ y: -4 }}
                >
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      height: '100%', 
                      borderRadius: 4,
                      bgcolor: 'white',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      border: '1px solid #e5e7eb',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: 'linear-gradient(90deg, #333F1F 0%, #8CA551 100%)'
                      }
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography 
                        variant="h6" 
                        sx={{
                          fontWeight: 700,
                          fontFamily: '"Poppins", sans-serif',
                          color: '#333F1F',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Property Map
                      </Typography>
                    </Box>
                    <DashboardMap />
                  </Paper>
                </motion.div>
              </Grid>
      
              {/* QUICK ACTIONS */}

<Grid item xs={12} md={4}>
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3, duration: 0.6 }}
    whileHover={{ y: -4 }}
  >
    <Paper 
      elevation={0}
      sx={{ 
        p: 3,
        height: '100%', 
        borderRadius: 4,
        bgcolor: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #e5e7eb',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #333F1F 0%, #8CA551 100%)'
        }
      }}
    >
      <Box sx={{ mb: 2.5 }}>
        <Typography 
          variant="h6"
          sx={{ 
            color: '#333F1F',
            fontWeight: 700,
            letterSpacing: '0.5px',
            mb: 0.5,
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          Quick Actions
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif'
          }}
        >
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
              elevation={0}
              sx={{
                cursor: 'pointer',
                borderRadius: 3,
                border: '1px solid transparent',
                bgcolor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  bgcolor: action.color,
                  transform: 'scaleY(0)',
                  transition: 'transform 0.3s'
                },
                '&:hover': {
                  borderColor: action.color,
                  boxShadow: `0 8px 20px ${action.color}20`,
                  '&::before': {
                    transform: 'scaleY(1)'
                  },
                  '& .action-icon-container': {
                    transform: 'scale(1.1) rotate(5deg)',
                    bgcolor: action.color,
                    '& svg': {
                      color: 'white'
                    }
                  },
                  '& .arrow-container': {
                    transform: 'translateX(4px)',
                    bgcolor: action.color,
                    color: 'white'
                  }
                }
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    className="action-icon-container"
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      bgcolor: action.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '& svg': {
                        fontSize: 24,
                        color: action.color,
                        transition: 'all 0.3s'
                      }
                    }}
                  >
                    {action.icon}
                  </Box>

                  <Box flex={1}>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        color: '#333F1F',
                        fontWeight: 600,
                        mb: 0.3,
                        fontSize: '0.9rem',
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    >
                      {action.label}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#706f6f', 
                        fontSize: '0.7rem',
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    >
                      {action.label === 'Models' ? 'Browse designs' :
                       action.label === 'Amenities' ? 'View facilities' :
                       'Latest updates'}
                    </Typography>
                  </Box>

                  <Box
                    className="arrow-container"
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: action.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: action.color,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      transition: 'all 0.3s'
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
          {/* ADMIN VIEW */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Grid container spacing={3}>
              {/* ✅ STATS CARDS REDESIGNED */}
              <Grid item xs={12}>
            <StatsCards stats={dashboardStats} loading={loading} />
          </Grid>

              {/* MAP */}
              <Grid item xs={12} md={8}>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  whileHover={{ y: -4 }}
                >
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      height: '100%', 
                      borderRadius: 4,
                      bgcolor: 'white',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      border: '1px solid #e5e7eb',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: 'linear-gradient(90deg, #333F1F 0%, #8CA551 100%)'
                      }
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography 
                        variant="h6" 
                        sx={{
                          fontWeight: 700,
                          fontFamily: '"Poppins", sans-serif',
                          color: '#333F1F',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Property Map
                      </Typography>
                    </Box>
                    <DashboardMap />
                  </Paper>
                </motion.div>
              </Grid>

              {/* QUICK ACTIONS */}
<Grid item xs={12} md={4}>
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3, duration: 0.6 }}
    whileHover={{ y: -4 }}
  >
    <Paper 
      elevation={0}
      sx={{ 
        p: 3,
        height: '100%', 
        borderRadius: 4,
        bgcolor: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #e5e7eb',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #333F1F 0%, #8CA551 100%)'
        }
      }}
    >
      <Box sx={{ mb: 2.5 }}>
        <Typography 
          variant="h6"
          sx={{ 
            color: '#333F1F',
            fontWeight: 700,
            letterSpacing: '0.5px',
            mb: 0.5,
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          Quick Actions
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          Shortcuts to common tasks
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
              elevation={0}
              sx={{
                cursor: 'pointer',
                borderRadius: 3,
                border: '1px solid transparent',
                bgcolor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  bgcolor: action.color,
                  transform: 'scaleY(0)',
                  transition: 'transform 0.3s'
                },
                '&:hover': {
                  borderColor: action.color,
                  boxShadow: `0 8px 20px ${action.color}20`,
                  '&::before': {
                    transform: 'scaleY(1)'
                  },
                  // ✅ ANIMACIÓN DEL ICONO
                  '& .action-icon-container': {
                    transform: 'scale(1.1) rotate(5deg)',
                    bgcolor: action.color,
                    '& svg': {
                      color: 'white'
                    }
                  },
                  // ✅ ANIMACIÓN DE LA FLECHA
                  '& .arrow-container': {
                    transform: 'translateX(4px)',
                    bgcolor: action.color,
                    color: 'white'
                  }
                }
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  {/* ✅ ICONO MEJORADO */}
                  <Box
                    className="action-icon-container"
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      bgcolor: action.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      '& svg': {
                        fontSize: 24,
                        color: action.color,
                        transition: 'all 0.3s',
                        zIndex: 1
                      }
                    }}
                  >
                    {action.icon}
                  </Box>

                  <Box flex={1}>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        color: '#333F1F',
                        fontWeight: 600,
                        mb: 0.3,
                        fontSize: '0.9rem',
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    >
                      {action.label}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#706f6f', 
                        fontSize: '0.7rem',
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    >
                      {action.label === 'Add Property' ? 'Create new property' :
                       action.label === 'Invite User' ? 'Send invitation' :
                       action.label === 'Analytics' ? 'View reports' :
                       action.label === 'Models' ? 'Browse designs' :
                       action.label === 'Amenities' ? 'View facilities' :
                       'Latest updates'}
                    </Typography>
                  </Box>

                  {/* ✅ FLECHA MEJORADA */}
                  <Box
                    className="arrow-container"
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: action.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: action.color,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      transition: 'all 0.3s'
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

              {/* RECENT PAYLOADS */}
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  whileHover={{ y: -4 }}
                >
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      borderRadius: 4,
                      bgcolor: 'white',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      border: '1px solid #e5e7eb',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: 'linear-gradient(90deg, #333F1F 0%, #8CA551 100%)'
                      }
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Typography 
                        variant="h6" 
                        sx={{
                          fontWeight: 700,
                          fontFamily: '"Poppins", sans-serif',
                          color: '#333F1F',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Recent Payloads
                      </Typography>
                      <Button
                        onClick={() => navigate('/payloads')}
                        sx={{
                          color: '#8CA551',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontFamily: '"Poppins", sans-serif',
                          '&:hover': {
                            bgcolor: 'transparent',
                            color: '#333F1F'
                          }
                        }}
                      >
                        View all
                      </Button>
                    </Box>
                    <Box>
                      {recentPayloads.length > 0 ? (
                        recentPayloads.map((payload) => (
                          <Box
                            key={payload._id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              py: 2.5,
                              borderBottom: '1px solid #f0f0f0',
                              cursor: 'pointer',
                              transition: 'all 0.3s',
                              '&:hover': {
                                bgcolor: '#fafafa',
                                borderRadius: 2,
                                px: 2,
                                mx: -2
                              },
                              '&:last-child': {
                                borderBottom: 'none'
                              }
                            }}
                            onClick={() => navigate('/payloads')}
                          >
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: '#e8f5ee',
                                  color: '#333F1F',
                                  fontWeight: 700,
                                  fontFamily: '"Poppins", sans-serif'
                                }}
                              >
                                {payload.property?.user?.firstName?.charAt(0) || 'U'}
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
                                  {payload.property?.lot?.number ? `Lot ${payload.property.lot.number}` : 'N/A'}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{
                                    color: '#706f6f',
                                    fontFamily: '"Poppins", sans-serif'
                                  }}
                                >
                                  {payload.property?.user?.firstName} {payload.property?.user?.lastName} • {new Date(payload.date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                            <Box textAlign="right">
                              <Typography 
                                variant="body1" 
                                sx={{
                                  fontWeight: 700,
                                  fontFamily: '"Poppins", sans-serif',
                                  color: '#333F1F',
                                  mb: 0.5
                                }}
                              >
                                ${payload.amount?.toLocaleString()}
                              </Typography>
                              <Chip
                                label={getStatusLabel(payload.status)}
                                color={getStatusColor(payload.status)}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  fontFamily: '"Poppins", sans-serif',
                                  fontSize: '0.7rem',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}
                              />
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Box py={6} textAlign="center">
                          <Typography 
                            variant="body2" 
                            sx={{
                              color: '#706f6f',
                              fontFamily: '"Poppins", sans-serif'
                            }}
                          >
                            No recent payloads found
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </>
      )}



<ResidentDialog
  open={openUserDialog}
  onClose={handleCloseUserDialog}
  onSubmit={handleSubmitUser}
  formData={userFormData}
  setFormData={setUserFormData}
  selectedUser={null}
/>
      
    </Box>
  )
}

export default Dashboard