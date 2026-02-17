import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Container,
  CircularProgress,
  Tooltip
} from "@mui/material";
import {
  Add,
  Home
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import GalleryModal from "../components/models/GalleryModal";
import CreateModelModal from "../components/models/CreateModelModal";
import CreateFacade from "../components/models/CreateFacade";
import ModelCard from "../components/models/listModels"; // ✅ NUEVO IMPORT
import PageHeader from "../components/PageHeader";

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
    } catch (error) {
      console.error("Error fetching facades:", error);
    }
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

  const getModelFacades = (modelId) => {
    return facades.filter((f) => {
      if (!f || !f.model) return false;
      if (typeof f.model === "object" && f.model !== null) {
        return f.model._id === modelId;
      }
      return f.model === modelId;
    });
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
              {/* ✅ HEADER DINÁMICO */}
      <PageHeader
        icon={Home}
        title="Property Models & Facades"
        subtitle="Manage floorplans, facades, pricing, and availability"
        actionButton={{
          label: 'Add New Model',
          onClick: () => handleOpenDialog(),
          icon: <Add />,
          tooltip: 'Add New Model'
        }}
      />

        {/* MODELS GRID - ✅ USANDO COMPONENTE */}
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
              {models.map((model, index) => (
                <ModelCard
                  key={model._id}
                  model={model}
                  index={index}
                  facades={getModelFacades(model._id)}
                  onEdit={handleOpenDialog}
                  onDelete={handleDelete}
                  onOpenGallery={handleOpenGallery}
                  onGoToDetail={handleGoToDetail}
                  onOpenFacadeDialog={handleOpenFacadeDialog}
                  onEditFacade={handleOpenFacadeDialog}
                  onDeleteFacade={handleDeleteFacade}
                />
              ))}
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