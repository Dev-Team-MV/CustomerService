import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { AttachMoney, Close } from '@mui/icons-material';

const EditPriceModal = ({ open, onClose, property, value, onChange, onSave, saving }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: 4,
        border: '1.5px solid #e8f5ee',
        background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
        boxShadow: '0 12px 32px rgba(74,124,89,0.12)',
        overflow: 'hidden',
        position: 'relative'
      }
    }}
  >
    {/* Barra decorativa superior */}
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: 'linear-gradient(90deg, #333F1F, #8CA551, #333F1F)',
        opacity: 0.9,
        zIndex: 10
      }}
    />
    <DialogTitle
      sx={{
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 800,
        color: '#333F1F',
        letterSpacing: '0.5px',
        pb: 1.5,
        pr: 5
      }}
    >
      Edit Property Price
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 16,
          top: 12,
          color: '#8CA551'
        }}
      >
        <Close />
      </IconButton>
    </DialogTitle>
    <DialogContent sx={{ py: 3 }}>
      <Typography
        variant="subtitle1"
        sx={{
          mb: 2,
          fontFamily: '"Poppins", sans-serif',
          color: '#8CA551',
          fontWeight: 700
        }}
      >
        Lot {property?.lot?.number} - {property?.model?.model}
      </Typography>
      <TextField
        label="Price"
        type="number"
        value={value}
        onChange={onChange}
        fullWidth
        InputProps={{
          startAdornment: <AttachMoney sx={{ color: '#8CA551' }} />,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
            '&.Mui-focused fieldset': {
              borderColor: '#8CA551',
              borderWidth: 2
            }
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#8CA551'
          }
        }}
      />
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button
        onClick={onClose}
        variant="outlined"
        sx={{
          borderRadius: 2,
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 600,
          borderColor: '#8CA551',
          color: '#8CA551',
          '&:hover': {
            borderColor: '#333F1F',
            color: '#333F1F',
            bgcolor: 'rgba(140, 165, 81, 0.05)'
          }
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={onSave}
        variant="contained"
        disabled={saving}
        sx={{
          borderRadius: 2,
          bgcolor: '#8CA551',
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 700,
          px: 4,
          boxShadow: '0 4px 12px rgba(140, 165, 81, 0.18)',
          '&:hover': { bgcolor: '#333F1F' }
        }}
      >
        {saving ? 'Saving...' : 'Save'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default EditPriceModal;