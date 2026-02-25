import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, Container, Chip, Tooltip, CircularProgress, Alert, Tab, Tabs } from '@mui/material';
import { motion } from 'framer-motion';
import { PhotoLibrary, Map, Layers, MeetingRoom } from '@mui/icons-material';
import ClubhouseImagesModal from '../components/ClubHouse/ClubImagesModal';
import uploadService from '../services/uploadService';
import PageHeader from '../components/PageHeader';
import { useTranslation } from 'react-i18next';

const ClubhouseManager = () => {
  const { t } = useTranslation(['clubhouse', 'common']);
  const [modalOpen, setModalOpen] = useState(false);
  const [images, setImages] = useState({
    exterior: [],
    blueprints: [],
    interior: {}
  });
  const [interiorKeys, setInteriorKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    loadData();
  }, []);


  // const loadData = async () => {
  //   setLoading(true);
  //   setError(null);
    
  //   try {
  //     // Load interior keys
  //     const keysResponse = await uploadService.getClubhouseInteriorKeys();
  //     const keys = keysResponse.interiorKeys || [];
      
  //     console.log('📋 Interior keys loaded:', keys);
  //     setInteriorKeys(keys);

  //     // Load all clubhouse images
  //     const filesResponse = await uploadService.getFilesByFolder('clubhouse', true);
      
  //     console.log('📦 Files response:', filesResponse);

  //     // ✅ NUEVO: Organizar usando section e interiorKey directamente
  //     const organized = {
  //       exterior: [],
  //       blueprints: [],
  //       interior: {},
  //       deck: []
  //     };

  //     // Initialize interior object
  //     keys.forEach(key => {
  //       organized.interior[key] = [];
  //     });

  //     // ✅ CORREGIDO: Usar matching case-insensitive para interior keys
  //     if (filesResponse.files && filesResponse.files.length > 0) {
  //       filesResponse.files.forEach(file => {
  //         const { section, interiorKey, url, publicUrl } = file;
  //         const imageUrl = url || publicUrl;

  //         console.log('📁 Processing file:', { section, interiorKey, url: imageUrl });

  //         // Categorizar por section
  //         if (section === 'exterior') {
  //           organized.exterior.push(imageUrl);
  //         } else if (section === 'blueprints') {
  //           organized.blueprints.push(imageUrl);
  //         } else if (section === 'interior' && interiorKey) {
  //           // ✅ NUEVO: Buscar la key correcta (case-insensitive)
  //           const matchingKey = keys.find(
  //             key => key.toLowerCase() === interiorKey.toLowerCase()
  //           );

  //           if (matchingKey) {
  //             organized.interior[matchingKey].push(imageUrl);
  //             console.log(`✅ Matched interior key: ${interiorKey} → ${matchingKey}`);
  //           } else {
  //             console.warn(`⚠️ Unknown interior key: ${interiorKey} (available keys: ${keys.join(', ')})`);
  //           }
  //         } 
  //         else if (section === 'deck') {
  //           organized.deck.push(imageUrl);
  //         } 
  //         else {
  //           console.warn(`⚠️ File without proper categorization:`, file.name);
  //         }
  //       });
  //     }

  //     console.log('✅ Organized images:', organized);
  //     setImages(organized);
  //   } catch (err) {
  //     console.error('❌ Error loading clubhouse data:', err);
  //     setError(err.message || 'Failed to load clubhouse images');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loadData = async () => {
  setLoading(true);
  setError(null);

  try {
    // interior keys
    const keysResponse = await uploadService.getClubhouseInteriorKeys();
    const keys = keysResponse?.interiorKeys || [];
    setInteriorKeys(keys);
    console.log('📋 Interior keys loaded:', keys);

    // listado general y deck específico
    const filesResponse = await uploadService.getFilesByFolder('clubhouse', true);
    let deckResponse = { files: [] };
    try {
      deckResponse = await uploadService.getDeckFiles(true);
    } catch (e) {
      try {
        deckResponse = await uploadService.getClubhouseDeckFiles(true);
      } catch (e2) {
        console.warn('No deck specific listing available:', e2?.message || e2);
      }
    }

    const organized = {
      exterior: [],
      blueprints: [],
      interior: {},
      deck: []
    };
    keys.forEach(k => (organized.interior[k] = []));

    // normalizador simple de url
    const getUrl = (file) => file?.url || file?.publicUrl || file?.path || file || '';

    if (filesResponse?.files && filesResponse.files.length > 0) {
      filesResponse.files.forEach(file => {
        const section = file.section || file.folder || '';
        const interiorKey = file.interiorKey || file.key || '';
        const imageUrl = getUrl(file);
        console.log('📁 Processing file:', { section, interiorKey, imageUrl });

        if (section === 'exterior') organized.exterior.push(imageUrl);
        else if (section === 'blueprints') organized.blueprints.push(imageUrl);
        else if (section === 'interior' && interiorKey) {
          const matchingKey = keys.find(k => k.toLowerCase() === String(interiorKey).toLowerCase());
          if (matchingKey) organized.interior[matchingKey].push(imageUrl);
          else {
            // fallback: create key if missing
            if (!organized.interior[interiorKey]) organized.interior[interiorKey] = [];
            organized.interior[interiorKey].push(imageUrl);
            console.warn('Unknown interior key while loading data:', interiorKey);
          }
        } else if (section === 'deck') organized.deck.push(imageUrl);
        else {
          // fallback -> exterior
          organized.exterior.push(imageUrl);
          console.warn('Uncategorized clubhouse file added to exterior by fallback:', file);
        }
      });
    }

    // merge deckResponse.files
    if (deckResponse?.files && deckResponse.files.length > 0) {
      deckResponse.files.forEach(file => {
        const imageUrl = getUrl(file);
        if (!organized.deck.includes(imageUrl)) organized.deck.push(imageUrl);
      });
    }

    console.log('✅ Organized images:', organized);
    setImages(organized);
  } catch (err) {
    console.error('❌ Error loading clubhouse data:', err);
    setError(err?.message || 'Failed to load clubhouse images');
  } finally {
    setLoading(false);
  }
};

// ...existing code...


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
  title={t('clubHouse:title')}
  subtitle={t('clubHouse:subtitle')}
  actionButton={{
    label: t('clubHouse:manageImages'),
    onClick: () => setModalOpen(true),
    icon: <PhotoLibrary />,
    tooltip: t('clubHouse:manageImagesTooltip')
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
          <Tab label={t('clubHouse:tabs.exterior')} />
          <Tab label={t('clubHouse:tabs.plans')} />
          <Tab label={t('clubHouse:tabs.interior')} />
          <Tab label={t('clubHouse:tabs.deck')}/>
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
                  <Typography variant="caption" color="text.secondary"> {t('clubHouse:noImagesUploaded')}</Typography>
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
                  <Typography variant="caption" color="text.secondary">{t('clubHouse:noPlansUploaded')}</Typography>
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
                  <Typography variant="caption" color="text.secondary">{t('clubHouse:noSectionsConfigured')}</Typography>
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
                            <Typography variant="caption" color="text.secondary">{t('clubHouse:noImages')}</Typography>
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