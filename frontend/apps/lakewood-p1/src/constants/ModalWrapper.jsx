import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton
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
  fullWidth = true
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth={maxWidth}
    fullWidth={fullWidth}
    PaperProps={{
      sx: { borderRadius: 4, boxShadow: '0 20px 60px rgba(51,63,31,0.15)' }
    }}
  >
    <DialogTitle>
      <Box display="flex" alignItems="center" gap={2}>
        {Icon && (
          <Box sx={{
            width: 48, height: 48, borderRadius: 3, bgcolor: '#333F1F',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(51,63,31,0.2)'
          }}>
            <Icon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
        )}
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box flex={1} />
        <IconButton onClick={onClose} sx={{ color: '#706f6f', '&:hover': { bgcolor: 'rgba(112,111,111,0.08)' } }}>
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

export default ModalWrapper