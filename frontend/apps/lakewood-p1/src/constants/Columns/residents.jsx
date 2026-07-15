// import { Box, Typography, Avatar, Chip, IconButton, Tooltip, CircularProgress } from '@mui/material'
// import {
//   AdminPanelSettings, VerifiedUser, Home,
//   Edit, Delete, Sms
// } from '@mui/icons-material'

// const getRoleColor = (role) => {
//   switch (role) {
//     case 'superadmin': return { color: '#E5863C', icon: AdminPanelSettings }
//     case 'admin':      return { color: '#8CA551', icon: VerifiedUser }
//     default:           return { color: '#1976d2', icon: Home }
//   }
// }

// const formatPhoneDisplay = (e164) => {
//   if (!e164) return ''
//   const digits = e164.replace(/\D/g, '')
//   if (digits.startsWith('1')  && digits.length === 11)
//     return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
//   if (digits.startsWith('52') && digits.length === 12)
//     return `+52 (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`
//   if (digits.startsWith('57') && digits.length === 12)
//     return `+57 (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`
//   return `+${digits}`
// }

// export const useResidentColumns = ({
//   t,
//   sendingSMS,
//   onEdit,
//   onDelete,
//   onSendSMS,
//   isOwner,
// }) => [
//   {
//     field: 'name',
//     headerName: t('residents:table.name'),
//     minWidth: 180,
//     renderCell: ({ row }) => (
//       <Box display="flex" alignItems="center" gap={1.5}>
//         <Avatar
//           sx={{
//             width: 48, height: 48,
//             bgcolor: 'transparent',
//             background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
//             color: 'white', fontWeight: 700, fontSize: '1rem',
//             fontFamily: '"DM Sans", sans-serif',
//             border: '2px solid rgba(255, 255, 255, 0.9)',
//             boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
//           }}
//         >
//           {row.firstName?.charAt(0)}
//         </Avatar>
//         <Box>
//           <Typography fontWeight={600} fontFamily='"DM Sans", sans-serif'>
//             {row.firstName} {row.lastName}
//           </Typography>
//           <Typography variant="caption" color="#706f6f" fontFamily='"DM Sans", sans-serif'>
//             {row.email}
//           </Typography>
//         </Box>
//       </Box>
//     )
//   },
//   {
//     field: 'email',
//     headerName: t('residents:table.email'),
//     minWidth: 180,
//     renderCell: ({ row }) => row.email
//   },
//   {
//     field: 'phoneNumber',
//     headerName: t('residents:table.phone'),
//     minWidth: 140,
//     renderCell: ({ row }) => formatPhoneDisplay(row.phoneNumber) || '-'
//   },
//   {
//     field: 'role',
//     headerName: t('residents:table.role'),
//     minWidth: 120,
//     renderCell: ({ row }) => {
//       const { color, icon: Icon } = getRoleColor(row.role)
//       return (
//         <Chip
//           label={t(`residents:role.${row.role}`)}
//           icon={<Icon sx={{ color }} />}
//           sx={{
//             bgcolor: `${color}10`, color,
//             fontWeight: 600, fontFamily: '"DM Sans", sans-serif',
//             border: `1px solid ${color}40`
//           }}
//           size="small"
//         />
//       )
//     }
//   },
//   {
//     field: 'lots',
//     headerName: t('residents:table.properties'),
//     minWidth: 120,
//     renderCell: ({ row }) => (
//       <Box display="flex" alignItems="center" gap={1}>
//         <Home sx={{ fontSize: 16, color: '#8CA551' }} />
//         <Typography
//           variant="body2"
//           sx={{ fontWeight: 600, color: '#333F1F', fontFamily: '"DM Sans", sans-serif' }}
//         >
//           {row.lots?.length || 0}
//         </Typography>
//       </Box>
//     )
//   },
//   {
//     field: 'actions',
//     headerName: t('residents:table.actions'),
//     align: 'center',
//     minWidth: 120,
//     renderCell: ({ row }) => (
//       <Box sx={{ display: 'flex', gap: 0.5 }}>

//         {/* Send SMS */}
//         <Tooltip title={t('residents:actions.sendSMS')} placement="top">
//           <span>
//             <IconButton
//               size="small"
//               onClick={(e) => { e.stopPropagation(); onSendSMS(row) }}
//               disabled={sendingSMS || isOwner}
//               sx={{
//                 bgcolor: 'rgba(140, 165, 81, 0.08)',
//                 border: '1px solid rgba(140, 165, 81, 0.2)',
//                 borderRadius: 2, transition: 'all 0.3s ease',
//                 '&:hover': { bgcolor: '#8CA551', borderColor: '#8CA551', transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } },
//                 '&:disabled': { opacity: 0.5 }
//               }}
//             >
//               {sendingSMS
//                 ? <CircularProgress size={16} />
//                 : <Sms sx={{ fontSize: 18, color: '#8CA551' }} />}
//             </IconButton>
//           </span>
//         </Tooltip>

//         {/* Edit */}
//         <Tooltip title={t('residents:actions.edit')} placement="top">
//           <span>
//             <IconButton
//               size="small"
//               onClick={(e) => { e.stopPropagation(); onEdit(row) }}
//               disabled={isOwner}
//               sx={{
//                 bgcolor: 'rgba(140, 165, 81, 0.08)',
//                 border: '1px solid rgba(140, 165, 81, 0.2)',
//                 borderRadius: 2, transition: 'all 0.3s ease',
//                 '&:hover': { bgcolor: '#8CA551', borderColor: '#8CA551', transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } },
//                 '&:disabled': { opacity: 0.5 }
//               }}
//             >
//               <Edit sx={{ fontSize: 18, color: '#8CA551' }} />
//             </IconButton>
//           </span>
//         </Tooltip>

//         {/* Delete */}
//         <Tooltip title={t('residents:actions.delete')} placement="top">
//           <span>
//             <IconButton
//               size="small"
//               onClick={(e) => { e.stopPropagation(); onDelete(row._id) }}
//               disabled={isOwner}
//               sx={{
//                 bgcolor: 'rgba(229, 134, 60, 0.08)',
//                 border: '1px solid rgba(229, 134, 60, 0.2)',
//                 borderRadius: 2, transition: 'all 0.3s ease',
//                 '&:hover': { bgcolor: '#E5863C', borderColor: '#E5863C', transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } },
//                 '&:disabled': { opacity: 0.5 }
//               }}
//             >
//               <Delete sx={{ fontSize: 18, color: '#E5863C' }} />
//             </IconButton>
//           </span>
//         </Tooltip>

//       </Box>
//     )
//   }
// ]

// apps/lakewood-p1/src/constants/Columns/resident.js
// (Mismo archivo funciona para TODAS las apps de proyecto)

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Box, Typography, Avatar, Chip, IconButton, Tooltip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert
} from '@mui/material'
import {
  AdminPanelSettings, VerifiedUser, Home, Edit, Delete, Sms, 
  Person, Warning, Close, ExitToApp
} from '@mui/icons-material'
import { useAuth, useImpersonation } from '@shared/context/AuthContext'

// ═══════════════════════════════════════════════════════════════
// HELPERS (sin cambios)
// ═══════════════════════════════════════════════════════════════

const getRoleColor = (role) => {
  switch (role) {
    case 'superadmin': return { color: '#E5863C', icon: AdminPanelSettings }
    case 'admin':      return { color: '#8CA551', icon: VerifiedUser }
    default:           return { color: '#1976d2', icon: Home }
  }
}

const formatPhoneDisplay = (e164) => {
  if (!e164) return ''
  const digits = e164.replace(/\D/g, '')
  if (digits.startsWith('1')  && digits.length === 11)
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  if (digits.startsWith('52') && digits.length === 12)
    return `+52 (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`
  if (digits.startsWith('57') && digits.length === 12)
    return `+57 (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`
  return `+${digits}`
}

// ═══════════════════════════════════════════════════════════════
// ✅ NUEVO: Componente interno para personificar
// ═══════════════════════════════════════════════════════════════

const ImpersonateAction = ({ targetUser }) => {
  const { t } = useTranslation('common')
  const { user: currentUser } = useAuth()
  const { impersonate } = useImpersonation()
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 🔒 Solo visible para SuperAdmin
  if (!currentUser || currentUser.role !== 'superadmin') return null
  
  // 🔒 No puede personificarse a sí mismo
  if (currentUser._id === targetUser?._id) return null
  
  // 🔒 No puede personificar a otro SuperAdmin o Owner
  if (targetUser?.role === 'superadmin' || targetUser?.role === 'owner') return null

  const handleImpersonate = async () => {
    setLoading(true)
    setError(null)

    try {
      // 🎯 Clave: redirectTo apunta al MISMO aplicativo (dashboard)
      // La página se recargará con la sesión del residente
      const result = await impersonate(targetUser._id, { 
        redirectTo: '/dashboard' // Mismo app, diferente sesión
      })
      
      if (!result.success) {
        setError(result.error)
        setLoading(false)
      }
      // Si tiene redirectTo, la página se recargará automáticamente
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const userName = `${targetUser?.firstName || ''} ${targetUser?.lastName || ''}`.trim()

  return (
    <>
      <Tooltip title={t('common:impersonation.action', 'Actuar como este usuario')} placement="top">
        <span>
          <IconButton
            size="small"
            onClick={(e) => { 
              e.stopPropagation()
              setDialogOpen(true) 
            }}
            sx={{
              bgcolor: 'rgba(156, 39, 176, 0.08)',
              border: '1px solid rgba(156, 39, 176, 0.2)',
              borderRadius: 2, 
              transition: 'all 0.3s ease',
              '&:hover': { 
                bgcolor: '#9c27b0', 
                borderColor: '#9c27b0', 
                transform: 'scale(1.1)',
                '& .MuiSvgIcon-root': { color: 'white' }
              }
            }}
          >
            <Person sx={{ fontSize: 18, color: '#9c27b0' }} />
          </IconButton>
        </span>
      </Tooltip>

      {/* Diálogo de confirmación */}
      <Dialog
        open={dialogOpen}
        onClose={() => !loading && setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            borderBottom: '1px solid #ececec',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Person sx={{ fontSize: 20, color: '#9c27b0' }} />
            <Typography sx={{ fontWeight: 700 }}>
              {t('common:impersonation.confirmTitle', 'Confirmar personificación')}
            </Typography>
          </Box>
          <IconButton onClick={() => setDialogOpen(false)} size="small" disabled={loading}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Alert 
            severity="warning" 
            icon={<Warning />}
            sx={{ mb: 3 }}
          >
            <Typography variant="body2" fontWeight={600}>
              {t('common:impersonation.warningTitle', 'Vas a ver la aplicación como este usuario')}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
              {t('common:impersonation.warningDescription', 
                'Todas las acciones se registrarán. Podrás volver a tu sesión de SuperAdmin en cualquier momento.'
              )}
            </Typography>
          </Alert>

          {/* Usuario objetivo */}
          <Box
            sx={{
              p: 2,
              bgcolor: '#f3e5f5',
              border: '1px solid #ce93d8',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: '#9c27b0',
                fontWeight: 700
              }}
            >
              {targetUser?.firstName?.charAt(0)}
              {targetUser?.lastName?.charAt(0)}
            </Avatar>
            <Box flex={1}>
              <Typography fontWeight={600}>
                {userName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {targetUser?.email}
              </Typography>
            </Box>
            <Chip
              label={targetUser?.role || 'user'}
              size="small"
              sx={{
                bgcolor: '#e1bee7',
                color: '#6a1b9a',
                fontWeight: 700
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            disabled={loading}
          >
            {t('common:impersonation.cancel', 'Cancelar')}
          </Button>
          <Button
            onClick={handleImpersonate}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <ExitToApp />}
            sx={{
              bgcolor: '#9c27b0',
              '&:hover': { bgcolor: '#7b1fa2' }
            }}
          >
            {loading 
              ? t('common:impersonation.starting', 'Iniciando...')
              : t('common:impersonation.start', 'Iniciar personificación')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// HOOK PRINCIPAL DE COLUMNAS
// ═══════════════════════════════════════════════════════════════

export const useResidentColumns = ({
  t,
  sendingSMS,
  onEdit,
  onDelete,
  onSendSMS,
  isOwner,
}) => [
  // ... (todas las columnas anteriores sin cambios) ...
  {
    field: 'name',
    headerName: t('residents:table.name'),
    minWidth: 180,
    renderCell: ({ row }) => (
      <Box display="flex" alignItems="center" gap={1.5}>
        <Avatar
          sx={{
            width: 48, height: 48,
            bgcolor: 'transparent',
            background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
            color: 'white', fontWeight: 700, fontSize: '1rem',
            fontFamily: '"DM Sans", sans-serif',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
          }}
        >
          {row.firstName?.charAt(0)}
        </Avatar>
        <Box>
          <Typography fontWeight={600} fontFamily='"DM Sans", sans-serif'>
            {row.firstName} {row.lastName}
          </Typography>
          <Typography variant="caption" color="#706f6f" fontFamily='"DM Sans", sans-serif'>
            {row.email}
          </Typography>
        </Box>
      </Box>
    )
  },
  {
    field: 'email',
    headerName: t('residents:table.email'),
    minWidth: 180,
    renderCell: ({ row }) => row.email
  },
  {
    field: 'phoneNumber',
    headerName: t('residents:table.phone'),
    minWidth: 140,
    renderCell: ({ row }) => formatPhoneDisplay(row.phoneNumber) || '-'
  },
  {
    field: 'role',
    headerName: t('residents:table.role'),
    minWidth: 120,
    renderCell: ({ row }) => {
      const { color, icon: Icon } = getRoleColor(row.role)
      return (
        <Chip
          label={t(`residents:role.${row.role}`)}
          icon={<Icon sx={{ color }} />}
          sx={{
            bgcolor: `${color}10`, color,
            fontWeight: 600, fontFamily: '"DM Sans", sans-serif',
            border: `1px solid ${color}40`
          }}
          size="small"
        />
      )
    }
  },
  {
    field: 'lots',
    headerName: t('residents:table.properties'),
    minWidth: 120,
    renderCell: ({ row }) => (
      <Box display="flex" alignItems="center" gap={1}>
        <Home sx={{ fontSize: 16, color: '#8CA551' }} />
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: '#333F1F', fontFamily: '"DM Sans", sans-serif' }}
        >
          {row.lots?.length || 0}
        </Typography>
      </Box>
    )
  },
  // ✅ COLUMNA DE ACCIONES ACTUALIZADA
  {
    field: 'actions',
    headerName: t('residents:table.actions'),
    align: 'center',
    minWidth: 160, // Aumentado de 120 para acomodar 4 botones
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>

        {/* 👤 NUEVO: Personificar (solo visible para SuperAdmin) */}
        <ImpersonateAction targetUser={row} />

        {/* SMS */}
        <Tooltip title={t('residents:actions.sendSMS')} placement="top">
          <span>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onSendSMS(row) }}
              disabled={sendingSMS || isOwner}
              sx={{
                bgcolor: 'rgba(140, 165, 81, 0.08)',
                border: '1px solid rgba(140, 165, 81, 0.2)',
                borderRadius: 2, transition: 'all 0.3s ease',
                '&:hover': { bgcolor: '#8CA551', borderColor: '#8CA551', transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } },
                '&:disabled': { opacity: 0.5 }
              }}
            >
              {sendingSMS
                ? <CircularProgress size={16} />
                : <Sms sx={{ fontSize: 18, color: '#8CA551' }} />}
            </IconButton>
          </span>
        </Tooltip>

        {/* Editar */}
        <Tooltip title={t('residents:actions.edit')} placement="top">
          <span>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onEdit(row) }}
              disabled={isOwner}
              sx={{
                bgcolor: 'rgba(140, 165, 81, 0.08)',
                border: '1px solid rgba(140, 165, 81, 0.2)',
                borderRadius: 2, transition: 'all 0.3s ease',
                '&:hover': { bgcolor: '#8CA551', borderColor: '#8CA551', transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } },
                '&:disabled': { opacity: 0.5 }
              }}
            >
              <Edit sx={{ fontSize: 18, color: '#8CA551' }} />
            </IconButton>
          </span>
        </Tooltip>

        {/* Eliminar */}
        <Tooltip title={t('residents:actions.delete')} placement="top">
          <span>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(row._id) }}
              disabled={isOwner}
              sx={{
                bgcolor: 'rgba(229, 134, 60, 0.08)',
                border: '1px solid rgba(229, 134, 60, 0.2)',
                borderRadius: 2, transition: 'all 0.3s ease',
                '&:hover': { bgcolor: '#E5863C', borderColor: '#E5863C', transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } },
                '&:disabled': { opacity: 0.5 }
              }}
            >
              <Delete sx={{ fontSize: 18, color: '#E5863C' }} />
            </IconButton>
          </span>
        </Tooltip>

      </Box>
    )
  }
]