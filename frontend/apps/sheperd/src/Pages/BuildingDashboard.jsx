// @sheperd/Pages/BuildingDashboard.jsx
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Container, Tabs, Tab, Snackbar, Alert, Button, Typography } from '@mui/material'
import { Business, Layers, Apartment, LocalParking, Deck, Settings, Add } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

import PageHeader from '@shared/components/PageHeader'
import StatsCards from '@shared/components/statscard'
import BuildingDialog from '@shared/components/Buildings/BuildingDialog'

import { useBuilding } from '../Constants/hooks/useBuilding'
import { getBuildingConfig, getFloorsByType, FLOOR_TYPES } from '@shared/config/buildingConfig'

// ⏳ Componentes de tabs - Se crearán después
import BuildingOverviewTab from '../Components/Buildings/BuildingOverviewTab'
import ApartmentsTab from '../Components/Buildings/ApartmentTab'
import FloorsManagementTab from '../Components/Buildings/FloorManagementTab'
import ParkingTab from '../Components/Buildings/ParkingTab'
import BuildingConfigTab from '../Components/Buildings/BuildingConfigTab'
import AmenitiesTab from '../Components/Buildings/AmenitiesTab'

const BuildingDashboard = () => {
  const { t } = useTranslation(['buildings', 'common'])
  const theme = useTheme()
  const projectId = import.meta.env.VITE_PROJECT_ID
  const config = getBuildingConfig('sheperd')

  const [activeTab, setActiveTab] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const {
    building,
    loading,
    error,
    exists,
    handleBuildingSaved,
    refreshBuilding
  } = useBuilding(projectId)

  const handleOpenDialog = () => setOpenDialog(true)
  const handleCloseDialog = () => setOpenDialog(false)

  const handleSaved = async (buildingData) => {
    try {
      await handleBuildingSaved(buildingData)
      setSnackbar({
        open: true,
        message: building
          ? t('buildings:updateSuccess', 'Building updated successfully')
          : t('buildings:createSuccess', 'Building created successfully'),
        severity: 'success'
      })
      handleCloseDialog()
    } catch (err) {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' })
    }
  }

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (!building) return []

    const parkingFloors = getFloorsByType('sheperd', FLOOR_TYPES.PARKING)
    const totalParkingSpots = parkingFloors.length * (config.floors.parking?.spotsPerFloor || 0)

    return [
      {
        title: t('buildings:stats.totalFloors', 'Total Floors'),
        value: building.floors || config.floors.total,
        icon: Layers,
        gradient: theme.palette.gradient,
        color: theme.palette.primary.main,
        delay: 0
      },
      {
        title: t('buildings:stats.apartments', 'Apartments'),
        value: building.totalApartments || 0,
        icon: Apartment,
        gradient: theme.palette.gradientSecondary,
        color: theme.palette.secondary.main,
        delay: 0.1
      },
      {
        title: t('buildings:stats.parkingSpots', 'Parking Spots'),
        value: totalParkingSpots,
        icon: LocalParking,
        gradient: 'linear-gradient(135deg, #757575 0%, #9E9E9E 100%)',
        color: config.colors.parking,
        delay: 0.2
      },
      {
        title: t('buildings:stats.amenities', 'Amenities'),
        value: config.floors.amenities?.types.length || 0,
        icon: Deck,
        gradient: theme.palette.gradientInfo,
        color: config.colors.amenity,
        delay: 0.3
      }
    ]
  }, [building, config, theme, t])

  // Si no existe el edificio, mostrar pantalla de creación
  if (!loading && !exists) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', p: { xs: 2, sm: 3 } }}>
        <Container maxWidth="xl">
          <PageHeader
            icon={Business}
            title={t('buildings:title', 'Building')}
            subtitle={t('buildings:subtitle', 'Manage your building')}
          />

          <Box
            sx={{
              mt: 6,
              p: 6,
              textAlign: 'center',
              bgcolor: 'white',
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <Business sx={{ fontSize: 80, color: theme.palette.primary.main, mb: 2, opacity: 0.5 }} />
            <Typography variant="h5" fontWeight={600} mb={2} fontFamily='"Poppins", sans-serif'>
              {t('buildings:noBuilding', 'No building configured yet')}
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4} fontFamily='"Poppins", sans-serif'>
              {t('buildings:noBuildingDesc', 'Create your building to start managing floors, apartments, and amenities')}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={handleOpenDialog}
              sx={{
                background: theme.palette.gradient,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {t('buildings:createBuilding', 'Create Building')}
            </Button>
          </Box>

          <BuildingDialog
            open={openDialog}
            onClose={handleCloseDialog}
            onSaved={handleSaved}
            selectedBuilding={null}
            projectSlug="sheperd"
          />

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

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={Business}
          title={building?.name || t('buildings:title', 'Building')}
          subtitle={building?.address || t('buildings:subtitle', 'Manage your building')}
          actionButton={{
            label: t('buildings:edit', 'Edit Building'),
            onClick: handleOpenDialog,
            icon: <Settings />,
            tooltip: t('buildings:editBuilding', 'Edit building configuration')
          }}
        />

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <StatsCards stats={stats} loading={loading} />

        <Box
          sx={{
            mt: 4,
            bgcolor: 'white',
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              px: 2,
              '& .MuiTab-root': {
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                minHeight: 64,
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: theme.palette.primary.main
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: theme.palette.gradient
              }
            }}
          >
            <Tab icon={<Business />} iconPosition="start" label={t('buildings:tabs.overview', 'Overview')} />
            
            <Tab icon={<Layers />} iconPosition="start" label={t('buildings:tabs.floors', 'Floors')} />
            <Tab icon={<Apartment />} iconPosition="start" label={t('buildings:tabs.apartments', 'Apartments')} />
            <Tab icon={<LocalParking />} iconPosition="start" label={t('buildings:tabs.parking', 'Parking')} />
            <Tab icon={<Deck />} iconPosition="start" label={t('buildings:tabs.amenities', 'Amenities')} />
            <Tab icon={<Settings />} iconPosition="start" label={t('buildings:tabs.config', 'Configuration')} />
          </Tabs>

<Box sx={{ p: 3 }}>
  {activeTab === 0 && <BuildingOverviewTab building={building} config={config} />}
  {activeTab === 1 && <FloorsManagementTab building={building} config={config} refreshBuilding={refreshBuilding} />}
  {activeTab === 2 && <ApartmentsTab building={building} config={config} />}
  {activeTab === 3 && <ParkingTab building={building} config={config} />}
  {activeTab === 4 && <AmenitiesTab building={building} config={config} />}
  {activeTab === 5 && <BuildingConfigTab building={building} config={config} onEdit={handleOpenDialog} />}
</Box>
        </Box>

        <BuildingDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSaved={handleSaved}
          selectedBuilding={building}
          projectSlug="sheperd"
        />

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

export default BuildingDashboard