// apps/mv-crm/src/pages/Campaigns.jsx
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { Add, Campaign, Delete } from '@mui/icons-material'
import { motion } from 'framer-motion'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import DataTable from '@shared/components/table/DataTable'
import CampaignWizard from '../components/campaigns/CampaignWizard'
import { useCampaigns } from '../constants/hooks/useCampaigns'
import { useProjects } from '@shared/hooks/useProjects'
import { LEAD_STAGES } from '../services/leadService'
import { useCampaignColumns, getStatusConfig } from '../constants/Columns/campaigns'
import messageTemplateService from '../services/messageTemplateService'

// ✅ NUEVOS IMPORTS PARA EL TOUR
import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getCampaignTourSteps, campaignTourConfig } from '../tours/modules/campaignTour'
import { getCampaignWizardTourSteps, campaignWizardTourConfig } from '../tours/features/campaignWizardTour'


export default function Campaigns() {
  const { t } = useTranslation('campaign')
    const { t: tCommon } = useTranslation('common') // ✅ Para las claves del tour

  const { 
    campaigns, 
    total, 
    loading, 
    error, 
    fetchCampaigns,
    createCampaign,
    deleteCampaign,
    previewCampaign,
    sendCampaign,
    startStatsPolling,
    stopStatsPolling
  } = useCampaigns()
  const { projects } = useProjects()

  const [wizardOpen, setWizardOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterProject, setFilterProject] = useState('')
  const [campaignStats, setCampaignStats] = useState({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState(null)
  const [wizardSendProgress, setWizardSendProgress] = useState(null)
  const [activeCampaignId, setActiveCampaignId] = useState(null)

  const [isTourMode, setIsTourMode] = useState(false)

  // ✅ HOOKS DEL TOUR
  const { startTour, pauseTour, resumeTour } = useTour()
  const tourSteps = getCampaignTourSteps(tCommon)
  const wizardSteps = getCampaignWizardTourSteps(tCommon)
  const tourOptionsRef = useRef(null)

  const statusConfig = getStatusConfig(t)

  // ✅ ESCUCHAR REANUDACIÓN DESDE EL SUBTOUR DEL WIZARD
  useEffect(() => {
    const handleResume = () => {
      // Reanuda en el índice 3 (#campaigns-data-table) después de cerrar el wizard
      resumeTour(3, tourSteps, tourOptionsRef.current)
    }
    window.addEventListener('tour-resume-campaign-wizard', handleResume)
    return () => window.removeEventListener('tour-resume-campaign-wizard', handleResume)
  }, [resumeTour, tourSteps])

  useEffect(() => {
    const filters = {}
    if (filterStatus) filters.status = filterStatus
    if (filterProject) filters.projectId = filterProject
    fetchCampaigns(filters)
  }, [filterStatus, filterProject, fetchCampaigns])

  useEffect(() => {
    const sendingCampaigns = campaigns.filter(c => c.status === 'enviando')
    
    if (sendingCampaigns.length > 0) {
      sendingCampaigns.forEach(campaign => {
        startStatsPolling(campaign._id, (stats) => {
          setCampaignStats(prev => ({
            ...prev,
            [campaign._id]: stats
          }))
          
          if (activeCampaignId === campaign._id) {
            setWizardSendProgress(stats)
          }
        })
      })
    }

    return () => {
      stopStatsPolling()
    }
  }, [campaigns, startStatsPolling, stopStatsPolling, activeCampaignId])

  const handleCreate = () => {
    setSelectedCampaign(null)
    setWizardSendProgress(null)
    setActiveCampaignId(null)
    setWizardOpen(true)
  }

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign)
    setWizardSendProgress(null)
    setActiveCampaignId(campaign._id)
    setWizardOpen(true)
  }

  const handleQuickSend = (campaign) => {
    if (campaign.status === 'borrador' || campaign.status === 'programada') {
      setSelectedCampaign(campaign)
      setWizardSendProgress(null)
      setActiveCampaignId(campaign._id)
      setWizardOpen(true)
    }
  }

const handleCreateCampaign = async (data) => {
  console.log('📝 handleCreateCampaign called with:', data)
  try {
    const newCampaign = await createCampaign(data)
    console.log('✅ Campaign created successfully:', newCampaign)
    setActiveCampaignId(newCampaign._id)
    return newCampaign
  } catch (err) {
    console.error('❌ Error creating campaign:', err)
    throw err
  }
}

  const handlePreview = async (id) => {
    return await previewCampaign(id)
  }

  const handleSend = async (campaign, isResend = false) => {
    if (isResend) {
      if (!window.confirm(t('sendAgainConfirm'))) {
        return
      }
    }
    
    const campaignId = campaign._id
    const result = await sendCampaign(campaignId)
    
    startStatsPolling(campaignId, (stats) => {
      setCampaignStats(prev => ({
        ...prev,
        [campaignId]: stats
      }))
      setWizardSendProgress(stats)
    })
    
    return result
  }

  const handleDeleteClick = (campaign) => {
    setCampaignToDelete(campaign)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (campaignToDelete) {
      await deleteCampaign(campaignToDelete._id)
      setDeleteDialogOpen(false)
      setCampaignToDelete(null)
    }
  }

  const handleRefresh = () => {
    fetchCampaigns()
  }

  const handleCloseWizard = () => {
    setWizardOpen(false)
    setSelectedCampaign(null)
    setWizardSendProgress(null)
    setActiveCampaignId(null)
  }

  const handleResendFromTable = async (campaign) => {
    if (!window.confirm(t('sendAgainConfirm'))) {
      return
    }
    
    try {
      const campaignId = campaign._id
      const result = await sendCampaign(campaignId)
      
      setSelectedCampaign(campaign)
      setActiveCampaignId(campaignId)
      setWizardSendProgress(null)
      setWizardOpen(true)
      
      startStatsPolling(campaignId, (stats) => {
        setCampaignStats(prev => ({
          ...prev,
          [campaignId]: stats
        }))
        setWizardSendProgress(stats)
      })
      
      return result
    } catch (err) {
      console.error('Error resending campaign:', err)
    }
  }

  const handleSendFromTable = (campaign, isResend = false) => {
    if (isResend) {
      handleResendFromTable(campaign)
    } else {
      handleQuickSend(campaign)
    }
  }

// apps/mv-crm/src/pages/Campaigns.jsx

// ✅ CORREGIDO: Verificar qué devuelve el servicio
const handleCreateTemplate = async (templateData) => {
  try {
    const response = await messageTemplateService.create(templateData)
    // Si el servicio devuelve el objeto directamente:
    return response
    // Si devuelve { data: {...} }:
    // return response.data
  } catch (err) {
    console.error('Error creating template:', err)
    throw err
  }
}
  // ✅ NUEVO: Función para abrir el wizard desde el tour
  const handleCreateForTour = () => {
    setSelectedCampaign(null)
    setWizardSendProgress(null)
    setActiveCampaignId(null)
    setIsTourMode(true) // Activamos el modo silencioso
    setWizardOpen(true)
  }


  // ✅ LÓGICA DE INTERCEPCIÓN DEL TOUR BLINDADA (Corregida para 3 avances)
  const handleTourNextClick = (driverObj) => {
    const currentIndex = driverObj.getActiveIndex()
    console.log('🔍 Main Tour Next Click - Índice actual:', currentIndex)
    
    // Índice 2 es el botón de Crear Campaña en la página principal
    if (currentIndex === 2) {
      console.log('🚀 Iniciando subtour del Wizard...')
      handleCreateForTour()
      pauseTour()
      
      setTimeout(() => {
        startTour(campaignWizardTourConfig.id, wizardSteps, {
          onNextClick: (driver) => {
            const currentTourStep = driver.getActiveIndex()
            console.log('🎯 Wizard Tour onNextClick - Paso actual del wizard:', currentTourStep)
            
            // ✅ Hacemos clic automático en "Continuar" en los pasos 4, 6 y 7
            // Paso 4: para avanzar del Paso 1 al Paso 2 del formulario
            // Paso 6: para avanzar del Paso 2 al Paso 3 del formulario
            // Paso 7: para avanzar del Paso 3 al Paso 4 del formulario (¡ESTE FALTABA!)
            if (currentTourStep === 4 || currentTourStep === 6 || currentTourStep === 7) {
              console.log(`👉 Paso ${currentTourStep} detectado: Haciendo clic automático en el botón "Continuar" del formulario`)
              const formNextBtn = document.getElementById('wizard-continue-btn')
              
              if (formNextBtn) {
                formNextBtn.click() // Esto dispara handleNext y avanza el formulario
              } else {
                console.error('❌ No se encontró el botón #wizard-continue-btn en el DOM')
              }
              
              // Esperamos a que React renderice el nuevo paso del formulario antes de mover el tour
              setTimeout(() => {
                console.log(`⏭️ Avanzando el tour al Paso ${currentTourStep + 1}`)
                driver.moveNext()
              }, 800)
            } else {
              // Para todos los demás pasos, solo avanzamos el popover del tour normalmente
              console.log('⏭️ Avance normal del popover del tour')
              driver.moveNext()
            }
          },
          onCloseClick: () => {
            console.log('🔙 Tour del wizard cerrado por el usuario')
            setIsTourMode(false)
            window.dispatchEvent(new CustomEvent('tour-resume-campaign-wizard'))
          },
          onDestroyStarted: () => {
            console.log('💥 Tour del wizard destruido')
            setIsTourMode(false)
            window.dispatchEvent(new CustomEvent('tour-resume-campaign-wizard'))
          }
        })
      }, 400)
      return
    }
    
    // Para el resto de los pasos del tour principal, comportamiento normal
    driverObj.moveNext()
  }

  const tourOptions = {
    onNextClick: handleTourNextClick,
    onPrevClick: (driverObj) => driverObj.movePrevious()
  }
  tourOptionsRef.current = tourOptions


  const columns = useCampaignColumns({
    t,
    projects,
    LEAD_STAGES,
    campaignStats,
    onEdit: handleEdit,
    onDelete: handleDeleteClick,
    onSend: handleSendFromTable,
    onRefresh: handleRefresh
  })

  return (
    <PageLayout title={t('title')} titleBold={t('titleBold')} topbarLabel={t('topbarLabel')} subtitle={t('subtitle')}>
      {/* ✅ ID: Contenedor principal */}
      <Box id="campaigns-page-container" sx={{ p: 3 }}>
        
        {/* ✅ Botón del Tour */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <TourButton 
            tourId={campaignTourConfig.id}
            steps={tourSteps}
            label={tCommon('tour.campaigns.button', 'Ver guía de campañas')}
            options={tourOptions}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          {/* ✅ ID: Filtros */}
          <Box id="campaigns-filters" display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000000ff', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {t('filters')}:
            </Typography>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{t('status')}</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label={t('status')} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0 }}>
                <MenuItem value=""><em>{t('all')}</em></MenuItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    <Box display="flex" alignItems="center" gap={1}>{config.icon}{config.label}</Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{t('project')}</InputLabel>
              <Select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} label={t('project')} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0 }}>
                <MenuItem value=""><em>{t('all')}</em></MenuItem>
                {projects.map(project => (<MenuItem key={project._id} value={project._id}>{project.name}</MenuItem>))}
              </Select>
            </FormControl>
          </Box>

          {/* ✅ ID: Botón Crear */}
          <Button
            id="campaigns-create-btn"
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
            sx={{ borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px' }}
          >
            {t('createCampaign')}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>{error}</Alert>}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
          {/* ✅ ID: Tabla de Datos */}
          <DataTable
            id="campaigns-data-table"
            columns={columns}
            data={campaigns}
            loading={loading}
            rowKey="_id"
          />
        </motion.div>

        {/* ✅ Elemento invisible para el paso final */}
        <Box id="campaigns-finish" sx={{ height: 1 }} />

      <CampaignWizard
        open={wizardOpen}
        isTourMode={isTourMode} // ✅ PASAMOS LA PROP AL WIZARD
        onClose={() => { 
          setWizardOpen(false); 
          setSelectedCampaign(null); 
          setWizardSendProgress(null); 
          setActiveCampaignId(null);
          setIsTourMode(false); // Limpieza de seguridad
        }}
        campaign={selectedCampaign}
        onCreate={handleCreateCampaign}
        onCreateTemplate={handleCreateTemplate} 
        onSend={handleSend}
        onPreview={handlePreview}
        projects={projects}
        stages={LEAD_STAGES.map(stage => ({ key: stage, name: stage.charAt(0).toUpperCase() + stage.slice(1).replace('_', ' ') }))}
        sendProgress={wizardSendProgress}
      />

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 0,
              border: '1px solid #ececec'
            }
          }}
        >
          <DialogTitle>
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
            >
              {t('deleteConfirm.title')}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                color: '#666'
              }}
            >
              {t('deleteConfirm.message')}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                color: '#000000ff',
                textTransform: 'none'
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              startIcon={<Delete />}
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                textTransform: 'none',
                bgcolor: '#f44336',
                borderRadius: 0,
                '&:hover': { bgcolor: '#d32f2f' }
              }}
            >
              {t('delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageLayout>
  )
}