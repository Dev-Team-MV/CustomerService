import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Container,
  CircularProgress
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Home,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Balcony,
  Upgrade as UpgradeIcon,
  Storage as StorageIcon,
  PhotoLibrary,
  Bathtub,
  Bed,
  SquareFoot,
  Layers  
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import GalleryModal from "../components/models/GalleryModal";
import CreateModelModal from "../components/models/CreateModelModal";
import CreateFacade from "../components/models/CreateFacade";

const Models = () => {
  const navigate = useNavigate();

  // Estados
  const [models, setModels] = useState([]);
  const [facades, setFacades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openFacadeDialog, setOpenFacadeDialog] = useState(false);
  const [openGalleryDialog, setOpenGalleryDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedFacade, setSelectedFacade] = useState(null);
  const [selectedModelForFacades, setSelectedModelForFacades] = useState(null);
  const [selectedModelForGallery, setSelectedModelForGallery] = useState(null);
  const [modelImageIndices, setModelImageIndices] = useState({});
  const [facadeImageIndices, setFacadeImageIndices] = useState({});

  useEffect(() => {
    const initData = async () => {
      await fetchModels();
      await fetchFacades();
    };
    initData();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await api.get("/models");
      setModels(response.data);
      const indices = {};
      response.data.forEach((model) => {
        indices[model._id] = 0;
      });
      setModelImageIndices(indices);
    } catch (error) {
      console.error("Error fetching models:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacades = async () => {
    try {
      const response = await api.get("/facades");
      const validFacades = response.data.filter((facade) => {
        if (!facade.model) {
          console.warn("⚠️ Facade without model found:", facade._id);
          return false;
        }
        return true;
      });
      setFacades(validFacades);
      const indices = {};
      validFacades.forEach((facade) => {
        indices[facade._id] = 0;
      });
      setFacadeImageIndices(indices);
    } catch (error) {
      console.error("Error fetching facades:", error);
    }
  };

  const handlePrevModelImage = (e, modelId, imagesLength) => {
    e.stopPropagation();
    setModelImageIndices((prev) => ({
      ...prev,
      [modelId]: prev[modelId] > 0 ? prev[modelId] - 1 : imagesLength - 1,
    }));
  };

  const handleNextModelImage = (e, modelId, imagesLength) => {
    e.stopPropagation();
    setModelImageIndices((prev) => ({
      ...prev,
      [modelId]: prev[modelId] < imagesLength - 1 ? prev[modelId] + 1 : 0,
    }));
  };

  const handleOpenGallery = (model) => {
    setSelectedModelForGallery(model);
    setOpenGalleryDialog(true);
  };

  const handleCloseGallery = () => {
    setOpenGalleryDialog(false);
    setSelectedModelForGallery(null);
  };

  const handleOpenDialog = (model = null) => {
    setSelectedModel(model);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedModel(null);
  };

  const handleSubmitModel = async (formData) => {
    try {
      const blueprints = {
        default: Array.isArray(formData.images?.blueprints) ? formData.images.blueprints : [],
        withBalcony: Array.isArray(formData.balconyImages?.blueprints) ? formData.balconyImages.blueprints : [],
        withStorage: Array.isArray(formData.storageImages?.blueprints) ? formData.storageImages.blueprints : [],
        withBalconyAndStorage:
          Array.isArray(formData.balconyImages?.blueprints) && Array.isArray(formData.storageImages?.blueprints)
            ? [...formData.balconyImages.blueprints, ...formData.storageImages.blueprints]
            : [],
      };

      const balconies = [];
      if (formData.hasBalcony && formData.balconyPrice > 0) {
        balconies.push({
          name: "Balcony Option",
          price: formData.balconyPrice,
          description: "Balcony add-on for this model",
          sqft: 0,
          images: {
            exterior: Array.isArray(formData.balconyImages?.exterior) ? formData.balconyImages.exterior : [],
            interior: Array.isArray(formData.balconyImages?.interior) ? formData.balconyImages.interior : [],
          },
          status: "active",
        });
      }

      const upgrades = [];
      if (formData.hasUpgrade && formData.upgradePrice > 0) {
        upgrades.push({
          name: "Upgrade Option",
          price: formData.upgradePrice,
          description: "Premium upgrade for this model",
          features: [],
          images: {
            exterior: Array.isArray(formData.upgradeImages?.exterior) ? formData.upgradeImages.exterior : [],
            interior: Array.isArray(formData.upgradeImages?.interior) ? formData.upgradeImages.interior : [],
          },
          status: "active",
        });
      }

      const storages = [];
      if (formData.hasStorage && formData.storagePrice > 0) {
        storages.push({
          name: "Storage Option",
          price: formData.storagePrice,
          description: "Additional storage space",
          sqft: 0,
          images: {
            exterior: Array.isArray(formData.storageImages?.exterior) ? formData.storageImages.exterior : [],
            interior: Array.isArray(formData.storageImages?.interior) ? formData.storageImages.interior : [],
          },
          status: "active",
        });
      }

      const dataToSend = {
        model: formData.model,
        modelNumber: formData.modelNumber,
        price: formData.price,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        sqft: formData.sqft,
        stories: formData.stories,
        description: formData.description,
        status: formData.status,
        images: {
          exterior: Array.isArray(formData.images?.exterior) ? formData.images.exterior : [],
          interior: Array.isArray(formData.images?.interior) ? formData.images.interior : [],
        },
        blueprints,
        balconies,
        upgrades,
        storages,
      };

      if (selectedModel) {
        await api.put(`/models/${selectedModel._id}`, dataToSend);
      } else {
        await api.post("/models", dataToSend);
      }

      fetchModels();
    } catch (error) {
      console.error("❌ Error saving model:", error);
      alert(error.response?.data?.message || "Error saving model");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this model?")) {
      try {
        await api.delete(`/models/${id}`);
        fetchModels();
      } catch (error) {
        console.error("Error deleting model:", error);
        alert(error.response?.data?.message || "Error deleting model");
      }
    }
  };

  const handleGoToDetail = (modelId) => {
    navigate(`/models/${modelId}`);
  };

  const handleOpenFacadeDialog = (model, facade = null) => {
    setSelectedModelForFacades(model);
    setSelectedFacade(facade);
    setOpenFacadeDialog(true);
  };

  const handleCloseFacadeDialog = () => {
    setOpenFacadeDialog(false);
    setSelectedFacade(null);
    setSelectedModelForFacades(null);
  };

  const handleSubmitFacade = async (facadeFormData, selectedFacade) => {
    try {
      if (selectedFacade) {
        await api.put(`/facades/${selectedFacade._id}`, facadeFormData);
      } else {
        await api.post("/facades", facadeFormData);
      }
      fetchFacades();
    } catch (error) {
      console.error("Error saving facade:", error);
      alert(error.response?.data?.message || "Error saving facade");
    }
  };

  const handleDeleteFacade = async (id) => {
    if (window.confirm("Are you sure you want to delete this facade?")) {
      try {
        await api.delete(`/facades/${id}`);
        fetchFacades();
      } catch (error) {
        console.error("Error deleting facade:", error);
        alert(error.response?.data?.message || "Error deleting facade");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return { bg: 'rgba(140, 165, 81, 0.12)', color: '#333F1F', border: 'rgba(140, 165, 81, 0.3)' }
      case "draft":
        return { bg: 'rgba(229, 134, 60, 0.12)', color: '#E5863C', border: 'rgba(229, 134, 60, 0.3)' }
      case "inactive":
        return { bg: 'rgba(112, 111, 111, 0.12)', color: '#706f6f', border: 'rgba(112, 111, 111, 0.3)' }
      default:
        return { bg: 'rgba(112, 111, 111, 0.12)', color: '#706f6f', border: 'rgba(112, 111, 111, 0.3)' }
    }
  };

  const getModelFacades = (modelId) => {
    return facades.filter((f) => {
      if (!f || !f.model) return false;
      if (typeof f.model === "object" && f.model !== null) {
        return f.model._id === modelId;
      }
      return f.model === modelId;
    });
  };

  const getFacadeImages = (facade) => {
    if (Array.isArray(facade.url)) {
      return facade.url;
    }
    return facade.url ? [facade.url] : [];
  };

  const hasPricingOptions = (model) => {
    return (
      (model.balconies && model.balconies.length > 0) ||
      (model.upgrades && model.upgrades.length > 0) ||
      (model.storages && model.storages.length > 0)
    );
  };

  const getAllModelImages = (model) => {
    return [
      ...(model.images?.exterior || []),
      ...(model.images?.interior || []),
      ...(model.images?.blueprints || []),
    ];
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="xl">
        {/* ✅ HEADER - Mismo estilo que otros componentes */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              mb: 4,
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
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 56, md: 64 },
                      height: { xs: 56, md: 64 },
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(51, 63, 31, 0.3)'
                    }}
                  >
                    <Home sx={{ fontSize: { xs: 28, md: 32 }, color: 'white' }} />
                  </Box>
                </motion.div>

                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: '#333F1F',
                      fontFamily: '"Poppins", sans-serif',
                      letterSpacing: '0.5px',
                      fontSize: { xs: '1.75rem', md: '2.125rem' }
                    }}
                  >
                    Property Models & Facades
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#706f6f',
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: { xs: '0.875rem', md: '1rem' }
                    }}
                  >
                    Manage floorplans, facades, pricing, and availability
                  </Typography>
                </Box>
              </Box>

              <Tooltip title="Add New Model" placement="left">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    onClick={() => handleOpenDialog()}
                    startIcon={<Add />}
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
                        '&::before': {
                          left: 0
                        },
                        '& .MuiButton-startIcon': {
                          color: 'white'
                        }
                      },
                      '& .MuiButton-startIcon': {
                        position: 'relative',
                        zIndex: 1,
                        color: 'white'
                      }
                    }}
                  >
                    <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
                      Add New Model
                    </Box>
                  </Button>
                </motion.div>
              </Tooltip>
            </Box>
          </Paper>
        </motion.div>

        {/* ✅ MODELS GRID - 2 COLUMNAS */}
        <AnimatePresence mode="wait">
          {loading ? (
            <Box display="flex" justifyContent="center" p={6}>
              <CircularProgress sx={{ color: '#333F1F' }} />
            </Box>
          ) : models.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 8,
                  borderRadius: 4,
                  textAlign: 'center',
                  border: '2px dashed rgba(140, 165, 81, 0.3)',
                  bgcolor: 'rgba(140, 165, 81, 0.03)'
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 4,
                    bgcolor: 'rgba(140, 165, 81, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 2
                  }}
                >
                  <Home sx={{ fontSize: 40, color: '#8CA551' }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#333F1F',
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
                    mb: 1
                  }}
                >
                  No models found
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif',
                    mb: 3
                  }}
                >
                  Create your first property model to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                  sx={{
                    borderRadius: 3,
                    bgcolor: '#333F1F',
                    textTransform: 'none',
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    px: 4,
                    '&:hover': {
                      bgcolor: '#8CA551'
                    }
                  }}
                >
                  Add New Model
                </Button>
              </Paper>
            </motion.div>
          ) : (
            <Grid container spacing={3}>
              {models.map((model, index) => {
                const modelFacades = getModelFacades(model._id);
                const allImages = getAllModelImages(model);
                const currentModelImageIndex = modelImageIndices[model._id] || 0;
                const currentModelImage = allImages[currentModelImageIndex];
                const statusColors = getStatusColor(model.status);

                return (
                  <Grid item xs={12} lg={6} key={model._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card
                        sx={{
                          borderRadius: 4,
                          boxShadow: "0 4px 16px rgba(51, 63, 31, 0.08)",
                          transition: "all 0.3s",
                          border: '1px solid rgba(140, 165, 81, 0.15)',
                          bgcolor: 'white',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          "&:hover": { 
                            boxShadow: "0 12px 32px rgba(51, 63, 31, 0.12)",
                            borderColor: '#8CA551',
                            transform: 'translateY(-4px)'
                          },
                          position: "relative",
                          overflow: "visible",
                        }}
                      >
                        {/* STATUS CHIP */}
                        <Chip
                          label={model.status}
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            fontWeight: 700,
                            zIndex: 2,
                            textTransform: "capitalize",
                            fontFamily: '"Poppins", sans-serif',
                            letterSpacing: '0.5px',
                            fontSize: '0.7rem',
                            height: 26,
                            bgcolor: statusColors.bg,
                            color: statusColors.color,
                            border: `1px solid ${statusColors.border}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        />

                        <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                          {/* IMAGEN + INFO BÁSICA */}
                          <Box display="flex" gap={2} mb={2.5}>
                            <Box
                              sx={{
                                width: 120,
                                height: 120,
                                borderRadius: 3,
                                overflow: "hidden",
                                position: "relative",
                                bgcolor: "rgba(112, 111, 111, 0.05)",
                                flexShrink: 0,
                                border: '2px solid rgba(140, 165, 81, 0.15)'
                              }}
                            >
                              {currentModelImage ? (
                                <>
                                  <Box
                                    component="img"
                                    src={currentModelImage}
                                    alt={model.model}
                                    sx={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                  <Chip
                                    label={`${currentModelImageIndex + 1}/${allImages.length}`}
                                    size="small"
                                    sx={{
                                      position: "absolute",
                                      bottom: 6,
                                      right: 6,
                                      bgcolor: "rgba(51, 63, 31, 0.9)",
                                      backdropFilter: 'blur(8px)',
                                      color: "white",
                                      height: 22,
                                      fontSize: "0.65rem",
                                      fontWeight: 600,
                                      fontFamily: '"Poppins", sans-serif'
                                    }}
                                  />
                                  {allImages.length > 1 && (
                                    <>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => handlePrevModelImage(e, model._id, allImages.length)}
                                        sx={{
                                          position: "absolute",
                                          left: 4,
                                          top: "50%",
                                          transform: "translateY(-50%)",
                                          bgcolor: "rgba(255,255,255,0.9)",
                                          width: 24,
                                          height: 24,
                                          "&:hover": { bgcolor: "white" }
                                        }}
                                      >
                                        <ChevronLeft sx={{ fontSize: 16 }} />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => handleNextModelImage(e, model._id, allImages.length)}
                                        sx={{
                                          position: "absolute",
                                          right: 4,
                                          top: "50%",
                                          transform: "translateY(-50%)",
                                          bgcolor: "rgba(255,255,255,0.9)",
                                          width: 24,
                                          height: 24,
                                          "&:hover": { bgcolor: "white" }
                                        }}
                                      >
                                        <ChevronRight sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </>
                                  )}
                                </>
                              ) : (
                                <Home sx={{ fontSize: 40, color: "#706f6f", opacity: 0.4 }} />
                              )}
                            </Box>

                            <Box flex={1} minWidth={0}>
                              <Typography 
                                variant="h6" 
                                fontWeight={700} 
                                noWrap
                                sx={{
                                  fontFamily: '"Poppins", sans-serif',
                                  color: '#333F1F',
                                  letterSpacing: '0.5px',
                                  mb: 0.5
                                }}
                              >
                                {model.model}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: '#706f6f',
                                  fontFamily: '"Poppins", sans-serif',
                                  display: 'block',
                                  mb: 1.5
                                }}
                              >
                                #{model.modelNumber}
                              </Typography>
                              <Box
                                sx={{
                                  bgcolor: "rgba(140, 165, 81, 0.08)",
                                  border: "2px solid rgba(140, 165, 81, 0.25)",
                                  borderRadius: 2,
                                  px: 2,
                                  py: 0.8,
                                  display: "inline-block",
                                }}
                              >
                                <Typography 
                                  variant="body2" 
                                  fontWeight={700}
                                  sx={{
                                    color: '#333F1F',
                                    fontFamily: '"Poppins", sans-serif',
                                    letterSpacing: '0.5px'
                                  }}
                                >
                                  ${model.price?.toLocaleString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          {/* SPECS */}
                          <Box 
                            display="flex" 
                            gap={2} 
                            mb={2}
                            flexWrap="wrap"
                            sx={{
                              p: 1.5,
                              bgcolor: 'rgba(140, 165, 81, 0.03)',
                              borderRadius: 2,
                              border: '1px solid rgba(140, 165, 81, 0.1)'
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={0.8}>
                              <Bed sx={{ fontSize: 18, color: "#333F1F" }} />
                              <Typography 
                                variant="caption"
                                sx={{ 
                                  fontFamily: '"Poppins", sans-serif',
                                  fontWeight: 600,
                                  color: '#706f6f'
                                }}
                              >
                                {model.bedrooms}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.8}>
                              <Bathtub sx={{ fontSize: 18, color: "#8CA551" }} />
                              <Typography 
                                variant="caption"
                                sx={{ 
                                  fontFamily: '"Poppins", sans-serif',
                                  fontWeight: 600,
                                  color: '#706f6f'
                                }}
                              >
                                {model.bathrooms}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.8}>
                              <SquareFoot sx={{ fontSize: 18, color: "#E5863C" }} />
                              <Typography 
                                variant="caption"
                                sx={{ 
                                  fontFamily: '"Poppins", sans-serif',
                                  fontWeight: 600,
                                  color: '#706f6f'
                                }}
                              >
                                {model.sqft?.toLocaleString()}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.8}>
                              <Layers sx={{ fontSize: 18, color: "#706f6f" }} />
                              <Typography 
                                variant="caption"
                                sx={{ 
                                  fontFamily: '"Poppins", sans-serif',
                                  fontWeight: 600,
                                  color: '#706f6f'
                                }}
                              >
                                {model.stories || 1}
                              </Typography>
                            </Box>
                          </Box>

                          {/* PRICING OPTIONS */}
                          {hasPricingOptions(model) && (
                            <Box display="flex" gap={0.8} mb={2} flexWrap="wrap">
                              {model.balconies?.length > 0 && (
                                <Chip
                                  icon={<Balcony sx={{ fontSize: 14 }} />}
                                  label={`+$${(model.balconies[0].price / 1000).toFixed(0)}K`}
                                  size="small"
                                  sx={{ 
                                    height: 24,
                                    bgcolor: 'rgba(140, 165, 81, 0.12)',
                                    color: '#333F1F',
                                    fontWeight: 600,
                                    border: '1px solid rgba(140, 165, 81, 0.3)',
                                    fontFamily: '"Poppins", sans-serif',
                                    fontSize: '0.7rem',
                                    '& .MuiChip-icon': { color: '#8CA551' }
                                  }}
                                />
                              )}
                              {model.upgrades?.length > 0 && (
                                <Chip
                                  icon={<UpgradeIcon sx={{ fontSize: 14 }} />}
                                  label={`+$${(model.upgrades[0].price / 1000).toFixed(0)}K`}
                                  size="small"
                                  sx={{ 
                                    height: 24,
                                    bgcolor: 'rgba(229, 134, 60, 0.12)',
                                    color: '#E5863C',
                                    fontWeight: 600,
                                    border: '1px solid rgba(229, 134, 60, 0.3)',
                                    fontFamily: '"Poppins", sans-serif',
                                    fontSize: '0.7rem',
                                    '& .MuiChip-icon': { color: '#E5863C' }
                                  }}
                                />
                              )}
                              {model.storages?.length > 0 && (
                                <Chip
                                  icon={<StorageIcon sx={{ fontSize: 14 }} />}
                                  label={`+$${(model.storages[0].price / 1000).toFixed(0)}K`}
                                  size="small"
                                  sx={{ 
                                    height: 24,
                                    bgcolor: 'rgba(112, 111, 111, 0.12)',
                                    color: '#706f6f',
                                    fontWeight: 600,
                                    border: '1px solid rgba(112, 111, 111, 0.3)',
                                    fontFamily: '"Poppins", sans-serif',
                                    fontSize: '0.7rem',
                                    '& .MuiChip-icon': { color: '#706f6f' }
                                  }}
                                />
                              )}
                            </Box>
                          )}

                          {/* ACTIONS */}
                          <Box display="flex" gap={1} mb={2.5}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<PhotoLibrary sx={{ fontSize: 16 }} />}
                              onClick={() => handleOpenGallery(model)}
                              sx={{ 
                                flex: 1,
                                fontSize: "0.75rem",
                                borderRadius: 2,
                                borderColor: '#8CA551',
                                color: '#333F1F',
                                fontWeight: 600,
                                fontFamily: '"Poppins", sans-serif',
                                '&:hover': {
                                  borderColor: '#333F1F',
                                  bgcolor: 'rgba(51, 63, 31, 0.04)'
                                }
                              }}
                            >
                              Gallery
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleGoToDetail(model._id)}
                              sx={{ 
                                flex: 1,
                                fontSize: "0.75rem",
                                borderRadius: 2,
                                bgcolor: '#333F1F',
                                fontWeight: 600,
                                fontFamily: '"Poppins", sans-serif',
                                '&:hover': {
                                  bgcolor: '#4a5d3a'
                                }
                              }}
                            >
                              Details
                            </Button>
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenDialog(model)}
                              sx={{
                                border: '1px solid rgba(140, 165, 81, 0.3)',
                                color: '#8CA551',
                                '&:hover': {
                                  bgcolor: 'rgba(140, 165, 81, 0.08)',
                                  borderColor: '#8CA551'
                                }
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDelete(model._id)}
                              sx={{
                                border: '1px solid rgba(229, 134, 60, 0.3)',
                                color: '#E5863C',
                                '&:hover': {
                                  bgcolor: 'rgba(229, 134, 60, 0.08)',
                                  borderColor: '#E5863C'
                                }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>

                          {/* FACADES */}
                          <Box 
                            sx={{ 
                              borderTop: "2px solid rgba(140, 165, 81, 0.15)", 
                              pt: 2,
                              mt: 'auto'
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                              <Typography 
                                variant="caption" 
                                fontWeight={700}
                                sx={{
                                  color: '#333F1F',
                                  fontFamily: '"Poppins", sans-serif',
                                  textTransform: 'uppercase',
                                  letterSpacing: '1px',
                                  fontSize: '0.7rem'
                                }}
                              >
                                Facades ({modelFacades.length})
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenFacadeDialog(model)}
                                sx={{
                                  bgcolor: "#333F1F",
                                  color: "white",
                                  width: 28,
                                  height: 28,
                                  "&:hover": { bgcolor: "#4a5d3a" },
                                }}
                              >
                                <Add sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>

                            {modelFacades.length > 0 ? (
                              <Box display="flex" gap={1.5} overflowX="auto" pb={1}>
                                {modelFacades.map((facade) => {
                                  const facadeImages = getFacadeImages(facade);
                                  const currentFacadeImage = facadeImages[0];
                                  
                                  return (
                                    <Box
                                      key={facade._id}
                                      sx={{
                                        minWidth: 100,
                                        maxWidth: 100,
                                        flexShrink: 0,
                                        position: "relative",
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          width: 100,
                                          height: 75,
                                          borderRadius: 2,
                                          overflow: "hidden",
                                          bgcolor: "rgba(112, 111, 111, 0.05)",
                                          backgroundImage: currentFacadeImage ? `url(${currentFacadeImage})` : "none",
                                          backgroundSize: "cover",
                                          backgroundPosition: "center",
                                          mb: 0.8,
                                          position: "relative",
                                          border: '2px solid rgba(140, 165, 81, 0.15)',
                                          transition: 'all 0.3s',
                                          '&:hover': {
                                            borderColor: '#8CA551',
                                            transform: 'scale(1.02)'
                                          }
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            position: "absolute",
                                            top: 4,
                                            right: 4,
                                            display: "flex",
                                            gap: 0.5,
                                          }}
                                        >
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenFacadeDialog(model, facade);
                                            }}
                                            sx={{
                                              bgcolor: "rgba(255,255,255,0.95)",
                                              width: 20,
                                              height: 20,
                                              "&:hover": { bgcolor: "white" }
                                            }}
                                          >
                                            <Edit sx={{ fontSize: 12, color: '#8CA551' }} />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteFacade(facade._id);
                                            }}
                                            sx={{
                                              bgcolor: "rgba(255,255,255,0.95)",
                                              width: 20,
                                              height: 20,
                                              "&:hover": { bgcolor: "white" }
                                            }}
                                          >
                                            <Delete sx={{ fontSize: 12, color: '#E5863C' }} />
                                          </IconButton>
                                        </Box>
                                      </Box>
                                      <Typography 
                                        variant="caption" 
                                        noWrap 
                                        fontWeight={700}
                                        display="block"
                                        sx={{
                                          fontFamily: '"Poppins", sans-serif',
                                          color: '#333F1F',
                                          mb: 0.3
                                        }}
                                      >
                                        {facade.title}
                                      </Typography>
                                      <Typography 
                                        variant="caption"
                                        fontWeight={600}
                                        sx={{
                                          color: '#8CA551',
                                          fontFamily: '"Poppins", sans-serif'
                                        }}
                                      >
                                        +${facade.price?.toLocaleString()}
                                      </Typography>
                                    </Box>
                                  );
                                })}
                              </Box>
                            ) : (
                              <Paper 
                                sx={{ 
                                  p: 2, 
                                  textAlign: "center", 
                                  bgcolor: "rgba(112, 111, 111, 0.03)",
                                  border: '1px dashed rgba(112, 111, 111, 0.2)',
                                  borderRadius: 2
                                }}
                              >
                                <ImageIcon sx={{ fontSize: 32, color: "#706f6f", opacity: 0.3, mb: 0.5 }} />
                                <Typography 
                                  variant="caption"
                                  sx={{
                                    color: '#706f6f',
                                    fontFamily: '"Poppins", sans-serif'
                                  }}
                                >
                                  No facades yet
                                </Typography>
                              </Paper>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </AnimatePresence>

        {/* MODALS */}
        <GalleryModal
          open={openGalleryDialog}
          onClose={handleCloseGallery}
          model={selectedModelForGallery}
        />

        <CreateModelModal
          open={openDialog}
          onClose={handleCloseDialog}
          selectedModel={selectedModel}
          onSubmit={handleSubmitModel}  
        />

        <CreateFacade
          open={openFacadeDialog}
          onClose={handleCloseFacadeDialog}
          selectedModel={selectedModelForFacades}
          selectedFacade={selectedFacade}
          onSubmit={handleSubmitFacade}
        />
      </Container>
    </Box>
  );
};

export default Models;