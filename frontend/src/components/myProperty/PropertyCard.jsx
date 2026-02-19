import { Card, CardContent, Box, Typography, Avatar, Chip, Button } from "@mui/material"
import { Home, LocationOn, Bed, Bathtub, SquareFoot } from "@mui/icons-material"
import { motion } from "framer-motion"
import React from "react"

const PropertyCard = ({
  property,
  hovered,
  onHoverStart,
  onHoverEnd,
  onClick
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.6,
      type: "spring",
    }}
    whileHover={{ scale: 1.02 }}
    onHoverStart={onHoverStart}
    onHoverEnd={onHoverEnd}
  >
    <Card
      onClick={onClick}
      sx={{
        height: "100%",
        minHeight: { xs: 420, sm: 440, md: 460 },
        borderRadius: 6,
        cursor: "pointer",
        border: hovered
          ? "2px solid #333F1F"
          : "1.5px solid #e8f5ee",
        boxShadow: hovered
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
      {/* Barra superior decorativa */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: hovered
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
        {/* Header con imagen y modelo */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <motion.div
            animate={
              hovered
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

        {/* Línea decorativa */}
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

        {/* Grid de especificaciones */}
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

        {/* Precio */}
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

        {/* Status Chip */}
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

        {/* Botón */}
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
)

export default PropertyCard