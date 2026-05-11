// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/quote/LotSelector/MasterPlanSection.jsx

import { useTranslation } from 'react-i18next'
import { Box, Paper, Typography } from '@mui/material'
import PolygonImagePreview from '@shared/components/PolygonImagePreview'

const MasterPlanSection = ({ 
  masterPlanData, 
  previewPolygons, 
  hoveredBuildingId,
  onPolygonClick,
  onPolygonHover,
  onPolygonLeave,
  polygonImageRef
}) => {
  const { t } = useTranslation(['quote', 'common'])

  if (!masterPlanData?.masterPlanImage || previewPolygons.length === 0) {
    return null
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }} ref={polygonImageRef}>
      <Box mb={2}>
        <Typography variant="h6" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif', mb: 1 }}>
          {t('masterPlan')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('clickHouseToSelect')}
        </Typography>
      </Box>
      <PolygonImagePreview
        imageUrl={masterPlanData.masterPlanImage}
        polygons={previewPolygons}
        maxWidth={1200}
        maxHeight={800}
        highlightPolygonId={hoveredBuildingId}
        onPolygonClick={onPolygonClick}
        onPolygonHover={onPolygonHover}
        onPolygonLeave={onPolygonLeave}
        enableZoom={true}
      />
    </Paper>
  )
}

export default MasterPlanSection