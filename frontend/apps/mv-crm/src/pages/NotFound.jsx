import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const navigate = useNavigate()
  const { t } = useTranslation('common')

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa'
      }}
    >
      <Box
        sx={{
          p: 5,
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
          background: '#fff',
          textAlign: 'center',
          maxWidth: 420,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 64, color: '#222', mb: 2 }} />
        <Typography variant="h3" sx={{ fontWeight: 700, color: '#111', mb: 2 }}>
          404
        </Typography>
        <Typography variant="h6" sx={{ color: '#222', mb: 1 }}>
          {t('notFound.title', 'Página no encontrada')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#888', mb: 4 }}>
          {t('notFound.description', 'La página que buscas no existe o fue movida.')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ fontWeight: 700, bgcolor: '#111', color: '#fff', px: 3, boxShadow: 'none', '&:hover': { bgcolor: '#222' } }}
          onClick={() => navigate('/')}
        >
          {t('notFound.goHome', 'Volver al inicio')}
        </Button>
      </Box>
    </Box>
  )
}