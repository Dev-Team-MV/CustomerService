// apps/mv-crm/src/pages/PostSale.jsx
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <PageLayout title={t('page.title')} subtitle={t('page.subtitle')} topbarLabel={t('page.topbarlabel')}>
      <Paper sx={{ borderRadius: 0, overflow: 'hidden', border: '1px solid #ececec' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, v) => setTabValue(v)} 
          sx={{ borderBottom: '1px solid #ececec', px: 2, bgcolor: '#fafafa' }}
        >
          <Tab label={t('tabs.onboarding')} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.8rem', letterSpacing: '0.5px' }} />
          <Tab label={t('tabs.warranties')} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.8rem', letterSpacing: '0.5px' }} />
          <Tab label={t('tabs.surveys')} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.8rem', letterSpacing: '0.5px' }} />
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
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ 
            width: '100%', 
            borderRadius: 0, 
            border: '1px solid',
            fontFamily: '"Courier New", monospace',
            fontSize: '0.8rem'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  )
}