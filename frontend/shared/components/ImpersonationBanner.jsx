// /Users/oficina/MV-CRM/CustomerService/frontend/shared/components/ImpersonationBanner.jsx

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Button,
  IconButton,
  Collapse,
  Avatar,
  Chip
} from '@mui/material'
import {
  Person,
  Close,
  ExitToApp,
  Warning,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material'
import { useImpersonation } from '../context/AuthContext'

const ImpersonationBanner = () => {
  const { t } = useTranslation('common')
  const { 
    isImpersonating, 
    impersonatedBy, 
    impersonatedUser, 
    stopImpersonation 
  } = useImpersonation()
  
  const [expanded, setExpanded] = useState(false)
  const [stopping, setStopping] = useState(false)

  if (!isImpersonating || !impersonatedBy) {
    return null
  }

  const handleStop = async () => {
    setStopping(true)
    try {
      await stopImpersonation()
    } catch (error) {
      console.error('Error stopping impersonation:', error)
      setStopping(false)
    }
  }

  const impersonatorName = `${impersonatedBy.firstName || ''} ${impersonatedBy.lastName || ''}`.trim()
  const impersonatedName = impersonatedUser 
    ? `${impersonatedUser.firstName || ''} ${impersonatedUser.lastName || ''}`.trim()
    : t('common:impersonation.currentUser', 'usuario actual')

  return (
    <Box
      sx={{
        position: 'fixed', // ✅ FIJO
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300, // ✅ POR ENCIMA DEL APPBAR
        bgcolor: '#ff9800',
        color: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        fontFamily: '"DM Sans", sans-serif'
      }}
    >
      {/* Banner principal */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} flex={1}>
          <Warning sx={{ fontSize: 20 }} />
          
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: '#fff',
                color: '#ff9800',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              {impersonatedBy.firstName?.charAt(0) || 'S'}
            </Avatar>
            
            <Typography
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              {t('common:impersonation.actingAs', 'Actuando como')}{' '}
              <strong>{impersonatedName}</strong>
              {' '}
              {t('common:impersonation.as', 'como')}{' '}
              <strong>{impersonatorName}</strong>
            </Typography>
          </Box>

          <Chip
            label={t('common:impersonation.testMode', 'MODO PRUEBA')}
            size="small"
            sx={{
              bgcolor: '#fff',
              color: '#ff9800',
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 24,
              letterSpacing: '1px'
            }}
          />
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="contained"
            size="small"
            startIcon={stopping ? null : <ExitToApp />}
            onClick={handleStop}
            disabled={stopping}
            sx={{
              bgcolor: '#fff',
              color: '#ff9800',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: { xs: '0.7rem', sm: '0.8rem' },
              fontWeight: 700,
              textTransform: 'none',
              letterSpacing: '0.5px',
              '&:hover': {
                bgcolor: '#f5f5f5'
              },
              '&:disabled': {
                bgcolor: '#e0e0e0',
                color: '#9e9e9e'
              }
            }}
          >
            {stopping 
              ? t('common:impersonation.stopping', 'Volviendo...')
              : t('common:impersonation.backToSuperadmin', 'Volver a SuperAdmin')}
          </Button>

          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ color: '#fff' }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>

          <IconButton
            size="small"
            onClick={handleStop}
            disabled={stopping}
            sx={{ color: '#fff' }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Panel expandido con detalles */}
      <Collapse in={expanded}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: 'rgba(0,0,0,0.1)',
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1,
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            {t('common:impersonation.sessionDetails', 'Detalles de la sesión')}
          </Typography>

          <Box display="flex" gap={3} flexWrap="wrap">
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {t('common:impersonation.impersonator', 'SuperAdmin')}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {impersonatorName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {impersonatedBy.email}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {t('common:impersonation.impersonated', 'Usuario actual')}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {impersonatedName}
              </Typography>
              {impersonatedUser?.email && (
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {impersonatedUser.email}
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {t('common:impersonation.role', 'Rol')}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {impersonatedUser?.role || 'user'}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 1.5,
              p: 1,
              bgcolor: 'rgba(0,0,0,0.15)',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Warning sx={{ fontSize: 14 }} />
            <Typography variant="caption">
              {t('common:impersonation.warning', 
                'Estás viendo la aplicación como si fueras este usuario. Las acciones que realices se registrarán en el audit log.'
              )}
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Box>
  )
}

export default ImpersonationBanner