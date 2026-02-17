import { Box, Typography, LinearProgress } from '@mui/material'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const AnimatedProgressBar = ({ 
  label, 
  current, 
  target, 
  suffix = '%',
  color = 'primary',
  height = 12
}) => {
  const [animatedValue, setAnimatedValue] = useState(0)
  const percentage = target > 0 ? (current / target) * 100 : 0

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage)
    }, 300)
    return () => clearTimeout(timer)
  }, [percentage])

  const getColorScheme = () => {
    if (percentage >= 100) return { main: '#8CA551', bg: 'rgba(140, 165, 81, 0.15)' }
    if (percentage >= 75) return { main: '#4a7c59', bg: 'rgba(74, 124, 89, 0.15)' }
    if (percentage >= 50) return { main: '#E5863C', bg: 'rgba(229, 134, 60, 0.15)' }
    return { main: '#d32f2f', bg: 'rgba(211, 47, 47, 0.15)' }
  }

  const colors = getColorScheme()

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography
          variant="body2"
          sx={{
            color: '#706f6f',
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif',
            fontSize: { xs: '0.85rem', md: '0.9rem' }
          }}
        >
          {label}
        </Typography>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: colors.main,
              fontFamily: '"Poppins", sans-serif',
              fontSize: { xs: '0.85rem', md: '0.9rem' }
            }}
          >
            {current}{suffix} / {target}{suffix}
          </Typography>
        </motion.div>
      </Box>

      <Box sx={{ position: 'relative', mb: 1 }}>
        <Box
          sx={{
            height: height,
            borderRadius: 3,
            bgcolor: colors.bg,
            overflow: 'hidden',
            position: 'relative',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(animatedValue, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${colors.main}, ${colors.main}dd)`,
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <motion.div
              animate={{
                x: ['0%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '30%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              }}
            />
          </motion.div>
        </Box>

        {percentage >= 100 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, type: 'spring' }}
            style={{
              position: 'absolute',
              right: -8,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: colors.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 14,
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              ✓
            </Box>
          </motion.div>
        )}
      </Box>

      <Typography
        variant="caption"
        sx={{
          color: percentage >= 100 ? colors.main : '#999',
          fontWeight: 500,
          fontFamily: '"Poppins", sans-serif',
          fontSize: { xs: '0.7rem', md: '0.75rem' }
        }}
      >
        {percentage.toFixed(1)}% {percentage >= 100 ? '🎉 Target achieved!' : 'of target'}
      </Typography>
    </Box>
  )
}

export default AnimatedProgressBar