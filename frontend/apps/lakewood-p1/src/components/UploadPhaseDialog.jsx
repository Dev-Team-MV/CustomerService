import {
  Box, Typography, TextField, IconButton,
  CircularProgress, Paper, Grid
} from '@mui/material'
import { CloudUpload, Delete } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'

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
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={CloudUpload}
      title={t('uploadImages')}
      subtitle={t('phaseInfo', { number: selectedPhase?.phaseNumber, title: getPhaseTitle?.(selectedPhase) ?? selectedPhase?.title })}
      maxWidth="sm"
      fullWidth
      actions={[
        <PrimaryButton
          key="cancel"
          onClick={onClose}
          color="inherit"
          variant="outlined"
        >
          {t('cancel')}
        </PrimaryButton>,
        <PrimaryButton
          key="upload"
          onClick={onUpload}
          loading={uploading}
          disabled={uploading || (!uploadForm.images.length && !uploadForm.videos.length) || maxAddable === 0}
          startIcon={<CloudUpload />}
        >
          {uploading ? t('uploading') : t('upload')}
        </PrimaryButton>
      ]}
    >
      <Grid container spacing={2.5} sx={{mt:"1.5px"}}>
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
          <PrimaryButton
            variant="outlined"
            component="label"
            fullWidth
            startIcon={<CloudUpload />}
            color="primary"
            sx={fileButtonSx}
          >
            {t('selectImages')}
            <input type="file" hidden multiple accept="image/*" onChange={handleFileSelect} />
          </PrimaryButton>
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
          <PrimaryButton
            variant="outlined"
            component="label"
            fullWidth
            startIcon={<CloudUpload />}
            color="primary"
            sx={{ ...fileButtonSx, mt: 1 }}
          >
            {t('selectVideos')}
            <input type="file" hidden multiple accept="video/*" onChange={handleFileSelect} />
          </PrimaryButton>
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
    </ModalWrapper>
  )
}

export default UploadPhaseDialog