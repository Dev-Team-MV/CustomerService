import { Box, Typography } from '@mui/material'
import { AccountBalanceWallet, HourglassEmpty, Percent, People } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const fmt = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val ?? 0)

const KPICard = ({ icon, label, value, sub, color = '#000', index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    style={{ flex: 1 }}
  >
    <Box sx={{
      p: '20px 24px',
      border: '1px solid #f0f0f0',
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      transition: 'border-color 0.2s',
      '&:hover': { borderColor: '#000' },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0, left: 0,
        width: 3, height: '100%',
        bgcolor: color
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        <Typography sx={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.58rem', color: '#000000ff',
          letterSpacing: '2px', textTransform: 'uppercase'
        }}>
          {label}
        </Typography>
      </Box>

      <Typography sx={{
        fontFamily: '"Helvetica Neue", sans-serif',
        fontWeight: 200, fontSize: '2rem',
        color, letterSpacing: '-0.04em', lineHeight: 1, mb: 0.8
      }}>
        {value}
      </Typography>

      {sub && (
        <Typography sx={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.58rem', color: '#000000ff'
        }}>
          {sub}
        </Typography>
      )}
    </Box>
  </motion.div>
)

export default function GlobalKPIs({ filteredBalance, filteredClients }) {
    const { t } = useTranslation('analytics')

    const collected   = filteredBalance.reduce((s, p) => s + (p.totalCollected ?? 0), 0)
  const pending     = filteredBalance.reduce((s, p) => s + (p.totalPending   ?? 0), 0)
  const total       = collected + pending
  const rate        = total > 0 ? ((collected / total) * 100).toFixed(1) : '0.0'
  const totalClients = Object.values(filteredClients).reduce((s, d) => s + (d?.total ?? 0), 0)

  return (
    <Box>
      <Typography sx={{
        fontFamily: '"Courier New", monospace', fontSize: '0.6rem',
        color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase', mb: 2
      }}>
        {t('mv.kpis.title')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
        <KPICard
          index={0}
          icon={<AccountBalanceWallet sx={{ fontSize: 15 }} />}
          label={t('mv.kpis.collected')}
          value={fmt(collected)}
          sub={t('mv.kpis.collectedSub')}
          color="#4a7c59"
        />
        <KPICard
          index={1}
          icon={<HourglassEmpty sx={{ fontSize: 15 }} />}
          label={t('mv.kpis.pending')} 
          value={fmt(pending)}
          sub={t('mv.kpis.pendingSub')}
          color="#c0842a"
        />
        <KPICard
          index={2}
          icon={<Percent sx={{ fontSize: 15 }} />}
          label={t('mv.kpis.collectionRate')}
          value={`${rate}%`}
          sub={t('mv.kpis.collectionRateSub', { total: fmt(total) })}
          color="#555"
        />
        <KPICard
          index={3}
          icon={<People sx={{ fontSize: 15 }} />}
          label={t('mv.kpis.totalClients')}
          value={totalClients}
          sub={t('mv.kpis.totalClientsSub')}
          color="#000"
        />
      </Box>
    </Box>
  )
}