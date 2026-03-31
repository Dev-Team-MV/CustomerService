import { Box, Typography, Paper, Button, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';

const PageHeader = ({
  icon: Icon,
  title,
  subtitle,
  actionButton,
  animateIcon = true,
  gradientColors, // ahora opcional, si no se pasa usa theme
}) => {
  const theme = useTheme();

  // Gradientes y colores por defecto desde el theme
  const defaultGradient = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.primary.main,
  ];
  const usedGradient = gradientColors || defaultGradient;

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${usedGradient.join(', ')})`
          }
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            {animateIcon ? (
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Box
                  sx={{
                    width: { xs: 56, md: 64 },
                    height: { xs: 56, md: 64 },
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 24px ${theme.palette.primary.main}33`
                  }}
                >
                  <Icon sx={{ fontSize: { xs: 28, md: 32 }, color: theme.palette.primary.contrastText }} />
                </Box>
              </motion.div>
            ) : (
              <Box
                sx={{
                  width: { xs: 56, md: 64 },
                  height: { xs: 56, md: 64 },
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 24px ${theme.palette.primary.main}33`
                }}
              >
                <Icon sx={{ fontSize: { xs: 28, md: 32 }, color: theme.palette.primary.contrastText }} />
              </Box>
            )}

            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: theme.palette.text.primary,
                  fontFamily: '"Poppins", sans-serif',
                  letterSpacing: '0.5px',
                  fontSize: { xs: '1.75rem', md: '2.125rem' }
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>

          {actionButton && (
            <Tooltip title={actionButton.tooltip || ''} placement="left">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  onClick={actionButton.onClick}
                  startIcon={actionButton.icon}
                  sx={{
                    borderRadius: 3,
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    fontWeight: 600,
                    textTransform: 'none',
                    letterSpacing: '1px',
                    fontFamily: '"Poppins", sans-serif',
                    px: 3,
                    py: 1.5,
                    boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      bgcolor: theme.palette.secondary.main,
                      transition: 'left 0.4s ease',
                      zIndex: 0
                    },
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                      boxShadow: `0 8px 20px ${theme.palette.primary.main}55`,
                      '&::before': {
                        left: 0
                      },
                      '& .MuiButton-startIcon': {
                        color: theme.palette.primary.contrastText
                      }
                    },
                    '& .MuiButton-startIcon': {
                      position: 'relative',
                      zIndex: 1,
                      color: theme.palette.primary.contrastText
                    }
                  }}
                >
                  <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
                    {actionButton.label}
                  </Box>
                </Button>
              </motion.div>
            </Tooltip>
          )}
        </Box>
      </Paper>
    </motion.div>
  );
};

PageHeader.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actionButton: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.element,
    tooltip: PropTypes.string
  }),
  animateIcon: PropTypes.bool,
  gradientColors: PropTypes.arrayOf(PropTypes.string)
};

export default PageHeader;