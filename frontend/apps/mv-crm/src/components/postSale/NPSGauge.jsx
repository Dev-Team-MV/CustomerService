import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

const NPSGauge = ({ score, size = 'medium' }) => {
  const { t } = useTranslation('postSale')
  
  const getColor = (s) => {
    if (s >= 9) return '#4caf50'   // Promotor
    if (s >= 7) return '#ff9800'   // Pasivo
    return '#f44336'               // Detractor
  }

  const getLabel = (s) => {
    if (s >= 9) return t('nps.promoter', 'Promotor')
    if (s >= 7) return t('nps.passive', 'Pasivo')
    return t('nps.detractor', 'Detractor')
  }

  const sizes = {
    small: { fontSize: '1rem', barHeight: 6 },
    medium: { fontSize: '1.5rem', barHeight: 8 },
    large: { fontSize: '2.5rem', barHeight: 12 }
  }

  const s = sizes[size]

  return (
    <Box sx={{ textAlign: 'center', minWidth: 100 }}>
      <Typography sx={{ fontSize: s.fontSize, fontWeight: 700, color: getColor(score) }}>
        {score !== undefined ? score : '—'}
      </Typography>
      <Box sx={{ height: s.barHeight, bgcolor: '#e0e0e0', borderRadius: 4, mt: 0.5, overflow: 'hidden' }}>
        <Box sx={{ 
          height: '100%', 
          width: `${(score / 10) * 100}%`, 
          bgcolor: getColor(score),
          borderRadius: 4,
          transition: 'width 0.5s ease'
        }} />
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
        {getLabel(score)}
      </Typography>
    </Box>
  )
}

export default NPSGauge