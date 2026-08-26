import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  useTheme
} from '@mui/material'
import { Close } from '@mui/icons-material'

const ModalWrapper = ({
  open,
  onClose,
  icon: Icon,
  title,
  subtitle,
  children,
  actions = null,
  maxWidth = 'md',
  fullWidth = true,
  dialogProps = {} // ✅ NUEVO: Permite pasar 'id', 'aria-*' u otras props nativas del Dialog
}) => {
  const theme = useTheme()
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      {...dialogProps} // ✅ Expandir las props aquí (incluye el 'id')
      PaperProps={{
        ...dialogProps.PaperProps, // ✅ Preservar PaperProps si se pasan desde fuera
        sx: {
          borderRadius: 4,
          boxShadow: `0 20px 60px ${theme.palette?.primary?.main ? theme.palette.primary.main + '26' : 'rgba(51,63,31,0.15)'}`,
          ...(dialogProps.PaperProps?.sx || {}) // ✅ Fusionar estilos adicionales si los hay
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          {Icon && (
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: theme.palette?.primary?.main || '#333F1F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${theme.palette?.primary?.main ? theme.palette.primary.main + '33' : 'rgba(51,63,31,0.2)'}`
            }}>
              <Icon sx={{ color: theme.palette?.primary?.contrastText || 'white', fontSize: 24 }} />
            </Box>
          )}
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: theme.palette?.primary?.main || '#333F1F', fontFamily: '"DM Sans", sans-serif' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: theme.palette?.text?.secondary || '#706f6f', fontFamily: '"DM Sans", sans-serif' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box flex={1} />
          <IconButton onClick={onClose} sx={{ color: theme.palette?.text?.secondary || '#706f6f', '&:hover': { bgcolor: theme.palette?.action?.hover || 'rgba(112,111,111,0.08)' } }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions sx={{ p: 3, gap: 2 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  )
}

export default ModalWrapper