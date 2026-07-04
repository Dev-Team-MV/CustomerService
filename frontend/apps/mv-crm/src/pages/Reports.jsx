// apps/mv-crm/src/pages/Reports.jsx
import { useTranslation } from 'react-i18next'
import { Box, Typography, Grid } from '@mui/material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import ClientsReportSection from '../components/reports/ClientsReportSection'
import PaymentsReportSection from '../components/reports/PaymentsReportSection'
import LeadsReportSection from '../components/reports/LeadsReportSection'

export default function Reports() {
  const { t } = useTranslation('reports')

  return (
    <PageLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography
            sx={{
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontWeight: 200,
              fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
              color: '#000',
              letterSpacing: '-0.04em',
              lineHeight: 1
            }}
          >
            {t('title', 'Reportes')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#000',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.3 }
                }
              }}
            />
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.62rem',
                color: '#000',
                letterSpacing: '1.5px',
                textTransform: 'uppercase'
              }}
            >
              {t('subtitle', 'Centro de exportación de datos')}
            </Typography>
          </Box>
        </Box>

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