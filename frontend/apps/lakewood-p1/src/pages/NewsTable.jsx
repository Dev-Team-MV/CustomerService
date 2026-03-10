import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Button,
  Alert,
  Snackbar,
  Tooltip
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Add,
  Warning,
  Article,
  Newspaper,
  Schedule,
  CheckCircle,
  Announcement
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import NewsModal from '../components/news/NewsModal';
import newsService from '../services/newsService';
import PageHeader from '@shared/components/PageHeader';
import StatsCards from '../components/statscard';
import DataTable from '../components/table/DataTable';
import EmptyState from '../components/table/EmptyState';
import { useTranslation } from 'react-i18next';

const NewsTable = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['news', 'common']);

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await newsService.getAllNews();
      setNews(data);
    } catch (err) {
      console.error('❌ Error fetching news:', err);
      showSnackbar(t('news:errorLoadingNews'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = useCallback(() => {
    setEditingNews(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((newsItem) => {
    setEditingNews(newsItem);
    setModalOpen(true);
  }, []);

  const handleView = useCallback((newsItem) => {
    navigate(`/explore/news/${newsItem._id}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((newsItem) => {
    setSelectedNews(newsItem);
    setDeleteDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    try {
      await newsService.deleteNews(selectedNews._id);
      showSnackbar(t('news:newsDeleted'), 'success');
      fetchNews();
      setDeleteDialogOpen(false);
      setSelectedNews(null);
    } catch (err) {
      showSnackbar(t('news:errorDeletingNews'), 'error');
    }
  }, [selectedNews, t]);

  const handleSubmit = useCallback(async (newsData) => {
    try {
      if (editingNews) {
        await newsService.updateNews(editingNews._id, newsData);
        showSnackbar(t('news:newsUpdated'), 'success');
      } else {
        await newsService.createNews(newsData);
        showSnackbar(t('news:newsCreated'), 'success');
      }
      fetchNews();
      setModalOpen(false);
      setEditingNews(null);
    } catch (err) {
      showSnackbar(t('news:errorSavingNews'), 'error');
    }
  }, [editingNews, t]);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const getCategoryColor = useCallback((category) => {
    switch (category) {
      case 'construction':
        return { bg: 'rgba(229, 134, 60, 0.12)', color: '#E5863C', border: 'rgba(229, 134, 60, 0.3)' }
      case 'announcement':
        return { bg: 'rgba(140, 165, 81, 0.12)', color: '#8CA551', border: 'rgba(140, 165, 81, 0.3)' }
      case 'report':
        return { bg: 'rgba(51, 63, 31, 0.12)', color: '#333F1F', border: 'rgba(51, 63, 31, 0.3)' }
      case 'event':
        return { bg: 'rgba(33, 150, 243, 0.12)', color: '#1976d2', border: 'rgba(33, 150, 243, 0.3)' }
      default:
        return { bg: 'rgba(112, 111, 111, 0.12)', color: '#706f6f', border: 'rgba(112, 111, 111, 0.3)' }
    }
  }, []);

  const getStatusColor = useCallback((status) => {
    if (status === 'published') {
      return { bg: 'rgba(140, 165, 81, 0.12)', color: '#333F1F', border: 'rgba(140, 165, 81, 0.3)' }
    }
    return { bg: 'rgba(229, 134, 60, 0.12)', color: '#E5863C', border: 'rgba(229, 134, 60, 0.3)' }
  }, []);

  const stats = useMemo(() => ({
    total: news.length,
    published: news.filter(n => n.status === 'published').length,
    draft: news.filter(n => n.status === 'draft').length,
    construction: news.filter(n => n.category === 'construction').length
  }), [news]);

  const newsStats = useMemo(() => [
    {
      title: t('news:totalArticles'),
      value: stats.total,
      icon: Article,
      gradient: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)',
      color: '#333F1F',
      delay: 0
    },
    {
      title: t('news:published'),
      value: stats.published,
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #8CA551 0%, #a8bf6f 100%)',
      color: '#8CA551',
      delay: 0.1
    },
    {
      title: t('news:drafts'),
      value: stats.draft,
      icon: Schedule,
      gradient: 'linear-gradient(135deg, #E5863C 0%, #f59c5a 100%)',
      color: '#E5863C',
      delay: 0.2
    },
    {
      title: t('news:construction'),
      value: stats.construction,
      icon: Announcement,
      gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
      color: '#1976d2',
      delay: 0.3
    }
  ], [stats, t]);

  const columns = useMemo(() => [
    {
      field: 'title',
      headerName: t('news:news'),
      minWidth: 300,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1.5}>
          {row.heroImage ? (
            <Avatar
              src={row.heroImage}
              variant="rounded"
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                border: '2px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
              }}
            />
          ) : (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(51, 63, 31, 0.08) 0%, rgba(140, 165, 81, 0.08) 100%)',
                border: '1px solid rgba(140, 165, 81, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Article sx={{ color: '#8CA551', fontSize: 24 }} />
            </Box>
          )}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#1a1a1a',
                fontFamily: '"Poppins", sans-serif',
                mb: 0.3,
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {row.title}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.7rem',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {row.description || t('news:noDescription')}
            </Typography>
            {row.videos && row.videos.length > 0 && (
              <Chip
                label={`📹 ${t('news:video')}`}
                size="small"
                sx={{
                  mt: 0.5,
                  height: 20,
                  fontSize: '0.65rem',
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
      )
    },
    {
      field: 'category',
      headerName: t('news:category'),
      minWidth: 130,
      renderCell: ({ row }) => {
        const categoryColors = getCategoryColor(row.category);
        return (
          <Chip
            label={t(`news:${row.category}`, row.category)}
            size="small"
            sx={{
              fontWeight: 600,
              fontFamily: '"Poppins", sans-serif',
              height: 28,
              px: 1.5,
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              borderRadius: 2,
              textTransform: 'capitalize',
              bgcolor: categoryColors.bg,
              color: categoryColors.color,
              border: `1px solid ${categoryColors.border}`
            }}
          />
        );
      }
    },
    {
      field: 'status',
      headerName: t('news:status'),
      minWidth: 120,
      renderCell: ({ row }) => {
        const statusColors = getStatusColor(row.status);
        return (
          <Chip
            label={t(`news:${row.status}`, row.status)}
            size="small"
            sx={{
              fontWeight: 600,
              fontFamily: '"Poppins", sans-serif',
              height: 28,
              px: 1.5,
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              borderRadius: 2,
              textTransform: 'capitalize',
              bgcolor: statusColors.bg,
              color: statusColors.color,
              border: `1px solid ${statusColors.border}`
            }}
          />
        );
      }
    },
    {
      field: 'createdAt',
      headerName: t('news:date'),
      minWidth: 120,
      renderCell: ({ value }) => (
        <Typography
          variant="body2"
          sx={{
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 500
          }}
        >
          {new Date(value).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'tags',
      headerName: t('news:tags'),
      minWidth: 200,
      renderCell: ({ row }) => (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {row.tags?.slice(0, 2).map((tag, idx) => (
            <Chip
              key={idx}
              label={tag}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.7rem',
                bgcolor: 'rgba(112, 111, 111, 0.08)',
                border: '1px solid rgba(112, 111, 111, 0.2)',
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 500
              }}
            />
          ))}
          {row.tags?.length > 2 && (
            <Chip
              label={`+${row.tags.length - 2}`}
              size="small"
              sx={{
                height: 24,
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
      )
    },
    {
      field: 'actions',
      headerName: t('news:actions'),
      align: 'center',
      minWidth: 150,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('news:view')} placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleView(row);
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
              <Visibility sx={{ fontSize: 18, color: '#8CA551' }} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={t('news:edit')} placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
              }}
              sx={{
                bgcolor: 'rgba(229, 134, 60, 0.08)',
                border: '1px solid rgba(229, 134, 60, 0.2)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#E5863C',
                  borderColor: '#E5863C',
                  transform: 'scale(1.1)',
                  '& .MuiSvgIcon-root': {
                    color: 'white'
                  }
                }
              }}
            >
              <Edit sx={{ fontSize: 18, color: '#E5863C' }} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={t('news:deleteAction')} placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row);
              }}
              sx={{
                bgcolor: 'rgba(211, 47, 47, 0.08)',
                border: '1px solid rgba(211, 47, 47, 0.2)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#d32f2f',
                  borderColor: '#d32f2f',
                  transform: 'scale(1.1)',
                  '& .MuiSvgIcon-root': {
                    color: 'white'
                  }
                }
              }}
            >
              <Delete sx={{ fontSize: 18, color: '#d32f2f' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [getCategoryColor, getStatusColor, handleView, handleEdit, handleDeleteClick, t]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <PageHeader
          icon={Newspaper}
          title={t('news:newsAndUpdates')}
          subtitle={t('news:manageUpdates')}
          actionButton={{
            label: t('news:createNews'),
            onClick: handleCreateNew,
            icon: <Add />,
            tooltip: t('news:createNews')
          }}
        />

        {/* Stats Cards */}
        <StatsCards stats={newsStats} loading={loading} />

        {/* Table */}
        <DataTable
          columns={columns}
          data={news}
          loading={loading}
          emptyState={
            <EmptyState
              icon={Article}
              title={t('news:noNewsArticlesYet')}
              description={t('news:createFirstNews')}
              actionLabel={t('news:createNews')}
              onAction={handleCreateNew}
            />
          }
          onRowClick={(row) => handleView(row)}
          stickyHeader
          maxHeight={600}
        />

        {/* Modal de Crear/Editar */}
        <NewsModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingNews(null);
          }}
          newsData={editingNews}
          onSubmit={handleSubmit}
        />

        {/* Dialog de Confirmación */}
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
                  {t('news:deleteNewsTitle')}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {t('news:deleteNewsSubtitle')}
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
              {t('news:deleteNewsConfirm', { title: selectedNews?.title })}
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
              {t('news:cancel')}
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
              {t('news:delete')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
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
      </Container>
    </Box>
  );
};

export default NewsTable;