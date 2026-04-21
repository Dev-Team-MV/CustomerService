// @shared/components/Buildings/BuildingDetailPage.jsx
import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Container, Paper, Tabs, Tab, Typography, Chip, IconButton, Button, Alert, Snackbar } from '@mui/material'
import { ArrowBack, Layers, Apartment, GridOn, ViewModule } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import PageHeader from '@shared/components/PageHeader'
import StatsCards from '@shared/components/statscard'
import useModalState from '@shared/hooks/useModalState'
import { useBuildingDetail } from '@shared/hooks/useBuildings'
import buildingService from '@shared/services/buildingService'
import ApartmentDialog from '@shared/components/Buildings/ApartmentDialog'
import BuildingOverviewTab from './BuildingOverviewTab'
import BuildingFloorPlansTab from '@shared/components/Buildings/BuildingFloorTabs'
import BuildingModelsTab from '@shared/components/Buildings/BuildingModelsTab'
import BuildingApartmentsTab from '@shared/components/Buildings/BuildingApartmentTab'

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
)

const BuildingDetailPage = ({ projectSlug, backRoute = '/buildings' }) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { id: buildingId } = useParams()
  const { t } = useTranslation(['buildings', 'common'])

  const { building, apartmentModels, apartments, loading, error, handleSaveFloorPlans, handleModelSaved, handleApartmentSaved, refreshBuildingData } = useBuildingDetail(buildingId)

  const [currentTab, setCurrentTab] = useState(0)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const modelModal = useModalState(null)
  const apartmentModal = useModalState(null)
  const floorPlanModal = useModalState()
  const exteriorModal = useModalState()

  const handleOpenFloorPlanEditor = () => {
    if (!building?.floorPlans?.length) {
      setSnackbar({ open: true, message: t('buildings:noFloorPlansUploaded', 'No floor plans uploaded yet.'), severity: 'warning' })
      return
    }
    floorPlanModal.openModal()
  }

  const onModelSaved = async (modelData) => {
    try {
      await handleModelSaved(modelData)
      setSnackbar({ open: true, message: modelModal.data ? t('buildings:modelUpdated', 'Model updated') : t('buildings:modelCreated', 'Model created'), severity: 'success' })
      modelModal.closeModal()
    } catch (err) {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' })
    }
  }

  const onApartmentSaved = async (apartmentData) => {
    try {
      await handleApartmentSaved(apartmentData)
      setSnackbar({ open: true, message: apartmentModal.data ? t('buildings:apartmentUpdated', 'Apartment updated') : t('buildings:apartmentCreated', 'Apartment created'), severity: 'success' })
      apartmentModal.closeModal()
    } catch (err) {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' })
    }
  }

  const onSaveFloorPlans = async (updatedFloorPlans) => {
    try {
      await handleSaveFloorPlans(updatedFloorPlans)
      setSnackbar({ open: true, message: t('buildings:floorPlansSaved', 'Floor plans saved'), severity: 'success' })
      floorPlanModal.closeModal()
    } catch (err) {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' })
    }
  }

  const handleSaveExteriorPolygons = async (newPolygons) => {
    await buildingService.update(building._id, { buildingFloorPolygons: newPolygons })
    refreshBuildingData()
    setSnackbar({ open: true, message: t('buildings:polygonsSaved', 'Exterior polygons saved'), severity: 'success' })
    exteriorModal.closeModal()
  }

  const buildingStats = useMemo(() => {
    if (!building) return []
    return [
      { title: t('buildings:floors', 'Floors'), value: building.floors, icon: Layers, gradient: theme.palette.gradient, color: theme.palette.primary.main, delay: 0 },
      { title: t('buildings:apartments', 'Apartments'), value: building.totalApartments, icon: Apartment, gradient: theme.palette.gradientSecondary, color: theme.palette.secondary.main, delay: 0.1 },
      { title: t('buildings:apartmentModels', 'Models'), value: apartmentModels.length, icon: ViewModule, gradient: theme.palette.gradientInfo, color: theme.palette.info.main, delay: 0.2 },
      { title: t('buildings:floorPlans', 'Floor Plans'), value: `${building.floorPlans?.length || 0}/${building.floors}`, icon: GridOn, gradient: theme.palette.gradientAccent, color: theme.palette.accent?.main || theme.palette.secondary.main, delay: 0.3 }
    ]
  }, [building, apartmentModels, theme, t])

  if (loading && !building) return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: 3 }}>
      <Container maxWidth="xl"><Typography variant="h5">{t('buildings:loading', 'Loading...')}</Typography></Container>
    </Box>
  )

  if (error || !building) return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: 3 }}>
      <Container maxWidth="xl">
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
        <Typography variant="h5">{t('buildings:notFound', 'Building not found')}</Typography>
        <Button onClick={() => navigate(backRoute)} startIcon={<ArrowBack />} sx={{ mt: 2 }}>{t('buildings:backToBuildings', 'Back to Buildings')}</Button>
      </Container>
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(backRoute)} sx={{ bgcolor: theme.palette.chipAdmin.bg, border: `1px solid ${theme.palette.chipAdmin.border}`, '&:hover': { bgcolor: theme.palette.secondary.main, color: '#fff' } }}>
            <ArrowBack />
          </IconButton>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={2} mb={0.5}>
              <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', color: theme.palette.text.primary }}>
                {building.name}
              </Typography>
              {building.section && <Chip label={building.section} size="small" sx={{ bgcolor: theme.palette.chipAdmin.bg, color: theme.palette.chipAdmin.color, fontWeight: 600, fontFamily: '"Poppins", sans-serif' }} />}
              <Chip label={building.status} size="small" color={building.status === 'active' ? 'success' : 'default'} sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif' }} />
            </Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
              {building.project?.name || 'Project'} • {building.floors} {t('buildings:floors', 'floors')} • {building.totalApartments} {t('buildings:apartments', 'apartments')}
            </Typography>
          </Box>
        </Box>

        <StatsCards stats={buildingStats} loading={loading} />

        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.cardBorder}`, bgcolor: theme.palette.cardBg, p: 2 }}>
          <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ borderBottom: `1px solid ${theme.palette.divider}`, px: 2, '& .MuiTab-root': { fontFamily: '"Poppins", sans-serif', fontWeight: 600, textTransform: 'none', fontSize: '0.95rem' } }}>
            <Tab label={t('buildings:overview', 'Overview')} />
            <Tab label={t('buildings:floorPlans', 'Floor Plans')} />
            <Tab label={t('buildings:apartmentModels', 'Models')} />
            <Tab label={t('buildings:apartmentsTab', 'Apartments')} />
          </Tabs>

          <TabPanel value={currentTab} index={0}>
            {/* <BuildingOverviewTab building={building} exteriorModal={exteriorModal} handleOpenExteriorEditor={exteriorModal.openModal} handleCloseExteriorEditor={exteriorModal.closeModal} handleSaveExteriorPolygons={handleSaveExteriorPolygons} /> */}
            <BuildingOverviewTab building={building} projectSlug={projectSlug} exteriorModal={exteriorModal} handleSaveExteriorPolygons={handleSaveExteriorPolygons} />
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            {/* projectSlug pasado para etiquetas de piso dinámicas */}
            <BuildingFloorPlansTab building={building} apartmentModels={apartmentModels} floorPlanModal={floorPlanModal} handleOpenFloorPlanEditor={handleOpenFloorPlanEditor} handleCloseFloorPlanEditor={floorPlanModal.closeModal} onSaveFloorPlans={onSaveFloorPlans} projectSlug={projectSlug} />
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <BuildingModelsTab apartmentModels={apartmentModels} modelModal={modelModal} handleOpenModelDialog={(m) => modelModal.openModal(m)} handleCloseModelDialog={modelModal.closeModal} onModelSaved={onModelSaved} buildingId={buildingId} buildingTotalApartments={building?.totalApartments || 0} />
          </TabPanel>

          <TabPanel value={currentTab} index={3}>
            <BuildingApartmentsTab apartments={apartments} apartmentModels={apartmentModels} building={building} onApartmentSaved={onApartmentSaved} apartmentModal={apartmentModal} handleOpenApartment={(a) => apartmentModal.openModal(a)} handleCloseApartment={apartmentModal.closeModal} />
          </TabPanel>
        </Paper>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbar(p => ({ ...p, open: false }))} severity={snackbar.severity} sx={{ fontFamily: '"Poppins", sans-serif', borderRadius: 3 }}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}

export default BuildingDetailPage