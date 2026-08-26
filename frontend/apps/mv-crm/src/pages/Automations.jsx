import { useState, useRef, useEffect } from 'react' // ✅ Agregado useRef y useEffect
import { useTranslation } from 'react-i18next'
import { Box, Typography, Button, Paper, Chip, CircularProgress, Alert } from '@mui/material'
import { Add, AutoAwesome } from '@mui/icons-material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import AutomationBuilder from '../components/automations/AutomationBuilder'
import AutomationCard from '../components/automations/AutomationCard'
import { useAutomations } from '../constants/hooks/useAutomations'
import { useProjects } from '@shared/hooks/useProjects'
import { useCrmAgents } from '../constants/hooks/useCrmAgents'

// ✅ NUEVOS IMPORTS PARA EL TOUR
import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getAutomationTourSteps, automationTourConfig } from '../tours/modules/automationTour'
import { getAutomationBuilderTourSteps, automationBuilderTourConfig } from '../tours/features/automationBuilderTour'

export default function Automations() {
  const { t } = useTranslation('automation')
  const { t: tCommon } = useTranslation('common') // ✅ Para las claves del tour
  
  const { automations, loading, error, createAutomation, updateAutomation, deleteAutomation, toggleAutomation, testAutomation } = useAutomations()
  const { projects } = useProjects()
  const { agents } = useCrmAgents()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAutomation, setSelectedAutomation] = useState(null)
  const [testResults, setTestResults] = useState({})

  // ✅ HOOKS DEL TOUR
  const { startTour, pauseTour, resumeTour } = useTour()
  const tourSteps = getAutomationTourSteps(tCommon)
  const builderSteps = getAutomationBuilderTourSteps(tCommon)
  const tourOptionsRef = useRef(null)

  // ✅ ESCUCHAR REANUDACIÓN DESDE EL SUBTOUR DEL BUILDER
  useEffect(() => {
    const handleResume = () => {
      // Reanuda en el índice 3 (#automations-list) después de cerrar el modal
      resumeTour(3, tourSteps, tourOptionsRef.current)
    }
    window.addEventListener('tour-resume-automation-builder', handleResume)
    return () => window.removeEventListener('tour-resume-automation-builder', handleResume)
  }, [resumeTour, tourSteps])

  const handleCreate = () => {
    setSelectedAutomation(null)
    setModalOpen(true)
  }

  const handleEdit = (automation) => {
    setSelectedAutomation(automation)
    setModalOpen(true)
  }

  const handleSave = async (id, data) => {
    if (id) await updateAutomation(id, data)
    else await createAutomation(data)
  }

  const handleDelete = async (id) => await deleteAutomation(id)
  const handleToggle = async (id, isActive) => await toggleAutomation(id, isActive)
  const handleTest = async (id) => {
    try {
      const result = await testAutomation(id, {})
      setTestResults(prev => ({ ...prev, [id]: result }))
    } catch (err) { console.error('Error testing automation:', err) }
  }

  // ✅ LÓGICA DE INTERCEPCIÓN DEL TOUR
  const handleTourNextClick = (driverObj) => {
    const currentIndex = driverObj.getActiveIndex()
    
    // Índice 2 es el botón de Crear Automatización
    if (currentIndex === 2) {
      setSelectedAutomation(null)
      setModalOpen(true)
      pauseTour()
      
      setTimeout(() => {
        startTour(automationBuilderTourConfig.id, builderSteps, {
          onCloseClick: () => window.dispatchEvent(new CustomEvent('tour-resume-automation-builder')),
          onDestroyStarted: () => window.dispatchEvent(new CustomEvent('tour-resume-automation-builder'))
        })
      }, 400)
      return
    }
    
    driverObj.moveNext()
  }

  const tourOptions = {
    onNextClick: handleTourNextClick,
    onPrevClick: (driverObj) => driverObj.movePrevious()
  }
  tourOptionsRef.current = tourOptions

  return (
    <PageLayout title={t('title')} titleBold={t('titleBold')} topbarLabel={t('topbarLabel')} subtitle={t('subtitle')}>
      {/* ✅ ID: Contenedor principal */}
      <Box id="automations-page-container" sx={{ p: 3 }}>
        
        {/* ✅ Botón del Tour */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <TourButton 
            tourId={automationTourConfig.id}
            steps={tourSteps}
            label={tCommon('tour.automation.button', 'Ver guía de automatizaciones')}
            options={tourOptions}
          />
        </Box>

        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          {/* ✅ ID: Estadísticas */}
          <Box id="automations-stats" display="flex" gap={1} alignItems="center">
            <Chip label={`${automations.length} ${t('total')}`} size="small" sx={{ bgcolor: '#000', color: '#fff', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', fontWeight: 600 }} />
            <Chip label={`${automations.filter(a => a.isActive).length} ${t('active')}`} size="small" sx={{ bgcolor: '#4caf50', color: '#fff', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', fontWeight: 600 }} />
          </Box>

          {/* ✅ ID: Botón Crear */}
          <Button
            id="automations-create-btn"
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
            sx={{ borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px' }}
          >
            {t('createAutomation')}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={8}><CircularProgress /></Box>
        ) : automations.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, border: '1px solid #ececec', borderRadius: 1, bgcolor: '#fff', textAlign: 'center' }}>
            <AutoAwesome sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', color: '#888', letterSpacing: '0.5px', mb: 1 }}>{t('empty.title')}</Typography>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#aaa', letterSpacing: '0.5px', mb: 3 }}>{t('empty.description')}</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={handleCreate} sx={{ borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              {t('createAutomation')}
            </Button>
          </Paper>
        ) : (
          // ✅ ID: Lista de automatizaciones
          <Box id="automations-list" display="flex" flexDirection="column" gap={2}>
            {automations.map((automation, index) => (
              <AutomationCard
                key={automation._id}
                automation={automation}
                isFirst={index === 0} // ✅ PASAR isFirst para el tour
                projects={projects}
                agents={agents}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTest={handleTest}
                onToggle={handleToggle}
                testResult={testResults[automation._id]}
              />
            ))}
          </Box>
        )}

        {/* ✅ Elemento invisible para el paso final */}
        <Box id="automations-finish" sx={{ height: 1 }} />

        <AutomationBuilder
          open={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedAutomation(null); }}
          automation={selectedAutomation}
          onSave={handleSave}
          onDelete={handleDelete}
          onTest={testAutomation}
          projects={projects}
          agents={agents}
        />
      </Box>
    </PageLayout>
  )
}