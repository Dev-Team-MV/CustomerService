// apps/mv-crm/src/components/postSale/SurveyTemplateForm.jsx
import { useState, useEffect } from 'react'
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  Box, TextField, FormControl, InputLabel, Select, MenuItem, 
  CircularProgress, Alert, Typography, IconButton, Switch, 
  FormControlLabel, Divider
} from '@mui/material'
import { Add, Delete, HelpOutline } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

import { useProjects } from '@shared/hooks/useProjects'
import surveyService from '@shared/services/surveyService'

export default function SurveyTemplateForm({ open, onClose, initialData = null, onSuccess, onError }) {
  const { t } = useTranslation('postSale')
  const { projects } = useProjects()

  const [formData, setFormData] = useState({
    projectId: '',
    type: 'post_sale',
    name: '',
    questions: [{ key: '', text_en: '', text_es: '' }],
    isActive: true
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          projectId: initialData.projectId?._id || initialData.projectId || '',
          type: initialData.type || 'post_sale',
          name: initialData.name || '',
          questions: initialData.questions?.length > 0 
            ? [...initialData.questions] 
            : [{ key: '', text_en: '', text_es: '' }],
          isActive: initialData.isActive !== undefined ? initialData.isActive : true
        })
      } else {
        setFormData({
          projectId: '',
          type: 'post_sale',
          name: '',
          questions: [{ key: '', text_en: '', text_es: '' }],
          isActive: true
        })
      }
      setError('')
    }
  }, [open, initialData])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions]
    if (field === 'key') {
      newQuestions[index][field] = value.replace(/\s+/g, '_').toLowerCase()
    } else {
      newQuestions[index][field] = value
    }
    setFormData(prev => ({ ...prev, questions: newQuestions }))
  }

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { key: '', text_en: '', text_es: '' }]
    }))
  }

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async () => {
    setError('')
    if (!formData.projectId) return setError(t('templates.errorProject'))
    if (!formData.name.trim()) return setError(t('templates.errorName'))
    
    const invalidQuestions = formData.questions.some(q => !q.key.trim() || !q.text_es.trim())
    if (invalidQuestions) {
      return setError(t('templates.errorQuestions'))
    }

    setSubmitting(true)
    try {
      const payload = {
        projectId: formData.projectId,
        type: formData.type,
        name: formData.name,
        questions: formData.questions.map(q => ({
          key: q.key.trim(),
          text_en: q.text_en.trim(),
          text_es: q.text_es.trim()
        })),
        isActive: formData.isActive
      }

      if (initialData?._id) {
        await surveyService.updateTemplate(initialData._id, payload)
      } else {
        await surveyService.createTemplate(payload)
      }
      
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Error saving template:', err)
      setError(err.response?.data?.message || t('templates.saveError'))
      if (onError) onError(err)
    } finally {
      setSubmitting(false)
    }
  }

  const unifiedButtonSx = { borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }
  const inputSx = { fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' } }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ececec' }}>
        <Typography variant="h6" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {initialData ? t('templates.editTemplate') : t('templates.newTemplate')}
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers sx={{ bgcolor: '#fafafa' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 0, border: '1px solid' }}>{error}</Alert>}

          <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'primary.main', fontFamily: '"Courier New", monospace', letterSpacing: '1px', textTransform: 'uppercase' }}>
            1. {t('templates.generalInfo')}
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>{t('surveys.project')}</InputLabel>
              <Select
                value={formData.projectId}
                onChange={(e) => handleChange('projectId', e.target.value)}
                label={t('surveys.project')}
                disabled={!!initialData}
                sx={inputSx}
              >
                {projects.map(p => (
                  <MenuItem key={p._id} value={p._id} sx={{ fontFamily: '"Courier New", monospace' }}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>{t('filters.type')}</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                label={t('filters.type')}
                sx={inputSx}
              >
                <MenuItem value="post_sale" sx={{ fontFamily: '"Courier New", monospace' }}>{t('survey.types.post_sale')}</MenuItem>
                <MenuItem value="post_construction" sx={{ fontFamily: '"Courier New", monospace' }}>{t('survey.types.post_construction')}</MenuItem>
                <MenuItem value="post_warranty" sx={{ fontFamily: '"Courier New", monospace' }}>{t('survey.types.post_warranty')}</MenuItem>
                <MenuItem value="annual" sx={{ fontFamily: '"Courier New", monospace' }}>{t('survey.types.annual')}</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            required
            label={t('templates.name')}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder={t('templates.namePlaceholder')}
            sx={{ ...inputSx, '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' } }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
              />
            }
            label={<Typography fontWeight={600} sx={{ fontFamily: '"Courier New", monospace' }}>{t('templates.isActive')}</Typography>}
          />

          <Divider />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={700} sx={{ fontFamily: '"Courier New", monospace', letterSpacing: '1px', textTransform: 'uppercase' }}>
              2. {t('templates.questions')}
            </Typography>
            <Button startIcon={<Add />} size="small" variant="outlined" onClick={addQuestion} sx={{ ...unifiedButtonSx, border: '1px solid #000', color: '#000', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#555', color: '#555', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' } }}>
              {t('templates.addQuestion')}
            </Button>
          </Box>

          {formData.questions.map((question, index) => (
            <Box 
              key={index} 
              sx={{ 
                p: 2, 
                bgcolor: 'white', 
                borderRadius: 0, 
                border: '1px solid #e0e0e0', 
                position: 'relative',
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#000' }
              }}
            >
              {formData.questions.length > 1 && (
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => removeQuestion(index)}
                  sx={{ position: 'absolute', top: 8, right: 8, borderRadius: 0 }}
                  title={t('actions.remove')}
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr 2fr' }, gap: 2 }}>
                <TextField
                  fullWidth
                  required
                  label={t('templates.questionKey')}
                  placeholder="ej: limpieza_general"
                  value={question.key}
                  onChange={(e) => handleQuestionChange(index, 'key', e.target.value)}
                  size="small"
                  sx={inputSx}
                  InputProps={{
                    endAdornment: (
                      <HelpOutline fontSize="small" color="action" title={t('templates.keyHelper')} />
                    )
                  }}
                />
                <TextField
                  fullWidth
                  required
                  label={t('templates.questionEs')}
                  value={question.text_es}
                  onChange={(e) => handleQuestionChange(index, 'text_es', e.target.value)}
                  size="small"
                  sx={{ ...inputSx, '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' } }}
                />
                <TextField
                  fullWidth
                  label={t('templates.questionEn')}
                  value={question.text_en}
                  onChange={(e) => handleQuestionChange(index, 'text_en', e.target.value)}
                  size="small"
                  sx={{ ...inputSx, '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' } }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#fafafa', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} disabled={submitting} sx={{ ...unifiedButtonSx, color: '#888' }}>
          {t('actions.cancel')}
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting && <CircularProgress size={16} />}
          sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}
        >
          {submitting ? t('actions.saving') : t('actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}