import { Container } from '@mui/material'
import AmenitiesMap from '../../Components/UI/Amenities/AmenitiesMap'
import PageHeader from '@shared/components/PageHeader'
import { Home } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

const AmenitiesPrivate = () => {
  const { t } = useTranslation(['amenities'])
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, p: 3 }}>
      <PageHeader
        icon={Home}
        title={t('mapTitle', 'Mapa de Amenidades')}
        subtitle={t('mapSubtitle', 'Visualiza todas las amenidades del proyecto')}
      />
      <AmenitiesMap isPublicView={false} />
    </Container>
  )
}

export default AmenitiesPrivate