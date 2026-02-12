import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CardActions,
  Avatar,
  Divider,
  MenuItem
} from "@mui/material";
import {
  Home,
  Construction,
  Payment,
  Visibility,
  ArrowBack,
  CheckCircle,
  Lock,
  LockOpen,
  Upload,
  CloudUpload,
  Receipt,
  Pending,
  CheckCircleOutline,
  Cancel,
  ChevronRight,
  LocationOn,
  SquareFoot,
  Bed,
  Bathtub,
  TrendingUp,
  AttachMoney,
  Star,
  Layers,
  AccountBalance,
  AutoAwesome,
  Schedule,
  Info,
  Image as ImageIcon,
  Description,
  OpenInNew,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  ZoomIn,
  Kitchen,
  Deck
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import userPropertyService from "../services/userPropertyService";
import api from "../services/api";
import uploadService from "../services/uploadService";
import { propertyService } from "../services/propertyService";
import {
  getModelImagesForCombination,
  getGalleryCategories,
} from "../services/modelImageService";

const PHASE_DESCRIPTIONS = [
  "Clearing and grading the land, setting up utilities and access",
  "Pouring concrete foundation and slab work",
  "Building the structure frame, walls, and roof structure",
  "Installing roof materials and waterproofing systems",
  "Installing plumbing lines, electrical wiring, and HVAC systems",
  "Adding insulation and hanging drywall throughout the home",
  "Installing flooring, painting, cabinets, and interior fixtures",
  "Completing siding, exterior painting, and landscaping",
  "Final walkthrough, quality checks, and project completion",
];

const PHASE_TITLES = [
  "Site Preparation",
  "Foundation",
  "Framing",
  "Roofing",
  "MEP Installation",
  "Drywall & Insulation",
  "Interior Finishes",
  "Exterior Completion",
  "Final Inspection",
];

const MyProperty = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [phases, setPhases] = useState([]);
  const [loadingPhases, setLoadingPhases] = useState(false);
  const [payloads, setPayloads] = useState([]);
  const [loadingPayloads, setLoadingPayloads] = useState(false);
  const [uploadPaymentDialog, setUploadPaymentDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
      type: "", // ✅ Agregado
    support: "",
    notes: "",
  });
  const [uploadingPayment, setUploadingPayment] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState("all");
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      fetchPhases();
      fetchPayloads();
    }
  }, [selectedProperty]);

  useEffect(() => {
    const items = phases[currentPhaseIndex]?.mediaItems || [];
    setPhaseCarouselIndex(items.length > 0 ? 0 : 0);
  }, [currentPhaseIndex, phases]);

  // ========== GALLERY LOGIC ==========
  const galleryImages = propertyDetails?.property?.images || {
    exterior: [],
    interior: [],
  };
  const allImages = [
    ...galleryImages.exterior.map((url) => ({ url, type: "exterior" })),
    ...galleryImages.interior.map((url) => ({ url, type: "interior" })),
  ];
  const filterImages = (images) => {
    if (galleryFilter === "exterior")
      return images.filter((img) => img.type === "exterior");
    if (galleryFilter === "interior")
      return images.filter((img) => img.type === "interior");
    return images;
  };
  const carouselImages = filterImages(allImages);

  useEffect(() => {
    setCarouselIndex(0);
    console.log("xd", propertyDetails);
  }, [galleryFilter, propertyDetails?.images]);

  const handleCarouselPrev = () => {
    if (!carouselImages.length) return;
    setCarouselIndex(
      (i) => (i - 1 + carouselImages.length) % carouselImages.length,
    );
  };
  const handleCarouselNext = () => {
    if (!carouselImages.length) return;
    setCarouselIndex((i) => (i + 1) % carouselImages.length);
  };
  const handleThumbSelect = (idx) => setCarouselIndex(idx);
  const openLightbox = () => {
    if (!carouselImages.length) return;
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);

  // ...existing code...
  const [phaseCarouselIndex, setPhaseCarouselIndex] = useState(0);
  const [phaseLightboxOpen, setPhaseLightboxOpen] = useState(false);

  const handlePhaseCarouselPrev = () => {
    if (!phases[currentPhaseIndex]?.mediaItems?.length) return;
    setPhaseCarouselIndex(
      (i) =>
        (i - 1 + phases[currentPhaseIndex].mediaItems.length) %
        phases[currentPhaseIndex].mediaItems.length,
    );
  };
  const handlePhaseCarouselNext = () => {
    if (!phases[currentPhaseIndex]?.mediaItems?.length) return;
    setPhaseCarouselIndex(
      (i) => (i + 1) % phases[currentPhaseIndex].mediaItems.length,
    );
  };
  // Reinicia el índice cuando cambias de fase
  useEffect(() => {
    setPhaseCarouselIndex(0);
  }, [currentPhaseIndex]);
  // ...existing code...
  // ========== DATA FETCHING ==========
  const fetchData = async () => {
    try {
      setLoading(true);
      const props = await userPropertyService.getMyProperties();
      setProperties(props);
      const summary = await userPropertyService.getFinancialSummary();
      setFinancialSummary(summary);
      if (props.length === 1) {
        handleSelectProperty(props[0]._id);
      }
    } catch (error) {
      setError(error.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  };
  const handleSelectProperty = async (propertyId) => {
    try {
      setLoading(true);
      const details = await userPropertyService.getPropertyDetails(propertyId);
      console.log("PROPERTY DETAILS:", details.property); // <-- LOG AQUÍ
      setPropertyDetails(details);
      setSelectedProperty(propertyId);
      setActiveTab(0);
    } catch (error) {
      setError(error.message || "Failed to load property details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeselectProperty = () => {
    setSelectedProperty(null);
    setPropertyDetails(null);
    setActiveTab(0);
  };

  const fetchPhases = async () => {
    try {
      setLoadingPhases(true);
      const response = await api.get(`/phases/property/${selectedProperty}`);
      const existingPhases = response.data;
      const allPhases = [];
      for (let i = 1; i <= 9; i++) {
        const existingPhase = existingPhases.find((p) => p.phaseNumber === i);
        if (existingPhase) {
          allPhases.push(existingPhase);
        } else {
          allPhases.push({
            phaseNumber: i,
            title: PHASE_TITLES[i - 1],
            constructionPercentage: 0,
            mediaItems: [],
            property: selectedProperty,
          });
        }
      }
      setPhases(allPhases);
    } catch (error) {
      // handle error
    } finally {
      setLoadingPhases(false);
    }
  };

  const fetchPayloads = async () => {
    try {
      setLoadingPayloads(true);
      const response = await api.get(`/payloads?property=${selectedProperty}`);
      setPayloads(response.data);
    } catch (error) {
      // handle error
    } finally {
      setLoadingPayloads(false);
    }
  };

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

const handleOpenUploadPayment = () => {
  setPaymentForm({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    type: "", // ✅ Agregado
    support: "",
    notes: "",
  });
  setUploadPaymentDialog(true);
};

  const handleCloseUploadPayment = () => {
    setUploadPaymentDialog(false);
    setPaymentForm({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      support: "",
      notes: "",
    });
  };

  const handlePaymentFormChange = (field, value) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }));
  };

const handleSubmitPayment = async () => {
  if (!paymentForm.amount || !paymentForm.type) {
    alert('Please fill in amount and payment type');
    return;
  }

  setUploadingPayment(true);
  try {
    const formData = new FormData();
    formData.append('property', selectedProperty);
    formData.append('amount', paymentForm.amount);
    formData.append('date', paymentForm.date);
    formData.append('type', paymentForm.type); // ✅ Agregado
    formData.append('status', 'pending');
    
    if (paymentForm.support) {
      formData.append('support', paymentForm.support);
    }
    
    if (paymentForm.notes) {
      formData.append('notes', paymentForm.notes);
    }

    await api.post('/payloads', formData);
    handleCloseUploadPayment();
    fetchPayloads();
    alert('Payment submitted successfully!');
  } catch (err) {
    console.error('Error submitting payment:', err);
    alert('Error submitting payment');
  } finally {
    setUploadingPayment(false);
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case "cleared":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "cleared":
        return <CheckCircleOutline />;
      case "pending":
        return <Pending />;
      case "rejected":
        return <Cancel />;
      default:
        return <Receipt />;
    }
  };

  // phase index logic
  useEffect(() => {
    if (phases.length > 0) {
      const firstIncomplete = phases.findIndex(
        (p) => p.constructionPercentage < 100,
      );
      setCurrentPhaseIndex(firstIncomplete === -1 ? 0 : firstIncomplete);
    }
  }, [phases]);

    // ✅ CONSTANTE PARA IDENTIFICAR EL MODELO 10
  const MODEL_10_ID = "6977c7bbd1f24768968719de";
  const isModel10 = propertyDetails?.model?._id === MODEL_10_ID;

  // ✅ LABELS CONDICIONALES PARA BALCONY/ESTUDIO
  const balconyLabels = isModel10
    ? {
        chipLabel: "Estudio",
        icon: Home,
        color: "#2196f3"
      }
    : {
        chipLabel: "Balcony",
        icon: AutoAwesome,
        color: "#4a7c59"
      };

  if (loading && properties.length === 0) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box textAlign="center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <CircularProgress
                size={70}
                thickness={3}
                sx={{ color: "#4a7c59" }}
              />
            </motion.div>
            <Typography
              variant="h6"
              sx={{ mt: 3, color: "#4a7c59", fontWeight: 600 }}
            >
              Loading your properties...
            </Typography>
          </Box>
        </motion.div>
      </Box>
    );
  }

  if (error && properties.length === 0) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", p: 4 }}>
        <Container maxWidth="md">
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </Container>
      </Box>
    );
  }

  if (properties.length === 0) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", p: 4 }}>
        <Container maxWidth="md">
          <Alert severity="info" sx={{ mb: 3 }}>
            No properties found. Contact administration.
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 3,
      }}
    >
      <Container maxWidth="xl">
        {/* ========== HEADER CON ESTADÍSTICAS ========== */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              mb: 4,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              borderRadius: { xs: 4, md: 6 },
              border: "1px solid rgba(74, 124, 89, 0.08)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "40%",
                height: "100%",
                opacity: 0.03,
                backgroundImage:
                  "radial-gradient(circle, #4a7c59 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                display: { xs: "none", md: "block" }, // ✅ Ocultar en mobile
              }}
            />

            {/* HEADER - Siempre visible */}
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              gap={{ xs: 2, sm: 3 }}
              mb={4}
              position="relative"
              zIndex={1}
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Box
                  sx={{
                    width: { xs: 60, sm: 70, md: 90 },
                    height: { xs: 60, sm: 70, md: 90 },
                    borderRadius: { xs: 3, md: 4 },
                    background:
                      "linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 12px 40px rgba(74, 124, 89, 0.3)",
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: -3,
                      borderRadius: { xs: 3, md: 4 },
                      background:
                        "linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)",
                      opacity: 0.3,
                      filter: "blur(10px)",
                    },
                  }}
                >
                  <Home
                    sx={{
                      fontSize: { xs: 30, sm: 38, md: 45 },
                      color: "white",
                    }}
                  />
                </Box>
              </motion.div>
              <Box flex={1}>
                <Typography
                  variant="h3"
                  fontWeight="800"
                  sx={{
                    color: "#2c3e50",
                    letterSpacing: "-1px",
                    mb: { xs: 0.5, sm: 1 },
                    fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" },
                  }}
                >
                  My Properties
                </Typography>
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#6c757d",
                      fontWeight: 400,
                      fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
                    }}
                  >
                    Welcome back,
                  </Typography>
                  <Chip
                    label={user?.firstName || "Investor"}
                    sx={{
                      background:
                        "linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: { xs: "0.75rem", sm: "0.85rem", md: "0.9rem" },
                      height: { xs: 26, sm: 30, md: 32 },
                    }}
                    icon={
                      <Star
                        sx={{
                          color: "white !important",
                          fontSize: { xs: 16, sm: 18, md: 20 },
                        }}
                      />
                    }
                  />
                </Box>
              </Box>
            </Box>

            {/* ESTADÍSTICAS - Con animación de entrada */}
            <AnimatePresence>
              {financialSummary ? (
                <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                  {[
                    {
                      label: "Total Investment",
                      value: `$${financialSummary.totalInvestment.toLocaleString()}`,
                      icon: <AccountBalance />,
                      color: "#4a7c59",
                      bgGradient:
                        "linear-gradient(135deg, #4a7c59 0%, #5a9269 100%)",
                    },
                    {
                      label: "Total Paid",
                      value: `$${financialSummary.totalPaid.toLocaleString()}`,
                      icon: <CheckCircle />,
                      sub: `${Math.round(financialSummary.paymentProgress)}% completed`,
                      color: "#8bc34a",
                      bgGradient:
                        "linear-gradient(135deg, #8bc34a 0%, #9ccc65 100%)",
                    },
                    {
                      label: "Pending Amount",
                      value: `$${financialSummary.totalPending.toLocaleString()}`,
                      icon: <Pending />,
                      color: "#ff9800",
                      bgGradient:
                        "linear-gradient(135deg, #ff9800 0%, #ffa726 100%)",
                    },
                    {
                      label: "Properties Owned",
                      value: financialSummary.properties,
                      icon: <Home />,
                      color: "#2196f3",
                      bgGradient:
                        "linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)",
                    },
                  ].map((stat, index) => (
                    <Grid item xs={6} sm={6} md={3} key={index}>
                      <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          delay: index * 0.1,
                          duration: 0.5,
                          type: "spring",
                          stiffness: 100,
                        }}
                        whileHover={{
                          y: -8,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <Card
                          sx={{
                            height: "100%",
                            borderRadius: { xs: 3, md: 4 },
                            border: "1px solid rgba(0, 0, 0, 0.06)",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            position: "relative",
                            overflow: "hidden",
                            "&:hover": {
                              boxShadow: `0 16px 48px ${stat.color}30`,
                              borderColor: stat.color,
                              transform: "translateY(-4px)",
                            },
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: { xs: 3, md: 4 },
                              background: stat.bgGradient,
                            },
                          }}
                        >
                          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                            <Box
                              display="flex"
                              alignItems="flex-start"
                              justifyContent="space-between"
                              mb={{ xs: 1.5, md: 2 }}
                              flexDirection={{ xs: "column", sm: "row" }}
                              gap={{ xs: 1, sm: 0 }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#6c757d",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                                }}
                              >
                                {stat.label}
                              </Typography>
                              <motion.div
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                              >
                                <Box
                                  sx={{
                                    width: { xs: 36, sm: 42, md: 48 },
                                    height: { xs: 36, sm: 42, md: 48 },
                                    borderRadius: { xs: 2, md: 3 },
                                    background: `${stat.color}15`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: stat.color,
                                  }}
                                >
                                  {React.cloneElement(stat.icon, {
                                    sx: {
                                      fontSize: { xs: 18, sm: 20, md: 24 },
                                    },
                                  })}
                                </Box>
                              </motion.div>
                            </Box>
                            <Typography
                              variant="h4"
                              fontWeight="800"
                              sx={{
                                color: stat.color,
                                mb: 0.5,
                                letterSpacing: "-0.5px",
                                fontSize: {
                                  xs: "1.25rem",
                                  sm: "1.5rem",
                                  md: "2rem",
                                },
                              }}
                            >
                              {stat.value}
                            </Typography>
                            {stat.sub && (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <TrendingUp
                                  sx={{
                                    fontSize: { xs: 12, sm: 14 },
                                    color: stat.color,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#6c757d",
                                    fontWeight: 600,
                                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                  }}
                                >
                                  {stat.sub}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                /* SKELETON LOADER mientras carga */
                <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                  {[0, 1, 2, 3].map((index) => (
                    <Grid item xs={6} sm={6} md={3} key={index}>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          sx={{
                            height: { xs: 140, sm: 160, md: 180 },
                            borderRadius: { xs: 3, md: 4 },
                            border: "1px solid rgba(0, 0, 0, 0.06)",
                            overflow: "hidden",
                          }}
                        >
                          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                            <Box
                              sx={{
                                width: "100%",
                                height: { xs: 12, sm: 14, md: 16 },
                                bgcolor: "#e0e0e0",
                                borderRadius: 1,
                                mb: 2,
                                animation: "pulse 1.5s ease-in-out infinite",
                                "@keyframes pulse": {
                                  "0%, 100%": { opacity: 1 },
                                  "50%": { opacity: 0.5 },
                                },
                              }}
                            />
                            <Box
                              sx={{
                                width: "60%",
                                height: { xs: 28, sm: 32, md: 36 },
                                bgcolor: "#e0e0e0",
                                borderRadius: 1,
                                animation: "pulse 1.5s ease-in-out infinite",
                                "@keyframes pulse": {
                                  "0%, 100%": { opacity: 1 },
                                  "50%": { opacity: 0.5 },
                                },
                              }}
                            />
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              )}
            </AnimatePresence>
          </Paper>
        </motion.div>

        {/* ========== GRID DE PROPIEDADES / DETALLES ========== */}
        <AnimatePresence mode="wait">
          {!selectedProperty ? (
            <motion.div
              key="property-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={4}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <AutoAwesome sx={{ color: "#4a7c59", fontSize: 32 }} />
                  </motion.div>
                  <Typography
                    variant="h4"
                    fontWeight="700"
                    sx={{ color: "#2c3e50" }}
                  >
                    Select Your Property
                  </Typography>
                </Box>
                <Chip
                  label={`${properties.length} ${properties.length === 1 ? "Property" : "Properties"}`}
                  sx={{
                    bgcolor: "#4a7c59",
                    color: "white",
                    fontWeight: 700,
                    px: 2,
                    height: 36,
                  }}
                />
              </Box>

              <Grid container spacing={3}>
                {properties.map((property, index) => (
                  <Grid item xs={12} md={6} lg={4} key={property._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: index * 0.15,
                        duration: 0.6,
                        type: "spring",
                      }}
                      whileHover={{ scale: 1.02 }}
                      onHoverStart={() => setHoveredCard(property._id)}
                      onHoverEnd={() => setHoveredCard(null)}
                    >
                      <Card
                        onClick={() => handleSelectProperty(property._id)}
                        sx={{
                          height: "100%",
                          borderRadius: 5,
                          cursor: "pointer",
                          border:
                            hoveredCard === property._id
                              ? "2px solid #4a7c59"
                              : "1px solid rgba(0, 0, 0, 0.06)",
                          boxShadow:
                            hoveredCard === property._id
                              ? "0 24px 60px rgba(74, 124, 89, 0.25)"
                              : "0 8px 24px rgba(0, 0, 0, 0.08)",
                          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          overflow: "hidden",
                          position: "relative",
                          background:
                            "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                        }}
                      >
                        <motion.div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 5,
                            background:
                              "linear-gradient(90deg, #4a7c59, #8bc34a, #4a7c59)",
                            backgroundSize: "200% 100%",
                          }}
                          animate={
                            hoveredCard === property._id
                              ? {
                                  backgroundPosition: ["0% 50%", "100% 50%"],
                                }
                              : {}
                          }
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />

                        <CardContent sx={{ p: 3 }}>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={2}
                            mb={3}
                          >
                            <motion.div
                              animate={
                                hoveredCard === property._id
                                  ? {
                                      scale: [1, 1.1, 1],
                                      rotate: [0, 5, -5, 0],
                                    }
                                  : {}
                              }
                              transition={{ duration: 0.6 }}
                            >
                              <Avatar
                                sx={{
                                  width: 70,
                                  height: 70,
                                  background:
                                    "linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)",
                                  boxShadow:
                                    "0 8px 24px rgba(74, 124, 89, 0.3)",
                                  overflow: "hidden",
                                }}
                              >
                                {property.images?.exterior?.[0] ? (
                                  <img
                                    src={property.images.exterior[0]}
                                    alt="Property"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <Home sx={{ fontSize: 35, color: "white" }} />
                                )}
                              </Avatar>
                            </motion.div>
                            <Box flex={1}>
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{
                                  color: "#2c3e50",
                                  mb: 0.5,
                                }}
                              >
                                {property.model?.model || "Model N/A"}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <LocationOn
                                  sx={{ fontSize: 16, color: "#4a7c59" }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#6c757d", fontWeight: 500 }}
                                >
                                  Lot #{property.lot?.number} • Sec{" "}
                                  {property.lot?.section}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          {property.model && (
                            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                              {[
                                {
                                  icon: <Bed />,
                                  value: property.model.bedrooms,
                                  label: "Bedrooms",
                                },
                                {
                                  icon: <Bathtub />,
                                  value: property.model.bathrooms,
                                  label: "Bathrooms",
                                },
                                {
                                  icon: <SquareFoot />,
                                  value: property.model.sqft,
                                  label: "Sq Ft",
                                },
                              ].map((spec, idx) => (
                                <Grid item xs={4} key={idx}>
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 300,
                                    }}
                                  >
                                    <Paper
                                      elevation={0}
                                      sx={{
                                        p: 1.5,
                                        textAlign: "center",
                                        bgcolor: "#f8f9fa",
                                        borderRadius: 2.5,
                                        border:
                                          "1px solid rgba(74, 124, 89, 0.1)",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                          bgcolor: "rgba(74, 124, 89, 0.05)",
                                          borderColor: "#4a7c59",
                                          transform: "translateY(-2px)",
                                        },
                                      }}
                                    >
                                      <Box sx={{ color: "#4a7c59", mb: 0.5 }}>
                                        {spec.icon}
                                      </Box>
                                      <Typography
                                        variant="h6"
                                        fontWeight="700"
                                        color="#2c3e50"
                                      >
                                        {spec.value}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#6c757d" }}
                                      >
                                        {spec.label}
                                      </Typography>
                                    </Paper>
                                  </motion.div>
                                </Grid>
                              ))}
                            </Grid>
                          )}

                          <Divider sx={{ my: 2 }} />

                          <Box
                            sx={{
                              p: 2.5,
                              borderRadius: 3,
                              background:
                                "linear-gradient(135deg, rgba(74, 124, 89, 0.08) 0%, rgba(139, 195, 74, 0.08) 100%)",
                              border: "1px solid rgba(74, 124, 89, 0.15)",
                              textAlign: "center",
                              mb: 2,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#6c757d",
                                fontWeight: 600,
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              Property Value
                            </Typography>
                            <Typography
                              variant="h4"
                              fontWeight="800"
                              sx={{
                                color: "#4a7c59",
                                letterSpacing: "-0.5px",
                              }}
                            >
                              ${property.price?.toLocaleString()}
                            </Typography>
                          </Box>

                          <Box display="flex" justifyContent="center">
                            <Chip
                              label={
                                property.status === "sold"
                                  ? "Active Property"
                                  : "In Progress"
                              }
                              color={
                                property.status === "sold"
                                  ? "success"
                                  : "primary"
                              }
                              sx={{ fontWeight: 700, px: 2 }}
                            />
                          </Box>
                        </CardContent>

                        <Divider />

                        <CardActions sx={{ p: 2.5 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            endIcon={
                              <motion.div
                                animate={
                                  hoveredCard === property._id
                                    ? { x: [0, 5, 0] }
                                    : {}
                                }
                                transition={{ duration: 0.6, repeat: Infinity }}
                              >
                                <ChevronRight />
                              </motion.div>
                            }
                            sx={{
                              py: 1.5,
                              borderRadius: 3,
                              background:
                                "linear-gradient(135deg, #4a7c59 0%, #5a9269 100%)",
                              color: "white",
                              fontWeight: 700,
                              textTransform: "none",
                              fontSize: "1rem",
                              boxShadow: "0 8px 20px rgba(74, 124, 89, 0.3)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                background:
                                  "linear-gradient(135deg, #3d664a 0%, #4a7c59 100%)",
                                boxShadow: "0 12px 28px rgba(74, 124, 89, 0.4)",
                                transform: "translateY(-2px)",
                              },
                            }}
                          >
                            View Full Details
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          ) : (
            /* ========== PROPIEDAD SELECCIONADA ========== */
            <motion.div
              key="property-detail"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  startIcon={<ArrowBack />}
                  onClick={handleDeselectProperty}
                  sx={{
                    mb: 3,
                    color: "#4a7c59",
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: "1rem",
                    px: 3,
                    py: 1.2,
                    borderRadius: 3,
                    border: "2px solid #4a7c59",
                    bgcolor: "white",
                    "&:hover": {
                      bgcolor: "#4a7c59",
                      color: "white",
                      transform: "translateX(-8px)",
                      boxShadow: "0 8px 20px rgba(74, 124, 89, 0.3)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Back to Properties
                </Button>
              </motion.div>

              {propertyDetails && (
                <>
                  {/* Property Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        mb: 3,
                        background:
                          "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                        borderRadius: 6,
                        border: "1px solid rgba(74, 124, 89, 0.15)",
                        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <motion.div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 5,
                          background:
                            "linear-gradient(90deg, #4a7c59, #8bc34a, #4a7c59)",
                          backgroundSize: "200% 100%",
                        }}
                        animate={{
                          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />

                      <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <Box 
                          display="flex" 
                          alignItems="center" 
                          gap={2}
                          >
                            <motion.div
                              animate={{
                                y: [0, -10, 0],
                                scale: [1, 1.05, 1],
                              }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              <Avatar
                                sx={{
                                  width: 100,
                                  height: 100,
                                  background:
                                    "linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)",
                                  boxShadow:
                                    "0 15px 40px rgba(74, 124, 89, 0.4)",
                                  border: "4px solid white",
                                  overflow: "hidden",
                                }}
                              >
                                {propertyDetails?.property?.images
                                  ?.exterior?.[0] ? (
                                  <img
                                    src={
                                      propertyDetails.property.images
                                        .exterior[0]
                                    }
                                    alt="Property"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <Home sx={{ fontSize: 50, color: "white" }} />
                                )}
                              </Avatar>
                            </motion.div>
                            <Box
                              sx={{
                                px: { xs: 2, sm: 0 }, // ✅ Padding horizontal en mobile
                              }}
                            >
                              <Typography
                                variant="h3"
                                fontWeight="800"
                                sx={{
                                  color: "#2c3e50",
                                  letterSpacing: "-1px",
                                  mb: 1,
                                  fontSize: { xs: "1.5rem", sm: "2rem", md: "3rem" }, // ✅ Responsive font
                                }}
                              >
                                {propertyDetails.model?.model || "Model N/A"}
                              </Typography>
                            
                              <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                                mb={2}
                                flexWrap="wrap" // ✅ Permite salto de línea si es necesario
                              >
                                <LocationOn sx={{ color: "#4a7c59", fontSize: { xs: 18, sm: 20 } }} />
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: "#6c757d",
                                    fontWeight: 500,
                                    fontSize: { xs: "0.9rem", sm: "1rem", md: "1.25rem" }, // ✅ Responsive
                                  }}
                                >
                                  Lot #{propertyDetails.property.lot?.number} • Section{" "}
                                  {propertyDetails.property.lot?.section}
                                </Typography>
                              </Box>
                            
                              {/* CHIPS RESPONSIVE */}
                              <Box
                                display="flex"
                                gap={1}
                                flexWrap="wrap"
                                sx={{
                                  justifyContent: { xs: "flex-start", sm: "flex-start" }, // ✅ Alineación consistente
                                }}
                              >
                                {propertyDetails.construction.currentPhase && (
                                  <Chip
                                    label={`Phase ${propertyDetails.construction.currentPhase.phaseNumber}: ${propertyDetails.construction.currentPhase.title}`}
                                    sx={{
                                      bgcolor: "#4a7c59",
                                      color: "white",
                                      fontWeight: 700,
                                      fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" }, // ✅ Fuente adaptativa
                                      height: { xs: 28, sm: 32 }, // ✅ Altura menor en mobile
                                      "& .MuiChip-label": {
                                        px: { xs: 1, sm: 1.5 }, // ✅ Padding interno
                                      },
                                    }}
                                    icon={
                                      <Layers
                                        sx={{
                                          color: "white !important",
                                          fontSize: { xs: 14, sm: 16 }, // ✅ Ícono más pequeño
                                        }}
                                      />
                                    }
                                  />
                                )}
                            
                                <Chip
                                  label={
                                    typeof propertyDetails.property.totalConstructionPercentage === "number"
                                      ? `${propertyDetails.property.totalConstructionPercentage}% Complete`
                                      : "—"
                                  }
                                  sx={{
                                    bgcolor: "#8bc34a",
                                    color: "white",
                                    fontWeight: 700,
                                    fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" }, // ✅ Fuente adaptativa
                                    height: { xs: 28, sm: 32 },
                                    "& .MuiChip-label": {
                                      px: { xs: 1, sm: 1.5 },
                                    },
                                  }}
                                  icon={
                                    <Construction
                                      sx={{
                                        color: "white !important",
                                        fontSize: { xs: 14, sm: 16 },
                                      }}
                                    />
                                  }
                                />
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Card
                              sx={{
                                background:
                                  "linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)",
                                color: "white",
                                borderRadius: 4,
                                boxShadow: "0 12px 40px rgba(74, 124, 89, 0.4)",
                              }}
                            >
                              <CardContent sx={{ textAlign: "center", p: 3 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ opacity: 0.9, fontWeight: 600 }}
                                >
                                  Property Value
                                </Typography>
                                <Typography
                                  variant="h2"
                                  fontWeight="900"
                                  sx={{ letterSpacing: "-1px" }}
                                >
                                  $
                                  {propertyDetails.property.price?.toLocaleString()}
                                </Typography>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Grid>
                      </Grid>
                    </Paper>
                  </motion.div>

                  {/* Tabs */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        mb: 3,
                        background: "white",
                        borderRadius: { xs: 3, md: 5 },
                        overflow: "hidden",
                        border: "1px solid rgba(0, 0, 0, 0.06)",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"  // ✅ Cambia de "scrollable" a "fullWidth"
                        sx={{
                          "& .MuiTab-root": {
                            py: { xs: 2, sm: 2.5, md: 3 },
                            px: { xs: 1.5, sm: 2, md: 3 },  // ✅ Reduce padding horizontal en mobile
                            fontWeight: 700,
                            fontSize: {
                              xs: "0.75rem",  // ✅ Reduce fuente en mobile
                              sm: "0.9rem",
                              md: "1rem",
                            },
                            textTransform: "none",
                            color: "#6c757d",
                            transition: "all 0.3s ease",
                            minHeight: { xs: 56, sm: 64, md: 72 },
                            flexDirection: { xs: "column", sm: "row" },
                            gap: { xs: 0.3, sm: 1 },  // ✅ Reduce gap en mobile
                            "&.Mui-selected": {
                              color: "#4a7c59",
                            },
                            "&:hover": {
                              bgcolor: "rgba(74, 124, 89, 0.05)",
                            },
                            "& .MuiSvgIcon-root": {
                              fontSize: { xs: 16, sm: 20, md: 24 },  // ✅ Íconos más pequeños en mobile
                            },
                          },
                          "& .MuiTabs-indicator": {
                            height: { xs: 3, md: 4 },
                            borderRadius: "4px 4px 0 0",
                            bgcolor: "#4a7c59",
                          },
                        }}
                      >
                        <Tab
                          icon={<Construction />}
                          label={
                            <Box sx={{ display: { xs: "none", sm: "block" } }}>
                              Construction Progress
                            </Box>
                          }
                          iconPosition="start"
                        />
                        <Tab
                          icon={<Payment />}
                          label={
                            <Box sx={{ display: { xs: "none", sm: "block" } }}>
                              Payment Status
                            </Box>
                          }
                          iconPosition="start"
                        />
                        <Tab
                          icon={<Visibility />}
                          label={
                            <Box sx={{ display: { xs: "none", sm: "block" } }}>
                              Property Details
                            </Box>
                          }
                          iconPosition="start"
                        />
                      </Tabs>
                    </Paper>
                  </motion.div>

                  {/* Tab Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.4 }}
                    >
                      {/* TAB 0: CONSTRUCTION */}
                      {activeTab === 0 && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 4,
                            background: "white",
                            borderRadius: 5,
                            border: "1px solid rgba(0, 0, 0, 0.06)",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                          }}
                        >
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={2}
                            mb={4}
                          >
                            <Box
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 3,
                                background:
                                  "linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 8px 20px rgba(74, 124, 89, 0.3)",
                              }}
                            >
                              <Construction
                                sx={{ fontSize: 28, color: "white" }}
                              />
                            </Box>
                            <Box>
                              <Typography
                                variant="h5"
                                fontWeight="700"
                                sx={{ color: "#2c3e50" }}
                              >
                                Construction Progress
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "#6c757d" }}
                              >
                                Track each phase of your property construction
                              </Typography>
                            </Box>
                          </Box>

                          {loadingPhases ? (
                            <Box display="flex" justifyContent="center" p={4}>
                              <CircularProgress sx={{ color: "#4a7c59" }} />
                            </Box>
                          ) : (
                            <>
                              {/* Slider de fases */}
                              <Box
                                display="flex"
                                flexDirection={{ xs: "column", sm: "row" }}
                                alignItems="center"
                                justifyContent="center"
                                mb={3}
                                gap={{ xs: 1.5, sm: 2 }}
                              >
                                <Button
                                  variant="outlined"
                                  size={
                                    window.innerWidth < 600 ? "small" : "medium"
                                  }
                                  onClick={() => {
                                    setCurrentPhaseIndex((i) => {
                                      const newIndex = Math.max(i - 1, 0);
                                      setPhaseCarouselIndex(0);
                                      return newIndex;
                                    });
                                  }}
                                  disabled={currentPhaseIndex === 0}
                                  sx={{
                                    minWidth: { xs: 100, sm: 120 },
                                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                  }}
                                >
                                  Previous
                                </Button>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                  sx={{
                                    fontSize: {
                                      xs: "0.9rem",
                                      sm: "1rem",
                                      md: "1.1rem",
                                    },
                                    textAlign: "center",
                                  }}
                                >
                                  Phase {phases[currentPhaseIndex]?.phaseNumber}{" "}
                                  of {phases.length}
                                </Typography>
                                <Button
                                  variant="outlined"
                                  size={
                                    window.innerWidth < 600 ? "small" : "medium"
                                  }
                                  onClick={() => {
                                    setCurrentPhaseIndex((i) => {
                                      const newIndex = Math.min(
                                        i + 1,
                                        phases.length - 1,
                                      );
                                      setPhaseCarouselIndex(0);
                                      return newIndex;
                                    });
                                  }}
                                  disabled={
                                    currentPhaseIndex === phases.length - 1 ||
                                    phases[currentPhaseIndex]
                                      ?.constructionPercentage < 100
                                  }
                                  sx={{
                                    minWidth: { xs: 100, sm: 120 },
                                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                  }}
                                >
                                  Next
                                </Button>
                              </Box>

                              {/* Contenido de la fase actual */}
                              {phases[currentPhaseIndex] && (
                                <Paper
                                  elevation={3}
                                  sx={{
                                    p: { xs: 2, sm: 3, md: 4 },
                                    mb: 3,
                                    bgcolor: "white",
                                    borderRadius: { xs: 3, md: 5 },
                                    border: "1.5px solid #e0e5e9",
                                    boxShadow:
                                      "0 8px 32px 0 rgba(74,124,89,0.10)",
                                    position: "relative",
                                    overflow: "hidden",
                                    transition: "box-shadow 0.3s",
                                    "&:hover": {
                                      boxShadow:
                                        "0 16px 48px 0 rgba(74,124,89,0.18)",
                                    },
                                  }}
                                >
                                  {/* Decorative gradient bar */}
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      width: "100%",
                                      height: { xs: 4, md: 8 },
                                      background:
                                        "linear-gradient(90deg, #4a7c59 0%, #8bc34a 100%)",
                                      opacity: 0.18,
                                      zIndex: 1,
                                    }}
                                  />

                                  {/* HEADER RESPONSIVE */}
                                  <Box
                                    display="flex"
                                    flexDirection={{ xs: "column", sm: "row" }}
                                    alignItems={{
                                      xs: "center",
                                      sm: "flex-start",
                                    }}
                                    gap={{ xs: 2, sm: 2, md: 3 }}
                                    mb={{ xs: 2, md: 3 }}
                                    zIndex={2}
                                    position="relative"
                                  >
                                    <Box
                                      sx={{
                                        width: { xs: 48, sm: 54, md: 64 },
                                        height: { xs: 48, sm: 54, md: 64 },
                                        borderRadius: { xs: 2.5, md: 3 },
                                        background:
                                          "linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow:
                                          "0 4px 16px rgba(74,124,89,0.18)",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {phases[currentPhaseIndex]
                                        .constructionPercentage === 100 ? (
                                        <CheckCircle
                                          sx={{
                                            fontSize: {
                                              xs: 24,
                                              sm: 28,
                                              md: 32,
                                            },
                                            color: "white",
                                          }}
                                        />
                                      ) : phases[currentPhaseIndex]
                                          .constructionPercentage > 0 ? (
                                        <LockOpen
                                          sx={{
                                            fontSize: {
                                              xs: 24,
                                              sm: 28,
                                              md: 32,
                                            },
                                            color: "white",
                                          }}
                                        />
                                      ) : (
                                        <Lock
                                          sx={{
                                            fontSize: {
                                              xs: 24,
                                              sm: 28,
                                              md: 32,
                                            },
                                            color: "white",
                                          }}
                                        />
                                      )}
                                    </Box>

                                    <Box
                                      flex={1}
                                      textAlign={{ xs: "center", sm: "left" }}
                                    >
                                      <Typography
                                        variant="h6"
                                        fontWeight="800"
                                        sx={{
                                          color: "#2c3e50",
                                          letterSpacing: "-0.5px",
                                          fontSize: {
                                            xs: "1rem",
                                            sm: "1.15rem",
                                            md: "1.25rem",
                                          },
                                          mb: 1,
                                        }}
                                      >
                                        Phase{" "}
                                        {phases[currentPhaseIndex].phaseNumber}:{" "}
                                        {phases[currentPhaseIndex].title}
                                      </Typography>

                                      <Box
                                        display="flex"
                                        flexDirection={{
                                          xs: "column",
                                          sm: "row",
                                        }}
                                        alignItems="center"
                                        gap={{ xs: 1, sm: 1.5 }}
                                        justifyContent={{
                                          xs: "center",
                                          sm: "flex-start",
                                        }}
                                      >
                                        <Chip
                                          label={
                                            phases[currentPhaseIndex]
                                              .constructionPercentage === 100
                                              ? "100% Complete"
                                              : `${phases[currentPhaseIndex].constructionPercentage}% Complete`
                                          }
                                          size="small"
                                          sx={{
                                            bgcolor:
                                              phases[currentPhaseIndex]
                                                .constructionPercentage === 100
                                                ? "#8bc34a"
                                                : "#ff9800",
                                            color: "white",
                                            fontWeight: 700,
                                            fontSize: {
                                              xs: "0.75rem",
                                              sm: "0.85rem",
                                              md: "0.9rem",
                                            },
                                            height: { xs: 24, sm: 28, md: 32 },
                                          }}
                                        />
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "#6c757d",
                                            fontWeight: 600,
                                            fontSize: {
                                              xs: "0.7rem",
                                              sm: "0.75rem",
                                              md: "0.8rem",
                                            },
                                            display: {
                                              xs: "block",
                                              sm: "inline",
                                            },
                                            textAlign: {
                                              xs: "center",
                                              sm: "left",
                                            },
                                          }}
                                        >
                                          {
                                            PHASE_DESCRIPTIONS[
                                              phases[currentPhaseIndex]
                                                .phaseNumber - 1
                                            ]
                                          }
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>

                                  {/* Progress Bar */}
                                  <Box
                                    mb={{ xs: 2, md: 3 }}
                                    zIndex={2}
                                    position="relative"
                                  >
                                    <LinearProgress
                                      variant="determinate"
                                      value={
                                        phases[currentPhaseIndex]
                                          .constructionPercentage
                                      }
                                      sx={{
                                        height: { xs: 8, sm: 10, md: 12 },
                                        borderRadius: { xs: 2, md: 3 },
                                        bgcolor: "#e0e0e0",
                                        "& .MuiLinearProgress-bar": {
                                          background:
                                            "linear-gradient(90deg, #4a7c59 0%, #8bc34a 100%)",
                                          borderRadius: { xs: 2, md: 3 },
                                        },
                                      }}
                                    />
                                  </Box>
                                  {/* Galería de imágenes */}
                                  {phases[currentPhaseIndex].mediaItems &&
                                  phases[currentPhaseIndex].mediaItems.length >
                                    0 ? (
                                    <Box sx={{ mb: 2 }}>
                                      {/* Carrusel principal */}
                                      <Box
                                        sx={{
                                          bgcolor: "#000",
                                          borderRadius: 2,
                                          p: 2,
                                          minHeight: 280,
                                          height: 340,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          position: "relative",
                                          overflow: "hidden",
                                        }}
                                      >
                                        <AnimatePresence mode="wait">
                                          {(() => {
                                            const items =
                                              phases[currentPhaseIndex]
                                                .mediaItems;
                                            const safeIndex = Math.min(
                                              phaseCarouselIndex,
                                              items.length - 1,
                                            );
                                            const currentImage =
                                              items[safeIndex];
                                            return currentImage ? (
                                              <motion.img
                                                key={`phase-carousel-${currentPhaseIndex}-${safeIndex}`}
                                                src={currentImage.url}
                                                alt={currentImage.title}
                                                initial={{
                                                  opacity: 0,
                                                  scale: 0.95,
                                                }}
                                                animate={{
                                                  opacity: 1,
                                                  scale: 1,
                                                }}
                                                exit={{
                                                  opacity: 0,
                                                  scale: 0.95,
                                                }}
                                                transition={{ duration: 0.3 }}
                                                style={{
                                                  maxWidth: "90%",
                                                  maxHeight: "100%",
                                                  objectFit: "contain",
                                                  borderRadius: 8,
                                                  cursor: "pointer",
                                                }}
                                                onClick={() =>
                                                  setPhaseLightboxOpen(true)
                                                }
                                              />
                                            ) : (
                                              <Typography color="white">
                                                No images available for this
                                                phase
                                              </Typography>
                                            );
                                          })()}
                                        </AnimatePresence>
                                        {phases[currentPhaseIndex].mediaItems
                                          .length > 1 && (
                                          <>
                                            <IconButton
                                              onClick={handlePhaseCarouselPrev}
                                              sx={{
                                                position: "absolute",
                                                left: 12,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                bgcolor:
                                                  "rgba(255,255,255,0.95)",
                                                boxShadow: 3,
                                              }}
                                            >
                                              <KeyboardArrowLeft />
                                            </IconButton>
                                            <IconButton
                                              onClick={handlePhaseCarouselNext}
                                              sx={{
                                                position: "absolute",
                                                right: 12,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                bgcolor:
                                                  "rgba(255,255,255,0.95)",
                                                boxShadow: 3,
                                              }}
                                            >
                                              <KeyboardArrowRight />
                                            </IconButton>
                                          </>
                                        )}
                                        <Box
                                          sx={{
                                            position: "absolute",
                                            bottom: 12,
                                            left: 12,
                                            bgcolor: "rgba(0,0,0,0.6)",
                                            color: "white",
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 2,
                                          }}
                                        >
                                          <Typography
                                            variant="caption"
                                            fontWeight="600"
                                          >
                                            {Math.min(
                                              phaseCarouselIndex + 1,
                                              phases[currentPhaseIndex]
                                                .mediaItems.length,
                                            )}{" "}
                                            /{" "}
                                            {
                                              phases[currentPhaseIndex]
                                                .mediaItems.length
                                            }
                                          </Typography>
                                        </Box>
                                      </Box>
                                      {/* Miniaturas */}
                                      <Box
                                        sx={{
                                          display: "flex",
                                          gap: 1,
                                          mt: 1,
                                          overflowX: "auto",
                                        }}
                                      >
                                        {phases[
                                          currentPhaseIndex
                                        ].mediaItems.map((media, idx) => (
                                          <Box
                                            key={idx}
                                            onClick={() =>
                                              setPhaseCarouselIndex(idx)
                                            }
                                            sx={{
                                              width: 64,
                                              height: 64,
                                              borderRadius: 1.5,
                                              overflow: "hidden",
                                              cursor: "pointer",
                                              border:
                                                idx === phaseCarouselIndex
                                                  ? "2px solid #4a7c59"
                                                  : "1px solid rgba(0,0,0,0.06)",
                                              boxShadow:
                                                idx === phaseCarouselIndex
                                                  ? "0 4px 12px rgba(74,124,89,0.12)"
                                                  : "none",
                                            }}
                                          >
                                            <img
                                              src={media.url}
                                              alt={media.title}
                                              style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                              }}
                                            />
                                          </Box>
                                        ))}
                                      </Box>
                                      {/* Lightbox para imagen ampliada */}
                                      <Dialog
                                        open={phaseLightboxOpen}
                                        onClose={() =>
                                          setPhaseLightboxOpen(false)
                                        }
                                        maxWidth="lg"
                                        fullWidth
                                      >
                                        <DialogContent
                                          sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            bgcolor: "transparent",
                                          }}
                                        >
                                          <Box sx={{ position: "relative" }}>
                                            <IconButton
                                              onClick={() =>
                                                setPhaseLightboxOpen(false)
                                              }
                                              sx={{
                                                position: "absolute",
                                                top: 16,
                                                right: 16,
                                                color: "white",
                                                bgcolor: "rgba(0, 0, 0, 0.5)",
                                                zIndex: 10,
                                                "&:hover": {
                                                  bgcolor: "rgba(0, 0, 0, 0.7)",
                                                },
                                              }}
                                            >
                                              <Cancel />
                                            </IconButton>
                                            {(() => {
                                              const items =
                                                phases[currentPhaseIndex]
                                                  .mediaItems;
                                              const safeIndex = Math.min(
                                                phaseCarouselIndex,
                                                items.length - 1,
                                              );
                                              const currentImage =
                                                items[safeIndex];
                                              return (
                                                currentImage && (
                                                  <img
                                                    src={currentImage.url}
                                                    alt="phase-lightbox"
                                                    style={{
                                                      width: "100%",
                                                      maxHeight: "80vh",
                                                      objectFit: "contain",
                                                      borderRadius: 8,
                                                    }}
                                                  />
                                                )
                                              );
                                            })()}
                                          </Box>
                                        </DialogContent>
                                      </Dialog>
                                    </Box>
                                  ) : (
                                    <Alert
                                      severity="info"
                                      icon={<ImageIcon />}
                                      sx={{
                                        borderRadius: 3,
                                        bgcolor: "rgba(33, 150, 243, 0.08)",
                                        border:
                                          "1px solid rgba(33, 150, 243, 0.2)",
                                        fontWeight: 600,
                                      }}
                                    >
                                      No images uploaded for this phase yet.
                                      Images will appear here once construction
                                      progresses.
                                    </Alert>
                                  )}
                                </Paper>
                              )}
                            </>
                          )}
                        </Paper>
                      )}

                      {/* TAB 1: PAYMENTS */}
                      {activeTab === 1 && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: { xs: 2, sm: 3, md: 4 },
                            background: "white",
                            borderRadius: { xs: 3, md: 5 },
                            border: "1px solid rgba(0, 0, 0, 0.06)",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                          }}
                        >
                          {/* HEADER RESPONSIVE */}
                          <Box
                            display="flex"
                            flexDirection={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "stretch", sm: "center" }}
                            gap={{ xs: 2, sm: 2, md: 3 }}
                            mb={{ xs: 3, md: 4 }}
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={{ xs: 1.5, sm: 2 }}
                            >
                              <Box
                                sx={{
                                  width: { xs: 48, sm: 52, md: 56 },
                                  height: { xs: 48, sm: 52, md: 56 },
                                  borderRadius: { xs: 2.5, md: 3 },
                                  background:
                                    "linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow:
                                    "0 8px 20px rgba(33, 150, 243, 0.3)",
                                  flexShrink: 0,
                                }}
                              >
                                <Payment
                                  sx={{
                                    fontSize: { xs: 24, sm: 26, md: 28 },
                                    color: "white",
                                  }}
                                />
                              </Box>
                              <Box>
                                <Typography
                                  variant="h5"
                                  fontWeight="700"
                                  sx={{
                                    color: "#2c3e50",
                                    fontSize: {
                                      xs: "1.1rem",
                                      sm: "1.25rem",
                                      md: "1.5rem",
                                    },
                                  }}
                                >
                                  Payment Status
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#6c757d",
                                    fontSize: {
                                      xs: "0.75rem",
                                      sm: "0.85rem",
                                      md: "0.875rem",
                                    },
                                    display: { xs: "none", sm: "block" },
                                  }}
                                >
                                  Manage and track your payment history
                                </Typography>
                              </Box>
                            </Box>

                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant="contained"
                                startIcon={
                                  <Upload
                                    sx={{ fontSize: { xs: 18, sm: 20 } }}
                                  />
                                }
                                onClick={handleOpenUploadPayment}
                                fullWidth={{ xs: true, sm: false }}
                                sx={{
                                  py: { xs: 1.2, sm: 1.5 },
                                  px: { xs: 2, sm: 3 },
                                  borderRadius: { xs: 2.5, md: 3 },
                                  background:
                                    "linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)",
                                  color: "white",
                                  fontWeight: 700,
                                  textTransform: "none",
                                  fontSize: {
                                    xs: "0.85rem",
                                    sm: "0.9rem",
                                    md: "1rem",
                                  },
                                  boxShadow:
                                    "0 8px 20px rgba(74, 124, 89, 0.3)",
                                  "&:hover": {
                                    background:
                                      "linear-gradient(135deg, #3d664a 0%, #7ba843 100%)",
                                    boxShadow:
                                      "0 12px 28px rgba(74, 124, 89, 0.4)",
                                  },
                                }}
                              >
                                Upload Payment
                              </Button>
                            </motion.div>
                          </Box>

                          {/* PAYMENT SUMMARY CARDS - RESPONSIVE */}
                          <Grid
                            container
                            spacing={{ xs: 2, sm: 2.5, md: 3 }}
                            sx={{ mb: { xs: 3, md: 4 } }}
                          >
                            {[
                              {
                                label: "Total Paid",
                                value: `$${propertyDetails.payment.totalPaid.toLocaleString()}`,
                                color: "#8bc34a",
                                icon: <CheckCircle />,
                              },
                              {
                                label: "Pending Amount",
                                value: `$${propertyDetails.payment.totalPending.toLocaleString()}`,
                                color: "#ff9800",
                                icon: <Schedule />,
                              },
                              {
                                label: "Payment Progress",
                                value: `${Math.round(propertyDetails.payment.progress)}%`,
                                color: "#2196f3",
                                icon: <TrendingUp />,
                              },
                            ].map((stat, index) => (
                              <Grid item xs={12} sm={6} md={4} key={index}>
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ y: -5 }}
                                >
                                  <Card
                                    sx={{
                                      borderRadius: { xs: 3, md: 4 },
                                      border: `2px solid ${stat.color}30`,
                                      boxShadow: `0 8px 24px ${stat.color}20`,
                                      transition: "all 0.3s ease",
                                      "&:hover": {
                                        borderColor: stat.color,
                                        boxShadow: `0 12px 32px ${stat.color}30`,
                                      },
                                    }}
                                  >
                                    <CardContent
                                      sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}
                                    >
                                      <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        mb={{ xs: 1.5, md: 2 }}
                                        flexWrap="wrap"
                                        gap={1}
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "#6c757d",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                            fontSize: {
                                              xs: "0.7rem",
                                              sm: "0.75rem",
                                            },
                                          }}
                                        >
                                          {stat.label}
                                        </Typography>
                                        <Box
                                          sx={{
                                            width: { xs: 40, sm: 44, md: 48 },
                                            height: { xs: 40, sm: 44, md: 48 },
                                            borderRadius: { xs: 2, md: 3 },
                                            background: `${stat.color}15`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: stat.color,
                                          }}
                                        >
                                          {React.cloneElement(stat.icon, {
                                            sx: {
                                              fontSize: {
                                                xs: 20,
                                                sm: 22,
                                                md: 24,
                                              },
                                            },
                                          })}
                                        </Box>
                                      </Box>
                                      <Typography
                                        variant="h3"
                                        fontWeight="800"
                                        sx={{
                                          color: stat.color,
                                          letterSpacing: "-0.5px",
                                          fontSize: {
                                            xs: "1.75rem",
                                            sm: "2rem",
                                            md: "2.5rem",
                                          },
                                        }}
                                      >
                                        {stat.value}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              </Grid>
                            ))}
                          </Grid>

                          {/* PAYMENT HISTORY - RESPONSIVE TABLE */}
                          
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{
                                color: "#2c3e50",
                                fontWeight: 700,
                                mb: 2,
                                fontSize: {
                                  xs: "1rem",
                                  sm: "1.15rem",
                                  md: "1.25rem",
                                },
                              }}
                            >
                              Payment History ({payloads.length} transaction
                              {payloads.length !== 1 ? "s" : ""})
                            </Typography>
                          
                            {loadingPayloads ? (
                              <Box display="flex" justifyContent="center" p={4}>
                                <CircularProgress sx={{ color: "#4a7c59" }} />
                              </Box>
                            ) : payloads.length > 0 ? (
                              <>
                                {/* DESKTOP TABLE (hidden on xs) */}
                                <TableContainer
                                  component={Paper}
                                  elevation={0}
                                  sx={{
                                    display: { xs: "none", md: "block" },
                                    borderRadius: 4,
                                    border: "1px solid rgba(0, 0, 0, 0.06)",
                                    overflow: "hidden",
                                  }}
                                >
                                  <Table>
                                    <TableHead>
                                      <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                                        <TableCell
                                          sx={{
                                            fontWeight: 700,
                                            color: "#2c3e50",
                                          }}
                                        >
                                          Date
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            fontWeight: 700,
                                            color: "#2c3e50",
                                          }}
                                        >
                                          Amount
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            fontWeight: 700,
                                            color: "#2c3e50",
                                          }}
                                        >
                                          Type
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            fontWeight: 700,
                                            color: "#2c3e50",
                                          }}
                                        >
                                          Status
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            fontWeight: 700,
                                            color: "#2c3e50",
                                          }}
                                        >
                                          Support
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            fontWeight: 700,
                                            color: "#2c3e50",
                                          }}
                                        >
                                          Notes
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {payloads.map((payload, index) => (
                                        <motion.tr
                                          key={payload._id}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: index * 0.05 }}
                                          component={TableRow}
                                          sx={{
                                            "&:hover": {
                                              bgcolor: "rgba(74, 124, 89, 0.05)",
                                            },
                                            transition: "all 0.3s ease",
                                          }}
                                        >
                                          <TableCell>
                                            <Typography
                                              variant="body2"
                                              sx={{ fontWeight: 600 }}
                                            >
                                              {new Date(payload.date).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                              })}
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Typography
                                              variant="h6"
                                              sx={{
                                                color: "#4a7c59",
                                                fontWeight: 700,
                                              }}
                                            >
                                              ${payload.amount.toLocaleString()}
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Chip
                                              label={payload.type || "N/A"}
                                              size="small"
                                              sx={{
                                                bgcolor: "#e3f2fd",
                                                color: "#1976d2",
                                                fontWeight: 600,
                                                textTransform: "capitalize",
                                                fontSize: "0.75rem",
                                              }}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Chip
                                              icon={getStatusIcon(payload.status)}
                                              label={payload.status.toUpperCase()}
                                              color={getStatusColor(payload.status)}
                                              sx={{ fontWeight: 700 }}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            {payload.support ? (
                                              <Button
                                                size="small"
                                                variant="outlined"
                                                href={payload.support}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                startIcon={<Description />}
                                                sx={{
                                                  borderRadius: 2,
                                                  textTransform: "none",
                                                  fontWeight: 600,
                                                }}
                                              >
                                                View Receipt
                                              </Button>
                                            ) : (
                                              <Typography
                                                variant="caption"
                                                sx={{ color: "#999" }}
                                              >
                                                No document
                                              </Typography>
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            <Typography
                                              variant="body2"
                                              sx={{ color: "#6c757d" }}
                                            >
                                              {payload.notes || "No notes"}
                                            </Typography>
                                          </TableCell>
                                        </motion.tr>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                          
                                {/* MOBILE CARDS (visible only on xs/sm) */}
                                <Box sx={{ display: { xs: "block", md: "none" } }}>
                                  {payloads.map((payload, index) => (
                                    <motion.div
                                      key={payload._id}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                    >
                                      <Card
                                        sx={{
                                          mb: 2,
                                          borderRadius: 3,
                                          border: "1px solid rgba(0, 0, 0, 0.06)",
                                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                                          transition: "all 0.3s ease",
                                          "&:hover": {
                                            boxShadow: "0 8px 24px rgba(74, 124, 89, 0.12)",
                                            borderColor: "#4a7c59",
                                          },
                                        }}
                                      >
                                        <CardContent sx={{ p: 2 }}>
                                          {/* Header: Date + Status */}
                                          <Box
                                            display="flex"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            mb={2}
                                            flexWrap="wrap"
                                            gap={1}
                                          >
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                color: "#6c757d",
                                                fontWeight: 600,
                                              }}
                                            >
                                              {new Date(payload.date).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                              })}
                                            </Typography>
                                            <Chip
                                              icon={getStatusIcon(payload.status)}
                                              label={payload.status.toUpperCase()}
                                              color={getStatusColor(payload.status)}
                                              size="small"
                                              sx={{
                                                fontWeight: 700,
                                                fontSize: "0.7rem",
                                              }}
                                            />
                                          </Box>
                          
                                          {/* Payment Type */}
                                          {payload.type && (
                                            <Box mb={2}>
                                              <Chip
                                                label={payload.type}
                                                size="small"
                                                sx={{
                                                  bgcolor: "#e3f2fd",
                                                  color: "#1976d2",
                                                  fontWeight: 600,
                                                  textTransform: "capitalize",
                                                  fontSize: "0.7rem",
                                                }}
                                              />
                                            </Box>
                                          )}
                          
                                          {/* Amount - destacado */}
                                          <Box
                                            sx={{
                                              p: 2,
                                              bgcolor: "rgba(74, 124, 89, 0.05)",
                                              borderRadius: 2,
                                              mb: 2,
                                              textAlign: "center",
                                            }}
                                          >
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                color: "#6c757d",
                                                display: "block",
                                                mb: 0.5,
                                              }}
                                            >
                                              Amount
                                            </Typography>
                                            <Typography
                                              variant="h5"
                                              sx={{
                                                color: "#4a7c59",
                                                fontWeight: 800,
                                                letterSpacing: "-0.5px",
                                              }}
                                            >
                                              ${payload.amount.toLocaleString()}
                                            </Typography>
                                          </Box>
                          
                                          {/* Notes */}
                                          {payload.notes && (
                                            <Box mb={2}>
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  color: "#6c757d",
                                                  fontWeight: 600,
                                                  display: "block",
                                                  mb: 0.5,
                                                }}
                                              >
                                                Notes:
                                              </Typography>
                                              <Typography
                                                variant="body2"
                                                sx={{ color: "#2c3e50" }}
                                              >
                                                {payload.notes}
                                              </Typography>
                                            </Box>
                                          )}
                          
                                          {/* Support Document Button */}
                                          {payload.support && (
                                            <Button
                                              fullWidth
                                              size="small"
                                              variant="outlined"
                                              href={payload.support}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              startIcon={<Description />}
                                              sx={{
                                                borderRadius: 2,
                                                textTransform: "none",
                                                fontWeight: 600,
                                                py: 1,
                                              }}
                                            >
                                              View Receipt
                                            </Button>
                                          )}
                                        </CardContent>
                                      </Card>
                                    </motion.div>
                                  ))}
                                </Box>
                              </>
                            ) : (
                              <Alert
                                severity="info"
                                icon={<Info />}
                                sx={{
                                  borderRadius: { xs: 2, md: 3 },
                                  bgcolor: "rgba(33, 150, 243, 0.08)",
                                  border: "1px solid rgba(33, 150, 243, 0.2)",
                                  fontSize: { xs: "0.85rem", md: "1rem" },
                                }}
                              >
                                No payment transactions yet. Click "Upload Payment" to add your first payment.
                              </Alert>
                            )}
                          </Box>
                          
                        </Paper>
                      )}
  
                      {/* TAB 2: PROPERTY DETAILS */}
                                  {/* ✅ TAB 2: PROPERTY DETAILS - CON VALIDACIÓN MODELO 10 */}
            {activeTab === 2 && (
              <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: 3 }}>
                {/* ✅ CHIPS DE OPCIONES CON VALIDACIÓN CONDICIONAL */}
                <Box sx={{ mb: 3 }}>
                  <Grid item xs={12} sx={{ mb: 3 }}>
                    <Box
                      display="flex"
                      gap={2}
                      flexWrap="wrap"
                      justifyContent="center"
                      mt={2}
                    >
                      {/* ✅ Chip de Balcony/Estudio condicional */}
                      {propertyDetails.property?.hasBalcony && (
                        <Chip
                          icon={React.createElement(balconyLabels.icon, {
                            sx: { color: "#fff" }
                          })}
                          label={balconyLabels.chipLabel}
                          sx={{
                            bgcolor: balconyLabels.color,
                            color: "white",
                            fontWeight: 700,
                            fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                            height: { xs: 32, sm: 36, md: 40 },
                            px: { xs: 1.5, sm: 2 }
                          }}
                        />
                      )}

                      {/* ✅ Chip de Upgrade - sin cambios */}
                      {propertyDetails.property.modelType === "upgrade" && (
                        <Chip
                          icon={<Star sx={{ color: "#fff" }} />}
                          label="Upgrade"
                          sx={{
                            bgcolor: "#ff9800",
                            color: "white",
                            fontWeight: 700,
                            fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                            height: { xs: 32, sm: 36, md: 40 },
                            px: { xs: 1.5, sm: 2 }
                          }}
                        />
                      )}

                      {/* ✅ Chip de Storage - sin cambios */}
                      {propertyDetails.property?.hasStorage && (
                        <Chip
                          icon={<Layers sx={{ color: "#fff" }} />}
                          label="Storage"
                          sx={{
                            bgcolor: "#607d8b",
                            color: "white",
                            fontWeight: 700,
                            fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                            height: { xs: 32, sm: 36, md: 40 },
                            px: { xs: 1.5, sm: 2 }
                          }}
                        />
                      )}

                      {/* ✅ NUEVO: Badge especial para Modelo 10 */}
                      {isModel10 && (
                        <Chip
                          label="Special Configuration"
                          sx={{
                            bgcolor: "#9c27b0",
                            color: "white",
                            fontWeight: 700,
                            fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                            height: { xs: 32, sm: 36, md: 40 },
                            px: { xs: 1.5, sm: 2 }
                          }}
                          icon={<Star sx={{ color: "#fff" }} />}
                        />
                      )}
                    </Box>
                  </Grid>

                  {/* ✅ TOOLTIP INFORMATIVO PARA MODELO 10 */}
                  {isModel10 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Alert
                        severity="info"
                        icon={<Info />}
                        sx={{
                          mb: 3,
                          borderRadius: 3,
                          bgcolor: "rgba(33, 150, 243, 0.08)",
                          border: "1px solid rgba(33, 150, 243, 0.2)",
                          "& .MuiAlert-message": {
                            width: "100%"
                          }
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>
                            🏠 Model 10 Special Features
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#6c757d" }}>
                            {propertyDetails.property?.hasBalcony 
                              ? "This property includes an Estudio - a flexible space perfect for home office or study area."
                              : "This is a special configuration model with unique layout options."
                            }
                          </Typography>
                        </Box>
                      </Alert>
                    </motion.div>
                  )}

                  {/* CARRUSEL Y MINIATURAS - Sin cambios en la estructura */}
                  <Box
                    display="flex"
                    gap={2}
                    alignItems="flex-start"
                    flexDirection={{ xs: "column", md: "row" }}
                  >
                    {/* MAIN CAROUSEL */}
                    <Box
                      sx={{
                        flex: 1,
                        bgcolor: "#000",
                        borderRadius: 2,
                        p: 2,
                        minHeight: 320,
                        height: { xs: 300, sm: 360, md: 420 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {carouselImages && carouselImages[carouselIndex] ? (
                          <motion.img
                            key={`carousel-${carouselIndex}-${carouselImages.length}`}
                            src={carouselImages[carouselIndex].url}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              maxWidth: "90%",
                              maxHeight: "100%",
                              objectFit: "contain",
                              borderRadius: 8,
                              cursor: "pointer"
                            }}
                            onClick={openLightbox}
                          />
                        ) : (
                          <Box textAlign="center">
                            <Home sx={{ fontSize: 60, color: "#666", mb: 2 }} />
                            <Typography color="white">
                              No property images available
                            </Typography>
                          </Box>
                        )}
                      </AnimatePresence>

                      {carouselImages.length > 1 && (
                        <>
                          <IconButton
                            onClick={handleCarouselPrev}
                            sx={{
                              position: "absolute",
                              left: 12,
                              top: "50%",
                              transform: "translateY(-50%)",
                              bgcolor: "rgba(255,255,255,0.95)",
                              boxShadow: 3,
                              "&:hover": {
                                bgcolor: "white",
                                transform: "scale(1.1) translateY(-50%)"
                              }
                            }}
                          >
                            <KeyboardArrowLeft />
                          </IconButton>
                          <IconButton
                            onClick={handleCarouselNext}
                            sx={{
                              position: "absolute",
                              right: 12,
                              top: "50%",
                              transform: "translateY(-50%)",
                              bgcolor: "rgba(255,255,255,0.95)",
                              boxShadow: 3,
                              "&:hover": {
                                bgcolor: "white",
                                transform: "scale(1.1) translateY(-50%)"
                              }
                            }}
                          >
                            <KeyboardArrowRight />
                          </IconButton>
                        </>
                      )}

                      {carouselImages.length > 0 && (
                        <>
                          <IconButton
                            onClick={openLightbox}
                            sx={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              bgcolor: "rgba(255,255,255,0.95)",
                              "&:hover": {
                                bgcolor: "white",
                                transform: "scale(1.1)"
                              }
                            }}
                          >
                            <ZoomIn />
                          </IconButton>

                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 12,
                              left: 12,
                              bgcolor: "rgba(0,0,0,0.7)",
                              color: "white",
                              px: 2,
                              py: 0.5,
                              borderRadius: 2,
                              backdropFilter: "blur(4px)"
                            }}
                          >
                            <Typography variant="caption" fontWeight="600">
                              {carouselIndex + 1} / {carouselImages.length}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>

                    {/* THUMBNAILS */}
                    <Box
                      sx={{
                        width: { xs: "100%", md: 300 },
                        mt: { xs: 1, md: 0 },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          mb: 1,
                        }}
                      >
                        <Chip
                          label={`All (${allImages.length})`}
                          size="small"
                          onClick={() => setGalleryFilter("all")}
                          variant={galleryFilter === "all" ? "filled" : "outlined"}
                          color={galleryFilter === "all" ? "primary" : "default"}
                          sx={{ 
                            fontWeight: galleryFilter === "all" ? 700 : 500,
                            cursor: "pointer"
                          }}
                        />
                        <Chip
                          label={`Exterior (${allImages.filter((img) => img.type === "exterior").length})`}
                          size="small"
                          onClick={() => setGalleryFilter("exterior")}
                          variant={galleryFilter === "exterior" ? "filled" : "outlined"}
                          color={galleryFilter === "exterior" ? "primary" : "default"}
                          sx={{ 
                            fontWeight: galleryFilter === "exterior" ? 700 : 500,
                            cursor: "pointer"
                          }}
                        />
                        <Chip
                          label={`Interior (${allImages.filter((img) => img.type === "interior").length})`}
                          size="small"
                          onClick={() => setGalleryFilter("interior")}
                          variant={galleryFilter === "interior" ? "filled" : "outlined"}
                          color={galleryFilter === "interior" ? "primary" : "default"}
                          sx={{ 
                            fontWeight: galleryFilter === "interior" ? 700 : 500,
                            cursor: "pointer"
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          maxHeight: { xs: 240, md: 420 },
                          overflowY: "auto",
                          pr: 1,
                          "&::-webkit-scrollbar": {
                            width: 6
                          },
                          "&::-webkit-scrollbar-thumb": {
                            bgcolor: "grey.400",
                            borderRadius: 3
                          }
                        }}
                      >
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: 1,
                          }}
                        >
                          {carouselImages.length === 0 ? (
                            <Box 
                              sx={{ 
                                gridColumn: "1 / -1", 
                                textAlign: "center",
                                py: 4 
                              }}
                            >
                              <ImageIcon sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
                              <Typography variant="caption" color="text.secondary">
                                No images available
                              </Typography>
                            </Box>
                          ) : (
                            carouselImages.map((img, i) => (
                              <motion.div
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Box
                                  onClick={() => handleThumbSelect(i)}
                                  sx={{
                                    width: "100%",
                                    height: { xs: 70, md: 80 },
                                    borderRadius: 1.5,
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    border: i === carouselIndex
                                      ? "3px solid #4a7c59"
                                      : "1px solid rgba(0,0,0,0.06)",
                                    boxShadow: i === carouselIndex
                                      ? "0 8px 24px rgba(74,124,89,0.2)"
                                      : "none",
                                    transition: "all 0.3s ease",
                                    position: "relative",
                                    "&:hover": {
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                                    }
                                  }}
                                >
                                  <img
                                    src={img.url}
                                    alt={`thumb-${i}`}
                                    loading="lazy"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                  {i === carouselIndex && (
                                    <Box
                                      sx={{
                                        position: "absolute",
                                        top: 4,
                                        right: 4,
                                        bgcolor: "#4a7c59",
                                        borderRadius: "50%",
                                        width: 20,
                                        height: 20,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                      }}
                                    >
                                      <CheckCircle sx={{ fontSize: 14, color: "white" }} />
                                    </Box>
                                  )}
                                </Box>
                              </motion.div>
                            ))
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* LIGHTBOX DIALOG */}
                <Dialog
                  open={lightboxOpen}
                  onClose={closeLightbox}
                  maxWidth="lg"
                  fullWidth
                  PaperProps={{
                    sx: {
                      bgcolor: "transparent",
                      boxShadow: "none",
                      overflow: "visible"
                    }
                  }}
                >
                  <DialogContent
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      bgcolor: "transparent",
                      p: 0
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <IconButton
                        onClick={closeLightbox}
                        sx={{
                          position: "absolute",
                          top: -50,
                          right: 0,
                          color: "white",
                          bgcolor: "rgba(0, 0, 0, 0.6)",
                          zIndex: 10,
                          "&:hover": {
                            bgcolor: "rgba(0, 0, 0, 0.8)",
                            transform: "scale(1.1)"
                          },
                        }}
                      >
                        <Cancel />
                      </IconButton>
                      {carouselImages.length > 0 && (
                        <motion.img
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          src={carouselImages[carouselIndex].url}
                          alt="lightbox"
                          style={{
                            width: "100%",
                            maxHeight: "85vh",
                            objectFit: "contain",
                            borderRadius: 12,
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
                          }}
                        />
                      )}
                    </Box>
                  </DialogContent>
                </Dialog>

                {/* ✅ SPECIFICATIONS GRID - CON INFORMACIÓN ADICIONAL PARA MODELO 10 */}
                <Box sx={{ mt: 4 }}>
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    gap={2} 
                    mb={3}
                    flexWrap="wrap"
                  >
                    <Typography
                      variant="h6"
                      fontWeight="700"
                      sx={{
                        color: "#2c3e50",
                        fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" }
                      }}
                    >
                      Property Specifications
                    </Typography>
                    {isModel10 && (
                      <Chip
                        label="Model 10 Configuration"
                        size="small"
                        sx={{
                          bgcolor: "#9c27b0",
                          color: "white",
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    {[
                      {
                        icon: <Bed sx={{ fontSize: { xs: 20, sm: 22 } }} />,
                        label: "Bedrooms",
                        value: propertyDetails.model?.bedrooms,
                        color: "#4a7c59",
                      },
                      {
                        icon: <Bathtub sx={{ fontSize: { xs: 20, sm: 22 } }} />,
                        label: "Bathrooms",
                        value: propertyDetails.model?.bathrooms,
                        color: "#2196f3",
                      },
                      {
                        icon: <SquareFoot sx={{ fontSize: { xs: 20, sm: 22 } }} />,
                        label: "Square Feet",
                        value: `${propertyDetails.model?.sqft} ft²`,
                        color: "#ff9800",
                      },
                      propertyDetails.model?.stories && {
                        icon: <Layers sx={{ fontSize: { xs: 20, sm: 22 } }} />,
                        label: "Stories",
                        value: propertyDetails.model?.stories,
                        color: "#607d8b",
                      },
                      {
                        icon: <Home sx={{ fontSize: { xs: 20, sm: 22 } }} />,
                        label: "Lot Number",
                        value: `#${propertyDetails.property?.lot?.number}`,
                        color: "#9c27b0",
                      },
                      {
                        icon: <LocationOn sx={{ fontSize: { xs: 20, sm: 22 } }} />,
                        label: "Section",
                        value: propertyDetails.property?.lot?.section,
                        color: "#f44336",
                      },
                      {
                        icon: <AttachMoney sx={{ fontSize: { xs: 20, sm: 22 } }} />,
                        label: "Property Value",
                        value: `$${propertyDetails.property?.price?.toLocaleString()}`,
                        color: "#4caf50",
                      },
                      // ✅ NUEVO: Card especial para Modelo 10 con hasBalcony
                      isModel10 && propertyDetails.property?.hasBalcony && {
                        icon: React.createElement(balconyLabels.icon, { 
                          sx: { fontSize: { xs: 20, sm: 22 } } 
                        }),
                        label: balconyLabels.chipLabel,
                        value: "Included",
                        color: balconyLabels.color,
                      },
                    ]
                      .filter(Boolean)
                      .map((spec, index) => (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.06 }}
                            whileHover={{ scale: 1.05, y: -4 }}
                          >
                            <Paper
                              elevation={0}
                              sx={{
                                p: { xs: 1.5, sm: 2 },
                                textAlign: "center",
                                borderRadius: { xs: 2, md: 2.5 },
                                border: `2px solid ${spec.color}20`,
                                bgcolor: `${spec.color}06`,
                                transition: "all 0.3s ease",
                                minHeight: { xs: 90, sm: 100, md: 110 },
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                "&:hover": {
                                  borderColor: spec.color,
                                  bgcolor: `${spec.color}15`,
                                  boxShadow: `0 8px 24px ${spec.color}25`,
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  width: { xs: 36, sm: 40, md: 44 },
                                  height: { xs: 36, sm: 40, md: 44 },
                                  borderRadius: { xs: 2, md: 2.5 },
                                  background: `${spec.color}18`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: spec.color,
                                  margin: "0 auto",
                                  mb: 1,
                                }}
                              >
                                {spec.icon}
                              </Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#6c757d",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  display: "block",
                                  mb: 0.5,
                                  fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.72rem" },
                                }}
                              >
                                {spec.label}
                              </Typography>
                              <Typography
                                variant="subtitle1"
                                fontWeight="800"
                                sx={{
                                  color: spec.color,
                                  letterSpacing: "-0.5px",
                                  fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
                                }}
                              >
                                {spec.value}
                              </Typography>
                            </Paper>
                          </motion.div>
                        </Grid>
                      ))}
                  </Grid>
                </Box>
              </Paper>
            )}
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== UPLOAD PAYMENT DIALOG ========== */}
        <Dialog
          open={uploadPaymentDialog}
          onClose={handleCloseUploadPayment}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CloudUpload sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="700">
                  Upload Payment
                </Typography>
                <Typography variant="caption" sx={{ color: "#6c757d" }}>
                  Submit your payment information for approval
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Payment Amount"
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    handlePaymentFormChange("amount", e.target.value)
                  }
                  InputProps={{
                    startAdornment: (
                      <Typography
                        sx={{ mr: 1, color: "#4a7c59", fontWeight: 700 }}
                      >
                        $
                      </Typography>
                    ),
                  }}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      "&.Mui-focused fieldset": {
                        borderColor: "#4a7c59",
                      },
                    },
                  }}
                />
              </Grid>
                            <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Payment Type"
                  value={paymentForm.type || ""}
                  onChange={e => handlePaymentFormChange("type", e.target.value)}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      "&.Mui-focused fieldset": { borderColor: "#4a7c59" }
                    }
                  }}
                >
                  <MenuItem value="initial down payment">Initial Down Payment</MenuItem>
                  <MenuItem value="complementary down payment">Complementary Down Payment</MenuItem>
                  <MenuItem value="monthly payment">Monthly Payment</MenuItem>
                  <MenuItem value="additional payment">Additional Payment</MenuItem>
                  <MenuItem value="closing payment">Closing Payment</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Payment Date"
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) =>
                    handlePaymentFormChange("date", e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      "&.Mui-focused fieldset": {
                        borderColor: "#4a7c59",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<Upload />}
                  sx={{
                    py: 2,
                    borderRadius: 3,
                    borderColor: "#4a7c59",
                    color: "#4a7c59",
                    fontWeight: 600,
                    borderWidth: 2,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#3d664a",
                      bgcolor: "rgba(74, 124, 89, 0.05)",
                      borderWidth: 2,
                    },
                  }}
                >
                  Upload Receipt / Support Document
                  <input
                    type="file"
                    hidden
                    accept="image/*,application/pdf"
                    onChange={(e) =>
                      handlePaymentFormChange("supportFile", e.target.files[0])
                    }
                  />
                </Button>
                {paymentForm.supportFile && (
                  <Alert
                    severity="success"
                    sx={{ mt: 2, borderRadius: 2 }}
                    icon={<CheckCircle />}
                  >
                    <Typography variant="body2" fontWeight="600">
                      File selected: {paymentForm.supportFile.name}
                    </Typography>
                  </Alert>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  multiline
                  rows={3}
                  value={paymentForm.notes}
                  onChange={(e) =>
                    handlePaymentFormChange("notes", e.target.value)
                  }
                  placeholder="Add any additional information about this payment..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      "&.Mui-focused fieldset": {
                        borderColor: "#4a7c59",
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
            <Alert
              severity="info"
              sx={{ mt: 3, borderRadius: 3 }}
              icon={<Info />}
            >
              Your payment will be reviewed and approved by administration
              within 24-48 hours.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={handleCloseUploadPayment}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitPayment}
              disabled={uploadingPayment || !paymentForm.amount}
              sx={{
                borderRadius: 3,
                background: "linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)",
                color: "white",
                fontWeight: 700,
                textTransform: "none",
                px: 4,
                py: 1.5,
                boxShadow: "0 8px 20px rgba(74, 124, 89, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #3d664a 0%, #7ba843 100%)",
                  boxShadow: "0 12px 28px rgba(74, 124, 89, 0.4)",
                },
                "&:disabled": {
                  background: "#ccc",
                },
              }}
            >
              {uploadingPayment ? "Uploading..." : "Submit Payment"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ========== IMAGE LIGHTBOX DIALOG ========== */}
        <Dialog
          open={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          maxWidth="lg"
          PaperProps={{
            sx: {
              bgcolor: "transparent",
              boxShadow: "none",
              overflow: "visible",
            },
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <Box sx={{ position: "relative" }}>
              <IconButton
                onClick={() => setSelectedImage(null)}
                sx={{
                  position: "absolute",
                  top: -50,
                  right: 0,
                  color: "white",
                  bgcolor: "rgba(0, 0, 0, 0.5)",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.7)",
                  },
                }}
              >
                <Cancel />
              </IconButton>
              <img
                src={selectedImage}
                alt="Full size"
                style={{
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  borderRadius: 16,
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                }}
              />
            </Box>
          </motion.div>
        </Dialog>
      </Container>
    </Box>
  );
};

export default MyProperty;
