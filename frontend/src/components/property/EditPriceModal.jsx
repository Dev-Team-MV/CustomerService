import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { Box, Typography, Button, IconButton, MenuItem, Select, InputLabel, FormControl, Chip, Checkbox, FormControlLabel } from '@mui/material';
import { AttachMoney, Close, HomeWork, People, House, Storefront } from '@mui/icons-material';
    import PriceInput from '../../constants/PriceInput'
    
    
const EditPropertyModal = ({
  open,
  onClose,
  property,
  values,
  onChange,
  onSave,
  saving,
  lots = [],
  models = [],
  facades = [],
  users = [],
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
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
      Edit Property
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
      {/* Lot selector */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Lot</InputLabel>
        <Select
          label="Lot"
          value={values.lot || property?.lot?._id || ''}
          onChange={e => onChange({ ...values, lot: e.target.value })}
          startAdornment={<HomeWork sx={{ color: '#8CA551', mr: 1 }} />}
        >
          {lots
            .filter(lot => lot.status === 'available' || lot._id === property?.lot?._id)
            .sort((a, b) => Number(a.number) - Number(b.number))
            .map(lot => (
              <MenuItem key={lot._id} value={lot._id}>
                Lot {lot.number} - ${lot.price}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {/* Model selector */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Model</InputLabel>
        <Select
          label="Model"
          value={values.model || property?.model?._id || ''}
          onChange={e => onChange({ ...values, model: e.target.value })}
          startAdornment={<House sx={{ color: '#8CA551', mr: 1 }} />}
        >
          {models.map(model => (
            <MenuItem key={model._id} value={model._id}>
              {model.model} - {model.sqft} sqft
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Facade selector */}
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Facade</InputLabel>
      <Select
        label="Facade"
        value={values.facade || ''}
  onChange={e => onChange({ ...values, facade: e.target.value })}
        startAdornment={<Storefront sx={{ color: '#8CA551', mr: 1 }} />}
      >
        {facades.map(facade => (
          <MenuItem key={facade._id} value={facade._id}>
            {facade.title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

      {/* Owners selector */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Owners</InputLabel>
        <Select
          label="Owners"
          multiple
          value={values.users || property?.users?.map(u => u._id) || []}
          onChange={e => onChange({ ...values, users: e.target.value })}
          startAdornment={<People sx={{ color: '#8CA551', mr: 1 }} />}
          renderValue={selected => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map(id => {
                const user = users.find(u => u._id === id);
                return (
                  <Chip
                    key={id}
                    label={user ? `${user.firstName} ${user.lastName}` : id}
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      bgcolor: '#e8f5ee',
                      color: '#333F1F',
                    }}
                  />
                );
              })}
            </Box>
          )}
        >
          {users.map(user => (
            <MenuItem key={user._id} value={user._id}>
              {user.firstName} {user.lastName} ({user.email})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Price input */}

    <PriceInput
      label="Price"
      value={values.price ?? property?.price ?? ''}
      onChange={val => onChange({ ...values, price: val })}
      sx={{ mb: 2 }}
    />
    
    <PriceInput
      label="Pending"
      value={values.pending ?? property?.pending ?? ''}
      onChange={val => onChange({ ...values, pending: val })}
      sx={{ mb: 2 }}
    />
    
    <PriceInput
      label="Initial Payment"
      value={values.initialPayment ?? property?.initialPayment ?? ''}
      onChange={val => onChange({ ...values, initialPayment: val })}
      sx={{ mb: 2 }}
    />

      {/* Status input */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Status</InputLabel>
        <Select
          label="Status"
          value={values.status ?? property?.status ?? ''}
          onChange={e => onChange({ ...values, status: e.target.value })}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="sold">Sold</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </Select>
      </FormControl>

      {/* Sale Date input */}
      <TextField
        label="Sale Date"
        type="date"
        value={
          values.saleDate
            ? values.saleDate.slice(0, 10)
            : property?.saleDate
            ? property.saleDate.slice(0, 10)
            : ''
        }
        onChange={e => onChange({ ...values, saleDate: e.target.value })}
        fullWidth
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 2 }}
      />

      {/* Model Type */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Model Type</InputLabel>
        <Select
          label="Model Type"
          value={values.modelType ?? property?.modelType ?? 'basic'}
          onChange={e => onChange({ ...values, modelType: e.target.value })}
        >
          <MenuItem value="basic">Basic</MenuItem>
          <MenuItem value="upgrade">Upgrade</MenuItem>
        </Select>
      </FormControl>

      {/* Has Balcony */}
      <FormControlLabel
        control={
          <Checkbox
            checked={values.hasBalcony ?? property?.hasBalcony ?? false}
            onChange={e => onChange({ ...values, hasBalcony: e.target.checked })}
            sx={{ color: '#8CA551' }}
          />
        }
        label="Has Balcony"
        sx={{ mb: 1 }}
      />

      {/* Has Storage */}
      <FormControlLabel
        control={
          <Checkbox
            checked={values.hasStorage ?? property?.hasStorage ?? false}
            onChange={e => onChange({ ...values, hasStorage: e.target.checked })}
            sx={{ color: '#8CA551' }}
          />
        }
        label="Has Storage"
        sx={{ mb: 1 }}
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

export default EditPropertyModal;