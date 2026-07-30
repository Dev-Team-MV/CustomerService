// apps/mv-crm/src/components/automations/AutomationBuilder.jsx
import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography,
  TextField, Button, IconButton, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, Divider, Switch, FormControlLabel, Chip
} from '@mui/material'
import { Close, AutoAwesome, PlayArrow, Info } from '@mui/icons-material'
import { useMessageTemplates } from '../../constants/hooks/useMessageTemplates'
import VariableInserter from '@shared/components/VariableInserter'
import ProjectSelector from '@shared/components/ProjectSelector'

const TRIGGERS = [
  { value: 'lead_stage_changed', icon: '🔄' },
  { value: 'payment_overdue', icon: '⚠️' },
  { value: 'appointment_created', icon: '📅' },
  { value: 'inactivity_7days', icon: '⏰' }
]

const ACTIONS = [
  { value: 'send_sms', icon: '📱' },
  { value: 'create_activity', icon: '📝' },
  { value: 'notify_agent', icon: '🔔' }
]

const STAGES = [
  { value: '', labelKey: 'conditions.anyStage' },
  { value: 'nuevo', labelKey: 'stages.new' },
  { value: 'contactado', labelKey: 'stages.contacted' },
  { value: 'visita_agendada', labelKey: 'stages.visitScheduled' },
  { value: 'propuesta', labelKey: 'stages.proposal' },
  { value: 'vendido', labelKey: 'stages.sold' },
  { value: 'perdido', labelKey: 'stages.lost' }
]

const GLOBAL_VARIABLES = [
  { key: 'firstName', label: 'firstName' }, { key: 'lastName', label: 'lastName' },
  { key: 'email', label: 'email' }, { key: 'phoneNumber', label: 'phoneNumber' }
]

const extractId = (value) => {
  if (!value) return ''
  if (typeof value === 'object' && value._id) return value._id
  if (typeof value === 'string') return value
  return ''
}

const AutomationBuilder = ({ open, onClose, automation = null, onSave, onDelete, onTest, projects = [], agents = [] }) => {
  const { t } = useTranslation('automation')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '', trigger: 'lead_stage_changed',
    condition: { stage: '', projectId: '', daysInactive: 7 },
    action: 'send_sms',
    actionPayload: { templateId: '', message: '', assignedTo: '', title: '', description: '' },
    isActive: true
  })

  const isEditing = Boolean(automation?._id)
  const messageRef = useRef(null)
  const selectedProjectId = formData.condition?.projectId || ''
  
  const { templates: allTemplates, loading: loadingTemplates } = useMessageTemplates()
  
  const templates = useMemo(() => {
    if (!selectedProjectId) return allTemplates
    return allTemplates.filter(template => {
      if (!template.projectId) return true
      return extractId(template.projectId) === selectedProjectId
    })
  }, [allTemplates, selectedProjectId])
  
  const selectedProjectName = projects.find(p => p._id === selectedProjectId)?.name || ''

  useEffect(() => {
    if (automation) {
      setFormData({
        name: automation.name || '', trigger: automation.trigger || 'lead_stage_changed',
        condition: { stage: automation.condition?.stage || '', projectId: extractId(automation.condition?.projectId), daysInactive: automation.condition?.daysInactive || 7 },
        action: automation.action || 'send_sms',
        actionPayload: {
          templateId: extractId(automation.actionPayload?.templateId),
          message: automation.actionPayload?.message || '',
          assignedTo: extractId(automation.actionPayload?.assignedTo),
          title: automation.actionPayload?.title || '',
          description: automation.actionPayload?.description || ''
        },
        isActive: automation.isActive ?? true
      })
    } else {
      setFormData({ name: '', trigger: 'lead_stage_changed', condition: { stage: '', projectId: '', daysInactive: 7 }, action: 'send_sms', actionPayload: { templateId: '', message: '', assignedTo: '', title: '', description: '' }, isActive: true })
    }
    setError(null)
  }, [automation, open])

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))
  const handleConditionChange = (field, value) => {
    setFormData(prev => ({ ...prev, condition: { ...prev.condition, [field]: value } }))
    if (field === 'projectId' && value) {
      const currentTemplate = allTemplates.find(t => t._id === formData.actionPayload.templateId)
      if (currentTemplate && extractId(currentTemplate.projectId) && extractId(currentTemplate.projectId) !== value) {
        setFormData(prev => ({ ...prev, actionPayload: { ...prev.actionPayload, templateId: '' } }))
      }
    }
  }
  const handleActionPayloadChange = (field, value) => setFormData(prev => ({ ...prev, actionPayload: { ...prev.actionPayload, [field]: value } }))

  const handleInsertVariableInMessage = (varName) => {
    const textarea = messageRef.current?.querySelector('textarea')
    const currentMessage = formData.actionPayload.message || ''
    if (!textarea) {
      handleActionPayloadChange('message', currentMessage + `{{${varName}}}`)
      return
    }
    const start = textarea.selectionStart
    const insertion = `{{${varName}}}`
    const newText = currentMessage.substring(0, start) + insertion + currentMessage.substring(textarea.selectionEnd)
    handleActionPayloadChange('message', newText)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + insertion.length, start + insertion.length)
    }, 0)
  }

  const cleanPayload = (data) => {
    const cleaned = { ...data }
    if (cleaned.condition) {
      Object.keys(cleaned.condition).forEach(key => { if (cleaned.condition[key] === '') cleaned.condition[key] = null })
      if (!Object.values(cleaned.condition).some(v => v !== null && v !== undefined)) cleaned.condition = {}
    }
    if (cleaned.actionPayload) {
      const payload = {}
      if (cleaned.action === 'send_sms') {
        if (cleaned.actionPayload.templateId) payload.templateId = cleaned.actionPayload.templateId
        if (cleaned.actionPayload.message) payload.message = cleaned.actionPayload.message
      } else if (cleaned.action === 'create_activity') {
        if (cleaned.actionPayload.title) payload.title = cleaned.actionPayload.title
        if (cleaned.actionPayload.description) payload.description = cleaned.actionPayload.description
        if (cleaned.actionPayload.assignedTo) payload.assignedTo = cleaned.actionPayload.assignedTo
      } else if (cleaned.action === 'notify_agent') {
        if (cleaned.actionPayload.assignedTo) payload.assignedTo = cleaned.actionPayload.assignedTo
        if (cleaned.actionPayload.message) payload.message = cleaned.actionPayload.message
      }
      cleaned.actionPayload = payload
    }
    return cleaned
  }

  const handleSubmit = async () => {
    if (!formData.name) return setError(t('validation.nameRequired'))
    if (!formData.trigger) return setError(t('validation.triggerRequired'))
    if (!formData.action) return setError(t('validation.actionRequired'))
    if (formData.action === 'send_sms' && !formData.actionPayload.templateId && !formData.actionPayload.message) return setError(t('validation.templateOrMessageRequired'))
    if (formData.action === 'create_activity' && !formData.actionPayload.title) return setError(t('validation.activityTitleRequired'))
    if (formData.action === 'notify_agent' && !formData.actionPayload.assignedTo) return setError(t('validation.assignAgentRequired'))

    setLoading(true); setError(null)
    try {
      if (isEditing) await onSave?.(automation._id, cleanPayload(formData))
      else await onSave?.(null, cleanPayload(formData))
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('validation.saveError'))
    } finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm(t('validation.confirmDelete'))) return
    setLoading(true)
    try { await onDelete?.(automation._id); onClose() }
    catch (err) { setError(err.response?.data?.message || err.message || t('validation.deleteError')) }
    finally { setLoading(false) }
  }

  const handleTest = async () => {
    setLoading(true)
    try {
      const result = await onTest?.(automation._id, {})
      if (result.matched) {
        const clientName = result.context?.client ? `${result.context.client.firstName} ${result.context.client.lastName}` : result.context?.enrichedPayload?.clientName || 'N/A'
        if (result.result?.success) alert(`${t('testMatched')}\n\n👤 Cliente: ${clientName}`)
        else alert(`⚠️ Match encontrado pero error:\n\n❌ ${result.result?.error}\n👤 Cliente: ${clientName}`)
      } else {
        alert(t('testNotMatched'))
      }
    } catch (err) { setError(err.response?.data?.message || err.message || t('validation.testError')) }
    finally { setLoading(false) }
  }

  const detectedVariables = (formData.actionPayload.message?.match(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g) || []).map(m => m.replace(/[{}]/g, '').trim())

  // ✅ Estilos unificados
  const unifiedButtonSx = { borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }
  const inputSx = { '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }, '& .MuiOutlinedInput-root': { borderRadius: 0 }, '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' } }
  const menuItemSx = { fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, '&:hover': { bgcolor: '#f5f5f5' } }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}>
      <DialogTitle sx={{ borderBottom: '1px solid #ececec', display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: { xs: 2, sm: 3 } }}>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoAwesome sx={{ fontSize: 20 }} />
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {isEditing ? t('editTitle') : t('createTitle')}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={loading} sx={{ borderRadius: 0 }}><Close fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && <Alert severity="error" sx={{ m: 3, mb: 0, borderRadius: 0, border: '1px solid' }}>{error}</Alert>}
        <Box display="flex" flexDirection="column" gap={2.5} sx={{ p: 3 }}>
          <TextField label={`${t('form.name')} *`} value={formData.name} onChange={(e) => handleChange('name', e.target.value)} fullWidth required sx={inputSx} />

          <FormControlLabel 
            control={<Switch checked={formData.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#4caf50' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#4caf50' } }} />} 
            label={<Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: formData.isActive ? '#4caf50' : '#888' }}>{formData.isActive ? t('active') : t('inactive')}</Typography>} 
          />
          <Divider />

          <Box>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', mb: 1 }}>{t('form.trigger')} *</Typography>
            <FormControl size="small" fullWidth required>
              <Select value={formData.trigger} onChange={(e) => handleChange('trigger', e.target.value)} sx={{ ...inputSx, width: '100%' }}>
                {TRIGGERS.map(trigger => (
                  <MenuItem key={trigger.value} value={trigger.value} sx={menuItemSx}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography>{trigger.icon}</Typography>
                      {t(`triggers.${trigger.value}`)}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', mb: 1 }}>{t('conditions')}</Typography>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
              {formData.trigger === 'lead_stage_changed' && (
                <FormControl size="small" fullWidth>
                  <InputLabel>{t('conditions.specificStage')}</InputLabel>
                  <Select value={formData.condition.stage} onChange={(e) => handleConditionChange('stage', e.target.value)} label={t('conditions.specificStage')} sx={{ ...inputSx, width: '100%' }}>
                    {STAGES.map(stage => (
                      <MenuItem key={stage.value} value={stage.value} sx={menuItemSx}>
                        {t(stage.labelKey)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}


              {formData.trigger === 'inactivity_7days' && (
                <TextField 
                  label={t('conditions.daysOfInactivity')} 
                  type="number" 
                  value={formData.condition.daysInactive} 
                  onChange={(e) => handleConditionChange('daysInactive', parseInt(e.target.value) || 7)} 
                  fullWidth 
                  inputProps={{ min: 1 }} 
                  sx={inputSx} 
                />
              )}
            </Box>
              <Box sx={{ flex: 1, mt:2 }}>
                <ProjectSelector
                  value={formData.condition.projectId}
                  onChange={(value) => handleConditionChange('projectId', value)}
                  label={t('conditions.specificProject')}
                  includeGlobal={true}
                  globalLabel={t('conditions.anyProject')}
                  fullWidth
                  size="small"
                />
              </Box>
          </Box>

          <Divider />

          <Box>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', mb: 1 }}>{t('form.action')} *</Typography>
            <FormControl size="small" fullWidth required>
              <Select value={formData.action} onChange={(e) => handleChange('action', e.target.value)} sx={{ ...inputSx, width: '100%' }}>
                {ACTIONS.map(action => (
                  <MenuItem key={action.value} value={action.value} sx={menuItemSx}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography>{action.icon}</Typography>
                      {t(`actions.${action.value}`)}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', mb: 1 }}>{t('actionConfig.template')}</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {formData.action === 'send_sms' && (
                <>
                  {selectedProjectId && (
                    <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: 0, border: '1px solid #4caf50', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Info sx={{ fontSize: 16, color: '#2e7d32' }} />
                      <Typography variant="caption" sx={{ color: '#2e7d32', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', fontWeight: 600 }}>
                        {t('actionConfig.linkedToProject')}: <strong>{selectedProjectName}</strong>
                      </Typography>
                    </Box>
                  )}
                  <FormControl size="small" fullWidth disabled={loadingTemplates}>
                    <InputLabel>{t('actionConfig.template')}</InputLabel>
                    <Select value={formData.actionPayload.templateId} onChange={(e) => handleActionPayloadChange('templateId', e.target.value)} label={t('actionConfig.template')} sx={{ ...inputSx, width: '100%' }}>
                      {loadingTemplates ? (
                        <MenuItem value="" disabled><CircularProgress size={20} sx={{ mr: 1 }} />{t('actionConfig.loading')}</MenuItem>
                      ) : templates.length === 0 ? (
                        <MenuItem value="" disabled>{t('actionConfig.noTemplates')}</MenuItem>
                      ) : (
                        templates.map(template => (
                          <MenuItem key={template._id} value={template._id} sx={menuItemSx}>
                            <Box display="flex" alignItems="center" gap={1} width="100%">
                              <Typography sx={{ flex: 1 }}>{template.name}</Typography>
                              <Chip 
                                label={template.projectId ? t('actionConfig.project') : t('actionConfig.global')} 
                                size="small" 
                                sx={{ bgcolor: template.projectId ? '#e3f2fd' : '#f5f5f5', color: template.projectId ? '#1976d2' : '#666', fontSize: '0.6rem', height: 18, borderRadius: 0 }} 
                              />
                            </Box>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                  <Box ref={messageRef}>
                    <TextField 
                      label={t('actionConfig.customMessage')} 
                      value={formData.actionPayload.message} 
                      onChange={(e) => handleActionPayloadChange('message', e.target.value)} 
                      fullWidth 
                      multiline 
                      rows={3} 
                      sx={{ ...inputSx, '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace' } }} 
                    />
                  </Box>
                  {selectedProjectId ? (
                    <VariableInserter projectId={selectedProjectId} onInsert={handleInsertVariableInMessage} compact={false} maxHeight={150} />
                  ) : (
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} mb={1} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{t('actionConfig.globalVariables')}</Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {GLOBAL_VARIABLES.map(v => (
                          <Chip 
                            key={v.key} 
                            label={`{{${v.key}}}`} 
                            size="small" 
                            onClick={() => handleInsertVariableInMessage(v.key)} 
                            sx={{ cursor: 'pointer', bgcolor: '#f5f5f5', borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem', '&:hover': { bgcolor: '#e0e0e0' } }} 
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {detectedVariables.length > 0 && (
                    <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 0, border: '1px solid #90caf9' }}>
                      <Typography variant="caption" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', fontWeight: 700, color: '#1976d2', mb: 0.5, display: 'block' }}>
                        {t('actionConfig.detectedVariables')} ({detectedVariables.length})
                      </Typography>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {detectedVariables.map(v => (
                          <Chip 
                            key={v} 
                            label={`{{${v}}}`} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', borderColor: '#1976d2', color: '#1976d2', borderRadius: 0 }} 
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
                    label={`${t('actionConfig.activityTitle')} *`} 
                    value={formData.actionPayload.title} 
                    onChange={(e) => handleActionPayloadChange('title', e.target.value)} 
                    fullWidth 
                    required 
                    sx={inputSx} 
                  />
                  <TextField 
                    label={t('actionConfig.description')} 
                    value={formData.actionPayload.description} 
                    onChange={(e) => handleActionPayloadChange('description', e.target.value)} 
                    fullWidth 
                    multiline 
                    rows={2} 
                    sx={inputSx} 
                  />
                  <FormControl size="small" fullWidth>
                    <InputLabel>{t('actionConfig.assignTo')}</InputLabel>
                    <Select value={formData.actionPayload.assignedTo} onChange={(e) => handleActionPayloadChange('assignedTo', e.target.value)} label={t('actionConfig.assignTo')} sx={{ ...inputSx, width: '100%' }}>
                      {agents.map(agent => (<MenuItem key={agent._id} value={agent._id} sx={menuItemSx}>{agent.firstName} {agent.lastName}</MenuItem>))}
                    </Select>
                  </FormControl>
                </>
              )}

              {formData.action === 'notify_agent' && (
                <>
                  <FormControl size="small" fullWidth required>
                    <InputLabel>{`${t('actionConfig.notifyTo')} *`}</InputLabel>
                    <Select value={formData.actionPayload.assignedTo} onChange={(e) => handleActionPayloadChange('assignedTo', e.target.value)} label={`${t('actionConfig.notifyTo')} *`} sx={{ ...inputSx, width: '100%' }}>
                      {agents.map(agent => (<MenuItem key={agent._id} value={agent._id} sx={menuItemSx}>{agent.firstName} {agent.lastName}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <TextField 
                    label={t('actionConfig.message')} 
                    value={formData.actionPayload.message} 
                    onChange={(e) => handleActionPayloadChange('message', e.target.value)} 
                    fullWidth 
                    multiline 
                    rows={2} 
                    sx={inputSx} 
                  />
                </>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #ececec', p: 2, gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
        {isEditing && (<>
          <Button onClick={handleTest} disabled={loading} startIcon={<PlayArrow />} sx={{ ...unifiedButtonSx, color: '#2196f3' }}>{t('test')}</Button>
          <Button onClick={handleDelete} disabled={loading} sx={{ ...unifiedButtonSx, color: '#d32f2f' }}>{t('delete')}</Button>
        </>)}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} disabled={loading} sx={{ ...unifiedButtonSx, color: '#888' }}>{t('form.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained" startIcon={loading ? <CircularProgress size={16} /> : <AutoAwesome />} disabled={loading} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
          {loading ? t('form.saving') : isEditing ? t('form.update') : t('form.create')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AutomationBuilder