// apps/mv-crm/src/components/notifications/NotificationBell.jsx
import { IconButton, Badge, Tooltip } from '@mui/material'
import { Notifications as NotificationsIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

const NotificationBell = ({ unreadCount, onClick }) => {
  const { t } = useTranslation('navigation')

  return (
    <Tooltip title={t('bell.tooltip', 'Notificaciones')} placement="bottom">
      <IconButton
        onClick={onClick}
        sx={{
          color: '#000',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
        }}
      >
        <Badge
          badgeContent={unreadCount > 0 ? unreadCount : null}
          color="error"
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontFamily: '"Courier New", monospace',
              fontSize: '0.65rem',
              fontWeight: 700
            }
          }}
        >
          <NotificationsIcon sx={{ fontSize: 20 }} />
        </Badge>
      </IconButton>
    </Tooltip>
  )
}

export default NotificationBell