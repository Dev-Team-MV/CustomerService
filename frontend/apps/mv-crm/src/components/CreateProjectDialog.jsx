import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, Typography,
  Tabs, Tab, Divider, Grid, Chip, IconButton, Stack, Paper
} from '@mui/material'
import { AddPhotoAlternate, Delete, Add, Save, Cancel, CropSquare, LocationOn, Palette } from '@mui/icons-material'
import projectService from '@shared/services/projectService'
import uploadService from '@shared/services/uploadService'
import { useTranslation } from 'react-i18next'

import ProjectVariablesManager from '@shared/components/ProjectVariablesManager'

const PROJECT_TYPES = [
  { value: 'residential_lots', label: 'Residential Lots' },
  { value: 'commercial',       label: 'Commercial' },
  { value: 'mixed_use',        label: 'Mixed Use' },
]
const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' }
]

const GalleryThumb = ({ url, onRemove }) => (
  <Box sx={{
    position: 'relative',
    width: 70,
    height: 70,
    borderRadius: 0,
    overflow: 'hidden',
    border: '1px solid #000',
    bgcolor: '#fff',
    mr: 2,
    mb: 1,
    display: 'inline-block'
  }}>
    <img src={url} alt="gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    {onRemove && (
      <IconButton
        size="small"
        onClick={onRemove}
        sx={{ position: 'absolute', top: 4, right: 4, bgcolor: '#fff', color: '#000', borderRadius: 0 }}
      >
        <Delete fontSize="small" />
      </IconButton>
    )}
  </Box>
)

const ColorChip = ({ color, onRemove }) => (
  <Chip
    label={`${color.key}: ${color.value}`}
    onDelete={onRemove}
    sx={{
      borderRadius: 0,
      fontFamily: '"Courier New", monospace',
      fontSize: '0.7rem',
      fontWeight: 600,
      bgcolor: '#f5f5f5',
      border: '1px solid #e0e0e0',
      '& .MuiChip-label': { display: 'flex', alignItems: 'center', gap: 1 },
      '& .MuiChip-deleteIcon': { color: '#000', '&:hover': { color: '#d32f2f' } }
    }}
    avatar={
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: 0,
          bgcolor: color.value,
          border: '1px solid #000',
          ml: 0.5
        }}
      />
    }
  />
)

export default function CreateProjectDialog({ open, onClose, onCreated, initialData = null, editMode = false }) {
  const [langTab, setLangTab] = useState('en')
  const { t } = useTranslation('project')

  const [form, setForm] = useState({
    name: '', slug: '', type: 'residential_lots', isActive: true, status: 'active', phase: 'I',
    title: { en: '', es: '' }, subtitle: { en: '', es: '' }, description: { en: '', es: '' }, fullDescription: { en: '', es: '' },
    features: { en: [], es: [] }, image: '', logo: '', brandColors: [], gallery: [], externalUrl: '', location: '', area: '', videos: [],
  })
  const [featureInput, setFeatureInput] = useState('')
  const [colorInput, setColorInput] = useState('')
  const [mainImage, setMainImage] = useState('')
  const [logo, setLogo] = useState('')
  const [gallery, setGallery] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '', slug: initialData.slug || '', type: initialData.type || 'residential_lots',
        isActive: initialData.isActive ?? true, status: initialData.status || 'active', phase: initialData.phase || 'I',
        title: { en: initialData.title?.en || '', es: initialData.title?.es || '' },
        subtitle: { en: initialData.subtitle?.en || '', es: initialData.subtitle?.es || '' },
        description: { en: initialData.description?.en || '', es: initialData.description?.es || '' },
        fullDescription: { en: initialData.fullDescription?.en || '', es: initialData.fullDescription?.es || '' },
        features: { en: initialData.features?.en || [], es: initialData.features?.es || [] },
        image: initialData.image || '', logo: initialData.logo || '',
        brandColors: Array.isArray(initialData.brandColors) ? initialData.brandColors : [],
        gallery: initialData.gallery || [], externalUrl: initialData.externalUrl || '', location: initialData.location || '', area: initialData.area || '', videos: initialData.videos || [],
      })
      setMainImage(initialData.image || '')
      setLogo(initialData.logo || '')
      setGallery(initialData.gallery || [])
      setVideos(initialData.videos || [])
    } else {
      setForm({
        name: '', slug: '', type: 'residential_lots', isActive: true, status: 'active', phase: 'I',
        title: { en: '', es: '' }, subtitle: { en: '', es: '' }, description: { en: '', es: '' }, fullDescription: { en: '', es: '' },
        features: { en: [], es: [] }, image: '', logo: '', brandColors: [], gallery: [], externalUrl: '', location: '', area: '', videos: [],
      })
      setMainImage('')
      setLogo('')
      setGallery([])
      setVideos([])
    }
    setLangTab('en')
    setFeatureInput('')
    setColorInput('')
    setError('')
  }, [initialData, open])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  const handleLangChange = (field, lang, value) => setForm(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }))

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      handleLangChange('features', langTab, [...form.features[langTab], featureInput.trim()])
      setFeatureInput('')
    }
  }
  const handleFeatureKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddFeature() }
  }
  const handleRemoveFeature = idx => {
    const newArr = form.features[langTab].filter((_, i) => i !== idx)
    handleLangChange('features', langTab, newArr)
  }

  const handleImageUpload = async (e) => {
    if (e.target.files?.[0]) {
      setLoading(true)
      try {
        const url = await uploadService.uploadImage(e.target.files[0], 'projects/main')
        setMainImage(url)
        handleChange('image', url)
      } catch { setError('Error uploading image') }
      setLoading(false)
    }
  }
  const handleMainImageRemove = () => { setMainImage(''); handleChange('image', '') }

  const handleLogoUpload = async (e) => {
    if (e.target.files?.[0]) {
      setLoading(true)
      try {
        const url = await uploadService.uploadImage(e.target.files[0], 'projects/logos')
        setLogo(url)
        handleChange('logo', url)
      } catch { setError('Error uploading logo') }
      setLoading(false)
    }
  }
  const handleLogoRemove = () => { setLogo(''); handleChange('logo', '') }

  const handleAddColor = () => {
    if (!colorInput.trim()) return
    let key, value
    if (colorInput.includes(':')) {
      const parts = colorInput.split(':').map(s => s.trim())
      key = parts[0]; value = parts[1]
    } else {
      key = `color-${form.brandColors.length + 1}`; value = colorInput.trim()
    }
    if (!value.startsWith('#') && !value.startsWith('rgb')) value = `#${value}`
    handleChange('brandColors', [...form.brandColors, { key, value }])
    setColorInput('')
  }
  const handleColorKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddColor() }
  }
  const handleRemoveColor = idx => {
    const newArr = form.brandColors.filter((_, i) => i !== idx)
    handleChange('brandColors', newArr)
  }

  const handleGalleryUpload = async (e) => {
    if (e.target.files?.length) {
      setLoading(true)
      try {
        const urls = await uploadService.uploadMultipleImages(Array.from(e.target.files), 'projects/gallery')
        setGallery(prev => [...prev, ...urls])
        handleChange('gallery', [...gallery, ...urls])
      } catch { setError('Error uploading gallery images') }
      setLoading(false)
    }
  }
  const handleGalleryRemove = idx => {
    const newGallery = gallery.filter((_, i) => i !== idx)
    setGallery(newGallery)
    handleChange('gallery', newGallery)
  }

  const handleVideoUpload = async (e) => {
    if (e.target.files?.length) {
      setLoading(true)
      try {
        const urls = await uploadService.uploadMultipleImages(Array.from(e.target.files), 'projects/videos')
        setVideos(prev => [...prev, ...urls])
        handleChange('videos', [...videos, ...urls])
      } catch { setError('Error uploading videos') }
      setLoading(false)
    }
  }
  const handleRemoveVideo = idx => {
    const newArr = videos.filter((_, i) => i !== idx)
    setVideos(newArr)
    handleChange('videos', newArr)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = { ...form }
      if (editMode && initialData && initialData._id) {
        const res = await projectService.update(initialData._id, payload)
        if (res && res._id) { onCreated?.(res); onClose() }
        else setError('Could not update project')
      } else {
        const res = await projectService.create(payload)
        if (res && res._id) { onCreated?.(res); onClose() }
        else setError('Could not create project')
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Error saving project')
    } finally {
      setLoading(false)
    }
  }

  const unifiedButtonSx = { 
    borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } 
  }
  const inputSx = { 
    fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, 
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' }
  }

  return (
    <Dialog 
      id="create-project-dialog"
      open={open} 
      onClose={onClose} 
      maxWidth={false} 
      PaperProps={{ sx: { width: '100%', maxWidth: '1200px', borderRadius: 0, border: '1px solid #ececec', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', background: '#fff' } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontFamily: '"Courier New", monospace', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#000', background: '#fff', borderBottom: '1px solid #ececec', px: 4, py: 3 }}>
        {editMode ? t('modal.editTitle') : t('modal.createTitle')}
      </DialogTitle>
      
      <DialogContent sx={{ background: '#fff', px: 4, py: 3 }}>
        {/* ✅ ID agregado para el tour */}
        <Tabs 
          id="create-project-tabs"
          value={langTab} 
          onChange={(_, v) => setLangTab(v)} 
          sx={{ mb: 3, '& .MuiTab-root': { fontWeight: 600, fontFamily: '"Courier New", monospace', fontSize: "0.8rem", textTransform: "uppercase", color: '#000' }, '& .MuiTabs-indicator': { background: '#000' } }}
        >
          {LANGS.map(l => <Tab key={l.code} value={l.code} label={t(`modal.lang.${l.code}`)} />)}
        </Tabs>
        <Divider sx={{ mb: 3, borderColor: '#ececec' }} />

        <Grid container spacing={4}>
          {/* Columna izquierda: Información general y detalles */}
          <Grid item xs={12} md={7}>
            {/* ✅ ID agregado para el tour */}
            <Paper id="create-project-general-info" elevation={0} sx={{ p: 3, mb: 4, borderRadius: 0, border: '1px solid #e0e0e0', background: '#fff', boxShadow: 'none' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#000', mb: 2, fontFamily: '"Courier New", monospace', letterSpacing: '0.5px' }}>
                {t('modal.generalInfo')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label={t('modal.title', { lang: t(`modal.lang.${langTab}`) })} fullWidth value={form.title[langTab]} onChange={e => handleLangChange('title', langTab, e.target.value)} sx={inputSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label={t('modal.subtitle', { lang: t(`modal.lang.${langTab}`) })} fullWidth value={form.subtitle[langTab]} onChange={e => handleLangChange('subtitle', langTab, e.target.value)} sx={inputSx} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label={t('modal.shortDescription', { lang: t(`modal.lang.${langTab}`) })} fullWidth value={form.description[langTab]} onChange={e => handleLangChange('description', langTab, e.target.value)} sx={inputSx} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label={t('modal.fullDescription', { lang: t(`modal.lang.${langTab}`) })} fullWidth multiline minRows={2} value={form.fullDescription[langTab]} onChange={e => handleLangChange('fullDescription', langTab, e.target.value)} sx={inputSx} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#000', fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                    {t('modal.features', { lang: t(`modal.lang.${langTab}`) })}
                  </Typography>
                  <Stack direction="row" spacing={1} mb={1}>
                    <TextField value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={handleFeatureKeyDown} label={t('modal.addFeature')} size="small" sx={{ flex: 1, ...inputSx }} />
                    <IconButton onClick={handleAddFeature} sx={{ color: '#000', bgcolor: '#f5f5f5', border: '1px solid #000', borderRadius: 0, '&:hover': { bgcolor: '#e0e0e0' } }}>
                      <Add />
                    </IconButton>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {form.features[langTab].map((f, idx) => (
                      <Chip key={idx} label={f} onDelete={() => handleRemoveFeature(idx)} sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem', bgcolor: '#000', color: '#fff', fontWeight: 600 }} />
                    ))}
                  </Box>
                </Grid>
                
                {/* ✅ ID agrupado para nombre y slug */}
                <Grid item xs={12} id="create-project-name-slug">
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField label={t('modal.projectName')} fullWidth value={form.name} onChange={e => handleChange('name', e.target.value)} sx={inputSx} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label={t('modal.slug')} fullWidth value={form.slug} onChange={e => handleChange('slug', e.target.value)} helperText={t('modal.slugHelper')} sx={{ ...inputSx, '& .MuiFormHelperText-root': { fontFamily: '"Courier New", monospace', fontSize: '0.65rem' } }} />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>

            {/* ✅ ID agregado para el tour */}
            <Paper id="create-project-property-details" elevation={0} sx={{ p: 3, borderRadius: 0, border: '1px solid #e0e0e0', background: '#fff', boxShadow: 'none' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#000', mb: 2, fontFamily: '"Courier New", monospace', letterSpacing: '0.5px' }}>
                {t('modal.propertyDetails')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('modal.phase')} fullWidth value={form.phase} onChange={e => handleChange('phase', e.target.value)} sx={inputSx} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('modal.status')} fullWidth value={form.status} onChange={e => handleChange('status', e.target.value)} sx={inputSx} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('modal.type')} fullWidth value={form.type} onChange={e => handleChange('type', e.target.value)} select sx={inputSx}>
                    {PROJECT_TYPES.map(opt => <MenuItem key={opt.value} value={opt.value} sx={{ fontFamily: '"Courier New", monospace' }}>{t(`modal.projectTypes.${opt.value}`)}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField label={t('modal.externalUrl')} fullWidth value={form.externalUrl} onChange={e => handleChange('externalUrl', e.target.value)} sx={inputSx} />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField label={t('modal.location')} fullWidth value={form.location} onChange={e => handleChange('location', e.target.value)} InputProps={{ endAdornment: <LocationOn sx={{ color: '#000' }} /> }} sx={inputSx} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('modal.area')} fullWidth value={form.area} onChange={e => handleChange('area', e.target.value)} InputProps={{ endAdornment: <CropSquare sx={{ color: '#000' }} /> }} sx={inputSx} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Columna derecha: Media */}
          <Grid item xs={12} md={5}>
            {/* ✅ ID agregado para el tour */}
            <Paper id="create-project-media-assets" elevation={0} sx={{ p: 3, borderRadius: 0, border: '1px solid #e0e0e0', background: '#fff', boxShadow: 'none' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#000', mb: 2, fontFamily: '"Courier New", monospace', letterSpacing: '0.5px' }}>
                {t('modal.mediaAssets')}
              </Typography>

              <Box mb={2}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#000', fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                  {t('modal.mainImage')}
                </Typography>
                {mainImage ? (
                  <Box sx={{ position: 'relative', width: '100%', maxWidth: 180, height: 120, mb: 1 }}>
                    <img src={mainImage} alt="Main image preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0, border: '1px solid #000' }} />
                    <IconButton size="small" onClick={handleMainImageRemove} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: '#fff', color: '#000', borderRadius: 0 }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ border: '1.5px dashed #000', borderRadius: 0, bgcolor: '#fff', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <Button component="label" variant="text" sx={{ color: '#000', fontWeight: 600, fontFamily: '"Courier New", monospace', borderRadius: 0 }}>
                      <AddPhotoAlternate sx={{ mr: 1 }} /> {t('modal.upload')}
                      <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                    </Button>
                  </Box>
                )}
              </Box>

              <Box mb={2}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#000', fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                  Logo
                </Typography>
                {logo ? (
                  <Box sx={{ position: 'relative', width: '100%', maxWidth: 180, height: 100, mb: 1 }}>
                    <img src={logo} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 0, border: '1px solid #000', background: '#f5f5f5' }} />
                    <IconButton size="small" onClick={handleLogoRemove} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: '#fff', color: '#000', borderRadius: 0 }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ border: '1.5px dashed #000', borderRadius: 0, bgcolor: '#fff', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <Button component="label" variant="text" sx={{ color: '#000', fontWeight: 600, fontFamily: '"Courier New", monospace', borderRadius: 0 }}>
                      <AddPhotoAlternate sx={{ mr: 1 }} /> Upload Logo
                      <input type="file" accept="image/*" hidden onChange={handleLogoUpload} />
                    </Button>
                  </Box>
                )}
              </Box>

              <Box mb={2}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#000', fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                  {t('modal.gallery')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                  {gallery.map((url, idx) => <GalleryThumb key={url} url={url} onRemove={() => handleGalleryRemove(idx)} />)}
                  <Box sx={{ width: 70, height: 70, border: '1.5px dashed #000', borderRadius: 0, bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <Button component="label" variant="text" sx={{ color: '#000', fontWeight: 600, minWidth: 0, p: 0, borderRadius: 0 }}>
                      <AddPhotoAlternate />
                      <input type="file" accept="image/*" hidden multiple onChange={handleGalleryUpload} />
                    </Button>
                  </Box>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#000', fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                  {t('modal.videos')}
                </Typography>
                <Stack direction="row" spacing={1} mb={1}>
                  <Button component="label" variant="outlined" sx={{ color: '#000', borderColor: '#000', fontWeight: 600, fontFamily: '"Courier New", monospace', borderRadius: 0, '&:hover': { bgcolor: '#f5f5f5' } }}>
                    {t('modal.uploadVideo')}
                    <input type="file" accept="video/*" hidden multiple onChange={handleVideoUpload} />
                  </Button>
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {videos.map((v, idx) => (
                    <Box key={idx} sx={{ position: 'relative', width: 120, height: 120 }}>
                      <video src={v} controls style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0, border: '1px solid #000' }} />
                      <IconButton size="small" onClick={() => handleRemoveVideo(idx)} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: '#fff', color: '#000', borderRadius: 0 }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Brand Colors - Fila completa debajo */}
          <Grid item xs={12}>
            {/* ✅ ID agregado para el tour */}
            <Paper id="create-project-brand-colors" elevation={0} sx={{ p: 3, borderRadius: 0, border: '1px solid #e0e0e0', background: '#fff', boxShadow: 'none' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#000', mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontFamily: '"Courier New", monospace', letterSpacing: '0.5px' }}>
                <Palette fontSize="small" /> {t('modal.brandColors', 'Brand Colors')}
              </Typography>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, fontFamily: '"Courier New", monospace' }}>
                {t('modal.brandColorsHelper', 'Format: "key:color" (e.g.: "primary:#333F1F") or just color (e.g.: "#333F1F")')}
              </Typography>
              
              <Stack direction="row" spacing={1} mb={2}>
                <TextField value={colorInput} onChange={e => setColorInput(e.target.value)} onKeyDown={handleColorKeyDown} label={t('modal.addBrandColor', 'Add brand color')} placeholder="primary:#333F1F" size="small" sx={{ flex: 1, ...inputSx }} />
                <IconButton onClick={handleAddColor} sx={{ color: '#000', bgcolor: '#f5f5f5', border: '1px solid #000', borderRadius: 0, '&:hover': { bgcolor: '#e0e0e0' } }}>
                  <Add />
                </IconButton>
              </Stack>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {form.brandColors?.map((color, idx) => <ColorChip key={idx} color={color} onRemove={() => handleRemoveColor(idx)} />)}
              </Box>

              {form.brandColors?.length > 0 && (
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 0, border: '1px solid #e0e0e0' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#000', mb: 1, display: 'block', fontFamily: '"Courier New", monospace' }}>
                    {t('modal.colorPreview', 'Color Preview')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {form.brandColors.map((color, idx) => (
                      <Box key={idx} sx={{ width: 80, height: 80, borderRadius: 0, bgcolor: color.value, border: '1px solid #000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 700, textShadow: '1px 1px 2px rgba(0,0,0,0.5)', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', fontSize: '0.75rem', fontFamily: '"Courier New", monospace' }}>
                          {color.key}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', fontSize: '0.65rem', fontFamily: '"Courier New", monospace' }}>
                          {color.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {editMode && initialData?._id && (
            <Grid item xs={12}>
              <ProjectVariablesManager projectId={initialData._id} disabled={false} variant="dialog" />
            </Grid>
          )}
        </Grid>
        
        {error && <Typography color="error" sx={{ mt: 2, fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>{error}</Typography>}
      </DialogContent>
      
      {/* ✅ ID agregado para el tour */}
      <DialogActions id="create-project-actions" sx={{ px: 4, pb: 3, background: '#fff', borderTop: '1px solid #ececec' }}>
        <Button onClick={onClose} disabled={loading} startIcon={<Cancel />} sx={{ ...unifiedButtonSx, color: '#888' }}>
          {t('modal.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={<Save />}
          sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', fontWeight: 600, px: 3, '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}
        >
          {editMode ? t('modal.save') : t('modal.create')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}