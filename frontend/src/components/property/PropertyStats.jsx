import { Box, Paper, Typography, LinearProgress } from '@mui/material'
import { useProperty } from '../../context/PropertyContext'
import { Home, ShoppingCart, CheckCircle } from '@mui/icons-material'

const PropertyStats = () => {
  const { lots } = useProperty()

  // Calculate lot counts from the lots array
  const getLotCounts = () => {
    const available = lots.filter(lot => lot.status === 'available').length
    const pending = lots.filter(lot => lot.status === 'pending').length
    const sold = lots.filter(lot => lot.status === 'sold').length
    const total = lots.length

    return { available, pending, sold, total }
  }

  const stats = getLotCounts()

  const getPercentage = (count) => {
    return stats.total > 0 ? (count / stats.total) * 100 : 0
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        bgcolor: '#fff',
        borderRadius: 2,
        border: '1px solid #e0e0e0'
      }}
    >
      <Typography 
        variant="subtitle2" 
        sx={{ 
          fontWeight: 'bold', 
          color: '#333', 
          mb: 3,
          letterSpacing: 0.5 
        }}
      >
        LOT AVAILABILITY STATS
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Available */}
        <StatItem
          icon={<Home sx={{ color: '#4caf50' }} />}
          label="Available"
          count={stats.available}
          total={stats.total}
          color="#4caf50"
          percentage={getPercentage(stats.available)}
        />

        {/* Pending/Hold */}
        <StatItem
          icon={<ShoppingCart sx={{ color: '#2196f3' }} />}
          label="Hold"
          count={stats.pending}
          total={stats.total}
          color="#2196f3"
          percentage={getPercentage(stats.pending)}
        />

        {/* Sold */}
        <StatItem
          icon={<CheckCircle sx={{ color: '#f44336' }} />}
          label="Sold"
          count={stats.sold}
          total={stats.total}
          color="#f44336"
          percentage={getPercentage(stats.sold)}
        />
      </Box>

      {/* Summary */}
      <Box 
        sx={{ 
          mt: 3, 
          pt: 3, 
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center' 
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          {stats.total}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Total Lots in Phase II
        </Typography>
      </Box>
    </Paper>
  )
}

const StatItem = ({ icon, label, count, total, color, percentage }) => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
      {icon}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color }}>
            {count} / {total}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: '#f0f0f0',
            '& .MuiLinearProgress-bar': {
              bgcolor: color,
              borderRadius: 4
            }
          }}
        />
      </Box>
    </Box>
    <Typography 
      variant="caption" 
      sx={{ 
        ml: 5, 
        color: 'text.secondary',
        display: 'block' 
      }}
    >
      {percentage.toFixed(1)}% of total inventory
    </Typography>
  </Box>
)

export default PropertyStats