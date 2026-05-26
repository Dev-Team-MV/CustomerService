import { Box, Typography, Grid, Checkbox, FormControlLabel, TextField, Alert } from '@mui/material';
import { Balcony, Upgrade as UpgradeIcon, Storage as StorageIcon } from '@mui/icons-material';

const ModelPricingOptions = ({
  formData,
  setFormData,
  expandedAccordions,
  setExpandedAccordions,
  t
}) => (
  <>
    <Grid item xs={12}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Box sx={{
          width: 32,
          height: 32,
          borderRadius: 2,
          bgcolor: 'rgba(140, 165, 81, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <UpgradeIcon sx={{ fontSize: 18, color: '#8CA551' }} />
        </Box>
        <Typography 
          variant="subtitle1" 
          fontWeight={700} 
          fontSize={{ xs: "0.85rem", md: "0.95rem" }}
          sx={{ color: '#333F1F', fontFamily: '"DM Sans", sans-serif', letterSpacing: '0.5px' }}
        >
          {t('models:pricingOptions')}
        </Typography>
      </Box>
    </Grid>

    {/* Balcony */}
    <Grid item xs={8}>
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.hasBalcony}
            onChange={(e) => {
              setFormData({
                ...formData,
                hasBalcony: e.target.checked,
                balconyPrice: e.target.checked ? formData.balconyPrice : 0,
              });
              if (e.target.checked) {
                setExpandedAccordions((prev) => ({ ...prev, balcony: true }));
              }
            }}
            sx={{ '&.Mui-checked': { color: '#8CA551' }, padding: '4px' }}
          />
        }
        label={
          <Box display="flex" alignItems="center" gap={0.5}>
            <Balcony fontSize="small" sx={{ color: formData.hasBalcony ? '#8CA551' : '#706f6f', fontSize: '1rem' }} />
            <Typography fontWeight={600} fontSize="0.8rem" sx={{ color: formData.hasBalcony ? '#333F1F' : '#706f6f', fontFamily: '"DM Sans", sans-serif' }}>
              {t('models:balcony')}
            </Typography>
          </Box>
        }
        sx={{ margin: 0 }}
      />
    </Grid>
    {formData.hasBalcony && (
      <Grid item xs={4}>
        <TextField
          fullWidth
          size="small"
          type="number"
          label="+ Price"
          value={formData.balconyPrice}
          onChange={(e) =>
            setFormData({ ...formData, balconyPrice: Number(e.target.value) })
          }
          required
          InputProps={{
            startAdornment: (
              <Typography sx={{ mr: 0.5, fontSize: "0.7rem", color: '#8CA551', fontWeight: 600 }}>$</Typography>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontFamily: '"DM Sans", sans-serif',
              bgcolor: 'white',
              borderColor: '#8CA551',
              "&.Mui-focused fieldset": { borderColor: "#8CA551", borderWidth: "2px" },
              "&:hover fieldset": { borderColor: "#8CA551" }
            },
            "& .MuiInputLabel-root": { fontFamily: '"DM Sans", sans-serif', "&.Mui-focused": { color: "#8CA551" }, fontSize: '0.8rem' }
          }}
        />
      </Grid>
    )}

    {/* Upgrade */}
    <Grid item xs={8}>
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.hasUpgrade}
            onChange={(e) => {
              setFormData({
                ...formData,
                hasUpgrade: e.target.checked,
                upgradePrice: e.target.checked ? formData.upgradePrice : 0,
              });
              if (e.target.checked) {
                setExpandedAccordions((prev) => ({ ...prev, upgrade: true }));
              }
            }}
            sx={{ '&.Mui-checked': { color: '#9c27b0' }, padding: '4px' }}
          />
        }
        label={
          <Box display="flex" alignItems="center" gap={0.5}>
            <UpgradeIcon fontSize="small" sx={{ color: formData.hasUpgrade ? '#9c27b0' : '#706f6f', fontSize: '1rem' }} />
            <Typography fontWeight={600} fontSize="0.8rem" sx={{ color: formData.hasUpgrade ? '#333F1F' : '#706f6f', fontFamily: '"DM Sans", sans-serif' }}>
              {t('models:upgrade')}
            </Typography>
          </Box>
        }
        sx={{ margin: 0 }}
      />
    </Grid>
    {formData.hasUpgrade && (
      <Grid item xs={4}>
        <TextField
          fullWidth
          size="small"
          type="number"
          label="+ Price"
          value={formData.upgradePrice}
          onChange={(e) =>
            setFormData({ ...formData, upgradePrice: Number(e.target.value) })
          }
          required
          InputProps={{
            startAdornment: (
              <Typography sx={{ mr: 0.5, fontSize: "0.7rem", color: '#9c27b0', fontWeight: 600 }}>$</Typography>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontFamily: '"DM Sans", sans-serif',
              bgcolor: 'white',
              "&.Mui-focused fieldset": { borderColor: "#9c27b0", borderWidth: "2px" },
              "&:hover fieldset": { borderColor: "#9c27b0" }
            },
            "& .MuiInputLabel-root": { fontFamily: '"DM Sans", sans-serif', "&.Mui-focused": { color: "#9c27b0" }, fontSize: '0.8rem' }
          }}
        />
      </Grid>
    )}

    {/* Storage */}
    <Grid item xs={8}>
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.hasStorage}
            onChange={(e) => {
              setFormData({
                ...formData,
                hasStorage: e.target.checked,
                storagePrice: e.target.checked ? formData.storagePrice : 0,
              });
              if (e.target.checked) {
                setExpandedAccordions((prev) => ({ ...prev, storage: true }));
              }
            }}
            sx={{ '&.Mui-checked': { color: '#4caf50' }, padding: '4px' }}
          />
        }
        label={
          <Box display="flex" alignItems="center" gap={0.5}>
            <StorageIcon fontSize="small" sx={{ color: formData.hasStorage ? '#4caf50' : '#706f6f', fontSize: '1rem' }} />
            <Typography fontWeight={600} fontSize="0.8rem" sx={{ color: formData.hasStorage ? '#333F1F' : '#706f6f', fontFamily: '"DM Sans", sans-serif' }}>
              {t('models:storage')}
            </Typography>
          </Box>
        }
        sx={{ margin: 0 }}
      />
    </Grid>
    {formData.hasStorage && (
      <Grid item xs={4}>
        <TextField
          fullWidth
          size="small"
          type="number"
          label="+ Price"
          value={formData.storagePrice}
          onChange={(e) =>
            setFormData({ ...formData, storagePrice: Number(e.target.value) })
          }
          required
          InputProps={{
            startAdornment: (
              <Typography sx={{ mr: 0.5, fontSize: "0.7rem", color: '#4caf50', fontWeight: 600 }}>$</Typography>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontFamily: '"DM Sans", sans-serif',
              bgcolor: 'white',
              "&.Mui-focused fieldset": { borderColor: "#4caf50", borderWidth: "2px" },
              "&:hover fieldset": { borderColor: "#4caf50" }
            },
            "& .MuiInputLabel-root": { fontFamily: '"DM Sans", sans-serif', "&.Mui-focused": { color: "#4caf50" }, fontSize: '0.8rem' }
          }}
        />
      </Grid>
    )}
  </>
);

export default ModelPricingOptions;