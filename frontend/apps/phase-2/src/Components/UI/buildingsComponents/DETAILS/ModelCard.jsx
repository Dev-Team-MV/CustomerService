import { Card, CardContent, Typography, Box, Button, Stack, Avatar, Chip } from '@mui/material'
import { ViewModule, Bed, Bathtub, SquareFoot } from '@mui/icons-material'

const ModelCard = ({ model, onEdit }) => (
<Card
  elevation={0}
  sx={{
    borderRadius: 3,
    border: theme => `1px solid ${theme.palette.cardBorder}`,
    bgcolor: 'background.paper',
    height: '100%',
    minWidth: 320,      // <-- ancho mínimo
    maxWidth: 380,      // <-- ancho máximo opcional
    m: 'auto',          // <-- centra la card en su celda
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    p: 2
  }}
>
    {/* Status badge (opcional) */}
    {model.status && (
      <Chip
        label={model.status}
        size="small"
        color={model.status === 'active' ? 'success' : 'default'}
        sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 700, fontFamily: '"Poppins", sans-serif', textTransform: 'capitalize' }}
      />
    )}

    <Stack alignItems="center" spacing={2} sx={{ mb: 2 }}>
      <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
        <ViewModule fontSize="large" />
      </Avatar>
      <Typography variant="h6" fontWeight={700} textAlign="center">{model.name}</Typography>
    </Stack>

    <CardContent sx={{ flex: 1, p: 0 }}>
      <Stack direction="row" spacing={2} justifyContent="center" mb={1}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Bed fontSize="small" /> {model.bedrooms}
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Bathtub fontSize="small" /> {model.bathrooms}
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <SquareFoot fontSize="small" /> {model.sqft} sqft
        </Box>
      </Stack>
      <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mb={1}>
        Apartments: {model.apartmentCount}
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Floor Plan: {model.floorPlan || 'N/A'}
      </Typography>
    </CardContent>

    <Button
      size="small"
      variant="contained"
      sx={{ borderRadius: 2, fontWeight: 600, mt: 2 }}
      onClick={() => onEdit(model)}
      fullWidth
    >
      Edit
    </Button>
  </Card>
)

export default ModelCard