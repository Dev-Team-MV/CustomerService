// @shared/components/News/NewsModal.jsx
import {
  TextField, Button, Box, Typography, MenuItem,
  IconButton, Grid, Chip, Avatar, Paper, Divider,
  CircularProgress
} from '@mui/material'
import {
  Close, Add, Delete, DragIndicator,
  Image as ImageIcon, VideoLibrary,
  CloudUpload, CheckCircle, Article
} from '@mui/icons-material'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'

import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'
import { useNewsModal } from '../../hooks/useNewsModal'
import NewsBlockEditor from './NewsBlockEditor'

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    fontFamily: '"Poppins", sans-serif',
    '& fieldset': { borderColor: 'rgba(140, 165, 81, 0.3)', borderWidth: '2px' },
    '&:hover fieldset': { borderColor: '#8CA551' },
    '&.Mui-focused fieldset': { borderColor: '#333F1F', borderWidth: '2px' }
  },
  '& .MuiInputLabel-root': {
    fontFamily: '"Poppins", sans-serif',
    fontWeight: 500,
    color: '#706f6f',
    '&.Mui-focused': { color: '#333F1F', fontWeight: 600 }
  }
}

const outlinedBtnSx = {
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
}

const NewsModal = ({ open, onClose, newsData = null, onSubmit, config }) => {
  const { t } = useTranslation([config.i18n.namespace, 'common'])

  const {
    formData, setField,
    tagInput, setTagInput,
    addTag, deleteTag,
    contentBlocks, onDragEnd,
    addBlock, updateBlock, deleteBlock,
    addListItem, updateListItem, deleteListItem,
    images, setImages,
    videos, setVideos,
    handleHeroUpload, handleImagesUpload, handleVideosUpload,
    uploadingHero, uploadingImages, uploadingVideos, isUploading,
    handleSubmit, handleClose
  } = useNewsModal({ open, newsData, onSubmit, onClose })

  const BLOCK_TYPES = [
    { type: 'heading', icon: <Article fontSize="small" />, label: t('news:heading') },
    { type: 'paragraph', icon: <Article fontSize="small" />, label: t('news:paragraph') },
    { type: 'list', icon: <Article fontSize="small" />, label: t('news:list') },
    { type: 'quote', icon: <Article fontSize="small" />, label: t('news:quote') }
  ]

  return (
    <ModalWrapper
      open={open}
      onClose={handleClose}
      icon={Article}
      title={newsData ? t('news:editNewsArticle') : t('news:createNewsArticle')}
      subtitle={t('news:buildArticleBlocks')}
      maxWidth="lg"
      actions={
        <>
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
              '&:hover': { bgcolor: 'rgba(112, 111, 111, 0.05)', borderColor: '#706f6f' }
            }}
          >
            {t('news:cancel')}
          </Button>
          <PrimaryButton
            startIcon={<CheckCircle />}
            onClick={handleSubmit}
            disabled={!formData.title || !formData.description || !formData.heroImage || isUploading}
          >
            {newsData ? t('news:updateArticle') : t('news:publishArticle')}
          </PrimaryButton>
        </>
      }
    >
      <Grid container spacing={3}>
        {/* Main Column 8/12 */}
        <Grid item xs={12} md={8}>
          {/* Hero Image */}
          <Box mb={3}>
            <Typography variant="body2" fontWeight={600} mb={1} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
              {t('news:heroImage')} *
            </Typography>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={uploadingHero ? <CircularProgress size={20} /> : <CloudUpload />}
              disabled={uploadingHero}
              sx={{
                ...outlinedBtnSx,
                borderStyle: formData.heroImage ? 'solid' : 'dashed',
                borderWidth: 2,
                py: 2,
                color: '#706f6f',
                borderColor: formData.heroImage ? 'rgba(140, 165, 81, 0.3)' : '#e0e0e0'
              }}
            >
              {uploadingHero ? t('news:uploading') : formData.heroImage ? t('news:changeHeroImage') : t('news:uploadHeroImage')}
              <input type="file" hidden accept="image/*" onChange={handleHeroUpload} disabled={uploadingHero} />
            </Button>
            {formData.heroImage && (
              <Box sx={{ position: 'relative', mt: 2 }}>
                <Box
                  component="img"
                  src={formData.heroImage}
                  sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 3, border: '1px solid #e0e0e0' }}
                />
                <IconButton
                  size="small"
                  onClick={() => setField('heroImage', null)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(229, 134, 60, 0.9)',
                    color: 'white',
                    '&:hover': { bgcolor: '#E5863C', transform: 'scale(1.1)' }
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Title */}
          <TextField
            fullWidth
            required
            label={t('news:articleTitle')}
            placeholder={t('news:articleTitlePlaceholder')}
            value={formData.title}
            onChange={(e) => setField('title', e.target.value)}
            sx={{ ...inputSx, mb: 3 }}
          />

          {/* Description */}
          <TextField
            fullWidth
            multiline
            rows={2}
            label={t('news:shortDescription')}
            placeholder={t('news:shortDescriptionPlaceholder')}
            value={formData.description}
            onChange={(e) => setField('description', e.target.value)}
            inputProps={{ maxLength: 200 }}
            helperText={`${formData.description.length}/200 ${t('news:characters')}`}
            sx={{ ...inputSx, mb: 3, '& .MuiFormHelperText-root': { fontFamily: '"Poppins", sans-serif' } }}
          />

          <Divider sx={{ my: 3 }} />

          {/* Content Blocks */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
                {t('news:articleContent')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
                {contentBlocks.length} {t('news:blocks')}
              </Typography>
            </Box>

            {/* Block Toolbar */}
            <Box display="flex" gap={1} flexWrap="wrap" mb={3} p={2} sx={{ bgcolor: '#fafafa', borderRadius: 3, border: '1px solid #e0e0e0' }}>
              {BLOCK_TYPES.map(({ type, icon, label }) => (
                <Button
                  key={type}
                  size="small"
                  startIcon={icon}
                  onClick={() => addBlock(type)}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    color: '#333F1F',
                    '&:hover': { bgcolor: 'rgba(140, 165, 81, 0.08)' }
                  }}
                >
                  {label}
                </Button>
              ))}
            </Box>

            {/* Drag & Drop */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="contentBlocks">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      backgroundColor: snapshot.isDraggingOver ? 'rgba(140, 165, 81, 0.08)' : 'transparent',
                      borderRadius: 12,
                      transition: 'background-color 0.2s',
                      minHeight: contentBlocks.length === 0 ? 100 : 'auto',
                      padding: 4
                    }}
                  >
                    {contentBlocks.map((block, index) => (
                      <Draggable key={block.id} draggableId={block.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{ marginBottom: 16, ...provided.draggableProps.style }}
                          >
                            <Paper
                              elevation={snapshot.isDragging ? 8 : 0}
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                transition: 'all 0.2s',
                                border: snapshot.isDragging ? '2px solid #8CA551' : '1px solid #e0e0e0',
                                bgcolor: snapshot.isDragging ? 'rgba(140, 165, 81, 0.08)' : '#fff'
                              }}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <div {...provided.dragHandleProps} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', padding: 8, marginLeft: -8 }}>
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
                                  sx={{ color: '#E5863C', '&:hover': { bgcolor: 'rgba(229, 134, 60, 0.08)' } }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                              <NewsBlockEditor
                                block={block}
                                updateBlock={updateBlock}
                                addListItem={addListItem}
                                updateListItem={updateListItem}
                                deleteListItem={deleteListItem}
                              />
                            </Paper>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {contentBlocks.length === 0 && (
                      <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 3, border: '2px dashed #e0e0e0' }}>
                        <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
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

        {/* Sidebar 4/12 */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', position: 'sticky', top: 20, bgcolor: '#fafafa' }}>
            <Typography variant="h6" fontWeight={700} mb={3} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
              {t('news:articleSettings')}
            </Typography>

            {/* Category */}
            <TextField
              fullWidth
              select
              label={t('news:category')}
              value={formData.category}
              onChange={(e) => setField('category', e.target.value)}
              sx={{ ...inputSx, mb: 2, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], bgcolor: 'white' } }}
            >
              <MenuItem value="announcement">📢 {t('news:announcement')}</MenuItem>
              <MenuItem value="construction">🏗️ {t('news:construction')}</MenuItem>
              <MenuItem value="report">📊 {t('news:report')}</MenuItem>
              <MenuItem value="event">🎉 {t('news:event')}</MenuItem>
            </TextField>

            {/* Status */}
            <TextField
              fullWidth
              select
              label={t('news:status')}
              value={formData.status}
              onChange={(e) => setField('status', e.target.value)}
              sx={{ ...inputSx, mb: 3, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], bgcolor: 'white' } }}
            >
              <MenuItem value="draft">📝 {t('news:draft')}</MenuItem>
              <MenuItem value="published">✅ {t('news:published')}</MenuItem>
            </TextField>

            <Divider sx={{ my: 3 }} />

            {/* Tags */}
            <Box mb={3}>
              <Typography variant="body2" fontWeight={600} mb={1} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
                {t('news:tags')}
              </Typography>
              <Box display="flex" gap={1} mb={1}>
                <TextField
                  size="small"
                  placeholder={t('news:addTag')}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  sx={{ flex: 1, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], borderRadius: 2, bgcolor: 'white' } }}
                />
                <Button variant="outlined" onClick={addTag} sx={outlinedBtnSx}>
                  {t('news:add')}
                </Button>
              </Box>
              <Box display="flex" gap={1} flexWrap="wrap">
                {formData.tags.map((tag, idx) => (
                  <Chip
                    key={idx}
                    label={tag}
                    size="small"
                    onDelete={() => deleteTag(tag)}
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

            {/* Gallery */}
            <Box mb={3}>
              <Typography variant="body2" fontWeight={600} mb={1} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
                {t('news:galleryImages')}
              </Typography>
              <Button
                variant="outlined"
                component="label"
                size="small"
                fullWidth
                startIcon={uploadingImages ? <CircularProgress size={20} /> : <ImageIcon />}
                disabled={uploadingImages}
                sx={outlinedBtnSx}
              >
                {uploadingImages ? t('news:uploading') : t('news:uploadImages')}
                <input type="file" hidden multiple accept="image/*" onChange={handleImagesUpload} disabled={uploadingImages} />
              </Button>
              {images.length > 0 && (
                <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                  {images.map((img, idx) => (
                    <Box key={idx} sx={{ position: 'relative' }}>
                      <Avatar src={img} variant="rounded" sx={{ width: 60, height: 60, border: '1px solid #e0e0e0' }} />
                      <IconButton
                        size="small"
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          bgcolor: 'rgba(229, 134, 60, 0.9)',
                          color: 'white',
                          width: 20,
                          height: 20,
                          '&:hover': { bgcolor: '#E5863C', transform: 'scale(1.1)' }
                        }}
                      >
                        <Close sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Videos */}
            <Box>
              <Typography variant="body2" fontWeight={600} mb={1} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
                {t('news:videos')}
              </Typography>
              <Button
                variant="outlined"
                component="label"
                size="small"
                fullWidth
                startIcon={uploadingVideos ? <CircularProgress size={20} /> : <VideoLibrary />}
                disabled={uploadingVideos}
                sx={outlinedBtnSx}
              >
                {uploadingVideos ? t('news:uploading') : t('news:uploadVideos')}
                <input type="file" hidden multiple accept="video/*" onChange={handleVideosUpload} disabled={uploadingVideos} />
              </Button>
              {videos.length > 0 && (
                <Box mt={2}>
                  {videos.map((_, idx) => (
                    <Chip
                      key={idx}
                      label={`${t('news:video')} ${idx + 1}`}
                      icon={<VideoLibrary />}
                      onDelete={() => setVideos(prev => prev.filter((_, i) => i !== idx))}
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
    </ModalWrapper>
  )
}

NewsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  newsData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired
}

export default NewsModal