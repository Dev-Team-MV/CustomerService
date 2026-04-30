// import {
//   Box, Typography, Grid, Button, TextField, MenuItem, Accordion, AccordionSummary, AccordionDetails, Stack, Badge
// } from '@mui/material';
// import {
//   Home, CloudUpload, ExpandMore, Balcony, Upgrade as UpgradeIcon, Storage as StorageIcon
// } from '@mui/icons-material';
// import ModelImageGrid from '../ModelImageGrid';

// const ModelImagesPanel = ({
//   formData,
//   setFormData,
//   currentImageType,
//   setCurrentImageType,
//   currentImageSection,
//   setCurrentImageSection,
//   currentRoomType,
//   setCurrentRoomType,
//   uploadingImage,
//   handleFileImageUploadLocal,
//   handleRemoveImageLocal,
//   handleToggleImageIsPublicLocal,
//   groupImagesByRoomType,
//   getRoomTypeName,
//   expandedAccordions,
//   handleAccordionChange,
//   t
// }) => {
  
//   // ✅ NUEVO: Handler para reordenar imágenes
//   const handleReorderImages = (section, type, reorderedImages) => {
//     const sectionKey = section === 'base' ? 'images' : `${section}Images`;
    
//     setFormData(prev => ({
//       ...prev,
//       [sectionKey]: {
//         ...prev[sectionKey],
//         [type]: reorderedImages
//       }
//     }));
    
//     console.log('📦 [ModelImagesPanel] Imágenes reordenadas:', {
//       section,
//       type,
//       count: reorderedImages.length,
//       newOrder: reorderedImages.map((img, idx) => ({
//         position: idx + 1,
//         url: typeof img === 'string' ? img : img.url,
//         isPublic: typeof img === 'object' ? img.isPublic : false
//       }))
//     });
//   };

//   return (
//     <Box
//       sx={{
//         width: { xs: "100%", md: "50%" },
//         display: "flex",
//         flexDirection: "column",
//         bgcolor: "#fafafa",
//         maxHeight: { xs: "55vh", md: "100%" },
//       }}
//     >
//       {/* Upload Controls */}
//       <Box
//         sx={{
//           p: { xs: 1.5, md: 2 },
//           borderBottom: "1px solid #e0e0e0",
//           bgcolor: "white",
//         }}
//       >
//         <Typography 
//           variant="caption" 
//           fontWeight={700} 
//           gutterBottom 
//           display="block"
//           sx={{
//             color: '#333F1F',
//             fontFamily: '"Poppins", sans-serif',
//             letterSpacing: '1px',
//             textTransform: 'uppercase',
//             fontSize: '0.7rem',
//             mb: 1
//           }}
//         >
//           {t('models:addImages')}
//         </Typography>
//         <Grid container spacing={0.5}>
//           <Grid item xs={12} sm={4}>
//             <TextField
//               fullWidth
//               size="small"
//               select
//               label="Section"
//               value={currentImageSection}
//               onChange={(e) => setCurrentImageSection(e.target.value)}
//               sx={{ "& .MuiInputBase-root": { fontSize: "0.875rem" } }}
//             >
//               <MenuItem value="base">Base</MenuItem>
//               {formData.hasBalcony && <MenuItem value="balcony">Balcony</MenuItem>}
//               {formData.hasUpgrade && <MenuItem value="upgrade">Upgrade</MenuItem>}
//               {formData.hasStorage && <MenuItem value="storage">Storage</MenuItem>}
//             </TextField>
//           </Grid>
//           <Grid item xs={currentImageType === "interior" ? 5 : 6} sm={currentImageType === "interior" ? 2.5 : 3}>
//             <TextField
//               fullWidth
//               size="small"
//               select
//               label="Type"
//               value={currentImageType}
//               onChange={(e) => {
//                 setCurrentImageType(e.target.value);
//                 if (e.target.value !== "interior") {
//                   setCurrentRoomType("general");
//                 }
//               }}
//               sx={{ "& .MuiInputBase-root": { fontSize: "0.875rem" } }}
//             >
//               <MenuItem value="exterior">Exterior</MenuItem>
//               <MenuItem value="interior">Interior</MenuItem>
//               <MenuItem value="blueprints">Blueprints</MenuItem>
//             </TextField>
//           </Grid>
//           {currentImageType === "interior" && (
//             <Grid item xs={7} sm={2.5}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 select
//                 label="Room"
//                 value={currentRoomType}
//                 onChange={(e) => setCurrentRoomType(e.target.value)}
//                 sx={{ "& .MuiInputBase-root": { fontSize: "0.875rem" } }}
//               >
//                 <MenuItem value="general">General</MenuItem>
//                 <MenuItem value="bedroom_closet">Bed+</MenuItem>
//                 <MenuItem value="bedroom_no_closet">Bed</MenuItem>
//                 <MenuItem value="bathroom">Bath</MenuItem>
//                 <MenuItem value="kitchen">Kitchen</MenuItem>
//                 <MenuItem value="living">Living</MenuItem>
//                 <MenuItem value="dining">Dining</MenuItem>
//                 <MenuItem value="garage">Garage</MenuItem>
//               </TextField>
//             </Grid>
//           )}
//           <Grid item xs={12} sm={currentImageType === "interior" ? 3 : 5}>
//             <Button
//               variant="contained"
//               component="label"
//               disabled={uploadingImage}
//               size="small"
//               fullWidth
//               startIcon={<CloudUpload />}
//               sx={{ 
//                 height: "40px", 
//                 fontSize: "0.75rem",
//                 borderRadius: 2,
//                 bgcolor: '#333F1F',
//                 fontFamily: '"Poppins", sans-serif',
//                 fontWeight: 600,
//                 '&:hover': {
//                   bgcolor: '#4a5d3a'
//                 }
//               }}
//             >
//               {uploadingImage ? "..." : "Upload"}
//               <input
//                 type="file"
//                 accept="image/*"
//                 hidden
//                 multiple
//                 onChange={handleFileImageUploadLocal}
//               />
//             </Button>
//           </Grid>
//         </Grid>
//       </Box>

//       {/* Accordions Preview */}
// <Box
//   sx={{
//     flex: 1,
//     overflowY: "auto",
//     overflowX: "hidden", // ✅ NUEVO: Prevenir scroll horizontal
//     p: { xs: 1, md: 2 },
//     "&::-webkit-scrollbar": { width: "6px" },
//     "&::-webkit-scrollbar-thumb": {
//       backgroundColor: "rgba(0,0,0,0.2)",
//       borderRadius: "3px",
//     },
//   }}
// >
//         {/* BASE MODEL ACCORDION */}
//         <Accordion
//           expanded={expandedAccordions.base}
//           onChange={handleAccordionChange("base")}
//           sx={{ mb: 0.5, "& .MuiAccordionSummary-root": { minHeight: { xs: 40, md: 48 } } }}
//         >
//           <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
//             <Box display="flex" alignItems="center" gap={0.5} width="100%">
//               <Home color="primary" fontSize="small" />
//               <Typography fontWeight="bold" fontSize={{ xs: "0.875rem", md: "1rem" }}>
//                 Base Model
//               </Typography>
//               <Badge
//                 badgeContent={
//                   formData.images.exterior.length +
//                   formData.images.interior.length +
//                   formData.images.blueprints.length
//                 }
//                 color="primary"
//                 sx={{ ml: "auto", mr: 1 }}
//               />
//             </Box>
//           </AccordionSummary>
//           <AccordionDetails sx={{ 
//   p: { xs: 1, md: 2 },
//   overflow: 'visible' // ✅ NUEVO: Permitir que el drag se vea fuera
// }}>
//             <Stack spacing={1.5}>
//               <Box>
//                 <Typography variant="caption" fontWeight="600" gutterBottom display="block">
//                   Exterior ({formData.images.exterior.length})
//                 </Typography>
//                 <ModelImageGrid
//                   images={formData.images.exterior}
//                   section="base"
//                   type="exterior"
//                   groupImagesByRoomType={groupImagesByRoomType}
//                   getRoomTypeName={getRoomTypeName}
//                   handleRemoveImage={handleRemoveImageLocal}
//                   handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
//                   onReorderImages={handleReorderImages}
//                   enableDragDrop={true}
//                 />
//               </Box>
//               <Box>
//                 <Typography variant="caption" fontWeight="600" gutterBottom display="block">
//                   Interior ({formData.images.interior.length})
//                 </Typography>
//                 <ModelImageGrid
//                   images={formData.images.interior}
//                   section="base"
//                   type="interior"
//                   groupImagesByRoomType={groupImagesByRoomType}
//                   getRoomTypeName={getRoomTypeName}
//                   handleRemoveImage={handleRemoveImageLocal}
//                   handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
//                   onReorderImages={handleReorderImages}
//                   enableDragDrop={true}
//                 />
//               </Box>
//               <Box>
//                 <Typography variant="caption" fontWeight="600" gutterBottom display="block">
//                   Blueprints ({formData.images.blueprints.length})
//                 </Typography>
//                 <ModelImageGrid
//                   images={formData.images.blueprints}
//                   section="base"
//                   type="blueprints"
//                   groupImagesByRoomType={groupImagesByRoomType}
//                   getRoomTypeName={getRoomTypeName}
//                   handleRemoveImage={handleRemoveImageLocal}
//                   handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
//                   onReorderImages={handleReorderImages}
//                   enableDragDrop={true}
//                 />
//               </Box>
//             </Stack>
//           </AccordionDetails>
//         </Accordion>

//         {/* BALCONY ACCORDION */}
//         {formData.hasBalcony && (
//           <Accordion
//             expanded={expandedAccordions.balcony}
//             onChange={handleAccordionChange("balcony")}
//             sx={{ mb: 0.5, "& .MuiAccordionSummary-root": { minHeight: { xs: 40, md: 48 } } }}
//           >
//             <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
//               <Box display="flex" alignItems="center" gap={0.5} width="100%">
//                 <Balcony color="info" fontSize="small" />
//                 <Typography fontWeight="bold" fontSize={{ xs: "0.875rem", md: "1rem" }}>
//                   With Balcony
//                 </Typography>
//                 <Badge
//                   badgeContent={
//                     formData.balconyImages.exterior.length +
//                     formData.balconyImages.interior.length +
//                     formData.balconyImages.blueprints.length
//                   }
//                   color="info"
//                   sx={{ ml: "auto", mr: 1 }}
//                 />
//               </Box>
//             </AccordionSummary>
//             <AccordionDetails sx={{ 
//   p: { xs: 1, md: 2 },
//   overflow: 'visible' // ✅ NUEVO: Permitir que el drag se vea fuera
// }}>
//               <Stack spacing={1.5}>
//                 <Box>
//                   <Typography variant="caption" fontWeight="600" gutterBottom display="block">
//                     Exterior ({formData.balconyImages.exterior.length})
//                   </Typography>
//                   <ModelImageGrid
//                     images={formData.balconyImages.exterior}
//                     section="balcony"
//                     type="exterior"
//                     groupImagesByRoomType={groupImagesByRoomType}
//                     getRoomTypeName={getRoomTypeName}
//                     handleRemoveImage={handleRemoveImageLocal}
//                     handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
//                     onReorderImages={handleReorderImages}
//                     enableDragDrop={true}
//                   />
//                 </Box>
//                 <Box>
//                   <Typography variant="caption" fontWeight="600" gutterBottom display="block">
//                     Interior ({formData.balconyImages.interior.length})
//                   </Typography>
//                   <ModelImageGrid
//                     images={formData.balconyImages.interior}
//                     section="balcony"
//                     type="interior"
//                     groupImagesByRoomType={groupImagesByRoomType}
//                     getRoomTypeName={getRoomTypeName}
//                     handleRemoveImage={handleRemoveImageLocal}
//                     handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
//                     onReorderImages={handleReorderImages}
//                     enableDragDrop={true}
//                   />
//                 </Box>
//                 <Box>
//                   <Typography variant="caption" fontWeight="600" gutterBottom display="block">
//                     Blueprints ({formData.balconyImages.blueprints.length})
//                   </Typography>
//                   <ModelImageGrid
//                     images={formData.balconyImages.blueprints}
//                     section="balcony"
//                     type="blueprints"
//                     groupImagesByRoomType={groupImagesByRoomType}
//                     getRoomTypeName={getRoomTypeName}
//                     handleRemoveImage={handleRemoveImageLocal}
//                     handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
//                     onReorderImages={handleReorderImages}
//                     enableDragDrop={true}
//                   />
//                 </Box>
//               </Stack>
//             </AccordionDetails>
//           </Accordion>
//         )}

//         {/* UPGRADE ACCORDION */}
//         {formData.hasUpgrade && (
//           <Accordion
//             expanded={expandedAccordions.upgrade}
//             onChange={handleAccordionChange("upgrade")}
//             sx={{ mb: 0.5, "& .MuiAccordionSummary-root": { minHeight: { xs: 40, md: 48 } } }}
//           >
//             <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
//               <Box display="flex" alignItems="center" gap={0.5} width="100%">
//                 <UpgradeIcon color="secondary" fontSize="small" />
//                 <Typography fontWeight="bold" fontSize={{ xs: "0.875rem", md: "1rem" }}>
//                   With Upgrade
//                 </Typography>
//                 <Badge
//                   badgeContent={
//                     formData.upgradeImages.exterior.length +
//                     formData.upgradeImages.interior.length +
//                     formData.upgradeImages.blueprints.length
//                   }
//                   color="secondary"
//                   sx={{ ml: "auto", mr: 1 }}
//                 />
//               </Box>
//             </AccordionSummary>
//             <AccordionDetails sx={{ 
//   p: { xs: 1, md: 2 },
//   overflow: 'visible' // ✅ NUEVO: Permitir que el drag se vea fuera
// }}>
//               <Stack spacing={1.5}>
//                 <Box>
//                   <Typography variant="caption" fontWeight="600" gutterBottom display="block">
//                     Exterior ({formData.upgradeImages.exterior.length})
//                   </Typography>
//                   <ModelImageGrid
//                     images={formData.upgradeImages.exterior}
//                     section="upgrade"
//                     type="exterior"
//                     groupImagesByRoomType={groupImagesByRoomType}
//                     getRoomTypeName={getRoomTypeName}
//                     handleRemoveImage={handleRemoveImageLocal}
//                     handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
//                     onReorderImages={handleReorderImages}
//                     enableDragDrop={true}
//                   />
//                 </Box>
//                 <Box>
//                   <Typography variant="caption" fontWeight="600" gutterBottom display="block">
//                     Interior ({formData.upgradeImages.interior.length})
//                   </Typography>
//                   <ModelImageGrid
//                     images={formData.upgradeImages.interior}
//                     section="upgrade"
//                     type="interior"
//                     groupImagesByRoomType={groupImagesByRoomType}
//                     getRoomTypeName={getRoomTypeName}
//                     handleRemoveImage={handleRemoveImageLocal}
//                     handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
//                     onReorderImages={handleReorderImages}
//                     enableDragDrop={true}
//                   />
//                 </Box>
//                 <Box>
//                   <Typography variant="caption" fontWeight="600" gutterBottom display="block">
//                     Blueprints ({formData.upgradeImages.blueprints.length})
//                   </Typography>
//                   <ModelImageGrid
//                     images={formData.upgradeImages.blueprints}
//                     section="upgrade"
//                     type="blueprints"
//                     groupImagesByRoomType={groupImagesByRoomType}
//                     getRoomTypeName={getRoomTypeName}
//                     handleRemoveImage={handleRemoveImageLocal}
//                     handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
//                     onReorderImages={handleReorderImages}
//                     enableDragDrop={true}
//                   />
//                 </Box>
//               </Stack>
//             </AccordionDetails>
//           </Accordion>
//         )}

//         {/* STORAGE ACCORDION */}
//         {formData.hasStorage && (
//           <Accordion
//             expanded={expandedAccordions.storage}
//             onChange={handleAccordionChange("storage")}
//             sx={{ mb: 0.5, "& .MuiAccordionSummary-root": { minHeight: { xs: 40, md: 48 } } }}
//           >
//             <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
//               <Box display="flex" alignItems="center" gap={0.5} width="100%">
//                 <StorageIcon color="success" fontSize="small" />
//                 <Typography fontWeight="bold" fontSize={{ xs: "0.875rem", md: "1rem" }}>
//                   With Storage
//                 </Typography>
//                 <Badge
//                   badgeContent={
//                     formData.storageImages.exterior.length +
//                     formData.storageImages.interior.length +
//                     formData.storageImages.blueprints.length
//                   }
//                   color="success"
//                   sx={{ ml: "auto", mr: 1 }}
//                 />
//               </Box>
//             </AccordionSummary>
//             <AccordionDetails sx={{ 
//   p: { xs: 1, md: 2 },
//   overflow: 'visible' // ✅ NUEVO: Permitir que el drag se vea fuera
// }}>
//               <Stack spacing={1.5}>
//                 <Box>
//                   <Typography variant="caption" fontWeight="600" gutterBottom display="block">
//                     Exterior ({formData.storageImages.exterior.length})
//                   </Typography>
//                   <ModelImageGrid
//                     images={formData.storageImages.exterior}
//                     section="storage"
//                     type="exterior"
//                     groupImagesByRoomType={groupImagesByRoomType}
//                     getRoomTypeName={getRoomTypeName}
//                     handleRemoveImage={handleRemoveImageLocal}
//                     handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
//                     onReorderImages={handleReorderImages}
//                     enableDragDrop={true}
//                   />
//                 </Box>
//                 <Box>
//                   <Typography variant="caption" fontWeight="600" gutterBottom display="block">
//                     Interior ({formData.storageImages.interior.length})
//                   </Typography>
//                   <ModelImageGrid
//                     images={formData.storageImages.interior}
//                     section="storage"
//                     type="interior"
//                     groupImagesByRoomType={groupImagesByRoomType}
//                     getRoomTypeName={getRoomTypeName}
//                     handleRemoveImage={handleRemoveImageLocal}
//                     handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
//                     onReorderImages={handleReorderImages}
//                     enableDragDrop={true}
//                   />
//                 </Box>
//                 <Box>
//                   <Typography variant="caption" fontWeight="600" gutterBottom display="block">
//                     Blueprints ({formData.storageImages.blueprints.length})
//                   </Typography>
//                   <ModelImageGrid
//                     images={formData.storageImages.blueprints}
//                     section="storage"
//                     type="blueprints"
//                     groupImagesByRoomType={groupImagesByRoomType}
//                     getRoomTypeName={getRoomTypeName}
//                     handleRemoveImage={handleRemoveImageLocal}
//                     handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
//                     onReorderImages={handleReorderImages}
//                     enableDragDrop={true}
//                   />
//                 </Box>
//               </Stack>
//             </AccordionDetails>
//           </Accordion>
//         )}
//       </Box>
//     </Box>
//   );
// };

// export default ModelImagesPanel;

import { useState } from 'react'
import {
  Box, Typography, Grid, Button, TextField, MenuItem, Accordion, AccordionSummary, AccordionDetails, Stack, Badge, Chip, Alert
} from '@mui/material'
import {
  Home, CloudUpload, ExpandMore, Balcony, Upgrade as UpgradeIcon, Storage as StorageIcon, SwapVert, Save, Cancel
} from '@mui/icons-material'
import ModelImageGrid from '../ModelImageGrid'
import api from '@shared/services/api'

const ModelImagesPanel = ({
  formData,
  setFormData,
  modelId,
  currentImageType,
  setCurrentImageType,
  currentImageSection,
  setCurrentImageSection,
  currentRoomType,
  setCurrentRoomType,
  uploadingImage,
  handleFileImageUploadLocal,
  handleRemoveImageLocal,
  handleToggleImageIsPublicLocal,
  groupImagesByRoomType,
  getRoomTypeName,
  expandedAccordions,
  handleAccordionChange,
  t
}) => {
  
  // ✅ NUEVO: Estado para modo reorganización
  const [reorderMode, setReorderMode] = useState(false)
  const [pendingReorders, setPendingReorders] = useState({})
  const [savingReorders, setSavingReorders] = useState(false)
  const [originalImages, setOriginalImages] = useState(null)

  // ✅ NUEVO: Activar modo reorganización
  const handleToggleReorderMode = () => {
    if (!reorderMode) {
      // Guardar estado original antes de activar modo
      setOriginalImages({
        images: JSON.parse(JSON.stringify(formData.images)),
        balconyImages: JSON.parse(JSON.stringify(formData.balconyImages)),
        upgradeImages: JSON.parse(JSON.stringify(formData.upgradeImages)),
        storageImages: JSON.parse(JSON.stringify(formData.storageImages))
      })
      setReorderMode(true)
    } else {
      setReorderMode(false)
      setPendingReorders({})
    }
  }

  // ✅ MODIFICADO: Handler para reordenar imágenes (ahora acumula cambios)
  const handleReorderImages = (section, type, reorderedImages) => {
    const key = `${section}-${type}`
    
    // Actualizar formData localmente para preview
    const sectionKey = section === 'base' ? 'images' : `${section}Images`
    setFormData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [type]: reorderedImages
      }
    }))
    
    // Si está en modo reorganización, acumular cambios
    if (reorderMode) {
      setPendingReorders(prev => ({
        ...prev,
        [key]: {
          section,
          type,
          newOrder: reorderedImages.map(img => ({
            url: typeof img === 'string' ? img : img.url,
            isPublic: typeof img === 'object' ? (img.isPublic !== false) : false
          }))
        }
      }))
      
      console.log(`📦 [Reorder Mode] Cambio acumulado para ${key}:`, {
        section,
        type,
        count: reorderedImages.length
      })
    }
  }

const handleSaveReorders = async () => {
  if (Object.keys(pendingReorders).length === 0) return
  
  try {
    setSavingReorders(true)
    
    console.log('💾 [Reorder Mode] Guardando reorganizaciones:', pendingReorders)
    
    // ✅ CAMBIO: Enviar secuencialmente para evitar conflictos de versión de Mongoose
    for (const reorder of Object.values(pendingReorders)) {
      const payload = {
        section: reorder.section,
        type: reorder.type,
        newOrder: reorder.newOrder,
        count: reorder.newOrder.length
      }
      
      // Agregar sectionId según la sección
      if (reorder.section === 'balcony' && formData.balconyId) {
        payload.balconyId = formData.balconyId
      } else if (reorder.section === 'upgrade' && formData.upgradeId) {
        payload.upgradeId = formData.upgradeId
      } else if (reorder.section === 'storage' && formData.storageId) {
        payload.storageId = formData.storageId
      }
      
      // Enviar uno por uno (await dentro del loop)
      await api.patch(`/models/${modelId}/images/reorder`, payload)
      console.log(`✅ Reorganización guardada: ${reorder.section}/${reorder.type}`)
    }
    
    // Limpiar cambios pendientes
    setPendingReorders({})
    setOriginalImages(null)
    setReorderMode(false)
    
    console.log('✅ [Reorder Mode] Todas las reorganizaciones guardadas exitosamente')
    alert('Reorganización guardada exitosamente')
  } catch (error) {
    console.error('❌ [Reorder Mode] Error guardando reorganizaciones:', error)
    alert(`Error: ${error.response?.data?.message || error.message}`)
  } finally {
    setSavingReorders(false)
  }
}

  // ✅ NUEVO: Cancelar reorganización
  const handleCancelReorder = () => {
    if (originalImages) {
      // Restaurar orden original
      setFormData(prev => ({
        ...prev,
        images: originalImages.images,
        balconyImages: originalImages.balconyImages,
        upgradeImages: originalImages.upgradeImages,
        storageImages: originalImages.storageImages
      }))
    }
    
    setPendingReorders({})
    setOriginalImages(null)
    setReorderMode(false)
    
    console.log('🔄 [Reorder Mode] Cambios cancelados, orden restaurado')
  }

  const pendingCount = Object.keys(pendingReorders).length

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "50%" },
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fafafa",
        maxHeight: { xs: "55vh", md: "100%" },
      }}
    >
      {/* ✅ NUEVO: Barra de modo reorganización */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: 'white' }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Button
            variant={reorderMode ? 'contained' : 'outlined'}
            startIcon={<SwapVert />}
            onClick={handleToggleReorderMode}
            size="small"
            disabled={!modelId}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              fontFamily: '"Poppins", sans-serif',
              bgcolor: reorderMode ? '#8CA551' : 'transparent',
              borderColor: '#8CA551',
              color: reorderMode ? 'white' : '#8CA551',
              '&:hover': {
                bgcolor: reorderMode ? '#7a9447' : 'rgba(140,165,81,0.1)',
                borderColor: '#7a9447'
              }
            }}
          >
            {reorderMode ? 'Modo Reorganización' : 'Reorganizar Imágenes'}
          </Button>
          
          {pendingCount > 0 && (
            <Chip
              label={`${pendingCount} cambio${pendingCount > 1 ? 's' : ''} pendiente${pendingCount > 1 ? 's' : ''}`}
              color="warning"
              size="small"
              sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
            />
          )}
        </Box>

        {/* ✅ NUEVO: Alert con botones de acción */}
        {reorderMode && (
          <Alert 
            severity={pendingCount > 0 ? "warning" : "info"}
            sx={{ mt: 2, borderRadius: 2 }}
            action={
              pendingCount > 0 ? (
                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<Save />}
                    onClick={handleSaveReorders}
                    disabled={savingReorders}
                    sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
                  >
                    {savingReorders ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={handleCancelReorder}
                    disabled={savingReorders}
                    sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
                  >
                    Cancelar
                  </Button>
                </Box>
              ) : null
            }
          >
            <Typography variant="body2" fontWeight={600}>
              {pendingCount > 0 
                ? 'Arrastra las imágenes para reorganizarlas. Haz clic en "Guardar" para aplicar los cambios.'
                : 'Modo reorganización activo. Arrastra las imágenes para cambiar su orden.'}
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Upload Controls - Solo visible cuando NO está en modo reorganización */}
      {!reorderMode && (
        <Box
          sx={{
            p: { xs: 1.5, md: 2 },
            borderBottom: "1px solid #e0e0e0",
            bgcolor: "white",
          }}
        >
          <Typography 
            variant="caption" 
            fontWeight={700} 
            gutterBottom 
            display="block"
            sx={{
              color: '#333F1F',
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              mb: 1
            }}
          >
            {t('models:addImages')}
          </Typography>
          <Grid container spacing={0.5}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                select
                label="Section"
                value={currentImageSection}
                onChange={(e) => setCurrentImageSection(e.target.value)}
                sx={{ "& .MuiInputBase-root": { fontSize: "0.875rem" } }}
              >
                <MenuItem value="base">Base</MenuItem>
                {formData.hasBalcony && <MenuItem value="balcony">Balcony</MenuItem>}
                {formData.hasUpgrade && <MenuItem value="upgrade">Upgrade</MenuItem>}
                {formData.hasStorage && <MenuItem value="storage">Storage</MenuItem>}
              </TextField>
            </Grid>
            <Grid item xs={currentImageType === "interior" ? 5 : 6} sm={currentImageType === "interior" ? 2.5 : 3}>
              <TextField
                fullWidth
                size="small"
                select
                label="Type"
                value={currentImageType}
                onChange={(e) => {
                  setCurrentImageType(e.target.value);
                  if (e.target.value !== "interior") {
                    setCurrentRoomType("general");
                  }
                }}
                sx={{ "& .MuiInputBase-root": { fontSize: "0.875rem" } }}
              >
                <MenuItem value="exterior">Exterior</MenuItem>
                <MenuItem value="interior">Interior</MenuItem>
                <MenuItem value="blueprints">Blueprints</MenuItem>
              </TextField>
            </Grid>
            {currentImageType === "interior" && (
              <Grid item xs={7} sm={2.5}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Room"
                  value={currentRoomType}
                  onChange={(e) => setCurrentRoomType(e.target.value)}
                  sx={{ "& .MuiInputBase-root": { fontSize: "0.875rem" } }}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="bedroom_closet">Bed+</MenuItem>
                  <MenuItem value="bedroom_no_closet">Bed</MenuItem>
                  <MenuItem value="bathroom">Bath</MenuItem>
                  <MenuItem value="kitchen">Kitchen</MenuItem>
                  <MenuItem value="living">Living</MenuItem>
                  <MenuItem value="dining">Dining</MenuItem>
                  <MenuItem value="garage">Garage</MenuItem>
                </TextField>
              </Grid>
            )}
            <Grid item xs={12} sm={currentImageType === "interior" ? 3 : 5}>
              <Button
                variant="contained"
                component="label"
                disabled={uploadingImage}
                size="small"
                fullWidth
                startIcon={<CloudUpload />}
                sx={{ 
                  height: "40px", 
                  fontSize: "0.75rem",
                  borderRadius: 2,
                  bgcolor: '#333F1F',
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#4a5d3a'
                  }
                }}
              >
                {uploadingImage ? "..." : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  multiple
                  onChange={handleFileImageUploadLocal}
                />
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Accordions Preview */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          p: { xs: 1, md: 2 },
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: "3px",
          },
        }}
      >
        {/* BASE MODEL ACCORDION */}
        <Accordion
          expanded={expandedAccordions.base}
          onChange={handleAccordionChange("base")}
          sx={{ mb: 0.5, "& .MuiAccordionSummary-root": { minHeight: { xs: 40, md: 48 } } }}
        >
          <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
            <Box display="flex" alignItems="center" gap={0.5} width="100%">
              <Home color="primary" fontSize="small" />
              <Typography fontWeight="bold" fontSize={{ xs: "0.875rem", md: "1rem" }}>
                Base Model
              </Typography>
              <Badge
                badgeContent={
                  formData.images.exterior.length +
                  formData.images.interior.length +
                  formData.images.blueprints.length
                }
                color="primary"
                sx={{ ml: "auto", mr: 1 }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: { xs: 1, md: 2 }, overflow: 'visible' }}>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                  Exterior ({formData.images.exterior.length})
                </Typography>
                <ModelImageGrid
                  images={formData.images.exterior}
                  section="base"
                  type="exterior"
                  groupImagesByRoomType={groupImagesByRoomType}
                  getRoomTypeName={getRoomTypeName}
                  handleRemoveImage={handleRemoveImageLocal}
                  handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
                  onReorderImages={handleReorderImages}
                  enableDragDrop={reorderMode}
                />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                  Interior ({formData.images.interior.length})
                </Typography>
                <ModelImageGrid
                  images={formData.images.interior}
                  section="base"
                  type="interior"
                  groupImagesByRoomType={groupImagesByRoomType}
                  getRoomTypeName={getRoomTypeName}
                  handleRemoveImage={handleRemoveImageLocal}
                  handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
                  onReorderImages={handleReorderImages}
                  enableDragDrop={reorderMode}
                />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                  Blueprints ({formData.images.blueprints.length})
                </Typography>
                <ModelImageGrid
                  images={formData.images.blueprints}
                  section="base"
                  type="blueprints"
                  groupImagesByRoomType={groupImagesByRoomType}
                  getRoomTypeName={getRoomTypeName}
                  handleRemoveImage={handleRemoveImageLocal}
                  handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
                  onReorderImages={handleReorderImages}
                  enableDragDrop={reorderMode}
                />
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* BALCONY ACCORDION */}
        {formData.hasBalcony && (
          <Accordion
            expanded={expandedAccordions.balcony}
            onChange={handleAccordionChange("balcony")}
            sx={{ mb: 0.5, "& .MuiAccordionSummary-root": { minHeight: { xs: 40, md: 48 } } }}
          >
            <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
              <Box display="flex" alignItems="center" gap={0.5} width="100%">
                <Balcony color="info" fontSize="small" />
                <Typography fontWeight="bold" fontSize={{ xs: "0.875rem", md: "1rem" }}>
                  With Balcony
                </Typography>
                <Badge
                  badgeContent={
                    formData.balconyImages.exterior.length +
                    formData.balconyImages.interior.length +
                    formData.balconyImages.blueprints.length
                  }
                  color="info"
                  sx={{ ml: "auto", mr: 1 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: 1, md: 2 }, overflow: 'visible' }}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                    Exterior ({formData.balconyImages.exterior.length})
                  </Typography>
                  <ModelImageGrid
                    images={formData.balconyImages.exterior}
                    section="balcony"
                    type="exterior"
                    groupImagesByRoomType={groupImagesByRoomType}
                    getRoomTypeName={getRoomTypeName}
                    handleRemoveImage={handleRemoveImageLocal}
                    handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
                    onReorderImages={handleReorderImages}
                    enableDragDrop={reorderMode}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                    Interior ({formData.balconyImages.interior.length})
                  </Typography>
                  <ModelImageGrid
                    images={formData.balconyImages.interior}
                    section="balcony"
                    type="interior"
                    groupImagesByRoomType={groupImagesByRoomType}
                    getRoomTypeName={getRoomTypeName}
                    handleRemoveImage={handleRemoveImageLocal}
                    handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
                    onReorderImages={handleReorderImages}
                    enableDragDrop={reorderMode}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                    Blueprints ({formData.balconyImages.blueprints.length})
                  </Typography>
                  <ModelImageGrid
                    images={formData.balconyImages.blueprints}
                    section="balcony"
                    type="blueprints"
                    groupImagesByRoomType={groupImagesByRoomType}
                    getRoomTypeName={getRoomTypeName}
                    handleRemoveImage={handleRemoveImageLocal}
                    handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
                    onReorderImages={handleReorderImages}
                    enableDragDrop={reorderMode}
                  />
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}

        {/* UPGRADE ACCORDION */}
        {formData.hasUpgrade && (
          <Accordion
            expanded={expandedAccordions.upgrade}
            onChange={handleAccordionChange("upgrade")}
            sx={{ mb: 0.5, "& .MuiAccordionSummary-root": { minHeight: { xs: 40, md: 48 } } }}
          >
            <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
              <Box display="flex" alignItems="center" gap={0.5} width="100%">
                <UpgradeIcon color="secondary" fontSize="small" />
                <Typography fontWeight="bold" fontSize={{ xs: "0.875rem", md: "1rem" }}>
                  With Upgrade
                </Typography>
                <Badge
                  badgeContent={
                    formData.upgradeImages.exterior.length +
                    formData.upgradeImages.interior.length +
                    formData.upgradeImages.blueprints.length
                  }
                  color="secondary"
                  sx={{ ml: "auto", mr: 1 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: 1, md: 2 }, overflow: 'visible' }}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                    Exterior ({formData.upgradeImages.exterior.length})
                  </Typography>
                  <ModelImageGrid
                    images={formData.upgradeImages.exterior}
                    section="upgrade"
                    type="exterior"
                    groupImagesByRoomType={groupImagesByRoomType}
                    getRoomTypeName={getRoomTypeName}
                    handleRemoveImage={handleRemoveImageLocal}
                    handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
                    onReorderImages={handleReorderImages}
                    enableDragDrop={reorderMode}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                    Interior ({formData.upgradeImages.interior.length})
                  </Typography>
                  <ModelImageGrid
                    images={formData.upgradeImages.interior}
                    section="upgrade"
                    type="interior"
                    groupImagesByRoomType={groupImagesByRoomType}
                    getRoomTypeName={getRoomTypeName}
                    handleRemoveImage={handleRemoveImageLocal}
                    handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
                    onReorderImages={handleReorderImages}
                    enableDragDrop={reorderMode}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                    Blueprints ({formData.upgradeImages.blueprints.length})
                  </Typography>
                  <ModelImageGrid
                    images={formData.upgradeImages.blueprints}
                    section="upgrade"
                    type="blueprints"
                    groupImagesByRoomType={groupImagesByRoomType}
                    getRoomTypeName={getRoomTypeName}
                    handleRemoveImage={handleRemoveImageLocal}
                    handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
                    onReorderImages={handleReorderImages}
                    enableDragDrop={reorderMode}
                  />
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}

        {/* STORAGE ACCORDION */}
        {formData.hasStorage && (
          <Accordion
            expanded={expandedAccordions.storage}
            onChange={handleAccordionChange("storage")}
            sx={{ mb: 0.5, "& .MuiAccordionSummary-root": { minHeight: { xs: 40, md: 48 } } }}
          >
            <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
              <Box display="flex" alignItems="center" gap={0.5} width="100%">
                <StorageIcon color="success" fontSize="small" />
                <Typography fontWeight="bold" fontSize={{ xs: "0.875rem", md: "1rem" }}>
                  With Storage
                </Typography>
                <Badge
                  badgeContent={
                    formData.storageImages.exterior.length +
                    formData.storageImages.interior.length +
                    formData.storageImages.blueprints.length
                  }
                  color="success"
                  sx={{ ml: "auto", mr: 1 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: 1, md: 2 }, overflow: 'visible' }}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                    Exterior ({formData.storageImages.exterior.length})
                  </Typography>
                  <ModelImageGrid
                    images={formData.storageImages.exterior}
                    section="storage"
                    type="exterior"
                    groupImagesByRoomType={groupImagesByRoomType}
                    getRoomTypeName={getRoomTypeName}
                    handleRemoveImage={handleRemoveImageLocal}
                    handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
                    onReorderImages={handleReorderImages}
                    enableDragDrop={reorderMode}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                    Interior ({formData.storageImages.interior.length})
                  </Typography>
                  <ModelImageGrid
                    images={formData.storageImages.interior}
                    section="storage"
                    type="interior"
                    groupImagesByRoomType={groupImagesByRoomType}
                    getRoomTypeName={getRoomTypeName}
                    handleRemoveImage={handleRemoveImageLocal}
                    handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
                    onReorderImages={handleReorderImages}
                    enableDragDrop={reorderMode}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight="600" gutterBottom display="block">
                    Blueprints ({formData.storageImages.blueprints.length})
                  </Typography>
                  <ModelImageGrid
                    images={formData.storageImages.blueprints}
                    section="storage"
                    type="blueprints"
                    groupImagesByRoomType={groupImagesByRoomType}
                    getRoomTypeName={getRoomTypeName}
                    handleRemoveImage={handleRemoveImageLocal}
                    handleToggleImageIsPublic={handleToggleImageIsPublicLocal}
                    onReorderImages={handleReorderImages}
                    enableDragDrop={reorderMode}
                  />
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    </Box>
  )
}

export default ModelImagesPanel