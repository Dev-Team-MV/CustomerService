import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Paper,
  Grid
} from '@mui/material';
import {
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
  Layers,
  Add
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const ModelCard = ({
  model,
  index,
  facades,
  onEdit,
  onDelete,
  onOpenGallery,
  onGoToDetail,
  onOpenFacadeDialog,
  onEditFacade,
  onDeleteFacade
}) => {
  const [imageIndex, setImageIndex] = useState(0);

  // ========================================
  // HELPERS
  // ========================================
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return { bg: 'rgba(140, 165, 81, 0.12)', color: '#333F1F', border: 'rgba(140, 165, 81, 0.3)' };
      case 'draft':
        return { bg: 'rgba(229, 134, 60, 0.12)', color: '#E5863C', border: 'rgba(229, 134, 60, 0.3)' };
      case 'inactive':
        return { bg: 'rgba(112, 111, 111, 0.12)', color: '#706f6f', border: 'rgba(112, 111, 111, 0.3)' };
      default:
        return { bg: 'rgba(112, 111, 111, 0.12)', color: '#706f6f', border: 'rgba(112, 111, 111, 0.3)' };
    }
  };

  const getAllModelImages = (model) => {
    return [
      ...(model.images?.exterior || []),
      ...(model.images?.interior || []),
      ...(model.images?.blueprints || [])
    ];
  };

  const getFacadeImages = (facade) => {
    if (Array.isArray(facade.url)) {
      return facade.url;
    }
    return facade.url ? [facade.url] : [];
  };

  const hasPricingOptions = (model) => {
    return (
      (model.balconies && model.balconies.length > 0) ||
      (model.upgrades && model.upgrades.length > 0) ||
      (model.storages && model.storages.length > 0)
    );
  };

  // ========================================
  // HANDLERS
  // ========================================
  const handlePrevImage = (e) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  // ========================================
  // DATA
  // ========================================
  const statusColors = getStatusColor(model.status);
  const allImages = getAllModelImages(model);
  const currentImage = allImages[imageIndex];
  const modelFacades = facades || [];

  return (
    <Grid item xs={12} lg={6}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: '0 4px 16px rgba(51, 63, 31, 0.08)',
            transition: 'all 0.3s',
            border: '1px solid rgba(140, 165, 81, 0.15)',
            bgcolor: 'white',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '&:hover': {
              boxShadow: '0 12px 32px rgba(51, 63, 31, 0.12)',
              borderColor: '#8CA551',
              transform: 'translateY(-4px)'
            },
            position: 'relative',
            overflow: 'visible'
          }}
        >
          {/* STATUS CHIP */}
          <Chip
            label={model.status}
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              fontWeight: 700,
              zIndex: 2,
              textTransform: 'capitalize',
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: '0.5px',
              fontSize: '0.7rem',
              height: 26,
              bgcolor: statusColors.bg,
              color: statusColors.color,
              border: `1px solid ${statusColors.border}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />

          <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* IMAGEN + INFO BÁSICA */}
            <Box display="flex" gap={2} mb={2.5}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  bgcolor: 'rgba(112, 111, 111, 0.05)',
                  flexShrink: 0,
                  border: '2px solid rgba(140, 165, 81, 0.15)'
                }}
              >
                {currentImage ? (
                  <>
                    <Box
                      component="img"
                      src={currentImage}
                      alt={model.model}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <Chip
                      label={`${imageIndex + 1}/${allImages.length}`}
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 6,
                        right: 6,
                        bgcolor: 'rgba(51, 63, 31, 0.9)',
                        backdropFilter: 'blur(8px)',
                        color: 'white',
                        height: 22,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    />
                    {allImages.length > 1 && (
                      <>
                        <IconButton
                          size="small"
                          onClick={handlePrevImage}
                          sx={{
                            position: 'absolute',
                            left: 4,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(255,255,255,0.9)',
                            width: 24,
                            height: 24,
                            '&:hover': { bgcolor: 'white' }
                          }}
                        >
                          <ChevronLeft sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={handleNextImage}
                          sx={{
                            position: 'absolute',
                            right: 4,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(255,255,255,0.9)',
                            width: 24,
                            height: 24,
                            '&:hover': { bgcolor: 'white' }
                          }}
                        >
                          <ChevronRight sx={{ fontSize: 16 }} />
                        </IconButton>
                      </>
                    )}
                  </>
                ) : (
                  <Home sx={{ fontSize: 40, color: '#706f6f', opacity: 0.4 }} />
                )}
              </Box>

              <Box flex={1} minWidth={0}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  noWrap
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: '#333F1F',
                    letterSpacing: '0.5px',
                    mb: 0.5
                  }}
                >
                  {model.model}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif',
                    display: 'block',
                    mb: 1.5
                  }}
                >
                  #{model.modelNumber}
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'rgba(140, 165, 81, 0.08)',
                    border: '2px solid rgba(140, 165, 81, 0.25)',
                    borderRadius: 2,
                    px: 2,
                    py: 0.8,
                    display: 'inline-block'
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{
                      color: '#333F1F',
                      fontFamily: '"Poppins", sans-serif',
                      letterSpacing: '0.5px'
                    }}
                  >
                    ${model.price?.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* SPECS */}
            <Box
              display="flex"
              gap={2}
              mb={2}
              flexWrap="wrap"
              sx={{
                p: 1.5,
                bgcolor: 'rgba(140, 165, 81, 0.03)',
                borderRadius: 2,
                border: '1px solid rgba(140, 165, 81, 0.1)'
              }}
            >
              <Box display="flex" alignItems="center" gap={0.8}>
                <Bed sx={{ fontSize: 18, color: '#333F1F' }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    color: '#706f6f'
                  }}
                >
                  {model.bedrooms}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.8}>
                <Bathtub sx={{ fontSize: 18, color: '#8CA551' }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    color: '#706f6f'
                  }}
                >
                  {model.bathrooms}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.8}>
                <SquareFoot sx={{ fontSize: 18, color: '#E5863C' }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    color: '#706f6f'
                  }}
                >
                  {model.sqft?.toLocaleString()}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.8}>
                <Layers sx={{ fontSize: 18, color: '#706f6f' }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    color: '#706f6f'
                  }}
                >
                  {model.stories || 1}
                </Typography>
              </Box>
            </Box>

            {/* PRICING OPTIONS */}
            {hasPricingOptions(model) && (
              <Box display="flex" gap={0.8} mb={2} flexWrap="wrap">
                {model.balconies?.length > 0 && (
                  <Chip
                    icon={<Balcony sx={{ fontSize: 14 }} />}
                    label={`+$${(model.balconies[0].price / 1000).toFixed(0)}K`}
                    size="small"
                    sx={{
                      height: 24,
                      bgcolor: 'rgba(140, 165, 81, 0.12)',
                      color: '#333F1F',
                      fontWeight: 600,
                      border: '1px solid rgba(140, 165, 81, 0.3)',
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '0.7rem',
                      '& .MuiChip-icon': { color: '#8CA551' }
                    }}
                  />
                )}
                {model.upgrades?.length > 0 && (
                  <Chip
                    icon={<UpgradeIcon sx={{ fontSize: 14 }} />}
                    label={`+$${(model.upgrades[0].price / 1000).toFixed(0)}K`}
                    size="small"
                    sx={{
                      height: 24,
                      bgcolor: 'rgba(229, 134, 60, 0.12)',
                      color: '#E5863C',
                      fontWeight: 600,
                      border: '1px solid rgba(229, 134, 60, 0.3)',
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '0.7rem',
                      '& .MuiChip-icon': { color: '#E5863C' }
                    }}
                  />
                )}
                {model.storages?.length > 0 && (
                  <Chip
                    icon={<StorageIcon sx={{ fontSize: 14 }} />}
                    label={`+$${(model.storages[0].price / 1000).toFixed(0)}K`}
                    size="small"
                    sx={{
                      height: 24,
                      bgcolor: 'rgba(112, 111, 111, 0.12)',
                      color: '#706f6f',
                      fontWeight: 600,
                      border: '1px solid rgba(112, 111, 111, 0.3)',
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '0.7rem',
                      '& .MuiChip-icon': { color: '#706f6f' }
                    }}
                  />
                )}
              </Box>
            )}

            {/* ACTIONS */}
            <Box display="flex" gap={1} mb={2.5}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<PhotoLibrary sx={{ fontSize: 16 }} />}
                onClick={() => onOpenGallery(model)}
                sx={{
                  flex: 1,
                  fontSize: '0.75rem',
                  borderRadius: 2,
                  borderColor: '#8CA551',
                  color: '#333F1F',
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  '&:hover': {
                    borderColor: '#333F1F',
                    bgcolor: 'rgba(51, 63, 31, 0.04)'
                  }
                }}
              >
                Gallery
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => onGoToDetail(model._id)}
                sx={{
                  flex: 1,
                  fontSize: '0.75rem',
                  borderRadius: 2,
                  bgcolor: '#333F1F',
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  '&:hover': {
                    bgcolor: '#4a5d3a'
                  }
                }}
              >
                Details
              </Button>
              <IconButton
                size="small"
                onClick={() => onEdit(model)}
                sx={{
                  border: '1px solid rgba(140, 165, 81, 0.3)',
                  color: '#8CA551',
                  '&:hover': {
                    bgcolor: 'rgba(140, 165, 81, 0.08)',
                    borderColor: '#8CA551'
                  }
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete(model._id)}
                sx={{
                  border: '1px solid rgba(229, 134, 60, 0.3)',
                  color: '#E5863C',
                  '&:hover': {
                    bgcolor: 'rgba(229, 134, 60, 0.08)',
                    borderColor: '#E5863C'
                  }
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>

            {/* FACADES */}
            <Box
              sx={{
                borderTop: '2px solid rgba(140, 165, 81, 0.15)',
                pt: 2,
                mt: 'auto'
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontSize: '0.7rem'
                  }}
                >
                  Facades ({modelFacades.length})
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onOpenFacadeDialog(model)}
                  sx={{
                    bgcolor: '#333F1F',
                    color: 'white',
                    width: 28,
                    height: 28,
                    '&:hover': { bgcolor: '#4a5d3a' }
                  }}
                >
                  <Add sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>

              {modelFacades.length > 0 ? (
                <Box display="flex" gap={1.5} overflowX="auto" pb={1}>
                  {modelFacades.map((facade) => {
                    const facadeImages = getFacadeImages(facade);
                    const currentFacadeImage = facadeImages[0];

                    return (
                      <Box
                        key={facade._id}
                        sx={{
                          minWidth: 100,
                          maxWidth: 100,
                          flexShrink: 0,
                          position: 'relative'
                        }}
                      >
                        <Box
                          sx={{
                            width: 100,
                            height: 75,
                            borderRadius: 2,
                            overflow: 'hidden',
                            bgcolor: 'rgba(112, 111, 111, 0.05)',
                            backgroundImage: currentFacadeImage ? `url(${currentFacadeImage})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            mb: 0.8,
                            position: 'relative',
                            border: '2px solid rgba(140, 165, 81, 0.15)',
                            transition: 'all 0.3s',
                            '&:hover': {
                              borderColor: '#8CA551',
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              display: 'flex',
                              gap: 0.5
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditFacade(model, facade);
                              }}
                              sx={{
                                bgcolor: 'rgba(255,255,255,0.95)',
                                width: 20,
                                height: 20,
                                '&:hover': { bgcolor: 'white' }
                              }}
                            >
                              <Edit sx={{ fontSize: 12, color: '#8CA551' }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteFacade(facade._id);
                              }}
                              sx={{
                                bgcolor: 'rgba(255,255,255,0.95)',
                                width: 20,
                                height: 20,
                                '&:hover': { bgcolor: 'white' }
                              }}
                            >
                              <Delete sx={{ fontSize: 12, color: '#E5863C' }} />
                            </IconButton>
                          </Box>
                        </Box>
                        <Typography
                          variant="caption"
                          noWrap
                          fontWeight={700}
                          display="block"
                          sx={{
                            fontFamily: '"Poppins", sans-serif',
                            color: '#333F1F',
                            mb: 0.3
                          }}
                        >
                          {facade.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          sx={{
                            color: '#8CA551',
                            fontFamily: '"Poppins", sans-serif'
                          }}
                        >
                          +${facade.price?.toLocaleString()}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    bgcolor: 'rgba(112, 111, 111, 0.03)',
                    border: '1px dashed rgba(112, 111, 111, 0.2)',
                    borderRadius: 2
                  }}
                >
                  <ImageIcon sx={{ fontSize: 32, color: '#706f6f', opacity: 0.3, mb: 0.5 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#706f6f',
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  >
                    No facades yet
                  </Typography>
                </Paper>
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );
};

ModelCard.propTypes = {
  model: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
    modelNumber: PropTypes.string,
    price: PropTypes.number,
    bedrooms: PropTypes.number,
    bathrooms: PropTypes.number,
    sqft: PropTypes.number,
    stories: PropTypes.number,
    status: PropTypes.string,
    images: PropTypes.shape({
      exterior: PropTypes.arrayOf(PropTypes.string),
      interior: PropTypes.arrayOf(PropTypes.string),
      blueprints: PropTypes.arrayOf(PropTypes.string)
    }),
    balconies: PropTypes.array,
    upgrades: PropTypes.array,
    storages: PropTypes.array
  }).isRequired,
  index: PropTypes.number.isRequired,
  facades: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      price: PropTypes.number,
      url: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
    })
  ),
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onOpenGallery: PropTypes.func.isRequired,
  onGoToDetail: PropTypes.func.isRequired,
  onOpenFacadeDialog: PropTypes.func.isRequired,
  onEditFacade: PropTypes.func.isRequired,
  onDeleteFacade: PropTypes.func.isRequired
};

export default ModelCard;