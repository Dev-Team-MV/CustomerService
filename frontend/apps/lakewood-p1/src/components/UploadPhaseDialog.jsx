import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, TextField, IconButton,
  CircularProgress, Paper, Grid
} from '@mui/material'
import { CloudUpload, Delete } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

const UploadPhaseDialog = ({
  open,
  onClose,
  selectedPhase,
  uploadForm,
  setUploadForm,
  uploading,
  onUpload,
  getPhaseTitle
}) => {
  const { t } = useTranslation('construction')

  const maxAddable = 100 - (selectedPhase?.constructionPercentage || 0)

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

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      fontFamily: '"Poppins", sans-serif',
      '& fieldset': { borderColor: 'rgba(140,165,81,0.3)', borderWidth: '2px' },
      '&:hover fieldset': { borderColor: '#8CA551' },
      '&.Mui-focused fieldset': { borderColor: '#333F1F', borderWidth: '2px' }
    },
    '& .MuiInputLabel-root': {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 500,
      color: '#706f6f',
      '&.Mui-focused': { color: '#333F1F', fontWeight: 600 }
    },
    '& .MuiFormHelperText-root': { fontFamily: '"Poppins", sans-serif' }
  }

  const fileButtonSx = {
    py: 1.5, borderRadius: 3, textTransform: 'none',
    fontWeight: 600, fontFamily: '"Poppins", sans-serif',
    borderColor: 'rgba(140,165,81,0.3)', borderWidth: '2px', color: '#333F1F',
    '&:hover': { borderColor: '#8CA551', borderWidth: '2px', bgcolor: 'rgba(140,165,81,0.08)' }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 20px 60px rgba(51,63,31,0.15)' } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: '#333F1F', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(51,63,31,0.2)' }}>
            <CloudUpload sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
              {t('uploadImages')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
              {t('phaseInfo', { number: selectedPhase?.phaseNumber, title: getPhaseTitle?.(selectedPhase) ?? selectedPhase?.title })}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2.5}>

          {/* Título */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('mediaTitle')}
              value={uploadForm.title}
              onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
              sx={fieldSx}
            />
          </Grid>

          {/* Porcentaje con límite dinámico */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label={t('progressAdded')}
              value={uploadForm.percentage}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0
                const clamped = Math.min(Math.max(0, val), maxAddable)
                setUploadForm(prev => ({ ...prev, percentage: clamped }))
              }}
              inputProps={{ min: 0, max: maxAddable, step: 1 }}
              helperText={
                <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('progressHelper')}</span>
                  <Box component="span" sx={{ fontWeight: 700, color: maxAddable === 0 ? '#d32f2f' : '#8CA551' }}>
                    {maxAddable === 0
                      ? t('phaseComplete', 'Phase already at 100%')
                      : `${t('max', 'Max')}: ${maxAddable}%`
                    }
                  </Box>
                </Box>
              }
              disabled={maxAddable === 0}
              sx={fieldSx}
            />
          </Grid>

          {/* Imágenes */}
          <Grid item xs={12}>
            <Button variant="outlined" component="label" fullWidth startIcon={<CloudUpload />} sx={fileButtonSx}>
              {t('selectImages')}
              <input type="file" hidden multiple accept="image/*" onChange={handleFileSelect} />
            </Button>
          </Grid>
          {uploadForm.images.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#706f6f', fontWeight: 600, fontFamily: '"Poppins", sans-serif', display: 'block', mb: 1 }}>
                {t('selectedImages', { count: uploadForm.images.length })}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {uploadForm.images.map((file, index) => (
                  <Paper key={index} elevation={0} sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fafafa', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Typography variant="body2" noWrap sx={{ fontFamily: '"Poppins", sans-serif', flex: 1, mr: 1 }}>{file.name}</Typography>
                    <IconButton size="small" onClick={() => handleRemoveMedia('images', index)} sx={{ color: '#E5863C' }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            </Grid>
          )}

          {/* Videos */}
          <Grid item xs={12}>
            <Button variant="outlined" component="label" fullWidth startIcon={<CloudUpload />} sx={{ ...fileButtonSx, mt: 1 }}>
              {t('selectVideos')}
              <input type="file" hidden multiple accept="video/*" onChange={handleFileSelect} />
            </Button>
          </Grid>
          {uploadForm.videos.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#706f6f', fontWeight: 600, fontFamily: '"Poppins", sans-serif', display: 'block', mb: 1 }}>
                {t('selectedVideos', { count: uploadForm.videos.length })}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {uploadForm.videos.map((file, index) => (
                  <Paper key={index} elevation={0} sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fafafa', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Typography variant="body2" noWrap sx={{ fontFamily: '"Poppins", sans-serif', flex: 1, mr: 1 }}>{file.name}</Typography>
                    <IconButton size="small" onClick={() => handleRemoveMedia('videos', index)} sx={{ color: '#E5863C' }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            </Grid>
          )}

        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button onClick={onClose}
          sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 3, py: 1.2, color: '#706f6f', fontFamily: '"Poppins", sans-serif', border: '2px solid #e0e0e0', '&:hover': { bgcolor: 'rgba(112,111,111,0.05)', borderColor: '#706f6f' } }}>
          {t('cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={onUpload}
          disabled={uploading || (!uploadForm.images.length && !uploadForm.videos.length) || maxAddable === 0}
          startIcon={uploading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <CloudUpload />}
          sx={{
            borderRadius: 3, bgcolor: '#333F1F', color: 'white', fontWeight: 600,
            textTransform: 'none', fontFamily: '"Poppins", sans-serif', px: 4, py: 1.5,
            boxShadow: '0 4px 12px rgba(51,63,31,0.25)',
            '&:hover': { bgcolor: '#8CA551', boxShadow: '0 8px 20px rgba(51,63,31,0.35)' },
            '&:disabled': { bgcolor: '#e0e0e0', color: '#706f6f', boxShadow: 'none' }
          }}>
          {uploading ? t('uploading') : t('upload')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UploadPhaseDialog