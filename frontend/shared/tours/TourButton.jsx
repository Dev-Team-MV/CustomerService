import { Button } from '@mui/material'
import { HelpOutline } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useTour } from './useTour'

const TourButton = ({ tourId, steps, label, options = {}, sx = {} }) => {
  const { t } = useTranslation('auth')
  const { startTour } = useTour()

  const handleClick = () => {
    startTour(tourId, steps, {
      nextBtnText: t('tour.next', 'Siguiente →'),
      prevBtnText: t('tour.prev', '← Anterior'),
      doneBtnText: t('tour.done', 'Finalizar'),
      closeBtnText: t('tour.close', '✕'),
      progressText: t('tour.progress', '{{current}} de {{total}}'),
      ...options // ✅ Pasar opciones personalizadas (como onNextClick)
    })
  }

  return (
    <Button
      variant="text"
      startIcon={<HelpOutline sx={{ fontSize: 16 }} />}
      onClick={handleClick}
      sx={{
        mt: 2,
        color: '#888',
        fontFamily: '"Courier New", monospace',
        fontSize: '0.7rem',
        letterSpacing: '0.5px',
        textTransform: 'none',
        width: '100%',
        justifyContent: 'flex-start',
        px: 1.5,
        py: 1,
        borderRadius: 0,
        transition: 'all 0.2s ease',
        '&:hover': { 
          color: '#000', 
          background: 'rgba(0,0,0,0.04)',
          transform: 'translateX(2px)'
        },
        ...sx
      }}
    >
      {label || t('tour.defaultButton', '¿Primera vez? Ver guía')}
    </Button>
  )
}

export default TourButton