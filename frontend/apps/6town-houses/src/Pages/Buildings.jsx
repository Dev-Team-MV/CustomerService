import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Container, Snackbar, Alert } from '@mui/material'
import { Home } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import PageHeader from '@shared/components/PageHeader'
import StatsCards from '@shared/components/statscard'
import DataTable from '@shared/components/table/DataTable'
import { useBuildings } from '@shared/hooks/useBuildings'
import { useLots } from '@shared/hooks/useLots'
import { useModels } from '@shared/hooks/useModels'
import { getBuildingColumns } from '../Constants/Columns/buildings'
import HouseDialog from '../Components/buildings/HouseDialog'

const Buildings = () => {
  const { t } = useTranslation(['houses6Town', 'common'])
  const theme = useTheme()
  const projectId = import.meta.env.VITE_PROJECT_ID

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const {
    filtered: data,
    loading,
    handleBuildingCreated,
    handleDelete: deleteBuildingAPI,
    refreshBuildings
  } = useBuildings(projectId)

  // ✅ Cargar lots, models y facades para el dialog
  const { lots } = useLots(projectId)
  const { models, facades } = useModels(projectId)

  const handleOpenDialog = (building = null) => {
    setSelectedBuilding(building)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedBuilding(null)
  }

const handleSaved = async (buildingData) => {
  try {
    await handleBuildingCreated(buildingData)
    await refreshBuildings()
    handleCloseDialog()
    setSnackbar({ 
      open: true, 
      message: buildingData._id ? t('houses6Town:messages.updateSuccess') : t('houses6Town:messages.createSuccess'),  // ✅ Detectar por _id
      severity: 'success' 
    })
  } catch (err) {
    setSnackbar({ open: true, message: t('houses6Town:messages.error', { message: err.message }), severity: 'error' })
  }
}

  const handleDelete = async (building) => {
    if (!window.confirm(t('houses6Town:messages.deleteConfirm', { name: building.name }))) return
    try {
      await deleteBuildingAPI(building._id)
      setSnackbar({ open: true, message: t('houses6Town:messages.deleteSuccess'), severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: t('houses6Town:messages.error', { message: err.message }), severity: 'error' })
    }
  }

  const columns = getBuildingColumns({
    onEdit: handleOpenDialog,
    onDelete: handleDelete,
    theme,
    t
  })

  const stats = [
    { 
      title: t('houses6Town:stats.total'), 
      value: data.length, 
      icon: Home, 
      gradient: theme.palette.gradient, 
      color: '#1a237e', 
      delay: 0 
    },
    { 
      title: t('houses6Town:stats.available'), 
      value: data.filter(b => b.status === 'active').length, 
      icon: Home, 
      gradient: theme.palette.gradientSecondary, 
      color: '#4caf50', 
      delay: 0.1 
    },
    { 
      title: t('houses6Town:stats.sold'), 
      value: data.filter(b => b.status === 'sold').length, 
      icon: Home, 
      gradient: theme.palette.gradientInfo, 
      color: '#f44336', 
      delay: 0.2 
    },
    { 
      title: t('houses6Town:stats.reserved'), 
      value: data.filter(b => b.status === 'reserved').length, 
      icon: Home, 
      gradient: theme.palette.gradientAccent, 
      color: '#ff9800', 
      delay: 0.3 
    },
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={Home}
          title={t('houses6Town:title')}
          subtitle={t('houses6Town:subtitle')}
          actionButton={{
            label: t('houses6Town:actions.add'),
            onClick: () => handleOpenDialog(),
            icon: <Home />,
            tooltip: t('houses6Town:actions.add'),
            disabled: loading
          }}
        />

        <StatsCards stats={stats} />

        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          emptyState={
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Alert severity="info">{t('houses6Town:messages.noBuildings') || 'No hay casas creadas'}</Alert>
            </Box>
          }
        />

        <HouseDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSaved={handleSaved}
          selectedBuilding={selectedBuilding}
          projectId={projectId}
          lots={lots}
          models={models}
          facades={facades}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} sx={{ borderRadius: 3 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}

export default Buildings