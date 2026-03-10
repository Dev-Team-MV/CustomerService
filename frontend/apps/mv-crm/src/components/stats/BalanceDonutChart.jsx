import { Box, Typography } from '@mui/material'
import { PieChart } from '@mui/x-charts/PieChart'
import { useTranslation } from 'react-i18next'

const fmt = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val ?? 0)

export default function BalanceDonutChart({ balance, projectName }) {
  const { t } = useTranslation('analytics')

  const collected = balance?.totalCollected ?? 0
  const pending   = balance?.totalPending   ?? 0
  const isEmpty   = collected === 0 && pending === 0

  const data = [
    { id: 0, value: collected, label: t('mv.modal.balanceOverview.collected'), color: '#4a7c59' },
    { id: 1, value: pending,   label: t('mv.modal.balanceOverview.pending'),   color: '#e8d5b7' },
  ]

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#aaa', letterSpacing: '2px', textTransform: 'uppercase', mb: 3 }}>
        {t('mv.modal.donut.title')}
      </Typography>

      {isEmpty ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, border: '1px dashed #e0e0e0' }}>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#ccc', letterSpacing: '2px' }}>
            {t('mv.modal.donut.noData')}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <PieChart
            series={[{
              data,
              innerRadius: 55, outerRadius: 100,
              paddingAngle: 2, cornerRadius: 0,
              highlightScope: { faded: 'global', highlighted: 'item' },
              faded: { innerRadius: 50, additionalRadius: -4, color: 'gray' },
            }]}
            width={240}
            height={220}
            slotProps={{ legend: { hidden: true } }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {data.map(d => (
              <Box key={d.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{ width: 3, height: 40, bgcolor: d.color, flexShrink: 0, mt: 0.2 }} />
                <Box>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#aaa', letterSpacing: '2px', textTransform: 'uppercase', mb: 0.3 }}>
                    {d.label}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 300, fontSize: '1.1rem', color: d.color, letterSpacing: '-0.02em' }}>
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