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
  Chip
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
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import GalleryModal from "../components/models/GalleryModal";
import CreateModelModal from "../components/models/CreateModelModal";
import CreateFacade from "../components/models/CreateFacade";

const Models = () => {
  const navigate = useNavigate();

  // ==================== ESTADOS ESENCIALES ====================
  const [models, setModels] = useState([]);
  const [facades, setFacades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de Modals
  const [openDialog, setOpenDialog] = useState(false);
  const [openFacadeDialog, setOpenFacadeDialog] = useState(false);
  const [openGalleryDialog, setOpenGalleryDialog] = useState(false);

  // Estados de selección
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedFacade, setSelectedFacade] = useState(null);
  const [selectedModelForFacades, setSelectedModelForFacades] = useState(null);
  const [selectedModelForGallery, setSelectedModelForGallery] = useState(null);

  // Estados de navegación de imágenes
  const [modelImageIndices, setModelImageIndices] = useState({});
  const [facadeImageIndices, setFacadeImageIndices] = useState({});

  // ==================== EFFECTS ====================
  useEffect(() => {
    const initData = async () => {
      await fetchModels();
      await fetchFacades();
    };
    initData();
  }, []);

  // ==================== DATA FETCHING ====================
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

  // ==================== IMAGE NAVIGATION ====================
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

  const handlePrevFacadeImage = (e, facadeId, imagesLength) => {
    e.stopPropagation();
    setFacadeImageIndices((prev) => ({
      ...prev,
      [facadeId]: prev[facadeId] > 0 ? prev[facadeId] - 1 : imagesLength - 1,
    }));
  };

  const handleNextFacadeImage = (e, facadeId, imagesLength) => {
    e.stopPropagation();
    setFacadeImageIndices((prev) => ({
      ...prev,
      [facadeId]: prev[facadeId] < imagesLength - 1 ? prev[facadeId] + 1 : 0,
    }));
  };

  // ==================== GALLERY HANDLERS ====================
  const handleOpenGallery = (model) => {
    setSelectedModelForGallery(model);
    setOpenGalleryDialog(true);
  };

  const handleCloseGallery = () => {
    setOpenGalleryDialog(false);
    setSelectedModelForGallery(null);
  };

  // ==================== MODEL HANDLERS ====================
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

  // ==================== FACADE HANDLERS ====================
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

  // ==================== HELPER FUNCTIONS ====================
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "draft":
        return "warning";
      case "inactive":
        return "default";
      default:
        return "default";
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
    sx={{p: 3}}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Property Models & Facades
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage floorplans, facades, pricing, and availability
          </Typography>
        </Box>
        <Tooltip title="Add New Model" placement="left">
          <Button
            variant="contained"
            onClick={() => handleOpenDialog()}
            sx={{
              minWidth: { xs: 48, sm: 'auto' },
              width: { xs: 48, sm: 'auto' },
              height: { xs: 48, sm: 'auto' },
              p: { xs: 0, sm: '8px 24px' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: { xs: '50%', sm: 3 },
              bgcolor: '#333F1F',
              color: 'white',
              fontWeight: 600,
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontFamily: '"Poppins", sans-serif',
              border: 'none',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
              transition: 'all 0.3s ease',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                bgcolor: '#8CA551',
                transition: 'left 0.4s ease',
                zIndex: 0,
              },
              '&:hover': {
                bgcolor: '#333F1F',
                boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
                transform: 'translateY(-2px)',
                '&::before': {
                  left: 0,
                },
                '& .MuiBox-root, & .MuiSvgIcon-root': {
                  color: 'white',
                  position: 'relative',
                  zIndex: 1,
                },
              },
              '&:active': {
                transform: 'translateY(0px)',
                boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)'
              },
              '& .MuiBox-root, & .MuiSvgIcon-root': {
                position: 'relative',
                zIndex: 1,
                transition: 'color 0.3s ease',
              },
            }}
          >
            <Add sx={{ display: { xs: 'block', sm: 'none' }, fontSize: 24 }} />
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
              <Add />
              Add New Model
            </Box>
          </Button>
        </Tooltip>
      </Box>
      {/* Models Grid */}   
      
      
      <Grid container spacing={3}>
        {models.map((model) => {
          const modelFacades = getModelFacades(model._id);
          const allImages = getAllModelImages(model);
          const currentModelImageIndex = modelImageIndices[model._id] || 0;
          const currentModelImage = allImages[currentModelImageIndex];
          return (
            <Grid item xs={12} key={model._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: "0 4px 16px rgba(51, 63, 31, 0.08)",
                    mb: 2,
                    transition: "all 0.3s",
                    border: '1px solid rgba(140, 165, 81, 0.15)',
                    bgcolor: 'white',
                    "&:hover": { 
                      boxShadow: "0 12px 32px rgba(51, 63, 31, 0.12)",
                      borderColor: '#8CA551',
                      transform: 'translateY(-2px)'
                    },
                    position: "relative",
                    overflow: "visible",
                  }}
                >
                  {/* ✅ STATUS CHIP - Brandbook */}
                  <Chip
                    label={model.status}
                    color={getStatusColor(model.status)}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: { xs: 12, md: 16 },
                      right: { xs: 12, md: 16 },
                      fontWeight: 700,
                      zIndex: 2,
                      textTransform: "capitalize",
                      fontFamily: '"Poppins", sans-serif',
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem',
                      height: 26,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
      
                  {/* ✅ LAYOUT MOBILE */}
                  <Box
                    sx={{
                      display: { xs: "flex", md: "none" },
                      flexDirection: "column",
                      p: 2.5,
                    }}
                  >
                    {/* Imagen + Info básica */}
                    <Box display="flex" gap={2} mb={2}>
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
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
                            mb: 1
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
      
                    {/* ✅ SPECS MOBILE - Brandbook icons */}
                    <Box 
                      display="flex" 
                      gap={2.5} 
                      mb={2} 
                      flexWrap="wrap"
                      sx={{
                        p: 2,
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
      
                    {/* ✅ PRICING OPTIONS MOBILE - Brandbook */}
                    {hasPricingOptions(model) && (
                      <Box display="flex" gap={0.8} mb={2} flexWrap="wrap">
                        {model.balconies?.length > 0 && (
                          <Chip
                            label={`+$${(model.balconies[0].price / 1000).toFixed(0)}K`}
                            size="small"
                            sx={{ 
                              height: 26,
                              bgcolor: 'rgba(140, 165, 81, 0.12)',
                              color: '#333F1F',
                              fontWeight: 600,
                              border: '1px solid rgba(140, 165, 81, 0.3)',
                              fontFamily: '"Poppins", sans-serif',
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                        {model.upgrades?.length > 0 && (
                          <Chip
                            label={`+$${(model.upgrades[0].price / 1000).toFixed(0)}K`}
                            size="small"
                            sx={{ 
                              height: 26,
                              bgcolor: 'rgba(229, 134, 60, 0.12)',
                              color: '#E5863C',
                              fontWeight: 600,
                              border: '1px solid rgba(229, 134, 60, 0.3)',
                              fontFamily: '"Poppins", sans-serif',
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                        {model.storages?.length > 0 && (
                          <Chip
                            label={`+$${(model.storages[0].price / 1000).toFixed(0)}K`}
                            size="small"
                            sx={{ 
                              height: 26,
                              bgcolor: 'rgba(112, 111, 111, 0.12)',
                              color: '#706f6f',
                              fontWeight: 600,
                              border: '1px solid rgba(112, 111, 111, 0.3)',
                              fontFamily: '"Poppins", sans-serif',
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                      </Box>
                    )}
      
                    {/* ✅ ACTIONS MOBILE - Brandbook */}
                    <Box display="flex" gap={1} mb={2}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PhotoLibrary sx={{ fontSize: 16 }} />}
                        onClick={() => handleOpenGallery(model)}
                        sx={{ 
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
      
                    {/* ✅ FACADES MOBILE */}
                    {modelFacades.length > 0 && (
                      <Box>
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
                        <Box display="flex" gap={1.5} overflowX="auto" pb={1}>
                          {modelFacades.map((facade) => {
                            const facadeImages = getFacadeImages(facade);
                            const currentFacadeImage = facadeImages[0];
                            return (
                              <Box
                                key={facade._id}
                                sx={{
                                  minWidth: 110,
                                  maxWidth: 110,
                                  flexShrink: 0,
                                  position: "relative",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 110,
                                    height: 80,
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
                                        backdropFilter: 'blur(8px)',
                                        width: 24,
                                        height: 24,
                                        border: '1px solid rgba(140, 165, 81, 0.2)',
                                        "&:hover": { 
                                          bgcolor: "white",
                                          borderColor: '#8CA551'
                                        },
                                      }}
                                    >
                                      <Edit sx={{ fontSize: 14, color: '#8CA551' }} />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFacade(facade._id);
                                      }}
                                      sx={{
                                        bgcolor: "rgba(255,255,255,0.95)",
                                        backdropFilter: 'blur(8px)',
                                        width: 24,
                                        height: 24,
                                        border: '1px solid rgba(229, 134, 60, 0.2)',
                                        "&:hover": { 
                                          bgcolor: "white",
                                          borderColor: '#E5863C'
                                        },
                                      }}
                                    >
                                      <Delete sx={{ fontSize: 14, color: '#E5863C' }} />
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
                      </Box>
                    )}
                  </Box>
      
                  {/* ✅ LAYOUT DESKTOP */}
                  <Box
                    sx={{
                      display: { xs: "none", md: "flex" },
                      alignItems: "flex-start",
                      p: 3,
                    }}
                  >
                    {/* ✅ IMAGEN PRINCIPAL DESKTOP */}
                    <Box
                      sx={{
                        width: 140,
                        height: 140,
                        borderRadius: 4,
                        overflow: "hidden",
                        position: "relative",
                        boxShadow: "0 4px 16px rgba(51, 63, 31, 0.12)",
                        mr: 3.5,
                        bgcolor: "rgba(112, 111, 111, 0.05)",
                        flexShrink: 0,
                        border: '3px solid rgba(140, 165, 81, 0.15)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          borderColor: '#8CA551',
                          transform: 'scale(1.02)'
                        }
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
                              transition: "transform 0.3s",
                              "&:hover": { transform: "scale(1.05)" },
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              width: "100%",
                              bgcolor: "rgba(51, 63, 31, 0.9)",
                              backdropFilter: 'blur(10px)',
                              color: "white",
                              px: 1.5,
                              py: 1,
                              fontSize: 12,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              fontFamily: '"Poppins", sans-serif',
                              fontWeight: 600
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <PhotoLibrary sx={{ fontSize: 16 }} />
                              {allImages.length}
                            </span>
                            <span>
                              {currentModelImageIndex + 1}/{allImages.length}
                            </span>
                          </Box>
                          {allImages.length > 1 && (
                            <>
                              <IconButton
                                size="small"
                                onClick={(e) => handlePrevModelImage(e, model._id, allImages.length)}
                                sx={{
                                  position: "absolute",
                                  left: 6,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  bgcolor: "rgba(255,255,255,0.95)",
                                  backdropFilter: 'blur(8px)',
                                  border: '2px solid rgba(140, 165, 81, 0.2)',
                                  "&:hover": { 
                                    bgcolor: "white",
                                    borderColor: '#8CA551'
                                  },
                                  width: 28,
                                  height: 28,
                                }}
                              >
                                <ChevronLeft fontSize="small" sx={{ color: '#333F1F' }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => handleNextModelImage(e, model._id, allImages.length)}
                                sx={{
                                  position: "absolute",
                                  right: 6,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  bgcolor: "rgba(255,255,255,0.95)",
                                  backdropFilter: 'blur(8px)',
                                  border: '2px solid rgba(140, 165, 81, 0.2)',
                                  "&:hover": { 
                                    bgcolor: "white",
                                    borderColor: '#8CA551'
                                  },
                                  width: 28,
                                  height: 28,
                                }}
                              >
                                <ChevronRight fontSize="small" sx={{ color: '#333F1F' }} />
                              </IconButton>
                            </>
                          )}
                        </>
                      ) : (
                        <Home sx={{ fontSize: 56, color: "#706f6f", opacity: 0.3 }} />
                      )}
                    </Box>
      
                    {/* ✅ INFO PRINCIPAL DESKTOP */}
                    <Box flex={1} minWidth={0}>
                      <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                        <Typography 
                          variant="h5" 
                          fontWeight={700}
                          sx={{ 
                            fontFamily: '"Poppins", sans-serif',
                            color: '#333F1F',
                            letterSpacing: '1px'
                          }}
                        >
                          {model.model}
                        </Typography>
                        <Typography 
                          variant="body2"
                          sx={{ 
                            fontWeight: 500,
                            color: '#706f6f',
                            fontFamily: '"Poppins", sans-serif',
                            bgcolor: 'rgba(112, 111, 111, 0.08)',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2
                          }}
                        >
                          #{model.modelNumber}
                        </Typography>
                      </Box>
      
                      {/* ✅ SPECS DESKTOP - Brandbook icons */}
                      <Box 
                        display="flex" 
                        gap={3} 
                        alignItems="center" 
                        mt={1} 
                        mb={1.5}
                        sx={{
                          p: 2,
                          bgcolor: 'rgba(140, 165, 81, 0.03)',
                          borderRadius: 2,
                          border: '1px solid rgba(140, 165, 81, 0.1)',
                          width: 'fit-content'
                        }}
                      >
                        <Tooltip title="Bedrooms" placement="top">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Bed sx={{ fontSize: 20, color: "#333F1F" }} />
                            <Typography 
                              variant="body2"
                              sx={{
                                fontFamily: '"Poppins", sans-serif',
                                fontWeight: 600,
                                color: '#706f6f'
                              }}
                            >
                              {model.bedrooms}
                            </Typography>
                          </Box>
                        </Tooltip>
                        <Tooltip title="Bathrooms" placement="top">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Bathtub sx={{ fontSize: 20, color: "#8CA551" }} />
                            <Typography 
                              variant="body2"
                              sx={{
                                fontFamily: '"Poppins", sans-serif',
                                fontWeight: 600,
                                color: '#706f6f'
                              }}
                            >
                              {model.bathrooms}
                            </Typography>
                          </Box>
                        </Tooltip>
                        <Tooltip title="Square Feet" placement="top">
                          <Box display="flex" alignItems="center" gap={1}>
                            <SquareFoot sx={{ fontSize: 20, color: "#E5863C" }} />
                            <Typography 
                              variant="body2"
                              sx={{
                                fontFamily: '"Poppins", sans-serif',
                                fontWeight: 600,
                                color: '#706f6f'
                              }}
                            >
                              {model.sqft?.toLocaleString()}
                            </Typography>
                          </Box>
                        </Tooltip>
                        <Tooltip title="Stories" placement="top">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Layers sx={{ fontSize: 20, color: "#706f6f" }} />
                            <Typography 
                              variant="body2"
                              sx={{
                                fontFamily: '"Poppins", sans-serif',
                                fontWeight: 600,
                                color: '#706f6f'
                              }}
                            >
                              {model.stories || 1}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Box>
      
                      {/* ✅ PRICE BOX - Brandbook */}
                      <Box
                        sx={{
                          bgcolor: "rgba(140, 165, 81, 0.08)",
                          border: "2px solid rgba(140, 165, 81, 0.25)",
                          borderRadius: 3,
                          px: 3,
                          py: 1.2,
                          display: "inline-block",
                          mb: 1.5,
                        }}
                      >
                        <Typography 
                          variant="h6" 
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
      
                      {/* ✅ PRICING OPTIONS DESKTOP - Brandbook */}
                      {hasPricingOptions(model) && (
                        <Box display="flex" gap={1} mt={1.5} flexWrap="wrap">
                          {model.balconies?.length > 0 && (
                            <Chip
                              label={`Balcony: +$${model.balconies[0].price.toLocaleString()}`}
                              size="small"
                              icon={<Balcony sx={{ fontSize: 16 }} />}
                              sx={{
                                bgcolor: 'rgba(140, 165, 81, 0.12)',
                                color: '#333F1F',
                                fontWeight: 600,
                                border: '1px solid rgba(140, 165, 81, 0.3)',
                                fontFamily: '"Poppins", sans-serif',
                                height: 28,
                                '& .MuiChip-icon': {
                                  color: '#8CA551'
                                }
                              }}
                            />
                          )}
                          {model.upgrades?.length > 0 && (
                            <Chip
                              label={`Upgrade: +$${model.upgrades[0].price.toLocaleString()}`}
                              size="small"
                              icon={<UpgradeIcon sx={{ fontSize: 16 }} />}
                              sx={{
                                bgcolor: 'rgba(229, 134, 60, 0.12)',
                                color: '#E5863C',
                                fontWeight: 600,
                                border: '1px solid rgba(229, 134, 60, 0.3)',
                                fontFamily: '"Poppins", sans-serif',
                                height: 28,
                                '& .MuiChip-icon': {
                                  color: '#E5863C'
                                }
                              }}
                            />
                          )}
                          {model.storages?.length > 0 && (
                            <Chip
                              label={`Storage: +$${model.storages[0].price.toLocaleString()}`}
                              size="small"
                              icon={<StorageIcon sx={{ fontSize: 16 }} />}
                              sx={{
                                bgcolor: 'rgba(112, 111, 111, 0.12)',
                                color: '#706f6f',
                                fontWeight: 600,
                                border: '1px solid rgba(112, 111, 111, 0.3)',
                                fontFamily: '"Poppins", sans-serif',
                                height: 28,
                                '& .MuiChip-icon': {
                                  color: '#706f6f'
                                }
                              }}
                            />
                          )}
                        </Box>
                      )}
      
                      {/* ✅ DESCRIPTION */}
                      {model.description && (
                        <Typography
                          variant="body2"
                          mt={1.5}
                          sx={{
                            color: '#706f6f',
                            fontFamily: '"Poppins", sans-serif',
                            lineHeight: 1.6,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {model.description}
                        </Typography>
                      )}
      
                      {/* ✅ ACTIONS DESKTOP - Brandbook */}
                      <Box display="flex" gap={1.5} alignItems="center" mt={2.5}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PhotoLibrary />}
                          onClick={() => handleOpenGallery(model)}
                          sx={{
                            borderRadius: 2,
                            borderColor: '#8CA551',
                            color: '#333F1F',
                            fontWeight: 600,
                            fontFamily: '"Poppins", sans-serif',
                            px: 2.5,
                            py: 1,
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
                            borderRadius: 2,
                            bgcolor: '#333F1F',
                            fontWeight: 600,
                            fontFamily: '"Poppins", sans-serif',
                            px: 2.5,
                            py: 1,
                            '&:hover': {
                              bgcolor: '#4a5d3a'
                            }
                          }}
                        >
                          View Details
                        </Button>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(model)}
                          sx={{
                            border: '2px solid rgba(140, 165, 81, 0.3)',
                            color: '#8CA551',
                            width: 36,
                            height: 36,
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
                            border: '2px solid rgba(229, 134, 60, 0.3)',
                            color: '#E5863C',
                            width: 36,
                            height: 36,
                            '&:hover': {
                              bgcolor: 'rgba(229, 134, 60, 0.08)',
                              borderColor: '#E5863C'
                            }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
      
                      {/* ✅ FACADES DESKTOP */}
                      <Box 
                        sx={{ 
                          borderTop: "2px solid rgba(140, 165, 81, 0.15)", 
                          pt: 2.5, 
                          mt: 2.5 
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={700}
                            sx={{
                              color: '#333F1F',
                              fontFamily: '"Poppins", sans-serif',
                              letterSpacing: '0.5px'
                            }}
                          >
                            Facades ({modelFacades.length})
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={() => handleOpenFacadeDialog(model)}
                            sx={{
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
                            Add Facade
                          </Button>
                        </Box>
                        {modelFacades.length > 0 ? (
                          <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1.5 }}>
                            {modelFacades.map((facade) => {
                              const facadeImages = getFacadeImages(facade);
                              const currentFacadeImageIndex = facadeImageIndices[facade._id] || 0;
                              const currentFacadeImage = facadeImages[currentFacadeImageIndex];
      
                              return (
                                <Card
                                  key={facade._id}
                                  sx={{
                                    minWidth: 200,
                                    maxWidth: 200,
                                    flexShrink: 0,
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    position: "relative",
                                    border: '2px solid rgba(140, 165, 81, 0.15)',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                      borderColor: '#8CA551',
                                      transform: 'translateY(-4px)',
                                      boxShadow: '0 8px 24px rgba(51, 63, 31, 0.12)'
                                    }
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: "100%",
                                      height: 110,
                                      bgcolor: "rgba(112, 111, 111, 0.05)",
                                      backgroundImage: currentFacadeImage ? `url(${currentFacadeImage})` : "none",
                                      backgroundSize: "cover",
                                      backgroundPosition: "center",
                                      position: "relative",
                                    }}
                                  >
                                    {!currentFacadeImage && <ImageIcon sx={{ fontSize: 48, color: "#706f6f", opacity: 0.3 }} />}
                                    {facadeImages.length > 1 && (
                                      <Chip
                                        label={`${currentFacadeImageIndex + 1}/${facadeImages.length}`}
                                        size="small"
                                        sx={{
                                          position: "absolute",
                                          bottom: 6,
                                          left: 6,
                                          bgcolor: "rgba(51, 63, 31, 0.9)",
                                          backdropFilter: 'blur(8px)',
                                          color: "white",
                                          fontWeight: 600,
                                          fontFamily: '"Poppins", sans-serif'
                                        }}
                                      />
                                    )}
                                    <Box
                                      sx={{
                                        position: "absolute",
                                        top: 6,
                                        right: 6,
                                        display: "flex",
                                        gap: 0.5,
                                      }}
                                    >
                                      <IconButton
                                        size="small"
                                        sx={{ 
                                          bgcolor: "rgba(255,255,255,0.95)",
                                          backdropFilter: 'blur(8px)',
                                          border: '1px solid rgba(140, 165, 81, 0.2)',
                                          '&:hover': {
                                            bgcolor: 'white',
                                            borderColor: '#8CA551'
                                          }
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenFacadeDialog(model, facade);
                                        }}
                                      >
                                        <Edit fontSize="small" sx={{ color: '#8CA551' }} />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        sx={{ 
                                          bgcolor: "rgba(255,255,255,0.95)",
                                          backdropFilter: 'blur(8px)',
                                          border: '1px solid rgba(229, 134, 60, 0.2)',
                                          '&:hover': {
                                            bgcolor: 'white',
                                            borderColor: '#E5863C'
                                          }
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteFacade(facade._id);
                                        }}
                                      >
                                        <Delete fontSize="small" sx={{ color: '#E5863C' }} />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                  <CardContent sx={{ p: 2 }}>
                                    <Typography 
                                      variant="subtitle2" 
                                      fontWeight={700} 
                                      noWrap
                                      sx={{
                                        fontFamily: '"Poppins", sans-serif',
                                        color: '#333F1F',
                                        mb: 0.5
                                      }}
                                    >
                                      {facade.title}
                                    </Typography>
                                    <Typography 
                                      variant="body2"
                                      fontWeight={600}
                                      sx={{
                                        color: '#8CA551',
                                        fontFamily: '"Poppins", sans-serif'
                                      }}
                                    >
                                      +${facade.price?.toLocaleString()}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </Box>
                        ) : (
                          <Paper 
                            sx={{ 
                              p: 3, 
                              textAlign: "center", 
                              bgcolor: "rgba(112, 111, 111, 0.03)",
                              border: '2px dashed rgba(112, 111, 111, 0.2)',
                              borderRadius: 3
                            }}
                          >
                            <ImageIcon sx={{ fontSize: 48, color: "#706f6f", opacity: 0.3, mb: 1 }} />
                            <Typography 
                              variant="body2"
                              sx={{
                                color: '#706f6f',
                                fontFamily: '"Poppins", sans-serif'
                              }}
                            >
                              No facades added yet
                            </Typography>
                          </Paper>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
      
      

      <GalleryModal
        open={openGalleryDialog}
        onClose={handleCloseGallery}
        model={selectedModelForGallery}
      />

      {/* ==================== MODEL DIALOG RESPONSIVE ==================== */}
      <CreateModelModal
        open={openDialog}
        onClose={handleCloseDialog}
        selectedModel={selectedModel}
        onSubmit={handleSubmitModel}  
      />

      {/* ==================== FACADE DIALOG ==================== */}
      <CreateFacade
        open={openFacadeDialog}
        onClose={handleCloseFacadeDialog}
        selectedModel={selectedModelForFacades}
        selectedFacade={selectedFacade}
        onSubmit={handleSubmitFacade}
      />

    </Box>
  );
};

export default Models;
