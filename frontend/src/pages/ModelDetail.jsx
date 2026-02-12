// import { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Box,
//   Typography,
//   IconButton,
//   Divider,
//   Grid,
//   Paper,
//   Chip,
//   Skeleton,
//   useTheme,
//   useMediaQuery,
//   Slide,
//   Fade,
//   Button,
// } from "@mui/material";
// import {
//   ArrowBack,
//   ChevronLeft,
//   ChevronRight,
//   KingBed,
//   Bathtub,
//   SquareFoot,
//   AttachMoney,
//   Home,
//   Landscape,
//   Kitchen,
//   Garage,
//   Pool,
//   Deck,
// } from "@mui/icons-material";

// import api from "../services/api";
// import ModelCustomizationPanel from "../components/ModelCustomizationPanel";
// import TuneIcon from "@mui/icons-material/Tune";
// import CloseIcon from "@mui/icons-material/Close";
// import { motion, useScroll, useTransform } from "framer-motion";

// const MotionBox = motion(Box);
// const MotionPaper = motion(Paper);

// const ModelDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"));

//   // ✅ ESTADOS BÁSICOS
//   const [model, setModel] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showCustomization, setShowCustomization] = useState(false);

//   // ✅ ESTADOS DE CARRUSELES
//   const [blueprintSlide, setBlueprintSlide] = useState(0);
//   const [interiorSlide, setInteriorSlide] = useState(0);

//   // ✅ ESTADOS DE FILTROS
//   const [interiorType, setInteriorType] = useState("basic");
//   const [blueprintType, setBlueprintType] = useState("withoutBalcony");

//   const principalRef = useRef(null);
//   const { scrollYProgress } = useScroll({
//     target: principalRef,
//     offset: ["end end", "start start"], // Cuando el final del principal llega al final del viewport, y cuando el inicio llega al inicio
//   });
//   // y: de 60px (abajo, oculto) a 0px (centrado)
//   // opacity: de 0 (invisible) a 1 (visible)
//   const y = useTransform(scrollYProgress, [0, 0.2], [60, 0]);
//   const opacity = useTransform(scrollYProgress, [0.1, 0.085, 0.095], [0, 1]);

//   // ✅ CONSTANTE PARA IDENTIFICAR EL MODELO 10
//   const MODEL_10_ID = "6977c7bbd1f24768968719de";
//   const isModel10 = model?._id === MODEL_10_ID;

//   // ✅ LABELS CONDICIONALES PARA BLUEPRINTS
//   const blueprintLabels = isModel10
//     ? {
//         without: "With Dining Room",
//         with: "With Study",
//         withoutIcon: Kitchen,
//         withIcon: Home,
//       }
//     : {
//         without: "Without Balcony",
//         with: "Balcony",
//         withoutIcon: Home,
//         withIcon: Deck,
//       };

//   // ✅ FETCH MODEL ON MOUNT
//   useEffect(() => {
//     fetchModel();
//   }, [id]);

//   // ✅ RESET SLIDES AL CAMBIAR FILTROS
//   useEffect(() => {
//     setInteriorSlide(0);
//   }, [interiorType, blueprintType]);

//   const fetchModel = async () => {
//     try {
//       const response = await api.get(`/models/${id}`);
//       setModel(response.data);
//     } catch (error) {
//       console.error("Error fetching model:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ PROCESAMIENTO DE IMÁGENES INTERIORES CON VALIDACIÓN MODELO 10
//   let filteredInteriorImages = [];
//   if (model) {
//     if (interiorType === "basic") {
//       // Basic: usar imágenes del modelo base
//       filteredInteriorImages = Array.isArray(model.images?.interior)
//         ? model.images.interior
//             .map((img) => (typeof img === "string" ? { url: img } : img))
//             .filter((img) => img && img.url && img.url.trim() !== "")
//         : [];
//     } else {
//       // Upgrade: usar imágenes de upgrades
//       filteredInteriorImages = Array.isArray(model.upgrades)
//         ? model.upgrades.flatMap((upg) =>
//             Array.isArray(upg.images?.interior)
//               ? upg.images.interior
//                   .map((img) => (typeof img === "string" ? { url: img } : img))
//                   .filter((img) => img && img.url && img.url.trim() !== "")
//               : []
//           )
//         : [];
//     }

//     // ✅ NUEVO: Para Modelo 10, agregar imágenes de balconies cuando blueprintType === "balcony"
//     if (isModel10 && blueprintType === "balcony") {
//       const balconyInteriors = Array.isArray(model.balconies)
//         ? model.balconies.flatMap((balcony) =>
//             Array.isArray(balcony.images?.interior)
//               ? balcony.images.interior
//                   .map((img) => (typeof img === "string" ? { url: img } : img))
//                   .filter((img) => img && img.url && img.url.trim() !== "")
//               : []
//           )
//         : [];

//       if (balconyInteriors.length > 0) {
//         if (interiorType === "basic") {
//           // Para basic, mostrar solo las de estudio
//           filteredInteriorImages = balconyInteriors;
//         } else {
//           // Para upgrade, combinar ambas
//           filteredInteriorImages = [...filteredInteriorImages, ...balconyInteriors];
//         }
//       }
//     }
//   }

//   // ✅ PROCESAMIENTO DE BLUEPRINTS
//   let filteredBlueprints = [];
//   if (model) {
//     if (isModel10) {
//       // Para Modelo 10: withoutBalcony = comedor, balcony = estudio
//       filteredBlueprints =
//         blueprintType === "balcony"
//           ? model.blueprints?.withBalcony || []
//           : model.blueprints?.default || [];
//     } else {
//       // Para otros modelos: comportamiento normal
//       filteredBlueprints =
//         blueprintType === "balcony"
//           ? model.blueprints?.withBalcony || []
//           : model.blueprints?.default || [];
//     }
//   }

//   // ✅ FUNCIONES DE NAVEGACIÓN DE CARRUSEL INTERIOR
//   const nextInterior = () => {
//     if (filteredInteriorImages.length > 1) {
//       setInteriorSlide((prev) => (prev + 1) % filteredInteriorImages.length);
//     }
//   };

//   const prevInterior = () => {
//     if (filteredInteriorImages.length > 1) {
//       setInteriorSlide(
//         (prev) =>
//           (prev - 1 + filteredInteriorImages.length) %
//           filteredInteriorImages.length
//       );
//     }
//   };

//   // ✅ CARACTERÍSTICAS (FEATURES)
//   const features =
//     Array.isArray(model?.features) && model.features.length > 0
//       ? model.features
//       : [];

//   const getIconForFeature = (title) => {
//     const lowerTitle = title?.toLowerCase() || "";
//     if (lowerTitle.includes("cocina") || lowerTitle.includes("kitchen"))
//       return <Kitchen sx={{ fontSize: 40 }} />;
//     if (lowerTitle.includes("garaje") || lowerTitle.includes("garage"))
//       return <Garage sx={{ fontSize: 40 }} />;
//     if (lowerTitle.includes("piscina") || lowerTitle.includes("pool"))
//       return <Pool sx={{ fontSize: 40 }} />;
//     if (lowerTitle.includes("terraza") || lowerTitle.includes("deck"))
//       return <Deck sx={{ fontSize: 40 }} />;
//     if (lowerTitle.includes("jardín") || lowerTitle.includes("garden"))
//       return <Landscape sx={{ fontSize: 40 }} />;
//     return <Home sx={{ fontSize: 40 }} />;
//   };

//   if (loading) {
//     return (
//       <Box sx={{ mb: 4 }}>
//         {/* Header Image Skeleton */}
//         <Skeleton 
//           variant="rectangular" 
//           height={{ xs: 300, sm: 400, md: 450, lg:700 }}
//           sx={{ 
//             width: '100%',
//             mb: 4,
//             borderRadius: { xs: 0, md: 4 }
//           }} 
//         />
  
//         {/* Specifications Section Skeleton */}
//         <Box sx={{ p: { xs: 2, sm: 2, md: 3, lg: 4 } }}>
//           {/* Buttons Skeleton */}
//           <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
//             <Skeleton variant="rounded" width={180} height={42} />
//             <Skeleton variant="rounded" width={150} height={42} />
//           </Box>
  
//           {/* Main Paper Skeleton */}
//           <Box
//             sx={{
//               borderRadius: 4,
//               p: { xs: 2, md: 3 },
//               border: '1px solid rgba(0,0,0,0.08)',
//               mb: 3
//             }}
//           >
//             <Grid container spacing={3}>
//               {/* Left Column: Stats */}
//               <Grid item xs={12} md={6}>
//                 {/* Price & Sqft */}
//                 <Box sx={{ display: 'flex', gap: 4, mb: 3, justifyContent: 'center' }}>
//                   <Box sx={{ textAlign: 'center' }}>
//                     <Skeleton variant="text" width={140} height={60} />
//                     <Skeleton variant="text" width={80} height={24} />
//                   </Box>
//                   <Box sx={{ textAlign: 'center' }}>
//                     <Skeleton variant="text" width={120} height={60} />
//                     <Skeleton variant="text" width={60} height={24} />
//                   </Box>
//                 </Box>
  
//                 {/* Bedrooms, Bathrooms, Stories */}
//                 <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', mb: 2 }}>
//                   {[1, 2, 3].map((i) => (
//                     <Box key={i} sx={{ textAlign: 'center' }}>
//                       <Skeleton variant="circular" width={40} height={40} sx={{ mx: 'auto', mb: 1 }} />
//                       <Skeleton variant="text" width={50} height={40} sx={{ mx: 'auto' }} />
//                       <Skeleton variant="text" width={70} height={20} sx={{ mx: 'auto' }} />
//                     </Box>
//                   ))}
//                 </Box>
  
//                 {/* Chips */}
//                 <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
//                   {[1, 2, 3].map((i) => (
//                     <Skeleton key={i} variant="rounded" width={120} height={32} />
//                   ))}
//                 </Box>
//               </Grid>
  
//               {/* Right Column: Blueprint */}
//               <Grid item xs={12} md={6}>
//                 <Skeleton variant="text" width={100} height={28} sx={{ mb: 1 }} />
//                 <Skeleton 
//                   variant="rounded" 
//                   height={{ xs: 220, md: 340 }}
//                   sx={{ borderRadius: 3 }}
//                 />
//               </Grid>
//             </Grid>
//           </Box>
  
//           {/* Principal Image Skeleton */}
//           <Skeleton 
//             variant="rounded" 
//             sx={{
//               width: { xs: '100%', md: '90%' },
//               height: { xs: 250, sm: 350, md: 450 },
//               mx: 'auto',
//               mt: 6,
//               mb: 6,
//               borderRadius: 4
//             }}
//           />
  
//           {/* Interior Section Skeleton */}
//           <Box sx={{ position: 'relative', height: 500, mt: 10 }}>
//             {/* Buttons Skeleton */}
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'absolute', left: '10%', top: '20%' }}>
//               <Skeleton variant="rounded" width={120} height={40} />
//               <Skeleton variant="rounded" width={120} height={40} />
//               <Skeleton variant="rectangular" width={220} height={80} sx={{ mt: 2, borderRadius: 2 }} />
//             </Box>
  
//             {/* Interior Image Skeleton */}
//             <Skeleton 
//               variant="rounded" 
//               sx={{
//                 position: { xs: 'static', lg: 'absolute' },
//                 right: { lg: '10%' },
//                 top: { lg: '50%' },
//                 transform: { lg: 'translateY(-50%)' },
//                 width: { xs: '100%', lg: 600 },
//                 height: { xs: 220, sm: 340, md: 480, lg: 700 },
//                 borderRadius: 5,
//                 mt: { xs: 4, lg: 0 }
//               }}
//             />
//           </Box>
  
//           {/* Customize Button Skeleton */}
//           <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
//             <Skeleton variant="rounded" width={260} height={56} sx={{ borderRadius: 3 }} />
//           </Box>
//         </Box>
//       </Box>
//     );
//   }

//   if (!model) {
//     return (
//       <Box sx={{ p: 4, textAlign: "center" }}>
//         <Typography variant="h5">Model not found</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ mb: 4 }}>
//       {/* Carrusel Exterior */}
//       <MotionBox
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.7, ease: "easeOut" }}
//         sx={{
//           position: "relative",
//           width: "100%",
//           height: { xs: 300, sm: 400, md: 450, lg: 500 },
//           bgcolor: theme.palette.background.default,
//           boxShadow: { xs: 0, md: 4 },
//           overflow: "hidden",
//           mb: 4,
//           transition: "box-shadow 0.4s cubic-bezier(.4,0,.2,1), background 0.4s",
//         }}
//       >
//         <Box
//           sx={{
//             position: "relative",
//             width: "100%",
//             height: "100%",
//             bgcolor: theme.palette.background.default,
//             boxShadow: { xs: 0, md: 4 },
//             overflow: "hidden",
//             mb: 4,
//             transition: "box-shadow 0.4s cubic-bezier(.4,0,.2,1), background 0.4s",
//           }}
//         >
//           {/* Video Player */}
//           {/* <Box
//             component="iframe"
//             src="https://www.youtube.com/watch?v=Zgdg2lwQ-Cw"
//             sx={{
//               width: "100%",
//               height: "100%",
//               border: "none",
//               display: "block",
//             }}
//             allow="autoplay; fullscreen"
//             title="Model Video Presentation"
//           /> */}
//                     <Box
//                       component="iframe"
//                       src="https://www.youtube.com/embed/Zgdg2lwQ-Cw?autoplay=1&mute=1&loop=1&playlist=Zgdg2lwQ-Cw&controls=0&modestbranding=1"
//                       sx={{
//                         width: "100%",
//                         height: "100%",
//                         border: "none",
//                       }}
//                       allow="autoplay; fullscreen; picture-in-picture"
//                       allowFullScreen
//                       title="Model Video Presentation"
//                     />
      
//           {/* Overlay opcional con información */}
//           <Box
//             sx={{
//               position: "absolute",
//               bottom: 0,
//               left: 0,
//               right: 0,
//               background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
//               p: 2,
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               opacity: 0,
//               transition: "opacity 0.3s",
//               "&:hover": {
//                 opacity: 1,
//               },
//             }}
//           >
//             <Typography variant="body2" color="white" fontWeight={600}>
//               {model.model} - Model #{model.modelNumber}
//             </Typography>
//             <Chip 
//               label="Video Tour" 
//               size="small" 
//               sx={{ 
//                 bgcolor: "primary.main", 
//                 color: "white",
//                 fontWeight: 600 
//               }} 
//             />
//           </Box>
//         </Box>
//       </MotionBox>

//       <MotionBox
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
//         sx={{ p: { xs: 2, sm: 2, md: 3, lg: 4 } }}
//       >
//         {/* Especificaciones */}
//         <Box sx={{ p: { xs: 2, sm: 2, md: 3, lg: 4 } }}>
//           <Box
//             sx={{
//               display: "flex",
//               margin: "0 auto",
//               gap: 2,
//               justifyContent: "center",
//               mb: 2,
//             }}
//           >
//             <Button
//               variant={
//                 blueprintType === "withoutBalcony" ? "contained" : "outlined"
//               }
//               color="primary"
//               onClick={() => setBlueprintType("withoutBalcony")}
//               startIcon={<blueprintLabels.withoutIcon />}
//             >
//               {blueprintLabels.without}
//             </Button>
//             <Button
//               variant={blueprintType === "balcony" ? "contained" : "outlined"}
//               color="primary"
//               onClick={() => setBlueprintType("balcony")}
//               startIcon={<blueprintLabels.withIcon />}
//             >
//               {blueprintLabels.with}
//             </Button>
//           </Box>

//           <MotionPaper
//             elevation={3}
//             sx={{
//               mt: 3,
//               mb: 3,
//               borderRadius: 4,
//               p: { xs: 2, md: 3 },
//               bgcolor: "background.paper",
//               boxShadow: "0 8px 32px 0 rgba(74,124,89,0.10)",
//               transition:
//                 "box-shadow 0.4s cubic-bezier(.4,0,.2,1), background 0.4s",
//             }}
//           >
//             <Grid container spacing={3}>
//               {/* LEFT COLUMN: Specifications */}
//               <Grid item xs={12} md={6}>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     flexDirection: { xs: "column", md: "row", lg: "column" },
//                     gap: { xs: 3, md: 4 },
//                     width: "100%",
//                     py: 2,
//                   }}
//                 >
//                   {/* Columna superior: Precio y sqft */}
//                   <Box
//                     sx={{
//                       flex: 1,
//                       display: "flex",
//                       flexDirection: { xs: "column", md: "row", lg: "row" },
//                       alignItems: { xs: "flex-center", md: "center" },
//                       justifyContent: {
//                         xs: "center",
//                         md: "center",
//                         lg: "space-around",
//                       },
//                       gap: 2,
//                       mb: { xs: 2, md: 0 },
//                     }}
//                   >
//                     <Box
//                       sx={{
//                         textAlign: { xs: "center", md: "center", lg: "center" },
//                       }}
//                     >
//                       <Typography
//                         variant="h2"
//                         fontWeight="bold"
//                         color="primary"
//                       >
//                         ${model.price?.toLocaleString()}
//                       </Typography>
//                       <Typography variant="subtitle2" color="text.secondary">
//                         Base price
//                       </Typography>
//                     </Box>
//                     <Box sx={{ textAlign: { xs: "center", md: "center" } }}>
//                       <Typography
//                         variant="h2"
//                         fontWeight="bold"
//                         color="primary"
//                       >
//                         {model.sqft?.toLocaleString()}
//                       </Typography>
//                       <Typography variant="subtitle2" color="text.secondary">
//                         sqft
//                       </Typography>
//                     </Box>
//                   </Box>

//                   {/* Columna inferior: Habitaciones, baños y pisos */}
//                   <Box
//                     sx={{
//                       flex: 1,
//                       display: "flex",
//                       flexDirection: "row",
//                       alignItems: { xs: "center", md: "center" },
//                       justifyContent: {
//                         xs: "center",
//                         md: "center",
//                         lg: "space-around",
//                       },
//                       gap: 4,
//                     }}
//                   >
//                     {/* Bedrooms */}
//                     <Box sx={{ textAlign: "center" }}>
//                       <KingBed
//                         sx={{ fontSize: 32, color: "primary.main", mb: 0.5 }}
//                       />
//                       <Typography
//                         variant="h3"
//                         fontWeight="bold"
//                         color="primary"
//                       >
//                         {model.bedrooms}
//                       </Typography>
//                       <Typography variant="subtitle2" color="text.secondary">
//                         Bedrooms
//                       </Typography>
//                     </Box>
//                     {/* Bathrooms */}
//                     <Box sx={{ textAlign: "center" }}>
//                       <Bathtub
//                         sx={{ fontSize: 32, color: "primary.main", mb: 0.5 }}
//                       />
//                       <Typography
//                         variant="h3"
//                         fontWeight="bold"
//                         color="primary"
//                       >
//                         {model.bathrooms}
//                       </Typography>
//                       <Typography variant="subtitle2" color="text.secondary">
//                         Bathrooms
//                       </Typography>
//                     </Box>
//                     {/* Stories */}
//                     <Box sx={{ textAlign: "center" }}>
//                       <Home
//                         sx={{ fontSize: 32, color: "primary.main", mb: 0.5 }}
//                       />
//                       <Typography
//                         variant="h3"
//                         fontWeight="bold"
//                         color="primary"
//                       >
//                         {model.stories}
//                       </Typography>
//                       <Typography variant="subtitle2" color="text.secondary">
//                         Stories
//                       </Typography>
//                     </Box>
//                   </Box>
//                 </Box>
//                 {/* Opcional: Extras */}
//                 {/* ✅ CHIPS CON VALIDACIÓN CONDICIONAL */}
//                 <Box
//                   sx={{
//                     mt: 2,
//                     display: "flex",
//                     gap: 1,
//                     flexWrap: "wrap",
//                     justifyContent: { xs: "center" },
//                   }}
//                 >
//                   {/* ✅ Si es Modelo 10, mostrar chips específicos */}
//                   {isModel10 ? (
//                     <>
//                       <Chip
//                         icon={<Kitchen />}
//                         label="Comedor Option"
//                         color="success"
//                         variant="outlined"
//                       />
//                       <Chip
//                         icon={<Home />}
//                         label="Estudio Option"
//                         color="info"
//                         variant="outlined"
//                       />
//                     </>
//                   ) : (
//                     <>
//                       {/* ✅ Para otros modelos, mostrar chips normales */}
//                       {Array.isArray(model.balconies) &&
//                         model.balconies.length > 0 && (
//                           <Chip
//                             icon={<Deck />}
//                             label="Balcony option"
//                             color="success"
//                             variant="outlined"
//                           />
//                         )}
//                     </>
//                   )}

//                   {/* ✅ Estos chips son comunes para todos los modelos */}
//                   {Array.isArray(model.storages) &&
//                     model.storages.length > 0 && (
//                       <Chip
//                         icon={<Garage />}
//                         label="Storage option"
//                         color="info"
//                         variant="outlined"
//                       />
//                     )}
//                   {Array.isArray(model.upgrades) &&
//                     model.upgrades.length > 0 && (
//                       <Chip
//                         icon={<Home />}
//                         label="Upgrades available"
//                         color="warning"
//                         variant="outlined"
//                       />
//                     )}
//                   {model.status === "active" && (
//                     <Chip label="Active" color="primary" variant="outlined" />
//                   )}
//                 </Box>
//               </Grid>
//               {/* RIGHT COLUMN: Blueprints */}
//               <Grid item xs={12} md={6}>
//                 {Array.isArray(filteredBlueprints) &&
//                   filteredBlueprints.length > 0 && (
//                     <Box sx={{ height: "100%" }}>
//                       <Typography
//                         variant="subtitle1"
//                         fontWeight="bold"
//                         gutterBottom
//                       >
//                         {/* ✅ Título condicional */}
//                         {isModel10 ? "Floor Plans" : "Blueprints"}
//                       </Typography>
//                       <Box
//                         sx={{
//                           position: "relative",
//                           width: "100%",
//                           height: { xs: 220, md: 340 },
//                           bgcolor: "grey.100",
//                           overflow: "hidden",
//                           borderRadius: 3,
//                           mb: 2,
//                         }}
//                       >
//                         {/* Carrusel de blueprints */}
//                         <Box
//                           sx={{
//                             display: "flex",
//                             transition:
//                               "transform 0.4s cubic-bezier(.4,0,.2,1)",
//                             transform: `translateX(-${blueprintSlide * 100}%)`,
//                             height: "100%",
//                           }}
//                         >
//                           {filteredBlueprints.map((url, index) => (
//                             <Box
//                               key={index}
//                               sx={{
//                                 minWidth: "100%",
//                                 height: "100%",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 bgcolor: "grey.100",
//                               }}
//                             >
//                               <Box
//                                 component="img"
//                                 src={url}
//                                 alt={`Blueprint ${index + 1}`}
//                                 sx={{
//                                   maxWidth: "100%",
//                                   maxHeight: "100%",
//                                   objectFit: "contain",
//                                   borderRadius: 2,
//                                   boxShadow: 2,
//                                 }}
//                                 onError={(e) => {
//                                   e.target.style.display = "none";
//                                 }}
//                               />
//                             </Box>
//                           ))}
//                         </Box>
//                         {/* Flechas de navegación */}
//                         {model.blueprints.default.length > 1 && (
//                           <>
//                             <IconButton
//                               size="small"
//                               onClick={() =>
//                                 setBlueprintSlide(
//                                   (prev) =>
//                                     (prev -
//                                       1 +
//                                       model.blueprints.default.length) %
//                                     model.blueprints.default.length,
//                                 )
//                               }
//                               sx={{
//                                 position: "absolute",
//                                 top: "50%",
//                                 left: 8,
//                                 transform: "translateY(-50%)",
//                                 bgcolor: "white",
//                                 boxShadow: 2,
//                                 zIndex: 1,
//                                 "&:hover": { bgcolor: "#e8f5ee" },
//                               }}
//                             >
//                               <ChevronLeft />
//                             </IconButton>
//                             <IconButton
//                               size="small"
//                               onClick={() =>
//                                 setBlueprintSlide(
//                                   (prev) =>
//                                     (prev + 1) %
//                                     model.blueprints.default.length,
//                                 )
//                               }
//                               sx={{
//                                 position: "absolute",
//                                 top: "50%",
//                                 right: 8,
//                                 transform: "translateY(-50%)",
//                                 bgcolor: "white",
//                                 boxShadow: 2,
//                                 zIndex: 1,
//                                 "&:hover": { bgcolor: "#e8f5ee" },
//                               }}
//                             >
//                               <ChevronRight />
//                             </IconButton>
//                           </>
//                         )}
//                         {/* Indicadores */}
//                         {model.blueprints.default.length > 1 && (
//                           <Box
//                             sx={{
//                               position: "absolute",
//                               bottom: 8,
//                               left: 0,
//                               right: 0,
//                               display: "flex",
//                               justifyContent: "center",
//                               gap: 1,
//                             }}
//                           >
//                             {model.blueprints.default.map((_, idx) => (
//                               <Box
//                                 key={idx}
//                                 sx={{
//                                   width: 10,
//                                   height: 10,
//                                   borderRadius: "50%",
//                                   bgcolor:
//                                     blueprintSlide === idx
//                                       ? "primary.main"
//                                       : "grey.400",
//                                   transition: "background 0.3s",
//                                 }}
//                               />
//                             ))}
//                           </Box>
//                         )}
//                       </Box>
//                     </Box>
//                   )}
//               </Grid>
//             </Grid>
//           </MotionPaper>

//           {/* Imagen principal (footer visual) */}
//           <Box
//             ref={principalRef}
//             sx={{
//               width: { xs: "100%", md: "90%" },
//               aspectRatio: "16/9",
//               mt: 6,
//               mx: "auto",
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               bgcolor: "white",
//               borderRadius: 4,
//               boxShadow: 3,
//               overflow: "hidden",
//               position: "relative", // importante para el overlay
//               mb: 6,
//               transition:
//                 "box-shadow 0.4s cubic-bezier(.4,0,.2,1), background 0.4s",
//               "&:hover": {
//                 boxShadow: "0 16px 48px 0 rgba(74,124,89,0.18)",
//               },
//             }}
//           >
//             {/* Imagen principal */}
//             <Fade in timeout={700}>
//               <Box
//                 component="img"
//                 src={
//                   model.images?.exterior?.[2]?.url ||
//                   model.images?.exterior?.[7] ||
//                   "/images/placeholder-house.png"
//                 }
//                 alt={`Render of model ${model.modelNumber}`}
//                 sx={{
//                   width: "100%",
//                   height: "100%",
//                   objectFit: "contain",
//                   borderRadius: 5,
//                   display: "block",
//                   background:
//                     "linear-gradient(135deg, #f5f5f5 60%, #e8f5ee 100%)",
//                   transition: "filter 0.3s",
//                   filter: "brightness(0.98)",
//                   boxShadow: "0 2px 16px 0 rgba(74,124,89,0.07)",
//                 }}
//               />
//             </Fade>

//             {/* Botones Basic/Upgrade - SOLO DESKTOP */}
//           </Box>

//           <Box
//             sx={{
//               position: "absolute",
//               display: { xs: "flex", md: "flex" },
//               flexDirection: { xs: "row", lg: "column" },
//               alignItems: "align-center",
//               left: { xs: "9%", lg: "20%" }, // Ajusta según tu diseño
//               // top: '50%',
//               transform: { xs: "translateY(-20%)", lg: "translateY(200%)" },
//               zIndex: 3,
//               gap: 2,
//               zIndex: 999,
//             }}
//           >
//             <Box
//               sx={{
//                 display: "flex",
//                 flexDirection: { xs: "column", md: "row" },
//                 alignItems: { xs: "flex-start", md: "center" },
//                 gap: 2,
//               }}
//             >
//               {/* Botones */}
//               <Box
//                 sx={{
//                   display: "flex",
//                   flexDirection: { xs: "row", lg: "column" },
//                   alignItems: "flex-start",
//                   gap: 2,
//                 }}
//               >
//                 <Button
//                   variant={interiorType === "basic" ? "contained" : "outlined"}
//                   color="primary"
//                   size="large"
//                   onClick={() => {
//                     setInteriorType("basic");
//                     setInteriorSlide(0);
//                   }}
//                   sx={{ mb: 1 }}
//                   startIcon={<Home />}
//                 >
//                   Basic
//                 </Button>
//                 <Button
//                   variant={
//                     interiorType === "upgrade" ? "contained" : "outlined"
//                   }
//                   color="primary"
//                   size="large"
//                   onClick={() => {
//                     setInteriorType("upgrade");
//                     setInteriorSlide(0);
//                   }}
//                   startIcon={<Home />}
//                 >
//                   Upgrade
//                 </Button>
//               </Box>
//               {/* Título y descripción */}
//               <Box
//                 sx={{
//                   ml: { xs: 0, md: 2 },
//                   mt: { xs: 2, md: 0 },
//                   minWidth: 180,
//                   maxWidth: 260,
//                 }}
//               >
//                 <Typography variant="h6" fontWeight="bold" color="primary">
//                   {interiorType === "basic"
//                     ? "Main Room (Basic)"
//                     : "Main Room (Upgrade)"}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   {interiorType === "basic"
//                     ? "Standard, functional and bright space, ideal for everyday living."
//                     : "Premium finishes, more spacious and modern details for an exclusive atmosphere."}
//                 </Typography>
//               </Box>
//             </Box>
//           </Box>

//           <Box>
//             {/* Contenedor vertical sobrepuesto a la derecha */}
//             {/* <Fade in timeout={900}> */}
//             <motion.div
//               style={{
//                 position: "relative", // Mantén relative para que no se salga de su espacio
//                 width: "100%",
//                 height: "500px",
//                 zIndex: 10,
//                 y,
//                 opacity,
//                 pointerEvents: opacity ? "auto" : "none",
//               }}
//             >
//               <Box
//                 sx={{
//                   position: { xs: "static", md: "absolute", lg: "relative" },
//                   left: { xs: "auto", md: "0", lg: "55%", xl: "55%" },
//                   top: { xs: "auto", md: "55%" },
//                   transform: {
//                     xs: "translateY(80%)",
//                     sm: "translateY(50%)",
//                     md: "translateY(-35%)",
//                     lg: "translateY(-50%)",
//                     xl: "translateY(-50%)",
//                   },
//                   width: {
//                     xs: "100%",
//                     sm: "100%",
//                     md: "100%",
//                     lg: 600,
//                     xl: 700,
//                   },
//                   height: { xs: 220, sm: 340, md: 480, lg: 700, xl: 800 },
//                   mt: { xs: 2, md: 0 },
//                   bgcolor: "background.paper",
//                   borderRadius: 5,
//                   boxShadow: "0 8px 32px 0 rgba(74,124,89,0.18)",
//                   overflow: "hidden",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   zIndex: 2,
//                   border: "2px solid #e8f5ee",
//                   transition:
//                     "box-shadow 0.4s cubic-bezier(.4,0,.2,1), border 0.3s",
//                   position: "relative",
//                   "&:hover": {
//                     boxShadow: "0 16px 48px 0 rgba(74,124,89,0.22)",
//                     border: "2.5px solid #4a7c59",
//                   },
//                 }}
//               >
//                 {/* Carrusel de imágenes interiores */}
//                 <Box
//                   sx={{ position: "relative", width: "100%", height: "100%" }}
//                 >
//                   <Box
//                     sx={{
//                       display: "flex",
//                       width: "100%",
//                       height: "100%",
//                       transition: "transform 0.4s cubic-bezier(.4,0,.2,1)",
//                       transform: `translateX(-${interiorSlide * 100}%)`,
//                     }}
//                   >
//                     {filteredInteriorImages.length > 0 ? (
//                       filteredInteriorImages.map((img, idx) => (
//                         <Box
//                           key={idx}
//                           sx={{
//                             minWidth: "100%",
//                             height: "100%",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                           }}
//                         >
//                           <Box
//                             component="img"
//                             src={img.url}
//                             alt={`Interior ${idx + 1}`}
//                             sx={{
//                               width: "100%",
//                               height: "100%",
//                               objectFit: "cover",
//                               display: "block",
//                               backgroundPosition: "center",
//                               transition: "filter 0.3s",
//                               filter: "brightness(0.97)",
//                               borderRadius: 2,
//                               boxShadow: 2,
//                             }}
//                             onError={(e) => {
//                               e.target.style.display = "none";
//                             }}
//                           />
//                         </Box>
//                       ))
//                     ) : (
//                       <Box
//                         component="img"
//                         src="/images/placeholder-interior.png"
//                         alt="Interior preview"
//                         sx={{
//                           width: "100%",
//                           height: "100%",
//                           objectFit: "cover",
//                           display: "block",
//                           backgroundPosition: "center",
//                           transition: "filter 0.3s",
//                           filter: "brightness(0.97)",
//                           borderRadius: 2,
//                           boxShadow: 2,
//                         }}
//                       />
//                     )}
//                   </Box>
//                   {/* Flechas de navegación */}
//                   {filteredInteriorImages.length > 1 && (
//                     <>
//                       <IconButton
//                         size="small"
//                         onClick={prevInterior}
//                         sx={{
//                           position: "absolute",
//                           top: "50%",
//                           left: 8,
//                           transform: "translateY(-50%)",
//                           bgcolor: "white",
//                           boxShadow: 2,
//                           zIndex: 1,
//                           "&:hover": { bgcolor: "#e8f5ee" },
//                         }}
//                       >
//                         <ChevronLeft />
//                       </IconButton>
//                       <IconButton
//                         size="small"
//                         onClick={nextInterior}
//                         sx={{
//                           position: "absolute",
//                           top: "50%",
//                           right: 8,
//                           transform: "translateY(-50%)",
//                           bgcolor: "white",
//                           boxShadow: 2,
//                           zIndex: 1,
//                           "&:hover": { bgcolor: "#e8f5ee" },
//                         }}
//                       >
//                         <ChevronRight />
//                       </IconButton>
//                     </>
//                   )}
//                   {/* Indicadores */}
//                   {filteredInteriorImages.length > 1 && (
//                     <Box
//                       sx={{
//                         position: "absolute",
//                         bottom: 8,
//                         left: 0,
//                         right: 0,
//                         display: "flex",
//                         justifyContent: "center",
//                         gap: 1,
//                       }}
//                     >
//                       {filteredInteriorImages.map((_, idx) => (
//                         <Box
//                           key={idx}
//                           sx={{
//                             width: 10,
//                             height: 10,
//                             borderRadius: "50%",
//                             bgcolor:
//                               interiorSlide === idx
//                                 ? "primary.main"
//                                 : "grey.400",
//                             transition: "background 0.3s",
//                           }}
//                         />
//                       ))}
//                     </Box>
//                   )}
//                 </Box>
//               </Box>
//             </motion.div>
//             {/* </Fade> */}
//           </Box>

//           {/* Botón de personalización */}
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "center",
//               mb: 3,
//               mt: "20%",
//               bgcolor: "transparent",
//             }}
//           >
//             <IconButton
//               color="primary"
//               size="large"
//               sx={{
//                 bgcolor: "white",
//                 boxShadow: 2,
//                 px: 3,
//                 py: 1.5,
//                 borderRadius: 3,
//                 transition: "box-shadow 0.3s, background 0.3s",
//                 "&:hover": { bgcolor: "#e8f5ee", boxShadow: 4 },
//               }}
//               onClick={() => setShowCustomization((v) => !v)}
//             >
//               <TuneIcon fontSize="large" />
//               <Typography sx={{ ml: 1, fontWeight: 600 }}>
//                 Customize and Compare
//               </Typography>
//             </IconButton>
//           </Box>

//           {/* Panel de personalización */}
//           <Slide
//             direction="left"
//             in={showCustomization}
//             mountOnEnter
//             unmountOnExit
//           >
//             <Box sx={{ mb: 3 }}>
//               <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 2 }}>
//                 <IconButton onClick={() => setShowCustomization(false)}>
//                   <CloseIcon />
//                 </IconButton>
//               </Box>
//               <ModelCustomizationPanel model={model} />
//             </Box>
//           </Slide>
//         </Box>
//       </MotionBox>
//     </Box>
//   );
// };

// export default ModelDetail;


import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
  Slide,
  Fade,
  Button,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  KingBed,
  Bathtub,
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
import { motion, useScroll, useTransform, AnimatePresence, transform } from "framer-motion";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const ModelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  
  // Ejemplo: cargar otro modelo para comparar (puedes hacerlo por selección, aquí es fijo)
  
  
  // ✅ ESTADOS BÁSICOS
  const [model, setModel] = useState(null);
  const [compareModel, setCompareModel] = useState(null);
  useEffect(() => {
    // Solo ejemplo: compara con el modelo 10 si no es el actual
    if (model && model._id !== "6977c7bbd1f24768968719de") {
      api.get("/models/6977c7bbd1f24768968719de").then(res => {
        setCompareModel(res.data);
      });
    } else {
      setCompareModel(null);
    }
  }, [model]);
  const [loading, setLoading] = useState(true);
  const [showCustomization, setShowCustomization] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // ✅ ESTADOS DE CARRUSELES
  const [baseSlide, setBaseSlide] = useState(0);
  const [syncCarousels, setSyncCarousels] = useState(true);
  const [blueprintSlide, setBlueprintSlide] = useState(0);
  const [interiorSlide, setInteriorSlide] = useState(0);

  // ✅ ESTADOS DE FILTROS
  const [interiorType, setInteriorType] = useState("basic");
  const [blueprintType, setBlueprintType] = useState("withoutBalcony");

  // // ✅ REFS
  // const principalRef = useRef(null);

  // // ✅ SCROLL ANIMATIONS
  // const { scrollYProgress } = useScroll({
  //   target: principalRef,
  //   offset: ["end end", "start start"],
  // });
  // const y = useTransform(scrollYProgress, [0, 0.2], [60, 0]);
  // const opacity = useTransform(scrollYProgress, [0.1, 0.085, 0.095], [0, 1]);

      const principalRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: principalRef,
    offset: ["end end", "start start"], // Cuando el final del principal llega al final del viewport, y cuando el inicio llega al inicio
  });
  // y: de 60px (abajo, oculto) a 0px (centrado)
  // opacity: de 0 (invisible) a 1 (visible)
  const y = useTransform(scrollYProgress, [0, 0.2], [60, 0]);
  const opacity = useTransform(scrollYProgress, [0.1, 0.085, 0.095], [0, 1]);
  
  // ✅ CONSTANTE PARA IDENTIFICAR EL MODELO 10
  const MODEL_10_ID = "6977c7bbd1f24768968719de";
  const isModel10 = model?._id === MODEL_10_ID;

  // ✅ LABELS CONDICIONALES PARA BLUEPRINTS
  const blueprintLabels = isModel10
    ? {
        without: "With Dining Room",
        with: "With Study",
        withoutIcon: Kitchen,
        withIcon: Home,
      }
    : {
        without: "Without Balcony",
        with: "Balcony",
        withoutIcon: Home,
        withIcon: Deck,
      };

  // Imágenes base del modelo (sin upgrades ni filtros)
const baseInteriorImages = Array.isArray(model?.images?.interior)
  ? model.images.interior
      .map((img) => (typeof img === "string" ? { url: img } : img))
      .filter((img) => img && img.url && img.url.trim() !== "")
  : [];

// Funciones de navegación para el carrusel base
const nextBase = () => {
  if (baseInteriorImages.length > 1) {
    setBaseSlide((prev) => (prev + 1) % baseInteriorImages.length);
  }
};
const prevBase = () => {
  if (baseInteriorImages.length > 1) {
    setBaseSlide((prev) => (prev - 1 + baseInteriorImages.length) % baseInteriorImages.length);
  }
};

  // ✅ FETCH MODEL ON MOUNT
  useEffect(() => {
    fetchModel();
  }, [id]);

  // ✅ RESET SLIDES AL CAMBIAR FILTROS
  useEffect(() => {
    setInteriorSlide(0);
    setImageLoading(true);

    const timer = setTimeout(() => {
      setImageLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [interiorType, blueprintType]);

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

  // ✅ PROCESAMIENTO DE IMÁGENES INTERIORES CON VALIDACIÓN COMPLETA
  let filteredInteriorImages = [];
  if (model) {
    // 🔹 CASO 1: MODELO 10 (Dining Room vs Study)
    if (isModel10) {
      if (blueprintType === "balcony") {
        // 🏠 WITH STUDY (balcony = estudio)
        if (interiorType === "basic") {
          // Basic Study: imágenes de balconies.interior
          filteredInteriorImages = Array.isArray(model.balconies)
            ? model.balconies.flatMap((balcony) =>
                Array.isArray(balcony.images?.interior)
                  ? balcony.images.interior
                      .map((img) => (typeof img === "string" ? { url: img } : img))
                      .filter((img) => img && img.url && img.url.trim() !== "")
                  : []
              )
            : [];
        } else {
          // ✅ Upgrade Study: imágenes de balconies.EXTERIOR (no interior)
          filteredInteriorImages = Array.isArray(model.upgrades)
            ? model.upgrades.flatMap((upgrade) =>
                Array.isArray(upgrade.images?.exterior)
                  ? upgrade.images.exterior
                      .map((img) => (typeof img === "string" ? { url: img } : img))
                      .filter((img) => img && img.url && img.url.trim() !== "")
                  : []
              )
            : [];
        }
      } else {
        // 🍽️ WITH DINING ROOM (withoutBalcony = comedor = base)
        if (interiorType === "basic") {
          // Basic Dining Room: imágenes del modelo base interior
          filteredInteriorImages = Array.isArray(model.images?.interior)
            ? model.images.interior
                .map((img) => (typeof img === "string" ? { url: img } : img))
                .filter((img) => img && img.url && img.url.trim() !== "")
            : [];
        } else {
          // ✅ Upgrade Dining Room: imágenes de upgrades.INTERIOR
          filteredInteriorImages = Array.isArray(model.upgrades)
            ? model.upgrades.flatMap((upg) =>
                Array.isArray(upg.images?.interior)
                  ? upg.images.interior
                      .map((img) => (typeof img === "string" ? { url: img } : img))
                      .filter((img) => img && img.url && img.url.trim() !== "")
                  : []
              )
            : [];
        }
      }
    }
    // 🔹 CASO 2: OTROS MODELOS (With/Without Balcony)
    else {
      if (blueprintType === "balcony") {
        // 🏖️ WITH BALCONY
        if (interiorType === "basic") {
          // Basic con balcón: imágenes de balconies.interior
          filteredInteriorImages = Array.isArray(model.balconies)
            ? model.balconies.flatMap((balcony) =>
                Array.isArray(balcony.images?.interior)
                  ? balcony.images.interior
                      .map((img) => (typeof img === "string" ? { url: img } : img))
                      .filter((img) => img && img.url && img.url.trim() !== "")
                  : []
              )
            : [];
        } else {
          // ✅ Upgrade con balcón: imágenes de balconies.EXTERIOR (no interior)
          filteredInteriorImages = Array.isArray(model.upgrades)
            ? model.upgrades.flatMap((upgrade) =>
                Array.isArray(upgrade.images?.exterior)
                  ? upgrade.images.exterior
                      .map((img) => (typeof img === "string" ? { url: img } : img))
                      .filter((img) => img && img.url && img.url.trim() !== "")
                  : []
              )
            : [];
        }
      } else {
        // 🏠 WITHOUT BALCONY (modelo base)
        if (interiorType === "basic") {
          // Basic sin balcón: imágenes del modelo base interior
          filteredInteriorImages = Array.isArray(model.images?.interior)
            ? model.images.interior
                .map((img) => (typeof img === "string" ? { url: img } : img))
                .filter((img) => img && img.url && img.url.trim() !== "")
            : [];
        } else {
          // ✅ Upgrade sin balcón: imágenes de upgrades.INTERIOR
          filteredInteriorImages = Array.isArray(model.upgrades)
            ? model.upgrades.flatMap((upg) =>
                Array.isArray(upg.images?.interior)
                  ? upg.images.interior
                      .map((img) => (typeof img === "string" ? { url: img } : img))
                      .filter((img) => img && img.url && img.url.trim() !== "")
                  : []
              )
            : [];
        }
      }
    }
  }
  
  // ✅ DEBUG LOG MEJORADO
  console.log("🔍 DEBUG INFO:", {
    isModel10,
    blueprintType,
    interiorType,
    filteredCount: filteredInteriorImages.length,
    source: blueprintType === "balcony" && interiorType === "upgrade" 
      ? "balconies.exterior" 
      : blueprintType === "balcony" && interiorType === "basic"
        ? "balconies.interior"
        : interiorType === "upgrade"
          ? "upgrades.interior"
          : "model.images.interior",
  });

  // ✅ PROCESAMIENTO DE BLUEPRINTS
  let filteredBlueprints = [];
  if (model) {
    filteredBlueprints =
      blueprintType === "balcony"
        ? model.blueprints?.withBalcony || []
        : model.blueprints?.default || [];
  }

  const nextInterior = () => {
    if (filteredInteriorImages.length > 1) {
      setInteriorSlide((prev) => {
        const next = (prev + 1) % filteredInteriorImages.length;
        if (syncCarousels && baseInteriorImages.length > 1) {
          setBaseSlide((prevLeft) => (prevLeft + 1) % baseInteriorImages.length);
        }
        return next;
      });
    }
  };
  
  const prevInterior = () => {
    if (filteredInteriorImages.length > 1) {
      setInteriorSlide((prev) => {
        const next = (prev - 1 + filteredInteriorImages.length) % filteredInteriorImages.length;
        if (syncCarousels && baseInteriorImages.length > 1) {
          setBaseSlide((prevLeft) => (prevLeft - 1 + baseInteriorImages.length) % baseInteriorImages.length);
        }
        return next;
      });
    }
  };

  // ✅ CARACTERÍSTICAS (FEATURES)
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


    const [showCompareSelector, setShowCompareSelector] = useState(false);
  const [allModels, setAllModels] = useState([]);
  
  useEffect(() => {
    api.get('/models').then(res => setAllModels(res.data));
  }, []);

  // ✅ LOADING STATE
  if (loading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Skeleton
          variant="rectangular"
          height={{ xs: 300, sm: 400, md: 450, lg: 700 }}
          sx={{
            width: "100%",
            mb: 4,
            borderRadius: { xs: 0, md: 4 },
          }}
        />

        <Box sx={{ p: { xs: 2, sm: 2, md: 3, lg: 4 } }}>
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}
          >
            <Skeleton variant="rounded" width={180} height={42} />
            <Skeleton variant="rounded" width={150} height={42} />
          </Box>

          <Box
            sx={{
              borderRadius: 4,
              p: { xs: 2, md: 3 },
              border: "1px solid rgba(0,0,0,0.08)",
              mb: 3,
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 4,
                    mb: 3,
                    justifyContent: "center",
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Skeleton variant="text" width={140} height={60} />
                    <Skeleton variant="text" width={80} height={24} />
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Skeleton variant="text" width={120} height={60} />
                    <Skeleton variant="text" width={60} height={24} />
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    gap: 4,
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ textAlign: "center" }}>
                      <Skeleton
                        variant="circular"
                        width={40}
                        height={40}
                        sx={{ mx: "auto", mb: 1 }}
                      />
                      <Skeleton
                        variant="text"
                        width={50}
                        height={40}
                        sx={{ mx: "auto" }}
                      />
                      <Skeleton
                        variant="text"
                        width={70}
                        height={20}
                        sx={{ mx: "auto" }}
                      />
                    </Box>
                  ))}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    justifyContent: "center",
                    flexWrap: "wrap",
                    mt: 2,
                  }}
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rounded" width={120} height={32} />
                  ))}
                </Box>
              </Grid>

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

          <Skeleton
            variant="rounded"
            sx={{
              width: { xs: "100%", md: "90%" },
              height: { xs: 250, sm: 350, md: 450 },
              mx: "auto",
              mt: 6,
              mb: 6,
              borderRadius: 4,
            }}
          />

          <Box sx={{ position: "relative", height: 500, mt: 10 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                position: "absolute",
                left: "10%",
                top: "20%",
              }}
            >
              <Skeleton variant="rounded" width={120} height={40} />
              <Skeleton variant="rounded" width={120} height={40} />
              <Skeleton
                variant="rectangular"
                width={220}
                height={80}
                sx={{ mt: 2, borderRadius: 2 }}
              />
            </Box>

            <Skeleton
              variant="rounded"
              sx={{
                position: { xs: "static", lg: "absolute" },
                right: { lg: "10%" },
                top: { lg: "50%" },
                transform: { lg: "translateY(-50%)" },
                width: { xs: "100%", lg: 600 },
                height: { xs: 220, sm: 340, md: 480, lg: 700 },
                borderRadius: 5,
                mt: { xs: 4, lg: 0 },
              }}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
            <Skeleton
              variant="rounded"
              width={260}
              height={56}
              sx={{ borderRadius: 3 }}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  if (!model) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5">Model not found</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/models")}
          sx={{ mt: 2 }}
        >
          Back to Models
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      mb: 4 
      }}>
      {/* ✅ VIDEO HEADER */}
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
          transition:
            "box-shadow 0.4s cubic-bezier(.4,0,.2,1), background 0.4s",
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
            transition:
              "box-shadow 0.4s cubic-bezier(.4,0,.2,1), background 0.4s",
          }}
        >
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

          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
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
                fontWeight: 600,
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
        <Box sx={{ p: { xs: 2, sm: 2, md: 3, lg: 4 } }}>
          {/* ✅ BOTONES DE BLUEPRINT CON FEEDBACK MEJORADO */}
          <Box
            sx={{
              display: "flex",
              margin: "0 auto",
              gap: 2,
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Button
              variant={
                blueprintType === "withoutBalcony" ? "contained" : "outlined"
              }
              color="primary"
              onClick={() => {
                setBlueprintType("withoutBalcony");
                setBlueprintSlide(0);
              }}
              startIcon={React.createElement(blueprintLabels.withoutIcon)}
              disabled={imageLoading}
              sx={{
                minWidth: { xs: 140, sm: 180 },
                py: 1.5,
                transition: "all 0.3s",
                ...(blueprintType === "withoutBalcony" && {
                  boxShadow: "0 4px 12px rgba(74,124,89,0.3)",
                }),
              }}
            >
              {blueprintLabels.without}
            </Button>
            <Button
              variant={blueprintType === "balcony" ? "contained" : "outlined"}
              color="primary"
              onClick={() => {
                setBlueprintType("balcony");
                setBlueprintSlide(0);
              }}
              startIcon={React.createElement(blueprintLabels.withIcon)}
              disabled={imageLoading}
              sx={{
                minWidth: { xs: 140, sm: 180 },
                py: 1.5,
                transition: "all 0.3s",
                ...(blueprintType === "balcony" && {
                  boxShadow: "0 4px 12px rgba(74,124,89,0.3)",
                }),
              }}
            >
              {blueprintLabels.with}
            </Button>
          </Box>

          {/* ✅ ALERT INFORMATIVO PARA MODELO 10 */}
          {isModel10 && (
            <Box sx={{ maxWidth: 800, mx: "auto", mb: 3 }}>
              <Alert
                severity="info"
                icon={
                  blueprintType === "balcony" ? (
                    <Home fontSize="small" />
                  ) : (
                    <Kitchen fontSize="small" />
                  )
                }
                sx={{
                  borderRadius: 2,
                  bgcolor: "rgba(33, 150, 243, 0.08)",
                  border: "1px solid rgba(33, 150, 243, 0.2)",
                }}
              >
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  {blueprintType === "balcony"
                    ? "🏠 Study Configuration"
                    : "🍽️ Dining Room Configuration"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6c757d" }}>
                  {blueprintType === "balcony"
                    ? "This layout includes a flexible Study space - perfect for a home office or additional living area."
                    : "This layout features a traditional Dining Room - ideal for family gatherings and entertaining."}
                </Typography>
              </Alert>
            </Box>
          )}

          {/* ✅ SPECIFICATIONS SECTION */}
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
                  {isModel10 ? (
                    <>
                      <Chip
                        icon={<Kitchen />}
                        label="Dining Room Option"
                        color="success"
                        variant="outlined"
                      />
                      <Chip
                        icon={<Home />}
                        label="Study Option"
                        color="info"
                        variant="outlined"
                      />
                    </>
                  ) : (
                    <>
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

                        {filteredBlueprints.length > 1 && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() =>
                                setBlueprintSlide(
                                  (prev) =>
                                    (prev - 1 + filteredBlueprints.length) %
                                    filteredBlueprints.length
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
                                  (prev) => (prev + 1) % filteredBlueprints.length
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

                        {filteredBlueprints.length > 1 && (
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
                            {filteredBlueprints.map((_, idx) => (
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

          {/* ✅ IMAGEN PRINCIPAL */}
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
              position: "relative",
              mb: 6,
              transition:
                "box-shadow 0.4s cubic-bezier(.4,0,.2,1), background 0.4s",
              "&:hover": {
                boxShadow: "0 16px 48px 0 rgba(74,124,89,0.18)",
              },
            }}
          >
            <Fade in timeout={700}>
              <Box
                component="img"
                src={
                  model.images?.exterior?.[2]?.url ||
                  model.images?.exterior?.[7] ||
                  "/images/placeholder-house.png"
                }
                alt={`Render of model ${model.modelNumber}`}
                loading="lazy"
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
          </Box>

                    {/* ✅ CARRUSEL INTERIOR BASE IZQUIERDA*/}

        <Box>
          <motion.div
            style={{
              position: "relative",
              // width: "100%",
              
              zIndex: 10,
              y,
              opacity,
              pointerEvents: opacity ? "auto" : "none",
            }}
          >
            <Box
              sx={{
                position: { xs: "static", md: "absolute", lg: "relative" },
                left: { xs: "auto", md: "0", lg: "-3%", xl: "-3%" },
                top: { xs: "auto", md: "55%" },
                transform: {
                  xs: "translateY(60%)",
                  sm: "translateY(0%)",
                  md: "translateY(0%)",
                  lg: "translateY(-15%)",
                  xl: "translateY(-15%)",
                  "2xl": "translateY(-120%)",
                },
                width: {
                  xs: "100%",
                  sm: "100%",
                  md: "100%",
                  lg: 550,
                  xl: 650,
                },
                height: { xs: 220, sm: 340, md: 480, lg: 550, xl: 600 },
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
              {/* Badge fijo para el carrusel base */}
              <Chip
                label="Base Interior"
                size="small"
                sx={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  zIndex: 10,
                  bgcolor: "rgba(74,124,89,0.95)",
                  color: "white",
                  fontWeight: 600,
                  backdropFilter: "blur(8px)",
                }}
              />

              {/* Carrusel base */}
              <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                <AnimatePresence mode="wait">
                  {baseInteriorImages.length > 0 ? (
                    <motion.div
                      key={baseSlide}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        component="img"
                        src={baseInteriorImages[baseSlide]?.url}
                        alt={`Base Interior ${baseSlide + 1}`}
                        loading="lazy"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          transition: "filter 0.3s",
                          filter: "brightness(0.97)",
                        }}
                        onError={(e) => {
                          e.target.src = "/images/placeholder-interior.png";
                        }}
                      />
                    </motion.div>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Home sx={{ fontSize: 60, color: "#ccc" }} />
                      <Typography color="text.secondary">
                        No base images available
                      </Typography>
                    </Box>
                  )}
                </AnimatePresence>

                {/* Flechas de navegación */}
                {baseInteriorImages.length > 1 && (
                  <>
                    <IconButton
                      size="small"
                      onClick={prevBase}
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: 8,
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(255,255,255,0.95)",
                        boxShadow: 2,
                        zIndex: 10,
                        "&:hover": {
                          bgcolor: "white",
                          transform: "scale(1.1) translateY(-50%)",
                        },
                      }}
                    >
                      <ChevronLeft />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={nextBase}
                      sx={{
                        position: "absolute",
                        top: "50%",
                        right: 8,
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(255,255,255,0.95)",
                        boxShadow: 2,
                        zIndex: 10,
                        "&:hover": {
                          bgcolor: "white",
                          transform: "scale(1.1) translateY(-50%)",
                        },
                      }}
                    >
                      <ChevronRight />
                    </IconButton>
                  </>
                )}

                {/* Contador */}
                {baseInteriorImages.length > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: { xs: 0.5, sm: 2, md: 4, lg: 6 },
                      left: "48%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {baseInteriorImages.map((_, idx) => (
                        <Box
                          key={idx}
                          onClick={() => setBaseSlide(idx)}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: baseSlide === idx ? "white" : "grey.500",
                            cursor: "pointer",
                            transition: "all 0.3s",
                            "&:hover": {
                              bgcolor: "#49e377ff",
                              transform: "scale(1.2)",
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </motion.div>
        </Box>

          {/* ✅ BOTONES BASIC/UPGRADE CON DESCRIPCIONES MEJORADAS */}
          <Box
            sx={{
              position: "absolute",
              display: { xs: "flex", md: "flex" },
              flexDirection: { xs: "column", lg: "column" },
              alignItems: "align-center",
              left: { xs: "9%", lg: "40.5%", xl: "42%" },
              transform: { xs: "translateY(-70%)",sm:"translateY(20%)",md:"translateY(25%)", lg: "translateY(-110%)", xl: "translateY(-150%)" },
              zIndex: 999,
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "column" },
                alignItems: { xs: "flex-start", md: "center" },
                gap: 2,
              }}
            >
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
                  startIcon={<Home />}
                  disabled={imageLoading}
                  sx={{
                    transition: "all 0.3s",
                    ...(interiorType === "basic" && {
                      boxShadow: "0 4px 12px rgba(74,124,89,0.3)",
                    }),
                  }}
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
                  disabled={imageLoading}
                  sx={{
                    transition: "all 0.3s",
                    ...(interiorType === "upgrade" && {
                      boxShadow: "0 4px 12px rgba(74,124,89,0.3)",
                    }),
                  }}
                >
                  Upgrade
                </Button>
              </Box>

              {/* ✅ DESCRIPCIÓN CONDICIONAL PARA MODELO 10 */}
              <Box
                sx={{
                  ml: { xs: 0, md: 2 },
                  mt: { xs: 2, md: 0 },
                  minWidth: 180,
                  maxWidth: 260,
                }}
              >
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {isModel10 && blueprintType === "balcony"
                    ? interiorType === "basic"
                      ? "Study Area (Basic)"
                      : "Study Area (Upgrade)"
                    : isModel10 && blueprintType === "withoutBalcony"
                      ? interiorType === "basic"
                        ? "Dining Room (Basic)"
                        : "Dining Room (Upgrade)"
                      : blueprintType === "balcony"
                        ? interiorType === "basic"
                          ? "With Balcony (Basic)"
                          : "With Balcony (Upgrade)"
                        : interiorType === "basic"
                          ? "Main Room (Basic)"
                          : "Main Room (Upgrade)"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {interiorType === "basic"
                    ? isModel10 && blueprintType === "balcony"
                      ? "Functional study space with natural lighting and essential finishes."
                      : isModel10 && blueprintType === "withoutBalcony"
                        ? "Cozy dining area with modern finishes, perfect for family meals."
                        : blueprintType === "balcony"
                          ? "Spacious interiors with balcony access and natural ventilation."
                          : "Standard, functional and bright space, ideal for everyday living."
                    : isModel10 && blueprintType === "balcony"
                      ? "Premium study with executive finishes, custom shelving and enhanced lighting."
                      : isModel10 && blueprintType === "withoutBalcony"
                        ? "Elegant dining room with premium materials and sophisticated design."
                        : blueprintType === "balcony"
                          ? "Luxury finishes with expanded balcony and panoramic views."
                          : "Premium finishes, more spacious and modern details for an exclusive atmosphere."}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              mt: 2, 
              mb: 2,
              transform: { xs: "translateY(1050%)", sm: "translateY(-300%)", md: "translateY(-250%)", lg: "translateY(0%)" },
              position:{sm:"relative"},
              left:{sm:"130%", lg:"0"}
              }}>
              <Button
                variant={syncCarousels ? "contained" : "outlined"}
                color="primary"
                onClick={() => setSyncCarousels((v) => !v)}
                sx={{ fontWeight: 600, px: 3, py: 1.5, borderRadius: 3 }}
              >
                {syncCarousels ? "Desynchronize carousels" : "Synchronize carousels"}
              </Button>
            </Box>

            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              mt: 2, 
              mb: 2,
              transform: { xs: "translateY(800%)", sm: "translateY(500%)", md: "translateY(800%)", lg: "translateY(0%)" },
              position:{xs:"relative",sm:"relative", md:"relative"},
              left:{xs:"0%",sm:"75%",md:"110%", lg:"0"}
              }}>
            <IconButton
              color="primary"
              size="large"
              sx={{
                bgcolor: "white",
                boxShadow: 2,
                px: 3,
                py: 1.5,
                borderRadius: 3,
                zIndex: 99,
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
          </Box>

          {/* ✅ CARRUSEL INTERIOR CON ANIMATEPRESENCE */}
          <Box
          
          >
            <motion.div
              style={{
                position: "relative",
                // width: "100%",
                height:0,
                zIndex: 10,
                y,
                opacity,
                pointerEvents: opacity ? "auto" : "none",
              }}
            >
              <Box
                sx={{
                  position: { xs: "static", md: "absolute", lg: "relative" },
                  left: { xs: "auto", md: "0", lg: "62%", xl: "61%" },
                  top: { xs: "auto", md: "55%" },
                  transform: {
                    xs: "translateY(60%)",
                    sm: "translateY(60%)",
                    md: "translateY(50%)",
                    lg: "translateY(-115%)",
                    xl: "translateY(-114%)",
                    '2xl': "translateY(-120%)",
                  },
                  width: {
                    xs: "100%",
                    sm: "100%",
                    md: "100%",
                    lg: 550,
                    xl: 650,
                  },
                  height: { xs: 220, sm: 340, md: 480, lg: 550, xl: 600 },
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
                {/* ✅ Badge de configuración actual */}
                <Chip
                  label={
                    isModel10
                      ? blueprintType === "balcony"
                        ? `Study ${interiorType === "basic" ? "(Basic)" : "(Upgrade)"}`
                        : `Dining Room ${interiorType === "basic" ? "(Basic)" : "(Upgrade)"}`
                      : blueprintType === "balcony"
                        ? `With Balcony ${interiorType === "basic" ? "(Basic)" : "(Upgrade)"}`
                        : `Without Balcony ${interiorType === "basic" ? "(Basic)" : "(Upgrade)"}`
                  }
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    zIndex: 10,
                    bgcolor: "rgba(74,124,89,0.95)",
                    color: "white",
                    fontWeight: 600,
                    backdropFilter: "blur(8px)",
                  }}
                />

                {/* ✅ Carrusel con AnimatePresence */}
                <Box
                  sx={{ position: "relative", width: "100%", height: "100%" }}
                >
                  {imageLoading ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                      }}
                    >
                      <CircularProgress size={60} sx={{ color: "#4a7c59" }} />
                    </Box>
                  ) : (
                    <AnimatePresence mode="wait">
                      {filteredInteriorImages.length > 0 ? (
                        <motion.div
                          key={`${interiorType}-${blueprintType}-${interiorSlide}`}
                          initial={{ opacity: 0, x: 100 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.4 }}
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            component="img"
                            src={filteredInteriorImages[interiorSlide]?.url}
                            alt={`Interior ${interiorSlide + 1}`}
                            loading="lazy"
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                              transition: "filter 0.3s",
                              filter: "brightness(0.97)",
                            }}
                            onError={(e) => {
                              e.target.src = "/images/placeholder-interior.png";
                            }}
                          />
                        </motion.div>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Home sx={{ fontSize: 60, color: "#ccc" }} />
                          <Typography color="text.secondary">
                            No images available for this configuration
                          </Typography>
                        </Box>
                      )}
                    </AnimatePresence>
                  )}

                  {/* Flechas de navegación */}
                  {filteredInteriorImages.length > 1 && !imageLoading && (
                    <>
                      <IconButton
                        size="small"
                        onClick={prevInterior}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: 8,
                          transform: "translateY(-50%)",
                          bgcolor: "rgba(255,255,255,0.95)",
                          boxShadow: 2,
                          zIndex: 10,
                          "&:hover": {
                            bgcolor: "white",
                            transform: "scale(1.1) translateY(-50%)",
                          },
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
                          bgcolor: "rgba(255,255,255,0.95)",
                          boxShadow: 2,
                          zIndex: 10,
                          "&:hover": {
                            bgcolor: "white",
                            transform: "scale(1.1) translateY(-50%)",
                          },
                        }}
                      >
                        <ChevronRight />
                      </IconButton>
                    </>
                  )}

                  {/* ✅ Contador actualizado */}
                  {filteredInteriorImages.length > 0 && !imageLoading && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: { xs: 0.5, sm: 2, md: 4, lg: 6 },
                        left: "48%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {filteredInteriorImages.map((_, idx) => (
                          <Box
                            key={idx}
                            onClick={() => setInteriorSlide(idx)}
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor:
                                interiorSlide === idx ? "white" : "grey.500",
                              cursor: "pointer",
                              transition: "all 0.3s",
                              "&:hover": {
                                bgcolor: "#49e377ff",
                                transform: "scale(1.2)",
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
              
            </motion.div>
                    {/* Botón de sincronización debajo de ambos carruseles */}
{/* <Box sx={{ 
  display: "flex", 
  justifyContent: "center", 
  mt: 2, 
  mb: 2,
  transform: { xs: "translateY(-500%)", sm: "translateY(0%)", md: "translateY(0%)", lg: "translateY(500%)" },
  }}>
  <Button
    variant={syncCarousels ? "contained" : "outlined"}
    color="primary"
    onClick={() => setSyncCarousels((v) => !v)}
    sx={{ fontWeight: 600, px: 3, py: 1.5, borderRadius: 3 }}
  >
    {syncCarousels ? "Dessincronizar carruseles" : "Sincronizar carruseles"}
  </Button>
</Box> */}

          </Box>



          {/* ✅ BOTÓN DE PERSONALIZACIÓN */}
          

          <Slide
            direction="left"
            in={showCustomization}
            mountOnEnter
            unmountOnExit
            sx={{
              position: { xs: "fixed", lg: "relative" }, // ✅ Fixed hasta lg, relative solo en lg+
              top: { xs: 0, lg: "auto" },
              left: { xs: 0, lg: "auto" },
              right: { xs: 0, lg: "auto" },
              bottom: { xs: 0, lg: "auto" },
              zIndex: 9999,
              bgcolor: { xs: "rgba(255,255,255,0.98)", lg: "transparent" },
              overflowY: { xs: "auto", lg: "visible" },
              maxHeight: { xs: "100vh", lg: "none" },
              boxShadow: { xs: "0 -4px 24px rgba(0,0,0,0.15)", lg: "none" },
            }}
          >
            <Box sx={{ mb: 3, p: { xs: 2, lg: 0 } }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 2 }}>
                <IconButton onClick={() => setShowCustomization(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowCompareSelector(true)}
                >
                  Compare with another model
                </Button>
              </Box>
              
              <ModelCustomizationPanel
                model={model}
                compareModel={compareModel}
              />
              
              {showCompareSelector && (
                <Box sx={{
                  position: 'fixed', 
                  top: 0, 
                  left: 0, 
                  width: '100vw', 
                  height: '100vh',
                  bgcolor: 'rgba(0,0,0,0.4)', 
                  zIndex: 10000,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <Paper sx={{ 
                    p: 3, 
                    minWidth: 320, 
                    maxWidth: 500,
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
                  }}>
                    <Typography variant="h6" mb={2} fontWeight="bold">
                      Select a model to compare
                    </Typography>
                    <Select
                      fullWidth
                      value={compareModel?._id || ""}
                      onChange={e => {
                        const id = e.target.value;
                        if (id === "") {
                          setCompareModel(null);
                        } else {
                          api.get(`/models/${id}`).then(res => setCompareModel(res.data));
                        }
                        setShowCompareSelector(false);
                      }}
                      MenuProps={{
                        disablePortal: true,
                        PaperProps: {
                          style: { zIndex: 10001 }
                        }
                      }}
                    >
                      <MenuItem value="">(This model)</MenuItem>
                      {allModels
                        .filter(m => m._id !== model._id)
                        .map(m => (
                          <MenuItem key={m._id} value={m._id}>
                            {m.model}
                          </MenuItem>
                        ))}
                    </Select>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button onClick={() => setShowCompareSelector(false)} variant="outlined">
                        Cancel
                      </Button>
                    </Box>
                  </Paper>
                </Box>
              )}
            </Box>
          </Slide>
        </Box>
      </MotionBox>
    </Box>
  );
};

export default ModelDetail;