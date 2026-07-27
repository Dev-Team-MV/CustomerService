// apps/mv-crm/src/components/automations/AutomationBuilder.jsx
import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material'
import { Close, AutoAwesome, PlayArrow, Info } from '@mui/icons-material'
import { useMessageTemplates } from '../../constants/hooks/useMessageTemplates'
import VariableInserter from '@shared/components/VariableInserter'

const TRIGGERS = [
  { value: 'lead_stage_changed', label: 'Cambio de stage en lead', icon: '🔄' },
  { value: 'payment_overdue', label: 'Pago vencido', icon: '⚠️' },
  { value: 'appointment_created', label: 'Cita creada', icon: '📅' },
  { value: 'inactivity_7days', label: 'Inactividad de 7 días', icon: '⏰' }
]

const ACTIONS = [
  { value: 'send_sms', label: 'Enviar SMS', icon: '📱' },
  { value: 'create_activity', label: 'Crear actividad', icon: '📝' },
  { value: 'notify_agent', label: 'Notificar asesor', icon: '🔔' }
]

const GLOBAL_VARIABLES = [
  { key: 'firstName', label: 'firstName' },
  { key: 'lastName', label: 'lastName' },
  { key: 'email', label: 'email' },
  { key: 'phoneNumber', label: 'phoneNumber' }
]

const extractId = (value) => {
  if (!value) return ''
  if (typeof value === 'object' && value._id) return value._id
  if (typeof value === 'string') return value
  return ''
}

const AutomationBuilder = ({
  open,
  onClose,
  automation = null,
  onSave,
  onDelete,
  onTest,
  projects = [],
  agents = []
}) => {
  const { t } = useTranslation('automation')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    trigger: 'lead_stage_changed',
    condition: {
      stage: '',
      projectId: '',
      daysInactive: 7
    },
    action: 'send_sms',
    actionPayload: {
      templateId: '',
      message: '',
      assignedTo: '',
      title: '',
      description: ''
    },
    isActive: true
  })

  const isEditing = Boolean(automation?._id)
  const messageRef = useRef(null)

  // Obtener projectId seleccionado
  const selectedProjectId = formData.condition?.projectId || ''
  
  // ✅ Cargar TODOS los templates (sin filtro)
  const { templates: allTemplates, loading: loadingTemplates } = useMessageTemplates()
  
  // ✅ NUEVO: Filtrar templates localmente según el proyecto seleccionado
  const templates = useMemo(() => {
    if (!selectedProjectId) return allTemplates
    
    return allTemplates.filter(template => {
      // Template global (sin proyecto)
      if (!template.projectId) return true
      
      // Template del proyecto específico
      const templateProjectId = extractId(template.projectId)
      return templateProjectId === selectedProjectId
    })
  }, [allTemplates, selectedProjectId])
  
  // Nombre del proyecto seleccionado
  const selectedProjectName = projects.find(p => p._id === selectedProjectId)?.name || ''

  useEffect(() => {
    if (automation) {
      const projectId = extractId(automation.condition?.projectId)
      const templateId = extractId(automation.actionPayload?.templateId)
      const assignedTo = extractId(automation.actionPayload?.assignedTo)
      
      setFormData({
        name: automation.name || '',
        trigger: automation.trigger || 'lead_stage_changed',
        condition: {
          stage: automation.condition?.stage || '',
          projectId: projectId,
          daysInactive: automation.condition?.daysInactive || 7
        },
        action: automation.action || 'send_sms',
        actionPayload: {
          templateId: templateId,
          message: automation.actionPayload?.message || '',
          assignedTo: assignedTo,
          title: automation.actionPayload?.title || '',
          description: automation.actionPayload?.description || ''
        },
        isActive: automation.isActive ?? true
      })
    } else {
      setFormData({
        name: '',
        trigger: 'lead_stage_changed',
        condition: {
          stage: '',
          projectId: '',
          daysInactive: 7
        },
        action: 'send_sms',
        actionPayload: {
          templateId: '',
          message: '',
          assignedTo: '',
          title: '',
          description: ''
        },
        isActive: true
      })
    }
    setError(null)
  }, [automation, open])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleConditionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      condition: { ...prev.condition, [field]: value }
    }))
    
    // Si cambia el proyecto, verificar si el template actual es compatible
    if (field === 'projectId' && value) {
      const currentTemplate = allTemplates.find(t => t._id === formData.actionPayload.templateId)
      if (currentTemplate) {
        const templateProjectId = extractId(currentTemplate.projectId)
        // Si el template es de otro proyecto específico, limpiar selección
        if (templateProjectId && templateProjectId !== value) {
          setFormData(prev => ({
            ...prev,
            actionPayload: { ...prev.actionPayload, templateId: '' }
          }))
        }
      }
    }
  }

  const handleActionPayloadChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      actionPayload: { ...prev.actionPayload, [field]: value }
    }))
  }

  const handleInsertVariableInMessage = (varName) => {
    const textarea = messageRef.current?.querySelector('textarea')
    const currentMessage = formData.actionPayload.message || ''
    
    if (!textarea) {
      handleActionPayloadChange('message', currentMessage + `{{${varName}}}`)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const insertion = `{{${varName}}}`
    
    const newText = currentMessage.substring(0, start) + insertion + currentMessage.substring(end)
    handleActionPayloadChange('message', newText)
    
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + insertion.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const cleanPayload = (data) => {
    const cleaned = { ...data }
    
    if (cleaned.condition) {
      Object.keys(cleaned.condition).forEach(key => {
        if (cleaned.condition[key] === '') {
          cleaned.condition[key] = null
        }
      })
      
      const hasConditions = Object.values(cleaned.condition).some(v => v !== null && v !== undefined)
      if (!hasConditions) {
        cleaned.condition = {}
      }
    }
    
    if (cleaned.actionPayload) {
      const payload = {}
      
      if (cleaned.action === 'send_sms') {
        if (cleaned.actionPayload.templateId) {
          payload.templateId = cleaned.actionPayload.templateId
        }
        if (cleaned.actionPayload.message) {
          payload.message = cleaned.actionPayload.message
        }
      } else if (cleaned.action === 'create_activity') {
        if (cleaned.actionPayload.title) {
          payload.title = cleaned.actionPayload.title
        }
        if (cleaned.actionPayload.description) {
          payload.description = cleaned.actionPayload.description
        }
        if (cleaned.actionPayload.assignedTo) {
          payload.assignedTo = cleaned.actionPayload.assignedTo
        }
      } else if (cleaned.action === 'notify_agent') {
        if (cleaned.actionPayload.assignedTo) {
          payload.assignedTo = cleaned.actionPayload.assignedTo
        }
        if (cleaned.actionPayload.message) {
          payload.message = cleaned.actionPayload.message
        }
      }
      
      cleaned.actionPayload = payload
    }
    
    return cleaned
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      setError('El nombre es obligatorio')
      return
    }
    if (!formData.trigger) {
      setError('El trigger es obligatorio')
      return
    }
    if (!formData.action) {
      setError('La acción es obligatoria')
      return
    }

    if (formData.action === 'send_sms') {
      if (!formData.actionPayload.templateId && !formData.actionPayload.message) {
        setError('Debes seleccionar un template o escribir un mensaje')
        return
      }
    } else if (formData.action === 'create_activity') {
      if (!formData.actionPayload.title) {
        setError('El título de la actividad es obligatorio')
        return
      }
    } else if (formData.action === 'notify_agent') {
      if (!formData.actionPayload.assignedTo) {
        setError('Debes seleccionar un asesor para notificar')
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const cleanedData = cleanPayload(formData)
      console.log('📤 Payload enviado:', JSON.stringify(cleanedData, null, 2))
      
      if (isEditing) {
        await onSave?.(automation._id, cleanedData)
      } else {
        await onSave?.(null, cleanedData)
      }
      
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar esta automatización?')) return

    setLoading(true)
    try {
      await onDelete?.(automation._id)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al eliminar')
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
    setLoading(true)
    try {
      const result = await onTest?.(automation._id, {})
      console.log('🧪 Resultado del test:', result)
      
      if (result.matched) {
        if (result.result?.success) {
          const clientName = result.context?.client 
            ? `${result.context.client.firstName} ${result.context.client.lastName}`
            : result.context?.enrichedPayload?.clientName || 'N/A'
          
          alert(`✅ Test exitoso\n\n✅ Acción ejecutada correctamente\n👤 Cliente: ${clientName}\n📱 Teléfono: ${result.context?.client?.phoneNumber || 'N/A'}`)
        } else {
          const clientName = result.context?.client 
            ? `${result.context.client.firstName} ${result.context.client.lastName}`
            : result.context?.enrichedPayload?.clientName || 'N/A'
          
          let errorMsg = result.result?.error || 'Error desconocido'
          
          if (errorMsg.includes('no phone number')) {
            errorMsg = `El cliente ${clientName} no tiene número de teléfono registrado`
          }
          
          alert(`⚠️ Match encontrado pero error al ejecutar:\n\n❌ ${errorMsg}\n\n👤 Cliente: ${clientName}\n📱 Teléfono: ${result.context?.client?.phoneNumber || 'No registrado'}`)
        }
      } else {
        let message = '⚠️ No se encontraron coincidencias\n\n'
        message += `📋 Trigger: ${automation.trigger}\n`
        
        if (automation.condition?.projectId) {
          const projectName = typeof automation.condition.projectId === 'object' 
            ? automation.condition.projectId.name 
            : 'Proyecto específico'
          message += `📁 Proyecto: ${projectName}\n`
        }
        
        if (result.context?.enrichedPayload) {
          message += `\n🔍 Último dato evaluado:\n`
          message += `   • Proyecto: ${result.context.enrichedPayload.projectName || 'N/A'}\n`
          message += `   • Cliente: ${result.context.enrichedPayload.clientName || 'N/A'}\n`
          message += `   • Status: ${result.context.enrichedPayload.status || 'N/A'}\n`
        }
        
        alert(message)
      }
    } catch (err) {
      console.error('❌ Error en test:', err)
      setError(err.response?.data?.message || err.message || 'Error al probar')
    } finally {
      setLoading(false)
    }
  }

  const detectedVariables = (formData.actionPayload.message?.match(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g) || [])
    .map(m => m.replace(/[{}]/g, '').trim())

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: '1px solid #ececec'
        }
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: '1px solid #ececec',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <AutoAwesome sx={{ fontSize: 20 }} />
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            {isEditing ? t('editTitle') : t('createTitle')}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={loading}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ m: 3, mb: 0, borderRadius: 0 }}>
            {error}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={2.5} sx={{ p: 3 }}>
          <TextField
            label={`${t('form.name')} *`}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem'
              }
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#4caf50',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#4caf50',
                  },
                }}
              />
            }
            label={
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.75rem',
                  color: formData.isActive ? '#4caf50' : '#888'
                }}
              >
                {formData.isActive ? 'Activa' : 'Inactiva'}
              </Typography>
            }
          />

          <Divider />

          <Box>
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem',
                color: '#888',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                mb: 1
              }}
            >
              {t('form.trigger')} *
            </Typography>
            <FormControl size="small" fullWidth required>
              <Select
                value={formData.trigger}
                onChange={(e) => handleChange('trigger', e.target.value)}
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.75rem',
                  borderRadius: 0
                }}
              >
                {TRIGGERS.map(trigger => (
                  <MenuItem key={trigger.value} value={trigger.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography>{trigger.icon}</Typography>
                      {trigger.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem',
                color: '#888',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                mb: 1
              }}
            >
              Condiciones (opcional)
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {formData.trigger === 'lead_stage_changed' && (
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                    Stage específico
                  </InputLabel>
                  <Select
                    value={formData.condition.stage}
                    onChange={(e) => handleConditionChange('stage', e.target.value)}
                    label="Stage específico"
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.75rem',
                      borderRadius: 0
                    }}
                  >
                    <MenuItem value="">Cualquier stage</MenuItem>
                    <MenuItem value="nuevo">Nuevo</MenuItem>
                    <MenuItem value="contactado">Contactado</MenuItem>
                    <MenuItem value="visita_agendada">Visita agendada</MenuItem>
                    <MenuItem value="propuesta">Propuesta</MenuItem>
                    <MenuItem value="vendido">Vendido</MenuItem>
                    <MenuItem value="perdido">Perdido</MenuItem>
                  </Select>
                </FormControl>
              )}

              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                  Proyecto específico
                </InputLabel>
                <Select
                  value={formData.condition.projectId}
                  onChange={(e) => handleConditionChange('projectId', e.target.value)}
                  label="Proyecto específico"
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.75rem',
                    borderRadius: 0
                  }}
                >
                  <MenuItem value="">Cualquier proyecto</MenuItem>
                  {projects.map(project => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {formData.trigger === 'inactivity_7days' && (
                <TextField
                  label="Días de inactividad"
                  type="number"
                  value={formData.condition.daysInactive}
                  onChange={(e) => handleConditionChange('daysInactive', parseInt(e.target.value) || 7)}
                  fullWidth
                  inputProps={{ min: 1 }}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.75rem'
                    }
                  }}
                />
              )}
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem',
                color: '#888',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                mb: 1
              }}
            >
              {t('form.action')} *
            </Typography>
            <FormControl size="small" fullWidth required>
              <Select
                value={formData.action}
                onChange={(e) => handleChange('action', e.target.value)}
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.75rem',
                  borderRadius: 0
                }}
              >
                {ACTIONS.map(action => (
                  <MenuItem key={action.value} value={action.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography>{action.icon}</Typography>
                      {action.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem',
                color: '#888',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                mb: 1
              }}
            >
              Configuración de acción
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {formData.action === 'send_sms' && (
                <>
                  {selectedProjectId && (
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: '#e8f5e9',
                        borderRadius: 1,
                        border: '1px solid #4caf50',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Info sx={{ fontSize: 16, color: '#2e7d32' }} />
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#2e7d32',
                          fontFamily: '"Courier New", monospace',
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}
                      >
                        Automatización vinculada al proyecto: <strong>{selectedProjectName}</strong> — Mostrando plantillas y variables del proyecto
                      </Typography>
                    </Box>
                  )}

                  <FormControl size="small" fullWidth disabled={loadingTemplates}>
                    <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                      Template
                    </InputLabel>
                    <Select
                      value={formData.actionPayload.templateId}
                      onChange={(e) => handleActionPayloadChange('templateId', e.target.value)}
                      label="Template"
                      sx={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem',
                        borderRadius: 0
                      }}
                    >
                      {loadingTemplates ? (
                        <MenuItem value="" disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Cargando plantillas...
                        </MenuItem>
                      ) : templates.length === 0 ? (
                        <MenuItem value="" disabled>
                          {selectedProjectId 
                            ? `No hay plantillas para ${selectedProjectName}`
                            : 'No hay plantillas disponibles'}
                        </MenuItem>
                      ) : (
                        templates.map(template => (
                          <MenuItem key={template._id} value={template._id}>
                            <Box display="flex" alignItems="center" gap={1} width="100%">
                              <Typography sx={{ flex: 1 }}>
                                {template.name}
                              </Typography>
                              {template.projectId ? (
                                <Chip 
                                  label="proyecto" 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: '#e3f2fd', 
                                    color: '#1976d2',
                                    fontSize: '0.6rem',
                                    height: 18
                                  }}
                                />
                              ) : (
                                <Chip 
                                  label="global" 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: '#f5f5f5', 
                                    color: '#666',
                                    fontSize: '0.6rem',
                                    height: 18
                                  }}
                                />
                              )}
                              {template.category && (
                                <Chip 
                                  label={template.category} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ 
                                    fontSize: '0.6rem',
                                    height: 18
                                  }}
                                />
                              )}
                            </Box>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {!selectedProjectId && templates.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        Selecciona un proyecto en las condiciones para filtrar plantillas específicas
                      </Typography>
                    )}
                  </FormControl>

                  <Box ref={messageRef}>
                    <TextField
                      label="Mensaje personalizado"
                      value={formData.actionPayload.message}
                      onChange={(e) => handleActionPayloadChange('message', e.target.value)}
                      fullWidth
                      multiline
                      rows={3}
                      sx={{
                        '& .MuiInputBase-input': {
                          fontFamily: '"Courier New", monospace',
                          fontSize: '0.75rem'
                        }
                      }}
                    />
                  </Box>

                  {selectedProjectId ? (
                    <VariableInserter
                      projectId={selectedProjectId}
                      onInsert={handleInsertVariableInMessage}
                      compact={false}
                      maxHeight={150}
                    />
                  ) : (
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} mb={1}>
                        Variables globales disponibles
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        Selecciona un proyecto en las condiciones para usar variables específicas del proyecto
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {GLOBAL_VARIABLES.map(v => (
                          <Chip
                            key={v.key}
                            label={`{{${v.key}}}`}
                            size="small"
                            onClick={() => handleInsertVariableInMessage(v.key)}
                            sx={{ 
                              cursor: 'pointer',
                              bgcolor: '#f5f5f5',
                              '&:hover': { bgcolor: '#e0e0e0' },
                              fontFamily: '"Courier New", monospace',
                              fontSize: '0.7rem'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {detectedVariables.length > 0 && (
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: '#e3f2fd',
                        borderRadius: 1,
                        border: '1px solid #90caf9'
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: '"Courier New", monospace',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#1976d2',
                          mb: 0.5,
                          display: 'block'
                        }}
                      >
                        Variables detectadas ({detectedVariables.length})
                      </Typography>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {detectedVariables.map(v => (
                          <Chip 
                            key={v} 
                            label={`{{${v}}}`} 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              fontFamily: '"Courier New", monospace',
                              fontSize: '0.7rem',
                              borderColor: '#1976d2',
                              color: '#1976d2'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </>
              )}

              {formData.action === 'create_activity' && (
                <>
                  <TextField
                    label="Título de actividad *"
                    value={formData.actionPayload.title}
                    onChange={(e) => handleActionPayloadChange('title', e.target.value)}
                    fullWidth
                    required
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem'
                      }
                    }}
                  />
                  <TextField
                    label="Descripción"
                    value={formData.actionPayload.description}
                    onChange={(e) => handleActionPayloadChange('description', e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem'
                      }
                    }}
                  />
                  <FormControl size="small" fullWidth>
                    <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                      Asignar a
                    </InputLabel>
                    <Select
                      value={formData.actionPayload.assignedTo}
                      onChange={(e) => handleActionPayloadChange('assignedTo', e.target.value)}
                      label="Asignar a"
                      sx={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem',
                        borderRadius: 0
                      }}
                    >
                      {agents.map(agent => (
                        <MenuItem key={agent._id} value={agent._id}>
                          {agent.firstName} {agent.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}

              {formData.action === 'notify_agent' && (
                <>
                  <FormControl size="small" fullWidth required>
                    <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                      Notificar a *
                    </InputLabel>
                    <Select
                      value={formData.actionPayload.assignedTo}
                      onChange={(e) => handleActionPayloadChange('assignedTo', e.target.value)}
                      label="Notificar a *"
                      sx={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem',
                        borderRadius: 0
                      }}
                    >
                      {agents.map(agent => (
                        <MenuItem key={agent._id} value={agent._id}>
                          {agent.firstName} {agent.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Mensaje"
                    value={formData.actionPayload.message}
                    onChange={(e) => handleActionPayloadChange('message', e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem'
                      }
                    }}
                  />
                </>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #ececec', p: 2, gap: 1 }}>
        {isEditing && (
          <>
            <Button
              onClick={handleTest}
              disabled={loading}
              startIcon={<PlayArrow />}
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                color: '#2196f3',
                textTransform: 'none',
                letterSpacing: '0.5px'
              }}
            >
              Probar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                color: '#d32f2f',
                textTransform: 'none',
                letterSpacing: '0.5px'
              }}
            >
              Eliminar
            </Button>
          </>
        )}
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            color: '#888',
            textTransform: 'none',
            letterSpacing: '0.5px'
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <AutoAwesome />}
          disabled={loading}
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            textTransform: 'none',
            letterSpacing: '0.5px',
            bgcolor: '#000',
            borderRadius: 0,
            '&:hover': { bgcolor: '#333' }
          }}
        >
          {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AutomationBuilder