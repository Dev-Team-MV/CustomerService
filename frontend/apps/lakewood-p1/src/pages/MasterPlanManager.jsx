import PageHeader from '@shared/components/PageHeader'
import MasterPlanTabs from '../components/masterPlan/MasterPlanTabs'
import MapIcon from '@mui/icons-material/Map'
import { Box, Container, Paper } from '@mui/material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MasterPlanManager = () => {
    const { t } = useTranslation(['masterPlan', 'common']);
  return (
  <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', py: 3 }}>
    <Container maxWidth="xl">
      {/* HEADER */}

          <PageHeader
          icon={MapIcon}
          title={t('masterPlan:title')}
          subtitle={t('masterPlan:subtitle')}
        />


      {/* TABS Y CONTENIDO */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >

          <MasterPlanTabs />

      </motion.div>
    </Container>
  </Box>
  )
}

export default MasterPlanManager