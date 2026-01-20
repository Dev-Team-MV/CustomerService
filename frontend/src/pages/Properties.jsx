// import { useState, useEffect } from 'react'
// import {
//   Box,
//   Typography,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Button,
//   Chip,
//   Avatar,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   MenuItem,
//   Grid
// } from '@mui/material'
// import { Add, Edit, Delete, Search } from '@mui/icons-material'
// import api from '../services/api'

// const Properties = () => {
//   const [properties, setProperties] = useState([])
//   const [lots, setLots] = useState([])
//   const [models, setModels] = useState([])
//   const [users, setUsers] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [openDialog, setOpenDialog] = useState(false)
//   const [selectedProperty, setSelectedProperty] = useState(null)
//   const [formData, setFormData] = useState({
//     lot: '',
//     model: '',
//     user: '',
//     initialPayment: 0
//   })

//   useEffect(() => {
//     fetchData()
//   }, [])

//   const fetchData = async () => {
//     try {
//       const [propertiesRes, lotsRes, modelsRes, usersRes] = await Promise.all([
//         api.get('/properties'),
//         api.get('/lots?status=available'),
//         api.get('/models?status=active'),
//         api.get('/users?role=user')
//       ])
//       setProperties(propertiesRes.data)
//       setLots(lotsRes.data)
//       setModels(modelsRes.data)
//       setUsers(usersRes.data)
//     } catch (error) {
//       console.error('Error fetching data:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleOpenDialog = (property = null) => {
//     if (property) {
//       setSelectedProperty(property)
//       setFormData({
//         lot: property.lot._id,
//         model: property.model._id,
//         user: property.user._id,
//         initialPayment: property.initialPayment
//       })
//     } else {
//       setSelectedProperty(null)
//       setFormData({ lot: '', model: '', user: '', initialPayment: 0 })
//     }
//     setOpenDialog(true)
//   }

//   const handleCloseDialog = () => {
//     setOpenDialog(false)
//     setSelectedProperty(null)
//   }

//   const handleSubmit = async () => {
//     try {
//       const selectedLot = lots.find(l => l._id === formData.lot)
//       const selectedModel = models.find(m => m._id === formData.model)
      
//       const totalPrice = (selectedLot?.price || 0) + (selectedModel?.price || 0)
//       const pending = totalPrice - formData.initialPayment

//       const payload = {
//         ...formData,
//         price: totalPrice,
//         pending: pending
//       }

//       if (selectedProperty) {
//         await api.put(`/properties/${selectedProperty._id}`, payload)
//       } else {
//         await api.post('/properties', payload)
//       }
      
//       handleCloseDialog()
//       fetchData()
//     } catch (error) {
//       console.error('Error saving property:', error)
//     }
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'sold': return 'success'
//       case 'active': return 'info'
//       case 'pending': return 'warning'
//       default: return 'default'
//     }
//   }

//   return (
//     <Box>
//       <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//         <Box>
//           <Typography variant="h4" fontWeight="bold">
//             Property Management
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             Oversee inventory, pricing, and resident assignments across the estate.
//           </Typography>
//         </Box>
//         <Button
//           variant="contained"
//           startIcon={<Add />}
//           onClick={() => handleOpenDialog()}
//         >
//           Add Property
//         </Button>
//       </Box>

//       <Paper>
//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>LOT INFO</TableCell>
//                 <TableCell>MODEL</TableCell>
//                 <TableCell>RESIDENT / OWNER</TableCell>
//                 <TableCell>STATUS</TableCell>
//                 <TableCell>PRICE</TableCell>
//                 <TableCell>ACTIONS</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {properties.map((property) => (
//                 <TableRow key={property._id}>
//                   <TableCell>
//                     <Box display="flex" alignItems="center" gap={1}>
//                       <Avatar sx={{ bgcolor: 'primary.light' }}>
//                         {property.lot?.number}
//                       </Avatar>
//                       <Box>
//                         <Typography variant="body2" fontWeight="500">
//                           Lot {property.lot?.number}
//                         </Typography>
//                         <Typography variant="caption" color="text.secondary">
//                           Section {property.lot?.section}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </TableCell>
//                   <TableCell>
//                     <Typography variant="body2">
//                       {property.model?.model || 'N/A'}
//                     </Typography>
//                   </TableCell>
//                   <TableCell>
//                     <Box display="flex" alignItems="center" gap={1}>
//                       <Avatar sx={{ width: 32, height: 32, fontSize: '14px' }}>
//                         {property.user?.firstName?.charAt(0)}
//                       </Avatar>
//                       <Typography variant="body2">
//                         {property.user?.firstName} {property.user?.lastName}
//                       </Typography>
//                     </Box>
//                   </TableCell>
//                   <TableCell>
//                     <Chip
//                       label={property.status}
//                       color={getStatusColor(property.status)}
//                       size="small"
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <Typography variant="body2" fontWeight="600">
//                       ${property.price?.toLocaleString()}
//                     </Typography>
//                     {property.pending > 0 && (
//                       <Typography variant="caption" color="warning.main">
//                         Pending: ${property.pending?.toLocaleString()}
//                       </Typography>
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     <IconButton size="small" onClick={() => handleOpenDialog(property)}>
//                       <Edit fontSize="small" />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>

//       <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
//         <DialogTitle>
//           {selectedProperty ? 'Edit Property' : 'Add New Property'}
//         </DialogTitle>
//         <DialogContent>
//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 select
//                 label="Lot"
//                 value={formData.lot}
//                 onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
//               >
//                 {lots.map((lot) => (
//                   <MenuItem key={lot._id} value={lot._id}>
//                     Lot {lot.number} - ${lot.price?.toLocaleString()}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 select
//                 label="Model"
//                 value={formData.model}
//                 onChange={(e) => setFormData({ ...formData, model: e.target.value })}
//               >
//                 {models.map((model) => (
//                   <MenuItem key={model._id} value={model._id}>
//                     {model.model} - ${model.price?.toLocaleString()}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 select
//                 label="User/Resident"
//                 value={formData.user}
//                 onChange={(e) => setFormData({ ...formData, user: e.target.value })}
//               >
//                 {users.map((user) => (
//                   <MenuItem key={user._id} value={user._id}>
//                     {user.firstName} {user.lastName}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 type="number"
//                 label="Initial Payment"
//                 value={formData.initialPayment}
//                 onChange={(e) => setFormData({ ...formData, initialPayment: Number(e.target.value) })}
//               />
//             </Grid>
//             {formData.lot && formData.model && (
//               <Grid item xs={12}>
//                 <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
//                   <Typography variant="body2" color="text.secondary">
//                     Total Price: ${((lots.find(l => l._id === formData.lot)?.price || 0) + 
//                     (models.find(m => m._id === formData.model)?.price || 0)).toLocaleString()}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     Pending: ${((lots.find(l => l._id === formData.lot)?.price || 0) + 
//                     (models.find(m => m._id === formData.model)?.price || 0) - 
//                     formData.initialPayment).toLocaleString()}
//                   </Typography>
//                 </Paper>
//               </Grid>
//             )}
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog}>Cancel</Button>
//           <Button onClick={handleSubmit} variant="contained">
//             {selectedProperty ? 'Update' : 'Create'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   )
// }

// export default Properties


import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Avatar,
  IconButton
} from '@mui/material'
import { Add, Edit, Visibility } from '@mui/icons-material'
import api from '../services/api'

const Properties = () => {
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const propertiesRes = await api.get('/properties')
      setProperties(propertiesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProperty = () => {
    navigate('/properties/select')
  }

  const handleViewProperty = (property) => {
    // Opcional: navegar a una página de detalle
    console.log('View property:', property)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'sold': return 'success'
      case 'active': return 'info'
      case 'pending': return 'warning'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography>Loading properties...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Property Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Oversee inventory, pricing, and resident assignments across the estate.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddProperty}
          sx={{
            bgcolor: '#4a7c59',
            '&:hover': { bgcolor: '#3d664a' }
          }}
        >
          Add Property
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>LOT INFO</TableCell>
                <TableCell>MODEL</TableCell>
                <TableCell>FACADE</TableCell>
                <TableCell>RESIDENT / OWNER</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>PRICE</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No properties found. Click "Add Property" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property) => (
                  <TableRow key={property._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          {property.lot?.number}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            Lot {property.lot?.number}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Section {property.lot?.section || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {property.model?.model || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {property.model?.bedrooms}BR / {property.model?.bathrooms}BA
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {property.facade?.title || 'Not selected'}
                      </Typography>
                      {property.facade?.price > 0 && (
                        <Typography variant="caption" color="success.main">
                          +${property.facade.price.toLocaleString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '14px', bgcolor: 'secondary.main' }}>
                          {property.user?.firstName?.charAt(0) || property.client?.firstName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {property.user?.firstName || property.client?.firstName} {property.user?.lastName || property.client?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {property.user?.email || property.client?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={property.status || 'pending'}
                        color={getStatusColor(property.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        ${property.presalePrice?.toLocaleString() || property.price?.toLocaleString()}
                      </Typography>
                      {property.pending > 0 && (
                        <Typography variant="caption" color="warning.main" display="block">
                          Pending: ${property.pending?.toLocaleString()}
                        </Typography>
                      )}
                      {property.initialPayment > 0 && (
                        <Typography variant="caption" color="success.main" display="block">
                          Paid: ${property.initialPayment?.toLocaleString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewProperty(property)}
                        title="View details"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default Properties
