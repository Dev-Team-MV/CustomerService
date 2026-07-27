// apps/mv-crm/src/components/leads/ConvertLeadModal.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography,
  Button, IconButton, Alert, Paper, Avatar, Link, TextField, Divider
} from '@mui/material'
import { Close, CheckCircle, Email, Phone, Sms, ContentCopy, AttachMoney } from '@mui/icons-material'

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

  // ✅ NUEVO: Estado para los datos de la comisión
  const [commissionData, setCommissionData] = useState({
    saleAmount: '',
    propertyId: '',
    commissionNotes: ''
  })

  const handleConvert = async () => {
    setConverting(true)
    try {
      // ✅ Construimos el payload exactamente como lo espera el backend
      const payload = {
        saleAmount: Number(commissionData.saleAmount) || 0,
        propertyId: commissionData.propertyId || undefined,
        commissionNotes: commissionData.commissionNotes || undefined
        // Aquí podrías agregar structureId o splits si los manejas en el UI
      }
      
      const result = await onConvert?.(lead._id, payload)
      // El hook useLeads ya maneja la actualización, aquí solo esperamos el resultado
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

  const handleCommissionChange = (field, value) => {
    setCommissionData(prev => ({ ...prev, [field]: value }))
  }

  if (!lead) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle color="success" />
            <Typography variant="h6" fontWeight={700}>
              {t('convertTitle', 'Convertir a Cliente')}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small"><Close /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Lead Info */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f9f9f9' }}>
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
              {t('convertInfo', 'Al convertir, se creará un usuario y se enviará un SMS con el link de configuración.')}
            </Alert>
            
            {/* ✅ NUEVO: Sección de Datos de Venta para la Comisión */}
            <Box sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <AttachMoney sx={{ fontSize: 20, color: '#2e7d32' }} />
                <Typography variant="subtitle2" fontWeight={700} color="#2e7d32">
                  {t('convertCommissionData', 'Datos para generar la comisión (Opcional)')}
                </Typography>
              </Box>
              
              <TextField
                fullWidth
                size="small"
                label={t('form.saleAmount', 'Monto de Venta *')}
                type="number"
                value={commissionData.saleAmount}
                onChange={(e) => handleCommissionChange('saleAmount', e.target.value)}
                placeholder="Ej: 250000"
                sx={{ mb: 1.5 }}
                helperText={t('form.saleAmountHelper', 'Si se ingresa, se creará una comisión en estado "pending"')}
              />
              
              <TextField
                fullWidth
                size="small"
                label={t('form.propertyId', 'ID de Propiedad (Opcional)')}
                value={commissionData.propertyId}
                onChange={(e) => handleCommissionChange('propertyId', e.target.value)}
                sx={{ mb: 1.5 }}
              />
              
              <TextField
                fullWidth
                size="small"
                label={t('form.commissionNotes', 'Notas de Comisión (Opcional)')}
                multiline
                rows={2}
                value={commissionData.commissionNotes}
                onChange={(e) => handleCommissionChange('commissionNotes', e.target.value)}
              />
            </Box>

            <Alert severity="success" sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Sms />
                <Typography>{t('convertSmsInfo', 'Se enviará un SMS automático con el link de registro.')}</Typography>
              </Box>
            </Alert>
          </>
        ) : (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography fontWeight={600} gutterBottom>
                {t('convertSuccess', '¡Lead convertido exitosamente!')}
              </Typography>
              <Typography variant="body2">
                {t('convertUserCreated', 'Usuario creado')}: {conversionResult.user.firstName} {conversionResult.user.lastName}
              </Typography>
              {conversionResult.smsSent && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  ✓ {t('convertSmsSent', 'SMS de configuración enviado')}
                </Typography>
              )}
              {/* ✅ Mostrar info de la comisión si se creó */}
              {conversionResult.commission && (
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, color: '#2e7d32' }}>
                  ✓ {t('convertCommissionCreated', 'Comisión pendiente creada')} (${conversionResult.commission.saleAmount?.toLocaleString()})
                </Typography>
              )}
            </Alert>

            {conversionResult.setupLink && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {t('convertSetupLink', 'Link de Configuración')}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Link 
                    href={conversionResult.setupLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ flex: 1, fontSize: '0.8rem', wordBreak: 'break-all' }}
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
                    {copied ? t('copied', 'Copiado') : t('copy', 'Copiar')}
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
              {t('form.cancel', 'Cancelar')}
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleConvert}
              disabled={converting}
              startIcon={<CheckCircle />}
            >
              {converting ? t('converting', 'Convirtiendo...') : t('leads.convertConfirm', 'Confirmar Conversión')}
            </Button>
          </>
        ) : (
          <Button onClick={onClose} variant="contained">
            {t('form.close', 'Cerrar')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ConvertLeadModal