// apps/mv-crm/src/components/leads/ScoreBadge.jsx
import { useState, useRef } from 'react'
import { Chip } from '@mui/material'
import { TrendingUp } from '@mui/icons-material'
import ScoreBreakdownTooltip from './ScoreBreakdownTooltip'

const getScoreColor = (score) => {
  if (score < 30) return { bg: '#ffebee', color: '#d32f2f', border: '#ffcdd2' } // Rojo
  if (score <= 60) return { bg: '#fff3e0', color: '#f57c00', border: '#ffe0b2' } // Amarillo
  return { bg: '#e8f5e9', color: '#2e7d32', border: '#c8e6c9' } // Verde
}

const getScoreLabel = (score) => {
  if (score < 30) return 'Frío'
  if (score <= 60) return 'Tibio'
  return 'Caliente'
}

const ScoreBadge = ({ lead, size = 'small' }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const closeTimeoutRef = useRef(null)
  const score = lead.score || 0
  const colors = getScoreColor(score)
  const label = getScoreLabel(score)

  const open = Boolean(anchorEl)

  // ✅ NUEVO: Cancelar el timeout de cierre
  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  // ✅ NUEVO: Programar cierre con delay
  const scheduleClose = () => {
    cancelClose()
    closeTimeoutRef.current = setTimeout(() => {
      setAnchorEl(null)
    }, 200) // 200ms de gracia para mover el mouse al popover
  }

  const handleMouseEnter = (event) => {
    cancelClose()
    setAnchorEl(event.currentTarget)
  }

  const handleMouseLeave = () => {
    scheduleClose()
  }

  const handleClick = (event) => {
    if (open) {
      setAnchorEl(null)
    } else {
      setAnchorEl(event.currentTarget)
    }
  }

  return (
    <>
      <Chip
        icon={size === 'small' ? null : <TrendingUp sx={{ fontSize: 14 }} />}
        label={`${score}`}
        size={size}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        sx={{
          height: size === 'small' ? 22 : 26,
          minWidth: size === 'small' ? 32 : 40,
          bgcolor: colors.bg,
          color: colors.color,
          border: `1px solid ${colors.border}`,
          fontFamily: '"Courier New", monospace',
          fontSize: size === 'small' ? '0.7rem' : '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.5px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: colors.color,
            color: '#fff',
            transform: 'scale(1.05)',
            boxShadow: `0 2px 8px ${colors.color}40`
          },
          '& .MuiChip-icon': {
            color: 'inherit',
            ml: 0.5
          },
          '& .MuiChip-label': {
            px: size === 'small' ? 0.75 : 1,
            fontWeight: 700
          }
        }}
      />

      <ScoreBreakdownTooltip
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        lead={lead}
      />
    </>
  )
}

export default ScoreBadge