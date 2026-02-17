import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Grid,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  CloudUpload,
  Close,
  Delete,
  Map,
  Layers,
  MeetingRoom,
  Check
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import uploadService from '../../services/uploadService';

const ClubImagesModal = ({ open, onClose, onImagesUploaded }) => {
  const [tab, setTab] = useState(0);
  const [selectedInteriorSection, setSelectedInteriorSection] = useState('Reception');
  const [interiorKeys, setInteriorKeys] = useState([]);
  
  // ✅ Estado para imágenes existentes (desde GCS)
  const [existingImages, setExistingImages] = useState({
    exterior: [],
    blueprints: [],
    interior: {}
  });

  // ✅ Estado para nuevas imágenes seleccionadas (preview antes de subir)
  const [selectedFiles, setSelectedFiles] = useState({
    exterior: [],
    blueprints: [],
    interior: {}
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      loadInteriorKeys();
      loadExistingImages();
    }
  }, [open]);

  const loadInteriorKeys = async () => {
    try {
      const response = await uploadService.getClubhouseInteriorKeys();
      const keys = response.interiorKeys || [];
      
      if (!keys || keys.length === 0) {
        setError('No interior sections available');
        return;
      }

      setInteriorKeys(keys);
      
      // Initialize interior objects
      const interiorObj = {};
      const selectedInteriorObj = {};
      keys.forEach(key => {
        interiorObj[key] = [];
        selectedInteriorObj[key] = [];
      });
      
      setExistingImages(prev => ({ ...prev, interior: interiorObj }));
      setSelectedFiles(prev => ({ ...prev, interior: selectedInteriorObj }));
      
      setError(null);
    } catch (err) {
      console.error('Error loading interior keys:', err);
      setError('Failed to load interior sections');
    }
  };

  const loadExistingImages = async () => {
    setLoading(true);
    try {
      const response = await uploadService.getFilesByFolder('clubhouse', true);
      
      if (response.files) {
        const organized = {
          exterior: [],
          blueprints: [],
          interior: {}
        };

        // Initialize interior keys
        interiorKeys.forEach(key => {
          organized.interior[key] = [];
        });

        response.files.forEach(file => {
          const pathParts = file.name?.split('/') || [];
          
          if (pathParts.length < 2) return;

          const section = pathParts[1];
          
          if (section === 'exterior') {
            organized.exterior.push(file.url || file.publicUrl);
          } else if (section === 'blueprints') {
            organized.blueprints.push(file.url || file.publicUrl);
          } else if (section === 'interior' && pathParts.length >= 3) {
            const interiorKey = pathParts[2];
            if (organized.interior[interiorKey]) {
              organized.interior[interiorKey].push(file.url || file.publicUrl);
            }
          }
        });

        console.log('📦 Organized images:', organized);
        setExistingImages(organized);
      }
    } catch (err) {
      console.error('Error loading clubhouse images:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVO: Solo selecciona archivos, NO los sube
  const handleFileSelect = (event, section) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    console.log(`📁 Selected ${files.length} files for ${section}`);

    setSelectedFiles(prev => {
      if (section === 'interior') {
        return {
          ...prev,
          interior: {
            ...prev.interior,
            [selectedInteriorSection]: [
              ...(prev.interior[selectedInteriorSection] || []),
              ...files
            ]
          }
        };
      } else {
        return {
          ...prev,
          [section]: [...prev[section], ...files]
        };
      }
    });
  };

  // ✅ NUEVO: Remover archivo seleccionado (antes de subir)
  const handleRemoveSelectedFile = (section, index, interiorKey = null) => {
    setSelectedFiles(prev => {
      if (section === 'interior' && interiorKey) {
        const newInterior = { ...prev.interior };
        newInterior[interiorKey] = newInterior[interiorKey].filter((_, i) => i !== index);
        return { ...prev, interior: newInterior };
      } else {
        return {
          ...prev,
          [section]: prev[section].filter((_, i) => i !== index)
        };
      }
    });
  };

  // ✅ NUEVO: Confirmar y subir TODAS las imágenes seleccionadas
  const handleConfirmUpload = async () => {
    setUploading(true);
    setError(null);

    try {
      const uploadPromises = [];

      // Upload exterior
      if (selectedFiles.exterior.length > 0) {
        uploadPromises.push(
          uploadService.uploadClubhouseImages(selectedFiles.exterior, 'exterior')
        );
      }

      // Upload blueprints
      if (selectedFiles.blueprints.length > 0) {
        uploadPromises.push(
          uploadService.uploadClubhouseImages(selectedFiles.blueprints, 'blueprints')
        );
      }

      // Upload interior sections
      for (const [key, files] of Object.entries(selectedFiles.interior)) {
        if (files.length > 0) {
          uploadPromises.push(
            uploadService.uploadClubhouseImages(files, 'interior', key)
          );
        }
      }

      if (uploadPromises.length === 0) {
        setError('No files selected to upload');
        setUploading(false);
        return;
      }

      console.log(`🚀 Uploading ${uploadPromises.length} batches...`);

      await Promise.all(uploadPromises);

      // ✅ Limpiar archivos seleccionados
      setSelectedFiles({
        exterior: [],
        blueprints: [],
        interior: interiorKeys.reduce((acc, key) => ({ ...acc, [key]: [] }), {})
      });

      // ✅ Recargar imágenes existentes
      await loadExistingImages();

      // ✅ Notificar al componente padre
      if (onImagesUploaded) {
        onImagesUploaded();
      }

      setError(null);
    } catch (err) {
      console.error('Error uploading images:', err);
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteExistingImage = async (section, imageUrl, interiorKey = null) => {
    console.log('🗑️ Delete image:', { section, imageUrl, interiorKey });
    // TODO: Implementar endpoint de eliminación
  };

  const getCurrentExistingImages = () => {
    if (tab === 0) return existingImages.exterior;
    if (tab === 1) return existingImages.blueprints;
    if (tab === 2) return existingImages.interior[selectedInteriorSection] || [];
    return [];
  };

  const getCurrentSelectedFiles = () => {
    if (tab === 0) return selectedFiles.exterior;
    if (tab === 1) return selectedFiles.blueprints;
    if (tab === 2) return selectedFiles.interior[selectedInteriorSection] || [];
    return [];
  };

  const getCurrentSection = () => {
    if (tab === 0) return 'exterior';
    if (tab === 1) return 'blueprints';
    return 'interior';
  };

  const getTotalSelectedFiles = () => {
    let total = selectedFiles.exterior.length + selectedFiles.blueprints.length;
    Object.values(selectedFiles.interior).forEach(files => {
      total += files.length;
    });
    return total;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CloudUpload sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                Clubhouse Image Manager
              </Typography>
              {getTotalSelectedFiles() > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    color: '#8CA551',
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600
                  }}
                >
                  {getTotalSelectedFiles()} file(s) ready to upload
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{
            mb: 3,
            borderBottom: '2px solid rgba(140, 165, 81, 0.2)',
            '& .MuiTab-root': {
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9rem'
            }
          }}
        >
          <Tab 
            icon={<Map />} 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                Exterior
                {(existingImages.exterior.length + selectedFiles.exterior.length) > 0 && (
                  <Chip 
                    label={existingImages.exterior.length + selectedFiles.exterior.length} 
                    size="small" 
                    sx={{ height: 20, fontSize: '0.7rem' }} 
                  />
                )}
              </Box>
            }
            iconPosition="start" 
          />
          <Tab 
            icon={<Layers />} 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                Blueprints
                {(existingImages.blueprints.length + selectedFiles.blueprints.length) > 0 && (
                  <Chip 
                    label={existingImages.blueprints.length + selectedFiles.blueprints.length} 
                    size="small" 
                    sx={{ height: 20, fontSize: '0.7rem' }} 
                  />
                )}
              </Box>
            }
            iconPosition="start" 
          />
          <Tab icon={<MeetingRoom />} label="Interior" iconPosition="start" />
        </Tabs>

        {tab === 2 && (
          <Box mb={3}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              mb={1.5}
              sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}
            >
              Select Interior Section
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {interiorKeys.map(key => {
                const count = (existingImages.interior[key]?.length || 0) + 
                             (selectedFiles.interior[key]?.length || 0);
                return (
                  <Chip
                    key={key}
                    label={
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {key}
                        {count > 0 && (
                          <Box
                            component="span"
                            sx={{
                              ml: 0.5,
                              px: 0.8,
                              py: 0.2,
                              bgcolor: selectedInteriorSection === key ? 'rgba(255,255,255,0.3)' : '#8CA551',
                              color: 'white',
                              borderRadius: 1,
                              fontSize: '0.7rem',
                              fontWeight: 700
                            }}
                          >
                            {count}
                          </Box>
                        )}
                      </Box>
                    }
                    onClick={() => setSelectedInteriorSection(key)}
                    sx={{
                      bgcolor: selectedInteriorSection === key ? '#8CA551' : 'rgba(140, 165, 81, 0.1)',
                      color: selectedInteriorSection === key ? 'white' : '#333F1F',
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: selectedInteriorSection === key ? '#8CA551' : 'rgba(140, 165, 81, 0.2)'
                      }
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        )}

        <Box mb={3}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUpload />}
            disabled={uploading || loading}
            sx={{
              borderRadius: 2,
              bgcolor: '#333F1F',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: '"Poppins", sans-serif',
              '&:hover': { bgcolor: '#8CA551' }
            }}
          >
            Select Images
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e, getCurrentSection())}
            />
          </Button>
          <Typography variant="caption" display="block" mt={1} sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
            {tab === 2 ? `Selecting for: ${selectedInteriorSection}` : `Selecting for: ${getCurrentSection()}`}
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress sx={{ color: '#8CA551' }} />
          </Box>
        ) : (
          <>
            {/* ✅ NUEVAS IMÁGENES SELECCIONADAS (PREVIEW) */}
            {getCurrentSelectedFiles().length > 0 && (
              <Box mb={3}>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  mb={1.5}
                  sx={{ 
                    color: '#8CA551', 
                    fontFamily: '"Poppins", sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <CloudUpload fontSize="small" />
                  Ready to Upload ({getCurrentSelectedFiles().length})
                </Typography>
                <Grid container spacing={2}>
                  {getCurrentSelectedFiles().map((file, idx) => (
                    <Grid item xs={6} sm={4} key={idx}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            position: 'relative',
                            borderRadius: 3,
                            overflow: 'hidden',
                            border: '2px solid #8CA551',
                            '&:hover .delete-btn': { opacity: 1 }
                          }}
                        >
                          <Box
                            component="img"
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${idx + 1}`}
                            sx={{
                              width: '100%',
                              height: 160,
                              objectFit: 'cover'
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 4,
                              left: 4,
                              bgcolor: '#8CA551',
                              color: 'white',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              fontFamily: '"Poppins", sans-serif'
                            }}
                          >
                            NEW
                          </Box>
                          <IconButton
                            className="delete-btn"
                            size="small"
                            onClick={() => handleRemoveSelectedFile(getCurrentSection(), idx, tab === 2 ? selectedInteriorSection : null)}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(255, 255, 255, 0.9)',
                              opacity: 0,
                              transition: 'opacity 0.3s',
                              '&:hover': { bgcolor: '#ff5252', color: 'white' }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* ✅ IMÁGENES EXISTENTES EN GCS */}
            {getCurrentExistingImages().length > 0 && (
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  mb={1.5}
                  sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}
                >
                  Uploaded Images ({getCurrentExistingImages().length})
                </Typography>
                <Grid container spacing={2}>
                  <AnimatePresence>
                    {getCurrentExistingImages().map((img, idx) => (
                      <Grid item xs={6} sm={4} key={idx}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Paper
                            elevation={0}
                            sx={{
                              position: 'relative',
                              borderRadius: 3,
                              overflow: 'hidden',
                              border: '1px solid #e0e0e0',
                              '&:hover .delete-btn': { opacity: 1 }
                            }}
                          >
                            <Box
                              component="img"
                              src={img}
                              alt={`Image ${idx + 1}`}
                              sx={{
                                width: '100%',
                                height: 160,
                                objectFit: 'cover'
                              }}
                            />
                            <IconButton
                              className="delete-btn"
                              size="small"
                              onClick={() => handleDeleteExistingImage(getCurrentSection(), img, tab === 2 ? selectedInteriorSection : null)}
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                opacity: 0,
                                transition: 'opacity 0.3s',
                                '&:hover': { bgcolor: '#ff5252', color: 'white' }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Paper>
                        </motion.div>
                      </Grid>
                    ))}
                  </AnimatePresence>
                </Grid>
              </Box>
            )}

            {/* ✅ MENSAJE CUANDO NO HAY NADA */}
            {getCurrentExistingImages().length === 0 && getCurrentSelectedFiles().length === 0 && (
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  bgcolor: 'rgba(140, 165, 81, 0.05)',
                  borderRadius: 3,
                  border: '1px dashed rgba(140, 165, 81, 0.3)'
                }}
              >
                <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
                  No images yet. Select files to upload.
                </Typography>
              </Paper>
            )}
          </>
        )}
      </DialogContent>

      {/* ✅ BOTONES DE ACCIÓN */}
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
            color: '#706f6f'
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirmUpload}
          disabled={getTotalSelectedFiles() === 0 || uploading}
          startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <Check />}
          sx={{
            borderRadius: 2,
            bgcolor: '#8CA551',
            fontWeight: 600,
            textTransform: 'none',
            fontFamily: '"Poppins", sans-serif',
            px: 3,
            '&:hover': { bgcolor: '#333F1F' },
            '&:disabled': { bgcolor: '#e0e0e0' }
          }}
        >
          {uploading ? 'Uploading...' : `Upload ${getTotalSelectedFiles()} Image(s)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClubImagesModal;