// apps/mv-crm/src/components/stats/BalanceDonutChart.jsx
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import { PieChart } from '@mui/x-charts/PieChart'
import { useTranslation } from 'react-i18next'

const fmt = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val ?? 0)

export default function BalanceDonutChart({ balance, projectName }) {
  const { t } = useTranslation('analytics')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const collected = balance?.totalCollected ?? 0
  const pending   = balance?.totalPending   ?? 0
  const isEmpty   = collected === 0 && pending === 0

  const data = [
    { id: 0, value: collected, label: t('mv.modal.balanceOverview.collected'), color: '#4a7c59' },
    { id: 1, value: pending,   label: t('mv.modal.balanceOverview.pending'),   color: '#e8d5b7' },
  ]

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#000', letterSpacing: '2px', textTransform: 'uppercase', mb: 3 }}>
        {t('mv.modal.donut.title')}
      </Typography>

      {isEmpty ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, border: '1px dashed #e0e0e0', borderRadius: 0 }}>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000', letterSpacing: '2px' }}>
            {t('mv.modal.donut.noData')}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: { xs: 'wrap', sm: 'nowrap' }, justifyContent: 'center' }}>
          <PieChart
            series={[{
              data,
              innerRadius: isMobile ? 40 : 55, outerRadius: isMobile ? 70 : 100,
              paddingAngle: 2, cornerRadius: 0,
              highlightScope: { faded: 'global', highlighted: 'item' },
              faded: { innerRadius: isMobile ? 35 : 50, additionalRadius: -4, color: 'gray' },
              cx: isMobile ? 80 : 120,
              cy: isMobile ? 80 : 110,
            }]}
            width={isMobile ? 160 : 240}
            height={isMobile ? 160 : 220}
            slotProps={{ legend: { hidden: true } }}
            sx={{
              '& .MuiChartsAxis-line': { stroke: 'transparent' },
              '& .MuiChartsAxis-tick': { stroke: 'transparent' },
              '& .MuiPieArc-root': { stroke: '#fff', strokeWidth: 2 }
            }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: { xs: '100%', sm: 'auto' } }}>
            {data.map(d => (
              <Box key={d.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{ width: 3, height: 40, bgcolor: d.color, flexShrink: 0, mt: 0.2, borderRadius: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000', letterSpacing: '2px', textTransform: 'uppercase', mb: 0.3 }}>
                    {d.label}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 300, fontSize: { xs: '1rem', sm: '1.1rem' }, color: d.color, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
                    {fmt(d.value)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}