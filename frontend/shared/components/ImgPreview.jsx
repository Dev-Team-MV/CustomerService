// @shared/components/ImagePreview.jsx

import { Box, IconButton, Chip, Paper, Typography } from '@mui/material'
import { Delete, Image as ImageIcon } from '@mui/icons-material'

const ImagePreview = ({
  src,
  alt = '',
  isPublic,
  onTogglePublic,
  onDelete,
  showVisibilityChip = true,
  label,
  sx = {},
  imgSx = {},
  // i18n props
  publicLabel = 'Público',
  privateLabel = 'Privado',
  noImageLabel = 'No image',
  ...rest
}) => {
  const hasImage = !!src

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        border: '2px solid #e0e0e0',
        minHeight: 150,
        ...sx
      }}
      {...rest}
    >
      {hasImage ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          sx={{
            width: '100%',
            height: 150,
            objectFit: 'cover',
            ...imgSx
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#bdbdbd',
            bgcolor: '#f5f5f5',
            ...imgSx
          }}
        >
          <ImageIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="caption" color="#bdbdbd">
            {noImageLabel}
          </Typography>
        </Box>
      )}

      {/* Top right controls */}
      {hasImage && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 0.5,
            zIndex: 3
          }}
        >
          {/* Visibility Chip */}
          {showVisibilityChip && typeof isPublic === 'boolean' && (
            <Chip
              label={isPublic ? publicLabel : privateLabel}
              size="small"
              onClick={() => onTogglePublic && onTogglePublic(!isPublic)}
              sx={{
                bgcolor: isPublic ? '#4caf50' : '#ff9800',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8
                }
              }}
            />
          )}

          {/* Delete Button */}
          <IconButton
            size="small"
            onClick={onDelete}
            sx={{
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: '#ffebee' }
            }}
          >
            <Delete fontSize="small" color="error" />
          </IconButton>
        </Box>
      )}

      {/* Label Badge (bottom left) */}
      {label && hasImage && (
        <Chip
          label={label}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            bgcolor: '#2196f3',
            color: 'white',
            fontWeight: 700,
            zIndex: 2
          }}
        />
      )}
    </Paper>
  )
}

export default ImagePreview