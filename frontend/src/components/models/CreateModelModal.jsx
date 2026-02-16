import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  Button,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Badge,
  Chip,
} from '@mui/material';
import {
  Home,
  Close,
  CloudUpload,
  ExpandMore,
  Balcony,
  Upgrade as UpgradeIcon,
  Storage as StorageIcon,
  Add,
  Edit,
} from '@mui/icons-material';
import uploadService from '../../services/uploadService';

const CreateModelModal = ({ 
  open, 
  onClose, 
  selectedModel, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    model: "",
    modelNumber: "",
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    sqft: 0,
    stories: 1,
    description: "",
    status: "active",
    images: { exterior: [], interior: [], blueprints: [] },
    hasBalcony: false,
    balconyPrice: 0,
    balconyImages: { exterior: [], interior: [], blueprints: [] },
    hasUpgrade: false,
    upgradePrice: 0,
    upgradeImages: { exterior: [], interior: [], blueprints: [] },
    hasStorage: false,
    storagePrice: 0,
    storageImages: { exterior: [], interior: [], blueprints: [] },
  });

  const [currentImageType, setCurrentImageType] = useState("exterior");
  const [currentImageSection, setCurrentImageSection] = useState("base");
  const [currentRoomType, setCurrentRoomType] = useState("general");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [expandedAccordions, setExpandedAccordions] = useState({
    base: true,
    balcony: false,
    upgrade: false,
    storage: false,
  });

  // ✅ Cargar datos del modelo seleccionado
  useEffect(() => {
    if (selectedModel) {
      const hasBalconyOption = selectedModel.balconies && selectedModel.balconies.length > 0;
      const hasUpgradeOption = selectedModel.upgrades && selectedModel.upgrades.length > 0;
      const hasStorageOption = selectedModel.storages && selectedModel.storages.length > 0;

      const normalizeImages = (images) => {
        if (!images) return { exterior: [], interior: [], blueprints: [] };
        return {
          exterior: Array.isArray(images.exterior) ? images.exterior : [],
          interior: Array.isArray(images.interior) ? images.interior : [],
          blueprints: [],
        };
      };

      const blueprintsObj = selectedModel.blueprints || {};
      const defaultBlueprints = Array.isArray(blueprintsObj.default) ? blueprintsObj.default : [];
      const withBalconyBlueprints = Array.isArray(blueprintsObj.withBalcony) ? blueprintsObj.withBalcony : [];
      const withStorageBlueprints = Array.isArray(blueprintsObj.withStorage) ? blueprintsObj.withStorage : [];

      setFormData({
        model: selectedModel.model,
        modelNumber: selectedModel.modelNumber || "",
        price: selectedModel.price,
        bedrooms: selectedModel.bedrooms,
        bathrooms: selectedModel.bathrooms,
        sqft: selectedModel.sqft,
        stories: selectedModel.stories || 1,
        description: selectedModel.description || "",
        status: selectedModel.status,
        images: {
          ...normalizeImages(selectedModel.images),
          blueprints: defaultBlueprints,
        },
        hasBalcony: hasBalconyOption,
        balconyPrice: hasBalconyOption ? selectedModel.balconies[0].price : 0,
        balconyImages: hasBalconyOption
          ? {
              ...normalizeImages(selectedModel.balconies[0].images),
              blueprints: withBalconyBlueprints,
            }
          : { exterior: [], interior: [], blueprints: [] },
        hasUpgrade: hasUpgradeOption,
        upgradePrice: hasUpgradeOption ? selectedModel.upgrades[0].price : 0,
        upgradeImages: hasUpgradeOption
          ? normalizeImages(selectedModel.upgrades[0].images)
          : { exterior: [], interior: [], blueprints: [] },
        hasStorage: hasStorageOption,
        storagePrice: hasStorageOption ? selectedModel.storages[0].price : 0,
        storageImages: hasStorageOption
          ? {
              ...normalizeImages(selectedModel.storages[0].images),
              blueprints: withStorageBlueprints,
            }
          : { exterior: [], interior: [], blueprints: [] },
      });

      setExpandedAccordions({
        base: true,
        balcony: hasBalconyOption,
        upgrade: hasUpgradeOption,
        storage: hasStorageOption,
      });
    } else {
      // Reset para nuevo modelo
      setFormData({
        model: "",
        modelNumber: "",
        price: 0,
        bedrooms: 0,
        bathrooms: 0,
        sqft: 0,
        stories: 1,
        description: "",
        status: "active",
        images: { exterior: [], interior: [], blueprints: [] },
        hasBalcony: false,
        balconyPrice: 0,
        balconyImages: { exterior: [], interior: [], blueprints: [] },
        hasUpgrade: false,
        upgradePrice: 0,
        upgradeImages: { exterior: [], interior: [], blueprints: [] },
        hasStorage: false,
        storagePrice: 0,
        storageImages: { exterior: [], interior: [], blueprints: [] },
      });
      setExpandedAccordions({
        base: true,
        balcony: false,
        upgrade: false,
        storage: false,
      });
    }

    setCurrentImageType("exterior");
    setCurrentImageSection("base");
    setCurrentRoomType("general");
  }, [selectedModel, open]);

  // ✅ Handlers
  const handleClose = () => {
    setCurrentImageType("exterior");
    setCurrentImageSection("base");
    setCurrentRoomType("general");
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(formData);
    handleClose();
  };

  const handleRemoveImage = (section, type, index) => {
    if (section === "base") {
      setFormData((prev) => ({
        ...prev,
        images: {
          ...prev.images,
          [type]: prev.images[type].filter((_, i) => i !== index),
        },
      }));
    } else if (section === "balcony") {
      setFormData((prev) => ({
        ...prev,
        balconyImages: {
          ...prev.balconyImages,
          [type]: prev.balconyImages[type].filter((_, i) => i !== index),
        },
      }));
    } else if (section === "upgrade") {
      setFormData((prev) => ({
        ...prev,
        upgradeImages: {
          ...prev.upgradeImages,
          [type]: prev.upgradeImages[type].filter((_, i) => i !== index),
        },
      }));
    } else if (section === "storage") {
      setFormData((prev) => ({
        ...prev,
        storageImages: {
          ...prev.storageImages,
          [type]: prev.storageImages[type].filter((_, i) => i !== index),
        },
      }));
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordions((prev) => ({
      ...prev,
      [panel]: isExpanded,
    }));
  };

  const handleFileImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImage(true);
    try {
      const urls = [];
      for (const file of files) {
        const url = await uploadService.uploadModelImage(file);
        urls.push(url);
      }
      const section = currentImageSection;
      const type = currentImageType;
      const imagesData =
        type === "interior" && currentRoomType !== "general"
          ? urls.map((url) => ({ url, roomType: currentRoomType }))
          : urls;

      if (section === "base") {
        setFormData((prev) => ({
          ...prev,
          images: {
            ...prev.images,
            [type]: [...prev.images[type], ...imagesData],
          },
        }));
      } else if (section === "balcony") {
        setFormData((prev) => ({
          ...prev,
          balconyImages: {
            ...prev.balconyImages,
            [type]: [...prev.balconyImages[type], ...imagesData],
          },
        }));
      } else if (section === "upgrade") {
        setFormData((prev) => ({
          ...prev,
          upgradeImages: {
            ...prev.upgradeImages,
            [type]: [...prev.upgradeImages[type], ...imagesData],
          },
        }));
      } else if (section === "storage") {
        setFormData((prev) => ({
          ...prev,
          storageImages: {
            ...prev.storageImages,
            [type]: [...prev.storageImages[type], ...imagesData],
          },
        }));
      }
    } catch (err) {
      alert("Error uploading image(s)");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const groupImagesByRoomType = (images) => {
    const grouped = {
      general: [],
      bedroom_closet: [],
      bedroom_no_closet: [],
      bathroom: [],
      laundry: [],
      dining: [],
      living: [],
      kitchen: [],
      hallway: [],
      garage: [],
      balcony: [],
      patio: [],
      closet: [],
    };

    images.forEach((img, originalIndex) => {
      if (typeof img === "string") {
        grouped.general.push({ url: img, originalIndex });
      } else if (img && typeof img === "object" && img.url) {
        const roomType = img.roomType || "general";
        grouped[roomType].push({ url: img.url, originalIndex, roomType });
      }
    });

    return grouped;
  };

  const getRoomTypeName = (roomType) => {
    const names = {
      general: "📷 General",
      bedroom_closet: "🛏️ Bedroom w/ Closet",
      bedroom_no_closet: "🛌 Bedroom w/o Closet",
      bathroom: "🚿 Bathroom",
      laundry: "🧺 Laundry",
      dining: "🍽️ Dining Room",
      living: "🛋️ Living Room",
      kitchen: "👨‍🍳 Kitchen",
      hallway: "🚪 Hallway",
      garage: "🚗 Garage",
      balcony: "🌳 Balcony",
      patio: "🏡 Patio",
      closet: "👔 Walk-in Closet",
    };
    return names[roomType] || roomType;
  };

  const getTotalImagesCount = () => {
    let count = 0;
    count += formData.images.exterior.length + formData.images.interior.length + formData.images.blueprints.length;
    if (formData.hasBalcony) {
      count += formData.balconyImages.exterior.length + formData.balconyImages.interior.length + formData.balconyImages.blueprints.length;
    }
    if (formData.hasUpgrade) {
      count += formData.upgradeImages.exterior.length + formData.upgradeImages.interior.length + formData.upgradeImages.blueprints.length;
    }
    if (formData.hasStorage) {
      count += formData.storageImages.exterior.length + formData.storageImages.interior.length + formData.storageImages.blueprints.length;
    }
    return count;
  };

  const calculatePricingCombinations = () => {
    const { hasBalcony, hasStorage, hasUpgrade } = formData;
    let count = 1;
    if (hasBalcony) count *= 2;
    if (hasStorage) count *= 2;
    if (hasUpgrade) count *= 2;
    return count;
  };

  const calculateMaxPrice = () => {
    const { price, hasBalcony, balconyPrice, hasUpgrade, upgradePrice, hasStorage, storagePrice } = formData;
    return price + (hasBalcony ? balconyPrice : 0) + (hasUpgrade ? upgradePrice : 0) + (hasStorage ? storagePrice : 0);
  };

  // ✅ Render helper para imágenes (evita duplicación de código)
  const renderImageGrid = (images, section, type) => {
    if (type === "interior" && images.length > 0) {
      // Agrupar por tipo de habitación
      return (
        <Stack spacing={1.5}>
          {Object.entries(groupImagesByRoomType(images))
            .filter(([_, roomImages]) => roomImages.length > 0)
            .map(([roomType, roomImages]) => (
              <Box key={roomType}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 0.5,
                    pb: 0.5,
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight="600"
                    color="text.secondary"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      fontSize: "0.7rem",
                    }}
                  >
                    {getRoomTypeName(roomType)} ({roomImages.length})
                  </Typography>
                </Box>
                <Grid container spacing={1}>
                  {roomImages.map(({ url, originalIndex }) => (
                    <Grid item xs={6} key={originalIndex}>
                      <Box
                        sx={{
                          position: "relative",
                          pt: "75%",
                          borderRadius: 1,
                          overflow: "hidden",
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <Box
                          component="img"
                          src={url}
                          alt={`${type} ${originalIndex + 1}`}
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveImage(section, type, originalIndex)}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "rgba(255,255,255,0.9)",
                            width: 24,
                            height: 24,
                            "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
        </Stack>
      );
    }

    // Exterior o Blueprints
    if (images.length > 0) {
      return (
        <Grid container spacing={1}>
          {images.map((url, index) => (
            <Grid item xs={6} key={index}>
              <Box
                sx={{
                  position: "relative",
                  pt: "75%",
                  borderRadius: 1,
                  overflow: "hidden",
                  border: "1px solid #e0e0e0",
                }}
              >
                <Box
                  component="img"
                  src={url}
                  alt={`${type} ${index + 1}`}
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveImage(section, type, index)}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    bgcolor: "rgba(255,255,255,0.9)",
                    width: 24,
                    height: 24,
                    "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
                {type === "exterior" && index === 0 && (
                  <Chip
                    label="Primary"
                    size="small"
                    color="primary"
                    sx={{
                      position: "absolute",
                      bottom: 4,
                      left: 4,
                      height: 18,
                      fontSize: "0.65rem",
                    }}
                  />
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      );
    }

    // Sin imágenes
    return (
      <Paper sx={{ p: 1.5, textAlign: "center", bgcolor: "grey.100" }}>
        <Typography variant="caption" color="text.secondary">
          No {type} images
        </Typography>
      </Paper>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      fullScreen={window.innerWidth < 960}
      PaperProps={{
        sx: {
          height: { xs: "100vh", md: "90vh" },
          maxHeight: { xs: "100vh", md: "90vh" },
          m: { xs: 0, md: 2 },
        },
      }}
    >
      <DialogTitle sx={{ pb: 2, px: { xs: 2, md: 3 } }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Home sx={{ color: 'white', fontSize: { xs: 20, md: 24 } }} />
          </Box>
          <Box flex={1} minWidth={0}>
            <Typography 
              variant="h6" 
              fontWeight={700} 
              fontSize={{ xs: "1rem", md: "1.25rem" }}
              noWrap
            >
              {selectedModel ? "Edit Model" : "Add New Model"}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6c757d' }}>
              Total Images: {getTotalImagesCount()}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
    
      <DialogContent sx={{ p: 0, overflow: "hidden" }}>
        <Box 
          display="flex" 
          height="100%"
          flexDirection={{ xs: "column", md: "row" }}
        >
          {/* LEFT SIDE - Form */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              p: { xs: 2, md: 3 },
              overflowY: "auto",
              borderRight: { xs: "none", md: "1px solid #e0e0e0" },
              borderBottom: { xs: "1px solid #e0e0e0", md: "none" },
              maxHeight: { xs: "45vh", md: "100%" },
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,0.2)",
                borderRadius: "4px",
              },
            }}
          >
            <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
              {/* Basic Info */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  fontSize={{ xs: "1rem", md: "1.25rem" }}
                  fontWeight="bold"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Home fontSize="small" /> Basic Information
                </Typography>
              </Grid>
    
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Model Name"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Model Number"
                  value={formData.modelNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, modelNumber: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Base Price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: Number(e.target.value),
                    })
                  }
                  required
                  InputProps={{
                    startAdornment: (
                      <Typography sx={{ mr: 0.5, fontSize: "0.875rem" }}>$</Typography>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Stories"
                  value={formData.stories}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stories: Number(e.target.value),
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Bedrooms"
                  value={formData.bedrooms}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bedrooms: Number(e.target.value),
                    })
                  }
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Bathrooms"
                  value={formData.bathrooms}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bathrooms: Number(e.target.value),
                    })
                  }
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Square Feet"
                  value={formData.sqft}
                  onChange={(e) =>
                    setFormData({ ...formData, sqft: Number(e.target.value) })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Grid>
    
              <Grid item xs={12}>
                <Divider sx={{ my: { xs: 1, md: 2 } }} />
              </Grid>
    
              {/* Pricing Options */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom fontSize={{ xs: "0.9rem", md: "1rem" }}>
                  Pricing Options
                </Typography>
                <Alert severity="info" sx={{ mb: 1, py: 0.5, fontSize: "0.75rem" }}>
                  Enable options to create different configurations
                </Alert>
              </Grid>
    
              {/* Balcony */}
              <Grid item xs={8}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hasBalcony}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          hasBalcony: e.target.checked,
                          balconyPrice: e.target.checked ? formData.balconyPrice : 0,
                        });
                        if (e.target.checked) {
                          setExpandedAccordions((prev) => ({ ...prev, balcony: true }));
                        }
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Balcony fontSize="small" />
                      <Typography fontWeight="600" fontSize={{ xs: "0.875rem", md: "1rem" }}>
                        Balcony
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
              {formData.hasBalcony && (
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="+ Price"
                    value={formData.balconyPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, balconyPrice: Number(e.target.value) })
                    }
                    required
                    InputProps={{
                      startAdornment: (
                        <Typography sx={{ mr: 0.5, fontSize: "0.75rem" }}>$</Typography>
                      ),
                    }}
                  />
                </Grid>
              )}
    
              {/* Upgrade */}
              <Grid item xs={8}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hasUpgrade}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          hasUpgrade: e.target.checked,
                          upgradePrice: e.target.checked ? formData.upgradePrice : 0,
                        });
                        if (e.target.checked) {
                          setExpandedAccordions((prev) => ({ ...prev, upgrade: true }));
                        }
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <UpgradeIcon fontSize="small" />
                      <Typography fontWeight="600" fontSize={{ xs: "0.875rem", md: "1rem" }}>
                        Upgrade
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
              {formData.hasUpgrade && (
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="+ Price"
                    value={formData.upgradePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, upgradePrice: Number(e.target.value) })
                    }
                    required
                    InputProps={{
                      startAdornment: (
                        <Typography sx={{ mr: 0.5, fontSize: "0.75rem" }}>$</Typography>
                      ),
                    }}
                  />
                </Grid>
              )}
    
              {/* Storage */}
              <Grid item xs={8}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hasStorage}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          hasStorage: e.target.checked,
                          storagePrice: e.target.checked ? formData.storagePrice : 0,
                        });
                        if (e.target.checked) {
                          setExpandedAccordions((prev) => ({ ...prev, storage: true }));
                        }
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <StorageIcon fontSize="small" />
                      <Typography fontWeight="600" fontSize={{ xs: "0.875rem", md: "1rem" }}>
                        Storage
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
              {formData.hasStorage && (
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="+ Price"
                    value={formData.storagePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, storagePrice: Number(e.target.value) })
                    }
                    required
                    InputProps={{
                      startAdornment: (
                        <Typography sx={{ mr: 0.5, fontSize: "0.75rem" }}>$</Typography>
                      ),
                    }}
                  />
                </Grid>
              )}
    
              {/* Price Summary */}
              {(formData.hasBalcony || formData.hasUpgrade || formData.hasStorage) && (
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: { xs: 1.5, md: 2 },
                      bgcolor: "success.50",
                      border: "1px solid",
                      borderColor: "success.200",
                    }}
                  >
                    <Typography variant="caption" fontWeight="bold" gutterBottom display="block">
                      Price Range Summary
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={0.5} flexWrap="wrap" gap={1}>
                      <Typography variant="caption">
                        Min: <strong>${formData.price.toLocaleString()}</strong>
                      </Typography>
                      <Typography variant="caption">
                        Max: <strong>${calculateMaxPrice().toLocaleString()}</strong>
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      <strong>{calculatePricingCombinations()}</strong> combinations
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
    
          {/* RIGHT SIDE - Images */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              display: "flex",
              flexDirection: "column",
              bgcolor: "#fafafa",
              maxHeight: { xs: "55vh", md: "100%" },
            }}
          >
            {/* Add Image Control */}
            <Box
              sx={{
                p: { xs: 1.5, md: 2 },
                borderBottom: "1px solid #e0e0e0",
                bgcolor: "white",
              }}
            >
              <Typography variant="caption" fontWeight="bold" gutterBottom display="block">
                Add Images
              </Typography>
              <Grid container spacing={0.5}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Section"
                    value={currentImageSection}
                    onChange={(e) => setCurrentImageSection(e.target.value)}
                    sx={{ "& .MuiInputBase-root": { fontSize: "0.875rem" } }}
                  >
                    <MenuItem value="base">Base</MenuItem>
                    {formData.hasBalcony && <MenuItem value="balcony">Balcony</MenuItem>}
                    {formData.hasUpgrade && <MenuItem value="upgrade">Upgrade</MenuItem>}
                    {formData.hasStorage && <MenuItem value="storage">Storage</MenuItem>}
                  </TextField>
                </Grid>
                
                <Grid item xs={currentImageType === "interior" ? 5 : 6} sm={currentImageType === "interior" ? 2.5 : 3}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Type"
                    value={currentImageType}
                    onChange={(e) => {
                      setCurrentImageType(e.target.value);
                      if (e.target.value !== "interior") {
                        setCurrentRoomType("general");
                      }
                    }}
                    sx={{ "& .MuiInputBase-root": { fontSize: "0.875rem" } }}
                  >
                    <MenuItem value="exterior">Exterior</MenuItem>
                    <MenuItem value="interior">Interior</MenuItem>
                    <MenuItem value="blueprints">Blueprints</MenuItem>
                  </TextField>
                </Grid>
    
                {currentImageType === "interior" && (
                  <Grid item xs={7} sm={2.5}>
                    <TextField
                      fullWidth
                      size="small"
                      select
                      label="Room"
                      value={currentRoomType}
                      onChange={(e) => setCurrentRoomType(e.target.value)}
                      sx={{ "& .MuiInputBase-root": { fontSize: "0.875rem" } }}
                    >
                      <MenuItem value="general">General</MenuItem>
                      <MenuItem value="bedroom_closet">Bed+</MenuItem>
                      <MenuItem value="bedroom_no_closet">Bed</MenuItem>
                      <MenuItem value="bathroom">Bath</MenuItem>
                      <MenuItem value="kitchen">Kitchen</MenuItem>
                      <MenuItem value="living">Living</MenuItem>
                      <MenuItem value="dining">Dining</MenuItem>
                      <MenuItem value="garage">Garage</MenuItem>
                    </TextField>
                  </Grid>
                )}
    
                <Grid item xs={12} sm={currentImageType === "interior" ? 3 : 5}>
                  <Button
                    variant="contained"
                    component="label"
                    disabled={uploadingImage}
                    size="small"
                    fullWidth
                    startIcon={<CloudUpload />}
                    sx={{ height: "40px", fontSize: "0.75rem" }}
                  >
                    {uploadingImage ? "..." : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      multiple
                      onChange={handleFileImageUpload}
                    />
                  </Button>
                </Grid>
              </Grid>
            </Box>
    
            {/* Accordions Preview */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                p: { xs: 1, md: 2 },
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(0,0,0,0.2)",
                  borderRadius: "3px",
                },
              }}
            >
              {/* BASE MODEL ACCORDION */}
              <Accordion
                expanded={expandedAccordions.base}
                onChange={handleAccordionChange("base")}
                sx={{ mb: 0.5, "& .MuiAccordionSummary-root": { minHeight: { xs: 40, md: 48 } } }}
              >
                <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
                  <Box display="flex" alignItems="center" gap={0.5} width="100%">
                    <Home color="primary" fontSize="small" />
                    <Typography fontWeight="bold" fontSize={{ xs: "0.875rem", md: "1rem" }}>
                      Base Model
                    </Typography>
                    <Badge
                      badgeContent={
                        formData.images.exterior.length +
                        formData.images.interior.length +
                        formData.images.blueprints.length
                      }
                      color="primary"
                      sx={{ ml: "auto", mr: 1 }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: { xs: 1, md: 2 } }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                        Exterior ({formData.images.exterior.length})
                      </Typography>
                      {renderImageGrid(formData.images.exterior, "base", "exterior")}
                    </Box>
                    <Box>
                      <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                        Interior ({formData.images.interior.length})
                      </Typography>
                      {renderImageGrid(formData.images.interior, "base", "interior")}
                    </Box>
                    <Box>
                      <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                        Blueprints ({formData.images.blueprints.length})
                      </Typography>
                      {renderImageGrid(formData.images.blueprints, "base", "blueprints")}
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* BALCONY ACCORDION */}
              {formData.hasBalcony && (
                <Accordion
                  expanded={expandedAccordions.balcony}
                  onChange={handleAccordionChange("balcony")}
                  sx={{ mb: 0.5, "& .MuiAccordionSummary-root": { minHeight: { xs: 40, md: 48 } } }}
                >
                  <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
                    <Box display="flex" alignItems="center" gap={0.5} width="100%">
                      <Balcony color="info" fontSize="small" />
                      <Typography fontWeight="bold" fontSize={{ xs: "0.875rem", md: "1rem" }}>
                        With Balcony
                      </Typography>
                      <Badge
                        badgeContent={
                          formData.balconyImages.exterior.length +
                          formData.balconyImages.interior.length +
                          formData.balconyImages.blueprints.length
                        }
                        color="info"
                        sx={{ ml: "auto", mr: 1 }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: { xs: 1, md: 2 } }}>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                          Exterior ({formData.balconyImages.exterior.length})
                        </Typography>
                        {renderImageGrid(formData.balconyImages.exterior, "balcony", "exterior")}
                      </Box>
                      <Box>
                        <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                          Interior ({formData.balconyImages.interior.length})
                        </Typography>
                        {renderImageGrid(formData.balconyImages.interior, "balcony", "interior")}
                      </Box>
                      <Box>
                        <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                          Blueprints ({formData.balconyImages.blueprints.length})
                        </Typography>
                        {renderImageGrid(formData.balconyImages.blueprints, "balcony", "blueprints")}
                      </Box>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* UPGRADE ACCORDION */}
              {formData.hasUpgrade && (
                <Accordion
                  expanded={expandedAccordions.upgrade}
                  onChange={handleAccordionChange("upgrade")}
                  sx={{ mb: 0.5, "& .MuiAccordionSummary-root": { minHeight: { xs: 40, md: 48 } } }}
                >
                  <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
                    <Box display="flex" alignItems="center" gap={0.5} width="100%">
                      <UpgradeIcon color="secondary" fontSize="small" />
                      <Typography fontWeight="bold" fontSize={{ xs: "0.875rem", md: "1rem" }}>
                        With Upgrade
                      </Typography>
                      <Badge
                        badgeContent={
                          formData.upgradeImages.exterior.length +
                          formData.upgradeImages.interior.length +
                          formData.upgradeImages.blueprints.length
                        }
                        color="secondary"
                        sx={{ ml: "auto", mr: 1 }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: { xs: 1, md: 2 } }}>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                          Exterior ({formData.upgradeImages.exterior.length})
                        </Typography>
                        {renderImageGrid(formData.upgradeImages.exterior, "upgrade", "exterior")}
                      </Box>
                      <Box>
                        <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                          Interior ({formData.upgradeImages.interior.length})
                        </Typography>
                        {renderImageGrid(formData.upgradeImages.interior, "upgrade", "interior")}
                      </Box>
                      <Box>
                        <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                          Blueprints ({formData.upgradeImages.blueprints.length})
                        </Typography>
                        {renderImageGrid(formData.upgradeImages.blueprints, "upgrade", "blueprints")}
                      </Box>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* STORAGE ACCORDION */}
              {formData.hasStorage && (
                <Accordion
                  expanded={expandedAccordions.storage}
                  onChange={handleAccordionChange("storage")}
                  sx={{ mb: 0.5, "& .MuiAccordionSummary-root": { minHeight: { xs: 40, md: 48 } } }}
                >
                  <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
                    <Box display="flex" alignItems="center" gap={0.5} width="100%">
                      <StorageIcon color="success" fontSize="small" />
                      <Typography fontWeight="bold" fontSize={{ xs: "0.875rem", md: "1rem" }}>
                        With Storage
                      </Typography>
                      <Badge
                        badgeContent={
                          formData.storageImages.exterior.length +
                          formData.storageImages.interior.length +
                          formData.storageImages.blueprints.length
                        }
                        color="success"
                        sx={{ ml: "auto", mr: 1 }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: { xs: 1, md: 2 } }}>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                          Exterior ({formData.storageImages.exterior.length})
                        </Typography>
                        {renderImageGrid(formData.storageImages.exterior, "storage", "exterior")}
                      </Box>
                      <Box>
                        <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                          Interior ({formData.storageImages.interior.length})
                        </Typography>
                        {renderImageGrid(formData.storageImages.interior, "storage", "interior")}
                      </Box>
                      <Box>
                        <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                          Blueprints ({formData.storageImages.blueprints.length})
                        </Typography>
                        {renderImageGrid(formData.storageImages.blueprints, "storage", "blueprints")}
                      </Box>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
    
      <DialogActions sx={{ px: { xs: 2, md: 3 }, py: 1.5, borderTop: "1px solid #e0e0e0", gap: 1 }}>
        <Button
          onClick={handleClose}
          size="small"
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 2,
            fontSize: "0.875rem"
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="small"
          startIcon={selectedModel ? <Edit fontSize="small" /> : <Add fontSize="small" />}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
            color: 'white',
            fontWeight: 700,
            textTransform: 'none',
            px: 3,
            fontSize: "0.875rem",
            boxShadow: '0 4px 12px rgba(74, 124, 89, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #3d664a 0%, #7ba843 100%)',
            }
          }}
        >
          {selectedModel ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateModelModal;