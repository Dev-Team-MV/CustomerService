import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Grid, CircularProgress } from '@mui/material'
import { useState } from 'react'

const RecorridoImagesModal = ({ open, onClose, puntos, images, onUpload, loading }) => {
  const [files, setFiles] = useState(Array(puntos.length).fill(null))
  const [previews, setPreviews] = useState(Array(puntos.length).fill(null))

  const handleFileChange = (idx, e) => {
    const newFiles = [...files]
    const newPreviews = [...previews]
    const file = e.target.files[0]
    newFiles[idx] = file
    newPreviews[idx] = file ? URL.createObjectURL(file) : null
    setFiles(newFiles)
    setPreviews(newPreviews)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Manage Tour Images</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {puntos.map((point, idx) => (
            <Grid item xs={12} sm={6} md={4} key={point.id}>
              <Box sx={{ border: '1px solid #eee', borderRadius: 2, p: 2 }}>
                <Typography fontWeight={600}>{point.name}</Typography>
                {previews[idx] ? (
                  <Box
                    component="img"
                    src={previews[idx]}
                    alt={point.name}
                    sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 2, my: 1 }}
                  />
                ) : images[idx] ? (
                  <Box
                    component="img"
                    src={images[idx]}
                    alt={point.name}
                    sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 2, my: 1 }}
                  />
                ) : (
                  <Box sx={{ width: '100%', height: 120, bgcolor: '#f5f5f5', borderRadius: 2, my: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                    No image
                  </Box>
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id={`upload-input-${idx}`}
                  onChange={e => handleFileChange(idx, e)}
                  disabled={loading}
                />
                <label htmlFor={`upload-input-${idx}`}>
                  <Button
                    variant="outlined"
                    component="span"
                    size="small"
                    fullWidth
                    disabled={loading}
                  >
                    {images[idx] ? 'Replace' : 'Upload'} image
                  </Button>
                </label>
                {files[idx] && (
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 1 }}
                    fullWidth
                    onClick={() => onUpload(idx, files[idx])}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={18} /> : 'Save'}
                  </Button>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default RecorridoImagesModal