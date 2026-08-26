// apps/mv-crm/src/components/stats/Analytics/BalanceComparativaChart.jsx
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import { useTranslation } from 'react-i18next'

const fmt = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val ?? 0)

export default function BalanceComparativaChart({ filteredBalance }) {
  const { t } = useTranslation('analytics')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const isEmpty = filteredBalance.length === 0

  const labels    = filteredBalance.map(p => p.name)
  const collected = filteredBalance.map(p => p.totalCollected ?? 0)
  const pending   = filteredBalance.map(p => p.totalPending   ?? 0)

  return (
    <Box id="analytics-balance-chart">
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 2,
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Typography sx={{
          fontFamily: '"Courier New", monospace', fontSize: '0.6rem',
          color: '#000', letterSpacing: '2px', textTransform: 'uppercase'
        }}>
          {t('mv.balance.title')}
        </Typography>

        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {[
            { color: '#4a7c59', label: t('mv.balance.collected') },
            { color: '#e8d5b7', label: t('mv.balance.pending') }
          ].map(l => (
            <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: l.color, borderRadius: 0 }} />
              <Typography sx={{ 
                fontFamily: '"Courier New", monospace', 
                fontSize: '0.55rem', 
                color: '#000', 
                letterSpacing: '1px', 
                textTransform: 'uppercase' 
              }}>
                {l.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {isEmpty ? (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: 220, 
          border: '1px dashed #e0e0e0',
          borderRadius: 0
        }}>
          <Typography sx={{ 
            fontFamily: '"Courier New", monospace', 
            fontSize: '0.65rem', 
            color: '#000', 
            letterSpacing: '2px' 
          }}>
            {t('mv.page.noProjectsSelected')}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ 
          width: '100%', 
          minWidth: 0, 
          overflowX: 'auto',
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-track': { background: '#f0f0f0', borderRadius: 0 },
          '&::-webkit-scrollbar-thumb': { background: '#ccc', borderRadius: 0 }
        }}>
          <BarChart
            xAxis={[{
              scaleType: 'band',
              data: labels,
              tickLabelStyle: { 
                fontFamily: '"Courier New", monospace', 
                fontSize: isMobile ? 9 : 10, 
                fill: '#000' 
              }
            }]}
            yAxis={[{
              valueFormatter: (v) => `$${(v / 1000).toFixed(0)}k`,
              tickLabelStyle: { 
                fontFamily: '"Courier New", monospace', 
                fontSize: isMobile ? 9 : 10, 
                fill: '#000' 
              }
            }]}
            series={[
              { data: collected, label: 'Collected', color: '#4a7c59', valueFormatter: fmt },
              { data: pending,   label: 'Pending',   color: '#e8d5b7', valueFormatter: fmt }
            ]}
            height={isMobile ? 220 : 260}
            margin={{ 
              top: 10, 
              right: isMobile ? 5 : 10, 
              bottom: isMobile ? 50 : 40, 
              left: isMobile ? 40 : 60 
            }}
            slotProps={{ legend: { hidden: true } }}
            sx={{
              width: '100% !important',
              '& .MuiChartsAxis-line': { stroke: '#f0f0f0' },
              '& .MuiChartsAxis-tick': { stroke: '#f0f0f0' },
              '& .MuiBarElement-root': { rx: 0 },
            }}
          />
        </Box>
      )}
    </Box>
  )
}