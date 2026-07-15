// apps/mv-crm/src/components/campaigns/CampaignWizard.jsx
import { useState, useEffect, useCallback } from 'react' 
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material'
import { 
  Close, 
  Send, 
  ArrowBack,
  ArrowForward,
  Campaign
} from '@mui/icons-material'
import { useMessageTemplates } from '../../constants/hooks/useMessageTemplates'
import Step1Configuration from './steps/Step1Configuration'
import Step2Template from './steps/Step2Template'
import Step3Preview from './steps/Step3Preview'
import Step4Send from './steps/Step4Send'

const CampaignWizard = ({
  open,
  onClose,
  campaign = null,
  onCreate,
  onUpdate,
  onSend,
  onPreview,
  onCreateTemplate,
  projects = [],
  stages = [],
  sendProgress
}) => {
  const { t } = useTranslation('campaign')
  
  // ✅ DEFINICIÓN DE STEPS (debe estar antes de usarse)
  const STEPS = [
    t('steps.configuration'),
    t('steps.template'),
    t('steps.preview'),
    t('steps.send')
  ]
  
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [createdCampaignId, setCreatedCampaignId] = useState(null)
  
  const [newTemplateData, setNewTemplateData] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    templateId: '',
    audience: {
      type: 'leads',
      projectId: '',
      stage: '',
      filters: {}
    }
  })

  const [previewData, setPreviewData] = useState(null)

  const isEditing = Boolean(campaign?._id)

  // ✅ Obtener el projectId seleccionado en Step1
  const selectedProjectId = formData.audience?.projectId || ''

  // ✅ Hook de templates con projectId dinámico
  const { templates, loading: loadingTemplates } = useMessageTemplates(selectedProjectId)

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || '',
        templateId: campaign.templateId?._id || campaign.templateId || '',
        audience: campaign.audience || {
          type: 'leads',
          projectId: '',
          stage: '',
          filters: {}
        }
      })
      setCreatedCampaignId(campaign._id)
      setActiveStep(0)
    } else {
      setFormData({
        name: '',
        templateId: '',
        audience: {
          type: 'leads',
          projectId: '',
          stage: '',
          filters: {}
        }
      })
      setCreatedCampaignId(null)
      setActiveStep(0)
    }
    setPreviewData(null)
    setError(null)
    setNewTemplateData(null)
  }, [campaign, open])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAudienceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      audience: { ...prev.audience, [field]: value }
    }))
  }

  const handleTemplateDataChange = useCallback((data) => {
    setNewTemplateData(data)
  }, [])

  const handleNext = async () => {
    setError(null)

    if (activeStep === 0) {
      if (!formData.name) {
        setError(t('validation.nameRequired'))
        return
      }
      if (!formData.audience.type) {
        setError(t('validation.audienceRequired'))
        return
      }
      setActiveStep(1)
      return
    }

    if (activeStep === 1) {
      const isCreatingNew = newTemplateData?.isNew === true
      const hasExistingTemplate = formData.templateId
      
      if (!isCreatingNew && !hasExistingTemplate) {
        setError(t('validation.templateRequired'))
        return
      }
      
      if (isCreatingNew) {
        const newT = newTemplateData.newTemplate
        if (!newT?.name?.trim() || !newT?.template?.trim()) {
          setError(t('validation.templateFieldsRequired'))
          return
        }
      }

      setLoading(true)
      try {
        let templateId = formData.templateId
        
        if (isCreatingNew) {
          // ✅ Incluir projectId en el template nuevo
          const templatePayload = {
            ...newTemplateData.newTemplate,
            projectId: selectedProjectId || undefined
          }
          
          const createdTemplate = await onCreateTemplate(templatePayload)
          templateId = createdTemplate._id
          setFormData(prev => ({ ...prev, templateId }))
        }
        
        let campaignId
        
        if (isEditing) {
          if (onUpdate) {
            await onUpdate(campaign._id, { ...formData, templateId })
          }
          campaignId = campaign._id
        } else {
          if (!onCreate) {
            throw new Error('onCreate function is not provided')
          }
          const newCampaign = await onCreate({ ...formData, templateId })
          campaignId = newCampaign._id
          setCreatedCampaignId(campaignId)
        }
        
        const preview = await onPreview(campaignId)
        setPreviewData(preview)
        
        setActiveStep(2)
      } catch (err) {
        console.error('❌ Error in complete flow:', err)
        setError(err.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
      return
    }

    if (activeStep === 2) {
      setActiveStep(3)
      return
    }
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
    setError(null)
  }

  const handleSend = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const campaignId = createdCampaignId || campaign?._id
      
      if (!campaignId) {
        throw new Error(t('errors.campaignIdNotFound'))
      }
      
      const campaignToSend = campaign || { _id: campaignId }
      await onSend?.(campaignToSend, false)
      
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const campaignId = createdCampaignId || campaign?._id
      
      if (!campaignId) {
        throw new Error(t('errors.campaignIdNotFound'))
      }
      
      const campaignToSend = campaign || { _id: campaignId }
      await onSend?.(campaignToSend, true)
      
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleClose = () => {
    onClose()
    setActiveStep(0)
    setCreatedCampaignId(null)
    setPreviewData(null)
    setError(null)
    setNewTemplateData(null)
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Step1Configuration
            formData={formData}
            onChange={handleChange}
            onAudienceChange={handleAudienceChange}
            projects={projects}
            stages={stages}
          />
        )
      case 1:
        return (
          <Step2Template
            formData={formData}
            onChange={handleChange}
            onTemplateDataChange={handleTemplateDataChange}
            templates={templates}
            loadingTemplates={loadingTemplates}
            selectedProjectId={selectedProjectId}
            projects={projects}
          />
        )
      case 2:
        return (
          <Step3Preview 
            previewData={previewData} 
            loading={loading}
          />
        )
      case 3:
        return (
          <Step4Send
            sendProgress={sendProgress}
            onSend={handleSend}
            onResend={handleResend}
            loading={loading}
          />
        )
      default:
        return null
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: '1px solid #ececec',
          minHeight: 600
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
          <Campaign sx={{ fontSize: 20 }} />
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
        <IconButton onClick={handleClose} size="small" disabled={loading}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, py: 2, bgcolor: '#fafafa', borderBottom: '1px solid #ececec' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label, index) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
            {error}
          </Alert>
        )}

        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #ececec', p: 2, gap: 1 }}>
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            disabled={loading}
            startIcon={<ArrowBack />}
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              color: '#888',
              textTransform: 'none',
              letterSpacing: '0.5px'
            }}
          >
            {t('back')}
          </Button>
        )}
        
        <Box sx={{ flex: 1 }} />
        
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            color: '#888',
            textTransform: 'none',
            letterSpacing: '0.5px'
          }}
        >
          {t('cancel')}
        </Button>
        
        {activeStep < 3 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            endIcon={loading ? <CircularProgress size={16} /> : <ArrowForward />}
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
            {activeStep === 0 
              ? t('continue')
              : activeStep === 1
                ? t('createAndPreview')
                : t('continue')
            }
          </Button>
        ) : (
          !sendProgress && (
            <Button
              onClick={handleSend}
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} /> : <Send />}
              disabled={loading}
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                textTransform: 'none',
                letterSpacing: '0.5px',
                bgcolor: '#4caf50',
                borderRadius: 0,
                '&:hover': { bgcolor: '#388e3c' }
              }}
            >
              {t('sendNow')}
            </Button>
          )
        )}
      </DialogActions>
    </Dialog>
  )
}

export default CampaignWizard