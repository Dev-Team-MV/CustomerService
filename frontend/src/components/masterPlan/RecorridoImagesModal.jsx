import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Grid, CircularProgress } from '@mui/material'
import { useState } from 'react'

const RecorridoImagesModal = ({ open, onClose, puntos, imagesMap, onUpload, loading }) => {
  const [files, setFiles] = useState({})
  const [previews, setPreviews] = useState({})

  const handleFileChange = (id, e) => {
    const file = e.target.files[0]
    setFiles(prev => ({ ...prev, [id]: file }))
    setPreviews(prev => ({ ...prev, [id]: file ? URL.createObjectURL(file) : null }))
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Manage Tour Images</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {puntos.map((point) => (
            <Grid item xs={12} sm={6} md={4} key={point.id}>
              <Box sx={{ border: '1px solid #eee', borderRadius: 2, p: 2 }}>
                <Typography fontWeight={600}>{point.name}</Typography>
                {previews[String(point.id)] ? (
                  <Box
                    component="img"
                    src={previews[String(point.id)]}
                    alt={point.name}
                    sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 2, my: 1 }}
                  />
                ) : imagesMap[String(point.id)] ? (

                  <Box
                    component="img"
                    src={imagesMap[String(point.id)]}
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
                  id={`upload-input-${point.id}`}
                  onChange={e => handleFileChange(point.id, e)}
                  disabled={loading}
                />
                <label htmlFor={`upload-input-${point.id}`}>
                  <Button
                    variant="outlined"
                    component="span"
                    size="small"
                    fullWidth
                    disabled={loading}
                  >
                    {imagesMap[point.id] ? 'Replace' : 'Upload'} image
                  </Button>
                </label>
                {files[point.id] && (
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 1 }}
                    fullWidth
                    onClick={() => onUpload(point.id, files[point.id])}
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