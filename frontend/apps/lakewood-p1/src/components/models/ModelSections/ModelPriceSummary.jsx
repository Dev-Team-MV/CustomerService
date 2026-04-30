import { Paper, Typography, Box, Grid } from '@mui/material';

// const ModelPriceSummary = ({
//   formData,
//   calculateMaxPrice,
//   calculatePricingCombinations,
//   t
// }) => {
//   if (!(formData.hasBalcony || formData.hasUpgrade || formData.hasStorage)) return null;

//   return (
//     <Grid item xs={12}>
//       <Paper
//         sx={{
//           p: { xs: 2, md: 2.5 },
//           background: 'linear-gradient(135deg, rgba(51, 63, 31, 0.05) 0%, rgba(140, 165, 81, 0.08) 100%)',
//           border: "2px solid rgba(140, 165, 81, 0.25)",
//           borderRadius: 3
//         }}
//       >
//         <Typography 
//           variant="caption" 
//           fontWeight={700} 
//           gutterBottom 
//           display="block"
//           sx={{
//             color: '#333F1F',
//             fontFamily: '"Poppins", sans-serif',
//             letterSpacing: '1px',
//             textTransform: 'uppercase',
//             fontSize: '0.7rem'
//           }}
//         >
//           {t('models:priceRangeSummary')}
//         </Typography>
//         <Box display="flex" justifyContent="space-between" mb={0.5} flexWrap="wrap" gap={1}>
//           <Typography 
//             variant="caption"
//             sx={{ fontFamily: '"Poppins", sans-serif', color: '#706f6f' }}
//           >
//             Min: <strong style={{ color: '#333F1F' }}>${formData.price.toLocaleString()}</strong>
//           </Typography>
//           <Typography 
//             variant="caption"
//             sx={{ fontFamily: '"Poppins", sans-serif', color: '#706f6f' }}
//           >
//             Max: <strong style={{ color: '#8CA551' }}>${calculateMaxPrice(formData).toLocaleString()}</strong>
//           </Typography>
//         </Box>
//         <Typography 
//           variant="caption" 
//           sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}
//         >
//           <strong style={{ color: '#333F1F' }}>{calculatePricingCombinations(formData)}</strong> combinations available
//         </Typography>
//       </Paper>
//     </Grid>
//   );
// };

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
          p: { xs: 2, md: 2.5 },
          background: 'linear-gradient(135deg, rgba(51, 63, 31, 0.05) 0%, rgba(140, 165, 81, 0.08) 100%)',
          border: "2px solid rgba(140, 165, 81, 0.25)",
          borderRadius: 3
        }}
      >
        <Typography 
          variant="caption" 
          fontWeight={700} 
          gutterBottom 
          display="block"
          sx={{
            color: '#333F1F',
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontSize: '0.7rem'
          }}
        >
          {hasBasePrice ? t('models:priceRangeSummary') : 'Pricing Options Summary'}
        </Typography>
        {hasBasePrice ? (
          <>
            <Box display="flex" justifyContent="space-between" mb={0.5} flexWrap="wrap" gap={1}>
              <Typography 
                variant="caption"
                sx={{ fontFamily: '"Poppins", sans-serif', color: '#706f6f' }}
              >
                Min: <strong style={{ color: '#333F1F' }}>${formData.price.toLocaleString()}</strong>
              </Typography>
              <Typography 
                variant="caption"
                sx={{ fontFamily: '"Poppins", sans-serif', color: '#706f6f' }}
              >
                Max: <strong style={{ color: '#8CA551' }}>${calculateMaxPrice(formData).toLocaleString()}</strong>
              </Typography>
            </Box>
            <Typography 
              variant="caption" 
              sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}
            >
              <strong style={{ color: '#333F1F' }}>{calculatePricingCombinations(formData)}</strong> combinations available
            </Typography>
          </>
        ) : (
          <Typography 
            variant="caption" 
            sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}
          >
            Price will be determined by lot assignment. <strong style={{ color: '#333F1F' }}>{calculatePricingCombinations(formData)}</strong> option combinations available.
          </Typography>
        )}
      </Paper>
    </Grid>
  );
};

export default ModelPriceSummary;