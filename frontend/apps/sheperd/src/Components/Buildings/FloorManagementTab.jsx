// @sheperd/Components/Building/FloorsManagementTab.jsx
import { useState } from 'react'
import { Box, Grid, Card, CardContent, Typography, Chip, IconButton, Tooltip, Button } from '@mui/material'
import { Edit, Visibility, Draw } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { getAllFloorsOrganized, getFloorLabel } from '@shared/config/buildingConfig'
import FloorPlanEditor from '@shared/components/Buildings/FloorPlanEditor'
import { useBuildingWithDetails } from '../../Constants/hooks/useBuilding'

const FloorsManagementTab = ({ building, config, refreshBuilding }) => {
  const theme = useTheme()
  const { t } = useTranslation(['buildings'])
  const projectId = import.meta.env.VITE_PROJECT_ID

  const floors = getAllFloorsOrganized('sheperd', building?.floors)
  const [editorOpen, setEditorOpen] = useState(false)
  
  const {
    apartmentModels,
    handleSaveFloorPlans
  } = useBuildingWithDetails(projectId)
  
  const getFloorColor = (type) => {
    switch (type) {
      case 'parking': return config.colors.parking
      case 'commercial': return config.colors.commercial
      case 'residential': return config.colors.residential
      case 'amenity': return config.colors.amenity
      default: return theme.palette.grey[500]
    }
  }

  const getFloorTypeLabel = (type) => {
    const labels = {
      parking: t('buildings:floorTypes.parking', 'Parking'),
      commercial: t('buildings:floorTypes.commercial', 'Commercial'),
      residential: t('buildings:floorTypes.residential', 'Residential'),
      amenity: t('buildings:floorTypes.amenity', 'Amenity')
    }
    return labels[type] || type
  }

  const handleOpenEditor = () => {
    setEditorOpen(true)
  }

  const handleCloseEditor = () => {
    setEditorOpen(false)
  }

  const handleSavePolygons = async (floorPlansData) => {
    try {
      await handleSaveFloorPlans(floorPlansData)
      handleCloseEditor()
      await refreshBuilding()
    } catch (err) {
      console.error('Error saving floor plans:', err)
      throw err
    }
  }

  const hasFloorPlans = building?.floorPlans?.length > 0

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={600} fontFamily='"Poppins", sans-serif'>
          {t('buildings:floors.title', 'Floor Management')}
        </Typography>
        
        {hasFloorPlans && (
          <Button
            variant="contained"
            startIcon={<Draw />}
            onClick={handleOpenEditor}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
              bgcolor: theme.palette.primary.main
            }}
          >
            {t('buildings:actions.drawPolygons', 'Draw Polygons')}
          </Button>
        )}
      </Box>

      {!hasFloorPlans && (
        <Box 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 3, 
            border: `2px dashed ${theme.palette.divider}`,
            bgcolor: theme.palette.background.default,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary" fontFamily='"Poppins", sans-serif'>
            {t('buildings:floors.noFloorPlans', 'No floor plans uploaded yet. Upload floor plans in the Building Configuration to draw polygons.')}
          </Typography>
        </Box>
      )}

<Grid container spacing={2}>
  {floors.map((floor) => {
    const color = getFloorColor(floor.type)
    const floorPlan = building?.floorPlans?.find(fp => fp.floorNumber === floor.number)
    const hasPolygons = floorPlan?.polygons?.length > 0
    
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={floor.number}>
        <Card
          sx={{
            borderRadius: 3,
            border: `2px solid ${color}20`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              borderColor: `${color}40`
            }
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" fontWeight={700} fontFamily='"Poppins", sans-serif' color={color}>
                {floor.label}
              </Typography>
              <Box>
                {floorPlan && (
                  <Tooltip title={t('buildings:actions.viewFloorPlan', 'View Floor Plan')}>
                    <IconButton size="small" sx={{ color }}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            <Chip
              label={getFloorTypeLabel(floor.type)}
              size="small"
              sx={{
                bgcolor: `${color}10`,
                color,
                fontWeight: 600,
                fontFamily: '"Poppins", sans-serif',
                border: `1px solid ${color}30`,
                mb: 2
              }}
            />

            <Box mt={2}>
              <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                {t('buildings:floors.floorPlan', 'Floor Plan')}
              </Typography>
              <Typography variant="body2" fontWeight={600} fontFamily='"Poppins", sans-serif'>
                {floorPlan ? '✓ Uploaded' : 'Not uploaded'}
              </Typography>
            </Box>

            {floorPlan && (
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                  {t('buildings:floors.polygons', 'Polygons')}
                </Typography>
                <Typography variant="body2" fontWeight={600} fontFamily='"Poppins", sans-serif'>
                  {hasPolygons ? `${floorPlan.polygons.length} drawn` : 'None'}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    )
  })}
</Grid>

      <FloorPlanEditor
        open={editorOpen}
        onClose={handleCloseEditor}
        floorPlans={building?.floorPlans || []}
        apartmentModels={apartmentModels || []}
        onSave={handleSavePolygons}
      />
    </Box>
  )
}

export default FloorsManagementTab