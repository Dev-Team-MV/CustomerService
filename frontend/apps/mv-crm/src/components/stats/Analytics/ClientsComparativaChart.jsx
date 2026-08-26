// apps/mv-crm/src/components/stats/Analytics/ClientsComparativaChart.jsx
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import { useTranslation } from 'react-i18next'

export default function ClientsComparativaChart({ filteredBalance, filteredClients }) {
  const { t } = useTranslation('analytics')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const isEmpty = filteredBalance.length === 0
  const labels      = filteredBalance.map(p => p.name)
  const totalClients = filteredBalance.map(p => filteredClients[p.projectId]?.total ?? 0)
  const totalProps   = filteredBalance.map(p => {
    const clients = filteredClients[p.projectId]?.clients ?? []
    return clients.reduce((s, c) => s + (c.propertyCount ?? 0), 0)
  })

  return (
    <Box id="analytics-clients-chart">
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
          {t('mv.clients.title')}
        </Typography>

        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {[
            { color: '#000',    label: t('mv.clients.clients') },
            { color: '#555', label: t('mv.clients.properties') }
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
            {t('mv.clients.noData')}
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
              tickLabelStyle: { 
                fontFamily: '"Courier New", monospace', 
                fontSize: isMobile ? 9 : 10, 
                fill: '#000' 
              }
            }]}
            series={[
              { data: totalClients, label: 'Clients',    color: '#000' },
              { data: totalProps,   label: 'Properties', color: '#555' }
            ]}
            height={isMobile ? 220 : 260}
            margin={{ 
              top: 10, 
              right: isMobile ? 5 : 10, 
              bottom: isMobile ? 50 : 40, 
              left: isMobile ? 30 : 40 
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