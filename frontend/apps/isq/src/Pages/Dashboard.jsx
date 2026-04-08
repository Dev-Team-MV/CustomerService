import { Container, Typography, Box, Paper, Grid } from '@mui/material'
import { useTranslation } from 'react-i18next'
import PageHeader from '@shared/components/PageHeader'
import { Dashboard as DashboardIcon } from '@mui/icons-material'

const Dashboard = () => {
  const { t } = useTranslation(['dashboard', 'common'])

  return (
    <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>

      <PageHeader
        icon={DashboardIcon}
        title={t('dashboard:titleISQL', 'Dashboard ISQ')}
        subtitle={t('dashboard:subtitleISQ', 'Bienvenido al sistema ISQ')}
      />
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main" fontWeight={700}>
              0
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Total Propiedades
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="secondary.main" fontWeight={700}>
              0
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Residentes Activos
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bienvenido a ISQ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Este es el panel de control del proyecto ISQ. Aquí podrás gestionar propiedades, residentes y más.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

    </Box>
  )
}

export default Dashboard