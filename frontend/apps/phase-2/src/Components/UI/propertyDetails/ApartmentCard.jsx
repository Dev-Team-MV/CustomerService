import { Card, CardActionArea, CardContent, Typography, Box, Chip, Avatar } from '@mui/material'
import { Home, Person } from '@mui/icons-material'

const ApartmentCard = ({ apartment, hovered, onHoverStart, onHoverEnd, onClick }) => {
  return (
    <Card
      elevation={hovered ? 8 : 2}
      sx={{
        borderRadius: 4,
        border: hovered ? '2px solid #8CA551' : '1px solid #e0e0e0',
        boxShadow: hovered ? '0 8px 24px #8CA55122' : '0 4px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.25s',
        cursor: 'pointer',
        bgcolor: hovered ? '#f7faef' : 'white'
      }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <CardActionArea onClick={onClick} sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Avatar sx={{ bgcolor: '#8CA551', width: 48, height: 48 }}>
            <Home />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
              Apt {apartment.apartmentNumber}
            </Typography>
            <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
              {apartment.building?.name ? `Building: ${apartment.building.name}` : ''}
            </Typography>
          </Box>
        </Box>
        <CardContent sx={{ pt: 0 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Chip
              label={apartment.status || 'N/A'}
              size="small"
              sx={{
                bgcolor: '#E5863C',
                color: 'white',
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif'
              }}
            />
            <Chip
              label={apartment.apartmentModel?.name || 'Model N/A'}
              size="small"
              sx={{
                bgcolor: '#8CA551',
                color: 'white',
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif'
              }}
            />
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Person sx={{ color: '#4a7c59', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: '#4a7c59', fontWeight: 500 }}>
              {Array.isArray(apartment.users) && apartment.users.length > 0
                ? `${apartment.users[0]?.firstName || ''} ${apartment.users[0]?.lastName || ''}`.trim()
                : 'Unassigned'}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default ApartmentCard