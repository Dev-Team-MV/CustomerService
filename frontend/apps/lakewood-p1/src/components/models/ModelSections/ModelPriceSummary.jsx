import { Paper, Typography, Box, Grid } from '@mui/material';

const ModelPriceSummary = ({
  formData,
  calculateMaxPrice,
  calculatePricingCombinations,
  t
}) => {
  if (!(formData.hasBalcony || formData.hasUpgrade || formData.hasStorage)) return null;

  const hasBasePrice = formData.price > 0;

  return (
    <Grid item xs={12}>
      <Paper
        sx={{
          p: 1.5,
          background: 'linear-gradient(135deg, rgba(51, 63, 31, 0.05) 0%, rgba(140, 165, 81, 0.08) 100%)',
          border: "2px solid rgba(140, 165, 81, 0.25)",
          borderRadius: 2
        }}
      >
        <Typography 
          variant="caption" 
          fontWeight={700} 
          gutterBottom 
          display="block"
          sx={{
            color: '#333F1F',
            fontFamily: '"DM Sans", sans-serif',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontSize: '0.65rem',
            mb: 0.5
          }}
        >
          {t('models:priceRangeSummary')}
        </Typography>
        <Box display="flex" justifyContent="space-between" mb={0.5} flexWrap="wrap" gap={0.5}>
          <Typography 
            variant="caption"
            sx={{ fontFamily: '"DM Sans", sans-serif', color: '#706f6f', fontSize: '0.75rem' }}
          >
            Min: <strong style={{ color: '#333F1F' }}>${hasBasePrice ? formData.price.toLocaleString() : '0'}</strong>
          </Typography>
          <Typography 
            variant="caption"
            sx={{ fontFamily: '"DM Sans", sans-serif', color: '#706f6f', fontSize: '0.75rem' }}
          >
            Max: <strong style={{ color: '#8CA551' }}>${calculateMaxPrice(formData).toLocaleString()}</strong>
          </Typography>
        </Box>
        <Typography 
          variant="caption" 
          sx={{ color: '#706f6f', fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem' }}
        >
          <strong style={{ color: '#333F1F' }}>{calculatePricingCombinations(formData)}</strong> combinations available
        </Typography>
      </Paper>
    </Grid>
  );
};

export default ModelPriceSummary;