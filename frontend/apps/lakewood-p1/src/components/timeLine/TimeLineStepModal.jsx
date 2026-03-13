import { useState }              from 'react'
import {
  Box, TextField, Typography,
  Stack, FormControlLabel, Switch, Paper
} from '@mui/material'
import ImageIcon         from '@mui/icons-material/Image'
import VideoLibraryIcon  from '@mui/icons-material/VideoLibrary'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useTranslation } from 'react-i18next'

import TimeLineService   from '../../services/TimeLineService'
import ImagePreview      from '../ImgPreview'
import ModalWrapper      from '../../constants/ModalWrapper'
import PrimaryButton     from '../../constants/PrimaryButton'

// ── helpers ────────────────────────────────────────────────
const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  ...draggableStyle,
  transition: 'box-shadow 0.2s, border 0.2s',
})

// ── component ──────────────────────────────────────────────
const TimeLineStepModal = ({
  open, onClose, onSave,
  form, setForm, saving,
  handleAddImage, handleAddVideo,
  moveMedia, removeImage, removeVideo,
  editingStep
}) => {
  const { t } = useTranslation('timeLine')
  const [customVisibility, setCustomVisibility] = useState(false)

  const mediaArr = [...form.images, ...form.videos].sort((a, b) => a.order - b.order)

  // ── drag & drop ──────────────────────────────────────────
  const onDragEnd = (result) => {
    if (!result.destination) return
    const arr = Array.from(mediaArr)
    const [removed] = arr.splice(result.source.index, 1)
    arr.splice(result.destination.index, 0, removed)
    arr.forEach((item, i) => {
      item.order = i + 1
      item.name  = `${form.title || (item.type === 'image' ? 'imagen' : 'video')}-${item.order}`
    })
    setForm({
      ...form,
      images: arr.filter(i => i.type === 'image'),
      videos: arr.filter(i => i.type === 'video')
    })
  }

  // ── visibility ───────────────────────────────────────────
  const handleToggleAllImages = (isPublic) => {
    setForm(prev => ({ ...prev, images: prev.images.map(img => ({ ...img, isPublic })) }))
  }

  const handleToggleIsPublic = async (idx, type) => {
    const prevForm        = JSON.parse(JSON.stringify(form))
    const arr             = [...form[type]]
    const target          = arr[idx]
    const newIsPublic     = !target.isPublic

    arr[idx] = { ...arr[idx], isPublic: newIsPublic }
    setForm(prev => ({ ...prev, [type]: arr }))

    let underConstructionId = form._id || form.id || (editingStep && (editingStep._id || editingStep.id))
    const mediaIdentifier   = target._id || target.id || target.url

    if (!underConstructionId && typeof onSave === 'function') {
      try {
        await onSave()
        underConstructionId = form._id || form.id || (editingStep && (editingStep._id || editingStep.id))
      } catch (err) {
        console.error('[TimeLineStepModal] onSave failed', err)
      }
    }

    if (!underConstructionId || !mediaIdentifier) return

    try {
      const res     = await TimeLineService.update(underConstructionId, { media: { identifier: mediaIdentifier, isPublic: newIsPublic } })
      const updated = res?.underConstruction || res?.data || res
      if (updated) {
        setForm(prev => ({
          ...prev,
          images: Array.isArray(updated.images) ? updated.images : prev.images,
          videos: Array.isArray(updated.videos) ? updated.videos : prev.videos,
          ...(Array.isArray(updated.media) ? {
            images: updated.media.filter(m => m.type === 'image'),
            videos: updated.media.filter(m => m.type === 'video')
          } : {})
        }))
      }
    } catch (err) {
      console.error('[TimeLineStepModal] visibility update failed, reverting', err)
      setForm(prevForm)
    }
  }

  // ── actions ───────────────────────────────────────────────
  const modalActions = (
    <>
      <PrimaryButton onClick={onSave} loading={saving}>
        {t('save', 'Save')}
      </PrimaryButton>
    </>
  )

  // ── render ────────────────────────────────────────────────
  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={editingStep ? t('editStep', 'Edit Step') : t('newStep', 'New Step')}
      maxWidth="lg"
      actions={modalActions}
    >
      <Stack spacing={3} sx={{ mt: 1 }}>

        {/* TITLE */}
        <TextField
          label={t('title', 'Title')}
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          fullWidth autoFocus variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: 3, fontFamily: '"Poppins", sans-serif' },
            '& .MuiInputLabel-root':    { fontFamily: '"Poppins", sans-serif' }
          }}
        />

        {/* DESCRIPTION */}
        <TextField
          label={t('description', 'Description')}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          fullWidth multiline minRows={2} variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: 3, fontFamily: '"Poppins", sans-serif' },
            '& .MuiInputLabel-root':    { fontFamily: '"Poppins", sans-serif' }
          }}
        />

        {/* MEDIA */}
        <Box>
          <Typography variant="subtitle2" mb={1.5} fontWeight={700}
            sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}
          >
            {t('media', 'Media')}
          </Typography>

          {/* Upload buttons */}
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <PrimaryButton
              component="label"
              variant="outlined"
              color="success"
              startIcon={<ImageIcon />}
              sx={{ color: '#8CA551', borderColor: '#8CA551', '&:hover': { borderColor: '#333F1F', color: '#333F1F' } }}
            >
              {t('addImage', 'Add Image')}
              <input type="file" accept="image/*" hidden multiple onChange={handleAddImage} />
            </PrimaryButton>

            <PrimaryButton
              component="label"
              variant="outlined"
              color="primary"
              startIcon={<VideoLibraryIcon />}
            >
              {t('addVideo', 'Add Video')}
              <input type="file" accept="video/*" hidden onChange={handleAddVideo} />
            </PrimaryButton>
          </Stack>

          {/* Visibility toggles */}
          <Box mb={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.images.length > 0 && form.images.every(img => img.isPublic)}
                  onChange={e => handleToggleAllImages(e.target.checked)}
                  color="success"
                />
              }
              label={t('allPublic', 'All images public')}
              sx={{ fontFamily: '"Poppins", sans-serif', mr: 3 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={customVisibility}
                  onChange={e => setCustomVisibility(e.target.checked)}
                  color="primary"
                />
              }
              label={t('customVisibility', 'Customize visibility per image')}
              sx={{ fontFamily: '"Poppins", sans-serif' }}
            />
          </Box>

          {/* Drag & Drop */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="media-droppable" direction="horizontal">
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    display: 'flex', flexDirection: 'row',
                    gap: 2, overflowX: 'auto',
                    minHeight: 220, p: 1,
                    '&::-webkit-scrollbar': { height: 8 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: '#e0e0e0', borderRadius: 4 }
                  }}
                >
                  {mediaArr.map((media, idx, arr) => (
                    <Draggable key={media.url} draggableId={media.url} index={idx}>
                      {(provided, snapshot) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          elevation={snapshot.isDragging ? 12 : 4}
                          sx={{
                            ...getItemStyle(snapshot.isDragging, provided.draggableProps.style),
                            minWidth: 210, maxWidth: 240,
                            mb: 2, borderRadius: 5, p: 0,
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            border: snapshot.isDragging ? '2.5px solid #8CA551' : '1.5px solid #e0e0e0',
                            boxShadow: snapshot.isDragging
                              ? '0 8px 32px rgba(140,165,81,0.25)'
                              : '0 2px 12px rgba(140,165,81,0.10)',
                            '&:hover': {
                              boxShadow: '0 8px 24px rgba(140,165,81,0.18)',
                              border: '2px solid #8CA551',
                              transform: 'translateY(-2px) scale(1.01)'
                            }
                          }}
                        >
                          {/* Preview */}
                          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 2, mb: 1 }}>
                            {media.type === 'image' ? (
                              <ImagePreview
                                src={media.url}
                                alt={media.name}
                                isPublic={!!media.isPublic}
                                onTogglePublic={() => {
                                  const i = form.images.findIndex(img => img.url === media.url)
                                  handleToggleIsPublic(i, 'images')
                                }}
                                onDelete={() => removeImage(form.images.findIndex(img => img.url === media.url))}
                                showSwitch={customVisibility}
                                switchPosition="top-right"
                                sx={{ width: 150, height: 110, borderRadius: 3, border: '1.5px solid #e0e0e0' }}
                                imgSx={{ height: 110 }}
                              />
                            ) : (
                              <Box sx={{ width: 150, height: 110, borderRadius: 3, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                                <video src={media.url} width={150} height={110}
                                  style={{ borderRadius: 12, objectFit: 'cover' }} controls />
                              </Box>
                            )}
                          </Box>

                          {/* Name */}
                          <Typography variant="subtitle2" sx={{
                            fontWeight: 700, fontFamily: '"Poppins", sans-serif',
                            color: '#3a4d1a', letterSpacing: 0.2, mb: 0.5, textAlign: 'center'
                          }}>
                            {media.name}
                          </Typography>

                          {/* Order input */}
                          <TextField
                            label={t('order', 'Order')}
                            type="number" size="small"
                            value={media.order}
                            inputProps={{ min: 1, max: arr.length, style: { width: 40, textAlign: 'center' } }}
                            sx={{ mt: 0.5, mb: 2, width: 80, '& .MuiInputBase-root': { borderRadius: 2 } }}
                            onChange={e => {
                              const newOrder = parseInt(e.target.value, 10)
                              if (isNaN(newOrder) || newOrder < 1 || newOrder > arr.length) return
                              moveMedia(idx, newOrder - (idx + 1))
                            }}
                          />
                        </Paper>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        </Box>
      </Stack>
    </ModalWrapper>
  )
}

export default TimeLineStepModal