import { Box, Paper, Typography, Chip } from '@mui/material'
import { motion } from 'framer-motion'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

const DashboardHeader = ({ user, title, subtitle, icon: Icon }) => {
  const theme = useTheme()
  const { t } = useTranslation(['dashboard', 'common'])

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 }, mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark || theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`,
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: `0 12px 40px ${theme.palette.primary.main}26`,
          overflow: 'hidden', position: 'relative'
        }}
      >
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, bgcolor: `${theme.palette.secondary.main}1A`, borderRadius: '50%', filter: 'blur(60px)' }} />
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} gap={{ xs: 2, sm: 3 }} position="relative" zIndex={1}>
          {Icon && (
            <motion.div whileHover={{ scale: 1.05, rotate: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Box sx={{
                width: { xs: 64, md: 72 }, height: { xs: 64, md: 72 },
                borderRadius: 3, bgcolor: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Icon sx={{ fontSize: { xs: 32, md: 40 }, color: 'white' }} />
              </Box>
            </motion.div>
          )}
          <Box flex={1}>
            <Typography variant="h3" sx={{
              color: 'white', fontWeight: 800, letterSpacing: '1px', mb: 0.5,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontFamily: '"Poppins", sans-serif', textTransform: 'uppercase'
            }}>
              {title}
            </Typography>
            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 400, fontFamily: '"Poppins", sans-serif' }}>
                {t('overviewSubtitle')}
              </Typography>
              {user?.role && (
                <Chip
                  label={user.role}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                    color: 'white', fontWeight: 600, fontSize: '0.75rem',
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontFamily: '"Poppins", sans-serif', textTransform: 'uppercase', letterSpacing: '1px'
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  )
}

export default DashboardHeader