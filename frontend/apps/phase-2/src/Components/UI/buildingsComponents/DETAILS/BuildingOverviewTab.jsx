import {
  Grid, Box, Typography, Paper, Chip, Divider, Stack, Tooltip, Avatar, Button
} from '@mui/material'
import { Image as ImageIcon, InfoOutlined, Apartment, Layers, CalendarToday, Domain, LocationCity } from '@mui/icons-material'
import ExteriorPolygonEditor from '../ExteriorPolygonEditor'
import ImagePreview from '../../ImagePreview'

const InfoItem = ({ label, value, icon }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
    <Avatar sx={{ bgcolor: 'primary.light', width: 28, height: 28, fontSize: 18 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', color: 'text.primary', lineHeight: 1.1 }}>
        {value}
      </Typography>
    </Box>
  </Stack>
)

const statusColors = {
  active: 'success',
  inactive: 'default',
  pending: 'warning'
}

const BuildingOverviewTab = ({
  building,
  exteriorModal,
  handleOpenExteriorEditor,
  handleCloseExteriorEditor,
  handleSaveExteriorPolygons
}) => (
  <Grid container spacing={4}>
    {/* Left: Images & Polygons */}
    <Grid item xs={12} md={6}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: theme => `1px solid ${theme.palette.cardBorder}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ImageIcon sx={{ color: 'secondary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
            Exterior Renders
          </Typography>
          {building.exteriorRenders && building.exteriorRenders.length > 0 && (
            <Button
              variant="contained"
              size="small"
              sx={{ borderRadius: 2, fontFamily: '"Poppins", sans-serif', fontWeight: 600, ml: 'auto' }}
              onClick={handleOpenExteriorEditor}
            >
              Edit Polygons
            </Button>
          )}
        </Box>
        {building.exteriorRenders && building.exteriorRenders.length > 0 ? (
          <ImagePreview images={building.exteriorRenders} height={220} />
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: '"Poppins", sans-serif' }}>
            No exterior renders uploaded
          </Typography>
        )}
      </Paper>
    </Grid>

    {/* Right: Info */}
{/* Right: Info */}
    <Grid item xs={12} md={6}>
      <Paper
        elevation={0}
        sx={{
          p: 0,
          borderRadius: 3,
          border: theme => `1px solid ${theme.palette.cardBorder}`,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: '0 2px 16px 0 rgba(60,72,88,0.06)'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3, py: 2,
            bgcolor: 'primary.50',
            display: 'flex',
            alignItems: 'center',
            borderBottom: theme => `1px solid ${theme.palette.divider}`
          }}
        >
          <InfoOutlined sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Poppins", sans-serif', letterSpacing: 0.5 }}>
            Building Information
          </Typography>
          <Chip
            label={building.status}
            size="small"
            color={statusColors[building.status] || 'default'}
            sx={{
              fontWeight: 700,
              fontFamily: '"Poppins", sans-serif',
              ml: 2,
              textTransform: 'capitalize',
              letterSpacing: 0.5
            }}
          />
          {building.section && (
            <Chip
              label={building.section}
              size="small"
              sx={{
                ml: 1,
                bgcolor: 'secondary.100',
                color: 'secondary.main',
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif',
                textTransform: 'capitalize'
              }}
            />
          )}
        </Box>

        {/* Main Info */}
        <Box sx={{ px: 3, py: 3 }}>
          <Stack direction="row" spacing={4} mb={2}>
            <InfoItem
              label="Project"
              value={building.project?.name || 'N/A'}
              icon={<Domain fontSize="small" />}
            />
            <InfoItem
              label="Total Floors"
              value={building.floors}
              icon={<Layers fontSize="small" />}
            />
          </Stack>
          <Stack direction="row" spacing={4} mb={2}>
            <InfoItem
              label="Total Apartments"
              value={building.totalApartments}
              icon={<Apartment fontSize="small" />}
            />
            <InfoItem
              label="Section"
              value={building.section || 'N/A'}
              icon={<LocationCity fontSize="small" />}
            />
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={4}>
            <InfoItem
              label="Created"
              value={building.createdAt ? new Date(building.createdAt).toLocaleDateString() : 'N/A'}
              icon={<CalendarToday fontSize="small" />}
            />
            <InfoItem
              label="Updated"
              value={building.updatedAt ? new Date(building.updatedAt).toLocaleDateString() : 'N/A'}
              icon={<CalendarToday fontSize="small" />}
            />
          </Stack>
        </Box>
      </Paper>
    </Grid>

    {/* Polygons Editor */}
    <ExteriorPolygonEditor
      open={exteriorModal.open}
      onClose={handleCloseExteriorEditor}
      exteriorUrl={building.exteriorRenders?.[0] || building.exteriorRenders?.urls?.[0]}
      polygons={building.buildingFloorPolygons || []}
      onSave={handleSaveExteriorPolygons}
    />
  </Grid>
)

export default BuildingOverviewTab