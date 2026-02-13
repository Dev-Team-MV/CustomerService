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
      case "signed":
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
      case "signed":
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
        
        
        {/* ✅ HEADER CON ESTADÍSTICAS - Estilo brandbook minimalista */}
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
              background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
              borderRadius: { xs: 4, md: 6 },
              border: '1.5px solid #e8f5ee',
              boxShadow: '0 12px 32px rgba(74,124,89,0.12)',
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 24px 48px rgba(74,124,89,0.18)',
                border: '2px solid rgba(140, 165, 81, 0.3)',
              },
            }}
          >
            {/* ✅ Barra decorativa superior - Estilo brandbook */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #333F1F, #8CA551, #333F1F)',
                opacity: 0.9,
              }}
            />
        
            {/* ✅ HEADER - Diseño minimalista */}
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              gap={{ xs: 2, sm: 3 }}
              mb={4}
              position="relative"
              zIndex={1}
            >
              {/* ✅ Ícono sin animaciones excesivas */}
              <Box
                sx={{
                  width: { xs: 60, sm: 70, md: 90 },
                  height: { xs: 60, sm: 70, md: 90 },
                  borderRadius: { xs: 3, md: 4 },
                  background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(51, 63, 31, 0.3)',
                  border: '3px solid white',
                  flexShrink: 0,
                }}
              >
                <Home
                  sx={{
                    fontSize: { xs: 30, sm: 38, md: 45 },
                    color: 'white',
                  }}
                />
              </Box>
        
              <Box flex={1}>
                {/* ✅ Título - Tipografía Poppins */}
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: '#1a1a1a',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    mb: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                    textTransform: 'uppercase',
                  }}
                >
                  My Properties
                </Typography>
        
                {/* ✅ Subtítulo con chip minimalista */}
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#706f6f',
                      fontWeight: 400,
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                    }}
                  >
                    Welcome back,
                  </Typography>
                  <Chip
                    label={user?.firstName || 'Investor'}
                    size="small"
                    sx={{
                      bgcolor: 'transparent',
                      border: '1.5px solid #8CA551',
                      color: '#3d5a4d',
                      fontWeight: 700,
                      fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                      height: { xs: 26, sm: 30, md: 32 },
                      px: { xs: 1.5, sm: 2 },
                      fontFamily: '"Poppins", sans-serif',
                      letterSpacing: '0.5px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(140, 165, 81, 0.08)',
                        borderColor: '#8CA551',
                      },
                      '& .MuiChip-icon': {
                        color: '#8CA551',
                      },
                    }}
                    icon={
                      <Star
                        sx={{
                          fontSize: { xs: 16, sm: 18, md: 20 },
                        }}
                      />
                    }
                  />
                </Box>
              </Box>
            </Box>
        
            {/* ✅ ESTADÍSTICAS - Estilo brandbook */}
            <AnimatePresence>
              {financialSummary ? (
                <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                  {[
                    {
                      label: 'Total Investment',
                      value: `$${financialSummary.totalInvestment.toLocaleString()}`,
                      icon: <AccountBalance />,
                      color: '#333F1F',
                      borderColor: '#333F1F',
                    },
                    {
                      label: 'Total Paid',
                      value: `$${financialSummary.totalPaid.toLocaleString()}`,
                      icon: <CheckCircle />,
                      sub: `${Math.round(financialSummary.paymentProgress)}% completed`,
                      color: '#8CA551',
                      borderColor: '#8CA551',
                    },
                    {
                      label: 'Pending Amount',
                      value: `$${financialSummary.totalPending.toLocaleString()}`,
                      icon: <Pending />,
                      color: '#E5863C',
                      borderColor: '#E5863C',
                    },
                    {
                      label: 'Properties Owned',
                      value: financialSummary.properties,
                      icon: <Home />,
                      color: '#706f6f',
                      borderColor: '#706f6f',
                    },
                  ].map((stat, index) => (
                    <Grid item xs={6} sm={6} md={3} key={index}>
                      <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          delay: index * 0.1,
                          duration: 0.5,
                          type: 'spring',
                          stiffness: 100,
                        }}
                        whileHover={{
                          y: -4,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <Card
                          sx={{
                            height: '100%',
                            borderRadius: { xs: 3, md: 4 },
                            border: `1.5px solid ${stat.borderColor}30`,
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                            '&:hover': {
                              boxShadow: `0 16px 48px ${stat.color}20`,
                              borderColor: stat.borderColor,
                              transform: 'translateY(-2px)',
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: { xs: 3, md: 4 },
                              background: stat.color,
                              opacity: 0.9,
                            },
                          }}
                        >
                          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                            <Box
                              display="flex"
                              alignItems="flex-start"
                              justifyContent="space-between"
                              mb={{ xs: 1.5, md: 2 }}
                              flexDirection={{ xs: 'column', sm: 'row' }}
                              gap={{ xs: 1, sm: 0 }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#999999',
                                  fontWeight: 500,
                                  textTransform: 'uppercase',
                                  letterSpacing: '1px',
                                  fontFamily: '"Poppins", sans-serif',
                                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                }}
                              >
                                {stat.label}
                              </Typography>
                              <Box
                                sx={{
                                  width: { xs: 36, sm: 40, md: 44 },
                                  height: { xs: 36, sm: 40, md: 44 },
                                  borderRadius: '50%',
                                  bgcolor: `${stat.color}10`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: stat.color,
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                {React.cloneElement(stat.icon, {
                                  sx: {
                                    fontSize: { xs: 18, sm: 20, md: 22 },
                                  },
                                })}
                              </Box>
                            </Box>
                            <Typography
                              variant="h4"
                              sx={{
                                color: stat.color,
                                fontWeight: 600,
                                fontFamily: '"Poppins", sans-serif',
                                mb: 0.5,
                                letterSpacing: '-0.5px',
                                fontSize: {
                                  xs: '1.25rem',
                                  sm: '1.5rem',
                                  md: '2rem',
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
                                    color: '#706f6f',
                                    fontWeight: 500,
                                    fontFamily: '"Poppins", sans-serif',
                                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
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
                /* ✅ SKELETON LOADER - Estilo brandbook */
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
                            border: '1.5px solid #e8f5ee',
                            overflow: 'hidden',
                            background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                          }}
                        >
                          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                            <Box
                              sx={{
                                width: '100%',
                                height: { xs: 12, sm: 14, md: 16 },
                                bgcolor: 'rgba(140, 165, 81, 0.15)',
                                borderRadius: 1,
                                mb: 2,
                                animation: 'pulse 1.5s ease-in-out infinite',
                                '@keyframes pulse': {
                                  '0%, 100%': { opacity: 1 },
                                  '50%': { opacity: 0.5 },
                                },
                              }}
                            />
                            <Box
                              sx={{
                                width: '60%',
                                height: { xs: 28, sm: 32, md: 36 },
                                bgcolor: 'rgba(140, 165, 81, 0.15)',
                                borderRadius: 1,
                                animation: 'pulse 1.5s ease-in-out infinite',
                                '@keyframes pulse': {
                                  '0%, 100%': { opacity: 1 },
                                  '50%': { opacity: 0.5 },
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
                          minHeight: { xs: 420, sm: 440, md: 460 },
                          borderRadius: 6,
                          cursor: "pointer",
                          border: hoveredCard === property._id
                            ? "2px solid #333F1F"
                            : "1.5px solid #e8f5ee",
                          boxShadow: hoveredCard === property._id
                            ? "0 24px 60px rgba(51, 63, 31, 0.25)"
                            : "0 12px 32px rgba(74, 124, 89, 0.12)",
                          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          overflow: "hidden",
                          position: "relative",
                          background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {/* ✅ Barra superior decorativa */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: hoveredCard === property._id
                              ? "linear-gradient(90deg, #333F1F, #8CA551, #333F1F)"
                              : "#8CA551",
                            transition: "all 0.3s ease",
                          }}
                        />
              
                        <CardContent 
                          sx={{ 
                            p: { xs: 2.5, sm: 3 },
                            pt: 3.5,
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {/* ✅ Header con imagen y modelo */}
                          <Box display="flex" alignItems="center" gap={2} mb={3}>
                            <motion.div
                              animate={
                                hoveredCard === property._id
                                  ? {
                                      scale: [1, 1.05, 1],
                                      rotate: [0, 3, -3, 0],
                                    }
                                  : {}
                              }
                              transition={{ duration: 0.6 }}
                            >
                              <Avatar
                                sx={{
                                  width: { xs: 64, sm: 70 },
                                  height: { xs: 64, sm: 70 },
                                  background: "linear-gradient(135deg, #333F1F 0%, #8CA551 100%)",
                                  boxShadow: "0 8px 24px rgba(51, 63, 31, 0.3)",
                                  border: "3px solid white",
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
                                  <Home sx={{ fontSize: 32, color: "white" }} />
                                )}
                              </Avatar>
                            </motion.div>
                            
                            <Box flex={1}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontFamily: '"Poppins", sans-serif',
                                  color: "#1a1a1a",
                                  fontWeight: 700,
                                  mb: 0.5,
                                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                                  letterSpacing: "0.5px",
                                }}
                              >
                                {property.model?.model || "Model N/A"}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <LocationOn sx={{ fontSize: 16, color: "#8CA551" }} />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#706f6f",
                                    fontWeight: 600,
                                    fontFamily: '"Poppins", sans-serif',
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  Lot #{property.lot?.number} • Sec {property.lot?.section}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
              
                          {/* ✅ Línea decorativa */}
                          <Box
                            sx={{
                              width: 40,
                              height: 2,
                              bgcolor: "#8CA551",
                              mx: "auto",
                              mb: 2.5,
                              opacity: 0.8,
                            }}
                          />
              
                          {/* ✅ Grid de especificaciones - Estilo brandbook */}
                          {property.model && (
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 0,
                                mb: 3,
                                borderTop: "1px solid #e0e0e0",
                                borderBottom: "1px solid #e0e0e0",
                                py: 2,
                              }}
                            >
                              {[
                                {
                                  icon: <Bed />,
                                  value: property.model.bedrooms,
                                  label: "BEDS",
                                },
                                {
                                  icon: <Bathtub />,
                                  value: property.model.bathrooms,
                                  label: "BATHS",
                                },
                                {
                                  icon: <SquareFoot />,
                                  value: property.model.sqft,
                                  label: "SQFT",
                                },
                              ].map((spec, idx) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    textAlign: "center",
                                    borderRight: idx < 2 ? "1px solid #e0e0e0" : "none",
                                    px: 1,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#999999",
                                      fontSize: "0.65rem",
                                      fontWeight: 500,
                                      textTransform: "uppercase",
                                      letterSpacing: "1px",
                                      fontFamily: '"Poppins", sans-serif',
                                      display: "block",
                                      mb: 0.8,
                                    }}
                                  >
                                    {spec.label}
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      color: "#1a1a1a",
                                      fontSize: { xs: "1.1rem", md: "1.2rem" },
                                      fontWeight: 600,
                                      fontFamily: '"Poppins", sans-serif',
                                      lineHeight: 1,
                                    }}
                                  >
                                    {spec.value}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          )}
              
                          {/* ✅ Precio - Destacado */}
                          <Box
                            sx={{
                              p: 2.5,
                              borderRadius: 3,
                              background: "linear-gradient(135deg, rgba(140, 165, 81, 0.08) 0%, rgba(51, 63, 31, 0.08) 100%)",
                              border: "1px solid rgba(140, 165, 81, 0.2)",
                              textAlign: "center",
                              mb: 2.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#706f6f",
                                fontWeight: 600,
                                fontFamily: '"Poppins", sans-serif',
                                display: "block",
                                mb: 0.5,
                                fontSize: "0.7rem",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                              }}
                            >
                              Property Value
                            </Typography>
                            <Typography
                              variant="h4"
                              sx={{
                                color: "#333F1F",
                                fontWeight: 800,
                                fontFamily: '"Poppins", sans-serif',
                                letterSpacing: "-0.5px",
                                fontSize: { xs: "1.75rem", sm: "2rem" },
                              }}
                            >
                              ${property.price?.toLocaleString()}
                            </Typography>
                          </Box>
              
                          {/* ✅ Status Chip */}
                          <Box display="flex" justifyContent="center" mb={2.5}>
                            <Chip
                              label={
                                property.status === "sold"
                                  ? "Active Property"
                                  : "In Progress"
                              }
                              size="small"
                              sx={{
                                bgcolor: property.status === "sold" ? "#8CA551" : "#E5863C",
                                color: "white",
                                fontWeight: 700,
                                fontFamily: '"Poppins", sans-serif',
                                fontSize: "0.75rem",
                                height: 28,
                                px: 2,
                              }}
                            />
                          </Box>
              
                          {/* ✅ Botón - Estilo consistente con ViewModels */}
                          <Button
                            fullWidth
                            sx={{
                              mt: "auto",
                              borderRadius: 0,
                              bgcolor: "#333F1F",
                              color: "white",
                              fontWeight: 600,
                              fontSize: { xs: "0.85rem", md: "0.9rem" },
                              px: 3,
                              py: { xs: 1.5, md: 1.8 },
                              letterSpacing: "1.5px",
                              textTransform: "uppercase",
                              fontFamily: '"Poppins", sans-serif',
                              border: "none",
                              position: "relative",
                              overflow: "hidden",
                              "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: "-100%",
                                width: "100%",
                                height: "100%",
                                bgcolor: "#8CA551",
                                transition: "left 0.4s ease",
                                zIndex: 0,
                              },
                              "&:hover": {
                                bgcolor: "#333F1F",
                                "&::before": {
                                  left: 0,
                                },
                                "& .button-text": {
                                  color: "white",
                                },
                              },
                              "& .button-text": {
                                position: "relative",
                                zIndex: 1,
                                transition: "color 0.3s ease",
                              },
                            }}
                          >
                            <span className="button-text">View Full Details</span>
                          </Button>
                        </CardContent>
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
                    color: "#333F1F",
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: "1rem",
                    px: 3,
                    py: 1.2,
                    borderRadius: 3,
                    border: "2px solid #8CA551",
                    bgcolor: "white",
                    "&:hover": {
                      bgcolor: "#8CA551",
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
                  
                  
                  {/* ✅ Property Header - Estilo brandbook minimalista */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 3, sm: 3.5, md: 4 },
                        mb: 3,
                        background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                        borderRadius: { xs: 4, md: 6 },
                        border: '1.5px solid #e8f5ee',
                        boxShadow: '0 12px 32px rgba(74,124,89,0.12)',
                        overflow: 'hidden',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 24px 48px rgba(74,124,89,0.18)',
                          border: '2px solid rgba(140, 165, 81, 0.3)',
                        },
                      }}
                    >
                      {/* ✅ Barra decorativa superior - Estilo brandbook */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: 'linear-gradient(90deg, #333F1F, #8CA551, #333F1F)',
                          opacity: 0.9,
                        }}
                      />
                  
                      <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
                        {/* ✅ Columna izquierda - Información del modelo */}
                        <Grid item xs={12} md={8}>
                          <Box 
                            display="flex" 
                            alignItems="center" 
                            gap={{ xs: 2, md: 3 }}
                            flexDirection={{ xs: 'column', sm: 'row' }}
                            textAlign={{ xs: 'center', sm: 'left' }}
                          >
                            {/* ✅ Avatar - Sin animaciones excesivas */}
                            <Avatar
                              sx={{
                                width: { xs: 80, sm: 90, md: 100 },
                                height: { xs: 80, sm: 90, md: 100 },
                                background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
                                boxShadow: '0 8px 24px rgba(51, 63, 31, 0.3)',
                                border: '3px solid white',
                                overflow: 'hidden',
                                flexShrink: 0,
                              }}
                            >
                              {propertyDetails?.property?.images?.exterior?.[0] ? (
                                <img
                                  src={propertyDetails.property.images.exterior[0]}
                                  alt="Property"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                  }}
                                />
                              ) : (
                                <Home sx={{ fontSize: { xs: 40, md: 50 }, color: 'white' }} />
                              )}
                            </Avatar>
                  
                            {/* ✅ Información principal */}
                            <Box flex={1}>
                              {/* ✅ Título del modelo - Tipografía elegante */}
                              <Typography
                                variant="h3"
                                sx={{
                                  fontFamily: '"Poppins", sans-serif',
                                  color: '#1a1a1a',
                                  fontWeight: 700,
                                  letterSpacing: '0.5px',
                                  mb: 1,
                                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                                  textTransform: 'uppercase',
                                }}
                              >
                                {propertyDetails.model?.model || 'Model N/A'}
                              </Typography>
                  
                              {/* ✅ Línea decorativa sutil */}
                              <Box
                                sx={{
                                  width: { xs: 40, sm: 50, md: 60 },
                                  height: 2,
                                  bgcolor: '#8CA551',
                                  mb: 1.5,
                                  opacity: 0.8,
                                  mx: { xs: 'auto', sm: 0 },
                                }}
                              />
                  
                              {/* ✅ Ubicación - Diseño minimalista */}
                              <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                                mb={2}
                                flexWrap="wrap"
                                justifyContent={{ xs: 'center', sm: 'flex-start' }}
                              >
                                <LocationOn 
                                  sx={{ 
                                    color: '#8CA551', 
                                    fontSize: { xs: 18, sm: 20 } 
                                  }} 
                                />
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: '#706f6f',
                                    fontWeight: 500,
                                    fontFamily: '"Poppins", sans-serif',
                                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.15rem' },
                                    letterSpacing: '0.5px',
                                  }}
                                >
                                  Lot #{propertyDetails.property.lot?.number} • Section{' '}
                                  {propertyDetails.property.lot?.section}
                                </Typography>
                              </Box>
                  
                              {/* ✅ Chips de estado - Estilo brandbook */}
                              <Box
                                display="flex"
                                gap={1.5}
                                flexWrap="wrap"
                                justifyContent={{ xs: 'center', sm: 'flex-start' }}
                              >
                                {propertyDetails.construction.currentPhase && (
                                  <Chip
                                    label={`Phase ${propertyDetails.construction.currentPhase.phaseNumber}: ${propertyDetails.construction.currentPhase.title}`}
                                    size="small"
                                    sx={{
                                      bgcolor: 'transparent',
                                      border: '1.5px solid #333F1F',
                                      color: '#2c5530',
                                      fontWeight: 700,
                                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                                      height: { xs: 28, sm: 30, md: 32 },
                                      px: { xs: 1.5, sm: 2 },
                                      fontFamily: '"Poppins", sans-serif',
                                      letterSpacing: '0.5px',
                                      textTransform: 'uppercase',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        bgcolor: 'rgba(51, 63, 31, 0.08)',
                                        borderColor: '#333F1F',
                                      },
                                      '& .MuiChip-icon': {
                                        color: '#333F1F',
                                      },
                                    }}
                                    icon={
                                      <Layers
                                        sx={{
                                          fontSize: { xs: 14, sm: 16 },
                                        }}
                                      />
                                    }
                                  />
                                )}
                  
                                <Chip
                                  label={
                                    typeof propertyDetails.property.totalConstructionPercentage === 'number'
                                      ? `${propertyDetails.property.totalConstructionPercentage}% Complete`
                                      : '—'
                                  }
                                  size="small"
                                  sx={{
                                    bgcolor: 'transparent',
                                    border: '1.5px solid #8CA551',
                                    color: '#3d5a4d',
                                    fontWeight: 700,
                                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                                    height: { xs: 28, sm: 30, md: 32 },
                                    px: { xs: 1.5, sm: 2 },
                                    fontFamily: '"Poppins", sans-serif',
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      bgcolor: 'rgba(140, 165, 81, 0.08)',
                                      borderColor: '#8CA551',
                                    },
                                    '& .MuiChip-icon': {
                                      color: '#8CA551',
                                    },
                                  }}
                                  icon={
                                    <Construction
                                      sx={{
                                        fontSize: { xs: 14, sm: 16 },
                                      }}
                                    />
                                  }
                                />
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                  
                        {/* ✅ Columna derecha - Precio destacado */}
                        <Grid item xs={12} md={4}>
                          <motion.div
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <Box
                              sx={{
                                p: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(140, 165, 81, 0.08) 0%, rgba(51, 63, 31, 0.08) 100%)',
                                border: '1px solid rgba(140, 165, 81, 0.2)',
                                textAlign: 'center',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: '0 8px 24px rgba(140, 165, 81, 0.15)',
                                  borderColor: '#8CA551',
                                },
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#706f6f',
                                  fontWeight: 600,
                                  fontFamily: '"Poppins", sans-serif',
                                  display: 'block',
                                  mb: 0.5,
                                  fontSize: '0.75rem',
                                  textTransform: 'uppercase',
                                  letterSpacing: '1.5px',
                                }}
                              >
                                Property Value
                              </Typography>
                              <Typography
                                variant="h2"
                                sx={{
                                  color: '#333F1F',
                                  fontWeight: 800,
                                  fontFamily: '"Poppins", sans-serif',
                                  letterSpacing: '-1px',
                                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                                }}
                              >
                                ${propertyDetails.property.price?.toLocaleString()}
                              </Typography>
                            </Box>
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
                                            {/* ✅ TAB 0: CONSTRUCTION - Brandbook */}
                      {activeTab === 0 && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: { xs: 2, sm: 3, md: 4 },
                            background: "white",
                            borderRadius: 4,
                            border: "1px solid #e0e0e0",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                          }}
                        >
                          {/* ✅ HEADER - Brandbook */}
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={2}
                            mb={4}
                            pb={3}
                            sx={{
                              borderBottom: '2px solid rgba(140, 165, 81, 0.2)'
                            }}
                          >
                            <Box
                              sx={{
                                width: { xs: 48, sm: 52, md: 56 },
                                height: { xs: 48, sm: 52, md: 56 },
                                borderRadius: 3,
                                bgcolor: "#333F1F",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(51, 63, 31, 0.2)",
                              }}
                            >
                              <Construction
                                sx={{ fontSize: { xs: 24, sm: 26, md: 28 }, color: "white" }}
                              />
                            </Box>
                            <Box>
                              <Typography
                                variant="h5"
                                fontWeight={700}
                                sx={{
                                  color: "#333F1F",
                                  fontFamily: '"Poppins", sans-serif',
                                  fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                                  letterSpacing: '0.5px'
                                }}
                              >
                                Construction Progress
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#706f6f",
                                  fontFamily: '"Poppins", sans-serif',
                                  fontSize: { xs: "0.75rem", sm: "0.85rem" }
                                }}
                              >
                                Track each phase of your property construction
                              </Typography>
                            </Box>
                          </Box>
                      
                          {loadingPhases ? (
                            <Box display="flex" justifyContent="center" p={4}>
                              <CircularProgress sx={{ color: "#333F1F" }} />
                            </Box>
                          ) : (
                            <>
                              {/* ✅ PHASE NAVIGATION - Brandbook */}
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
                                  size={window.innerWidth < 600 ? "small" : "medium"}
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
                                    borderRadius: 2,
                                    borderColor: '#e0e0e0',
                                    borderWidth: '2px',
                                    color: '#706f6f',
                                    fontFamily: '"Poppins", sans-serif',
                                    fontWeight: 600,
                                    '&:hover': {
                                      borderColor: '#333F1F',
                                      borderWidth: '2px',
                                      bgcolor: 'rgba(51, 63, 31, 0.05)'
                                    },
                                    '&:disabled': {
                                      borderColor: '#e0e0e0',
                                      color: '#9e9e9e'
                                    }
                                  }}
                                >
                                  Previous
                                </Button>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight={700}
                                  sx={{
                                    fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                                    textAlign: "center",
                                    color: '#333F1F',
                                    fontFamily: '"Poppins", sans-serif',
                                    letterSpacing: '0.5px'
                                  }}
                                >
                                  Phase {phases[currentPhaseIndex]?.phaseNumber} of {phases.length}
                                </Typography>
                                <Button
                                  variant="outlined"
                                  size={window.innerWidth < 600 ? "small" : "medium"}
                                  onClick={() => {
                                    setCurrentPhaseIndex((i) => {
                                      const newIndex = Math.min(i + 1, phases.length - 1);
                                      setPhaseCarouselIndex(0);
                                      return newIndex;
                                    });
                                  }}
                                  disabled={
                                    currentPhaseIndex === phases.length - 1 ||
                                    phases[currentPhaseIndex]?.constructionPercentage < 100
                                  }
                                  sx={{
                                    minWidth: { xs: 100, sm: 120 },
                                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                    borderRadius: 2,
                                    borderColor: '#e0e0e0',
                                    borderWidth: '2px',
                                    color: '#706f6f',
                                    fontFamily: '"Poppins", sans-serif',
                                    fontWeight: 600,
                                    '&:hover': {
                                      borderColor: '#333F1F',
                                      borderWidth: '2px',
                                      bgcolor: 'rgba(51, 63, 31, 0.05)'
                                    },
                                    '&:disabled': {
                                      borderColor: '#e0e0e0',
                                      color: '#9e9e9e'
                                    }
                                  }}
                                >
                                  Next
                                </Button>
                              </Box>
                      
                              {/* ✅ PHASE CONTENT - Brandbook */}
                              {phases[currentPhaseIndex] && (
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: { xs: 2, sm: 3, md: 4 },
                                    mb: 3,
                                    bgcolor: "#fafafa",
                                    borderRadius: 3,
                                    border: "1px solid #e0e0e0",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                                    position: "relative",
                                    overflow: "hidden",
                                    transition: "box-shadow 0.3s",
                                    "&:hover": {
                                      boxShadow: "0 8px 24px rgba(51, 63, 31, 0.1)",
                                    },
                                  }}
                                >
                                  {/* ✅ Decorative bar */}
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      width: "100%",
                                      height: { xs: 3, md: 4 },
                                      bgcolor: "#8CA551",
                                      opacity: 0.8,
                                      zIndex: 1,
                                    }}
                                  />
                      
                                  {/* ✅ PHASE HEADER - Brandbook */}
                                  <Box
                                    display="flex"
                                    flexDirection={{ xs: "column", sm: "row" }}
                                    alignItems={{ xs: "center", sm: "flex-start" }}
                                    gap={{ xs: 2, sm: 2, md: 3 }}
                                    mb={{ xs: 2, md: 3 }}
                                    zIndex={2}
                                    position="relative"
                                  >
                                    <Box
                                      sx={{
                                        width: { xs: 48, sm: 54, md: 64 },
                                        height: { xs: 48, sm: 54, md: 64 },
                                        borderRadius: 3,
                                        bgcolor: "#333F1F",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 4px 12px rgba(51, 63, 31, 0.2)",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {phases[currentPhaseIndex].constructionPercentage === 100 ? (
                                        <CheckCircle
                                          sx={{
                                            fontSize: { xs: 24, sm: 28, md: 32 },
                                            color: "white",
                                          }}
                                        />
                                      ) : phases[currentPhaseIndex].constructionPercentage > 0 ? (
                                        <LockOpen
                                          sx={{
                                            fontSize: { xs: 24, sm: 28, md: 32 },
                                            color: "white",
                                          }}
                                        />
                                      ) : (
                                        <Lock
                                          sx={{
                                            fontSize: { xs: 24, sm: 28, md: 32 },
                                            color: "white",
                                          }}
                                        />
                                      )}
                                    </Box>
                      
                                    <Box flex={1} textAlign={{ xs: "center", sm: "left" }}>
                                      <Typography
                                        variant="h6"
                                        fontWeight={700}
                                        sx={{
                                          color: "#333F1F",
                                          letterSpacing: "0.5px",
                                          fontFamily: '"Poppins", sans-serif',
                                          fontSize: { xs: "1rem", sm: "1.15rem", md: "1.25rem" },
                                          mb: 1,
                                        }}
                                      >
                                        Phase {phases[currentPhaseIndex].phaseNumber}:{" "}
                                        {phases[currentPhaseIndex].title}
                                      </Typography>
                      
                                      <Box
                                        display="flex"
                                        flexDirection={{ xs: "column", sm: "row" }}
                                        alignItems="center"
                                        gap={{ xs: 1, sm: 1.5 }}
                                        justifyContent={{ xs: "center", sm: "flex-start" }}
                                      >
                                        <Chip
                                          label={
                                            phases[currentPhaseIndex].constructionPercentage === 100
                                              ? "100% Complete"
                                              : `${phases[currentPhaseIndex].constructionPercentage}% Complete`
                                          }
                                          size="small"
                                          sx={{
                                            bgcolor: phases[currentPhaseIndex].constructionPercentage === 100
                                              ? "#8CA551"
                                              : "#E5863C",
                                            color: "white",
                                            fontWeight: 700,
                                            fontSize: { xs: "0.75rem", sm: "0.85rem" },
                                            height: { xs: 24, sm: 28 },
                                            fontFamily: '"Poppins", sans-serif',
                                          }}
                                        />
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "#706f6f",
                                            fontWeight: 500,
                                            fontFamily: '"Poppins", sans-serif',
                                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                            display: { xs: "block", sm: "inline" },
                                            textAlign: { xs: "center", sm: "left" },
                                          }}
                                        >
                                          {PHASE_DESCRIPTIONS[phases[currentPhaseIndex].phaseNumber - 1]}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>
                      
                                  {/* ✅ PROGRESS BAR - Brandbook */}
                                  <Box mb={{ xs: 2, md: 3 }} zIndex={2} position="relative">
                                    <LinearProgress
                                      variant="determinate"
                                      value={phases[currentPhaseIndex].constructionPercentage}
                                      sx={{
                                        height: { xs: 8, sm: 10, md: 12 },
                                        borderRadius: 2,
                                        bgcolor: "#e0e0e0",
                                        "& .MuiLinearProgress-bar": {
                                          bgcolor: "#8CA551",
                                          borderRadius: 2,
                                        },
                                      }}
                                    />
                                  </Box>
                      
                                  {/* ✅ IMAGE GALLERY - Brandbook */}
                                  {phases[currentPhaseIndex].mediaItems &&
                                  phases[currentPhaseIndex].mediaItems.length > 0 ? (
                                    <Box sx={{ mb: 2 }}>
                                      {/* Main Carousel */}
                                      <Box
                                        sx={{
                                          bgcolor: "#000",
                                          borderRadius: 2,
                                          p: 2,
                                          minHeight: 280,
                                          height: { xs: 300, sm: 340, md: 380 },
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          position: "relative",
                                          overflow: "hidden",
                                        }}
                                      >
                                        <AnimatePresence mode="wait">
                                          {(() => {
                                            const items = phases[currentPhaseIndex].mediaItems;
                                            const safeIndex = Math.min(phaseCarouselIndex, items.length - 1);
                                            const currentImage = items[safeIndex];
                                            return currentImage ? (
                                              <motion.img
                                                key={`phase-carousel-${currentPhaseIndex}-${safeIndex}`}
                                                src={currentImage.url}
                                                alt={currentImage.title}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.3 }}
                                                style={{
                                                  maxWidth: "90%",
                                                  maxHeight: "100%",
                                                  objectFit: "contain",
                                                  borderRadius: 8,
                                                  cursor: "pointer",
                                                }}
                                                onClick={() => setPhaseLightboxOpen(true)}
                                              />
                                            ) : (
                                              <Typography
                                                sx={{
                                                  color: "white",
                                                  fontFamily: '"Poppins", sans-serif'
                                                }}
                                              >
                                                No images available for this phase
                                              </Typography>
                                            );
                                          })()}
                                        </AnimatePresence>
                      
                                        {phases[currentPhaseIndex].mediaItems.length > 1 && (
                                          <>
                                            <IconButton
                                              onClick={handlePhaseCarouselPrev}
                                              sx={{
                                                position: "absolute",
                                                left: 12,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                bgcolor: "rgba(255,255,255,0.95)",
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                '&:hover': {
                                                  bgcolor: 'white',
                                                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
                                                }
                                              }}
                                            >
                                              <KeyboardArrowLeft sx={{ color: '#333F1F' }} />
                                            </IconButton>
                                            <IconButton
                                              onClick={handlePhaseCarouselNext}
                                              sx={{
                                                position: "absolute",
                                                right: 12,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                bgcolor: "rgba(255,255,255,0.95)",
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                '&:hover': {
                                                  bgcolor: 'white',
                                                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
                                                }
                                              }}
                                            >
                                              <KeyboardArrowRight sx={{ color: '#333F1F' }} />
                                            </IconButton>
                                          </>
                                        )}
                      
                                        <Box
                                          sx={{
                                            position: "absolute",
                                            bottom: 12,
                                            left: 12,
                                            bgcolor: "rgba(51, 63, 31, 0.9)",
                                            color: "white",
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 2,
                                            backdropFilter: "blur(4px)",
                                          }}
                                        >
                                          <Typography
                                            variant="caption"
                                            fontWeight={600}
                                            sx={{ fontFamily: '"Poppins", sans-serif' }}
                                          >
                                            {Math.min(
                                              phaseCarouselIndex + 1,
                                              phases[currentPhaseIndex].mediaItems.length
                                            )}{" "}
                                            / {phases[currentPhaseIndex].mediaItems.length}
                                          </Typography>
                                        </Box>
                                      </Box>
                      
                                      {/* Thumbnails */}
                                      <Box
                                        sx={{
                                          display: "flex",
                                          gap: 1,
                                          mt: 1,
                                          overflowX: "auto",
                                          scrollbarWidth: 'thin',
                                          '&::-webkit-scrollbar': {
                                            height: 6
                                          },
                                          '&::-webkit-scrollbar-thumb': {
                                            bgcolor: 'rgba(51, 63, 31, 0.2)',
                                            borderRadius: 3
                                          }
                                        }}
                                      >
                                        {phases[currentPhaseIndex].mediaItems.map((media, idx) => (
                                          <Box
                                            key={idx}
                                            onClick={() => setPhaseCarouselIndex(idx)}
                                            sx={{
                                              width: 64,
                                              height: 64,
                                              borderRadius: 1.5,
                                              overflow: "hidden",
                                              cursor: "pointer",
                                              border: idx === phaseCarouselIndex
                                                ? "2px solid #8CA551"
                                                : "1px solid #e0e0e0",
                                              boxShadow: idx === phaseCarouselIndex
                                                ? "0 4px 12px rgba(140, 165, 81, 0.2)"
                                                : "none",
                                              transition: 'all 0.3s',
                                              '&:hover': {
                                                borderColor: '#8CA551'
                                              }
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
                      
                                      {/* Lightbox */}
                                      <Dialog
                                        open={phaseLightboxOpen}
                                        onClose={() => setPhaseLightboxOpen(false)}
                                        maxWidth="lg"
                                        fullWidth
                                        PaperProps={{
                                          sx: {
                                            bgcolor: "transparent",
                                            boxShadow: "none"
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
                                              onClick={() => setPhaseLightboxOpen(false)}
                                              sx={{
                                                position: "absolute",
                                                top: -50,
                                                right: 0,
                                                color: "white",
                                                bgcolor: "rgba(51, 63, 31, 0.8)",
                                                zIndex: 10,
                                                "&:hover": {
                                                  bgcolor: "rgba(51, 63, 31, 0.95)",
                                                  transform: "scale(1.1)"
                                                },
                                              }}
                                            >
                                              <Cancel />
                                            </IconButton>
                                            {(() => {
                                              const items = phases[currentPhaseIndex].mediaItems;
                                              const safeIndex = Math.min(phaseCarouselIndex, items.length - 1);
                                              const currentImage = items[safeIndex];
                                              return (
                                                currentImage && (
                                                  <motion.img
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    src={currentImage.url}
                                                    alt="phase-lightbox"
                                                    style={{
                                                      width: "100%",
                                                      maxHeight: "85vh",
                                                      objectFit: "contain",
                                                      borderRadius: 12,
                                                      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
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
                                        bgcolor: "rgba(140, 165, 81, 0.08)",
                                        border: "1px solid rgba(140, 165, 81, 0.3)",
                                        fontFamily: '"Poppins", sans-serif',
                                        "& .MuiAlert-icon": {
                                          color: "#8CA551"
                                        }
                                      }}
                                    >
                                      No images uploaded for this phase yet. Images will appear here once construction progresses.
                                    </Alert>
                                  )}
                                </Paper>
                              )}
                            </>
                          )}
                        </Paper>
                      )}
                      
                      {/* ✅ TAB 1 & TAB 2 mantienen el código que ya enviaste anteriormente */}
                      {/* Ya están correctamente estilizados con el brandbook */}

                      {/* TAB 1: PAYMENTS */}
                      {/* ✅ TAB 1: PAYMENT STATUS - Brandbook */}
                      {activeTab === 1 && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: { xs: 2, sm: 3, md: 4 },
                            background: "white",
                            borderRadius: 4,
                            border: "1px solid #e0e0e0",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                          }}
                        >
                          {/* ✅ HEADER - Brandbook */}
                          <Box
                            display="flex"
                            flexDirection={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "stretch", sm: "center" }}
                            gap={{ xs: 2, sm: 2, md: 3 }}
                            mb={{ xs: 3, md: 4 }}
                            pb={3}
                            sx={{
                              borderBottom: '2px solid rgba(140, 165, 81, 0.2)'
                            }}
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
                                  borderRadius: 3,
                                  bgcolor: "#333F1F",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow: "0 4px 12px rgba(51, 63, 31, 0.2)",
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
                                  fontWeight={700}
                                  sx={{
                                    color: "#333F1F",
                                    fontFamily: '"Poppins", sans-serif',
                                    fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                                    letterSpacing: '0.5px'
                                  }}
                                >
                                  Payment Status
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#706f6f",
                                    fontFamily: '"Poppins", sans-serif',
                                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                                    display: { xs: "none", sm: "block" },
                                  }}
                                >
                                  Manage and track your payment history
                                </Typography>
                              </Box>
                            </Box>
                      
                            <motion.div
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <Button
                                startIcon={<Upload sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                                onClick={handleOpenUploadPayment}
                                fullWidth={{ xs: true, sm: false }}
                                sx={{
                                  py: { xs: 1.2, sm: 1.5 },
                                  px: { xs: 2, sm: 3 },
                                  borderRadius: 3,
                                  bgcolor: "#333F1F",
                                  color: "white",
                                  fontWeight: 600,
                                  fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                                  letterSpacing: "1.5px",
                                  textTransform: "uppercase",
                                  fontFamily: '"Poppins", sans-serif',
                                  border: "none",
                                  position: "relative",
                                  overflow: "hidden",
                                  boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)',
                                  transition: 'all 0.3s ease',
                                  "&::before": {
                                    content: '""',
                                    position: "absolute",
                                    top: 0,
                                    left: "-100%",
                                    width: "100%",
                                    height: "100%",
                                    bgcolor: "#8CA551",
                                    transition: "left 0.4s ease",
                                    zIndex: 0,
                                  },
                                  "&:hover": {
                                    bgcolor: "#333F1F",
                                    boxShadow: '0 8px 20px rgba(51, 63, 31, 0.3)',
                                    transform: 'translateY(-2px)',
                                    "&::before": {
                                      left: 0,
                                    },
                                    "& .button-text, & .MuiButton-startIcon": {
                                      color: "white",
                                      position: "relative",
                                      zIndex: 1,
                                    },
                                  },
                                  "&:active": {
                                    transform: 'translateY(0px)',
                                    boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
                                  },
                                  "& .button-text, & .MuiButton-startIcon": {
                                    position: "relative",
                                    zIndex: 1,
                                    transition: "color 0.3s ease",
                                  },
                                }}
                              >
                                <span className="button-text">Upload Payment</span>
                              </Button>
                            </motion.div>
                          </Box>
                      
                          {/* ✅ PAYMENT SUMMARY CARDS - Brandbook */}
                          <Grid
                            container
                            spacing={{ xs: 2, sm: 2.5, md: 3 }}
                            sx={{ mb: { xs: 3, md: 4 } }}
                          >
                            {[
                              {
                                label: "Total Paid",
                                value: `$${propertyDetails.payment.totalPaid.toLocaleString()}`,
                                color: "#8CA551",
                                icon: <CheckCircle />,
                              },
                              {
                                label: "Pending Amount",
                                value: `$${propertyDetails.payment.totalPending.toLocaleString()}`,
                                color: "#E5863C",
                                icon: <Schedule />,
                              },
                              {
                                label: "Payment Progress",
                                value: `${Math.round(propertyDetails.payment.progress)}%`,
                                color: "#333F1F",
                                icon: <TrendingUp />,
                              },
                            ].map((stat, index) => (
                              <Grid item xs={12} sm={6} md={4} key={index}>
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ y: -4 }}
                                >
                                  <Card
                                    sx={{
                                      borderRadius: 3,
                                      border: `1px solid #e0e0e0`,
                                      bgcolor: '#fafafa',
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                                      transition: "all 0.3s ease",
                                      "&:hover": {
                                        borderColor: stat.color,
                                        boxShadow: `0 8px 24px ${stat.color}20`,
                                        bgcolor: 'white'
                                      },
                                    }}
                                  >
                                    <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
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
                                            color: "#999999",
                                            fontWeight: 500,
                                            textTransform: "uppercase",
                                            letterSpacing: "1px",
                                            fontFamily: '"Poppins", sans-serif',
                                            fontSize: { xs: "0.65rem", sm: "0.7rem" },
                                          }}
                                        >
                                          {stat.label}
                                        </Typography>
                                        <Box
                                          sx={{
                                            width: { xs: 40, sm: 44, md: 48 },
                                            height: { xs: 40, sm: 44, md: 48 },
                                            borderRadius: "50%",
                                            bgcolor: `${stat.color}10`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: stat.color,
                                            transition: 'all 0.3s ease'
                                          }}
                                        >
                                          {React.cloneElement(stat.icon, {
                                            sx: {
                                              fontSize: { xs: 20, sm: 22, md: 24 },
                                            },
                                          })}
                                        </Box>
                                      </Box>
                                      <Typography
                                        variant="h3"
                                        fontWeight={700}
                                        sx={{
                                          color: stat.color,
                                          letterSpacing: "-0.5px",
                                          fontFamily: '"Poppins", sans-serif',
                                          fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
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
                      
                          {/* ✅ PAYMENT HISTORY SECTION - Brandbook */}
                          <Box>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                mb: 3
                              }}
                            >
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 2,
                                  bgcolor: 'rgba(51, 63, 31, 0.08)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Description sx={{ fontSize: 22, color: '#333F1F' }} />
                              </Box>
                              <Box>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: "#333F1F",
                                    fontWeight: 700,
                                    fontFamily: '"Poppins", sans-serif',
                                    fontSize: { xs: "1rem", sm: "1.15rem", md: "1.25rem" },
                                    letterSpacing: '0.5px'
                                  }}
                                >
                                  Payment History
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#706f6f",
                                    fontFamily: '"Poppins", sans-serif',
                                    fontSize: { xs: "0.7rem", sm: "0.75rem" }
                                  }}
                                >
                                  {payloads.length} transaction{payloads.length !== 1 ? "s" : ""}
                                </Typography>
                              </Box>
                            </Box>
                      
                            {loadingPayloads ? (
                              <Box display="flex" justifyContent="center" p={4}>
                                <CircularProgress sx={{ color: "#333F1F" }} />
                              </Box>
                            ) : payloads.length > 0 ? (
                              <>
                                {/* ✅ DESKTOP TABLE - Brandbook */}
                                <TableContainer
                                  component={Paper}
                                  elevation={0}
                                  sx={{
                                    display: { xs: "none", md: "block" },
                                    borderRadius: 3,
                                    border: "1px solid #e0e0e0",
                                    overflow: "hidden",
                                  }}
                                >
                                  <Table>
                                    <TableHead>
                                      <TableRow sx={{ bgcolor: "#fafafa" }}>
                                        {["Date", "Amount", "Type", "Status", "Support", "Notes"].map((header) => (
                                          <TableCell
                                            key={header}
                                            sx={{
                                              fontWeight: 700,
                                              color: "#333F1F",
                                              fontFamily: '"Poppins", sans-serif',
                                              fontSize: "0.85rem",
                                              textTransform: "uppercase",
                                              letterSpacing: "0.5px"
                                            }}
                                          >
                                            {header}
                                          </TableCell>
                                        ))}
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
                                              bgcolor: "rgba(140, 165, 81, 0.05)",
                                            },
                                            transition: "all 0.3s ease",
                                          }}
                                        >
                                          <TableCell>
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontWeight: 600,
                                                fontFamily: '"Poppins", sans-serif',
                                                color: '#333F1F'
                                              }}
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
                                                color: "#8CA551",
                                                fontWeight: 700,
                                                fontFamily: '"Poppins", sans-serif',
                                                fontSize: "1.1rem"
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
                                                bgcolor: "rgba(140, 165, 81, 0.08)",
                                                color: "#333F1F",
                                                fontWeight: 600,
                                                textTransform: "capitalize",
                                                fontSize: "0.75rem",
                                                fontFamily: '"Poppins", sans-serif',
                                                border: '1px solid rgba(140, 165, 81, 0.2)'
                                              }}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Chip
                                              icon={getStatusIcon(payload.status)}
                                              label={payload.status.toUpperCase()}
                                              color={getStatusColor(payload.status)}
                                              sx={{
                                                fontWeight: 700,
                                                fontFamily: '"Poppins", sans-serif',
                                                fontSize: "0.7rem"
                                              }}
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
                                                  fontFamily: '"Poppins", sans-serif',
                                                  borderColor: '#e0e0e0',
                                                  color: '#706f6f',
                                                  '&:hover': {
                                                    borderColor: '#333F1F',
                                                    bgcolor: 'rgba(51, 63, 31, 0.05)'
                                                  }
                                                }}
                                              >
                                                View Receipt
                                              </Button>
                                            ) : (
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  color: "#999",
                                                  fontFamily: '"Poppins", sans-serif'
                                                }}
                                              >
                                                No document
                                              </Typography>
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                color: "#706f6f",
                                                fontFamily: '"Poppins", sans-serif',
                                                fontSize: "0.85rem"
                                              }}
                                            >
                                              {payload.notes || "No notes"}
                                            </Typography>
                                          </TableCell>
                                        </motion.tr>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                      
                                {/* ✅ MOBILE CARDS - Brandbook */}
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
                                          border: "1px solid #e0e0e0",
                                          bgcolor: '#fafafa',
                                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
                                          transition: "all 0.3s ease",
                                          "&:hover": {
                                            boxShadow: "0 8px 24px rgba(51, 63, 31, 0.12)",
                                            borderColor: "#8CA551",
                                            bgcolor: 'white'
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
                                                color: "#706f6f",
                                                fontWeight: 600,
                                                fontFamily: '"Poppins", sans-serif'
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
                                                fontFamily: '"Poppins", sans-serif'
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
                                                  bgcolor: "rgba(140, 165, 81, 0.08)",
                                                  color: "#333F1F",
                                                  fontWeight: 600,
                                                  textTransform: "capitalize",
                                                  fontSize: "0.7rem",
                                                  fontFamily: '"Poppins", sans-serif',
                                                  border: '1px solid rgba(140, 165, 81, 0.2)'
                                                }}
                                              />
                                            </Box>
                                          )}
                      
                                          {/* Amount */}
                                          <Box
                                            sx={{
                                              p: 2,
                                              bgcolor: "rgba(140, 165, 81, 0.05)",
                                              borderRadius: 2,
                                              mb: 2,
                                              textAlign: "center",
                                              border: '1px solid rgba(140, 165, 81, 0.15)'
                                            }}
                                          >
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                color: "#706f6f",
                                                display: "block",
                                                mb: 0.5,
                                                fontFamily: '"Poppins", sans-serif',
                                                fontSize: "0.7rem",
                                                textTransform: "uppercase",
                                                letterSpacing: "1px"
                                              }}
                                            >
                                              Amount
                                            </Typography>
                                            <Typography
                                              variant="h5"
                                              sx={{
                                                color: "#8CA551",
                                                fontWeight: 700,
                                                letterSpacing: "-0.5px",
                                                fontFamily: '"Poppins", sans-serif'
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
                                                  color: "#706f6f",
                                                  fontWeight: 600,
                                                  display: "block",
                                                  mb: 0.5,
                                                  fontFamily: '"Poppins", sans-serif',
                                                  fontSize: "0.7rem",
                                                  textTransform: "uppercase",
                                                  letterSpacing: "1px"
                                                }}
                                              >
                                                Notes:
                                              </Typography>
                                              <Typography
                                                variant="body2"
                                                sx={{
                                                  color: "#333F1F",
                                                  fontFamily: '"Poppins", sans-serif',
                                                  fontSize: "0.85rem"
                                                }}
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
                                                fontFamily: '"Poppins", sans-serif',
                                                borderColor: '#e0e0e0',
                                                color: '#706f6f',
                                                '&:hover': {
                                                  borderColor: '#333F1F',
                                                  bgcolor: 'rgba(51, 63, 31, 0.05)'
                                                }
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
                                  borderRadius: 3,
                                  bgcolor: "rgba(140, 165, 81, 0.08)",
                                  border: "1px solid rgba(140, 165, 81, 0.3)",
                                  fontSize: { xs: "0.85rem", md: "1rem" },
                                  fontFamily: '"Poppins", sans-serif',
                                  "& .MuiAlert-icon": {
                                    color: "#8CA551"
                                  }
                                }}
                              >
                                No payment transactions yet. Click "Upload Payment" to add your first payment.
                              </Alert>
                            )}
                          </Box>
                        </Paper>
                      )}
  
                      {/* ✅ TAB 2: PROPERTY DETAILS - CON VALIDACIÓN MODELO 10 */}
                      {activeTab === 2 && (
                        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: 3 }}>
                          {/* ✅ CHIPS DE OPCIONES CON VALIDACIÓN CONDICIONAL */}
                          <Box sx={{ mb: 3 }}>
                            
                            
                            <Grid item xs={12} sx={{ mb: 3 }}>
                              <Box
                                display="flex"
                                gap={1.5}
                                flexWrap="wrap"
                                justifyContent="center"
                                mt={2}
                              >
                                {/* ✅ Chip de Balcony/Estudio - Estilo brandbook */}
                                {propertyDetails.property?.hasBalcony && (
                                  <Chip
                                    icon={React.createElement(balconyLabels.icon, {
                                      sx: { fontSize: { xs: 16, sm: 18 } }
                                    })}
                                    label={balconyLabels.chipLabel}
                                    size="small"
                                    sx={{
                                      bgcolor: 'transparent',
                                      border: '1.5px solid #8CA551',
                                      color: '#3d5a4d',
                                      fontWeight: 700,
                                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                                      height: { xs: 28, sm: 30, md: 32 },
                                      px: { xs: 1.5, sm: 2 },
                                      fontFamily: '"Poppins", sans-serif',
                                      letterSpacing: '0.5px',
                                      textTransform: 'uppercase',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        bgcolor: 'rgba(140, 165, 81, 0.08)',
                                        borderColor: '#8CA551',
                                      },
                                      '& .MuiChip-icon': {
                                        color: '#8CA551',
                                      },
                                    }}
                                  />
                                )}
                            
                                {/* ✅ Chip de Upgrade - Estilo brandbook */}
                                {propertyDetails.property.modelType === "upgrade" && (
                                  <Chip
                                    icon={<Star sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                                    label="Upgrade"
                                    size="small"
                                    sx={{
                                      bgcolor: 'transparent',
                                      border: '1.5px solid #333F1F',
                                      color: '#2c5530',
                                      fontWeight: 700,
                                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                                      height: { xs: 28, sm: 30, md: 32 },
                                      px: { xs: 1.5, sm: 2 },
                                      fontFamily: '"Poppins", sans-serif',
                                      letterSpacing: '0.5px',
                                      textTransform: 'uppercase',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        bgcolor: 'rgba(51, 63, 31, 0.08)',
                                        borderColor: '#333F1F',
                                      },
                                      '& .MuiChip-icon': {
                                        color: '#333F1F',
                                      },
                                    }}
                                  />
                                )}
                            
                                {/* ✅ Chip de Storage - Estilo brandbook */}
                                {propertyDetails.property?.hasStorage && (
                                  <Chip
                                    icon={<Layers sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                                    label="Storage"
                                    size="small"
                                    sx={{
                                      bgcolor: 'transparent',
                                      border: '1.5px solid #706f6f',
                                      color: '#5a5a5a',
                                      fontWeight: 700,
                                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                                      height: { xs: 28, sm: 30, md: 32 },
                                      px: { xs: 1.5, sm: 2 },
                                      fontFamily: '"Poppins", sans-serif',
                                      letterSpacing: '0.5px',
                                      textTransform: 'uppercase',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        bgcolor: 'rgba(112, 111, 111, 0.08)',
                                        borderColor: '#706f6f',
                                      },
                                      '& .MuiChip-icon': {
                                        color: '#706f6f',
                                      },
                                    }}
                                  />
                                )}
                            
                                {/* ✅ Chip Model 10 - Estilo brandbook */}
                                {isModel10 && (
                                  <Chip
                                    label="Model 10"
                                    size="small"
                                    sx={{
                                      bgcolor: 'transparent',
                                      border: '1.5px solid #E5863C',
                                      color: '#8b6f47',
                                      fontWeight: 700,
                                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                                      height: { xs: 28, sm: 30, md: 32 },
                                      px: { xs: 1.5, sm: 2 },
                                      fontFamily: '"Poppins", sans-serif',
                                      letterSpacing: '0.5px',
                                      textTransform: 'uppercase',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        bgcolor: 'rgba(229, 134, 60, 0.08)',
                                        borderColor: '#E5863C',
                                      },
                                    }}
                                  />
                                )}
                              </Box>
                            </Grid>
                            
                            {/* ✅ Alert informativo - Estilo brandbook */}
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
                                    bgcolor: 'rgba(140, 165, 81, 0.05)',
                                    border: '1px solid rgba(140, 165, 81, 0.2)',
                                    '& .MuiAlert-message': {
                                      width: '100%',
                                    },
                                    '& .MuiAlert-icon': {
                                      color: '#8CA551',
                                    },
                                  }}
                                >
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      fontWeight="600"
                                      sx={{
                                        mb: 0.5,
                                        color: '#333F1F',
                                        fontFamily: '"Poppins", sans-serif',
                                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                                      }}
                                    >
                                      Model 10 Special Features
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: '#706f6f',
                                        fontFamily: '"Poppins", sans-serif',
                                        fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                        lineHeight: 1.6,
                                      }}
                                    >
                                      {propertyDetails.property?.hasBalcony
                                        ? "This property includes an Estudio - a flexible space perfect for home office or study area."
                                        : "This is a special configuration model with unique layout options."}
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
                            {/* ✅ Header con línea decorativa - Estilo brandbook */}
                            <Box mb={3}>
                              <Box display="flex" alignItems="center" gap={2} mb={1.5} flexWrap="wrap">
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontFamily: '"Poppins", sans-serif',
                                    color: "#1a1a1a",
                                    fontWeight: 700,
                                    fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  Property Specifications
                                </Typography>
                                {isModel10 && (
                                  <Chip
                                    label="Model 10"
                                    size="small"
                                    sx={{
                                      bgcolor: "transparent",
                                      border: "1.5px solid #E5863C",
                                      color: "#E5863C",
                                      fontWeight: 700,
                                      fontSize: "0.7rem",
                                      height: 28,
                                      px: 1.5,
                                      fontFamily: '"Poppins", sans-serif',
                                      letterSpacing: "0.5px",
                                      textTransform: "uppercase",
                                      "&:hover": {
                                        bgcolor: "rgba(229, 134, 60, 0.08)",
                                      },
                                    }}
                                  />
                                )}
                              </Box>
                              
                              {/* ✅ Línea decorativa sutil */}
                              <Box
                                sx={{
                                  width: 60,
                                  height: 2,
                                  bgcolor: "#8CA551",
                                  opacity: 0.8,
                                }}
                              />
                            </Box>
                          
                            {/* ✅ Grid de especificaciones - Estilo minimalista brandbook */}
                            <Grid container spacing={2}>
                              {[
                                {
                                  icon: <Bed sx={{ fontSize: { xs: 20, sm: 22 } }} />,
                                  label: "BEDROOMS",
                                  value: propertyDetails.model?.bedrooms,
                                },
                                {
                                  icon: <Bathtub sx={{ fontSize: { xs: 20, sm: 22 } }} />,
                                  label: "BATHROOMS",
                                  value: propertyDetails.model?.bathrooms,
                                },
                                {
                                  icon: <SquareFoot sx={{ fontSize: { xs: 20, sm: 22 } }} />,
                                  label: "SQUARE FEET",
                                  value: propertyDetails.model?.sqft,
                                },
                                propertyDetails.model?.stories && {
                                  icon: <Layers sx={{ fontSize: { xs: 20, sm: 22 } }} />,
                                  label: "STORIES",
                                  value: propertyDetails.model?.stories,
                                },
                                {
                                  icon: <Home sx={{ fontSize: { xs: 20, sm: 22 } }} />,
                                  label: "LOT NUMBER",
                                  value: `#${propertyDetails.property?.lot?.number}`,
                                },
                                {
                                  icon: <LocationOn sx={{ fontSize: { xs: 20, sm: 22 } }} />,
                                  label: "SECTION",
                                  value: propertyDetails.property?.lot?.section,
                                },
                                {
                                  icon: <AttachMoney sx={{ fontSize: { xs: 20, sm: 22 } }} />,
                                  label: "PROPERTY VALUE",
                                  value: `$${propertyDetails.property?.price?.toLocaleString()}`,
                                },
                                isModel10 && propertyDetails.property?.hasBalcony && {
                                  icon: React.createElement(balconyLabels.icon, { 
                                    sx: { fontSize: { xs: 20, sm: 22 } } 
                                  }),
                                  label: balconyLabels.chipLabel.toUpperCase(),
                                  value: "Included",
                                },
                              ]
                                .filter(Boolean)
                                .map((spec, index) => (
                                  <Grid item xs={6} sm={4} md={3} key={index}>
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: index * 0.06 }}
                                      whileHover={{ scale: 1.03, y: -2 }}
                                    >
                                      <Paper
                                        elevation={0}
                                        sx={{
                                          p: { xs: 1.5, sm: 2 },
                                          textAlign: "center",
                                          borderRadius: { xs: 2, md: 2.5 },
                                          border: "1px solid #e0e0e0",
                                          bgcolor: "#ffffff",
                                          transition: "all 0.3s ease",
                                          minHeight: { xs: 90, sm: 100, md: 110 },
                                          display: "flex",
                                          flexDirection: "column",
                                          justifyContent: "center",
                                          "&:hover": {
                                            borderColor: "#333F1F",
                                            bgcolor: "rgba(140, 165, 81, 0.03)",
                                            boxShadow: "0 8px 24px rgba(51, 63, 31, 0.12)",
                                          },
                                        }}
                                      >
                                        {/* ✅ Ícono - Diseño minimalista */}
                                        <Box
                                          sx={{
                                            width: { xs: 36, sm: 40, md: 44 },
                                            height: { xs: 36, sm: 40, md: 44 },
                                            borderRadius: "50%",
                                            bgcolor: "rgba(140, 165, 81, 0.08)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#333F1F",
                                            margin: "0 auto",
                                            mb: 1,
                                            transition: "all 0.3s ease",
                                          }}
                                        >
                                          {spec.icon}
                                        </Box>
                          
                                        {/* ✅ Label - Estilo brandbook */}
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "#999999",
                                            fontWeight: 500,
                                            textTransform: "uppercase",
                                            letterSpacing: "1px",
                                            fontFamily: '"Poppins", sans-serif',
                                            display: "block",
                                            mb: 0.5,
                                            fontSize: { xs: "0.65rem", sm: "0.7rem" },
                                          }}
                                        >
                                          {spec.label}
                                        </Typography>
                          
                                        {/* ✅ Value - Tipografía elegante */}
                                        <Typography
                                          variant="h6"
                                          sx={{
                                            color: "#1a1a1a",
                                            fontWeight: 600,
                                            fontFamily: '"Poppins", sans-serif',
                                            letterSpacing: "-0.5px",
                                            fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" },
                                            lineHeight: 1,
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

        {/* ========== UPLOAD PAYMENT DIALOG - Brandbook ========== */}
        <Dialog
          open={uploadPaymentDialog}
          onClose={handleCloseUploadPayment}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: "0 20px 60px rgba(51, 63, 31, 0.15)",
            }
          }}
        >
          {/* ✅ DIALOG TITLE - Brandbook */}
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  bgcolor: "#333F1F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(51, 63, 31, 0.2)",
                }}
              >
                <CloudUpload sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  sx={{ 
                    color: "#333F1F",
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  Upload Payment
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: "#706f6f",
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  Submit your payment information for approval
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
        
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2.5}>
              {/* ✅ Payment Amount */}
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
                        sx={{ 
                          mr: 0.5, 
                          fontSize: "0.875rem", 
                          color: '#333F1F', 
                          fontWeight: 600 
                        }}
                      >
                        $
                      </Typography>
                    ),
                  }}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      fontFamily: '"Poppins", sans-serif',
                      "& fieldset": {
                        borderColor: 'rgba(140, 165, 81, 0.3)',
                        borderWidth: '2px'
                      },
                      "&:hover fieldset": {
                        borderColor: "#8CA551"
                      },
                      "&.Mui-focused fieldset": { 
                        borderColor: "#333F1F",
                        borderWidth: "2px"
                      }
                    },
                    "& .MuiInputLabel-root": {
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      color: '#706f6f',
                      "&.Mui-focused": {
                        color: "#333F1F",
                        fontWeight: 600
                      }
                    }
                  }}
                />
              </Grid>
        
              {/* ✅ Payment Type */}
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
                      fontFamily: '"Poppins", sans-serif',
                      "& fieldset": {
                        borderColor: 'rgba(140, 165, 81, 0.3)',
                        borderWidth: '2px'
                      },
                      "&:hover fieldset": {
                        borderColor: "#8CA551"
                      },
                      "&.Mui-focused fieldset": { 
                        borderColor: "#333F1F",
                        borderWidth: "2px"
                      }
                    },
                    "& .MuiInputLabel-root": {
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      color: '#706f6f',
                      "&.Mui-focused": {
                        color: "#333F1F",
                        fontWeight: 600
                      }
                    }
                  }}
                >
                  <MenuItem 
                    value="initial down payment"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: 'rgba(140, 165, 81, 0.08)'
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(140, 165, 81, 0.12)',
                        '&:hover': {
                          bgcolor: 'rgba(140, 165, 81, 0.18)'
                        }
                      }
                    }}
                  >
                    Initial Down Payment
                  </MenuItem>
                  <MenuItem 
                    value="complementary down payment"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: 'rgba(140, 165, 81, 0.08)'
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(140, 165, 81, 0.12)',
                        '&:hover': {
                          bgcolor: 'rgba(140, 165, 81, 0.18)'
                        }
                      }
                    }}
                  >
                    Complementary Down Payment
                  </MenuItem>
                  <MenuItem 
                    value="monthly payment"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: 'rgba(140, 165, 81, 0.08)'
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(140, 165, 81, 0.12)',
                        '&:hover': {
                          bgcolor: 'rgba(140, 165, 81, 0.18)'
                        }
                      }
                    }}
                  >
                    Monthly Payment
                  </MenuItem>
                  <MenuItem 
                    value="additional payment"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: 'rgba(140, 165, 81, 0.08)'
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(140, 165, 81, 0.12)',
                        '&:hover': {
                          bgcolor: 'rgba(140, 165, 81, 0.18)'
                        }
                      }
                    }}
                  >
                    Additional Payment
                  </MenuItem>
                  <MenuItem 
                    value="closing payment"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: 'rgba(140, 165, 81, 0.08)'
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(140, 165, 81, 0.12)',
                        '&:hover': {
                          bgcolor: 'rgba(140, 165, 81, 0.18)'
                        }
                      }
                    }}
                  >
                    Closing Payment
                  </MenuItem>
                </TextField>
              </Grid>
        
              {/* ✅ Payment Date */}
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
                      fontFamily: '"Poppins", sans-serif',
                      "& fieldset": {
                        borderColor: 'rgba(140, 165, 81, 0.3)',
                        borderWidth: '2px'
                      },
                      "&:hover fieldset": {
                        borderColor: "#8CA551"
                      },
                      "&.Mui-focused fieldset": { 
                        borderColor: "#333F1F",
                        borderWidth: "2px"
                      }
                    },
                    "& .MuiInputLabel-root": {
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      color: '#706f6f',
                      "&.Mui-focused": {
                        color: "#333F1F",
                        fontWeight: 600
                      }
                    }
                  }}
                />
              </Grid>
        
              {/* ✅ Upload Receipt Button */}
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<Upload />}
                  sx={{
                    py: 2,
                    borderRadius: 3,
                    borderColor: 'rgba(140, 165, 81, 0.5)',
                    borderWidth: '2px',
                    color: "#333F1F",
                    fontWeight: 600,
                    textTransform: "none",
                    fontFamily: '"Poppins", sans-serif',
                    letterSpacing: '0.5px',
                    "&:hover": {
                      borderColor: "#8CA551",
                      borderWidth: '2px',
                      bgcolor: "rgba(140, 165, 81, 0.05)",
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
                    sx={{ 
                      mt: 2, 
                      borderRadius: 3,
                      bgcolor: 'rgba(140, 165, 81, 0.08)',
                      border: '1px solid rgba(140, 165, 81, 0.3)',
                      fontFamily: '"Poppins", sans-serif',
                      "& .MuiAlert-icon": {
                        color: "#8CA551"
                      }
                    }}
                    icon={<CheckCircle />}
                  >
                    <Typography 
                      variant="body2" 
                      fontWeight="600"
                      sx={{ 
                        fontFamily: '"Poppins", sans-serif',
                        color: '#333F1F'
                      }}
                    >
                      File selected: {paymentForm.supportFile.name}
                    </Typography>
                  </Alert>
                )}
              </Grid>
        
              {/* ✅ Notes */}
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
                      fontFamily: '"Poppins", sans-serif',
                      "& fieldset": {
                        borderColor: 'rgba(140, 165, 81, 0.3)',
                        borderWidth: '2px'
                      },
                      "&:hover fieldset": {
                        borderColor: "#8CA551"
                      },
                      "&.Mui-focused fieldset": { 
                        borderColor: "#333F1F",
                        borderWidth: "2px"
                      }
                    },
                    "& .MuiInputLabel-root": {
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      color: '#706f6f',
                      "&.Mui-focused": {
                        color: "#333F1F",
                        fontWeight: 600
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
        
            {/* ✅ Info Alert */}
            <Alert
              severity="info"
              sx={{ 
                mt: 3, 
                borderRadius: 3,
                bgcolor: 'rgba(140, 165, 81, 0.08)',
                border: '1px solid rgba(140, 165, 81, 0.3)',
                fontFamily: '"Poppins", sans-serif',
                "& .MuiAlert-icon": {
                  color: "#8CA551"
                }
              }}
              icon={<Info />}
            >
              <Typography
                variant="body2"
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  color: '#333F1F',
                  fontSize: '0.875rem'
                }}
              >
                Your payment will be reviewed and approved by administration within 24-48 hours.
              </Typography>
            </Alert>
          </DialogContent>
        
          {/* ✅ DIALOG ACTIONS - Brandbook */}
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={handleCloseUploadPayment}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1.2,
                color: "#706f6f",
                fontFamily: '"Poppins", sans-serif',
                border: "2px solid #e0e0e0",
                "&:hover": {
                  bgcolor: "rgba(112, 111, 111, 0.05)",
                  borderColor: "#706f6f"
                }
              }}
            >
              Cancel
            </Button>
            
            <Button
              variant="contained"
              onClick={handleSubmitPayment}
              disabled={uploadingPayment || !paymentForm.amount || !paymentForm.type}
              startIcon={<CheckCircle />}
              sx={{
                borderRadius: 3,
                bgcolor: "#333F1F",
                color: "white",
                fontWeight: 600,
                textTransform: "none",
                letterSpacing: "1px",
                fontFamily: '"Poppins", sans-serif',
                px: 4,
                py: 1.5,
                boxShadow: "0 4px 12px rgba(51, 63, 31, 0.25)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  bgcolor: "#8CA551",
                  transition: "left 0.4s ease",
                  zIndex: 0,
                },
                "&:hover": {
                  bgcolor: "#333F1F",
                  boxShadow: "0 8px 20px rgba(51, 63, 31, 0.35)",
                  "&::before": {
                    left: 0,
                  },
                },
                "&:disabled": {
                  bgcolor: "#e0e0e0",
                  color: "#999",
                },
                "& span": {
                  position: "relative",
                  zIndex: 1,
                }
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
