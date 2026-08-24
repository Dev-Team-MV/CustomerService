import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, Avatar, Chip, Divider, LinearProgress, CircularProgress, Paper, Tooltip
} from '@mui/material'
import { Close, TrendingUp, People, Assignment, CheckCircle, Email, Phone, CalendarMonth, Flag, Warning } from '@mui/icons-material'
import crmAgentsService from '../../services/crmAgentsService'
import { LEAD_STAGES, STAGE_COLORS } from '../../services/leadService'

const ProgressChart = ({ targets, t }) => {
  const metrics = useMemo(() => {
    if (!targets?.targets) return []
    const metricKeys = ['leads', 'conversions', 'appointments', 'smsCount']
    return metricKeys.map(key => {
      const target = targets.targets[key] || 0
      const progress = targets.progress?.[key] || 0
      const completion = targets.completion?.[key] || 0
      return { key, label: t(`metrics.progress.metrics.${key}`, key), target, progress, completion, percent: target > 0 ? (progress / target) * 100 : 0 }
    }).filter(m => m.target > 0)
  }, [targets, t])

  const getBarColor = (percent) => {
    if (percent >= 100) return '#4caf50'
    if (percent >= 80) return '#2196f3'
    if (percent >= 50) return '#ff9800'
    return '#f44336'
  }

  const getStatus = (percent) => {
    if (percent >= 100) return { color: '#4caf50', label: t('metrics.progress.exceeded') }
    if (percent >= 80) return { color: '#2196f3', label: `${percent.toFixed(0)}%` }
    if (percent >= 50) return { color: '#ff9800', label: `${percent.toFixed(0)}%` }
    return { color: '#f44336', label: `${percent.toFixed(0)}%` }
  }

  if (metrics.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 3, bgcolor: '#fafafa', border: '1px dashed #ccc', borderRadius: 1, textAlign: 'center' }}>
        <Flag sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: '#888' }}>{t('metrics.progress.noTargets')}</Typography>
        <Typography variant="caption" sx={{ color: '#aaa', display: 'block', mt: 0.5 }}>{t('metrics.progress.setTargetsHint')}</Typography>
      </Paper>
    )
  }

  const maxValue = Math.max(...metrics.map(m => Math.max(m.target, m.progress)), 1)

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <TrendingUp sx={{ fontSize: 20, color: '#1976d2' }} />
        <Box>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700 }}>{t('metrics.progress.title')}</Typography>
          <Typography variant="caption" color="text.secondary">{t('metrics.progress.subtitle')}</Typography>
        </Box>
      </Box>

      <Box sx={{ p: 2, bgcolor: '#fafafa', border: '1px solid #e0e0e0', borderRadius: 1 }}>
        {metrics.map((metric) => {
          const barColor = getBarColor(metric.percent)
          const status = getStatus(metric.percent)
          const progressWidth = (metric.progress / maxValue) * 100
          const targetWidth = (metric.target / maxValue) * 100
          
          return (
            <Box key={metric.key} sx={{ mb: 2.5, '&:last-child': { mb: 0 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Flag sx={{ fontSize: 14, color: barColor }} />
                  <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#000' }}>{metric.label}</Typography>
                </Box>
                <Chip label={status.label} size="small" sx={{ bgcolor: `${status.color}15`, color: status.color, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
              </Box>

              <Box sx={{ position: 'relative', height: 24, mb: 0.5 }}>
                <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${targetWidth}%`, bgcolor: '#e0e0e0', borderRadius: 1, border: '1px dashed #bdbdbd' }} />
                <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${Math.min(progressWidth, 100)}%`, bgcolor: barColor, borderRadius: 1, transition: 'width 0.5s ease', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 1, overflow: 'hidden' }}>
                  {progressWidth > 15 && (
                    <Typography sx={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700, fontFamily: '"Courier New", monospace' }}>{metric.progress}</Typography>
                  )}
                </Box>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#666' }}>{t('metrics.progress.completed')}: <strong>{metric.progress}</strong></Typography>
                <Typography variant="caption" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#888' }}>{t('metrics.progress.ofTarget', { target: metric.target })}</Typography>
              </Box>
            </Box>
          )
        })}
      </Box>

      <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 1, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { color: '#f44336', label: t('metrics.progress.legend.behind') },
          { color: '#ff9800', label: t('metrics.progress.legend.progress') },
          { color: '#2196f3', label: t('metrics.progress.legend.good') },
          { color: '#4caf50', label: t('metrics.progress.legend.exceeded') }
        ].map(item => (
          <Box key={item.color} display="flex" alignItems="center" gap={0.5}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#666' }}>{item.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

const AgentMetricsModal = ({ open, onClose, agent }) => {
  const { t } = useTranslation('agents')
  const [metrics, setMetrics] = useState(null)
  const [targets, setTargets] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open && agent?._id) loadMetrics()
  }, [open, agent])

  const loadMetrics = async () => {
    setLoading(true)
    setError(null)
    try {
      const [metricsData, targetsData] = await Promise.all([
        crmAgentsService.getMetrics(agent._id),
        crmAgentsService.getTargets(agent._id)
      ])
      setMetrics(metricsData)
      setTargets(targetsData)
    } catch (err) {
      setError(err.response?.data?.message || t('metrics.errorLoading'))
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const getConversionRate = () => {
    if (!metrics?.leads?.total) return 0
    return ((metrics.leads.converted / metrics.leads.total) * 100).toFixed(1)
  }

  const getMaxByStage = () => {
    if (!metrics?.leads?.byStage) return 1
    const values = Object.values(metrics.leads.byStage)
    return Math.max(...values, 1)
  }

  return (
    // ✅ ID 1: Contenedor del Modal
    <Dialog id="agent-metrics-modal" open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec', minHeight: '70vh' } }}>
      <DialogTitle sx={{ borderBottom: '1px solid #ececec', display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          {agent && (
            <>
              <Avatar sx={{ width: 48, height: 48, bgcolor: agent.role === 'superadmin' ? '#FF7043' : '#000', fontSize: '1rem', fontWeight: 700, fontFamily: '"Courier New", monospace' }}>
                {agent.firstName?.charAt(0)}{agent.lastName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '1.1rem', fontWeight: 700, color: '#000' }}>{agent.firstName} {agent.lastName}</Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.3}>
                  <Chip label={agent.role === 'superadmin' ? t('metrics.role.superadmin') : t('metrics.role.admin')} size="small" sx={{ bgcolor: agent.role === 'superadmin' ? 'rgba(255,112,67,0.08)' : 'rgba(85,85,85,0.08)', color: agent.role === 'superadmin' ? '#FF7043' : '#555', border: `1px solid ${agent.role === 'superadmin' ? 'rgba(255,112,67,0.3)' : 'rgba(85,85,85,0.3)'}`, fontFamily: '"Courier New", monospace', fontSize: '0.65rem', fontWeight: 600, height: 20 }} />
                  {metrics?.period && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <CalendarMonth sx={{ fontSize: 12, color: '#888' }} />
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#888', letterSpacing: '0.5px' }}>{formatDate(metrics.period.monthStart)} — {formatDate(metrics.period.monthEnd)}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Box>
        {/* ✅ ID 5: Botón de cerrar */}
        <IconButton id="agent-metrics-close" onClick={onClose} size="small"><Close fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={8}><CircularProgress /></Box>
          ) : error ? (
            <Box sx={{ p: 3, bgcolor: '#ffebee', border: '1px solid #f44336', borderRadius: 1, textAlign: 'center' }}>
              <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.8rem', color: '#d32f2f', letterSpacing: '0.5px' }}>{error}</Typography>
            </Box>
          ) : metrics ? (
            <>
              {/* ✅ ID 2: KPIs */}
              <Box id="agent-metrics-kpis" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2, mb: 3 }}>
                <Box sx={{ p: 2, bgcolor: '#fff3e0', border: '1px solid #ffe0b2', borderRadius: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <TrendingUp sx={{ fontSize: 18, color: '#f57c00' }} />
                    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#f57c00', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>{t('metrics.kpi.totalLeads')}</Typography>
                  </Box>
                  <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '2rem', fontWeight: 700, color: '#000', lineHeight: 1 }}>{metrics.leads?.total || 0}</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CheckCircle sx={{ fontSize: 18, color: '#2e7d32' }} />
                    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#2e7d32', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>{t('metrics.kpi.converted')}</Typography>
                  </Box>
                  <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '2rem', fontWeight: 700, color: '#000', lineHeight: 1 }}>{metrics.leads?.converted || 0}</Typography>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#2e7d32', letterSpacing: '0.5px', mt: 0.5 }}>{t('metrics.kpi.conversionRate', { rate: getConversionRate() })}</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#e3f2fd', border: '1px solid #bbdefb', borderRadius: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Assignment sx={{ fontSize: 18, color: '#1976d2' }} />
                    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#1976d2', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>{t('metrics.kpi.activities')}</Typography>
                  </Box>
                  <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '2rem', fontWeight: 700, color: '#000', lineHeight: 1 }}>{metrics.activitiesCompletedThisMonth || 0}</Typography>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#1976d2', letterSpacing: '0.5px', mt: 0.5 }}>{t('metrics.kpi.completedThisMonth')}</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#f3e5f5', border: '1px solid #e1bee7', borderRadius: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <People sx={{ fontSize: 18, color: '#7b1fa2' }} />
                    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#7b1fa2', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>{t('metrics.kpi.clients')}</Typography>
                  </Box>
                  <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '2rem', fontWeight: 700, color: '#000', lineHeight: 1 }}>{metrics.clientsServed?.thisMonth || 0}</Typography>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#7b1fa2', letterSpacing: '0.5px', mt: 0.5 }}>{t('metrics.kpi.thisMonthOfTotal', { total: metrics.clientsServed?.total || 0 })}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* ✅ ID 3: Progreso vs Metas */}
              <Box id="agent-metrics-progress" mb={3}>
                <ProgressChart targets={targets} t={t} />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* ✅ ID 4: Pipeline */}
              <Box id="agent-metrics-pipeline" mb={3}>
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888', letterSpacing: '1.5px', textTransform: 'uppercase', mb: 2 }}>{t('metrics.pipeline.title')}</Typography>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {LEAD_STAGES.map(stage => {
                    const count = metrics.leads?.byStage?.[stage] || 0
                    const maxCount = getMaxByStage()
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0
                    return (
                      <Box key={stage} display="flex" alignItems="center" gap={2}>
                        <Box sx={{ width: 120, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: STAGE_COLORS[stage], flexShrink: 0 }} />
                          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: '#444', letterSpacing: '0.5px' }}>{t(`leads.stages.${stage}`)}</Typography>
                        </Box>
                        <Box flex={1}>
                          <LinearProgress variant="determinate" value={percentage} sx={{ height: 8, borderRadius: 4, bgcolor: '#f5f5f5', '& .MuiLinearProgress-bar': { bgcolor: STAGE_COLORS[stage], borderRadius: 4 } }} />
                        </Box>
                        <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.9rem', fontWeight: 700, color: '#000', width: 40, textAlign: 'right' }}>{count}</Typography>
                      </Box>
                    )
                  })}
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888', letterSpacing: '1.5px', textTransform: 'uppercase', mb: 2 }}>{t('metrics.contactInfo.title')}</Typography>
                <Box display="flex" gap={3} flexWrap="wrap">
                  {agent?.email && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email sx={{ fontSize: 16, color: '#888' }} />
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.8rem', color: '#444', letterSpacing: '0.5px' }}>{agent.email}</Typography>
                    </Box>
                  )}
                  {agent?.phoneNumber && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone sx={{ fontSize: 16, color: '#888' }} />
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.8rem', color: '#444', letterSpacing: '0.5px' }}>{agent.phoneNumber}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </>
          ) : null}
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default AgentMetricsModal