import { Grid, Stack, Box, Typography, Chip } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ImagePreview from '../../components/ImgPreview';

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  ...draggableStyle,
  transition: 'transform 0.2s, box-shadow 0.2s',
});

const ModelImageGrid = ({
  images = [],
  section,
  type,
  groupImagesByRoomType,
  getRoomTypeName,
  handleRemoveImage,
  handleToggleImageIsPublic,
  onReorderImages,
  enableDragDrop = true
}) => {
  
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const reorderedImages = Array.from(images);
    const [removed] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, removed);

    if (onReorderImages) {
      onReorderImages(section, type, reorderedImages);
    }
  };

  // INTERIOR grouped rendering
  if (type === "interior" && images.length > 0) {
    const grouped = groupImagesByRoomType(images);
    
    if (!enableDragDrop) {
      // Renderizado sin drag-and-drop (fallback)
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
                      <Box sx={{ position: 'relative', pt: '75%' }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%'
                          }}
                        >
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
                              border: '1px solid #e0e0e0'
                            }}
                            imgSx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
        </Stack>
      );
    }

    // ✅ CON drag-and-drop: Reordenar todas las imágenes interiores
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`${section}-${type}-droppable`}>
          {(provided) => (
            <Stack 
              spacing={1.5}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
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
                      {roomImages.map(({ url, originalIndex, isPublic }) => {
                        const draggableId = `${section}-${type}-${originalIndex}`;
                        
                        return (
                          <Draggable key={draggableId} draggableId={draggableId} index={originalIndex}>
                            {(provided, snapshot) => (
                              <Grid 
                                item 
                                xs={6}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                <Box 
                                  sx={{ 
                                    position: 'relative',
                                    width: '100%',
                                    paddingTop: '75%',
                                    borderRadius: 1,
                                    border: snapshot.isDragging 
                                      ? '2px solid #8CA551' 
                                      : '1px solid #e0e0e0',
                                    boxShadow: snapshot.isDragging
                                      ? '0 8px 24px rgba(140,165,81,0.3)'
                                      : 'none',
                                    bgcolor: 'white',
                                    overflow: 'hidden'
                                  }}
                                >
                                  {/* Drag Handle */}
                                  <Box
                                    {...provided.dragHandleProps}
                                    sx={{
                                      position: 'absolute',
                                      top: 8,
                                      right: 8,
                                      zIndex: 10,
                                      bgcolor: 'rgba(0,0,0,0.6)',
                                      borderRadius: 1,
                                      p: 0.5,
                                      cursor: 'grab',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      '&:active': {
                                        cursor: 'grabbing'
                                      },
                                      '&:hover': {
                                        bgcolor: 'rgba(0,0,0,0.8)'
                                      }
                                    }}
                                  >
                                    <DragIndicatorIcon sx={{ color: 'white', fontSize: 18 }} />
                                  </Box>

                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%'
                                    }}
                                  >
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
                                        borderRadius: 1
                                      }}
                                      imgSx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                  </Box>

                                  {/* Order indicator */}
                                  <Chip
                                    label={`#${originalIndex + 1}`}
                                    size="small"
                                    sx={{
                                      position: "absolute",
                                      bottom: 8,
                                      right: 8,
                                      height: 18,
                                      fontSize: "0.65rem",
                                      bgcolor: 'rgba(0,0,0,0.6)',
                                      color: 'white',
                                      zIndex: 5
                                    }}
                                  />
                                </Box>
                              </Grid>
                            )}
                          </Draggable>
                        );
                      })}
                    </Grid>
                  </Box>
                ))}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  // EXTERIOR / BLUEPRINTS rendering
  if (images.length > 0) {
    if (!enableDragDrop) {
      // Renderizado sin drag-and-drop (fallback)
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

    // ✅ Renderizado CON drag-and-drop
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`${section}-${type}-droppable`}>
          {(provided) => (
            <Grid 
              container 
              spacing={1}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {images.map((item, index) => {
                const src = typeof item === "string" ? item : (item?.url || "");
                const isPublic = typeof item === "object" ? !!item.isPublic : false;
                const draggableId = `${section}-${type}-${index}`;
                
                return (
                  <Draggable key={draggableId} draggableId={draggableId} index={index}>
                    {(provided, snapshot) => (
                      <Grid 
                        item 
                        xs={6}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <Box 
                          sx={{ 
                            position: 'relative',
                            width: '100%',
                            paddingTop: '75%',
                            borderRadius: 1,
                            border: snapshot.isDragging 
                              ? '2px solid #8CA551' 
                              : '1px solid #e0e0e0',
                            boxShadow: snapshot.isDragging
                              ? '0 8px 24px rgba(140,165,81,0.3)'
                              : 'none',
                            bgcolor: 'white',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Drag Handle Icon */}
                          <Box
                            {...provided.dragHandleProps}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              zIndex: 10,
                              bgcolor: 'rgba(0,0,0,0.6)',
                              borderRadius: 1,
                              p: 0.5,
                              cursor: 'grab',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '&:active': {
                                cursor: 'grabbing'
                              },
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.8)'
                              }
                            }}
                          >
                            <DragIndicatorIcon sx={{ color: 'white', fontSize: 18 }} />
                          </Box>

                          {/* ImagePreview */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%'
                            }}
                          >
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
                                borderRadius: 1
                              }}
                              imgSx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </Box>
                          
                          {type === "exterior" && index === 0 && (
                            <Chip
                              label="Primary"
                              size="small"
                              color="primary"
                              sx={{
                                position: "absolute",
                                bottom: 8,
                                left: 8,
                                height: 18,
                                fontSize: "0.65rem",
                                zIndex: 5
                              }}
                            />
                          )}

                          {/* Order indicator */}
                          <Chip
                            label={`#${index + 1}`}
                            size="small"
                            sx={{
                              position: "absolute",
                              bottom: 8,
                              right: 8,
                              height: 18,
                              fontSize: "0.65rem",
                              bgcolor: 'rgba(0,0,0,0.6)',
                              color: 'white',
                              zIndex: 5
                            }}
                          />
                        </Box>
                      </Grid>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>
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