import { useState, useEffect } from 'react'
import { Box, TextField, Typography, Stack, IconButton } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'

import { enUS } from 'date-fns/locale'
import { CloudUpload, Delete } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import ModalWrapper from '../../constants/ModalWrapper'
import PrimaryButton from '../../constants/PrimaryButton'
import ClubhouseUnderConstructionService from '../../services/ClubhouseUnderConstructionService'
import uploadService from '@shared/services/uploadService'

const ClubhouseUnderConstructionModal = ({ open, onClose, editingStep }) => {
  const { t } = useTranslation('clubhouse')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: null,
    images: [],
    videos: []
  })
useEffect(() => {
  if (editingStep && open) {
    console.log('📝 Editing step:', editingStep)
    console.log('📝 Media from step:', editingStep.media)
    
    setForm({
      title: editingStep.title || '',
      description: editingStep.description || '',
      date: editingStep.clubHouseDate ? new Date(editingStep.clubHouseDate) : null,
      images: (editingStep.media || [])
        .filter(m => m.type === 'image' || !m.type)  // ✅ Acepta items sin type
        .map(img => ({
          ...img,
          type: 'image',
          url: img.url,
          name: img.name || 'image',
          order: img.order || 0,
          isPublic: img.isPublic !== false
        })),
      videos: (editingStep.media || [])
        .filter(m => m.type === 'video')
        .map(vid => ({
          ...vid,
          type: 'video',
          url: vid.url,
          name: vid.name || 'video',
          order: vid.order || 0,
          isPublic: vid.isPublic !== false
        }))
    })
  } else if (open && !editingStep) {
    setForm({ title: '', description: '', date: null, images: [], videos: [] })
  }
}, [editingStep, open])
  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setForm(prev => ({
      ...prev,
      [type]: [...prev[type], ...files]
    }))
  }

  const handleRemoveFile = (type, index) => {
    setForm(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

const handleSave = async () => {
  if (!form.title.trim()) {
    alert(t('titleRequired', 'Title is required'))
    return
  }
 
  setSaving(true)
  try {
    console.log('📤 Form images:', form.images)
    console.log('📤 Form videos:', form.videos)
    
    const newImages = form.images.filter(img => img instanceof File)
    const existingImages = form.images.filter(img => !(img instanceof File))
    
    const newVideos = form.videos.filter(vid => vid instanceof File)
    const existingVideos = form.videos.filter(vid => !(vid instanceof File))
 
    console.log('📤 New images to upload:', newImages.length)
    console.log('📤 Existing images:', existingImages.length)
    console.log('📤 New videos to upload:', newVideos.length)
    console.log('📤 Existing videos:', existingVideos.length)
 
    let uploadedImages = []
    let uploadedVideos = []
 
    if (newImages.length > 0) {
      console.log('📤 Uploading images...')
      uploadedImages = await uploadService.uploadTimeLineImages(newImages)
      console.log('✅ Uploaded images:', uploadedImages)
    }
    
    if (newVideos.length > 0) {
      console.log('📤 Uploading videos...')
      uploadedVideos = await uploadService.uploadTimeLineImages(newVideos)
      console.log('✅ Uploaded videos:', uploadedVideos)
    }

const allImages = [
  ...existingImages.map(img => ({
    type: 'image',  // Asegurar que siempre tenga type
    url: img.url,
    name: img.name || '',
    order: img.order || 0,
    isPublic: img.isPublic !== false
  })),
  ...uploadedImages.map((url, idx) => ({
    type: 'image',
    url: url,
    name: `${form.title}-image-${existingImages.length + idx + 1}`,
    order: existingImages.length + idx + 1,
    isPublic: true
  }))
]
 
const allVideos = [
  ...existingVideos.map(vid => ({
    type: 'video',  // Asegurar que siempre tenga type
    url: vid.url,
    name: vid.name || '',
    order: vid.order || 0,
    isPublic: vid.isPublic !== false
  })),
  ...uploadedVideos.map((url, idx) => ({
    type: 'video',
    url: url,
    name: `${form.title}-video-${allImages.length + existingVideos.length + idx + 1}`,
    order: allImages.length + existingVideos.length + idx + 1,
    isPublic: true
  }))
]

      const media = [...allImages, ...allVideos]

      const payload = {
        title: form.title,
        description: form.description,
        clubHouseDate: form.date ? form.date.toISOString() : null,
        media: media
      }
      console.log('📤 Final payload:', JSON.stringify(payload, null, 2))


if (editingStep) {
  console.log('📤 Calling UPDATE with stepId:', editingStep._id)
  const response = await ClubhouseUnderConstructionService.update(editingStep._id, payload)
  console.log('✅ Update response:', response)
} else {
  console.log('📤 Calling CREATE')
  const response = await ClubhouseUnderConstructionService.create(payload)
  console.log('✅ Create response:', response)
}
      
      setForm({ title: '', description: '', date: null, images: [], videos: [] })
      onClose()
    } catch (err) {
      console.error('Error saving:', err)
      alert(t('errorSaving', 'Error saving. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setForm({ title: '', description: '', date: null, images: [], videos: [] })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={handleClose}
      icon={CloudUpload}
      title={editingStep ? t('editStep', 'Edit Step') : t('addStep', 'Add Step')}
      subtitle={t('addStepSubtitle', 'Upload images and videos for clubhouse construction')}
      maxWidth="md"
      fullWidth
      actions={[
        <PrimaryButton key="cancel" onClick={handleClose} variant="outlined" color="inherit">
          {t('cancel', 'Cancel')}
        </PrimaryButton>,
        <PrimaryButton key="save" onClick={handleSave} loading={saving}>
          {t('save', 'Save')}
        </PrimaryButton>
      ]}
    >
      <Stack spacing={3}>
        <TextField
          label={t('title', 'Title')}
          value={form.title}
          onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
          fullWidth
          required
        />

        <TextField
          label={t('description', 'Description')}
          value={form.description}
          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
          fullWidth
          multiline
          rows={3}
        />

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
          <DatePicker
            label={t('date', 'Date')}
            value={form.date}
            onChange={(newValue) => setForm(prev => ({ ...prev, date: newValue }))}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </LocalizationProvider>

        <Box>
          <Typography variant="subtitle2" mb={1} fontWeight={600}>
            {t('images', 'Images')}
          </Typography>
          <PrimaryButton
            component="label"
            variant="outlined"
            startIcon={<CloudUpload />}
            fullWidth
          >
            {t('selectImages', 'Select Images')}
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => handleFileSelect(e, 'images')}
            />
          </PrimaryButton>
          {form.images.length > 0 && (
            <Box mt={2} display="flex" gap={1} flexWrap="wrap">
              {form.images.map((img, idx) => (
                <Box key={idx} position="relative">
                  <Box
                    component="img"
                    src={img instanceof File ? URL.createObjectURL(img) : img.url}
                    sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile('images', idx)}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'error.dark' }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Box>
          <Typography variant="subtitle2" mb={1} fontWeight={600}>
            {t('videos', 'Videos')}
          </Typography>
          <PrimaryButton
            component="label"
            variant="outlined"
            startIcon={<CloudUpload />}
            fullWidth
          >
            {t('selectVideos', 'Select Videos')}
            <input
              type="file"
              accept="video/*"
              multiple
              hidden
              onChange={(e) => handleFileSelect(e, 'videos')}
            />
          </PrimaryButton>
          {form.videos.length > 0 && (
            <Box mt={2}>
              {form.videos.map((vid, idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="body2" flex={1}>
                    {vid instanceof File ? vid.name : vid.name || `Video ${idx + 1}`}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveFile('videos', idx)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Stack>
    </ModalWrapper>
  )
}

export default ClubhouseUnderConstructionModal