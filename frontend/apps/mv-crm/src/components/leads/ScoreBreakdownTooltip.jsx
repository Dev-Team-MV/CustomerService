// apps/mv-crm/src/components/leads/ScoreBreakdownTooltip.jsx
import { useTranslation } from 'react-i18next'
import { Popover, Box, Typography, Chip, LinearProgress } from '@mui/material'
import { 
  TrendingUp, 
  TrendingDown,
  Source,
  Schedule,
  Event,
  Sms,
  CheckCircle,
  Warning
} from '@mui/icons-material'

// ═══════════════════════════════════════════════════════════════
// HELPER: Calcular desglose del score (con traducción)
// ═══════════════════════════════════════════════════════════════

const calculateScoreBreakdown = (lead, t) => {
  const breakdown = []
  let total = 0

  // 1. Fuente
  const sourcePoints = {
    web: 20,
    referido: 30,
    visita: 40,
    llamada: 15
  }
  const sourceScore = sourcePoints[lead.source] || 0
  if (sourceScore > 0) {
    breakdown.push({
      label: t('score.factors.source', { 
        source: t(`source.${lead.source}`, lead.source) 
      }),
      points: sourceScore,
      icon: <Source sx={{ fontSize: 14 }} />,
      color: '#2196f3'
    })
    total += sourceScore
  }

  // 2. Lead fresco (días desde creación)
  if (lead.createdAt) {
    const daysSinceCreation = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    let freshnessPoints = 0
    let freshnessLabel = ''
    
    if (daysSinceCreation <= 3) {
      freshnessPoints = 15
      // Usar pluralización de i18next
      freshnessLabel = t(`score.factors.freshDays`, { 
        count: daysSinceCreation, 
        days: daysSinceCreation,
        defaultValue: daysSinceCreation === 1 
          ? t('score.factors.freshDays_one', { days: daysSinceCreation })
          : t('score.factors.freshDays_other', { days: daysSinceCreation })
      })
    } else if (daysSinceCreation <= 7) {
      freshnessPoints = 8
      freshnessLabel = t('score.factors.recentDays', { days: daysSinceCreation })
    } else {
      freshnessLabel = t('score.factors.days', { days: daysSinceCreation })
    }

    breakdown.push({
      label: freshnessLabel,
      points: freshnessPoints,
      icon: <Schedule sx={{ fontSize: 14 }} />,
      color: freshnessPoints > 0 ? '#4caf50' : '#9e9e9e'
    })
    
    if (freshnessPoints > 0) total += freshnessPoints
  }

  // 3. Estancamiento en stage
  if (lead.stageEnteredAt) {
    const daysInStage = Math.floor((Date.now() - new Date(lead.stageEnteredAt).getTime()) / (1000 * 60 * 60 * 24))
    if (daysInStage > 7) {
      const penalty = (daysInStage - 7) * 5
      breakdown.push({
        label: t('score.factors.stuck', { 
          days: daysInStage, 
          stage: t(`stages.${lead.stage}`, lead.stage) 
        }),
        points: -penalty,
        icon: <Warning sx={{ fontSize: 14 }} />,
        color: '#f44336'
      })
      total -= penalty
    }
  }

  // 4. Cita futura
  if (lead.hasFutureAppointment) {
    breakdown.push({
      label: t('score.factors.appointment'),
      points: 25,
      icon: <Event sx={{ fontSize: 14 }} />,
      color: '#9c27b0'
    })
    total += 25
  }

  // 5. SMS respondido
  if (lead.smsResponded) {
    breakdown.push({
      label: t('score.factors.smsResponded'),
      points: 15,
      icon: <Sms sx={{ fontSize: 14 }} />,
      color: '#00bcd4'
    })
    total += 15
  }

  return { breakdown, total: Math.max(0, Math.min(100, total)) }
}

// ═══════════════════════════════════════════════════════════════
// HELPERS: Color y label del score
// ═══════════════════════════════════════════════════════════════

const getScoreColor = (score) => {
  if (score < 30) return '#d32f2f'
  if (score <= 60) return '#f57c00'
  return '#2e7d32'
}

const getScoreLabel = (score, t) => {
  if (score < 30) return t('score.levels.cold')
  if (score <= 60) return t('score.levels.warm')
  return t('score.levels.hot')
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const ScoreBreakdownTooltip = ({ 
  open, 
  anchorEl, 
  onClose, 
  onMouseEnter, 
  onMouseLeave, 
  lead 
}) => {
  const { t } = useTranslation('leads')
  const { breakdown, total } = calculateScoreBreakdown(lead, t)
  const scoreColor = getScoreColor(total)
  const scoreLabel = getScoreLabel(total, t)
  const percentage = Math.min(100, Math.max(0, total))

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      sx={{
        pointerEvents: 'none',
        '& .MuiPopover-paper': {
          pointerEvents: 'auto'
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: '1px solid #ececec',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          mt: 0.5,
          minWidth: 280,
          maxWidth: 320
        }
      }}
    >
      {/* Header con score total */}
      <Box
        sx={{
          p: 2,
          bgcolor: `${scoreColor}10`,
          borderBottom: '1px solid #ececec'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.65rem',
              color: '#888',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            {t('score.title')}
          </Typography>
          <Chip
            label={scoreLabel}
            size="small"
            sx={{
              bgcolor: scoreColor,
              color: '#fff',
              fontFamily: '"Courier New", monospace',
              fontSize: '0.65rem',
              fontWeight: 700,
              height: 20
            }}
          />
        </Box>

        <Box display="flex" alignItems="baseline" gap={1} mb={1}>
          <Typography
            sx={{
              fontFamily: '"Helvetica Neue", sans-serif',
              fontSize: '2rem',
              fontWeight: 700,
              color: scoreColor,
              lineHeight: 1
            }}
          >
            {total}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              color: '#888'
            }}
          >
            {t('score.outOf')}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              bgcolor: scoreColor,
              borderRadius: 3
            }
          }}
        />
      </Box>

      {/* Desglose */}
      <Box sx={{ p: 2 }}>
        <Typography
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.65rem',
            color: '#888',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            mb: 1.5
          }}
        >
          {t('score.breakdown')}
        </Typography>

        <Box display="flex" flexDirection="column" gap={1}>
          {breakdown.length === 0 ? (
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem',
                color: '#888',
                fontStyle: 'italic'
              }}
            >
              {t('score.noFactors')}
            </Typography>
          ) : (
            breakdown.map((item, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
                sx={{
                  p: 0.75,
                  bgcolor: item.points > 0 ? `${item.color}08` : '#f5f5f5',
                  borderRadius: 0.5,
                  borderLeft: `3px solid ${item.color}`
                }}
              >
                <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={0}>
                  <Box sx={{ color: item.color, flexShrink: 0 }}>
                    {item.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.7rem',
                      color: '#444',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  gap={0.5}
                  sx={{ flexShrink: 0 }}
                >
                  {item.points > 0 ? (
                    <TrendingUp sx={{ fontSize: 12, color: '#4caf50' }} />
                  ) : item.points < 0 ? (
                    <TrendingDown sx={{ fontSize: 12, color: '#f44336' }} />
                  ) : (
                    <CheckCircle sx={{ fontSize: 12, color: '#9e9e9e' }} />
                  )}
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: item.points > 0 ? '#4caf50' : item.points < 0 ? '#f44336' : '#9e9e9e',
                      minWidth: 30,
                      textAlign: 'right'
                    }}
                  >
                    {item.points > 0 ? '+' : ''}{item.points}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: '#fafafa',
          borderTop: '1px solid #ececec'
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.6rem',
            color: '#aaa',
            letterSpacing: '0.5px',
            textAlign: 'center'
          }}
        >
          {t('score.autoCalculated')}
        </Typography>
      </Box>
    </Popover>
  )
}

export default ScoreBreakdownTooltip