import { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  useMediaQuery,
  useTheme,
  Drawer,
} from "@mui/material";
import {
  Home,
  Bed,
  Bathtub,
  SquareFoot,
  ChevronLeft,
  ChevronRight,
  Close,
  InfoOutlined,
  Visibility,
  Tune,
  Deck,
} from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useProperty } from "../../context/PropertyContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import ModelCustomizationModal from "./ModelCustomizationModal";
import { motion } from "framer-motion";
import ModelCard from "./modelComponent/Modelcard";
import ModelInfoPanel from "./modelComponent/ModelInfoPanel";

const ModelSelector = () => {
  const {
    selectedModel,
    selectModel,
    selectedLot,
    options,
    setOptions,
    getModelPricingInfo,
    selectedPricingOption,
  } = useProperty();

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const isLarge = useMediaQuery(theme.breakpoints.between("lg", "xl"));

  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageIndices, setImageIndices] = useState({});
  const [openCustomizationModal, setOpenCustomizationModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollContainerRef = useRef(null);

  // ✅ CONSTANTE PARA IDENTIFICAR EL MODELO 10
  const MODEL_10_ID = "6977c7bbd1f24768968719de";
  const isModel10 = selectedModel?._id === MODEL_10_ID;

  // ✅ LABELS CONDICIONALES PARA BALCONY/ESTUDIO
  const balconyLabels = isModel10
    ? {
        chipLabel: "Estudio",
        label: "Estudio",
        icon: Home,
      }
    : {
        chipLabel: "Balcony",
        label: "Balcony",
        icon: Deck,
      };

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await api.get("/models");
      const activeModels = response.data.filter((m) => m.status === "active");
      setModels(activeModels);

      const indices = {};
      activeModels.forEach((model) => {
        indices[model._id] = 0;
      });
      setImageIndices(indices);
    } catch (error) {
      console.error("Error fetching models:", error);
      setError("Failed to load models");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectModel = (model) => {
    console.log("Selecting model:", model);
    selectModel(model);
    if (isMobile) setDrawerOpen(true);
  };

  const handleDeselectModel = () => {
    selectModel(null);
    setOptions({ upgrade: false, balcony: false, storage: false });
    setDrawerOpen(false);
  };

  const handleOpenCustomization = () => {
    setOpenCustomizationModal(true);
  };

  const handleConfirmCustomization = ({
    model,
    options: selectedOptions,
    totalPrice,
  }) => {
    setOptions(selectedOptions);
    setOpenCustomizationModal(false);

    console.log("✅ Customization confirmed:", {
      model: model.model,
      options: selectedOptions,
      totalPrice,
    });
  };

  const handleViewDetails = (e, modelId) => {
    e.stopPropagation();
    navigate(`/models/${modelId}`);
  };

  const handlePrevImage = (e, modelId, imagesLength) => {
    e.stopPropagation();
    setImageIndices((prev) => ({
      ...prev,
      [modelId]: prev[modelId] > 0 ? prev[modelId] - 1 : imagesLength - 1,
    }));
  };

  const handleNextImage = (e, modelId, imagesLength) => {
    e.stopPropagation();
    setImageIndices((prev) => ({
      ...prev,
      [modelId]: prev[modelId] < imagesLength - 1 ? prev[modelId] + 1 : 0,
    }));
  };

  const scrollModels = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = isMobile ? 280 : 320;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScrollLeft =
        currentScroll + (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const getAllImages = (model) => {
    const exterior = model.images?.exterior || [];
    const interior = model.images?.interior || [];
    return [...exterior, ...interior];
  };

  if (!selectedLot) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          bgcolor: "#fff",
          borderRadius: 4,
          border: "1px solid #e0e0e0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <Typography
          variant={isMobile ? "body1" : "subtitle1"}
          color="text.secondary"
          textAlign="center"
          sx={{
            py: 2,
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontSize: "0.85rem",
            fontWeight: 500,
          }}
        >
          SELECT A LOT TO VIEW MODELS
        </Typography>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          bgcolor: "#fff",
          borderRadius: 4,
          border: "1px solid #e0e0e0",
        }}
      >
        <Box display="flex" justifyContent="center">
          <CircularProgress sx={{ color: "#333F1F" }} />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          bgcolor: "#fff",
          borderRadius: 4,
          border: "1px solid #e0e0e0",
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  const pricingInfo = selectedModel ? getModelPricingInfo() : null;
  const hasPricingOptions =
    (pricingInfo?.hasBalcony && selectedModel?.balconies?.length > 0) ||
    (pricingInfo?.hasUpgrade && selectedModel?.upgrades?.length > 0) ||
    (pricingInfo?.hasStorage && selectedModel?.storages?.length > 0);


  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          bgcolor: "#fff",
          borderRadius: 4,
          border: "1px solid #e0e0e0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* ✅ HEADER - Brandbook */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          flexWrap="wrap"
          gap={1}
          sx={{
            pb: 2,
            borderBottom: "2px solid rgba(140, 165, 81, 0.2)",
          }}
        >
          <Typography
            variant={isMobile ? "body1" : "subtitle1"}
            fontWeight={700}
            sx={{
              color: "#333F1F",
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontSize: isMobile ? "0.85rem" : "0.95rem",
            }}
          >
            02 Model Selection
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {selectedModel && !isMobile && (
              <Button
                size="small"
                variant="outlined"
                onClick={handleDeselectModel}
                startIcon={<Close />}
                sx={{
                  borderRadius: 2,
                  borderColor: "#e0e0e0",
                  borderWidth: "2px",
                  color: "#706f6f",
                  fontWeight: 600,
                  textTransform: "none",
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: "0.75rem",
                  "&:hover": {
                    borderColor: "#333F1F",
                    borderWidth: "2px",
                    color: "#333F1F",
                    bgcolor: "rgba(51, 63, 31, 0.05)",
                  },
                }}
              >
                Clear
              </Button>
            )}
            <Chip
              label={`${models.length} OPTIONS`}
              size="small"
              sx={{
                bgcolor: "rgba(140, 165, 81, 0.12)",
                color: "#8CA551",
                fontWeight: 700,
                fontSize: "0.65rem",
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: "1px",
                height: 26,
                px: 1,
              }}
            />
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box
          sx={{
            position: "relative",
            minHeight: isMobile ? 400 : 500,
            overflow: "hidden",
          }}
        >
          {/* Desktop/Tablet Layout - Side Panel */}
          {!isMobile && selectedModel && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: isTablet ? "40%" : isLarge ? "36%" : "32%",
                  maxWidth: isTablet ? 320 : isLarge ? 380 : 340,
                  zIndex: 10,
                }}
              >
                <ModelInfoPanel
                  model={selectedModel}
                  isLarge={isLarge}
                  isModel10={isModel10}
                  balconyLabels={balconyLabels}
                  hasPricingOptions={hasPricingOptions}
                  selectedPricingOption={selectedPricingOption}
                  onOpenCustomization={handleOpenCustomization}
                  onViewDetails={(e) => handleViewDetails(e, selectedModel._id)}
                />
              </Box>
            </motion.div>
          )}

          {/* Models Container */}
          <Box
            sx={{
              position: isMobile ? "relative" : "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              left:
                !isMobile && selectedModel
                  ? isTablet
                    ? "34%"
                    : isLarge
                      ? "38%"
                      : "34%"
                  : 0,
              transition: "left 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent:
                !isMobile && selectedModel ? "center" : "flex-start",
            }}
          >
            <Box
              ref={scrollContainerRef}
              sx={{
                display: "flex",
                gap: 2,
                overflowX: isMobile || !selectedModel ? "auto" : "visible",
                overflowY: "hidden",
                height: "100%",
                px: 1,
                py: 2,
                alignItems: "center",
                scrollbarWidth: isMobile ? "thin" : "none",
                justifyContent:
                  !isMobile && selectedModel ? "center" : "flex-start",
                width: "100%",
                "&::-webkit-scrollbar": {
                  display: isMobile ? "block" : "none",
                  height: 6,
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "rgba(51, 63, 31, 0.2)",
                  borderRadius: 3,
                },
              }}
            >
              {models.map((model) => {
                const isSelected = selectedModel?._id === model._id;
                const modelImages = getAllImages(model);
                const currentImageIndex = imageIndices[model._id] || 0;

                if (!isMobile && selectedModel && !isSelected) return null;

                return (
                  <ModelCard
                    key={model._id}
                    model={model}
                    isSelected={isSelected}
                    isMobile={isMobile}
                    isLarge={isLarge}
                    currentImageIndex={currentImageIndex}
                    modelImages={modelImages}
                    onSelect={handleSelectModel}
                    onPrevImage={handlePrevImage}
                    onNextImage={handleNextImage}
                  />
                );
              })}
            </Box>

            {/* Scroll Buttons - Solo desktop */}
            {!isMobile && !selectedModel && models.length > 3 && (
              <>
                <IconButton
                  onClick={() => scrollModels("left")}
                  sx={{
                    position: "absolute",
                    left: -8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "#fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    zIndex: 10,
                    width: 40,
                    height: 40,
                    "&:hover": {
                      bgcolor: "#f5f5f5",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                      "& .MuiSvgIcon-root": {
                        color: "#333F1F",
                      },
                    },
                  }}
                >
                  <ChevronLeft sx={{ color: "#706f6f" }} />
                </IconButton>

                <IconButton
                  onClick={() => scrollModels("right")}
                  sx={{
                    position: "absolute",
                    right: -8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "#fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    zIndex: 10,
                    width: 40,
                    height: 40,
                    "&:hover": {
                      bgcolor: "#f5f5f5",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                      "& .MuiSvgIcon-root": {
                        color: "#333F1F",
                      },
                    },
                  }}
                >
                  <ChevronRight sx={{ color: "#706f6f" }} />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {models.length === 0 && (
          <Box py={4} textAlign="center">
            <Typography
              variant="body2"
              sx={{
                color: "#706f6f",
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              No models available
            </Typography>
          </Box>
        )}
      </Paper>

      {/* ✅ Mobile Drawer para detalles del modelo */}
      <Drawer
        anchor="bottom"
        open={isMobile && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: "80vh",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  color: "#333F1F",
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                Model Details
              </Typography>
              {isModel10 && (
                <Chip
                  label="Special"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    bgcolor: "#E5863C",
                    color: "white",
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
                  }}
                />
              )}
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <Close sx={{ color: "#706f6f" }} />
            </IconButton>
          </Box>
          {selectedModel && (
            <Button
              size="small"
              variant="outlined"
              onClick={handleDeselectModel}
              startIcon={<Close />}
              fullWidth
              sx={{
                mb: 2,
                borderRadius: 2,
                borderColor: "#e0e0e0",
                borderWidth: "2px",
                color: "#706f6f",
                fontWeight: 600,
                textTransform: "none",
                fontFamily: '"Poppins", sans-serif',
                "&:hover": {
                  borderColor: "#333F1F",
                  borderWidth: "2px",
                  color: "#333F1F",
                  bgcolor: "rgba(51, 63, 31, 0.05)",
                },
              }}
            >
              Clear Selection
            </Button>
          )}
          {selectedModel && (
            <ModelInfoPanel
              model={selectedModel}
              isLarge={false}
              isModel10={isModel10}
              balconyLabels={balconyLabels}
              hasPricingOptions={hasPricingOptions}
              selectedPricingOption={selectedPricingOption}
              onOpenCustomization={handleOpenCustomization}
              onViewDetails={(e) => handleViewDetails(e, selectedModel._id)}
            />
          )}
        </Box>
      </Drawer>

      {/* Customization Modal */}
      <ModelCustomizationModal
        open={openCustomizationModal}
        model={selectedModel}
        initialOptions={options}
        onClose={() => setOpenCustomizationModal(false)}
        onConfirm={handleConfirmCustomization}
      />
    </>
  );
};

export default ModelSelector;
