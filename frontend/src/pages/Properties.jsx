import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  LinearProgress,
  Tooltip,
  Container,
  Chip,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
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
  AttachMoney,
  Edit as EditIcon,
  Description as DescriptionIcon,
  SortByAlpha,
  FilterList
} from '@mui/icons-material'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import ConstructionPhasesModal from '../components/ConstructionPhasesModal'
import ContractsModal from '../components/ContractsModal'
import EditPropertyModal from '../components/property/EditPriceModal'
import PageHeader from '../components/PageHeader'
import StatsCards from '../components/statscard'
import DataTable from '../components/table/DataTable'
import EmptyState from '../components/table/EmptyState'
import propertyService from '../services/propertyService'
import PropertyDetailsModal from '../components/myProperty/PropertyDetailsModal'

const Properties = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [phasesModalOpen, setPhasesModalOpen] = useState(false)
  const [contractsModalOpen, setContractsModalOpen] = useState(false)
  const [contractsProperty, setContractsProperty] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [propertyToEdit, setPropertyToEdit] = useState(null)
  const [editingPriceValue, setEditingPriceValue] = useState('')
  const [savingPrice, setSavingPrice] = useState(false)
  const [modelFilter, setModelFilter] = useState('')
  const [residentSortOrder, setResidentSortOrder] = useState('none') // 'none' | 'asc' | 'desc'
const [editValues, setEditValues] = useState({})
const [savingEdit, setSavingEdit] = useState(false)

const [lotsArray, setLotsArray] = useState([])
const [modelsArray, setModelsArray] = useState([])
const [usersArray, setUsersArray] = useState([])
const [facades, setFacades] = useState([]);

const [detailsOpen, setDetailsOpen] = useState(false)
const [detailsProperty, setDetailsProperty] = useState(null)


  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  // Extract unique model names for filter dropdown
  const modelOptions = useMemo(() => {
    const models = properties
      .map(p => p.model?.model)
      .filter(Boolean)
    return [...new Set(models)].sort()
  }, [properties])

  // Processed data: default sort by lot number, then apply model filter and resident sort
  const processedData = useMemo(() => {
    let result = [...properties]

    // Filter by model
    if (modelFilter) {
      result = result.filter(p => p.model?.model === modelFilter)
    }

    // Sort by resident/owner name if toggled
    if (residentSortOrder !== 'none') {
      result.sort((a, b) => {
        const nameA = (a.users?.[0]?.firstName || a.client?.firstName || '').toLowerCase()
        const nameB = (b.users?.[0]?.firstName || b.client?.firstName || '').toLowerCase()
        if (nameA < nameB) return residentSortOrder === 'asc' ? -1 : 1
        if (nameA > nameB) return residentSortOrder === 'asc' ? 1 : -1
        return 0
      })
    } else {
      // Default sort: by lot number ascending
      result.sort((a, b) => (a.lot?.number || 0) - (b.lot?.number || 0))
    }

    return result
  }, [properties, modelFilter, residentSortOrder])

  useEffect(() => {
    fetchData()
    fetchLots()
    fetchModels()
    fetchUsers()
  }, [])
  
  const fetchLots = async () => {
    try {
      const res = await api.get('/lots')
      setLotsArray(res.data)
    } catch (error) {
      console.error('Error fetching lots:', error)
    }
  }
  
  const fetchModels = async () => {
    try {
      const res = await api.get('/models')
      setModelsArray(res.data)
    } catch (error) {
      console.error('Error fetching models:', error)
    }
  }

    const fetchFacades = async (modelId) => {
    if (!modelId) {
      setFacades([]);
      return;
    }
    try {
      const res = await api.get(`/models/${modelId}/facades`);
      setFacades(res.data);
    } catch (err) {
      setFacades([]);
    }
  };

    useEffect(() => {
      if (editValues.model) {
        propertyService.getFacades(editValues.model).then(setFacades)
      } else {
        setFacades([])
      }
    }, [editValues.model])
  const fetchUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsersArray(res.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

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

  // ✅ HANDLERS CON useCallback
  const handleAddProperty = useCallback(() => {
    navigate('/properties/select')
  }, [navigate])

const handleViewProperty = useCallback((property) => {
  setDetailsProperty(property)
  setDetailsOpen(true)
}, [])

  const handleOpenPhases = useCallback((property) => {
    setSelectedProperty(property)
    setPhasesModalOpen(true)
  }, [])

  const handleClosePhases = useCallback(() => {
    setPhasesModalOpen(false)
    setSelectedProperty(null)
    fetchData()
  }, [])

  const handleOpenContracts = useCallback((property) => {
    setContractsProperty(property)
    setContractsModalOpen(true)
  }, [])

  const handleCloseContracts = useCallback(() => {
    setContractsModalOpen(false)
    setContractsProperty(null)
  }, [])

const handleEditProperty = useCallback((property) => {
  setPropertyToEdit(property)
  setEditValues({
    lot: property.lot?._id || '',
    model: property.model?._id || '',
    facade: property.facade?._id || '', // <-- Asegúrate de que sea string
    users: property.users?.map(u => u._id) || [],
    price: property.price ?? '',
    pending: property.pending ?? '',
    initialPayment: property.initialPayment ?? '',
    status: property.status ?? '',
    saleDate: property.saleDate ? property.saleDate.slice(0, 10) : '',
    hasBalcony: property.hasBalcony ?? false,
    modelType: property.modelType ?? 'basic',
    hasStorage: property.hasStorage ?? false,
  })
  setEditModalOpen(true)
}, [])



const handleEditValuesChange = (newValues) => {
  setEditValues(newValues)
}

  const handleSaveEdit = useCallback(async () => {
    if (!propertyToEdit) return
    setSavingEdit(true)
    try {
      await api.put(`/properties/${propertyToEdit._id}`, editValues)
      setEditModalOpen(false)
      setPropertyToEdit(null)
      setEditValues({})
      fetchData()
    } catch (err) {
      alert('Error updating property')
    }
    setSavingEdit(false)
  }, [propertyToEdit, editValues])

  const handleCloseEditModal = useCallback(() => {
    setEditModalOpen(false)
    setPropertyToEdit(null)
    setEditValues({})
  }, [])

  // ✅ HELPERS
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'sold': 
        return { 
          bg: 'rgba(140, 165, 81, 0.12)', 
          color: '#333F1F', 
          border: 'rgba(140, 165, 81, 0.3)' 
        }
      case 'active': 
        return { 
          bg: 'rgba(33, 150, 243, 0.12)', 
          color: '#1976d2', 
          border: 'rgba(33, 150, 243, 0.3)' 
        }
      case 'pending': 
        return { 
          bg: 'rgba(229, 134, 60, 0.12)', 
          color: '#E5863C', 
          border: 'rgba(229, 134, 60, 0.3)' 
        }
      default: 
        return { 
          bg: 'rgba(112, 111, 111, 0.12)', 
          color: '#706f6f', 
          border: 'rgba(112, 111, 111, 0.3)' 
        }
    }
  }, [])

  const getPhaseProgress = useCallback((property) => {
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
  }, [])

  // ✅ STATS
  const stats = useMemo(() => ({
    total: properties.length,
    sold: properties.filter(p => p.status === 'sold').length,
    active: properties.filter(p => p.status === 'active').length,
    pending: properties.filter(p => p.status === 'pending').length
  }), [properties])

  const propertiesStats = useMemo(() => [
    {
      title: 'Total Properties',
      value: stats.total,
      icon: Home,
      gradient: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)',
      color: '#333F1F',
      delay: 0
    },
    {
      title: 'Sold',
      value: stats.sold,
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #8CA551 0%, #a8bf6f 100%)',
      color: '#8CA551',
      delay: 0.1
    },
    {
      title: 'Active',
      value: stats.active,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
      color: '#1976d2',
      delay: 0.2
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Schedule,
      gradient: 'linear-gradient(135deg, #E5863C 0%, #f59c5a 100%)',
      color: '#E5863C',
      delay: 0.3
    }
  ], [stats])

  // ✅ DEFINIR COLUMNAS
  const columns = useMemo(() => {
    const baseColumns = [
      {
        field: 'lot',
        headerName: 'LOT INFO',
        minWidth: 150,
        renderCell: ({ row }) => (
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
              {row.lot?.number}
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
                Lot {row.lot?.number}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#706f6f',
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '0.7rem'
                }}
              >
                Section {row.lot?.section || 'N/A'}
              </Typography>
            </Box>
          </Box>
        )
      },
      {
        field: 'model',
        headerName: 'MODEL',
        minWidth: 120,
        renderCell: ({ row }) => (
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#1a1a1a',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {row.model?.model || 'N/A'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.7rem'
              }}
            >
              {row.model?.bedrooms}BR / {row.model?.bathrooms}BA
            </Typography>
          </Box>
        )
      },
      {
        field: 'facade',
        headerName: 'FACADE',
        minWidth: 120,
        renderCell: ({ row }) => (
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: '#1a1a1a',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {row.facade?.title || 'Not selected'}
            </Typography>
            {row.facade?.price > 0 && (
              <Typography
                variant="caption"
                sx={{
                  color: '#8CA551',
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              >
                +${row.facade.price.toLocaleString()}
              </Typography>
            )}
          </Box>
        )
      },
      {
        field: 'user',
        headerName: 'RESIDENT / OWNER',
        minWidth: 180,
        renderCell: ({ row }) => (
          <Box display="flex" alignItems="center" gap={1}>
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
              {row.users?.[0]?.firstName?.charAt(0) || row.client?.firstName?.charAt(0) || '?'}
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
                {row.users?.[0]?.firstName || row.client?.firstName || 'N/A'}{' '}
                {row.users?.[0]?.lastName || row.client?.lastName || ''}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#706f6f',
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '0.7rem'
                }}
              >
                {row.users?.[0]?.email || row.client?.email || 'No email'}
              </Typography>
            </Box>
          </Box>
        )
      },
      {
        field: 'status',
        headerName: 'STATUS',
        minWidth: 100,
        renderCell: ({ row }) => {
          const statusColors = getStatusColor(row.status)
          return (
            <Chip
              label={row.status || 'pending'}
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
          )
        }
      },
      {
        field: 'phases',
        headerName: 'CONSTRUCTION PHASE',
        minWidth: 200,
        renderCell: ({ row }) => {
          const phaseProgress = getPhaseProgress(row)
          return (
            <Box sx={{ minWidth: 140 }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Construction sx={{ fontSize: 16, color: '#8CA551' }} />
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
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenPhases(row)
                }}
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
          )
        }
      },
      {
        field: 'price',
        headerName: 'PRICE',
        minWidth: 140,
        renderCell: ({ row }) => (
          <Box>
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
                {(row.presalePrice || row.price)?.toLocaleString()}
              </Typography>
            </Box>
            {row.pending > 0 && (
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
                Pending: ${row.pending?.toLocaleString()}
              </Typography>
            )}
            {row.initialPayment > 0 && (
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
                Paid: ${row.initialPayment?.toLocaleString()}
              </Typography>
            )}
          </Box>
        )
      }
    ]

    // ✅ Agregar columna de contratos solo para admins
    if (isAdmin) {
      baseColumns.push({
        field: 'contracts',
        headerName: 'CONTRACTS',
        align: 'center',
        width: 100,
        renderCell: ({ row }) => (
          <Tooltip title="Manage contracts" placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenContracts(row)
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
                  '& .MuiSvgIcon-root': {
                    color: 'white'
                  }
                }
              }}
            >
              <DescriptionIcon sx={{ fontSize: 18, color: '#8CA551' }} />
            </IconButton>
          </Tooltip>
        )
      })
    }

    // ✅ Agregar columna de acciones
    baseColumns.push({
      field: 'actions',
      headerName: 'ACTIONS',
      align: 'center',
      width: 120,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="View details" placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleViewProperty(row)
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
                  '& .MuiSvgIcon-root': {
                    color: 'white'
                  }
                }
              }}
            >
              <Visibility sx={{ fontSize: 18, color: '#8CA551' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Price" placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleEditProperty(row)
              }}
              sx={{
                bgcolor: 'rgba(140, 165, 81, 0.08)',
                border: '1px solid rgba(140, 165, 81, 0.2)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#333F1F',
                  borderColor: '#8CA551',
                  transform: 'scale(1.1)',
                  '& .MuiSvgIcon-root': {
                    color: 'white'
                  }
                }
              }}
            >
              <EditIcon sx={{ fontSize: 18, color: '#8CA551' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    })

    return baseColumns
  }, [isAdmin, getStatusColor, getPhaseProgress, handleOpenPhases, handleOpenContracts, handleViewProperty, handleEditProperty])

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
        <PageHeader
          icon={Home}
          title="Property Management"
          subtitle="Oversee inventory, pricing, and resident assignments across the estate"
          actionButton={{
            label: 'Add a New Property',
            onClick: handleAddProperty,
            icon: <Add />,
            tooltip: 'Add Property'
          }}
        />

        {/* Stats Cards */}
        <StatsCards stats={propertiesStats} loading={loading} />

        {/* Filters Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
            flexWrap: 'wrap'
          }}
        >
          {/* Model Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.85rem',
                '&.Mui-focused': { color: '#333F1F' }
              }}
            >
              Filter by Model
            </InputLabel>
            <Select
              value={modelFilter}
              label="Filter by Model"
              onChange={(e) => setModelFilter(e.target.value)}
              startAdornment={<FilterList sx={{ fontSize: 18, color: '#8CA551', mr: 0.5 }} />}
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.85rem',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(140, 165, 81, 0.3)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#8CA551'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#333F1F'
                }
              }}
            >
              <MenuItem value="">
                <em>All Models</em>
              </MenuItem>
              {modelOptions.map((model) => (
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Resident/Owner Sort Toggle */}
          <Tooltip
            title={
              residentSortOrder === 'none'
                ? 'Sort Resident/Owner A-Z'
                : residentSortOrder === 'asc'
                ? 'Sort Resident/Owner Z-A'
                : 'Remove Resident/Owner sort'
            }
            placement="top"
          >
            <Button
              variant={residentSortOrder !== 'none' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<SortByAlpha />}
              onClick={() => {
                setResidentSortOrder(prev =>
                  prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none'
                )
              }}
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                fontSize: '0.78rem',
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                height: 40,
                ...(residentSortOrder !== 'none'
                  ? {
                      bgcolor: '#333F1F',
                      color: 'white',
                      '&:hover': { bgcolor: '#4a5d3a' }
                    }
                  : {
                      color: '#333F1F',
                      borderColor: 'rgba(140, 165, 81, 0.3)',
                      '&:hover': {
                        borderColor: '#333F1F',
                        bgcolor: 'rgba(51, 63, 31, 0.04)'
                      }
                    })
              }}
            >
              Resident {residentSortOrder === 'asc' ? 'A → Z' : residentSortOrder === 'desc' ? 'Z → A' : 'A-Z'}
            </Button>
          </Tooltip>
        </Box>

        {/* ✅ TABLA REUTILIZABLE */}
        <DataTable
          columns={columns}
          data={processedData}
          loading={loading}
          emptyState={
            <EmptyState
              icon={Home}
              title="No properties found"
              description="Click 'Add Property' to create one"
              actionLabel="Add Property"
              onAction={handleAddProperty}
            />
          }
          onRowClick={(row) => console.log('Property clicked:', row)}
          stickyHeader
          maxHeight={600}
        />

        {/* Modals */}
        <PropertyDetailsModal
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          property={detailsProperty}
        />

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

        <EditPropertyModal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          property={propertyToEdit}
          values={editValues}
          onChange={handleEditValuesChange}
          onSave={handleSaveEdit}
          saving={savingEdit}
          lots={lotsArray}
          models={modelsArray}
          facades={facades}
          users={usersArray}
        />
      </Container>
    </Box>
  )
}

export default Properties