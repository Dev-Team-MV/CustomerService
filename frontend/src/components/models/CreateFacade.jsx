import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  TextField,
  Grid,
  Button,
  Paper,
  Stack,
  Card,
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  Close,
  Add,
  Edit,
  Delete,
  Image as ImageIcon,
  Deck,
  CheckCircle,
} from '@mui/icons-material';
import uploadService from '../../services/uploadService';

const CreateFacade = ({ 
  open, 
  onClose, 
  selectedModel,
  selectedFacade,
  onSubmit 
}) => {
  const [facadeFormData, setFacadeFormData] = useState({
    model: "",
    title: "",
    url: [],
    price: 0,
    decks: [],
  });

  const [uploadingFacadeImage, setUploadingFacadeImage] = useState(false);
  const [uploadingDeckImages, setUploadingDeckImages] = useState(false);

  // Deck Dialog States
  const [openDeckDialog, setOpenDeckDialog] = useState(false);
  const [editingDeckIndex, setEditingDeckIndex] = useState(null);
  const [deckFormData, setDeckFormData] = useState({
    name: "",
    price: 0,
    description: "",
    images: [],
    status: "active",
  });

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (selectedFacade) {
      const urls = Array.isArray(selectedFacade.url)
        ? selectedFacade.url
        : selectedFacade.url
          ? [selectedFacade.url]
          : [];

      const existingDecks = Array.isArray(selectedFacade.decks) ? selectedFacade.decks : [];

      setFacadeFormData({
        model: selectedFacade.model._id || selectedFacade.model,
        title: selectedFacade.title,
        url: urls,
        price: selectedFacade.price || 0,
        decks: existingDecks,
      });
    } else if (selectedModel) {
      setFacadeFormData({
        model: selectedModel._id,
        title: "",
        url: [],
        price: 0,
        decks: [],
      });
    }
  }, [selectedFacade, selectedModel, open]);

  // ==================== FACADE HANDLERS ====================
  const handleClose = () => {
    setFacadeFormData({
      model: "",
      title: "",
      url: [],
      price: 0,
      decks: [],
    });
    onClose();
  };

  const handleSubmit = async () => {
    if (!facadeFormData.title.trim()) {
      alert("Please enter a facade title");
      return;
    }

    if (facadeFormData.url.length === 0) {
      alert("Please add at least one image URL");
      return;
    }

    if (facadeFormData.price < 0) {
      alert("Price cannot be negative");
      return;
    }

    try {
      await onSubmit(facadeFormData, selectedFacade);
      handleClose();
    } catch (error) {
      console.error("Error saving facade:", error);
      alert(error.response?.data?.message || "Error saving facade");
    }
  };

  const handleRemoveFacadeUrl = (index) => {
    setFacadeFormData({
      ...facadeFormData,
      url: facadeFormData.url.filter((_, i) => i !== index),
    });
  };

  const handleFileFacadeUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingFacadeImage(true);
    try {
      const urls = [];
      for (const file of files) {
        const url = await uploadService.uploadFacadeImage(file);
        urls.push(url);
      }
      setFacadeFormData((prev) => ({
        ...prev,
        url: [...prev.url, ...urls],
      }));
    } catch (err) {
      alert("Error uploading facade image(s)");
    } finally {
      setUploadingFacadeImage(false);
      e.target.value = "";
    }
  };

  // ==================== DECK HANDLERS ====================
  const handleOpenDeckDialog = (index = null) => {
    if (index !== null) {
      const deckToEdit = facadeFormData.decks[index];
      setDeckFormData({
        name: deckToEdit.name,
        price: deckToEdit.price,
        description: deckToEdit.description || "",
        images: Array.isArray(deckToEdit.images) ? deckToEdit.images : [],
        status: deckToEdit.status || "active",
      });
      setEditingDeckIndex(index);
    } else {
      setDeckFormData({
        name: "",
        price: 0,
        description: "",
        images: [],
        status: "active",
      });
      setEditingDeckIndex(null);
    }
    setOpenDeckDialog(true);
  };

  const handleCloseDeckDialog = () => {
    setOpenDeckDialog(false);
    setEditingDeckIndex(null);
  };

  const handleRemoveDeckImageUrl = (index) => {
    setDeckFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitDeck = () => {
    if (!deckFormData.name.trim()) {
      alert("Deck name is required");
      return;
    }

    const newDeck = { ...deckFormData };

    setFacadeFormData((prev) => {
      const updatedDecks = [...prev.decks];
      if (editingDeckIndex !== null) {
        updatedDecks[editingDeckIndex] = newDeck;
      } else {
        updatedDecks.push(newDeck);
      }
      return { ...prev, decks: updatedDecks };
    });

    handleCloseDeckDialog();
  };

  const handleDeleteDeck = (index) => {
    if (window.confirm("Delete this deck option?")) {
      setFacadeFormData((prev) => ({
        ...prev,
        decks: prev.decks.filter((_, i) => i !== index),
      }));
    }
  };

  const handleFileDeckUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingDeckImages(true);
    try {
      const urls = [];
      for (const file of files) {
        const uploader =
          typeof uploadService.uploadDeckImage === "function"
            ? uploadService.uploadDeckImage
            : uploadService.uploadModelImage;
        const url = await uploader(file);
        urls.push(url);
      }
      setDeckFormData((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err) {
      console.error("Error uploading deck image(s):", err);
      alert("Error uploading deck image(s)");
    } finally {
      setUploadingDeckImages(false);
      e.target.value = "";
    }
  };

  return (
    <>
      {/* ==================== FACADE DIALOG ==================== */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        fullScreen={window.innerWidth < 960}
        PaperProps={{
          sx: {
            height: { xs: "100vh", md: "90vh" },
            maxHeight: { xs: "100vh", md: "90vh" },
            m: { xs: 0, md: 2 },
            borderRadius: { xs: 0, md: 4 },
            boxShadow: { xs: 'none', md: '0 20px 60px rgba(51, 63, 31, 0.15)' }
          }
        }}
      >
        {/* ✅ DIALOG TITLE - Brandbook exacto */}
        <DialogTitle sx={{ pb: { xs: 1.5, md: 2 }, px: { xs: 2, md: 3 } }}>
          <Box display="flex" alignItems="center" gap={{ xs: 1.5, md: 2 }}>
            <Box
              sx={{
                width: { xs: 40, md: 48 },
                height: { xs: 40, md: 48 },
                borderRadius: 3,
                bgcolor: '#333F1F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)',
              }}
            >
              <CloudUpload sx={{ color: 'white', fontSize: { xs: 20, md: 24 } }} />
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography 
                variant="h6" 
                fontWeight={700}
                fontSize={{ xs: "1rem", md: "1.25rem" }}
                noWrap
                sx={{ 
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                {selectedFacade ? "Edit Facade" : "Add New Facade"}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#706f6f',
                  fontFamily: '"Poppins", sans-serif',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Manage facade images and deck options
              </Typography>
            </Box>
            <IconButton 
              onClick={handleClose} 
              size="small"
              sx={{
                color: '#706f6f',
                '&:hover': {
                  bgcolor: 'rgba(112, 111, 111, 0.08)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
      
        <DialogContent sx={{ p: 0, overflow: "hidden" }}>
          <Box 
            display="flex" 
            height="100%"
            flexDirection={{ xs: "column", md: "row" }}
          >
            {/* LEFT SIDE - Form */}
            <Box
              sx={{
                width: { xs: "100%", md: "60%" },
                p: { xs: 2, md: 3 },
                overflowY: "auto",
                borderRight: { xs: "none", md: "1px solid #e0e0e0" },
                borderBottom: { xs: "1px solid #e0e0e0", md: "none" },
                maxHeight: { xs: "50vh", md: "100%" },
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(140, 165, 81, 0.3)",
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: "#8CA551"
                  }
                },
              }}
            >
              <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
                {/* Selected Model Info */}
                {selectedModel && (
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 1.5, md: 2 },
                        bgcolor: '#fafafa',
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#706f6f',
                          fontFamily: '"Poppins", sans-serif',
                          display: "block",
                          mb: 0.5
                        }}
                      >
                        Selected Model
                      </Typography>
                      <Typography
                        variant="h6"
                        fontSize={{ xs: "1rem", md: "1.25rem" }}
                        fontWeight={700}
                        noWrap
                        sx={{
                          color: '#333F1F',
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        {selectedModel.model}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontSize={{ xs: "0.75rem", md: "0.875rem" }}
                        sx={{
                          color: '#706f6f',
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        Base Price: ${selectedModel.price?.toLocaleString()} • Model #{selectedModel.modelNumber}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
      
                {/* Facade Title */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Facade Title *"
                    value={facadeFormData.title}
                    onChange={(e) =>
                      setFacadeFormData({
                        ...facadeFormData,
                        title: e.target.value,
                      })
                    }
                    required
                    placeholder="e.g., Modern Colonial"
                    helperText="Give this facade style a descriptive name"
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
                      },
                      "& .MuiFormHelperText-root": {
                        fontFamily: '"Poppins", sans-serif'
                      }
                    }}
                  />
                </Grid>
      
                {/* Decks Section */}
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 1.5, md: 2 },
                      bgcolor: '#fafafa',
                      borderRadius: 2,
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={{ xs: 1.5, md: 2 }}
                    >
                      <Typography 
                        variant="subtitle1" 
                        fontSize={{ xs: "0.9rem", md: "1rem" }} 
                        fontWeight={700}
                        sx={{
                          color: '#333F1F',
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        <Deck sx={{ fontSize: { xs: 16, md: 18 }, mr: 0.5, verticalAlign: "middle" }} />
                        Deck Options
                      </Typography>
                      <Button
                        startIcon={<Add />}
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenDeckDialog()}
                        sx={{
                          fontSize: { xs: "0.75rem", md: "0.875rem" },
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontFamily: '"Poppins", sans-serif',
                          borderColor: 'rgba(140, 165, 81, 0.3)',
                          borderWidth: '2px',
                          color: '#333F1F',
                          '&:hover': {
                            borderColor: '#8CA551',
                            borderWidth: '2px',
                            bgcolor: 'rgba(140, 165, 81, 0.08)'
                          }
                        }}
                      >
                        Add
                      </Button>
                    </Box>
      
                    {facadeFormData.decks.length === 0 ? (
                      <Typography
                        variant="body2"
                        fontSize={{ xs: "0.8rem", md: "0.875rem" }}
                        align="center"
                        sx={{ 
                          py: { xs: 1.5, md: 2 },
                          color: '#706f6f',
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        No decks added yet. Add deck options for this facade.
                      </Typography>
                    ) : (
                      <Stack spacing={{ xs: 1, md: 1.5 }}>
                        {facadeFormData.decks.map((deck, index) => (
                          <Card key={index} variant="outlined" sx={{ borderColor: '#e0e0e0' }}>
                            <Box
                              sx={{
                                p: { xs: 1.5, md: 2 },
                                display: "flex",
                                alignItems: "center",
                                gap: { xs: 1.5, md: 2 },
                              }}
                            >
                              <Box
                                sx={{
                                  width: { xs: 50, md: 60 },
                                  height: { xs: 50, md: 60 },
                                  bgcolor: '#e0e0e0',
                                  borderRadius: 2,
                                  backgroundImage:
                                    deck.images && deck.images.length > 0
                                      ? `url(${deck.images[0]})`
                                      : "none",
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {(!deck.images || deck.images.length === 0) && (
                                  <ImageIcon sx={{ color: '#706f6f', fontSize: { xs: 20, md: 24 } }} />
                                )}
                              </Box>
      
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="subtitle2"
                                  fontSize={{ xs: "0.875rem", md: "1rem" }}
                                  fontWeight={600}
                                  noWrap
                                  sx={{
                                    color: '#333F1F',
                                    fontFamily: '"Poppins", sans-serif'
                                  }}
                                >
                                  {deck.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontSize={{ xs: "0.75rem", md: "0.875rem" }}
                                  sx={{
                                    color: '#706f6f',
                                    fontFamily: '"Poppins", sans-serif'
                                  }}
                                >
                                  Price: ${Number(deck.price).toLocaleString()}
                                </Typography>
                              </Box>
      
                              <Box display="flex" gap={0.5}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDeckDialog(index)}
                                  sx={{ 
                                    width: { xs: 32, md: 36 }, 
                                    height: { xs: 32, md: 36 },
                                    color: '#333F1F',
                                    '&:hover': {
                                      bgcolor: 'rgba(51, 63, 31, 0.08)'
                                    }
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteDeck(index)}
                                  sx={{ 
                                    width: { xs: 32, md: 36 }, 
                                    height: { xs: 32, md: 36 },
                                    color: '#E5863C',
                                    '&:hover': {
                                      bgcolor: 'rgba(229, 134, 60, 0.08)'
                                    }
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </Card>
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Grid>
      
                {/* Upload Section */}
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 1.5, md: 2 },
                      border: "2px dashed",
                      borderColor:
                        facadeFormData.url.length === 0
                          ? '#E5863C'
                          : 'rgba(140, 165, 81, 0.3)',
                      borderRadius: 2,
                      bgcolor:
                        facadeFormData.url.length === 0
                          ? 'rgba(229, 134, 60, 0.05)'
                          : '#fafafa',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontSize={{ xs: "0.875rem", md: "1rem" }}
                      fontWeight={700}
                      gutterBottom
                      sx={{
                        color: '#333F1F',
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    >
                      Facade Images *
                    </Typography>
                    <Button
                      variant="contained"
                      component="label"
                      disabled={uploadingFacadeImage}
                      fullWidth
                      startIcon={<CloudUpload />}
                      sx={{
                        fontSize: { xs: "0.75rem", md: "0.875rem" },
                        borderRadius: 3,
                        bgcolor: '#333F1F',
                        color: 'white',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontFamily: '"Poppins", sans-serif',
                        py: 1.2,
                        boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          bgcolor: '#8CA551',
                          transition: 'left 0.4s ease',
                          zIndex: 0,
                        },
                        '&:hover': {
                          bgcolor: '#333F1F',
                          boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
                          '&::before': {
                            left: 0,
                          },
                        },
                        '&:disabled': {
                          bgcolor: '#e0e0e0',
                          color: '#706f6f',
                          boxShadow: 'none'
                        },
                        '& .MuiButton-startIcon': {
                          position: 'relative',
                          zIndex: 1,
                        }
                      }}
                    >
                      <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
                        {uploadingFacadeImage ? "Uploading..." : "Upload Images"}
                      </Box>
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        multiple
                        onChange={handleFileFacadeUpload}
                      />
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
      
            {/* RIGHT SIDE - Image Preview */}
            <Box
              sx={{
                width: { xs: "100%", md: "40%" },
                display: "flex",
                flexDirection: "column",
                bgcolor: "#fafafa",
                maxHeight: { xs: "50vh", md: "100%" },
                borderLeft: { xs: "none", md: "1px solid #e0e0e0" },
              }}
            >
              <Box sx={{ p: { xs: 1.5, md: 2 }, borderBottom: "1px solid #e0e0e0", bgcolor: "white" }}>
                <Typography 
                  variant="subtitle2" 
                  fontSize={{ xs: "0.875rem", md: "1rem" }} 
                  fontWeight={700}
                  sx={{
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  Images ({facadeFormData.url.length})
                </Typography>
              </Box>
      
              {facadeFormData.url.length > 0 ? (
                <Box
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    p: { xs: 1, md: 2 },
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "rgba(140, 165, 81, 0.3)",
                      borderRadius: "3px",
                      "&:hover": {
                        backgroundColor: "#8CA551"
                      }
                    },
                  }}
                >
                  {facadeFormData.url.map((url, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: "relative",
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <Box
                        component="img"
                        src={url}
                        alt={`Preview ${index + 1}`}
                        sx={{
                          width: "100%",
                          height: { xs: 200, md: 200, lg: 300, xl: 350 },
                          objectFit: "cover",
                        }}
                      />
                      <IconButton
                        onClick={() => handleRemoveFacadeUrl(index)}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "rgba(229, 134, 60, 0.9)",
                          color: 'white',
                          width: { xs: 28, md: 32 },
                          height: { xs: 28, md: 32 },
                          "&:hover": { 
                            bgcolor: '#E5863C',
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                      {index === 0 && (
                        <Chip
                          label="Primary"
                          size="small"
                          sx={{
                            position: "absolute",
                            bottom: 8,
                            left: 8,
                            height: { xs: 20, md: 22 },
                            fontSize: { xs: "0.65rem", md: "0.75rem" },
                            bgcolor: 'rgba(140, 165, 81, 0.9)',
                            color: 'white',
                            fontWeight: 600,
                            fontFamily: '"Poppins", sans-serif',
                            border: '1px solid #8CA551'
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: { xs: 3, md: 4 },
                    m: { xs: 1, md: 2 },
                    bgcolor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                  }}
                >
                  <CloudUpload
                    sx={{ fontSize: { xs: 32, md: 40 }, color: '#706f6f', mb: 1 }}
                  />
                  <Typography 
                    variant="caption" 
                    fontSize={{ xs: "0.75rem", md: "0.875rem" }}
                    sx={{
                      color: '#706f6f',
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  >
                    No images added yet
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        </DialogContent>
      
        {/* ✅ DIALOG ACTIONS - Brandbook exacto */}
        <DialogActions sx={{ px: { xs: 2, md: 3 }, py: { xs: 1.5, md: 2 }, borderTop: "1px solid #e0e0e0", gap: 2 }}>
          <Button
            onClick={handleClose}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.2,
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif',
              border: '2px solid #e0e0e0',
              fontSize: { xs: "0.8rem", md: "0.875rem" },
              '&:hover': {
                bgcolor: 'rgba(112, 111, 111, 0.05)',
                borderColor: '#706f6f'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!facadeFormData.title.trim() || facadeFormData.url.length === 0}
            startIcon={<CheckCircle />}
            sx={{
              borderRadius: 3,
              bgcolor: '#333F1F',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              letterSpacing: '1px',
              fontFamily: '"Poppins", sans-serif',
              px: 4,
              py: 1.5,
              fontSize: { xs: "0.8rem", md: "0.875rem" },
              boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                bgcolor: '#8CA551',
                transition: 'left 0.4s ease',
                zIndex: 0,
              },
              '&:hover': {
                bgcolor: '#333F1F',
                boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
                '&::before': {
                  left: 0,
                },
              },
              '&:disabled': {
                bgcolor: '#e0e0e0',
                color: '#706f6f',
                boxShadow: 'none'
              },
              '& .MuiButton-startIcon': {
                position: 'relative',
                zIndex: 1,
              }
            }}
          >
            <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
              {selectedFacade ? "Update" : "Create"}
            </Box>
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== DECK DIALOG ==================== */}
      <Dialog
        open={openDeckDialog}
        onClose={handleCloseDeckDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(51, 63, 31, 0.15)'
          }
        }}
      >
        {/* ✅ DECK DIALOG TITLE - Brandbook exacto */}
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: '#333F1F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)',
              }}
            >
              <Deck sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                fontWeight={700}
                sx={{
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                {editingDeckIndex !== null ? "Edit Deck Option" : "Add New Deck Option"}
              </Typography>
              <Typography 
                variant="caption"
                sx={{
                  color: '#706f6f',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                Configure deck specifications and pricing
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Deck Name *"
                value={deckFormData.name}
                onChange={(e) =>
                  setDeckFormData({ ...deckFormData, name: e.target.value })
                }
                required
                placeholder="e.g. Standard Deck, Premium Composite"
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
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Price *"
                value={deckFormData.price}
                onChange={(e) =>
                  setDeckFormData({
                    ...deckFormData,
                    price: Number(e.target.value),
                  })
                }
                required
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 0.5, fontSize: "0.875rem", color: '#333F1F', fontWeight: 600 }}>$</Typography>,
                }}
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={deckFormData.description}
                onChange={(e) =>
                  setDeckFormData({
                    ...deckFormData,
                    description: e.target.value,
                  })
                }
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

            {/* Deck Images */}
            <Grid item xs={12}>
              <Typography 
                variant="subtitle2" 
                gutterBottom
                sx={{
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 700,
                  mb: 1.5
                }}
              >
                Deck Images
              </Typography>
              <Button
                variant="outlined"
                component="label"
                disabled={uploadingDeckImages}
                fullWidth
                startIcon={<CloudUpload />}
                sx={{
                  mb: 2,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  borderColor: 'rgba(140, 165, 81, 0.3)',
                  borderWidth: '2px',
                  color: '#333F1F',
                  py: 1.2,
                  '&:hover': {
                    borderColor: '#8CA551',
                    borderWidth: '2px',
                    bgcolor: 'rgba(140, 165, 81, 0.08)'
                  }
                }}
              >
                {uploadingDeckImages ? "Uploading..." : "Upload Deck Images"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  multiple
                  onChange={handleFileDeckUpload}
                />
              </Button>

              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                {deckFormData.images.map((url, index) => (
                  <Box
                    key={index}
                    sx={{ position: "relative", width: 100, height: 100 }}
                  >
                    <Box
                      component="img"
                      src={url}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 2,
                        border: '1px solid #e0e0e0'
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveDeckImageUrl(index)}
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        bgcolor: 'rgba(229, 134, 60, 0.9)',
                        color: 'white',
                        width: 24,
                        height: 24,
                        '&:hover': {
                          bgcolor: '#E5863C',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        {/* ✅ DECK DIALOG ACTIONS - Brandbook exacto */}
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCloseDeckDialog}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.2,
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif',
              border: '2px solid #e0e0e0',
              '&:hover': {
                bgcolor: 'rgba(112, 111, 111, 0.05)',
                borderColor: '#706f6f'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitDeck}
            variant="contained"
            disabled={!deckFormData.name.trim()}
            startIcon={<CheckCircle />}
            sx={{
              borderRadius: 3,
              bgcolor: '#333F1F',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              letterSpacing: '1px',
              fontFamily: '"Poppins", sans-serif',
              px: 4,
              py: 1.5,
              boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                bgcolor: '#8CA551',
                transition: 'left 0.4s ease',
                zIndex: 0,
              },
              '&:hover': {
                bgcolor: '#333F1F',
                boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
                '&::before': {
                  left: 0,
                },
              },
              '&:disabled': {
                bgcolor: '#e0e0e0',
                color: '#706f6f',
                boxShadow: 'none'
              },
              '& .MuiButton-startIcon': {
                position: 'relative',
                zIndex: 1,
              }
            }}
          >
            <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
              Save Deck
            </Box>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateFacade;