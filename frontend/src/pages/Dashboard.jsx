// import { useState, useEffect } from 'react'
// import {
//   Grid,
//   Paper,
//   Typography,
//   Card,
//   CardContent,
//   Box,
//   Avatar,
//   Chip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   MenuItem,
//   Button,
//   CircularProgress
// } from '@mui/material'
// import {
//   HomeWork,
//   TrendingUp,
//   AttachMoney,
//   Inbox
// } from '@mui/icons-material'
// import { useAuth } from '../context/AuthContext'
// import api from '../services/api'
// import { useNavigate } from 'react-router-dom'
// import DashboardMap from '../components/DashboardMap'

// const Dashboard = () => {
//   const { user } = useAuth()
//   const navigate = useNavigate()
//   const [stats, setStats] = useState({
//     totalLots: 0,
//     availableLots: 0,
//     holdLots: 0,
//     soldLots: 0,
//     occupancyRate: 0,
//     soldDifference: 0,
//     soldPercentageChange: 0,
//     currentMonthRevenue: 0,
//     revenuePercentageChange: 0
//   })
//   const [loading, setLoading] = useState(true)

//   // Estados para modal de User
//   const [openUserDialog, setOpenUserDialog] = useState(false)
//   const [userFormData, setUserFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     phoneNumber: '',
//     birthday: '',
//     role: 'user'
//   })

//   useEffect(() => {
//     fetchStats()
//   }, [user])

//   // const fetchStats = async () => {
//   //   setLoading(true)
//   //   try {
//   //     console.log('Fetching lots...')
      
//   //     // Obtener todos los lotes (igual que PropertyStats)
//   //     const lotsResponse = await api.get('/lots')
//   //     console.log('Lots response:', lotsResponse.data)
      
//   //     const lots = Array.isArray(lotsResponse.data) ? lotsResponse.data : []

//   //     // Calcular conteos (EXACTAMENTE como PropertyStats)
//   //     const totalLots = lots.length
//   //     const availableLots = lots.filter(lot => lot.status === 'available').length
//   //     const holdLots = lots.filter(lot => lot.status === 'pending').length
//   //     const soldLots = lots.filter(lot => lot.status === 'sold').length

//   //     console.log('Lot counts:', { totalLots, availableLots, holdLots, soldLots })

//   //     // Calcular occupancy rate (vendidos / total)
//   //     const occupancyRate = totalLots > 0 ? ((soldLots / totalLots) * 100).toFixed(1) : 0

//   //     // Calcular comparativa mes actual vs mes anterior
//   //     const currentDate = new Date()
//   //     const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
//   //     const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
//   //     const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

//   //     // Filtrar lotes vendidos con fecha
//   //     const soldLotsWithDates = lots.filter(lot => lot.status === 'sold' && lot.updatedAt)
      
//   //     const currentMonthSold = soldLotsWithDates.filter(lot => {
//   //       const lotDate = new Date(lot.updatedAt)
//   //       return lotDate >= currentMonthStart
//   //     }).length

//   //     const lastMonthSold = soldLotsWithDates.filter(lot => {
//   //       const lotDate = new Date(lot.updatedAt)
//   //       return lotDate >= lastMonthStart && lotDate < lastMonthEnd
//   //     }).length

//   //     const soldDifference = currentMonthSold - lastMonthSold
//   //     const soldPercentageChange = lastMonthSold > 0 
//   //       ? (((currentMonthSold - lastMonthSold) / lastMonthSold) * 100).toFixed(1)
//   //       : currentMonthSold > 0 ? 100 : 0

//   //     // Calcular revenue del mes actual
//   //     const currentMonthRevenue = soldLotsWithDates
//   //       .filter(lot => {
//   //         const lotDate = new Date(lot.updatedAt)
//   //         return lotDate >= currentMonthStart
//   //       })
//   //       .reduce((sum, lot) => sum + (lot.totalPrice || 0), 0)

//   //     const lastMonthRevenue = soldLotsWithDates
//   //       .filter(lot => {
//   //         const lotDate = new Date(lot.updatedAt)
//   //         return lotDate >= lastMonthStart && lotDate < lastMonthEnd
//   //       })
//   //       .reduce((sum, lot) => sum + (lot.totalPrice || 0), 0)

//   //     const revenuePercentageChange = lastMonthRevenue > 0
//   //       ? (((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
//   //       : currentMonthRevenue > 0 ? 100 : 0

//   //     const newStats = {
//   //       totalLots,
//   //       availableLots,
//   //       holdLots,
//   //       soldLots,
//   //       occupancyRate: parseFloat(occupancyRate),
//   //       soldDifference,
//   //       soldPercentageChange: parseFloat(soldPercentageChange),
//   //       currentMonthRevenue,
//   //       revenuePercentageChange: parseFloat(revenuePercentageChange)
//   //     }

//   //     console.log('Final stats:', newStats)
//   //     setStats(newStats)
//   //   } catch (error) {
//   //     console.error('Error fetching stats:', error)
//   //   } finally {
//   //     setLoading(false)
//   //   }
//   // }

//   const fetchStats = async () => {
//   setLoading(true)
//   try {
//     console.log('Fetching lots...')
    
//     // Obtener todos los lotes
//     const lotsResponse = await api.get('/lots')
//     console.log('Lots response:', lotsResponse.data)
    
//     const lots = Array.isArray(lotsResponse.data) ? lotsResponse.data : []

//     // Calcular conteos
//     const totalLots = lots.length
//     const availableLots = lots.filter(lot => lot.status === 'available').length
//     const holdLots = lots.filter(lot => lot.status === 'pending').length
//     const soldLots = lots.filter(lot => lot.status === 'sold').length

//     console.log('Lot counts:', { totalLots, availableLots, holdLots, soldLots })

//     // Calcular occupancy rate
//     const occupancyRate = totalLots > 0 ? ((soldLots / totalLots) * 100).toFixed(1) : 0

//     // Calcular comparativa mes actual vs mes anterior
//     const currentDate = new Date()
//     const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
//     const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
//     const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

//     console.log('Date ranges:', {
//       currentMonthStart,
//       lastMonthStart,
//       lastMonthEnd
//     })

//     // Filtrar lotes vendidos con fecha
//     const soldLotsWithDates = lots.filter(lot => lot.status === 'sold' && lot.updatedAt)
    
//     console.log('Sold lots with dates:', soldLotsWithDates)
//     console.log('Sample sold lot:', soldLotsWithDates[0])

//     const currentMonthSold = soldLotsWithDates.filter(lot => {
//       const lotDate = new Date(lot.updatedAt)
//       return lotDate >= currentMonthStart
//     }).length

//     const lastMonthSold = soldLotsWithDates.filter(lot => {
//       const lotDate = new Date(lot.updatedAt)
//       return lotDate >= lastMonthStart && lotDate < lastMonthEnd
//     }).length

//     const soldDifference = currentMonthSold - lastMonthSold
//     const soldPercentageChange = lastMonthSold > 0 
//       ? (((currentMonthSold - lastMonthSold) / lastMonthSold) * 100).toFixed(1)
//       : currentMonthSold > 0 ? 100 : 0

//     // Calcular revenue del mes actual
//     const currentMonthRevenueLots = soldLotsWithDates.filter(lot => {
//       const lotDate = new Date(lot.updatedAt)
//       return lotDate >= currentMonthStart
//     })

//     console.log('Current month revenue lots:', currentMonthRevenueLots)
//     console.log('Total prices:', currentMonthRevenueLots.map(lot => ({
//       lotNumber: lot.lotNumber,
//       totalPrice: lot.totalPrice,
//       price: lot.price,
//       basePrice: lot.basePrice
//     })))

//     const currentMonthRevenue = currentMonthRevenueLots.reduce((sum, lot) => {
//       const price = lot.totalPrice || lot.price || lot.basePrice || 0
//       console.log(`Lot ${lot.lotNumber} price:`, price)
//       return sum + price
//     }, 0)

//     const lastMonthRevenue = soldLotsWithDates
//       .filter(lot => {
//         const lotDate = new Date(lot.updatedAt)
//         return lotDate >= lastMonthStart && lotDate < lastMonthEnd
//       })
//       .reduce((sum, lot) => sum + (lot.totalPrice || lot.price || lot.basePrice || 0), 0)

//     console.log('Current month revenue:', currentMonthRevenue)
//     console.log('Last month revenue:', lastMonthRevenue)

//     const revenuePercentageChange = lastMonthRevenue > 0
//       ? (((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
//       : currentMonthRevenue > 0 ? 100 : 0

//     const newStats = {
//       totalLots,
//       availableLots,
//       holdLots,
//       soldLots,
//       occupancyRate: parseFloat(occupancyRate),
//       soldDifference,
//       soldPercentageChange: parseFloat(soldPercentageChange),
//       currentMonthRevenue,
//       revenuePercentageChange: parseFloat(revenuePercentageChange)
//     }

//     console.log('Final stats:', newStats)
//     setStats(newStats)
//   } catch (error) {
//     console.error('Error fetching stats:', error)
//   } finally {
//     setLoading(false)
//   }
// }

//   // Handlers para User Dialog
//   const handleOpenUserDialog = () => {
//     setUserFormData({
//       firstName: '',
//       lastName: '',
//       email: '',
//       password: '',
//       phoneNumber: '',
//       birthday: '',
//       role: 'user'
//     })
//     setOpenUserDialog(true)
//   }

//   const handleCloseUserDialog = () => {
//     setOpenUserDialog(false)
//   }

//   const handleSubmitUser = async () => {
//     try {
//       await api.post('/auth/register', userFormData)
//       handleCloseUserDialog()
//       alert('User invited successfully!')
//     } catch (error) {
//       console.error('Error inviting user:', error)
//       alert(error.response?.data?.message || 'Error inviting user')
//     }
//   }

//   const quickActions = [
//     { 
//       icon: '🏠', 
//       label: 'Add Property', 
//       color: '#3b82f6',
//       onClick: () => navigate('/properties/select')
//     },
//     { 
//       icon: '👥', 
//       label: 'Invite User', 
//       color: '#10b981',
//       onClick: handleOpenUserDialog
//     },
//     { 
//       icon: '📊', 
//       label: 'Analytics', 
//       color: '#8b5cf6',
//       onClick: () => navigate('/analytics')
//     },
//     { 
//       icon: '📅', 
//       label: 'Schedule', 
//       color: '#f59e0b',
//       onClick: () => navigate('/schedule')
//     }
//   ]

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
//         <CircularProgress />
//       </Box>
//     )
//   }

//   return (
//     <Box>
//       <Typography variant="h4" gutterBottom fontWeight="bold">
//         Good Morning, {user?.firstName}
//       </Typography>
//       <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
//         Here's what's happening at the lake today.
//       </Typography>

//       <Grid container spacing={3}>
//         {/* Stats Cards */}
        
//         {/* Lots Listed / Sold - SIN "+2 this week" */}
//         <Grid item xs={12} sm={6} md={3}>
//           <Card className="hover:shadow-lg transition-shadow">
//             <CardContent>
//               <Box display="flex" alignItems="center" justifyContent="space-between">
//                 <Box>
//                   <Typography color="text.secondary" variant="body2">
//                     Lots Listed / Sold
//                   </Typography>
//                   <Typography variant="h4" fontWeight="bold">
//                     {stats.totalLots} / {stats.soldLots}
//                   </Typography>
//                   {stats.soldDifference !== 0 && (
//                     <Typography 
//                       variant="caption" 
//                       color={stats.soldDifference >= 0 ? 'success.main' : 'error.main'}
//                     >
//                       {stats.soldDifference >= 0 ? '+' : ''}{stats.soldDifference} this month
//                       {stats.soldPercentageChange !== 0 && stats.soldPercentageChange !== 100 && (
//                         <> ({stats.soldPercentageChange >= 0 ? '+' : ''}{stats.soldPercentageChange}%)</>
//                       )}
//                     </Typography>
//                   )}
//                   {stats.soldDifference === 0 && (
//                     <Typography variant="caption" color="text.secondary">
//                       No change this month
//                     </Typography>
//                   )}
//                 </Box>
//                 <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
//                   <HomeWork />
//                 </Avatar>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Monthly Revenue */}
//         <Grid item xs={12} sm={6} md={3}>
//           <Card className="hover:shadow-lg transition-shadow">
//             <CardContent>
//               <Box display="flex" alignItems="center" justifyContent="space-between">
//                 <Box>
//                   <Typography color="text.secondary" variant="body2">
//                     Monthly Revenue
//                   </Typography>
//                   <Typography variant="h4" fontWeight="bold">
//                     ${(stats.currentMonthRevenue / 1000000).toFixed(1)}M
//                   </Typography>
//                   {stats.revenuePercentageChange !== 0 && (
//                     <Typography 
//                       variant="caption" 
//                       color={stats.revenuePercentageChange >= 0 ? 'success.main' : 'error.main'}
//                     >
//                       {stats.revenuePercentageChange >= 0 ? '+' : ''}{stats.revenuePercentageChange}% vs last month
//                     </Typography>
//                   )}
//                   {stats.revenuePercentageChange === 0 && (
//                     <Typography variant="caption" color="text.secondary">
//                       No change vs last month
//                     </Typography>
//                   )}
//                 </Box>
//                 <Avatar sx={{ bgcolor: '#f59e0b', width: 56, height: 56 }}>
//                   <AttachMoney />
//                 </Avatar>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Lots on Hold - SOLO status "hold" */}
//         <Grid item xs={12} sm={6} md={3}>
//           <Card className="hover:shadow-lg transition-shadow">
//             <CardContent>
//               <Box display="flex" alignItems="center" justifyContent="space-between">
//                 <Box>
//                   <Typography color="text.secondary" variant="body2">
//                     Lots on Hold
//                   </Typography>
//                   <Typography variant="h4" fontWeight="bold">
//                     {stats.holdLots}
//                   </Typography>
//                   <Typography variant="caption" color="primary.main">
//                     {stats.totalLots > 0 
//                       ? `${((stats.holdLots / stats.totalLots) * 100).toFixed(1)}% of total inventory`
//                       : '0% of total inventory'
//                     }
//                   </Typography>
//                 </Box>
//                 <Avatar sx={{ bgcolor: '#2196f3', width: 56, height: 56 }}>
//                   <Inbox />
//                 </Avatar>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Occupancy Rate - vendidos / total */}
//         <Grid item xs={12} sm={6} md={3}>
//           <Card className="hover:shadow-lg transition-shadow">
//             <CardContent>
//               <Box display="flex" alignItems="center" justifyContent="space-between">
//                 <Box>
//                   <Typography color="text.secondary" variant="body2">
//                     Occupancy Rate
//                   </Typography>
//                   <Typography variant="h4" fontWeight="bold">
//                     {stats.occupancyRate}%
//                   </Typography>
//                   <Typography 
//                     variant="caption" 
//                     color="text.secondary"
//                   >
//                     {stats.soldLots} of {stats.totalLots} sold
//                   </Typography>
//                 </Box>
//                 <Avatar sx={{ 
//                   bgcolor: stats.occupancyRate >= 50 ? 'success.main' : 'info.main', 
//                   width: 56, 
//                   height: 56 
//                 }}>
//                   <TrendingUp />
//                 </Avatar>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Map Section */}
//         <Grid item xs={12} md={8}>
//           <Paper sx={{ p: 1 }}>
//             <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//               <Typography variant="h6" fontWeight="bold">
//                 Property Map
//               </Typography>
//               <Typography 
//                 variant="body2" 
//                 color="primary" 
//                 sx={{ cursor: 'pointer' }}
//                 onClick={() => navigate('/property-selection')}
//               >
//                 View Full Map
//               </Typography>
//             </Box>
//             <DashboardMap />
//           </Paper>
//         </Grid>

//         {/* Quick Actions */}
//         <Grid item xs={12} md={4}>
//           <Paper sx={{ p: 3, height: '100%' }}>
//             <Typography variant="h6" gutterBottom fontWeight="bold">
//               Quick Actions
//             </Typography>
//             <Box sx={{ mt: 2 }}>
//               {quickActions.map((action, index) => (
//                 <Box
//                   key={index}
//                   onClick={action.onClick}
//                   className="cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
//                   sx={{ 
//                     p: 2, 
//                     mb: 1, 
//                     border: '1px solid #e5e7eb',
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: 2,
//                     cursor: 'pointer',
//                     '&:hover': {
//                       bgcolor: '#f9fafb',
//                       transform: 'translateY(-2px)',
//                       boxShadow: 1
//                     },
//                     transition: 'all 0.2s ease'
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       width: 40,
//                       height: 40,
//                       borderRadius: '8px',
//                       bgcolor: action.color + '20',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       fontSize: '20px'
//                     }}
//                   >
//                     {action.icon}
//                   </Box>
//                   <Typography variant="body1">{action.label}</Typography>
//                 </Box>
//               ))}
//             </Box>
//           </Paper>
//         </Grid>

//         {/* Recent Properties */}
//         <Grid item xs={12} md={8}>
//           <Paper sx={{ p: 3 }}>
//             <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//               <Typography variant="h6" fontWeight="bold">
//                 Recent Properties
//               </Typography>
//               <Typography 
//                 variant="body2" 
//                 color="primary" 
//                 sx={{ cursor: 'pointer' }}
//                 onClick={() => navigate('/properties')}
//               >
//                 View all
//               </Typography>
//             </Box>
//             <Box sx={{ mt: 2 }}>
//               {[
//                 { id: 104, name: 'Lakeview Dr', type: 'Waterfront Estate', status: 'Active', price: '$1,250,000', agent: 'Sarah Jenkins' },
//                 { id: 22, name: 'Oakwood Ln', type: 'Single Family', status: 'Pending', price: '$850,000', agent: 'Mike Ross' },
//                 { id: 88, name: 'Pine Ridge', type: 'Condo', status: 'Active', price: '$420,000', agent: 'Sarah Jenkins' }
//               ].map((property) => (
//                 <Box
//                   key={property.id}
//                   sx={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'space-between',
//                     py: 2,
//                     borderBottom: '1px solid #eee'
//                   }}
//                 >
//                   <Box display="flex" alignItems="center" gap={2}>
//                     <Avatar sx={{ bgcolor: 'primary.light' }}>L</Avatar>
//                     <Box>
//                       <Typography variant="body1" fontWeight="500">
//                         {property.id} {property.name}
//                       </Typography>
//                       <Typography variant="caption" color="text.secondary">
//                         {property.type} • {property.agent}
//                       </Typography>
//                     </Box>
//                   </Box>
//                   <Box textAlign="right">
//                     <Typography variant="body1" fontWeight="600">
//                       {property.price}
//                     </Typography>
//                     <Chip
//                       label={property.status}
//                       color={property.status === 'Active' ? 'success' : 'warning'}
//                       size="small"
//                     />
//                   </Box>
//                 </Box>
//               ))}
//             </Box>
//           </Paper>
//         </Grid>

//         {/* Recent Activity */}
//         <Grid item xs={12} md={4}>
//           <Paper sx={{ p: 3 }}>
//             <Typography variant="h6" gutterBottom fontWeight="bold">
//               Recent Activity
//             </Typography>
//             <Box sx={{ mt: 2 }}>
//               {[
//                 { text: 'New showing booked', detail: '104 Lakeview Dr', time: '2 mins ago', color: 'success.main' },
//                 { text: 'Maintenance request', detail: 'Clubhouse HVAC', time: '1 hour ago', color: 'warning.main' },
//                 { text: 'New document uploaded', detail: 'Lease agreement #442', time: '3 hours ago', color: 'info.main' }
//               ].map((activity, index) => (
//                 <Box key={index} sx={{ mb: 2 }}>
//                   <Box display="flex" alignItems="center" gap={1}>
//                     <Box
//                       sx={{
//                         width: 8,
//                         height: 8,
//                         borderRadius: '50%',
//                         bgcolor: activity.color
//                       }}
//                     />
//                     <Typography variant="body2" fontWeight="500">
//                       {activity.text}
//                     </Typography>
//                   </Box>
//                   <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
//                     {activity.detail} • {activity.time}
//                   </Typography>
//                 </Box>
//               ))}
//             </Box>
//             <Typography 
//               variant="body2" 
//               color="primary" 
//               sx={{ cursor: 'pointer', mt: 2, textAlign: 'center' }}
//             >
//               VIEW FULL HISTORY
//             </Typography>
//           </Paper>
//         </Grid>
//       </Grid>

//       {/* Invite User Dialog */}
//       <Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="md" fullWidth>
//         <DialogTitle>Invite New User</DialogTitle>
//         <DialogContent>
//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label="First Name"
//                 value={userFormData.firstName}
//                 onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
//                 required
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label="Last Name"
//                 value={userFormData.lastName}
//                 onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
//                 required
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 type="email"
//                 label="Email"
//                 value={userFormData.email}
//                 onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
//                 required
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 type="password"
//                 label="Password"
//                 value={userFormData.password}
//                 onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
//                 required
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label="Phone Number"
//                 value={userFormData.phoneNumber}
//                 onChange={(e) => setUserFormData({ ...userFormData, phoneNumber: e.target.value })}
//                 placeholder="(555) 123-4567"
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 type="date"
//                 label="Birthday"
//                 value={userFormData.birthday}
//                 onChange={(e) => setUserFormData({ ...userFormData, birthday: e.target.value })}
//                 InputLabelProps={{ shrink: true }}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 select
//                 label="Role"
//                 value={userFormData.role}
//                 onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
//               >
//                 <MenuItem value="user">User</MenuItem>
//                 <MenuItem value="admin">Admin</MenuItem>
//                 <MenuItem value="superadmin">Super Admin</MenuItem>
//               </TextField>
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseUserDialog}>Cancel</Button>
//           <Button 
//             onClick={handleSubmitUser} 
//             variant="contained"
//             disabled={!userFormData.firstName || !userFormData.lastName || !userFormData.email || !userFormData.password}
//           >
//             Invite User
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   )
// }

// export default Dashboard

// Agregar import de PhoneInput al inicio
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

import { useState, useEffect } from 'react'
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  HomeWork,
  TrendingUp,
  AttachMoney,
  Inbox
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import DashboardMap from '../components/DashboardMap'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalLots: 0,
    availableLots: 0,
    holdLots: 0,
    soldLots: 0,
    occupancyRate: 0,
    soldDifference: 0,
    soldPercentageChange: 0,
    currentMonthRevenue: 0,
    revenuePercentageChange: 0
  })
  const [recentPayloads, setRecentPayloads] = useState([])
  const [loading, setLoading] = useState(true)

  // Estados para modal de User
  const [openUserDialog, setOpenUserDialog] = useState(false)
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    birthday: '',
    role: 'user'
  })

  useEffect(() => {
    fetchStats()
    fetchRecentPayloads()
  }, [user])

  const fetchStats = async () => {
    setLoading(true)
    try {
      console.log('Fetching lots...')
      
      const lotsResponse = await api.get('/lots')
      console.log('Lots response:', lotsResponse.data)
      
      const lots = Array.isArray(lotsResponse.data) ? lotsResponse.data : []

      const totalLots = lots.length
      const availableLots = lots.filter(lot => lot.status === 'available').length
      const holdLots = lots.filter(lot => lot.status === 'pending').length
      const soldLots = lots.filter(lot => lot.status === 'sold').length

      console.log('Lot counts:', { totalLots, availableLots, holdLots, soldLots })

      const occupancyRate = totalLots > 0 ? ((soldLots / totalLots) * 100).toFixed(1) : 0

      const currentDate = new Date()
      const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

      const soldLotsWithDates = lots.filter(lot => lot.status === 'sold' && lot.updatedAt)
      
      const currentMonthSold = soldLotsWithDates.filter(lot => {
        const lotDate = new Date(lot.updatedAt)
        return lotDate >= currentMonthStart
      }).length

      const lastMonthSold = soldLotsWithDates.filter(lot => {
        const lotDate = new Date(lot.updatedAt)
        return lotDate >= lastMonthStart && lotDate < lastMonthEnd
      }).length

      const soldDifference = currentMonthSold - lastMonthSold
      const soldPercentageChange = lastMonthSold > 0 
        ? (((currentMonthSold - lastMonthSold) / lastMonthSold) * 100).toFixed(1)
        : currentMonthSold > 0 ? 100 : 0

      const currentMonthRevenueLots = soldLotsWithDates.filter(lot => {
        const lotDate = new Date(lot.updatedAt)
        return lotDate >= currentMonthStart
      })

      const currentMonthRevenue = currentMonthRevenueLots.reduce((sum, lot) => {
        const price = lot.totalPrice || lot.price || lot.basePrice || 0
        return sum + price
      }, 0)

      const lastMonthRevenue = soldLotsWithDates
        .filter(lot => {
          const lotDate = new Date(lot.updatedAt)
          return lotDate >= lastMonthStart && lotDate < lastMonthEnd
        })
        .reduce((sum, lot) => sum + (lot.totalPrice || lot.price || lot.basePrice || 0), 0)

      const revenuePercentageChange = lastMonthRevenue > 0
        ? (((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
        : currentMonthRevenue > 0 ? 100 : 0

      const newStats = {
        totalLots,
        availableLots,
        holdLots,
        soldLots,
        occupancyRate: parseFloat(occupancyRate),
        soldDifference,
        soldPercentageChange: parseFloat(soldPercentageChange),
        currentMonthRevenue,
        revenuePercentageChange: parseFloat(revenuePercentageChange)
      }

      console.log('Final stats:', newStats)
      setStats(newStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentPayloads = async () => {
    try {
      const response = await api.get('/payloads?limit=3&sort=-date')
      console.log('Recent payloads:', response.data)
      setRecentPayloads(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching recent payloads:', error)
      setRecentPayloads([])
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'cleared': return 'success'
      case 'pending': return 'warning'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'cleared': return 'Cleared'
      case 'pending': return 'Pending'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  // Handlers para User Dialog
  const handleOpenUserDialog = () => {
    setUserFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
      birthday: '',
      role: 'user'
    })
    setOpenUserDialog(true)
  }

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false)
  }

// Actualizar handleSubmitUser
const handleSubmitUser = async () => {
  try {
    // Enviar con skipPasswordSetup para activar el flujo de SMS
    await api.post('/auth/register', {
      ...userFormData,
      phoneNumber: `+${userFormData.phoneNumber}`, // Agregar el + al número
      skipPasswordSetup: true // ✅ Esto activa el envío del SMS
    })
    handleCloseUserDialog()
    alert('✅ User invited successfully! They will receive an SMS with setup instructions.')
  } catch (error) {
    console.error('Error inviting user:', error)
    alert(error.response?.data?.message || 'Error inviting user')
  }
}

  const quickActions = [
    { 
      icon: '🏠', 
      label: 'Add Property', 
      color: '#3b82f6',
      onClick: () => navigate('/properties/select')
    },
    { 
      icon: '👥', 
      label: 'Invite User', 
      color: '#10b981',
      onClick: handleOpenUserDialog
    },
    { 
      icon: '📊', 
      label: 'Analytics', 
      color: '#8b5cf6',
      onClick: () => navigate('/analytics')
    },
    { 
      icon: '📅', 
      label: 'Schedule', 
      color: '#f59e0b',
      onClick: () => navigate('/schedule')
    }
  ]

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Good Morning, {user?.firstName}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's what's happening at the lake today.
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        
        {/* Lots Listed / Sold */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Lots Listed / Sold
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.soldLots} / {stats.totalLots}
                  </Typography>
                  {stats.soldDifference !== 0 && (
                    <Typography 
                      variant="caption" 
                      color={stats.soldDifference >= 0 ? 'success.main' : 'error.main'}
                    >
                      {stats.soldDifference >= 0 ? '+' : ''}{stats.soldDifference} this month
                      {stats.soldPercentageChange !== 0 && stats.soldPercentageChange !== 100 && (
                        <> ({stats.soldPercentageChange >= 0 ? '+' : ''}{stats.soldPercentageChange}%)</>
                      )}
                    </Typography>
                  )}
                  {stats.soldDifference === 0 && (
                    <Typography variant="caption" color="text.secondary">
                      No change this month
                    </Typography>
                  )}
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <HomeWork />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Monthly Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${(stats.currentMonthRevenue / 1000000).toFixed(1)}M
                  </Typography>
                  {stats.revenuePercentageChange !== 0 && (
                    <Typography 
                      variant="caption" 
                      color={stats.revenuePercentageChange >= 0 ? 'success.main' : 'error.main'}
                    >
                      {stats.revenuePercentageChange >= 0 ? '+' : ''}{stats.revenuePercentageChange}% vs last month
                    </Typography>
                  )}
                  {stats.revenuePercentageChange === 0 && (
                    <Typography variant="caption" color="text.secondary">
                      No change vs last month
                    </Typography>
                  )}
                </Box>
                <Avatar sx={{ bgcolor: '#f59e0b', width: 56, height: 56 }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lots on Hold */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Lots on Hold
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.holdLots}
                  </Typography>
                  <Typography variant="caption" color="primary.main">
                    {stats.totalLots > 0 
                      ? `${((stats.holdLots / stats.totalLots) * 100).toFixed(1)}% of total inventory`
                      : '0% of total inventory'
                    }
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#2196f3', width: 56, height: 56 }}>
                  <Inbox />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Occupancy Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Occupancy Rate
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.occupancyRate}%
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                  >
                    {stats.soldLots} of {stats.totalLots} sold
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  bgcolor: stats.occupancyRate >= 50 ? 'success.main' : 'info.main', 
                  width: 56, 
                  height: 56 
                }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Map Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Property Map
              </Typography>
              <Typography 
                variant="body2" 
                color="primary" 
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate('/property-selection')}
              >
                View Full Map
              </Typography>
            </Box>
            <DashboardMap />
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Actions
            </Typography>
            <Box sx={{ mt: 2 }}>
              {quickActions.map((action, index) => (
                <Box
                  key={index}
                  onClick={action.onClick}
                  className="cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                  sx={{ 
                    p: 2, 
                    mb: 1, 
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: '#f9fafb',
                      transform: 'translateY(-2px)',
                      boxShadow: 1
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '8px',
                      bgcolor: action.color + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography variant="body1">{action.label}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Payloads */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Recent Payloads
              </Typography>
              <Typography 
                variant="body2" 
                color="primary" 
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate('/payloads')}
              >
                View all
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              {recentPayloads.length > 0 ? (
                recentPayloads.map((payload) => (
                  <Box
                    key={payload._id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 2,
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: '#f9fafb'
                      }
                    }}
                    onClick={() => navigate('/payloads')}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        {payload.property?.user?.firstName?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="500">
                          {payload.property?.lot?.number ? `Lot ${payload.property.lot.number}` : 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {payload.property?.user?.firstName} {payload.property?.user?.lastName} • {new Date(payload.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="body1" fontWeight="600">
                        ${payload.amount?.toLocaleString()}
                      </Typography>
                      <Chip
                        label={getStatusLabel(payload.status)}
                        color={getStatusColor(payload.status)}
                        size="small"
                      />
                    </Box>
                  </Box>
                ))
              ) : (
                <Box py={4} textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    No recent payloads found
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Activity
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[
                { text: 'New showing booked', detail: '104 Lakeview Dr', time: '2 mins ago', color: 'success.main' },
                { text: 'Maintenance request', detail: 'Clubhouse HVAC', time: '1 hour ago', color: 'warning.main' },
                { text: 'New document uploaded', detail: 'Lease agreement #442', time: '3 hours ago', color: 'info.main' }
              ].map((activity, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: activity.color
                      }}
                    />
                    <Typography variant="body2" fontWeight="500">
                      {activity.text}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                    {activity.detail} • {activity.time}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ cursor: 'pointer', mt: 2, textAlign: 'center' }}
            >
              VIEW FULL HISTORY
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Invite User Dialog */}
<Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="md" fullWidth>
  <DialogTitle>
    <Box display="flex" alignItems="center" gap={1}>
      <Typography variant="h6" fontWeight="bold">
        Invite New User
      </Typography>
      <Chip label="SMS Setup" size="small" color="primary" />
    </Box>
  </DialogTitle>
  <DialogContent>
    <Alert severity="info" sx={{ mb: 2 }}>
      The user will receive an SMS with a link to set their password
    </Alert>
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="First Name"
          value={userFormData.firstName}
          onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Last Name"
          value={userFormData.lastName}
          onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="email"
          label="Email"
          value={userFormData.email}
          onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Phone Number *
          </Typography>
          <PhoneInput
            country={'us'}
            value={userFormData.phoneNumber}
            onChange={(value) => setUserFormData({ ...userFormData, phoneNumber: value })}
            inputProps={{
              name: 'phone',
              required: true
            }}
            containerStyle={{
              width: '100%'
            }}
            inputStyle={{
              width: '100%',
              height: '56px',
              fontSize: '16px',
              border: '1px solid #c4c4c4'
            }}
            buttonStyle={{
              border: '1px solid #c4c4c4',
              borderRight: 'none'
            }}
          />
        </Box>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="date"
          label="Birthday"
          value={userFormData.birthday}
          onChange={(e) => setUserFormData({ ...userFormData, birthday: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          select
          label="Role"
          value={userFormData.role}
          onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
        >
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="superadmin">Super Admin</MenuItem>
        </TextField>
      </Grid>
    </Grid>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseUserDialog}>Cancel</Button>
    <Button 
      onClick={handleSubmitUser} 
      variant="contained"
      disabled={
        !userFormData.firstName || 
        !userFormData.lastName || 
        !userFormData.email || 
        !userFormData.phoneNumber // Validar phone en vez de password
      }
      sx={{
        bgcolor: '#4a7c59',
        '&:hover': { bgcolor: '#3d664a' }
      }}
    >
      Send Invitation
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  )
}

export default Dashboard