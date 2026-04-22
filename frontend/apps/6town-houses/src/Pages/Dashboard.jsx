import { Box, Typography, Paper, Grid } from '@mui/material'
import { useAuth } from '@shared/context/AuthContext'
import { BRAND } from '../theme'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <Box sx={{ p: 3 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 700, 
          color: BRAND.PRIMARY,
          mb: 3
        }}
      >
        Welcome to 6Town Houses Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              background: BRAND.GRADIENT,
              color: 'white',
              borderRadius: 3
            }}
          >
            <Typography variant="h6" gutterBottom>
              Welcome, {user?.name || 'User'}!
            </Typography>
            <Typography variant="body2">
              Role: {user?.role || 'N/A'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3,
              border: `2px solid ${BRAND.SECONDARY}`,
              borderRadius: 3
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: BRAND.PRIMARY }}>
              Quick Stats
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dashboard content coming soon...
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3,
              bgcolor: BRAND.CARD_BG,
              borderRadius: 3
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: BRAND.PRIMARY }}>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No recent activity
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard