import { useState } from 'react';
import { Box, Button, Modal, TextField, Typography, IconButton, Paper, Stack, Container } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/table/DataTable';
import EmptyState from '../components/table/EmptyState';
import TimeLineService from '../services/TimeLineService';
import uploadService from '../services/uploadService';

const mockSteps = [
  {
    id: 1,
    createdAt: new Date().toISOString(),
    title: 'Inicio de obra',
    description: 'Se comenzó la obra.',
    media: [
      { type: 'image', url: 'https://via.placeholder.com/150', name: 'inicio-1', order: 1 },
      { type: 'image', url: 'https://via.placeholder.com/150', name: 'inicio-2', order: 2 }
    ]
  }
];

const TimeLine = () => {
  const [steps, setSteps] = useState(mockSteps);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    images: [],
    videos: []
  });

  // --- Modal handlers ---
  const openCreateModal = () => {
    setEditingStep(null);
    setForm({ title: '', description: '', images: [], videos: [] });
    setModalOpen(true);
  };

  const openEditModal = (step) => {
    setEditingStep(step);
    setForm({
      title: step.title,
      description: step.description,
      images: (step.media || []).filter(m => m.type === 'image'),
      videos: (step.media || []).filter(m => m.type === 'video')
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // --- Image/video handlers ---
const handleAddImage = (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  setForm((prev) => {
    const currentCount = prev.images.length + prev.videos.length;
    const newImages = files.map((file, i) => {
      const order = currentCount + i + 1;
      const name = `${prev.title || 'imagen'}-${order}`;
      const url = URL.createObjectURL(file);
      return { type: 'image', url, name, order, file };
    });
    return {
      ...prev,
      images: [...prev.images, ...newImages]
    };
  });
};

const handleAddVideo = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const order = form.images.length + form.videos.length + 1;
  const name = `${form.title || 'video'}-${order}`;
  const url = URL.createObjectURL(file);
  setForm((prev) => ({
    ...prev,
    videos: [...prev.videos, { type: 'video', url, name, order, file }]
  }));
};

  // --- Orden y edición ---
  const updateOrders = (images, videos) => {
    const all = [...images, ...videos].sort((a, b) => a.order - b.order);
    return all.map((item, idx) => ({
      ...item,
      order: idx + 1,
      name: `${form.title || (item.type === 'image' ? 'imagen' : 'video')}-${idx + 1}`
    }));
  };

  const moveImage = (idx, dir) => {
    const arr = [...form.images];
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === arr.length - 1)) return;
    [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
    const updated = updateOrders(arr, form.videos);
    setForm((prev) => ({
      ...prev,
      images: updated.filter(i => i.type === 'image'),
      videos: updated.filter(i => i.type === 'video')
    }));
  };

  const removeImage = (idx) => {
    const arr = form.images.filter((_, i) => i !== idx);
    const updated = updateOrders(arr, form.videos);
    setForm((prev) => ({
      ...prev,
      images: updated.filter(i => i.type === 'image'),
      videos: updated.filter(i => i.type === 'video')
    }));
  };

  // --- CRUD handlers ---
const handleSave = async () => {
  // Filtra los archivos locales (blob:) para subirlos
  const imagesToUpload = form.images.filter(img => img.url.startsWith('blob:'));
  const videosToUpload = form.videos.filter(vid => vid.url.startsWith('blob:'));

  let uploadedImages = [];
  let uploadedVideos = [];

  if (imagesToUpload.length > 0) {
    uploadedImages = await uploadService.uploadTimeLineImages(
      imagesToUpload.map(img => img.file)
    );
  }
  if (videosToUpload.length > 0) {
    uploadedVideos = await uploadService.uploadTimeLineImages(
      videosToUpload.map(vid => vid.file)
    );
  }

  // Reemplaza las URLs locales por las URLs reales
  const images = form.images.map(img => {
    if (img.url.startsWith('blob:')) {
      return {
        ...img,
        url: uploadedImages.shift(),
      };
    }
    return img;
  });

  const videos = form.videos.map(vid => {
    if (vid.url.startsWith('blob:')) {
      return {
        ...vid,
        url: uploadedVideos.shift(),
      };
    }
    return vid;
  });

  // Unifica imágenes y videos en un solo array media y los ordena por order
  const media = [
    ...images.map(img => ({
      type: 'image',
      url: img.url,
      name: img.name,
      order: img.order
    })),
    ...videos.map(vid => ({
      type: 'video',
      url: vid.url,
      name: vid.name,
      order: vid.order
    }))
  ].sort((a, b) => a.order - b.order);

  const payload = {
    title: form.title,
    description: form.description,
    media
  };

  if (editingStep) {
    await TimeLineService.update(editingStep.id, payload);
    setSteps((prev) =>
      prev.map((s) =>
        s.id === editingStep.id
          ? { ...s, ...payload, id: editingStep.id, createdAt: s.createdAt }
          : s
      )
    );
  } else {
    await TimeLineService.create(payload);
    setSteps((prev) => [
      {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...payload
      },
      ...prev
    ]);
  }
  setModalOpen(false);
};

  const moveMedia = (idx, dir) => {
  const all = [...form.images, ...form.videos].sort((a, b) => a.order - b.order);
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= all.length) return;
  [all[idx], all[newIdx]] = [all[newIdx], all[idx]];
  all.forEach((item, i) => {
    item.order = i + 1;
    item.name = `${form.title || (item.type === 'image' ? 'imagen' : 'video')}-${item.order}`;
  });
  setForm({
    ...form,
    images: all.filter(i => i.type === 'image'),
    videos: all.filter(i => i.type === 'video')
  });
};

const removeVideo = (idx) => {
  const arr = form.videos.filter((_, i) => i !== idx);
  const updated = updateOrders(form.images, arr);
  setForm((prev) => ({
    ...prev,
    images: updated.filter(i => i.type === 'image'),
    videos: updated.filter(i => i.type === 'video')
  }));
};

  // --- DataTable columns ---
  const columns = [
    {
      field: 'createdAt',
      headerName: 'Fecha',
      width: 120,
      renderCell: ({ row }) =>
        new Date(row.createdAt).toLocaleDateString()
    },
    { field: 'title', headerName: 'Título', width: 180 },
    { field: 'description', headerName: 'Descripción', width: 300 },
    {
      field: 'images',
      headerName: 'Imágenes',
      width: 120,
      renderCell: ({ row }) => (row.media || []).filter(m => m.type === 'image').length
    },
    {
      field: 'videos',
      headerName: 'Videos',
      width: 120,
      renderCell: ({ row }) => (row.media || []).filter(m => m.type === 'video').length
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      renderCell: ({ row }) => (
        <Button size="small" onClick={() => openEditModal(row)}>
          Editar
        </Button>
      )
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="xl">
        <PageHeader
          icon={AddIcon}
          title="Línea de Tiempo"
          subtitle="Gestiona los avances y etapas del proyecto"
          actionButton={{
            label: 'Nuevo Step',
            icon: <AddIcon />,
            onClick: openCreateModal
          }}
        />

        <DataTable
          columns={columns}
          data={steps}
          emptyState={
            <EmptyState
              icon={AddIcon}
              title="Sin pasos aún"
              description="Agrega el primer paso para comenzar la línea de tiempo."
              actionLabel="Nuevo Step"
              onAction={openCreateModal}
            />
          }
        />

        {/* MODAL CREAR/EDITAR STEP */}
        <Modal open={modalOpen} onClose={closeModal}>
          <Paper
            sx={{
              p: 4,
              maxWidth: 500,
              mx: 'auto',
              mt: 8,
              borderRadius: 4,
              outline: 'none'
            }}
          >
            <Typography variant="h6" mb={2}>
              {editingStep ? 'Editar Step' : 'Nuevo Step'}
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Título"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Descripción"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                fullWidth
                multiline
                minRows={2}
              />
            {/* Media (Imágenes y Videos unificados) */}
            <Box>
              <Typography variant="subtitle2" mb={1}>
                Media
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <Button
                  component="label"
                  startIcon={<ImageIcon />}
                  sx={{ mb: 0 }}
                >
                  Agregar Imagen
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
                  sx={{ mb: 0 }}
                >
                  Agregar Video
                  <input
                    type="file"
                    accept="video/*"
                    hidden
                    onChange={handleAddVideo}
                  />
                </Button>
              </Stack>
              <Stack direction="row" spacing={1}>
                {[...form.images, ...form.videos]
                  .sort((a, b) => a.order - b.order)
                  .map((media, idx, arr) => (
                    <Box key={media.url} sx={{ position: 'relative', minWidth: 70 }}>
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt={media.name}
                          width={60}
                          height={60}
                          style={{ borderRadius: 8, objectFit: 'cover' }}
                        />
                      ) : (
                        <video
                          src={media.url}
                          width={60}
                          height={60}
                          style={{ borderRadius: 8, objectFit: 'cover' }}
                          controls
                        />
                      )}
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: 0, right: 0 }}
                        onClick={() => {
                          if (media.type === 'image') removeImage(form.images.findIndex(i => i.url === media.url));
                          else removeVideo(form.videos.findIndex(v => v.url === media.url));
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', bottom: 0, left: 0 }}
                        onClick={() => moveMedia(idx, -1)}
                        disabled={idx === 0}
                      >
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', bottom: 0, right: 0 }}
                        onClick={() => moveMedia(idx, 1)}
                        disabled={idx === arr.length - 1}
                      >
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>
                      {/* Orden editable */}
                      <Box sx={{ mt: 1, textAlign: 'center' }}>
                        <TextField
                          label="Orden"
                          type="number"
                          size="small"
                          value={media.order}
                          inputProps={{ min: 1, max: arr.length, style: { width: 40, textAlign: 'center' } }}
                          onChange={e => {
                            let newOrder = parseInt(e.target.value, 10);
                            if (isNaN(newOrder) || newOrder < 1 || newOrder > arr.length) return;
                            moveMedia(idx, newOrder - (idx + 1));
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
              </Stack>
            </Box>
              <Box display="flex" gap={2} mt={2}>
                <Button variant="contained" onClick={handleSave}>
                  Guardar
                </Button>
                <Button variant="outlined" onClick={closeModal}>
                  Cancelar
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Modal>
      </Container>
    </Box>
  );
};

export default TimeLine;