import { Box, Typography, Chip, Divider } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import { useTranslation } from 'react-i18next'

const PriceSummary = ({
  model,
  options,
  compareModel,
  compareOptions,
  calculatePrice,
  calculateComparePrice,
  title = '',
  compareTitle = ''
}) => {
  const { t } = useTranslation('models')

  const defaultTitle = title || t('customization.baseModel')
  const defaultCompareTitle = compareTitle || t('customization.customized')

  return (
    <Box>
      <Typography variant="caption" sx={{ color: '#706f6f', fontWeight: 600, fontFamily: '"DM Sans", sans-serif' }}>
        {defaultTitle.toUpperCase()}
      </Typography>
      <Typography variant="h4" fontWeight={700} sx={{ color: '#333F1F', mb: 1, fontFamily: '"DM Sans", sans-serif' }}>
        ${calculatePrice().toLocaleString()}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        <Chip 
          icon={<HomeIcon />} 
          label={`${model.bedrooms} ${t('beds')}`}
          sx={{ fontFamily: '"DM Sans", sans-serif' }}
        />
        <Chip 
          icon={<HomeIcon />} 
          label={`${model.bathrooms} ${t('baths')}`}
          sx={{ fontFamily: '"DM Sans", sans-serif' }}
        />
        <Chip 
          icon={<HomeIcon />} 
          label={`${model.sqft} ${t('sqft')}`}
          sx={{ fontFamily: '"DM Sans", sans-serif' }}
        />
      </Box>
      {compareModel && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" sx={{ color: '#706f6f', fontWeight: 600, fontFamily: '"DM Sans", sans-serif' }}>
            {defaultCompareTitle.toUpperCase()}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#333F1F', mb: 1, fontFamily: '"DM Sans", sans-serif' }}>
            ${calculateComparePrice().toLocaleString()}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              icon={<HomeIcon />} 
              label={`${compareModel.bedrooms} ${t('beds')}`}
              sx={{ fontFamily: '"DM Sans", sans-serif' }}
            />
            <Chip 
              icon={<HomeIcon />} 
              label={`${compareModel.bathrooms} ${t('baths')}`}
              sx={{ fontFamily: '"DM Sans", sans-serif' }}
            />
            <Chip 
              icon={<HomeIcon />} 
              label={`${compareModel.sqft} ${t('sqft')}`}
              sx={{ fontFamily: '"DM Sans", sans-serif' }}
            />
          </Box>
        </>
      )}
    </Box>
  )
}

export default PriceSummary