import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import {
  Close,
  PhotoLibrary,
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@mui/icons-material';

const GalleryModal = ({ open, onClose, model }) => {
  const [galleryTab, setGalleryTab] = useState(0);
  const [galleryImageIndex, setGalleryImageIndex] = useState(0);

  // ✅ Función para obtener categorías de imágenes
  const getGalleryCategories = () => {
    if (!model) return [];

    const categories = [];
    const hasBalcony = model.balconies && model.balconies.length > 0;
    const hasUpgrade = model.upgrades && model.upgrades.length > 0;

    // BASE SIN BALCÓN (Exterior base + Interior base)
    categories.push({
      label: "Base Model (Without Balcony)",
      key: "base",
      exteriorImages: model.images?.exterior || [],
      interiorImages: model.images?.interior || [],
    });

    // BASE CON BALCÓN (Exterior balcón + Interior base)
    if (hasBalcony) {
      categories.push({
        label: `Base + ${model.balconies[0].name}`,
        key: "base-balcony",
        exteriorImages: model.balconies[0].images?.exterior || [],
        interiorImages: model.images?.interior || [], // ✅ Interior base (no cambia)
      });
    }

    // UPGRADE SIN BALCÓN (Exterior base + Interior upgrade)
    if (hasUpgrade) {
      categories.push({
        label: `${model.upgrades[0].name} (Without Balcony)`,
        key: "upgrade",
        exteriorImages: model.images?.exterior || [], // ✅ Exterior base (no cambia)
        interiorImages: model.upgrades[0].images?.interior || [],
      });
    }

    // UPGRADE CON BALCÓN (Exterior balcón + Interior upgrade)
    if (hasUpgrade && hasBalcony) {
      categories.push({
        label: `${model.upgrades[0].name} + ${model.balconies[0].name}`,
        key: "upgrade-balcony",
        exteriorImages: model.balconies[0].images?.exterior || [], // ✅ Exterior balcón
        interiorImages: model.upgrades[0].images?.interior || [], // ✅ Interior upgrade
      });
    }

    return categories;
  };

  // ✅ Obtener imágenes de la categoría actual
  const getCurrentGalleryImages = () => {
    const categories = getGalleryCategories();
    if (categories.length === 0 || galleryTab >= categories.length) return [];

    const category = categories[galleryTab];
    return [...category.exteriorImages, ...category.interiorImages];
  };

  // ✅ Obtener label de imagen actual
  const getCurrentImageLabel = () => {
    const categories = getGalleryCategories();
    if (categories.length === 0 || galleryTab >= categories.length) return "";

    const category = categories[galleryTab];
    const exteriorCount = category.exteriorImages.length;

    if (galleryImageIndex < exteriorCount) {
      return `Exterior ${galleryImageIndex + 1} de ${exteriorCount}`;
    } else {
      return `Interior ${galleryImageIndex - exteriorCount + 1} de ${category.interiorImages.length}`;
    }
  };

  // ✅ Navegación de imágenes
  const handlePrevImage = () => {
    const images = getCurrentGalleryImages();
    setGalleryImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    const images = getCurrentGalleryImages();
    setGalleryImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // ✅ Reset al cerrar
  const handleClose = () => {
    setGalleryTab(0);
    setGalleryImageIndex(0);
    onClose();
  };

  const categories = getGalleryCategories();
  const currentImages = getCurrentGalleryImages();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "90vh",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: "1px solid #e0e0e0", pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <PhotoLibrary color="primary" />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {model?.model} - Image Gallery
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Browse all images by configuration
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {model && (
          <>
            {/* Tabs para categorías */}
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Tabs
                value={galleryTab}
                onChange={(e, newValue) => {
                  setGalleryTab(newValue);
                  setGalleryImageIndex(0);
                }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ px: 2 }}
              >
                {categories.map((category) => (
                  <Tab
                    key={category.key}
                    label={category.label}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Carrusel de imágenes */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#000",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {currentImages.length > 0 ? (
                <>
                  <Box
                    component="img"
                    src={currentImages[galleryImageIndex]}
                    alt={getCurrentImageLabel()}
                    sx={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />

                  {/* Controles de navegación */}
                  {currentImages.length > 1 && (
                    <>
                      <IconButton
                        onClick={handlePrevImage}
                        sx={{
                          position: "absolute",
                          left: 16,
                          top: "50%",
                          transform: "translateY(-50%)",
                          bgcolor: "rgba(255,255,255,0.9)",
                          "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                        }}
                      >
                        <KeyboardArrowLeft />
                      </IconButton>
                      <IconButton
                        onClick={handleNextImage}
                        sx={{
                          position: "absolute",
                          right: 16,
                          top: "50%",
                          transform: "translateY(-50%)",
                          bgcolor: "rgba(255,255,255,0.9)",
                          "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                        }}
                      >
                        <KeyboardArrowRight />
                      </IconButton>
                    </>
                  )}

                  {/* Contador de imágenes */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 16,
                      left: "50%",
                      transform: "translateX(-50%)",
                      bgcolor: "rgba(0,0,0,0.7)",
                      color: "white",
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" fontWeight="600">
                      {getCurrentImageLabel()} • {galleryImageIndex + 1} / {currentImages.length}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: "center", color: "white", p: 4 }}>
                  <PhotoLibrary sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6">
                    No images available for this configuration
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Miniaturas */}
            <Box
              sx={{
                p: 2,
                borderTop: "1px solid #e0e0e0",
                bgcolor: "background.paper",
                overflowX: "auto",
                display: "flex",
                gap: 1,
              }}
            >
              {currentImages.map((img, index) => (
                <Box
                  key={index}
                  onClick={() => setGalleryImageIndex(index)}
                  sx={{
                    width: 80,
                    height: 60,
                    flexShrink: 0,
                    cursor: "pointer",
                    border:
                      galleryImageIndex === index
                        ? "3px solid #1976d2"
                        : "2px solid #e0e0e0",
                    borderRadius: 1,
                    overflow: "hidden",
                    opacity: galleryImageIndex === index ? 1 : 0.6,
                    transition: "all 0.2s",
                    "&:hover": {
                      opacity: 1,
                      borderColor: "#1976d2",
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              ))}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: "1px solid #e0e0e0", p: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GalleryModal;