import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import {
  Box, Typography, Button, TextField, InputAdornment, CircularProgress, Alert, ToggleButton, ToggleButtonGroup
} from '@mui/material'
import { Add, Search, TrendingUp, CalendarToday } from '@mui/icons-material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import KanbanBoard from '../components/leads/KanbanBoard'
import LeadModal from '../components/leads/LeadModal'
import LeadDetails from '../components/leads/LeadDetails'
import ConvertLeadModal from '../components/leads/ConvertLeadModal'
import { useLeads } from '../constants/hooks/useLeads'
import { useCrmAgents } from '../constants/hooks/useCrmAgents'
import { useProjects } from '@shared/hooks/useProjects'
import { LEAD_STAGES, STAGE_COLORS } from '../services/leadService'
import crmReportsService from '../services/crmReportsService'
import ExportButton from '../components/ExportButton'
import leadService from '../services/leadService'

// ✅ IMPORTS PARA EL TOUR
import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getSalesTourSteps, salesTourConfig } from '../tours/modules/salesTour'
import { getLeadModalTourSteps, leadModalTourConfig } from '../tours/features/leadModalTour'
import { getLeadDetailsTourSteps, leadDetailsTourConfig } from '../tours/features/leadDetailsTour'

export default function Sales() {
  const { t } = useTranslation('leads')
  const { t: tCommon } = useTranslation('common')
  
  const [searchParams, setSearchParams] = useSearchParams()
  const leadIdFromUrl = searchParams.get('leadId')
  
  const {
    stages,
    groupedByStage,
    loading,
    error,
    createLead,
    updateLead,
    moveLead,
    deleteLead,
    convertToCustomer,
    fetchLeads
  } = useLeads()

  const { agents } = useCrmAgents()
  const { projects } = useProjects()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [detailsLead, setDetailsLead] = useState(null)
  const [convertLead, setConvertLead] = useState(null)
  const [conversionResult, setConversionResult] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')

  // ✅ ESTADOS DEL TOUR
  const [isTourMode, setIsTourMode] = useState(false)
  const { startTour, pauseTour, resumeTour } = useTour()
  const tourSteps = getSalesTourSteps(tCommon)
  const modalSteps = getLeadModalTourSteps(tCommon)
  const detailsSteps = getLeadDetailsTourSteps(tCommon)
  const tourOptionsRef = useRef(null)

  useEffect(() => {
    if (leadIdFromUrl && !loading) {
      loadLeadFromUrl(leadIdFromUrl)
    }
  }, [leadIdFromUrl, loading])

  const loadLeadFromUrl = async (leadId) => {
    try {
      for (const stageKey of Object.keys(groupedByStage)) {
        const lead = groupedByStage[stageKey].find(l => l._id === leadId)
        if (lead) {
          setDetailsLead(lead)
          return
        }
      }
      const lead = await leadService.getById(leadId)
      if (lead) setDetailsLead(lead)
    } catch (err) {
      console.error('Error loading lead from URL:', err)
    }
  }

  const handleAddLead = (stageKey) => {
    setEditingLead({ stage: stageKey })
    setModalOpen(true)
  }

  const handleEditLead = (lead) => {
    setEditingLead(lead)
    setModalOpen(true)
    setDetailsLead(null)
  }

  const handleViewLead = (lead) => {
    setDetailsLead(lead)
  }

  const handleSaveLead = async (data, leadId) => {
    try {
      if (leadId) await updateLead(leadId, data)
      else await createLead(data)
      setModalOpen(false)
      setEditingLead(null)
      await fetchLeads()
    } catch (err) {
      console.error('Error saving lead:', err)
    }
  }

  const handleDeleteLead = async (id) => {
    if (window.confirm(t('deleteConfirm'))) {
      try {
        await deleteLead(id)
        setDetailsLead(null)
        await fetchLeads()
      } catch (err) {
        console.error('Error deleting lead:', err)
      }
    }
  }

  const handleMoveLead = async (leadId, stageKey) => {
    await moveLead(leadId, stageKey)
  }

  const handleConvertLead = (lead) => {
    setConvertLead(lead)
    setConversionResult(null)
    setDetailsLead(null)
  }

  const handleConvertConfirm = async (leadId, conversionData = {}) => {
    try {
      const result = await convertToCustomer(leadId, conversionData)
      setConversionResult(result)
    } catch (err) {
      console.error('Error converting lead:', err)
    }
  }

  const handleCloseConversion = () => {
    setConvertLead(null)
    setConversionResult(null)
  }

  const handleScoreUpdate = async () => {
    await fetchLeads()
  }

  const filteredGroupedByStage = Object.keys(groupedByStage).reduce((acc, stageKey) => {
    let stageLeads = groupedByStage[stageKey].filter(lead => 
      lead.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
      lead.phone?.includes(searchValue)
    )

    if (sortBy === 'score') {
      stageLeads.sort((a, b) => (b.score || 0) - (a.score || 0))
    }

    acc[stageKey] = stageLeads
    return acc
  }, {})

  const exportFilters = [
    { field: 'fromDate', label: t('filters.fromDate'), type: 'date', required: false },
    { field: 'toDate', label: t('filters.toDate'), type: 'date', required: false },
    {
      field: 'projectId', label: t('filters.project'), type: 'select',
      placeholder: t('filters.allProjects'), required: false,
      options: projects.map(p => ({ value: p._id, label: p.name }))
    },
    {
      field: 'stage', label: t('filters.stage'), type: 'select',
      placeholder: t('filters.allStages'), required: false,
      options: LEAD_STAGES.map(stage => ({
        value: stage, label: t(`stages.${stage}`),
        render: (opt) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 10, height: 10, borderRadius: 0, bgcolor: STAGE_COLORS[stage] }} />
            {opt.label}
          </Box>
        )
      }))
    },
    {
      field: 'assignedTo', label: t('filters.assignedTo'), type: 'select',
      placeholder: t('filters.allAgents'), required: false,
      options: agents.map(agent => ({ value: agent._id, label: `${agent.firstName} ${agent.lastName} (${agent.role})` }))
    }
  ]


  // ✅ LÓGICA DE INTERCEPCIÓN DEL TOUR
  const handleTourNextClick = (driverObj) => {
    const currentIndex = driverObj.getActiveIndex()
    console.log('🔍 Tour Next Click - Índice actual:', currentIndex)
    
    setIsTourMode(true)

    // PASO 1: Botón Nuevo Lead (Iniciar subtour del modal)
    if (currentIndex === 1) {
      const newLeadBtn = document.getElementById('sales-new-lead-btn')
      if (newLeadBtn) {
        console.log('✅ Botón encontrado, haciendo clic...')
        newLeadBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        pauseTour()
        
        let attempts = 0
        const checkModal = setInterval(() => {
          attempts++
          const modalEl = document.getElementById('lead-modal-dialog')
          
          if (attempts % 10 === 0) {
            console.log(`🔍 Buscando modal... (intento ${attempts})`, modalEl ? 'ENCONTRADO' : 'NO ENCONTRADO')
          }

          if (modalEl) {
            clearInterval(checkModal)
            console.log('✅ Modal de Lead encontrado en el DOM. Iniciando subtour...')
            setTimeout(() => {
              startTour(leadModalTourConfig.id, modalSteps, {
                onNextClick: (driver) => driver.moveNext(),
                onCloseClick: () => {
                  document.getElementById('lead-modal-cancel-btn')?.click()
                  setTimeout(() => resumeTour(2, tourSteps, tourOptionsRef.current), 400)
                },
                onDestroyStarted: () => {
                  document.getElementById('lead-modal-cancel-btn')?.click()
                  setTimeout(() => resumeTour(2, tourSteps, tourOptionsRef.current), 400)
                }
              })
            }, 400)
          } else if (attempts > 50) {
            // Timeout de seguridad para evitar bucles infinitos
            clearInterval(checkModal)
            console.warn('⚠️ Timeout: No se encontró el modal después de 50 intentos. Avanzando...')
            driverObj.moveNext()
          }
        }, 150)
      } else {
        console.warn('⚠️ Botón sales-new-lead-btn no encontrado')
        driverObj.moveNext()
      }
      return
    }

    // PASO 5: Tarjeta de Lead (Iniciar subtour de detalles)
    if (currentIndex === 5) {
      const firstLeadCard = document.querySelector('[data-tour-lead-card="true"]')
      if (firstLeadCard) {
        console.log('✅ Tarjeta de Lead encontrada. Simulando clic...')
        firstLeadCard.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        pauseTour()
        
        const checkDrawer = setInterval(() => {
          if (document.getElementById('lead-details-drawer')) {
            clearInterval(checkDrawer)
            console.log('✅ Drawer de Detalles encontrado. Iniciando subtour...')
            setTimeout(() => {
              startTour(leadDetailsTourConfig.id, detailsSteps, {
                onNextClick: (driver) => driver.moveNext(),
                onCloseClick: () => {
                  document.getElementById('lead-details-close-btn')?.click()
                  setTimeout(() => resumeTour(6, tourSteps, tourOptionsRef.current), 400)
                },
                onDestroyStarted: () => {
                  document.getElementById('lead-details-close-btn')?.click()
                  setTimeout(() => resumeTour(6, tourSteps, tourOptionsRef.current), 400)
                }
              })
            }, 400)
          }
        }, 150)
      } else {
        console.warn('⚠️ No hay tarjetas de Lead para mostrar. Avanzando...')
        driverObj.moveNext()
      }
      return
    }

    // Para el resto de pasos, avance normal
    driverObj.moveNext()
  }

  const tourOptions = {
    onNextClick: handleTourNextClick,
    onPrevClick: (driverObj) => driverObj.movePrevious(),
    onDestroy: () => {
      console.log('🛑 Tour de Ventas destruido, limpiando modo tour')
      setIsTourMode(false)
      setModalOpen(false)
      setDetailsLead(null)
    }
  }
  tourOptionsRef.current = tourOptions

  const unifiedButtonSx = { borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }
  const inputSx = { fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }, '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' } }

  return (
    <PageLayout title={t('title')} titleBold={t('titleBold')} topbarLabel={t('topbarLabel')} subtitle={t('description')}>
      {/* ✅ ID: Contenedor Principal */}
      <Box id="sales-page-container" sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* ✅ Botón del Tour */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <TourButton 
            tourId={salesTourConfig.id}
            steps={tourSteps}
            label={tCommon('tour.sales.button', 'Ver guía de Ventas')}
            options={tourOptions}
          />
        </Box>

        <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
          {/* ✅ ID: Búsqueda y Filtros */}
          <Box id="sales-search-filter" sx={{ display: 'flex', gap: 2, flex: 1, flexWrap: 'wrap' }}>
            <TextField
              placeholder={t('searchPlaceholder')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              size="small"
              sx={{
                width: 300,
                ...inputSx,
                '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace' },
                '& .MuiInputBase-input::placeholder': { fontFamily: '"Courier New", monospace', opacity: 1 },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#aaa' }} />
                  </InputAdornment>
                ),
              }}
            />

            <ToggleButtonGroup value={sortBy} exclusive onChange={(e, value) => value && setSortBy(value)} size="small" sx={{ '& .MuiToggleButton-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem', textTransform: 'none', borderRadius: 0, py: 0.75, border: '1px solid #000', color: '#000', '&.Mui-selected': { bgcolor: '#000', color: '#fff' } } }}>
              <ToggleButton value="createdAt"><CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />{t('sort.recent', 'Recientes')}</ToggleButton>
              <ToggleButton value="score"><TrendingUp sx={{ fontSize: 14, mr: 0.5 }} />{t('sort.priority', 'Prioridad')}</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap" sx={{ ml: 'auto' }}>
            {/* ✅ ID: Botón Exportar */}
            <Box id="sales-export-btn">
              <ExportButton label={t('exportButton')} exportFn={crmReportsService.exportLeads} withModal={true} filters={exportFilters} />
            </Box>
            
            {/* ✅ ID: Botón Nuevo Lead */}
            <Button id="sales-new-lead-btn" variant="contained" startIcon={<Add />} onClick={() => handleAddLead('nuevo')} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', fontWeight: 600, '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
              {t('newLead')}
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0, border: '1px solid', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" flex={1}><CircularProgress /></Box>
        ) : (
          // ✅ ID: Kanban Board (Wrapper simple para no romper el layout interno del Kanban)
          <Box id="sales-kanban-board" sx={{ width: '100%' }}>
            <KanbanBoard
              stages={stages}
              groupedByStage={filteredGroupedByStage}
              onLeadClick={handleViewLead}
              onAddLead={handleAddLead}
              onEditLead={handleEditLead}
              onDeleteLead={handleDeleteLead}
              onMoveLead={handleMoveLead}
              onConvertLead={handleConvertLead}
              onScoreUpdate={handleScoreUpdate}
            />
          </Box>
        )}

        {/* ✅ Elemento invisible para el paso final */}
        <Box id="sales-finish" sx={{ height: 1 }} />

        <LeadModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingLead(null) }}
          lead={editingLead}
          onSave={handleSaveLead}
        />

        <LeadDetails
          lead={detailsLead}
          open={Boolean(detailsLead)}
          onClose={() => { setDetailsLead(null) }}
          onEdit={handleEditLead}
          onDelete={handleDeleteLead}
          onConvert={handleConvertLead}
        />

        <ConvertLeadModal
          open={Boolean(convertLead)}
          onClose={handleCloseConversion}
          lead={convertLead}
          onConvert={handleConvertConfirm}
          conversionResult={conversionResult}
        />
      </Box>
    </PageLayout>
  )
}