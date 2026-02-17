import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material'
import { useState } from 'react'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import api from '../../services/api'

const MasterPlanUploadModal = ({ open, onClose, onUploaded }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('masterPlan', file)
    try {
      await api.post('/masterplan/upload', formData)
      setUploading(false)
      onUploaded && onUploaded()
      onClose()
    } catch (err) {
      setUploading(false)
      alert('Upload failed')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Update MasterPlan Image</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={2}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="masterplan-upload-input"
          />
          <label htmlFor="masterplan-upload-input">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
            >
              {file ? file.name : 'Choose Image'}
            </Button>
          </label>
          {file && (
            <Typography variant="caption" color="text.secondary">
              {file.name}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={uploading}>Cancel</Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          color="success"
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MasterPlanUploadModal