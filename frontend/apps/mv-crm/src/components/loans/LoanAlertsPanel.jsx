import { useTranslation } from 'react-i18next'
import { Box, Typography, Chip } from '@mui/material'
import {
  Warning, ErrorOutline, AccessTime, Description,
  Gavel, CheckCircle, AccountBalance
} from '@mui/icons-material'
import { motion } from 'framer-motion'

const ALERT_CONFIG = {
  missing_documents: { icon: Description, color: '#f44336' },
  deadline_approaching: { icon: AccessTime, color: '#ff9800' },
  deadline_overdue: { icon: ErrorOutline, color: '#d32f2f' },
  stale_stage: { icon: Warning, color: '#ff5722' },
  appraisal_pending: { icon: Gavel, color: '#e65100' },
  conditions_outstanding: { icon: Warning, color: '#9c27b0' },
  closing_approaching: { icon: AccessTime, color: '#2196f3' },
  clear_to_close: { icon: CheckCircle, color: '#4caf50' },
  loan_funded: { icon: AccountBalance, color: '#00c853' }
}

export default function LoanAlertsPanel({ alerts = [], onAlertClick }) {
  const { t } = useTranslation('loans')
  
  if (!alerts.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box id="loans-alerts-panel"  sx={{ mb: 3, border: '1px solid #e0e0e0', bgcolor: '#fff' }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.65rem',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#000'
            }}
          >
            {t('loans.alerts.title')} ({alerts.length})
          </Typography>
        </Box>
        <Box sx={{ maxHeight: 240, overflow: 'auto' }}>
          {alerts.slice(0, 20).map((alert, i) => {
            const config = ALERT_CONFIG[alert.type] || { icon: Warning, color: '#757575' }
            const Icon = config.icon
            const label = t(`loans.alerts.types.${alert.type}`, alert.type)
            
            return (
              <Box
                key={i}
                onClick={() => onAlertClick?.(alert)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1,
                  borderBottom: '1px solid #f5f5f5',
                  cursor: onAlertClick ? 'pointer' : 'default',
                  '&:hover': { bgcolor: '#fafafa' },
                  transition: 'background-color 0.15s'
                }}
              >
                <Icon sx={{ fontSize: 16, color: config.color }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Helvetica Neue", Arial, sans-serif',
                      fontSize: '0.8rem',
                      color: '#000',
                      fontWeight: 400,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {alert.buyerName}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.62rem',
                      color: '#888',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {alert.description}
                  </Typography>
                </Box>
                <Chip
                  label={label}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.58rem',
                    fontFamily: '"Courier New", monospace',
                    letterSpacing: '0.5px',
                    borderRadius: 0,
                    bgcolor: config.color + '18',
                    color: config.color,
                    border: `1px solid ${config.color}40`
                  }}
                />
              </Box>
            )
          })}
        </Box>
      </Box>
    </motion.div>
  )
}