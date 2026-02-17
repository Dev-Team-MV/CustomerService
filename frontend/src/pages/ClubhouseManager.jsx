import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, Container, Chip, Tooltip, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { PhotoLibrary, Map, Layers, MeetingRoom } from '@mui/icons-material';
import ClubhouseImagesModal from '../components/ClubHouse/ClubImagesModal';
import uploadService from '../services/uploadService';

const ClubhouseManager = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [images, setImages] = useState({
    exterior: [],
    blueprints: [],
    interior: {}
  });
  const [interiorKeys, setInteriorKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Load images on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load interior keys first
      const keysResponse = await uploadService.getClubhouseInteriorKeys();
      const keys = keysResponse.keys || [];
      setInteriorKeys(keys);

      // Load all clubhouse images
      const filesResponse = await uploadService.getFilesByFolder('clubhouse', true);
      
      // Organize images by section
      const organized = {
        exterior: [],
        blueprints: [],
        interior: {}
      };

      // Initialize interior object
      keys.forEach(key => {
        organized.interior[key] = [];
      });

      // Parse files from response
      if (filesResponse.files && filesResponse.files.length > 0) {
        filesResponse.files.forEach(file => {
          // Example: file.name = "clubhouse/exterior/image1.jpg"
          // or file.path if backend provides it
          const path = file.name || file.path || '';
          const pathParts = path.split('/');
          
          if (pathParts.length < 2) return;

          const section = pathParts[1]; // 'exterior', 'blueprints', 'interior'

          if (section === 'exterior') {
            organized.exterior.push(file.url || file.publicUrl);
          } else if (section === 'blueprints') {
            organized.blueprints.push(file.url || file.publicUrl);
          } else if (section === 'interior' && pathParts.length >= 3) {
            const interiorKey = pathParts[2]; // e.g., 'Reception'
            if (organized.interior[interiorKey]) {
              organized.interior[interiorKey].push(file.url || file.publicUrl);
            }
          }
        });
      }

      setImages(organized);
    } catch (err) {
      console.error('Error loading clubhouse data:', err);
      setError(err.message || 'Failed to load clubhouse images');
    } finally {
      setLoading(false);
    }
  };

  const getTotalInteriorImages = () => {
    return Object.values(images.interior).reduce((acc, imgs) => acc + imgs.length, 0);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    // Reload data after modal closes (in case new images were uploaded)
    loadData();
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)'
        }}
      >
        <Box textAlign="center">
          <CircularProgress sx={{ color: '#8CA551', mb: 2 }} size={60} />
          <Typography
            variant="h6"
            sx={{
              color: '#333F1F',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600
            }}
          >
            Loading Clubhouse Images...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="xl">
        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 4,
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #333F1F, #8CA551, #333F1F)'
              }
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(51, 63, 31, 0.3)'
                  }}
                >
                  <PhotoLibrary sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: '#333F1F',
                      fontFamily: '"Poppins", sans-serif',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Clubhouse Image Manager
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#706f6f',
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  >
                    Manage and upload images for the Clubhouse. You can upload exterior, interior (by section), and blueprint images.
                  </Typography>
                </Box>
              </Box>
              <Tooltip title="Manage Clubhouse Images" placement="left">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    onClick={() => setModalOpen(true)}
                    startIcon={<PhotoLibrary />}
                    sx={{
                      borderRadius: 3,
                      bgcolor: '#333F1F',
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'none',
                      letterSpacing: '1px',
                      fontFamily: '"Poppins", sans-serif',
                      px: 3,
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
                        '&::before': { left: 0 },
                        '& .MuiButton-startIcon': { color: 'white' }
                      },
                      '& .MuiButton-startIcon': {
                        position: 'relative',
                        zIndex: 1,
                        color: 'white'
                      }
                    }}
                  >
                    <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
                      Manage Images
                    </Box>
                  </Button>
                </motion.div>
              </Tooltip>
            </Box>
          </Paper>
        </motion.div>

        {/* Preview Cards */}
        <Grid container spacing={2}>
          {/* Exterior */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid rgba(140, 165, 81, 0.12)',
                  background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                  boxShadow: '0 4px 20px rgba(51, 63, 31, 0.08)',
                  height: '100%'
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Map sx={{ color: '#8CA551', fontSize: 20 }} />
                    <Typography fontWeight={700} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif', fontSize: '0.95rem' }}>
                      Exterior Images
                    </Typography>
                  </Box>
                  <Chip label={images.exterior.length} size="small" sx={{ bgcolor: '#8CA551', color: 'white', fontWeight: 700, fontSize: '0.7rem' }} />
                </Box>
                <Grid container spacing={1}>
                  {images.exterior.length === 0 ? (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">No images uploaded</Typography>
                      </Paper>
                    </Grid>
                  ) : (
                    images.exterior.slice(0, 4).map((img, idx) => (
                      <Grid item xs={6} key={idx}>
                        <Box
                          component="img"
                          src={img}
                          alt={`Exterior ${idx + 1}`}
                          sx={{
                            width: '100%',
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(140, 165, 81, 0.08)'
                          }}
                        />
                      </Grid>
                    ))
                  )}
                </Grid>
              </Paper>
            </motion.div>
          </Grid>

          {/* Blueprints */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid rgba(229, 134, 60, 0.12)',
                  background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                  boxShadow: '0 4px 20px rgba(51, 63, 31, 0.08)',
                  height: '100%'
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Layers sx={{ color: '#E5863C', fontSize: 20 }} />
                    <Typography fontWeight={700} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif', fontSize: '0.95rem' }}>
                      Blueprints
                    </Typography>
                  </Box>
                  <Chip label={images.blueprints.length} size="small" sx={{ bgcolor: '#E5863C', color: 'white', fontWeight: 700, fontSize: '0.7rem' }} />
                </Box>
                <Grid container spacing={1}>
                  {images.blueprints.length === 0 ? (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">No blueprints uploaded</Typography>
                      </Paper>
                    </Grid>
                  ) : (
                    images.blueprints.slice(0, 4).map((img, idx) => (
                      <Grid item xs={6} key={idx}>
                        <Box
                          component="img"
                          src={img}
                          alt={`Blueprint ${idx + 1}`}
                          sx={{
                            width: '100%',
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(229, 134, 60, 0.08)'
                          }}
                        />
                      </Grid>
                    ))
                  )}
                </Grid>
              </Paper>
            </motion.div>
          </Grid>

          {/* Interior Summary */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid rgba(51, 63, 31, 0.12)',
                  background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                  boxShadow: '0 4px 20px rgba(51, 63, 31, 0.08)',
                  height: '100%'
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <MeetingRoom sx={{ color: '#333F1F', fontSize: 20 }} />
                    <Typography fontWeight={700} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif', fontSize: '0.95rem' }}>
                      Interior by Section
                    </Typography>
                  </Box>
                  <Chip label={getTotalInteriorImages()} size="small" sx={{ bgcolor: '#333F1F', color: 'white', fontWeight: 700, fontSize: '0.7rem' }} />
                </Box>
                <Box sx={{ maxHeight: 180, overflowY: 'auto', pr: 1 }}>
                  {interiorKeys.length === 0 ? (
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">No sections configured</Typography>
                    </Paper>
                  ) : (
                    interiorKeys.map((section) => (
                      <Box
                        key={section}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 0.5,
                          borderBottom: '1px solid rgba(0,0,0,0.05)',
                          '&:last-child': { borderBottom: 'none' }
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif', fontSize: '0.75rem' }}>
                          {section}
                        </Typography>
                        <Chip
                          label={images.interior[section]?.length || 0}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            bgcolor: (images.interior[section]?.length || 0) > 0 ? 'rgba(140, 165, 81, 0.15)' : 'rgba(0,0,0,0.05)',
                            color: (images.interior[section]?.length || 0) > 0 ? '#8CA551' : '#706f6f',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    ))
                  )}
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Modal */}
        <ClubhouseImagesModal 
          open={modalOpen} 
          onClose={handleModalClose}
        />
      </Container>
    </Box>
  );
};

export default ClubhouseManager;