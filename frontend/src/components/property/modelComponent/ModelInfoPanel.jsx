import React from 'react';
import { Box, Typography, Chip, Button } from '@mui/material';
import { InfoOutlined, Visibility, Tune } from '@mui/icons-material';

const ModelInfoPanel = ({
  model,
  isLarge = false,
  isModel10 = false,
  balconyLabels,
  hasPricingOptions,
  selectedPricingOption,
  onOpenCustomization,
  onViewDetails
}) => {
  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        bgcolor: "#fafafa",
        borderRadius: 3,
        border: "1px solid #e0e0e0",
        height: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
        "&::-webkit-scrollbar": {
          width: 6,
        },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "rgba(51, 63, 31, 0.2)",
          borderRadius: 3,
        },
      }}
    >
      {/* ✅ HEADER - Título + Badge */}
      <Box sx={{ mb: 2.5 }}>
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <Typography
            variant={isLarge ? "subtitle1" : "h6"}
            fontWeight={700}
            sx={{
              color: "#333F1F",
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: "0.5px",
            }}
          >
            {model.model}
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
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            />
          )}
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: "#706f6f",
            fontFamily: '"Poppins", sans-serif',
            fontSize: "0.75rem",
            display: "block",
          }}
        >
          Model #{model.modelNumber}
        </Typography>
      </Box>

      {/* ✅ LÍNEA DECORATIVA */}
      <Box
        sx={{
          width: "100%",
          height: 2,
          bgcolor: "rgba(140, 165, 81, 0.2)",
          mb: 2.5,
        }}
      />

      {/* ✅ BASE SPECIFICATIONS - Grid minimalista */}
      <Box mb={2.5}>
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            color: "#706f6f",
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            fontSize: "0.65rem",
            display: "block",
            mb: 1.5,
          }}
        >
          Base Specifications
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0,
            borderTop: "1px solid #e0e0e0",
            borderBottom: "1px solid #e0e0e0",
            py: 1.5,
            bgcolor: "white",
            borderRadius: 2,
          }}
        >
          {/* Beds */}
          <Box
            sx={{
              textAlign: "center",
              borderRight: "1px solid #e0e0e0",
              px: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#999999",
                fontSize: "0.6rem",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontFamily: '"Poppins", sans-serif',
                display: "block",
                mb: 0.5,
              }}
            >
              Beds
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#333F1F",
                fontSize: "1.1rem",
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              {model.bedrooms}
            </Typography>
          </Box>

          {/* Baths */}
          <Box
            sx={{
              textAlign: "center",
              borderRight: "1px solid #e0e0e0",
              px: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#999999",
                fontSize: "0.6rem",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontFamily: '"Poppins", sans-serif',
                display: "block",
                mb: 0.5,
              }}
            >
              Baths
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#333F1F",
                fontSize: "1.1rem",
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              {model.bathrooms}
            </Typography>
          </Box>

          {/* SQFT */}
          <Box
            sx={{
              textAlign: "center",
              borderRight: "1px solid #e0e0e0",
              px: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#999999",
                fontSize: "0.6rem",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontFamily: '"Poppins", sans-serif',
                display: "block",
                mb: 0.5,
              }}
            >
              SQFT
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#333F1F",
                fontSize: "1.1rem",
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              {model.sqft?.toLocaleString()}
            </Typography>
          </Box>

          {/* Stories */}
          <Box sx={{ textAlign: "center", px: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: "#999999",
                fontSize: "0.6rem",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontFamily: '"Poppins", sans-serif',
                display: "block",
                mb: 0.5,
              }}
            >
              Stories
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#333F1F",
                fontSize: "1.1rem",
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              {model.stories || 1}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ✅ BASE PRICE - Minimalista */}
      <Box
        mb={2.5}
        p={2}
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          border: "2px solid #e0e0e0",
          textAlign: "center",
        }}
      >
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            color: "#706f6f",
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            fontSize: "0.65rem",
            display: "block",
            mb: 1,
          }}
        >
          Base Price
        </Typography>
        <Typography
          variant={isLarge ? "h5" : "h4"}
          sx={{
            color: "#333F1F",
            fontWeight: 700,
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: "-0.5px",
          }}
        >
          ${model.price.toLocaleString()}
        </Typography>
      </Box>

      {/* ✅ AVAILABLE OPTIONS - Chips minimalistas */}
      {hasPricingOptions && (
        <Box mb={2.5}>
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{
              color: "#706f6f",
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontSize: "0.65rem",
              display: "block",
              mb: 1.5,
            }}
          >
            Available Options
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {/* Upgrade */}
            {model.upgrades?.length > 0 && (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 1.5,
                  bgcolor: "white",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Chip
                  label="Upgrade"
                  size="small"
                  sx={{
                    height: 24,
                    bgcolor: "transparent",
                    border: "1.5px solid #E5863C",
                    color: "#E5863C",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    fontFamily: '"Poppins", sans-serif',
                    letterSpacing: "0.5px",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#333F1F",
                    fontWeight: 700,
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.85rem",
                  }}
                >
                  +${(model.upgrades[0].price / 1000).toFixed(0)}K
                </Typography>
              </Box>
            )}

            {/* Balcony/Estudio */}
            {model.balconies?.length > 0 && (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 1.5,
                  bgcolor: "white",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Chip
                  label={balconyLabels.chipLabel}
                  size="small"
                  sx={{
                    height: 24,
                    bgcolor: "transparent",
                    border: "1.5px solid #8CA551",
                    color: "#8CA551",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    fontFamily: '"Poppins", sans-serif',
                    letterSpacing: "0.5px",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#333F1F",
                    fontWeight: 700,
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.85rem",
                  }}
                >
                  +${(model.balconies[0].price / 1000).toFixed(0)}K
                </Typography>
              </Box>
            )}

            {/* Storage */}
            {model.storages?.length > 0 && (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 1.5,
                  bgcolor: "white",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Chip
                  label="Storage"
                  size="small"
                  sx={{
                    height: 24,
                    bgcolor: "transparent",
                    border: "1.5px solid #706f6f",
                    color: "#706f6f",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    fontFamily: '"Poppins", sans-serif',
                    letterSpacing: "0.5px",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#333F1F",
                    fontWeight: 700,
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.85rem",
                  }}
                >
                  +${(model.storages[0].price / 1000).toFixed(0)}K
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* ✅ CURRENT CONFIGURATION - Destacado */}
      {selectedPricingOption && (
        <Box
          mb={2.5}
          p={2.5}
          sx={{
            bgcolor: "rgba(140, 165, 81, 0.08)",
            borderRadius: 2,
            border: "2px solid #8CA551",
            textAlign: "center",
          }}
        >
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{
              color: "#8CA551",
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontSize: "0.65rem",
              display: "block",
              mb: 1,
            }}
          >
            Current Configuration
          </Typography>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              color: "#333F1F",
              fontFamily: '"Poppins", sans-serif',
              mb: 1,
            }}
          >
            {selectedPricingOption.label}
          </Typography>
          <Typography
            variant={isLarge ? "h6" : "h5"}
            sx={{
              color: "#8CA551",
              fontWeight: 700,
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: "-0.5px",
            }}
          >
            ${selectedPricingOption.price.toLocaleString()}
          </Typography>
        </Box>
      )}

      {/* ✅ ACTION BUTTONS - Brandbook */}
      <Box mt="auto" display="flex" flexDirection="column" gap={1.5}>
        {hasPricingOptions && (
          <Button
            variant="contained"
            size={isLarge ? "medium" : "large"}
            fullWidth
            startIcon={<Tune />}
            onClick={onOpenCustomization}
            sx={{
              borderRadius: 3,
              bgcolor: "#333F1F",
              color: "white",
              fontWeight: 600,
              textTransform: "none",
              letterSpacing: "1px",
              fontFamily: '"Poppins", sans-serif',
              px: 3,
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
                "& .MuiButton-startIcon": {
                  color: "white",
                },
              },
              "& .MuiButton-startIcon": {
                position: "relative",
                zIndex: 1,
                color: "white",
              },
            }}
          >
            <Box component="span" sx={{ position: "relative", zIndex: 1 }}>
              Customize
            </Box>
          </Button>
        )}

        <Button
          variant="outlined"
          size="small"
          fullWidth
          startIcon={<Visibility />}
          onClick={onViewDetails}
          sx={{
            borderRadius: 2,
            borderColor: "#e0e0e0",
            borderWidth: "2px",
            color: "#706f6f",
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "none",
            letterSpacing: "1px",
            fontFamily: '"Poppins", sans-serif',
            py: 1,
            "&:hover": {
              borderColor: "#333F1F",
              borderWidth: "2px",
              bgcolor: "rgba(51, 63, 31, 0.05)",
              color: "#333F1F",
            },
          }}
        >
          Full Details
        </Button>
      </Box>

      {/* ✅ INFO MESSAGE - Sin opciones */}
      {!hasPricingOptions && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "#f5f5f5",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            textAlign: "center",
          }}
        >
          <InfoOutlined sx={{ fontSize: 28, color: "#999", mb: 0.5 }} />
          <Typography
            variant="caption"
            sx={{
              color: "#706f6f",
              fontFamily: '"Poppins", sans-serif',
              fontSize: "0.75rem",
            }}
          >
            {isModel10
              ? "Comedor and Estudio options in customization"
              : "No additional options available"}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ModelInfoPanel;