import { Box, Typography } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import { useTranslation } from 'react-i18next'

export default function ClientsComparativaChart({ filteredBalance, filteredClients }) {
  const { t } = useTranslation('analytics')
  const isEmpty = filteredBalance.length === 0
  const labels      = filteredBalance.map(p => p.name)
  const totalClients = filteredBalance.map(p => filteredClients[p.projectId]?.total ?? 0)
  const totalProps   = filteredBalance.map(p => {
    const clients = filteredClients[p.projectId]?.clients ?? []
    return clients.reduce((s, c) => s + (c.propertyCount ?? 0), 0)
  })

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{
          fontFamily: '"Courier New", monospace', fontSize: '0.6rem',
          color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase'
        }}>
          {t('mv.clients.title')}
        </Typography>

        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {[
            { color: '#000',    label: t('mv.clients.clients') },
            { color: '#d0d0d0', label: t('mv.clients.properties') }
          ].map(l => (
            <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: l.color }} />
              <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.55rem', color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {l.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {isEmpty ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, border: '1px dashed #e0e0e0' }}>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#ccc', letterSpacing: '2px' }}>
            {t('mv.clients.noData')}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', minWidth: 0, overflowX: 'auto' }}>
          <BarChart
            xAxis={[{
              scaleType: 'band',
              data: labels,
              tickLabelStyle: { fontFamily: '"Courier New", monospace', fontSize: 10, fill:'#000000ff' }
            }]}
            yAxis={[{
              tickLabelStyle: { fontFamily: '"Courier New", monospace', fontSize: 10, fill: '#000000ff' }
            }]}
            series={[
              { data: totalClients, label: 'Clients',    color: '#000' },
              { data: totalProps,   label: 'Properties', color: '#d0d0d0' }
            ]}
            height={260}
            margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
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