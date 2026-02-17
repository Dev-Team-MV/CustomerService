import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
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
  MeetingRoom
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import uploadService from '../../services/uploadService';

const ClubImagesModal = ({ open, onClose }) => {
  const [tab, setTab] = useState(0); // 0: exterior, 1: blueprints, 2: interior
  const [selectedInteriorSection, setSelectedInteriorSection] = useState('Reception');
  const [interiorKeys, setInteriorKeys] = useState([]);
  
  const [images, setImages] = useState({
    exterior: [],
    blueprints: [],
    interior: {}
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Load interior keys on mount
  useEffect(() => {
    if (open) {
      loadInteriorKeys();
      loadImages();
    }
  }, [open]);

  const loadInteriorKeys = async () => {
    try {
      const response = await uploadService.getClubhouseInteriorKeys();
      setInteriorKeys(response.keys || []);
      
      // Initialize interior object with empty arrays
      const interiorObj = {};
      response.keys.forEach(key => {
        interiorObj[key] = [];
      });
      setImages(prev => ({ ...prev, interior: interiorObj }));
    } catch (err) {
      console.error('Error loading interior keys:', err);
      setError('Failed to load interior sections');
    }
  };

  const loadImages = async () => {
    setLoading(true);
    try {
      const response = await uploadService.getFilesByFolder('clubhouse', true);
      
      // Parse response and organize by section
      // Backend should return files organized by path/metadata
      // For now, we'll assume the response structure matches our needs
      if (response.files) {
        const organized = {
          exterior: [],
          blueprints: [],
          interior: {}
        };

        response.files.forEach(file => {
          // Example: file.path = "clubhouse/exterior/image1.jpg"
          const pathParts = file.path?.split('/') || [];
          const section = pathParts[1]; // 'exterior', 'blueprints', 'interior'
          
          if (section === 'exterior') {
            organized.exterior.push(file.url);
          } else if (section === 'blueprints') {
            organized.blueprints.push(file.url);
          } else if (section === 'interior') {
            const interiorKey = pathParts[2]; // e.g., 'Reception'
            if (!organized.interior[interiorKey]) {
              organized.interior[interiorKey] = [];
            }
            organized.interior[interiorKey].push(file.url);
          }
        });

        setImages(organized);
      }
    } catch (err) {
      console.error('Error loading clubhouse images:', err);
      setError('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event, section) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      let interiorKey = null;
      if (section === 'interior') {
        interiorKey = selectedInteriorSection;
      }

      const response = await uploadService.uploadClubhouseImages(files, section, interiorKey);

      // Update local state with new images
      if (response.urls && response.urls.length > 0) {
        setImages(prev => {
          if (section === 'interior') {
            return {
              ...prev,
              interior: {
                ...prev.interior,
                [interiorKey]: [...(prev.interior[interiorKey] || []), ...response.urls]
              }
            };
          } else {
            return {
              ...prev,
              [section]: [...prev[section], ...response.urls]
            };
          }
        });
      }

      // Reload to get fresh data
      await loadImages();
    } catch (err) {
      console.error('Error uploading images:', err);
      setError(err.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (section, imageUrl, interiorKey = null) => {
    // TODO: Implement delete endpoint in backend
    console.log('Delete image:', { section, imageUrl, interiorKey });
  };

  const getCurrentImages = () => {
    if (tab === 0) return images.exterior;
    if (tab === 1) return images.blueprints;
    if (tab === 2) return images.interior[selectedInteriorSection] || [];
    return [];
  };

  const getCurrentSection = () => {
    if (tab === 0) return 'exterior';
    if (tab === 1) return 'blueprints';
    return 'interior';
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
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
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
          <Tab icon={<Map />} label="Exterior" iconPosition="start" />
          <Tab icon={<Layers />} label="Blueprints" iconPosition="start" />
          <Tab icon={<MeetingRoom />} label="Interior" iconPosition="start" />
        </Tabs>

        {/* Interior Section Selector */}
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
              {interiorKeys.map(key => (
                <Chip
                  key={key}
                  label={key}
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
              ))}
            </Box>
          </Box>
        )}

        {/* Upload Button */}
        <Box mb={3}>
          <Button
            variant="contained"
            component="label"
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
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
            {uploading ? 'Uploading...' : 'Upload Images'}
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={(e) => handleFileUpload(e, getCurrentSection())}
            />
          </Button>
          <Typography variant="caption" display="block" mt={1} sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
            {tab === 2 && `Uploading to: ${selectedInteriorSection}`}
          </Typography>
        </Box>

        {/* Images Grid */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress sx={{ color: '#8CA551' }} />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <AnimatePresence>
              {getCurrentImages().length === 0 ? (
                <Grid item xs={12}>
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
                      No images uploaded yet
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                getCurrentImages().map((img, idx) => (
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
                          onClick={() => handleDeleteImage(getCurrentSection(), img, tab === 2 ? selectedInteriorSection : null)}
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
                ))
              )}
            </AnimatePresence>
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClubImagesModal;