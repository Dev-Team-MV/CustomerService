import { Card, CardContent, Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient, 
  delay = 0,
  color = '#ffffff'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: 'spring' }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
    >
      <Card
        sx={{
          height: '100%',
          borderRadius: 4,
          border: '1px solid rgba(0,0,0,0.08)',
          background: gradient,
          color: color,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
            transform: 'translateY(-4px)'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.8), rgba(255,255,255,0.3))',
            opacity: 0
          },
          '&:hover::before': {
            opacity: 1,
            transition: 'opacity 0.3s ease'
          }
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box flex={1}>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.85,
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: '0.7rem', md: '0.75rem' }
                }}
              >
                {title}
              </Typography>
            </Box>
            
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                sx={{
                  width: { xs: 44, md: 48 },
                  height: { xs: 44, md: 48 },
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <Icon sx={{ fontSize: { xs: 22, md: 24 } }} />
              </Box>
            </motion.div>
          </Box>

          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 1,
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '-1px',
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              {value}
            </Typography>
          </motion.div>

          {subtitle && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.6)'
                  }}
                />
              </motion.div>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.85,
                  fontWeight: 500,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: '0.7rem', md: '0.75rem' }
                }}
              >
                {subtitle}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default StatCard