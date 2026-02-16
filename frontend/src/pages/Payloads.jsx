// import { useState, useEffect } from 'react'
// import {
//   Box,
//   Typography,
//   Paper,
//   Grid,
//   Card,
//   CardContent,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Button,
//   Chip,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   MenuItem,
//   Avatar,
//   Tooltip
// } from '@mui/material'
// import { Add, Edit, AttachFile, CheckCircle, Cancel } from '@mui/icons-material'
// import Download from '@mui/icons-material/Download'

// import api from '../services/api'

// const Payloads = () => {
//   const [payloads, setPayloads] = useState([])
//   const [properties, setProperties] = useState([])
//   const [stats, setStats] = useState({
//     totalCollected: 0,
//     pendingPayloads: 0,
//     rejectedPayloads: 0,
//     recentFailures: 0
//   })
//   const [loading, setLoading] = useState(true)
//   const [openDialog, setOpenDialog] = useState(false)
//   const [selectedPayload, setSelectedPayload] = useState(null)
//   const [formData, setFormData] = useState({
//     property: '',
//     date: new Date().toISOString().split('T')[0],
//     amount: 0,
//     status: 'pending',
//     type: '', // ✅ Agregado
//     notes: ''
//   })

//   useEffect(() => {
//     fetchData()
//   }, [])

//   const fetchData = async () => {
//     try {
//       const [payloadsRes, propertiesRes, statsRes] = await Promise.all([
//         api.get('/payloads'),
//         api.get('/properties'),
//         api.get('/payloads/stats')
//       ])
//       setPayloads(payloadsRes.data)
//       setProperties(propertiesRes.data)
//       setStats(statsRes.data)
//     } catch (error) {
//       console.error('Error fetching data:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleOpenDialog = (payload = null) => {
//     if (payload) {
//       setSelectedPayload(payload)
//       setFormData({
//         property: payload.property._id,
//         date: new Date(payload.date).toISOString().split('T')[0],
//         amount: payload.amount,
//         status: payload.status,
//         type: payload.type || '', // ✅ Agregado
//         notes: payload.notes || ''
//       })
//     } else {
//       setSelectedPayload(null)
//       setFormData({
//         property: '',
//         date: new Date().toISOString().split('T')[0],
//         amount: 0,
//         status: 'pending',
//         type: '', // ✅ Agregado
//         notes: ''
//       })
//     }
//     setOpenDialog(true)
//   }

//   const handleCloseDialog = () => {
//     setOpenDialog(false)
//     setSelectedPayload(null)
//   }

//   const handleSubmit = async () => {
//     try {
//       if (selectedPayload) {
//         await api.put(`/payloads/${selectedPayload._id}`, formData)
//       } else {
//         await api.post('/payloads', formData)
//       }
//       handleCloseDialog()
//       fetchData()
//     } catch (error) {
//       console.error('Error saving payload:', error)
//     }
//   }

//   const getFileUrl = (payload) => {
//     if (!payload) return null
//     // common shapes: payload.supportFile { url }, payload.supportFile (string), payload.fileUrl, payload.documentUrl, payload.attachment
//     if (payload.support) {
//       if (typeof payload.support === 'string') return payload.support
//       if (payload.support.url) return payload.support.url
//     }
//     if (payload.fileUrl) return payload.fileUrl
//     if (payload.documentUrl) return payload.documentUrl
//     if (payload.attachment) return payload.attachment
//     return null
//   }

//   const handleDownload = (payload) => {
//     const url = getFileUrl(payload)
//     if (!url) {
//       alert('No attached file available for this payload.')
//       return
//     }
//     // abrir en nueva pestaña para revisar / descargar
//     window.open(url, '_blank', 'noopener')
//   }

//   const handleApprove = async (payload) => {
//     if (!payload) return
//     if (!window.confirm('Approve this payment and mark as signed?')) return
//     try {
//       await api.put(`/payloads/${payload._id}`, { status: 'signed' })
//       fetchData()
//     } catch (err) {
//       console.error('Error approving payload:', err)
//       alert('Error approving payload')
//     }
//   }

//   const handleReject = async (payload) => {
//     if (!payload) return
//     if (!window.confirm('Reject this payment? This will set status to rejected.')) return
//     try {
//       await api.put(`/payloads/${payload._id}`, { status: 'rejected' })
//       fetchData()
//     } catch (err) {
//       console.error('Error rejecting payload:', err)
//       alert('Error rejecting payload')
//     }
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'signed': return 'success'
//       case 'pending': return 'warning'
//       case 'rejected': return 'error'
//       default: return 'default'
//     }
//   }

//   return (
//     <Box
//     sx={{p: 3}}
//     >
//       <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//         <Box>
//           <Typography variant="h4" fontWeight="bold">
//             Payloads Management
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             Manage and track property payment records
//           </Typography>
//         </Box>
//         <Tooltip title="New Payload" placement="left">
//           <Button
//             variant="contained"
//             onClick={() => handleOpenDialog()}
//             sx={{
//               minWidth: { xs: 48, sm: 'auto' },
//               width: { xs: 48, sm: 'auto' },
//               height: { xs: 48, sm: 'auto' },
//               p: { xs: 0, sm: '8px 24px' },
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               borderRadius: { xs: '50%', sm: 3 },
//               bgcolor: '#333F1F',
//               color: 'white',
//               fontWeight: 600,
//               fontSize: { xs: '0.85rem', sm: '0.9rem' },
//               letterSpacing: '1.5px',
//               textTransform: 'uppercase',
//               fontFamily: '"Poppins", sans-serif',
//               border: 'none',
//               position: 'relative',
//               overflow: 'hidden',
//               boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
//               transition: 'all 0.3s ease',
//               '&::before': {
//                 content: '""',
//                 position: 'absolute',
//                 top: 0,
//                 left: '-100%',
//                 width: '100%',
//                 height: '100%',
//                 bgcolor: '#8CA551',
//                 transition: 'left 0.4s ease',
//                 zIndex: 0,
//               },
//               '&:hover': {
//                 bgcolor: '#333F1F',
//                 boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
//                 transform: 'translateY(-2px)',
//                 '&::before': {
//                   left: 0,
//                 },
//                 '& .MuiBox-root, & .MuiSvgIcon-root': {
//                   color: 'white',
//                   position: 'relative',
//                   zIndex: 1,
//                 },
//               },
//               '&:active': {
//                 transform: 'translateY(0px)',
//                 boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)'
//               },
//               '& .MuiBox-root, & .MuiSvgIcon-root': {
//                 position: 'relative',
//                 zIndex: 1,
//                 transition: 'color 0.3s ease',
//               },
//             }}
//           >
//             <Add sx={{ display: { xs: 'block', sm: 'none' }, fontSize: 24 }} />
//             <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
//               <Add />
//               New Payload
//             </Box>
//           </Button>
//         </Tooltip>
//       </Box>

//       <Grid container spacing={3} mb={3}>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary" variant="body2">
//                 TOTAL COLLECTED (YTD)
//               </Typography>
//               <Typography variant="h4" fontWeight="bold" color="success.main">
//                 ${(stats.totalCollected / 1000000).toFixed(1)}M
//               </Typography>
//               <Typography variant="caption" color="success.main">
//                 +12%
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary" variant="body2">
//                 PENDING PAYLOADS
//               </Typography>
//               <Typography variant="h4" fontWeight="bold" color="warning.main">
//                 {stats.pendingPayloads}
//               </Typography>
//               <Typography variant="caption" color="warning.main">
//                 Needs Review
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary" variant="body2">
//                 RECENT FAILURES
//               </Typography>
//               <Typography variant="h4" fontWeight="bold" color="error.main">
//                 ${stats.recentFailures?.toLocaleString() || 0}
//               </Typography>
//               <Typography variant="caption" color="error.main">
//                 -1%
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary" variant="body2">
//                 REJECTED
//               </Typography>
//               <Typography variant="h4" fontWeight="bold">
//                 {stats.rejectedPayloads}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

      
      
//       <Paper>
//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>PROPERTY ID</TableCell>
//                 <TableCell>PAYER NAME</TableCell>
//                 <TableCell>DATE</TableCell>
//                 <TableCell>AMOUNT</TableCell>
//                 <TableCell>TYPE</TableCell>
//                 <TableCell>STATUS</TableCell>
//                 <TableCell>DOCS</TableCell>
//                 <TableCell>ACTION</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {payloads.map((payload) => (
//                 <TableRow key={payload._id}>
//                   <TableCell>
//                     <Typography variant="body2" fontWeight="500">
//                       {payload.property?.lot?.number ? `Unit ${payload.property.lot.number}` : 'N/A'}
//                     </Typography>
//                     <Typography variant="caption" color="text.secondary">
//                       ID: #{payload.property?.model?.modelNumber || 'N/A'}
//                     </Typography>
//                   </TableCell>
//                   <TableCell>
//                     <Box display="flex" alignItems="center" gap={1}>
//                       <Avatar sx={{ width: 32, height: 32, fontSize: '14px' }}>
//                         {payload.property?.user?.firstName?.charAt(0) || 'U'}
//                       </Avatar>
//                       <Typography variant="body2">
//                         {payload.property?.user?.firstName} {payload.property?.user?.lastName}
//                       </Typography>
//                     </Box>
//                   </TableCell>
//                   <TableCell>
//                     <Typography variant="body2">
//                       {new Date(payload.date).toLocaleDateString()}
//                     </Typography>
//                   </TableCell>
//                   <TableCell>
//                     <Typography variant="body2" fontWeight="600">
//                       ${payload.amount?.toLocaleString()}
//                     </Typography>
//                   </TableCell>
//                   <TableCell>
//                     <Chip
//                       label={payload.type || 'N/A'}
//                       size="small"
//                       sx={{
//                         bgcolor: '#e3f2fd',
//                         color: '#1976d2',
//                         fontWeight: 500,
//                         textTransform: 'capitalize'
//                       }}
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <Chip
//                       label={payload.status}
//                       color={getStatusColor(payload.status)}
//                       size="small"
//                       icon={
//                         payload.status === 'signed' ? <CheckCircle /> :
//                         payload.status === 'rejected' ? <Cancel /> : undefined
//                       }
//                     />
//                   </TableCell>
      
//                   <TableCell>
//                     <Tooltip title={getFileUrl(payload) ? 'Download file' : 'No file attached'}>
//                       <span>
//                         <IconButton
//                           size="small"
//                           onClick={() => handleDownload(payload)}
//                           disabled={!getFileUrl(payload)}
//                         >
//                           <Download fontSize="small" />
//                         </IconButton>
//                       </span>
//                     </Tooltip>
//                   </TableCell>
//                   <TableCell>
//                     <Tooltip title="Edit">
//                       <IconButton
//                         size="small"
//                         color="primary"
//                         onClick={() => handleOpenDialog(payload)}
//                       >
//                         <Edit fontSize="small" />
//                       </IconButton>
//                     </Tooltip>
//                     <Tooltip title="Approve">
//                       <span>
//                         <IconButton
//                           size="small"
//                           color="success"
//                           onClick={() => handleApprove(payload)}
//                           disabled={payload.status === 'signed'}
//                         >
//                           <CheckCircle fontSize="small" />
//                         </IconButton>
//                       </span>
//                     </Tooltip>
//                     <Tooltip title="Reject">
//                       <span>
//                         <IconButton
//                           size="small"
//                           color="error"
//                           onClick={() => handleReject(payload)}
//                           disabled={payload.status === 'rejected'}
//                         >
//                           <Cancel fontSize="small" />
//                         </IconButton>
//                       </span>
//                     </Tooltip>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>
      
      

      
      
//       <Dialog
//         open={openDialog}
//         onClose={handleCloseDialog}
//         maxWidth="sm"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 4,
//             boxShadow: "0 20px 60px rgba(51, 63, 31, 0.15)",
//           }
//         }}
//       >
//         {/* ✅ DIALOG TITLE - Mismo estilo que Residents */}
//         <DialogTitle>
//           <Box display="flex" alignItems="center" gap={2}>
//             <Box
//               sx={{
//                 width: 48,
//                 height: 48,
//                 borderRadius: 3,
//                 bgcolor: "#333F1F",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 boxShadow: "0 4px 12px rgba(51, 63, 31, 0.2)",
//               }}
//             >
//               <AttachFile sx={{ color: "white", fontSize: 24 }} />
//             </Box>
//             <Box>
//               <Typography 
//                 variant="h6" 
//                 fontWeight={700}
//                 sx={{ 
//                   color: "#333F1F",
//                   fontFamily: '"Poppins", sans-serif'
//                 }}
//               >
//                 {selectedPayload ? 'Edit Payload' : 'Add New Payload'}
//               </Typography>
//               <Typography 
//                 variant="caption" 
//                 sx={{ 
//                   color: "#706f6f",
//                   fontFamily: '"Poppins", sans-serif'
//                 }}
//               >
//                 Manage and track payment record details
//               </Typography>
//             </Box>
//           </Box>
//         </DialogTitle>
      
//         <DialogContent sx={{ pt: 3 }}>
//           <Grid container spacing={2.5}>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 select
//                 label="Property"
//                 value={formData.property}
//                 onChange={(e) => setFormData({ ...formData, property: e.target.value })}
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     borderRadius: 3,
//                     fontFamily: '"Poppins", sans-serif',
//                     "& fieldset": {
//                       borderColor: 'rgba(140, 165, 81, 0.3)',
//                       borderWidth: '2px'
//                     },
//                     "&:hover fieldset": {
//                       borderColor: "#8CA551"
//                     },
//                     "&.Mui-focused fieldset": { 
//                       borderColor: "#333F1F",
//                       borderWidth: "2px"
//                     }
//                   },
//                   "& .MuiInputLabel-root": {
//                     fontFamily: '"Poppins", sans-serif',
//                     fontWeight: 500,
//                     color: '#706f6f',
//                     "&.Mui-focused": {
//                       color: "#333F1F",
//                       fontWeight: 600
//                     }
//                   }
//                 }}
//               >
//                 {properties.map((property) => (
//                   <MenuItem 
//                     key={property._id} 
//                     value={property._id}
//                     sx={{
//                       fontFamily: '"Poppins", sans-serif',
//                       fontWeight: 500,
//                       '&:hover': {
//                         bgcolor: 'rgba(140, 165, 81, 0.08)'
//                       },
//                       '&.Mui-selected': {
//                         bgcolor: 'rgba(140, 165, 81, 0.12)',
//                         '&:hover': {
//                           bgcolor: 'rgba(140, 165, 81, 0.18)'
//                         }
//                       }
//                     }}
//                   >
//                     Lot {property.lot?.number} - {property.user?.firstName} {property.user?.lastName}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             </Grid>
      
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 type="date"
//                 label="Payment Date"
//                 value={formData.date}
//                 onChange={(e) => setFormData({ ...formData, date: e.target.value })}
//                 InputLabelProps={{ shrink: true }}
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     borderRadius: 3,
//                     fontFamily: '"Poppins", sans-serif',
//                     "& fieldset": {
//                       borderColor: 'rgba(140, 165, 81, 0.3)',
//                       borderWidth: '2px'
//                     },
//                     "&:hover fieldset": {
//                       borderColor: "#8CA551"
//                     },
//                     "&.Mui-focused fieldset": { 
//                       borderColor: "#333F1F",
//                       borderWidth: "2px"
//                     }
//                   },
//                   "& .MuiInputLabel-root": {
//                     fontFamily: '"Poppins", sans-serif',
//                     fontWeight: 500,
//                     color: '#706f6f',
//                     "&.Mui-focused": {
//                       color: "#333F1F",
//                       fontWeight: 600
//                     }
//                   }
//                 }}
//               />
//             </Grid>
      
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 type="number"
//                 label="Amount"
//                 value={formData.amount}
//                 onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
//                 InputProps={{
//                   startAdornment: (
//                     <Typography sx={{ mr: 0.5, fontSize: "0.875rem", color: '#333F1F', fontWeight: 600 }}>$</Typography>
//                   ),
//                 }}
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     borderRadius: 3,
//                     fontFamily: '"Poppins", sans-serif',
//                     "& fieldset": {
//                       borderColor: 'rgba(140, 165, 81, 0.3)',
//                       borderWidth: '2px'
//                     },
//                     "&:hover fieldset": {
//                       borderColor: "#8CA551"
//                     },
//                     "&.Mui-focused fieldset": { 
//                       borderColor: "#333F1F",
//                       borderWidth: "2px"
//                     }
//                   },
//                   "& .MuiInputLabel-root": {
//                     fontFamily: '"Poppins", sans-serif',
//                     fontWeight: 500,
//                     color: '#706f6f',
//                     "&.Mui-focused": {
//                       color: "#333F1F",
//                       fontWeight: 600
//                     }
//                   }
//                 }}
//               />
//             </Grid>
      
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 select
//                 label="Status"
//                 value={formData.status}
//                 onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     borderRadius: 3,
//                     fontFamily: '"Poppins", sans-serif',
//                     "& fieldset": {
//                       borderColor: 'rgba(140, 165, 81, 0.3)',
//                       borderWidth: '2px'
//                     },
//                     "&:hover fieldset": {
//                       borderColor: "#8CA551"
//                     },
//                     "&.Mui-focused fieldset": { 
//                       borderColor: "#333F1F",
//                       borderWidth: "2px"
//                     }
//                   },
//                   "& .MuiInputLabel-root": {
//                     fontFamily: '"Poppins", sans-serif',
//                     fontWeight: 500,
//                     color: '#706f6f',
//                     "&.Mui-focused": {
//                       color: "#333F1F",
//                       fontWeight: 600
//                     }
//                   }
//                 }}
//               >
//                 <MenuItem 
//                   value="pending"
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     fontWeight: 500,
//                     '&:hover': {
//                       bgcolor: 'rgba(229, 134, 60, 0.08)'
//                     },
//                     '&.Mui-selected': {
//                       bgcolor: 'rgba(229, 134, 60, 0.12)',
//                       '&:hover': {
//                         bgcolor: 'rgba(229, 134, 60, 0.18)'
//                       }
//                     }
//                   }}
//                 >
//                   Pending
//                 </MenuItem>
//                 <MenuItem 
//                   value="signed"
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     fontWeight: 500,
//                     '&:hover': {
//                       bgcolor: 'rgba(140, 165, 81, 0.08)'
//                     },
//                     '&.Mui-selected': {
//                       bgcolor: 'rgba(140, 165, 81, 0.12)',
//                       '&:hover': {
//                         bgcolor: 'rgba(140, 165, 81, 0.18)'
//                       }
//                     }
//                   }}
//                 >
//                   Signed
//                 </MenuItem>
//                 <MenuItem 
//                   value="rejected"
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     fontWeight: 500,
//                     '&:hover': {
//                       bgcolor: 'rgba(211, 47, 47, 0.08)'
//                     },
//                     '&.Mui-selected': {
//                       bgcolor: 'rgba(211, 47, 47, 0.12)',
//                       '&:hover': {
//                         bgcolor: 'rgba(211, 47, 47, 0.18)'
//                       }
//                     }
//                   }}
//                 >
//                   Rejected
//                 </MenuItem>
//               </TextField>
//             </Grid>
      
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 select
//                 label="Payment Type"
//                 value={formData.type || ""}
//                 onChange={e => setFormData({ ...formData, type: e.target.value })}
//                 required
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     borderRadius: 3,
//                     fontFamily: '"Poppins", sans-serif',
//                     "& fieldset": {
//                       borderColor: 'rgba(140, 165, 81, 0.3)',
//                       borderWidth: '2px'
//                     },
//                     "&:hover fieldset": {
//                       borderColor: "#8CA551"
//                     },
//                     "&.Mui-focused fieldset": { 
//                       borderColor: "#333F1F",
//                       borderWidth: "2px"
//                     }
//                   },
//                   "& .MuiInputLabel-root": {
//                     fontFamily: '"Poppins", sans-serif',
//                     fontWeight: 500,
//                     color: '#706f6f',
//                     "&.Mui-focused": {
//                       color: "#333F1F",
//                       fontWeight: 600
//                     }
//                   }
//                 }}
//               >
//                 <MenuItem 
//                   value="initial down payment"
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     fontWeight: 500,
//                     '&:hover': {
//                       bgcolor: 'rgba(140, 165, 81, 0.08)'
//                     },
//                     '&.Mui-selected': {
//                       bgcolor: 'rgba(140, 165, 81, 0.12)',
//                       '&:hover': {
//                         bgcolor: 'rgba(140, 165, 81, 0.18)'
//                       }
//                     }
//                   }}
//                 >
//                   Initial Down Payment
//                 </MenuItem>
//                 <MenuItem 
//                   value="complementary down payment"
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     fontWeight: 500,
//                     '&:hover': {
//                       bgcolor: 'rgba(140, 165, 81, 0.08)'
//                     },
//                     '&.Mui-selected': {
//                       bgcolor: 'rgba(140, 165, 81, 0.12)',
//                       '&:hover': {
//                         bgcolor: 'rgba(140, 165, 81, 0.18)'
//                       }
//                     }
//                   }}
//                 >
//                   Complementary Down Payment
//                 </MenuItem>
//                 <MenuItem 
//                   value="monthly payment"
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     fontWeight: 500,
//                     '&:hover': {
//                       bgcolor: 'rgba(140, 165, 81, 0.08)'
//                     },
//                     '&.Mui-selected': {
//                       bgcolor: 'rgba(140, 165, 81, 0.12)',
//                       '&:hover': {
//                         bgcolor: 'rgba(140, 165, 81, 0.18)'
//                       }
//                     }
//                   }}
//                 >
//                   Monthly Payment
//                 </MenuItem>
//                 <MenuItem 
//                   value="additional payment"
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     fontWeight: 500,
//                     '&:hover': {
//                       bgcolor: 'rgba(140, 165, 81, 0.08)'
//                     },
//                     '&.Mui-selected': {
//                       bgcolor: 'rgba(140, 165, 81, 0.12)',
//                       '&:hover': {
//                         bgcolor: 'rgba(140, 165, 81, 0.18)'
//                       }
//                     }
//                   }}
//                 >
//                   Additional Payment
//                 </MenuItem>
//                 <MenuItem 
//                   value="closing payment"
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     fontWeight: 500,
//                     '&:hover': {
//                       bgcolor: 'rgba(140, 165, 81, 0.08)'
//                     },
//                     '&.Mui-selected': {
//                       bgcolor: 'rgba(140, 165, 81, 0.12)',
//                       '&:hover': {
//                         bgcolor: 'rgba(140, 165, 81, 0.18)'
//                       }
//                     }
//                   }}
//                 >
//                   Closing Payment
//                 </MenuItem>
//               </TextField>
//             </Grid>
      
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 multiline
//                 rows={3}
//                 label="Notes"
//                 value={formData.notes}
//                 onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     borderRadius: 3,
//                     fontFamily: '"Poppins", sans-serif',
//                     "& fieldset": {
//                       borderColor: 'rgba(140, 165, 81, 0.3)',
//                       borderWidth: '2px'
//                     },
//                     "&:hover fieldset": {
//                       borderColor: "#8CA551"
//                     },
//                     "&.Mui-focused fieldset": { 
//                       borderColor: "#333F1F",
//                       borderWidth: "2px"
//                     }
//                   },
//                   "& .MuiInputLabel-root": {
//                     fontFamily: '"Poppins", sans-serif',
//                     fontWeight: 500,
//                     color: '#706f6f',
//                     "&.Mui-focused": {
//                       color: "#333F1F",
//                       fontWeight: 600
//                     }
//                   }
//                 }}
//               />
//             </Grid>
//           </Grid>
//         </DialogContent>
      
//         <DialogActions sx={{ p: 3, gap: 2 }}>
//           <Button
//             onClick={handleCloseDialog}
//             sx={{
//               borderRadius: 3,
//               textTransform: "none",
//               fontWeight: 600,
//               px: 3,
//               py: 1.2,
//               color: "#706f6f",
//               fontFamily: '"Poppins", sans-serif',
//               border: "2px solid #e0e0e0",
//               "&:hover": {
//                 bgcolor: "rgba(112, 111, 111, 0.05)",
//                 borderColor: "#706f6f"
//               }
//             }}
//           >
//             Cancel
//           </Button>
          
//           <Button
//             variant="contained"
//             onClick={handleSubmit}
//             disabled={!formData.amount || !formData.property || !formData.type}
//             startIcon={<CheckCircle />}
//             sx={{
//               borderRadius: 3,
//               bgcolor: "#333F1F",
//               color: "white",
//               fontWeight: 600,
//               textTransform: "none",
//               letterSpacing: "1px",
//               fontFamily: '"Poppins", sans-serif',
//               px: 4,
//               py: 1.5,
//               boxShadow: "0 4px 12px rgba(51, 63, 31, 0.25)",
//               position: "relative",
//               overflow: "hidden",
//               "&::before": {
//                 content: '""',
//                 position: "absolute",
//                 top: 0,
//                 left: "-100%",
//                 width: "100%",
//                 height: "100%",
//                 bgcolor: "#8CA551",
//                 transition: "left 0.4s ease",
//                 zIndex: 0,
//               },
//               "&:hover": {
//                 bgcolor: "#333F1F",
//                 boxShadow: "0 8px 20px rgba(51, 63, 31, 0.35)",
//                 "&::before": {
//                   left: 0,
//                 },
//               },
//               "& span": {
//                 position: "relative",
//                 zIndex: 1,
//               }
//             }}
//           >
//             {selectedPayload ? 'Update' : 'Create'}
//           </Button>
//         </DialogActions>
//       </Dialog>
      
      
//     </Box>
//   )
// }

// export default Payloads


import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  Tooltip,
  Container,
  CircularProgress
} from '@mui/material'
import { 
  Add, 
  Edit, 
  AttachFile, 
  CheckCircle, 
  Cancel,
  Download,
  AccountBalance,
  Schedule,
  ErrorOutline,
  TrendingUp
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

const Payloads = () => {
  const [payloads, setPayloads] = useState([])
  const [properties, setProperties] = useState([])
  const [stats, setStats] = useState({
    totalCollected: 0,
    pendingPayloads: 0,
    rejectedPayloads: 0,
    recentFailures: 0
  })
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedPayload, setSelectedPayload] = useState(null)
  const [formData, setFormData] = useState({
    property: '',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    status: 'pending',
    type: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [payloadsRes, propertiesRes, statsRes] = await Promise.all([
        api.get('/payloads'),
        api.get('/properties'),
        api.get('/payloads/stats')
      ])
      setPayloads(payloadsRes.data)
      setProperties(propertiesRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (payload = null) => {
    if (payload) {
      setSelectedPayload(payload)
      setFormData({
        property: payload.property._id,
        date: new Date(payload.date).toISOString().split('T')[0],
        amount: payload.amount,
        status: payload.status,
        type: payload.type || '',
        notes: payload.notes || ''
      })
    } else {
      setSelectedPayload(null)
      setFormData({
        property: '',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        status: 'pending',
        type: '',
        notes: ''
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedPayload(null)
  }

  const handleSubmit = async () => {
    try {
      if (selectedPayload) {
        await api.put(`/payloads/${selectedPayload._id}`, formData)
      } else {
        await api.post('/payloads', formData)
      }
      handleCloseDialog()
      fetchData()
    } catch (error) {
      console.error('Error saving payload:', error)
    }
  }

  const getFileUrl = (payload) => {
    if (!payload) return null
    if (payload.support) {
      if (typeof payload.support === 'string') return payload.support
      if (payload.support.url) return payload.support.url
    }
    if (payload.fileUrl) return payload.fileUrl
    if (payload.documentUrl) return payload.documentUrl
    if (payload.attachment) return payload.attachment
    return null
  }

  const handleDownload = (payload) => {
    const url = getFileUrl(payload)
    if (!url) {
      alert('No attached file available for this payload.')
      return
    }
    window.open(url, '_blank', 'noopener')
  }

  const handleApprove = async (payload) => {
    if (!payload) return
    if (!window.confirm('Approve this payment and mark as signed?')) return
    try {
      await api.put(`/payloads/${payload._id}`, { status: 'signed' })
      fetchData()
    } catch (err) {
      console.error('Error approving payload:', err)
      alert('Error approving payload')
    }
  }

  const handleReject = async (payload) => {
    if (!payload) return
    if (!window.confirm('Reject this payment? This will set status to rejected.')) return
    try {
      await api.put(`/payloads/${payload._id}`, { status: 'rejected' })
      fetchData()
    } catch (err) {
      console.error('Error rejecting payload:', err)
      alert('Error rejecting payload')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'signed':
        return { bg: 'rgba(140, 165, 81, 0.12)', color: '#333F1F', border: 'rgba(140, 165, 81, 0.3)', icon: CheckCircle }
      case 'pending':
        return { bg: 'rgba(229, 134, 60, 0.12)', color: '#E5863C', border: 'rgba(229, 134, 60, 0.3)', icon: Schedule }
      case 'rejected':
        return { bg: 'rgba(211, 47, 47, 0.12)', color: '#d32f2f', border: 'rgba(211, 47, 47, 0.3)', icon: Cancel }
      default:
        return { bg: 'rgba(112, 111, 111, 0.12)', color: '#706f6f', border: 'rgba(112, 111, 111, 0.3)', icon: ErrorOutline }
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              mb: 4,
              borderRadius: 4,
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #333F1F, #8CA551, #333F1F)'
              }
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 56, md: 64 },
                      height: { xs: 56, md: 64 },
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(51, 63, 31, 0.3)'
                    }}
                  >
                    <AccountBalance sx={{ fontSize: { xs: 28, md: 32 }, color: 'white' }} />
                  </Box>
                </motion.div>

                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: '#333F1F',
                      fontFamily: '"Poppins", sans-serif',
                      letterSpacing: '0.5px',
                      fontSize: { xs: '1.75rem', md: '2.125rem' }
                    }}
                  >
                    Payment Records
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#706f6f',
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: { xs: '0.875rem', md: '1rem' }
                    }}
                  >
                    Manage and track property payment transactions
                  </Typography>
                </Box>
              </Box>

              <Tooltip title="New Payment" placement="left">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    onClick={() => handleOpenDialog()}
                    startIcon={<Add />}
                    sx={{
                      borderRadius: 3,
                      bgcolor: '#333F1F',
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'none',
                      letterSpacing: '1px',
                      fontFamily: '"Poppins", sans-serif',
                      px: 3,
                      py: 1.5,
                      boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        bgcolor: '#8CA551',
                        transition: 'left 0.4s ease',
                        zIndex: 0
                      },
                      '&:hover': {
                        bgcolor: '#333F1F',
                        boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
                        '&::before': {
                          left: 0
                        }
                      },
                      '& .MuiButton-startIcon': {
                        position: 'relative',
                        zIndex: 1,
                        color: 'white !important'
                      },
                      '& span': {
                        position: 'relative',
                        zIndex: 1,
                        color: 'white'
                      }
                    }}
                  >
                    <Box component="span" sx={{ position: 'relative', zIndex: 1, color: 'white' }}>
                      Add New Payment
                    </Box>
                  </Button>
                </motion.div>
              </Tooltip>
            </Box>
          </Paper>
        </motion.div>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          {[
            {
              title: 'Total Collected (YTD)',
              value: `$${(stats.totalCollected / 1000000).toFixed(1)}M`,
              icon: AccountBalance,
              gradient: 'linear-gradient(135deg, #8CA551 0%, #a8bf6f 100%)',
              delay: 0,
              subtitle: '+12%'
            },
            {
              title: 'Pending Review',
              value: stats.pendingPayloads,
              icon: Schedule,
              gradient: 'linear-gradient(135deg, #E5863C 0%, #f59c5a 100%)',
              delay: 0.1,
              subtitle: 'Needs Action'
            },
            {
              title: 'Recent Failures',
              value: `$${stats.recentFailures?.toLocaleString() || 0}`,
              icon: ErrorOutline,
              gradient: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
              delay: 0.2,
              subtitle: '-1%'
            },
            {
              title: 'Rejected',
              value: stats.rejectedPayloads,
              icon: Cancel,
              gradient: 'linear-gradient(135deg, #706f6f 0%, #8a8989 100%)',
              delay: 0.3,
              subtitle: 'Total'
            }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.delay, duration: 0.5 }}
                whileHover={{ y: -8 }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: stat.gradient,
                    color: 'white',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.85,
                          fontWeight: 600,
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: '0.75rem'
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <stat.icon sx={{ fontSize: 20 }} />
                      </Box>
                    </Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        fontFamily: '"Poppins", sans-serif',
                        letterSpacing: '-1px',
                        fontSize: '2.5rem',
                        mb: 0.5
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.85,
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    >
                      {stat.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(51, 63, 31, 0.08)',
              border: '1px solid rgba(140, 165, 81, 0.12)',
              background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)'
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: 'linear-gradient(135deg, rgba(51, 63, 31, 0.03) 0%, rgba(140, 165, 81, 0.03) 100%)',
                      borderBottom: '2px solid rgba(140, 165, 81, 0.2)'
                    }}
                  >
                    {['PROPERTY', 'PAYER', 'DATE', 'AMOUNT', 'TYPE', 'STATUS', 'DOCS', 'ACTIONS'].map((header) => (
                      <TableCell
                        key={header}
                        sx={{
                          fontWeight: 700,
                          color: '#333F1F',
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: '0.75rem',
                          letterSpacing: '1.5px',
                          textTransform: 'uppercase',
                          py: 2,
                          borderBottom: 'none'
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <Box display="flex" justifyContent="center" p={6}>
                            <CircularProgress sx={{ color: '#333F1F' }} />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : payloads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <Box
                            sx={{
                              py: 8,
                              textAlign: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 2
                            }}
                          >
                            <Box
                              sx={{
                                width: 80,
                                height: 80,
                                borderRadius: 4,
                                bgcolor: 'rgba(140, 165, 81, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 1
                              }}
                            >
                              <AccountBalance sx={{ fontSize: 40, color: '#8CA551' }} />
                            </Box>
                            <Typography
                              variant="h6"
                              sx={{
                                color: '#333F1F',
                                fontWeight: 600,
                                fontFamily: '"Poppins", sans-serif',
                                mb: 0.5
                              }}
                            >
                              No payment records found
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#706f6f',
                                fontFamily: '"Poppins", sans-serif',
                                mb: 2
                              }}
                            >
                              Start by adding your first payment
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<Add />}
                              onClick={() => handleOpenDialog()}
                              sx={{
                                borderRadius: 3,
                                bgcolor: '#333F1F',
                                textTransform: 'none',
                                fontFamily: '"Poppins", sans-serif',
                                fontWeight: 600,
                                px: 3,
                                '&:hover': {
                                  bgcolor: '#8CA551'
                                }
                              }}
                            >
                              New Payment
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      payloads.map((payload, index) => {
                        const statusColors = getStatusColor(payload.status)
                        const StatusIcon = statusColors.icon

                        return (
                          <motion.tr
                            key={payload._id}
                            component={TableRow}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            sx={{
                              transition: 'all 0.3s ease',
                              borderLeft: '3px solid transparent',
                              '&:hover': {
                                bgcolor: 'rgba(140, 165, 81, 0.04)',
                                transform: 'translateX(4px)',
                                boxShadow: '0 2px 8px rgba(51, 63, 31, 0.08)',
                                borderLeftColor: '#8CA551'
                              },
                              '&:last-child td': {
                                borderBottom: 'none'
                              }
                            }}
                          >
                            <TableCell>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: '#1a1a1a',
                                    fontFamily: '"Poppins", sans-serif'
                                  }}
                                >
                                  Unit {payload.property?.lot?.number || 'N/A'}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#706f6f',
                                    fontFamily: '"Poppins", sans-serif',
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  ID: #{payload.property?.model?.modelNumber || 'N/A'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    fontSize: '14px',
                                    bgcolor: '#8CA551',
                                    fontWeight: 600
                                  }}
                                >
                                  {payload.property?.user?.firstName?.charAt(0) || 'U'}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 500,
                                      color: '#1a1a1a',
                                      fontFamily: '"Poppins", sans-serif'
                                    }}
                                  >
                                    {payload.property?.user?.firstName} {payload.property?.user?.lastName}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#706f6f',
                                  fontFamily: '"Poppins", sans-serif'
                                }}
                              >
                                {new Date(payload.date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 700,
                                  color: '#333F1F',
                                  fontFamily: '"Poppins", sans-serif'
                                }}
                              >
                                ${payload.amount?.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={payload.type || 'N/A'}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  fontFamily: '"Poppins", sans-serif',
                                  height: 28,
                                  px: 1.5,
                                  fontSize: '0.75rem',
                                  letterSpacing: '0.5px',
                                  borderRadius: 2,
                                  textTransform: 'capitalize',
                                  bgcolor: 'rgba(33, 150, 243, 0.12)',
                                  color: '#1976d2',
                                  border: '1px solid rgba(33, 150, 243, 0.3)'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={payload.status}
                                icon={<StatusIcon />}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  fontFamily: '"Poppins", sans-serif',
                                  height: 28,
                                  px: 1.5,
                                  fontSize: '0.75rem',
                                  letterSpacing: '0.5px',
                                  borderRadius: 2,
                                  textTransform: 'capitalize',
                                  bgcolor: statusColors.bg,
                                  color: statusColors.color,
                                  border: `1px solid ${statusColors.border}`,
                                  '& .MuiChip-icon': { color: statusColors.color }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip title={getFileUrl(payload) ? 'Download file' : 'No file attached'}>
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDownload(payload)}
                                    disabled={!getFileUrl(payload)}
                                    sx={{
                                      bgcolor: 'rgba(140, 165, 81, 0.08)',
                                      border: '1px solid rgba(140, 165, 81, 0.2)',
                                      borderRadius: 2,
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        bgcolor: '#8CA551',
                                        borderColor: '#8CA551',
                                        transform: 'scale(1.1)',
                                        '& .MuiSvgIcon-root': {
                                          color: 'white'
                                        }
                                      },
                                      '&:disabled': {
                                        opacity: 0.3,
                                        bgcolor: 'rgba(112, 111, 111, 0.08)'
                                      }
                                    }}
                                  >
                                    <Download sx={{ fontSize: 18, color: '#8CA551' }} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDialog(payload)}
                                    sx={{
                                      bgcolor: 'rgba(140, 165, 81, 0.08)',
                                      border: '1px solid rgba(140, 165, 81, 0.2)',
                                      borderRadius: 2,
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        bgcolor: '#8CA551',
                                        borderColor: '#8CA551',
                                        transform: 'scale(1.1)',
                                        '& .MuiSvgIcon-root': {
                                          color: 'white'
                                        }
                                      }
                                    }}
                                  >
                                    <Edit sx={{ fontSize: 18, color: '#8CA551' }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Approve">
                                  <span>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleApprove(payload)}
                                      disabled={payload.status === 'signed'}
                                      sx={{
                                        bgcolor: 'rgba(76, 175, 80, 0.08)',
                                        border: '1px solid rgba(76, 175, 80, 0.2)',
                                        borderRadius: 2,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          bgcolor: '#4caf50',
                                          borderColor: '#4caf50',
                                          transform: 'scale(1.1)',
                                          '& .MuiSvgIcon-root': {
                                            color: 'white'
                                          }
                                        },
                                        '&:disabled': {
                                          opacity: 0.3,
                                          bgcolor: 'rgba(112, 111, 111, 0.08)'
                                        }
                                      }}
                                    >
                                      <CheckCircle sx={{ fontSize: 18, color: '#4caf50' }} />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <span>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleReject(payload)}
                                      disabled={payload.status === 'rejected'}
                                      sx={{
                                        bgcolor: 'rgba(211, 47, 47, 0.08)',
                                        border: '1px solid rgba(211, 47, 47, 0.2)',
                                        borderRadius: 2,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          bgcolor: '#d32f2f',
                                          borderColor: '#d32f2f',
                                          transform: 'scale(1.1)',
                                          '& .MuiSvgIcon-root': {
                                            color: 'white'
                                          }
                                        },
                                        '&:disabled': {
                                          opacity: 0.3,
                                          bgcolor: 'rgba(112, 111, 111, 0.08)'
                                        }
                                      }}
                                    >
                                      <Cancel sx={{ fontSize: 18, color: '#d32f2f' }} />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </motion.tr>
                        )
                      })
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </motion.div>

        {/* Dialog - Ya está bien estilizado en tu código actual */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: "0 20px 60px rgba(51, 63, 31, 0.15)",
            }
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
                <AttachFile sx={{ color: "white", fontSize: 24 }} />
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
                  {selectedPayload ? 'Edit Payment' : 'Add New Payment'}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: "#706f6f",
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  Manage and track payment record details
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
        
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Property"
                  value={formData.property}
                  onChange={(e) => setFormData({ ...formData, property: e.target.value })}
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
                  {properties.map((property) => (
                    <MenuItem 
                      key={property._id} 
                      value={property._id}
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
                      Lot {property.lot?.number} - {property.user?.firstName} {property.user?.lastName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
        
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Payment Date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
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
                  label="Amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
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
                    value="signed"
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
                    Signed
                  </MenuItem>
                  <MenuItem 
                    value="rejected"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: 'rgba(211, 47, 47, 0.08)'
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(211, 47, 47, 0.12)',
                        '&:hover': {
                          bgcolor: 'rgba(211, 47, 47, 0.18)'
                        }
                      }
                    }}
                  >
                    Rejected
                  </MenuItem>
                </TextField>
              </Grid>
        
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Payment Type"
                  value={formData.type || ""}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  required
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
                  {['initial down payment', 'complementary down payment', 'monthly payment', 'additional payment', 'closing payment'].map((type) => (
                    <MenuItem 
                      key={type}
                      value={type}
                      sx={{
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 500,
                        textTransform: 'capitalize',
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
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
        
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              variant="contained"
              onClick={handleSubmit}
              disabled={!formData.amount || !formData.property || !formData.type}
              startIcon={<CheckCircle />}
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
                "& .MuiButton-startIcon": {
                  position: "relative",
                  zIndex: 1,
                  color: "white !important"
                },
                "& span": {
                  position: "relative",
                  zIndex: 1,
                }
              }}
            >
              {selectedPayload ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}

export default Payloads