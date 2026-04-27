import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Container,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import { PhotoLibrary, Map, Layers, MeetingRoom } from "@mui/icons-material";
import ClubhouseImagesModal from "../components/ClubHouse/ClubImagesModal";
import uploadService from "../services/uploadService";
import PageHeader from '@shared/components/PageHeader'

import { useTranslation } from "react-i18next";
import Loader from "../components/Loader";

const ClubhouseManager = () => {
  const { t } = useTranslation(["clubhouse", "common"]);
  const [modalOpen, setModalOpen] = useState(false);
  const [images, setImages] = useState({
    exterior: [],
    blueprints: [],
    interior: {},
  });
  const [interiorKeys, setInteriorKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);

  // ...existing code...
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (images, index = 0) => {
    setLightboxImages(images || []);
    setLightboxIndex(index || 0);
    setLightboxOpen(true);
  };
  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImages([]);
    setLightboxIndex(0);
  };
  const showPrev = () => setLightboxIndex((i) => Math.max(0, i - 1));
  const showNext = () =>
    setLightboxIndex((i) => Math.min(lightboxImages.length - 1, i + 1));

  useEffect(() => {
    loadData();
  }, []);

  const getImageObj = (file) => ({
    url: file?.url || file?.publicUrl || file?.path || file?.name || "",
    isPublic: file?.isPublic ?? true,
    name: file?.name,
    section: file?.section,
    interiorKey: file?.interiorKey,
    // agrega otros campos si los necesitas
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // interior keys
      const keysResponse = await uploadService.getClubhouseInteriorKeys();
      const keys = keysResponse?.interiorKeys || [];
      setInteriorKeys(keys);

      // listado general
      const filesResponse = await uploadService.getFilesByFolder(
        "clubhouse",
        true,
      );

      const organized = {
        exterior: [],
        blueprints: [],
        interior: {},
        deck: [],
      };
      keys.forEach((k) => (organized.interior[k] = []));

      if (filesResponse?.files && filesResponse.files.length > 0) {
        filesResponse.files.forEach((file) => {
          const section = file.section || file.folder || "";
          const interiorKey = file.interiorKey || file.key || "";
          const imageObj = getImageObj(file);

          if (section === "exterior") organized.exterior.push(imageObj);
          else if (section === "blueprints")
            organized.blueprints.push(imageObj);
          else if (section === "interior" && interiorKey) {
            const matchingKey = keys.find(
              (k) => k.toLowerCase() === String(interiorKey).toLowerCase(),
            );
            if (matchingKey) organized.interior[matchingKey].push(imageObj);
            else {
              if (!organized.interior[interiorKey])
                organized.interior[interiorKey] = [];
              organized.interior[interiorKey].push(imageObj);
              console.warn(
                "Unknown interior key while loading data:",
                interiorKey,
              );
            }
          } else if (section === "deck") organized.deck.push(imageObj);
          // No agregar a exterior cuando section es null (evita que imágenes de interior aparezcan en exterior)
        });
      }

      // Solo pedir deck por endpoint específico si no vino en el listado principal
      if (organized.deck.length === 0) {
        let deckResponse = { files: [] };
        try {
          deckResponse = await uploadService.getDeckFiles(true);
        } catch (e) {
          try {
            deckResponse = await uploadService.getClubhouseDeckFiles(true);
          } catch (e2) {
            console.warn(
              "No deck specific listing available:",
              e2?.message || e2,
            );
          }
        }

        if (deckResponse?.files && deckResponse.files.length > 0) {
          deckResponse.files.forEach((file) => {
            const imageObj = getImageObj(file);
            if (!organized.deck.some((img) => img.url === imageObj.url)) {
              organized.deck.push(imageObj);
            }
          });
        }
      }

      setImages(organized);
    } catch (err) {
      console.error("❌ Error loading clubhouse data:", err);
      setError(err?.message || "Failed to load clubhouse images");
    } finally {
      setLoading(false);
    }
  };
  const handleModalClose = () => {
    setModalOpen(false);
    loadData();
  };

  const handleImagesUploaded = () => {
    loadData();
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh' }}>
        <Loader 
          size="large" 
          message={t('loading')} 
          fullHeight 
        />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="xl">
        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Header */}
        <PageHeader
          icon={PhotoLibrary}
          title={t("clubHouse:title")}
          subtitle={t("clubHouse:subtitle")}
          actionButton={{
            label: t("clubHouse:manageImages"),
            onClick: () => setModalOpen(true),
            icon: <PhotoLibrary />,
            tooltip: t("clubHouse:manageImagesTooltip"),
          }}
        />

        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 3,
            border: "1px solid rgba(0, 0, 0, 0.06)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            background: "white",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                py: 2,
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
                color: "#6c757d",
                "&.Mui-selected": {
                  color: "#4a7c59",
                },
                "&:hover": {
                  bgcolor: "rgba(74, 124, 89, 0.05)",
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "4px 4px 0 0",
                bgcolor: "#4a7c59",
              },
            }}
          >
            <Tab label={t("clubHouse:tabs.exterior")} />
            <Tab label={t("clubHouse:tabs.plans")} />
            <Tab label={t("clubHouse:tabs.interior")} />
            <Tab label={t("clubHouse:tabs.deck")} />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid rgba(0, 0, 0, 0.06)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            background: "white",
            p: 3,
            minHeight: 300,
          }}
        >
          {tab === 0 && (
            <Grid container spacing={2}>
              {images.exterior.length === 0 ? (
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "grey.100",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {t("clubHouse:noImagesUploaded")}
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                images.exterior.map((img, idx) => (
                  <Grid item xs={6} md={4} key={idx}>
                    <Box sx={{ position: "relative" }}>
                      <Box
                        component="img"
                        src={typeof img === "string" ? img : img.url}
                        alt={`Exterior ${idx + 1}`}
                        sx={{
                          width: "100%",
                          height: "250px",
                          objectFit: "contain",
                          borderRadius: 2,
                          boxShadow: "0 2px 8px rgba(140, 165, 81, 0.08)",
                        }}
                      />
                      {typeof img === "object" && img.isPublic && (
                        <Chip
                          label="Public"
                          color="success"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            bgcolor: "#4caf50",
                            color: "white",
                            fontWeight: 700,
                            fontFamily: '"Poppins", sans-serif',
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {tab === 1 && (
            <Grid container spacing={2}>
              {images.blueprints.length === 0 ? (
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "grey.100",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {t("clubHouse:noPlansUploaded")}
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                images.blueprints.map((img, idx) => (
                  <Grid item xs={6} md={4} key={idx}>
                    <Box sx={{ position: "relative" }}>
                      <Box
                        component="img"
                        src={typeof img === "string" ? img : img.url}
                        alt={`Blueprint ${idx + 1}`}
                        sx={{
                          width: "100%",
                          height: "250px",
                          objectFit: "contain",
                          borderRadius: 2,
                          boxShadow: "0 2px 8px rgba(140, 165, 81, 0.08)",
                        }}
                      />
                      {typeof img === "object" && img.isPublic && (
                        <Chip
                          label="Public"
                          color="success"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            bgcolor: "#4caf50",
                            color: "white",
                            fontWeight: 700,
                            fontFamily: '"Poppins", sans-serif',
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {tab === 2 && (
            // Interior by Section (preview per section + lightbox)
            <Grid container spacing={2}>
              {interiorKeys.length === 0 ? (
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "grey.100",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {t("clubHouse:noSectionsConfigured")}
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                interiorKeys.map((section) => {
                  const imgs = images.interior?.[section] || [];
                  const total = imgs.length;
                  const preview = imgs.slice(0, 3);
                  return (
                    <Grid item xs={12} md={6} lg={4} key={section}>
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          height: "100%",
                          bgcolor: "#f8fafc",
                        }}
                      >
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: "#706f6f",
                              fontFamily: '"Poppins", sans-serif',
                              fontWeight: 600,
                            }}
                          >
                            {section}
                          </Typography>
                          {total > 0 && (
                            <Button
                              size="small"
                              onClick={() => openLightbox(imgs, 0)}
                              sx={{ textTransform: "none" }}
                            >
                              {t("clubHouse:viewAll")} ({total})
                            </Button>
                          )}
                        </Box>

                        {total === 0 ? (
                          <Paper
                            sx={{
                              p: 1,
                              textAlign: "center",
                              bgcolor: "grey.100",
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {t("clubHouse:noImages")}
                            </Typography>
                          </Paper>
                        ) : (
                          <Grid container spacing={1}>
                            {preview.map((img, idx) => (
                              <Grid item xs={4} key={idx}>
                                <Box sx={{ position: "relative" }}>
                                  <Box
                                    onClick={() => openLightbox(imgs, idx)}
                                    component="img"
                                    src={
                                      typeof img === "string"
                                        ? img
                                        : img.url || img
                                    }
                                    alt={`${section} ${idx + 1}`}
                                    sx={{
                                      width: "100%",
                                      height: 120,
                                      objectFit: "cover",
                                      borderRadius: 1,
                                      cursor: "pointer",
                                      display: "block",
                                    }}
                                  />
                                  {typeof img === "object" && img.isPublic && (
                                    <Chip
                                      label="Public"
                                      color="success"
                                      size="small"
                                      sx={{
                                        position: "absolute",
                                        top: 8,
                                        left: 8,
                                        bgcolor: "#4caf50",
                                        color: "white",
                                        fontWeight: 700,
                                        fontFamily: '"Poppins", sans-serif',
                                      }}
                                    />
                                  )}
                                </Box>
                              </Grid>
                            ))}

                            {total > 3 && (
                              <Grid item xs={12}>
                                <Box
                                  onClick={() => openLightbox(imgs, 3)}
                                  sx={{
                                    position: "relative",
                                    width: "100%",
                                    height: 120,
                                    borderRadius: 1,
                                    overflow: "hidden",
                                    cursor: "pointer",
                                  }}
                                >
                                  <Box
                                    component="img"
                                    src={
                                      typeof imgs[3] === "string"
                                        ? imgs[3]
                                        : imgs[3]?.url || imgs[3]
                                    }
                                    alt={`${section} more`}
                                    sx={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      filter: "blur(2px) brightness(0.6)",
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      inset: 0,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "white",
                                      fontWeight: 700,
                                      fontSize: "1rem",
                                    }}
                                  >
                                    +{total - 3} more
                                  </Box>
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                        )}
                      </Paper>
                    </Grid>
                  );
                })
              )}
            </Grid>
          )}
          {tab === 3 && (
            <Grid container spacing={2}>
              {(images.deck || []).length === 0 ? (
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "grey.100",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {t("clubHouse:noImagesUploaded")}
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                (images.deck || []).map((img, idx) => (
                  <Grid item xs={6} md={4} key={idx}>
                    <Box sx={{ position: "relative" }}>
                      <Box
                        onClick={() => openLightbox(images.deck, idx)}
                        component="img"
                        src={typeof img === "string" ? img : img.url || img}
                        alt={`Deck ${idx + 1}`}
                        sx={{
                          width: "100%",
                          height: "250px",
                          objectFit: "contain",
                          borderRadius: 2,
                          boxShadow: "0 2px 8px rgba(140, 165, 81, 0.08)",
                          cursor: "pointer",
                        }}
                      />
                      {typeof img === "object" && img.isPublic && (
                        <Chip
                          label="Public"
                          color="success"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            bgcolor: "#4caf50",
                            color: "white",
                            fontWeight: 700,
                            fontFamily: '"Poppins", sans-serif',
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                ))
              )}
            </Grid>
          )}
          {/* Lightbox Dialog (simple) */}
          <Dialog
            open={lightboxOpen}
            onClose={closeLightbox}
            maxWidth="xl"
            fullWidth
          >
            <DialogContent
              sx={{
                bgcolor: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 400,
              }}
            >
              {lightboxImages.length > 0 ? (
                <Box
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  <IconButton
                    onClick={showPrev}
                    disabled={lightboxIndex <= 0}
                    sx={{
                      position: "absolute",
                      left: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "white",
                    }}
                  >
                    ‹
                  </IconButton>
                  <Box
                    component="img"
                    src={
                      typeof lightboxImages[lightboxIndex] === "string"
                        ? lightboxImages[lightboxIndex]
                        : lightboxImages[lightboxIndex]?.url ||
                          lightboxImages[lightboxIndex]
                    }
                    alt={`Image ${lightboxIndex + 1}`}
                    sx={{
                      maxHeight: "70vh",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                  />
                  <IconButton
                    onClick={showNext}
                    disabled={lightboxIndex >= lightboxImages.length - 1}
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "white",
                    }}
                  >
                    ›
                  </IconButton>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.8)",
                      display: "block",
                      mt: 1,
                    }}
                  >{`${lightboxIndex + 1} / ${lightboxImages.length}`}</Typography>
                </Box>
              ) : (
                <Typography sx={{ color: "white" }}>No images</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeLightbox}>
                {t("common:close") || "Close"}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>

        <ClubhouseImagesModal
          open={modalOpen}
          onClose={handleModalClose}
          onImagesUploaded={handleImagesUploaded}
          images={images} // <-- asegúrate de pasar esto
          interiorKeys={interiorKeys} // <-- si tu modal lo necesita
        />
      </Container>
    </Box>
  );
};

export default ClubhouseManager;
