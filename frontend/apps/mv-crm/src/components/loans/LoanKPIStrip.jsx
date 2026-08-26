import { useEffect } from 'react'
import { Box, Typography, Paper } from '@mui/material'
import { 
  TrendingUp, AttachMoney, Schedule, Warning, CheckCircle, 
  Assignment, PauseCircle, EventAvailable, AccountBalance 
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

const KPICard = ({ title, value, subtext, icon: Icon, color }) => (
  <Paper elevation={0} sx={{ 
    p: 2, 
    border: '1px solid #e0e0e0', 
    borderRadius: 0, 
    display: 'flex', 
    alignItems: 'center', 
    gap: 2, 
    minWidth: 180,
    transition: 'all 0.2s ease',
    '&:hover': { borderColor: color, boxShadow: '4px 4px 0px rgba(0,0,0,0.05)' }
  }}>
    <Box sx={{ p: 1, borderRadius: 0, bgcolor: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon sx={{ fontSize: 24 }} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ 
        color: '#706f6f', fontWeight: 700, textTransform: 'uppercase', 
        fontSize: '0.65rem', fontFamily: '"Courier New", monospace', 
        letterSpacing: '1px', display: 'block', 
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
      }}>
        {title}
      </Typography>
      <Typography variant="h6" sx={{ 
        fontWeight: 800, color: '#1a1a1a', lineHeight: 1.2, 
        fontFamily: '"Helvetica Neue", sans-serif', fontSize: '1.5rem' 
      }}>
        {value ?? '—'}
      </Typography>
      {subtext && (
        <Typography variant="caption" sx={{ 
          color: color, fontSize: '0.7rem', 
          fontFamily: '"Courier New", monospace', fontWeight: 600 
        }}>
          {subtext}
        </Typography>
      )}
    </Box>
  </Paper>
)

export default function LoanKPIStrip({ kpis }) {
  const { t } = useTranslation('loans')

  // Debug: ver qué llega del backend
  useEffect(() => {
    console.log('📊 [LoanKPIStrip] Received KPIs prop:', kpis)
  }, [kpis])

  // ✅ Desempaquetar la estructura anidada del backend: { kpis: {...}, byStage: {...} }
  const rawKpis = kpis?.kpis || kpis || {}
  const byStage = kpis?.byStage || {}

  const formatNumber = (num) => (Number(num) || 0).toLocaleString()
  const formatPercent = (num) => `${Number(num) || 0}%`

  // ✅ Mapeo con los NOMBRES EXACTOS del backend
  const data = [
    { 
      title: t('loans.kpis.totalLoans', 'Total Loans'), 
      value: formatNumber(rawKpis.totalLoans), 
      icon: Assignment, 
      color: '#1976d2' 
    },
    { 
      title: t('loans.kpis.activeLoans', 'Active Loans'), 
      value: formatNumber(rawKpis.activeLoans),
      subtext: `Funded 24h: ${formatNumber(rawKpis.fundedLast24h)}`,
      icon: TrendingUp, 
      color: '#4caf50' 
    },
    { 
      title: t('loans.kpis.clearToClose', 'Clear to Close'), 
      value: formatNumber(rawKpis.clearToClose), 
      icon: EventAvailable, 
      color: '#2196f3' 
    },
    { 
      title: t('loans.kpis.closingWithin7Days', 'Closing 7 Days'), 
      value: formatNumber(rawKpis.closingWithin7Days), 
      icon: Schedule, 
      color: '#ff9800' 
    },
    { 
      title: t('loans.kpis.completedLoans', 'Completed'), 
      value: formatNumber(rawKpis.completedLoans), 
      icon: CheckCircle, 
      color: '#004535' 
    },
    { 
      title: t('loans.kpis.averagePercentComplete', 'Avg % Complete'), 
      value: formatPercent(rawKpis.averagePercentComplete),
      subtext: `By stage: ${Object.keys(byStage).length} stages`,
      icon: TrendingUp, 
      color: '#9c27b0' 
    },
    { 
      title: t('loans.kpis.overdueDeadlines', 'Overdue'), 
      value: formatNumber(rawKpis.overdueDeadlines),
      subtext: `Docs: ${formatNumber(rawKpis.requestedDocumentsOverdue)}`,
      icon: Warning, 
      color: Number(rawKpis.overdueDeadlines) > 0 ? '#f44336' : '#757575'
    },
    { 
      title: t('loans.kpis.onHold', 'On Hold'), 
      value: formatNumber(rawKpis.onHold),
      subtext: `Buyer req: ${formatNumber(rawKpis.buyerActionRequired)}`,
      icon: PauseCircle, 
      color: Number(rawKpis.onHold) > 0 ? '#ff9800' : '#757575'
    },
  ]

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: { 
        xs: '1fr', 
        sm: '1fr 1fr', 
        md: 'repeat(3, 1fr)', 
        lg: 'repeat(4, 1fr)' 
      }, 
      gap: 2, 
      mb: 3 
    }}>
      {data.map((kpi, idx) => (
        <KPICard key={idx} {...kpi} />
      ))}
    </Box>
  )
}