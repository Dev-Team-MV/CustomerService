// import { useState, useEffect } from 'react'
// import { Box, TextField, Typography, Stack, IconButton } from '@mui/material'
// import { DatePicker } from '@mui/x-date-pickers/DatePicker'
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
// // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
// import { enUS } from 'date-fns/locale'
// import { CloudUpload, Delete } from '@mui/icons-material'
// import { useTranslation } from 'react-i18next'
// import ModalWrapper from '../../constants/ModalWrapper'
// import PrimaryButton from '../../constants/PrimaryButton'
// import EagleViewService from '../../services/EagleViewService'
// import uploadService from '@shared/services/uploadService'

// const EagleViewModal = ({ open, onClose, editingStep }) => {
//   const { t } = useTranslation('masterPlan')
//   const [saving, setSaving] = useState(false)
//   const [form, setForm] = useState({
//     title: '',
//     description: '',
//     date: null,
//     images: [],
//     videos: []
//   })

//   useEffect(() => {
//     if (editingStep && open) {
//       setForm({
//         title: editingStep.title || '',
//         description: editingStep.description || '',
//         date: editingStep.date ? new Date(editingStep.date) : null,
//         images: (editingStep.media || [])
//           .filter(m => m.type === 'image' || !m.type)
//           .map(img => ({
//             ...img,
//             type: 'image',
//             url: img.url,
//             name: img.name || 'image',
//             order: img.order || 0,
//             isPublic: img.isPublic !== false
//           })),
//         videos: (editingStep.media || [])
//           .filter(m => m.type === 'video')
//           .map(vid => ({
//             ...vid,
//             type: 'video',
//             url: vid.url,
//             name: vid.name || 'video',
//             order: vid.order || 0,
//             isPublic: vid.isPublic !== false
//           }))
//       })
//     } else if (open && !editingStep) {
//       setForm({ title: '', description: '', date: null, images: [], videos: [] })
//     }
//   }, [editingStep, open])

//   const handleFileSelect = (e, type) => {
//     const files = Array.from(e.target.files)
//     if (!files.length) return
//     setForm(prev => ({
//       ...prev,
//       [type]: [...prev[type], ...files]
//     }))
//   }

//   const handleRemoveFile = (type, index) => {
//     setForm(prev => ({
//       ...prev,
//       [type]: prev[type].filter((_, i) => i !== index)
//     }))
//   }

//   const handleSave = async () => {
//     if (!form.title.trim()) {
//       alert(t('titleRequired', 'Title is required'))
//       return
//     }
    
//     if (!form.date) {
//       alert(t('dateRequired', 'Date is required'))
//       return
//     }

//     setSaving(true)
//     try {
//       const newImages = form.images.filter(img => img instanceof File)
//       const existingImages = form.images.filter(img => !(img instanceof File))
      
//       const newVideos = form.videos.filter(vid => vid instanceof File)
//       const existingVideos = form.videos.filter(vid => !(vid instanceof File))

//       let uploadedImages = []
//       let uploadedVideos = []

//       if (newImages.length > 0) {
//         uploadedImages = await uploadService.uploadTimeLineImages(newImages)
//       }
      
//       if (newVideos.length > 0) {
//         uploadedVideos = await uploadService.uploadTimeLineImages(newVideos)
//       }

//       const allImages = [
//         ...existingImages.map(img => ({
//           type: 'image',
//           url: img.url,
//           name: img.name || '',
//           order: img.order || 0,
//           isPublic: img.isPublic !== false
//         })),
//         ...uploadedImages.map((url, idx) => ({
//           type: 'image',
//           url: url,
//           name: `${form.title}-image-${existingImages.length + idx + 1}`,
//           order: existingImages.length + idx + 1,
//           isPublic: false
//         }))
//       ]

//       const allVideos = [
//         ...existingVideos.map(vid => ({
//           type: 'video',
//           url: vid.url,
//           name: vid.name || '',
//           order: vid.order || 0,
//           isPublic: vid.isPublic !== false
//         })),
//         ...uploadedVideos.map((url, idx) => ({
//           type: 'video',
//           url: url,
//           name: `${form.title}-video-${allImages.length + existingVideos.length + idx + 1}`,
//           order: allImages.length + existingVideos.length + idx + 1,
//           isPublic: false
//         }))
//       ]

//       const media = [...allImages, ...allVideos]

//       const payload = {
//         title: form.title,
//         description: form.description,
//         date: form.date.toISOString(),
//         media: media
//       }

//       if (editingStep) {
//         await EagleViewService.update(editingStep._id, payload)
//       } else {
//         await EagleViewService.create(payload)
//       }
      
//       setForm({ title: '', description: '', date: null, images: [], videos: [] })
//       onClose()
//     } catch (err) {
//       console.error('Error saving:', err)
//       alert(t('errorSaving', 'Error saving. Please try again.'))
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleClose = () => {
//     setForm({ title: '', description: '', date: null, images: [], videos: [] })
//     onClose()
//   }

//   return (
//     <ModalWrapper
//       open={open}
//       onClose={handleClose}
//       icon={CloudUpload}
//       title={editingStep ? t('editStep', 'Edit Step') : t('addStep', 'Add Step')}
//       subtitle={t('addStepSubtitle', 'Upload images and videos')}
//       maxWidth="md"
//       fullWidth
//       actions={[
//         <PrimaryButton key="cancel" onClick={handleClose} variant="outlined" color="inherit">
//           {t('cancel', 'Cancel')}
//         </PrimaryButton>,
//         <PrimaryButton key="save" onClick={handleSave} loading={saving}>
//           {t('save', 'Save')}
//         </PrimaryButton>
//       ]}
//     >
//       <Stack spacing={3}>
//         <TextField
//           label={t('title', 'Title')}
//           value={form.title}
//           onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
//           fullWidth
//           required
//         />

//         <TextField
//           label={t('description', 'Description')}
//           value={form.description}
//           onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
//           fullWidth
//           multiline
//           rows={3}
//         />

//         <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
//           <DatePicker
//             label={t('date', 'Date')}
//             value={form.date}
//             onChange={(newValue) => setForm(prev => ({ ...prev, date: newValue }))}
//             renderInput={(params) => <TextField {...params} fullWidth />}
//           />
//         </LocalizationProvider>

//         <Box>
//           <Typography variant="subtitle2" mb={1} fontWeight={600}>
//             {t('images', 'Images')}
//           </Typography>
//           <PrimaryButton
//             component="label"
//             variant="outlined"
//             startIcon={<CloudUpload />}
//             fullWidth
//           >
//             {t('selectImages', 'Select Images')}
//             <input
//               type="file"
//               accept="image/*"
//               multiple
//               hidden
//               onChange={(e) => handleFileSelect(e, 'images')}
//             />
//           </PrimaryButton>
//           {form.images.length > 0 && (
//             <Box mt={2} display="flex" gap={1} flexWrap="wrap">
//               {form.images.map((img, idx) => (
//                 <Box key={idx} position="relative">
//                   <Box
//                     component="img"
//                     src={img instanceof File ? URL.createObjectURL(img) : img.url}
//                     sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
//                   />
//                   <IconButton
//                     size="small"
//                     onClick={() => handleRemoveFile('images', idx)}
//                     sx={{
//                       position: 'absolute',
//                       top: -8,
//                       right: -8,
//                       bgcolor: 'error.main',
//                       color: 'white',
//                       '&:hover': { bgcolor: 'error.dark' }
//                     }}
//                   >
//                     <Delete fontSize="small" />
//                   </IconButton>
//                 </Box>
//               ))}
//             </Box>
//           )}
//         </Box>

//         <Box>
//           <Typography variant="subtitle2" mb={1} fontWeight={600}>
//             {t('videos', 'Videos')}
//           </Typography>
//           <PrimaryButton
//             component="label"
//             variant="outlined"
//             startIcon={<CloudUpload />}
//             fullWidth
//           >
//             {t('selectVideos', 'Select Videos')}
//             <input
//               type="file"
//               accept="video/*"
//               multiple
//               hidden
//               onChange={(e) => handleFileSelect(e, 'videos')}
//             />
//           </PrimaryButton>
//           {form.videos.length > 0 && (
//             <Box mt={2}>
//               {form.videos.map((vid, idx) => (
//                 <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
//                   <Typography variant="body2" flex={1}>
//                     {vid instanceof File ? vid.name : vid.name || `Video ${idx + 1}`}
//                   </Typography>
//                   <IconButton
//                     size="small"
//                     color="error"
//                     onClick={() => handleRemoveFile('videos', idx)}
//                   >
//                     <Delete />
//                   </IconButton>
//                 </Box>
//               ))}
//             </Box>
//           )}
//         </Box>
//       </Stack>
//     </ModalWrapper>
//   )
// }

// export default EagleViewModal

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
import EagleViewService from '../../services/EagleViewService'
import uploadService from '@shared/services/uploadService'
import ImagePreview from '@shared/components/ImgPreview'

const EagleViewModal = ({ open, onClose, editingStep }) => {
  const { t } = useTranslation('masterPlan')
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
      setForm({
        title: editingStep.title || '',
        description: editingStep.description || '',
        date: editingStep.date ? new Date(editingStep.date) : null,
        images: (editingStep.media || [])
          .filter(m => m.type === 'image' || !m.type)
          .map(img => ({
            ...img,
            type: 'image',
            url: img.url,
            name: img.name || 'image',
            order: img.order || 0,
            isPublic: img.isPublic !== false,
            isNew: false // ✅ Marcamos como existente
          })),
        videos: (editingStep.media || [])
          .filter(m => m.type === 'video')
          .map(vid => ({
            ...vid,
            type: 'video',
            url: vid.url,
            name: vid.name || 'video',
            order: vid.order || 0,
            isPublic: vid.isPublic !== false,
            isNew: false
          }))
      })
    } else if (open && !editingStep) {
      setForm({ title: '', description: '', date: null, images: [], videos: [] })
    }
  }, [editingStep, open])

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    // ✅ Envolver cada File en un objeto con isPublic por defecto
    const newFiles = files.map(file => ({
      file, // El File real para subir después
      isPublic: true, // ✅ Valor por defecto
      name: file.name,
      isNew: true, // ✅ Flag para identificar archivos nuevos
      type
    }))

    setForm(prev => ({
      ...prev,
      [type]: [...prev[type], ...newFiles]
    }))
  }

  const handleRemoveFile = (type, index) => {
    setForm(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  // ✅ Nuevo handler para toggle de visibilidad público/privado
  const handleToggleImagePublic = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.map((img, i) =>
        i === index ? { ...img, isPublic: !img.isPublic } : img
      )
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
      // ✅ Filtrar por flag isNew en lugar de instanceof File
      const newImages = form.images.filter(img => img.isNew)
      const existingImages = form.images.filter(img => !img.isNew)
      
      const newVideos = form.videos.filter(vid => vid.isNew)
      const existingVideos = form.videos.filter(vid => !vid.isNew)

      let uploadedImages = []
      let uploadedVideos = []

      if (newImages.length > 0) {
        // ✅ Extraer los Files reales para subir
        uploadedImages = await uploadService.uploadTimeLineImages(
          newImages.map(img => img.file)
        )
      }
      
      if (newVideos.length > 0) {
        uploadedVideos = await uploadService.uploadTimeLineImages(
          newVideos.map(vid => vid.file)
        )
      }

      const allImages = [
        ...existingImages.map(img => ({
          type: 'image',
          url: img.url,
          name: img.name || '',
          order: img.order || 0,
          isPublic: img.isPublic !== false
        })),
        ...uploadedImages.map((url, idx) => ({
          type: 'image',
          url: url,
          name: newImages[idx].name || `${form.title}-image-${existingImages.length + idx + 1}`,
          order: existingImages.length + idx + 1,
          // ✅ Respetar el isPublic seleccionado por el usuario
          isPublic: newImages[idx].isPublic !== false
        }))
      ]

      const allVideos = [
        ...existingVideos.map(vid => ({
          type: 'video',
          url: vid.url,
          name: vid.name || '',
          order: vid.order || 0,
          isPublic: vid.isPublic !== false
        })),
        ...uploadedVideos.map((url, idx) => ({
          type: 'video',
          url: url,
          name: newVideos[idx].name || `${form.title}-video-${allImages.length + existingVideos.length + idx + 1}`,
          order: allImages.length + existingVideos.length + idx + 1,
          isPublic: newVideos[idx].isPublic !== false
        }))
      ]

      const media = [...allImages, ...allVideos]

      const payload = {
        title: form.title,
        description: form.description,
        date: form.date.toISOString(),
        media: media
      }

      if (editingStep) {
        await EagleViewService.update(editingStep._id, payload)
      } else {
        await EagleViewService.create(payload)
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
      subtitle={t('addStepSubtitle', 'Upload images and videos')}
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

        {/* ✅ SECCIÓN DE IMÁGENES CON IMAGEPREVIEW */}
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
            <Box 
              mt={2} 
              display="grid" 
              gridTemplateColumns="repeat(auto-fill, minmax(160px, 1fr))" 
              gap={2}
            >
              {form.images.map((img, idx) => (
                <ImagePreview
                  key={idx}
                  src={img.isNew ? URL.createObjectURL(img.file) : img.url}
                  alt={img.name || `image-${idx}`}
                  isPublic={img.isPublic}
                  onTogglePublic={() => handleToggleImagePublic(idx)}
                  onDelete={() => handleRemoveFile('images', idx)}
                  showVisibilityChip
                  label={img.isNew ? t('new', 'New') : null}
                  publicLabel={t('public', 'Public')}
                  privateLabel={t('private', 'Private')}
                  sx={{ minHeight: 120 }}
                  imgSx={{ height: 120 }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* SECCIÓN DE VIDEOS */}
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
                    {vid.isNew ? vid.file.name : (vid.name || `Video ${idx + 1}`)}
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

export default EagleViewModal