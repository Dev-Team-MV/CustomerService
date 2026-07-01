// apps/mv-crm/src/components/leads/ConvertLeadModal.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  Paper,
  Avatar,
  Link
} from '@mui/material'
import { 
  Close, 
  CheckCircle, 
  Email, 
  Phone,
  Sms,
  ContentCopy
} from '@mui/icons-material'

const ConvertLeadModal = ({ 
  open, 
  onClose, 
  lead = null,
  onConvert,
  conversionResult = null
}) => {
  const { t } = useTranslation('leads')
  const [converting, setConverting] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleConvert = async () => {
    setConverting(true)
    try {
      await onConvert?.(lead._id)
    } catch (err) {
      console.error('Error converting lead:', err)
    } finally {
      setConverting(false)
    }
  }

  const handleCopyLink = () => {
    if (conversionResult?.setupLink) {
      navigator.clipboard.writeText(conversionResult.setupLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!lead) return null

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle color="success" />
            <Typography variant="h6" fontWeight={700}>
              {t('convertTitle')}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Lead Info */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#4caf50', width: 48, height: 48 }}>
              {lead.name?.charAt(0) || '?'}
            </Avatar>
            <Box>
              <Typography fontWeight={700}>{lead.name}</Typography>
              <Box display="flex" gap={2} mt={0.5}>
                {lead.email && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Email sx={{ fontSize: 14 }} />
                    <Typography variant="caption">{lead.email}</Typography>
                  </Box>
                )}
                {lead.phone && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Phone sx={{ fontSize: 14 }} />
                    <Typography variant="caption">{lead.phone}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>

        {!conversionResult ? (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('convertInfo')}
            </Alert>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Sms />
                <Typography>{t('convertSmsInfo')}</Typography>
              </Box>
            </Alert>
          </>
        ) : (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography fontWeight={600} gutterBottom>
                {t('convertSuccess')}
              </Typography>
              <Typography variant="body2">
                {t('convertUserCreated')}: {conversionResult.user.firstName} {conversionResult.user.lastName}
              </Typography>
              {conversionResult.smsSent && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  ✓ {t('convertSmsSent')}
                </Typography>
              )}
            </Alert>

            {conversionResult.setupLink && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {t('convertSetupLink')}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Link 
                    href={conversionResult.setupLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ 
                      flex: 1, 
                      fontSize: '0.8rem',
                      wordBreak: 'break-all'
                    }}
                  >
                    {conversionResult.setupLink}
                  </Link>
                  <Button
                    size="small"
                    startIcon={<ContentCopy />}
                    onClick={handleCopyLink}
                    variant={copied ? 'contained' : 'outlined'}
                    color={copied ? 'success' : 'primary'}
                  >
                    {copied ? t('copied') : t('copy')}
                  </Button>
                </Box>
              </Paper>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {!conversionResult ? (
          <>
            <Button onClick={onClose} disabled={converting}>
              {t('form.cancel')}
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleConvert}
              disabled={converting}
              startIcon={<CheckCircle />}
            >
              {converting ? t('converting') : t('leads.convertConfirm')}
            </Button>
          </>
        ) : (
          <Button onClick={onClose} variant="contained">
            {t('form.close')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ConvertLeadModal