import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, Container, Chip, Tooltip, CircularProgress, Alert, Tab, Tabs } from '@mui/material';
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
const [tab, setTab] = useState(0)

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

      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 3,
          border: "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          background: "white",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": {
              py: 2,
              fontWeight: 700,
              fontSize: "1rem",
              textTransform: "none",
              color: "#6c757d",
              "&.Mui-selected": {
                color: "#4a7c59",
              },
              "&:hover": {
                bgcolor: "rgba(74, 124, 89, 0.05)",
              },
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "4px 4px 0 0",
              bgcolor: "#4a7c59",
            },
          }}
        >
          <Tab label="Exterior" />
          <Tab label="Plans" />
          <Tab label="Interior" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          background: "white",
          p: 3,
          minHeight: 300,
        }}
      >
        {tab === 0 && (
          // Exterior Images
          <Grid container spacing={2}>
            {images.exterior.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">No images uploaded</Typography>
                </Paper>
              </Grid>
            ) : (
              images.exterior.map((img, idx) => (
                <Grid item xs={6} md={4} key={idx}>
                  <Box
                    component="img"
                    src={img}
                    alt={`Exterior ${idx + 1}`}
                    sx={{
                      width: '100%',
                      height: '250px',
                      objectFit: 'contain',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(140, 165, 81, 0.08)'
                    }}
                  />
                </Grid>
              ))
            )}
          </Grid>
        )}

        {tab === 1 && (
          // Blueprints
          <Grid container spacing={2}>
            {images.blueprints.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">No plans uploaded</Typography>
                </Paper>
              </Grid>
            ) : (
              images.blueprints.map((img, idx) => (
                <Grid item xs={6} md={4} key={idx}>
                  <Box
                    component="img"
                    src={img}
                    alt={`Blueprint ${idx + 1}`}
                    sx={{
                      width: '100%',
                      height: '250px',
                      objectFit: 'contain',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(140, 165, 81, 0.08)'
                    }}
                  />
                </Grid>
              ))
            )}
          </Grid>
        )}

        {tab === 2 && (
          // Interior by Section
          <Grid container spacing={2}>
            {interiorKeys.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">No sections configured</Typography>
                </Paper>
              </Grid>
            ) : (
              interiorKeys.map((section) => (
                <Grid item xs={12} md={6} lg={4} key={section}>
                  <Paper sx={{ p: 2, borderRadius: 2, height: '100%', bgcolor: '#f8fafc' }}>
                    <Typography variant="subtitle2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif', fontWeight: 600, mb: 1 }}>
                      {section}
                    </Typography>
                    <Grid container spacing={1}>
                      {(images.interior[section] || []).length === 0 ? (
                        <Grid item xs={12}>
                          <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary">No images</Typography>
                          </Paper>
                        </Grid>
                      ) : (
                        images.interior[section].map((img, idx) => (
                          <Grid item xs={12} key={idx}>
                            <Box
                              component="img"
                              src={img}
                              alt={`${section} ${idx + 1}`}
                              sx={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'contain',
                                borderRadius: 2,
                                boxShadow: '0 2px 8px rgba(140, 165, 81, 0.08)'
                              }}
                            />
                          </Grid>
                        ))
                      )}
                    </Grid>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Paper>

    <ClubhouseImagesModal 
      open={modalOpen} 
      onClose={handleModalClose}
      onImagesUploaded={handleImagesUploaded}
      images={images} // <-- asegúrate de pasar esto
      interiorKeys={interiorKeys} // <-- si tu modal lo necesita
    />
    </Container>
  </Box>
);
};

export default ClubhouseManager;