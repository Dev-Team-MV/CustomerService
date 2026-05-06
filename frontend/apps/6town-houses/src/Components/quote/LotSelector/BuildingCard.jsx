// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/quote/LotSelector/BuildingCard.jsx

import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardMedia, Typography, Button, Box, Chip, Alert } from '@mui/material'
import { Home, CheckCircle, Lock } from '@mui/icons-material'
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
  
  // CORREGIDO: Cambiar lógica de disponibilidad
  const isAvailable = building.isAvailableForQuote === true
  const availabilityStatus = building.availabilityStatus || 'available'
  
  // DEBUG: Verificar valores
  console.log('🏠 BuildingCard:', building.name, {
    isAvailableForQuote: building.isAvailableForQuote,
    availabilityStatus: building.availabilityStatus,
    isAvailable
  })

  return (
    <Card
      elevation={isHovered && isAvailable ? 6 : 2}
      onMouseEnter={isAvailable ? onHover : undefined}
      onMouseLeave={isAvailable ? onLeave : undefined}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: isHovered && isAvailable 
          ? `3px solid ${theme.palette.primary.main}` 
          : !isAvailable 
            ? '3px solid #e0e0e0'
            : '3px solid transparent',
        transform: isHovered && isAvailable ? 'translateY(-8px)' : 'translateY(0)',
        cursor: isAvailable ? 'pointer' : 'not-allowed',
        opacity: isAvailable ? 1 : 0.65,
        position: 'relative',
        bgcolor: isAvailable ? 'white' : '#fafafa',
        filter: !isAvailable ? 'saturate(0.5)' : 'none'
      }}
    >
      {/* NUEVO: Overlay diagonal si no está disponible */}
      {!isAvailable && (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(1px)',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          />
          {/* Línea diagonal de "no disponible" */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-15deg)',
              bgcolor: 'rgba(158, 158, 158, 0.9)',
              color: 'white',
              px: 4,
              py: 0.5,
              zIndex: 2,
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: 1,
              fontFamily: '"Poppins", sans-serif',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              pointerEvents: 'none'
            }}
          >
            {t('availability.notAvailableShort').toUpperCase()}
          </Box>
        </>
      )}

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
          position: 'relative',
          filter: !isAvailable ? 'grayscale(80%) brightness(1.1)' : 'none'
        }}
      >
        {!firstRender && (
          <Home sx={{ 
            fontSize: 80, 
            color: isAvailable ? theme.palette.primary.main : theme.palette.grey[400], 
            opacity: 0.3 
          }} />
        )}
        
        {/* NUEVO: Badge de disponibilidad más prominente */}
        <Chip
          icon={!isAvailable ? <Lock sx={{ fontSize: 16 }} /> : undefined}
          label={statusConfig.label}
          color={statusConfig.color}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            opacity: isAvailable ? 1 : 0.8
          }}
        />
      </CardMedia>

      <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
        <Typography 
          variant="h6" 
          fontWeight={700} 
          mb={1} 
          sx={{ 
            fontFamily: '"Poppins", sans-serif',
            color: isAvailable ? 'inherit' : 'text.disabled'
          }}
        >
          {building.name}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <CheckCircle 
            fontSize="small" 
            color={isAvailable ? "success" : "disabled"} 
          />
          <Typography 
            variant="caption" 
            color={isAvailable ? "text.secondary" : "text.disabled"}
          >
            {t('completeConfig')}
          </Typography>
        </Box>

        {/* NUEVO: Mensaje si no está disponible - reemplaza el botón */}
        {!isAvailable ? (
          <Alert 
            severity="warning" 
            icon={<Lock fontSize="small" />}
            sx={{ 
              py: 1,
              fontSize: '0.8rem',
              bgcolor: '#fff3e0',
              '& .MuiAlert-message': {
                fontSize: '0.8rem',
                fontWeight: 500
              }
            }}
          >
            {t('availability.notAvailable')}
          </Alert>
        ) : (
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
        )}
      </CardContent>
    </Card>
  )
}

export default BuildingCard