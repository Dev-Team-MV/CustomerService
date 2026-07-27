// apps/mv-crm/src/components/campaigns/steps/Step3Preview.jsx
import { useTranslation } from 'react-i18next'
import {
  Box,
  Chip,
  CircularProgress,
  Alert,
  Typography
} from '@mui/material'
import DataTable from '@shared/components/table/DataTable'
import { useCampaignPreviewColumns } from '../../../constants/Columns/campaignPreview'

const Step3Preview = ({ previewData, loading }) => {
  const { t } = useTranslation('campaign')
  const previewColumns = useCampaignPreviewColumns({ t })

  console.log('📊 Step3Preview render:', { previewData, loading })

  // ✅ Si está cargando, mostrar spinner
  if (loading && !previewData) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" py={6} gap={2}>
        <CircularProgress size={40} />
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}
        >
          {t('loadingPreview', 'Cargando preview...')}
        </Typography>
      </Box>
    )
  }

  // ✅ Si no hay datos y no está cargando, mostrar error
  if (!previewData && !loading) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 0 }}>
        {t('errors.noPreviewData', 'No se pudo cargar el preview de destinatarios')}
      </Alert>
    )
  }

  // ✅ Mostrar datos del preview
  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Chip
          label={`${previewData.total} ${t('recipients')}`}
          sx={{
            bgcolor: '#000',
            color: '#fff',
            fontFamily: '"Courier New", monospace',
            fontSize: '0.7rem',
            fontWeight: 700
          }}
        />
      </Box>

      <DataTable
        columns={previewColumns}
        data={previewData.recipients || []}
        loading={false}
        rowKey="phone"
        hidePagination={true}
        maxHeight={400}
      />
    </Box>
  )
}

export default Step3Preview