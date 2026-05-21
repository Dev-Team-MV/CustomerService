// frontend/apps/lakewood-p1/src/components/masterPlan/UnderConstructionModal.jsx
import { useState } from 'react'
import { Box, TextField, Typography, Stack, Grid } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { es } from 'date-fns/locale'
import { CloudUpload } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import ModalWrapper from '../../constants/ModalWrapper'
import PrimaryButton from '../../constants/PrimaryButton'
import EagleViewService from '../../services/EagleViewService'
import uploadService from '@shared/services/uploadService'
const EagleViewModal = ({ open, onClose }) => {
  const { t } = useTranslation('masterPlan')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: null,
    images: [],
    videos: []
  })

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
  
  if (!form.date) {
    alert(t('dateRequired', 'Date is required'))
    return
  }

  setSaving(true)
  try {
    // 1. Subir imágenes y videos primero
    let uploadedImages = []
    let uploadedVideos = []

    if (form.images.length > 0) {
      const formData = new FormData()
      form.images.forEach(img => formData.append('images', img))
      uploadedImages = await uploadService.uploadTimeLineImages(form.images)
    }
    
    if (form.videos.length > 0) {
      uploadedVideos = await uploadService.uploadTimeLineImages(form.videos)
    }

    // 2. Construir array media con URLs subidas
    const media = [
      ...uploadedImages.map((url, idx) => ({
        type: 'image',
        url: url,
        name: `${form.title}-image-${idx + 1}`,
        order: idx
      })),
      ...uploadedVideos.map((url, idx) => ({
        type: 'video',
        url: url,
        name: `${form.title}-video-${idx + 1}`,
        order: uploadedImages.length + idx
      }))
    ]

    // 3. Crear objeto JSON para el backend
    const payload = {
      title: form.title,
      description: form.description,
      date: form.date.toISOString(),
      media: media
    }

    await EagleViewService.create(payload)
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
      title={t('addStep', 'Add Step')}
      subtitle={t('addStepSubtitle', 'Upload images and videos')}
      maxWidth="md"
      fullWidth
      actions={[
        <PrimaryButton key="cancel" onClick={handleClose} variant="outlined" color="inherit">
          {t('cancel', 'Cancel')}
        </PrimaryButton>,
        <PrimaryButton
          key="save"
          onClick={handleSave}
          loading={saving}
          disabled={saving || !form.title.trim()}
          startIcon={<CloudUpload />}
        >
          {saving ? t('saving', 'Saving...') : t('save', 'Save')}
        </PrimaryButton>
      ]}
    >
      <Stack spacing={3} sx={{ mt: 1 }}>
        {/* Título */}
        <TextField
          label={t('title', 'Title')}
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          fullWidth
          required
          autoFocus
        />

        {/* Descripción */}
        <TextField
          label={t('description', 'Description')}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          fullWidth
          multiline
          rows={3}
        />

        {/* Fecha */}
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <DatePicker
            label={t('date', 'Date')}
            value={form.date}
            onChange={newDate => setForm(f => ({ ...f, date: newDate }))}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </LocalizationProvider>

        {/* Imágenes */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} mb={1}>
            {t('images', 'Images')}
          </Typography>
          <PrimaryButton
            component="label"
            variant="outlined"
            fullWidth
            startIcon={<CloudUpload />}
            sx={{ mb: 1 }}
          >
            {t('selectImages', 'Select Images')}
            <input type="file" hidden multiple accept="image/*" onChange={(e) => handleFileSelect(e, 'images')} />
          </PrimaryButton>
          {form.images.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {form.images.length} {t('imagesSelected', 'image(s) selected')}
            </Typography>
          )}
        </Box>

        {/* Videos */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} mb={1}>
            {t('videos', 'Videos')}
          </Typography>
          <PrimaryButton
            component="label"
            variant="outlined"
            fullWidth
            startIcon={<CloudUpload />}
          >
            {t('selectVideos', 'Select Videos')}
            <input type="file" hidden multiple accept="video/*" onChange={(e) => handleFileSelect(e, 'videos')} />
          </PrimaryButton>
          {form.videos.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {form.videos.length} {t('videosSelected', 'video(s) selected')}
            </Typography>
          )}
        </Box>
      </Stack>
    </ModalWrapper>
  )
}

export default EagleViewModal