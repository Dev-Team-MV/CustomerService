import { Grid, Card, CardContent, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import PropTypes from 'prop-types';
import React from 'react';

const StatsCards = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <Grid container spacing={3} mb={4}>
        {[1, 2, 3, 4].map((_, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card
              sx={{
                borderRadius: 4,
                height: 140,
                bgcolor: '#f5f5f5',
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 }
                }
              }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3} mb={4}>
      {stats.map((stat, idx) => {
        // ✅ FIX: Renderizar el ícono correctamente
        const IconComponent = stat.icon;
        
        return (
          <Grid item xs={12} sm={6} md={3} key={stat.label || stat.title || idx}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: stat.delay !== undefined ? stat.delay : idx * 0.1,
                duration: 0.5,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{ y: -6 }}
            >
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                  transition: "all 0.3s",
                  position: "relative",
                  overflow: "hidden",
                  bgcolor: 'white',
                  "&:hover": {
                    boxShadow: `0 12px 32px ${stat.color}20`,
                    borderColor: stat.color,
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: stat.bgGradient || stat.gradient || `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}80 100%)`,
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  {/* Header: Label + Icon */}
                  <Box
                    display="flex"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    mb={2}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#706f6f",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        fontSize: "0.7rem",
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    >
                      {stat.label || stat.title}
                    </Typography>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2.5,
                        bgcolor: stat.bgColor || `${stat.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: stat.color,
                      }}
                    >
                      {/* ✅ FIX: Renderizar ícono correctamente */}
                      {React.isValidElement(stat.icon) ? (
                        stat.icon
                      ) : IconComponent ? (
                        <IconComponent sx={{ fontSize: 24 }} />
                      ) : null}
                    </Box>
                  </Box>

                  {/* Value */}
                  <Typography
                    variant="h4"
                    sx={{
                      color: stat.color,
                      fontWeight: 700,
                      mb: 1,
                      letterSpacing: "-0.5px",
                      fontSize: { xs: "1.5rem", md: "2rem" },
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  >
                    {stat.value}
                  </Typography>

                  {/* Subtitle with trend */}
                  {(stat.sub || stat.subtitle) && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {stat.trend === 'up' && (
                        <ArrowUpward sx={{ fontSize: 14, color: stat.subColor || '#8CA551' }} />
                      )}
                      {stat.trend === 'down' && (
                        <ArrowDownward sx={{ fontSize: 14, color: stat.subColor || '#E5863C' }} />
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          color: stat.subColor || "#706f6f",
                          fontWeight: 500,
                          fontSize: "0.7rem",
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        {stat.sub || stat.subtitle}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        );
      })}
    </Grid>
  );
};

StatsCards.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      title: PropTypes.string,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]).isRequired,
      icon: PropTypes.oneOfType([
        PropTypes.elementType,
        PropTypes.element
      ]).isRequired,
      color: PropTypes.string.isRequired,
      bgGradient: PropTypes.string,
      gradient: PropTypes.string,
      bgColor: PropTypes.string,
      sub: PropTypes.string,
      subtitle: PropTypes.string,
      subColor: PropTypes.string,
      trend: PropTypes.oneOf(['up', 'down', null]),
      delay: PropTypes.number
    })
  ).isRequired,
  loading: PropTypes.bool
};

export default StatsCards;