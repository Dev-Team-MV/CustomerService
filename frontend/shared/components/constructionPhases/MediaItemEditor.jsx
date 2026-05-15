// @/shared/components/constructionPhases/MediaItemEditor.jsx

import { useState, useRef } from 'react'
import {
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material'
import { Edit, Delete, CloudUpload } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

/**
 * MediaItemEditor - Componente reutilizable para editar/eliminar media items
 * @param {Object} mediaItem - El item de media actual
 * @param {boolean} isAdmin - Si el usuario es admin
 * @param {Function} onEdit - Callback para editar (mediaItem, newData) => Promise
 * @param {Function} onDelete - Callback para eliminar (mediaItemId) => Promise
 * @param {Object} uploadService - Servicio para subir archivos (debe tener uploadPhaseImages y uploadPhaseVideos)
 * @param {Object} config - Configuración opcional
 */
const MediaItemEditor = ({ 
  mediaItem, 
  isAdmin = false, 
  onEdit, 
  onDelete,
  uploadService,
  config = {}
}) => {
  const theme = useTheme()
  const fileInputRef = useRef(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [newFile, setNewFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  const {
    editLabel = 'Edit',
    deleteLabel = 'Delete',
    editDialogTitle = 'Edit Media',
    deleteDialogTitle = 'Confirm Delete',
    deleteConfirmText = 'Are you sure you want to delete this media item? This action cannot be undone.',
    buttonSize = 'small',
    iconSize = 20,
    allowReplaceFile = true
  } = config

  if (!isAdmin || !mediaItem) return null

  const handleEditOpen = (e) => {
    e?.stopPropagation()
    setEditTitle(mediaItem.title || '')
    setNewFile(null)
    setPreviewUrl(null)
    setEditDialogOpen(true)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleEditSave = async () => {
    if (!onEdit) return
    setLoading(true)
    try {
      const updateData = { title: editTitle }
      
      // Si hay un nuevo archivo, subirlo primero
      if (newFile && uploadService) {
        const isVideo = newFile.type.startsWith('video/')
        let newUrl
        
        if (isVideo) {
          const urls = await uploadService.uploadPhaseVideos([newFile])
          newUrl = urls[0]
        } else {
          const urls = await uploadService.uploadPhaseImages([newFile])
          newUrl = urls[0]
        }
        
        updateData.url = newUrl
        updateData.mediaType = isVideo ? 'video' : 'image'
      }
      
      await onEdit(mediaItem, updateData)
      setEditDialogOpen(false)
      setNewFile(null)
      setPreviewUrl(null)
    } catch (error) {
      console.error('Error editing media:', error)
      alert('Error editing media: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOpen = (e) => {
    e?.stopPropagation()
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!onDelete) return
    setLoading(true)
    try {
      await onDelete(mediaItem._id)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting media:', error)
      alert('Error deleting media: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseEdit = () => {
    if (loading) return
    setEditDialogOpen(false)
    setNewFile(null)
    setPreviewUrl(null)
  }

  return (
    <>
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title={editLabel}>
          <IconButton
            size={buttonSize}
            onClick={handleEditOpen}
            sx={{
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'white' }
            }}
          >
            <Edit sx={{ fontSize: iconSize, color: theme.palette.primary.main }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={deleteLabel}>
          <IconButton
            size={buttonSize}
            onClick={handleDeleteOpen}
            sx={{
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'white' }
            }}
          >
            <Delete sx={{ fontSize: iconSize, color: '#d32f2f' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEdit} 
        maxWidth="sm" 
        fullWidth
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
          {editDialogTitle}
        </DialogTitle>
        <DialogContent>
          {/* Campo de título */}
          <TextField
            fullWidth
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mt: 2 }}
            disabled={loading}
          />
          
          {/* Sección para reemplazar archivo */}
          {allowReplaceFile && uploadService && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Replace {mediaItem.mediaType === 'video' ? 'Video' : 'Image'} (optional)
              </Typography>
              
              {/* Preview actual o nuevo */}
              <Box
                sx={{
                  width: '100%',
                  height: 150,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: '#f5f5f5',
                  border: '1px dashed #ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                {previewUrl ? (
                  newFile?.type.startsWith('video/') ? (
                    <video
                      src={previewUrl}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="New preview"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  )
                ) : mediaItem.mediaType === 'video' ? (
                  <video
                    src={mediaItem.url}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <img
                    src={mediaItem.url}
                    alt="Current"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                )}
              </Box>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                style={{ display: 'none' }}
              />
              
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                fullWidth
                sx={{ textTransform: 'none' }}
              >
                {newFile ? `Selected: ${newFile.name}` : 'Choose new file'}
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseEdit} 
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSave} 
            variant="contained" 
            disabled={loading}
            sx={{ 
              textTransform: 'none',
              bgcolor: theme.palette.primary.main,
              '&:hover': { bgcolor: theme.palette.primary.dark }
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => !loading && setDeleteDialogOpen(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
          {deleteDialogTitle}
        </DialogTitle>
        <DialogContent>
          <Typography>{deleteConfirmText}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MediaItemEditor