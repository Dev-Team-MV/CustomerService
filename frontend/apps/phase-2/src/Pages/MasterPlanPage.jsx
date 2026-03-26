import { useState, useEffect } from 'react'
import { Box, Container, Paper, Typography, CircularProgress } from '@mui/material'
import { Map } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import PageHeader from '@shared/components/PageHeader'
import MasterPlanEditor from '../Components/UI/MasterPlanEditor'
import PolygonImagePreview from '../Components/UI/PolygonImagePreview'
import { useMasterPlan } from '@shared/hooks/useMasterPlan'

const MasterPlanPage = () => {
  const theme = useTheme()
  const projectId = import.meta.env.VITE_PROJECT_ID
  const { masterPlanData, loading, fetchMasterPlan, saveBuildingPolygon } = useMasterPlan()
  const [editorOpen, setEditorOpen] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 1200, height: 800 })

  // Fetch master plan data on mount
  useEffect(() => {
    if (projectId) {
      fetchMasterPlan(projectId)
    }
  }, [projectId])

  // Load image to get real dimensions
  useEffect(() => {
    if (masterPlanData?.masterPlanImage) {
      const img = new Image()
      img.onload = () => {
        console.log('🖼️ Image loaded:', { width: img.width, height: img.height })
        
        // Calcular dimensiones escaladas (igual que PolygonImagePreview)
        const maxWidth = 1200
        const maxHeight = 800
        const imgRatio = img.width / img.height
        
        let width = maxWidth
        let height = maxWidth / imgRatio
        
        if (height > maxHeight) {
          height = maxHeight
          width = maxHeight * imgRatio
        }
        
        console.log('📐 Scaled dimensions:', { width, height })
        setImageDimensions({ width, height })
      }
      img.src = masterPlanData.masterPlanImage
    }
  }, [masterPlanData?.masterPlanImage])

  const handleOpenEditor = async () => {
    await fetchMasterPlan(projectId)
    setEditorOpen(true)
  }

  const handleSave = async (updates) => {
    try {
      for (const update of updates) {
        const { buildingId, polygon, polygonColor, polygonStrokeColor, polygonOpacity } = update
        await saveBuildingPolygon(buildingId, {
          polygon,
          polygonColor,
          polygonStrokeColor,
          polygonOpacity
        })
      }
      alert('Master plan saved successfully!')
      setEditorOpen(false)
      await fetchMasterPlan(projectId)
    } catch (error) {
      alert('Error saving master plan: ' + error.message)
    }
  }

  // Preparar polígonos para visualización
// Preparar polígonos para visualización
const preparePolygonsForPreview = () => {
  if (!masterPlanData?.buildings) {
    console.log('❌ No buildings in masterPlanData')
    return []
  }

  console.log('🏢 Processing buildings:', masterPlanData.buildings.length)
  console.log('📐 Stage dimensions:', imageDimensions)

  const polygons = masterPlanData.buildings
    .filter(building => building.polygon && building.polygon.length > 0)
    .map(building => {
      // ✅ Los polígonos vienen en coordenadas de la imagen ORIGINAL
      // Simplemente usamos esas coordenadas directamente
      // porque PolygonImagePreview ya maneja el escalado
      
      const points = building.polygon.flatMap(point => [
        point.x,
        point.y
      ])

      console.log(`✅ Building "${building.name}":`, {
        originalPolygon: building.polygon,
        points: points,
        color: building.polygonColor,
        opacity: building.polygonOpacity
      })

      return {
        id: building._id,
        name: building.name,
        points: points,
        color: building.polygonColor || theme.palette.primary.main,
        stroke: building.polygonStrokeColor || theme.palette.secondary.main,
        strokeWidth: 3,
        opacity: building.polygonOpacity !== undefined ? building.polygonOpacity : 0.5,
        fill: (building.polygonColor || theme.palette.primary.main) + '88',
      }
    })

  console.log('📊 Total polygons prepared:', polygons.length)
  return polygons
}

  const previewPolygons = preparePolygonsForPreview()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={Map}
          title="Master Plan"
          subtitle="Edit and manage building polygons on the master plan"
          actionButton={{
            label: 'Edit Master Plan',
            onClick: handleOpenEditor,
            icon: <Map />,
            tooltip: 'Edit master plan polygons',
            disabled: loading
          }}
        />

        {/* Master Plan Preview */}
        {loading ? (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight={400}
            sx={{ mt: 3 }}
          >
            <CircularProgress size={48} sx={{ color: theme.palette.primary.main }} />
          </Box>
        ) : masterPlanData?.masterPlanImage ? (
          <Box sx={{ mt: 3, mb: 4 }}>
            {/* Section Header */}
            <Box mb={3}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Map sx={{ color: theme.palette.secondary.main, fontSize: 28 }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    letterSpacing: '0.5px',
                  }}
                >
                  Master Plan Overview
                </Typography>
              </Box>
              <Box sx={{ width: 80, height: 3, bgcolor: theme.palette.secondary.main, borderRadius: 1 }} />
              <Typography
                variant="body2"
                sx={{
                  mt: 1.5,
                  color: theme.palette.text.secondary,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '0.9rem'
                }}
              >
                View all building polygons on the master plan. Click "Edit Master Plan" to modify.
              </Typography>
            </Box>

            {/* Master Plan Image with Polygons */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 4,
                border: `1.5px solid ${theme.palette.cardBorder}`,
                bgcolor: 'white',
                overflow: 'hidden',
                boxShadow: '0 12px 32px rgba(26, 35, 126, 0.12)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 24px 48px ${theme.palette.primary.main}26`,
                  borderColor: theme.palette.secondary.main + '4D'
                }
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  mx: 'auto',
                  position: 'relative',
                  bgcolor: '#f5f5f5',
                  borderRadius: 2,
                  overflow: 'hidden',
                  minHeight: 500,
                  maxHeight: 800
                }}
              >
                <PolygonImagePreview
                  imageUrl={masterPlanData.masterPlanImage}
                  polygons={previewPolygons}
                  maxWidth={1200}
                  maxHeight={800}
                  showLabels={true}
                  onPolygonClick={(poly) => console.log('Building clicked:', poly)}
                  onPolygonHover={(polyId) => console.log('Building hovered:', polyId)}
                />
              </Box>
              
              {/* Building Count Info */}
              <Box 
                sx={{ 
                  mt: 2, 
                  pt: 2, 
                  borderTop: `1px solid ${theme.palette.cardBorder}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '0.8rem'
                  }}
                >
                  Showing {previewPolygons.length} building{previewPolygons.length !== 1 ? 's' : ''} on master plan
                </Typography>
                
                {/* Legend */}
                <Box display="flex" gap={2} flexWrap="wrap">
                  {previewPolygons.slice(0, 5).map((poly) => (
                    <Box key={poly.id} display="flex" alignItems="center" gap={0.5}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: 1,
                          bgcolor: poly.color,
                          border: `2px solid ${poly.stroke}`,
                          opacity: 0.7
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        {poly.name}
                      </Typography>
                    </Box>
                  ))}
                  {previewPolygons.length > 5 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontFamily: '"Poppins", sans-serif',
                        fontSize: '0.75rem',
                        fontStyle: 'italic'
                      }}
                    >
                      +{previewPolygons.length - 5} more
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        ) : null}

        {/* Editor Modal */}
        <MasterPlanEditor
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          masterPlanData={masterPlanData}
          onSave={handleSave}
        />
      </Container>
    </Box>
  )
}

export default MasterPlanPage