import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Grid,
  Paper,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
  Slide,
  Fade,
  Button,
} from "@mui/material";
import {
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  KingBed,
  Bathtub,
  SquareFoot,
  AttachMoney,
  Home,
  Landscape,
  Kitchen,
  Garage,
  Pool,
  Deck,
} from "@mui/icons-material";

import api from "../services/api";
import ModelCustomizationPanel from "../components/ModelCustomizationPanel";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import { motion, useScroll, useTransform } from "framer-motion";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const ModelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCustomization, setShowCustomization] = useState(false);
  const [blueprintSlide, setBlueprintSlide] = useState(0);

  // Exterior (fachada) carousel
  const [exteriorSlide, setExteriorSlide] = useState(0);
  const [exteriorTouchStart, setExteriorTouchStart] = useState(0);
  const [exteriorTouchEnd, setExteriorTouchEnd] = useState(0);
  const exteriorRef = useRef(null);

  // Interior carousel
  const [interiorSlide, setInteriorSlide] = useState(0);
  const [interiorTouchStart, setInteriorTouchStart] = useState(0);
  const [interiorTouchEnd, setInteriorTouchEnd] = useState(0);
  const interiorRef = useRef(null);

  const [interiorType, setInteriorType] = useState("basic");
  const [blueprintType, setBlueprintType] = useState("withoutBalcony");
  // Filtra imágenes según el tipo seleccionado
  let filteredInteriorImages = [];
  if (model) {
    if (interiorType === "basic") {
      filteredInteriorImages = Array.isArray(model.images?.interior)
        ? model.images.interior
            .map((img) => (typeof img === "string" ? { url: img } : img))
            .filter((img) => img && img.url && img.url.trim() !== "")
        : [];
    } else {
      // Extrae todas las imágenes de interior de todos los upgrades
      filteredInteriorImages = Array.isArray(model.upgrades)
        ? model.upgrades.flatMap((upg) =>
            Array.isArray(upg.images?.interior)
              ? upg.images.interior
                  .map((img) => (typeof img === "string" ? { url: img } : img))
                  .filter((img) => img && img.url && img.url.trim() !== "")
              : [],
          )
        : [];
    }
  }

  let filteredBlueprints = [];
  if (model) {
    filteredBlueprints =
      blueprintType === "balcony"
        ? model.blueprints?.withBalcony || []
        : model.blueprints?.default || [];
  }

    // ✅ CONSTANTE PARA IDENTIFICAR EL MODELO 10
  const MODEL_10_ID = "6977c7bbd1f24768968719de";
  const isModel10 = model?._id === MODEL_10_ID;

  // ✅ LABELS CONDICIONALES PARA BLUEPRINTS
  const blueprintLabels = isModel10
    ? {
        without: "With Comedor",
        with: "With Estudio",
        withoutIcon: Kitchen,
        withIcon: Home,
      }
    : {
        without: "Without Balcony",
        with: "Balcony",
        withoutIcon: Home,
        withIcon: Deck,
      };

  const principalRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: principalRef,
    offset: ["end end", "start start"], // Cuando el final del principal llega al final del viewport, y cuando el inicio llega al inicio
  });
  // y: de 60px (abajo, oculto) a 0px (centrado)
  // opacity: de 0 (invisible) a 1 (visible)
  const y = useTransform(scrollYProgress, [0, 0.2], [60, 0]);
  const opacity = useTransform(scrollYProgress, [0.1, 0.085, 0.095], [0, 1]);
  useEffect(() => {
    fetchModel();
    setExteriorSlide(0);
    setInteriorSlide(0);
  }, [id]);

  const fetchModel = async () => {
    try {
      const response = await api.get(`/models/${id}`);
      setModel(response.data);
    } catch (error) {
      console.error("Error fetching model:", error);
    } finally {
      setLoading(false);
    }
  };

  let exteriorImages = [];
  let interiorImages = [];

  if (model) {
    const extractImagesFromOptions = (options, type) =>
      Array.isArray(options)
        ? options.flatMap((opt) =>
            Array.isArray(opt.images?.[type])
              ? opt.images[type]
                  .map((img) => (typeof img === "string" ? { url: img } : img))
                  .filter((img) => img && img.url && img.url.trim() !== "")
              : [],
          )
        : [];

    exteriorImages = Array.isArray(model.images?.exterior)
      ? model.images.exterior
          .map((img) => (typeof img === "string" ? { url: img } : img))
          .filter((img) => img && img.url && img.url.trim() !== "")
      : [];

    interiorImages = Array.isArray(model.images?.interior)
      ? model.images.interior
          .map((img) => (typeof img === "string" ? { url: img } : img))
          .filter((img) => img && img.url && img.url.trim() !== "")
      : [];

    if (exteriorImages.length === 0) {
      exteriorImages = [
        ...extractImagesFromOptions(model.upgrades, "exterior"),
        ...extractImagesFromOptions(model.storages, "exterior"),
        ...extractImagesFromOptions(model.balconies, "exterior"),
      ];
    }
    if (interiorImages.length === 0) {
      interiorImages = [
        ...extractImagesFromOptions(model.upgrades, "interior"),
        ...extractImagesFromOptions(model.storages, "interior"),
        ...extractImagesFromOptions(model.balconies, "interior"),
      ];
    }
  }

  // Carrusel exterior
  const nextExterior = () => {
    if (exteriorImages.length > 0) {
      setExteriorSlide((prev) => (prev + 1) % exteriorImages.length);
    }
  };
  const prevExterior = () => {
    if (exteriorImages.length > 0) {
      setExteriorSlide(
        (prev) => (prev - 1 + exteriorImages.length) % exteriorImages.length,
      );
    }
  };
  const goToExterior = (idx) => setExteriorSlide(idx);
  const handleExteriorTouchStart = (e) =>
    setExteriorTouchStart(e.targetTouches[0].clientX);
  const handleExteriorTouchMove = (e) =>
    setExteriorTouchEnd(e.targetTouches[0].clientX);
  const handleExteriorTouchEnd = () => {
    if (exteriorTouchStart - exteriorTouchEnd > 75) nextExterior();
    if (exteriorTouchStart - exteriorTouchEnd < -75) prevExterior();
  };

  // Carrusel interior
  const nextInterior = () => {
    if (interiorImages.length > 0) {
      setInteriorSlide((prev) => (prev + 1) % interiorImages.length);
    }
  };
  const prevInterior = () => {
    if (interiorImages.length > 0) {
      setInteriorSlide(
        (prev) => (prev - 1 + interiorImages.length) % interiorImages.length,
      );
    }
  };
  const goToInterior = (idx) => setInteriorSlide(idx);
  const handleInteriorTouchStart = (e) =>
    setInteriorTouchStart(e.targetTouches[0].clientX);
  const handleInteriorTouchMove = (e) =>
    setInteriorTouchEnd(e.targetTouches[0].clientX);
  const handleInteriorTouchEnd = () => {
    if (interiorTouchStart - interiorTouchEnd > 75) nextInterior();
    if (interiorTouchStart - interiorTouchEnd < -75) prevInterior();
  };

  // Características (features)
  const features =
    Array.isArray(model?.features) && model.features.length > 0
      ? model.features
      : [];

  const getIconForFeature = (title) => {
    const lowerTitle = title?.toLowerCase() || "";
    if (lowerTitle.includes("cocina") || lowerTitle.includes("kitchen"))
      return <Kitchen sx={{ fontSize: 40 }} />;
    if (lowerTitle.includes("garaje") || lowerTitle.includes("garage"))
      return <Garage sx={{ fontSize: 40 }} />;
    if (lowerTitle.includes("piscina") || lowerTitle.includes("pool"))
      return <Pool sx={{ fontSize: 40 }} />;
    if (lowerTitle.includes("terraza") || lowerTitle.includes("deck"))
      return <Deck sx={{ fontSize: 40 }} />;
    if (lowerTitle.includes("jardín") || lowerTitle.includes("garden"))
      return <Landscape sx={{ fontSize: 40 }} />;
    return <Home sx={{ fontSize: 40 }} />;
  };

  if (loading) {
    return (
      <Box sx={{ mb: 4 }}>
        {/* Header Image Skeleton */}
        <Skeleton 
          variant="rectangular" 
          height={{ xs: 300, sm: 400, md: 450, lg:700 }}
          sx={{ 
            width: '100%',
            mb: 4,
            borderRadius: { xs: 0, md: 4 }
          }} 
        />
  
        {/* Specifications Section Skeleton */}
        <Box sx={{ p: { xs: 2, sm: 2, md: 3, lg: 4 } }}>
          {/* Buttons Skeleton */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            <Skeleton variant="rounded" width={180} height={42} />
            <Skeleton variant="rounded" width={150} height={42} />
          </Box>
  
          {/* Main Paper Skeleton */}
          <Box
            sx={{
              borderRadius: 4,
              p: { xs: 2, md: 3 },
              border: '1px solid rgba(0,0,0,0.08)',
              mb: 3
            }}
          >
            <Grid container spacing={3}>
              {/* Left Column: Stats */}
              <Grid item xs={12} md={6}>
                {/* Price & Sqft */}
                <Box sx={{ display: 'flex', gap: 4, mb: 3, justifyContent: 'center' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Skeleton variant="text" width={140} height={60} />
                    <Skeleton variant="text" width={80} height={24} />
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Skeleton variant="text" width={120} height={60} />
                    <Skeleton variant="text" width={60} height={24} />
                  </Box>
                </Box>
  
                {/* Bedrooms, Bathrooms, Stories */}
                <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', mb: 2 }}>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ textAlign: 'center' }}>
                      <Skeleton variant="circular" width={40} height={40} sx={{ mx: 'auto', mb: 1 }} />
                      <Skeleton variant="text" width={50} height={40} sx={{ mx: 'auto' }} />
                      <Skeleton variant="text" width={70} height={20} sx={{ mx: 'auto' }} />
                    </Box>
                  ))}
                </Box>
  
                {/* Chips */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rounded" width={120} height={32} />
                  ))}
                </Box>
              </Grid>
  
              {/* Right Column: Blueprint */}
              <Grid item xs={12} md={6}>
                <Skeleton variant="text" width={100} height={28} sx={{ mb: 1 }} />
                <Skeleton 
                  variant="rounded" 
                  height={{ xs: 220, md: 340 }}
                  sx={{ borderRadius: 3 }}
                />
              </Grid>
            </Grid>
          </Box>
  
          {/* Principal Image Skeleton */}
          <Skeleton 
            variant="rounded" 
            sx={{
              width: { xs: '100%', md: '90%' },
              height: { xs: 250, sm: 350, md: 450 },
              mx: 'auto',
              mt: 6,
              mb: 6,
              borderRadius: 4
            }}
          />
  
          {/* Interior Section Skeleton */}
          <Box sx={{ position: 'relative', height: 500, mt: 10 }}>
            {/* Buttons Skeleton */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'absolute', left: '10%', top: '20%' }}>
              <Skeleton variant="rounded" width={120} height={40} />
              <Skeleton variant="rounded" width={120} height={40} />
              <Skeleton variant="rectangular" width={220} height={80} sx={{ mt: 2, borderRadius: 2 }} />
            </Box>
  
            {/* Interior Image Skeleton */}
            <Skeleton 
              variant="rounded" 
              sx={{
                position: { xs: 'static', lg: 'absolute' },
                right: { lg: '10%' },
                top: { lg: '50%' },
                transform: { lg: 'translateY(-50%)' },
                width: { xs: '100%', lg: 600 },
                height: { xs: 220, sm: 340, md: 480, lg: 700 },
                borderRadius: 5,
                mt: { xs: 4, lg: 0 }
              }}
            />
          </Box>
  
          {/* Customize Button Skeleton */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <Skeleton variant="rounded" width={260} height={56} sx={{ borderRadius: 3 }} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (!model) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5">Model not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Carrusel Exterior */}
      <MotionBox
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: 300, sm: 400, md: 450, lg: 500 },
          bgcolor: theme.palette.background.default,
          boxShadow: { xs: 0, md: 4 },
          overflow: "hidden",
          mb: 4,
          transition: "box-shadow 0.4s cubic-bezier(.4,0,.2,1), background 0.4s",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            bgcolor: theme.palette.background.default,
            boxShadow: { xs: 0, md: 4 },
            overflow: "hidden",
            mb: 4,
            transition: "box-shadow 0.4s cubic-bezier(.4,0,.2,1), background 0.4s",
          }}
        >
          {/* Video Player */}
          {/* <Box
            component="iframe"
            src="https://www.youtube.com/watch?v=Zgdg2lwQ-Cw"
            sx={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
            }}
            allow="autoplay; fullscreen"
            title="Model Video Presentation"
          /> */}
                    <Box
                      component="iframe"
                      src="https://www.youtube.com/embed/Zgdg2lwQ-Cw?autoplay=1&mute=1&loop=1&playlist=Zgdg2lwQ-Cw&controls=0&modestbranding=1"
                      sx={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title="Model Video Presentation"
                    />
      
          {/* Overlay opcional con información */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              opacity: 0,
              transition: "opacity 0.3s",
              "&:hover": {
                opacity: 1,
              },
            }}
          >
            <Typography variant="body2" color="white" fontWeight={600}>
              {model.model} - Model #{model.modelNumber}
            </Typography>
            <Chip 
              label="Video Tour" 
              size="small" 
              sx={{ 
                bgcolor: "primary.main", 
                color: "white",
                fontWeight: 600 
              }} 
            />
          </Box>
        </Box>
      </MotionBox>

      <MotionBox
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        sx={{ p: { xs: 2, sm: 2, md: 3, lg: 4 } }}
      >
        {/* Especificaciones */}
        <Box sx={{ p: { xs: 2, sm: 2, md: 3, lg: 4 } }}>
          <Box
            sx={{
              display: "flex",
              margin: "0 auto",
              gap: 2,
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Button
              variant={
                blueprintType === "withoutBalcony" ? "contained" : "outlined"
              }
              color="primary"
              onClick={() => setBlueprintType("withoutBalcony")}
              startIcon={<blueprintLabels.withoutIcon />}
            >
              {blueprintLabels.without}
            </Button>
            <Button
              variant={blueprintType === "balcony" ? "contained" : "outlined"}
              color="primary"
              onClick={() => setBlueprintType("balcony")}
              startIcon={<blueprintLabels.withIcon />}
            >
              {blueprintLabels.with}
            </Button>
          </Box>

          <MotionPaper
            elevation={3}
            sx={{
              mt: 3,
              mb: 3,
              borderRadius: 4,
              p: { xs: 2, md: 3 },
              bgcolor: "background.paper",
              boxShadow: "0 8px 32px 0 rgba(74,124,89,0.10)",
              transition:
                "box-shadow 0.4s cubic-bezier(.4,0,.2,1), background 0.4s",
            }}
          >
            <Grid container spacing={3}>
              {/* LEFT COLUMN: Specifications */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row", lg: "column" },
                    gap: { xs: 3, md: 4 },
                    width: "100%",
                    py: 2,
                  }}
                >
                  {/* Columna superior: Precio y sqft */}
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: { xs: "column", md: "row", lg: "row" },
                      alignItems: { xs: "flex-center", md: "center" },
                      justifyContent: {
                        xs: "center",
                        md: "center",
                        lg: "space-around",
                      },
                      gap: 2,
                      mb: { xs: 2, md: 0 },
                    }}
                  >
                    <Box
                      sx={{
                        textAlign: { xs: "center", md: "center", lg: "center" },
                      }}
                    >
                      <Typography
                        variant="h2"
                        fontWeight="bold"
                        color="primary"
                      >
                        ${model.price?.toLocaleString()}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Base price
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: { xs: "center", md: "center" } }}>
                      <Typography
                        variant="h2"
                        fontWeight="bold"
                        color="primary"
                      >
                        {model.sqft?.toLocaleString()}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        sqft
                      </Typography>
                    </Box>
                  </Box>

                  {/* Columna inferior: Habitaciones, baños y pisos */}
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: { xs: "center", md: "center" },
                      justifyContent: {
                        xs: "center",
                        md: "center",
                        lg: "space-around",
                      },
                      gap: 4,
                    }}
                  >
                    {/* Bedrooms */}
                    <Box sx={{ textAlign: "center" }}>
                      <KingBed
                        sx={{ fontSize: 32, color: "primary.main", mb: 0.5 }}
                      />
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        color="primary"
                      >
                        {model.bedrooms}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Bedrooms
                      </Typography>
                    </Box>
                    {/* Bathrooms */}
                    <Box sx={{ textAlign: "center" }}>
                      <Bathtub
                        sx={{ fontSize: 32, color: "primary.main", mb: 0.5 }}
                      />
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        color="primary"
                      >
                        {model.bathrooms}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Bathrooms
                      </Typography>
                    </Box>
                    {/* Stories */}
                    <Box sx={{ textAlign: "center" }}>
                      <Home
                        sx={{ fontSize: 32, color: "primary.main", mb: 0.5 }}
                      />
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        color="primary"
                      >
                        {model.stories}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Stories
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {/* Opcional: Extras */}
                {/* ✅ CHIPS CON VALIDACIÓN CONDICIONAL */}
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    justifyContent: { xs: "center" },
                  }}
                >
                  {/* ✅ Si es Modelo 10, mostrar chips específicos */}
                  {isModel10 ? (
                    <>
                      <Chip
                        icon={<Kitchen />}
                        label="Comedor Option"
                        color="success"
                        variant="outlined"
                      />
                      <Chip
                        icon={<Home />}
                        label="Estudio Option"
                        color="info"
                        variant="outlined"
                      />
                    </>
                  ) : (
                    <>
                      {/* ✅ Para otros modelos, mostrar chips normales */}
                      {Array.isArray(model.balconies) &&
                        model.balconies.length > 0 && (
                          <Chip
                            icon={<Deck />}
                            label="Balcony option"
                            color="success"
                            variant="outlined"
                          />
                        )}
                    </>
                  )}

                  {/* ✅ Estos chips son comunes para todos los modelos */}
                  {Array.isArray(model.storages) &&
                    model.storages.length > 0 && (
                      <Chip
                        icon={<Garage />}
                        label="Storage option"
                        color="info"
                        variant="outlined"
                      />
                    )}
                  {Array.isArray(model.upgrades) &&
                    model.upgrades.length > 0 && (
                      <Chip
                        icon={<Home />}
                        label="Upgrades available"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  {model.status === "active" && (
                    <Chip label="Active" color="primary" variant="outlined" />
                  )}
                </Box>
              </Grid>
              {/* RIGHT COLUMN: Blueprints */}
              <Grid item xs={12} md={6}>
                {Array.isArray(filteredBlueprints) &&
                  filteredBlueprints.length > 0 && (
                    <Box sx={{ height: "100%" }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                      >
                        {/* ✅ Título condicional */}
                        {isModel10 ? "Floor Plans" : "Blueprints"}
                      </Typography>
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: { xs: 220, md: 340 },
                          bgcolor: "grey.100",
                          overflow: "hidden",
                          borderRadius: 3,
                          mb: 2,
                        }}
                      >
                        {/* Carrusel de blueprints */}
                        <Box
                          sx={{
                            display: "flex",
                            transition:
                              "transform 0.4s cubic-bezier(.4,0,.2,1)",
                            transform: `translateX(-${blueprintSlide * 100}%)`,
                            height: "100%",
                          }}
                        >
                          {filteredBlueprints.map((url, index) => (
                            <Box
                              key={index}
                              sx={{
                                minWidth: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "grey.100",
                              }}
                            >
                              <Box
                                component="img"
                                src={url}
                                alt={`Blueprint ${index + 1}`}
                                sx={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  objectFit: "contain",
                                  borderRadius: 2,
                                  boxShadow: 2,
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                        {/* Flechas de navegación */}
                        {model.blueprints.default.length > 1 && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() =>
                                setBlueprintSlide(
                                  (prev) =>
                                    (prev -
                                      1 +
                                      model.blueprints.default.length) %
                                    model.blueprints.default.length,
                                )
                              }
                              sx={{
                                position: "absolute",
                                top: "50%",
                                left: 8,
                                transform: "translateY(-50%)",
                                bgcolor: "white",
                                boxShadow: 2,
                                zIndex: 1,
                                "&:hover": { bgcolor: "#e8f5ee" },
                              }}
                            >
                              <ChevronLeft />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                setBlueprintSlide(
                                  (prev) =>
                                    (prev + 1) %
                                    model.blueprints.default.length,
                                )
                              }
                              sx={{
                                position: "absolute",
                                top: "50%",
                                right: 8,
                                transform: "translateY(-50%)",
                                bgcolor: "white",
                                boxShadow: 2,
                                zIndex: 1,
                                "&:hover": { bgcolor: "#e8f5ee" },
                              }}
                            >
                              <ChevronRight />
                            </IconButton>
                          </>
                        )}
                        {/* Indicadores */}
                        {model.blueprints.default.length > 1 && (
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 8,
                              left: 0,
                              right: 0,
                              display: "flex",
                              justifyContent: "center",
                              gap: 1,
                            }}
                          >
                            {model.blueprints.default.map((_, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  bgcolor:
                                    blueprintSlide === idx
                                      ? "primary.main"
                                      : "grey.400",
                                  transition: "background 0.3s",
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
              </Grid>
            </Grid>
          </MotionPaper>

          {/* Imagen principal (footer visual) */}
          <Box
            ref={principalRef}
            sx={{
              width: { xs: "100%", md: "90%" },
              aspectRatio: "16/9",
              mt: 6,
              mx: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              bgcolor: "white",
              borderRadius: 4,
              boxShadow: 3,
              overflow: "hidden",
              position: "relative", // importante para el overlay
              mb: 6,
              transition:
                "box-shadow 0.4s cubic-bezier(.4,0,.2,1), background 0.4s",
              "&:hover": {
                boxShadow: "0 16px 48px 0 rgba(74,124,89,0.18)",
              },
            }}
          >
            {/* Imagen principal */}
            <Fade in timeout={700}>
              <Box
                component="img"
                src={
                  model.images?.exterior?.[2]?.url ||
                  model.images?.exterior?.[7] ||
                  "/images/placeholder-house.png"
                }
                alt={`Render of model ${model.modelNumber}`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: 5,
                  display: "block",
                  background:
                    "linear-gradient(135deg, #f5f5f5 60%, #e8f5ee 100%)",
                  transition: "filter 0.3s",
                  filter: "brightness(0.98)",
                  boxShadow: "0 2px 16px 0 rgba(74,124,89,0.07)",
                }}
              />
            </Fade>

            {/* Botones Basic/Upgrade - SOLO DESKTOP */}
          </Box>

          <Box
            sx={{
              position: "absolute",
              display: { xs: "flex", md: "flex" },
              flexDirection: { xs: "row", lg: "column" },
              alignItems: "align-center",
              left: { xs: "9%", lg: "20%" }, // Ajusta según tu diseño
              // top: '50%',
              transform: { xs: "translateY(-20%)", lg: "translateY(200%)" },
              zIndex: 3,
              gap: 2,
              zIndex: 999,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "flex-start", md: "center" },
                gap: 2,
              }}
            >
              {/* Botones */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "row", lg: "column" },
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <Button
                  variant={interiorType === "basic" ? "contained" : "outlined"}
                  color="primary"
                  size="large"
                  onClick={() => {
                    setInteriorType("basic");
                    setInteriorSlide(0);
                  }}
                  sx={{ mb: 1 }}
                  startIcon={<Home />}
                >
                  Basic
                </Button>
                <Button
                  variant={
                    interiorType === "upgrade" ? "contained" : "outlined"
                  }
                  color="primary"
                  size="large"
                  onClick={() => {
                    setInteriorType("upgrade");
                    setInteriorSlide(0);
                  }}
                  startIcon={<Home />}
                >
                  Upgrade
                </Button>
              </Box>
              {/* Título y descripción */}
              <Box
                sx={{
                  ml: { xs: 0, md: 2 },
                  mt: { xs: 2, md: 0 },
                  minWidth: 180,
                  maxWidth: 260,
                }}
              >
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {interiorType === "basic"
                    ? "Main Room (Basic)"
                    : "Main Room (Upgrade)"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {interiorType === "basic"
                    ? "Standard, functional and bright space, ideal for everyday living."
                    : "Premium finishes, more spacious and modern details for an exclusive atmosphere."}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box>
            {/* Contenedor vertical sobrepuesto a la derecha */}
            {/* <Fade in timeout={900}> */}
            <motion.div
              style={{
                position: "relative", // Mantén relative para que no se salga de su espacio
                width: "100%",
                height: "500px",
                zIndex: 10,
                y,
                opacity,
                pointerEvents: opacity ? "auto" : "none",
              }}
            >
              <Box
                sx={{
                  position: { xs: "static", md: "absolute", lg: "relative" },
                  left: { xs: "auto", md: "0", lg: "55%", xl: "55%" },
                  top: { xs: "auto", md: "55%" },
                  transform: {
                    xs: "translateY(80%)",
                    sm: "translateY(50%)",
                    md: "translateY(-35%)",
                    lg: "translateY(-50%)",
                    xl: "translateY(-50%)",
                  },
                  width: {
                    xs: "100%",
                    sm: "100%",
                    md: "100%",
                    lg: 600,
                    xl: 700,
                  },
                  height: { xs: 220, sm: 340, md: 480, lg: 700, xl: 800 },
                  mt: { xs: 2, md: 0 },
                  bgcolor: "background.paper",
                  borderRadius: 5,
                  boxShadow: "0 8px 32px 0 rgba(74,124,89,0.18)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                  border: "2px solid #e8f5ee",
                  transition:
                    "box-shadow 0.4s cubic-bezier(.4,0,.2,1), border 0.3s",
                  position: "relative",
                  "&:hover": {
                    boxShadow: "0 16px 48px 0 rgba(74,124,89,0.22)",
                    border: "2.5px solid #4a7c59",
                  },
                }}
              >
                {/* Carrusel de imágenes interiores */}
                <Box
                  sx={{ position: "relative", width: "100%", height: "100%" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                      height: "100%",
                      transition: "transform 0.4s cubic-bezier(.4,0,.2,1)",
                      transform: `translateX(-${interiorSlide * 100}%)`,
                    }}
                  >
                    {filteredInteriorImages.length > 0 ? (
                      filteredInteriorImages.map((img, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            minWidth: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            component="img"
                            src={img.url}
                            alt={`Interior ${idx + 1}`}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                              backgroundPosition: "center",
                              transition: "filter 0.3s",
                              filter: "brightness(0.97)",
                              borderRadius: 2,
                              boxShadow: 2,
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </Box>
                      ))
                    ) : (
                      <Box
                        component="img"
                        src="/images/placeholder-interior.png"
                        alt="Interior preview"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          backgroundPosition: "center",
                          transition: "filter 0.3s",
                          filter: "brightness(0.97)",
                          borderRadius: 2,
                          boxShadow: 2,
                        }}
                      />
                    )}
                  </Box>
                  {/* Flechas de navegación */}
                  {filteredInteriorImages.length > 1 && (
                    <>
                      <IconButton
                        size="small"
                        onClick={prevInterior}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: 8,
                          transform: "translateY(-50%)",
                          bgcolor: "white",
                          boxShadow: 2,
                          zIndex: 1,
                          "&:hover": { bgcolor: "#e8f5ee" },
                        }}
                      >
                        <ChevronLeft />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={nextInterior}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          right: 8,
                          transform: "translateY(-50%)",
                          bgcolor: "white",
                          boxShadow: 2,
                          zIndex: 1,
                          "&:hover": { bgcolor: "#e8f5ee" },
                        }}
                      >
                        <ChevronRight />
                      </IconButton>
                    </>
                  )}
                  {/* Indicadores */}
                  {filteredInteriorImages.length > 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        left: 0,
                        right: 0,
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      {filteredInteriorImages.map((_, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor:
                              interiorSlide === idx
                                ? "primary.main"
                                : "grey.400",
                            transition: "background 0.3s",
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </motion.div>
            {/* </Fade> */}
          </Box>

          {/* Botón de personalización */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
              mt: "20%",
              bgcolor: "transparent",
            }}
          >
            <IconButton
              color="primary"
              size="large"
              sx={{
                bgcolor: "white",
                boxShadow: 2,
                px: 3,
                py: 1.5,
                borderRadius: 3,
                transition: "box-shadow 0.3s, background 0.3s",
                "&:hover": { bgcolor: "#e8f5ee", boxShadow: 4 },
              }}
              onClick={() => setShowCustomization((v) => !v)}
            >
              <TuneIcon fontSize="large" />
              <Typography sx={{ ml: 1, fontWeight: 600 }}>
                Customize and Compare
              </Typography>
            </IconButton>
          </Box>

          {/* Panel de personalización */}
          <Slide
            direction="left"
            in={showCustomization}
            mountOnEnter
            unmountOnExit
          >
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 2 }}>
                <IconButton onClick={() => setShowCustomization(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <ModelCustomizationPanel model={model} />
            </Box>
          </Slide>
        </Box>
      </MotionBox>
    </Box>
  );
};

export default ModelDetail;
