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
              bgcolor: "#4a7c59",
              "&:hover": { bgcolor: "#3d6649" },
              minWidth: { xs: 48, sm: 'auto' },
              width: { xs: 48, sm: 'auto' },
              height: { xs: 48, sm: 'auto' },
              p: { xs: 0, sm: '6px 16px' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 50
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
                    borderRadius: 3,
                    boxShadow: "0 4px 16px rgba(74,124,89,0.10)",
                    mb: 2,
                    transition: "box-shadow 0.2s",
                    "&:hover": { boxShadow: "0 8px 24px rgba(74,124,89,0.18)" },
                    position: "relative",
                    overflow: "visible",
                  }}
                >
                  {/* Estado - Adaptado por pantalla */}
                  <Chip
                    label={model.status}
                    color={getStatusColor(model.status)}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: { xs: 8, md: 16 },
                      right: { xs: 8, md: 16 },
                      fontWeight: 700,
                      zIndex: 2,
                      textTransform: "capitalize",
                    }}
                  />
                  {/* Layout Mobile (xs, sm) - Stack vertical */}
                  <Box
                    sx={{
                      display: { xs: "flex", md: "none" },
                      flexDirection: "column",
                      p: 2,
                    }}
                  >
                    {/* Imagen + Info básica */}
                    <Box display="flex" gap={2} mb={2}>
                      {/* Imagen */}
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: 2,
                          overflow: "hidden",
                          position: "relative",
                          bgcolor: "grey.200",
                          flexShrink: 0,
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
                                bottom: 4,
                                right: 4,
                                bgcolor: "rgba(0,0,0,0.7)",
                                color: "white",
                                height: 20,
                                fontSize: "0.65rem",
                              }}
                            />
                          </>
                        ) : (
                          <Home sx={{ fontSize: 40, color: "grey.400" }} />
                        )}
                      </Box>
      
                      {/* Info básica mobile */}
                      <Box flex={1} minWidth={0}>
                        <Typography variant="h6" fontWeight="bold" noWrap>
                          {model.model}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          #{model.modelNumber}
                        </Typography>
                        <Box
                          sx={{
                            bgcolor: "rgba(76,175,80,0.08)",
                            border: "1px solid #c8e6c9",
                            borderRadius: 1,
                            px: 1.5,
                            py: 0.5,
                            display: "inline-block",
                            mt: 0.5,
                          }}
                        >
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            ${model.price?.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
      
                    {/* Specs mobile */}
                    <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Bed sx={{ fontSize: 16, color: "#4a7c59" }} />
                        <Typography variant="caption">{model.bedrooms}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Bathtub sx={{ fontSize: 16, color: "#2196f3" }} />
                        <Typography variant="caption">{model.bathrooms}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <SquareFoot sx={{ fontSize: 16, color: "#ff9800" }} />
                        <Typography variant="caption">{model.sqft?.toLocaleString()}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Layers sx={{ fontSize: 16, color: "#8bc34a" }} />
                        <Typography variant="caption">{model.stories || 1}</Typography>
                      </Box>
                    </Box>
      
                    {/* Opciones mobile */}
                    {hasPricingOptions(model) && (
                      <Box display="flex" gap={0.5} mb={2} flexWrap="wrap">
                        {model.balconies?.length > 0 && (
                          <Chip
                            label={`+$${(model.balconies[0].price / 1000).toFixed(0)}K`}
                            size="small"
                            color="info"
                            variant="outlined"
                            sx={{ height: 24 }}
                          />
                        )}
                        {model.upgrades?.length > 0 && (
                          <Chip
                            label={`+$${(model.upgrades[0].price / 1000).toFixed(0)}K`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{ height: 24 }}
                          />
                        )}
                        {model.storages?.length > 0 && (
                          <Chip
                            label={`+$${(model.storages[0].price / 1000).toFixed(0)}K`}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ height: 24 }}
                          />
                        )}
                      </Box>
                    )}
      
                    {/* Acciones mobile */}
                    <Box display="flex" gap={1} mb={2}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PhotoLibrary />}
                        onClick={() => handleOpenGallery(model)}
                        sx={{ fontSize: "0.75rem" }}
                      >
                        Gallery
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleGoToDetail(model._id)}
                        sx={{ fontSize: "0.75rem" }}
                      >
                        Details
                      </Button>
                      <IconButton size="small" onClick={() => handleOpenDialog(model)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(model._id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
      
                    {/* Facades mobile */}
                    {modelFacades.length > 0 && (
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="caption" fontWeight="bold" color="text.secondary">
                            Facades ({modelFacades.length})
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenFacadeDialog(model)}
                            sx={{
                              bgcolor: "primary.main",
                              color: "white",
                              width: 24,
                              height: 24,
                              "&:hover": { bgcolor: "primary.dark" },
                            }}
                          >
                            <Add sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                        <Box display="flex" gap={1} overflowX="auto" pb={1}>
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
                                    borderRadius: 1,
                                    overflow: "hidden",
                                    bgcolor: "grey.200",
                                    backgroundImage: currentFacadeImage ? `url(${currentFacadeImage})` : "none",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    mb: 0.5,
                                    position: "relative",
                                  }}
                                >
                                  {/* Botones de acción en la imagen */}
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      top: 2,
                                      right: 2,
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
                                        "&:hover": { bgcolor: "white" },
                                      }}
                                    >
                                      <Edit sx={{ fontSize: 12 }} />
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
                                        "&:hover": { bgcolor: "white", color: "error.main" },
                                      }}
                                    >
                                      <Delete sx={{ fontSize: 12 }} />
                                    </IconButton>
                                  </Box>
                                </Box>
                                <Typography variant="caption" noWrap fontWeight="600" display="block">
                                  {facade.title}
                                </Typography>
                                <Typography variant="caption" color="primary" fontWeight="600">
                                  +${facade.price?.toLocaleString()}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    )}
                  </Box>
      
                  {/* Layout Desktop (md+) - Horizontal */}
                  <Box
                    sx={{
                      display: { xs: "none", md: "flex" },
                      alignItems: "flex-start",
                      p: 2.5,
                    }}
                  >
                    {/* Imagen principal desktop */}
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: 3,
                        overflow: "hidden",
                        position: "relative",
                        boxShadow: "0 2px 12px rgba(74,124,89,0.10)",
                        mr: 3,
                        bgcolor: "grey.200",
                        flexShrink: 0,
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
                              transition: "transform 0.2s",
                              "&:hover": { transform: "scale(1.04)" },
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              width: "100%",
                              bgcolor: "rgba(0,0,0,0.5)",
                              color: "white",
                              px: 1,
                              py: 0.5,
                              fontSize: 12,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>
                              <PhotoLibrary sx={{ fontSize: 14, mr: 0.5 }} />
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
                                  left: 4,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  bgcolor: "rgba(255,255,255,0.9)",
                                  "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                                  width: 24,
                                  height: 24,
                                }}
                              >
                                <ChevronLeft fontSize="small" />
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
                                  "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                                  width: 24,
                                  height: 24,
                                }}
                              >
                                <ChevronRight fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </>
                      ) : (
                        <Home sx={{ fontSize: 48, color: "grey.400" }} />
                      )}
                    </Box>
      
                    {/* Info principal desktop */}
                    <Box flex={1} minWidth={0}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h5" fontWeight="bold" sx={{ mr: 1 }}>
                          {model.model}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          #{model.modelNumber}
                        </Typography>
                      </Box>
      
                      <Box display="flex" gap={2} alignItems="center" mt={0.5} mb={1}>
                        <Tooltip title="Bedrooms">
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Bed sx={{ fontSize: 18, color: "#4a7c59" }} />
                            <Typography variant="body2">{model.bedrooms}</Typography>
                          </Box>
                        </Tooltip>
                        <Tooltip title="Bathrooms">
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Bathtub sx={{ fontSize: 18, color: "#2196f3" }} />
                            <Typography variant="body2">{model.bathrooms}</Typography>
                          </Box>
                        </Tooltip>
                        <Tooltip title="Square Feet">
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <SquareFoot sx={{ fontSize: 18, color: "#ff9800" }} />
                            <Typography variant="body2">{model.sqft?.toLocaleString()}</Typography>
                          </Box>
                        </Tooltip>
                        <Tooltip title="Stories">
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Layers sx={{ fontSize: 18, color: "#8bc34a" }} />
                            <Typography variant="body2">{model.stories || 1}</Typography>
                          </Box>
                        </Tooltip>
                      </Box>
      
                      <Box
                        sx={{
                          bgcolor: "rgba(76,175,80,0.08)",
                          border: "1px solid #c8e6c9",
                          borderRadius: 2,
                          px: 2,
                          py: 0.5,
                          display: "inline-block",
                          mb: 1,
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          ${model.price?.toLocaleString()}
                        </Typography>
                      </Box>
      
                      {hasPricingOptions(model) && (
                        <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                          {model.balconies?.length > 0 && (
                            <Chip
                              label={`Balcony: +$${model.balconies[0].price.toLocaleString()}`}
                              size="small"
                              color="info"
                              variant="outlined"
                              icon={<Balcony />}
                            />
                          )}
                          {model.upgrades?.length > 0 && (
                            <Chip
                              label={`Upgrade: +$${model.upgrades[0].price.toLocaleString()}`}
                              size="small"
                              color="secondary"
                              variant="outlined"
                              icon={<UpgradeIcon />}
                            />
                          )}
                          {model.storages?.length > 0 && (
                            <Chip
                              label={`Storage: +$${model.storages[0].price.toLocaleString()}`}
                              size="small"
                              color="success"
                              variant="outlined"
                              icon={<StorageIcon />}
                            />
                          )}
                        </Box>
                      )}
      
                      {model.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mt={1}
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {model.description}
                        </Typography>
                      )}
      
                      <Box display="flex" gap={1} alignItems="center" mt={2}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PhotoLibrary />}
                          onClick={() => handleOpenGallery(model)}
                          color="primary"
                        >
                          Gallery
                        </Button>
                        <Button variant="contained" size="small" onClick={() => handleGoToDetail(model._id)}>
                          View Details
                        </Button>
                        <IconButton size="small" onClick={() => handleOpenDialog(model)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(model._id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
      
                      {/* Facades desktop */}
                      <Box sx={{ borderTop: "1px solid #eee", pt: 2, mt: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Facades ({modelFacades.length})
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={() => handleOpenFacadeDialog(model)}
                          >
                            Add Facade
                          </Button>
                        </Box>
                        {modelFacades.length > 0 ? (
                          <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1 }}>
                            {modelFacades.map((facade) => {
                              const facadeImages = getFacadeImages(facade);
                              const currentFacadeImageIndex = facadeImageIndices[facade._id] || 0;
                              const currentFacadeImage = facadeImages[currentFacadeImageIndex];
      
                              return (
                                <Card
                                  key={facade._id}
                                  variant="outlined"
                                  sx={{
                                    minWidth: 180,
                                    maxWidth: 180,
                                    flexShrink: 0,
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    position: "relative",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: "100%",
                                      height: 100,
                                      bgcolor: "grey.200",
                                      backgroundImage: currentFacadeImage ? `url(${currentFacadeImage})` : "none",
                                      backgroundSize: "cover",
                                      backgroundPosition: "center",
                                      position: "relative",
                                    }}
                                  >
                                    {!currentFacadeImage && <ImageIcon sx={{ fontSize: 40, color: "grey.400" }} />}
                                    {facadeImages.length > 1 && (
                                      <Chip
                                        label={`${currentFacadeImageIndex + 1}/${facadeImages.length}`}
                                        size="small"
                                        sx={{
                                          position: "absolute",
                                          bottom: 4,
                                          left: 4,
                                          bgcolor: "rgba(0,0,0,0.7)",
                                          color: "white",
                                        }}
                                      />
                                    )}
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
                                        sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenFacadeDialog(model, facade);
                                        }}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteFacade(facade._id);
                                        }}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                  <CardContent sx={{ p: 1.5 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                      {facade.title}
                                    </Typography>
                                    <Typography variant="body2" color="primary" fontWeight="600">
                                      +${facade.price?.toLocaleString()}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </Box>
                        ) : (
                          <Paper sx={{ p: 2, textAlign: "center", bgcolor: "grey.50" }}>
                            <ImageIcon sx={{ fontSize: 40, color: "grey.400", mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
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
