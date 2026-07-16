// apps/mv-crm/src/components/quotes/QuotePreview.jsx
import { Box, Typography, Divider, Grid } from '@mui/material'
import { useTranslation } from 'react-i18next'
import AmortizationTable from './AmortizationTable'

export default function QuotePreview({ data, projectName, lotName }) {
  const { t } = useTranslation('quotes')

  if (!data) return null

  return (
    <Box sx={{ p: 4, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2, '@media print': { border: 'none', boxShadow: 'none' } }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary">COTIZACIÓN</Typography>
          <Typography variant="body2" color="text.secondary">Válido hasta: {new Date(data.validUntil).toLocaleDateString()}</Typography>
        </Box>
        <Box textAlign="right">
          <Typography variant="h6" fontWeight={600}>{projectName || 'Proyecto'}</Typography>
          <Typography variant="body2">{lotName || 'Lote/Modelo'}</Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3} mb={3}>
        <Grid item xs={6}>
          <Typography variant="subtitle2" color="text.secondary">Precio Total</Typography>
          <Typography variant="h5" fontWeight={700}>${data.totalPrice?.toLocaleString()}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2" color="text.secondary">{t('summary.downPaymentInfo')} ({data.downPaymentPercentage}%)</Typography>
          <Typography variant="h6" fontWeight={600}>${data.downPayment?.toLocaleString()}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2" color="text.secondary">{t('summary.financedAmount')}</Typography>
          <Typography variant="h6" fontWeight={600}>${data.financedAmount?.toLocaleString()}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2" color="text.secondary">{t('summary.monthlyPayment')}</Typography>
          <Typography variant="h5" fontWeight={700} color="primary">
            ${data.monthlyPayment?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {data.amortizationMethod === 'fixed' ? 'Cuota Fija' : 'Cuota Decreciente'} • {data.termMonths} meses • {data.interestRate}% anual
          </Typography>
        </Grid>
      </Grid>

      {data.notes && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" fontWeight={600} mb={1}>Notas:</Typography>
          <Typography variant="body2">{data.notes}</Typography>
        </Box>
      )}

      <Typography variant="h6" fontWeight={600} mb={1}>Tabla de Amortización</Typography>
      <AmortizationTable schedule={data.schedule} />
    </Box>
  )
}