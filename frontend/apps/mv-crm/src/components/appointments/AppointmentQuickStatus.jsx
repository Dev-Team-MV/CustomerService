// apps/mv-crm/src/components/appointments/AppointmentQuickStatus.jsx
import { useState } from 'react'
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Box
} from '@mui/material'
import {
  CheckCircle,
  PendingActions,
  EventBusy,
  DoneAll,
  MoreVert
} from '@mui/icons-material'

const STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente', icon: <PendingActions />, color: '#ff9800' },
  { value: 'confirmada', label: 'Confirmada', icon: <CheckCircle />, color: '#2196f3' },
  { value: 'completada', label: 'Completada', icon: <DoneAll />, color: '#4caf50' },
  { value: 'cancelada', label: 'Cancelada', icon: <EventBusy />, color: '#f44336' }
]

const AppointmentQuickStatus = ({ appointment, onUpdateStatus, currentStatus }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleClick = (event) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) {
      handleClose()
      return
    }

    setLoading(true)
    try {
      await onUpdateStatus(appointment._id, newStatus)
      handleClose()
    } catch (err) {
      console.error('Error updating status:', err)
      handleClose()
    } finally {
      setLoading(false)
    }
  }

  const currentStatusConfig = STATUS_OPTIONS.find(s => s.value === currentStatus) || STATUS_OPTIONS[0]

  return (
    <>
      <Tooltip title="Cambiar estado" placement="top">
        <IconButton
          size="small"
          onClick={handleClick}
          disabled={loading}
          sx={{
            color: 'rgba(255,255,255,0.9)',
            bgcolor: 'rgba(255,255,255,0.2)',
            padding: '2px',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.3)'
            },
            '&.Mui-disabled': {
              color: 'rgba(255,255,255,0.5)'
            }
          }}
        >
          <MoreVert sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            borderRadius: 0,
            border: '1px solid #ececec',
            minWidth: 200,
            mt: 1
          }
        }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #f0f0f0' }}>
          <Box sx={{ 
            fontFamily: '"Courier New", monospace',
            fontSize: '0.65rem',
            color: '#888',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Cambiar estado
          </Box>
        </Box>
        
        {STATUS_OPTIONS.map(status => (
          <MenuItem
            key={status.value}
            onClick={() => handleStatusChange(status.value)}
            disabled={status.value === currentStatus || loading}
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              py: 1,
              opacity: status.value === currentStatus ? 0.6 : 1,
              bgcolor: status.value === currentStatus ? `${status.color}10` : 'transparent',
              '&:hover': {
                bgcolor: `${status.color}15`
              }
            }}
          >
            <ListItemIcon sx={{ color: status.color, minWidth: 36 }}>
              {status.icon}
            </ListItemIcon>
            <ListItemText
              primary={status.label}
              primaryTypographyProps={{
                sx: {
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.75rem',
                  fontWeight: status.value === currentStatus ? 700 : 500
                }
              }}
            />
            {status.value === currentStatus && (
              <Box sx={{ 
                ml: 1, 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: status.color 
              }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default AppointmentQuickStatus