import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, Container, Chip, Tooltip, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { PhotoLibrary, Map, Layers, MeetingRoom } from '@mui/icons-material';
import ClubhouseImagesModal from '../components/ClubHouse/ClubImagesModal';
import uploadService from '../services/uploadService';
import PageHeader from '../components/PageHeader';
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

  useEffect(() => {
    loadData();
  }, []);

// ...existing code...

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load interior keys
      const keysResponse = await uploadService.getClubhouseInteriorKeys();
      const keys = keysResponse.interiorKeys || [];
      
      console.log('📋 Interior keys loaded:', keys);
      setInteriorKeys(keys);

      // Load all clubhouse images
      const filesResponse = await uploadService.getFilesByFolder('clubhouse', true);
      
      console.log('📦 Files response:', filesResponse);

      // ✅ NUEVO: Organizar usando section e interiorKey directamente
      const organized = {
        exterior: [],
        blueprints: [],
        interior: {}
      };

      // Initialize interior object
      keys.forEach(key => {
        organized.interior[key] = [];
      });

      // ✅ CORREGIDO: Usar matching case-insensitive para interior keys
      if (filesResponse.files && filesResponse.files.length > 0) {
        filesResponse.files.forEach(file => {
          const { section, interiorKey, url, publicUrl } = file;
          const imageUrl = url || publicUrl;

          console.log('📁 Processing file:', { section, interiorKey, url: imageUrl });

          // Categorizar por section
          if (section === 'exterior') {
            organized.exterior.push(imageUrl);
          } else if (section === 'blueprints') {
            organized.blueprints.push(imageUrl);
          } else if (section === 'interior' && interiorKey) {
            // ✅ NUEVO: Buscar la key correcta (case-insensitive)
            const matchingKey = keys.find(
              key => key.toLowerCase() === interiorKey.toLowerCase()
            );

            if (matchingKey) {
              organized.interior[matchingKey].push(imageUrl);
              console.log(`✅ Matched interior key: ${interiorKey} → ${matchingKey}`);
            } else {
              console.warn(`⚠️ Unknown interior key: ${interiorKey} (available keys: ${keys.join(', ')})`);
            }
          } else {
            console.warn(`⚠️ File without proper categorization:`, file.name);
          }
        });
      }

      console.log('✅ Organized images:', organized);
      setImages(organized);
    } catch (err) {
      console.error('❌ Error loading clubhouse data:', err);
      setError(err.message || 'Failed to load clubhouse images');
    } finally {
      setLoading(false);
    }
  };

// ...existing code...

  const getTotalInteriorImages = () => {
    return Object.values(images.interior).reduce((acc, imgs) => acc + imgs.length, 0);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    loadData();
  };

  const handleImagesUploaded = () => {
    console.log('🔄 Images uploaded, reloading data...');
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
        <PageHeader
          icon={PhotoLibrary}
          title="Clubhouse Image Manager"
          subtitle="Manage and upload images for the Clubhouse. You can upload exterior, interior (by section), and blueprint images."
          actionButton={{
            label: 'Manage Images',
            onClick: () => setModalOpen(true),
            icon: <PhotoLibrary />,
            tooltip: 'Manage Clubhouse Images'
          }}
        />

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
          onImagesUploaded={handleImagesUploaded}
        />
      </Container>
    </Box>
  );
};

export default ClubhouseManager;