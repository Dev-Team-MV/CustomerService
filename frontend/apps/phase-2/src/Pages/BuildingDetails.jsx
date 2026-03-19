import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Container, Paper, Tabs, Tab, Grid, Typography, Chip,
  IconButton, Button, Divider, Card, CardMedia, CardContent
} from '@mui/material'
import {
  Business, ArrowBack, Edit, Layers, Apartment, GridOn,
  Image as ImageIcon, ViewModule, Home
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import PageHeader from '@shared/components/PageHeader'
import StatsCards from '@shared/components/statscard'
import ApartmentModelDialog from '../Components/UI/buildingsComponents/ApartmenModelDialog'
import FloorPlanEditor from '../Components/UI/buildingsComponents/FloorPlanEditor'
import ApartmentDialog from '../Components/UI/buildingsComponents/ApartmentDialog'

// Mock data - en producción vendría de un hook/service
const mockBuildingData = {
  b1: {
    _id: 'b1',
    project: '69b9b2188186434073c6b13d',
    projectName: 'Lakewood Phase 2',
    name: 'Tower A',
    section: 'North',
    floors: 10,
    apartmentModelsCount: 2,
    totalApartments: 40,
    status: 'active',
    floorPlans: [
      { floorNumber: 1, url: 'https://via.placeholder.com/800x600/8CA551/fff?text=Floor+1+Commercial' },
      { floorNumber: 2, url: 'https://via.placeholder.com/800x600/333F1F/fff?text=Floor+2' },
      { floorNumber: 3, url: 'https://via.placeholder.com/800x600/8CA551/fff?text=Floor+3' }
    ],
    exteriorRenders: [
      'https://via.placeholder.com/600x400/8CA551/fff?text=Exterior+1',
      'https://via.placeholder.com/600x400/333F1F/fff?text=Exterior+2',
      'https://via.placeholder.com/600x400/8CA551/fff?text=Exterior+3'
    ],
    polygon: [],
    // Mock apartment models
    models: [
      {
        _id: 'am1',
        name: 'Model A',
        floorPlan: 'Plan 1',
        sqft: 90,
        bedrooms: 2,
        bathrooms: 2,
        apartmentCount: 20
      },
      {
        _id: 'am2',
        name: 'Model B',
        floorPlan: 'Plan 2',
        sqft: 120,
        bedrooms: 3,
        bathrooms: 2,
        apartmentCount: 20
      }
    ],
    // Mock apartments
    apartments: [
      {
        _id: 'apt1',
        apartmentModel: 'am1',
        floorNumber: 2,
        apartmentNumber: '201',
        price: 120000,
        pending: 20000,
        status: 'available'
      },
      {
        _id: 'apt2',
        apartmentModel: 'am2',
        floorNumber: 3,
        apartmentNumber: '301',
        price: 150000,
        pending: 50000,
        status: 'sold'
      },
      {
        _id: 'apt3',
        apartmentModel: 'am1',
        floorNumber: 4,
        apartmentNumber: '401',
        price: 125000,
        pending: 25000,
        status: 'pending'
      },
      {
        _id: 'apt4',
        apartmentModel: 'am2',
        floorNumber: 5,
        apartmentNumber: '501',
        price: 155000,
        pending: 55000,
        status: 'available'
      }
    ]
  },
  b2: {
    _id: 'b2',
    project: '69b9b2188186434073c6b13d',
    projectName: 'Lakewood Phase 2',
    name: 'Tower B',
    section: 'South',
    floors: 8,
    apartmentModelsCount: 1,
    totalApartments: 32,
    status: 'active',
    floorPlans: [],
    exteriorRenders: [],
    polygon: [],
    models: [
      {
        _id: 'am3',
        name: 'Model C',
        floorPlan: 'Plan 3',
        sqft: 100,
        bedrooms: 2,
        bathrooms: 1,
        apartmentCount: 32
      }
    ],
    apartments: []
  }
}

const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
)

const BuildingDetail = () => {
  const theme = useTheme()
  const navigate = useNavigate()
const { id } = useParams()
const building = mockBuildingData[id] || null


  const [currentTab, setCurrentTab] = useState(0)

  // Dentro del componente BuildingDetail, agregar estados:
const [openModelDialog, setOpenModelDialog] = useState(false)
const [selectedModel, setSelectedModel] = useState(null)
const [apartmentModels, setApartmentModels] = useState([])
 
const [openFloorPlanEditor, setOpenFloorPlanEditor] = useState(false)

const [openApartment, setOpenApartment] = useState(false)
const [selectedApartment, setSelectedApartment] = useState(null)
const [apartments, setApartments] = useState([])

useEffect(() => {
  setApartmentModels(building?.models || [])
  setApartments(building?.apartments || [])
}, [building])

const handleOpenApartment = (apartment = null) => {
  setSelectedApartment(apartment)
  setOpenApartment(true)
}
const handleCloseApartment = () => {
  setOpenApartment(false)
  setSelectedApartment(null)
}
const handleApartmentSaved = (apartment) => {
  setApartments(prev => {
    const idx = prev.findIndex(a => a._id === apartment._id)
    if (idx !== -1) {
      const copy = [...prev]
      copy[idx] = apartment
      return copy
    }
    return [apartment, ...prev]
  })
  handleCloseApartment()
}

const handleOpenFloorPlanEditor = () => {
  if (building.floorPlans.length === 0) {
    alert('No floor plans uploaded yet')
    return
  }
  setOpenFloorPlanEditor(true)
}
 
const handleSaveFloorPlans = (updatedFloorPlans) => {
  console.log('💾 Saving floor plans with polygons:', updatedFloorPlans)
  // Aquí actualizarías el building con los floor plans actualizados
  setOpenFloorPlanEditor(false)
}

// Agregar handlers:
const handleOpenModelDialog = (model = null) => {
  setSelectedModel(model)
  setOpenModelDialog(true)
}
 
const handleCloseModelDialog = () => {
  setOpenModelDialog(false)
  setSelectedModel(null)
}
 
const handleModelSaved = (model) => {
  setApartmentModels(prev => {
    const idx = prev.findIndex(m => m._id === model._id)
    if (idx !== -1) {
      const copy = [...prev]
      copy[idx] = model
      return copy
    }
    return [model, ...prev]
  })
  handleCloseModelDialog()
}

  // Mock: obtener building por ID

  const buildingStats = useMemo(() => {
    if (!building) return []
    return [
      {
        title: 'Total Floors',
        value: building.floors,
        icon: Layers,
        gradient: theme.palette.gradient,
        color: theme.palette.primary.main,
        delay: 0
      },
      {
        title: 'Total Apartments',
        value: building.totalApartments,
        icon: Apartment,
        gradient: theme.palette.gradientSecondary,
        color: theme.palette.secondary.main,
        delay: 0.1
      },
      {
        title: 'Apartment Models',
        value: building.apartmentModelsCount,
        icon: ViewModule,
        gradient: theme.palette.gradientInfo,
        color: theme.palette.info.main,
        delay: 0.2
      },
      {
        title: 'Floor Plans',
        value: `${building.floorPlans.length}/${building.floors}`,
        icon: GridOn,
        gradient: theme.palette.gradientAccent,
        color: theme.palette.accent.main,
        delay: 0.3
      }
    ]
  }, [building, theme])

  if (!building) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: 3 }}>
        <Container maxWidth="xl">
          <Typography variant="h5">Building not found</Typography>
          <Button onClick={() => navigate('/buildings')} startIcon={<ArrowBack />} sx={{ mt: 2 }}>
            Back to Buildings
          </Button>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => navigate('/buildings')}
            sx={{
              bgcolor: theme.palette.chipAdmin.bg,
              border: `1px solid ${theme.palette.chipAdmin.border}`,
              '&:hover': { bgcolor: theme.palette.secondary.main, color: '#fff' }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={2} mb={0.5}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontFamily: '"Poppins", sans-serif',
                  color: theme.palette.text.primary
                }}
              >
                {building.name}
              </Typography>
              <Chip
                label={building.status}
                size="small"
                sx={{
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  textTransform: 'capitalize',
                  bgcolor: theme.palette.chipAdmin.bg,
                  color: theme.palette.chipAdmin.color,
                  border: `1px solid ${theme.palette.chipAdmin.border}`
                }}
              />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {building.projectName} • Section: {building.section || 'N/A'}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600
            }}
          >
            Edit Building
          </Button>
        </Box>

        {/* Stats */}
        <StatsCards stats={buildingStats} loading={false} />

        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.cardBorder}`,
            bgcolor: theme.palette.cardBg,
            overflow: 'hidden'
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(_, v) => setCurrentTab(v)}
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              px: 2,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                fontSize: '0.95rem',
                minHeight: 56,
                '&.Mui-selected': { color: theme.palette.primary.main }
              },
              '& .MuiTabs-indicator': {
                bgcolor: theme.palette.primary.main,
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab icon={<Business />} iconPosition="start" label="Overview" />
            <Tab icon={<GridOn />} iconPosition="start" label="Floor Plans" />
            <Tab icon={<ViewModule />} iconPosition="start" label="Apartment Models" />
            <Tab icon={<Home />} iconPosition="start" label="Apartments" />
          </Tabs>

          {/* Tab 0: Overview */}
          <TabPanel value={currentTab} index={0}>
            <Box sx={{ px: 3 }}>
              <Grid container spacing={3}>
                {/* Basic Info */}
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontFamily: '"Poppins", sans-serif',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Business sx={{ color: theme.palette.primary.main }} />
                    Building Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <InfoRow label="Name" value={building.name} />
                    <InfoRow label="Section" value={building.section || 'N/A'} />
                    <InfoRow label="Total Floors" value={building.floors} />
                    <InfoRow label="Total Apartments" value={building.totalApartments} />
                    <InfoRow label="Apartment Models" value={building.apartmentModelsCount} />
                    <InfoRow label="Status" value={building.status} />
                  </Box>
                </Grid>

                {/* Exterior Renders */}
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontFamily: '"Poppins", sans-serif',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <ImageIcon sx={{ color: theme.palette.secondary.main }} />
                    Exterior Renders ({building.exteriorRenders.length})
                  </Typography>
                  {building.exteriorRenders.length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}
                    >
                      No exterior renders uploaded yet
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {building.exteriorRenders.map((url, idx) => (
                        <Grid item xs={6} key={idx}>
                          <Card
                            elevation={0}
                            sx={{
                              borderRadius: 2,
                              border: `1px solid ${theme.palette.cardBorder}`,
                              overflow: 'hidden'
                            }}
                          >
                            <CardMedia
                              component="img"
                              height="140"
                              image={url}
                              alt={`Exterior ${idx + 1}`}
                            />
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Tab 1: Floor Plans */}
          <TabPanel value={currentTab} index={1}>
            <Box sx={{ px: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontFamily: '"Poppins", sans-serif',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <GridOn sx={{ color: theme.palette.accent.main }} />
                Floor Plans ({building.floorPlans.length}/{building.floors})
              </Typography>
              {building.floorPlans.length > 0 && (
  <Button
    variant="contained"
    startIcon={<Edit />}
    onClick={handleOpenFloorPlanEditor}
    sx={{
      mb: 3,
      borderRadius: 2,
      textTransform: 'none',
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
      bgcolor: theme.palette.primary.main
    }}
  >
    Edit Polygons (All Floors)
  </Button>
)}
              {building.floorPlans.length === 0 ? (
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}
                >
                  No floor plans uploaded yet
                </Typography>
                
              ) : (
                
                <Grid container spacing={3}>
                  {building.floorPlans.map((fp) => (
                    <Grid item xs={12} md={6} lg={4} key={fp.floorNumber}>
                      <Card
                        elevation={0}
                        sx={{
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.cardBorder}`,
                          overflow: 'hidden'
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={fp.url}
                          alt={`Floor ${fp.floorNumber}`}
                        />
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}
                          >
                            Floor {fp.floorNumber}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}
                          >
                            {fp.floorNumber === 1 ? 'Commercial' : 'Residential'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </TabPanel>

          {/* Tab 2: Apartment Models */}
          <TabPanel value={currentTab} index={2}>
            <Box sx={{ px: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontFamily: '"Poppins", sans-serif',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <ViewModule sx={{ color: theme.palette.info.main }} />
                Apartment Models
              </Typography>
          
              <Button
                variant="outlined"
                startIcon={<Business />}
                onClick={() => handleOpenModelDialog()}
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600
                }}
              >
                Create Apartment Model
              </Button>
          
              {apartmentModels.length === 0 ? (
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', mt: 2 }}
                >
                  No apartment models created yet. Expected: {building.apartmentModelsCount}
                </Typography>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {apartmentModels.map(model => (
                    <Paper key={model._id} sx={{ p: 2, mb: 1, borderRadius: 2 }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {model.name} - {model.floorPlan}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sqft: {model.sqft} | Bedrooms: {model.bedrooms} | Bathrooms: {model.bathrooms} | Apartments: {model.apartmentCount}
                      </Typography>
                      <Button size="small" onClick={() => handleOpenModelDialog(model)} sx={{ mt: 1 }}>
                        Edit
                      </Button>
                    </Paper>
                  ))}
                </Box>
              )}
          
              <ApartmentModelDialog
                open={openModelDialog}
                onClose={handleCloseModelDialog}
                onSaved={handleModelSaved}
                selectedModel={selectedModel}
                buildingId={building._id}
                buildingTotalApartments={building.totalApartments}
                existingModels={apartmentModels}
              />
            </Box>
          </TabPanel>

          {/* Tab 3: Apartments */}
          <TabPanel value={currentTab} index={3}>
            <Box sx={{ px: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontFamily: '"Poppins", sans-serif',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Home sx={{ color: theme.palette.secondary.main }} />
                Apartments
              </Typography>
          
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={() => handleOpenApartment()}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600
                }}
              >
                Create Apartment
              </Button>
          
              {apartments.length === 0 ? (
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}
                >
                  No apartments created yet. Total expected: {building.totalApartments}
                </Typography>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {apartments.map(apt => (
                    <Paper key={apt._id} sx={{ p: 2, mb: 1, borderRadius: 2 }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Apt #{apt.apartmentNumber} - Floor {apt.floorNumber} - Model: {apartmentModels.find(m => m._id === apt.apartmentModel)?.name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Price: ${apt.price} | Pending: ${apt.pending} | Status: {apt.status}
                      </Typography>
                      <Button size="small" onClick={() => handleOpenApartment(apt)} sx={{ mt: 1 }}>
                        Edit
                      </Button>
                    </Paper>
                  ))}
                </Box>
              )}
          
              <ApartmentDialog
                open={openApartment}
                onClose={handleCloseApartment}
                onSaved={handleApartmentSaved}
                selectedApartment={selectedApartment}
                apartmentModels={apartmentModels}
                buildingFloors={building.floors}
              />
            </Box>
          </TabPanel>
        </Paper>

{/* <ApartmentModelDialog
  open={openModelDialog}
  onClose={handleCloseModelDialog}
  onSaved={handleModelSaved}
  selectedModel={selectedModel}
  buildingId={building._id}
  buildingTotalApartments={building.totalApartments}
  existingModels={apartmentModels}
/> */}

<FloorPlanEditor
  open={openFloorPlanEditor}
  onClose={() => setOpenFloorPlanEditor(false)}
  floorPlans={building.floorPlans}
  apartmentModels={apartmentModels}
  onSave={handleSaveFloorPlans}
/>



      </Container>
    </Box>
  )
}

const InfoRow = ({ label, value }) => {
  const theme = useTheme()
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography
        variant="body2"
        sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}
      >
        {label}:
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: theme.palette.text.primary, fontFamily: '"Poppins", sans-serif', fontWeight: 700 }}
      >
        {value}
      </Typography>
    </Box>
  )
}

export default BuildingDetail