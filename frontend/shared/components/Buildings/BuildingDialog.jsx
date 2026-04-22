// @shared/components/Buildings/BuildingDialog.jsx
import { useState, useEffect } from 'react'
import {
  Grid, TextField, MenuItem, Button, Box, Typography, Alert, IconButton, Divider, Paper
} from '@mui/material'
import { Business, AddPhotoAlternate, Delete, GridOn, Image as ImageIcon } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'
import ExteriorPolygonEditor from '@shared/components/Buildings/ExteriorPolygonEditor'
import {
  getBuildingConfig, isCommercialFloor, getFloorRange, getFloorType, FLOOR_TYPES
} from '@shared/config/buildingConfig'

const DEFAULT_FORM = {
  name: '',
  section: '',
  floors: '',
  totalApartments: '',
  status: 'active',
}

const ImagePreviewCard = ({ url, onRemove }) => {
  const theme = useTheme()
  return (
    <Box sx={{ position: 'relative', width: 100, height: 100, borderRadius: 2, overflow: 'hidden', border: `2px solid ${theme.palette.cardBorder}`, bgcolor: theme.palette.cardBg, mr: 1.5, mb: 1.5, display: 'inline-block' }}>
      <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      {onRemove && (
        <IconButton size="small" onClick={onRemove} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'rgba(255,255,255,1)' } }}>
          <Delete fontSize="small" sx={{ color: theme.palette.warning.main }} />
        </IconButton>
      )}
    </Box>
  )
}

const FloorPlanPreview = ({ floorPlan, label, onRemove }) => {
  const theme = useTheme()
  const displayUrl = floorPlan.url || (floorPlan.file ? URL.createObjectURL(floorPlan.file) : '')
  return (
    <Paper elevation={0} sx={{ p: 2, mb: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.cardBorder}`, bgcolor: theme.palette.cardBg, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ width: 80, height: 80, borderRadius: 1.5, overflow: 'hidden', border: `2px solid ${theme.palette.cardBorder}`, flexShrink: 0 }}>
        {displayUrl && <img src={displayUrl} alt={`Floor ${floorPlan.floorNumber}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </Box>
      <Box flex={1}>
        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>Floor {floorPlan.floorNumber}</Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>{label}</Typography>
      </Box>
      {onRemove && (
        <IconButton size="small" onClick={onRemove} sx={{ color: theme.palette.warning.main }}>
          <Delete fontSize="small" />
        </IconButton>
      )}
    </Paper>
  )
}

const BuildingDialog = ({ open, onClose, onSaved, selectedBuilding, projectSlug }) => {
  const theme = useTheme()
  const { t } = useTranslation(['buildings', 'common'])
  const config = getBuildingConfig(projectSlug)
  const floorRange = getFloorRange(projectSlug)

  const [form, setForm] = useState(DEFAULT_FORM)
  const [exteriorRenders, setExteriorRenders] = useState([])
  const [floorPlans, setFloorPlans] = useState([])
  const [saving, setSaving] = useState(false)
  const [exteriorPolygons, setExteriorPolygons] = useState([])
  const [polygonEditorOpen, setPolygonEditorOpen] = useState(false)
  const [polygonEditorImageUrl, setPolygonEditorImageUrl] = useState(null)

  useEffect(() => {
    if (open) {
      if (selectedBuilding) {
        setForm({
          name: selectedBuilding.name || '',
          section: selectedBuilding.section || '',
          floors: selectedBuilding.floors ?? '',
          totalApartments: selectedBuilding.totalApartments ?? '',
          status: selectedBuilding.status || 'active',
        })
        setExteriorRenders(selectedBuilding.exteriorRenders || [])
        setFloorPlans(selectedBuilding.floorPlans || [])
        setExteriorPolygons(selectedBuilding.buildingFloorPolygons || [])
      } else {
        setForm({ ...DEFAULT_FORM, floors: config.floors.default })
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

  useEffect(() => () => { if (polygonEditorImageUrl) URL.revokeObjectURL(polygonEditorImageUrl) }, [polygonEditorImageUrl])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const isValid =
    form.name.trim().length > 0 &&
    Number(form.floors) >= floorRange.min &&
    (!config.validation.requireSection || form.section.trim().length > 0)

  const handleSubmit = async () => {
    if (!isValid) return
    const ids = new Set()
    const floorNums = new Set()
    for (const poly of exteriorPolygons) {
      if (!poly.id || !poly.floorNumber || !Array.isArray(poly.points) || poly.points.length < 6) {
        alert('Each polygon must have id, floorNumber, and at least 6 points.')
        return
      }
      if (ids.has(poly.id) || floorNums.has(poly.floorNumber)) {
        alert('Polygon id and floorNumber must be unique.')
        return
      }
      ids.add(poly.id)
      floorNums.add(poly.floorNumber)
    }
    setSaving(true)
    try {
      await onSaved({
        ...selectedBuilding,
        ...form,
        project: config.projectId,
        floors: Number(form.floors),
        totalApartments: Number(form.totalApartments) || 0,
        floorPlans,
        exteriorRenders,
        buildingFloorPolygons: exteriorPolygons,
      })
    } catch (err) {
      console.error('Error saving building:', err)
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

  const handleFloorPlanUpload = (e, floorNumber) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFloorPlans(prev => [...prev.filter(fp => fp.floorNumber !== floorNumber), { floorNumber, file, polygons: prev.find(fp => fp.floorNumber === floorNumber)?.polygons || [] }].sort((a, b) => a.floorNumber - b.floorNumber))
    e.target.value = ''
  }

  const handleOpenPolygonEditor = () => {
    const first = exteriorRenders[0]
    if (!first) return
    setPolygonEditorImageUrl(typeof first === 'string' ? first : URL.createObjectURL(first))
    setPolygonEditorOpen(true)
  }

  const handleClosePolygonEditor = () => {
    setPolygonEditorOpen(false)
    if (polygonEditorImageUrl && (!exteriorRenders[0] || typeof exteriorRenders[0] !== 'string')) {
      URL.revokeObjectURL(polygonEditorImageUrl)
      setPolygonEditorImageUrl(null)
    }
  }

//   const handleSavePolygons = (polygons) => {
//     setExteriorPolygons((polygons || []).map(poly => ({
//       ...poly,
//       floorNumber: poly.floorNumber || 1,
//       isCommercial: isCommercialFloor(projectSlug, poly.floorNumber || 1),
//     })))
//     handleClosePolygonEditor()
//   }
const handleSavePolygons = (polygons) => {
  setExteriorPolygons((polygons || []).map(poly => ({
    ...poly,
    floorNumber: poly.floorNumber || 1,
    floorType: getFloorType(projectSlug, poly.floorNumber || 1),
    isCommercial: isCommercialFloor(projectSlug, poly.floorNumber || 1), // Mantener para compatibilidad
  })))
  handleClosePolygonEditor()
}
const getFloorLabel = (floorNumber) => {
  const floorType = getFloorType(projectSlug, floorNumber)
  
  switch (floorType) {
    case FLOOR_TYPES.PARKING:
      return t('buildings:floorTypes.parking', 'Parking')
    case FLOOR_TYPES.COMMERCIAL:
      return config.i18n.commercialLabel || t('buildings:commercial', 'Commercial')
    case FLOOR_TYPES.AMENITY:
      return t('buildings:floorTypes.amenity', 'Amenity')
    case FLOOR_TYPES.RESIDENTIAL:
    default:
      return config.i18n.residentialLabel || t('buildings:residential', 'Residential')
  }
}

  const fieldSx = {
    '& .MuiOutlinedInput-root': { borderRadius: 3, fontFamily: '"Poppins", sans-serif', bgcolor: 'white', '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '2px' }, '&:hover fieldset': { borderColor: theme.palette.secondary.main } },
    '& .MuiInputLabel-root': { fontFamily: '"Poppins", sans-serif', '&.Mui-focused': { color: theme.palette.primary.main } }
  }

  const totalFloors = Number(form.floors) || 0

  return (
    <ModalWrapper
      open={open} onClose={onClose} icon={Business}
      title={selectedBuilding ? t('buildings:editBuilding', 'Edit Building') : t('buildings:newBuilding', 'New Building')}
      subtitle={selectedBuilding ? `${t('buildings:editing', 'Editing')} ${selectedBuilding.name}` : t('buildings:fillBuildingInfo', 'Fill in the basic info to create the building')}
      maxWidth="md"
      actions={
        <>
          <Button onClick={onClose} disabled={saving} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 3, py: 1.2, color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', border: `2px solid ${theme.palette.divider}`, '&:hover': { bgcolor: theme.palette.action.hover } }}>
            {t('common:cancel', 'Cancel')}
          </Button>
          <PrimaryButton onClick={handleSubmit} disabled={!isValid || saving} startIcon={<Business />}>
            {saving ? t('common:saving', 'Saving...') : selectedBuilding ? t('buildings:updateBuilding', 'Update Building') : t('buildings:createBuilding', 'Create Building')}
          </PrimaryButton>
        </>
      }
    >
      {/* Alerta solo para proyectos con piso comercial */}
      {config.floors.hasCommercial && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 3, bgcolor: theme.palette.secondary.main + '14', border: `1px solid ${theme.palette.secondary.main}4D`, fontFamily: '"Poppins", sans-serif', '& .MuiAlert-icon': { color: theme.palette.secondary.main } }}>
          {t('buildings:commercialFloorNote', 'Floor 1 is reserved for commercial spaces. Residential floors start from Floor 2.')}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        {/* Name + Section (section solo si config lo requiere) */}
        <Grid item xs={12} sm={config.validation.requireSection ? 8 : 12}>
          <TextField fullWidth required label={t('buildings:buildingName', 'Building Name')} value={form.name} onChange={e => handleChange('name', e.target.value)} sx={fieldSx} />
        </Grid>
        {config.validation.requireSection && (
          <Grid item xs={12} sm={4}>
            <TextField fullWidth required label={t('buildings:section', 'Section')} value={form.section} onChange={e => handleChange('section', e.target.value)} helperText={t('buildings:sectionHelp', 'e.g., North, South')} sx={fieldSx} />
          </Grid>
        )}

        <Grid item xs={12} sm={6}>
          <TextField fullWidth required type="number" label={t('buildings:totalFloors', 'Total Floors')} inputProps={{ min: floorRange.min, max: floorRange.max }} value={form.floors} onChange={e => handleChange('floors', e.target.value)}
            helperText={config.floors.hasCommercial ? t('buildings:floor1Commercial', 'Floor 1 = Commercial') : `Min: ${floorRange.min}`}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth type="number" label={t('buildings:totalApartments', 'Total Apartments')} inputProps={{ min: 0 }} value={form.totalApartments} onChange={e => handleChange('totalApartments', e.target.value)} helperText={t('buildings:residentialUnitsOnly', 'Residential units only')} sx={fieldSx} />
        </Grid>

        <Grid item xs={12}>
          <TextField fullWidth select label={t('buildings:status', 'Status')} value={form.status} onChange={e => handleChange('status', e.target.value)} sx={fieldSx}>
            <MenuItem value="active">{t('buildings:active', 'Active')}</MenuItem>
            <MenuItem value="inactive">{t('buildings:inactive', 'Inactive')}</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

        {/* Exterior Renders */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <ImageIcon sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>{t('buildings:exteriorRenders', 'Exterior Renders')}</Typography>
            <Box sx={{ ml: 'auto' }}>
              <Button variant="contained" size="small" onClick={handleOpenPolygonEditor} disabled={!exteriorRenders || exteriorRenders.length === 0} sx={{ borderRadius: 2, fontWeight: 600 }}>
                {t('buildings:editPolygons', 'Edit Polygons')}
              </Button>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
            {exteriorRenders.map((item, idx) => {
              const url = typeof item === 'string' ? item : URL.createObjectURL(item)
              return <ImagePreviewCard key={idx} url={url} onRemove={() => setExteriorRenders(prev => prev.filter((_, i) => i !== idx))} />
            })}
            <Button component="label" variant="outlined" startIcon={<AddPhotoAlternate />} sx={{ borderRadius: 2, textTransform: 'none', fontFamily: '"Poppins", sans-serif', fontWeight: 600, borderStyle: 'dashed', borderWidth: 2, height: 100, minWidth: 100, color: theme.palette.secondary.main, borderColor: theme.palette.secondary.main }}>
              {t('common:add', 'Add')}
              <input type="file" hidden multiple accept="image/*" onChange={handleExteriorUpload} />
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

        {/* Floor Plans con etiquetas dinámicas */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <GridOn sx={{ fontSize: 20, color: theme.palette.accent?.main || theme.palette.primary.main }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
              {t('buildings:floorPlans', 'Floor Plans')} {totalFloors > 0 && `(${floorPlans.length}/${totalFloors})`}
            </Typography>
          </Box>
          {totalFloors === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>{t('buildings:setFloorCountFirst', 'Set the number of floors first')}</Alert>
          ) : (
            <Box>
              {Array.from({ length: totalFloors }, (_, i) => i + 1).map(floorNum => {
                const existing = floorPlans.find(fp => fp.floorNumber === floorNum)
                const floorLabel = getFloorLabel(floorNum)
                return existing ? (
                  <FloorPlanPreview key={floorNum} floorPlan={existing} label={floorLabel} onRemove={() => setFloorPlans(prev => prev.filter(fp => fp.floorNumber !== floorNum))} />
                ) : (
                  <Paper key={floorNum} elevation={0} sx={{ p: 2, mb: 1.5, borderRadius: 2, border: `2px dashed ${theme.palette.cardBorder}`, bgcolor: theme.palette.background.default, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                      Floor {floorNum} ({floorLabel})
                    </Typography>
                    <Button component="label" size="small" variant="outlined" startIcon={<AddPhotoAlternate />} sx={{ textTransform: 'none', fontFamily: '"Poppins", sans-serif', borderRadius: 2 }}>
                      {t('buildings:uploadPlan', 'Upload Plan')}
                      <input type="file" hidden accept="image/*" onChange={e => handleFloorPlanUpload(e, floorNum)} />
                    </Button>
                  </Paper>
                )
              })}
            </Box>
          )}
        </Grid>
      </Grid>

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