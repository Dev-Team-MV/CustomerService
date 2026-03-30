import { Paper, Box, Typography, Chip, Divider, Avatar } from '@mui/material'
import { Home, SquareFoot, AttachMoney } from '@mui/icons-material'

const DashboardMapPopup = ({
  popupPosition,
  selectedProperty,
  onMouseEnter,
  onMouseLeave
}) => {
  const client = Array.isArray(selectedProperty.users) && selectedProperty.users.length > 0
    ? selectedProperty.users[0]
    : null

  const status = selectedProperty.status || selectedProperty.lot?.status || 'pending'
  const statusLabel = status === 'sold' ? 'VENDIDO' : status === 'pending' ? 'EN PROCESO' : 'DISPONIBLE'
  const statusColor = status === 'sold' ? 'error' : status === 'pending' ? 'warning' : 'success'
  const price = selectedProperty.price || selectedProperty.model?.price || selectedProperty.lot?.price || 0
  const modelName = selectedProperty.model?.model || selectedProperty.model?.name || selectedProperty.model || 'N/A'
  const sqft = selectedProperty.model?.sqft || selectedProperty.sqft || 'N/A'

  return (
    <>
      {/* Popup */}
      <Paper
        elevation={4}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        sx={{
          position: 'fixed',
          left: `${popupPosition.x}px`,
          top: `${popupPosition.y}px`,
          transform: 'translate(-50%, calc(-100% - 18px))',
          p: 2,
          width: 250,
          minWidth: 210,
          boxShadow: '0 4px 16px rgba(51,63,31,0.10)',
          zIndex: 10000,
          borderRadius: 3,
          pointerEvents: 'auto',
          background: 'linear-gradient(135deg, #f8faf6 85%, #e6efdb 100%)',
          border: '1.5px solid #e0e8d0'
        }}
      >
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#333F1F" sx={{ fontFamily: '"Poppins", sans-serif', fontSize: 17 }}>
              Lote {selectedProperty.lot?.number}
            </Typography>
            <Chip 
              label={statusLabel}
              color={statusColor}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: 0.5,
                px: 1,
                bgcolor: status === 'sold' ? '#e57373' : status === 'pending' ? '#ffe082' : '#b2dfdb',
                color: status === 'sold' ? '#fff' : '#333F1F'
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
            {selectedProperty.project?.name || 'Proyecto'}
          </Typography>
        </Box>

        <Divider sx={{ mb: 1.2, borderColor: '#e0e8d0' }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Home sx={{ fontSize: 18, color: '#8CA551' }} />
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
              {modelName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SquareFoot sx={{ fontSize: 18, color: '#8CA551' }} />
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
              {sqft !== 'N/A' ? `${sqft.toLocaleString()} ft²` : 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoney sx={{ fontSize: 18, color: '#8CA551' }} />
            <Typography variant="caption" fontWeight={700} color="#E5863C" sx={{ fontFamily: '"Poppins", sans-serif' }}>
              {price ? `$${price.toLocaleString()}` : 'N/A'}
            </Typography>
          </Box>
        </Box>

        {client && (
          <>
            <Divider sx={{ my: 1.2, borderColor: '#e0e8d0' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: '#8CA551', fontWeight: 700, fontSize: 15 }}>
                {client.firstName?.[0] || ''}{client.lastName?.[0] || ''}
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {client.firstName} {client.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif', fontSize: 11 }}>
                  {client.email}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Paper>
      {/* Flecha visual */}
      <Box
        sx={{
          position: 'fixed',
          left: `${popupPosition.x}px`,
          top: `${popupPosition.y - 8}px`,
          transform: 'translate(-50%, 0)',
          zIndex: 10001,
          pointerEvents: 'none'
        }}
      >
        <Box
          sx={{
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '14px solid #f8faf6',
            filter: 'drop-shadow(0 2px 4px rgba(51,63,31,0.10))'
          }}
        />
      </Box>
    </>
  )
}

export default DashboardMapPopup