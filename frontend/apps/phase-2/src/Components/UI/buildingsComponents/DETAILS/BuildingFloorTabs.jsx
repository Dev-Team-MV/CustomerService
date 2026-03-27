import {
  Box, Typography, Button, Grid, Card, CardMedia, CardContent, Chip
} from '@mui/material'
import { Edit, GridOn } from '@mui/icons-material'
import FloorPlanEditor from '../FloorPlanEditor'

const BuildingFloorPlansTab = ({
  building,
  apartmentModels,
  floorPlanModal,
  handleOpenFloorPlanEditor,
  handleCloseFloorPlanEditor,
  onSaveFloorPlans
}) => (
  <Box>
    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
      <GridOn sx={{ color: 'accent.main' }} />
      Floor Plans ({building.floorPlans?.length || 0}/{building.floors})
    </Typography>
    
    {building.floorPlans && building.floorPlans.length > 0 && (
      <Button
        variant="contained"
        startIcon={<Edit />}
        onClick={handleOpenFloorPlanEditor}
        sx={{
          mb: 3,
          borderRadius: 2,
          textTransform: 'none',
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 600,
          bgcolor: 'primary.main'
        }}
      >
        Edit Polygons (All Floors)
      </Button>
    )}
    
    {!building.floorPlans || building.floorPlans.length === 0 ? (
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', fontFamily: '"Poppins", sans-serif' }}
      >
        No floor plans uploaded yet
      </Typography>
    ) : (
      <Grid container spacing={3}>
        {building.floorPlans.map((fp) => (
          <Grid item xs={12} md={6} lg={4} key={fp.floorNumber}>
            <Card elevation={0} sx={{ borderRadius: 2, border: theme => `1px solid ${theme.palette.cardBorder}` }}>
              <CardMedia
                component="img"
                height="250"
                image={fp.url}
                alt={`Floor ${fp.floorNumber}`}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
                  Floor {fp.floorNumber}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: '"Poppins", sans-serif' }}>
                  {fp.floorNumber === 1 ? 'Commercial' : 'Residential'}
                </Typography>
                {fp.polygons && fp.polygons.length > 0 && (
                  <Chip
                    label={`${fp.polygons.length} polygons`}
                    size="small"
                    sx={{ mt: 1, fontFamily: '"Poppins", sans-serif' }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )}

    <FloorPlanEditor
      open={floorPlanModal.open}
      onClose={handleCloseFloorPlanEditor}
      floorPlans={building.floorPlans || []}
      apartmentModels={apartmentModels}
      onSave={onSaveFloorPlans}
    />
  </Box>
)

export default BuildingFloorPlansTab