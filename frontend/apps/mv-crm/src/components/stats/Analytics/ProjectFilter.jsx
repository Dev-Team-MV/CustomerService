import { Box, Typography } from '@mui/material'
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function ProjectFilter({ projects, activeIds, onToggle, onToggleAll }) {
    const { t } = useTranslation('analytics')
    const allActive = projects.every(p => activeIds.has(p.projectId))

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{
          fontFamily: '"Courier New", monospace', fontSize: '0.6rem',
          color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase'
        }}>
         {t('mv.filter.title')}
        </Typography>

        {/* Toggle all */}
        <Box
          onClick={onToggleAll}
          sx={{
            display: 'flex', alignItems: 'center', gap: 0.5,
            cursor: 'pointer',
            '&:hover span': { color: '#000' }
          }}
        >
          {allActive
            ? <CheckBox sx={{ fontSize: 14, color: '#000' }} />
            : <CheckBoxOutlineBlank sx={{ fontSize: 14, color: '#bbb' }} />
          }
          <Typography component="span" sx={{
            fontFamily: '"Courier New", monospace', fontSize: '0.58rem',
            color: '#000000ff', letterSpacing: '1.5px', textTransform: 'uppercase',
            transition: 'color 0.2s'
          }}>
            {t('mv.filter.all')}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
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
                }}
              >
                {/* Dot indicador */}
                <Box sx={{
                  width: 6, height: 6,
                  borderRadius: '50%',
                  bgcolor: active ? '#fff' : '#ccc',
                  transition: 'background 0.2s'
                }} />

                <Typography sx={{
                  fontFamily: '"Helvetica Neue", sans-serif',
                  fontSize: '0.78rem', fontWeight: 500,
                  color: active ? '#fff' : '#555',
                  letterSpacing: '-0.01em',
                  transition: 'color 0.2s'
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
                    transition: 'color 0.2s'
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