import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Container, Paper, Tabs, Tab, Grid, Typography, Chip,
  IconButton, Button, Divider, Card, CardMedia, CardContent, Alert, Snackbar
} from '@mui/material'
import {
  Business, ArrowBack, Edit, Layers, Apartment, GridOn,
  Image as ImageIcon, ViewModule, Home
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import PageHeader from '@shared/components/PageHeader'
import StatsCards from '@shared/components/statscard'
import ApartmentDialog from '../Components/UI/buildingsComponents/ApartmentDialog'
import { useBuildingDetail } from '../Constants/hooks/useBuildings'
import useModalState from '@shared/hooks/useModalState'
import buildingService from '../Services/buildingService'
import BuildingOverviewTab from '../Components/UI/buildingsComponents/DETAILS/BuildingOverviewTab'
import BuildingFloorPlansTab from '../Components/UI/buildingsComponents/DETAILS/BuildingFloorTabs'
import BuildingModelsTab from '../Components/UI/buildingsComponents/DETAILS/BuildingModelsTab'
import BuildingApartmentsTab from '../Components/UI/buildingsComponents/DETAILS/BuildingApartmentTab'
const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
)

const BuildingDetail = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { id: buildingId } = useParams()
  
  const {
    building,
    apartmentModels,
    apartments,
    loading,
    error,
    setApartmentModels,
    setApartments,
    handleSaveFloorPlans,
    handleModelSaved,
    handleApartmentSaved,
    refreshBuildingData
  } = useBuildingDetail(buildingId)

  const [currentTab, setCurrentTab] = useState(0)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // MODALS
  const modelModal = useModalState(null)
  const apartmentModal = useModalState(null)
  const floorPlanModal = useModalState()
  const exteriorModal = useModalState()

  // HANDLERS
  const handleOpenModelDialog = (model = null) => modelModal.openModal(model)
  const handleCloseModelDialog = modelModal.closeModal

  const handleOpenApartment = (apartment = null) => apartmentModal.openModal(apartment)
  const handleCloseApartment = apartmentModal.closeModal

  const handleOpenFloorPlanEditor = () => {
    if (!building?.floorPlans || building.floorPlans.length === 0) {
      setSnackbar({ 
        open: true, 
        message: 'No floor plans uploaded yet. Please add floor plans first.', 
        severity: 'warning' 
      })
      return
    }
    floorPlanModal.openModal()
  }
  const handleCloseFloorPlanEditor = floorPlanModal.closeModal

  const handleOpenExteriorEditor = () => exteriorModal.openModal()
  const handleCloseExteriorEditor = exteriorModal.closeModal

  // SAVE HANDLERS
  const onModelSaved = async (modelData) => {
    try {
      await handleModelSaved(modelData)
      setSnackbar({ 
        open: true, 
        message: modelModal.data ? 'Model updated successfully' : 'Model created successfully', 
        severity: 'success' 
      })
      handleCloseModelDialog()
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: `Error: ${err.message}`, 
        severity: 'error' 
      })
    }
  }

  const onApartmentSaved = async (apartmentData) => {
    try {
      await handleApartmentSaved(apartmentData)
      setSnackbar({ 
        open: true, 
        message: apartmentModal.data ? 'Apartment updated successfully' : 'Apartment created successfully', 
        severity: 'success' 
      })
      apartmentModal.closeModal() // <--- CIERRA EL MODAL AQUÍ
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: `Error: ${err.message}`, 
        severity: 'error' 
      })
    }
  }

  const onSaveFloorPlans = async (updatedFloorPlans) => {
    try {
      await handleSaveFloorPlans(updatedFloorPlans)
      setSnackbar({ 
        open: true, 
        message: 'Floor plans and polygons saved successfully', 
        severity: 'success' 
      })
      handleCloseFloorPlanEditor()
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: `Error saving floor plans: ${err.message}`, 
        severity: 'error' 
      })
    }
  }

  const handleSaveExteriorPolygons = async (newPolygons) => {
    await buildingService.update(building._id, { buildingFloorPolygons: newPolygons })
    refreshBuildingData()
    setSnackbar({ open: true, message: 'Exterior polygons saved', severity: 'success' })
    handleCloseExteriorEditor()
  }

  // STATS
  const buildingStats = useMemo(() => {
    if (!building) return []
    return [
      {
        title: 'Total Floors',
        value: building.floors,
        icon: Layers,
        gradient: theme.palette.gradient,
        color: theme.palette.primary.main,
        delay: 0
      },
      {
        title: 'Total Apartments',
        value: building.totalApartments,
        icon: Apartment,
        gradient: theme.palette.gradientSecondary,
        color: theme.palette.secondary.main,
        delay: 0.1
      },
      {
        title: 'Apartment Models',
        value: apartmentModels.length,
        icon: ViewModule,
        gradient: theme.palette.gradientInfo,
        color: theme.palette.info.main,
        delay: 0.2
      },
      {
        title: 'Floor Plans',
        value: `${building.floorPlans?.length || 0}/${building.floors}`,
        icon: GridOn,
        gradient: theme.palette.gradientAccent,
        color: theme.palette.accent.main,
        delay: 0.3
      }
    ]
  }, [building, apartmentModels, theme])

  if (loading && !building) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: 3 }}>
        <Container maxWidth="xl">
          <Typography variant="h5">Loading building details...</Typography>
        </Container>
      </Box>
    )
  }

  if (error || !building) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: 3 }}>
        <Container maxWidth="xl">
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          <Typography variant="h5">Building not found</Typography>
          <Button onClick={() => navigate('/buildings')} startIcon={<ArrowBack />} sx={{ mt: 2 }}>
            Back to Buildings
          </Button>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => navigate('/buildings')}
            sx={{
              bgcolor: theme.palette.chipAdmin.bg,
              border: `1px solid ${theme.palette.chipAdmin.border}`,
              '&:hover': { bgcolor: theme.palette.secondary.main, color: '#fff' }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={2} mb={0.5}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontFamily: '"Poppins", sans-serif',
                  color: theme.palette.text.primary
                }}
              >
                {building.name}
              </Typography>
              {building.section && (
                <Chip
                  label={building.section}
                  size="small"
                  sx={{
                    bgcolor: theme.palette.chipAdmin.bg,
                    color: theme.palette.chipAdmin.color,
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif'
                  }}
                />
              )}
              <Chip
                label={building.status}
                size="small"
                color={building.status === 'active' ? 'success' : 'default'}
                sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
              {building.project?.name || 'Project'} • {building.floors} Floors • {building.totalApartments} Apartments
            </Typography>
          </Box>
        </Box>

        <StatsCards stats={buildingStats} loading={loading} />

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.cardBorder}`,
            bgcolor: theme.palette.cardBg,
            p: 2,
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              px: 2,
              '& .MuiTab-root': {
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem'
              }
            }}
          >
            <Tab label="Overview" />
            <Tab label="Floor Plans" />
            <Tab label="Apartment Models" />
            <Tab label="Apartments" />
          </Tabs>

<TabPanel value={currentTab} index={0}>
  <BuildingOverviewTab
    building={building}
    exteriorModal={exteriorModal}
    handleOpenExteriorEditor={handleOpenExteriorEditor}
    handleCloseExteriorEditor={handleCloseExteriorEditor}
    handleSaveExteriorPolygons={handleSaveExteriorPolygons}
  />
</TabPanel>

<TabPanel value={currentTab} index={1}>
  <BuildingFloorPlansTab
    building={building}
    apartmentModels={apartmentModels}
    floorPlanModal={floorPlanModal}
    handleOpenFloorPlanEditor={handleOpenFloorPlanEditor}
    handleCloseFloorPlanEditor={handleCloseFloorPlanEditor}
    onSaveFloorPlans={onSaveFloorPlans}
  />
</TabPanel>

<TabPanel value={currentTab} index={2}>
  <BuildingModelsTab
    apartmentModels={apartmentModels}
    modelModal={modelModal}
    handleOpenModelDialog={handleOpenModelDialog}
    handleCloseModelDialog={handleCloseModelDialog}
    onModelSaved={onModelSaved}
    buildingId={buildingId}
    buildingTotalApartments={building?.totalApartments || 0}
  />
</TabPanel>

<TabPanel value={currentTab} index={3}>
  <BuildingApartmentsTab
    apartments={apartments}
    apartmentModels={apartmentModels}
    building={building}
    onApartmentSaved={onApartmentSaved}
    apartmentModal={apartmentModal} // <-- pásalo
    handleOpenApartment={handleOpenApartment}
    handleCloseApartment={handleCloseApartment}
  />
</TabPanel>
        </Paper>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={4000} 
          onClose={() => setSnackbar(p => ({ ...p, open: false }))} 
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar(p => ({ ...p, open: false }))} 
            severity={snackbar.severity} 
            sx={{ fontFamily: '"Poppins", sans-serif', borderRadius: 3 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}

export default BuildingDetail