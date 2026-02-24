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

const handleToggleIsPublic = (idx, type) => {
  setForm(prev => {
    const arr = [...prev[type]];
    arr[idx] = { ...arr[idx], isPublic: !arr[idx].isPublic };
        console.log(`[TimeLineStepModal] Imagen ${arr[idx].name} isPublic:`, arr[idx].isPublic);

    return { ...prev, [type]: arr };
  });
};

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
                      pb: 1,
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
  elevation={snapshot.isDragging ? 8 : 2}
  sx={{
    ...getItemStyle(snapshot.isDragging, provided.draggableProps.style),
    minWidth: 170,
    maxWidth: 200,
    mb: 2,
    borderRadius: 3,
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    bgcolor: 'background.paper',
    position: 'relative' // Necesario para posicionar el switch
  }}
>
  {/* Switch en la esquina superior derecha */}
  {media.type === 'image' && customVisibility && (
    <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
      <Switch
        checked={!!media.isPublic}
        onChange={() => {
          const idxInArr = form.images.findIndex(i => i.url === media.url);
          handleToggleIsPublic(idxInArr, 'images');
        }}
        color="success"
        size="small"
      />
    </Box>
  )}
  {/* Imagen o video */}
  <Box sx={{ width: 120, height: 120, mb: 1, borderRadius: 2, overflow: 'hidden', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {media.type === 'image' ? (
      <img
        src={media.url}
        alt={media.name}
        width={120}
        height={120}
        style={{ objectFit: 'cover', borderRadius: 12 }}
      />
    ) : (
      <video
        src={media.url}
        width={120}
        height={120}
        style={{ borderRadius: 12, objectFit: 'cover', background: '#eee' }}
        controls
      />
    )}
  </Box>
                            <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, fontFamily: '"Poppins", sans-serif', color: '#333F1F' }}>
                              {media.name}
                            </Typography>
                            <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
            <Tooltip title={t('delete', 'Delete')}>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    if (media.type === 'image') removeImage(form.images.findIndex(i => i.url === media.url));
                                    else removeVideo(form.videos.findIndex(v => v.url === media.url));
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                            <TextField
              label={t('order', 'Order')}
                              type="number"
                              size="small"
                              value={media.order}
                              inputProps={{ min: 1, max: arr.length, style: { width: 40, textAlign: 'center' } }}
                              sx={{ mt: 1, width: 70, fontFamily: '"Poppins", sans-serif' }}
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