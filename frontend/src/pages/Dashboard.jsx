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
  Inbox
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import DashboardMap from '../components/DashboardMap'

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
      console.log('Fetching lots...')
      
      const lotsResponse = await api.get('/lots')
      console.log('Lots response:', lotsResponse.data)
      
      const lots = Array.isArray(lotsResponse.data) ? lotsResponse.data : []

      const totalLots = lots.length
      const availableLots = lots.filter(lot => lot.status === 'available').length
      const holdLots = lots.filter(lot => lot.status === 'pending').length
      const soldLots = lots.filter(lot => lot.status === 'sold').length

      console.log('Lot counts:', { totalLots, availableLots, holdLots, soldLots })

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

      console.log('Final stats:', newStats)
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
      console.log('Recent payloads:', response.data)
      setRecentPayloads(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching recent payloads:', error)
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

// Actualizar handleSubmitUser
const handleSubmitUser = async () => {
  try {
    // Enviar con skipPasswordSetup para activar el flujo de SMS
    await api.post('/auth/register', {
      ...userFormData,
      phoneNumber: `+${userFormData.phoneNumber}`, // Agregar el + al número
      skipPasswordSetup: true // ✅ Esto activa el envío del SMS
    })
    handleCloseUserDialog()
    alert('✅ User invited successfully! They will receive an SMS with setup instructions.')
  } catch (error) {
    console.error('Error inviting user:', error)
    alert(error.response?.data?.message || 'Error inviting user')
  }
}

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
      icon: '📅', 
      label: 'Schedule', 
      color: '#f59e0b',
      onClick: () => navigate('/schedule')
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
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Good Morning, {user?.firstName}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's what's happening at the lake today.
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        
        {/* Lots Listed / Sold */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Lots Listed / Sold
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.soldLots} / {stats.totalLots}
                  </Typography>
                  {stats.soldDifference !== 0 && (
                    <Typography 
                      variant="caption" 
                      color={stats.soldDifference >= 0 ? 'success.main' : 'error.main'}
                    >
                      {stats.soldDifference >= 0 ? '+' : ''}{stats.soldDifference} this month
                      {stats.soldPercentageChange !== 0 && stats.soldPercentageChange !== 100 && (
                        <> ({stats.soldPercentageChange >= 0 ? '+' : ''}{stats.soldPercentageChange}%)</>
                      )}
                    </Typography>
                  )}
                  {stats.soldDifference === 0 && (
                    <Typography variant="caption" color="text.secondary">
                      No change this month
                    </Typography>
                  )}
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <HomeWork />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Monthly Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${(stats.currentMonthRevenue / 1000000).toFixed(1)}M
                  </Typography>
                  {stats.revenuePercentageChange !== 0 && (
                    <Typography 
                      variant="caption" 
                      color={stats.revenuePercentageChange >= 0 ? 'success.main' : 'error.main'}
                    >
                      {stats.revenuePercentageChange >= 0 ? '+' : ''}{stats.revenuePercentageChange}% vs last month
                    </Typography>
                  )}
                  {stats.revenuePercentageChange === 0 && (
                    <Typography variant="caption" color="text.secondary">
                      No change vs last month
                    </Typography>
                  )}
                </Box>
                <Avatar sx={{ bgcolor: '#f59e0b', width: 56, height: 56 }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lots on Hold */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Lots on Hold
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.holdLots}
                  </Typography>
                  <Typography variant="caption" color="primary.main">
                    {stats.totalLots > 0 
                      ? `${((stats.holdLots / stats.totalLots) * 100).toFixed(1)}% of total inventory`
                      : '0% of total inventory'
                    }
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#2196f3', width: 56, height: 56 }}>
                  <Inbox />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Occupancy Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Occupancy Rate
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.occupancyRate}%
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                  >
                    {stats.soldLots} of {stats.totalLots} sold
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  bgcolor: stats.occupancyRate >= 50 ? 'success.main' : 'info.main', 
                  width: 56, 
                  height: 56 
                }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

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
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Actions
            </Typography>
            <Box sx={{ mt: 2 }}>
              {quickActions.map((action, index) => (
                <Box
                  key={index}
                  onClick={action.onClick}
                  className="cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                  sx={{ 
                    p: 2, 
                    mb: 1, 
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: '#f9fafb',
                      transform: 'translateY(-2px)',
                      boxShadow: 1
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '8px',
                      bgcolor: action.color + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography variant="body1">{action.label}</Typography>
                </Box>
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