import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Grid, Paper, IconButton, CircularProgress, MenuItem, Select, FormControl, InputLabel
} from '@mui/material'
import { CloudUpload, Close, Delete, Check } from '@mui/icons-material'
import uploadService from '../../services/uploadService'

const OutdoorAmenitiesModal = ({
  open,
  onClose,
  amenitiesList = [], // [{ id, name, images }]
  onUploaded
}) => {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
const [selectedAmenityName, setSelectedAmenityName] = useState('')

useEffect(() => {
  if (open && amenitiesList.length > 0) {
    setSelectedAmenityName(amenitiesList[0].name)
  }
}, [open, amenitiesList])
  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files))
  }

  const handleRemoveSelectedFile = (idx) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx))
  }

const handleUpload = async () => {
  setUploading(true)
  try {
    const urls = await uploadService.uploadOutdoorAmenityImages(selectedFiles, selectedAmenityName)
    await uploadService.saveOutdoorAmenityImages(selectedAmenityName, urls)
    setSelectedFiles([])
    if (onUploaded) onUploaded()
    onClose()
  } catch (err) {
    // Manejo de error
  } finally {
    setUploading(false)
  }
}
  const currentImages = amenitiesList.find(a => a.name === selectedAmenityName)?.images || []

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography fontWeight={700}>Manage Outdoor Amenity Images</Typography>
          <IconButton onClick={onClose}><Close /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="amenity-select-label">Amenity</InputLabel>
  <Select
    labelId="amenity-select-label"
    value={selectedAmenityName}
    label="Amenity"
    onChange={e => setSelectedAmenityName(e.target.value)}
  >
    {amenitiesList.map(a => (
      <MenuItem key={a.name} value={a.name}>{a.name}</MenuItem>
    ))}
  </Select>
        </FormControl>
        <Box mb={2}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUpload />}
            disabled={uploading}
          >
            Select Images
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleFileSelect}
            />
          </Button>
        </Box>
        <Grid container spacing={2}>
          {selectedFiles.map((file, idx) => (
            <Grid item xs={6} key={idx}>
              <Paper sx={{ position: 'relative', borderRadius: 2 }}>
                <Box
                  component="img"
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${idx + 1}`}
                  sx={{ width: '100%', height: 120, objectFit: 'cover' }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveSelectedFile(idx)}
                  sx={{
                    position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)'
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Box mt={2}>
          <Typography variant="subtitle2" fontWeight={700}>Uploaded Images</Typography>
          <Grid container spacing={2}>
            {currentImages.map((url, idx) => (
              <Grid item xs={6} key={idx}>
                <Paper sx={{ borderRadius: 2 }}>
                  <Box
                    component="img"
                    src={url}
                    alt={`Amenity ${idx + 1}`}
                    sx={{ width: '100%', height: 120, objectFit: 'cover' }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : <Check />}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default OutdoorAmenitiesModal