// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/quote/LotSelector/PolygonPopup.jsx

import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Box, Paper, Typography, Chip, Divider, Skeleton, Button } from '@mui/material'
import { Home, CheckCircle, AttachMoney } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useResolveReferences } from '../../../hooks/useResolveReferences'

const PolygonPopup = ({ 
  building, 
  popupPosition, 
  onMouseEnter, 
  onMouseLeave,
  onSelectBuilding,
  models,
  lots,
  modelsLoading,
  lotsLoading
}) => {
  const theme = useTheme()
  const { t } = useTranslation(['quote', 'common'])
  const { modelName, totalPrice, loading } = useResolveReferences(
    building, 
    models, 
    lots, 
    modelsLoading, 
    lotsLoading
  )

  if (!building) return null

  const status = building.status || 'active'
  const statusLabel = status === 'sold' ? t('status.sold') : status === 'reserved' ? t('status.reserved') : t('status.available')
  const statusColor = status === 'sold' ? '#f44336' : status === 'reserved' ? '#ff9800' : '#4caf50'
  const statusBgColor = status === 'sold' ? '#ffebee' : status === 'reserved' ? '#fff3e0' : '#e8f5e9'

  const lotNumber = building.quoteRef?.lot?._id || building.quoteRef?.lot || 'N/A'

  const calculatePosition = () => {
    const popupWidth = 280
    const popupHeight = 320
    const offset = 18
    const padding = 16

    let x = popupPosition.x
    let y = popupPosition.y - offset

    if (x - popupWidth / 2 < padding) {
      x = popupWidth / 2 + padding
    } else if (x + popupWidth / 2 > window.innerWidth - padding) {
      x = window.innerWidth - popupWidth / 2 - padding
    }

    if (y - popupHeight < padding) {
      y = popupPosition.y + offset + 20
    }

    return { x, y }
  }

  const { x, y } = calculatePosition()

  return createPortal(
    <>
      <Paper
      data-popup-id={building._id} 
        elevation={4}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        sx={{
          position: 'fixed',
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(-50%, calc(-100% - 18px))',
          p: 2.5,
          width: 280,
          minWidth: 250,
          maxWidth: 320,
          boxShadow: '0 8px 32px rgba(140, 165, 81, 0.2)',
          zIndex: 100000,
          borderRadius: 3,
          pointerEvents: 'auto',
          background: 'linear-gradient(135deg, #fafbf8 85%, #f0f4e6 100%)',
          border: '1.5px solid #e0e8d0',
          animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '@keyframes slideUp': {
            from: { 
              opacity: 0,
              transform: 'translate(-50%, calc(-100% - 28px)) scale(0.9)'
            },
            to: { 
              opacity: 1,
              transform: 'translate(-50%, calc(-100% - 18px)) scale(1)'
            }
          }
        }}
      >
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.8, gap: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="subtitle2" 
                fontWeight={700} 
                color="#333F1F" 
                sx={{ 
                  fontFamily: '"Poppins", sans-serif', 
                  fontSize: '15px', 
                  mb: 0.3,
                  wordBreak: 'break-word'
                }}
              >
                {building.name}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '12px' }}
              >
                {t('lot')} {String(lotNumber).slice(-8)}
              </Typography>
            </Box>
            <Chip 
              label={statusLabel}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                letterSpacing: 0.5,
                px: 1,
                py: 0.5,
                minWidth: 'fit-content',
                flexShrink: 0,
                bgcolor: statusBgColor,
                color: statusColor,
                border: `1.5px solid ${statusColor}`,
                fontFamily: '"Poppins", sans-serif'
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5, borderColor: '#e0e8d0' }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: 'rgba(140, 165, 81, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Home sx={{ fontSize: 18, color: '#8CA551' }} />
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '11px', fontWeight: 500, display: 'block' }}
              >
                {t('step.model')}
              </Typography>
              {loading ? (
                <Skeleton variant="text" width="80%" height={16} />
              ) : (
                <Typography 
                  variant="caption" 
                  fontWeight={700} 
                  sx={{ 
                    fontFamily: '"Poppins", sans-serif', 
                    fontSize: '13px', 
                    display: 'block',
                    wordBreak: 'break-word'
                  }}
                >
                  {modelName}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: 'rgba(229, 134, 60, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <AttachMoney sx={{ fontSize: 18, color: '#E5863C' }} />
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '11px', fontWeight: 500, display: 'block' }}
              >
                {t('presalePriceToday')}
              </Typography>
              {loading ? (
                <Skeleton variant="text" width="100%" height={18} />
              ) : (
                <Typography 
                  variant="caption" 
                  fontWeight={700} 
                  sx={{ 
                    fontFamily: '"Poppins", sans-serif', 
                    fontSize: '14px', 
                    display: 'block', 
                    color: '#E5863C',
                    wordBreak: 'break-word'
                  }}
                >
                  {totalPrice > 0 ? `$${totalPrice.toLocaleString()}` : 'N/A'}
                </Typography>
              )}
            </Box>
          </Box>

          {building.quoteRef?.lot && building.quoteRef?.model && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CheckCircle sx={{ fontSize: 18, color: '#4caf50' }} />
              </Box>
              <Typography 
                variant="caption" 
                fontWeight={600}
                sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '12px', color: '#4caf50' }}
              >
                {t('completeConfig')}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 1.5, borderColor: '#e0e8d0' }} />

        <Button
          variant="contained"
          fullWidth
          size="small"
          onClick={onSelectBuilding}
          disabled={loading}
          sx={{
            borderRadius: 2,
            bgcolor: '#8CA551',
            color: 'white',
            fontWeight: 600,
            textTransform: 'none',
            fontFamily: '"Poppins", sans-serif',
            fontSize: '12px',
            py: 0.8,
            '&:hover': {
              bgcolor: '#7a8e46',
              transform: 'scale(1.02)'
            },
            '&:disabled': {
              bgcolor: '#ccc',
              cursor: 'not-allowed'
            },
            transition: 'all 0.2s ease'
          }}
        >
          {t('selectHouse')}
        </Button>
      </Paper>

      <Box
        sx={{
          position: 'fixed',
          left: `${x}px`,
          top: `${y - 8}px`,
          transform: 'translate(-50%, 0)',
          zIndex: 100001,
          pointerEvents: 'none'
        }}
      >
        <Box
          sx={{
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '14px solid #fafbf8',
            filter: 'drop-shadow(0 2px 4px rgba(140, 165, 81, 0.15))',
            animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        />
      </Box>
    </>,
    document.body
  )
}

export default PolygonPopup