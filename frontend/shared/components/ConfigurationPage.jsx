// apps/mv-crm/src/pages/ConfigurationPage.jsx
import { useState } from 'react'
import {
  Box, Chip, Container, Paper, Typography, Button, Tabs, Tab, Divider, Grid, TextField, IconButton, Stack
} from '@mui/material'
import {
  Settings, AddPhotoAlternate, Delete, LocationOn, CropSquare, Add, Save, Edit, Cancel, Palette
} from '@mui/icons-material'
import PageHeader from '@shared/components/PageHeader'
import { useTranslation } from 'react-i18next'
import ImagePreview from '@shared/components/ImgPreview'
import { useProjectConfig } from '@shared/hooks/useProjects'
import { useTheme } from '@mui/material/styles'

// ✅ NUEVO: Import del gestor de variables
import ProjectVariablesManager from '@shared/components/ProjectVariablesManager'

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' }
]

const GalleryThumb = ({ url, onRemove }) => {
  const theme = useTheme()
  return (
    <Box sx={{
      position: 'relative',
      width: 90,
      height: 90,
      borderRadius: 2,
      overflow: 'hidden',
      border: `1.5px dashed ${theme.palette.cardBorder || '#e0e0e0'}`,
      bgcolor: theme.palette.cardBg || '#f5f5f5',
      mr: 2,
      mb: 1,
      display: 'inline-block'
    }}>
      <img src={url} alt="gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      {onRemove && (
        <IconButton
          size="small"
          onClick={onRemove}
          sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)' }}
        >
          <Delete fontSize="small" />
        </IconButton>
      )}
    </Box>
  )
}

const ColorChip = ({ color, onRemove }) => {
  return (
    <Chip
      label={`${color.key}: ${color.value}`}
      onDelete={onRemove}
      sx={{
        bgcolor: 'rgba(0,0,0,0.08)',
        fontWeight: 600,
        '& .MuiChip-label': {
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }
      }}
      avatar={
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            bgcolor: color.value,
            border: '2px solid rgba(0,0,0,0.1)',
            ml: 0.5
          }}
        />
      }
    />
  )
}

const ConfigurationPage = () => {
  const theme = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [langTab, setLangTab] = useState('en')
  const [featureInput, setFeatureInput] = useState('')
  const [videoInput, setVideoInput] = useState('')
  const [colorInput, setColorInput] = useState('')
  const { t } = useTranslation(['configuration', 'common'])
  const PROJECT_ID = import.meta.env.VITE_PROJECT_ID

  const {
    form,
    setForm,
    mainImage,
    setMainImage,
    logo,
    gallery,
    setGallery,
    videos,
    setVideos,
    loading,
    handleChange,
    handleLangChange,
    handleImageUpload,
    handleLogoUpload,
    handleLogoRemove,
    handleGalleryUpload,
    handleGalleryRemove,
    handleVideoUpload,
    handleRemoveVideo,
    handleMainImageRemove,
    handleSave,
  } = useProjectConfig(PROJECT_ID)

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

  const handleAddVideo = () => {
    if (videoInput.trim()) {
      handleChange('videos', [...videos, videoInput.trim()])
      setVideoInput('')
    }
  }

  const handleVideoKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddVideo()
    }
  }

  const handleAddColor = () => {
    if (!colorInput.trim()) return
    
    let key, value
    if (colorInput.includes(':')) {
      const parts = colorInput.split(':').map(s => s.trim())
      key = parts[0]
      value = parts[1]
    } else {
      key = `color-${form.brandColors.length + 1}`
      value = colorInput.trim()
    }
    
    if (!value.startsWith('#') && !value.startsWith('rgb')) {
      value = `#${value}`
    }
    
    const newColor = { key, value }
    handleChange('brandColors', [...form.brandColors, newColor])
    setColorInput('')
  }

  const handleColorKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddColor()
    }
  }

  const handleRemoveColor = idx => {
    const newArr = form.brandColors.filter((_, i) => i !== idx)
    handleChange('brandColors', newArr)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  return (
    <Box sx={{ minHeight: '90vh', p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={Settings}
          title={t('configuration:managerTitle')}
          subtitle={t('configuration:managerSubtitle')}
          actionButton={
            isEditing
              ? {
                  label: t('common:actions.save'),
                  onClick: async () => { await handleSave(); setIsEditing(false); },
                  icon: <Save />,
                  tooltip: t('common:actions.save'),
                  loading,
                  secondary: {
                    label: t('common:actions.cancel'),
                    onClick: handleCancel,
                    icon: <Cancel />,
                    variant: 'outlined'
                  }
                }
              : {
                  label: t('common:actions.edit'),
                  onClick: () => setIsEditing(true),
                  icon: <Edit />
                }
          }
        />

        <Tabs
          value={langTab}
          onChange={(_, v) => setLangTab(v)}
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              fontWeight: 600,
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.95rem",
              textTransform: "none"
            }
          }}
        >
          {LANGS.map(l => <Tab key={l.code} value={l.code} label={l.label} />)}
        </Tabs>
        
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{
              p: 3, mb: 3, borderRadius: 3,
              border: `1px solid ${theme.palette.cardBorder || '#e0e0e0'}`,
              background: theme.palette.cardBg || '#fafafa'
            }}>
              <Typography variant="subtitle1" sx={{
                fontWeight: 700,
                color: theme.palette.secondary.main,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Settings fontSize="small" /> {t('configuration:generalInfo')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label={`${t('configuration:title')} (${langTab.toUpperCase()})`} 
                    fullWidth 
                    value={form.title[langTab]} 
                    onChange={e => handleLangChange('title', langTab, e.target.value)} 
                    disabled={!isEditing} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label={`${t('configuration:subtitle')} (${langTab.toUpperCase()})`} 
                    fullWidth 
                    value={form.subtitle[langTab]} 
                    onChange={e => handleLangChange('subtitle', langTab, e.target.value)} 
                    disabled={!isEditing} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    label={`${t('configuration:shortDescription')} (${langTab.toUpperCase()})`} 
                    fullWidth 
                    value={form.description[langTab]} 
                    onChange={e => handleLangChange('description', langTab, e.target.value)} 
                    disabled={!isEditing} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    label={`${t('configuration:fullDescription')} (${langTab.toUpperCase()})`} 
                    fullWidth 
                    multiline 
                    minRows={2} 
                    value={form.fullDescription[langTab]} 
                    onChange={e => handleLangChange('fullDescription', langTab, e.target.value)} 
                    disabled={!isEditing} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    {t('configuration:features')} ({langTab.toUpperCase()})
                  </Typography>
                  <Stack direction="row" spacing={1} mb={1}>
                    <TextField
                      value={featureInput}
                      onChange={e => setFeatureInput(e.target.value)}
                      onKeyDown={handleFeatureKeyDown}
                      label={t('configuration:addFeature')}
                      size="small"
                      disabled={!isEditing}
                      sx={{ flex: 1 }}
                    />
                    <IconButton onClick={handleAddFeature} color="primary" disabled={!isEditing}>
                      <Add />
                    </IconButton>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {form.features[langTab]?.map((f, idx) => (
                      <Chip
                        key={idx}
                        label={f}
                        onDelete={isEditing ? () => handleRemoveFeature(idx) : undefined}
                        sx={{
                          bgcolor: theme.palette.chipAdmin?.bg || 'rgba(0,0,0,0.08)',
                          color: theme.palette.chipAdmin?.color || theme.palette.primary.main,
                          fontWeight: 600
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    label={t('configuration:slug')} 
                    fullWidth 
                    value={form.slug} 
                    onChange={e => handleChange('slug', e.target.value)} 
                    disabled={!isEditing} 
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{
              p: 3, borderRadius: 3,
              border: `1px solid ${theme.palette.cardBorder || '#e0e0e0'}`,
              background: theme.palette.cardBg || '#fafafa'
            }}>
              <Typography variant="subtitle1" sx={{
                fontWeight: 700,
                color: theme.palette.secondary.main,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <CropSquare fontSize="small" /> {t('configuration:propertyDetails')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField 
                    label={t('configuration:phase')} 
                    fullWidth 
                    value={form.phase} 
                    onChange={e => handleChange('phase', e.target.value)} 
                    disabled={!isEditing} 
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField 
                    label={t('configuration:status')} 
                    fullWidth 
                    value={form.status} 
                    onChange={e => handleChange('status', e.target.value)} 
                    disabled={!isEditing} 
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField 
                    label={t('configuration:externalUrl')} 
                    fullWidth 
                    value={form.externalUrl} 
                    onChange={e => handleChange('externalUrl', e.target.value)} 
                    disabled={!isEditing} 
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField 
                    label={t('configuration:locationSearch')} 
                    fullWidth 
                    value={form.location} 
                    onChange={e => handleChange('location', e.target.value)} 
                    InputProps={{ 
                      endAdornment: <LocationOn sx={{ color: theme.palette.text.disabled }} /> 
                    }} 
                    disabled={!isEditing} 
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField 
                    label={t('configuration:area')} 
                    fullWidth 
                    value={form.area} 
                    onChange={e => handleChange('area', e.target.value)} 
                    InputProps={{ 
                      endAdornment: <CropSquare sx={{ color: theme.palette.text.disabled }} /> 
                    }} 
                    disabled={!isEditing} 
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{
              p: 3, borderRadius: 3,
              border: `1px solid ${theme.palette.cardBorder || '#e0e0e0'}`,
              background: theme.palette.cardBg || '#fafafa'
            }}>
              <Typography variant="subtitle1" sx={{
                fontWeight: 700,
                color: theme.palette.secondary.main,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <AddPhotoAlternate fontSize="small" /> {t('configuration:mediaAssets')}
              </Typography>
              
              {/* Main Image */}
              <Box mb={2}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {t('configuration:mainImage')}
                </Typography>
                {mainImage ? (
                  <ImagePreview
                    src={mainImage}
                    alt="Main image preview"
                    onDelete={isEditing ? handleMainImageRemove : undefined}
                    showSwitch={false}
                    imgSx={{ height: 140 }}
                    sx={{ mb: 1 }}
                  />
                ) : (
                  isEditing && (
                    <Box sx={{
                      border: `1.5px dashed ${theme.palette.cardBorder || '#e0e0e0'}`,
                      borderRadius: 2,
                      bgcolor: theme.palette.cardBg || '#fafafa',
                      height: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1
                    }}>
                      <Button component="label" variant="text" sx={{
                        color: theme.palette.secondary.main,
                        fontWeight: 600
                      }}>
                        <AddPhotoAlternate sx={{ mr: 1 }} /> {t('configuration:upload')}
                        <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                      </Button>
                    </Box>
                  )
                )}
              </Box>

              {/* Logo */}
              <Box mb={2}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Logo
                </Typography>
                {logo ? (
                  <ImagePreview
                    src={logo}
                    alt="Logo preview"
                    onDelete={isEditing ? handleLogoRemove : undefined}
                    showSwitch={false}
                    imgSx={{ height: 100 }}
                    sx={{ mb: 1 }}
                  />
                ) : (
                  isEditing && (
                    <Box sx={{
                      border: `1.5px dashed ${theme.palette.cardBorder || '#e0e0e0'}`,
                      borderRadius: 2,
                      bgcolor: theme.palette.cardBg || '#fafafa',
                      height: 100,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1
                    }}>
                      <Button component="label" variant="text" sx={{
                        color: theme.palette.secondary.main,
                        fontWeight: 600
                      }}>
                        <AddPhotoAlternate sx={{ mr: 1 }} /> Upload Logo
                        <input type="file" accept="image/*" hidden onChange={handleLogoUpload} />
                      </Button>
                    </Box>
                  )
                )}
              </Box>

              {/* Gallery */}
              <Box mb={2}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {t('configuration:gallery')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                  {gallery.map((url, idx) => (
                    <GalleryThumb key={url} url={url} onRemove={isEditing ? () => handleGalleryRemove(idx) : undefined} />
                  ))}
                  {isEditing && (
                    <Box sx={{
                      width: 90, height: 90,
                      border: `1.5px dashed ${theme.palette.cardBorder || '#e0e0e0'}`,
                      borderRadius: 2,
                      bgcolor: theme.palette.cardBg || '#fafafa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1
                    }}>
                      <Button component="label" variant="text" sx={{
                        color: theme.palette.secondary.main,
                        fontWeight: 600,
                        minWidth: 0,
                        p: 0
                      }}>
                        <AddPhotoAlternate />
                        <input type="file" accept="image/*" hidden onChange={handleGalleryUpload} />
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Videos */}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {t('configuration:videos')}
                </Typography>
                <Stack direction="row" spacing={1} mb={1}>
                  {isEditing && (
                    <Button
                      component="label"
                      variant="contained"
                      color="primary"
                      startIcon={<Add />}
                      sx={{ textTransform: 'none' }}
                    >
                      {t('configuration:uploadVideo')}
                      <input
                        type="file"
                        accept="video/*"
                        hidden
                        onChange={handleVideoUpload}
                      />
                    </Button>
                  )}
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
                          border: '1px solid #e0e0e0',
                        }}
                      />
                      {isEditing && (
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveVideo(idx)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(255,255,255,0.8)',
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>

            {/* Brand Colors */}
            <Paper elevation={0} sx={{
              p: 3, mt: 3, borderRadius: 3,
              border: `1px solid ${theme.palette.cardBorder || '#e0e0e0'}`,
              background: theme.palette.cardBg || '#fafafa'
            }}>
              <Typography variant="subtitle1" sx={{
                fontWeight: 700,
                color: theme.palette.secondary.main,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Palette fontSize="small" /> Brand Colors
              </Typography>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Format: "key:color" (ej: "primary:#333F1F") or just color (ej: "#333F1F")
              </Typography>
              
              <Stack direction="row" spacing={1} mb={2}>
                <TextField
                  value={colorInput}
                  onChange={e => setColorInput(e.target.value)}
                  onKeyDown={handleColorKeyDown}
                  label="Add brand color"
                  placeholder="primary:#333F1F"
                  size="small"
                  disabled={!isEditing}
                  sx={{ flex: 1 }}
                />
                <IconButton onClick={handleAddColor} color="primary" disabled={!isEditing}>
                  <Add />
                </IconButton>
              </Stack>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {form.brandColors?.map((color, idx) => (
                  <ColorChip
                    key={idx}
                    color={color}
                    onRemove={isEditing ? () => handleRemoveColor(idx) : undefined}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* ✅ NUEVO: Variables de Mensaje - Fila completa debajo */}
          <Grid item xs={12}>
            <ProjectVariablesManager 
              projectId={PROJECT_ID}
              disabled={!isEditing}
              variant="page"
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default ConfigurationPage