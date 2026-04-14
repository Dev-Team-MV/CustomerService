// /shared/components/Login/LoginBackground.jsx
import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'

const LoginBackground = ({ 
  projectName = 'Project',
  logoMain,
  logoSecondary,
  backgroundImage,
  brandColors,
  tagline = 'Resort Lifestyle'
}) => {
  return (
    <Box
      sx={{
        width: '60%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      >
        {/* Background Image */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundColor: backgroundImage ? 'transparent' : brandColors.primary,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}
        />

        {/* Gradient Overlay */}
        <motion.div
          animate={{
            background: [
              `linear-gradient(135deg, ${brandColors.primary}ee 0%, ${brandColors.secondary}dd 100%)`,
              `linear-gradient(135deg, ${brandColors.secondary}dd 0%, ${brandColors.primary}ee 100%)`,
              `linear-gradient(135deg, ${brandColors.primary}ee 0%, ${brandColors.secondary}dd 100%)`
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        />

        {/* Floating Content */}
        <Box
          sx={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'white',
            width: '80%',
            zIndex: 1,
            mt: 8
          }}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            {/* Main Logo */}
            {logoMain && (
              <motion.div
                animate={{ 
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Box
                  component="img"
                  src={logoMain}
                  alt={projectName}
                  sx={{
                    width: '90%',
                    height: 'auto',
                    mb: 1,
                    filter: 'brightness(0) invert(1)',
                    objectFit: 'contain',
                    maxHeight: '600px'
                  }}
                />
              </motion.div>
            )}
            
            {/* Secondary Logo */}
            {logoSecondary && (
              <Box
                component="img"
                src={logoSecondary}
                alt={`${projectName} Secondary`}
                sx={{
                  width: '40%',
                  height: 'auto',
                  filter: 'brightness(0) invert(1)',
                  objectFit: 'contain',
                  maxHeight: '100px'
                }}
              />
            )}
            
            {/* Decorative Line */}
            <Box
              sx={{
                width: '120px',
                height: '2px',
                bgcolor: brandColors.secondary,
                margin: '0 auto',
                my: 3,
                opacity: 0.9
              }}
            />
            
            {/* Tagline */}
            <Typography 
              variant="h6" 
              fontWeight="300"
              sx={{ 
                opacity: 0.95,
                letterSpacing: '2px',
                fontSize: { xs: '1rem', md: '1.25rem' },
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {tagline}
            </Typography>
          </motion.div>
        </Box>

        {/* Animated Line */}
        <motion.div
          animate={{ 
            width: ['0%', '30%', '0%']
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            bottom: '20%',
            left: 0,
            height: '2px',
            background: brandColors.secondary,
            opacity: 0.6
          }}
        />
      </motion.div>
    </Box>
  )
}

export default LoginBackground