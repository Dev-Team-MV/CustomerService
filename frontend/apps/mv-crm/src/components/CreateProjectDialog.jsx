import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, Typography,
  Tabs, Tab, Divider, Grid, Chip, IconButton, Stack, Paper
} from '@mui/material'
import { AddPhotoAlternate, Delete, Add, Save, Cancel, CropSquare, LocationOn } from '@mui/icons-material'
import projectService from '@shared/services/projectService'
import uploadService from '@shared/services/uploadService'
import { useTranslation } from 'react-i18next'

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
    borderRadius: 2,
    overflow: 'hidden',
    border: '1.5px solid #222',
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
        sx={{ position: 'absolute', top: 4, right: 4, bgcolor: '#fff', color: '#222', boxShadow: 1 }}
      >
        <Delete fontSize="small" />
      </IconButton>
    )}
  </Box>
)

export default function CreateProjectDialog({ open, onClose, onCreated, initialData = null, editMode = false }) {
  const [langTab, setLangTab] = useState('en')
    const { t } = useTranslation('project')

  const [form, setForm] = useState({
    name: '',
    slug: '',
    type: 'residential_lots',
    isActive: true,
    status: 'active',
    phase: 'I',
    title: { en: '', es: '' },
    subtitle: { en: '', es: '' },
    description: { en: '', es: '' },
    fullDescription: { en: '', es: '' },
    features: { en: [], es: [] },
    image: '',
    gallery: [],
    externalUrl: '',
    location: '',
    area: '',
    videos: [],
  })
  const [featureInput, setFeatureInput] = useState('')
  const [mainImage, setMainImage] = useState('')
  const [gallery, setGallery] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        slug: initialData.slug || '',
        type: initialData.type || 'residential_lots',
        isActive: initialData.isActive ?? true,
        status: initialData.status || 'active',
        phase: initialData.phase || 'I',
        title: { en: initialData.title?.en || '', es: initialData.title?.es || '' },
        subtitle: { en: initialData.subtitle?.en || '', es: initialData.subtitle?.es || '' },
        description: { en: initialData.description?.en || '', es: initialData.description?.es || '' },
        fullDescription: { en: initialData.fullDescription?.en || '', es: initialData.fullDescription?.es || '' },
        features: {
          en: initialData.features?.en || [],
          es: initialData.features?.es || [],
        },
        image: initialData.image || '',
        gallery: initialData.gallery || [],
        externalUrl: initialData.externalUrl || '',
        location: initialData.location || '',
        area: initialData.area || '',
        videos: initialData.videos || [],
      })
      setMainImage(initialData.image || '')
      setGallery(initialData.gallery || [])
      setVideos(initialData.videos || [])
    } else {
      setForm({
        name: '',
        slug: '',
        type: 'residential_lots',
        isActive: true,
        status: 'active',
        phase: 'I',
        title: { en: '', es: '' },
        subtitle: { en: '', es: '' },
        description: { en: '', es: '' },
        fullDescription: { en: '', es: '' },
        features: { en: [], es: [] },
        image: '',
        gallery: [],
        externalUrl: '',
        location: '',
        area: '',
        videos: [],
      })
      setMainImage('')
      setGallery([])
      setVideos([])
    }
    setLangTab('en')
    setFeatureInput('')
    setError('')
  }, [initialData, open])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  const handleLangChange = (field, lang, value) => setForm(prev => ({
    ...prev,
    [field]: { ...prev[field], [lang]: value }
  }))

  // Features
  const handleAddFeature = () => {
    if (featureInput.trim()) {
      handleLangChange('features', langTab, [...form.features[langTab], featureInput.trim()])
      setFeatureInput('')
    }
  }
  const handleFeatureKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddFeature()
    }
  }
  const handleRemoveFeature = idx => {
    const newArr = form.features[langTab].filter((_, i) => i !== idx)
    handleLangChange('features', langTab, newArr)
  }

  // Main image
  const handleImageUpload = async (e) => {
    if (e.target.files?.[0]) {
      setLoading(true)
      try {
        const url = await uploadService.uploadImage(e.target.files[0], 'projects/main')
        setMainImage(url)
        handleChange('image', url)
      } catch {
        setError('Error uploading image')
      }
      setLoading(false)
    }
  }
  const handleMainImageRemove = () => {
    setMainImage('')
    handleChange('image', '')
  }

  // Gallery
  const handleGalleryUpload = async (e) => {
    if (e.target.files?.length) {
      setLoading(true)
      try {
        const urls = await uploadService.uploadMultipleImages(Array.from(e.target.files), 'projects/gallery')
        setGallery(prev => [...prev, ...urls])
        handleChange('gallery', [...gallery, ...urls])
      } catch {
        setError('Error uploading gallery images')
      }
      setLoading(false)
    }
  }
  const handleGalleryRemove = idx => {
    const newGallery = gallery.filter((_, i) => i !== idx)
    setGallery(newGallery)
    handleChange('gallery', newGallery)
  }

  // Videos
  const handleVideoUpload = async (e) => {
    if (e.target.files?.length) {
      setLoading(true)
      try {
        const urls = await uploadService.uploadMultipleImages(Array.from(e.target.files), 'projects/videos')
        setVideos(prev => [...prev, ...urls])
        handleChange('videos', [...videos, ...urls])
      } catch {
        setError('Error uploading videos')
      }
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
      const payload = {
        name: form.name,
        slug: form.slug,
        type: form.type,
        isActive: form.isActive,
        status: form.status,
        phase: form.phase,
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        fullDescription: form.fullDescription,
        features: form.features,
        image: form.image,
        gallery: form.gallery,
        externalUrl: form.externalUrl,
        location: form.location,
        area: form.area,
        videos: form.videos,
      }
      if (editMode && initialData && initialData._id) {
        const res = await projectService.update(initialData._id, payload)
        if (res && res._id) {
          onCreated?.(res)
          onClose()
        } else {
          setError('Could not update project')
        }
      } else {
        const res = await projectService.create(payload)
        if (res && res._id) {
          onCreated?.(res)
          onClose()
        } else {
          setError('Could not create project')
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Error saving project')
    } finally {
      setLoading(false)
    }
  }
return (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth={false}
    PaperProps={{
      sx: {
        width: '100%',
        maxWidth: '1200px',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        background: '#fff'
      }
    }}
  >
    <DialogTitle sx={{
      fontWeight: 700,
      fontFamily: '"Poppins", sans-serif',
      color: '#111',
      background: '#fff',
      borderBottom: '1px solid #222',
      px: 4, py: 3
    }}>
      {editMode ? t('modal.editTitle') : t('modal.createTitle')}
    </DialogTitle>
    <DialogContent sx={{ background: '#fff', px: 4, py: 3 }}>
      <Tabs
        value={langTab}
        onChange={(_, v) => setLangTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif',
            fontSize: "1rem",
            textTransform: "none",
            color: '#222'
          },
          '& .MuiTabs-indicator': { background: '#222' }
        }}
      >
        {LANGS.map(l => <Tab key={l.code} value={l.code} label={t(`modal.lang.${l.code}`)} />)}
      </Tabs>
      <Divider sx={{ mb: 3, borderColor: '#222' }} />

      <Grid container spacing={4}>
        {/* Columna izquierda: Información general y detalles */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{
            p: 3, mb: 4, borderRadius: 3,
            border: '1px solid #222',
            background: '#fff',
            boxShadow: 'none'
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111', mb: 2 }}>
              {t('modal.generalInfo')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('modal.title', { lang: t(`modal.lang.${langTab}`) })}
                  fullWidth
                  value={form.title[langTab]}
                  onChange={e => handleLangChange('title', langTab, e.target.value)}
                  InputLabelProps={{ style: { color: '#222' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('modal.subtitle', { lang: t(`modal.lang.${langTab}`) })}
                  fullWidth
                  value={form.subtitle[langTab]}
                  onChange={e => handleLangChange('subtitle', langTab, e.target.value)}
                  InputLabelProps={{ style: { color: '#222' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('modal.shortDescription', { lang: t(`modal.lang.${langTab}`) })}
                  fullWidth
                  value={form.description[langTab]}
                  onChange={e => handleLangChange('description', langTab, e.target.value)}
                  InputLabelProps={{ style: { color: '#222' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('modal.fullDescription', { lang: t(`modal.lang.${langTab}`) })}
                  fullWidth
                  multiline
                  minRows={2}
                  value={form.fullDescription[langTab]}
                  onChange={e => handleLangChange('fullDescription', langTab, e.target.value)}
                  InputLabelProps={{ style: { color: '#222' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#222' }}>
                  {t('modal.features', { lang: t(`modal.lang.${langTab}`) })}
                </Typography>
                <Stack direction="row" spacing={1} mb={1}>
                  <TextField
                    value={featureInput}
                    onChange={e => setFeatureInput(e.target.value)}
                    onKeyDown={handleFeatureKeyDown}
                    label={t('modal.addFeature')}
                    size="small"
                    sx={{ flex: 1 }}
                    InputLabelProps={{ style: { color: '#222' } }}
                  />
                  <IconButton onClick={handleAddFeature} sx={{ color: '#222', bgcolor: '#f5f5f5', border: '1px solid #222' }}>
                    <Add />
                  </IconButton>
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {form.features[langTab].map((f, idx) => (
                    <Chip
                      key={idx}
                      label={f}
                      onDelete={() => handleRemoveFeature(idx)}
                      sx={{ bgcolor: '#222', color: '#fff', fontWeight: 600 }}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('modal.projectName')}
                  fullWidth
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  InputLabelProps={{ style: { color: '#222' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('modal.slug')}
                  fullWidth
                  value={form.slug}
                  onChange={e => handleChange('slug', e.target.value)}
                  helperText={t('modal.slugHelper')}
                  InputLabelProps={{ style: { color: '#222' } }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{
            p: 3, borderRadius: 3,
            border: '1px solid #222',
            background: '#fff',
            boxShadow: 'none'
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111', mb: 2 }}>
              {t('modal.propertyDetails')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={t('modal.phase')}
                  fullWidth
                  value={form.phase}
                  onChange={e => handleChange('phase', e.target.value)}
                  InputLabelProps={{ style: { color: '#222' } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={t('modal.status')}
                  fullWidth
                  value={form.status}
                  onChange={e => handleChange('status', e.target.value)}
                  InputLabelProps={{ style: { color: '#222' } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={t('modal.type')}
                  fullWidth
                  value={form.type}
                  onChange={e => handleChange('type', e.target.value)}
                  select
                  InputLabelProps={{ style: { color: '#222' } }}
                >
                  {PROJECT_TYPES.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {t(`modal.projectTypes.${opt.value}`)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  label={t('modal.externalUrl')}
                  fullWidth
                  value={form.externalUrl}
                  onChange={e => handleChange('externalUrl', e.target.value)}
                  InputLabelProps={{ style: { color: '#222' } }}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  label={t('modal.location')}
                  fullWidth
                  value={form.location}
                  onChange={e => handleChange('location', e.target.value)}
                  InputProps={{ endAdornment: <LocationOn sx={{ color: '#222' }} /> }}
                  InputLabelProps={{ style: { color: '#222' } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={t('modal.area')}
                  fullWidth
                  value={form.area}
                  onChange={e => handleChange('area', e.target.value)}
                  InputProps={{ endAdornment: <CropSquare sx={{ color: '#222' }} /> }}
                  InputLabelProps={{ style: { color: '#222' } }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Columna derecha: Media */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{
            p: 3, borderRadius: 3,
            border: '1px solid #222',
            background: '#fff',
            boxShadow: 'none'
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111', mb: 2 }}>
              {t('modal.mediaAssets')}
            </Typography>
            <Box mb={2}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#222' }}>
                {t('modal.mainImage')}
              </Typography>
              {mainImage ? (
                <Box sx={{ position: 'relative', width: '100%', maxWidth: 180, height: 120, mb: 1 }}>
                  <img src={mainImage} alt="Main image preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid #222' }} />
                  <IconButton
                    size="small"
                    onClick={handleMainImageRemove}
                    sx={{ position: 'absolute', top: 4, right: 4, bgcolor: '#fff', color: '#222', boxShadow: 1 }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{
                  border: '1.5px solid #222',
                  borderRadius: 2,
                  bgcolor: '#fff',
                  height: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1
                }}>
                  <Button component="label" variant="text" sx={{ color: '#222', fontWeight: 600 }}>
                    <AddPhotoAlternate sx={{ mr: 1 }} /> {t('modal.upload')}
                    <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                  </Button>
                </Box>
              )}
            </Box>
            <Box mb={2}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#222' }}>
                {t('modal.gallery')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                {gallery.map((url, idx) => (
                  <GalleryThumb key={url} url={url} onRemove={() => handleGalleryRemove(idx)} />
                ))}
                <Box sx={{
                  width: 70, height: 70, border: '1.5px solid #222', borderRadius: 2, bgcolor: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1
                }}>
                  <Button component="label" variant="text" sx={{ color: '#222', fontWeight: 600, minWidth: 0, p: 0 }}>
                    <AddPhotoAlternate />
                    <input type="file" accept="image/*" hidden multiple onChange={handleGalleryUpload} />
                  </Button>
                </Box>
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#222' }}>
                {t('modal.videos')}
              </Typography>
              <Stack direction="row" spacing={1} mb={1}>
                <Button
                  component="label"
                  variant="outlined"
                  sx={{ color: '#222', borderColor: '#222', fontWeight: 600 }}
                >
                  {t('modal.uploadVideo')}
                  <input
                    type="file"
                    accept="video/*"
                    hidden
                    multiple
                    onChange={handleVideoUpload}
                  />
                </Button>
              </Stack>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {videos.map((v, idx) => (
                  <Box key={idx} sx={{ position: 'relative', width: 120, height: 120 }}>
                    <video
                      src={v}
                      controls
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1px solid #222',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveVideo(idx)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: '#fff',
                        color: '#222',
                        boxShadow: 1
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
      )}
    </DialogContent>
    <DialogActions sx={{ px: 4, pb: 3, background: '#fff', borderTop: '1px solid #222' }}>
      <Button onClick={onClose} disabled={loading} startIcon={<Cancel />} sx={{ color: '#222' }}>
        {t('modal.cancel')}
      </Button>
      <Button
        onClick={handleSubmit}
        variant="contained"
        disabled={loading}
        startIcon={<Save />}
        sx={{ bgcolor: '#111', color: '#fff', fontWeight: 700, px: 3, boxShadow: 'none', '&:hover': { bgcolor: '#222' } }}
      >
        {editMode ? t('modal.save') : t('modal.create')}
      </Button>
    </DialogActions>
  </Dialog>
)
}