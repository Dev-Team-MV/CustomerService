import { useState } from 'react'
import { Box, Typography, Container, Paper, Breadcrumbs, Link } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Home, CloudUpload } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import UploadsCategorySelector from '../components/UploadModule/UploadsCategorySelector'
import UploadsClubHouseSection from '../components/UploadModule/UploadsClubHouseSection'
import UploadsMasterPlanSection from '../components/UploadModule/UploadsMasterPlanSection'
import UploadsConstructionSection from '../components/UploadModule/UploadsConstructionSection'

const UploadsManager = () => {
  const { t } = useTranslation(['uploads', 'common'])
  const theme = useTheme()
  const [selectedCategory, setSelectedCategory] = useState(null)

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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            color="inherit"
            onClick={() => setSelectedCategory(null)}
          >
            <Home sx={{ mr: 0.5 }} fontSize="small" />
            {t('common:home')}
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <CloudUpload sx={{ mr: 0.5 }} fontSize="small" />
            {t('uploads:title', 'Gestión de Cargas')}
          </Typography>
        </Breadcrumbs>

        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
            color: theme.palette.primary.main,
            mb: 1
          }}
        >
          🏗️ {t('uploads:title', 'Gestión de Cargas')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: '"Poppins", sans-serif',
            color: theme.palette.text.secondary
          }}
        >
          {t('uploads:subtitle', 'Administra todas las imágenes y videos del proyecto desde un solo lugar')}
        </Typography>
      </Box>

      {/* Category Selector */}
      {!selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <UploadsCategorySelector onSelectCategory={setSelectedCategory} />
        </motion.div>
      )}

      {/* Selected Section */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: theme.palette.background.paper
            }}
          >
            {renderSection()}
          </Paper>
        </motion.div>
      )}
    </Container>
  )
}

export default UploadsManager