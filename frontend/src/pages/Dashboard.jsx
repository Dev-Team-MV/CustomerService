import { useState, useEffect } from 'react'
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Avatar,
  Chip
} from '@mui/material'
import {
  HomeWork,
  TrendingUp,
  AttachMoney,
  Inbox
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    propertiesListed: 12,
    propertiesSold: 8,
    monthlyRevenue: 1200000,
    activeInquiries: 24
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === 'admin' || user?.role === 'superadmin') {
          const [propertyStats, lotStats] = await Promise.all([
            api.get('/properties/stats'),
            api.get('/lots/stats')
          ])
          setStats({
            propertiesListed: lotStats.data.total || 142,
            propertiesSold: lotStats.data.sold || 8,
            monthlyRevenue: propertyStats.data.totalRevenue || 1200000,
            activeInquiries: lotStats.data.pending || 24
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [user])

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Good Morning, {user?.firstName}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's what's happening at the lake today.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Properties Listed / Sold
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.propertiesListed} / {stats.propertiesSold}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    +2 this week
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <HomeWork />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Monthly Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${(stats.monthlyRevenue / 1000000).toFixed(1)}M
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    +15% YoY
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#f59e0b', width: 56, height: 56 }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Inquiries
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.activeInquiries}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    +5 New
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#8b5cf6', width: 56, height: 56 }}>
                  <Inbox />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Occupancy Rate
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    88%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Target: 92%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Recent Properties
              </Typography>
              <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                View all
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              {[
                { id: 104, name: 'Lakeview Dr', type: 'Waterfront Estate', status: 'Active', price: '$1,250,000', agent: 'Sarah Jenkins' },
                { id: 22, name: 'Oakwood Ln', type: 'Single Family', status: 'Pending', price: '$850,000', agent: 'Mike Ross' },
                { id: 88, name: 'Pine Ridge', type: 'Condo', status: 'Active', price: '$420,000', agent: 'Sarah Jenkins' }
              ].map((property) => (
                <Box
                  key={property.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 2,
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>L</Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="500">
                        {property.id} {property.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {property.type} • {property.agent}
                      </Typography>
                    </Box>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body1" fontWeight="600">
                      {property.price}
                    </Typography>
                    <Chip
                      label={property.status}
                      color={property.status === 'Active' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Actions
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[
                { icon: '🏠', label: 'Add Property', color: '#3b82f6' },
                { icon: '👥', label: 'Invite User', color: '#10b981' },
                { icon: '📊', label: 'Reports', color: '#8b5cf6' },
                { icon: '📅', label: 'Schedule', color: '#f59e0b' }
              ].map((action, index) => (
                <Box
                  key={index}
                  className="cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                  sx={{ 
                    p: 2, 
                    mb: 1, 
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
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
          
          <Paper sx={{ p: 3, mt: 2 }}>
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
    </Box>
  )
}

export default Dashboard
