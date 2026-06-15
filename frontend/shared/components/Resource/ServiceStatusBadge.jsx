// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/components/ServiceStatusBadge.jsx
import { Chip, Box, CircularProgress, Tooltip } from '@mui/material'
import { 
  PlayCircle, 
  Pending, 
  CheckCircle, 
  Done, 
  Cancel, 
  HelpOutline 
} from '@mui/icons-material'

const ICON_MAP = {
  play: PlayCircle,
  pending: Pending,
  check: CheckCircle,
  done: Done,
  cancel: Cancel
}

const ServiceStatusBadge = ({ badge, loading = false, showCount = false, totalCount = 0 }) => {
  if (loading) {
    return (
      <Chip
        icon={<CircularProgress size={16} />}
        label="Cargando..."
        size="small"
        variant="outlined"
      />
    )
  }

  if (!badge) {
    return null
  }

  const Icon = badge.icon ? ICON_MAP[badge.icon] : HelpOutline

  const label = showCount && totalCount > 0 
    ? `${badge.label} (${totalCount})`
    : badge.label

  return (
    <Tooltip title={`Estado del servicio: ${badge.label}`}>
      <Chip
        icon={<Icon sx={{ fontSize: 16 }} />}
        label={label}
        size="small"
        sx={{
          bgcolor: `${badge.color}15`,
          color: badge.color,
          fontWeight: 600,
          '& .MuiChip-icon': {
            color: badge.color
          }
        }}
      />
    </Tooltip>
  )
}

export default ServiceStatusBadge