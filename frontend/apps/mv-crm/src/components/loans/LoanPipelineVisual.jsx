import { Box, Typography, Tooltip } from '@mui/material'
import { motion } from 'framer-motion'
import {
  LOAN_PIPELINE_STAGES,
  STAGE_LABELS,
  STAGE_PHASE_MAP,
  PHASE_COLORS,
  PHASE_LABELS
} from '../../services/loanService'

const PHASES = ['application', 'processing', 'underwriting', 'closing']

export default function LoanPipelineVisual({ currentStage, onStageClick }) {
  const currentIndex = LOAN_PIPELINE_STAGES.indexOf(currentStage)
  const groupedStages = PHASES.map(phase => ({
    phase,
    label: PHASE_LABELS[phase],
    color: PHASE_COLORS[phase],
    stages: LOAN_PIPELINE_STAGES.filter(s => STAGE_PHASE_MAP[s] === phase)
  }))

  return (
    <Box sx={{ mb: 3 }}>
      {/* Phase progress bar */}
      <Box sx={{ display: 'flex', gap: 0, mb: 2 }}>
        {groupedStages.map((group, gi) => {
          const firstIdx = LOAN_PIPELINE_STAGES.indexOf(group.stages[0])
          const lastIdx = LOAN_PIPELINE_STAGES.indexOf(group.stages[group.stages.length - 1])
          const isActive = currentIndex >= firstIdx
          const isComplete = currentIndex > lastIdx
          const isCurrent = currentIndex >= firstIdx && currentIndex <= lastIdx
          const progressInPhase = isCurrent
            ? ((currentIndex - firstIdx + 1) / group.stages.length) * 100
            : isComplete ? 100 : 0

          return (
            <Box key={group.phase} sx={{ flex: group.stages.length, position: 'relative' }}>
              <Box
                sx={{
                  height: 8,
                  bgcolor: '#f0f0f0',
                  borderLeft: gi > 0 ? '1px solid #fff' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressInPhase}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    backgroundColor: group.color,
                    position: 'absolute',
                    left: 0,
                    top: 0
                  }}
                />
              </Box>
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.58rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: isActive ? group.color : '#bbb',
                  fontWeight: isCurrent ? 700 : 400,
                  mt: 0.5,
                  textAlign: 'center'
                }}
              >
                {group.label}
              </Typography>
            </Box>
          )
        })}
      </Box>

      {/* Detailed stage dots */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {LOAN_PIPELINE_STAGES.map((stage, i) => {
          const phase = STAGE_PHASE_MAP[stage]
          const color = PHASE_COLORS[phase]
          const isPast = i < currentIndex
          const isCurrent = i === currentIndex
          const isFuture = i > currentIndex

          return (
            <Tooltip key={stage} title={`${i + 1}. ${STAGE_LABELS[stage]}`} arrow placement="top">
              <Box
                onClick={() => onStageClick?.(stage)}
                sx={{
                  width: isCurrent ? 16 : 10,
                  height: isCurrent ? 16 : 10,
                  borderRadius: '50%',
                  bgcolor: isPast ? color : isCurrent ? color : '#e0e0e0',
                  border: isCurrent ? `2px solid ${color}` : 'none',
                  cursor: onStageClick ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  opacity: isFuture ? 0.4 : 1,
                  '&:hover': {
                    transform: 'scale(1.4)',
                    opacity: 1
                  }
                }}
              />
            </Tooltip>
          )
        })}
      </Box>

      {/* Current stage label */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
        <Typography
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.6rem',
            color: '#888',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}
        >
          Current:
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Helvetica Neue", sans-serif',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: PHASE_COLORS[STAGE_PHASE_MAP[currentStage]] || '#000'
          }}
        >
          {STAGE_LABELS[currentStage] || currentStage}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.6rem',
            color: '#aaa'
          }}
        >
          ({currentIndex + 1}/{LOAN_PIPELINE_STAGES.length})
        </Typography>
      </Box>
    </Box>
  )
}
