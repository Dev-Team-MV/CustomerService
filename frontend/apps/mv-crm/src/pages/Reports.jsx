// apps/mv-crm/src/pages/Reports.jsx
import { useTranslation } from 'react-i18next'
import { Box, Typography, Grid, useMediaQuery, useTheme } from '@mui/material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import ClientsReportSection from '../components/reports/ClientsReportSection'
import PaymentsReportSection from '../components/reports/PaymentsReportSection'
import LeadsReportSection from '../components/reports/LeadsReportSection'

export default function Reports() {
  const { t } = useTranslation('reports')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <PageLayout
      title={t('title', 'Reportes')}
      subtitle={t('subtitle', 'Centro de exportación de datos')}
      topbarLabel={t('topbarLabel', 'Reportes y Exportación de Datos')}
    >
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}

        {/* Secciones */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ClientsReportSection />
          </Grid>

          <Grid item xs={12}>
            <PaymentsReportSection />
          </Grid>

          <Grid item xs={12}>
            <LeadsReportSection />
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  )
}