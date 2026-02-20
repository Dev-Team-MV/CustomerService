import { Chip, Box, Typography } from '@mui/material'
import { Balcony, Upgrade, Storage } from '@mui/icons-material'

const OptionChips = ({
  options,
  model,
  onToggle,
  labels = {},
  disabled = false,
  prefix = '',
}) => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
    {model.upgrades?.length > 0 && (
      <Chip
        icon={<Upgrade sx={{ color: options.upgrade ? '#8CA551' : '#706f6f' }} />}
        label={
          <Box display="flex" alignItems="center" gap={1}>
            {prefix}{labels.upgrade || 'Upgrade'}
            <Typography
              component="span"
              sx={{
                fontWeight: 700,
                color: '#8CA551',
                fontSize: '0.85em',
                ml: 0.5,
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              +${(model.upgradePrice || model.upgrades?.[0]?.price || 0).toLocaleString()}
            </Typography>
          </Box>
        }
        clickable={!disabled}
        onClick={() => !disabled && onToggle('upgrade')}
        sx={{
          fontWeight: 600,
          px: 2,
          fontSize: '0.875rem',
          fontFamily: '"Poppins", sans-serif',
          bgcolor: options.upgrade ? 'rgba(140, 165, 81, 0.12)' : '#fafafa',
          color: options.upgrade ? '#333F1F' : '#706f6f',
          border: `1px solid ${options.upgrade ? '#8CA551' : '#e0e0e0'}`,
        }}
      />
    )}
    {model.balconies?.length > 0 && (
      <Chip
        icon={<Balcony sx={{ color: options.balcony ? '#8CA551' : '#706f6f' }} />}
        label={
          <Box display="flex" alignItems="center" gap={1}>
            {prefix}{labels.balcony || 'Balcony'}
            <Typography
              component="span"
              sx={{
                fontWeight: 700,
                color: '#8CA551',
                fontSize: '0.85em',
                ml: 0.5,
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              +${(model.balconyPrice || model.balconies?.[0]?.price || 0).toLocaleString()}
            </Typography>
          </Box>
        }
        clickable={!disabled}
        onClick={() => !disabled && onToggle('balcony')}
        sx={{
          fontWeight: 600,
          px: 2,
          fontSize: '0.875rem',
          fontFamily: '"Poppins", sans-serif',
          bgcolor: options.balcony ? 'rgba(140, 165, 81, 0.12)' : '#fafafa',
          color: options.balcony ? '#333F1F' : '#706f6f',
          border: `1px solid ${options.balcony ? '#8CA551' : '#e0e0e0'}`,
        }}
      />
    )}
    {model.storages?.length > 0 && (
      <Chip
        icon={<Storage sx={{ color: options.storage ? '#E5863C' : '#706f6f' }} />}
        label={
          <Box display="flex" alignItems="center" gap={1}>
            {prefix}{labels.storage || 'Storage'}
            <Typography
              component="span"
              sx={{
                fontWeight: 700,
                color: '#E5863C',
                fontSize: '0.85em',
                ml: 0.5,
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              +${(model.storagePrice || model.storages?.[0]?.price || 0).toLocaleString()}
            </Typography>
          </Box>
        }
        clickable={!disabled}
        onClick={() => !disabled && onToggle('storage')}
        sx={{
          fontWeight: 600,
          px: 2,
          fontSize: '0.875rem',
          fontFamily: '"Poppins", sans-serif',
          bgcolor: options.storage ? 'rgba(229, 134, 60, 0.12)' : '#fafafa',
          color: options.storage ? '#333F1F' : '#706f6f',
          border: `1px solid ${options.storage ? '#E5863C' : '#e0e0e0'}`,
        }}
      />
    )}
  </div>
)

export default OptionChips