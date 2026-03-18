import { Box, Typography } from '@mui/material'
import { AccountBalanceWallet, HourglassEmpty, Percent } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

const fmt = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val ?? 0)

const KPICard = ({ icon, label, value, sub, color = '#000' }) => (
  <Box sx={{
    flex: 1, p: '20px 24px', border: '1px solid #f0f0f0',
    display: 'flex', flexDirection: 'column', gap: 1,
    position: 'relative', overflow: 'hidden',
    '&::before': {
      content: '""', position: 'absolute',
      top: 0, left: 0, width: 3, height: '100%', bgcolor: color
    }
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase' }}>
        {label}
      </Typography>
    </Box>
    <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 200, fontSize: '1.9rem', color, letterSpacing: '-0.04em', lineHeight: 1 }}>
      {value}
    </Typography>
    {sub && (
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#000000ff' }}>
        {sub}
      </Typography>
    )}
  </Box>
)

export default function BalanceOverview({ balance }) {
  const { t } = useTranslation('analytics')

  const collected = balance?.totalCollected ?? 0
  const pending   = balance?.totalPending   ?? 0
  const total     = collected + pending
  const ratio     = total > 0 ? ((collected / total) * 100).toFixed(1) : '0.0'

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase', mb: 2 }}>
        {t('mv.modal.balanceOverview.title')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
        <KPICard
          icon={<AccountBalanceWallet sx={{ fontSize: 16 }} />}
          label={t('mv.modal.balanceOverview.collected')}
          value={fmt(collected)}
          sub={t('mv.modal.balanceOverview.collectedSub')}
          color="#4a7c59"
        />
        <KPICard
          icon={<HourglassEmpty sx={{ fontSize: 16 }} />}
          label={t('mv.modal.balanceOverview.pending')}
          value={fmt(pending)}
          sub={t('mv.modal.balanceOverview.pendingSub')}
          color="#c0842a"
        />
        <KPICard
          icon={<Percent sx={{ fontSize: 16 }} />}
          label={t('mv.modal.balanceOverview.collectionRate')}
          value={`${ratio}%`}
          sub={t('mv.modal.balanceOverview.collectionRateSub', { total: fmt(total) })}
          color="#555"
        />
      </Box>

      {/* Progress bar */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#4a7c59', letterSpacing: '1px' }}>
            {t('mv.modal.balanceOverview.collectedLabel')} {ratio}%
          </Typography>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#c0842a', letterSpacing: '1px' }}>
            {t('mv.modal.balanceOverview.pendingLabel')} {(100 - parseFloat(ratio)).toFixed(1)}%
          </Typography>
        </Box>
        <Box sx={{ height: 6, background: '#f0f0f0', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${ratio}%`,
            background: 'linear-gradient(90deg, #4a7c59, #6aaa7a)',
            transition: 'width 1s ease'
          }} />
        </Box>
      </Box>
    </Box>
  )
}