import { useState, useEffect, useMemo, useCallback } from 'react'
import { Box, Typography, Divider, Skeleton } from '@mui/material'
import { BarChart as BarChartIcon, TrendingUp, Refresh } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import crmService from '../services/crmService'
import GlobalKPIs from '../components/stats/Analytics/GlobalKPIs'
import ProjectFilter from '../components/stats/Analytics/ProjectFilter'
import BalanceComparativaChart from '../components/stats/Analytics/BalanceComparativaChart'
import ClientsComparativaChart from '../components/stats/Analytics/ClientsComparativaChart'
import ProjectShareChart from '../components/stats/Analytics/ProjectShareChart'

// ── Skeleton loader ───────────────────────────────────────────────────────────
const SectionSkeleton = ({ height = 280 }) => (
  <Box sx={{ border: '1px solid #f0f0f0', p: 3 }}>
    <Skeleton variant="text" width={120} height={16} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={height} />
  </Box>
)

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    <Box sx={{ border: '1px solid #f0f0f0', p: 3 }}>
      {children}
    </Box>
  </motion.div>
)

// ─────────────────────────────────────────────────────────────────────────────

export default function Analytics() {
  const { t } = useTranslation('analytics')

  // ── Raw data ────────────────────────────────────────────────────────────────
  const [allBalance, setAllBalance]   = useState(null)
  const [clientsMap, setClientsMap]   = useState({})   // { [projectId]: { clients, total } }
  const [loading, setLoading]         = useState(true)
  const [loadingClients, setLoadingClients] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  // ── Filter state ────────────────────────────────────────────────────────────
  const [activeIds, setActiveIds] = useState(new Set())

  // ── Fetch balance ───────────────────────────────────────────────────────────
  const fetchBalance = useCallback(async () => {
    setLoading(true)
    try {
      const data = await crmService.getBalance()
      setAllBalance(data)

      // Inicializa todos los proyectos como activos
      const ids = new Set(data.byProject.map(p => p.projectId))
      setActiveIds(ids)
      setLastUpdated(new Date())

      return data.byProject
    } catch (err) {
      console.error('Analytics — getBalance error:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch clients (en paralelo para todos los proyectos) ────────────────────
  const fetchAllClients = useCallback(async (projects) => {
    if (!projects?.length) return
    setLoadingClients(true)
    try {
      const results = await Promise.all(
        projects.map(p =>
          crmService.getClients(p.projectId)
            .then(d => ({ id: p.projectId, data: d }))
            .catch(() => ({ id: p.projectId, data: { clients: [], total: 0 } }))
        )
      )
      const map = {}
      results.forEach(r => { map[r.id] = r.data })
      setClientsMap(map)
    } finally {
      setLoadingClients(false)
    }
  }, [])

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchBalance().then(projects => fetchAllClients(projects))
  }, [fetchBalance, fetchAllClients])

  // ── Refresh ─────────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    fetchBalance().then(projects => fetchAllClients(projects))
  }, [fetchBalance, fetchAllClients])

  // ── Filter toggles ──────────────────────────────────────────────────────────
  const handleToggle = useCallback((id) => {
    setActiveIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const handleToggleAll = useCallback(() => {
    const allIds = allBalance?.byProject.map(p => p.projectId) ?? []
    setActiveIds(prev =>
      prev.size === allIds.length ? new Set() : new Set(allIds)
    )
  }, [allBalance])

  // ── Filtered data (memoized) ────────────────────────────────────────────────
  const filteredBalance = useMemo(() =>
    (allBalance?.byProject ?? []).filter(p => activeIds.has(p.projectId)),
    [allBalance, activeIds]
  )

  const filteredClients = useMemo(() => {
    const result = {}
    activeIds.forEach(id => {
      if (clientsMap[id]) result[id] = clientsMap[id]
    })
    return result
  }, [clientsMap, activeIds])

  // ── Subtitle ─────────────────────────────────────────────────────────────────
 const subtitle = useMemo(() => {
    if (!allBalance) return ''
    const total  = allBalance.byProject.length
    const active = activeIds.size
    const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
    const globalTotal = (allBalance.global.totalCollected ?? 0) + (allBalance.global.totalPending ?? 0)
    return t('mv.page.subtitle', { active, total, amount: fmt(globalTotal) })
  }, [allBalance, activeIds, t])

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <PageLayout
      title={t('mv.page.title')}
      titleBold={t('mv.page.titleBold')}
      topbarLabel={t('mv.page.topbarLabel')}
      subtitle={subtitle}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        pb: 6,
        px: { xs: 2, sm: 3, md: 4 },   // ← padding horizontal
        maxWidth: '100%',
        overflow: 'hidden',             // ← evita desbordamiento
        boxSizing: 'border-box',
      }}>
        {/* ── Header row ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarChartIcon sx={{ fontSize: 16, color: '#000000ff' }} />
              <Typography sx={{
                fontFamily: '"Courier New", monospace', fontSize: '0.6rem',
                color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase'
              }}>
              {t('mv.page.multiProject')}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {lastUpdated && (
                <Typography sx={{
                  fontFamily: '"Courier New", monospace', fontSize: '0.58rem',
                  color: '#ccc', letterSpacing: '1px'
                }}>
                  {lastUpdated.toLocaleTimeString()}
                </Typography>
              )}
              <Box
                onClick={handleRefresh}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.8,
                  px: 1.5, py: 0.8,
                  border: '1px solid #e0e0e0', cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { border: '1px solid #000' }
                }}
              >
                <Refresh sx={{ fontSize: 13, color: '#888' }} />
                <Typography sx={{
                  fontFamily: '"Courier New", monospace', fontSize: '0.58rem',
                  color: '#888', letterSpacing: '1.5px', textTransform: 'uppercase'
                }}>
              {t('mv.page.refresh')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </motion.div>

        <Divider sx={{ borderColor: '#f0f0f0' }} />

        {/* ── Project Filter ── */}
        {loading ? (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" width={110} height={36} />)}
          </Box>
        ) : (
          <Section delay={0.05}>
            <ProjectFilter
              projects={allBalance?.byProject ?? []}
              activeIds={activeIds}
              onToggle={handleToggle}
              onToggleAll={handleToggleAll}
            />
          </Section>
        )}

        {/* ── Global KPIs ── */}
        {loading ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rectangular" sx={{ flex: 1 }} height={100} />)}
          </Box>
        ) : (
          <Section delay={0.1}>
            <GlobalKPIs
              filteredBalance={filteredBalance}
              filteredClients={filteredClients}
            />
          </Section>
        )}

        {/* ── Balance + Share — row ── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' }, gap: 3,minWidth: 0,   }}>
          {loading ? (
            <>
              <SectionSkeleton height={280} />
              <SectionSkeleton height={280} />
            </>
          ) : (
            <>
              <Section delay={0.15}>
                <BalanceComparativaChart filteredBalance={filteredBalance} />
              </Section>
              <Section delay={0.2}>
                <ProjectShareChart filteredBalance={filteredBalance} />
              </Section>
            </>
          )}
        </Box>

        {/* ── Clients Comparativa ── */}
        {loading || loadingClients ? (
          <SectionSkeleton height={260} />
        ) : (
          <Section delay={0.25}>
            <ClientsComparativaChart
              filteredBalance={filteredBalance}
              filteredClients={filteredClients}
            />
          </Section>
        )}

      </Box>
    </PageLayout>
  )
}