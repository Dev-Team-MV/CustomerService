import { Grid, Stack, Box, Typography, Chip } from '@mui/material';
import ImagePreview from '../../components/ImgPreview';

const ModelImageGrid = ({
  images = [],
  section,
  type,
  groupImagesByRoomType,
  getRoomTypeName,
  handleRemoveImage,
  handleToggleImageIsPublic
}) => {
  // INTERIOR grouped rendering
  if (type === "interior" && images.length > 0) {
    const grouped = groupImagesByRoomType(images);
    return (
      <Stack spacing={1.5}>
        {Object.entries(grouped)
          .filter(([_, roomImages]) => roomImages.length > 0)
          .map(([roomType, roomImages]) => (
            <Box key={roomType}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 0.5,
                  pb: 0.5,
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight="600"
                  color="text.secondary"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    fontSize: "0.7rem",
                  }}
                >
                  {getRoomTypeName(roomType)} ({roomImages.length})
                </Typography>
              </Box>
              <Grid container spacing={1}>
                {roomImages.map(({ url, originalIndex, isPublic }) => (
                  <Grid item xs={6} key={`${type}-${originalIndex}`}>
                    <ImagePreview
                      src={url}
                      alt={`${type} ${originalIndex + 1}`}
                      isPublic={!!isPublic}
                      onTogglePublic={checked =>
                        handleToggleImageIsPublic(section, type, originalIndex, checked)
                      }
                      onDelete={() =>
                        handleRemoveImage(section, type, originalIndex)
                      }
                      showSwitch={true}
                      switchPosition="top-left"
                      sx={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 1,
                        border: '1px solid #e0e0e0',
                        position: 'relative',
                      }}
                      imgSx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
      </Stack>
    );
  }

  // EXTERIOR / BLUEPRINTS rendering
  if (images.length > 0) {
    return (
      <Grid container spacing={1}>
        {images.map((item, index) => {
          const src = typeof item === "string" ? item : (item?.url || "");
          const isPublic = typeof item === "object" ? !!item.isPublic : false;
          return (
            <Grid item xs={6} key={`${type}-${index}`}>
              <Box sx={{ position: 'relative', pt: '75%' }}>
                <ImagePreview
                  src={src}
                  alt={`${type} ${index + 1}`}
                  isPublic={isPublic}
                  onTogglePublic={checked =>
                    handleToggleImageIsPublic(section, type, index, checked)
                  }
                  onDelete={() =>
                    handleRemoveImage(section, type, index)
                  }
                  showSwitch={true}
                  switchPosition="top-left"
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                  imgSx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  label={type === "exterior" && index === 0 ? "Primary" : undefined}
                />
                {type === "exterior" && index === 0 && (
                  <Chip
                    label="Primary"
                    size="small"
                    color="primary"
                    sx={{
                      position: "absolute",
                      bottom: 4,
                      left: 4,
                      height: 18,
                      fontSize: "0.65rem",
                    }}
                  />
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    );
  }

  // Sin imágenes
  return (
    <Box sx={{ p: 1.5, textAlign: "center", bgcolor: "grey.100", borderRadius: 1 }}>
      <Typography variant="caption" color="text.secondary">
        No {type} images
      </Typography>
    </Box>
  );
};

export default ModelImageGrid;