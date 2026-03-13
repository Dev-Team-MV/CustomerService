import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'

/**
 * StatsStrip — banda de métricas horizontal
 * @param {Array} stats - [{ label: string, value: number|string }]
 */
export default function StatsStrip({ stats = [] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
      <Box sx={{ display: 'flex', border: '1px solid #e8e8e8', background: '#fff', mb: 5, flexWrap: 'wrap' }}>
        {stats.map((s, i, arr) => (
          <Box key={s.label} sx={{
            flex: '1 1 120px', p: '18px 24px',
            borderRight: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none'
          }}>
            <Typography sx={{
              fontFamily: '"Courier New", monospace', fontSize: '0.58rem',
              color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase', mb: 0.5
            }}>
              {s.label}
            </Typography>
            <Typography sx={{
              fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 200,
              fontSize: '1.7rem', color: '#000', letterSpacing: '-0.04em', lineHeight: 1
            }}>
              {s.prefix}{s.value}{s.suffix}
            </Typography>
          </Box>
        ))}
      </Box>
    </motion.div>
  )
}