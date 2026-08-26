import { useNavigate } from 'react-router-dom'
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material'
import { Error, Warning, Info, AccessTime, Event, Description, Assignment, CheckCircle } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

// Mapeo de tipo de alerta a severidad visual
const ALERT_TYPE_CONFIG = {
  missingDocuments: { severity: 'high', icon: <Description sx={{ fontSize: 20 }} />, color: '#f44336' },
  deadlineOverdue: { severity: 'high', icon: <Error sx={{ fontSize: 20 }} />, color: '#f44336' },
  deadlineApproaching: { severity: 'medium', icon: <AccessTime sx={{ fontSize: 20 }} />, color: '#ff9800' },
  staleStage: { severity: 'medium', icon: <Warning sx={{ fontSize: 20 }} />, color: '#ff9800' },
  conditionsOutstanding: { severity: 'medium', icon: <Assignment sx={{ fontSize: 20 }} />, color: '#ff9800' },
  closingApproaching: { severity: 'medium', icon: <Event sx={{ fontSize: 20 }} />, color: '#ff9800' },
  appraisalPending: { severity: 'low', icon: <Info sx={{ fontSize: 20 }} />, color: '#2196f3' },
  clearToClose: { severity: 'low', icon: <CheckCircle sx={{ fontSize: 20 }} />, color: '#4caf50' },
  loanFunded: { severity: 'low', icon: <CheckCircle sx={{ fontSize: 20 }} />, color: '#4caf50' },
  default: { severity: 'default', icon: <Info sx={{ fontSize: 20 }} />, color: '#706f6f' }
}

export default function LoanAlertsPanel({ alerts }) {
  const { t } = useTranslation('loans')
  const navigate = useNavigate()

  // ✅ Manejar estructura anidada { alerts: [...] } o array plano
  const alertsData = alerts && typeof alerts === 'object' && !Array.isArray(alerts) 
    ? alerts 
    : { alerts: Array.isArray(alerts) ? alerts : [] }

  const alertsList = Array.isArray(alertsData.alerts) ? alertsData.alerts : []
  const counts = alertsData.counts || {}

  if (alertsList.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 0, bgcolor: '#fafafa' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          ⚠️ {t('loans.alerts.title')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', py: 1 }}>
          {t('loans.alerts.noAlerts')}
        </Typography>
      </Paper>
    )
  }

  const handleAlertClick = (loanId) => {
    if (loanId) navigate(`/loans/${loanId}`)
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getAlertConfig = (type) => {
    return ALERT_TYPE_CONFIG[type] || ALERT_TYPE_CONFIG.default
  }

  const getTypeLabel = (type) => {
    const typeMap = {
      missingDocuments: t('loans.alerts.types.missingDocuments', 'Missing Documents'),
      deadlineOverdue: t('loans.alerts.types.deadlineOverdue', 'Deadline Overdue'),
      deadlineApproaching: t('loans.alerts.types.deadlineApproaching', 'Deadline Approaching'),
      staleStage: t('loans.alerts.types.staleStage', 'Stale Stage'),
      conditionsOutstanding: t('loans.alerts.types.conditionsOutstanding', 'Conditions Outstanding'),
      closingApproaching: t('loans.alerts.types.closingApproaching', 'Closing Approaching'),
      appraisalPending: t('loans.alerts.types.appraisalPending', 'Appraisal Pending'),
      clearToClose: t('loans.alerts.types.clearToClose', 'Clear to Close'),
      loanFunded: t('loans.alerts.types.loanFunded', 'Loan Funded')
    }
    return typeMap[type] || type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Alert'
  }

  return (
    <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 0, bgcolor: '#fafafa' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a1a', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          ⚠️ {t('loans.alerts.title')} ({counts.total || alertsList.length})
        </Typography>
        
        {/* Resumen rápido de conteos */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {counts.missingDocuments > 0 && (
            <Chip label={`${counts.missingDocuments} ${t('loans.alerts.types.missingDocuments', 'Missing Docs')}`} size="small" sx={{ bgcolor: '#ffebee', color: '#f44336', fontWeight: 600, fontSize: '0.65rem', borderRadius: 0, height: 20 }} />
          )}
          {counts.closingApproaching > 0 && (
            <Chip label={`${counts.closingApproaching} ${t('loans.alerts.types.closingApproaching', 'Closing')}`} size="small" sx={{ bgcolor: '#fff3e0', color: '#ff9800', fontWeight: 600, fontSize: '0.65rem', borderRadius: 0, height: 20 }} />
          )}
          {counts.deadlineOverdue > 0 && (
            <Chip label={`${counts.deadlineOverdue} ${t('loans.alerts.types.deadlineOverdue', 'Overdue')}`} size="small" sx={{ bgcolor: '#ffebee', color: '#f44336', fontWeight: 600, fontSize: '0.65rem', borderRadius: 0, height: 20 }} />
          )}
        </Box>
      </Box>

      <List dense sx={{ p: 0 }}>
        {alertsList.map((alert, index) => {
          const config = getAlertConfig(alert.type)
          const typeLabel = getTypeLabel(alert.type)
          const closingDate = formatDate(alert.estimatedClosingDate)

          return (
            <ListItem 
              key={alert._id || alert.loanId || index} 
              onClick={() => handleAlertClick(alert.loanId)}
              sx={{ 
                bgcolor: '#fff', 
                borderLeft: `4px solid ${config.color}`, 
                borderRadius: 0, 
                mb: 1, 
                py: 1.5, 
                px: 2, 
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)', 
                cursor: 'pointer',
                transition: 'all 0.2s ease', 
                '&:hover': { 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.08)', 
                  transform: 'translateY(-1px)',
                  bgcolor: '#fafafa'
                } 
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: config.color }}>
                {config.icon}
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"Helvetica Neue", sans-serif', color: '#1a1a1a' }}>
                      {alert.description || alert.message}
                    </Typography>
                    {alert.buyerName && (
                      <Chip 
                        label={alert.buyerName} 
                        size="small" 
                        sx={{ 
                          bgcolor: '#f5f5f5', 
                          color: '#1a1a1a', 
                          fontWeight: 500, 
                          fontSize: '0.65rem', 
                          borderRadius: 0, 
                          height: 18,
                          fontFamily: '"Courier New", monospace'
                        }} 
                      />
                    )}
                  </Box>
                } 
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#706f6f', letterSpacing: '0.5px' }}>
                      {alert.pipelineStage?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                    </Typography>
                    {closingDate && (
                      <Typography variant="caption" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: config.color, fontWeight: 600 }}>
                        • {t('loans.alerts.closing', 'Closing')}: {closingDate}
                      </Typography>
                    )}
                    {alert.specialStatus && (
                      <Typography variant="caption" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#f44336' }}>
                        • {alert.specialStatus.replace(/_/g, ' ')}
                      </Typography>
                    )}
                  </Box>
                } 
              />
              <Box sx={{ px: 1, py: 0.5, border: `1px solid ${config.color}`, borderRadius: 0, bgcolor: `${config.color}10`, flexShrink: 0 }}>
                <Typography variant="caption" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', fontWeight: 700, color: config.color, letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {typeLabel}
                </Typography>
              </Box>
            </ListItem>
          )
        })}
      </List>
    </Paper>
  )
}