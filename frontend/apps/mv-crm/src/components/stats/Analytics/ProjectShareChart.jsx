// apps/mv-crm/src/components/stats/Analytics/ProjectShareChart.jsx
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import { PieChart } from '@mui/x-charts/PieChart'
import { useTranslation } from 'react-i18next'

const fmt = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val ?? 0)

const COLORS = ['#000', '#4a7c59', '#c0842a', '#555', '#888', '#bbb', '#999', '#666']

export default function ProjectShareChart({ filteredBalance }) {
  const { t } = useTranslation('analytics')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const totalCollected = filteredBalance.reduce((s, p) => s + (p.totalCollected ?? 0), 0)
  const isEmpty = filteredBalance.length === 0 || totalCollected === 0

  // Filtrar solo proyectos con valor > 0 para el gráfico
  const data = filteredBalance
    .filter(p => (p.totalCollected ?? 0) > 0)
    .map((p, i) => ({
      id: i,
      value: p.totalCollected ?? 0,
      label: p.name,
      color: COLORS[i % COLORS.length],
    }))

  // Si no hay datos con valor, mostrar todos pero el gráfico estará vacío
  const displayData = data.length > 0 ? data : filteredBalance.map((p, i) => ({
    id: i,
    value: 0,
    label: p.name,
    color: COLORS[i % COLORS.length],
  }))

  return (
    <Box sx={{ width: '100%' }}>
      <Typography sx={{
        fontFamily: '"Courier New", monospace', fontSize: '0.6rem',
        color: '#000', letterSpacing: '2px', textTransform: 'uppercase', mb: 3
      }}>
        {t('mv.share.title')}
      </Typography>

      {isEmpty ? (
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 220, border: '1px dashed #e0e0e0', borderRadius: 0
        }}>
          <Typography sx={{
            fontFamily: '"Courier New", monospace', fontSize: '0.65rem',
            color: '#000', letterSpacing: '2px'
          }}>
            {t('mv.share.noData')}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 3,
          width: '100%'
        }}>
          {/* Donut centrado */}
          <Box sx={{ 
            position: 'relative', 
            width: isMobile ? 200 : 240, 
            height: isMobile ? 200 : 240 
          }}>
            <PieChart
              series={[{
                data: displayData,
                innerRadius: isMobile ? 40 : 55,
                outerRadius: isMobile ? 80 : 100,
                paddingAngle: 2,
                cornerRadius: 0,
                highlightScope: { faded: 'global', highlighted: 'item' },
                faded: { innerRadius: isMobile ? 35 : 50, additionalRadius: -4, color: '#000' },
                cx: isMobile ? 100 : 120,
                cy: isMobile ? 100 : 120,
              }]}
              width={isMobile ? 200 : 240}
              height={isMobile ? 200 : 240}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              slotProps={{ legend: { hidden: true } }}
              sx={{
                '& .MuiChartsAxis-line': { stroke: 'transparent' },
                '& .MuiChartsAxis-tick': { stroke: 'transparent' },
                '& .MuiPieArc-root': { 
                  stroke: '#fff',
                  strokeWidth: 2
                }
              }}
            />
          </Box>

          {/* Leyenda scrollable */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            width: '100%',
            maxHeight: isMobile ? 200 : 300,
            overflowY: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-track': { background: '#f0f0f0', borderRadius: 0 },
            '&::-webkit-scrollbar-thumb': { background: '#ccc', borderRadius: 0 }
          }}>
            {filteredBalance.map((p, i) => {
              const value = p.totalCollected ?? 0
              const pct = totalCollected > 0
                ? ((value / totalCollected) * 100).toFixed(1)
                : '0.0'
              const color = COLORS[i % COLORS.length]
              
              return (
                <Box
                  key={p.projectId || i}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    minWidth: 0,
                    p: 1,
                    border: '1px solid #f0f0f0',
                    borderRadius: 0,
                    '&:hover': { borderColor: '#000' },
                    opacity: value === 0 ? 0.5 : 1
                  }}
                >
                  {/* Barra color */}
                  <Box sx={{ 
                    width: 3, 
                    height: 48, 
                    bgcolor: color, 
                    flexShrink: 0, 
                    mt: 0.3,
                    borderRadius: 0
                  }} />

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Nombre + % */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'baseline', 
                      mb: 0.3 
                    }}>
                      <Typography sx={{
                        fontFamily: '"Helvetica Neue", sans-serif',
                        fontSize: isMobile ? '0.7rem' : '0.8rem', 
                        fontWeight: 500, 
                        color: '#000',
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        maxWidth: '65%'
                      }}>
                        {p.name}
                      </Typography>
                      <Typography sx={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.6rem', 
                        color: '#000', 
                        flexShrink: 0, 
                        ml: 0.5
                      }}>
                        {pct}%
                      </Typography>
                    </Box>

                    {/* Valor */}
                    <Typography sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.6rem', 
                      color: '#000', 
                      mb: 0.6
                    }}>
                      {fmt(value)}
                    </Typography>

                    {/* Mini progress */}
                    <Box sx={{ height: 2, background: '#f0f0f0', borderRadius: 0 }}>
                      <Box sx={{
                        height: '100%',
                        width: `${pct}%`,
                        bgcolor: color,
                        transition: 'width 0.8s ease',
                        borderRadius: 0
                      }} />
                    </Box>
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>
      )}
    </Box>
  )
}