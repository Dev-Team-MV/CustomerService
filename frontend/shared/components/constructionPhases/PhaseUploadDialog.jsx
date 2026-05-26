import {
  Box, Typography, TextField, IconButton,
  Paper, Grid
} from '@mui/material'
import { CloudUpload, Delete } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { enUS } from 'date-fns/locale'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'
import React from 'react'

const PhaseUploadDialog = ({
  open,
  onClose,
  phase,
  onUpload,
  uploading = false,
  config = {}
}) => {
  const theme = useTheme()
  const {
    allowVideo = true,
    maxPercentage = 100
  } = config

  const [uploadForm, setUploadForm] = React.useState({
    title: '',
    description: '',
    percentage: 0,
    images: [],
    videos: [],
    uploadedAt: null  // ✅ Cambiar a null para Date object
  })

  const maxAddable = maxPercentage - (phase?.constructionPercentage || 0)

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const isVideo = e.target.accept?.includes('video')
    setUploadForm(prev => ({
      ...prev,
      [isVideo ? 'videos' : 'images']: [...prev[isVideo ? 'videos' : 'images'], ...files]
    }))
  }

  const handleRemoveMedia = (type, index) => {
    setUploadForm(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    if (!uploadForm.images.length && !uploadForm.videos.length) {
      alert('Please select at least one image or video')
      return
    }
    
    // ✅ Convertir fecha a ISO string o string en formato MM/DD/YYYY
    const payload = {
      ...uploadForm,
      uploadedAt: uploadForm.uploadedAt 
        ? uploadForm.uploadedAt.toISOString() 
        : new Date().toISOString()
    }
    
    await onUpload(phase?.phaseNumber, payload)
    setUploadForm({ 
      title: '', 
      description: '', 
      percentage: 0, 
      images: [], 
      videos: [], 
      uploadedAt: null 
    })
  }

  const handleClose = () => {
    setUploadForm({ 
      title: '', 
      description: '', 
      percentage: 0, 
      images: [], 
      videos: [], 
      uploadedAt: null 
    })
    onClose()
  }

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      fontFamily: '"DM Sans", sans-serif',
      '& fieldset': { borderColor: theme.palette.cardBorder, borderWidth: '2px' },
      '&:hover fieldset': { borderColor: theme.palette.secondary.main },
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '2px' }
    },
    '& .MuiInputLabel-root': {
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 500,
      color: theme.palette.text.secondary,
      '&.Mui-focused': { color: theme.palette.primary.main, fontWeight: 600 }
    },
    '& .MuiFormHelperText-root': { fontFamily: '"DM Sans", sans-serif' }
  }

  const fileButtonSx = {
    py: 1.5, borderRadius: 3, textTransform: 'none',
    fontWeight: 600, fontFamily: '"DM Sans", sans-serif',
    borderColor: theme.palette.cardBorder, borderWidth: '2px', 
    color: theme.palette.primary.main,
    '&:hover': { 
      borderColor: theme.palette.secondary.main, 
      borderWidth: '2px', 
      bgcolor: `${theme.palette.secondary.main}15` 
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={handleClose}
      icon={CloudUpload}
      title="Upload Media"
      subtitle={`Phase ${phase?.phaseNumber}: ${phase?.title || ''}`}
      maxWidth="sm"
      fullWidth
      actions={[
        <PrimaryButton
          key="cancel"
          onClick={handleClose}
          color="inherit"
          variant="outlined"
        >
          Cancel
        </PrimaryButton>,
        <PrimaryButton
          key="upload"
          onClick={handleSubmit}
          loading={uploading}
          disabled={uploading || (!uploadForm.images.length && !uploadForm.videos.length) || maxAddable === 0}
          startIcon={<CloudUpload />}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </PrimaryButton>
      ]}
    >
      <Grid container spacing={2.5} sx={{ mt: "1.5px" }}>
        {/* Título */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Media Title (Optional)"
            value={uploadForm.title}
            onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
            sx={fieldSx}
          />
        </Grid>

        {/* Descripción */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description (Optional)"
            value={uploadForm.description}
            onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
            multiline
            rows={3}
            placeholder="Add a description for this media upload..."
            sx={fieldSx}
          />
        </Grid>

        {/* Porcentaje con límite dinámico */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="number"
            label="Progress Added (%)"
            value={uploadForm.percentage}
            onChange={(e) => {
              // ✅ Redondear cualquier valor decimal a entero
              const val = Math.round(parseFloat(e.target.value)) || 0
              const clamped = Math.min(Math.max(0, val), maxAddable)
              setUploadForm(prev => ({ ...prev, percentage: clamped }))
            }}
            inputProps={{ min: 0, max: maxAddable, step: 1 }}
            helperText={
              <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Percentage of construction progress to add</span>
                <Box component="span" sx={{ 
                  fontWeight: 700, 
                  color: maxAddable === 0 ? theme.palette.error.main : theme.palette.success.main 
                }}>
                  {maxAddable === 0
                    ? 'Phase already at 100%'
                    : `Max: ${maxAddable}%`
                  }
                </Box>
              </Box>
            }
            disabled={maxAddable === 0}
            sx={fieldSx}
          />
        </Grid>

        {/* ✅ Fecha de subida - MM/DD/YYYY */}
        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
            <DatePicker
              label="Upload Date"
              value={uploadForm.uploadedAt}
              onChange={(newDate) => setUploadForm(prev => ({ ...prev, uploadedAt: newDate }))}
              format="MM/dd/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: 'MM/DD/YYYY',
                  sx: fieldSx
                }
              }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Imágenes */}
        <Grid item xs={12}>
          <PrimaryButton
            variant="outlined"
            component="label"
            fullWidth
            startIcon={<CloudUpload />}
            color="primary"
            sx={fileButtonSx}
          >
            Select Images
            <input type="file" hidden multiple accept="image/*" onChange={handleFileSelect} />
          </PrimaryButton>
        </Grid>
        {uploadForm.images.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="caption" sx={{ 
              color: theme.palette.text.secondary, 
              fontWeight: 600, 
              fontFamily: '"DM Sans", sans-serif', 
              display: 'block', 
              mb: 1 
            }}>
              {uploadForm.images.length} image{uploadForm.images.length !== 1 ? 's' : ''} selected
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {uploadForm.images.map((file, index) => (
                <Paper key={index} elevation={0} sx={{ 
                  p: 1.5, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  bgcolor: '#fafafa', 
                  border: `1px solid ${theme.palette.cardBorder}`, 
                  borderRadius: 2 
                }}>
                  <Typography variant="body2" noWrap sx={{ 
                    fontFamily: '"DM Sans", sans-serif', 
                    flex: 1, 
                    mr: 1 
                  }}>
                    {file.name}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleRemoveMedia('images', index)} 
                    sx={{ color: theme.palette.error.main }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
            </Box>
          </Grid>
        )}

        {/* Videos */}
        {allowVideo && (
          <>
            <Grid item xs={12}>
              <PrimaryButton
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUpload />}
                color="primary"
                sx={{ ...fileButtonSx, mt: 1 }}
              >
                Select Videos
                <input type="file" hidden multiple accept="video/*" onChange={handleFileSelect} />
              </PrimaryButton>
            </Grid>
            {uploadForm.videos.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ 
                  color: theme.palette.text.secondary, 
                  fontWeight: 600, 
                  fontFamily: '"DM Sans", sans-serif', 
                  display: 'block', 
                  mb: 1 
                }}>
                  {uploadForm.videos.length} video{uploadForm.videos.length !== 1 ? 's' : ''} selected
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {uploadForm.videos.map((file, index) => (
                    <Paper key={index} elevation={0} sx={{ 
                      p: 1.5, 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      bgcolor: '#fafafa', 
                      border: `1px solid ${theme.palette.cardBorder}`, 
                      borderRadius: 2 
                    }}>
                      <Typography variant="body2" noWrap sx={{ 
                        fontFamily: '"DM Sans", sans-serif', 
                        flex: 1, 
                        mr: 1 
                      }}>
                        {file.name}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleRemoveMedia('videos', index)} 
                        sx={{ color: theme.palette.error.main }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))}
                </Box>
              </Grid>
            )}
          </>
        )}
      </Grid>
    </ModalWrapper>
  )
}

export default PhaseUploadDialog