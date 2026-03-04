import React, { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Stack, IconButton, Tooltip, Avatar, Fade, Paper } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DeleteIcon from '@mui/icons-material/Delete';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useTranslation } from 'react-i18next';
import { Switch, FormControlLabel } from '@mui/material';
import TimeLineService from '../../services/TimeLineService';
import ImagePreview from '../../components/ImgPreview'; // Ajusta el path si es necesario

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  ...draggableStyle,
  boxShadow: isDragging ? '0 8px 24px rgba(140, 165, 81, 0.18)' : 2,
  border: isDragging ? '2px solid #8CA551' : '1px solid #e0e0e0',
  background: isDragging ? '#f7faef' : '#fff',
  transition: 'box-shadow 0.2s, border 0.2s',
});

const TimeLineStepModal = ({
  open,
  onClose,
  onSave,
  form,
  setForm,
  saving,
  handleAddImage,
  handleAddVideo,
  moveMedia,
  removeImage,
  removeVideo,
  editingStep
}) => {
  const { t } = useTranslation('timeLine');
  // Unifica y ordena media
  const mediaArr = [...form.images, ...form.videos].sort((a, b) => a.order - b.order);

  // Drag & Drop handler
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const arr = Array.from(mediaArr);
    const [removed] = arr.splice(result.source.index, 1);
    arr.splice(result.destination.index, 0, removed);
    // Actualiza orden y nombre
    arr.forEach((item, i) => {
      item.order = i + 1;
      item.name = `${form.title || (item.type === 'image' ? 'imagen' : 'video')}-${item.order}`;
    });
    setForm({
      ...form,
      images: arr.filter(i => i.type === 'image'),
      videos: arr.filter(i => i.type === 'video')
    });
  };

  const [customVisibility, setCustomVisibility] = useState(false);

    // Cambia el valor de isPublic para una imagen
const handleToggleAllImages = (isPublic) => {
  setForm(prev => ({
    ...prev,
    images: prev.images.map(img => ({ ...img, isPublic })),
  }));
};

// ...existing // ...existing code...
const handleToggleIsPublic = async (idx, type) => {
  console.log('[TimeLineStepModal] handleToggleIsPublic called', { idx, type, current: form[type][idx] });

  const prevForm = JSON.parse(JSON.stringify(form));
  const arr = [...form[type]];
  const target = arr[idx];
  const newIsPublic = !target.isPublic;

  // Optimistic UI
  arr[idx] = { ...arr[idx], isPublic: newIsPublic };
  setForm(prev => ({ ...prev, [type]: arr }));

  // intenta obtener id de varias fuentes
  let underConstructionId = form._id || form.id || (editingStep && (editingStep._id || editingStep.id));
  const mediaIdentifier = target._id || target.id || target.url;

  console.log('[TimeLineStepModal] prepared payload', { underConstructionId, mediaIdentifier, newIsPublic });

  // Si no hay id, intenta guardar el step (si onSave está disponible)
  if (!underConstructionId) {
    if (typeof onSave === 'function') {
      console.log('[TimeLineStepModal] no underConstructionId, calling onSave to create/persist step first');
      try {
        // espera a que onSave complete; asume que onSave actualizará `form` con el id
        await onSave();
        // intenta leer id otra vez después de guardar
        underConstructionId = form._id || form.id || (editingStep && (editingStep._id || editingStep.id));
        console.log('[TimeLineStepModal] after onSave, underConstructionId =', underConstructionId);
      } catch (err) {
        console.error('[TimeLineStepModal] onSave failed, aborting persist', err);
      }
    }
  }

  if (!underConstructionId || !mediaIdentifier) {
    console.warn('[TimeLineStepModal] skipping persist (missing id/identifier)', { underConstructionId, mediaIdentifier });
    return;
  }

  try {
    const payload = { media: { identifier: mediaIdentifier, isPublic: newIsPublic } };
    console.log('[TimeLineStepModal] sending update request', { underConstructionId, payload });
    const res = await TimeLineService.update(underConstructionId, payload);
    console.log('[TimeLineStepModal] update response', res);

    const updated = res?.underConstruction || res?.data || res;
    if (updated) {
      if (Array.isArray(updated.media) || Array.isArray(updated.images) || Array.isArray(updated.videos)) {
        // Ajusta según la forma real de la respuesta
        setForm(prev => ({
          ...prev,
          images: Array.isArray(updated.images) ? updated.images : prev.images,
          videos: Array.isArray(updated.videos) ? updated.videos : prev.videos,
          // si backend devuelve media genérico:
          ...(Array.isArray(updated.media) ? { images: updated.media.filter(m=>m.type==='image'), videos: updated.media.filter(m=>m.type==='video') } : {})
        }));
      }
    }
  } catch (err) {
    console.error('[TimeLineStepModal] Error updating timeline media visibility, reverting', err);
    setForm(prevForm); // revertir UI
  }
};
// ...existing code...

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(51, 63, 31, 0.15)',
          p: 0
        }
      }}
      TransitionComponent={Fade}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 24,
          pb: 0,
          color: '#333F1F',
          fontFamily: '"Poppins", sans-serif',
          borderBottom: '1px solid #e0e0e0',
          px: 4,
          pt: 3
        }}
      >
        {editingStep ? t('editStep', 'Edit Step') : t('newStep', 'New Step')}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, px: 4 }}>
        <Stack spacing={3}>
          <TextField
            label={t('title', 'Title')}
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            fullWidth
            autoFocus
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 3, fontFamily: '"Poppins", sans-serif' },
              '& .MuiInputLabel-root': { fontFamily: '"Poppins", sans-serif' }
            }}
          />
          <TextField
            label={t('description', 'Description')}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 3, fontFamily: '"Poppins", sans-serif' },
              '& .MuiInputLabel-root': { fontFamily: '"Poppins", sans-serif' }
            }}
          />
          <Box>
            <Typography variant="subtitle2" mb={1.5} fontWeight={700} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
              {t('media', 'Media')}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Button
                component="label"
                startIcon={<ImageIcon />}
                variant="outlined"
                color="success"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
              >
                {t('addImage', 'Add Image')}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  multiple
                  onChange={handleAddImage}
                />
              </Button>
              <Button
                component="label"
                startIcon={<VideoLibraryIcon />}
                variant="outlined"
                color="primary"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
              >
                {t('addVideo', 'Add Video')}
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={handleAddVideo}
                />
              </Button>
            </Stack>
            <Box mb={2}>
  <FormControlLabel
    control={
      <Switch
        checked={form.images.every(img => img.isPublic)}
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
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="media-droppable" direction="horizontal">
                {(provided) => (
                  <Box
                    direction="row"
                    spacing={2}
                    flexWrap="wrap"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 2,
                      overflowX: 'auto',
                      minHeight: 220,
                      p: 1,
                      maxWidth: '100%',
                      // Opcional: oculta el scrollbar en Chrome
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
    minWidth: 210,
    maxWidth: 240,
    mb: 2,
    borderRadius: 5,
    p: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    bgcolor: 'linear-gradient(135deg, #f7faef 0%, #fff 100%)',
    border: snapshot.isDragging
      ? '2.5px solid #8CA551'
      : '1.5px solid #e0e0e0',
    boxShadow: snapshot.isDragging
      ? '0 8px 32px rgba(140, 165, 81, 0.25)'
      : '0 2px 12px rgba(140, 165, 81, 0.10)',
    position: 'relative',
    transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
    '&:hover': {
      boxShadow: '0 8px 24px rgba(140, 165, 81, 0.18)',
      border: '2px solid #8CA551',
      bgcolor: 'linear-gradient(135deg, #f7faef 0%, #f0f7e1 100%)',
      transform: 'translateY(-2px) scale(1.01)',
    },
  }}
>
  {/* Imagen o video */}
  <Box
    sx={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      mt: 2,
      mb: 1,
    }}
  >
    {media.type === 'image' ? (
      <ImagePreview
        src={media.url}
        alt={media.name}
        isPublic={!!media.isPublic}
        onTogglePublic={checked => {
          const idxInArr = form.images.findIndex(i => i.url === media.url);
          handleToggleIsPublic(idxInArr, 'images');
        }}
        onDelete={() => removeImage(form.images.findIndex(i => i.url === media.url))}
        showSwitch={customVisibility}
        switchPosition="top-right"
        sx={{
          width: 150,
          height: 110,
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(140, 165, 81, 0.10)',
          border: '1.5px solid #e0e0e0',
          background: '#fff',
        }}
        imgSx={{ height: 110 }}
      />
    ) : (
      <Box sx={{ width: 150, height: 110, borderRadius: 3, overflow: 'hidden', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video
          src={media.url}
          width={150}
          height={110}
          style={{ borderRadius: 12, objectFit: 'cover', background: '#eee' }}
          controls
        />
      </Box>
    )}
  </Box>
  {/* Nombre y eliminar */}
  <Box sx={{ width: '100%', textAlign: 'center', mt: 1, mb: 0.5 }}>
    <Typography
      variant="subtitle2"
      sx={{
        fontWeight: 700,
        fontFamily: '"Poppins", sans-serif',
        color: '#3a4d1a',
        letterSpacing: 0.2,
        mb: 0.5,
      }}
    >
      {media.name}
    </Typography>
  </Box>
  {/* Orden */}
  <TextField
    label={t('order', 'Order')}
    type="number"
    size="small"
    value={media.order}
    inputProps={{ min: 1, max: arr.length, style: { width: 40, textAlign: 'center' } }}
    sx={{
      mt: 0.5,
      mb: 2,
      width: 80,
      fontFamily: '"Poppins", sans-serif',
      '& .MuiInputBase-root': { borderRadius: 2 },
    }}
    onChange={e => {
      let newOrder = parseInt(e.target.value, 10);
      if (isNaN(newOrder) || newOrder < 1 || newOrder > arr.length) return;
      moveMedia(idx, newOrder - (idx + 1));
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
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 3, pt: 2, borderTop: '1px solid #e0e0e0', gap: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={saving}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1.2,
            color: "#706f6f",
            fontFamily: '"Poppins", sans-serif',
            border: '2px solid #e0e0e0',
            '&:hover': {
              bgcolor: "rgba(112, 111, 111, 0.05)",
              borderColor: "#706f6f"
            }
          }}
        >
          {t('cancel', 'Cancel')}
        </Button>
        <Button variant="contained" onClick={onSave} disabled={saving}
          sx={{
            borderRadius: 3,
            bgcolor: "#333F1F",
            color: "white",
            fontWeight: 600,
            textTransform: "none",
            fontFamily: '"Poppins", sans-serif',
            px: 4,
            py: 1.5,
            boxShadow: "0 4px 12px rgba(51, 63, 31, 0.25)",
            "&:hover": {
              bgcolor: "#8CA551",
              boxShadow: "0 8px 20px rgba(140, 165, 81, 0.35)"
            },
            "&:disabled": {
              bgcolor: "#e0e0e0",
              color: "#9e9e9e",
              boxShadow: "none"
            }
          }}
        >
          {saving ? <span style={{ padding: '0 12px' }}>{t('saving', 'Saving...')}</span> : t('save', 'Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimeLineStepModal;