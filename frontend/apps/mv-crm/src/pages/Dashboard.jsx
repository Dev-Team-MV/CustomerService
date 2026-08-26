import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Divider, Avatar, Snackbar, Alert, useMediaQuery, useTheme } from '@mui/material'
import { ChevronRight } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@shared/context/AuthContext'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import StatsStrip from '@shared/components/LayoutComponents/StatsStrip'
import CreateProjectDialog from '../components/CreateProjectDialog'
import ProjectCard, { Counter } from '../components/dashboard/ProjectCard'
import { useTranslation } from 'react-i18next'
import QuickActionsPanel from '../components/QuickActionsPanel'
import ResidentDialog from '@shared/components/Modals/ResidentDialog'
import { useResidents } from '@shared/hooks/useResidents'
import { useProjects } from '@shared/hooks/useProjects'
import useModalState from '@shared/hooks/useModalState'

import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getDashboardTourSteps, dashboardTourConfig } from '../tours/modules/dashboardTour'
import { getCreateProjectTourSteps, createProjectTourConfig } from '../tours/modules/createProjectTour'
import { getResidentTourSteps, residentTourConfig } from '@shared/tours/modals/residentTour'
// ✅ NUEVO: Import del subtour de búsqueda global
import { getGlobalSearchTourSteps, globalSearchTourConfig } from '../tours/features/globalSearchTour'
// ✅ NUEVO: Import del subtour de Creador de Notificaciones
import { getBroadcastMessageTourSteps, broadcastMessageTourConfig } from '@shared/tours/modals/notificationCreatorTour'
import { getNotificationDrawerTourSteps, notificationDrawerTourConfig } from '../tours/features/notificationDrawerTour'


const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val ?? 0)

// ✅ ÍNDICES ACTUALIZADOS
const GLOBAL_SEARCH_STEP_INDEX = 3
const RESUME_AFTER_GLOBAL_SEARCH_STEP_INDEX = 4

const NOTIFICATION_CREATOR_STEP_INDEX = 4 // (Nota: si el creator es el 4, el bell podría ser el 5. Ajusta según tu dashboardTour.js real)
const RESUME_AFTER_NOTIF_CREATOR_STEP_INDEX = 5

const NOTIFICATION_BELL_STEP_INDEX = 5 // ✅ Step de la Campana
const RESUME_AFTER_NOTIFICATION_BELL_STEP_INDEX = 6 // ✅ Step siguiente (Reloj)

const CREATE_PROJECT_STEP_INDEX = 8
const ADD_CLIENT_STEP_INDEX = 9
const RESUME_AFTER_RESIDENT_STEP_INDEX = 10

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [currentTime, setCurrentTime] = useState(new Date())
  const { t } = useTranslation('dashboard')
  const { t: tCommon } = useTranslation('common') // Para las claves del tour de notificaciones
  const {t:search} = useTranslation('search') // Para las claves del tour de búsqueda global

  const { startTour, hasCompletedTour, pauseTour, resumeTour, isPaused } = useTour()
  const tourSteps = getDashboardTourSteps(t)
  const createProjectSteps = getCreateProjectTourSteps(t)
  const residentSteps = getResidentTourSteps(t)
  const globalSearchSteps = getGlobalSearchTourSteps(search)
  const broadcastMessageSteps = getBroadcastMessageTourSteps(tCommon) // ✅ Steps de notificaciones
  const notificationDrawerSteps = getNotificationDrawerTourSteps(tCommon) // ✅ Steps del drawer

  const [isTourTransitioning, setIsTourTransitioning] = useState(false)
  const dashboardOptionsRef = useRef(null)

  // ... (tus hooks de useResidents, useProjects, etc. se mantienen igual) ...
  const {
    openDialog, handleOpenDialog, handleCloseDialog, handleSubmit, formData, setFormData,
    selectedUser, handleFieldChange, handlePhoneChange, isFormValid, e164Value, displayVal,
    isPhoneValid, snackbar, handleCloseSnackbar,
  } = useResidents(null, { smsProjectId: import.meta.env.VITE_PROJECT_ID })

  const { projects, filtered, loading, allBalance, handleProjectCreated } = useProjects()
  const projectModal = useModalState()
  
  const [selectedProject, setSelectedProject] = useState(null)
  const [clientCounts, setClientCounts] = useState({})

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ✅ Escuchar reanudación desde Global Search
  useEffect(() => {
    const handleResume = () => {
      const success = resumeTour(RESUME_AFTER_GLOBAL_SEARCH_STEP_INDEX, tourSteps, dashboardOptionsRef.current)
      if (success) setIsTourTransitioning(false)
    }
    window.addEventListener('tour-resume-global-search', handleResume)
    return () => window.removeEventListener('tour-resume-global-search', handleResume)
  }, [resumeTour, tourSteps])

  // ✅ NUEVO: Escuchar reanudación desde Notification Creator
  useEffect(() => {
    const handleResume = () => {
      const success = resumeTour(RESUME_AFTER_NOTIF_CREATOR_STEP_INDEX, tourSteps, dashboardOptionsRef.current)
      if (success) setIsTourTransitioning(false)
    }
    window.addEventListener('tour-resume-notification-creator', handleResume)
    return () => window.removeEventListener('tour-resume-notification-creator', handleResume)
  }, [resumeTour, tourSteps])

    // ✅ NUEVO: Escuchar reanudación desde Notification Drawer
  useEffect(() => {
    const handleResume = () => {
      const success = resumeTour(RESUME_AFTER_NOTIFICATION_BELL_STEP_INDEX, tourSteps, dashboardOptionsRef.current)
      if (success) setIsTourTransitioning(false)
    }
    window.addEventListener('tour-resume-notification-drawer', handleResume)
    return () => window.removeEventListener('tour-resume-notification-drawer', handleResume)
  }, [resumeTour, tourSteps])

  // ✅ Subtour: Búsqueda Global
  const triggerGlobalSearchSubtour = () => {
    if (isTourTransitioning) return
    setIsTourTransitioning(true)
    pauseTour()
    const searchBtn = document.getElementById('topbar-search-btn')
    if (searchBtn) searchBtn.click()
    
    setTimeout(() => {
      startTour(globalSearchTourConfig.id, globalSearchSteps, {
        onCloseClick: () => window.dispatchEvent(new CustomEvent('tour-resume-global-search')),
        onDestroyStarted: () => window.dispatchEvent(new CustomEvent('tour-resume-global-search'))
      })
      setIsTourTransitioning(false)
    }, 400)
  }

  // ✅ NUEVO: Subtour: Creador de Notificaciones
  const triggerNotificationCreatorSubtour = () => {
    if (isTourTransitioning) return
    setIsTourTransitioning(true)
    pauseTour()
    
    // Simular click en el botón de crear notificación (está en PageLayout)
    const notifBtn = document.getElementById('topbar-notification-creator')
    if (notifBtn) notifBtn.click()
    
    setTimeout(() => {
      startTour(broadcastMessageTourConfig.id, broadcastMessageSteps, {
        onCloseClick: () => window.dispatchEvent(new CustomEvent('tour-resume-notification-creator')),
        onDestroyStarted: () => window.dispatchEvent(new CustomEvent('tour-resume-notification-creator'))
      })
      setIsTourTransitioning(false)
    }, 400)
  }

  // ✅ Subtour: Crear Proyecto
  const triggerCreateProjectSubtour = () => {
    if (isTourTransitioning) return
    setIsTourTransitioning(true)
    pauseTour()
    projectModal.openModal()
    
    setTimeout(() => {
      startTour(createProjectTourConfig.id, createProjectSteps, {
        onCloseClick: () => {
          projectModal.closeModal() // 1. Cierra el modal
          resumeTour(ADD_CLIENT_STEP_INDEX, tourSteps, dashboardOptionsRef.current) // 2. Reanuda el tour principal
          setIsTourTransitioning(false)
        },
        onDestroyStarted: () => {
          projectModal.closeModal()
          resumeTour(ADD_CLIENT_STEP_INDEX, tourSteps, dashboardOptionsRef.current)
          setIsTourTransitioning(false)
        }
      })
      setIsTourTransitioning(false)
    }, 400)
  }

  // ✅ Subtour: Agregar Cliente (Resident)
  const triggerResidentSubtour = () => {
    if (isTourTransitioning) return
    setIsTourTransitioning(true)
    pauseTour()
    handleOpenDialog()
    
    setTimeout(() => {
      startTour(residentTourConfig.id, residentSteps, {
        onCloseClick: () => {
          handleCloseDialog() // 1. Cierra el modal
          resumeTour(RESUME_AFTER_RESIDENT_STEP_INDEX, tourSteps, dashboardOptionsRef.current) // 2. Reanuda
          setIsTourTransitioning(false)
        },
        onDestroyStarted: () => {
          handleCloseDialog()
          resumeTour(RESUME_AFTER_RESIDENT_STEP_INDEX, tourSteps, dashboardOptionsRef.current)
          setIsTourTransitioning(false)
        }
      })
      setIsTourTransitioning(false)
    }, 400)
  }

  // ✅ Subtour: Panel de Notificaciones (CORREGIDO)
  const triggerNotificationDrawerSubtour = () => {
    if (isTourTransitioning) return
    setIsTourTransitioning(true)
    pauseTour()
    
    // ✅ En lugar de simular clic, disparamos un evento que PageLayout escucha
    window.dispatchEvent(new CustomEvent('open-notification-drawer'))
    
    setTimeout(() => {
      startTour(notificationDrawerTourConfig.id, notificationDrawerSteps, {
        onCloseClick: () => window.dispatchEvent(new CustomEvent('tour-resume-notification-drawer')),
        onDestroyStarted: () => window.dispatchEvent(new CustomEvent('tour-resume-notification-drawer'))
      })
      setIsTourTransitioning(false)
    }, 400) // 400ms es suficiente para que el drawer termine su animación de apertura
  }

  // ✅ Handler unificado ACTUALIZADO
  const handleDashboardNextClick = (driverObj) => {
    const currentIndex = driverObj.getActiveIndex()
    console.log('[Dashboard] Next click - Current index:', currentIndex)
    
    if (currentIndex === GLOBAL_SEARCH_STEP_INDEX) {
      triggerGlobalSearchSubtour()
    } else if (currentIndex === NOTIFICATION_CREATOR_STEP_INDEX) {
      if (document.getElementById('topbar-notification-creator')) {
        triggerNotificationCreatorSubtour()
      } else {
        driverObj.moveNext()
      }
    } else if (currentIndex === NOTIFICATION_BELL_STEP_INDEX) { // ✅ NUEVA CONDICIÓN
      triggerNotificationDrawerSubtour()
    } else if (currentIndex === CREATE_PROJECT_STEP_INDEX) {
      triggerCreateProjectSubtour()
    } else if (currentIndex === ADD_CLIENT_STEP_INDEX) {
      triggerResidentSubtour()
    } else {
      driverObj.moveNext()
    }
  }

  const dashboardTourOptions = {
    onNextClick: handleDashboardNextClick
  }
  dashboardOptionsRef.current = dashboardTourOptions

  useEffect(() => {
    if (!projects.length) return
    const fetchAllClients = async () => {
      const crmService = await import('../services/crmService')
      const results = await Promise.allSettled(projects.map(p => crmService.default.getClients(p._id)))
      const counts = {}
      results.forEach((r, i) => {
        counts[projects[i]._id] = r.status === 'fulfilled' ? (r.value?.total ?? 0) : 0
      })
      setClientCounts(counts)
    }
    fetchAllClients()
  }, [projects])

  const getProjectBalance = (projectId) => allBalance?.byProject?.find(b => b.projectId === projectId) ?? null

  const handleOpenProject = () => {
    const token = localStorage.getItem('token')
    let url = selectedProject?.externalUrl || 'http://localhost:5173'
    window.open(`${url}/dashboard?token=${token}`, '_blank')
  }

  const formatDate = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: '2-digit' }).toUpperCase()
  const totalClients = Object.values(clientCounts).reduce((s, v) => s + v, 0)
  const selectedBalance = selectedProject ? getProjectBalance(selectedProject._id) : null
  const selectedClients = selectedProject ? (clientCounts[selectedProject._id] ?? 0) : 0

  const handleCreateProjectClick = () => {
    const tourActive = !hasCompletedTour(dashboardTourConfig.id)
    if (tourActive) {
      triggerCreateProjectSubtour()
    } else {
      projectModal.openModal()
    }
  }

  const handleAddClientClick = () => {
    const tourActive = !hasCompletedTour(dashboardTourConfig.id)
    if (tourActive) {
      triggerResidentSubtour()
    } else {
      handleOpenDialog()
    }
  }

  return (
    <PageLayout
      title={t('titleMV')}
      titleBold={t('titleBold')}
      topbarLabel={t('topbarLabel')}
      subtitle={t('subtitle', { count: projects.length, date: formatDate(currentTime) })}
      sidebarStats={[
        { label: t('sidebarStats.projects'), value: projects.length },
        { label: t('sidebarStats.clients'), value: totalClients }
      ]}
    >
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <TourButton 
            tourId={dashboardTourConfig.id}
            steps={tourSteps}
            label={t('tour.dashboard.button', 'Ver guía del dashboard')}
            options={dashboardTourOptions}
          />
        </Box>

        <QuickActionsPanel
          onCreateProject={handleCreateProjectClick}
          onCreateUser={handleAddClientClick}
        />

        <StatsStrip id="stats-strip" stats={[
          { label: t('sidebarStats.projects'), value: projects.length },
          { label: t('metrics.totalClients'), value: totalClients },
          { label: t('metrics.totalCollected'), value: allBalance?.global?.totalCollected ?? 0, prefix: '$', format: 'currency' },
          { label: t('metrics.totalPending'), value: allBalance?.global?.totalPending ?? 0, prefix: '$', format: 'currency' },
        ]} />

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          gap: 3, 
          alignItems: 'flex-start' 
        }}>
          <Box id="project-list" sx={{
            width: { xs: '100%', lg: '320px' },
            maxHeight: { xs: '300px', lg: 'calc(100vh - 240px)' },
            overflowY: 'auto',
            pr: { xs: 0, lg: 1 },
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: '#ddd' }
          }}>
            <Typography sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.6rem',
              color: '#000000ff',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              mb: 2
            }}>
              {t('selectProject')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {loading ? (
                [0, 1, 2].map(i => (
                  <Box key={i} sx={{ border: '1px solid #f0f0f0', p: '16px 20px', borderRadius: 0 }}>
                    <Box sx={{ width: '60%', height: 12, bgcolor: '#f5f5f5', mb: 1, borderRadius: 0 }} />
                    <Box sx={{ width: '30%', height: 10, bgcolor: '#fafafa', borderRadius: 0 }} />
                  </Box>
                ))
              ) : (
                filtered.map((p, i) => (
                  <ProjectCard
                    key={p._id}
                    project={p}
                    index={i}
                    clientCount={clientCounts[p._id] ?? 0}
                    onClick={() => setSelectedProject(p)}
                    selected={selectedProject?._id === p._id}
                    dataTourId={i === 0 ? 'project-card-first' : undefined}
                  />
                ))
              )}
            </Box>
          </Box>

          <Box id="project-detail" sx={{ flex: 1, minWidth: 0, width: '100%' }}>
            <AnimatePresence mode="wait">
              {selectedProject ? (
                <motion.div
                  key={selectedProject._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Box sx={{ border: '1px solid #e8e8e8', background: '#fff', borderRadius: 0 }}>
                    <Box sx={{ 
                      p: { xs: '20px', sm: '28px 32px' }, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      borderBottom: '1px solid #f0f0f0' 
                    }}>
                      <Avatar sx={{
                        width: 48, height: 48, bgcolor: '#000', borderRadius: 0,
                        fontSize: '1rem', fontWeight: 700, fontFamily: '"Courier New", monospace', flexShrink: 0
                      }}>
                        {selectedProject.name?.substring(0, 2).toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{
                          fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 600,
                          fontSize: { xs: '1.1rem', sm: '1.4rem' }, color: '#000',
                          letterSpacing: '-0.03em', lineHeight: 1.1,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {selectedProject.name}
                        </Typography>
                        <Typography sx={{
                          fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#000000ff', letterSpacing: '1px'
                        }}>
                          /{selectedProject.slug}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ borderColor: '#f5f5f5' }} />

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                      <Box id="project-metrics-clients" sx={{ p: '20px 24px', borderRight: { sm: '1px solid #f0f0f0', xs: 'none' }, borderBottom: '1px solid #f0f0f0' }}>
                        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase', mb: 1.5 }}>
                          {t('metrics.totalClients')}
                        </Typography>
                        <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 200, fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', color: '#000', letterSpacing: '-0.04em', lineHeight: 1, mb: 1 }}>
                          <Counter to={selectedClients} duration={1.1} />
                        </Typography>
                        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff' }}>
                          {t('metrics.registeredOwners')}
                        </Typography>
                      </Box>

                      <Box id="project-metrics-collected" sx={{ p: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
                        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase', mb: 1.5 }}>
                          {t('metrics.totalCollected')}
                        </Typography>
                        <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 200, fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', color: '#4a7c59', letterSpacing: '-0.04em', lineHeight: 1, mb: 1 }}>
                          <Counter to={Math.round((selectedBalance?.totalCollected ?? 0) / 1000)} prefix="$" suffix="K" duration={1.1} />
                        </Typography>
                        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff' }}>
                          {formatCurrency(selectedBalance?.totalCollected ?? 0)}
                        </Typography>
                      </Box>

                      <Box id="project-metrics-pending" sx={{ p: '20px 24px', borderRight: { sm: '1px solid #f0f0f0', xs: 'none' }, borderBottom: { sm: 'none', xs: '1px solid #f0f0f0' } }}>
                        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase', mb: 1.5 }}>
                          {t('metrics.totalPending')}
                        </Typography>
                        <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 200, fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', color: '#c0842a', letterSpacing: '-0.04em', lineHeight: 1, mb: 1 }}>
                          <Counter to={Math.round((selectedBalance?.totalPending ?? 0) / 1000)} prefix="$" suffix="K" duration={1.1} />
                        </Typography>
                        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff' }}>
                          {formatCurrency(selectedBalance?.totalPending ?? 0)}
                        </Typography>
                      </Box>

                      <Box id="project-metrics-phase" sx={{ p: '20px 24px' }}>
                        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase', mb: 1.5 }}>
                          {t('metrics.phase')}
                        </Typography>
                        <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 200, fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', color: '#000', letterSpacing: '-0.04em', lineHeight: 1, mb: 1 }}>
                          {selectedProject.phase ?? '—'}
                        </Typography>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, border: '1px solid #e0e0e0', borderRadius: 0 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: selectedProject.isActive ? '#4a7c59' : '#000' }} />
                          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#555', letterSpacing: '1px' }}>
                            {selectedProject.status?.toUpperCase() ?? 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <motion.div id="open-project-btn" whileHover={{ backgroundColor: '#111' }} whileTap={{ scale: 0.99 }}>
                      <Box onClick={handleOpenProject} sx={{ p: { xs: '16px 20px', sm: '20px 32px' }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#000', cursor: 'pointer', borderRadius: 0 }}>
                        <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 400, fontSize: '0.9rem', color: '#fff', letterSpacing: '0.5px' }}>
                          {t('openDashboard')}
                        </Typography>
                        <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
                          <ChevronRight sx={{ color: '#fff', fontSize: 20 }} />
                        </motion.div>
                      </Box>
                    </motion.div>
                  </Box>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="empty">
                  <Box sx={{ border: '1px solid #f0f0f0', p: { xs: '40px 20px', sm: '60px 40px' }, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0 }}>
                    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#ccc', letterSpacing: '2px', textTransform: 'uppercase' }}>
                      {t('empty')}
                    </Typography>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Box>
      </Box>

      <CreateProjectDialog 
        open={projectModal.open} 
        onClose={() => {
          projectModal.closeModal()
          if (isPaused()) {
            setTimeout(() => {
              resumeTour(ADD_CLIENT_STEP_INDEX, tourSteps, dashboardOptionsRef.current)
              setIsTourTransitioning(false)
            }, 300)
          }
        }} 
        onCreated={(project) => {
          handleProjectCreated(project)
          if (isPaused()) {
            setTimeout(() => {
              resumeTour(ADD_CLIENT_STEP_INDEX, tourSteps, dashboardOptionsRef.current)
              setIsTourTransitioning(false)
            }, 300)
          }
        }} 
        initialData={projectModal.data} 
        editMode={!!projectModal.data} 
      />
      
      <ResidentDialog 
        open={openDialog} 
        onClose={() => {
          handleCloseDialog()
          if (isPaused()) {
            setTimeout(() => {
              resumeTour(RESUME_AFTER_RESIDENT_STEP_INDEX, tourSteps, dashboardOptionsRef.current)
              setIsTourTransitioning(false)
            }, 300)
          }
        }} 
        onSubmit={() => {
          handleSubmit()
          if (isPaused()) {
            setTimeout(() => {
              resumeTour(RESUME_AFTER_RESIDENT_STEP_INDEX, tourSteps, dashboardOptionsRef.current)
              setIsTourTransitioning(false)
            }, 300)
          }
        }} 
        formData={formData} 
        setFormData={setFormData} 
        selectedUser={selectedUser} 
        handleFieldChange={handleFieldChange} 
        handlePhoneChange={handlePhoneChange} 
        isFormValid={isFormValid} 
        e164Value={e164Value} 
        displayVal={displayVal} 
        isPhoneValid={isPhoneValid} 
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ fontFamily: '"Helvetica Neue", sans-serif', borderRadius: 0, border: '1px solid' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  )
}