import { useState } from 'react';
import {
  Box, Chip, Container, Paper, Typography, Button, Tabs, Tab, Divider, Grid, TextField, IconButton, Stack
} from '@mui/material';
import {
  Settings, AddPhotoAlternate, Delete, LocationOn, CropSquare, Add, Save, Edit, Cancel,
} from '@mui/icons-material';
import PageHeader from '@shared/components/PageHeader';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import ImagePreview from '../components/ImgPreview';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' }
];

const initialConfig = {
  slug: '',
  phase: '',
  title: { en: '', es: '' },
  subtitle: { en: '', es: '' },
  description: { en: '', es: '' },
  fullDescription: { en: '', es: '' },
  image: '',
  gallery: [],
  features: { en: [], es: [] },
  status: '',
  externalUrl: '',
  location: '',
  area: '',
  videos: [],
};


const GalleryThumb = ({ url, onRemove }) => (
  <Box sx={{
    position: 'relative',
    width: 90,
    height: 90,
    borderRadius: 2,
    overflow: 'hidden',
    border: '1.5px dashed #bfcab3',
    bgcolor: '#f6f8f3',
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
);

const ConfigurationManager = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(initialConfig);
  const [langTab, setLangTab] = useState('en');
  const [mainImage, setMainImage] = useState('');
  const [gallery, setGallery] = useState([]);
  const [videos, setVideos] = useState([]);
  const [featureInput, setFeatureInput] = useState('');
  const [videoInput, setVideoInput] = useState('');
  const { t } = useTranslation(['configuration', 'common']);

  // Feature handlers
  const handleAddFeature = () => {
    if (featureInput.trim()) {
      handleLangChange('features', langTab, [...form.features[langTab], featureInput.trim()]);
      setFeatureInput('');
    }
  };
  const handleFeatureKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };
  const handleRemoveFeature = idx => {
    const newArr = form.features[langTab].filter((_, i) => i !== idx);
    handleLangChange('features', langTab, newArr);
  };

  // Video handlers
  const handleAddVideo = () => {
    if (videoInput.trim()) {
      setVideos([...videos, videoInput.trim()]);
      handleChange('videos', [...videos, videoInput.trim()]);
      setVideoInput('');
    }
  };
  const handleVideoKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddVideo();
    }
  };
  const handleRemoveVideo = idx => {
    const newArr = videos.filter((_, i) => i !== idx);
    setVideos(newArr);
    handleChange('videos', newArr);
  };

  // Simula upload, reemplaza por tu lógica real
  const fakeUpload = async (file) => {
    return new Promise(resolve => {
      setTimeout(() => resolve(URL.createObjectURL(file)), 500);
    });
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const handleLangChange = (field, lang, value) => setForm(prev => ({
    ...prev,
    [field]: { ...prev[field], [lang]: value }
  }));

  // Main image
  const handleImageUpload = async (e) => {
    if (e.target.files?.[0]) {
      const url = await fakeUpload(e.target.files[0]);
      setMainImage(url);
      handleChange('image', url);
    }
  };
  const handleMainImageRemove = () => {
    setMainImage('');
    handleChange('image', '');
  };

  // Gallery
  const handleGalleryUpload = async (e) => {
    if (e.target.files?.[0]) {
      const url = await fakeUpload(e.target.files[0]);
      setGallery(prev => [...prev, url]);
      handleChange('gallery', [...gallery, url]);
    }
  };
  const handleGalleryRemove = idx => {
    const newGallery = gallery.filter((_, i) => i !== idx);
    setGallery(newGallery);
    handleChange('gallery', newGallery);
  };

  // Save/Cancel
  const handleSave = () => {
    setIsEditing(false);
    // Aquí puedes hacer el submit real
  };
  const handleCancel = () => {
    setIsEditing(false);
    // Si quieres resetear, puedes volver a initialConfig aquí
  };

  return (
    <Box
      sx={{
        minHeight: '90vh',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="xl">
        <PageHeader
          icon={SettingsIcon}
          title={t('configuration:managerTitle')}
          subtitle={t('configuration:managerSubtitle')}
          actionButton={
            isEditing
              ? {
                  label: t('common:actions.save'),
                  onClick: handleSave,
                  icon: <Save />,
                  tooltip: t('common:actions.save'),
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

        {/* Tabs de idioma */}
        <Tabs
          value={langTab}
          onChange={(_, v) => setLangTab(v)}
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              fontWeight: 600,
              fontFamily: '"Poppins", sans-serif',
              fontSize: "0.95rem",
              textTransform: "none"
            }
          }}
        >
          {LANGS.map(l => <Tab key={l.code} value={l.code} label={l.label} />)}
        </Tabs>
        
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Columna izquierda: Información general y detalles */}
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e0e0e0', background: '#fafcf9' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#4a7c59', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings fontSize="small" /> {t('configuration:generalInfo')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label={`${t('configuration:title')} (${langTab.toUpperCase()})`} fullWidth value={form.title[langTab]} onChange={e => handleLangChange('title', langTab, e.target.value)} disabled={!isEditing} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label={`${t('configuration:subtitle')} (${langTab.toUpperCase()})`} fullWidth value={form.subtitle[langTab]} onChange={e => handleLangChange('subtitle', langTab, e.target.value)} disabled={!isEditing} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label={`${t('configuration:shortDescription')} (${langTab.toUpperCase()})`} fullWidth value={form.description[langTab]} onChange={e => handleLangChange('description', langTab, e.target.value)} disabled={!isEditing} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label={`${t('configuration:fullDescription')} (${langTab.toUpperCase()})`} fullWidth multiline minRows={2} value={form.fullDescription[langTab]} onChange={e => handleLangChange('fullDescription', langTab, e.target.value)} disabled={!isEditing} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>{t('configuration:features')} ({langTab.toUpperCase()})</Typography>
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
                    {form.features[langTab].map((f, idx) => (
                      <Chip
                        key={idx}
                        label={f}
                        onDelete={isEditing ? () => handleRemoveFeature(idx) : undefined}
                        sx={{ bgcolor: '#e0e8df', color: '#333F1F', fontWeight: 600 }}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField label={t('configuration:slug')} fullWidth value={form.slug} onChange={e => handleChange('slug', e.target.value)} disabled={!isEditing} />
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', background: '#fafcf9' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#4a7c59', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CropSquare fontSize="small" /> {t('configuration:propertyDetails')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('configuration:phase')} fullWidth value={form.phase} onChange={e => handleChange('phase', e.target.value)} disabled={!isEditing} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('configuration:status')} fullWidth value={form.status} onChange={e => handleChange('status', e.target.value)} disabled={!isEditing} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('configuration:externalUrl')} fullWidth value={form.externalUrl} onChange={e => handleChange('externalUrl', e.target.value)} disabled={!isEditing} />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField label={t('configuration:locationSearch')} fullWidth value={form.location} onChange={e => handleChange('location', e.target.value)} InputProps={{ endAdornment: <LocationOn sx={{ color: '#bfcab3' }} /> }} disabled={!isEditing} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label={t('configuration:area')} fullWidth value={form.area} onChange={e => handleChange('area', e.target.value)} InputProps={{ endAdornment: <CropSquare sx={{ color: '#bfcab3' }} /> }} disabled={!isEditing} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Columna derecha: Media */}
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', background: '#fafcf9' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#4a7c59', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddPhotoAlternate fontSize="small" /> {t('configuration:mediaAssets')}
              </Typography>
              <Box mb={2}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{t('configuration:mainImage')}</Typography>
                {mainImage ? (
                  <ImagePreview
                    src={mainImage}
                    alt="Main image preview"
                    onDelete={isEditing ? handleMainImageRemove : undefined}
                    showSwitch={false}
                    imgSx={{ height: 140 }}
                    sx={{ mb: 1 }}
                  />                ) : (
                  isEditing && (
                    <Box sx={{
                      border: '1.5px dashed #bfcab3',
                      borderRadius: 2,
                      bgcolor: '#f6f8f3',
                      height: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1
                    }}>
                      <Button component="label" variant="text" sx={{ color: '#4a7c59', fontWeight: 600 }}>
                        <AddPhotoAlternate sx={{ mr: 1 }} /> {t('configuration:upload')}
                        <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                      </Button>
                    </Box>
                  )
                )}
              </Box>
              <Box mb={2}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{t('configuration:gallery')}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                  {gallery.map((url, idx) => (
                    <GalleryThumb key={url} url={url} onRemove={isEditing ? () => handleGalleryRemove(idx) : undefined} />
                  ))}
                  {isEditing && (
                    <Box sx={{
                      width: 90, height: 90, border: '1.5px dashed #bfcab3', borderRadius: 2, bgcolor: '#f6f8f3',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1
                    }}>
                      <Button component="label" variant="text" sx={{ color: '#4a7c59', fontWeight: 600, minWidth: 0, p: 0 }}>
                        <AddPhotoAlternate />
                        <input type="file" accept="image/*" hidden onChange={handleGalleryUpload} />
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
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
                        onChange={async (e) => {
                          if (e.target.files?.[0]) {
                            const file = e.target.files[0];
                            const url = await fakeUpload(file); // Simula la subida del archivo
                            setVideos((prev) => [...prev, url]);
                            handleChange('videos', [...videos, url]);
                          }
                        }}
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
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ConfigurationManager;