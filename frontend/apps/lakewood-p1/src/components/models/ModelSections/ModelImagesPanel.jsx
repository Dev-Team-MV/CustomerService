import {
  Box, Typography, Grid, Button, TextField, MenuItem, Accordion, AccordionSummary, AccordionDetails, Stack, Badge
} from '@mui/material';
import {
  Home, CloudUpload, ExpandMore, Balcony, Upgrade as UpgradeIcon, Storage as StorageIcon
} from '@mui/icons-material';
import ModelImageGrid from '../ModelImageGrid';

const ModelImagesPanel = ({
  formData,
  setFormData,
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
  
  // ✅ NUEVO: Handler para reordenar imágenes
  const handleReorderImages = (section, type, reorderedImages) => {
    const sectionKey = section === 'base' ? 'images' : `${section}Images`;
    
    setFormData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [type]: reorderedImages
      }
    }));
    
    console.log('📦 [ModelImagesPanel] Imágenes reordenadas:', {
      section,
      type,
      count: reorderedImages.length,
      newOrder: reorderedImages.map((img, idx) => ({
        position: idx + 1,
        url: typeof img === 'string' ? img : img.url,
        isPublic: typeof img === 'object' ? img.isPublic : false
      }))
    });
  };

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
      {/* Upload Controls */}
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

      {/* Accordions Preview */}
<Box
  sx={{
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden", // ✅ NUEVO: Prevenir scroll horizontal
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
          <AccordionDetails sx={{ 
  p: { xs: 1, md: 2 },
  overflow: 'visible' // ✅ NUEVO: Permitir que el drag se vea fuera
}}>
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
                  enableDragDrop={true}
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
                  enableDragDrop={true}
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
                  enableDragDrop={true}
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
            <AccordionDetails sx={{ 
  p: { xs: 1, md: 2 },
  overflow: 'visible' // ✅ NUEVO: Permitir que el drag se vea fuera
}}>
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
                    enableDragDrop={true}
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
                    enableDragDrop={true}
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
                    enableDragDrop={true}
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
            <AccordionDetails sx={{ 
  p: { xs: 1, md: 2 },
  overflow: 'visible' // ✅ NUEVO: Permitir que el drag se vea fuera
}}>
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
                    enableDragDrop={true}
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
                    enableDragDrop={true}
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
                    enableDragDrop={true}
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
            <AccordionDetails sx={{ 
  p: { xs: 1, md: 2 },
  overflow: 'visible' // ✅ NUEVO: Permitir que el drag se vea fuera
}}>
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
                    enableDragDrop={true}
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
                    enableDragDrop={true}
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
                    enableDragDrop={true}
                  />
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    </Box>
  );
};

export default ModelImagesPanel;