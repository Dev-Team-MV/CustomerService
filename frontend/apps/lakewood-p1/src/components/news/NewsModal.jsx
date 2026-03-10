import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  IconButton,
  Grid,
  Chip,
  Avatar,
  Paper,
  Divider,
  Select,
  FormControl,
  CircularProgress
} from '@mui/material';
import {
  Close,
  Add,
  Delete,
  DragIndicator,
  Image as ImageIcon,
  VideoLibrary,
  FormatQuote,
  Title,
  TextFields,
  List as ListIcon,
  CloudUpload,
  CheckCircle,
  Article
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import uploadService from '../../services/uploadService';
import { useTranslation } from 'react-i18next';

const NewsModal = ({ open, onClose, newsData = null, onSubmit }) => {
  const { t } = useTranslation(['news', 'common']);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'announcement',
    status: 'draft',
    heroImage: null,
    tags: []
  });

  const [contentBlocks, setContentBlocks] = useState([]);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);

  useEffect(() => {
    if (open && newsData) {
      setFormData({
        title: newsData.title || '',
        description: newsData.description || '',
        category: newsData.category || 'announcement',
        status: newsData.status || 'draft',
        heroImage: newsData.heroImage || null,
        tags: newsData.tags || []
      });
      setContentBlocks(newsData.contentBlocks || []);
      setImages(newsData.images || []);
      setVideos(newsData.videos || []);
    } else if (open && !newsData) {
      resetForm();
    }
  }, [open, newsData]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'announcement',
      status: 'draft',
      heroImage: null,
      tags: []
    });
    setContentBlocks([]);
    setImages([]);
    setVideos([]);
    setTagInput('');
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(contentBlocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setContentBlocks(items);
  };

  const addContentBlock = (type) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      ...(type === 'heading' && { level: 2, text: '' }),
      ...(type === 'paragraph' && { text: '' }),
      ...(type === 'list' && { items: [''], ordered: false }),
      ...(type === 'quote' && { text: '', author: '' })
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const updateBlock = (id, updates) => {
    setContentBlocks(contentBlocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const deleteBlock = (id) => {
    setContentBlocks(contentBlocks.filter(block => block.id !== id));
  };

  const addListItem = (blockId) => {
    setContentBlocks(contentBlocks.map(block => {
      if (block.id === blockId && block.type === 'list') {
        return { ...block, items: [...block.items, ''] };
      }
      return block;
    }));
  };

  const updateListItem = (blockId, itemIndex, value) => {
    setContentBlocks(contentBlocks.map(block => {
      if (block.id === blockId && block.type === 'list') {
        const newItems = [...block.items];
        newItems[itemIndex] = value;
        return { ...block, items: newItems };
      }
      return block;
    }));
  };

  const deleteListItem = (blockId, itemIndex) => {
    setContentBlocks(contentBlocks.map(block => {
      if (block.id === blockId && block.type === 'list') {
        return { ...block, items: block.items.filter((_, idx) => idx !== itemIndex) };
      }
      return block;
    }));
  };

  const handleHeroImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      setUploadingHeroImage(true);
      const url = await uploadService.uploadImage(file, 'news/hero-images');
      setFormData({ ...formData, heroImage: url });
    } catch (error) {
      alert(t('news:errorUploadingHeroImage', 'Error uploading hero image. Please try again.'));
    } finally {
      setUploadingHeroImage(false);
    }
  };

  const handleImagesUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    try {
      setUploadingImages(true);
      const urls = await uploadService.uploadMultipleImages(files, 'news/gallery');
      setImages([...images, ...urls]);
    } catch (error) {
      alert(t('news:errorUploadingImages', 'Error uploading images. Please try again.'));
    } finally {
      setUploadingImages(false);
    }
  };

  const handleVideosUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    try {
      setUploadingVideos(true);
      const uploadPromises = files.map(file => uploadService.uploadImage(file, 'news/videos'));
      const urls = await Promise.all(uploadPromises);
      setVideos([...videos, ...urls]);
    } catch (error) {
      alert(t('news:errorUploadingVideos', 'Error uploading videos. Please try again.'));
    } finally {
      setUploadingVideos(false);
    }
  };

  const handleDeleteImage = (indexToDelete) => {
    setImages(images.filter((_, idx) => idx !== indexToDelete));
  };

  const handleDeleteVideo = (indexToDelete) => {
    setVideos(videos.filter((_, idx) => idx !== indexToDelete));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const deleteTag = (tagToDelete) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToDelete) });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert(t('news:requiredTitle', 'Title is required'));
      return;
    }
    if (!formData.description.trim()) {
      alert(t('news:requiredDescription', 'Description is required'));
      return;
    }
    if (!formData.heroImage) {
      alert(t('news:requiredHeroImage', 'Hero image is required'));
      return;
    }
    if (contentBlocks.length === 0) {
      alert(t('news:requiredBlock', 'Please add at least one content block'));
      return;
    }

    const newsPayload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      status: formData.status,
      heroImage: formData.heroImage,
      tags: formData.tags,
      contentBlocks: contentBlocks,
      images: images,
      videos: videos
    };

    onSubmit(newsPayload);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderBlockEditor = (block) => {
    const textFieldStyle = {
      '& .MuiOutlinedInput-root': {
        borderRadius: 3,
        fontFamily: '"Poppins", sans-serif',
        '& fieldset': {
          borderColor: 'rgba(140, 165, 81, 0.3)',
          borderWidth: '2px'
        },
        '&:hover fieldset': {
          borderColor: '#8CA551'
        },
        '&.Mui-focused fieldset': { 
          borderColor: '#333F1F',
          borderWidth: '2px'
        }
      }
    };

    switch (block.type) {
      case 'heading':
        return (
          <Box>
            <Box display="flex" gap={2} mb={1}>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={block.level}
                  onChange={(e) => updateBlock(block.id, { level: e.target.value })}
                  sx={{
                    borderRadius: 2,
                    fontFamily: '"Poppins", sans-serif',
                    '& fieldset': {
                      borderColor: 'rgba(140, 165, 81, 0.3)',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: '#8CA551'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#333F1F',
                      borderWidth: '2px'
                    }
                  }}
                >
                  <MenuItem value={2}>H2</MenuItem>
                  <MenuItem value={3}>H3</MenuItem>
                  <MenuItem value={4}>H4</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                size="small"
                placeholder={t('news:heading', 'Heading text...')}
                value={block.text}
                onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                sx={textFieldStyle}
              />
            </Box>
          </Box>
        );

      case 'paragraph':
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder={t('news:paragraph', 'Paragraph text...')}
            value={block.text}
            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
            sx={textFieldStyle}
          />
        );

      case 'list':
        return (
          <Box>
            <Box display="flex" gap={2} mb={1}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={block.ordered ? 'ordered' : 'unordered'}
                  onChange={(e) => updateBlock(block.id, { ordered: e.target.value === 'ordered' })}
                  sx={{
                    borderRadius: 2,
                    fontFamily: '"Poppins", sans-serif',
                    '& fieldset': {
                      borderColor: 'rgba(140, 165, 81, 0.3)',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: '#8CA551'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#333F1F',
                      borderWidth: '2px'
                    }
                  }}
                >
                  <MenuItem value="unordered">{t('news:list', '• Bullets')}</MenuItem>
                  <MenuItem value="ordered">{t('news:list', '1. Numbered')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {block.items.map((item, idx) => (
              <Box key={idx} display="flex" gap={1} mb={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={`${t('news:addItem', 'Item')} ${idx + 1}...`}
                  value={item}
                  onChange={(e) => updateListItem(block.id, idx, e.target.value)}
                  sx={textFieldStyle}
                />
                <IconButton 
                  size="small" 
                  onClick={() => deleteListItem(block.id, idx)}
                  sx={{ 
                    color: '#E5863C',
                    '&:hover': {
                      bgcolor: 'rgba(229, 134, 60, 0.08)'
                    }
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button
              size="small"
              startIcon={<Add />}
              onClick={() => addListItem(block.id)}
              sx={{ 
                textTransform: 'none', 
                color: '#8CA551',
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(140, 165, 81, 0.08)'
                }
              }}
            >
              {t('news:addItem', 'Add Item')}
            </Button>
          </Box>
        );

      case 'quote':
        return (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder={t('news:quote', 'Quote text...')}
              value={block.text}
              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
              sx={{ ...textFieldStyle, mb: 1 }}
            />
            <TextField
              fullWidth
              size="small"
              placeholder={t('news:quote', 'Author (optional)...')}
              value={block.author || ''}
              onChange={(e) => updateBlock(block.id, { author: e.target.value })}
              sx={textFieldStyle}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(51, 63, 31, 0.15)',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: '#333F1F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)',
              }}
            >
              <Article sx={{ color: 'white', fontSize: 24 }} />
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
                {newsData ? t('news:editNewsArticle') : t('news:createNewsArticle')}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#706f6f',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                {t('news:buildArticleBlocks')}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={handleClose}
            sx={{
              color: '#706f6f',
              '&:hover': {
                bgcolor: 'rgba(112, 111, 111, 0.08)',
                transform: 'scale(1.05)'
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box mb={3}>
              <Typography 
                variant="body2" 
                fontWeight={600} 
                mb={1}
                sx={{
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                {t('news:heroImage')} *
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={uploadingHeroImage ? <CircularProgress size={20} /> : <CloudUpload />}
                disabled={uploadingHeroImage}
                fullWidth
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  borderStyle: formData.heroImage ? 'solid' : 'dashed',
                  borderWidth: 2,
                  py: 2,
                  color: '#706f6f',
                  borderColor: formData.heroImage ? 'rgba(140, 165, 81, 0.3)' : '#e0e0e0',
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#8CA551',
                    bgcolor: 'rgba(140, 165, 81, 0.04)'
                  }
                }}
              >
                {uploadingHeroImage
                  ? t('news:uploading')
                  : (formData.heroImage
                    ? t('news:changeHeroImage')
                    : t('news:uploadHeroImage'))}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleHeroImageUpload}
                  disabled={uploadingHeroImage}
                />
              </Button>
              {formData.heroImage && (
                <Box sx={{ position: 'relative', mt: 2 }}>
                  <Box
                    component="img"
                    src={formData.heroImage}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 3,
                      border: '1px solid #e0e0e0'
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setFormData({ ...formData, heroImage: null })}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(229, 134, 60, 0.9)',
                      color: 'white',
                      '&:hover': { 
                        bgcolor: '#E5863C',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>

            <TextField
              fullWidth
              label={t('news:articleTitle')}
              placeholder={t('news:articleTitlePlaceholder')}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontFamily: '"Poppins", sans-serif',
                  '& fieldset': {
                    borderColor: 'rgba(140, 165, 81, 0.3)',
                    borderWidth: '2px'
                  },
                  '&:hover fieldset': {
                    borderColor: '#8CA551'
                  },
                  '&.Mui-focused fieldset': { 
                    borderColor: '#333F1F',
                    borderWidth: '2px'
                  }
                },
                '& .MuiInputLabel-root': {
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 500,
                  color: '#706f6f',
                  '&.Mui-focused': {
                    color: '#333F1F',
                    fontWeight: 600
                  }
                }
              }}
            />

            <TextField
              fullWidth
              label={t('news:shortDescription')}
              placeholder={t('news:shortDescriptionPlaceholder')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              inputProps={{ maxLength: 200 }}
              helperText={`${formData.description.length}/200 ${t('news:characters')}`}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontFamily: '"Poppins", sans-serif',
                  '& fieldset': {
                    borderColor: 'rgba(140, 165, 81, 0.3)',
                    borderWidth: '2px'
                  },
                  '&:hover fieldset': {
                    borderColor: '#8CA551'
                  },
                  '&.Mui-focused fieldset': { 
                    borderColor: '#333F1F',
                    borderWidth: '2px'
                  }
                },
                '& .MuiInputLabel-root': {
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 500,
                  color: '#706f6f',
                  '&.Mui-focused': {
                    color: '#333F1F',
                    fontWeight: 600
                  }
                },
                '& .MuiFormHelperText-root': {
                  fontFamily: '"Poppins", sans-serif'
                }
              }}
            />

            <Divider sx={{ my: 3 }} />

            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  sx={{
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {t('news:articleContent')}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {contentBlocks.length} {t('news:blocks')}
                </Typography>
              </Box>

              <Box
                display="flex"
                gap={1}
                mb={3}
                p={2}
                sx={{
                  bgcolor: '#fafafa',
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  flexWrap: 'wrap'
                }}
              >
                <Button
                  size="small"
                  startIcon={<Title />}
                  onClick={() => addContentBlock('heading')}
                  sx={{ 
                    textTransform: 'none', 
                    borderRadius: 2,
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    color: '#333F1F',
                    '&:hover': {
                      bgcolor: 'rgba(140, 165, 81, 0.08)'
                    }
                  }}
                >
                  {t('news:heading')}
                </Button>
                <Button
                  size="small"
                  startIcon={<TextFields />}
                  onClick={() => addContentBlock('paragraph')}
                  sx={{ 
                    textTransform: 'none', 
                    borderRadius: 2,
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    color: '#333F1F',
                    '&:hover': {
                      bgcolor: 'rgba(140, 165, 81, 0.08)'
                    }
                  }}
                >
                  {t('news:paragraph')}
                </Button>
                <Button
                  size="small"
                  startIcon={<ListIcon />}
                  onClick={() => addContentBlock('list')}
                  sx={{ 
                    textTransform: 'none', 
                    borderRadius: 2,
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    color: '#333F1F',
                    '&:hover': {
                      bgcolor: 'rgba(140, 165, 81, 0.08)'
                    }
                  }}
                >
                  {t('news:list')}
                </Button>
                <Button
                  size="small"
                  startIcon={<FormatQuote />}
                  onClick={() => addContentBlock('quote')}
                  sx={{ 
                    textTransform: 'none', 
                    borderRadius: 2,
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    color: '#333F1F',
                    '&:hover': {
                      bgcolor: 'rgba(140, 165, 81, 0.08)'
                    }
                  }}
                >
                  {t('news:quote')}
                </Button>
              </Box>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="contentBlocks">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        backgroundColor: snapshot.isDraggingOver ? 'rgba(140, 165, 81, 0.08)' : 'transparent',
                        borderRadius: '12px',
                        transition: 'background-color 0.2s',
                        minHeight: contentBlocks.length === 0 ? '100px' : 'auto',
                        padding: '4px'
                      }}
                    >
                      {contentBlocks.map((block, index) => (
                        <Draggable key={block.id} draggableId={block.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                marginBottom: '16px',
                                ...provided.draggableProps.style
                              }}
                            >
                              <Paper
                                elevation={snapshot.isDragging ? 8 : 0}
                                sx={{
                                  p: 2,
                                  borderRadius: 3,
                                  border: snapshot.isDragging ? '2px solid #8CA551' : '1px solid #e0e0e0',
                                  bgcolor: snapshot.isDragging ? 'rgba(140, 165, 81, 0.08)' : '#ffffff',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <div
                                      {...provided.dragHandleProps}
                                      style={{
                                        cursor: 'grab',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px',
                                        marginLeft: '-8px'
                                      }}
                                    >
                                      <DragIndicator sx={{ color: '#706f6f', fontSize: 24 }} />
                                    </div>
                                    <Chip
                                      label={t(`news:${block.type}`, block.type)}
                                      size="small"
                                      sx={{
                                        bgcolor: 'rgba(140, 165, 81, 0.12)',
                                        color: '#8CA551',
                                        border: '1px solid rgba(140, 165, 81, 0.3)',
                                        fontWeight: 600,
                                        textTransform: 'capitalize',
                                        fontFamily: '"Poppins", sans-serif'
                                      }}
                                    />
                                  </Box>
                                  <IconButton
                                    size="small"
                                    onClick={() => deleteBlock(block.id)}
                                    sx={{ 
                                      color: '#E5863C',
                                      '&:hover': {
                                        bgcolor: 'rgba(229, 134, 60, 0.08)'
                                      }
                                    }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Box>
                                {renderBlockEditor(block)}
                              </Paper>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {contentBlocks.length === 0 && (
                        <Box
                          sx={{
                            p: 4,
                            textAlign: 'center',
                            bgcolor: '#fafafa',
                            borderRadius: 3,
                            border: '2px dashed #e0e0e0'
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{
                              color: '#706f6f',
                              fontFamily: '"Poppins", sans-serif'
                            }}
                          >
                            {t('news:addContentBlocks')}
                          </Typography>
                        </Box>
                      )}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                position: 'sticky',
                top: 20,
                bgcolor: '#fafafa'
              }}
            >
              <Typography 
                variant="h6" 
                fontWeight={700} 
                mb={3}
                sx={{
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                {t('news:articleSettings')}
              </Typography>

              <TextField
                fullWidth
                select
                label={t('news:category')}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    fontFamily: '"Poppins", sans-serif',
                    bgcolor: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(140, 165, 81, 0.3)',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: '#8CA551'
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: '#333F1F',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    color: '#706f6f',
                    '&.Mui-focused': {
                      color: '#333F1F',
                      fontWeight: 600
                    }
                  }
                }}
              >
                <MenuItem value="announcement">📢 {t('news:announcement')}</MenuItem>
                <MenuItem value="construction">🏗️ {t('news:construction')}</MenuItem>
                <MenuItem value="report">📊 {t('news:report')}</MenuItem>
                <MenuItem value="event">🎉 {t('news:event')}</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label={t('news:status')}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    fontFamily: '"Poppins", sans-serif',
                    bgcolor: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(140, 165, 81, 0.3)',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: '#8CA551'
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: '#333F1F',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    color: '#706f6f',
                    '&.Mui-focused': {
                      color: '#333F1F',
                      fontWeight: 600
                    }
                  }
                }}
              >
                <MenuItem value="draft">📝 {t('news:draft')}</MenuItem>
                <MenuItem value="published">✅ {t('news:published')}</MenuItem>
              </TextField>

              <Divider sx={{ my: 3 }} />

              <Box mb={3}>
                <Typography 
                  variant="body2" 
                  fontWeight={600} 
                  mb={1}
                  sx={{
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {t('news:tags')}
                </Typography>
                <Box display="flex" gap={1} mb={1}>
                  <TextField
                    size="small"
                    placeholder={t('news:addTag')}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        fontFamily: '"Poppins", sans-serif',
                        bgcolor: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(140, 165, 81, 0.3)',
                          borderWidth: '2px'
                        },
                        '&:hover fieldset': {
                          borderColor: '#8CA551'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#333F1F',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={addTag}
                    sx={{ 
                      borderRadius: 2,
                      borderColor: 'rgba(140, 165, 81, 0.3)',
                      borderWidth: '2px',
                      color: '#333F1F',
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#8CA551',
                        borderWidth: '2px',
                        bgcolor: 'rgba(140, 165, 81, 0.08)'
                      }
                    }}
                  >
                    {t('news:addTag')}
                  </Button>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {formData.tags.map((tag, idx) => (
                    <Chip
                      key={idx}
                      label={tag}
                      onDelete={() => deleteTag(tag)}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(140, 165, 81, 0.12)', 
                        color: '#8CA551',
                        border: '1px solid rgba(140, 165, 81, 0.3)',
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 600
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box mb={3}>
                <Typography 
                  variant="body2" 
                  fontWeight={600} 
                  mb={1}
                  sx={{
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {t('news:galleryImages')}
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={uploadingImages ? <CircularProgress size={20} /> : <ImageIcon />}
                  disabled={uploadingImages}
                  size="small"
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    borderColor: 'rgba(140, 165, 81, 0.3)',
                    borderWidth: '2px',
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#8CA551',
                      borderWidth: '2px',
                      bgcolor: 'rgba(140, 165, 81, 0.08)'
                    }
                  }}
                >
                  {uploadingImages ? t('news:uploading') : t('news:uploadImages')}
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImagesUpload}
                    disabled={uploadingImages}
                  />
                </Button>
                {images.length > 0 && (
                  <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                    {images.map((img, idx) => (
                      <Box key={idx} sx={{ position: 'relative' }}>
                        <Avatar
                          src={img}
                          variant="rounded"
                          sx={{ width: 60, height: 60, border: '1px solid #e0e0e0' }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteImage(idx)}
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'rgba(229, 134, 60, 0.9)',
                            color: 'white',
                            width: 20,
                            height: 20,
                            '&:hover': { 
                              bgcolor: '#E5863C',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <Close sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              <Box>
                <Typography 
                  variant="body2" 
                  fontWeight={600} 
                  mb={1}
                  sx={{
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {t('news:videos')}
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={uploadingVideos ? <CircularProgress size={20} /> : <VideoLibrary />}
                  disabled={uploadingVideos}
                  size="small"
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    borderColor: 'rgba(140, 165, 81, 0.3)',
                    borderWidth: '2px',
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#8CA551',
                      borderWidth: '2px',
                      bgcolor: 'rgba(140, 165, 81, 0.08)'
                    }
                  }}
                >
                  {uploadingVideos ? t('news:uploading') : t('news:uploadVideos')}
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="video/*"
                    onChange={handleVideosUpload}
                    disabled={uploadingVideos}
                  />
                </Button>
                {videos.length > 0 && (
                  <Box mt={2}>
                    {videos.map((video, idx) => (
                      <Chip
                        key={idx}
                        label={`${t('news:video')} ${idx + 1}`}
                        icon={<VideoLibrary />}
                        onDelete={() => handleDeleteVideo(idx)}
                        size="small"
                        sx={{ 
                          mr: 1, 
                          mb: 1,
                          bgcolor: 'rgba(229, 134, 60, 0.12)',
                          color: '#E5863C',
                          border: '1px solid rgba(229, 134, 60, 0.3)',
                          fontFamily: '"Poppins", sans-serif',
                          fontWeight: 600
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0', gap: 2 }}>
        <Button
          onClick={handleClose}
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
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.title || !formData.description || !formData.heroImage || uploadingHeroImage || uploadingImages || uploadingVideos}
          startIcon={<CheckCircle />}
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
            '&:disabled': {
              bgcolor: '#e0e0e0',
              color: '#706f6f',
              boxShadow: 'none'
            },
            '& .MuiButton-startIcon': {
              position: 'relative',
              zIndex: 1,
            }
          }}
        >
          <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
            {newsData ? t('news:updateArticle') : t('news:publishArticle')}
          </Box>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewsModal;