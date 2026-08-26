// apps/mv-crm/src/components/stats/Analytics/ProjectFilter.jsx
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function ProjectFilter({ projects, activeIds, onToggle, onToggleAll }) {
  const { t } = useTranslation('analytics')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const allActive = projects.every(p => activeIds.has(p.projectId))

  return (
    <Box id="analytics-project-filter">
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
          {t('mv.filter.title')}
        </Typography>

        {/* Toggle all */}
        <Box
          onClick={onToggleAll}
          sx={{
            display: 'flex', alignItems: 'center', gap: 0.5,
            cursor: 'pointer',
            '&:hover span': { color: '#000' },
            px: 1, py: 0.5,
            border: '1px solid transparent',
            borderRadius: 0,
            '&:hover': { borderColor: '#000' }
          }}
        >
          {allActive
            ? <CheckBox sx={{ fontSize: 14, color: '#000' }} />
            : <CheckBoxOutlineBlank sx={{ fontSize: 14, color: '#000' }} />
          }
          <Typography component="span" sx={{
            fontFamily: '"Courier New", monospace', fontSize: '0.58rem',
            color: '#000', letterSpacing: '1.5px', textTransform: 'uppercase',
            transition: 'color 0.2s'
          }}>
            {t('mv.filter.all')}
          </Typography>
        </Box>
      </Box>

      {/* Scroll horizontal en móvil, wrap en desktop */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1.5, 
        flexWrap: { xs: 'nowrap', sm: 'wrap' },
        overflowX: { xs: 'auto', sm: 'visible' },
        pb: { xs: 1, sm: 0 },
        '&::-webkit-scrollbar': { height: 4 },
        '&::-webkit-scrollbar-track': { background: '#f0f0f0', borderRadius: 0 },
        '&::-webkit-scrollbar-thumb': { background: '#ccc', borderRadius: 0 }
      }}>
        {projects.map((p, i) => {
          const active = activeIds.has(p.projectId)
          return (
            <motion.div
              key={p.projectId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              style={{ flexShrink: 0 }}
            >
              <Box
                onClick={() => onToggle(p.projectId)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  px: 2, py: 1,
                  border: `1px solid ${active ? '#000' : '#e0e0e0'}`,
                  background: active ? '#000' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  userSelect: 'none',
                  borderRadius: 0,
                  whiteSpace: 'nowrap'
                }}
              >
                {/* Dot indicador */}
                <Box sx={{
                  width: 6, height: 6,
                  borderRadius: '50%',
                  bgcolor: active ? '#fff' : '#ccc',
                  transition: 'background 0.2s',
                  flexShrink: 0
                }} />

                <Typography sx={{
                  fontFamily: '"Helvetica Neue", sans-serif',
                  fontSize: '0.78rem', fontWeight: 500,
                  color: active ? '#fff' : '#555',
                  letterSpacing: '-0.01em',
                  transition: 'color 0.2s',
                  maxWidth: 150,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {p.name}
                </Typography>

                {/* Collected badge */}
                {p.totalCollected > 0 && (
                  <Typography sx={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.55rem',
                    color: active ? 'rgba(255,255,255,0.5)' : '#aaa',
                    letterSpacing: '0.5px',
                    transition: 'color 0.2s',
                    flexShrink: 0
                  }}>
                    ${(p.totalCollected / 1000).toFixed(0)}k
                  </Typography>
                )}
              </Box>
            </motion.div>
          )
        })}
      </Box>
    </Box>
  )
}