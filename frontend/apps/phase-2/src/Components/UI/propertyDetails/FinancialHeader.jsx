import { Box, Paper, Typography, Grid } from '@mui/material'
import { AccountBalance, TrendingUp, Schedule } from '@mui/icons-material'

const FinancialHeader = ({ financialSummary, user, t }) => {
  if (!financialSummary) return null

  const stats = [
    {
      label: t('myApartment:totalPaid', 'Total Paid'),
      value: `$${financialSummary.totalPaid?.toLocaleString() ?? '0'}`,
      icon: <AccountBalance sx={{ color: '#8CA551' }} />,
      color: '#8CA551'
    },
    {
      label: t('myApartment:pendingAmount', 'Pending Amount'),
      value: `$${financialSummary.pending?.toLocaleString() ?? '0'}`,
      icon: <Schedule sx={{ color: '#E5863C' }} />,
      color: '#E5863C'
    },
    {
      label: t('myApartment:paymentProgress', 'Payment Progress'),
      value: `${Math.round(financialSummary.progress ?? 0)}%`,
      icon: <TrendingUp sx={{ color: '#333F1F' }} />,
      color: '#333F1F'
    }
  ]

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 4,
        bgcolor: 'white',
        border: '1px solid #e0e0e0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
      }}
    >
      <Grid container spacing={3}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={4} key={idx}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48, height: 48, borderRadius: 3,
                  bgcolor: `${stat.color}22`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#706f6f', fontWeight: 500, fontFamily: '"Poppins", sans-serif' }}>
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: stat.color, fontFamily: '"Poppins", sans-serif' }}>
                  {stat.value}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}

export default FinancialHeader