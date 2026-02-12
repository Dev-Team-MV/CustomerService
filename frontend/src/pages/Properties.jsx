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
  Tooltip
} from '@mui/material'
import { 
  Add, 
  Visibility, 
  Construction,
  PhotoLibrary
} from '@mui/icons-material'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import ConstructionPhasesModal from '../components/ConstructionPhasesModal'
import { motion } from 'framer-motion'
import DescriptionIcon from '@mui/icons-material/Description'
import ContractsModal from '../components/ContractsModal'

const Properties = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [phasesModalOpen, setPhasesModalOpen] = useState(false)

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

    const [contractsModalOpen, setContractsModalOpen] = useState(false)
  const [contractsProperty, setContractsProperty] = useState(null)
  
  const handleOpenContracts = (property) => {
    setContractsProperty(property)
    setContractsModalOpen(true)
  }
  const handleCloseContracts = () => {
    setContractsModalOpen(false)
    setContractsProperty(null)
  }

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
    console.log('View property:', property)
  }

  const handleOpenPhases = (property) => {
    setSelectedProperty(property)
    setPhasesModalOpen(true)
  }

  const handleClosePhases = () => {
    setPhasesModalOpen(false)
    setSelectedProperty(null)
    fetchData() // Refresh data after closing
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'sold': return 'success'
      case 'active': return 'info'
      case 'pending': return 'warning'
      default: return 'default'
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
  
    // Encuentra la primera fase incompleta (no 100%)
    const firstIncompleteIndex = property.phases.findIndex(p => p.constructionPercentage < 100)
    // Si todas están completas, muestra la última fase
    const current = firstIncompleteIndex === -1 ? totalPhases : firstIncompleteIndex + 1
  
    console.log('fases completas', completedPhases);
    return {
      current,
      completed: completedPhases,
      total: totalPhases,
      percentage: Math.round(avgProgress)
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
    <>
              <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
    <Box
    sx={{p: 3}}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Property Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Oversee inventory, pricing, and resident assignments across the estate.
          </Typography>
        </Box>
        <Tooltip title="Add Property" placement="left">
          <Button
            variant="contained"
            onClick={handleAddProperty}
            sx={{
              bgcolor: '#4a7c59',
              '&:hover': { bgcolor: '#3d664a' },
              minWidth: { xs: 48, sm: 'auto' },
              width: { xs: 48, sm: 'auto' },
              height: { xs: 48, sm: 'auto' },
              p: { xs: 0, sm: '6px 16px' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 50
            }}
          >
            <Add sx={{ display: { xs: 'block', sm: 'none' }, fontSize: 24 }} />
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
              <Add />
              Add Property
            </Box>
          </Button>
        </Tooltip>
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
                <TableCell>CONSTRUCTION PHASE</TableCell>
                <TableCell>PRICE</TableCell>
                {isAdmin && <TableCell>CONTRACTS</TableCell>}
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No properties found. Click "Add Property" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property) => {
                  const phaseProgress = getPhaseProgress(property)
                  
                  return (
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
                        <Box sx={{ minWidth: 140 }}>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <Construction fontSize="small" color="primary" />
                            <Typography variant="body2" fontWeight="600">
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
                                bgcolor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: phaseProgress.percentage === 100 ? 'success.main' : 'primary.main'
                                }
                              }}
                            />
                          </Tooltip>
                          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                            {phaseProgress.completed} completed • {phaseProgress.percentage}%
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<PhotoLibrary />}
                            onClick={() => handleOpenPhases(property)}
                            sx={{ mt: 1, fontSize: '0.7rem' }}
                            variant="outlined"
                          >
                            {isAdmin ? 'Manage Phases' : 'View Progress'}
                          </Button>
                        </Box>
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
                                {isAdmin && (
            <TableCell>
              <IconButton
                size="small"
                onClick={() => handleOpenContracts(property)}
                title="Manage contracts"
              >
                <DescriptionIcon />
              </IconButton>
            </TableCell>
          )}
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
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal de Fases de Construcción */}
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
    </Box>
    </motion.div>
    </>
  )
}

export default Properties