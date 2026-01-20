// import { Box, Paper, Typography, TextField, Button, InputAdornment, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem, Tabs, Tab } from '@mui/material'
// import { useProperty } from '../../context/PropertyContext'
// import { useAuth } from '../../context/AuthContext'
// import { useState } from 'react'
// import SendIcon from '@mui/icons-material/Send'
// import PersonAddIcon from '@mui/icons-material/PersonAdd'
// import api from '../../services/api'

// const PriceCalculator = () => {
//   const { financials, updateFinancials, selectedLot, selectedModel, selectedFacade } = useProperty()
//   const { isAuthenticated } = useAuth()
//   const [initialPaymentDate, setInitialPaymentDate] = useState('')
//   const [openAssignDialog, setOpenAssignDialog] = useState(false)
//   const [tabValue, setTabValue] = useState(0)
//   const [users, setUsers] = useState([])
//   const [selectedUser, setSelectedUser] = useState('')
  
//   // Form data for new user
//   const [newUserData, setNewUserData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     phoneNumber: '',
//     birthday: '',
//     role: 'user'
//   })

//   const handleDiscountPercentChange = (e) => {
//     const value = parseFloat(e.target.value) || 0
//     updateFinancials({ discountPercent: value })
//   }

//   const handleDownPaymentPercentChange = (e) => {
//     const value = parseFloat(e.target.value) || 0
//     updateFinancials({ downPaymentPercent: value })
//   }

//   const handleInitialDownPaymentPercentChange = (e) => {
//     const value = parseFloat(e.target.value) || 0
//     updateFinancials({ initialDownPaymentPercent: value })
//   }

//   const handleMonthlyPaymentPercentChange = (e) => {
//     const value = parseFloat(e.target.value) || 0
//     updateFinancials({ monthlyPaymentPercent: value })
//   }

//   const handleOpenAssignDialog = async () => {
//     if (!selectedLot || !selectedModel) {
//       alert('Tenga la bondad de completar su selección (Lote y Modelo)')
//       return
//     }

//     if (!isAuthenticated) {
//       alert('Por favor inicie sesión para asignar propiedades')
//       return
//     }

//     try {
//       // Fetch available users
//       const response = await api.get('/users?role=user')
//       setUsers(response.data)
//       setOpenAssignDialog(true)
//     } catch (error) {
//       console.error('Error fetching users:', error)
//       alert('Error loading users')
//     }
//   }

//   const handleCloseAssignDialog = () => {
//     setOpenAssignDialog(false)
//     setTabValue(0)
//     setSelectedUser('')
//     setNewUserData({
//       firstName: '',
//       lastName: '',
//       email: '',
//       password: '',
//       phoneNumber: '',
//       birthday: '',
//       role: 'user'
//     })
//   }

//   const handleAssignProperty = async () => {
//     try {
//       let userId = selectedUser
  
//       // If creating new user
//       if (tabValue === 1) {
//         const userResponse = await api.post('/auth/register', newUserData)
//         userId = userResponse.data.user._id || userResponse.data._id
//       }
  
//       if (!userId) {
//         alert('Please select or create a user')
//         return
//       }
  
//       // Create property
//       const propertyPayload = {
//         lot: selectedLot._id,
//         model: selectedModel._id,
//         facade: selectedFacade?._id || null,
//         user: userId,
//         client: userId, // ✅ Añadir también client si tu modelo lo requiere
//         listPrice: financials.listPrice,
//         presalePrice: financials.presalePrice,
//         discount: financials.discount,
//         discountPercent: financials.discountPercent,
//         totalDownPayment: financials.totalDownPayment,
//         downPaymentPercent: financials.downPaymentPercent,
//         initialPayment: 0, // ✅ Cambiar a 0 - El usuario aún no ha pagado
//         initialPaymentPercent: financials.initialDownPaymentPercent, // Guardar el % para referencia
//         monthlyPayment: financials.monthlyPayment,
//         monthlyPaymentPercent: financials.monthlyPaymentPercent,
//         mortgage: financials.mortgage,
//         pending: financials.presalePrice, // ✅ Todo está pendiente de pago
//         price: financials.presalePrice,
//         initialPaymentDate: initialPaymentDate || null,
//         status: 'pending' // ✅ Opcional: establecer status como pending
//       }
  
//       await api.post('/properties', propertyPayload)
      
//       handleCloseAssignDialog()
//       alert('Property assigned successfully!')
      
//       // Optionally refresh or navigate
//       // window.location.reload()
//     } catch (error) {
//       console.error('Error assigning property:', error)
//       alert(error.response?.data?.message || 'Error assigning property')
//     }
//   }

//   const handleSendQuote = () => {
//     if (!selectedLot || !selectedModel) {
//       alert('Tenga la bondad de completar su selección (Lote y Modelo)')
//       return
//     }

//     if (!isAuthenticated) {
//       alert('Por favor inicie sesión para enviar una cotización')
//       return
//     }

//     alert('¡Funcionalidad de cotización próximamente!')
//   }

//   return (
//     <>
//       <Paper 
//         elevation={2} 
//         sx={{ 
//           p: 3, 
//           bgcolor: '#fff', 
//           color: '#000',
//           borderRadius: 2,
//           border: '1px solid #e0e0e0'
//         }}
//       >
//         <Typography variant="overline" sx={{ color: '#666', fontWeight: 'bold', mb: 2, display: 'block', letterSpacing: 1 }}>
//           CALCULATOR
//         </Typography>

//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
//           {/* List Price - Calculated automatically */}
//           <CalcField 
//             label="List Price Phase I" 
//             value={financials.listPrice.toFixed(2)} 
//             disabled
//             prefix="$"
//             suffix="USD"
//           />

//           {/* Selection Summary */}
//           <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, fontSize: '0.75rem' }}>
//             <Typography variant="caption" display="block" color="text.secondary">
//               Lot: {selectedLot ? `#${selectedLot.number} - $${selectedLot.price?.toLocaleString()}` : 'Not selected'}
//             </Typography>
//             <Typography variant="caption" display="block" color="text.secondary">
//               Model: {selectedModel ? `${selectedModel.model} - $${selectedModel.price?.toLocaleString()}` : 'Not selected'}
//             </Typography>
//             <Typography variant="caption" display="block" color="text.secondary">
//               Facade: {selectedFacade 
//                 ? `${selectedFacade.title} - ${selectedFacade.price > 0 ? `+$${selectedFacade.price?.toLocaleString()}` : 'Included'}`
//                 : 'Not selected'}
//             </Typography>
//           </Box>

//           <Divider />

//           {/* Discount Section */}
//           <Box sx={{ display: 'flex', gap: 2 }}>
//             <Box sx={{ flex: 1 }}>
//               <CalcField 
//                 label="Discount" 
//                 value={financials.discountPercent} 
//                 onChange={handleDiscountPercentChange}
//                 suffix="%"
//               />
//             </Box>
//             <Box sx={{ flex: 1.5 }}>
//               <CalcField 
//                 label="Amount" 
//                 value={financials.discount.toFixed(2)} 
//                 disabled
//                 prefix="$"
//               />
//             </Box>
//           </Box>

//           <Divider />

//           {/* Presale Price Highlight */}
//           <Box sx={{ p: 2, bgcolor: '#f1f8e9', borderRadius: 2, border: '1px solid #dcedc8', textAlign: 'center' }}>
//             <Typography variant="caption" sx={{ color: '#558b2f', fontWeight: 'bold' }}>PRESALE PRICE TODAY</Typography>
//             <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
//               ${financials.presalePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
//             </Typography>
//           </Box>

//           <Divider />

//           {/* Down Payment Section */}
//           <Box sx={{ display: 'flex', gap: 2 }}>
//             <Box sx={{ flex: 1 }}>
//               <CalcField 
//                 label="Down Payment" 
//                 value={financials.downPaymentPercent} 
//                 onChange={handleDownPaymentPercentChange}
//                 suffix="%"
//               />
//             </Box>
//             <Box sx={{ flex: 1.5 }}>
//               <CalcField 
//                 label="Total DP" 
//                 value={financials.totalDownPayment.toFixed(2)} 
//                 disabled
//                 prefix="$"
//               />
//             </Box>
//           </Box>

//           {/* Initial DP and Date */}
//           <Box sx={{ display: 'flex', gap: 2 }}>
//             <Box sx={{ flex: 1 }}>
//               <CalcField 
//                 label="Initial DP" 
//                 value={financials.initialDownPaymentPercent} 
//                 onChange={handleInitialDownPaymentPercentChange}
//                 suffix="%"
//               />
//             </Box>
//             <Box sx={{ flex: 1.5 }}>
//               <Typography variant="caption" sx={{ color: '#666', mb: 0.5, display: 'block', fontWeight: 'bold' }}>
//                 Payment Date
//               </Typography>
//               <TextField
//                 fullWidth
//                 size="small"
//                 type="date"
//                 value={initialPaymentDate}
//                 onChange={(e) => setInitialPaymentDate(e.target.value)}
//                 InputLabelProps={{ shrink: true }}
//                 sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
//               />
//             </Box>
//           </Box>

//           <CalcField 
//             label="Initial Amount" 
//             value={financials.initialDownPayment.toFixed(2)} 
//             disabled
//             prefix="$"
//           />

//           <Divider />

//           {/* Monthly Payment and Mortgage */}
//           <Box sx={{ display: 'flex', gap: 2 }}>
//             <Box sx={{ flex: 1 }}>
//               <CalcField 
//                 label="Monthly %" 
//                 value={financials.monthlyPaymentPercent} 
//                 onChange={handleMonthlyPaymentPercentChange}
//                 suffix="%"
//               />
//             </Box>
//             <Box sx={{ flex: 1.5 }}>
//               <CalcField 
//                 label="Monthly Amount" 
//                 value={financials.monthlyPayment.toFixed(2)} 
//                 disabled
//                 prefix="$"
//               />
//             </Box>
//           </Box>

//           <CalcField 
//             label="Mortgage Remaining" 
//             value={financials.mortgage.toFixed(2)} 
//             disabled
//             prefix="$"
//           />

//           {/* Note */}
//           <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic', textAlign: 'center', mt: 1 }}>
//             * Every 10 houses sold, the discount is reduced by 2%
//           </Typography>

//           {/* Action Buttons */}
//           <Button
//             variant="outlined"
//             fullWidth
//             onClick={handleOpenAssignDialog}
//             startIcon={<PersonAddIcon />}
//             disabled={!selectedLot || !selectedModel}
//             sx={{
//               borderColor: '#4a7c59',
//               color: '#4a7c59',
//               py: 1.5,
//               borderRadius: 3,
//               fontWeight: 'bold',
//               textTransform: 'none',
//               fontSize: '1rem',
//               '&:hover': {
//                 borderColor: '#3d664a',
//                 bgcolor: 'rgba(74, 124, 89, 0.04)'
//               },
//               '&:disabled': {
//                 borderColor: '#ccc',
//                 color: '#999'
//               }
//             }}
//           >
//             Assign to Resident
//           </Button>

//           <Button
//             variant="contained"
//             fullWidth
//             onClick={handleSendQuote}
//             startIcon={<SendIcon />}
//             disabled={!selectedLot || !selectedModel}
//             sx={{
//               bgcolor: '#4a7c59',
//               color: '#fff',
//               py: 1.5,
//               borderRadius: 3,
//               fontWeight: 'bold',
//               textTransform: 'none',
//               fontSize: '1rem',
//               boxShadow: '0 4px 12px rgba(74, 124, 89, 0.3)',
//               '&:hover': {
//                 bgcolor: '#3d664a',
//                 boxShadow: '0 6px 16px rgba(74, 124, 89, 0.4)'
//               },
//               '&:disabled': {
//                 bgcolor: '#ccc',
//                 color: '#666'
//               }
//             }}
//           >
//             Generate & Send Quote
//           </Button>
//         </Box>
//       </Paper>

//       {/* Assign Property Dialog */}
//       <Dialog open={openAssignDialog} onClose={handleCloseAssignDialog} maxWidth="md" fullWidth>
//         <DialogTitle>Assign Property to Resident</DialogTitle>
//         <DialogContent>
//           <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
//             <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
//               <Tab label="Select Existing User" />
//               <Tab label="Create New User" />
//             </Tabs>
//           </Box>

//           {tabValue === 0 ? (
//             // Select Existing User Tab
//             <Box sx={{ mt: 2 }}>
//               <TextField
//                 fullWidth
//                 select
//                 label="Select Resident"
//                 value={selectedUser}
//                 onChange={(e) => setSelectedUser(e.target.value)}
//                 helperText="Choose an existing resident to assign this property"
//               >
//                 {users.map((user) => (
//                   <MenuItem key={user._id} value={user._id}>
//                     {user.firstName} {user.lastName} - {user.email}
//                   </MenuItem>
//                 ))}
//               </TextField>

//               {/* Property Summary */}
//               <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
//                 <Typography variant="subtitle2" fontWeight="bold" mb={1}>
//                   Property Summary
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Lot: {selectedLot?.number}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Model: {selectedModel?.model}
//                 </Typography>
//                 {selectedFacade && (
//                   <Typography variant="body2" color="text.secondary">
//                     Facade: {selectedFacade.title}
//                   </Typography>
//                 )}
//                 <Divider sx={{ my: 1 }} />
//                 <Typography variant="body2" color="primary" fontWeight="bold">
//                   Total Price: ${financials.presalePrice.toLocaleString()}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Initial Payment: ${financials.initialDownPayment.toLocaleString()}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Mortgage: ${financials.mortgage.toLocaleString()}
//                 </Typography>
//               </Paper>
//             </Box>
//           ) : (
//             // Create New User Tab
//             <Grid container spacing={2} sx={{ mt: 1 }}>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="First Name"
//                   value={newUserData.firstName}
//                   onChange={(e) => setNewUserData({ ...newUserData, firstName: e.target.value })}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Last Name"
//                   value={newUserData.lastName}
//                   onChange={(e) => setNewUserData({ ...newUserData, lastName: e.target.value })}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   type="email"
//                   label="Email"
//                   value={newUserData.email}
//                   onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   type="password"
//                   label="Password"
//                   value={newUserData.password}
//                   onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Phone Number"
//                   value={newUserData.phoneNumber}
//                   onChange={(e) => setNewUserData({ ...newUserData, phoneNumber: e.target.value })}
//                   placeholder="(555) 123-4567"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   type="date"
//                   label="Birthday"
//                   value={newUserData.birthday}
//                   onChange={(e) => setNewUserData({ ...newUserData, birthday: e.target.value })}
//                   InputLabelProps={{ shrink: true }}
//                 />
//               </Grid>

//               {/* Property Summary */}
//               <Grid item xs={12}>
//                 <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
//                   <Typography variant="subtitle2" fontWeight="bold" mb={1}>
//                     Property to Assign
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     Lot: {selectedLot?.number} | Model: {selectedModel?.model}
//                   </Typography>
//                   <Typography variant="body2" color="primary" fontWeight="bold">
//                     Total: ${financials.presalePrice.toLocaleString()}
//                   </Typography>
//                 </Paper>
//               </Grid>
//             </Grid>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseAssignDialog}>Cancel</Button>
//           <Button 
//             onClick={handleAssignProperty} 
//             variant="contained"
//             disabled={
//               tabValue === 0 
//                 ? !selectedUser 
//                 : !newUserData.firstName || !newUserData.lastName || !newUserData.email || !newUserData.password
//             }
//           >
//             Assign Property
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   )
// }

// const CalcField = ({ label, value, onChange, prefix, suffix, disabled = false }) => (
//   <Box>
//     <Typography variant="caption" sx={{ color: '#666', mb: 0.5, display: 'block', fontWeight: 'bold' }}>
//       {label}
//     </Typography>
//     <TextField
//       fullWidth
//       size="small"
//       type={disabled ? "text" : "number"}
//       value={value}
//       onChange={onChange}
//       disabled={disabled}
//       InputProps={{
//         startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : null,
//         endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : null,
//         sx: { borderRadius: 2, bgcolor: disabled ? '#f9f9f9' : '#fff' }
//       }}
//     />
//   </Box>
// )

// export default PriceCalculator

import { Box, Paper, Typography, TextField, Button, InputAdornment, Divider } from '@mui/material'
import { useProperty } from '../../context/PropertyContext'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import SendIcon from '@mui/icons-material/Send'
import HomeIcon from '@mui/icons-material/Home'

const PriceCalculator = ({ onCreatePropertyClick }) => {
  const { financials, updateFinancials, selectedLot, selectedModel, selectedFacade } = useProperty()
  const { isAuthenticated } = useAuth()
  const [initialPaymentDate, setInitialPaymentDate] = useState('')

  const handleDiscountPercentChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    updateFinancials({ discountPercent: value })
  }

  const handleDownPaymentPercentChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    updateFinancials({ downPaymentPercent: value })
  }

  const handleInitialDownPaymentPercentChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    updateFinancials({ initialDownPaymentPercent: value })
  }

  const handleMonthlyPaymentPercentChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    updateFinancials({ monthlyPaymentPercent: value })
  }

  const handleCreateProperty = () => {
    if (!selectedLot || !selectedModel) {
      alert('Please complete your selection (Lot and Model)')
      return
    }

    if (!isAuthenticated) {
      alert('Please log in to create properties')
      return
    }

    // Trigger parent callback to expand ResidentAssignment
    onCreatePropertyClick()
  }

  const handleSendQuote = () => {
    if (!selectedLot || !selectedModel) {
      alert('Please complete your selection (Lot and Model)')
      return
    }

    if (!isAuthenticated) {
      alert('Please log in to send quotes')
      return
    }

    alert('Quote functionality coming soon!')
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        bgcolor: '#fff', 
        color: '#000',
        borderRadius: 2,
        border: '1px solid #e0e0e0'
      }}
    >
      <Typography variant="overline" sx={{ color: '#666', fontWeight: 'bold', mb: 2, display: 'block', letterSpacing: 1 }}>
        CALCULATOR
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* List Price - Calculated automatically */}
        <CalcField 
          label="List Price Phase I" 
          value={financials.listPrice.toFixed(2)} 
          disabled
          prefix="$"
          suffix="USD"
        />

        {/* Selection Summary */}
        <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, fontSize: '0.75rem' }}>
          <Typography variant="caption" display="block" color="text.secondary">
            Lot: {selectedLot ? `#${selectedLot.number} - $${selectedLot.price?.toLocaleString()}` : 'Not selected'}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Model: {selectedModel ? `${selectedModel.model} - $${selectedModel.price?.toLocaleString()}` : 'Not selected'}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Facade: {selectedFacade 
              ? `${selectedFacade.title} - ${selectedFacade.price > 0 ? `+$${selectedFacade.price?.toLocaleString()}` : 'Included'}`
              : 'Not selected'}
          </Typography>
        </Box>

        <Divider />

        {/* Discount Section */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <CalcField 
              label="Discount" 
              value={financials.discountPercent} 
              onChange={handleDiscountPercentChange}
              suffix="%"
            />
          </Box>
          <Box sx={{ flex: 1.5 }}>
            <CalcField 
              label="Amount" 
              value={financials.discount.toFixed(2)} 
              disabled
              prefix="$"
            />
          </Box>
        </Box>

        <Divider />

        {/* Presale Price Highlight */}
        <Box sx={{ p: 2, bgcolor: '#f1f8e9', borderRadius: 2, border: '1px solid #dcedc8', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#558b2f', fontWeight: 'bold' }}>PRESALE PRICE TODAY</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            ${financials.presalePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Box>

        <Divider />

        {/* Down Payment Section */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <CalcField 
              label="Down Payment" 
              value={financials.downPaymentPercent} 
              onChange={handleDownPaymentPercentChange}
              suffix="%"
            />
          </Box>
          <Box sx={{ flex: 1.5 }}>
            <CalcField 
              label="Total DP" 
              value={financials.totalDownPayment.toFixed(2)} 
              disabled
              prefix="$"
            />
          </Box>
        </Box>

        {/* Initial DP and Date */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <CalcField 
              label="Initial DP" 
              value={financials.initialDownPaymentPercent} 
              onChange={handleInitialDownPaymentPercentChange}
              suffix="%"
            />
          </Box>
          <Box sx={{ flex: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#666', mb: 0.5, display: 'block', fontWeight: 'bold' }}>
              Payment Date
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={initialPaymentDate}
              onChange={(e) => setInitialPaymentDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
        </Box>

        <CalcField 
          label="Initial Amount" 
          value={financials.initialDownPayment.toFixed(2)} 
          disabled
          prefix="$"
        />

        <Divider />

        {/* Monthly Payment and Mortgage */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <CalcField 
              label="Monthly %" 
              value={financials.monthlyPaymentPercent} 
              onChange={handleMonthlyPaymentPercentChange}
              suffix="%"
            />
          </Box>
          <Box sx={{ flex: 1.5 }}>
            <CalcField 
              label="Monthly Amount" 
              value={financials.monthlyPayment.toFixed(2)} 
              disabled
              prefix="$"
            />
          </Box>
        </Box>

        <CalcField 
          label="Mortgage Remaining" 
          value={financials.mortgage.toFixed(2)} 
          disabled
          prefix="$"
        />

        {/* Note */}
        <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic', textAlign: 'center', mt: 1 }}>
          * Every 10 houses sold, the discount is reduced by 2%
        </Typography>

        {/* Action Buttons */}
        <Button
          variant="outlined"
          fullWidth
          onClick={handleCreateProperty}
          startIcon={<HomeIcon />}
          disabled={!selectedLot || !selectedModel}
          sx={{
            borderColor: '#4a7c59',
            color: '#4a7c59',
            py: 1.5,
            borderRadius: 3,
            fontWeight: 'bold',
            textTransform: 'none',
            fontSize: '1rem',
            '&:hover': {
              borderColor: '#3d664a',
              bgcolor: 'rgba(74, 124, 89, 0.04)'
            },
            '&:disabled': {
              borderColor: '#ccc',
              color: '#999'
            }
          }}
        >
          Create Property
        </Button>

        <Button
          variant="contained"
          fullWidth
          onClick={handleSendQuote}
          startIcon={<SendIcon />}
          disabled={!selectedLot || !selectedModel}
          sx={{
            bgcolor: '#4a7c59',
            color: '#fff',
            py: 1.5,
            borderRadius: 3,
            fontWeight: 'bold',
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(74, 124, 89, 0.3)',
            '&:hover': {
              bgcolor: '#3d664a',
              boxShadow: '0 6px 16px rgba(74, 124, 89, 0.4)'
            },
            '&:disabled': {
              bgcolor: '#ccc',
              color: '#666'
            }
          }}
        >
          Generate & Send Quote
        </Button>
      </Box>
    </Paper>
  )
}

const CalcField = ({ label, value, onChange, prefix, suffix, disabled = false }) => (
  <Box>
    <Typography variant="caption" sx={{ color: '#666', mb: 0.5, display: 'block', fontWeight: 'bold' }}>
      {label}
    </Typography>
    <TextField
      fullWidth
      size="small"
      type={disabled ? "text" : "number"}
      value={value}
      onChange={onChange}
      disabled={disabled}
      InputProps={{
        startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : null,
        endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : null,
        sx: { borderRadius: 2, bgcolor: disabled ? '#f9f9f9' : '#fff' }
      }}
    />
  </Box>
)

export default PriceCalculator