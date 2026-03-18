import { Box, Typography } from '@mui/material'
import { PieChart } from '@mui/x-charts/PieChart'
import { useTranslation } from 'react-i18next'

const fmt = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val ?? 0)

const COLORS = ['#000', '#4a7c59', '#c0842a', '#555', '#888', '#bbb']

export default function ProjectShareChart({ filteredBalance }) {
      const { t } = useTranslation('analytics')

  const totalCollected = filteredBalance.reduce((s, p) => s + (p.totalCollected ?? 0), 0)
  const isEmpty = filteredBalance.length === 0 || totalCollected === 0

  const data = filteredBalance.map((p, i) => ({
    id: i,
    value: p.totalCollected ?? 0,
    label: p.name,
    color: COLORS[i % COLORS.length],
  }))

  return (
    <Box>
      <Typography sx={{
        fontFamily: '"Courier New", monospace', fontSize: '0.6rem',
        color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase', mb: 3
      }}>
        {t('mv.share.title')}
      </Typography>

      {isEmpty ? (
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 220, border: '1px dashed #e0e0e0'
        }}>
          <Typography sx={{
            fontFamily: '"Courier New", monospace', fontSize: '0.65rem',
            color: '#000000ff', letterSpacing: '2px'
          }}>
            {t('mv.share.noData')}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>

          {/* ── Donut centrado ── */}
          <PieChart
            series={[{
              data,
              innerRadius: 55,
              outerRadius: 100,
              paddingAngle: 2,
              cornerRadius: 0,
              highlightScope: { faded: 'global', highlighted: 'item' },
              faded: { innerRadius: 50, additionalRadius: -4, color: '#000000ff' },
            }]}
            width={240}
            height={240}
            slotProps={{ legend: { hidden: true } }}
          />

          {/* ── Legend row — ancho completo ── */}
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            width: '100%',
          }}>
            {data.map(d => {
              const pct = totalCollected > 0
                ? ((d.value / totalCollected) * 100).toFixed(1)
                : '0.0'
              return (
                <Box
                  key={d.id}
                  sx={{
                    flex: '1 1 120px',          // responsive: mínimo 120px, crece igual
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    minWidth: 0,
                  }}
                >
                  {/* Barra color */}
                  <Box sx={{ width: 3, height: 48, bgcolor: d.color, flexShrink: 0, mt: 0.3 }} />

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Nombre + % */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.3 }}>
                      <Typography sx={{
                        fontFamily: '"Helvetica Neue", sans-serif',
                        fontSize: '0.8rem', fontWeight: 500, color: '#000',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        maxWidth: '70%'
                      }}>
                        {d.label}
                      </Typography>
                      <Typography sx={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.6rem', color: '#000000ff', flexShrink: 0, ml: 0.5
                      }}>
                        {pct}%
                      </Typography>
                    </Box>

                    {/* Valor */}
                    <Typography sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.6rem', color: '#000000ff', mb: 0.6
                    }}>
                      {fmt(d.value)}
                    </Typography>

                    {/* Mini progress */}
                    <Box sx={{ height: 2, background: '#f0f0f0' }}>
                      <Box sx={{
                        height: '100%',
                        width: `${pct}%`,
                        bgcolor: d.color,
                        transition: 'width 0.8s ease'
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