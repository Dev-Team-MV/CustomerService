// import React, { useState } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
//   Box,
//   Typography,
//   MenuItem,
//   IconButton,
//   Grid,
//   Chip,
//   Avatar
// } from '@mui/material';
// import {
//   Close,
//   CloudUpload,
//   Image as ImageIcon,
//   VideoLibrary
// } from '@mui/icons-material';
// import { motion } from 'framer-motion';

// const NewsModal = ({ open, onClose, newsData = null, onSubmit }) => {
//   const [formData, setFormData] = useState({
//     title: newsData?.title || '',
//     description: newsData?.description || '',
//     category: newsData?.category || 'announcement',
//     status: newsData?.status || 'draft',
//     content: newsData?.content || ''
//   });

//   const [images, setImages] = useState([]);
//   const [videos, setVideos] = useState([]);

//   const handleSubmit = () => {
//     console.log('📤 Submitting news:', { ...formData, images, videos });
//     onSubmit({ ...formData, images, videos });
//     onClose();
//   };

//   const handleImageUpload = (event) => {
//     const files = Array.from(event.target.files);
//     setImages([...images, ...files.map(f => URL.createObjectURL(f))]);
//   };

//   const handleVideoUpload = (event) => {
//     const files = Array.from(event.target.files);
//     setVideos([...videos, ...files.map(f => URL.createObjectURL(f))]);
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="md"
//       fullWidth
//       PaperProps={{
//         sx: {
//           borderRadius: 4,
//           boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
//         }
//       }}
//     >
//       {/* ✅ HEADER */}
//       <DialogTitle>
//         <Box display="flex" justifyContent="space-between" alignItems="center">
//           <Box display="flex" alignItems="center" gap={2}>
//             <Box
//               sx={{
//                 width: 48,
//                 height: 48,
//                 borderRadius: 3,
//                 background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center'
//               }}
//             >
//               <Typography fontSize="1.5rem">🆕</Typography>
//             </Box>
//             <Box>
//               <Typography variant="h6" fontWeight={700}>
//                 {newsData ? 'Edit News' : 'Create New News'}
//               </Typography>
//               <Typography variant="caption" sx={{ color: '#6c757d' }}>
//                 Share updates with property owners
//               </Typography>
//             </Box>
//           </Box>
//           <IconButton onClick={onClose}>
//             <Close />
//           </IconButton>
//         </Box>
//       </DialogTitle>

//       {/* ✅ FORM */}
//       <DialogContent sx={{ pt: 3 }}>
//         <Grid container spacing={3}>
//           {/* TITLE */}
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label="News Title"
//               placeholder="e.g., Club House Construction Begins"
//               value={formData.title}
//               onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//               required
//               sx={{
//                 '& .MuiOutlinedInput-root': {
//                   borderRadius: 3,
//                   '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
//                 }
//               }}
//             />
//           </Grid>

//           {/* CATEGORY & STATUS */}
//           <Grid item xs={12} sm={6}>
//             <TextField
//               fullWidth
//               select
//               label="Category"
//               value={formData.category}
//               onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//               sx={{
//                 '& .MuiOutlinedInput-root': {
//                   borderRadius: 3,
//                   '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
//                 }
//               }}
//             >
//               <MenuItem value="announcement">📢 Announcement</MenuItem>
//               <MenuItem value="construction">🏗️ Construction</MenuItem>
//               <MenuItem value="report">📊 Report</MenuItem>
//               <MenuItem value="event">🎉 Event</MenuItem>
//             </TextField>
//           </Grid>

//           <Grid item xs={12} sm={6}>
//             <TextField
//               fullWidth
//               select
//               label="Status"
//               value={formData.status}
//               onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//               sx={{
//                 '& .MuiOutlinedInput-root': {
//                   borderRadius: 3,
//                   '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
//                 }
//               }}
//             >
//               <MenuItem value="draft">📝 Draft</MenuItem>
//               <MenuItem value="published">✅ Published</MenuItem>
//             </TextField>
//           </Grid>

//           {/* DESCRIPTION */}
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label="Short Description"
//               placeholder="Brief summary for preview..."
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               multiline
//               rows={2}
//               sx={{
//                 '& .MuiOutlinedInput-root': {
//                   borderRadius: 3,
//                   '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
//                 }
//               }}
//             />
//           </Grid>

//           {/* CONTENT */}
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label="Full Content"
//               placeholder="Write the full news content here..."
//               value={formData.content}
//               onChange={(e) => setFormData({ ...formData, content: e.target.value })}
//               multiline
//               rows={6}
//               sx={{
//                 '& .MuiOutlinedInput-root': {
//                   borderRadius: 3,
//                   '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
//                 }
//               }}
//             />
//           </Grid>

//           {/* IMAGES UPLOAD */}
//           <Grid item xs={12}>
//             <Box>
//               <Typography variant="body2" fontWeight={600} mb={1}>
//                 Images
//               </Typography>
//               <Button
//                 variant="outlined"
//                 component="label"
//                 startIcon={<ImageIcon />}
//                 sx={{
//                   borderRadius: 3,
//                   textTransform: 'none',
//                   borderStyle: 'dashed',
//                   borderWidth: 2,
//                   py: 2,
//                   width: '100%',
//                   color: '#6c757d',
//                   borderColor: '#dee2e6'
//                 }}
//               >
//                 Upload Images
//                 <input
//                   type="file"
//                   hidden
//                   multiple
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                 />
//               </Button>

//               {/* IMAGE PREVIEW */}
//               {images.length > 0 && (
//                 <Box display="flex" gap={1} mt={2} flexWrap="wrap">
//                   {images.map((img, idx) => (
//                     <Avatar
//                       key={idx}
//                       src={img}
//                       variant="rounded"
//                       sx={{ width: 80, height: 80 }}
//                     />
//                   ))}
//                 </Box>
//               )}
//             </Box>
//           </Grid>

//           {/* VIDEOS UPLOAD */}
//           <Grid item xs={12}>
//             <Box>
//               <Typography variant="body2" fontWeight={600} mb={1}>
//                 Videos
//               </Typography>
//               <Button
//                 variant="outlined"
//                 component="label"
//                 startIcon={<VideoLibrary />}
//                 sx={{
//                   borderRadius: 3,
//                   textTransform: 'none',
//                   borderStyle: 'dashed',
//                   borderWidth: 2,
//                   py: 2,
//                   width: '100%',
//                   color: '#6c757d',
//                   borderColor: '#dee2e6'
//                 }}
//               >
//                 Upload Videos
//                 <input
//                   type="file"
//                   hidden
//                   multiple
//                   accept="video/*"
//                   onChange={handleVideoUpload}
//                 />
//               </Button>

//               {/* VIDEO PREVIEW */}
//               {videos.length > 0 && (
//                 <Box mt={2}>
//                   {videos.map((video, idx) => (
//                     <Chip
//                       key={idx}
//                       label={`Video ${idx + 1}`}
//                       icon={<VideoLibrary />}
//                       sx={{ mr: 1, mb: 1 }}
//                     />
//                   ))}
//                 </Box>
//               )}
//             </Box>
//           </Grid>
//         </Grid>
//       </DialogContent>

//       {/* ✅ ACTIONS */}
//       <DialogActions sx={{ p: 3, gap: 2 }}>
//         <Button
//           onClick={onClose}
//           sx={{
//             borderRadius: 3,
//             textTransform: 'none',
//             fontWeight: 600,
//             px: 3
//           }}
//         >
//           Cancel
//         </Button>

//         <Button
//           onClick={handleSubmit}
//           variant="contained"
//           disabled={!formData.title || !formData.description}
//           sx={{
//             borderRadius: 3,
//             background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
//             color: 'white',
//             fontWeight: 700,
//             textTransform: 'none',
//             px: 4,
//             py: 1.5,
//             boxShadow: '0 8px 20px rgba(245,158,11,0.3)',
//             '&:hover': {
//               background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
//               boxShadow: '0 12px 28px rgba(245,158,11,0.4)'
//             },
//             '&:disabled': { background: '#ccc' }
//           }}
//         >
//           {newsData ? 'Update News' : 'Publish News'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default NewsModal;

import React, { useState } from 'react';
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
  FormControl
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
  List as ListIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const NewsModal = ({ open, onClose, newsData = null, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: newsData?.title || '',
    description: newsData?.description || '',
    category: newsData?.category || 'announcement',
    status: newsData?.status || 'draft',
    heroImage: newsData?.heroImage || null,
    tags: newsData?.tags || []
  });

  const [contentBlocks, setContentBlocks] = useState(newsData?.contentBlocks || []);
  const [images, setImages] = useState(newsData?.images || []);
  const [videos, setVideos] = useState(newsData?.videos || []);
  const [tagInput, setTagInput] = useState('');

  // ✅ Drag & Drop handler
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(contentBlocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setContentBlocks(items);
  };

  // ✅ Agregar nuevo bloque de contenido
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

  // ✅ Actualizar bloque
  const updateBlock = (id, updates) => {
    setContentBlocks(contentBlocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  // ✅ Eliminar bloque
  const deleteBlock = (id) => {
    setContentBlocks(contentBlocks.filter(block => block.id !== id));
  };

  // ✅ Agregar item a lista
  const addListItem = (blockId) => {
    setContentBlocks(contentBlocks.map(block => {
      if (block.id === blockId && block.type === 'list') {
        return { ...block, items: [...block.items, ''] };
      }
      return block;
    }));
  };

  // ✅ Actualizar item de lista
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

  // ✅ Eliminar item de lista
  const deleteListItem = (blockId, itemIndex) => {
    setContentBlocks(contentBlocks.map(block => {
      if (block.id === blockId && block.type === 'list') {
        return { ...block, items: block.items.filter((_, idx) => idx !== itemIndex) };
      }
      return block;
    }));
  };

  // ✅ Upload de hero image
  const handleHeroImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({ ...formData, heroImage: URL.createObjectURL(file) });
    }
  };

  // ✅ Upload de imágenes adicionales
  const handleImagesUpload = (event) => {
    const files = Array.from(event.target.files);
    setImages([...images, ...files.map(f => URL.createObjectURL(f))]);
  };

  // ✅ Upload de videos
  const handleVideosUpload = (event) => {
    const files = Array.from(event.target.files);
    setVideos([...videos, ...files.map(f => ({ url: URL.createObjectURL(f), title: f.name }))]);
  };

  // ✅ Agregar tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  // ✅ Eliminar tag
  const deleteTag = (tagToDelete) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToDelete) });
  };

  const handleSubmit = () => {
    const newsPayload = {
      ...formData,
      contentBlocks,
      images,
      videos
    };
    console.log('📤 Submitting news:', newsPayload);
    onSubmit(newsPayload);
    onClose();
  };

  // ✅ Renderizar editor de bloques
  const renderBlockEditor = (block) => {
    switch (block.type) {
      case 'heading':
        return (
          <Box>
            <Box display="flex" gap={2} mb={1}>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={block.level}
                  onChange={(e) => updateBlock(block.id, { level: e.target.value })}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value={2}>H2</MenuItem>
                  <MenuItem value={3}>H3</MenuItem>
                  <MenuItem value={4}>H4</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                size="small"
                placeholder="Heading text..."
                value={block.text}
                onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
            placeholder="Paragraph text..."
            value={block.text}
            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="unordered">• Bullets</MenuItem>
                  <MenuItem value="ordered">1. Numbered</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {block.items.map((item, idx) => (
              <Box key={idx} display="flex" gap={1} mb={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={`Item ${idx + 1}...`}
                  value={item}
                  onChange={(e) => updateListItem(block.id, idx, e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <IconButton 
                  size="small" 
                  onClick={() => deleteListItem(block.id, idx)}
                  sx={{ color: '#dc3545' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button
              size="small"
              startIcon={<Add />}
              onClick={() => addListItem(block.id)}
              sx={{ textTransform: 'none', color: '#4a7c59' }}
            >
              Add Item
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
              placeholder="Quote text..."
              value={block.text}
              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
              sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              size="small"
              placeholder="Author (optional)..."
              value={block.author || ''}
              onChange={(e) => updateBlock(block.id, { author: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          maxHeight: '90vh'
        }
      }}
    >
      {/* HEADER */}
      <DialogTitle sx={{ borderBottom: '1px solid #e5e7eb' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography fontSize="1.5rem">📰</Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {newsData ? 'Edit News Article' : 'Create News Article'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6c757d' }}>
                Build your article with content blocks
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* CONTENT */}
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* LEFT COLUMN - Basic Info */}
          <Grid item xs={12} md={8}>
            {/* HERO IMAGE */}
            <Box mb={3}>
              <Typography variant="body2" fontWeight={600} mb={1}>
                Hero Image *
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  py: 2,
                  width: '100%',
                  color: '#6c757d',
                  borderColor: '#dee2e6'
                }}
              >
                {formData.heroImage ? 'Change Hero Image' : 'Upload Hero Image'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleHeroImageUpload}
                />
              </Button>
              {formData.heroImage && (
                <Box
                  component="img"
                  src={formData.heroImage}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 3,
                    mt: 2
                  }}
                />
              )}
            </Box>

            {/* TITLE */}
            <TextField
              fullWidth
              label="Article Title"
              placeholder="e.g., Club House Construction Begins"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
                }
              }}
            />

            {/* DESCRIPTION */}
            <TextField
              fullWidth
              label="Short Description"
              placeholder="Brief summary for preview (max 200 characters)..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              inputProps={{ maxLength: 200 }}
              helperText={`${formData.description.length}/200 characters`}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
                }
              }}
            />

            <Divider sx={{ my: 3 }} />

            {/* CONTENT BLOCKS */}
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>
                  Article Content
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {contentBlocks.length} blocks
                </Typography>
              </Box>

              {/* BLOCK TOOLBAR */}
              <Box
                display="flex"
                gap={1}
                mb={3}
                p={2}
                sx={{
                  bgcolor: '#f8f9fa',
                  borderRadius: 3,
                  border: '1px solid #e5e7eb',
                  flexWrap: 'wrap'
                }}
              >
                <Button
                  size="small"
                  startIcon={<Title />}
                  onClick={() => addContentBlock('heading')}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Heading
                </Button>
                <Button
                  size="small"
                  startIcon={<TextFields />}
                  onClick={() => addContentBlock('paragraph')}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Paragraph
                </Button>
                <Button
                  size="small"
                  startIcon={<ListIcon />}
                  onClick={() => addContentBlock('list')}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  List
                </Button>
                <Button
                  size="small"
                  startIcon={<FormatQuote />}
                  onClick={() => addContentBlock('quote')}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Quote
                </Button>
              </Box>

              
              {/* ✅ DRAG & DROP CONTENT BLOCKS - CORREGIDO */}
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="contentBlocks">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        backgroundColor: snapshot.isDraggingOver ? '#f0f9ff' : 'transparent',
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
                                  border: snapshot.isDragging ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                  bgcolor: snapshot.isDragging ? '#f0f9ff' : '#ffffff',
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
                                      <DragIndicator sx={{ color: '#94a3b8', fontSize: 24 }} />
                                    </div>
                                    <Chip
                                      label={block.type}
                                      size="small"
                                      sx={{
                                        bgcolor: '#f1f5f9',
                                        color: '#64748b',
                                        fontWeight: 600,
                                        textTransform: 'capitalize'
                                      }}
                                    />
                                  </Box>
                                  <IconButton
                                    size="small"
                                    onClick={() => deleteBlock(block.id)}
                                    sx={{ color: '#dc3545' }}
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
                            bgcolor: '#f8f9fa',
                            borderRadius: 3,
                            border: '2px dashed #dee2e6'
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Click buttons above to add content blocks
                          </Typography>
                        </Box>
                      )}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Box>
          </Grid>

          {/* RIGHT COLUMN - Metadata */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #e5e7eb',
                position: 'sticky',
                top: 20
              }}
            >
              <Typography variant="h6" fontWeight={700} mb={3}>
                Article Settings
              </Typography>

              {/* CATEGORY */}
              <TextField
                fullWidth
                select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
                  }
                }}
              >
                <MenuItem value="announcement">📢 Announcement</MenuItem>
                <MenuItem value="construction">🏗️ Construction</MenuItem>
                <MenuItem value="report">📊 Report</MenuItem>
                <MenuItem value="event">🎉 Event</MenuItem>
              </TextField>

              {/* STATUS */}
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
                  }
                }}
              >
                <MenuItem value="draft">📝 Draft</MenuItem>
                <MenuItem value="published">✅ Published</MenuItem>
              </TextField>

              <Divider sx={{ my: 3 }} />

              {/* TAGS */}
              <Box mb={3}>
                <Typography variant="body2" fontWeight={600} mb={1}>
                  Tags
                </Typography>
                <Box display="flex" gap={1} mb={1}>
                  <TextField
                    size="small"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': { borderRadius: 2 }
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={addTag}
                    sx={{ borderRadius: 2 }}
                  >
                    Add
                  </Button>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {formData.tags.map((tag, idx) => (
                    <Chip
                      key={idx}
                      label={tag}
                      onDelete={() => deleteTag(tag)}
                      size="small"
                      sx={{ bgcolor: '#e3f2fd', color: '#2196f3' }}
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* ADDITIONAL IMAGES */}
              <Box mb={3}>
                <Typography variant="body2" fontWeight={600} mb={1}>
                  Gallery Images
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    width: '100%'
                  }}
                >
                  Upload Images
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImagesUpload}
                  />
                </Button>
                {images.length > 0 && (
                  <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                    {images.map((img, idx) => (
                      <Avatar
                        key={idx}
                        src={img}
                        variant="rounded"
                        sx={{ width: 60, height: 60 }}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              {/* VIDEOS */}
              <Box>
                <Typography variant="body2" fontWeight={600} mb={1}>
                  Videos
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<VideoLibrary />}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    width: '100%'
                  }}
                >
                  Upload Videos
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="video/*"
                    onChange={handleVideosUpload}
                  />
                </Button>
                {videos.length > 0 && (
                  <Box mt={2}>
                    {videos.map((video, idx) => (
                      <Chip
                        key={idx}
                        label={`Video ${idx + 1}`}
                        icon={<VideoLibrary />}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      {/* ACTIONS */}
      <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e7eb', gap: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            px: 3
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.title || !formData.description || !formData.heroImage}
          sx={{
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            color: 'white',
            fontWeight: 700,
            textTransform: 'none',
            px: 4,
            py: 1.5,
            boxShadow: '0 8px 20px rgba(245,158,11,0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
              boxShadow: '0 12px 28px rgba(245,158,11,0.4)'
            },
            '&:disabled': { background: '#ccc', boxShadow: 'none' }
          }}
        >
          {newsData ? 'Update Article' : 'Publish Article'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewsModal;