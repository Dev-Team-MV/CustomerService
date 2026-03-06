import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Typography, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { Logout, GridView, FolderOpen, People, Settings, Person } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import LanguageSwitcher from '@shared/components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import mvLogo from '../../../public/images/logos/LOGO_MICHELANGELO_PNG_Mesa de trabajo 1.png'


const NAV = [
  { key: 'overview', labelKey: 'overview', icon: GridView,   path: '/dashboard' },
  { key: 'clients',  labelKey: 'clients',  icon: People,     path: '/clients'   },
  { key: 'projects', labelKey: 'projects', icon: FolderOpen, path: '/projects'  },
  { key: 'settings', labelKey: 'settings', icon: Settings,   path: '/settings'  },
]


export default function Sidebar({ stats = [] }) {
  const navigate       = useNavigate()
  const location       = useLocation()
  const { user, logout } = useAuth()
  const { t } = useTranslation('navigation')
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <Box sx={{
      width: 220, height: '100vh', position: 'sticky', top: 0,
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid #1a1a1a', background: '#0a0a0a', flexShrink: 0
    }}>

      {/* ── Logo ── */}

    
          {/* ─── LOGO — reemplaza el bloque Master Control Panel ─── */}
          <Box sx={{ p: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
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
    


      {/* ── Quick stats (opcional) ── */}
      {stats.length > 0 && (
        <Box sx={{ mx: 2, mb: 2, p: '12px 14px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
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

      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Nav */}
      <List sx={{ px: 1.5, py: 2, flex: 1 }} disablePadding>
        {NAV.map((item, i) => {
          const Icon     = item.icon
          const isActive = location.pathname === item.path
          return (
            <motion.div key={item.key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
              <ListItem
                onClick={() => navigate(item.path)}
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

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      <Box sx={{ px: 2, py: 1 }}>
        <LanguageSwitcher />
      </Box>

      {/* ── User Profile Button ── */}
      <Box 
        onClick={() => navigate('/profile')}
        sx={{ 
          p: '12px 16px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.2, 
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          cursor: 'pointer',
          transition: 'background 0.2s',
          '&:hover': { background: 'rgba(255,255,255,0.05)' }
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

      {/* ── Sign out ── */}
      <Box onClick={handleLogout} sx={{ p: '14px 20px', display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', transition: 'background 0.2s', '&:hover': { background: 'rgba(255,255,255,0.05)' } }}>
        <Logout sx={{ fontSize: 15, color: 'rgba(255,255,255,0.35)' }} />
        <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>
          {t('signOut')}
        </Typography>
      </Box>

    </Box>
  )
}