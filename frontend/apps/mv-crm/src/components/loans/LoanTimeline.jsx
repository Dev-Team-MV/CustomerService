import { Box, Typography } from '@mui/material'
import { Person, Description, SwapHoriz, Note, Check } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

const ACTION_ICONS = {
  created: <Check fontSize="small" />,
  updated: <SwapHoriz fontSize="small" />,
  document_uploaded: <Description fontSize="small" />,
  note_added: <Note fontSize="small" />,
  default: <Person fontSize="small" />
}

export default function LoanTimeline({ timeline = [] }) {
  const { t } = useTranslation('loans')

  if (!Array.isArray(timeline) || timeline.length === 0) {
    return (
      <Box sx={{ p: 3, border: '1px solid #ececec', borderRadius: 0, bgcolor: '#fafafa', textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
          {t('loans.timeline.empty', 'No activity recorded yet.')}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 0, m: 0 }}>
      {timeline.map((event, index) => {
        if (!event) return null
        
        const Icon = ACTION_ICONS[event.action] || ACTION_ICONS.default
        const userName = event.performedBy 
          ? `${event.performedBy.firstName || ''} ${event.performedBy.lastName || ''}`.trim() || 'System'
          : 'System'
        
        const formattedDate = event.timestamp 
          ? new Date(event.timestamp).toLocaleString() 
          : t('loans.timeline.noDate', 'No date')
        
        return (
          <Box key={event._id || index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
            {/* Columna del punto + línea conectora */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: '#e3f2fd',
                  color: '#1976d2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {Icon}
              </Box>
              {index < timeline.length - 1 && (
                <Box sx={{ width: '2px', flexGrow: 1, minHeight: 32, bgcolor: '#e0e0e0', my: 0.5 }} />
              )}
            </Box>

            {/* Contenido del evento */}
            <Box sx={{ py: 1.5, px: 2, flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', fontFamily: '"Helvetica Neue", sans-serif' }}>
                    {event.description || (event.action ? event.action.replace(/_/g, ' ').toUpperCase() : t('loans.timeline.unknownAction', 'Unknown action'))}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }}>
                    {t('loans.timeline.by', 'by')} {userName}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#9e9e9e', fontFamily: '"Courier New", monospace', fontSize: '0.65rem', whiteSpace: 'nowrap', ml: 2 }}>
                  {formattedDate}
                </Typography>
              </Box>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}