import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Button,
  Menu,
  MenuItem
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Add
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import NewsModal from '../components/news/NewsModal';

// ✅ DATA QUEMADA TEMPORAL
const mockNews = [
  {
    id: 1,
    title: 'Club House Construction Begins',
    description: 'Today we officially started the construction of our new club house facility...',
    category: 'construction',
    status: 'published',
    author: 'John Admin',
    date: '2026-02-10',
    views: 245,
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=150',
    hasVideo: true
  },
  {
    id: 2,
    title: 'New Model 10 Available',
    description: 'Exciting news! We are launching our new Model 10 with premium upgrades...',
    category: 'announcement',
    status: 'draft',
    author: 'Sarah Manager',
    date: '2026-02-08',
    views: 0,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150',
    hasVideo: false
  },
  {
    id: 3,
    title: 'Monthly Progress Report - January',
    description: 'Check out our monthly progress report with construction updates and milestones...',
    category: 'report',
    status: 'published',
    author: 'John Admin',
    date: '2026-02-01',
    views: 432,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=150',
    hasVideo: true
  }
];

const NewsTable = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);

  const handleMenuOpen = (event, news) => {
    setAnchorEl(event.currentTarget);
    setSelectedNews(news);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNews(null);
  };

  // ✅ Abrir modal para crear noticia
  const handleCreateNew = () => {
    setEditingNews(null);
    setModalOpen(true);
  };

  // ✅ Abrir modal para editar noticia
  const handleEdit = () => {
    setEditingNews(selectedNews);
    setModalOpen(true);
    handleMenuClose();
  };

  // ✅ Ver noticia - Navegar a página de detalle
  const handleView = () => {
    navigate(`/explore/news/${selectedNews.id}`);
    handleMenuClose();
  };

  // ✅ Eliminar noticia
  const handleDelete = () => {
    console.log('🗑️ Deleting news:', selectedNews);
    // TODO: Implementar lógica de eliminación
    handleMenuClose();
  };

  // ✅ Guardar noticia (crear o editar)
  const handleSubmit = (newsData) => {
    if (editingNews) {
      console.log('✏️ Updating news:', newsData);
    } else {
      console.log('✨ Creating new news:', newsData);
    }
    setModalOpen(false);
    setEditingNews(null);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'construction': return '#f59e0b';
      case 'announcement': return '#3b82f6';
      case 'report': return '#8b5cf6';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    return status === 'published' ? 'success' : 'warning';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* ✅ HEADER */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="800"
            sx={{
              color: '#2c3e50',
              letterSpacing: '-1px',
              mb: 0.5
            }}
          >
            News & Updates
          </Typography>
          <Typography variant="body2" sx={{ color: '#6c757d' }}>
            Manage project updates and announcements
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateNew}
          sx={{
            borderRadius: 3,
            background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
            color: 'white',
            fontWeight: 700,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            boxShadow: '0 8px 20px rgba(74,124,89,0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #3d664a 0%, #7ba843 100%)',
              boxShadow: '0 12px 28px rgba(74,124,89,0.4)'
            }
          }}
        >
          Create News
        </Button>
      </Box>

      {/* ✅ TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.06)'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>News</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Author</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Views</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockNews.map((news) => (
                <TableRow
                  key={news.id}
                  sx={{
                    '&:hover': { bgcolor: '#f8fafb' },
                    transition: 'background 0.2s'
                  }}
                >
                  {/* NEWS INFO */}
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={news.image}
                        variant="rounded"
                        sx={{ width: 56, height: 56, borderRadius: 2 }}
                      />
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{ color: '#2c3e50', mb: 0.5 }}
                        >
                          {news.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#6c757d',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {news.description}
                        </Typography>
                        {news.hasVideo && (
                          <Chip
                            label="📹 Video"
                            size="small"
                            sx={{
                              mt: 0.5,
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: '#fef3c7',
                              color: '#f59e0b'
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  {/* CATEGORY */}
                  <TableCell>
                    <Chip
                      label={news.category}
                      size="small"
                      sx={{
                        bgcolor: `${getCategoryColor(news.category)}20`,
                        color: getCategoryColor(news.category),
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}
                    />
                  </TableCell>

                  {/* STATUS */}
                  <TableCell>
                    <Chip
                      label={news.status}
                      color={getStatusColor(news.status)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}
                    />
                  </TableCell>

                  {/* AUTHOR */}
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#6c757d' }}>
                      {news.author}
                    </Typography>
                  </TableCell>

                  {/* DATE */}
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#6c757d' }}>
                      {new Date(news.date).toLocaleDateString()}
                    </Typography>
                  </TableCell>

                  {/* VIEWS */}
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Visibility sx={{ fontSize: 16, color: '#6c757d' }} />
                      <Typography variant="body2" fontWeight={600}>
                        {news.views}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, news)}
                      sx={{ color: '#6c757d' }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>

      {/* ✅ MENU DE ACCIONES */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            mt: 1
          }
        }}
      >
        <MenuItem onClick={handleView} sx={{ gap: 1.5 }}>
          <Visibility sx={{ fontSize: 20, color: '#3b82f6' }} />
          <Typography>View</Typography>
        </MenuItem>
        <MenuItem onClick={handleEdit} sx={{ gap: 1.5 }}>
          <Edit sx={{ fontSize: 20, color: '#f59e0b' }} />
          <Typography>Edit</Typography>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ gap: 1.5, color: 'error.main' }}>
          <Delete sx={{ fontSize: 20 }} />
          <Typography>Delete</Typography>
        </MenuItem>
      </Menu>

      {/* ✅ MODAL DE CREAR/EDITAR NOTICIA */}
      <NewsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingNews(null);
        }}
        newsData={editingNews}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default NewsTable;