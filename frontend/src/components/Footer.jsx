import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const TypingFooter = ({ variant = 'light' }) => {
  const isDark = variant === 'dark'
  const [displayText, setDisplayText] = useState('')
  const fullText = "Premium Lakefront Living Experience"

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.substring(0, index))
        index++
      } else {
        clearInterval(timer)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [])

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        px: 4,
        zIndex: 10,
        background: isDark
          ? 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)'
          : 'linear-gradient(to top, rgba(255,255,255,0.8), transparent)'
      }}
    >
      {/* Typing Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <Typography
          sx={{
            color: isDark ? 'rgba(117, 117, 117, 0.9)' : '#4a7c59',
            fontSize: '0.85rem',
            fontWeight: 300,
            letterSpacing: '2px',
            fontFamily: 'monospace',
            mb: 1
          }}
        >
          {displayText}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ marginLeft: '2px' }}
          >
            |
          </motion.span>
        </Typography>
      </motion.div>

      {/* Divider Line */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '60px' }}
        transition={{ delay: 1.5, duration: 0.8 }}
        style={{
          height: '1px',
          backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(74,124,89,0.3)',
          marginBottom: '8px'
        }}
      />

      {/* Copyright */}
      <Typography
        variant="caption"
        sx={{
          color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary',
          fontSize: '0.65rem',
          letterSpacing: '1px'
        }}
      >
        © 2026 Developed by Michelangelo Del Valle • All Rights Reserved
      </Typography>
    </Box>
  )
}

export default TypingFooter