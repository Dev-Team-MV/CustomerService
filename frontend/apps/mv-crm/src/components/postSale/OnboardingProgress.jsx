// apps/mv-crm/src/components/postSale/OnboardingProgress.jsx
import { useState, useEffect } from 'react'
import { Box, Typography, LinearProgress, Checkbox, FormControlLabel, Paper, Chip } from '@mui/material'
import { CheckCircle, Circle } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useOnboarding } from '../../constants/hooks/useOnboarding'

const OnboardingProgress = ({ propertyId, onRefresh }) => {
  const { t, i18n } = useTranslation('postSale')
  const { data, loading, toggleItem } = useOnboarding({ propertyId })
  const [localItems, setLocalItems] = useState(data?.items || [])

  useEffect(() => {
    if (data?.items) setLocalItems(data.items)
  }, [data])

  const completedCount = localItems.filter(i => i.completed).length
  const totalCount = localItems.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const handleToggle = async (itemKey) => {
    try {
      await toggleItem(data._id, itemKey)
      setLocalItems(prev => 
        prev.map(i => i.key === itemKey ? { ...i, completed: !i.completed } : i)
      )
      onRefresh?.()
    } catch (err) {
      console.error('Error toggling item:', err)
    }
  }

  const currentLang = i18n.language === 'es' ? 'label_es' : 'label_en'

  return (
    <Paper sx={{ p: 3, borderRadius: 0, border: '1px solid #ececec' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ fontFamily: '"Courier New", monospace', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {t('onboarding.progressTitle')}
        </Typography>
        <Chip 
          label={`${completedCount}/${totalCount}`} 
          color={progress === 100 ? 'success' : 'primary'}
          sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem', fontWeight: 600 }}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 10, 
            borderRadius: 0,
            bgcolor: '#e0e0e0',
            '& .MuiLinearProgress-bar': { borderRadius: 0, bgcolor: '#4caf50' }
          }} 
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontFamily: '"Courier New", monospace' }}>
          {Math.round(progress)}% {t('onboarding.completed')}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {localItems.map((item) => (
          <Paper 
            key={item.key} 
            variant="outlined" 
            sx={{ 
              p: 2, 
              borderRadius: 0,
              border: '1px solid #e0e0e0',
              bgcolor: item.completed ? '#f1f8e9' : 'background.paper',
              borderColor: item.completed ? '#4caf50' : '#e0e0e0',
              transition: 'all 0.2s'
            }}
          >
            <FormControlLabel
              control={
                <Checkbox 
                  checked={item.completed} 
                  onChange={() => handleToggle(item.key)}
                  icon={<Circle />}
                  checkedIcon={<CheckCircle color="success" />}
                />
              }
              label={
                <Box>
                  <Typography sx={{ 
                    fontWeight: 600,
                    textDecoration: item.completed ? 'line-through' : 'none',
                    color: item.completed ? 'text.secondary' : 'text.primary',
                    fontFamily: '"Helvetica Neue", sans-serif'
                  }}>
                    {item[currentLang] || item.label_es || item.label_en || item.label || item.key}
                  </Typography>
                  {item.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
                      {item.description}
                    </Typography>
                  )}
                </Box>
              }
            />
          </Paper>
        ))}
      </Box>
    </Paper>
  )
}

export default OnboardingProgress