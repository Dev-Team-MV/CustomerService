import { Container, Typography, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

const Dashboard = () => {
  const { t } = useTranslation(['common'])

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          {t('common:dashboard.title', 'Dashboard')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to Sheperd Dashboard
        </Typography>
      </Box>
    </Container>
  )
}

export default Dashboard