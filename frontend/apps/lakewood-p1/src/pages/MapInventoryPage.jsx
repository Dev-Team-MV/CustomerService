import { Container } from '@mui/material'
import { Map } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader'
import MapInventory from '../components/MapInventory'

const MapInventoryPage = () => {
  const { t } = useTranslation(['navigation', 'lots'])

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader
        icon={Map}
        title={t('navigation:menu.mapInventory')}
        subtitle={t('lots:mapInventory.subtitle')}
        animateIcon={true}
      />
      
      <MapInventory />
    </Container>
  )
}

export default MapInventoryPage