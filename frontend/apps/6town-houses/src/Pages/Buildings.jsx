// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Pages/Buildings.jsx

import { useState } from 'react'
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
        message: selectedBuilding ? 'Casa actualizada' : 'Casa creada', 
        severity: 'success' 
      })
    } catch (err) {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' })
    }
  }

  const handleDelete = async (building) => {
    if (!window.confirm(`¿Eliminar casa ${building.name}?`)) return
    try {
      await deleteBuildingAPI(building._id)
      setSnackbar({ open: true, message: 'Casa eliminada', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' })
    }
  }

  const columns = getBuildingColumns({
    onEdit: handleOpenDialog,
    onDelete: handleDelete,
    theme,
  })

  const stats = [
    { title: 'Total Casas', value: data.length, icon: Home, gradient: theme.palette.gradient, color: '#1a237e', delay: 0 },
    { title: 'Disponibles', value: data.filter(b => b.status === 'active').length, icon: Home, gradient: theme.palette.gradientSecondary, color: '#4caf50', delay: 0.1 },
    { title: 'Vendidas', value: data.filter(b => b.status === 'sold').length, icon: Home, gradient: theme.palette.gradientInfo, color: '#f44336', delay: 0.2 },
    { title: 'Reservadas', value: data.filter(b => b.status === 'reserved').length, icon: Home, gradient: theme.palette.gradientAccent, color: '#ff9800', delay: 0.3 },
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={Home}
          title="Casas"
          subtitle="Gestiona las casas del proyecto"
          actionButton={{
            label: 'Crear Casa',
            onClick: () => handleOpenDialog(),
            icon: <Home />,
            tooltip: 'Crear nueva casa',
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
              <Alert severity="info">No hay casas creadas</Alert>
            </Box>
          }
        />

        <HouseDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSaved={handleSaved}
          selectedBuilding={selectedBuilding}
          projectId={projectId}
          lots={lots}        // ✅ Pasar lots
          models={models}    // ✅ Pasar models
          facades={facades}  // ✅ Pasar facades
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