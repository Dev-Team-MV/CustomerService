import { Paper, Typography, Grid, Box, Divider } from '@mui/material'
import { useTranslation } from 'react-i18next'

const PriceBreakdown = ({ quoteResult, facadeEnabled }) => {
  const { t } = useTranslation(['quote'])
  
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
      <Typography 
        variant="h6" 
        fontWeight={700} 
        mb={2} 
        sx={{ fontFamily: '"Poppins", sans-serif' }}
      >
        {t('priceBreakdown.title')}
      </Typography>
      <Grid container spacing={1}>
        {/* Lote */}
        {quoteResult.lot && (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" py={0.5}>
              <Typography variant="body2" color="text.secondary">
                {t('priceBreakdown.lot')} {quoteResult.lot.number}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                ${quoteResult.lot.price?.toLocaleString()}
              </Typography>
            </Box>
          </Grid>
        )}
        
        {/* Modelo */}
        {quoteResult.model && (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" py={0.5}>
              <Typography variant="body2" color="text.secondary">
                {t('priceBreakdown.model')} {quoteResult.model.model}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                ${quoteResult.model.price?.toLocaleString()}
              </Typography>
            </Box>
          </Grid>
        )}
        
        {/* Fachada */}
        {facadeEnabled && quoteResult.facade && (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" py={0.5}>
              <Typography variant="body2" color="text.secondary">
                {t('priceBreakdown.facade')} {quoteResult.facade.title}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                ${quoteResult.facade.price?.toLocaleString()}
              </Typography>
            </Box>
          </Grid>
        )}
        
        {/* Ajustes */}
        {quoteResult.breakdown?.adjustments?.length > 0 && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                {t('priceBreakdown.adjustments')}
              </Typography>
            </Grid>
            {quoteResult.breakdown.adjustments.map((adj, idx) => (
              <Grid item xs={12} key={idx}>
                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    {adj.label || adj.code}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight={600} 
                    color={adj.amount >= 0 ? 'success.main' : 'error.main'}
                  >
                    {adj.amount >= 0 ? '+' : ''}${Math.abs(adj.amount || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </>
        )}
        
        {/* Total */}
        {quoteResult.totals?.totalPrice && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" py={1}>
                <Typography 
                  variant="h6" 
                  fontWeight={700} 
                  color="primary" 
                  sx={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  {t('priceBreakdown.total')}
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight={700} 
                  color="primary" 
                  sx={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  ${quoteResult.totals.totalPrice.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </>
        )}
      </Grid>
    </Paper>
  )
}

export default PriceBreakdown