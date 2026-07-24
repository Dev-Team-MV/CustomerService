import { Box, Typography, Chip } from '@mui/material'
import { 
  AccessTime, Pending, CheckCircle, Build, Cancel, 
  AssignmentTurnedIn 
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

const C = {
  dark:    '#004535',
  green:   '#004535',
  orange:  '#E5863C',
  blue:    '#1976d2',
  red:     '#f44336',
  gray:    '#706f6f',
  border:  '#d6ddc9',
  bg:      '#f5f7f1',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { type: 'spring', stiffness: 100, damping: 15 } 
  }
}

export default function CustomerWarrantyTimeline({ events = [] }) {
  const { t } = useTranslation('postSale')

  // ✅ Configuración dinámica dentro del componente para tener acceso a `t()`
  const statusConfig = {
    submitted:    { label: t('warranty.statuses.submitted', 'Enviado'),      icon: <AccessTime fontSize="small" />,  color: C.gray },
    under_review: { label: t('warranty.statuses.under_review', 'En Revisión'),   icon: <Pending fontSize="small" />,     color: C.orange },
    approved:     { label: t('warranty.statuses.approved', 'Aprobado'),      icon: <CheckCircle fontSize="small" />, color: C.green },
    in_progress:  { label: t('warranty.statuses.in_progress', 'En Progreso'),   icon: <Build fontSize="small" />,       color: C.blue },
    resolved:     { label: t('warranty.statuses.resolved', 'Resuelto'),      icon: <AssignmentTurnedIn fontSize="small" />, color: C.green },
    rejected:     { label: t('warranty.statuses.rejected', 'Rechazado'),     icon: <Cancel fontSize="small" />,      color: C.red }
  }

  if (!events || events.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: C.gray, fontFamily: '"DM Sans", sans-serif' }}>
        {t('warranty.noTimeline', 'No hay historial disponible para este reclamo.')}
      </Box>
    )
  }

  return (
    <Box sx={{ position: 'relative', pl: 2, py: 2 }}>
      <Box 
        sx={{ 
          position: 'absolute', 
          left: 23, 
          top: 20, 
          bottom: 20, 
          width: 2, 
          bgcolor: C.border,
          borderRadius: 1
        }} 
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {events.map((event, index) => {
          const config = statusConfig[event.status] || statusConfig.submitted
          const isLast = index === events.length - 1

          return (
            <motion.div key={index} variants={itemVariants}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', position: 'relative', mb: isLast ? 0 : 4 }}>
                <Box 
                  sx={{ 
                    position: 'relative', 
                    zIndex: 2,
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    bgcolor: 'white', 
                    border: `2px solid ${config.color}`,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: config.color,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    flexShrink: 0
                  }}
                >
                  {config.icon}
                </Box>

                <Box sx={{ ml: 3, pt: 1, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 0.5 }}>
                    <Typography variant="body1" fontWeight={700} sx={{ fontFamily: '"DM Sans", sans-serif', color: C.dark }}>
                      {config.label}
                    </Typography>
                    <Chip 
                      label={event.status} 
                      size="small" 
                      sx={{ 
                        height: 20, 
                        fontSize: '0.65rem', 
                        fontWeight: 600, 
                        textTransform: 'uppercase',
                        bgcolor: `${config.color}15`,
                        color: config.color,
                        fontFamily: '"DM Sans", sans-serif'
                      }} 
                    />
                  </Box>

                  <Typography variant="caption" sx={{ fontFamily: '"DM Sans", sans-serif', color: C.gray, display: 'block', mb: 1 }}>
                    {event.createdAt ? new Date(event.createdAt).toLocaleString() : ''}
                    {event.user && ` • ${t('warranty.by', 'por')} ${event.user}`}
                  </Typography>

                  {event.notes && (
                    <Box sx={{ mt: 1, p: 2, bgcolor: C.bg, borderRadius: '12px', borderLeft: `3px solid ${config.color}` }}>
                      <Typography variant="body2" sx={{ fontFamily: '"DM Sans", sans-serif', color: C.dark, lineHeight: 1.5 }}>
                        {event.notes}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </motion.div>
          )
        })}
      </motion.div>
    </Box>
  )
}