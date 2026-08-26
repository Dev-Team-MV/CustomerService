// apps/mv-crm/src/components/quotes/SendQuoteModal.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  TextField, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress
} from '@mui/material'
import { Send, Email, Sms } from '@mui/icons-material'
import quoteService from '../../services/quoteService'

export default function SendQuoteModal({ open, onClose, quote, onSuccess }) {
  const { t } = useTranslation('quoteCrm')
  const [method, setMethod] = useState('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && quote) {
      setMethod('email')
      setError('')
      const contact = quote.clientId || quote.leadId
      if (contact) {
        setEmail(contact.email || '')
        setPhone(contact.phone || contact.phoneNumber || '')
      } else {
        setEmail('')
        setPhone('')
      }
    }
  }, [open, quote])

  const handleSend = async () => {
    if ((method === 'email' || method === 'both') && !email) {
      setError(t('sendQuote.errorEmail', 'El correo es obligatorio'))
      return
    }
    if ((method === 'sms' || method === 'both') && !phone) {
      setError(t('sendQuote.errorPhone', 'El teléfono es obligatorio'))
      return
    }

    setLoading(true)
    setError('')
    try {
      const payload = {
        method,
        ...(method === 'email' || method === 'both' ? { email } : {}),
        ...(method === 'sms' || method === 'both' ? { phone } : {})
      }
      
      await quoteService.sendQuote(quote._id, payload)
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || t('sendQuote.errorSend', 'Error al enviar'))
    } finally {
      setLoading(false)
    }
  }

  if (!quote) return null

  return (
    // ✅ ID 1: Modal completo
    <Dialog id="send-quote-modal" open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Send color="primary" />
        <Typography variant="h6" fontWeight={700}>{t('sendQuote.title', 'Enviar Cotización')}</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">{t('sendQuote.client', 'Cliente / Lead')}</Typography>
          <Typography fontWeight={600}>
            {quote.clientId ? `${quote.clientId.firstName || ''} ${quote.clientId.lastName || ''}`.trim() : (quote.leadId?.name || 'N/A')}
          </Typography>
        </Box>

        {/* ✅ ID 2: Método de envío */}
        <FormControl id="send-quote-method" fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>{t('sendQuote.method', 'Método de envío')}</InputLabel>
          <Select value={method} onChange={(e) => setMethod(e.target.value)} label={t('sendQuote.method', 'Método de envío')}>
            <MenuItem value="email"><Box display="flex" alignItems="center" gap={1}><Email fontSize="small" /> Email</Box></MenuItem>
            <MenuItem value="sms"><Box display="flex" alignItems="center" gap={1}><Sms fontSize="small" /> SMS</Box></MenuItem>
            <MenuItem value="both"><Box display="flex" alignItems="center" gap={1}><Email fontSize="small" /> + <Sms fontSize="small" /> Email + SMS</Box></MenuItem>
          </Select>
        </FormControl>

        {/* ✅ ID 3: Campos de contacto (Email/Teléfono) */}
        <Box id="send-quote-contact">
          {(method === 'email' || method === 'both') && (
            <TextField fullWidth size="small" label={t('sendQuote.emailLabel', 'Correo electrónico')} value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} required />
          )}

          {(method === 'sms' || method === 'both') && (
            <TextField fullWidth size="small" label={t('sendQuote.phoneLabel', 'Teléfono')} value={phone} onChange={(e) => setPhone(e.target.value)} required />
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      
      {/* ✅ ID 4: Botones de acción */}
      <DialogActions id="send-quote-actions" sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>{t('cancel', 'Cancelar')}</Button>
        <Button variant="contained" onClick={handleSend} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : <Send />}>
          {loading ? t('sending', 'Enviando...') : t('send', 'Enviar')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}