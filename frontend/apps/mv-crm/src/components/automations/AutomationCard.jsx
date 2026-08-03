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

const TRIGGERS = {
  lead_stage_changed: { label: 'Cambio de stage', icon: '🔄', color: '#2196f3' },
  payment_overdue: { label: 'Pago vencido', icon: '⚠️', color: '#f44336' },
  appointment_created: { label: 'Cita creada', icon: '📅', color: '#4caf50' },
  inactivity_7days: { label: 'Inactividad 7 días', icon: '⏰', color: '#ff9800' }
}

const ACTIONS = {
  send_sms: { label: 'Enviar SMS', icon: '📱', color: '#9c27b0' },
  create_activity: { label: 'Crear actividad', icon: '📝', color: '#00bcd4' },
  notify_agent: { label: 'Notificar asesor', icon: '🔔', color: '#ff5722' }
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
  const trigger = TRIGGERS[automation.trigger] || { label: automation.trigger, icon: '❓', color: '#757575' }
  const action = ACTIONS[automation.action] || { label: automation.action, icon: '❓', color: '#757575' }

  const formatLastRun = (dateString) => {
    if (!dateString) return 'Nunca'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Hace menos de 1 min'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours} h`
    if (diffDays < 7) return `Hace ${diffDays} días`
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }

  // ✅ CORREGIDO: Manejar projectId como objeto o ID
  const getProjectName = () => {
    if (!automation.condition?.projectId) return null
    
    // Si es un objeto completo
    if (typeof automation.condition.projectId === 'object') {
      return automation.condition.projectId.name
    }
    
    // Si es solo un ID, buscarlo en projects
    const project = projects.find(p => p._id === automation.condition.projectId)
    return project?.name || 'N/A'
  }

  // ✅ NUEVO: Obtener info del template
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

  // ✅ NUEVO: Obtener info del agente asignado
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
        borderRadius: 1,
        bgcolor: '#fff',
        opacity: automation.isActive ? 1 : 0.6,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#ccc',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }
      }}
    >
      <Box display="flex" alignItems="flex-start" gap={2}>
        {/* Toggle */}
        <Box sx={{ mt: 0.5 }}>
          <Tooltip title={automation.isActive ? 'Desactivar' : 'Activar'}>
            <Switch
              checked={automation.isActive}
              onChange={(e) => onToggle(automation._id, e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#4caf50',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#4caf50',
                },
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
                  icon={<Typography>{trigger.icon}</Typography>}
                  label={trigger.label}
                  size="small"
                  sx={{
                    bgcolor: `${trigger.color}15`,
                    color: trigger.color,
                    border: `1px solid ${trigger.color}30`,
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.65rem',
                    fontWeight: 600
                  }}
                />
                <Typography sx={{ color: '#ccc', fontSize: '0.85rem' }}>→</Typography>
                <Chip
                  icon={<Typography>{action.icon}</Typography>}
                  label={action.label}
                  size="small"
                  sx={{
                    bgcolor: `${action.color}15`,
                    color: action.color,
                    border: `1px solid ${action.color}30`,
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.65rem',
                    fontWeight: 600
                  }}
                />
              </Box>
            </Box>

            {/* Acciones */}
            <Box display="flex" gap={0.5}>
              <Tooltip title="Probar">
                <IconButton
                  size="small"
                  onClick={() => onTest(automation._id)}
                  sx={{
                    color: '#2196f3',
                    '&:hover': { bgcolor: '#e3f2fd' }
                  }}
                >
                  <PlayArrow sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Editar">
                <IconButton
                  size="small"
                  onClick={() => onEdit(automation)}
                  sx={{
                    color: '#000000ff',
                    '&:hover': { color: '#000', bgcolor: '#f5f5f5' }
                  }}
                >
                  <Edit sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton
                  size="small"
                  onClick={() => onDelete(automation._id)}
                  sx={{
                    color: '#f44336',
                    '&:hover': { bgcolor: '#ffebee' }
                  }}
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
                  color: '#000000ff',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  mb: 0.5
                }}
              >
                Condiciones:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {automation.condition.stage && (
                  <Chip
                    label={`Stage: ${automation.condition.stage}`}
                    size="small"
                    sx={{
                      bgcolor: '#f5f5f5',
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.65rem'
                    }}
                  />
                )}
                {projectName && (
                  <Chip
                    label={`Proyecto: ${projectName}`}
                    size="small"
                    sx={{
                      bgcolor: '#f5f5f5',
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.65rem'
                    }}
                  />
                )}
                {automation.condition.daysInactive && (
                  <Chip
                    label={`${automation.condition.daysInactive} días inactivo`}
                    size="small"
                    sx={{
                      bgcolor: '#f5f5f5',
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.65rem'
                    }}
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
                color: '#000000ff',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                mb: 0.5
              }}
            >
              Acción:
            </Typography>
            
            {/* SMS */}
            {automation.action === 'send_sms' && templateInfo && (
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: '#fafafa',
                  border: '1px solid #ececec',
                  borderRadius: 1
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Sms sx={{ fontSize: 16, color: '#9c27b0' }} />
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#9c27b0'
                    }}
                  >
                    Template: {templateInfo.name}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.7rem',
                    color: '#666',
                    fontStyle: 'italic',
                    pl: 2.5
                  }}
                >
                  "{templateInfo.template}"
                </Typography>
              </Paper>
            )}

            {/* Actividad */}
            {automation.action === 'create_activity' && (
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: '#fafafa',
                  border: '1px solid #ececec',
                  borderRadius: 1
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Assignment sx={{ fontSize: 16, color: '#00bcd4' }} />
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#00bcd4'
                    }}
                  >
                    {automation.actionPayload.title}
                  </Typography>
                </Box>
                {automation.actionPayload.description && (
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.7rem',
                      color: '#666',
                      pl: 2.5
                    }}
                  >
                    {automation.actionPayload.description}
                  </Typography>
                )}
                {assignedAgent && (
                  <Box display="flex" alignItems="center" gap={0.5} mt={0.5} pl={2.5}>
                    <Person sx={{ fontSize: 14, color: '#000000ff' }} />
                    <Typography
                      sx={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.65rem',
                        color: '#000000ff'
                      }}
                    >
                      Asignado a: {assignedAgent.firstName} {assignedAgent.lastName}
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}

            {/* Notificación */}
            {automation.action === 'notify_agent' && assignedAgent && (
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: '#fafafa',
                  border: '1px solid #ececec',
                  borderRadius: 1
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Notifications sx={{ fontSize: 16, color: '#ff5722' }} />
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#ff5722'
                    }}
                  >
                    Notificar a: {assignedAgent.firstName} {assignedAgent.lastName}
                  </Typography>
                </Box>
                {automation.actionPayload.message && (
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.7rem',
                      color: '#666',
                      fontStyle: 'italic',
                      pl: 2.5
                    }}
                  >
                    "{automation.actionPayload.message}"
                  </Typography>
                )}
              </Paper>
            )}
          </Box>

          {/* ✅ NUEVO: Resultado del test con info del cliente */}
          {testResult && (
            <Box mb={1.5}>
              {testResult.matched ? (
                testResult.result?.success ? (
                  <Alert severity="success" sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                    ✅ Ejecutado correctamente
                    {testResult.context?.client && (
                      <Box component="span" sx={{ ml: 1 }}>
                        → {testResult.context.client.firstName} {testResult.context.client.lastName}
                        {testResult.context.client.phoneNumber && ` (${testResult.context.client.phoneNumber})`}
                      </Box>
                    )}
                  </Alert>
                ) : (
                  <Alert severity="warning" sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                    ⚠️ Match encontrado pero error: {testResult.result?.error || 'Error desconocido'}
                    {testResult.context?.client && (
                      <Box component="span" sx={{ ml: 1 }}>
                        → Cliente: {testResult.context.client.firstName} {testResult.context.client.lastName}
                      </Box>
                    )}
                  </Alert>
                )
              ) : (
                <Alert severity="info" sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                  ℹ️ No se encontraron coincidencias
                </Alert>
              )}
            </Box>
          )}

          <Divider sx={{ my: 1.5 }} />

          {/* Footer: Creado por + Última ejecución */}
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            {automation.createdBy && (
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: '#e0e0e0',
                    color: '#666',
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}
                >
                  {automation.createdBy.firstName?.[0]}{automation.createdBy.lastName?.[0]}
                </Avatar>
                <Typography
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.65rem',
                    color: '#000000ff'
                  }}
                >
                  Creado por: {automation.createdBy.firstName} {automation.createdBy.lastName}
                </Typography>
              </Box>
            )}

            <Box display="flex" gap={2} alignItems="center">
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.65rem',
                  color: '#000000ff',
                  letterSpacing: '0.5px'
                }}
              >
                Última ejecución: {formatLastRun(automation.updatedAt)}
              </Typography>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: automation.isActive ? '#4caf50' : '#f44336'
                }}
              />
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.65rem',
                  color: automation.isActive ? '#4caf50' : '#f44336',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}
              >
                {automation.isActive ? 'Activa' : 'Inactiva'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}

export default AutomationCard