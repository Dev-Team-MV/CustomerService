import { useState, useEffect } from 'react';
import { Box, Button, Modal, TextField, Typography, IconButton, Paper, Stack, Container, CircularProgress } from '@mui/material';
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
import TimeLineStepModal from '../components/timeLine/TimeLineStepModal';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';

const TimeLine = () => {
  const { t } = useTranslation('timeLine');     
  const [steps, setSteps] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    images: [],
    videos: []
  });

  // --- Cargar datos del backend ---
  useEffect(() => {
    const fetchSteps = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await TimeLineService.getAll();
        setSteps(data);
      } catch (err) {
        setError('No se pudo cargar la línea de tiempo.');
        setSteps([]); // O puedes dejar el mockSteps si quieres fallback
      }
      setLoading(false);
    };
    fetchSteps();
  }, []);

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

  // --- CRUD handlers ---
  const handleSave = async () => {
    setSaving(true);
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

    try {
      if (editingStep) {
        const updated = await TimeLineService.update(editingStep.id, payload);
        setSteps((prev) =>
          prev.map((s) =>
            s.id === editingStep.id
              ? updated
              : s
          )
        );
      } else {
        const created = await TimeLineService.create(payload);
        setSteps((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      alert('Error al guardar. Intenta de nuevo.');
    }
    setSaving(false);
  };

  // --- DataTable columns ---
const columns = [
  {
    field: 'createdAt',
    headerName: t('date', 'Date'),
    width: 120,
    renderCell: ({ row }) => (
      <Typography
        variant="body2"
        sx={{
          color: '#706f6f',
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 500
        }}
      >
        {new Date(row.createdAt).toLocaleDateString()}
      </Typography>
    )
  },
  {
    field: 'title',
    headerName: t('title', 'Title'),
    width: 180,
    renderCell: ({ row }) => (
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: '#1a1a1a',
          fontFamily: '"Poppins", sans-serif'
        }}
      >
        {row.title}
      </Typography>
    )
  },
  {
    field: 'description',
    headerName: t('description', 'Description'),
    width: 300,
    renderCell: ({ row }) => (
      <Typography
        variant="body2"
        sx={{
          color: '#706f6f',
          fontFamily: '"Poppins", sans-serif',
          fontSize: '0.95rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {row.description}
      </Typography>
    )
  },
  {
    field: 'images',
    headerName: t('images', 'Images'),
    width: 120,
    align: 'center',
    renderCell: ({ row }) => (
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: '#8CA551',
          fontFamily: '"Poppins", sans-serif'
        }}
      >
        {(row.media || []).filter(m => m.type === 'image').length}
      </Typography>
    )
  },
  {
    field: 'videos',
    headerName: t('videos', 'Videos'),
    width: 120,
    align: 'center',
    renderCell: ({ row }) => (
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: '#E5863C',
          fontFamily: '"Poppins", sans-serif'
        }}
      >
        {(row.media || []).filter(m => m.type === 'video').length}
      </Typography>
    )
  },
  {
    field: 'actions',
    headerName: t('actions', 'Actions'),
    width: 100,
    align: 'center',
    renderCell: ({ row }) => (
      <Box display="flex" alignItems="center" gap={1}>
        <Tooltip title={t('edit', 'Edit')} placement="top">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(row);
            }}
            sx={{
              bgcolor: 'rgba(140, 165, 81, 0.08)',
              border: '1px solid rgba(140, 165, 81, 0.2)',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#8CA551',
                borderColor: '#8CA551',
                transform: 'scale(1.1)',
                '& .MuiSvgIcon-root': {
                  color: 'white'
                }
              }
            }}
          >
            <EditIcon sx={{ fontSize: 18, color: '#8CA551' }} />
          </IconButton>
        </Tooltip>
      </Box>
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
  title={t('timelineTitle', 'Timeline')}
  subtitle={t('timelineSubtitle', 'Manage project progress and stages')}
  actionButton={{
    label: t('newStep', 'New Step'),
    icon: <AddIcon />,
    onClick: openCreateModal
  }}
/>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box color="error.main" textAlign="center" py={4}>{error}</Box>
        ) : (
<DataTable
  columns={columns}
  data={steps}
  emptyState={
    <EmptyState
      icon={AddIcon}
      title={t('noSteps', 'No steps yet')}
      description={t('addFirstStep', 'Add the first step to start the timeline.')}
      actionLabel={t('newStep', 'New Step')}
      onAction={openCreateModal}
    />
  }
/>
        )}

        {/* MODAL CREAR/EDITAR STEP */}


<TimeLineStepModal
  open={modalOpen}
  onClose={closeModal}
  onSave={handleSave}
  form={form}
  setForm={setForm}
  saving={saving}
  handleAddImage={handleAddImage}
  handleAddVideo={handleAddVideo}
  moveMedia={moveMedia}
  removeImage={removeImage}
  removeVideo={removeVideo}
  editingStep={editingStep}
/>
      </Container>
    </Box>
  );
};

export default TimeLine;