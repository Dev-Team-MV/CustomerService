import { useState, useEffect } from 'react'
import { 
  Grid, TextField, MenuItem, Button, Box, Typography, Alert,
  IconButton, Divider, Paper
} from '@mui/material'
import { 
  Business, AddPhotoAlternate, Delete, GridOn, Image as ImageIcon
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'
import { useProjects } from '@shared/hooks/useProjects'
import uploadService from '../../../Services/uploadService'

const DEFAULT_FORM = {
  project: '',
  name: '',
  section: '',
  floors: '',
  apartmentModelsCount: '', // NUEVO: cantidad de modelos diferentes
  models: [],
  totalApartments: '',
  status: 'active',
}

const ImagePreviewCard = ({ url, onRemove }) => {
  const theme = useTheme()
  return (
    <Box sx={{
      position: 'relative',
      width: 100,
      height: 100,
      borderRadius: 2,
      overflow: 'hidden',
      border: `2px solid ${theme.palette.cardBorder}`,
      bgcolor: theme.palette.cardBg,
      mr: 1.5,
      mb: 1.5,
      display: 'inline-block'
    }}>
      <img 
        src={url} 
        alt="preview" 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover' 
        }} 
      />
      {onRemove && (
        <IconButton
          size="small"
          onClick={onRemove}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
          }}
        >
          <Delete fontSize="small" sx={{ color: theme.palette.warning.main }} />
        </IconButton>
      )}
    </Box>
  )
}

const FloorPlanPreview = ({ floorPlan, onRemove }) => {
  const theme = useTheme()
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 2,
        border: `1px solid ${theme.palette.cardBorder}`,
        bgcolor: theme.palette.cardBg,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: 1.5,
          overflow: 'hidden',
          border: `2px solid ${theme.palette.cardBorder}`,
          flexShrink: 0
        }}
      >
        <img
          src={floorPlan.url}
          alt={`Floor ${floorPlan.floorNumber}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
      <Box flex={1}>
        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
          Floor {floorPlan.floorNumber}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
          {floorPlan.floorNumber === 1 ? 'Commercial' : 'Residential'}
        </Typography>
      </Box>
      {onRemove && (
        <IconButton
          size="small"
          onClick={onRemove}
          sx={{
            color: theme.palette.warning.main,
            '&:hover': { bgcolor: theme.palette.chipSuperadmin.bg }
          }}
        >
          <Delete fontSize="small" />
        </IconButton>
      )}
    </Paper>
  )
}

const BuildingDialog = ({ open, onClose, onSaved, selectedBuilding }) => {
  const theme = useTheme()
  const { projects, loading: loadingProjects } = useProjects()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [exteriorRenders, setExteriorRenders] = useState([])
  const [floorPlans, setFloorPlans] = useState([])
  const [uploadingExterior, setUploadingExterior] = useState(false)
  const [uploadingFloorPlan, setUploadingFloorPlan] = useState(false)

  useEffect(() => {
    if (open) {
      if (selectedBuilding) {
        setForm({
          project: selectedBuilding.project || '',
          name: selectedBuilding.name || '',
          section: selectedBuilding.section || '',
          floors: selectedBuilding.floors ?? '',
          models: selectedBuilding.models || [],
          totalApartments: selectedBuilding.totalApartments ?? '',
          status: selectedBuilding.status || 'active',
        })
        setExteriorRenders(selectedBuilding.exteriorRenders || [])
        setFloorPlans(selectedBuilding.floorPlans || [])
      } else {
        setForm(DEFAULT_FORM)
        setExteriorRenders([])
        setFloorPlans([])
      }
    }
  }, [selectedBuilding, open])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const isValid = form.project && form.name.trim().length > 0 && Number(form.floors) > 0

const handleSubmit = () => {
  if (!form.project) {
    alert('Please select a project')
    return
  }
  
  const payload = {
    ...selectedBuilding,
    _id: selectedBuilding?._id || `b_${Date.now()}`,
    ...form,
    floors: Number(form.floors),
    apartmentModelsCount: form.apartmentModelsCount !== '' ? Number(form.apartmentModelsCount) : 0, // NUEVO
    totalApartments: form.totalApartments !== '' ? Number(form.totalApartments) : 0,
    floorPlans,
    exteriorRenders,
    polygon: selectedBuilding?.polygon || [],
  }

  console.log('🏢 Building Payload:', {
    ...payload,
    exteriorRenders: {
      count: exteriorRenders.length,
      urls: exteriorRenders
    },
    floorPlans: {
      count: floorPlans.length,
      data: floorPlans
    }
  })

  onSaved(payload)
}

  // Upload exterior images
  const handleExteriorUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    
    setUploadingExterior(true)
    try {
      const urls = await uploadService.uploadBuildingExteriorImages(files, true)
      setExteriorRenders(prev => [...prev, ...urls])
    } catch (error) {
      alert('Error uploading exterior images: ' + error.message)
    } finally {
      setUploadingExterior(false)
      e.target.value = ''
    }
  }

  const handleRemoveExterior = (index) => {
    setExteriorRenders(prev => prev.filter((_, i) => i !== index))
  }

  // Upload floor plan
  const handleFloorPlanUpload = async (e, floorNumber) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFloorPlan(true)
    try {
      const buildingId = selectedBuilding?._id || 'temp'
      const url = await uploadService.uploadBuildingFloorPlan(file, buildingId, floorNumber, true)
      
      setFloorPlans(prev => {
        const existing = prev.filter(fp => fp.floorNumber !== floorNumber)
        return [...existing, { floorNumber, url }].sort((a, b) => a.floorNumber - b.floorNumber)
      })
    } catch (error) {
      alert('Error uploading floor plan: ' + error.message)
    } finally {
      setUploadingFloorPlan(false)
      e.target.value = ''
    }
  }

  const handleRemoveFloorPlan = (floorNumber) => {
    setFloorPlans(prev => prev.filter(fp => fp.floorNumber !== floorNumber))
  }

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      fontFamily: '"Poppins", sans-serif',
      bgcolor: 'white',
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '2px' },
      '&:hover fieldset': { borderColor: theme.palette.secondary.main }
    },
    '& .MuiInputLabel-root': {
      fontFamily: '"Poppins", sans-serif',
      '&.Mui-focused': { color: theme.palette.primary.main }
    }
  }

  const actions = (
    <>
      <Button
        onClick={onClose}
        sx={{
          borderRadius: 3,
          textTransform: 'none',
          fontWeight: 600,
          px: 3, py: 1.2,
          color: theme.palette.text.secondary,
          fontFamily: '"Poppins", sans-serif',
          border: `2px solid ${theme.palette.divider}`,
          '&:hover': {
            bgcolor: theme.palette.action.hover,
            borderColor: theme.palette.text.secondary
          }
        }}
      >
        Cancel
      </Button>
      <PrimaryButton onClick={handleSubmit} disabled={!isValid} startIcon={<Business />}>
        {selectedBuilding ? 'Update Building' : 'Create Building'}
      </PrimaryButton>
    </>
  )

  const totalFloors = Number(form.floors) || 0
  const floorNumbers = Array.from({ length: totalFloors }, (_, i) => i + 1)

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={Business}
      title={selectedBuilding ? 'Edit Building' : 'New Building'}
      subtitle={
        selectedBuilding
          ? `Editing ${selectedBuilding.name}`
          : 'Fill in the basic info to create the building'
      }
      maxWidth="md"
      actions={actions}
    >
      <Alert
        severity="info"
        sx={{
          mb: 2,
          borderRadius: 3,
          bgcolor: theme.palette.secondary.main + '14',
          border: `1px solid ${theme.palette.secondary.main}4D`,
          fontFamily: '"Poppins", sans-serif',
          '& .MuiAlert-icon': { color: theme.palette.secondary.main }
        }}
      >
        Floor 1 is always reserved for commercial spaces. Residential floors start from Floor 2.
      </Alert>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        {/* Project Selection */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            required
            label="Project"
            value={form.project}
            onChange={e => handleChange('project', e.target.value)}
            disabled={loadingProjects}
            helperText="Select the project this building belongs to"
            sx={fieldSx}
          >
            {loadingProjects ? (
              <MenuItem disabled sx={{ fontFamily: '"Poppins", sans-serif' }}>
                Loading projects...
              </MenuItem>
            ) : projects.length === 0 ? (
              <MenuItem disabled sx={{ fontFamily: '"Poppins", sans-serif' }}>
                No projects available
              </MenuItem>
            ) : (
              projects.map(project => (
                <MenuItem
                  key={project._id}
                  value={project._id}
                  sx={{ 
                    fontFamily: '"Poppins", sans-serif',
                    '&:hover': { bgcolor: theme.palette.secondary.main + '08' }
                  }}
                >
                  {project.name} {project.slug ? `(${project.slug})` : ''}
                </MenuItem>
              ))
            )}
          </TextField>
        </Grid>

        {/* Building Name & Section */}
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            required
            label="Building Name"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Section"
            value={form.section}
            onChange={e => handleChange('section', e.target.value)}
            helperText="e.g., North, South"
            sx={fieldSx}
          />
        </Grid>

{/* Floors & Total Apartments */}
<Grid item xs={12} sm={4}>
  <TextField
    fullWidth
    required
    type="number"
    label="Total Floors"
    inputProps={{ min: 1 }}
    value={form.floors}
    onChange={e => handleChange('floors', e.target.value)}
    helperText="Floor 1 = Commercial"
    sx={fieldSx}
  />
</Grid>
<Grid item xs={12} sm={4}>
  <TextField
    fullWidth
    type="number"
    label="Total Apartments"
    inputProps={{ min: 0 }}
    value={form.totalApartments}
    onChange={e => handleChange('totalApartments', e.target.value)}
    helperText="Residential units only"
    sx={fieldSx}
  />
</Grid>
<Grid item xs={12} sm={4}>
  <TextField
    fullWidth
    type="number"
    label="Apartment Models"
    inputProps={{ min: 0 }}
    value={form.apartmentModelsCount}
    onChange={e => handleChange('apartmentModelsCount', e.target.value)}
    helperText="e.g., Model A, B, C = 3"
    sx={fieldSx}
  />
</Grid>

        {/* Status */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label="Status"
            value={form.status}
            onChange={e => handleChange('status', e.target.value)}
            sx={fieldSx}
          >
            <MenuItem value="active" sx={{ fontFamily: '"Poppins", sans-serif' }}>
              Active
            </MenuItem>
            <MenuItem value="inactive" sx={{ fontFamily: '"Poppins", sans-serif' }}>
              Inactive
            </MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Exterior Renders Section */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <ImageIcon sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
              Exterior Renders
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
            {exteriorRenders.map((url, idx) => (
              <ImagePreviewCard
                key={idx}
                url={url}
                onRemove={() => handleRemoveExterior(idx)}
              />
            ))}
            <Button
              component="label"
              variant="outlined"
              startIcon={<AddPhotoAlternate />}
              disabled={uploadingExterior}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                borderStyle: 'dashed',
                borderWidth: 2,
                height: 100,
                minWidth: 100,
                color: theme.palette.secondary.main,
                borderColor: theme.palette.secondary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: theme.palette.chipAdmin.bg
                }
              }}
            >
              {uploadingExterior ? 'Uploading...' : 'Add'}
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleExteriorUpload}
              />
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Floor Plans Section */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <GridOn sx={{ fontSize: 20, color: theme.palette.accent.main }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
              Floor Plans {totalFloors > 0 && `(${floorPlans.length}/${totalFloors})`}
            </Typography>
          </Box>
          
          {totalFloors === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Set the number of floors first to upload floor plans
            </Alert>
          ) : (
            <Box>
              {floorNumbers.map(floorNum => {
                const existing = floorPlans.find(fp => fp.floorNumber === floorNum)
                return existing ? (
                  <FloorPlanPreview
                    key={floorNum}
                    floorPlan={existing}
                    onRemove={() => handleRemoveFloorPlan(floorNum)}
                  />
                ) : (
                  <Paper
                    key={floorNum}
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 1.5,
                      borderRadius: 2,
                      border: `2px dashed ${theme.palette.cardBorder}`,
                      bgcolor: theme.palette.background.default,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                      Floor {floorNum} {floorNum === 1 ? '(Commercial)' : '(Residential)'}
                    </Typography>
                    <Button
                      component="label"
                      size="small"
                      variant="outlined"
                      startIcon={<AddPhotoAlternate />}
                      disabled={uploadingFloorPlan}
                      sx={{
                        textTransform: 'none',
                        fontFamily: '"Poppins", sans-serif',
                        borderRadius: 2
                      }}
                    >
                      Upload Plan
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleFloorPlanUpload(e, floorNum)}
                      />
                    </Button>
                  </Paper>
                )
              })}
            </Box>
          )}
        </Grid>
      </Grid>
    </ModalWrapper>
  )
}

export default BuildingDialog