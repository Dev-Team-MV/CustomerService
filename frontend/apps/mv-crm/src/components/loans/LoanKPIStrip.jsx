import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'

const KPI_CONFIG = [
  { key: 'activeLoans', label: 'Active Loans', color: '#2196f3' },
  { key: 'completedLoans', label: 'Funded / Closed', color: '#4caf50' },
  { key: 'clearToClose', label: 'Clear to Close', color: '#00c853' },
  { key: 'closingWithin7Days', label: 'Closing This Week', color: '#ff9800' },
  { key: 'onHold', label: 'On Hold', color: '#9e9e9e' },
  { key: 'overdueDeadlines', label: 'Overdue Tasks', color: '#f44336' },
  { key: 'requestedDocumentsOverdue', label: 'Missing Docs', color: '#e91e63' },
  { key: 'staleStages', label: 'Stale Loans', color: '#ff5722' },
  { key: 'loanDenied', label: 'Denied', color: '#b71c1c' },
  { key: 'cancelledOrWithdrawn', label: 'Cancelled', color: '#616161' }
]

export default function LoanKPIStrip({ kpis = {} }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
      {KPI_CONFIG.map((item, i) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03, duration: 0.3 }}
        >
          <Box
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 0,
              px: 2,
              py: 1.5,
              minWidth: 120,
              bgcolor: '#fff',
              '&:hover': { boxShadow: '4px 4px 0px rgba(0,0,0,0.08)' },
              transition: 'box-shadow 0.2s'
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Helvetica Neue", Arial, sans-serif',
                fontSize: '1.5rem',
                fontWeight: 300,
                color: item.color,
                lineHeight: 1.2
              }}
            >
              {kpis[item.key] ?? 0}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.6rem',
                color: '#888',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                mt: 0.5
              }}
            >
              {item.label}
            </Typography>
          </Box>
        </motion.div>
      ))}
    </Box>
  )
}
