// apps/mv-crm/src/components/campaigns/steps/Step4Send.jsx
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  LinearProgress,
  CircularProgress
} from '@mui/material'
import { 
  Send, 
  CheckCircle,
  Error as ErrorIcon,
  Campaign,
  Replay
} from '@mui/icons-material'

const Step4Send = ({
  sendProgress,
  onSend,
  onResend,
  loading
}) => {
  const { t } = useTranslation('campaign')

  if (!sendProgress) {
    return (
      <Box textAlign="center" py={4}>
        <Campaign sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
        <Typography
          sx={{
            fontFamily: '"Helvetica Neue", sans-serif',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#000',
            mb: 1
          }}
        >
          {t('readyToSend')}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            color: '#888',
            letterSpacing: '0.5px'
          }}
        >
          {t('sendConfirmation')}
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        {sendProgress.status === 'enviando' ? (
          <CircularProgress size={24} />
        ) : sendProgress.status === 'completada' ? (
          <CheckCircle sx={{ fontSize: 32, color: '#4caf50' }} />
        ) : sendProgress.status === 'fallida' ? (
          <ErrorIcon sx={{ fontSize: 32, color: '#f44336' }} />
        ) : null}
        
        <Box>
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: sendProgress.status === 'fallida' ? '#f44336' : '#000'
            }}
          >
            {sendProgress.status === 'enviando' 
              ? t('sending')
              : sendProgress.status === 'completada'
                ? t('completed')
                : t('failed')
            }
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem',
              color: '#888'
            }}
          >
            {sendProgress.stats?.sent || 0} / {sendProgress.stats?.total || 0} {t('messagesSent')}
          </Typography>
        </Box>
      </Box>

      <LinearProgress
        variant="determinate"
        value={sendProgress.progressPercent || 0}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: '#e0e0e0',
          mb: 2,
          '& .MuiLinearProgress-bar': {
            bgcolor: sendProgress.status === 'fallida' ? '#f44336' : 
                     sendProgress.status === 'completada' ? '#4caf50' : '#f57c00',
            borderRadius: 4
          }
        }}
      />

      <Box display="flex" gap={2} flexWrap="wrap">
        <Chip
          label={`${t('total')}: ${sendProgress.stats?.total || 0}`}
          size="small"
          sx={{
            bgcolor: '#f5f5f5',
            fontFamily: '"Courier New", monospace',
            fontSize: '0.7rem'
          }}
        />
        <Chip
          label={`${t('sent')}: ${sendProgress.stats?.sent || 0}`}
          size="small"
          sx={{
            bgcolor: '#e8f5e9',
            color: '#2e7d32',
            fontFamily: '"Courier New", monospace',
            fontSize: '0.7rem',
            fontWeight: 600
          }}
        />
        {sendProgress.stats?.failed > 0 && (
          <Chip
            label={`${t('failedCount')}: ${sendProgress.stats?.failed || 0}`}
            size="small"
            sx={{
              bgcolor: '#ffebee',
              color: '#c62828',
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem',
              fontWeight: 600
            }}
          />
        )}
      </Box>

      {(sendProgress.status === 'completada' || sendProgress.status === 'fallida') && (
        <Box mt={3}>
          <Alert 
            severity={sendProgress.status === 'completada' ? 'success' : 'error'}
            sx={{ 
              borderRadius: 0,
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem',
              mb: 2
            }}
          >
            {sendProgress.status === 'completada' 
              ? t('campaignCompleted') 
              : t('campaignFailed')}
          </Alert>

          <Box display="flex" justifyContent="center" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Replay />}
              onClick={onResend}
              disabled={loading}
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                textTransform: 'none',
                letterSpacing: '0.5px',
                borderColor: sendProgress.status === 'fallida' ? '#f44336' : '#4caf50',
                color: sendProgress.status === 'fallida' ? '#f44336' : '#4caf50',
                '&:hover': { 
                  borderColor: sendProgress.status === 'fallida' ? '#d32f2f' : '#388e3c',
                  bgcolor: sendProgress.status === 'fallida' ? '#ffebee' : '#e8f5e9'
                }
              }}
            >
              {sendProgress.status === 'fallida' 
                ? t('retrySend') 
                : t('resendCampaign')}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default Step4Send