import { Box, Typography, Button, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Home, ErrorOutline } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

const NotFoundPage = ({
  redirectPath = '/dashboard',
  showIcon = true,
  translationNamespace = 'common'
}) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { t } = useTranslation(translationNamespace)

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          p: 3
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {showIcon && (
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: `${theme.palette.primary.main}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                mx: 'auto'
              }}
            >
              <ErrorOutline 
                sx={{ 
                  fontSize: 64, 
                  color: theme.palette.primary.main 
                }} 
              />
            </Box>
          )}

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '6rem', md: '8rem' },
              fontWeight: 800,
              fontFamily: '"DM Sans", sans-serif',
              color: theme.palette.primary.main,
              lineHeight: 1,
              mb: 2
            }}
          >
            404
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontFamily: '"DM Sans", sans-serif',
              color: theme.palette.text.primary,
              mb: 2
            }}
          >
            {t('notFound.title', 'Page Not Found')}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '1.1rem',
              maxWidth: 500,
              mx: 'auto'
            }}
          >
            {t('notFound.description', "The page you're looking for doesn't exist or has been moved.")}
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<Home />}
            onClick={() => navigate(redirectPath)}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '1rem',
              boxShadow: `0 8px 24px ${theme.palette.primary.main}30`,
              '&:hover': {
                bgcolor: theme.palette.secondary.main,
                boxShadow: `0 12px 32px ${theme.palette.secondary.main}40`,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {t('notFound.goHome', 'Go to Dashboard')}
          </Button>
        </motion.div>
      </Box>
    </Container>
  )
}

export default NotFoundPage