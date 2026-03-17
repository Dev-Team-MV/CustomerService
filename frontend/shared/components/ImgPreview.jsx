import { Box, IconButton, Switch, Paper, Typography } from '@mui/material';
import { Delete, Image as ImageIcon } from '@mui/icons-material';

const ImagePreview = ({
  src,
  alt = '',
  isPublic,
  onTogglePublic,
  onDelete,
  showSwitch = true,
  switchPosition = 'top-right',
  label,
  sx = {},
  imgSx = {},
  ...rest
}) => {
  const switchStyles = {
    'top-right': { position: 'absolute', top: 8, right: 40, zIndex: 2 },
    'top-left': { position: 'absolute', top: 8, left: 8, zIndex: 2 },
    'bottom-right': { position: 'absolute', bottom: 8, right: 40, zIndex: 2 },
    'bottom-left': { position: 'absolute', bottom: 8, left: 8, zIndex: 2 },
  };

  const hasImage = !!src;

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1.5px solid #e0e0e0',
        minHeight: 120,
        ...sx,
      }}
      {...rest}
    >
      {showSwitch && typeof isPublic === 'boolean' && hasImage && (
        <Box sx={switchStyles[switchPosition]}>
        <Switch
          checked={!!isPublic}
          onChange={e => onTogglePublic && onTogglePublic(e.target.checked)}
          color="success"
          size="small"
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#E5863C',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#E5863C',
            },
          }}
        />
        </Box>
      )}
      {label && hasImage && (
        <Box sx={{ position: 'absolute', top: 4, left: 4, bgcolor: '#8CA551', color: 'white', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.7rem', fontWeight: 700 }}>
          {label}
        </Box>
      )}
      {hasImage ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          sx={{
            width: '100%',
            height: 120,
            objectFit: 'cover',
            ...imgSx,
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#bdbdbd',
            bgcolor: '#f5f5f5',
            ...imgSx,
          }}
        >
          <ImageIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="caption" color="#bdbdbd">
            No image
          </Typography>
        </Box>
      )}
      {hasImage && (
        <IconButton
          className="delete-btn"
          size="small"
          onClick={onDelete}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255,255,255,0.9)',
            zIndex: 3,
            opacity: 1,
            transition: 'opacity 0.3s',
            '&:hover': { bgcolor: '#ff5252', color: 'white' }
          }}
        >
          <Delete fontSize="small" />
        </IconButton>
      )}
    </Paper>
  );
};

export default ImagePreview;