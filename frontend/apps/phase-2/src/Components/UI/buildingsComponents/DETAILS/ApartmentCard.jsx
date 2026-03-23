import { Card, CardContent, Typography, Box, Button, Stack, Avatar, Chip } from '@mui/material'
import { Home, Bed, Bathtub, SquareFoot, Domain } from '@mui/icons-material'

const ApartmentCard = ({ apartment, modelName, onEdit }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      border: theme => `1px solid ${theme.palette.cardBorder}`,
      bgcolor: 'background.paper',
      height: '100%',
      minWidth: 320,
      maxWidth: 380,
      m: 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      p: 2
    }}
  >
    {/* Status badge */}
    {apartment.status && (
      <Chip
        label={apartment.status}
        size="small"
        color={apartment.status === 'available' ? 'success' : 'default'}
        sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 700, fontFamily: '"Poppins", sans-serif', textTransform: 'capitalize' }}
      />
    )}

    <Stack alignItems="center" spacing={2} sx={{ mb: 2 }}>
      <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
        <Home fontSize="large" />
      </Avatar>
      <Typography variant="h6" fontWeight={700} textAlign="center">
        Apt #{apartment.apartmentNumber}
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Floor {apartment.floorNumber}
      </Typography>
    </Stack>

    <CardContent sx={{ flex: 1, p: 0 }}>
      <Stack direction="row" spacing={2} justifyContent="center" mb={1}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Domain fontSize="small" /> {modelName || 'N/A'}
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <SquareFoot fontSize="small" /> {apartment.sqft || 'N/A'} sqft
        </Box>
      </Stack>
      <Typography variant="body2" color="text.secondary" textAlign="center" mb={1}>
        Price: ${apartment.price} | Pending: ${apartment.pending}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
        Status: {apartment.status}
      </Typography>
    </CardContent>

    <Button
      size="small"
      variant="contained"
      sx={{ borderRadius: 2, fontWeight: 600, mt: 2 }}
      onClick={() => onEdit(apartment)}
      fullWidth
    >
      Edit
    </Button>
  </Card>
)

export default ApartmentCard