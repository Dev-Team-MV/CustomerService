import { Box, Typography, Button } from '@mui/material';
import PropTypes from 'prop-types';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <Box
      sx={{
        py: 8,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}
    >
      {Icon && (
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: 4,
            bgcolor: 'rgba(140, 165, 81, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1
          }}
        >
          <Icon sx={{ fontSize: 40, color: '#8CA551' }} />
        </Box>
      )}
      
      <Typography
        variant="h6"
        sx={{
          color: '#333F1F',
          fontWeight: 600,
          fontFamily: '"Poppins", sans-serif',
          mb: 0.5
        }}
      >
        {title}
      </Typography>
      
      <Typography
        variant="body2"
        sx={{
          color: '#706f6f',
          fontFamily: '"Poppins", sans-serif',
          mb: 2
        }}
      >
        {description}
      </Typography>
      
      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{
            borderRadius: 3,
            bgcolor: '#333F1F',
            textTransform: 'none',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              bgcolor: '#8CA551'
            }
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func
};

export default EmptyState;