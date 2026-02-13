import React, { useState, useEffect } from 'react';
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
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Add,
  Warning,
  Article
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import NewsModal from '../components/news/NewsModal';
import newsService from '../services/newsService';

const NewsTable = () => {
  const navigate = useNavigate();
  
  // ✅ Estados
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ✅ Cargar noticias al montar
  useEffect(() => {
    fetchNews();
  }, []);

  // ✅ Fetch news
  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await newsService.getAllNews();
      setNews(data);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching news:', err);
      setError(err.message || 'Error loading news');
      showSnackbar(err.message || 'Error loading news', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handlers de menú
  const handleMenuOpen = (event, newsItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedNews(newsItem);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNews(null);
  };

  // ✅ Crear nueva noticia
  const handleCreateNew = () => {
    setEditingNews(null);
    setModalOpen(true);
  };

  // ✅ Editar noticia
  const handleEdit = () => {
    setEditingNews(selectedNews);
    setModalOpen(true);
    handleMenuClose();
  };

  // ✅ Ver noticia
  const handleView = () => {
    navigate(`/explore/news/${selectedNews._id}`);
    handleMenuClose();
  };

  // ✅ Abrir diálogo de confirmación
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // ✅ Eliminar noticia
  const handleDelete = async () => {
    try {
      await newsService.deleteNews(selectedNews._id);
      showSnackbar('News deleted successfully', 'success');
      fetchNews();
      setDeleteDialogOpen(false);
      setSelectedNews(null);
    } catch (err) {
      showSnackbar(err.message || 'Error deleting news', 'error');
    }
  };

  // ✅ Guardar noticia (crear o actualizar)
  const handleSubmit = async (newsData) => {
    try {
      if (editingNews) {
        await newsService.updateNews(editingNews._id, newsData);
        showSnackbar('News updated successfully', 'success');
      } else {
        await newsService.createNews(newsData);
        showSnackbar('News created successfully', 'success');
      }
      
      fetchNews();
      setModalOpen(false);
      setEditingNews(null);
    } catch (err) {
      showSnackbar(err.message || 'Error saving news', 'error');
    }
  };

  // ✅ Snackbar helper
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // ✅ Obtener colores - Brandbook
  const getCategoryColor = (category) => {
    switch (category) {
      case 'construction': return '#E5863C';
      case 'announcement': return '#8CA551';
      case 'report': return '#333F1F';
      case 'event': return '#8CA551';
      default: return '#706f6f';
    }
  };

  const getStatusColor = (status) => {
    return status === 'published' ? 'success' : 'warning';
  };

  // ✅ Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} sx={{ color: '#8CA551' }} />
      </Box>
    );
  }

  // ✅ Error state
  if (error && news.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 3,
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={fetchNews}
          sx={{
            borderRadius: 3,
            bgcolor: '#333F1F',
            color: 'white',
            fontWeight: 600,
            textTransform: 'none',
            fontFamily: '"Poppins", sans-serif',
            px: 3,
            py: 1.2,
            '&:hover': {
              bgcolor: '#8CA551'
            }
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* ✅ HEADER - Brandbook */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color: '#333F1F',
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: '-0.5px',
              mb: 0.5
            }}
          >
            News & Updates
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            Manage project updates and announcements ({news.length} total)
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateNew}
          sx={{
            borderRadius: 3,
            bgcolor: '#333F1F',
            color: 'white',
            fontWeight: 600,
            textTransform: 'none',
            letterSpacing: '1px',
            fontFamily: '"Poppins", sans-serif',
            px: 4,
            py: 1.5,
            boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              bgcolor: '#8CA551',
              transition: 'left 0.4s ease',
              zIndex: 0,
            },
            '&:hover': {
              bgcolor: '#333F1F',
              boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
              '&::before': {
                left: 0,
              },
            },
            '& .MuiButton-startIcon': {
              position: 'relative',
              zIndex: 1,
            }
          }}
        >
          <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
            Create News
          </Box>
        </Button>
      </Box>

      {/* ✅ TABLE - Brandbook */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            boxShadow: '0 8px 24px rgba(51, 63, 31, 0.08)',
            border: '1px solid #e0e0e0'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  News
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  Category
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  Status
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  Date
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  Tags
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {news.map((newsItem) => (
                <TableRow
                  key={newsItem._id}
                  sx={{
                    '&:hover': { 
                      bgcolor: 'rgba(140, 165, 81, 0.04)'
                    },
                    transition: 'background 0.2s'
                  }}
                >
                  {/* NEWS INFO */}
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      {newsItem.heroImage ? (
                        <Avatar
                          src={newsItem.heroImage}
                          variant="rounded"
                          sx={{ 
                            width: 56, 
                            height: 56, 
                            borderRadius: 2,
                            border: '1px solid #e0e0e0'
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: '#fafafa',
                            border: '1px solid #e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Article sx={{ color: '#706f6f', fontSize: 24 }} />
                        </Box>
                      )}
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{ 
                            color: '#333F1F', 
                            mb: 0.5,
                            fontFamily: '"Poppins", sans-serif'
                          }}
                        >
                          {newsItem.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#706f6f',
                            fontFamily: '"Poppins", sans-serif',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {newsItem.description || 'No description'}
                        </Typography>
                        {newsItem.videos && newsItem.videos.length > 0 && (
                          <Chip
                            label="📹 Video"
                            size="small"
                            sx={{
                              mt: 0.5,
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: 'rgba(229, 134, 60, 0.12)',
                              color: '#E5863C',
                              border: '1px solid rgba(229, 134, 60, 0.3)',
                              fontWeight: 600,
                              fontFamily: '"Poppins", sans-serif'
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  {/* CATEGORY */}
                  <TableCell>
                    <Chip
                      label={newsItem.category}
                      size="small"
                      sx={{
                        bgcolor: `${getCategoryColor(newsItem.category)}20`,
                        color: getCategoryColor(newsItem.category),
                        border: `1px solid ${getCategoryColor(newsItem.category)}40`,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    />
                  </TableCell>

                  {/* STATUS */}
                  <TableCell>
                    <Chip
                      label={newsItem.status}
                      color={getStatusColor(newsItem.status)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    />
                  </TableCell>

                  {/* DATE */}
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#706f6f',
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    >
                      {new Date(newsItem.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>

                  {/* TAGS */}
                  <TableCell>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {newsItem.tags?.slice(0, 2).map((tag, idx) => (
                        <Chip
                          key={idx}
                          label={tag}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            bgcolor: '#fafafa',
                            border: '1px solid #e0e0e0',
                            fontFamily: '"Poppins", sans-serif'
                          }}
                        />
                      ))}
                      {newsItem.tags?.length > 2 && (
                        <Chip
                          label={`+${newsItem.tags.length - 2}`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            bgcolor: 'rgba(140, 165, 81, 0.12)',
                            color: '#8CA551',
                            border: '1px solid rgba(140, 165, 81, 0.3)',
                            fontWeight: 600,
                            fontFamily: '"Poppins", sans-serif'
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, newsItem)}
                      sx={{ 
                        color: '#706f6f',
                        '&:hover': {
                          bgcolor: 'rgba(112, 111, 111, 0.08)'
                        }
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {/* ✅ Empty State */}
              {news.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box textAlign="center" py={5}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 3,
                          bgcolor: '#fafafa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          mb: 2
                        }}
                      >
                        <Article sx={{ fontSize: 32, color: '#706f6f' }} />
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: '#333F1F',
                          fontFamily: '"Poppins", sans-serif',
                          fontWeight: 600,
                          mb: 1
                        }}
                      >
                        No news articles yet
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#706f6f',
                          fontFamily: '"Poppins", sans-serif',
                          mb: 3
                        }}
                      >
                        Create your first news article to get started
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleCreateNew}
                        sx={{
                          borderRadius: 3,
                          bgcolor: '#333F1F',
                          color: 'white',
                          fontWeight: 600,
                          textTransform: 'none',
                          fontFamily: '"Poppins", sans-serif',
                          px: 3,
                          py: 1.2,
                          '&:hover': {
                            bgcolor: '#8CA551'
                          }
                        }}
                      >
                        Create News
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>

      {/* ✅ MENU DE ACCIONES - Brandbook */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(51, 63, 31, 0.12)',
            border: '1px solid #e0e0e0',
            mt: 1
          }
        }}
      >
        <MenuItem 
          onClick={handleView} 
          sx={{ 
            gap: 1.5,
            fontFamily: '"Poppins", sans-serif',
            '&:hover': {
              bgcolor: 'rgba(140, 165, 81, 0.08)'
            }
          }}
        >
          <Visibility sx={{ fontSize: 20, color: '#8CA551' }} />
          <Typography sx={{ fontFamily: '"Poppins", sans-serif' }}>View</Typography>
        </MenuItem>
        <MenuItem 
          onClick={handleEdit} 
          sx={{ 
            gap: 1.5,
            fontFamily: '"Poppins", sans-serif',
            '&:hover': {
              bgcolor: 'rgba(229, 134, 60, 0.08)'
            }
          }}
        >
          <Edit sx={{ fontSize: 20, color: '#E5863C' }} />
          <Typography sx={{ fontFamily: '"Poppins", sans-serif' }}>Edit</Typography>
        </MenuItem>
        <MenuItem 
          onClick={handleDeleteClick} 
          sx={{ 
            gap: 1.5,
            color: '#d32f2f',
            fontFamily: '"Poppins", sans-serif',
            '&:hover': {
              bgcolor: 'rgba(211, 47, 47, 0.08)'
            }
          }}
        >
          <Delete sx={{ fontSize: 20 }} />
          <Typography sx={{ fontFamily: '"Poppins", sans-serif' }}>Delete</Typography>
        </MenuItem>
      </Menu>

      {/* ✅ MODAL DE CREAR/EDITAR */}
      <NewsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingNews(null);
        }}
        newsData={editingNews}
        onSubmit={handleSubmit}
      />

      {/* ✅ DIALOG DE CONFIRMACIÓN - Brandbook exacto */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { 
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(51, 63, 31, 0.15)'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: 'rgba(211, 47, 47, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(211, 47, 47, 0.3)'
              }}
            >
              <Warning sx={{ color: '#d32f2f', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                fontWeight={700}
                sx={{ 
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                Delete News Article?
              </Typography>
              <Typography 
                variant="caption"
                sx={{ 
                  color: '#706f6f',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                This action cannot be undone
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            Are you sure you want to delete <strong>"{selectedNews?.title}"</strong>? This will permanently remove the article and all its associated data.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.2,
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif',
              border: '2px solid #e0e0e0',
              '&:hover': {
                bgcolor: 'rgba(112, 111, 111, 0.05)',
                borderColor: '#706f6f'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              borderRadius: 3,
              bgcolor: '#d32f2f',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: '"Poppins", sans-serif',
              px: 4,
              py: 1.5,
              boxShadow: '0 4px 12px rgba(211, 47, 47, 0.25)',
              '&:hover': {
                bgcolor: '#b71c1c',
                boxShadow: '0 8px 20px rgba(211, 47, 47, 0.35)'
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ SNACKBAR - Brandbook */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ 
            width: '100%', 
            borderRadius: 3,
            fontFamily: '"Poppins", sans-serif',
            boxShadow: '0 8px 24px rgba(51, 63, 31, 0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewsTable;