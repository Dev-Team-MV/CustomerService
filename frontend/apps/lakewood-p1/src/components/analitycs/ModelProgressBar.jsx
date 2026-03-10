import { Box, Typography, Tooltip } from '@mui/material'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const ModelProgressBar = ({ model }) => {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const availableCount = model.total - model.sold - model.pending
  const availablePercentage = model.total > 0 
    ? ((availableCount / model.total) * 100) 
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Box
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.08)',
          bgcolor: '#ffffff',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#333F1F',
            boxShadow: '0 8px 24px rgba(51, 63, 31, 0.12)',
            bgcolor: 'rgba(140, 165, 81, 0.02)'
          }
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              color: '#333F1F',
              fontFamily: '"Poppins", sans-serif',
              fontSize: { xs: '0.95rem', md: '1rem' }
            }}
          >
            {model.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#706f6f',
              fontWeight: 600,
              fontFamily: '"Poppins", sans-serif',
              fontSize: { xs: '0.85rem', md: '0.9rem' }
            }}
          >
            {model.sold + model.pending} / {model.total}
          </Typography>
        </Box>

        {/* Progress Bar */}
        <Box
          sx={{
            position: 'relative',
            height: 12,
            bgcolor: '#f0f0f0',
            borderRadius: 3,
            overflow: 'hidden',
            mb: 2,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
          }}
        >
          {/* Sold - Red */}
          <Tooltip title={`${model.sold} sold (${model.soldPercentage}%)`} arrow>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: animated ? `${model.soldPercentage}%` : 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                background: 'linear-gradient(90deg, #d32f2f, #f44336)',
                cursor: 'pointer'
              }}
            />
          </Tooltip>

          {/* Pending - Blue */}
          <Tooltip title={`${model.pending} pending (${model.pendingPercentage}%)`} arrow>
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: animated ? `${model.pendingPercentage}%` : 0
              }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: `${model.soldPercentage}%`,
                top: 0,
                height: '100%',
                background: 'linear-gradient(90deg, #1976d2, #2196f3)',
                cursor: 'pointer'
              }}
            />
          </Tooltip>

          {/* Available - Gray (el resto) */}
          <Tooltip title={`${availableCount} available (${availablePercentage.toFixed(1)}%)`} arrow>
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                height: '100%',
                width: `${availablePercentage}%`,
                bgcolor: '#e0e0e0',
                cursor: 'pointer'
              }}
            />
          </Tooltip>
        </Box>

        {/* Legend */}
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#f44336'
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: '#d32f2f',
                fontWeight: 600,
                fontFamily: '"Poppins", sans-serif',
                fontSize: { xs: '0.7rem', md: '0.75rem' }
              }}
            >
              {model.sold} sold
            </Typography>
          </Box>

          {model.pending > 0 && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: '#2196f3'
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: '#1976d2',
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: '0.7rem', md: '0.75rem' }
                }}
              >
                {model.pending} pending
              </Typography>
            </Box>
          )}

          <Box display="flex" alignItems="center" gap={0.5}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#9e9e9e'
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: '#757575',
                fontWeight: 600,
                fontFamily: '"Poppins", sans-serif',
                fontSize: { xs: '0.7rem', md: '0.75rem' }
              }}
            >
              {availableCount} available
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  )
}

export default ModelProgressBar