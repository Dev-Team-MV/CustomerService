import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

import { useState, useEffect } from 'react'
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
    // { 
    //   icon: '📅', 
    //   label: 'Schedule', 
    //   color: '#f59e0b',
    //   onClick: () => navigate('/schedule')
    // },
{ icon: '🏡', label: 'Models', color: '#3b82f6', onClick: () => navigate('/view-models') },
  { icon: '🏛️', label: 'Club House', color: '#10b981', onClick: () => {} },
  { icon: '🆕', label: 'New', color: '#f59e0b', onClick: () => {} }
  ]

  // Quick Actions para user propietario
  const userQuickActions = [
{ icon: '🏡', label: 'Models', color: '#3b82f6', onClick: () => navigate('/view-models') },
    { icon: '🏛️', label: 'Club House', color: '#10b981', onClick: () => {} },
    { icon: '🆕', label: 'New', color: '#f59e0b', onClick: () => {} }
  ]

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: 6,
                border: '1px solid rgba(74, 124, 89, 0.08)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '40%',
                  height: '100%',
                  opacity: 0.03,
                  backgroundImage: 'radial-gradient(circle, #4a7c59 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              />
              <Box display="flex" alignItems="center" gap={3} mb={2} position="relative" zIndex={1}>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Box
                    sx={{
                      width: 90,
                      height: 90,
                      borderRadius: 4,
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
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                        opacity: 0.3,
                        filter: 'blur(10px)'
                      }
                    }}
                  >
                    <HomeWork sx={{ fontSize: 45, color: 'white' }} />
                  </Box>
                </motion.div>
                <Box>
                  <Typography 
                    variant="h3" 
                    fontWeight="800" 
                    sx={{ 
                      color: '#2c3e50',
                      letterSpacing: '-1px',
                      mb: 0.5
                    }}
                  >
                    Welcome, {user?.firstName}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" sx={{ color: '#6c757d', fontWeight: 400 }}>
                      Your Dashboard
                    </Typography>
                    <Chip
                      label={user?.firstName || 'User'}
                      sx={{
                        background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        height: 32
                      }}
                      icon={<Star sx={{ color: 'white !important' }} />}
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
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Paper sx={{ p: 1, borderRadius: 5, boxShadow: '0 8px 24px rgba(74,124,89,0.08)' }}>
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
              {/* QUICK ACTIONS */}
              <Grid item xs={12} md={4}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Paper sx={{ p: 3, height: '100%', borderRadius: 5, boxShadow: '0 8px 24px rgba(74,124,89,0.08)' }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Quick Actions
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {userQuickActions.map((action, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.045, boxShadow: "0 8px 32px rgba(74,124,89,0.18)" }}
                          transition={{ type: "spring", stiffness: 300 }}
                          style={{ borderRadius: 18, marginBottom: 18 }}
                        >
                          <Box
                            onClick={action.onClick}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              cursor: 'pointer',
                              borderRadius: 3,
                              p: 1.5,
                              mb: 1.5,
                              background: 'linear-gradient(135deg, #f8fafc 0%, #e8f5e9 100%)',
                              boxShadow: '0 2px 12px rgba(74,124,89,0.07)',
                              border: '1.5px solid #e0e7ef',
                              transition: 'all 0.2s cubic-bezier(.4,2,.3,1)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #e8f5e9 0%, #f8fafc 100%)',
                                boxShadow: '0 8px 32px rgba(74,124,89,0.18)',
                                borderColor: '#b2dfdb'
                              }
                            }}
                          >
                            <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${action.color} 0%, #e0f2f1 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          color: '#fff',
                          boxShadow: '0 4px 16px rgba(74,124,89,0.10)'
                        }}
                            >
                              {action.icon}
                            </Box>
                            <Typography variant="body1" fontWeight={700} sx={{ color: '#2c3e50', letterSpacing: '-0.5px' }}>
                              {action.label}
                            </Typography>
                          </Box>
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
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.08, duration: 0.5, type: "spring" }}
                whileHover={{ y: -8, boxShadow: `0 16px 48px ${stat.color}30`, scale: 1.03 }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    border: '1.5px solid rgba(0, 0, 0, 0.06)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#fff',
                    '&:hover': {
                      borderColor: stat.color,
                      boxShadow: `0 16px 48px ${stat.color}30`
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 5,
                      background: stat.bgGradient
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography color="text.secondary" variant="body2" fontWeight={600}>
                          {stat.label}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" color={stat.subColor}>
                          {stat.sub}
                        </Typography>
                      </Box>
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.7, type: "spring" }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: stat.color,
                            width: 56,
                            height: 56,
                            boxShadow: `0 4px 16px ${stat.color}40`,
                            border: '3px solid #fff'
                          }}
                        >
                          {stat.icon}
                        </Avatar>
                      </motion.div>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
          {/* Map Section */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 1 }}>
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
          </Grid>
          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 5, boxShadow: '0 8px 24px rgba(74,124,89,0.08)' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Quick Actions
              </Typography>
              <Box sx={{ mt: 2 }}>
                {quickActions.map((action, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.045, boxShadow: "0 8px 32px rgba(74,124,89,0.18)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                    style={{ borderRadius: 18, marginBottom: 18 }}
                  >
                    <Box
                      onClick={action.onClick}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        cursor: 'pointer',
                        borderRadius: 3,
                        p: 1.5,
                        mb: 1.5,
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e8f5e9 100%)',
                        boxShadow: '0 2px 12px rgba(74,124,89,0.07)',
                        border: '1.5px solid #e0e7ef',
                        transition: 'all 0.2s cubic-bezier(.4,2,.3,1)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #e8f5e9 0%, #f8fafc 100%)',
                          boxShadow: '0 8px 32px rgba(74,124,89,0.18)',
                          borderColor: '#b2dfdb'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${action.color} 0%, #e0f2f1 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          color: '#fff',
                          boxShadow: '0 4px 16px rgba(74,124,89,0.10)'
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Typography variant="body1" fontWeight={700} sx={{ color: '#2c3e50', letterSpacing: '-0.5px' }}>
                        {action.label}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </Paper>
          </Grid>
          {/* Recent Payloads */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
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
          </Grid>
          {/* Recent Activity */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Recent Activity
              </Typography>
              <Box sx={{ mt: 2 }}>
                {[
                  { text: 'New showing booked', detail: '104 Lakeview Dr', time: '2 mins ago', color: 'success.main' },
                  { text: 'Maintenance request', detail: 'Clubhouse HVAC', time: '1 hour ago', color: 'warning.main' },
                  { text: 'New document uploaded', detail: 'Lease agreement #442', time: '3 hours ago', color: 'info.main' }
                ].map((activity, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: activity.color
                        }}
                      />
                      <Typography variant="body2" fontWeight="500">
                        {activity.text}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                      {activity.detail} • {activity.time}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Typography 
                variant="body2" 
                color="primary" 
                sx={{ cursor: 'pointer', mt: 2, textAlign: 'center' }}
              >
                VIEW FULL HISTORY
              </Typography>
            </Paper>
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