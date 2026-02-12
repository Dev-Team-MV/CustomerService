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
            boxShadow: { xs: 'none', md: '0 20px 60px rgba(0,0,0,0.2)' }
          }
        }}
      >
        <DialogTitle sx={{ pb: { xs: 1.5, md: 2 }, px: { xs: 2, md: 3 } }}>
          <Box display="flex" alignItems="center" gap={{ xs: 1.5, md: 2 }}>
            <Box
              sx={{
                width: { xs: 40, md: 48 },
                height: { xs: 40, md: 48 },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CloudUpload sx={{ color: 'white', fontSize: { xs: 20, md: 24 } }} />
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography variant="h6" fontWeight={700} fontSize={{ xs: "1rem", md: "1.25rem" }} noWrap>
                {selectedFacade ? "Edit Facade" : "Add New Facade"}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6c757d', display: { xs: 'none', sm: 'block' } }}>
                Manage facade images and options
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small">
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
                  backgroundColor: "rgba(0,0,0,0.2)",
                  borderRadius: "4px",
                },
              }}
            >
              <Grid container spacing={{ xs: 1.5, md: 2 }}>
                {/* Selected Model Info */}
                {selectedModel && (
                  <Grid item xs={12}>
                    <Paper
                      sx={{
                        p: { xs: 1.5, md: 2 },
                        bgcolor: "primary.50",
                        border: "1px solid",
                        borderColor: "primary.200",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        gutterBottom
                      >
                        Selected Model
                      </Typography>
                      <Typography
                        variant="h6"
                        fontSize={{ xs: "1rem", md: "1.25rem" }}
                        fontWeight="bold"
                        color="primary"
                        noWrap
                      >
                        {selectedModel.model}
                      </Typography>
                      <Typography variant="body2" fontSize={{ xs: "0.75rem", md: "0.875rem" }} color="text.secondary">
                        Base Price: ${selectedModel.price?.toLocaleString()} • Model #{selectedModel.modelNumber}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
      
                {/* Facade Title */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
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
                    sx={{ "& .MuiInputBase-root": { fontSize: { xs: "0.875rem", md: "1rem" } } }}
                  />
                </Grid>
      
                {/* Decks Section */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: { xs: 1.5, md: 2 },
                      bgcolor: "background.paper",
                      borderRadius: 1,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={{ xs: 1.5, md: 2 }}
                    >
                      <Typography variant="subtitle1" fontSize={{ xs: "0.9rem", md: "1rem" }} fontWeight="bold">
                        <Deck sx={{ fontSize: { xs: 16, md: 18 }, mr: 0.5, verticalAlign: "middle" }} />
                        Decks Options
                      </Typography>
                      <Button
                        startIcon={<Add />}
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenDeckDialog()}
                        sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
                      >
                        Add
                      </Button>
                    </Box>
      
                    {facadeFormData.decks.length === 0 ? (
                      <Typography
                        variant="body2"
                        fontSize={{ xs: "0.8rem", md: "0.875rem" }}
                        color="text.secondary"
                        align="center"
                        sx={{ py: { xs: 1.5, md: 2 } }}
                      >
                        No decks added yet. Add deck options for this facade.
                      </Typography>
                    ) : (
                      <Stack spacing={{ xs: 1, md: 1.5 }}>
                        {facadeFormData.decks.map((deck, index) => (
                          <Card key={index} variant="outlined">
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
                                  bgcolor: "grey.200",
                                  borderRadius: 1,
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
                                  <ImageIcon sx={{ color: "grey.400", fontSize: { xs: 20, md: 24 } }} />
                                )}
                              </Box>
      
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="subtitle2"
                                  fontSize={{ xs: "0.875rem", md: "1rem" }}
                                  fontWeight="bold"
                                  noWrap
                                >
                                  {deck.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontSize={{ xs: "0.75rem", md: "0.875rem" }}
                                  color="text.secondary"
                                >
                                  Price: ${Number(deck.price).toLocaleString()}
                                </Typography>
                              </Box>
      
                              <Box display="flex" gap={0.5}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDeckDialog(index)}
                                  sx={{ width: { xs: 32, md: 36 }, height: { xs: 32, md: 36 } }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteDeck(index)}
                                  sx={{ width: { xs: 32, md: 36 }, height: { xs: 32, md: 36 } }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </Card>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Grid>
      
                {/* Upload Section */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: { xs: 1.5, md: 2 },
                      border: "2px dashed",
                      borderColor:
                        facadeFormData.url.length === 0
                          ? "error.main"
                          : "grey.300",
                      borderRadius: 2,
                      bgcolor:
                        facadeFormData.url.length === 0
                          ? "error.50"
                          : "grey.50",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontSize={{ xs: "0.875rem", md: "1rem" }}
                      fontWeight="bold"
                      gutterBottom
                    >
                      Facade Images *
                    </Typography>
                    <Button
                      variant="contained"
                      component="label"
                      disabled={uploadingFacadeImage}
                      size="small"
                      fullWidth
                      startIcon={<CloudUpload />}
                      sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
                    >
                      {uploadingFacadeImage ? "Uploading..." : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        multiple
                        onChange={handleFileFacadeUpload}
                      />
                    </Button>
                  </Box>
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
                <Typography variant="subtitle2" fontSize={{ xs: "0.875rem", md: "1rem" }} fontWeight="bold">
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
                      backgroundColor: "rgba(0,0,0,0.2)",
                      borderRadius: "3px",
                    },
                  }}
                >
                  {facadeFormData.url.map((url, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: "relative",
                        borderRadius: 1,
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
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(255,255,255,0.9)",
                          width: { xs: 24, md: 28 },
                          height: { xs: 24, md: 28 },
                          "&:hover": { bgcolor: "rgba(255,255,255,1)" }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                      {index === 0 && (
                        <Chip
                          label="Primary"
                          size="small"
                          color="primary"
                          sx={{
                            position: "absolute",
                            bottom: 4,
                            left: 4,
                            height: { xs: 18, md: 20 },
                            fontSize: { xs: "0.65rem", md: "0.7rem" },
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Paper
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: { xs: 3, md: 4 },
                    m: { xs: 1, md: 2 },
                    bgcolor: "grey.50",
                  }}
                >
                  <CloudUpload
                    sx={{ fontSize: { xs: 32, md: 40 }, color: "grey.400", mb: 1 }}
                  />
                  <Typography variant="caption" fontSize={{ xs: "0.75rem", md: "0.875rem" }} color="text.secondary">
                    No images added yet
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        </DialogContent>
      
        <DialogActions sx={{ px: { xs: 2, md: 3 }, py: { xs: 1.5, md: 2 }, borderTop: "1px solid #e0e0e0", gap: 1 }}>
          <Button
            onClick={handleClose}
            size="small"
            variant="outlined"
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: { xs: 2, md: 3 },
              fontSize: { xs: "0.8rem", md: "0.875rem" }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!facadeFormData.title.trim() || facadeFormData.url.length === 0}
            size="small"
            sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
              color: 'white',
              fontWeight: 700,
              textTransform: 'none',
              px: { xs: 3, md: 4 },
              py: { xs: 1, md: 1.5 },
              fontSize: { xs: "0.8rem", md: "0.875rem" },
              boxShadow: '0 8px 20px rgba(74, 124, 89, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3d664a 0%, #7ba843 100%)',
                boxShadow: '0 12px 28px rgba(74, 124, 89, 0.4)'
              },
              '&:disabled': {
                background: '#ccc'
              }
            }}
          >
            {selectedFacade ? "Update" : "Create"}
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
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CloudUpload sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              {editingDeckIndex !== null ? "Edit Deck Option" : "Add New Deck Option"}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Deck Name"
                value={deckFormData.name}
                onChange={(e) =>
                  setDeckFormData({ ...deckFormData, name: e.target.value })
                }
                required
                placeholder="e.g. Standard Deck, Premium Composite"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Price"
                value={deckFormData.price}
                onChange={(e) =>
                  setDeckFormData({
                    ...deckFormData,
                    price: Number(e.target.value),
                  })
                }
                required
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
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
              />
            </Grid>

            {/* Deck Images */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Deck Images
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={uploadingDeckImages}
                  startIcon={<CloudUpload />}
                >
                  {uploadingDeckImages ? "Uploading..." : "Upload Files"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    multiple
                    onChange={handleFileDeckUpload}
                  />
                </Button>
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
                        borderRadius: 1,
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveDeckImageUrl(index)}
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bgcolor: "rgba(255,255,255,0.8)",
                        p: 0.5,
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
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCloseDeckDialog}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitDeck}
            variant="contained"
            sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
              color: 'white',
              fontWeight: 700,
              textTransform: 'none',
              px: 4,
              py: 1.5,
              boxShadow: '0 8px 20px rgba(74, 124, 89, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3d664a 0%, #7ba843 100%)',
                boxShadow: '0 12px 28px rgba(74, 124, 89, 0.4)'
              },
              '&:disabled': {
                background: '#ccc'
              }
            }}
          >
            Save Deck
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateFacade;