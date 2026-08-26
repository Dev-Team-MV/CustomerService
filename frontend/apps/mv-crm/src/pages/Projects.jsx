import { useState, useRef, useEffect } from 'react'
import { Box, Typography, TextField, InputAdornment, Button } from '@mui/material'
import { Search } from '@mui/icons-material'
import { motion } from 'framer-motion'
import DataTable from '@shared/components/table/DataTable'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import StatsStrip from '@shared/components/LayoutComponents/StatsStrip'
import CreateProjectDialog from '../components/CreateProjectDialog'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import ProjectStatsModal from '../components/stats/ProjectStatsModal'
import { useProjects } from '@shared/hooks/useProjects'
import { useProjectColumns } from '../constants/Columns/projects'
import useModalState from '@shared/hooks/useModalState'

// ✅ IMPORTS PARA EL TOUR
import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getProjectsTourSteps, projectsTourConfig } from '../tours/modules/projectsTour'
import { getProjectStatsTourSteps, projectStatsTourConfig } from '../tours/features/projectStatsTour'
import { getCreateProjectTourSteps, createProjectTourConfig } from '../tours/modules/createProjectTour' // Ajusta la ruta si es diferente

export default function Projects() {
  const { t } = useTranslation('project')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const [statsOpen, setStatsOpen] = useState(false)
  const [statsProject, setStatsProject] = useState(null)

  const {
    projects,
    filtered,
    loading,
    search,
    setSearch,
    allBalance,
    handleProjectCreated,
    handleDelete,
  } = useProjects()

  const projectModal = useModalState()

  // ✅ ESTADOS DEL TOUR
  const [isTourMode, setIsTourMode] = useState(false)
  const { startTour, pauseTour, resumeTour } = useTour()
  const tourSteps = getProjectsTourSteps(tCommon)
  const statsSteps = getProjectStatsTourSteps(tCommon)
  const createSteps = getCreateProjectTourSteps(tCommon)
  const tourOptionsRef = useRef(null)

  const openStats = (project) => {
    setStatsProject(project)
    setStatsOpen(true)
  }

  const columns = useProjectColumns({
    t,
    navigate,
    openStats,
    setEditProject: projectModal.openModal,
    setCreateOpen: () => projectModal.openModal(),
    handleDelete,
  })

  // ✅ LÓGICA DE INTERCEPCIÓN DEL TOUR (Blindada y con Logs Detallados)
  const handleTourNextClick = (driverObj) => {
    const currentIndex = driverObj.getActiveIndex()
    console.log('🔍 Tour Next Click - Índice actual:', currentIndex)
    
    setIsTourMode(true)

    // ==========================================
    // PASO 1: Botón Crear Proyecto (Iniciar subtour)
    // ==========================================
    if (currentIndex === 1) {
      const createBtn = document.getElementById('projects-create-btn')
      if (createBtn) {
        createBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        pauseTour()
        
        const checkCreateModal = setInterval(() => {
          if (document.getElementById('create-project-dialog')) {
            clearInterval(checkCreateModal)
            console.log('✅ Modal de creación encontrado. Iniciando subtour...')
            
            setTimeout(() => {
              startTour(createProjectTourConfig.id, createSteps, {
                onNextClick: (driver) => driver.moveNext(),
                onCloseClick: () => {
                  projectModal.closeModal()
                  setTimeout(() => resumeTour(2, tourSteps, tourOptionsRef.current), 400)
                },
                onDestroyStarted: () => {
                  projectModal.closeModal()
                  setTimeout(() => resumeTour(2, tourSteps, tourOptionsRef.current), 400)
                }
              })
            }, 400)
          }
        }, 150)
      } else {
        driverObj.moveNext()
      }
      return
    }

    // ==========================================
    // PASO 10: Botón Estadísticas (Iniciar subtour de stats)
    // ==========================================
    // ==========================================
    // PASO 10: Botón Estadísticas (Iniciar subtour de stats)
    // ==========================================
    if (currentIndex === 10) {
      if (filtered.length > 0) {
        console.log('✅ Abriendo modal de estadísticas para el primer proyecto...')
        openStats(filtered[0])
        pauseTour()
        
        const checkStatsModal = setInterval(() => {
          const modalElement = document.getElementById('project-stats-modal')
          if (modalElement) {
            clearInterval(checkStatsModal)
            console.log('✅ Modal de estadísticas encontrado en el DOM.')
            
            setTimeout(() => {
              startTour(projectStatsTourConfig.id, statsSteps, {
                onNextClick: (driver) => {
                  const currentStepIndex = driver.getActiveIndex()
                  console.log('🔍 Subtour stats - Paso actual:', currentStepIndex)
                  
                  if (currentStepIndex === 4) {
                    const clientsTab = document.getElementById('project-stats-tab-clients')
                    if (clientsTab) {
                      clientsTab.click()
                      setTimeout(() => driver.moveNext(), 500)
                      return
                    }
                  }
                  driver.moveNext()
                },
                onCloseClick: () => {
                  setStatsOpen(false)
                  setStatsProject(null)
                  setTimeout(() => resumeTour(11, tourSteps, tourOptionsRef.current), 400) // ✅ Reanuda en el paso 11
                },
                onDestroyStarted: () => {
                  setStatsOpen(false)
                  setStatsProject(null)
                  setTimeout(() => resumeTour(11, tourSteps, tourOptionsRef.current), 400) // ✅ Reanuda en el paso 11
                }
              })
            }, 600)
          }
        }, 200)
      } else {
        driverObj.moveNext()
      }
      return
    }

    // ==========================================
    // PASO 11: Botón Ver Detalles (Navegar a ProjectDetails)
    // ==========================================
    if (currentIndex === 11) {
      if (filtered.length > 0) {
        const firstProject = filtered[0]
        // ✅ Guardamos la bandera para que ProjectDetails sepa que debe iniciar su tour
        sessionStorage.setItem('startProjectDetailsTour', 'true')
        
        const viewButtons = document.querySelectorAll('#project-action-view')
        if (viewButtons.length > 0) {
          viewButtons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
        } else {
          navigate(`/projects/${firstProject._id}`)
        }
      } else {
        driverObj.moveNext()
      }
      return
    }

    // ==========================================
    // RESTO DE PASOS: Avance normal
    // ==========================================
    driverObj.moveNext()
  }

  const tourOptions = {
    onNextClick: handleTourNextClick,
    onPrevClick: (driverObj) => driverObj.movePrevious(),
    onDestroy: () => {
      console.log('🛑 Tour de proyectos destruido, limpiando modo tour')
      setIsTourMode(false)
      projectModal.closeModal()
      setStatsOpen(false)
    }
  }
  tourOptionsRef.current = tourOptions

  const unifiedButtonSx = { 
    borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } 
  }
  
  const inputSx = { 
    fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, 
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' }
  }

  return (
    <PageLayout
      title={t('title')}
      titleBold={t('titleBold')}
      topbarLabel={t('topbarLabel')}
      subtitle={t('subtitle', { count: projects.length })}
    >
      {/* ✅ ID: Contenedor Principal */}
      <Box id="projects-page-container">
        
        {/* ✅ Botón del Tour */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, pb: 0 }}>
          <TourButton 
            tourId={projectsTourConfig.id}
            steps={tourSteps}
            label={tCommon('tour.projects.button', 'Ver guía de Proyectos')}
            options={tourOptions}
          />
        </Box>

        {/* Quick Actions */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            id="projects-create-btn" // ✅ ID para el tour
            variant="contained"
            color="primary"
            onClick={() => projectModal.openModal()}
            sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', fontWeight: 600, '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}
          >
            + {t('table.create')}
          </Button>
        </Box>
        
        <CreateProjectDialog
          open={projectModal.open}
          onClose={projectModal.closeModal}
          onCreated={handleProjectCreated}
          initialData={projectModal.data}
          editMode={!!projectModal.data}
        />

        {/* ✅ ID: Stats Strip */}
        <Box id="projects-stats-strip">
          <StatsStrip stats={[
            { label: t('stats.total'), value: projects.length },
            { label: t('stats.active'), value: projects.filter(p => p.isActive).length },
            { label: t('stats.types'), value: [...new Set(projects.map(p => p.type))].length }
          ]} />
        </Box>

        {/* Search & Table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
          {/* ✅ ID: Barra de Búsqueda */}
          <Box id="projects-search-bar" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
<TextField
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder={t('searchPlaceholder')}
  size="small"
  sx={{ width: 320 }}
  slotProps={{
    input: {
      sx: {
        fontFamily: '"Courier New", monospace', // texto escrito
        '&::placeholder': {
          fontFamily: '"Courier New", monospace',
          opacity: 1,
        },
      },
      startAdornment: (
        <InputAdornment position="start">
          <Search sx={{ fontSize: 18, color: '#bbb' }} />
        </InputAdornment>
      ),
    },
  }}
/>
            {search && (
              <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#aaa', letterSpacing: '1.5px' }}>
                {filtered.length} {filtered.length !== 1 ? t('results', 'resultados') : t('result', 'resultado')}
              </Typography>
            )}
          </Box>

          {/* ✅ ID: Tabla de Datos */}
          <Box id="projects-data-table">
            <DataTable
              columns={columns}
              data={filtered}
              loading={loading}
              rowKey="_id"
              sx={{
                background: '#fff', 
                border: '1px solid #e8e8e8', 
                borderRadius: 0,
                '& .MuiTableHead-root': { background: '#0a0a0a' },
                '& .MuiTableHead-root .MuiTableCell-root': { 
                  fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: '1px', 
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.1)', py: 1.8, fontWeight: 600 
                },
                '& .MuiTableBody-root .MuiTableRow-root': { transition: 'background 0.15s ease', cursor: 'pointer', '&:hover': { background: '#f7f7f7' } },
                '& .MuiTableBody-root .MuiTableCell-root': { borderBottom: '1px solid #f2f2f2', py: 1.6, fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.875rem' },
                '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': { background: '#fdfdfd' },
                '& .MuiTablePagination-root': { fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#aaa', borderTop: '1px solid #ececec', background: '#fafafa', borderRadius: 0 },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: '0.5px', color: '#aaa' },
                '& .MuiTablePagination-actions .MuiIconButton-root': { color: '#aaa', borderRadius: 0, '&:hover': { background: '#f0f0f0', color: '#000' } }
              }}
            />
          </Box>
        </motion.div>

        {/* ✅ Elemento invisible para el paso final */}
        <Box id="projects-finish" sx={{ height: 1 }} />
      </Box>

      {/* Stats Modal */}
      <ProjectStatsModal
        open={statsOpen}
        onClose={() => { setStatsOpen(false); setStatsProject(null) }}
        project={statsProject}
        allBalance={allBalance}
      />
    </PageLayout>
  )
}