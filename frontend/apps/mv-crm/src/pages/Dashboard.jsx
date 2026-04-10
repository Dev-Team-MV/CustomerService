import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Divider, Avatar, Skeleton, Snackbar, Alert } from '@mui/material'
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

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val ?? 0)

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const { t } = useTranslation('dashboard')

  // ── Resident hook for quick user creation (SMS con proyecto CRM si VITE_PROJECT_ID está en el build)
  const {
    openDialog,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    formData,
    setFormData,
    selectedUser,
    handleFieldChange,
    handlePhoneChange,
    isFormValid,
    e164Value,
    displayVal,
    isPhoneValid,
    snackbar,
    handleCloseSnackbar,
  } = useResidents(null, { smsProjectId: import.meta.env.VITE_PROJECT_ID })

  // ── Projects hook ──
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

  // ── Modal state for project creation/edit ──
  const projectModal = useModalState()

  // ── Selected project for detail panel ──
  const [selectedProject, setSelectedProject] = useState(null)

  // ── Client counts for each project ──
  const [clientCounts, setClientCounts] = useState({})

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ── Fetch clients per project ──
  useEffect(() => {
    if (!projects.length) return
    const fetchAllClients = async () => {
      const crmService = await import('../services/crmService')
      const results = await Promise.allSettled(
        projects.map(p => crmService.default.getClients(p._id))
      )
      const counts = {}
      results.forEach((r, i) => {
        counts[projects[i]._id] = r.status === 'fulfilled' ? (r.value?.total ?? 0) : 0
      })
      setClientCounts(counts)
    }
    fetchAllClients()
  }, [projects])

  // ── Helpers ──
  const getProjectBalance = (projectId) =>
    allBalance?.byProject?.find(b => b.projectId === projectId) ?? null

  const handleOpenProject = () => {
    const token = localStorage.getItem('token')
    let url = selectedProject?.externalUrl
  
    // Si no hay externalUrl, usa una URL local por defecto según el slug
    if (!url) {
      if (selectedProject?.slug === 'lakewood') {
        url = 'http://localhost:5173'
      } else if (selectedProject?.slug === 'phase2') {
        url = 'http://localhost:5174'
      } else {
        url = 'http://localhost:5173' // fallback
      }
    }
  
    window.open(`${url}/dashboard?token=${token}`, '_blank')
  }

  const formatDate = (d) =>
    d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: '2-digit' }).toUpperCase()

  const totalClients = Object.values(clientCounts).reduce((s, v) => s + v, 0)

  const selectedBalance = selectedProject ? getProjectBalance(selectedProject._id) : null
  const selectedClients = selectedProject ? (clientCounts[selectedProject._id] ?? 0) : 0

  return (
    <PageLayout
      title={t('title')}
      titleBold={t('titleBold')}
      topbarLabel={t('topbarLabel')}
      subtitle={t('subtitle', { count: projects.length, date: formatDate(currentTime) })}
      sidebarStats={[
        { label: t('sidebarStats.projects'), value: projects.length },
        { label: t('sidebarStats.clients'), value: totalClients }
      ]}
    >
      {/* ── Quick Actions Panel ── */}
      <QuickActionsPanel
        onCreateProject={() => projectModal.openModal()}
        onCreateUser={() => handleOpenDialog()}
      />

      {/* ── Modal para crear/editar proyecto ── */}
      <CreateProjectDialog
        open={projectModal.open}
        onClose={projectModal.closeModal}
        onCreated={handleProjectCreated}
        initialData={projectModal.data}
        editMode={!!projectModal.data}
      />

      {/* ── Modal para crear usuario (cliente) ── */}
      <ResidentDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ fontFamily: '"Helvetica Neue", sans-serif', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ── Stats strip — datos reales ── */}
      <StatsStrip stats={[
        { label: t('sidebarStats.projects'), value: projects.length },
        { label: t('metrics.totalClients'), value: totalClients },
        { label: t('metrics.totalCollected'), value: allBalance?.global?.totalCollected ?? 0, prefix: '$', format: 'currency' },
        { label: t('metrics.totalPending'), value: allBalance?.global?.totalPending ?? 0, prefix: '$', format: 'currency' },
      ]} />

      {/* ── Split view ── */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
        {/* Left: project list */}
        <Box sx={{
          flex: '0 0 320px', minWidth: 0,
          maxHeight: 'calc(100vh - 240px)', overflowY: 'auto', pr: 1,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: '#f5f5f5' },
          '&::-webkit-scrollbar-thumb': { background: '#ddd', borderRadius: 3 },
        }}>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase', mb: 2 }}>
            {t('selectProject')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {loading
              ? [0, 1, 2].map(i => (
                  <Box key={i} sx={{ border: '1px solid #f0f0f0', p: '18px 20px' }}>
                    <Box sx={{ width: '60%', height: 12, bgcolor: '#f5f5f5', mb: 1 }} />
                    <Box sx={{ width: '30%', height: 10, bgcolor: '#fafafa' }} />
                  </Box>
                ))
              : filtered.map((p, i) => (
                  <ProjectCard
                    key={p._id}
                    project={p}
                    index={i}
                    clientCount={clientCounts[p._id] ?? 0}
                    onClick={() => setSelectedProject(p)}
                    selected={selectedProject?._id === p._id}
                  />
                ))
            }
          </Box>
        </Box>

        {/* Right: project detail */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            {selectedProject ? (
              <motion.div
                key={selectedProject._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Box sx={{ border: '1px solid #e8e8e8', background: '#fff' }}>
                  {/* Header */}
                  <Box sx={{ p: '28px 32px', display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #f0f0f0' }}>
                    <Avatar sx={{ width: 48, height: 48, bgcolor: '#000', borderRadius: 0, fontSize: '1rem', fontWeight: 700, fontFamily: '"Courier New", monospace' }}>
                      {selectedProject.name?.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 600, fontSize: '1.4rem', color: '#000', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                        {selectedProject.name}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#000000ff', letterSpacing: '1px' }}>
                        /{selectedProject.slug}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: '#f5f5f5' }} />

                  {/* Metrics grid — datos reales */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #f0f0f0' }}>
                    {/* Clients */}
                    <Box sx={{ p: '24px 28px', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase', mb: 1.5 }}>
                        {t('metrics.totalClients')}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 200, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#000', letterSpacing: '-0.04em', lineHeight: 1, mb: 1 }}>
                        <Counter to={selectedClients} duration={1.1} />
                      </Typography>
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff' }}>
                        {t('metrics.registeredOwners')}
                      </Typography>
                    </Box>

                    {/* Collected */}
                    <Box sx={{ p: '24px 28px', borderBottom: '1px solid #f0f0f0' }}>
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase', mb: 1.5 }}>
                        {t('metrics.totalCollected')}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 200, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#4a7c59', letterSpacing: '-0.04em', lineHeight: 1, mb: 1 }}>
                        <Counter
                          to={Math.round((selectedBalance?.totalCollected ?? 0) / 1000)}
                          prefix="$"
                          suffix="K"
                          duration={1.1}
                        />
                      </Typography>
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff' }}>
                        {formatCurrency(selectedBalance?.totalCollected ?? 0)}
                      </Typography>
                    </Box>

                    {/* Pending */}
                    <Box sx={{ p: '24px 28px', borderRight: '1px solid #f0f0f0' }}>
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase', mb: 1.5 }}>
                        {t('metrics.totalPending')}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 200, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#c0842a', letterSpacing: '-0.04em', lineHeight: 1, mb: 1 }}>
                        <Counter
                          to={Math.round((selectedBalance?.totalPending ?? 0) / 1000)}
                          prefix="$"
                          suffix="K"
                          duration={1.1}
                        />
                      </Typography>
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff' }}>
                        {formatCurrency(selectedBalance?.totalPending ?? 0)}
                      </Typography>
                    </Box>

                    {/* Phase / Status */}
                    <Box sx={{ p: '24px 28px' }}>
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase', mb: 1.5 }}>
                        {t('metrics.phase')}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 200, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#000', letterSpacing: '-0.04em', lineHeight: 1, mb: 1 }}>
                        {selectedProject.phase ?? '—'}
                      </Typography>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, border: '1px solid #e0e0e0' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: selectedProject.isActive ? '#4a7c59' : '#000000ff' }} />
                        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#555', letterSpacing: '1px' }}>
                          {selectedProject.status?.toUpperCase() ?? 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Open button */}
                  <motion.div whileHover={{ backgroundColor: '#111' }} whileTap={{ scale: 0.99 }}>
                    <Box
                      onClick={handleOpenProject}
                      sx={{ p: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#000', cursor: 'pointer' }}
                    >
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
                <Box sx={{ border: '1px solid #f0f0f0', p: '60px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#ccc', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    {t('empty')}
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </PageLayout>
  )
}