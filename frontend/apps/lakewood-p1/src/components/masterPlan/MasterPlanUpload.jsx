import { Box, Typography, LinearProgress, Alert } from '@mui/material'
import { useState, useRef } from 'react'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import uploadService from '../../services/uploadService'
import { useTranslation } from 'react-i18next'
import PrimaryButton from '../../constants/PrimaryButton'
import ModalWrapper from '../../constants/ModalWrapper'

const MasterPlanUploadModal = ({ open, onClose, onUploaded }) => {
  const { t } = useTranslation(['masterPlan'])
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }
    const maxSize = 10 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 10MB')
      return
    }
    setFile(selectedFile)
    setError(null)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(selectedFile)
  }

  const resetState = () => {
    setFile(null)
    setPreview(null)
    setError(null)
    setUploadProgress(0)
    // Limpia el input de archivo
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }
    setUploading(true)
    setUploadProgress(0)
    setError(null)
    try {
      setUploadProgress(10)
      const imageUrl = await uploadService.uploadImage(file, 'masterplan')
      setUploadProgress(100)
      setTimeout(() => {
        if (onUploaded) onUploaded(imageUrl)
        setUploading(false)
        resetState()
        onClose()
      }, 800)
    } catch (err) {
      setError(err.message || 'Failed to upload master plan image')
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      resetState()
      onClose()
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={handleClose}
      icon={CloudUploadIcon}
      title={t('updateMasterPlan')}
      subtitle={t('uploadMasterPlanImage')}
      actions={
        <>
          <PrimaryButton
            variant="outlined"
            color="secondary"
            onClick={handleClose}
            disabled={uploading}
          >
            {t('common:cancel')}
          </PrimaryButton>
          <PrimaryButton
            onClick={handleUpload}
            variant="contained"
            color="primary"
            disabled={!file || uploading}
            startIcon={uploading ? null : <CloudUploadIcon />}
          >
            {uploading ? t('uploading') : t('uploadToCloud')}
          </PrimaryButton>
        </>
      }
      maxWidth="sm"
      fullWidth
    >
      {error && (
        <Alert
          severity="error"
          icon={<ErrorIcon />}
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Box display="flex" flexDirection="column" alignItems="center" gap={2.5}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="masterplan-upload-input"
          disabled={uploading}
          ref={fileInputRef}
        />

        {!preview ? (
          <label htmlFor="masterplan-upload-input" style={{ width: '100%' }}>
            <Box
              sx={{
                border: '2px dashed rgba(140, 165, 81, 0.3)',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                cursor: uploading ? 'not-allowed' : 'pointer',
                bgcolor: 'rgba(140, 165, 81, 0.03)',
                transition: 'all 0.3s ease',
                '&:hover': uploading ? {} : {
                  borderColor: '#8CA551',
                  bgcolor: 'rgba(140, 165, 81, 0.08)'
                }
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: '#8CA551', mb: 1 }} />
              <Typography variant="body2" fontWeight={600} mb={0.5}>
                {t('clickToSelectImage')}
              </Typography>
              <Typography variant="caption">
                {t('supportedFormats')}
              </Typography>
            </Box>
          </label>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Box
              sx={{
                width: '100%',
                height: 250,
                borderRadius: 3,
                overflow: 'hidden',
                border: '2px solid rgba(140, 165, 81, 0.2)',
                mb: 1.5,
                position: 'relative'
              }}
            >
              <Box
                component="img"
                src={preview}
                alt="Preview"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  bgcolor: '#f5f5f5'
                }}
              />
              {uploadProgress === 100 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    bgcolor: 'rgba(76, 175, 80, 0.95)',
                    color: 'white',
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption" fontWeight={600}>
                    Uploaded
                  </Typography>
                </Box>
              )}
            </Box>
            <Box
              sx={{
                bgcolor: 'rgba(140, 165, 81, 0.08)',
                borderRadius: 2,
                p: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600} fontSize="0.85rem">
                  {file.name}
                </Typography>
                <Typography variant="caption">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
              {!uploading && (
                <label htmlFor="masterplan-upload-input">
                  <PrimaryButton
                    size="small"
                    variant="outlined"
                    color="secondary"
                    component="span"
                  >
                    Change
                  </PrimaryButton>
                </label>
              )}
            </Box>
          </Box>
        )}

        {uploading && (
          <Box sx={{ width: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" fontWeight={600}>
                {t('uploadingToCloud')}
              </Typography>
              <Typography variant="caption" fontWeight={700} color="secondary">
                {uploadProgress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(140, 165, 81, 0.12)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#8CA551',
                  borderRadius: 4
                }
              }}
            />
          </Box>
        )}
      </Box>
    </ModalWrapper>
  )
}

export default MasterPlanUploadModal