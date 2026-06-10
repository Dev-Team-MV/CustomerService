// import { useState } from 'react'
// import { Box, Typography, Grid } from '@mui/material'
// import { useTheme } from '@mui/material/styles'
// import {
//   MeetingRoom,
//   Landscape,
//   Architecture,
//   Deck as DeckIcon,
//   Timeline
// } from '@mui/icons-material'
// import { motion } from 'framer-motion'
// import { useTranslation } from 'react-i18next'
// import ClubImagesModal from '../ClubHouse/ClubImagesModal'
// import ClubHouseUnderConstructionModal from '../ClubHouse/ClubHouseUnderContructionModal'
// import { useAuth } from '@shared/context/AuthContext'

// const UploadsClubHouseSection = () => {
//   const { t } = useTranslation('uploads')
//   const theme = useTheme()
//   const { user } = useAuth()
//   const isOwner = user?.role === 'owner'
//   const [modalOpen, setModalOpen] = useState(null)

//   const primary = theme.palette.primary.main
//   const cardAccent = theme.palette.chipAdmin?.color || '#8CA551'

//   const sections = [
//     {
//       id: 'interior',
//       title: t('clubhouse.interior', 'Interior'),
//       description: t('clubhouse.interiorDesc', 'Reception, Gym, Pool, etc.'),
//       icon: MeetingRoom,
//       modal: 'clubImages',
//       initialTab: 2
//     },
//     {
//       id: 'exterior',
//       title: t('clubhouse.exterior', 'Exterior'),
//       description: t('clubhouse.exteriorDesc', 'Imágenes exteriores del club'),
//       icon: Landscape,
//       modal: 'clubImages',
//       initialTab: 0
//     },
//     {
//       id: 'blueprints',
//       title: t('clubhouse.blueprints', 'Planos'),
//       description: t('clubhouse.blueprintsDesc', 'Planos arquitectónicos'),
//       icon: Architecture,
//       modal: 'clubImages',
//       initialTab: 1
//     },
//     {
//       id: 'deck',
//       title: t('clubhouse.deck', 'Deck'),
//       description: t('clubhouse.deckDesc', 'Imágenes del deck'),
//       icon: DeckIcon,
//       modal: 'clubImages',
//       initialTab: 3
//     },
//     {
//       id: 'timeline',
//       title: t('clubhouse.timeline', 'Timeline de Construcción'),
//       description: t('clubhouse.timelineDesc', 'Pasos de construcción del club'),
//       icon: Timeline,
//       modal: 'timeline'
//     }
//   ]

//   const handleCloseModal = () => {
//     setModalOpen(null)
//   }

//   return (
//     <Box>
//       {/* ── Header ── */}
//       <Box sx={{ mb: 3 }}>
//         <Typography
//           variant="h3"
//           sx={{
//             fontWeight: 300,
//             color: primary,
//             fontFamily: '"DM Sans", sans-serif',
//             fontSize: { xs: '2rem', md: '2.5rem' },
//             lineHeight: 1.1,
//             mb: 0.5,
//           }}
//         >
//           Club{' '}
//           <Box component="span" sx={{ fontWeight: 800 }}>House</Box>
//         </Typography>
//         <Typography
//           sx={{
//             fontSize: '0.85rem',
//             color: '#706f6f',
//             fontFamily: '"DM Sans", sans-serif',
//           }}
//         >
//           {t('clubhouse.subtitle', 'Gestiona todas las imágenes y contenido del ClubHouse')}
//         </Typography>
//       </Box>

//       {/* ── Cards Grid ── */}
//       <Grid container spacing={2.5}>
//         {sections.map((section, i) => {
//           const Icon = section.icon
//           return (
//             <Grid item xs={12} sm={6} md={4} key={section.id}>
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: i * 0.08, duration: 0.4 }}
//               >
//                 <Box
//                   onClick={() => setModalOpen(section)}
//                   sx={{
//                     bgcolor: primary,
//                     borderRadius: 3,
//                     p: { xs: 3, md: 4 },
//                     minHeight: { xs: 160, md: 200 },
//                     cursor: 'pointer',
//                     position: 'relative',
//                     overflow: 'hidden',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     justifyContent: 'space-between',
//                     transition: 'transform 0.25s ease, box-shadow 0.25s ease',
//                     '&:hover': {
//                       transform: 'translateY(-4px)',
//                       boxShadow: `0 8px 24px ${primary}40`
//                     }
//                   }}
//                 >
//                   {/* Número + Icono */}
//                   <Box display="flex" justifyContent="space-between" alignItems="flex-start">
//                     <Typography
//                       sx={{
//                         fontSize: { xs: '2.5rem', md: '3.5rem' },
//                         fontWeight: 300,
//                         color: cardAccent,
//                         fontFamily: '"DM Sans", sans-serif',
//                         lineHeight: 1,
//                         letterSpacing: '-2px',
//                       }}
//                     >
//                       0{i + 1}
//                     </Typography>
//                     <Icon sx={{ fontSize: 24, color: cardAccent, opacity: 0.85 }} />
//                   </Box>

//                   {/* Título + Descripción */}
//                   <Box>
//                     <Typography
//                       sx={{
//                         fontSize: { xs: '1.5rem', md: '2rem' },
//                         fontWeight: 700,
//                         color: 'white',
//                         fontFamily: '"DM Sans", sans-serif',
//                         lineHeight: 1.1,
//                         letterSpacing: '-0.5px',
//                         mb: 0.5,
//                       }}
//                     >
//                       {section.title}
//                     </Typography>

//                     <Typography
//                       sx={{
//                         fontSize: '0.78rem',
//                         color: 'rgba(255,255,255,0.55)',
//                         fontFamily: '"DM Sans", sans-serif',
//                       }}
//                     >
//                       {section.description}
//                     </Typography>
//                   </Box>
//                 </Box>
//               </motion.div>
//             </Grid>
//           )
//         })}
//       </Grid>

//       {/* Modals */}
//       {modalOpen?.modal === 'clubImages' && (
//         <ClubImagesModal
//           open={true}
//           onClose={handleCloseModal}
//           isOwner={isOwner}
//           onImagesUploaded={() => {
//             handleCloseModal()
//           }}
//         />
//       )}

//       {modalOpen?.modal === 'timeline' && (
//         <ClubHouseUnderConstructionModal
//           open={true}
//           onClose={handleCloseModal}
//         />
//       )}
//     </Box>
//   )
// }

// export default UploadsClubHouseSection


import { useState } from 'react'
import { Box, Typography, Grid } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  MeetingRoom,
  Landscape,
  Architecture,
  Deck as DeckIcon,
  Timeline
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import ClubImagesModal from '../ClubHouse/ClubImagesModal'
import ClubHouseUnderConstructionModal from '../ClubHouse/ClubHouseUnderContructionModal'
import TimelineManagementSection from './TimelineManagementSection'
import ClubhouseUnderConstructionService from '../../services/ClubhouseUnderConstructionService'
import { useAuth } from '@shared/context/AuthContext'

const UploadsClubHouseSection = () => {
  const { t } = useTranslation('uploads')
  const theme = useTheme()
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'
  const [modalOpen, setModalOpen] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)

  const primary = theme.palette.primary.main
  const cardAccent = theme.palette.chipAdmin?.color || '#8CA551'

  const sections = [
    {
      id: 'interior',
      title: t('clubhouse.interior', 'Interior'),
      description: t('clubhouse.interiorDesc', 'Reception, Gym, Pool, etc.'),
      icon: MeetingRoom,
      modal: 'clubImages',
      initialTab: 2
    },
    {
      id: 'exterior',
      title: t('clubhouse.exterior', 'Exterior'),
      description: t('clubhouse.exteriorDesc', 'Imágenes exteriores del club'),
      icon: Landscape,
      modal: 'clubImages',
      initialTab: 0
    },
    {
      id: 'blueprints',
      title: t('clubhouse.blueprints', 'Planos'),
      description: t('clubhouse.blueprintsDesc', 'Planos arquitectónicos'),
      icon: Architecture,
      modal: 'clubImages',
      initialTab: 1
    },
    {
      id: 'deck',
      title: t('clubhouse.deck', 'Deck'),
      description: t('clubhouse.deckDesc', 'Imágenes del deck'),
      icon: DeckIcon,
      modal: 'clubImages',
      initialTab: 3
    },
    {
      id: 'timeline',
      title: t('clubhouse.timeline', 'Timeline de Construcción'),
      description: t('clubhouse.timelineDesc', 'Pasos de construcción del club'),
      icon: Timeline,
      modal: 'timeline'
    }
  ]

  const handleSectionClick = (section) => {
    if (section.id === 'timeline') {
      setSelectedSection(section)
    } else {
      setModalOpen(section)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(null)
  }

  const handleBackFromTimeline = () => {
    setSelectedSection(null)
  }

  return (
    <Box>
      <AnimatePresence mode="wait">
        {!selectedSection ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 300,
                  color: primary,
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  lineHeight: 1.1,
                  mb: 0.5,
                }}
              >
                Club{' '}
                <Box component="span" sx={{ fontWeight: 800 }}>House</Box>
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.85rem',
                  color: '#706f6f',
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                {t('clubhouse.subtitle', 'Gestiona todas las imágenes y contenido del ClubHouse')}
              </Typography>
            </Box>

            {/* Cards Grid */}
            <Grid container spacing={2.5}>
              {sections.map((section, i) => {
                const Icon = section.icon
                return (
                  <Grid item xs={12} sm={6} md={4} key={section.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                    >
                      <Box
                        onClick={() => handleSectionClick(section)}
                        sx={{
                          bgcolor: primary,
                          borderRadius: 3,
                          p: { xs: 3, md: 4 },
                          minHeight: { xs: 160, md: 200 },
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 24px ${primary}40`
                          }
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography
                            sx={{
                              fontSize: { xs: '2.5rem', md: '3.5rem' },
                              fontWeight: 300,
                              color: cardAccent,
                              fontFamily: '"DM Sans", sans-serif',
                              lineHeight: 1,
                              letterSpacing: '-2px',
                            }}
                          >
                            0{i + 1}
                          </Typography>
                          <Icon sx={{ fontSize: 24, color: cardAccent, opacity: 0.85 }} />
                        </Box>

                        <Box>
                          <Typography
                            sx={{
                              fontSize: { xs: '1.5rem', md: '2rem' },
                              fontWeight: 700,
                              color: 'white',
                              fontFamily: '"DM Sans", sans-serif',
                              lineHeight: 1.1,
                              letterSpacing: '-0.5px',
                              mb: 0.5,
                            }}
                          >
                            {section.title}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: '0.78rem',
                              color: 'rgba(255,255,255,0.55)',
                              fontFamily: '"DM Sans", sans-serif',
                            }}
                          >
                            {section.description}
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  </Grid>
                )
              })}
            </Grid>
          </motion.div>
        ) : (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TimelineManagementSection
              service={ClubhouseUnderConstructionService}
              onBack={handleBackFromTimeline}
              title={t('clubhouse.timeline', 'Timeline de Construcción')}
              subtitle={t('clubhouse.timelineDesc', 'Gestiona los pasos de construcción del ClubHouse')}
              ModalComponent={ClubHouseUnderConstructionModal}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {modalOpen?.modal === 'clubImages' && (
        <ClubImagesModal
          open={true}
          onClose={handleCloseModal}
          isOwner={isOwner}
          onImagesUploaded={() => {
            handleCloseModal()
          }}
        />
      )}
    </Box>
  )
}

export default UploadsClubHouseSection