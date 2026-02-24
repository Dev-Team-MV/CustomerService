// import { useState, useEffect, useMemo } from 'react'
// import {
//   Box,
//   Typography,
//   Paper,
//   Grid,
//   Card,
//   CardContent,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Chip,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   MenuItem,
//   Tooltip,
//   Container,
//   Avatar,
//   CircularProgress
// } from '@mui/material'
// import {
//   Add,
//   Edit,
//   Delete,
//   Landscape,
//   CheckCircle,
//   Schedule,
//   Cancel,
//   TrendingUp,
//   AttachMoney,
//   Terrain
// } from '@mui/icons-material'
// import { motion, AnimatePresence } from 'framer-motion'
// import api from '../services/api'
// import PageHeader from '../components/PageHeader'
// import StatsCards from '../components/statscard'
// import DataTable from '../components/table/DataTable';
// import EmptyState from '../components/table/EmptyState';



// const Lots = () => {
//   const [lots, setLots] = useState([])
//   const [stats, setStats] = useState({ total: 0, available: 0, pending: 0, sold: 0 })
//   const [loading, setLoading] = useState(true)
//   const [openDialog, setOpenDialog] = useState(false)
//   const [selectedLot, setSelectedLot] = useState(null)
//   const [formData, setFormData] = useState({
//     number: '',
//     price: 0,
//     status: 'available'
//   })

//   useEffect(() => {
//     fetchData()
//   }, [])

//   const fetchData = async () => {
//     setLoading(true)
//     try {
//       const [lotsRes, statsRes] = await Promise.all([
//         api.get('/lots'),
//         api.get('/lots/stats')
//       ])
//       setLots(lotsRes.data)
//       setStats(statsRes.data)
//     } catch (error) {
//       console.error('Error fetching lots:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleOpenDialog = (lot = null) => {
//     if (lot) {
//       setSelectedLot(lot)
//       setFormData({
//         number: lot.number,
//         price: lot.price,
//         status: lot.status
//       })
//     } else {
//       setSelectedLot(null)
//       setFormData({ number: '', price: 0, status: 'available' })
//     }
//     setOpenDialog(true)
//   }

//   const handleCloseDialog = () => {
//     setOpenDialog(false)
//     setSelectedLot(null)
//   }

//   const handleSubmit = async () => {
//     try {
//       if (selectedLot) {
//         await api.put(`/lots/${selectedLot._id}`, formData)
//       } else {
//         await api.post('/lots', formData)
//       }
//       handleCloseDialog()
//       fetchData()
//     } catch (error) {
//       console.error('Error saving lot:', error)
//     }
//   }

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this lot?')) {
//       try {
//         await api.delete(`/lots/${id}`)
//         fetchData()
//       } catch (error) {
//         console.error('Error deleting lot:', error)
//       }
//     }
//   }
//     // ✅ DEFINIR COLUMNAS
  
//   const columns = useMemo(() => [
//     {
//       field: 'number',
//       headerName: 'LOT NUMBER',
//       minWidth: 150,
//       renderCell: ({ row }) => (
//         <Box display="flex" alignItems="center" gap={1.5}>
//           <Avatar
//             sx={{
//               width: 48,
//               height: 48,
//               bgcolor: 'transparent',
//               background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
//               color: 'white',
//               fontWeight: 700,
//               fontSize: '1rem',
//               fontFamily: '"Poppins", sans-serif',
//               border: '2px solid rgba(255, 255, 255, 0.9)',
//               boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
//             }}
//           >
//             {row.number}
//           </Avatar>
//           <Box>
//             <Typography
//               variant="body2"
//               sx={{
//                 fontWeight: 600,
//                 color: '#1a1a1a',
//                 fontFamily: '"Poppins", sans-serif',
//                 fontSize: '0.95rem'
//               }}
//             >
//               Lot {row.number}
//             </Typography>
//             <Typography
//               variant="caption"
//               sx={{
//                 color: '#706f6f',
//                 fontFamily: '"Poppins", sans-serif',
//                 fontSize: '0.7rem'
//               }}
//             >
//               ID: {row._id?.slice(-6)}
//             </Typography>
//           </Box>
//         </Box>
//       )
//     },
//     {
//       field: 'price',
//       headerName: 'PRICE',
//       renderCell: ({ value }) => (
//         <Box display="flex" alignItems="center" gap={0.5}>
//           <AttachMoney sx={{ fontSize: 18, color: '#8CA551' }} />
//           <Typography
//             variant="body2"
//             sx={{
//               fontWeight: 700,
//               color: '#333F1F',
//               fontFamily: '"Poppins", sans-serif',
//               fontSize: '1rem'
//             }}
//           >
//             {value?.toLocaleString()}
//           </Typography>
//         </Box>
//       )
//     },
//     {
//       field: 'status',
//       headerName: 'STATUS',
//       renderCell: ({ value }) => {
//         const config = {
//           available: { icon: CheckCircle, color: '#8CA551', bg: 'rgba(140, 165, 81, 0.12)' },
//           pending: { icon: Schedule, color: '#E5863C', bg: 'rgba(229, 134, 60, 0.12)' },
//           sold: { icon: Cancel, color: '#706f6f', bg: 'rgba(112, 111, 111, 0.12)' }
//         }[value] || { icon: CheckCircle, color: '#8CA551', bg: 'rgba(140, 165, 81, 0.12)' }; // ✅ FIX: Cambiar config.available por objeto default
  
//         return (
//           <Chip
//             label={value}
//             icon={<config.icon />}
//             size="small"
//             sx={{
//               fontWeight: 600,
//               fontFamily: '"Poppins", sans-serif',
//               height: 28,
//               px: 1.5,
//               fontSize: '0.75rem',
//               letterSpacing: '0.5px',
//               borderRadius: 2,
//               textTransform: 'capitalize',
//               bgcolor: config.bg,
//               color: config.color,
//               border: `1px solid ${config.color}40`,
//               '& .MuiChip-icon': { color: config.color }
//             }}
//           />
//         );
//       }
//     },
//     {
//       field: 'actions',
//       headerName: 'ACTIONS',
//       align: 'center',
//       renderCell: ({ row }) => (
//         <Box sx={{ display: 'flex', gap: 0.5 }}>
//           <Tooltip title="Edit Lot" placement="top">
//             <IconButton
//               size="small"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 // ✅ FIX: Llamar a handleOpenDialog en lugar de setSelectedLot + setOpenDialog
//                 handleOpenDialog(row);
//               }}
//               sx={{
//                 bgcolor: 'rgba(140, 165, 81, 0.08)',
//                 border: '1px solid rgba(140, 165, 81, 0.2)',
//                 borderRadius: 2,
//                 transition: 'all 0.3s ease',
//                 '&:hover': {
//                   bgcolor: '#8CA551',
//                   borderColor: '#8CA551',
//                   transform: 'scale(1.1)',
//                   '& .MuiSvgIcon-root': { color: 'white' }
//                 }
//               }}
//             >
//               <Edit sx={{ fontSize: 18, color: '#8CA551' }} />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="Delete Lot" placement="top">
//             <IconButton
//               size="small"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleDelete(row._id);
//               }}
//               sx={{
//                 bgcolor: 'rgba(229, 134, 60, 0.08)',
//                 border: '1px solid rgba(229, 134, 60, 0.2)',
//                 borderRadius: 2,
//                 transition: 'all 0.3s ease',
//                 '&:hover': {
//                   bgcolor: '#E5863C',
//                   borderColor: '#E5863C',
//                   transform: 'scale(1.1)',
//                   '& .MuiSvgIcon-root': { color: 'white' }
//                 }
//               }}
//             >
//               <Delete sx={{ fontSize: 18, color: '#E5863C' }} />
//             </IconButton>
//           </Tooltip>
//         </Box>
//       )
//     }
//   ], [handleOpenDialog, handleDelete]); // ✅ IMPORTANTE: Agregar dependencias
  

//   const lotsStats = [
//   {
//     title: 'Total Lots',
//     value: stats.total,
//     icon: Terrain,
//     gradient: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)',
//     color: '#333F1F',
//     delay: 0
//   },
//   {
//     title: 'Available',
//     value: stats.available,
//     icon: CheckCircle,
//     gradient: 'linear-gradient(135deg, #8CA551 0%, #a8bf6f 100%)',
//     color: '#8CA551',
//     delay: 0.1
//   },
//   {
//     title: 'Pending',
//     value: stats.pending,
//     icon: Schedule,
//     gradient: 'linear-gradient(135deg, #E5863C 0%, #f59c5a 100%)',
//     color: '#E5863C',
//     delay: 0.2
//   },
//   {
//     title: 'Sold',
//     value: stats.sold,
//     icon: TrendingUp,
//     gradient: 'linear-gradient(135deg, #706f6f 0%, #8a8989 100%)',
//     color: '#706f6f',
//     delay: 0.3
//   }
// ];

//   return (
//     <Box
//       sx={{
//         minHeight: '100vh',
//         background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
//         p: { xs: 2, sm: 3 }
//       }}
//     >
//       <Container maxWidth="xl">
//         {/* ✅ REEMPLAZAR TODO EL HEADER POR: */}
//         <PageHeader
//           icon={Landscape}
//           title="Lot Inventory"
//           subtitle="Manage availability and pricing for Lake Conroe properties"
//           actionButton={{
//             label: 'Add New Lot',
//             onClick: () => handleOpenDialog(),
//             icon: <Add />,
//             tooltip: 'Add New Lot'
//           }}
//         />

//         {/* Stats Cards */}
//               <StatsCards stats={lotsStats} loading={loading} />

//                 {/* ✅ TABLA REUTILIZABLE */}
//         <DataTable
//           columns={columns}
//   data={lots.slice().sort((a, b) => Number(a.number) - Number(b.number))} // Ordena por número de lote
//           loading={loading}
//           emptyState={
//             <EmptyState
//               icon={Landscape}
//               title="No lots available"
//               description="Get started by adding your first lot"
//               actionLabel="Add New Lot"
//               onAction={() => setOpenDialog(true)}
//             />
//           }
//           onRowClick={(row) => console.log('Row clicked:', row)}
//         />

//         {/* Dialog */}
//         <Dialog
//           open={openDialog}
//           onClose={handleCloseDialog}
//           maxWidth="sm"
//           fullWidth
//           PaperProps={{
//             sx: {
//               borderRadius: 4,
//               boxShadow: '0 20px 60px rgba(51, 63, 31, 0.15)'
//             }
//           }}
//         >
//           <DialogTitle>
//             <Box display="flex" alignItems="center" gap={2}>
//               <Box
//                 sx={{
//                   width: 48,
//                   height: 48,
//                   borderRadius: 3,
//                   bgcolor: '#333F1F',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
//                 }}
//               >
//                 <Landscape sx={{ color: 'white', fontSize: 24 }} />
//               </Box>
//               <Box>
//                 <Typography
//                   variant="h6"
//                   fontWeight={700}
//                   sx={{
//                     color: '#333F1F',
//                     fontFamily: '"Poppins", sans-serif'
//                   }}
//                 >
//                   {selectedLot ? 'Edit Lot' : 'Add New Lot'}
//                 </Typography>
//                 <Typography
//                   variant="caption"
//                   sx={{
//                     color: '#706f6f',
//                     fontFamily: '"Poppins", sans-serif'
//                   }}
//                 >
//                   Manage lot inventory details
//                 </Typography>
//               </Box>
//             </Box>
//           </DialogTitle>

//           <DialogContent sx={{ pt: 3 }}>
//             <Grid container spacing={2.5}>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Lot Number"
//                   value={formData.number}
//                   onChange={(e) => setFormData({ ...formData, number: e.target.value })}
//                   required
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 3,
//                       fontFamily: '"Poppins", sans-serif',
//                       '& fieldset': {
//                         borderColor: 'rgba(140, 165, 81, 0.3)',
//                         borderWidth: '2px'
//                       },
//                       '&:hover fieldset': {
//                         borderColor: '#8CA551'
//                       },
//                       '&.Mui-focused fieldset': {
//                         borderColor: '#333F1F',
//                         borderWidth: '2px'
//                       }
//                     },
//                     '& .MuiInputLabel-root': {
//                       fontFamily: '"Poppins", sans-serif',
//                       fontWeight: 500,
//                       color: '#706f6f',
//                       '&.Mui-focused': {
//                         color: '#333F1F',
//                         fontWeight: 600
//                       }
//                     }
//                   }}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   type="number"
//                   label="Price"
//                   value={formData.price}
//                   onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
//                   required
//                   InputProps={{
//                     startAdornment: (
//                       <Typography sx={{ mr: 0.5, fontSize: '0.875rem', color: '#333F1F', fontWeight: 600 }}>
//                         $
//                       </Typography>
//                     )
//                   }}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 3,
//                       fontFamily: '"Poppins", sans-serif',
//                       '& fieldset': {
//                         borderColor: 'rgba(140, 165, 81, 0.3)',
//                         borderWidth: '2px'
//                       },
//                       '&:hover fieldset': {
//                         borderColor: '#8CA551'
//                       },
//                       '&.Mui-focused fieldset': {
//                         borderColor: '#333F1F',
//                         borderWidth: '2px'
//                       }
//                     },
//                     '& .MuiInputLabel-root': {
//                       fontFamily: '"Poppins", sans-serif',
//                       fontWeight: 500,
//                       color: '#706f6f',
//                       '&.Mui-focused': {
//                         color: '#333F1F',
//                         fontWeight: 600
//                       }
//                     }
//                   }}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   select
//                   label="Status"
//                   value={formData.status}
//                   onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 3,
//                       fontFamily: '"Poppins", sans-serif',
//                       '& fieldset': {
//                         borderColor: 'rgba(140, 165, 81, 0.3)',
//                         borderWidth: '2px'
//                       },
//                       '&:hover fieldset': {
//                         borderColor: '#8CA551'
//                       },
//                       '&.Mui-focused fieldset': {
//                         borderColor: '#333F1F',
//                         borderWidth: '2px'
//                       }
//                     },
//                     '& .MuiInputLabel-root': {
//                       fontFamily: '"Poppins", sans-serif',
//                       fontWeight: 500,
//                       color: '#706f6f',
//                       '&.Mui-focused': {
//                         color: '#333F1F',
//                         fontWeight: 600
//                       }
//                     }
//                   }}
//                 >
//                   <MenuItem value="available" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                     Available
//                   </MenuItem>
//                   <MenuItem value="pending" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                     Pending
//                   </MenuItem>
//                   <MenuItem value="sold" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                     Sold
//                   </MenuItem>
//                 </TextField>
//               </Grid>
//             </Grid>
//           </DialogContent>

//           <DialogActions sx={{ p: 3, gap: 2 }}>
//             <Button
//               onClick={handleCloseDialog}
//               sx={{
//                 borderRadius: 3,
//                 textTransform: 'none',
//                 fontWeight: 600,
//                 px: 3,
//                 py: 1.2,
//                 color: '#706f6f',
//                 fontFamily: '"Poppins", sans-serif',
//                 border: '2px solid #e0e0e0',
//                 '&:hover': {
//                   bgcolor: 'rgba(112, 111, 111, 0.05)',
//                   borderColor: '#706f6f'
//                 }
//               }}
//             >
//               Cancel
//             </Button>

//             <Button
//               onClick={handleSubmit}
//               variant="contained"
//               disabled={!formData.number || !formData.price}
//               sx={{
//                 borderRadius: 3,
//                 bgcolor: '#333F1F',
//                 color: 'white',
//                 fontWeight: 600,
//                 textTransform: 'none',
//                 letterSpacing: '1px',
//                 fontFamily: '"Poppins", sans-serif',
//                 px: 4,
//                 py: 1.5,
//                 boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
//                 position: 'relative',
//                 overflow: 'hidden',
//                 '&::before': {
//                   content: '""',
//                   position: 'absolute',
//                   top: 0,
//                   left: '-100%',
//                   width: '100%',
//                   height: '100%',
//                   bgcolor: '#8CA551',
//                   transition: 'left 0.4s ease',
//                   zIndex: 0
//                 },
//                 '&:hover': {
//                   bgcolor: '#333F1F',
//                   boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
//                   '&::before': {
//                     left: 0
//                   }
//                 },
//                 '&:disabled': {
//                   bgcolor: '#e0e0e0',
//                   color: '#9e9e9e',
//                   boxShadow: 'none'
//                 },
//                 '& span': {
//                   position: 'relative',
//                   zIndex: 1
//                 }
//               }}
//             >
//               <span>{selectedLot ? 'Update' : 'Create'}</span>
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Container>
//     </Box>
//   )
// }

// export default Lots

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
  Container,
  Avatar,
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Landscape,
  CheckCircle,
  Schedule,
  Cancel,
  TrendingUp,
  AttachMoney,
  Terrain
} from '@mui/icons-material'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import StatsCards from '../components/statscard'
import DataTable from '../components/table/DataTable'
import EmptyState from '../components/table/EmptyState'

const Lots = () => {
  const { t } = useTranslation(['lots', 'common'])
  const [lots, setLots] = useState([])
  const [stats, setStats] = useState({ total: 0, available: 0, pending: 0, sold: 0 })
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedLot, setSelectedLot] = useState(null)
  const [formData, setFormData] = useState({
    number: '',
    price: 0,
    status: 'available'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
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
        price: lot.price,
        status: lot.status
      })
    } else {
      setSelectedLot(null)
      setFormData({ number: '', price: 0, status: 'available' })
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
    if (window.confirm(t('lots:confirmDelete'))) {
      try {
        await api.delete(`/lots/${id}`)
        fetchData()
      } catch (error) {
        console.error('Error deleting lot:', error)
      }
    }
  }

  // Columnas de la tabla
  const columns = useMemo(() => [
    {
      field: 'number',
      headerName: t('lots:table.lotNumber'),
      minWidth: 150,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'transparent',
              background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              fontFamily: '"Poppins", sans-serif',
              border: '2px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
            }}
          >
            {row.number}
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#1a1a1a',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.95rem'
              }}
            >
              {t('lots:table.lot')} {row.number}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.7rem'
              }}
            >
              ID: {row._id?.slice(-6)}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'price',
      headerName: t('lots:table.price'),
      renderCell: ({ value }) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <AttachMoney sx={{ fontSize: 18, color: '#8CA551' }} />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: '#333F1F',
              fontFamily: '"Poppins", sans-serif',
              fontSize: '1rem'
            }}
          >
            {value?.toLocaleString()}
          </Typography>
        </Box>
      )
    },
    {
      field: 'status',
      headerName: t('lots:table.status'),
      renderCell: ({ value }) => {
        const config = {
          available: { icon: CheckCircle, color: '#8CA551', bg: 'rgba(140, 165, 81, 0.12)', label: t('lots:status.available') },
          pending: { icon: Schedule, color: '#E5863C', bg: 'rgba(229, 134, 60, 0.12)', label: t('lots:status.pending') },
          sold: { icon: Cancel, color: '#706f6f', bg: 'rgba(112, 111, 111, 0.12)', label: t('lots:status.sold') }
        }[value] || { icon: CheckCircle, color: '#8CA551', bg: 'rgba(140, 165, 81, 0.12)', label: value }
        return (
          <Chip
            label={config.label}
            icon={<config.icon />}
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
              bgcolor: config.bg,
              color: config.color,
              border: `1px solid ${config.color}40`,
              '& .MuiChip-icon': { color: config.color }
            }}
          />
        )
      }
    },
    {
      field: 'actions',
      headerName: t('lots:table.actions'),
      align: 'center',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('lots:actions.edit')} placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenDialog(row)
              }}
              sx={{
                bgcolor: 'rgba(140, 165, 81, 0.08)',
                border: '1px solid rgba(140, 165, 81, 0.2)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#8CA551',
                  borderColor: '#8CA551',
                  transform: 'scale(1.1)',
                  '& .MuiSvgIcon-root': { color: 'white' }
                }
              }}
            >
              <Edit sx={{ fontSize: 18, color: '#8CA551' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('lots:actions.delete')} placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(row._id)
              }}
              sx={{
                bgcolor: 'rgba(229, 134, 60, 0.08)',
                border: '1px solid rgba(229, 134, 60, 0.2)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#E5863C',
                  borderColor: '#E5863C',
                  transform: 'scale(1.1)',
                  '& .MuiSvgIcon-root': { color: 'white' }
                }
              }}
            >
              <Delete sx={{ fontSize: 18, color: '#E5863C' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [t]) // Solo depende de t

  // Stats cards traducidas
  const lotsStats = [
    {
      title: t('lots:stats.total'),
      value: stats.total,
      icon: Terrain,
      gradient: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)',
      color: '#333F1F',
      delay: 0
    },
    {
      title: t('lots:stats.available'),
      value: stats.available,
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #8CA551 0%, #a8bf6f 100%)',
      color: '#8CA551',
      delay: 0.1
    },
    {
      title: t('lots:stats.pending'),
      value: stats.pending,
      icon: Schedule,
      gradient: 'linear-gradient(135deg, #E5863C 0%, #f59c5a 100%)',
      color: '#E5863C',
      delay: 0.2
    },
    {
      title: t('lots:stats.sold'),
      value: stats.sold,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #706f6f 0%, #8a8989 100%)',
      color: '#706f6f',
      delay: 0.3
    }
  ]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="xl">
        <PageHeader
          icon={Landscape}
          title={t('lots:title')}
          subtitle={t('lots:subtitle')}
          actionButton={{
            label: t('lots:actions.add'),
            onClick: () => handleOpenDialog(),
            icon: <Add />,
            tooltip: t('lots:actions.add')
          }}
        />

        <StatsCards stats={lotsStats} loading={loading} />

        <DataTable
          columns={columns}
          data={lots.slice().sort((a, b) => Number(a.number) - Number(b.number))}
          loading={loading}
          emptyState={
            <EmptyState
              icon={Landscape}
              title={t('lots:empty.title')}
              description={t('lots:empty.description')}
              actionLabel={t('lots:empty.action')}
              onAction={() => setOpenDialog(true)}
            />
          }
          onRowClick={(row) => console.log('Row clicked:', row)}
        />

        {/* Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(51, 63, 31, 0.15)'
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
                  bgcolor: '#333F1F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
                }}
              >
                <Landscape sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {selectedLot ? t('lots:dialog.editTitle') : t('lots:dialog.addTitle')}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {t('lots:dialog.subtitle')}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('lots:form.number')}
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontFamily: '"Poppins", sans-serif',
                      '& fieldset': {
                        borderColor: 'rgba(140, 165, 81, 0.3)',
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#8CA551'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#333F1F',
                        borderWidth: '2px'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      color: '#706f6f',
                      '&.Mui-focused': {
                        color: '#333F1F',
                        fontWeight: 600
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label={t('lots:form.price')}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                  InputProps={{
                    startAdornment: (
                      <Typography sx={{ mr: 0.5, fontSize: '0.875rem', color: '#333F1F', fontWeight: 600 }}>
                        $
                      </Typography>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontFamily: '"Poppins", sans-serif',
                      '& fieldset': {
                        borderColor: 'rgba(140, 165, 81, 0.3)',
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#8CA551'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#333F1F',
                        borderWidth: '2px'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      color: '#706f6f',
                      '&.Mui-focused': {
                        color: '#333F1F',
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
                  label={t('lots:form.status')}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontFamily: '"Poppins", sans-serif',
                      '& fieldset': {
                        borderColor: 'rgba(140, 165, 81, 0.3)',
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#8CA551'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#333F1F',
                        borderWidth: '2px'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      color: '#706f6f',
                      '&.Mui-focused': {
                        color: '#333F1F',
                        fontWeight: 600
                      }
                    }
                  }}
                >
                  <MenuItem value="available" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    {t('lots:status.available')}
                  </MenuItem>
                  <MenuItem value="pending" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    {t('lots:status.pending')}
                  </MenuItem>
                  <MenuItem value="sold" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    {t('lots:status.sold')}
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
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.2,
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif',
                border: '2px solid #e0e0e0',
                '&:hover': {
                  bgcolor: 'rgba(112, 111, 111, 0.05)',
                  borderColor: '#706f6f'
                }
              }}
            >
              {t('common:actions.cancel')}
            </Button>

            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!formData.number || !formData.price}
              sx={{
                borderRadius: 3,
                bgcolor: '#333F1F',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '1px',
                fontFamily: '"Poppins", sans-serif',
                px: 4,
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
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#9e9e9e',
                  boxShadow: 'none'
                },
                '& span': {
                  position: 'relative',
                  zIndex: 1
                }
              }}
            >
              <span>{selectedLot ? t('lots:dialog.update') : t('lots:dialog.create')}</span>
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}

export default Lots