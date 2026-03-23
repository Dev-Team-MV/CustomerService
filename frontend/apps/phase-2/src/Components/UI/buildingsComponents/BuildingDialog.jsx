// import { useState, useEffect } from 'react'
// import { 
//   Grid, TextField, MenuItem, Button, Box, Typography, Alert,
//   IconButton, Divider, Paper
// } from '@mui/material'
// import { 
//   Business, AddPhotoAlternate, Delete, GridOn, Image as ImageIcon
// } from '@mui/icons-material'
// import { useTheme } from '@mui/material/styles'
// import ModalWrapper from '@shared/constants/ModalWrapper'
// import PrimaryButton from '@shared/constants/PrimaryButton'
// import { useProjects } from '@shared/hooks/useProjects'

// const DEFAULT_FORM = {
//   project: '',
//   name: '',
//   section: '',
//   floors: '',
//   totalApartments: '',
//   status: 'active',
// }

// const ImagePreviewCard = ({ url, onRemove }) => {
//   const theme = useTheme()
//   return (
//     <Box sx={{
//       position: 'relative',
//       width: 100,
//       height: 100,
//       borderRadius: 2,
//       overflow: 'hidden',
//       border: `2px solid ${theme.palette.cardBorder}`,
//       bgcolor: theme.palette.cardBg,
//       mr: 1.5,
//       mb: 1.5,
//       display: 'inline-block'
//     }}>
//       <img 
//         src={url} 
//         alt="preview" 
//         style={{ 
//           width: '100%', 
//           height: '100%', 
//           objectFit: 'cover' 
//         }} 
//       />
//       {onRemove && (
//         <IconButton
//           size="small"
//           onClick={onRemove}
//           sx={{
//             position: 'absolute',
//             top: 4,
//             right: 4,
//             bgcolor: 'rgba(255,255,255,0.9)',
//             '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
//           }}
//         >
//           <Delete fontSize="small" sx={{ color: theme.palette.warning.main }} />
//         </IconButton>
//       )}
//     </Box>
//   )
// }

// const FloorPlanPreview = ({ floorPlan, onRemove }) => {
//   const theme = useTheme()
//   const displayUrl = floorPlan.url || (floorPlan.file ? URL.createObjectURL(floorPlan.file) : '')
  
//   return (
//     <Paper
//       elevation={0}
//       sx={{
//         p: 2,
//         mb: 1.5,
//         borderRadius: 2,
//         border: `1px solid ${theme.palette.cardBorder}`,
//         bgcolor: theme.palette.cardBg,
//         display: 'flex',
//         alignItems: 'center',
//         gap: 2
//       }}
//     >
//       <Box
//         sx={{
//           width: 80,
//           height: 80,
//           borderRadius: 1.5,
//           overflow: 'hidden',
//           border: `2px solid ${theme.palette.cardBorder}`,
//           flexShrink: 0
//         }}
//       >
//         {displayUrl && (
//           <img
//             src={displayUrl}
//             alt={`Floor ${floorPlan.floorNumber}`}
//             style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//           />
//         )}
//       </Box>
//       <Box flex={1}>
//         <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
//           Floor {floorPlan.floorNumber}
//         </Typography>
//         <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
//           {floorPlan.floorNumber === 1 ? 'Commercial' : 'Residential'}
//         </Typography>
//       </Box>
//       {onRemove && (
//         <IconButton
//           size="small"
//           onClick={onRemove}
//           sx={{
//             color: theme.palette.warning.main,
//             '&:hover': { bgcolor: theme.palette.chipSuperadmin.bg }
//           }}
//         >
//           <Delete fontSize="small" />
//         </IconButton>
//       )}
//     </Paper>
//   )
// }

// const BuildingDialog = ({ open, onClose, onSaved, selectedBuilding }) => {
//   const theme = useTheme()
//   const { projects, loading: loadingProjects } = useProjects()
//   const [form, setForm] = useState(DEFAULT_FORM)
//   const [exteriorRenders, setExteriorRenders] = useState([])
//   const [floorPlans, setFloorPlans] = useState([])
//   const [saving, setSaving] = useState(false)

//   useEffect(() => {
//     if (open) {
//       if (selectedBuilding) {
//         setForm({
//           project: selectedBuilding.project?._id || selectedBuilding.project || '',
//           name: selectedBuilding.name || '',
//           section: selectedBuilding.section || '',
//           floors: selectedBuilding.floors ?? '',
//           totalApartments: selectedBuilding.totalApartments ?? '',
//           status: selectedBuilding.status || 'active',
//         })
//         setExteriorRenders(selectedBuilding.exteriorRenders || [])
//         setFloorPlans(selectedBuilding.floorPlans || [])
//       } else {
//         setForm(DEFAULT_FORM)
//         setExteriorRenders([])
//         setFloorPlans([])
//       }
//     }
//   }, [selectedBuilding, open])

//   const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

//   const isValid = form.project && form.name.trim().length > 0 && Number(form.floors) > 0

//   const handleSubmit = async () => {
//     if (!isValid) return
    
//     setSaving(true)
//     try {
//       const payload = {
//         ...selectedBuilding,
//         ...form,
//         floors: Number(form.floors),
//         totalApartments: Number(form.totalApartments) || 0,
//         floorPlans,
//         exteriorRenders,
//         polygon: selectedBuilding?.polygon || [],
//       }

//       await onSaved(payload)
//     } catch (error) {
//       console.error('Error saving building:', error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleExteriorUpload = (e) => {
//     const files = Array.from(e.target.files)
//     if (!files.length) return
    
//     setExteriorRenders(prev => [...prev, ...files])
//     e.target.value = ''
//   }

//   const handleRemoveExterior = (index) => {
//     setExteriorRenders(prev => prev.filter((_, i) => i !== index))
//   }

//   const handleFloorPlanUpload = (e, floorNumber) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     setFloorPlans(prev => {
//       const existing = prev.filter(fp => fp.floorNumber !== floorNumber)
//       return [...existing, { 
//         floorNumber, 
//         file,
//         polygons: prev.find(fp => fp.floorNumber === floorNumber)?.polygons || []
//       }].sort((a, b) => a.floorNumber - b.floorNumber)
//     })
    
//     e.target.value = ''
//   }

//   const handleRemoveFloorPlan = (floorNumber) => {
//     setFloorPlans(prev => prev.filter(fp => fp.floorNumber !== floorNumber))
//   }

//   const fieldSx = {
//     '& .MuiOutlinedInput-root': {
//       borderRadius: 3,
//       fontFamily: '"Poppins", sans-serif',
//       bgcolor: 'white',
//       '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '2px' },
//       '&:hover fieldset': { borderColor: theme.palette.secondary.main }
//     },
//     '& .MuiInputLabel-root': {
//       fontFamily: '"Poppins", sans-serif',
//       '&.Mui-focused': { color: theme.palette.primary.main }
//     }
//   }

//   const actions = (
//     <>
//       <Button
//         onClick={onClose}
//         disabled={saving}
//         sx={{
//           borderRadius: 3,
//           textTransform: 'none',
//           fontWeight: 600,
//           px: 3, py: 1.2,
//           color: theme.palette.text.secondary,
//           fontFamily: '"Poppins", sans-serif',
//           border: `2px solid ${theme.palette.divider}`,
//           '&:hover': {
//             bgcolor: theme.palette.action.hover,
//             borderColor: theme.palette.text.secondary
//           }
//         }}
//       >
//         Cancel
//       </Button>
//       <PrimaryButton onClick={handleSubmit} disabled={!isValid || saving} startIcon={<Business />}>
//         {saving ? 'Saving...' : selectedBuilding ? 'Update Building' : 'Create Building'}
//       </PrimaryButton>
//     </>
//   )

//   const totalFloors = Number(form.floors) || 0
//   const floorNumbers = Array.from({ length: totalFloors }, (_, i) => i + 1)

//   return (
//     <ModalWrapper
//       open={open}
//       onClose={onClose}
//       icon={Business}
//       title={selectedBuilding ? 'Edit Building' : 'New Building'}
//       subtitle={
//         selectedBuilding
//           ? `Editing ${selectedBuilding.name}`
//           : 'Fill in the basic info to create the building'
//       }
//       maxWidth="md"
//       actions={actions}
//     >
//       <Alert
//         severity="info"
//         sx={{
//           mb: 2,
//           borderRadius: 3,
//           bgcolor: theme.palette.secondary.main + '14',
//           border: `1px solid ${theme.palette.secondary.main}4D`,
//           fontFamily: '"Poppins", sans-serif',
//           '& .MuiAlert-icon': { color: theme.palette.secondary.main }
//         }}
//       >
//         Floor 1 is always reserved for commercial spaces. Residential floors start from Floor 2.
//       </Alert>

//       <Grid container spacing={2} sx={{ mt: 0.5 }}>
//         <Grid item xs={12}>
//           <TextField
//             fullWidth
//             select
//             required
//             label="Project"
//             value={form.project}
//             onChange={e => handleChange('project', e.target.value)}
//             disabled={loadingProjects}
//             helperText="Select the project this building belongs to"
//             sx={fieldSx}
//           >
//             {loadingProjects ? (
//               <MenuItem disabled sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                 Loading projects...
//               </MenuItem>
//             ) : projects.length === 0 ? (
//               <MenuItem disabled sx={{ fontFamily: '"Poppins", sans-serif' }}>
//                 No projects available
//               </MenuItem>
//             ) : (
//               projects.map(project => (
//                 <MenuItem
//                   key={project._id}
//                   value={project._id}
//                   sx={{ 
//                     fontFamily: '"Poppins", sans-serif',
//                     '&:hover': { bgcolor: theme.palette.secondary.main + '08' }
//                   }}
//                 >
//                   {project.name} {project.slug ? `(${project.slug})` : ''}
//                 </MenuItem>
//               ))
//             )}
//           </TextField>
//         </Grid>

//         <Grid item xs={12} sm={8}>
//           <TextField
//             fullWidth
//             required
//             label="Building Name"
//             value={form.name}
//             onChange={e => handleChange('name', e.target.value)}
//             sx={fieldSx}
//           />
//         </Grid>
//         <Grid item xs={12} sm={4}>
//           <TextField
//             fullWidth
//             label="Section"
//             value={form.section}
//             onChange={e => handleChange('section', e.target.value)}
//             helperText="e.g., North, South"
//             sx={fieldSx}
//           />
//         </Grid>

//         <Grid item xs={12} sm={6}>
//           <TextField
//             fullWidth
//             required
//             type="number"
//             label="Total Floors"
//             inputProps={{ min: 1 }}
//             value={form.floors}
//             onChange={e => handleChange('floors', e.target.value)}
//             helperText="Floor 1 = Commercial"
//             sx={fieldSx}
//           />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <TextField
//             fullWidth
//             type="number"
//             label="Total Apartments"
//             inputProps={{ min: 0 }}
//             value={form.totalApartments}
//             onChange={e => handleChange('totalApartments', e.target.value)}
//             helperText="Residential units only"
//             sx={fieldSx}
//           />
//         </Grid>

//         <Grid item xs={12}>
//           <TextField
//             fullWidth
//             select
//             label="Status"
//             value={form.status}
//             onChange={e => handleChange('status', e.target.value)}
//             sx={fieldSx}
//           >
//             <MenuItem value="active" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//               Active
//             </MenuItem>
//             <MenuItem value="inactive" sx={{ fontFamily: '"Poppins", sans-serif' }}>
//               Inactive
//             </MenuItem>
//           </TextField>
//         </Grid>

//         <Grid item xs={12}>
//           <Divider sx={{ my: 2 }} />
//         </Grid>

//         <Grid item xs={12}>
//           <Box display="flex" alignItems="center" gap={1} mb={1}>
//             <ImageIcon sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
//             <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
//               Exterior Renders
//             </Typography>
//           </Box>
//           <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
//             {exteriorRenders.map((item, idx) => {
//               const url = typeof item === 'string' ? item : URL.createObjectURL(item)
//               return (
//                 <ImagePreviewCard
//                   key={idx}
//                   url={url}
//                   onRemove={() => handleRemoveExterior(idx)}
//                 />
//               )
//             })}
//             <Button
//               component="label"
//               variant="outlined"
//               startIcon={<AddPhotoAlternate />}
//               sx={{
//                 borderRadius: 2,
//                 textTransform: 'none',
//                 fontFamily: '"Poppins", sans-serif',
//                 fontWeight: 600,
//                 borderStyle: 'dashed',
//                 borderWidth: 2,
//                 height: 100,
//                 minWidth: 100,
//                 color: theme.palette.secondary.main,
//                 borderColor: theme.palette.secondary.main,
//                 '&:hover': {
//                   borderColor: theme.palette.primary.main,
//                   bgcolor: theme.palette.chipAdmin.bg
//                 }
//               }}
//             >
//               Add
//               <input
//                 type="file"
//                 hidden
//                 multiple
//                 accept="image/*"
//                 onChange={handleExteriorUpload}
//               />
//             </Button>
//           </Box>
//         </Grid>

//         <Grid item xs={12}>
//           <Divider sx={{ my: 2 }} />
//         </Grid>

//         <Grid item xs={12}>
//           <Box display="flex" alignItems="center" gap={1} mb={1}>
//             <GridOn sx={{ fontSize: 20, color: theme.palette.accent.main }} />
//             <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
//               Floor Plans {totalFloors > 0 && `(${floorPlans.length}/${totalFloors})`}
//             </Typography>
//           </Box>
          
//           {totalFloors === 0 ? (
//             <Alert severity="info" sx={{ borderRadius: 2 }}>
//               Set the number of floors first to upload floor plans
//             </Alert>
//           ) : (
//             <Box>
//               {floorNumbers.map(floorNum => {
//                 const existing = floorPlans.find(fp => fp.floorNumber === floorNum)
//                 return existing ? (
//                   <FloorPlanPreview
//                     key={floorNum}
//                     floorPlan={existing}
//                     onRemove={() => handleRemoveFloorPlan(floorNum)}
//                   />
//                 ) : (
//                   <Paper
//                     key={floorNum}
//                     elevation={0}
//                     sx={{
//                       p: 2,
//                       mb: 1.5,
//                       borderRadius: 2,
//                       border: `2px dashed ${theme.palette.cardBorder}`,
//                       bgcolor: theme.palette.background.default,
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'space-between'
//                     }}
//                   >
//                     <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
//                       Floor {floorNum} {floorNum === 1 ? '(Commercial)' : '(Residential)'}
//                     </Typography>
//                     <Button
//                       component="label"
//                       size="small"
//                       variant="outlined"
//                       startIcon={<AddPhotoAlternate />}
//                       sx={{
//                         textTransform: 'none',
//                         fontFamily: '"Poppins", sans-serif',
//                         borderRadius: 2
//                       }}
//                     >
//                       Upload Plan
//                       <input
//                         type="file"
//                         hidden
//                         accept="image/*"
//                         onChange={(e) => handleFloorPlanUpload(e, floorNum)}
//                       />
//                     </Button>
//                   </Paper>
//                 )
//               })}
//             </Box>
//           )}
//         </Grid>
//       </Grid>
//     </ModalWrapper>
//   )
// }

// export default BuildingDialog

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
import ExteriorPolygonEditor from './ExteriorPolygonEditor' // <-- nuevo import

const DEFAULT_FORM = {
  project: '',
  name: '',
  section: '',
  floors: '',
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
  const displayUrl = floorPlan.url || (floorPlan.file ? URL.createObjectURL(floorPlan.file) : '')
  
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
        {displayUrl && (
          <img
            src={displayUrl}
            alt={`Floor ${floorPlan.floorNumber}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
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
  const [saving, setSaving] = useState(false)

  // nuevo: polígonos de exterior y estado del editor
  const [exteriorPolygons, setExteriorPolygons] = useState([])
  const [polygonEditorOpen, setPolygonEditorOpen] = useState(false)
  const [polygonEditorImageUrl, setPolygonEditorImageUrl] = useState(null) // url temporal si la imagen es File

  useEffect(() => {
    if (open) {
      if (selectedBuilding) {
        setForm({
          project: selectedBuilding.project?._id || selectedBuilding.project || '',
          name: selectedBuilding.name || '',
          section: selectedBuilding.section || '',
          floors: selectedBuilding.floors ?? '',
          totalApartments: selectedBuilding.totalApartments ?? '',
          status: selectedBuilding.status || 'active',
        })
        setExteriorRenders(selectedBuilding.exteriorRenders || [])
        setFloorPlans(selectedBuilding.floorPlans || [])
        setExteriorPolygons(selectedBuilding.buildingFloorPolygons || []) // <--- CAMBIO AQUÍ
      } else {
        setForm(DEFAULT_FORM)
        setExteriorRenders([])
        setFloorPlans([])
        setExteriorPolygons([])
      }
    } else {
      if (polygonEditorImageUrl) {
        URL.revokeObjectURL(polygonEditorImageUrl)
        setPolygonEditorImageUrl(null)
      }
    }
  }, [selectedBuilding, open]) // eslint-disable-line
  // limpiar url temporal si cambia
  useEffect(() => {
    return () => {
      if (polygonEditorImageUrl) {
        URL.revokeObjectURL(polygonEditorImageUrl)
      }
    }
  }, [polygonEditorImageUrl])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const isValid = form.project && form.name.trim().length > 0 && Number(form.floors) > 0

  const flattenPolygons = (polygons) => {
  if (!Array.isArray(polygons)) return []
  return polygons.map(poly => {
    const arr = []
    for (let i = 0; i < (poly.points?.length || 0); i += 2) {
      arr.push({ x: poly.points[i], y: poly.points[i + 1] })
    }
    return arr
  })
}

  const handleSubmit = async () => {
    if (!isValid) return
  
    // Validación rápida (opcional)
    const ids = new Set()
    const floorNums = new Set()
    for (const poly of exteriorPolygons) {
            console.log('Polígonos a guardar:', exteriorPolygons)
      if (!poly.id || !poly.floorNumber || !Array.isArray(poly.points) || poly.points.length < 6) {
        alert('Each polygon must have id, floorNumber, and at least 6 points.')
        return
      }
      if (ids.has(poly.id)) {
        alert('Polygon id must be unique.')
        return
      }
      if (floorNums.has(poly.floorNumber)) {
        alert('floorNumber must be unique.')
        return
      }
      ids.add(poly.id)
      floorNums.add(poly.floorNumber)
    }
  
    setSaving(true)
    try {
      const payload = {
        ...selectedBuilding,
        ...form,
        floors: Number(form.floors),
        totalApartments: Number(form.totalApartments) || 0,
        floorPlans,
        exteriorRenders,
        buildingFloorPolygons: exteriorPolygons, // <--- CAMBIO CLAVE
      }
      console.log('building', payload)
      await onSaved(payload)
    } catch (error) {
      console.error('Error saving building:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleExteriorUpload = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    
    setExteriorRenders(prev => [...prev, ...files])
    e.target.value = ''
  }

  const handleRemoveExterior = (index) => {
    setExteriorRenders(prev => prev.filter((_, i) => i !== index))
  }

  const handleFloorPlanUpload = (e, floorNumber) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFloorPlans(prev => {
      const existing = prev.filter(fp => fp.floorNumber !== floorNumber)
      return [...existing, { 
        floorNumber, 
        file,
        polygons: prev.find(fp => fp.floorNumber === floorNumber)?.polygons || []
      }].sort((a, b) => a.floorNumber - b.floorNumber)
    })
    
    e.target.value = ''
  }

  const handleRemoveFloorPlan = (floorNumber) => {
    setFloorPlans(prev => prev.filter(fp => fp.floorNumber !== floorNumber))
  }

  // abre editor de polígonos usando la primera imagen (exteriorRenders[0])
  const handleOpenPolygonEditor = () => {
    if (!exteriorRenders || exteriorRenders.length === 0) return

    const first = exteriorRenders[0]
    if (typeof first === 'string') {
      setPolygonEditorImageUrl(first)
    } else if (first instanceof File) {
      const url = URL.createObjectURL(first)
      setPolygonEditorImageUrl(url)
    } else {
      setPolygonEditorImageUrl(null)
    }
    setPolygonEditorOpen(true)
  }

  const handleClosePolygonEditor = () => {
    setPolygonEditorOpen(false)
    // revoke temp url if present
    if (polygonEditorImageUrl && (!exteriorRenders[0] || typeof exteriorRenders[0] !== 'string')) {
      URL.revokeObjectURL(polygonEditorImageUrl)
      setPolygonEditorImageUrl(null)
    }
  }

  const handleSavePolygons = (polygons) => {
    // Si falta floorNumber, asigna 1 por defecto (solo para pruebas)
    const withFloor = (polygons || []).map((poly, idx) => ({
      ...poly,
      floorNumber: poly.floorNumber || 1, // <-- aquí puedes mejorar la lógica
      isCommercial: poly.isCommercial ?? (poly.floorNumber === 1), // opcional
    }))
    setExteriorPolygons(withFloor)
    handleClosePolygonEditor()
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
        disabled={saving}
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
      <PrimaryButton onClick={handleSubmit} disabled={!isValid || saving} startIcon={<Business />}>
        {saving ? 'Saving...' : selectedBuilding ? 'Update Building' : 'Create Building'}
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

        <Grid item xs={12} sm={6}>
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
        <Grid item xs={12} sm={6}>
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

        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <ImageIcon sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
              Exterior Renders
            </Typography>

            {/* Botón para abrir editor de polígonos si hay al menos una imagen */}
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleOpenPolygonEditor}
                disabled={!exteriorRenders || exteriorRenders.length === 0}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                Edit Polygons
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
            {exteriorRenders.map((item, idx) => {
              const url = typeof item === 'string' ? item : URL.createObjectURL(item)
              return (
                <ImagePreviewCard
                  key={idx}
                  url={url}
                  onRemove={() => handleRemoveExterior(idx)}
                />
              )
            })}
            <Button
              component="label"
              variant="outlined"
              startIcon={<AddPhotoAlternate />}
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
              Add
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

      {/* ExteriorPolygonEditor - usa la primera imagen (url o objectURL) */}
      <ExteriorPolygonEditor
        open={polygonEditorOpen}
        onClose={handleClosePolygonEditor}
        exteriorUrl={polygonEditorImageUrl || (exteriorRenders[0] && typeof exteriorRenders[0] === 'string' ? exteriorRenders[0] : null)}
        polygons={exteriorPolygons || []}
        onSave={handleSavePolygons}
      />
    </ModalWrapper>
  )
}

export default BuildingDialog