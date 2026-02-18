import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  Typography,
  LinearProgress,
  Alert
} from '@mui/material';
import { useState } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import uploadService from '../../services/uploadService';

const MasterPlanUploadModal = ({ open, onClose, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;

    // ✅ Validar que sea imagen
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // ✅ Validar tamaño (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // ✅ Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      console.log('📤 Uploading master plan image to GCS bucket...');
      
      // ✅ Simular progreso gradual
      setUploadProgress(10);
      
      // ✅ SOLO SUBIR A GCS - Carpeta 'masterplan'
      const imageUrl = await uploadService.uploadImage(file, 'masterplan');
      
      console.log('✅ Master plan image uploaded successfully:', imageUrl);
      setUploadProgress(100);

      // ✅ Notificar éxito al componente padre
      setTimeout(() => {
        if (onUploaded) {
          onUploaded(imageUrl);
        }
        
        // Reset y cerrar
        setUploading(false);
        setUploadProgress(0);
        setFile(null);
        setPreview(null);
        onClose();
      }, 800);

    } catch (err) {
      console.error('❌ Error uploading master plan:', err);
      setError(err.message || 'Failed to upload master plan image');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setPreview(null);
      setError(null);
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(51, 63, 31, 0.15)'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: '#333F1F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
            }}
          >
            <CloudUploadIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                color: '#333F1F',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              Update Master Plan
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              Upload a new master plan image
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* ✅ ERROR ALERT */}
        {error && (
          <Alert 
            severity="error" 
            icon={<ErrorIcon />}
            sx={{ 
              mb: 2,
              borderRadius: 2,
              fontFamily: '"Poppins", sans-serif'
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          gap={2.5}
        >
          {/* ✅ FILE INPUT */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="masterplan-upload-input"
            disabled={uploading}
          />

          {/* ✅ UPLOAD BUTTON / PREVIEW */}
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
                <CloudUploadIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: '#8CA551',
                    mb: 1
                  }} 
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: '#333F1F',
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
                    mb: 0.5
                  }}
                >
                  Click to select image
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  Supports: JPG, PNG, WEBP (Max 10MB)
                </Typography>
              </Box>
            </label>
          ) : (
            <Box sx={{ width: '100%' }}>
              {/* ✅ IMAGE PREVIEW */}
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
                
                {/* ✅ SUCCESS BADGE */}
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
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    >
                      Uploaded
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* ✅ FILE INFO */}
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
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#333F1F',
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '0.85rem'
                    }}
                  >
                    {file.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#706f6f',
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  >
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>

                {!uploading && (
                  <label htmlFor="masterplan-upload-input">
                    <Button
                      size="small"
                      component="span"
                      sx={{
                        textTransform: 'none',
                        fontFamily: '"Poppins", sans-serif',
                        color: '#8CA551',
                        fontWeight: 600
                      }}
                    >
                      Change
                    </Button>
                  </label>
                )}
              </Box>
            </Box>
          )}

          {/* ✅ PROGRESS BAR */}
          {uploading && (
            <Box sx={{ width: '100%' }}>
              <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
                mb={1}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#333F1F',
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  Uploading to cloud storage...
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#8CA551',
                    fontWeight: 700,
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
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
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          disabled={uploading}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.2,
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif',
            border: '2px solid #e0e0e0',
            '&:hover': {
              bgcolor: 'rgba(112, 111, 111, 0.05)',
              borderColor: '#706f6f'
            },
            '&:disabled': {
              opacity: 0.5
            }
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!file || uploading}
          startIcon={uploading ? null : <CloudUploadIcon />}
          sx={{
            borderRadius: 3,
            bgcolor: '#333F1F',
            color: 'white',
            fontWeight: 600,
            textTransform: 'none',
            letterSpacing: '1px',
            fontFamily: '"Poppins", sans-serif',
            px: 4,
            py: 1.5,
            boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              bgcolor: '#8CA551',
              transition: 'left 0.4s ease',
              zIndex: 0
            },
            '&:hover': {
              bgcolor: '#333F1F',
              boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
              '&::before': {
                left: 0
              }
            },
            '&:disabled': {
              bgcolor: '#e0e0e0',
              color: '#9e9e9e',
              boxShadow: 'none',
              '&::before': {
                display: 'none'
              }
            },
            '& span': {
              position: 'relative',
              zIndex: 1
            },
            '& .MuiButton-startIcon': {
              position: 'relative',
              zIndex: 1
            }
          }}
        >
          <span>
            {uploading ? 'Uploading...' : 'Upload to Cloud'}
          </span>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MasterPlanUploadModal;