// frontend/apps/lakewood-p1/src/components/ClubHouse/ClubhouseUnderConstructionModal.jsx
import { useState } from 'react'
import { Box, TextField, Typography, Stack } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { es } from 'date-fns/locale'
import { CloudUpload } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import ModalWrapper from '../../constants/ModalWrapper'
import PrimaryButton from '../../constants/PrimaryButton'
import ClubhouseUnderConstructionService from '../../services/ClubhouseUnderConstructionService'
import uploadService from '@shared/services/uploadService'

const ClubhouseUnderConstructionModal = ({ open, onClose }) => {
  const { t } = useTranslation('clubhouse')
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

const handleSave = async () => {
  if (!form.title.trim()) {
    alert(t('titleRequired', 'Title is required'))
    return
  }

  setSaving(true)
  try {
    // 1. Subir imágenes y videos primero
    let uploadedImages = []
    let uploadedVideos = []

    if (form.images.length > 0) {
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
  clubHouseDate: form.date ? form.date.toISOString() : null,  // ← Cambio: date → clubHouseDate
  media: media
}

    await ClubhouseUnderConstructionService.create(payload)
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
      subtitle={t('addStepSubtitle', 'Upload images and videos for clubhouse construction')}
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
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: 2, fontFamily: '"DM Sans", sans-serif' },
            '& .MuiInputLabel-root': { fontFamily: '"DM Sans", sans-serif' }
          }}
        />

        {/* Descripción */}
        <TextField
          label={t('description', 'Description')}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          fullWidth
          multiline
          rows={3}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: 2, fontFamily: '"DM Sans", sans-serif' },
            '& .MuiInputLabel-root': { fontFamily: '"DM Sans", sans-serif' }
          }}
        />

        {/* Fecha */}
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <DatePicker
            label={t('date', 'Date')}
            value={form.date}
            onChange={newDate => setForm(f => ({ ...f, date: newDate }))}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2, fontFamily: '"DM Sans", sans-serif' },
                  '& .MuiInputLabel-root': { fontFamily: '"DM Sans", sans-serif' }
                }}
              />
            )}
          />
        </LocalizationProvider>

        {/* Imágenes */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} mb={1} fontFamily='"DM Sans", sans-serif'>
            {t('images', 'Images')}
          </Typography>
          <PrimaryButton
            component="label"
            variant="outlined"
            fullWidth
            startIcon={<CloudUpload />}
            sx={{ 
              mb: 1,
              borderColor: '#4a7c59',
              color: '#4a7c59',
              '&:hover': { borderColor: '#3a5c49', bgcolor: 'rgba(74, 124, 89, 0.05)' }
            }}
          >
            {t('selectImages', 'Select Images')}
            <input type="file" hidden multiple accept="image/*" onChange={(e) => handleFileSelect(e, 'images')} />
          </PrimaryButton>
          {form.images.length > 0 && (
            <Typography variant="caption" color="text.secondary" fontFamily='"DM Sans", sans-serif'>
              {form.images.length} {t('imagesSelected', 'image(s) selected')}
            </Typography>
          )}
        </Box>

        {/* Videos */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} mb={1} fontFamily='"DM Sans", sans-serif'>
            {t('videos', 'Videos')}
          </Typography>
          <PrimaryButton
            component="label"
            variant="outlined"
            fullWidth
            startIcon={<CloudUpload />}
            sx={{
              borderColor: '#E5863C',
              color: '#E5863C',
              '&:hover': { borderColor: '#d57530', bgcolor: 'rgba(229, 134, 60, 0.05)' }
            }}
          >
            {t('selectVideos', 'Select Videos')}
            <input type="file" hidden multiple accept="video/*" onChange={(e) => handleFileSelect(e, 'videos')} />
          </PrimaryButton>
          {form.videos.length > 0 && (
            <Typography variant="caption" color="text.secondary" fontFamily='"DM Sans", sans-serif'>
              {form.videos.length} {t('videosSelected', 'video(s) selected')}
            </Typography>
          )}
        </Box>
      </Stack>
    </ModalWrapper>
  )
}

export default ClubhouseUnderConstructionModal