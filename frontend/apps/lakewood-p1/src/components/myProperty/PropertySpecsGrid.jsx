import React from "react"
import { Grid, Paper, Box, Typography } from "@mui/material"
import { motion } from "framer-motion"
import { Bed, Bathtub, SquareFoot, Layers, Home, LocationOn, AttachMoney } from "@mui/icons-material"

const PropertySpecsGrid = ({ propertyDetails, isModel10, balconyLabels, gridProps }) => {
  const specs = [
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
    // ...existing code...
    {
      icon: <Home sx={{ fontSize: { xs: 20, sm: 22 } }} />,
      label: "LOT NUMBER",
      value: propertyDetails.lot?.number
        ? `#${propertyDetails.lot.number}`
        : propertyDetails.model?.lot?.number
          ? `#${propertyDetails.model.lot.number}`
          : "N/A",
    },
    {
      icon: <AttachMoney sx={{ fontSize: { xs: 20, sm: 22 } }} />,
      label: "PROPERTY VALUE",
      value: propertyDetails.price
        ? `$${propertyDetails.price.toLocaleString()}`
        : propertyDetails.model?.price
          ? `$${propertyDetails.model.price.toLocaleString()}`
          : "N/A",
    },
    // ...existing code...
    isModel10 && propertyDetails.property?.hasBalcony && {
      icon: React.createElement(balconyLabels.icon, {
        sx: { fontSize: { xs: 20, sm: 22 } }
      }),
      label: balconyLabels.chipLabel.toUpperCase(),
      value: "Included",
    },
  ]

  return (
    <Grid container spacing={2} {...gridProps}>
      {specs.filter(Boolean).map((spec, index) => (
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
  )
}

export default PropertySpecsGrid