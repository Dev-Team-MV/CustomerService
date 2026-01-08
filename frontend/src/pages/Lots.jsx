import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material'
import { Add, Edit, Delete, Landscape } from '@mui/icons-material'
import api from '../services/api'

const Lots = () => {
  const [lots, setLots] = useState([])
  const [stats, setStats] = useState({ total: 0, available: 0, pending: 0, sold: 0 })
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedLot, setSelectedLot] = useState(null)
  const [formData, setFormData] = useState({
    number: '',
    section: '',
    size: '',
    price: 0,
    status: 'available'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [lotsRes, statsRes] = await Promise.all([
        api.get('/lots'),
        api.get('/lots/stats')
      ])
      setLots(lotsRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error fetching lots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (lot = null) => {
    if (lot) {
      setSelectedLot(lot)
      setFormData({
        number: lot.number,
        section: lot.section || '',
        size: lot.size || '',
        price: lot.price,
        status: lot.status
      })
    } else {
      setSelectedLot(null)
      setFormData({ number: '', section: '', size: '', price: 0, status: 'available' })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedLot(null)
  }

  const handleSubmit = async () => {
    try {
      if (selectedLot) {
        await api.put(`/lots/${selectedLot._id}`, formData)
      } else {
        await api.post('/lots', formData)
      }
      handleCloseDialog()
      fetchData()
    } catch (error) {
      console.error('Error saving lot:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lot?')) {
      try {
        await api.delete(`/lots/${id}`)
        fetchData()
      } catch (error) {
        console.error('Error deleting lot:', error)
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success'
      case 'pending': return 'warning'
      case 'sold': return 'error'
      default: return 'default'
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Lot Inventory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage availability, pricing, and details for Lake Conroe properties.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add New Lot
        </Button>
      </Box>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Total Lots
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Available Inventory
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.available}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Pending Sales
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Sold
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.sold}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>LOT NUMBER</TableCell>
                <TableCell>SECTION</TableCell>
                <TableCell>SIZE</TableCell>
                <TableCell>PRICE</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lots.map((lot) => (
                <TableRow key={lot._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      Lot {lot.number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Section {lot.section || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {lot.size || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      ${lot.price?.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={lot.status}
                      color={getStatusColor(lot.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(lot)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(lot._id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedLot ? 'Edit Lot' : 'Add New Lot'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lot Number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Section"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Size (e.g., 0.5 Acres)"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="sold">Sold</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedLot ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Lots
