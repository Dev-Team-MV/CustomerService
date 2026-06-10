import { useState } from 'react'
import { Box, Typography, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ArrowBack } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@shared/context/AuthContext'
import UploadsCategorySelector from '../components/UploadModule/UploadsCategorySelector'
import UploadsClubHouseSection from '../components/UploadModule/UploadsClubHouseSection'
import UploadsMasterPlanSection from '../components/UploadModule/UploadsMasterPlanSection'
import UploadsConstructionSection from '../components/UploadModule/UploadsConstructionSection'

const UploadsManager = () => {
  const { t } = useTranslation(['uploads', 'common'])
  const theme = useTheme()
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState(null)

  const primary = theme.palette.primary.main

  const renderSection = () => {
    switch (selectedCategory) {
      case 'clubhouse':
        return <UploadsClubHouseSection />
      case 'masterplan':
        return <UploadsMasterPlanSection />
      case 'construction':
        return <UploadsConstructionSection />
      default:
        return null
    }
  }

  const titleParts = t('title', 'Gestión de Cargas').split(' ')
  const titleFirst = titleParts.slice(0, -1).join(' ')
  const titleLast = titleParts[titleParts.length - 1]

  return (
    <Box sx={{ minHeight: {xs:'20vh',sm:'80vh',md:'73vh'}, bgcolor: '#f8f9fa', px: { xs: 3, md: 6 }, py: 4 }}>
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            {/* ── Header Section ── */}
            <Box sx={{ mb: 4 }}>
              {/* Title row */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                sx={{ mb: 3 }}
              >
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 300,
                      color: primary,
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: { xs: '2.2rem', md: '3.5rem' },
                      lineHeight: 1.1,
                    }}
                  >
                    {titleFirst}{' '}
                    <Box component="span" sx={{ fontWeight: 800 }}>{titleLast}</Box>
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1.5} mt={1}>
                    <Typography
                      variant="body2"
                      sx={{ color: '#706f6f', fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem' }}
                    >
                      {t('welcome', 'Bienvenido')}
                    </Typography>
                    <Chip
                      label={user?.firstName?.toUpperCase() || 'ADMIN'}
                      sx={{
                        bgcolor: primary,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        height: 28,
                        borderRadius: 1.5,
                        fontFamily: '"DM Sans", sans-serif',
                        letterSpacing: '1.5px',
                        px: 0.5,
                      }}
                    />
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#706f6f',
                    maxWidth: 280,
                    textAlign: 'right',
                    lineHeight: 1.7,
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '0.85rem',
                    mt: 0.5,
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  {t('subtitle', 'Administra todas las imágenes y videos del proyecto desde un solo lugar')}
                </Typography>
              </Box>
            </Box>

            {/* Category Selector */}
            <UploadsCategorySelector onSelectCategory={setSelectedCategory} />
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            {/* Back button */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Box
                onClick={() => setSelectedCategory(null)}
                sx={{
                  mb: 3,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  color: primary,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  px: 2.5,
                  py: 1,
                  borderRadius: '50px',
                  border: `1.5px solid ${primary}40`,
                  bgcolor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  fontFamily: '"DM Sans", sans-serif',
                  '&:hover': {
                    bgcolor: primary,
                    color: 'white',
                    borderColor: primary,
                  }
                }}
              >
                <ArrowBack sx={{ fontSize: 16 }} />
                {t('common:back', 'Volver')}
              </Box>
            </motion.div>

            {/* Selected Section */}
            {renderSection()}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default UploadsManager