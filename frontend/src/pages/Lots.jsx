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
  MenuItem,
  Tooltip
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
    <Box
    sx={{p: 3}}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Lot Inventory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage availability, pricing, and details for Lake Conroe properties.
          </Typography>
        </Box>
        <Tooltip title="Add New Lot" placement="left">
          <Button
            variant="contained"
            onClick={() => handleOpenDialog()}
            sx={{
              minWidth: { xs: 48, sm: 'auto' },
              width: { xs: 48, sm: 'auto' },
              height: { xs: 48, sm: 'auto' },
              p: { xs: 0, sm: '8px 24px' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: { xs: '50%', sm: 3 },
              bgcolor: '#333F1F',
              color: 'white',
              fontWeight: 600,
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontFamily: '"Poppins", sans-serif',
              border: 'none',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
              transition: 'all 0.3s ease',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                bgcolor: '#8CA551',
                transition: 'left 0.4s ease',
                zIndex: 0,
              },
              '&:hover': {
                bgcolor: '#333F1F',
                boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
                transform: 'translateY(-2px)',
                '&::before': {
                  left: 0,
                },
                '& .MuiBox-root, & .MuiSvgIcon-root': {
                  color: 'white',
                  position: 'relative',
                  zIndex: 1,
                },
              },
              '&:active': {
                transform: 'translateY(0px)',
                boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)'
              },
              '& .MuiBox-root, & .MuiSvgIcon-root': {
                position: 'relative',
                zIndex: 1,
                transition: 'color 0.3s ease',
              },
            }}
          >
            <Add sx={{ display: { xs: 'block', sm: 'none' }, fontSize: 24 }} />
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
              <Add />
              Add New Lot
            </Box>
          </Button>
        </Tooltip>
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


      
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(51, 63, 31, 0.15)",
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: "#333F1F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(51, 63, 31, 0.2)",
              }}
            >
              <Landscape sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                fontWeight={700}
                sx={{ 
                  color: "#333F1F",
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                {selectedLot ? 'Edit Lot' : 'Add New Lot'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: "#706f6f",
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                Manage lot inventory and details
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
      
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lot Number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    fontFamily: '"Poppins", sans-serif',
                    "& fieldset": {
                      borderColor: 'rgba(140, 165, 81, 0.3)',
                      borderWidth: '2px'
                    },
                    "&:hover fieldset": {
                      borderColor: "#8CA551"
                    },
                    "&.Mui-focused fieldset": { 
                      borderColor: "#333F1F",
                      borderWidth: "2px"
                    }
                  },
                  "& .MuiInputLabel-root": {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    color: '#706f6f',
                    "&.Mui-focused": {
                      color: "#333F1F",
                      fontWeight: 600
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Section"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    fontFamily: '"Poppins", sans-serif',
                    "& fieldset": {
                      borderColor: 'rgba(140, 165, 81, 0.3)',
                      borderWidth: '2px'
                    },
                    "&:hover fieldset": {
                      borderColor: "#8CA551"
                    },
                    "&.Mui-focused fieldset": { 
                      borderColor: "#333F1F",
                      borderWidth: "2px"
                    }
                  },
                  "& .MuiInputLabel-root": {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    color: '#706f6f',
                    "&.Mui-focused": {
                      color: "#333F1F",
                      fontWeight: 600
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Size (e.g., 0.5 Acres)"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    fontFamily: '"Poppins", sans-serif',
                    "& fieldset": {
                      borderColor: 'rgba(140, 165, 81, 0.3)',
                      borderWidth: '2px'
                    },
                    "&:hover fieldset": {
                      borderColor: "#8CA551"
                    },
                    "&.Mui-focused fieldset": { 
                      borderColor: "#333F1F",
                      borderWidth: "2px"
                    }
                  },
                  "& .MuiInputLabel-root": {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    color: '#706f6f',
                    "&.Mui-focused": {
                      color: "#333F1F",
                      fontWeight: 600
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                InputProps={{
                  startAdornment: (
                    <Typography sx={{ mr: 0.5, fontSize: "0.875rem", color: '#333F1F', fontWeight: 600 }}>$</Typography>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    fontFamily: '"Poppins", sans-serif',
                    "& fieldset": {
                      borderColor: 'rgba(140, 165, 81, 0.3)',
                      borderWidth: '2px'
                    },
                    "&:hover fieldset": {
                      borderColor: "#8CA551"
                    },
                    "&.Mui-focused fieldset": { 
                      borderColor: "#333F1F",
                      borderWidth: "2px"
                    }
                  },
                  "& .MuiInputLabel-root": {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    color: '#706f6f',
                    "&.Mui-focused": {
                      color: "#333F1F",
                      fontWeight: 600
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    fontFamily: '"Poppins", sans-serif',
                    "& fieldset": {
                      borderColor: 'rgba(140, 165, 81, 0.3)',
                      borderWidth: '2px'
                    },
                    "&:hover fieldset": {
                      borderColor: "#8CA551"
                    },
                    "&.Mui-focused fieldset": { 
                      borderColor: "#333F1F",
                      borderWidth: "2px"
                    }
                  },
                  "& .MuiInputLabel-root": {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    color: '#706f6f',
                    "&.Mui-focused": {
                      color: "#333F1F",
                      fontWeight: 600
                    }
                  }
                }}
              >
                <MenuItem 
                  value="available"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: 'rgba(140, 165, 81, 0.08)'
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(140, 165, 81, 0.12)',
                      '&:hover': {
                        bgcolor: 'rgba(140, 165, 81, 0.18)'
                      }
                    }
                  }}
                >
                  Available
                </MenuItem>
                <MenuItem 
                  value="pending"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: 'rgba(229, 134, 60, 0.08)'
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(229, 134, 60, 0.12)',
                      '&:hover': {
                        bgcolor: 'rgba(229, 134, 60, 0.18)'
                      }
                    }
                  }}
                >
                  Pending
                </MenuItem>
                <MenuItem 
                  value="sold"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: 'rgba(112, 111, 111, 0.08)'
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(112, 111, 111, 0.12)',
                      '&:hover': {
                        bgcolor: 'rgba(112, 111, 111, 0.18)'
                      }
                    }
                  }}
                >
                  Sold
                </MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
      
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.2,
              color: "#706f6f",
              fontFamily: '"Poppins", sans-serif',
              border: "2px solid #e0e0e0",
              "&:hover": {
                bgcolor: "rgba(112, 111, 111, 0.05)",
                borderColor: "#706f6f"
              }
            }}
          >
            Cancel
          </Button>
      
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              borderRadius: 3,
              bgcolor: "#333F1F",
              color: "white",
              fontWeight: 600,
              textTransform: "none",
              letterSpacing: "1px",
              fontFamily: '"Poppins", sans-serif',
              px: 4,
              py: 1.5,
              boxShadow: "0 4px 12px rgba(51, 63, 31, 0.25)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                bgcolor: "#8CA551",
                transition: "left 0.4s ease",
                zIndex: 0,
              },
              "&:hover": {
                bgcolor: "#333F1F",
                boxShadow: "0 8px 20px rgba(51, 63, 31, 0.35)",
                "&::before": {
                  left: 0,
                },
              },
              "& span": {
                position: "relative",
                zIndex: 1,
              }
            }}
          >
            <span>{selectedLot ? 'Update' : 'Create'}</span>
          </Button>
        </DialogActions>
      </Dialog>
      

    </Box>
  )
}

export default Lots
