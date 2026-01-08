import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material'
import { TrendingUp, TrendingDown } from '@mui/icons-material'
import api from '../services/api'

const Analytics = () => {
  const [stats, setStats] = useState({
    totalLots: 142,
    soldLots: 8,
    occupancyRate: 88,
    targetRate: 92,
    avgLotPrice: 210000
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [lotStats, propertyStats] = await Promise.all([
        api.get('/lots/stats'),
        api.get('/properties/stats')
      ])
      
      const totalLots = lotStats.data.total || 142
      const soldLots = lotStats.data.sold || 8
      const occupancyRate = totalLots > 0 ? Math.round((soldLots / totalLots) * 100) : 0
      
      setStats({
        totalLots,
        soldLots,
        occupancyRate,
        targetRate: 92,
        avgLotPrice: 210000
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const projectSoldPercentage = (stats.soldLots / stats.totalLots) * 100

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Project statistics and sales progress
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Project Sales Progress
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Total Lots Sold
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {stats.soldLots} / {stats.totalLots}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={projectSoldPercentage}
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {projectSoldPercentage.toFixed(1)}% of project sold
              </Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Occupancy Rate
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {stats.occupancyRate}% / {stats.targetRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(stats.occupancyRate / stats.targetRate) * 100}
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
                color={stats.occupancyRate >= stats.targetRate ? 'success' : 'warning'}
              />
              <Typography variant="caption" color="text.secondary">
                Target: {stats.targetRate}%
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Sales Metrics
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Total Inventory
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalLots}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                      <TrendingUp fontSize="small" />
                      <Typography variant="caption">
                        +4 this month
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Properties Sold
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.soldLots}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                      <TrendingUp fontSize="small" />
                      <Typography variant="caption">
                        +2 this week
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Pending Sales
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      3
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                      <Typography variant="caption">
                        Action Required
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Avg. Lot Price
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      ${(stats.avgLotPrice / 1000).toFixed(0)}k
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                      <TrendingUp fontSize="small" />
                      <Typography variant="caption">
                        +12% YoY
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Property Sales by Model
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {[
                { name: 'The Oakwood', sold: 25, total: 30, percentage: 83 },
                { name: 'The Lakeside', sold: 18, total: 25, percentage: 72 },
                { name: 'The Cabin', sold: 12, total: 20, percentage: 60 },
                { name: 'The Willow', sold: 8, total: 15, percentage: 53 }
              ].map((model) => (
                <Grid item xs={12} sm={6} md={3} key={model.name}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" fontWeight="500">
                        {model.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {model.sold}/{model.total}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={model.percentage}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {model.percentage}% sold
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Analytics
