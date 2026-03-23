import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Container, Snackbar, Alert } from '@mui/material'
import { Business, Add, Apartment, CheckCircle, Layers } from '@mui/icons-material'
import PageHeader from '@shared/components/PageHeader'
import StatsCards from '@shared/components/statscard'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '@shared/components/table/EmptyState'
import { useTheme } from '@mui/material/styles'
import { useBuildingColumns } from '../Constants/Columns/buildings'
import BuildingDialog from '../Components/UI/buildingsComponents/BuildingDialog'
import { useBuildings } from '../Constants/hooks/useBuildings'
import { useState } from 'react'

const Buildings = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const {
    filtered: data,
    loading,
    error,
    search,
    setSearch,
    handleBuildingCreated,
    handleDelete: deleteBuildingAPI,
    refreshBuildings
  } = useBuildings()

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
      setSnackbar({ 
        open: true, 
        message: selectedBuilding ? 'Building updated successfully' : 'Building created successfully', 
        severity: 'success' 
      })
      handleCloseDialog()
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: `Error: ${err.message}`, 
        severity: 'error' 
      })
    }
  }

  const handleDelete = async (building) => {
    try {
      await deleteBuildingAPI(building._id)
      setSnackbar({ 
        open: true, 
        message: 'Building deleted successfully', 
        severity: 'success' 
      })
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: `Error: ${err.message}`, 
        severity: 'error' 
      })
    }
  }

  const columns = useBuildingColumns({
    onViewDetail: (row) => navigate(`/buildings/${row._id}`),
    onEdit: handleOpenDialog,
    onDelete: handleDelete,
  })

  const buildingStats = useMemo(() => [
    { 
      title: 'Total Buildings', 
      value: data.length, 
      icon: Business, 
      gradient: theme.palette.gradient, 
      color: theme.palette.primary.main, 
      delay: 0 
    },
    { 
      title: 'Total Apartments', 
      value: data.reduce((s, b) => s + (b.totalApartments || 0), 0), 
      icon: Apartment, 
      gradient: theme.palette.gradientSecondary, 
      color: theme.palette.secondary.main, 
      delay: 0.1 
    },
    { 
      title: 'Active', 
      value: data.filter(b => b.status === 'active').length, 
      icon: CheckCircle, 
      gradient: theme.palette.gradientInfo, 
      color: theme.palette.info.main, 
      delay: 0.2 
    },
    { 
      title: 'Total Floors', 
      value: data.reduce((s, b) => s + (b.floors || 0), 0), 
      icon: Layers, 
      gradient: theme.palette.gradientAccent, 
      color: theme.palette.accent.main, 
      delay: 0.3 
    },
  ], [data, theme])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={Business}
          title="Buildings"
          subtitle="Manage building inventory, floor plans and apartment polygons"
          actionButton={{ 
            label: 'Add Building', 
            onClick: () => handleOpenDialog(), 
            icon: <Add />, 
            tooltip: 'Create new building' 
          }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <StatsCards stats={buildingStats} loading={loading} />

        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          emptyState={
            <EmptyState
              icon={Business}
              title="No buildings yet"
              description="Start by creating the first building."
              actionLabel="Add Building"
              onAction={() => handleOpenDialog()}
            />
          }
          onRowClick={(row) => handleOpenDialog(row)}
          stickyHeader
          maxHeight={600}
        />

        <BuildingDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSaved={handleSaved}
          selectedBuilding={selectedBuilding}
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

export default Buildings