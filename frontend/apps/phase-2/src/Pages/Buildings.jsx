import { useState, useMemo } from 'react'
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

const mockBuildingData = {
  b1: {
    _id: 'b1',
    project: '69b9b2188186434073c6b13d',
    projectName: 'Lakewood Phase 2',
    name: 'Tower A',
    section: 'North',
    floors: 10,
    apartmentModelsCount: 2,
    totalApartments: 40,
    status: 'active',
    floorPlans: [
      { floorNumber: 1, url: 'https://via.placeholder.com/800x600/8CA551/fff?text=Floor+1+Commercial' },
      { floorNumber: 2, url: 'https://via.placeholder.com/800x600/333F1F/fff?text=Floor+2' },
      { floorNumber: 3, url: 'https://via.placeholder.com/800x600/8CA551/fff?text=Floor+3' }
    ],
    exteriorRenders: [
      'https://via.placeholder.com/600x400/8CA551/fff?text=Exterior+1',
      'https://via.placeholder.com/600x400/333F1F/fff?text=Exterior+2',
      'https://via.placeholder.com/600x400/8CA551/fff?text=Exterior+3'
    ],
    polygon: [],
    // Mock apartment models
    models: [
      {
        _id: 'am1',
        name: 'Model A',
        floorPlan: 'Plan 1',
        sqft: 90,
        bedrooms: 2,
        bathrooms: 2,
        apartmentCount: 20
      },
      {
        _id: 'am2',
        name: 'Model B',
        floorPlan: 'Plan 2',
        sqft: 120,
        bedrooms: 3,
        bathrooms: 2,
        apartmentCount: 20
      }
    ],
    // Mock apartments
    apartments: [
      {
        _id: 'apt1',
        apartmentModel: 'am1',
        floorNumber: 2,
        apartmentNumber: '201',
        price: 120000,
        pending: 20000,
        status: 'available'
      },
      {
        _id: 'apt2',
        apartmentModel: 'am2',
        floorNumber: 3,
        apartmentNumber: '301',
        price: 150000,
        pending: 50000,
        status: 'sold'
      },
      {
        _id: 'apt3',
        apartmentModel: 'am1',
        floorNumber: 4,
        apartmentNumber: '401',
        price: 125000,
        pending: 25000,
        status: 'pending'
      },
      {
        _id: 'apt4',
        apartmentModel: 'am2',
        floorNumber: 5,
        apartmentNumber: '501',
        price: 155000,
        pending: 55000,
        status: 'available'
      }
    ]
  },
  b2: {
    _id: 'b2',
    project: '69b9b2188186434073c6b13d',
    projectName: 'Lakewood Phase 2',
    name: 'Tower B',
    section: 'South',
    floors: 8,
    apartmentModelsCount: 1,
    totalApartments: 32,
    status: 'active',
    floorPlans: [],
    exteriorRenders: [],
    polygon: [],
    models: [
      {
        _id: 'am3',
        name: 'Model C',
        floorPlan: 'Plan 3',
        sqft: 100,
        bedrooms: 2,
        bathrooms: 1,
        apartmentCount: 32
      }
    ],
    apartments: []
  }
}
const Buildings = () => {
  const theme = useTheme()
  const [data, setData] = useState(Object.values(mockBuildingData))  
  const [loading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const navigate = useNavigate()

  const handleOpenDialog = (building = null) => {
    setSelectedBuilding(building)
    setOpenDialog(true)
  }
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedBuilding(null)
  }
  const handleSaved = (building) => {
    setData(prev => {
      const idx = prev.findIndex(b => b._id === building._id)
      if (idx !== -1) { const copy = [...prev]; copy[idx] = building; return copy }
      return [building, ...prev]
    })
    setSnackbar({ open: true, message: selectedBuilding ? 'Building updated' : 'Building created', severity: 'success' })
    handleCloseDialog()
  }
  const handleDelete = (building) => {
    if (!window.confirm(`Delete ${building.name}?`)) return
    setData(prev => prev.filter(b => b._id !== building._id))
    setSnackbar({ open: true, message: 'Building deleted', severity: 'success' })
  }

  const columns = useBuildingColumns({
  onViewDetail: (row) => navigate(`/buildings/${row._id}`),
    onEdit: handleOpenDialog,
    onDelete: handleDelete,
  })

  const buildingStats = useMemo(() => [
    { title: 'Total Buildings', value: data.length, icon: Business, gradient: theme.palette.gradient, color: theme.palette.primary.main, delay: 0 },
    { title: 'Total Apartments', value: data.reduce((s, b) => s + (b.totalApartments || 0), 0), icon: Apartment, gradient: theme.palette.gradientSecondary, color: theme.palette.secondary.main, delay: 0.1 },
    { title: 'Active', value: data.filter(b => b.status === 'active').length, icon: CheckCircle, gradient: theme.palette.gradientInfo, color: theme.palette.info.main, delay: 0.2 },
    { title: 'Total Floors', value: data.reduce((s, b) => s + (b.floors || 0), 0), icon: Layers, gradient: theme.palette.gradientAccent, color: theme.palette.accent.main, delay: 0.3 },
  ], [data, theme])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={Business}
          title="Buildings"
          subtitle="Manage building inventory, floor plans and apartment polygons"
          actionButton={{ label: 'Add Building', onClick: () => handleOpenDialog(), icon: <Add />, tooltip: 'Create new building' }}
        />

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

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbar(p => ({ ...p, open: false }))} severity={snackbar.severity} sx={{ fontFamily: '"Poppins", sans-serif', borderRadius: 3 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}

export default Buildings