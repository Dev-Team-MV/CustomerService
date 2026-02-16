// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
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
//   LinearProgress,
//   Tooltip
// } from '@mui/material'
// import { 
//   Add, 
//   Visibility, 
//   Construction,
//   PhotoLibrary
// } from '@mui/icons-material'
// import api from '../services/api'
// import { useAuth } from '../context/AuthContext'
// import ConstructionPhasesModal from '../components/ConstructionPhasesModal'
// import { motion } from 'framer-motion'
// import DescriptionIcon from '@mui/icons-material/Description'
// import ContractsModal from '../components/ContractsModal'

// const Properties = () => {
//   const navigate = useNavigate()
//   const { user } = useAuth()
//   const [properties, setProperties] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [selectedProperty, setSelectedProperty] = useState(null)
//   const [phasesModalOpen, setPhasesModalOpen] = useState(false)

//   const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

//     const [contractsModalOpen, setContractsModalOpen] = useState(false)
//   const [contractsProperty, setContractsProperty] = useState(null)
  
//   const handleOpenContracts = (property) => {
//     setContractsProperty(property)
//     setContractsModalOpen(true)
//   }
//   const handleCloseContracts = () => {
//     setContractsModalOpen(false)
//     setContractsProperty(null)
//   }

//   useEffect(() => {
//     fetchData()
//   }, [])

//   const fetchData = async () => {
//     try {
//       const propertiesRes = await api.get('/properties')
//       setProperties(propertiesRes.data)
//     } catch (error) {
//       console.error('Error fetching data:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleAddProperty = () => {
//     navigate('/properties/select')
//   }

//   const handleViewProperty = (property) => {
//     console.log('View property:', property)
//   }

//   const handleOpenPhases = (property) => {
//     setSelectedProperty(property)
//     setPhasesModalOpen(true)
//   }

//   const handleClosePhases = () => {
//     setPhasesModalOpen(false)
//     setSelectedProperty(null)
//     fetchData() // Refresh data after closing
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'sold': return 'success'
//       case 'active': return 'info'
//       case 'pending': return 'warning'
//       default: return 'default'
//     }
//   }

//   const getPhaseProgress = (property) => {
//     if (!property.phases || property.phases.length === 0) {
//       return { current: 1, total: 9, percentage: 0, completed: 0 }
//     }
  
//     const totalPhases = property.phases.length
//     const completedPhases = property.phases.filter(p => p.constructionPercentage === 100).length
    
//     const totalProgress = property.phases.reduce((sum, phase) => sum + (phase.constructionPercentage || 0), 0)
//     const avgProgress = totalProgress / totalPhases
  
//     // Encuentra la primera fase incompleta (no 100%)
//     const firstIncompleteIndex = property.phases.findIndex(p => p.constructionPercentage < 100)
//     // Si todas están completas, muestra la última fase
//     const current = firstIncompleteIndex === -1 ? totalPhases : firstIncompleteIndex + 1
  
//     console.log('fases completas', completedPhases);
//     return {
//       current,
//       completed: completedPhases,
//       total: totalPhases,
//       percentage: Math.round(avgProgress)
//     }
//   }


//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
//         <Typography>Loading properties...</Typography>
//       </Box>
//     )
//   }

//   return (
//     <>
//               <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2, duration: 0.6 }}
//           >
//     <Box
//     sx={{p: 3}}
//     >
//       <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//         <Box>
//           <Typography variant="h4" fontWeight="bold">
//             Property Management
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             Oversee inventory, pricing, and resident assignments across the estate.
//           </Typography>
//         </Box>
        
//         <Tooltip title="Add Property" placement="left">
//           <Button
//             variant="contained"
//             onClick={handleAddProperty}
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
//               <span>Add Property</span>
//             </Box>
//           </Button>
//         </Tooltip>
        
//       </Box>

//       <Paper>
//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>LOT INFO</TableCell>
//                 <TableCell>MODEL</TableCell>
//                 <TableCell>FACADE</TableCell>
//                 <TableCell>RESIDENT / OWNER</TableCell>
//                 <TableCell>STATUS</TableCell>
//                 <TableCell>CONSTRUCTION PHASE</TableCell>
//                 <TableCell>PRICE</TableCell>
//                 {isAdmin && <TableCell>CONTRACTS</TableCell>}
//                 <TableCell>ACTIONS</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {properties.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
//                     <Typography variant="body2" color="text.secondary">
//                       No properties found. Click "Add Property" to create one.
//                     </Typography>
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 properties.map((property) => {
//                   const phaseProgress = getPhaseProgress(property)
                  
//                   return (
//                     <TableRow key={property._id} hover>
//                       <TableCell>
//                         <Box display="flex" alignItems="center" gap={1}>
//                           <Avatar sx={{ bgcolor: 'primary.light' }}>
//                             {property.lot?.number}
//                           </Avatar>
//                           <Box>
//                             <Typography variant="body2" fontWeight="500">
//                               Lot {property.lot?.number}
//                             </Typography>
//                             <Typography variant="caption" color="text.secondary">
//                               Section {property.lot?.section || 'N/A'}
//                             </Typography>
//                           </Box>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="body2" fontWeight="500">
//                           {property.model?.model || 'N/A'}
//                         </Typography>
//                         <Typography variant="caption" color="text.secondary">
//                           {property.model?.bedrooms}BR / {property.model?.bathrooms}BA
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="body2">
//                           {property.facade?.title || 'Not selected'}
//                         </Typography>
//                         {property.facade?.price > 0 && (
//                           <Typography variant="caption" color="success.main">
//                             +${property.facade.price.toLocaleString()}
//                           </Typography>
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         <Box display="flex" alignItems="center" gap={1}>
//                           <Avatar sx={{ width: 32, height: 32, fontSize: '14px', bgcolor: 'secondary.main' }}>
//                             {property.user?.firstName?.charAt(0) || property.client?.firstName?.charAt(0)}
//                           </Avatar>
//                           <Box>
//                             <Typography variant="body2">
//                               {property.user?.firstName || property.client?.firstName} {property.user?.lastName || property.client?.lastName}
//                             </Typography>
//                             <Typography variant="caption" color="text.secondary">
//                               {property.user?.email || property.client?.email}
//                             </Typography>
//                           </Box>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           label={property.status || 'pending'}
//                           color={getStatusColor(property.status)}
//                           size="small"
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Box sx={{ minWidth: 140 }}>
//                           <Box display="flex" alignItems="center" gap={1} mb={0.5}>
//                             <Construction fontSize="small" color="primary" />
//                             <Typography variant="body2" fontWeight="600">
//                               Phase {phaseProgress.current} / {phaseProgress.total}
//                             </Typography>
//                           </Box>
//                           <Tooltip title={`${phaseProgress.completed} phases completed`}>
//                             <LinearProgress 
//                               variant="determinate" 
//                               value={phaseProgress.percentage}
//                               sx={{ 
//                                 height: 6, 
//                                 borderRadius: 1,
//                                 bgcolor: 'grey.200',
//                                 '& .MuiLinearProgress-bar': {
//                                   bgcolor: phaseProgress.percentage === 100 ? 'success.main' : 'primary.main'
//                                 }
//                               }}
//                             />
//                           </Tooltip>
//                           <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
//                             {phaseProgress.completed} completed • {phaseProgress.percentage}%
//                           </Typography>
//                           <Button
//                             size="small"
//                             startIcon={<PhotoLibrary />}
//                             onClick={() => handleOpenPhases(property)}
//                             sx={{ mt: 1, fontSize: '0.7rem' }}
//                             variant="outlined"
//                           >
//                             {isAdmin ? 'Manage Phases' : 'View Progress'}
//                           </Button>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="body2" fontWeight="600">
//                           ${property.presalePrice?.toLocaleString() || property.price?.toLocaleString()}
//                         </Typography>
//                         {property.pending > 0 && (
//                           <Typography variant="caption" color="warning.main" display="block">
//                             Pending: ${property.pending?.toLocaleString()}
//                           </Typography>
//                         )}
//                         {property.initialPayment > 0 && (
//                           <Typography variant="caption" color="success.main" display="block">
//                             Paid: ${property.initialPayment?.toLocaleString()}
//                           </Typography>
//                         )}
//                       </TableCell>
//                                 {isAdmin && (
//             <TableCell>
//               <IconButton
//                 size="small"
//                 onClick={() => handleOpenContracts(property)}
//                 title="Manage contracts"
//               >
//                 <DescriptionIcon />
//               </IconButton>
//             </TableCell>
//           )}
//                       <TableCell>
//                         <IconButton 
//                           size="small" 
//                           onClick={() => handleViewProperty(property)}
//                           title="View details"
//                         >
//                           <Visibility fontSize="small" />
//                         </IconButton>
//                       </TableCell>
//                     </TableRow>
//                   )
//                 })
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>

//       {/* Modal de Fases de Construcción */}
//       {selectedProperty && (
//         <ConstructionPhasesModal
//           open={phasesModalOpen}
//           property={selectedProperty}
//           onClose={handleClosePhases}
//           isAdmin={isAdmin}
//         />
//       )}

//             {contractsProperty && (
//         <ContractsModal
//           open={contractsModalOpen}
//           onClose={handleCloseContracts}
//           property={contractsProperty}
//         />
//       )}
//     </Box>
//     </motion.div>
//     </>
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
  IconButton,
  LinearProgress,
  Tooltip,
  Container,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material'
import { 
  Add, 
  Visibility, 
  Construction,
  PhotoLibrary,
  Home,
  CheckCircle,
  Schedule,
  TrendingUp,
  AttachMoney
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import ConstructionPhasesModal from '../components/ConstructionPhasesModal'
import DescriptionIcon from '@mui/icons-material/Description'
import ContractsModal from '../components/ContractsModal'

const Properties = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [phasesModalOpen, setPhasesModalOpen] = useState(false)
  const [contractsModalOpen, setContractsModalOpen] = useState(false)
  const [contractsProperty, setContractsProperty] = useState(null)

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
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
    console.log('View property:', property)
  }

  const handleOpenPhases = (property) => {
    setSelectedProperty(property)
    setPhasesModalOpen(true)
  }

  const handleClosePhases = () => {
    setPhasesModalOpen(false)
    setSelectedProperty(null)
    fetchData()
  }

  const handleOpenContracts = (property) => {
    setContractsProperty(property)
    setContractsModalOpen(true)
  }

  const handleCloseContracts = () => {
    setContractsModalOpen(false)
    setContractsProperty(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'sold': return { bg: 'rgba(140, 165, 81, 0.12)', color: '#333F1F', border: 'rgba(140, 165, 81, 0.3)' }
      case 'active': return { bg: 'rgba(33, 150, 243, 0.12)', color: '#1976d2', border: 'rgba(33, 150, 243, 0.3)' }
      case 'pending': return { bg: 'rgba(229, 134, 60, 0.12)', color: '#E5863C', border: 'rgba(229, 134, 60, 0.3)' }
      default: return { bg: 'rgba(112, 111, 111, 0.12)', color: '#706f6f', border: 'rgba(112, 111, 111, 0.3)' }
    }
  }

  const getPhaseProgress = (property) => {
    if (!property.phases || property.phases.length === 0) {
      return { current: 1, total: 9, percentage: 0, completed: 0 }
    }

    const totalPhases = property.phases.length
    const completedPhases = property.phases.filter(p => p.constructionPercentage === 100).length
    const totalProgress = property.phases.reduce((sum, phase) => sum + (phase.constructionPercentage || 0), 0)
    const avgProgress = totalProgress / totalPhases
    const firstIncompleteIndex = property.phases.findIndex(p => p.constructionPercentage < 100)
    const current = firstIncompleteIndex === -1 ? totalPhases : firstIncompleteIndex + 1

    return {
      current,
      completed: completedPhases,
      total: totalPhases,
      percentage: Math.round(avgProgress)
    }
  }

  // Calcular estadísticas
  const stats = {
    total: properties.length,
    sold: properties.filter(p => p.status === 'sold').length,
    active: properties.filter(p => p.status === 'active').length,
    pending: properties.filter(p => p.status === 'pending').length
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
                    <Home sx={{ fontSize: { xs: 28, md: 32 }, color: 'white' }} />
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
                    Property Management
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#706f6f',
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: { xs: '0.875rem', md: '1rem' }
                    }}
                  >
                    Oversee inventory, pricing, and resident assignments across the estate
                  </Typography>
                </Box>
              </Box>

              <Tooltip title="Add Property" placement="left">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    onClick={handleAddProperty}
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
                        color: 'white', // 👈 Asegura color blanco
                        '&::before': {
                          left: 0
                        },
                        '& .MuiButton-startIcon': {
                          color: 'white' // 👈 Icono blanco en hover
                        }
                      },
                      '& .MuiButton-startIcon': {
                        position: 'relative',
                        zIndex: 1,
                        color: 'white',
                        transition: 'color 0.3s ease'
                      },
                      '& .MuiButton-label': {
                        position: 'relative',
                        zIndex: 1,
                        color: 'white'
                      }
                    }}
                  >
                     <Box component="span" sx={{ position: 'relative', zIndex: 1, color: 'white' }}>
                      Add a New Propertie
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
              title: 'Total Properties',
              value: stats.total,
              icon: Home,
              gradient: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)',
              delay: 0
            },
            {
              title: 'Sold',
              value: stats.sold,
              icon: CheckCircle,
              gradient: 'linear-gradient(135deg, #8CA551 0%, #a8bf6f 100%)',
              delay: 0.1
            },
            {
              title: 'Active',
              value: stats.active,
              icon: TrendingUp,
              gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              delay: 0.2
            },
            {
              title: 'Pending',
              value: stats.pending,
              icon: Schedule,
              gradient: 'linear-gradient(135deg, #E5863C 0%, #f59c5a 100%)',
              delay: 0.3
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
                        fontSize: '2.5rem'
                      }}
                    >
                      {stat.value}
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
                    {['LOT INFO', 'MODEL', 'FACADE', 'RESIDENT / OWNER', 'STATUS', 'CONSTRUCTION PHASE', 'PRICE', isAdmin && 'CONTRACTS', 'ACTIONS'].filter(Boolean).map((header) => (
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
                        <TableCell colSpan={isAdmin ? 9 : 8}>
                          <Box display="flex" justifyContent="center" p={6}>
                            <CircularProgress sx={{ color: '#333F1F' }} />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : properties.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 9 : 8}>
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
                              <Home sx={{ fontSize: 40, color: '#8CA551' }} />
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
                              No properties found
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#706f6f',
                                fontFamily: '"Poppins", sans-serif',
                                mb: 2
                              }}
                            >
                              Click "Add Property" to create one
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<Add />}
                              onClick={handleAddProperty}
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
                              Add Property
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      properties.map((property, index) => {
                        const phaseProgress = getPhaseProgress(property)
                        const statusColors = getStatusColor(property.status)

                        return (
                          <motion.tr
                            key={property._id}
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
                              <Box display="flex" alignItems="center" gap={1.5}>
                                <Avatar
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: 'transparent',
                                    background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    fontFamily: '"Poppins", sans-serif',
                                    border: '2px solid rgba(255, 255, 255, 0.9)',
                                    boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
                                  }}
                                >
                                  {property.lot?.number}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      color: '#1a1a1a',
                                      fontFamily: '"Poppins", sans-serif'
                                    }}
                                  >
                                    Lot {property.lot?.number}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: '#706f6f',
                                      fontFamily: '"Poppins", sans-serif',
                                      fontSize: '0.7rem'
                                    }}
                                  >
                                    Section {property.lot?.section || 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: '#1a1a1a',
                                  fontFamily: '"Poppins", sans-serif'
                                }}
                              >
                                {property.model?.model || 'N/A'}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#706f6f',
                                  fontFamily: '"Poppins", sans-serif',
                                  fontSize: '0.7rem'
                                }}
                              >
                                {property.model?.bedrooms}BR / {property.model?.bathrooms}BA
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  color: '#1a1a1a',
                                  fontFamily: '"Poppins", sans-serif'
                                }}
                              >
                                {property.facade?.title || 'Not selected'}
                              </Typography>
                              {property.facade?.price > 0 && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#8CA551',
                                    fontFamily: '"Poppins", sans-serif',
                                    fontWeight: 600,
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  +${property.facade.price.toLocaleString()}
                                </Typography>
                              )}
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
                                  {property.user?.firstName?.charAt(0) || property.client?.firstName?.charAt(0)}
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
                                    {property.user?.firstName || property.client?.firstName}{' '}
                                    {property.user?.lastName || property.client?.lastName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: '#706f6f',
                                      fontFamily: '"Poppins", sans-serif',
                                      fontSize: '0.7rem'
                                    }}
                                  >
                                    {property.user?.email || property.client?.email}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={property.status || 'pending'}
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
                                  border: `1px solid ${statusColors.border}`
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ minWidth: 140 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                  <Construction
                                    sx={{
                                      fontSize: 16,
                                      color: '#8CA551'
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 700,
                                      color: '#333F1F',
                                      fontFamily: '"Poppins", sans-serif',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    Phase {phaseProgress.current} / {phaseProgress.total}
                                  </Typography>
                                </Box>
                                <Tooltip title={`${phaseProgress.completed} phases completed`}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={phaseProgress.percentage}
                                    sx={{
                                      height: 6,
                                      borderRadius: 1,
                                      bgcolor: 'rgba(140, 165, 81, 0.12)',
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: phaseProgress.percentage === 100 ? '#8CA551' : '#333F1F',
                                        borderRadius: 1
                                      }
                                    }}
                                  />
                                </Tooltip>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#706f6f',
                                    fontFamily: '"Poppins", sans-serif',
                                    fontSize: '0.7rem',
                                    display: 'block',
                                    mt: 0.5
                                  }}
                                >
                                  {phaseProgress.completed} completed • {phaseProgress.percentage}%
                                </Typography>
                                <Button
                                  size="small"
                                  startIcon={<PhotoLibrary sx={{ fontSize: 14 }} />}
                                  onClick={() => handleOpenPhases(property)}
                                  sx={{
                                    mt: 1,
                                    fontSize: '0.7rem',
                                    textTransform: 'none',
                                    fontFamily: '"Poppins", sans-serif',
                                    fontWeight: 600,
                                    color: '#333F1F',
                                    borderColor: 'rgba(51, 63, 31, 0.3)',
                                    '&:hover': {
                                      borderColor: '#333F1F',
                                      bgcolor: 'rgba(51, 63, 31, 0.04)'
                                    }
                                  }}
                                  variant="outlined"
                                >
                                  {isAdmin ? 'Manage Phases' : 'View Progress'}
                                </Button>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                <AttachMoney sx={{ fontSize: 16, color: '#8CA551' }} />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 700,
                                    color: '#333F1F',
                                    fontFamily: '"Poppins", sans-serif'
                                  }}
                                >
                                  {(property.presalePrice || property.price)?.toLocaleString()}
                                </Typography>
                              </Box>
                              {property.pending > 0 && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#E5863C',
                                    fontFamily: '"Poppins", sans-serif',
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    display: 'block'
                                  }}
                                >
                                  Pending: ${property.pending?.toLocaleString()}
                                </Typography>
                              )}
                              {property.initialPayment > 0 && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#8CA551',
                                    fontFamily: '"Poppins", sans-serif',
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    display: 'block'
                                  }}
                                >
                                  Paid: ${property.initialPayment?.toLocaleString()}
                                </Typography>
                              )}
                            </TableCell>
                            {isAdmin && (
                              <TableCell>
                                <Tooltip title="Manage contracts" placement="top">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenContracts(property)}
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
                                    <DescriptionIcon sx={{ fontSize: 18, color: '#8CA551' }} />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            )}
                            <TableCell>
                              <Tooltip title="View details" placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewProperty(property)}
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
                                  <Visibility sx={{ fontSize: 18, color: '#8CA551' }} />
                                </IconButton>
                              </Tooltip>
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

        {/* Modals */}
        {selectedProperty && (
          <ConstructionPhasesModal
            open={phasesModalOpen}
            property={selectedProperty}
            onClose={handleClosePhases}
            isAdmin={isAdmin}
          />
        )}

        {contractsProperty && (
          <ContractsModal
            open={contractsModalOpen}
            onClose={handleCloseContracts}
            property={contractsProperty}
          />
        )}
      </Container>
    </Box>
  )
}

export default Properties