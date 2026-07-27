// apps/mv-crm/src/components/campaigns/steps/Step2Template.jsx
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Paper,
  Chip,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider
} from '@mui/material'
import { Message, Info, Code } from '@mui/icons-material'

// ✅ NUEVO: Importar VariableInserter
import VariableInserter from '@shared/components/VariableInserter'

// Variables hardcodeadas para templates globales (sin proyecto)
const GLOBAL_VARIABLES = [
  { key: 'firstName', label: 'firstName' },
  { key: 'lastName', label: 'lastName' },
  { key: 'email', label: 'email' },
  { key: 'phoneNumber', label: 'phoneNumber' }
]

const Step2Template = ({
  formData,
  onChange,
  onTemplateDataChange,
  templates,
  loadingTemplates,
  selectedProjectId = '', // ✅ NUEVO: projectId desde Step1
  projects = []
}) => {
  const { t } = useTranslation('campaign')
  const templateRef = useRef(null)
  
  const [templateMode, setTemplateMode] = useState('existing')
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    template: '',
    category: '',
    description: ''
  })

  const selectedTemplate = templates.find(t => t._id === formData.templateId)
  
  // ✅ NUEVO: Nombre del proyecto seleccionado (para mostrar en UI)
  const selectedProjectName = projects.find(p => p._id === selectedProjectId)?.name || ''

  const handleTemplateChange = (templateId) => {
    onChange('templateId', templateId)
  }

  const handleModeChange = (mode) => {
    setTemplateMode(mode)
    if (mode === 'new') {
      onChange('templateId', '')
    }
  }

  const handleNewTemplateChange = (field, value) => {
    setNewTemplate(prev => ({ ...prev, [field]: value }))
  }

  // ✅ NUEVO: Insertar variable en la posición del cursor
  const handleInsertVariable = (varName) => {
    const textarea = templateRef.current?.querySelector('textarea')
    if (!textarea) {
      // Fallback: agregar al final
      handleNewTemplateChange('template', newTemplate.template + `{{${varName}}}`)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = newTemplate.template
    const insertion = `{{${varName}}}`
    
    const newText = text.substring(0, start) + insertion + text.substring(end)
    handleNewTemplateChange('template', newText)
    
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + insertion.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const detectedVariables = (newTemplate.template.match(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g) || [])
    .map(m => m.replace(/[{}]/g, '').trim())

  const isNewTemplateValid = newTemplate.name.trim() && newTemplate.template.trim()

  useEffect(() => {
    if (templateMode === 'new') {
      onTemplateDataChange?.({
        isNew: true,
        newTemplate
      })
    } else {
      onTemplateDataChange?.({
        isNew: false,
        templateId: formData.templateId
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateMode, newTemplate.name, newTemplate.template, formData.templateId])

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>
      {/* ✅ NUEVO: Banner informativo del proyecto seleccionado */}
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
            {t('template.projectModeActive', 'Campaña vinculada al proyecto: {{projectName}}', { projectName: selectedProjectName })}
          </Typography>
        </Box>
      )}

      <FormControl component="fieldset">
        <RadioGroup
          row
          value={templateMode}
          onChange={(e) => handleModeChange(e.target.value)}
        >
          <FormControlLabel
            value="existing"
            control={<Radio size="small" />}
            label={
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.75rem'
                }}
              >
                {t('template.useExisting')}
              </Typography>
            }
          />
          <FormControlLabel
            value="new"
            control={<Radio size="small" />}
            label={
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.75rem'
                }}
              >
                {t('template.createNew')}
              </Typography>
            }
          />
        </RadioGroup>
      </FormControl>

      <Divider />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODO: TEMPLATE EXISTENTE */}
      {/* ═══════════════════════════════════════════════════════ */}
      {templateMode === 'existing' && (
        <>
          <FormControl size="small" fullWidth required disabled={loadingTemplates}>
            <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
              {t('form.selectTemplate')} *
            </InputLabel>
            <Select
              value={formData.templateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              label={t('form.selectTemplate')}
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                borderRadius: 0
              }}
            >
              {loadingTemplates ? (
                <MenuItem value="" disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  {t('loadingTemplates')}
                </MenuItem>
              ) : templates.length === 0 ? (
                <MenuItem value="" disabled>
                  {selectedProjectId 
                    ? t('template.noTemplatesForProject', 'No hay plantillas para este proyecto')
                    : t('noTemplates')}
                </MenuItem>
              ) : (
                templates.map(template => (
                  <MenuItem key={template._id} value={template._id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Message sx={{ fontSize: 16, color: '#666' }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {template.name}
                        </Typography>
                        {template.category && (
                          <Typography variant="caption" color="text.secondary">
                            {template.category}
                          </Typography>
                        )}
                      </Box>
                      {/* ✅ NUEVO: Badge si el template es de proyecto */}
                      {template.projectId && (
                        <Chip 
                          label="proyecto" 
                          size="small" 
                          sx={{ 
                            bgcolor: '#e3f2fd', 
                            color: '#1976d2',
                            fontSize: '0.6rem',
                            height: 18,
                            ml: 'auto'
                          }}
                        />
                      )}
                      {!template.projectId && (
                        <Chip 
                          label="global" 
                          size="small" 
                          sx={{ 
                            bgcolor: '#f5f5f5', 
                            color: '#666',
                            fontSize: '0.6rem',
                            height: 18,
                            ml: 'auto'
                          }}
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {selectedTemplate && (
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: '#f5f5f5'
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {selectedTemplate.name}
                </Typography>
                <Box display="flex" gap={0.5}>
                  {selectedTemplate.projectId && (
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
                  )}
                  {selectedTemplate.category && (
                    <Chip 
                      label={selectedTemplate.category} 
                      size="small" 
                      sx={{ fontSize: '0.65rem', height: 18 }}
                    />
                  )}
                </Box>
              </Box>
              
              <Typography
                variant="body2"
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.75rem',
                  color: '#666',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6
                }}
              >
                {selectedTemplate.template}
              </Typography>

              {selectedTemplate.description && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}
                >
                  {selectedTemplate.description}
                </Typography>
              )}
            </Paper>
          )}

          {!formData.templateId && (
            <Alert severity="info" sx={{ borderRadius: 0 }}>
              {t('validation.templateRequired')}
            </Alert>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODO: NUEVO TEMPLATE */}
      {/* ═══════════════════════════════════════════════════════ */}
      {templateMode === 'new' && (
        <>
          <TextField
            label={`${t('template.name')} *`}
            value={newTemplate.name}
            onChange={(e) => handleNewTemplateChange('name', e.target.value)}
            fullWidth
            required
            placeholder={t('template.namePlaceholder')}
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem'
              }
            }}
          />

          <TextField
            label={t('template.category')}
            value={newTemplate.category}
            onChange={(e) => handleNewTemplateChange('category', e.target.value)}
            fullWidth
            placeholder={t('template.categoryPlaceholder')}
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem'
              }
            }}
          />

          <TextField
            label={t('template.description')}
            value={newTemplate.description}
            onChange={(e) => handleNewTemplateChange('description', e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder={t('template.descriptionPlaceholder')}
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem'
              }
            }}
          />

          <Divider />

          {/* ✅ NUEVO: Variable Inserter si hay proyecto seleccionado */}
          {selectedProjectId ? (
            <VariableInserter
              projectId={selectedProjectId}
              onInsert={handleInsertVariable}
            />
          ) : (
            /* ✅ Variables hardcodeadas para templates globales */
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                {t('template.globalVariables', 'Variables globales disponibles')}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                {t('template.globalVariablesHelper', 'Selecciona un proyecto en el paso anterior para usar variables específicas del proyecto')}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {GLOBAL_VARIABLES.map(v => (
                  <Chip
                    key={v.key}
                    label={`{{${v.key}}}`}
                    size="small"
                    onClick={() => handleInsertVariable(v.key)}
                    sx={{ 
                      cursor: 'pointer',
                      bgcolor: '#e3f2fd',
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.65rem',
                      '&:hover': { bgcolor: '#bbdefb' }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* ✅ NUEVO: Template con ref para inserción en cursor */}
          <Box ref={templateRef}>
            <TextField
              label={`${t('template.content')} *`}
              value={newTemplate.template}
              onChange={(e) => handleNewTemplateChange('template', e.target.value)}
              fullWidth
              multiline
              rows={6}
              required
              placeholder={t('template.contentPlaceholder')}
              helperText={`${newTemplate.template.length} ${t('template.chars')} (SMS: ~${Math.ceil(newTemplate.template.length / 160)} ${t('template.messages')})`}
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.75rem'
                }
              }}
            />
          </Box>

          {detectedVariables.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#e3f2fd' }}>
              <Box display="flex" alignItems="flex-start" gap={1}>
                <Code fontSize="small" sx={{ mt: 0.5, color: '#1976d2' }} />
                <Box flex={1}>
                  <Typography variant="caption" fontWeight={600} color="#1976d2">
                    {t('template.variablesDetected')} ({detectedVariables.length})
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                    {detectedVariables.map(v => (
                      <Chip 
                        key={v} 
                        label={`{{${v}}}`} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>
          )}

          {!isNewTemplateValid && (
            <Alert severity="info" sx={{ borderRadius: 0 }}>
              {t('validation.templateFieldsRequired')}
            </Alert>
          )}
        </>
      )}
    </Box>
  )
}

export default Step2Template