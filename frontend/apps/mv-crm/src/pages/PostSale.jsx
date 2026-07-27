import { useState } from 'react'
import { Box, Tabs, Tab, Paper, Snackbar, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'

import PageLayout from '@shared/components/LayoutComponents/PageLayout'

import OnboardingPanel from '../components/postSale/tabs/OnboardingPanel'
import WarrantiesPanel from '../components/postSale/tabs/WarrantiesPanel'
import SurveysPanel from '../components/postSale/tabs/SurveysPanel'

export default function PostSale() {
  const { t } = useTranslation('postSale')
  const [tabValue, setTabValue] = useState(0)
  
  // Estado global para notificaciones (compartido entre paneles)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <PageLayout title={t('page.title', 'Post-Venta')} subtitle={t('page.subtitle', 'Gestión de onboarding, garantías y encuestas')}>
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, v) => setTabValue(v)} 
          sx={{ borderBottom: '1px solid #ececec', px: 2, bgcolor: '#fafafa' }}
        >
          <Tab label={t('tabs.onboarding', 'Onboarding')} />
          <Tab label={t('tabs.warranties', 'Garantías')} />
          <Tab label={t('tabs.surveys', 'Encuestas')} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <OnboardingPanel onNotify={showNotification} />}
          {tabValue === 1 && <WarrantiesPanel onNotify={showNotification} />}
          {tabValue === 2 && <SurveysPanel onNotify={showNotification} />}
        </Box>
      </Paper>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  )
}