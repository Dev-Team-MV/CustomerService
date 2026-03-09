import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, Divider, LinearProgress, Avatar, Skeleton } from '@mui/material'
import { TrendingUp, ChevronRight, AccountBalanceWallet, HourglassEmpty } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@shared/context/AuthContext'
import api from '@shared/services/api'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import StatsStrip from '@shared/components/LayoutComponents/StatsStrip'
import CreateProjectDialog from '../components/CreateProjectDialog'
import ProjectCard, { Counter } from '../components/dashboard/ProjectCard'
import { useTranslation } from 'react-i18next'
import crmService from '../services/crmService'

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val ?? 0)

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedProject, setSelectedProject] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [balance, setBalance] = useState(null)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [clientCounts, setClientCounts] = useState({}) // { [projectId]: total }
  const { t } = useTranslation('dashboard')

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ── Fetch projects ──────────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/projects')
      .then(r => {
        const raw = r.data?.projects || r.data || []
        setProjects(raw)
        if (raw.length > 0) setSelectedProject(raw[0])
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  // ── Fetch balance ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBalance = async () => {
      setBalanceLoading(true)
      try {
        const data = await crmService.getBalance()
        setBalance(data)
      } catch (e) {
        console.error('Balance error:', e)
      } finally {
        setBalanceLoading(false)
      }
    }
    fetchBalance()
  }, [])

  // ── Fetch clients por proyecto ──────────────────────────────────────────────
  useEffect(() => {
    if (!projects.length) return
    const fetchAllClients = async () => {
      const results = await Promise.allSettled(
        projects.map(p => crmService.getClients(p._id))
      )
      const counts = {}
      results.forEach((r, i) => {
        counts[projects[i]._id] = r.status === 'fulfilled' ? (r.value?.total ?? 0) : 0
      })
      setClientCounts(counts)
    }
    fetchAllClients()
  }, [projects])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getProjectBalance = (projectId) =>
    balance?.byProject?.find(b => b.projectId === projectId) ?? null

  const handleOpenProject = () => {
    const lakewoodUrl = import.meta.env.VITE_LAKEWOOD_URL || 'http://localhost:5173'
    window.open(`${lakewoodUrl}/dashboard`, '_blank')
  }

  const handleProjectCreated = (newProject) => {
    setProjects(prev => [newProject, ...prev])
    setSelectedProject(newProject)
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" onClick={() => setCreateOpen(true)}>
          + {t('createProject')}
        </Button>
      </Box>

      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleProjectCreated}
      />

      {/* ── Stats strip — datos reales ── */}
      <StatsStrip stats={[
        { label: t('sidebarStats.projects'), value: projects.length },
        { label: t('metrics.totalClients'), value: totalClients },
        { label: t('metrics.totalCollected'), value: balance?.global?.totalCollected ?? 0, prefix: '$', format: 'currency' },
        { label: t('metrics.totalPending'), value: balance?.global?.totalPending ?? 0, prefix: '$', format: 'currency' },
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
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#aaa', letterSpacing: '2px', textTransform: 'uppercase', mb: 2 }}>
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
              : projects.map((p, i) => (
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
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#aaa', letterSpacing: '1px' }}>
                        /{selectedProject.slug}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: '#f5f5f5' }} />

                  {/* Metrics grid — datos reales */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #f0f0f0' }}>

                    {/* Clients */}
                    <Box sx={{ p: '24px 28px', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#bbb', letterSpacing: '2px', textTransform: 'uppercase', mb: 1.5 }}>
                        {t('metrics.totalClients')}
                      </Typography>
                      {balanceLoading
                        ? <Skeleton width={80} height={44} />
                        : <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 200, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#000', letterSpacing: '-0.04em', lineHeight: 1, mb: 1 }}>
                            <Counter to={selectedClients} duration={1.1} />
                          </Typography>
                      }
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#bbb' }}>
                        {t('metrics.registeredOwners')}
                      </Typography>
                    </Box>

                    {/* Collected */}
                    <Box sx={{ p: '24px 28px', borderBottom: '1px solid #f0f0f0' }}>
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#bbb', letterSpacing: '2px', textTransform: 'uppercase', mb: 1.5 }}>
                        {t('metrics.totalCollected')}
                      </Typography>
                      {balanceLoading
                        ? <Skeleton width={100} height={44} />
                        : <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 200, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#4a7c59', letterSpacing: '-0.04em', lineHeight: 1, mb: 1 }}>
                            <Counter
                              to={Math.round((selectedBalance?.totalCollected ?? 0) / 1000)}
                              prefix="$"
                              suffix="K"
                              duration={1.1}
                            />
                          </Typography>
                      }
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#bbb' }}>
                        {formatCurrency(selectedBalance?.totalCollected ?? 0)}
                      </Typography>
                    </Box>

                    {/* Pending */}
                    <Box sx={{ p: '24px 28px', borderRight: '1px solid #f0f0f0' }}>
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#bbb', letterSpacing: '2px', textTransform: 'uppercase', mb: 1.5 }}>
                        {t('metrics.totalPending')}
                      </Typography>
                      {balanceLoading
                        ? <Skeleton width={100} height={44} />
                        : <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 200, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#c0842a', letterSpacing: '-0.04em', lineHeight: 1, mb: 1 }}>
                            <Counter
                              to={Math.round((selectedBalance?.totalPending ?? 0) / 1000)}
                              prefix="$"
                              suffix="K"
                              duration={1.1}
                            />
                          </Typography>
                      }
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#bbb' }}>
                        {formatCurrency(selectedBalance?.totalPending ?? 0)}
                      </Typography>
                    </Box>

                    {/* Phase / Status */}
                    <Box sx={{ p: '24px 28px' }}>
                      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#bbb', letterSpacing: '2px', textTransform: 'uppercase', mb: 1.5 }}>
                        {t('metrics.phase')}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 200, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#000', letterSpacing: '-0.04em', lineHeight: 1, mb: 1 }}>
                        {selectedProject.phase ?? '—'}
                      </Typography>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, border: '1px solid #e0e0e0' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: selectedProject.isActive ? '#4a7c59' : '#aaa' }} />
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