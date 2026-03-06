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
} from "@mui/material";
import {
  Home,
  Construction,
  Payment,
  Visibility,
  ArrowBack,
  CheckCircle,
  Pending,
  Star,
  AccountBalance,
  AutoAwesome,
  TrendingUp,
  Layers,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import userPropertyService from "../services/userPropertyService";
import api from "../services/api";
import ConstructionTab from "../components/myProperty/ConstructionTab";
import PaymentTab from "../components/myProperty/PaymentTab";
import PropertyDetailsTab from "../components/myProperty/propertyDetails";
import PropertyCard from "../components/myProperty/PropertyCard";
import { useTranslation } from "react-i18next";
import Loader from "../components/Loader";

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
  const { t } = useTranslation(['myProperty', 'common']);
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
  const [hoveredCard, setHoveredCard] = useState(null);
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
    if (phases.length > 0) {
      const firstIncomplete = phases.findIndex(
        (p) => p.constructionPercentage < 100,
      );
      setCurrentPhaseIndex(firstIncomplete === -1 ? 0 : firstIncomplete);
    }
  }, [phases]);

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
      setError(error.message || t('myProperty:loadError', 'Failed to load properties'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProperty = async (propertyId) => {
    try {
      setLoading(true);
      const details = await userPropertyService.getPropertyDetails(propertyId);
      setPropertyDetails(details);
      setSelectedProperty(propertyId);
      setActiveTab(0);
    } catch (error) {
      setError(error.message || t('myProperty:loadError', 'Failed to load property details'));
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

  // CONSTANTE PARA IDENTIFICAR EL MODELO 10
  const MODEL_10_ID = "6977c7bbd1f24768968719de";
  const isModel10 = propertyDetails?.model?._id === MODEL_10_ID;

  // LABELS CONDICIONALES PARA BALCONY/ESTUDIO
  const balconyLabels = isModel10
    ? {
        chipLabel: t('myProperty:study', 'Study'),
        icon: Home,
        color: "#2196f3"
      }
    : {
        chipLabel: t('myProperty:balcony', 'Balcony'),
        icon: AutoAwesome,
        color: "#4a7c59"
      };

  if (loading && properties.length === 0) {
    return (
      <Box sx={{ minHeight: "100vh" }}>
        <Loader 
          size="large" 
          message={t('myProperty:loading', 'Loading your properties...')} 
          fullHeight 
        />
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
            {t('myProperty:goToDashboard', 'Go to Dashboard')}
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
            {t('myProperty:noProperties', 'No properties found. Contact administration.')}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/dashboard")}
          >
            {t('myProperty:goToDashboard', 'Go to Dashboard')}
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
        {/* HEADER CON ESTADÍSTICAS */}
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
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              gap={{ xs: 2, sm: 3 }}
              mb={4}
              position="relative"
              zIndex={1}
            >
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
                  {t('myProperty:title', 'My Properties')}
                </Typography>
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
                    {t('myProperty:welcome', 'Welcome back,')}
                  </Typography>
                  <Chip
                    label={user?.firstName || t('myProperty:investor', 'Investor')}
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
            <AnimatePresence>
              {financialSummary ? (
                <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                  {[
                    {
                      label: t('myProperty:totalInvestment', 'Total Investment'),
                      value: `$${financialSummary.totalInvestment.toLocaleString()}`,
                      icon: <AccountBalance />,
                      color: '#333F1F',
                      borderColor: '#333F1F',
                    },
                    {
                      label: t('myProperty:totalPaid', 'Total Paid'),
                      value: `$${financialSummary.totalPaid.toLocaleString()}`,
                      icon: <CheckCircle />,
                      sub: `${Math.round(financialSummary.paymentProgress)}% ${t('myProperty:completed', 'completed')}`,
                      color: '#8CA551',
                      borderColor: '#8CA551',
                    },
                    {
                      label: t('myProperty:pendingAmount', 'Pending Amount'),
                      value: `$${financialSummary.totalPending.toLocaleString()}`,
                      icon: <Pending />,
                      color: '#E5863C',
                      borderColor: '#E5863C',
                    },
                    {
                      label: t('myProperty:propertiesOwned', 'Properties Owned'),
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
                        style={{ height: '100%' }}
                      >
                        <Card
                          sx={{
                            height: '100%',
                            minHeight: { xs: 140, sm: 160, md: 180 },
                            borderRadius: { xs: 3, md: 4 },
                            border: `1.5px solid ${stat.borderColor}30`,
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                            display: 'flex',
                            flexDirection: 'column',
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
                          <CardContent 
                            sx={{ 
                              p: { xs: 2, sm: 2.5, md: 3 },
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}
                          >
                            <Box>
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
                            </Box>
                            {stat.sub ? (
                              <Box display="flex" alignItems="center" gap={0.5} mt="auto">
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
                            ) : (
                              <Box sx={{ height: { xs: 18, sm: 20 } }} />
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                  {[0, 1, 2, 3].map((index) => (
                    <Grid item xs={6} sm={6} md={3} key={index}>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        style={{ height: '100%' }}
                      >
                        <Card
                          sx={{
                            height: '100%',
                            minHeight: { xs: 140, sm: 160, md: 180 },
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
                    {t('myProperty:selectProperty', 'Select Your Property')}
                  </Typography>
                </Box>
                <Chip
                  label={`${properties.length} ${properties.length === 1 ? t('myProperty:property', 'Property') : t('myProperty:properties', 'Properties')}`}
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
                    <PropertyCard
                      property={property}
                      hovered={hoveredCard === property._id}
                      onHoverStart={() => setHoveredCard(property._id)}
                      onHoverEnd={() => setHoveredCard(null)}
                      onClick={() => handleSelectProperty(property._id)}
                    />
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          ) : (
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
                  {t('myProperty:backToProperties', 'Back to Properties')}
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
                        <Grid item xs={12} md={8}>
                          <Box 
                            display="flex" 
                            alignItems="center" 
                            gap={{ xs: 2, md: 3 }}
                            flexDirection={{ xs: 'column', sm: 'row' }}
                            textAlign={{ xs: 'center', sm: 'left' }}
                          >
                            <Box
                              sx={{
                                width: { xs: 80, sm: 90, md: 100 },
                                height: { xs: 80, sm: 90, md: 100 },
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
                                boxShadow: '0 8px 24px rgba(51, 63, 31, 0.3)',
                                border: '3px solid white',
                                overflow: 'hidden',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Home sx={{ fontSize: { xs: 40, md: 50 }, color: 'white' }} />
                            </Box>
                            <Box flex={1}>
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
                                {propertyDetails.model?.model || t('myProperty:modelNA', 'Model N/A')}
                              </Typography>
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
                              <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                                mb={2}
                                flexWrap="wrap"
                                justifyContent={{ xs: 'center', sm: 'flex-start' }}
                              >
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
                                  {t('myProperty:lot', 'Lot')} #{propertyDetails.property.lot?.number} 
                                </Typography>
                              </Box>
                              <Box
                                display="flex"
                                gap={1.5}
                                flexWrap="wrap"
                                justifyContent={{ xs: 'center', sm: 'flex-start' }}
                                mb={2}
                              >
                                {propertyDetails.construction.currentPhase && (
                                  <Chip
                                    label={`${t('myProperty:phase', 'Phase')} ${propertyDetails.construction.currentPhase.phaseNumber}: ${propertyDetails.construction.currentPhase.title}`}
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
                                      ? `${propertyDetails.property.totalConstructionPercentage}% ${t('myProperty:complete', 'Complete')}`
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
                                {propertyDetails.property.modelType === "upgrade" && (
                                  <Chip
                                    icon={<Star sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                                    label={t('myProperty:upgrade', 'Upgrade')}
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
                                {propertyDetails.property?.hasStorage && (
                                  <Chip
                                    icon={<Layers sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                                    label={t('myProperty:storage', 'Storage')}
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
                                {isModel10 && (
                                  <Chip
                                    label={t('myProperty:model10', 'Model 10')}
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
                            </Box>
                          </Box>
                        </Grid>
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
                                {t('myProperty:propertyValue', 'Property Value')}
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
                        variant="fullWidth"
                        sx={{
                          "& .MuiTab-root": {
                            py: { xs: 2, sm: 2.5, md: 3 },
                            px: { xs: 1.5, sm: 2, md: 3 },
                            fontWeight: 700,
                            fontSize: {
                              xs: "0.75rem",
                              sm: "0.9rem",
                              md: "1rem",
                            },
                            textTransform: "none",
                            color: "#6c757d",
                            transition: "all 0.3s ease",
                            minHeight: { xs: 56, sm: 64, md: 72 },
                            flexDirection: { xs: "column", sm: "row" },
                            gap: { xs: 0.3, sm: 1 },
                            "&.Mui-selected": {
                              color: "#4a7c59",
                            },
                            "&:hover": {
                              bgcolor: "rgba(74, 124, 89, 0.05)",
                            },
                            "& .MuiSvgIcon-root": {
                              fontSize: { xs: 16, sm: 20, md: 24 },
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
                          label={t('myProperty:constructionTab', 'Construction Progress')}
                          iconPosition="start"
                        />
                        <Tab
                          icon={<Payment />}
                          label={t('myProperty:paymentTab', 'Payment Status')}
                          iconPosition="start"
                        />
                        <Tab
                          icon={<Visibility />}
                          label={t('myProperty:detailsTab', 'Property Details')}
                          iconPosition="start"
                        />
                      </Tabs>
                    </Paper>
                  </motion.div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.4 }}
                    >
                      {activeTab === 0 && (
                        <ConstructionTab
                          phases={phases}
                          loadingPhases={loadingPhases}
                        />
                      )}
                      {activeTab === 1 && (
                        <PaymentTab 
                          propertyDetails={propertyDetails}
                          payloads={payloads}
                          loadingPayloads={loadingPayloads}
                          onPaymentUploaded={fetchPayloads}
                          user={user}
                        />
                      )}
                      {activeTab === 2 && (
                        <PropertyDetailsTab
                          propertyDetails={propertyDetails}
                          isModel10={isModel10}
                          balconyLabels={balconyLabels}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default MyProperty;