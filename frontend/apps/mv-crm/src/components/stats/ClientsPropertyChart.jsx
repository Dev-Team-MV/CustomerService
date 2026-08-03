// apps/mv-crm/src/components/stats/ClientsPropertyChart.jsx
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import { useTranslation } from 'react-i18next'

export default function ClientsPropertyChart({ clientsData }) {
  const { t } = useTranslation('analytics')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const clients = clientsData?.clients ?? []

  if (clients.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, border: '1px dashed #e0e0e0', borderRadius: 0 }}>
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000', letterSpacing: '2px' }}>
          {t('mv.modal.propertyChart.noData')}
        </Typography>
      </Box>
    )
  }

  const xLabels = clients.map(c => `${c.firstName} ${c.lastName[0]}.`)
  const values  = clients.map(c => c.propertyCount ?? 0)

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#000', letterSpacing: '2px', textTransform: 'uppercase', mb: 2 }}>
        {t('mv.modal.propertyChart.title')}
      </Typography>
      <Box sx={{ width: '100%', minWidth: 0, overflowX: 'auto' }}>
        <BarChart
          xAxis={[{
            scaleType: 'band',
            data: xLabels,
            tickLabelStyle: { fontFamily: '"Courier New", monospace', fontSize: isMobile ? 9 : 10, fill: '#000' }
          }]}
          yAxis={[{
            tickLabelStyle: { fontFamily: '"Courier New", monospace', fontSize: isMobile ? 9 : 10, fill: '#000' }
          }]}
          series={[{
            data: values,
            color: '#000',
            label: t('mv.modal.propertyChart.series'),
          }]}
          height={isMobile ? 200 : 220}
          margin={{ top: 10, right: isMobile ? 5 : 10, bottom: isMobile ? 50 : 40, left: isMobile ? 30 : 40 }}
          slotProps={{ legend: { hidden: true } }}
          sx={{
            width: '100% !important',
            '& .MuiChartsAxis-line': { stroke: '#f0f0f0' },
            '& .MuiChartsAxis-tick': { stroke: '#f0f0f0' },
            '& .MuiBarElement-root': { rx: 0 },
          }}
        />
      </Box>
    </Box>
  )
}