// apps/mv-crm/src/components/automations/AutomationCard.jsx
import {
  Box,
  Typography,
  Paper,
  Chip,
  Switch,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
  Alert
} from '@mui/material'
import {
  Edit,
  Delete,
  PlayArrow,
  Person,
  Assignment,
  Sms,
  Notifications
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

// Configuración solo con iconos y colores (las etiquetas vienen de i18n)
const TRIGGERS_CONFIG = {
  lead_stage_changed: { icon: '🔄', color: '#2196f3' },
  payment_overdue: { icon: '⚠️', color: '#f44336' },
  appointment_created: { icon: '📅', color: '#4caf50' },
  inactivity_7days: { icon: '⏰', color: '#ff9800' }
}

const ACTIONS_CONFIG = {
  send_sms: { icon: '📱', color: '#9c27b0' },
  create_activity: { icon: '📝', color: '#00bcd4' },
  notify_agent: { icon: '🔔', color: '#ff5722' }
}

const AutomationCard = ({
  automation,
  projects = [],
  agents = [],
  onEdit,
  onDelete,
  onTest,
  onToggle,
  testResult = null
}) => {
  const { t, i18n } = useTranslation('automation')
  
  const triggerConfig = TRIGGERS_CONFIG[automation.trigger] || { icon: '❓', color: '#757575' }
  const actionConfig = ACTIONS_CONFIG[automation.action] || { icon: '❓', color: '#757575' }

  const formatLastRun = (dateString) => {
    if (!dateString) return t('card.never')
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t('card.lessThanOneMin')
    if (diffMins < 60) return t('card.minutesAgo', { count: diffMins })
    if (diffHours < 24) return t('card.hoursAgo', { count: diffHours })
    if (diffDays < 7) return t('card.daysAgo', { count: diffDays })
    return date.toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'short' })
  }

  const getProjectName = () => {
    if (!automation.condition?.projectId) return null
    if (typeof automation.condition.projectId === 'object') {
      return automation.condition.projectId.name
    }
    const project = projects.find(p => p._id === automation.condition.projectId)
    return project?.name || t('card.na')
  }

  const getTemplateInfo = () => {
    if (!automation.actionPayload?.templateId) return null
    if (typeof automation.actionPayload.templateId === 'object') {
      return {
        name: automation.actionPayload.templateId.name,
        template: automation.actionPayload.templateId.template
      }
    }
    return null
  }

  const getAssignedAgent = () => {
    if (!automation.actionPayload?.assignedTo) return null
    if (typeof automation.actionPayload.assignedTo === 'object') {
      return automation.actionPayload.assignedTo
    }
    const agent = agents.find(a => a._id === automation.actionPayload.assignedTo)
    return agent || null
  }

  const projectName = getProjectName()
  const templateInfo = getTemplateInfo()
  const assignedAgent = getAssignedAgent()

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid #ececec',
        borderRadius: 0, // ✅ Estética unificada (bordes afilados)
        bgcolor: '#fff',
        opacity: automation.isActive ? 1 : 0.6,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#000',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.08)'
        }
      }}
    >
      <Box display="flex" alignItems="flex-start" gap={2}>
        {/* Toggle */}
        <Box sx={{ mt: 0.5 }}>
          <Tooltip title={automation.isActive ? t('disable') : t('enable')}>
            <Switch
              checked={automation.isActive}
              onChange={(e) => onToggle(automation._id, e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#4caf50' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#4caf50' },
              }}
            />
          </Tooltip>
        </Box>

        {/* Contenido */}
        <Box flex={1}>
          {/* Header: Nombre + Acciones */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Helvetica Neue", sans-serif',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: '#000',
                  mb: 0.5
                }}
              >
                {automation.name}
              </Typography>
              <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                <Chip
                  icon={<Typography>{triggerConfig.icon}</Typography>}
                  label={t(`triggers.${automation.trigger}`, automation.trigger)}
                  size="small"
                  sx={{
                    bgcolor: `${triggerConfig.color}15`,
                    color: triggerConfig.color,
                    border: `1px solid ${triggerConfig.color}30`,
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    borderRadius: 0
                  }}
                />
                <Typography sx={{ color: '#ccc', fontSize: '0.85rem' }}>→</Typography>
                <Chip
                  icon={<Typography>{actionConfig.icon}</Typography>}
                  label={t(`actions.${automation.action}`, automation.action)}
                  size="small"
                  sx={{
                    bgcolor: `${actionConfig.color}15`,
                    color: actionConfig.color,
                    border: `1px solid ${actionConfig.color}30`,
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    borderRadius: 0
                  }}
                />
              </Box>
            </Box>

            {/* Acciones */}
            <Box display="flex" gap={0.5}>
              <Tooltip title={t('test')}>
                <IconButton
                  size="small"
                  onClick={() => onTest(automation._id)}
                  sx={{ color: '#2196f3', '&:hover': { bgcolor: '#e3f2fd', borderRadius: 0 } }}
                >
                  <PlayArrow sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('edit')}>
                <IconButton
                  size="small"
                  onClick={() => onEdit(automation)}
                  sx={{ color: '#000', '&:hover': { bgcolor: '#f5f5f5', borderRadius: 0 } }}
                >
                  <Edit sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('delete')}>
                <IconButton
                  size="small"
                  onClick={() => onDelete(automation._id)}
                  sx={{ color: '#f44336', '&:hover': { bgcolor: '#ffebee', borderRadius: 0 } }}
                >
                  <Delete sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Condiciones */}
          {automation.condition && Object.values(automation.condition).some(v => v) && (
            <Box mb={1.5}>
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.65rem',
                  color: '#000',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  mb: 0.5
                }}
              >
                {t('card.conditions')}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {automation.condition.stage && (
                  <Chip
                    label={`${t('card.stage')} ${t(`stages.${automation.condition.stage}`, automation.condition.stage)}`}
                    size="small"
                    sx={{ bgcolor: '#f5f5f5', fontFamily: '"Courier New", monospace', fontSize: '0.65rem', borderRadius: 0 }}
                  />
                )}
                {projectName && (
                  <Chip
                    label={`${t('card.project')} ${projectName}`}
                    size="small"
                    sx={{ bgcolor: '#f5f5f5', fontFamily: '"Courier New", monospace', fontSize: '0.65rem', borderRadius: 0 }}
                  />
                )}
                {automation.condition.daysInactive && (
                  <Chip
                    label={t('card.daysInactive', { count: automation.condition.daysInactive })}
                    size="small"
                    sx={{ bgcolor: '#f5f5f5', fontFamily: '"Courier New", monospace', fontSize: '0.65rem', borderRadius: 0 }}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Contexto de la acción */}
          <Box mb={1.5}>
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.65rem',
                color: '#000',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                mb: 0.5
              }}
            >
              {t('card.action')}
            </Typography>
            
            {/* SMS */}
            {automation.action === 'send_sms' && templateInfo && (
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#fafafa', border: '1px solid #ececec', borderRadius: 0 }}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Sms sx={{ fontSize: 16, color: '#9c27b0' }} />
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', fontWeight: 600, color: '#9c27b0' }}>
                    {t('card.template')} {templateInfo.name}
                  </Typography>
                </Box>
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#666', fontStyle: 'italic', pl: 2.5 }}>
                  "{templateInfo.template}"
                </Typography>
              </Paper>
            )}

            {/* Actividad */}
            {automation.action === 'create_activity' && (
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#fafafa', border: '1px solid #ececec', borderRadius: 0 }}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Assignment sx={{ fontSize: 16, color: '#00bcd4' }} />
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', fontWeight: 600, color: '#00bcd4' }}>
                    {automation.actionPayload.title}
                  </Typography>
                </Box>
                {automation.actionPayload.description && (
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#666', pl: 2.5 }}>
                    {automation.actionPayload.description}
                  </Typography>
                )}
                {assignedAgent && (
                  <Box display="flex" alignItems="center" gap={0.5} mt={0.5} pl={2.5}>
                    <Person sx={{ fontSize: 14, color: '#000' }} />
                    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000' }}>
                      {t('card.assignedTo')} {assignedAgent.firstName} {assignedAgent.lastName}
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}

            {/* Notificación */}
            {automation.action === 'notify_agent' && assignedAgent && (
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#fafafa', border: '1px solid #ececec', borderRadius: 0 }}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Notifications sx={{ fontSize: 16, color: '#ff5722' }} />
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', fontWeight: 600, color: '#ff5722' }}>
                    {t('card.notifyTo')} {assignedAgent.firstName} {assignedAgent.lastName}
                  </Typography>
                </Box>
                {automation.actionPayload.message && (
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#666', fontStyle: 'italic', pl: 2.5 }}>
                    "{automation.actionPayload.message}"
                  </Typography>
                )}
              </Paper>
            )}
          </Box>

          {/* Resultado del test */}
          {testResult && (
            <Box mb={1.5}>
              {testResult.matched ? (
                testResult.result?.success ? (
                  <Alert severity="success" sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                    {t('card.testSuccess')}
                    {testResult.context?.client && (
                      <Box component="span" sx={{ ml: 1 }}>
                        → {testResult.context.client.firstName} {testResult.context.client.lastName}
                        {testResult.context.client.phoneNumber && ` (${testResult.context.client.phoneNumber})`}
                      </Box>
                    )}
                  </Alert>
                ) : (
                  <Alert severity="warning" sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                    {t('card.testError')} {testResult.result?.error || t('card.unknownError')}
                    {testResult.context?.client && (
                      <Box component="span" sx={{ ml: 1 }}>
                        → {t('card.client')} {testResult.context.client.firstName} {testResult.context.client.lastName}
                      </Box>
                    )}
                  </Alert>
                )
              ) : (
                <Alert severity="info" sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                  {t('card.noMatches')}
                </Alert>
              )}
            </Box>
          )}

          <Divider sx={{ my: 1.5 }} />

          {/* Footer: Creado por + Última ejecución */}
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            {automation.createdBy && (
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: '#e0e0e0', color: '#666', fontSize: '0.7rem', fontWeight: 600, borderRadius: 0 }}>
                  {automation.createdBy.firstName?.[0]}{automation.createdBy.lastName?.[0]}
                </Avatar>
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000' }}>
                  {t('card.createdBy')} {automation.createdBy.firstName} {automation.createdBy.lastName}
                </Typography>
              </Box>
            )}

            <Box display="flex" gap={2} alignItems="center">
              <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000', letterSpacing: '0.5px' }}>
                {t('card.lastRun')} {formatLastRun(automation.updatedAt)}
              </Typography>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: automation.isActive ? '#4caf50' : '#f44336' }} />
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.65rem',
                  color: automation.isActive ? '#4caf50' : '#f44336',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}
              >
                {automation.isActive ? t('card.active') : t('card.inactive')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}

export default AutomationCard