import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Box, Button, Typography, CircularProgress, Alert, 
  Chip, Divider, TextField, Rating, Slider, Grid, Paper
} from '@mui/material'
import { ArrowBack, Send, CheckCircle, HelpOutline, Edit } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'

import { useAuth } from '@shared/context/AuthContext'
import surveyService from '@shared/services/surveyService'
import { useSurveys } from '@shared/hooks/useSurveys'
import { useResolvedProperties } from '@shared/hooks/useResolvedProperties'
import PageSection from '@shared/components/PageSection'
import Loader from '@shared/components/Loader'

// ─── Colores base (coherentes con el diseño del sistema) ───
const C = {
  dark:    '#004535',
  green:   '#004535',
  orange:  '#E5863C',
  gray:    '#706f6f',
  bg:      '#eef2e8',
  bgLight: '#f5f7f1',
  border:  '#d6ddc9',
}

export default function CustomerSurveyPage() {
  const { t } = useTranslation('postSale')
  const { user } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()

  const projectId = import.meta.env.VITE_PROJECT_ID

  const { data: surveys, loading: surveysLoading, refresh: refreshSurveys } = useSurveys({
    clientId: user?._id,
    projectId: projectId
  })

  const { propertiesMap, loading: resolvingProperties } = useResolvedProperties(surveys || [])

  const [activeSurvey, setActiveSurvey] = useState(null)
  const [formData, setFormData] = useState({
    responses: [],
    overallRating: 5,
    npsScore: 10
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const pendingSurveys = useMemo(() => 
    surveys?.filter(s => s.overallRating === null || s.overallRating === undefined) || [], 
  [surveys])
  
  const completedSurveys = useMemo(() => 
    surveys?.filter(s => s.overallRating !== null && s.overallRating !== undefined) || [], 
  [surveys])

  const getPropertyLabel = (survey) => {
    const { lots = {}, models = {}, buildings = {}, apartments = {} } = propertiesMap

    if (survey.apartmentId) {
      const aptId = typeof survey.apartmentId === 'string' ? survey.apartmentId : survey.apartmentId?._id
      const apt = apartments[aptId] || (typeof survey.apartmentId === 'object' ? survey.apartmentId : null)
      
      if (apt) {
        const bldgId = typeof apt.building === 'string' ? apt.building : apt.building?._id
        const bldg = buildings[bldgId] || (typeof apt.building === 'object' ? apt.building : null)
        
        const aptNumber = apt.apartmentNumber || t('common.na', 'N/A')
        const bldgName = bldg?.name || t('common.na', 'N/A')
        return `${t('surveys.apartment', 'Apartamento')} ${aptNumber} - ${bldgName}`
      }
      return `${t('surveys.apartment', 'Apartamento')} ${aptId ? String(aptId).slice(-6) : t('common.na', 'N/A')}`
    }

    if (survey.propertyId) {
      const propId = typeof survey.propertyId === 'string' ? survey.propertyId : survey.propertyId?._id
      const prop = lots[propId] || (typeof survey.propertyId === 'object' ? survey.propertyId : null)
      
      if (prop) {
        const lotId = typeof prop.lot === 'string' ? prop.lot : prop.lot?._id
        const modelId = typeof prop.model === 'string' ? prop.model : prop.model?._id
        
        const lotData = lots[lotId] || prop
        const modelData = models[modelId] || (typeof prop.model === 'object' ? prop.model : null)
        
        const lotNumber = lotData?.number || lotData?.lot?.number || t('common.na', 'N/A')
        const modelName = modelData?.name || modelData?.model || ''
        
        return `${t('surveys.property', 'Lote')} ${lotNumber} ${modelName ? `- ${modelName}` : ''}`
      }
      return `${t('surveys.property', 'Lote')} ${propId ? String(propId).slice(-6) : t('common.na', 'N/A')}`
    }

    return t('surveys.unspecifiedProperty', 'Propiedad no especificada')
  }

  const handleStartSurvey = (survey) => {
    setActiveSurvey(survey)
    const initialResponses = (survey.responses || []).map(r => ({
      questionKey: r.questionKey,
      question: r.question,
      rating: r.rating || 0,
      comment: r.comment || ''
    }))
    setFormData({
      responses: initialResponses,
      overallRating: survey.overallRating || 5,
      npsScore: survey.npsScore !== null && survey.npsScore !== undefined ? survey.npsScore : 10
    })
    setError(null)
    setSuccess(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleResponseChange = (index, field, value) => {
    const newResponses = [...formData.responses]
    newResponses[index][field] = field === 'rating' ? Number(value) : value
    setFormData(prev => ({ ...prev, responses: newResponses }))
  }

  const handleSubmit = async () => {
    if (!activeSurvey) return
    
    setError(null)
    setSubmitting(true)
    try {
      const payload = {
        responses: formData.responses.map(r => ({
          questionKey: r.questionKey,
          question: r.question,
          rating: Number(r.rating),
          comment: r.comment
        })),
        overallRating: Number(formData.overallRating),
        npsScore: Number(formData.npsScore)
      }

      await surveyService.update(activeSurvey._id, payload)
      
      setSuccess(true)
      refreshSurveys()
      
      setTimeout(() => {
        setActiveSurvey(null)
        setSuccess(false)
      }, 3000)
      
    } catch (err) {
      console.error('Error updating survey:', err)
      setError(err.response?.data?.message || t('surveys.submitError', 'Error al enviar la encuesta'))
    } finally {
      setSubmitting(false)
    }
  }

  const isLoading = surveysLoading || resolvingProperties

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size="large" message={t('common.loading', 'Cargando...')} fullHeight={false} />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ px: { xs: 3, md: 6 }, pt: { xs: 4, md: 5 }, pb: 3 }}>
          <Typography variant="h2" sx={{ fontWeight: 300, color: C.dark, fontSize: { xs: '2.2rem', md: '3rem' }, fontFamily: '"DM Sans", sans-serif', lineHeight: 1.1 }}>
            {t('surveys.welcome', 'Tu opinión nos')}{' '}
            <Box component="span" sx={{ fontWeight: 800 }}>{t('surveys.matters', 'importa')}</Box>
          </Typography>
          <Box display="flex" alignItems="center" gap={1.5} mt={1.5}>
            <Typography variant="body2" sx={{ color: C.gray, fontFamily: '"DM Sans", sans-serif', fontSize: '0.95rem' }}>
              {t('surveys.subtitle', 'Revisa y completa tus encuestas de satisfacción pendientes.')}
            </Typography>
          </Box>
        </Box>
      </motion.div>

      <AnimatePresence mode="wait">
        {!activeSurvey ? (
          <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <Box sx={{ px: { xs: 3, md: 6 } }}>
              
              <PageSection 
                title="01" 
                bold={t('surveys.pendingSurveys', 'Encuestas Pendientes')} 
                description={t('surveys.pendingDesc', 'Completa estas encuestas para ayudarnos a mejorar.')}
                bgcolor="white" topBorderColor={C.green} dividerColor={C.border} primaryColor={C.dark} contentPy={4}
              >
                {pendingSurveys.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircle sx={{ fontSize: 60, color: C.green, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" fontWeight={600} sx={{ fontFamily: '"DM Sans", sans-serif', color: C.dark }}>
                      {t('surveys.noPending', '¡Todo al día!')}
                    </Typography>
                    <Typography variant="body2" color={C.gray} sx={{ fontFamily: '"DM Sans", sans-serif' }}>
                      {t('surveys.noPendingDesc', 'No tienes encuestas pendientes por responder.')}
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {pendingSurveys.map((survey) => (
                      <Grid item xs={12} md={6} key={survey._id}>
                        <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #e0e0e0', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 24px rgba(0, 69, 53, 0.08)', borderColor: C.green } }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Chip 
                              label={t(`survey.types.${survey.type}`, survey.type)} 
                              size="small" 
                              sx={{ bgcolor: C.bg, color: C.dark, fontWeight: 600, fontFamily: '"DM Sans", sans-serif' }} 
                            />
                            <Chip label={t('surveys.pending', 'Pendiente')} size="small" color="warning" variant="outlined" sx={{ fontWeight: 600, fontFamily: '"DM Sans", sans-serif' }} />
                          </Box>
                          
                          <Typography variant="h6" fontWeight={700} sx={{ mb: 1, fontFamily: '"DM Sans", sans-serif', color: C.dark }}>
                            {survey.templateId?.name || t('surveys.customSurvey', 'Encuesta Personalizada')}
                          </Typography>
                          
                          <Box sx={{ p: 2, bgcolor: C.bgLight, borderRadius: '12px', mb: 2 }}>
                            <Typography variant="caption" fontWeight={600} color={C.gray} sx={{ display: 'block', mb: 0.5, fontFamily: '"DM Sans", sans-serif' }}>
                              {t('surveys.forProperty', 'Para la propiedad:')}
                            </Typography>
                            <Typography variant="body1" fontWeight={600} sx={{ fontFamily: '"DM Sans", sans-serif', color: C.dark }}>
                              {getPropertyLabel(survey)}
                            </Typography>
                          </Box>

                          <Box display="flex" justifyContent="flex-end" mt={2}>
                            <Button 
                              variant="contained" 
                              startIcon={<Edit />} 
                              onClick={() => handleStartSurvey(survey)} 
                              sx={{ borderRadius: '50px', textTransform: 'none', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, bgcolor: C.dark, '&:hover': { bgcolor: C.green } }}
                            >
                              {t('actions.respond', 'Responder')}
                            </Button>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </PageSection>

              {completedSurveys.length > 0 && (
                <PageSection 
                  title="02" 
                  bold={t('surveys.completedSurveys', 'Encuestas Completadas')} 
                  description={t('surveys.completedDesc', 'Historial de tus respuestas enviadas.')}
                  bgcolor="white" topBorderColor={C.orange} dividerColor={C.border} primaryColor={C.dark} contentPy={4} sx={{ mt: 3 }}
                >
                  <Grid container spacing={3}>
                    {completedSurveys.map((survey) => (
                      <Grid item xs={12} md={6} key={survey._id}>
                        <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #e0e0e0', opacity: 0.8 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Chip label={t(`survey.types.${survey.type}`, survey.type)} size="small" sx={{ bgcolor: C.bg, color: C.dark, fontWeight: 600 }} />
                            <Chip label={t('surveys.completed', 'Completada')} size="small" color="success" variant="outlined" sx={{ fontWeight: 600 }} />
                          </Box>
                          <Typography variant="h6" fontWeight={700} sx={{ mb: 1, fontFamily: '"DM Sans", sans-serif', color: C.dark }}>
                            {survey.templateId?.name || t('surveys.customSurvey', 'Encuesta Personalizada')}
                          </Typography>
                          <Typography variant="body2" color={C.gray} sx={{ mb: 2, fontFamily: '"DM Sans", sans-serif' }}>
                            {getPropertyLabel(survey)}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="caption" color={C.gray}>{t('surveys.yourRating', 'Tu calificación:')}</Typography>
                            <Rating value={survey.overallRating || 0} readOnly size="small" sx={{ color: C.orange }} />
                            <Typography variant="body2" fontWeight={600}>({survey.overallRating}/5)</Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </PageSection>
              )}
            </Box>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <Box sx={{ px: { xs: 3, md: 6 } }}>
              {success ? (
                <PageSection title="" bold="" bgcolor="white" topBorderColor={C.green} dividerColor={C.border} primaryColor={C.dark} contentPy={6}>
                  <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
                    <CheckCircle sx={{ fontSize: 80, color: C.green, mb: 2 }} />
                    <Typography variant="h3" fontWeight={800} sx={{ mb: 2, fontFamily: '"DM Sans", sans-serif', color: C.dark }}>
                      {t('surveys.thankYou', '¡Gracias por tu tiempo!')}
                    </Typography>
                    <Typography variant="body1" color={C.gray} sx={{ mb: 4, fontFamily: '"DM Sans", sans-serif', fontSize: '1.1rem', lineHeight: 1.6 }}>
                      {t('surveys.successMessage', 'Tus respuestas han sido registradas correctamente.')}
                    </Typography>
                  </Box>
                </PageSection>
              ) : (
                <PageSection 
                  title="" 
                  bold={t('surveys.answerSurvey', 'Responder Encuesta')} 
                  description={activeSurvey.templateId?.name || t('surveys.customSurvey', 'Encuesta Personalizada')}
                  bgcolor="white" topBorderColor={C.orange} dividerColor={C.border} primaryColor={C.dark} contentPy={4}
                >
                  <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                    <Button startIcon={<ArrowBack />} onClick={() => setActiveSurvey(null)} sx={{ mb: 3, color: C.dark, fontWeight: 600, textTransform: 'none', fontFamily: '"DM Sans", sans-serif' }}>
                      {t('actions.back', 'Volver a la lista')}
                    </Button>

                    <Box sx={{ p: 3, bgcolor: C.bg, borderRadius: '16px', mb: 4, border: `1px solid ${C.border}` }}>
                      <Typography variant="caption" fontWeight={600} color={C.gray} sx={{ display: 'block', mb: 0.5, fontFamily: '"DM Sans", sans-serif' }}>
                        {t('surveys.forProperty', 'Esta encuesta corresponde a:')}
                      </Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"DM Sans", sans-serif', color: C.dark }}>
                        {getPropertyLabel(activeSurvey)}
                      </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3, fontFamily: '"DM Sans", sans-serif' }}>{error}</Alert>}

                    {formData.responses.map((response, index) => (
                      <Box key={index} sx={{ mb: 4, p: 3, bgcolor: C.bgLight, borderRadius: '16px' }}>
                        <Typography variant="body1" fontWeight={600} sx={{ mb: 2, fontFamily: '"DM Sans", sans-serif', color: C.dark }}>
                          {index + 1}. {response.question || response.questionKey}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating 
                              value={response.rating || 0} 
                              onChange={(e, newValue) => handleResponseChange(index, 'rating', newValue)}
                              size="large"
                              sx={{ color: C.orange }}
                            />
                            <Typography variant="body2" color={C.gray} fontFamily='"DM Sans", sans-serif'>
                              ({response.rating || 0}/5)
                            </Typography>
                          </Box>
                          <TextField
                            fullWidth
                            label={t('surveys.comment', 'Comentario (opcional)')}
                            value={response.comment || ''}
                            onChange={(e) => handleResponseChange(index, 'comment', e.target.value)}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              fontFamily: '"DM Sans", sans-serif',
                              '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'white' }
                            }}
                          />
                        </Box>
                      </Box>
                    ))}

                    <Divider sx={{ my: 4, borderColor: C.border }} />

                    <Box sx={{ mb: 4, p: 3, bgcolor: C.bgLight, borderRadius: '16px' }}>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 2, fontFamily: '"DM Sans", sans-serif', color: C.dark }}>
                        {t('surveys.overallRating', 'Calificación General')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Rating 
                          value={formData.overallRating} 
                          onChange={(e, newValue) => setFormData(prev => ({ ...prev, overallRating: newValue }))}
                          size="large"
                          sx={{ color: C.orange }}
                        />
                        <Typography variant="body1" color={C.gray} fontFamily='"DM Sans", sans-serif'>
                          {formData.overallRating} / 5
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 4, p: 3, bgcolor: C.bgLight, borderRadius: '16px' }}>
                      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"DM Sans", sans-serif', color: C.dark }}>
                          {t('surveys.npsScore', 'Puntaje NPS')}
                        </Typography>
                        <HelpOutline fontSize="small" sx={{ color: C.gray }} />
                      </Box>
                      <Box sx={{ px: { xs: 1, sm: 2 } }}>
                        <Slider
                          value={formData.npsScore}
                          onChange={(e, newValue) => setFormData(prev => ({ ...prev, npsScore: newValue }))}
                          step={1}
                          marks
                          min={0}
                          max={10}
                          valueLabelDisplay="auto"
                          sx={{
                            color: formData.npsScore >= 9 ? '#4caf50' : formData.npsScore >= 7 ? C.orange : '#f44336',
                            '& .MuiSlider-markLabel': { fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem' }
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight={600} color={C.gray} sx={{ display: 'block', textAlign: 'center', mt: 1, fontFamily: '"DM Sans", sans-serif' }}>
                        {formData.npsScore >= 9 ? t('surveys.promoter', '😊 Promotor') : 
                         formData.npsScore >= 7 ? t('surveys.neutral', '😐 Neutro') : 
                         t('surveys.detractor', '😞 Detractor')}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Button 
                        variant="contained" 
                        size="large"
                        onClick={handleSubmit}
                        disabled={submitting}
                        startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                        sx={{ px: 6, py: 1.5, borderRadius: '50px', bgcolor: C.dark, color: 'white', fontWeight: 700, fontFamily: '"DM Sans", sans-serif', fontSize: '1rem', textTransform: 'none', boxShadow: '0 4px 12px rgba(0, 69, 53, 0.2)', transition: 'all 0.3s ease', '&:hover': { bgcolor: C.green, transform: 'translateY(-2px)' }, '&:disabled': { bgcolor: C.gray } }}
                      >
                        {submitting ? t('actions.saving', 'Enviando...') : t('actions.save', 'Guardar Respuestas')}
                      </Button>
                    </Box>
                  </Box>
                </PageSection>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}