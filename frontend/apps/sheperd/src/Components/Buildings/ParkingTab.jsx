// @sheperd/Components/Building/ParkingTab.jsx
import { useState, useEffect, useMemo } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton,
  LinearProgress, Chip, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Tooltip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, CircularProgress, Menu, ListItemIcon, ListItemText
} from '@mui/material'
import {
  LocalParking, DirectionsCar, Person, Add, Edit, Delete,
  MoreVert, Accessible, EvStation, TwoWheeler, AutoAwesome,
  Link as LinkIcon, LinkOff, Refresh
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import {
  getFloorsByType, FLOOR_TYPES, getParkingConfig,
  getParkingSpotTypes, getParkingStatusOptions, generateParkingCode
} from '@shared/config/buildingConfig'
import parkingSpotService from '@shared/services/parkingSpotService'

const ParkingTab = ({ building, config }) => {
  const theme = useTheme()
  const { t } = useTranslation(['buildings'])
  const parkingConfig = getParkingConfig('sheperd')
  const spotTypes = getParkingSpotTypes('sheperd')
  const statusOptions = getParkingStatusOptions('sheperd')

  // State
  const [parkingSpots, setParkingSpots] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [menuSpot, setMenuSpot] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    floorNumber: '',
    spotType: parkingConfig?.management?.defaultSpotType || 'standard',
    status: parkingConfig?.management?.defaultStatus || 'available',
    notes: ''
  })

  // Bulk generation state
  const [bulkData, setBulkData] = useState({
    floorNumber: '',
    startNumber: 1,
    endNumber: 50,
    spotType: 'standard'
  })

  const parkingFloors = getFloorsByType('sheperd', FLOOR_TYPES.PARKING)

  // Fetch parking spots
  const fetchParkingSpots = async () => {
    if (!building?._id) return
    
    setLoading(true)
    try {
      const data = await parkingSpotService.getByBuilding(building._id)
      setParkingSpots(data)
      if (!selectedFloor && parkingFloors.length > 0) {
        setSelectedFloor(parkingFloors[0])
      }
    } catch (error) {
      console.error('Error fetching parking spots:', error)
      setSnackbar({ open: true, message: 'Error loading parking spots', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParkingSpots()
  }, [building?._id])

  // Calculate stats
  const stats = useMemo(() => {
    const total = parkingSpots.length
    const available = parkingSpots.filter(s => s.status === 'available').length
    const occupied = parkingSpots.filter(s => s.status === 'occupied').length
    const reserved = parkingSpots.filter(s => s.status === 'reserved').length
    const maintenance = parkingSpots.filter(s => s.status === 'maintenance').length
    const occupancyRate = total > 0 ? ((occupied + reserved) / total) * 100 : 0

    return { total, available, occupied, reserved, maintenance, occupancyRate }
  }, [parkingSpots])

  // Filter spots by selected floor
  const floorSpots = useMemo(() => {
    if (!selectedFloor) return []
    return parkingSpots.filter(s => s.floorNumber === selectedFloor).sort((a, b) => {
      return a.code.localeCompare(b.code, undefined, { numeric: true })
    })
  }, [parkingSpots, selectedFloor])

  // Get spot type icon
  const getSpotTypeIcon = (type) => {
    const icons = {
      standard: DirectionsCar,
      compact: DirectionsCar,
      accessible: Accessible,
      electric: EvStation,
      motorcycle: TwoWheeler
    }
    const Icon = icons[type] || DirectionsCar
    return <Icon fontSize="small" />
  }

  // Get status color
  const getStatusColor = (status) => {
    const option = statusOptions.find(s => s.value === status)
    return option?.color || theme.palette.grey[500]
  }

  // Handle dialog open
  const handleOpenDialog = (spot = null) => {
    if (spot) {
      setSelectedSpot(spot)
      setFormData({
        code: spot.code,
        floorNumber: spot.floorNumber,
        spotType: spot.spotType,
        status: spot.status,
        notes: spot.notes || ''
      })
    } else {
      setSelectedSpot(null)
      const nextNumber = floorSpots.length + 1
      setFormData({
        code: generateParkingCode('sheperd', selectedFloor || parkingFloors[0], nextNumber),
        floorNumber: selectedFloor || parkingFloors[0],
        spotType: parkingConfig?.management?.defaultSpotType || 'standard',
        status: parkingConfig?.management?.defaultStatus || 'available',
        notes: ''
      })
    }
    setDialogOpen(true)
  }

  // Handle save spot
  const handleSaveSpot = async () => {
    try {
      const payload = {
        buildingId: building._id,
        building: building.name,
        ...formData
      }

      if (selectedSpot) {
        await parkingSpotService.update(selectedSpot._id, formData)
        setSnackbar({ open: true, message: 'Parking spot updated successfully', severity: 'success' })
      } else {
        await parkingSpotService.create(payload)
        setSnackbar({ open: true, message: 'Parking spot created successfully', severity: 'success' })
      }

      setDialogOpen(false)
      fetchParkingSpots()
    } catch (error) {
      console.error('Error saving parking spot:', error)
      setSnackbar({ open: true, message: error.message || 'Error saving parking spot', severity: 'error' })
    }
  }

  // Handle delete spot
  const handleDeleteSpot = async (spot) => {
    if (!window.confirm(`Are you sure you want to delete parking spot ${spot.code}?`)) return

    try {
      await parkingSpotService.delete(spot._id)
      setSnackbar({ open: true, message: 'Parking spot deleted successfully', severity: 'success' })
      fetchParkingSpots()
    } catch (error) {
      console.error('Error deleting parking spot:', error)
      setSnackbar({ open: true, message: 'Error deleting parking spot', severity: 'error' })
    }
  }

  // Handle bulk generation
  const handleBulkGenerate = async () => {
    try {
      const spots = []
      for (let i = bulkData.startNumber; i <= bulkData.endNumber; i++) {
        spots.push({
          buildingId: building._id,
          building: building.name,
          floorNumber: bulkData.floorNumber,
          code: generateParkingCode('sheperd', bulkData.floorNumber, i),
          spotType: bulkData.spotType,
          status: 'available',
          notes: ''
        })
      }

      await parkingSpotService.bulkCreate(spots)
      setSnackbar({ open: true, message: `${spots.length} parking spots created successfully`, severity: 'success' })
      setBulkDialogOpen(false)
      fetchParkingSpots()
    } catch (error) {
      console.error('Error bulk creating spots:', error)
      setSnackbar({ open: true, message: 'Error creating parking spots', severity: 'error' })
    }
  }

  // Handle menu
  const handleMenuOpen = (event, spot) => {
    setAnchorEl(event.currentTarget)
    setMenuSpot(spot)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMenuSpot(null)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={600} fontFamily='"Poppins", sans-serif'>
          {t('buildings:parking.title', 'Parking Management')}
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchParkingSpots}
            sx={{ borderRadius: 2, textTransform: 'none', fontFamily: '"Poppins", sans-serif' }}
          >
            Refresh
          </Button>
          {parkingConfig?.management?.allowBulkCreate && (
            <Button
              variant="outlined"
              startIcon={<AutoAwesome />}
              onClick={() => setBulkDialogOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none', fontFamily: '"Poppins", sans-serif' }}
            >
              Bulk Generate
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontFamily: '"Poppins", sans-serif',
              bgcolor: theme.palette.primary.main
            }}
          >
            Add Spot
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: `${config.colors.parking}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <LocalParking sx={{ fontSize: 28, color: config.colors.parking }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} fontFamily='"Poppins", sans-serif' color={config.colors.parking}>
                    {stats.total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    Total Spots
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: '#43A04715',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <DirectionsCar sx={{ fontSize: 28, color: '#43A047' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} fontFamily='"Poppins", sans-serif' color="#43A047">
                    {stats.available}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    Available
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: '#FF6B3515',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Person sx={{ fontSize: 28, color: '#FF6B35' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} fontFamily='"Poppins", sans-serif' color="#FF6B35">
                    {stats.occupied}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    Occupied
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: '#FFA72615',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <LocalParking sx={{ fontSize: 28, color: '#FFA726' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} fontFamily='"Poppins", sans-serif' color="#FFA726">
                    {stats.reserved}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    Reserved
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Occupancy Rate */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3 }}>
        <CardContent>
          <Typography variant="body2" fontWeight={600} mb={1} fontFamily='"Poppins", sans-serif'>
            Occupancy Rate: {stats.occupancyRate.toFixed(1)}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={stats.occupancyRate}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#f0f0f0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: theme.palette.gradient
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Floor Tabs */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3 }}>
        <Tabs
          value={selectedFloor}
          onChange={(e, newValue) => setSelectedFloor(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
              textTransform: 'none'
            }
          }}
        >
          {parkingFloors.map((floor) => {
            const floorSpotsCount = parkingSpots.filter(s => s.floorNumber === floor).length
            return (
              <Tab
                key={floor}
                value={floor}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocalParking fontSize="small" />
                    <span>Floor {floor}</span>
                    <Chip
                      label={floorSpotsCount}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        bgcolor: config.colors.parking + '20',
                        color: config.colors.parking
                      }}
                    />
                  </Box>
                }
              />
            )
          })}
        </Tabs>

        {/* Spots Table */}
        <Box sx={{ p: 2 }}>
          {floorSpots.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No parking spots created for this floor yet. Click "Add Spot" or "Bulk Generate" to create spots.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>Apartment</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>Notes</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {floorSpots.map((spot) => (
                    <TableRow key={spot._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} fontFamily='"Poppins", sans-serif'>
                          {spot.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getSpotTypeIcon(spot.spotType)}
                          <Typography variant="body2" fontFamily='"Poppins", sans-serif'>
                            {spotTypes.find(t => t.value === spot.spotType)?.label || spot.spotType}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusOptions.find(s => s.value === spot.status)?.label || spot.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(spot.status) + '20',
                            color: getStatusColor(spot.status),
                            fontWeight: 600,
                            fontFamily: '"Poppins", sans-serif'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily='"Poppins", sans-serif'>
                          {spot.apartment || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                          {spot.notes || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, spot)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
          {selectedSpot ? 'Edit Parking Spot' : 'Create Parking Spot'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
            <TextField
              fullWidth
              select
              label="Floor Number"
              value={formData.floorNumber}
              onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
              required
            >
              {parkingFloors.map((floor) => (
                <MenuItem key={floor} value={floor}>
                  Floor {floor}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Spot Type"
              value={formData.spotType}
              onChange={(e) => setFormData({ ...formData, spotType: e.target.value })}
              required
            >
              {spotTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              {statusOptions.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none', fontFamily: '"Poppins", sans-serif' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveSpot}
            variant="contained"
            sx={{ textTransform: 'none', fontFamily: '"Poppins", sans-serif' }}
          >
            {selectedSpot ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Generation Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
          Bulk Generate Parking Spots
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              select
              label="Floor Number"
              value={bulkData.floorNumber}
              onChange={(e) => setBulkData({ ...bulkData, floorNumber: e.target.value })}
              required
            >
              {parkingFloors.map((floor) => (
                <MenuItem key={floor} value={floor}>
                  Floor {floor}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              type="number"
              label="Start Number"
              value={bulkData.startNumber}
              onChange={(e) => setBulkData({ ...bulkData, startNumber: parseInt(e.target.value) })}
              required
            />
            <TextField
              fullWidth
              type="number"
              label="End Number"
              value={bulkData.endNumber}
              onChange={(e) => setBulkData({ ...bulkData, endNumber: parseInt(e.target.value) })}
              required
            />
            <TextField
              fullWidth
              select
              label="Spot Type"
              value={bulkData.spotType}
              onChange={(e) => setBulkData({ ...bulkData, spotType: e.target.value })}
              required
            >
              {spotTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              This will create {Math.max(0, bulkData.endNumber - bulkData.startNumber + 1)} parking spots
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)} sx={{ textTransform: 'none', fontFamily: '"Poppins", sans-serif' }}>
            Cancel
          </Button>
          <Button
            onClick={handleBulkGenerate}
            variant="contained"
            disabled={!bulkData.floorNumber || bulkData.endNumber < bulkData.startNumber}
            sx={{ textTransform: 'none', fontFamily: '"Poppins", sans-serif' }}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleOpenDialog(menuSpot); handleMenuClose(); }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleDeleteSpot(menuSpot); handleMenuClose(); }}>
          <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ParkingTab