import {
  Typography,
  Box,
  Grid,
  Container,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
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
import { PropertyProvider, useProperty } from "../context/PropertyContext";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import InteractiveMap from "../components/property/InteractiveMap";
import PropertyStats from "../components/property/PropertyStats";
import ModelSelector from "../components/property/ModelSelector";
import FacadeSelector from "../components/property/FacadeSelector";
import ResidentAssignment from "../components/property/ResidentAssignment";
import PriceCalculator from "../components/property/PriceCalculator";
import { motion } from "framer-motion";

const PropertySelectionContent = () => {
  const { loading, error } = useProperty();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [residentExpanded, setResidentExpanded] = useState(false);

  const handleCreatePropertyClick = () => {
    setResidentExpanded(true);

    // Scroll to ResidentAssignment
    setTimeout(() => {
      const element = document.getElementById("resident-assignment-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress sx={{ color: "#4a7c59" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error loading property data: {error}</Alert>
      </Box>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {/* Header brandbook minimalista */}
        
        {/* Main content */}
        <Box sx={{ p: 3 }}>
<Box sx={{ mb: 2, p: 3 }}>
          <Box
            sx={{
              position: 'relative',
              borderRadius: { xs: 4, md: 6 },
              border: '1.5px solid #e8f5ee',
              boxShadow: '0 12px 32px rgba(74,124,89,0.12)',
              background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
              p: { xs: 3, sm: 3.5, md: 4 },
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 24px 48px rgba(74,124,89,0.18)',
                border: '2px solid rgba(140, 165, 81, 0.3)',
              },
            }}
          >
            {/* Barra decorativa superior */}
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
            <Box display="flex" alignItems="center" gap={3} flexDirection={{ xs: 'column', sm: 'row' }}>
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
                  Property Selection
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
                <Typography
                  variant="h6"
                  sx={{
                    color: '#706f6f',
                    fontWeight: 400,
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.2rem' },
                    letterSpacing: '0.5px',
                    maxWidth: 600,
                  }}
                >
                  Choose your lot, model and facade. Calculate your price and assign residents.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

          <Container
            maxWidth={false}
            sx={{
              // px: { xs: 2, sm: 3 },
              // py: 3,
            }}
          >
            <Grid container spacing={3}>
              {/* Mobile: Show PropertyStats first */}
              {isMobile && (
                <Grid item xs={12}>
                  <PropertyStats />
                </Grid>
              )}

              {/* Left Column - Main Content */}
              <Grid item xs={12} md={8}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <InteractiveMap />
                  <ModelSelector />
                  <FacadeSelector />

                  {/* Solo mostrar ResidentAssignment si está autenticado */}
                  {isAuthenticated && (
                    <Box id="resident-assignment-section">
                      <ResidentAssignment
                        expanded={residentExpanded}
                        onToggle={() => setResidentExpanded(!residentExpanded)}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Right Column - Sidebar (Desktop only) */}
              {!isMobile && (
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <PropertyStats />
                    <PriceCalculator
                      onCreatePropertyClick={handleCreatePropertyClick}
                      isPublic={!isAuthenticated}
                    />
                  </Box>
                </Grid>
              )}

              {/* Mobile: Show PriceCalculator at the end */}
              {isMobile && (
                <Grid item xs={12}>
                  <PriceCalculator
                    onCreatePropertyClick={handleCreatePropertyClick}
                    isPublic={!isAuthenticated}
                  />
                </Grid>
              )}
            </Grid>
          </Container>
        </Box>
      </motion.div>
    </>
  );
};

const PropertySelection = () => {
  return (
    <PropertyProvider>
      <PropertySelectionContent />
    </PropertyProvider>
  );
};

export default PropertySelection;