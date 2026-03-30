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
  Home,
} from "@mui/icons-material";
import { PropertyProvider, useProperty } from "@shared/context/PropertyContext";
import { useState } from "react";
// import { useAuth } from "../context/AuthContext";
import { useAuth } from '@shared/context/AuthContext'

import InteractiveMap from "../components/property/InteractiveMap";
import PropertyStats from "../components/property/PropertyStats";
import ModelSelector from "../components/property/ModelSelector";
import FacadeSelector from "../components/property/FacadeSelector";
import ResidentAssignment from "../components/property/ResidentAssignment";
import PriceCalculator from "../components/property/PriceCalculator";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Loader from "../components/Loader";
import PageHeader from "@shared/components/PageHeader";

const PropertySelectionContent = () => {
  const { t } = useTranslation(['propertySelection', 'common']);
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
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Loader
          size="large"
          message="Loading..."
          fullHeight={false}
        />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{t('propertySelection:errorLoading', { error })}</Alert>
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
        <Box sx={{ p: 3 }}>
<Box sx={{ p: 3 }}>
  <PageHeader
    icon={Home}
    title={t('propertySelection:title')}
    subtitle={t('propertySelection:subtitle')}
  />
</Box>

          <Container maxWidth={false}>
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