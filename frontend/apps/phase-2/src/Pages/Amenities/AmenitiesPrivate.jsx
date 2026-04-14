// import { useState, useEffect } from 'react'
// import { Container, Box } from '@mui/material'
// import AmenitiesMap from '../../Components/UI/Amenities/AmenitiesMap'
// import PageHeader from '@shared/components/PageHeader'
// import { Home, CloudUpload } from '@mui/icons-material'
// import { useTranslation } from 'react-i18next'
// import PrimaryButton from '@shared/constants/PrimaryButton'
// import { useAuth } from '@shared/context/AuthContext'
// import OutdoorAmenitiesModal from '../../Components/UI/Amenities/OutdoorAmenitiesModal'
// import uploadService from '../../Services/uploadService'

// const AmenitiesPrivate = () => {
//   const { t } = useTranslation(['amenities'])
//   const { user } = useAuth()
//   const [adminModalOpen, setAdminModalOpen] = useState(false)
//   const [amenitySections, setAmenitySections] = useState([])
//   const [loading, setLoading] = useState(true)

//   // Solo admin/superadmin pueden ver el botón
//   const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
//   const PHASE_2_PROJECT_ID = import.meta.env.VITE_PROJECT_ID || '6751c5e6a6f0f0e0e6f0f0e0'

//   const fetchOutdoorAmenities = async () => {
//     setLoading(true)
//     try {
//       const data = await uploadService.getOutdoorAmenitiesBySlug('lakewood-f2')
//       setAmenitySections(data.outdoorAmenitySections || [])
//     } catch (err) {
//       setAmenitySections([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchOutdoorAmenities()
//     // eslint-disable-next-line
//   }, [])

//   return (
//     <Container maxWidth="xl" sx={{ mt: 4, mb: 4, p: 3 }}>
//       <PageHeader
//         icon={Home}
//         title={t('mapTitle', 'Mapa de Amenidades')}
//         subtitle={t('mapSubtitle', 'Visualiza todas las amenidades del proyecto')}
// actionButton={
//   isAdmin
//     ? {
//         label: t('amenities:manageAmenities', 'Gestionar Amenidades'),
//         onClick: () => setAdminModalOpen(true),
//         icon: <CloudUpload />
//       }
//     : undefined
// }
//       />
//       <AmenitiesMap
//         isPublicView={false}
//         amenitySections={amenitySections}
//         loading={loading}
//       />
//       {isAdmin && (
//         <OutdoorAmenitiesModal
//           open={adminModalOpen}
//           onClose={() => setAdminModalOpen(false)}
//           projectId={PHASE_2_PROJECT_ID}
//           amenitySections={amenitySections}
//           onUploaded={fetchOutdoorAmenities}
//         />
//       )}
//     </Container>
//   )
// }

// export default AmenitiesPrivate

import { useState, useEffect } from 'react'
import { Container } from '@mui/material'
import { Home, CloudUpload } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@shared/context/AuthContext'
import PageHeader from '@shared/components/PageHeader'
import PrimaryButton from '@shared/constants/PrimaryButton'
import AmenitiesMap from '@shared/components/Amenities/AmenitiesMap'
import OutdoorAmenitiesModal from '@shared/components/Amenities/OutdoorAmenitiesModal'
import uploadService from '@shared/services/uploadService'
import { OUTDOOR_AMENITIES } from '../../Constants/amenities'

const PHASE_2_PROJECT_ID = import.meta.env.VITE_PROJECT_ID
const PHASE_2_SLUG = 'lakewood-f2'

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
      const data = await uploadService.getOutdoorAmenitiesBySlug(PHASE_2_SLUG)
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
        icon={Home}
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
        mapImage="/phase2.jpeg"
        amenities={OUTDOOR_AMENITIES}
        amenitySections={amenitySections}
        loading={loading}
        isPublicView={false}
      />
      {isAdmin && (
        <OutdoorAmenitiesModal
          open={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
          projectId={PHASE_2_PROJECT_ID}
          amenities={OUTDOOR_AMENITIES}
          amenitySections={amenitySections}
          onUploaded={fetchOutdoorAmenities}
        />
      )}
    </Container>
  )
}

export default AmenitiesPrivate