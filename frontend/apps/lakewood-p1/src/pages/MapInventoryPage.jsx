import { Container } from '@mui/material'
import { Map } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader'
import MapInventory from '../components/MapInventory'

const MapInventoryPage = () => {
  const { t } = useTranslation(['lots', 'common'])

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader
        icon={Map}
        title="Map Inventory"
        subtitle="Visual inventory overview by color classification"
        animateIcon={true}
      />
      
      <MapInventory />
    </Container>
  )
}

export default MapInventoryPage