import { useState, useEffect } from 'react'
import { Container } from '@mui/material'
import { LocationCity, CloudUpload } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@shared/context/AuthContext'
import PageHeader from '@shared/components/PageHeader'
import PrimaryButton from '@shared/constants/PrimaryButton'
import AmenitiesMap from '@shared/components/Amenities/AmenitiesMap'
import OutdoorAmenitiesModal from '@shared/components/Amenities/OutdoorAmenitiesModal'
import uploadService from '@shared/services/uploadService'
import { OUTDOOR_AMENITIES } from '../../Constants/amenities'

const ISQ_PROJECT_ID = import.meta.env.VITE_PROJECT_ID
const ISQ_SLUG = 'isq'

const AmenitiesPrivate = () => {
  const { t } = useTranslation(['amenities'])
  const { user } = useAuth()
  const [adminModalOpen, setAdminModalOpen] = useState(false)
  const [amenitySections, setAmenitySections] = useState([])
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  const fetchOutdoorAmenities = async () => {
    setLoading(true)
    try {
      const data = await uploadService.getOutdoorAmenitiesBySlug(ISQ_SLUG)
      setAmenitySections(data.outdoorAmenitySections || [])
    } catch {
      setAmenitySections([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOutdoorAmenities()
  }, [])

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, p: 3 }}>
      <PageHeader
        icon={LocationCity}
        title={t('mapTitle', 'Mapa de Amenidades')}
        subtitle={t('mapSubtitle', 'Visualiza todas las amenidades del proyecto')}
        actionButton={
          isAdmin
            ? {
                label: t('manageAmenities', 'Gestionar Amenidades'),
                onClick: () => setAdminModalOpen(true),
                icon: <CloudUpload />
              }
            : undefined
        }
      />
      <AmenitiesMap
        mapImage={null}
        amenities={OUTDOOR_AMENITIES}
        amenitySections={amenitySections}
        loading={loading}
        isPublicView={false}
      />
      {isAdmin && (
        <OutdoorAmenitiesModal
          open={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
          projectId={ISQ_PROJECT_ID}
          amenities={OUTDOOR_AMENITIES}
          amenitySections={amenitySections}
          onUploaded={fetchOutdoorAmenities}
        />
      )}
    </Container>
  )
}

export default AmenitiesPrivate