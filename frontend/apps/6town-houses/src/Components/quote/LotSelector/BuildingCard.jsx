// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/quote/LotSelector/BuildingCard.jsx

import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardMedia, Typography, Button, Box, Chip } from '@mui/material'
import { Home, CheckCircle } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

const BuildingCard = ({ 
  building, 
  isHovered, 
  onHover, 
  onLeave, 
  onSelect, 
  statusConfig 
}) => {
  const theme = useTheme()
  const { t } = useTranslation(['quote', 'common'])
  
  const firstRender = building.exteriorRenders?.[0]?.url || building.exteriorRenders?.[0]

  return (
    <Card
      elevation={isHovered ? 6 : 3}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: isHovered ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        cursor: 'pointer'
      }}
    >
      <CardMedia
        component="div"
        sx={{
          height: 220,
          bgcolor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: firstRender ? `url(${firstRender})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}
      >
        {!firstRender && (
          <Home sx={{ fontSize: 80, color: theme.palette.primary.main, opacity: 0.3 }} />
        )}
        <Chip
          label={statusConfig.label}
          color={statusConfig.color}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif'
          }}
        />
      </CardMedia>

      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={1} sx={{ fontFamily: '"Poppins", sans-serif' }}>
          {building.name}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <CheckCircle fontSize="small" color="success" />
          <Typography variant="caption" color="text.secondary">
            {t('completeConfig')}
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={onSelect}
          sx={{
            borderRadius: 3,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            fontFamily: '"Poppins", sans-serif',
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            }
          }}
        >
          {t('selectHouse')}
        </Button>
      </CardContent>
    </Card>
  )
}

export default BuildingCard