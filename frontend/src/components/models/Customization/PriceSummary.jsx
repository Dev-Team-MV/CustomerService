import { Box, Typography, Chip, Divider } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'

const PriceSummary = ({
  model,
  options,
  compareModel,
  compareOptions,
  calculatePrice,
  calculateComparePrice,
  title = 'Base Model',
  compareTitle = 'Comparison Model'
}) => (
  <Box>
    <Typography variant="caption" sx={{ color: '#706f6f', fontWeight: 600 }}>
      {title.toUpperCase()}
    </Typography>
    <Typography variant="h4" fontWeight={700} sx={{ color: '#333F1F', mb: 1 }}>
      ${calculatePrice().toLocaleString()}
    </Typography>
    <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
      <Chip icon={<HomeIcon />} label={`${model.bedrooms} Beds`} />
      <Chip icon={<HomeIcon />} label={`${model.bathrooms} Baths`} />
      <Chip icon={<HomeIcon />} label={`${model.sqft} sqft`} />
    </Box>
    {compareModel && (
      <>
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" sx={{ color: '#706f6f', fontWeight: 600 }}>
          {compareTitle.toUpperCase()}
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#333F1F', mb: 1 }}>
          ${calculateComparePrice().toLocaleString()}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
          <Chip icon={<HomeIcon />} label={`${compareModel.bedrooms} Beds`} />
          <Chip icon={<HomeIcon />} label={`${compareModel.bathrooms} Baths`} />
          <Chip icon={<HomeIcon />} label={`${compareModel.sqft} sqft`} />
        </Box>
      </>
    )}
  </Box>
)

export default PriceSummary