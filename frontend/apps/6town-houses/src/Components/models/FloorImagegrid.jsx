import { Box, Chip, IconButton, Tooltip } from '@mui/material'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { Delete } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

const FloorImageGrid = ({
  images = [],
  floorKey,
  mediaType,
  color,
  onReorderImages,
  onDeleteImage,
  editMode = false,
  enableDragDrop = false
}) => {
  const theme = useTheme()

  const handleDragEnd = (result) => {
    if (!result.destination) return
    if (result.source.index === result.destination.index) return

    const reorderedImages = Array.from(images)
    const [removed] = reorderedImages.splice(result.source.index, 1)
    reorderedImages.splice(result.destination.index, 0, removed)

    if (onReorderImages) {
      onReorderImages(floorKey, mediaType, reorderedImages)
    }
  }

  // Función para obtener estilos del item durante el drag
  const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    ...draggableStyle,
    // Mantener dimensiones fijas durante el drag
    ...(isDragging && {
      width: '280px',
      height: '187px', // 280 * 0.6667 para mantener ratio 3:2
    })
  })

  if (images.length === 0) {
    return null
  }

  if (!enableDragDrop) {
    return (
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: 2, 
          width: '100%' 
        }}
      >
        {images.map((img, index) => (
          <Box 
            key={index} 
            sx={{ 
              position: 'relative', 
              width: '100%', 
              paddingTop: '66.67%', 
              borderRadius: 2, 
              overflow: 'hidden', 
              bgcolor: '#f5f5f5',
              transition: 'all 0.3s ease',
              cursor: 'default',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: `0 8px 24px ${color}40` 
              }
            }}
          >
            <Box
              component="img"
              src={img.url}
              alt={`${mediaType} ${index + 1}`}
              loading="lazy"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block'
              }}
            />
            {editMode && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                  p: 1.5,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  '&:hover': { opacity: 1 }
                }}
              >
                <Tooltip title="Eliminar">
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      color: theme.palette.error.main,
                      width: 36,
                      height: 36,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: theme.palette.error.main,
                        color: 'white',
                        transform: 'scale(1.1)'
                      }
                    }}
                    onClick={() => onDeleteImage(mediaType, index)}
                  >
                    <Delete sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: '"Poppins", sans-serif',
                backdropFilter: 'blur(4px)'
              }}
            >
              {index + 1}
            </Box>
          </Box>
        ))}
      </Box>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={`${floorKey}-${mediaType}-droppable`}>
        {(provided, droppableSnapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 2,
              width: '100%',
              transition: 'background-color 0.2s ease',
              bgcolor: droppableSnapshot.isDraggingOver ? `${color}08` : 'transparent',
              borderRadius: 2,
              p: droppableSnapshot.isDraggingOver ? 1 : 0
            }}
          >
            {images.map((img, index) => {
              const draggableId = `${floorKey}-${mediaType}-${index}`
              
              return (
                <Draggable key={draggableId} draggableId={draggableId} index={index}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                      sx={{
                        position: 'relative',
                        width: '100%',
                        paddingTop: snapshot.isDragging ? 0 : '66.67%',
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: '#f5f5f5',
                        border: snapshot.isDragging 
                          ? `3px solid ${color}` 
                          : '1px solid #e0e0e0',
                        boxShadow: snapshot.isDragging
                          ? `0 12px 32px ${color}60`
                          : 'none',
                        opacity: snapshot.isDragging ? 0.9 : 1,
                        transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                        transition: snapshot.isDragging ? 'none' : 'all 0.3s ease',
                        '&:hover': !snapshot.isDragging ? {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 24px ${color}40`
                        } : {}
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
                          bgcolor: snapshot.isDragging ? color : 'rgba(0,0,0,0.7)',
                          borderRadius: 1,
                          p: 0.5,
                          cursor: 'grab',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          '&:active': {
                            cursor: 'grabbing'
                          },
                          '&:hover': {
                            bgcolor: snapshot.isDragging ? color : 'rgba(0,0,0,0.9)',
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <DragIndicatorIcon sx={{ color: 'white', fontSize: 20 }} />
                      </Box>

                      {/* Imagen con aspect ratio fijo */}
                      <Box
                        component="img"
                        src={img.url}
                        alt={`${mediaType} ${index + 1}`}
                        loading="lazy"
                        sx={{
                          position: snapshot.isDragging ? 'relative' : 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: snapshot.isDragging ? '187px' : '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          display: 'block',
                          pointerEvents: 'none'
                        }}
                      />

                      {/* Botón eliminar */}
                      {editMode && !snapshot.isDragging && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'flex-end',
                            p: 1.5,
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            '&:hover': { opacity: 1 }
                          }}
                        >
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                color: theme.palette.error.main,
                                width: 36,
                                height: 36,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: theme.palette.error.main,
                                  color: 'white',
                                  transform: 'scale(1.1)'
                                }
                              }}
                              onClick={() => onDeleteImage(mediaType, index)}
                            >
                              <Delete sx={{ fontSize: 20 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}

                      {/* Indicador de orden */}
                      <Chip
                        label={`#${index + 1}`}
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8,
                          height: 22,
                          fontSize: '0.7rem',
                          bgcolor: snapshot.isDragging ? color : 'rgba(0,0,0,0.7)',
                          color: 'white',
                          fontWeight: 700,
                          fontFamily: '"Poppins", sans-serif',
                          zIndex: 5,
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </Box>
                  )}
                </Draggable>
              )
            })}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default FloorImageGrid