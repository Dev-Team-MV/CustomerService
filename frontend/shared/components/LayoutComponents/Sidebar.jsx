// apps/mv-crm/src/components/layout/Sidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Typography, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { 
  Logout, 
  People, 
  Person, 
  TrendingUp,
  Insights,
  Assessment,
  SupportAgent,
  CalendarToday,
  History,
  Dashboard,
  AutoFixHigh,
  Campaign,
  AccountBalanceWallet,
  AccountBalance,
  ReceiptLong,
  Description,
  Handshake,
  PersonAddAlt1,
  Business,
  Paid,
  TaskAlt,
  Message
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAuth } from '@shared/context/AuthContext'
import LanguageSwitcher from '@shared/components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import mvLogo from '../../assets/logos/LOGO_MICHELANGELO_PNG_Mesa de trabajo 1.png'

const NAV = [
  { key: 'overview', labelKey: 'overview', icon: Dashboard, path: '/dashboard' },
  { key: 'clients', labelKey: 'clients', icon: People, path: '/clients' },
  { key: 'calendar', labelKey: 'calendar', icon: CalendarToday, path: '/calendar' },
  { key: 'automations', labelKey: 'automations', icon: AutoFixHigh, path: '/automations' },
  { key: 'campaigns', labelKey: 'campaigns', icon: Campaign, path: '/campaigns' },
  { key: 'comissions', labelKey: 'comissions', icon: AccountBalanceWallet, path: '/comissions' },
  { key: 'quote', labelKey: 'quote', icon: ReceiptLong, path: '/quote' },
  { key: 'vendors', labelKey: 'vendors', icon: Business, path: '/vendors' },
  { key: 'documents', labelKey: 'documents', icon: Description, path: '/documents' },
  { key: 'post-sale', labelKey: 'post-sale', icon: Handshake, path: '/post-sale' },
  { key: 'referrals', labelKey: 'referrals', icon: PersonAddAlt1, path: '/referrals' },
  { key: 'audit', labelKey: 'audit', icon: History, path: '/audit' },
  { key: 'projects', labelKey: 'projects', icon: Business, path: '/projects' },
  { key: 'sales', labelKey: 'sales', icon: TrendingUp, path: '/sales' },
  { key: 'payments', labelKey: 'payments', icon: Paid, path: '/payments' },
  { key: 'reports', labelKey: 'reports', icon: Assessment, path: '/reports' },
  { key: 'agents', labelKey: 'agents', icon: SupportAgent, path: '/agents' },
  { key: 'loans', labelKey: 'loans', icon: AccountBalance, path: '/loans' },
  { key: 'activities', labelKey: 'activities', icon: TaskAlt, path: '/activities' },
  { key: 'analytics', labelKey: 'analytics', icon: Insights, path: '/analytics' },
  { key: 'messageTemplates', labelKey: 'messageTemplates', icon: Message, path: '/message-templates' }
]

// ✅ NUEVO: Agregar prop onNavigate
export default function Sidebar({ stats = [], onNavigate }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { t } = useTranslation('navigation')
  
  const handleLogout = () => { 
    logout()
    navigate('/login') 
  }

  // ✅ NUEVO: Wrapper para navegación que cierra el drawer móvil
  const handleNavClick = (path) => {
    navigate(path)
    onNavigate?.()
  }

  return (
    <Box sx={{
      width: 220, 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      borderRight: '1px solid #1a1a1a', 
      background: '#0a0a0a', 
      flexShrink: 0
    }}>
      {/* Logo */}
      <Box sx={{ p: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Box
            component="img"
            src={mvLogo}
            alt="Michelangelo Del Valle"
            sx={{
              width: '100%',
              maxWidth: 140,
              height: 'auto',
              objectFit: 'contain',
              filter: 'invert(1)',
              opacity: 0.92,
            }}
          />
        </motion.div>
      </Box>

      {/* Quick stats */}
      {stats.length > 0 && (
        <Box sx={{ mx: 2, mb: 2, p: '12px 14px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', flexShrink: 0 }}>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '1.5px', textTransform: 'uppercase', mb: 1.5 }}>
            {t('quickStats')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {stats.map(s => (
              <Box key={s.label}>
                <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#fff', lineHeight: 1 }}>
                  {s.value}
                </Typography>
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />

      {/* Nav con scroll */}
      <List sx={{ 
        px: 1.5, 
        py: 2, 
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.02)' },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 2
        },
        '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.2)' }
      }} disablePadding>
        {NAV.map((item, i) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <motion.div key={item.key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
              <ListItem
                onClick={() => handleNavClick(item.path)}
                sx={{
                  borderRadius: 0, mb: 0.5, px: 1.5, py: 1.1, cursor: 'pointer',
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(255,255,255,0.15)' : 'transparent'}`,
                  transition: 'all 0.2s ease',
                  '&:hover': { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 30, color: isActive ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                  <Icon sx={{ fontSize: 17 }} />
                </ListItemIcon>
                <ListItemText primary={t(item.labelKey)} sx={{
                  '& .MuiListItemText-primary': {
                    fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem',
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                    letterSpacing: '-0.01em'
                  }
                }} />
              </ListItem>
            </motion.div>
          )
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />

      {/* Footer section */}
      <Box sx={{ px: 2, py: 1, flexShrink: 0 }}>
        <LanguageSwitcher variant="sidebar" />
      </Box>

      {/* User Profile Button */}
      <Box 
        onClick={() => handleNavClick('/profile')}
        sx={{ 
          p: '12px 16px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.2, 
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          cursor: 'pointer',
          transition: 'background 0.2s',
          '&:hover': { background: 'rgba(255,255,255,0.05)' },
          flexShrink: 0
        }}
      >
        <Box sx={{ width: 28, height: 28, bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#fff', fontWeight: 700 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.52rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {user?.role}
          </Typography>
        </Box>
        <Person sx={{ fontSize: 15, color: 'rgba(255,255,255,0.35)' }} />
      </Box>

      {/* Sign out */}
      <Box onClick={handleLogout} sx={{ p: '14px 20px', display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', transition: 'background 0.2s', '&:hover': { background: 'rgba(255,255,255,0.05)' }, flexShrink: 0 }}>
        <Logout sx={{ fontSize: 15, color: 'rgba(255,255,255,0.35)' }} />
        <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>
          {t('signOut')}
        </Typography>
      </Box>
    </Box>
  )
}