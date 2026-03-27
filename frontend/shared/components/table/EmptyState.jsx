import { Box, Typography, Button, useTheme } from '@mui/material';
import PropTypes from 'prop-types';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  const theme = useTheme();

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
            bgcolor: theme.palette.secondary.light + '14',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1
          }}
        >
          <Icon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />
        </Box>
      )}
      
      <Typography
        variant="h6"
        sx={{
          color: theme.palette.primary.main,
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
          color: theme.palette.text.secondary,
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
            bgcolor: theme.palette.primary.main,
            textTransform: 'none',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              bgcolor: theme.palette.secondary.main
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