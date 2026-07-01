// apps/mv-crm/src/components/payments/PaymentSummaryStrip.jsx
import { Box, Paper, Typography, Chip } from '@mui/material'
import { 
  AttachMoney, 
  PendingActions, 
  Warning, 
  TrendingUp 
} from '@mui/icons-material'

const PaymentSummaryStrip = ({ summary, loading }) => {
  if (loading || !summary) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Cargando resumen...
        </Typography>
      </Box>
    )
  }

  const { global, currentMonth } = summary

  const kpis = [
    {
      title: 'Total Pendiente',
      value: `$${global.totalPending.toLocaleString()}`,
      icon: <PendingActions sx={{ fontSize: 32 }} />,
      color: '#2196f3',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Vencidos',
      value: `$${global.overdueAmount.toLocaleString()}`,
      subtitle: `${global.overdueCount} pagos`,
      icon: <Warning sx={{ fontSize: 32 }} />,
      color: '#f44336',
      bgColor: '#ffebee'
    },
    {
      title: 'Cobrado este mes',
      value: `$${currentMonth.collected.toLocaleString()}`,
      subtitle: `de $${currentMonth.expected.toLocaleString()} esperado`,
      icon: <AttachMoney sx={{ fontSize: 32 }} />,
      color: '#4caf50',
      bgColor: '#e8f5e9'
    },
    {
      title: 'Tasa de cobro',
      value: `${currentMonth.collectionRate}%`,
      subtitle: 'Mes actual',
      icon: <TrendingUp sx={{ fontSize: 32 }} />,
      color: currentMonth.collectionRate >= 70 ? '#4caf50' : currentMonth.collectionRate >= 50 ? '#ff9800' : '#f44336',
      bgColor: currentMonth.collectionRate >= 70 ? '#e8f5e9' : currentMonth.collectionRate >= 50 ? '#fff3e0' : '#ffebee'
    }
  ]

  return (
    <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {kpis.map((kpi, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            flex: '1 1 200px',
            minWidth: 200,
            p: 2.5,
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            transition: 'all 0.2s',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: kpi.bgColor,
              color: kpi.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {kpi.icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {kpi.title}
            </Typography>
            <Typography 
              variant="h5" 
              fontWeight={700} 
              sx={{ 
                color: kpi.color,
                lineHeight: 1.2,
                mt: 0.5
              }}
            >
              {kpi.value}
            </Typography>
            {kpi.subtitle && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: '0.7rem' }}
              >
                {kpi.subtitle}
              </Typography>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  )
}

export default PaymentSummaryStrip