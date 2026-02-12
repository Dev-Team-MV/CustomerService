import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Avatar,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Button,
  Backdrop,
  Badge
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import LandscapeIcon from '@mui/icons-material/Landscape'
import HomeIcon from '@mui/icons-material/Home'
import PaymentIcon from '@mui/icons-material/Payment'
import PeopleIcon from '@mui/icons-material/People'
import BarChartIcon from '@mui/icons-material/BarChart'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import LoginIcon from '@mui/icons-material/Login'
import NotificationsIcon from '@mui/icons-material/Notifications'
import ChatIcon from '@mui/icons-material/Chat'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const drawerWidthExpanded = 260

const Layout = ({ publicView = false }) => {
  const [anchorElUser, setAnchorElUser] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Payment received", description: "Your payment has been processed.", read: false },
    { id: 2, title: "New message", description: "You have a new message from admin.", read: false },
    { id: 3, title: "Document approved", description: "Your document was approved.", read: true }
  ])

  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget)
  const handleCloseUserMenu = () => setAnchorElUser(null)
  const handleLogout = () => {
    logout()
    navigate('/login')
    handleCloseUserMenu()
  }

  const privateMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['superadmin', 'admin', 'user'] },
    { text: 'Properties', icon: <HomeWorkIcon />, path: '/properties', roles: ['superadmin', 'admin'] },
    { text: 'Lot Inventory', icon: <LandscapeIcon />, path: '/lots', roles: ['superadmin', 'admin'] },
    { text: 'Models', icon: <HomeIcon />, path: '/models', roles: ['superadmin', 'admin'] },
    { text: 'Payloads', icon: <PaymentIcon />, path: '/payloads', roles: ['superadmin', 'admin'] },
    { text: 'Residents', icon: <PeopleIcon />, path: '/residents', roles: ['superadmin', 'admin'] },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics', roles: ['superadmin', 'admin'] },
    { text: 'My Property', icon: <HomeIcon />, path: '/my-property', roles: ['superadmin', 'admin', 'user'] },
    { text: 'Amenities', icon: <HomeWorkIcon />, path: '/amenities', roles: ['superadmin', 'admin', 'user'] }
  ]

  const publicMenuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'News', icon: <HomeIcon />, path: '/explore/news' },
    { text: 'Get Your Quote', icon: <HomeWorkIcon />, path: '/explore/properties' },
    { text: 'Explore Amenities', icon: <HomeIcon />, path: '/explore/amenities' }
  ]

  const menuItems = publicView ? publicMenuItems : privateMenuItems.filter(item => item.roles.includes(user?.role))

  const handleNavigate = (path) => {
    navigate(path)
    setExpanded(false)
  }

  const drawer = (
    <Box 
      sx={{ 
        height: '100%',
        width: drawerWidthExpanded,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRight: '1px solid rgba(255,255,255,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)'
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
        <Box
          component="img"
          src="/images/logos/Logo_LakewoodOaks-05.png"
          alt="Lakewood Oaks"
          sx={{
            width: '100%',
            maxWidth: '200px',
            height: 'auto',
            objectFit: 'contain'
          }}
        />
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {/* ✅ Botón de notificaciones (solo para usuarios autenticados) */}
        {!publicView && user && (
          <ListItem disablePadding sx={{ mb: 2 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%' }}
            >
              <ListItemButton
                onClick={() => {
                  setNotificationsOpen(true)
                  setExpanded(false)
                }}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  bgcolor: 'rgba(33, 150, 243, 0.08)',
                  border: '1px solid rgba(33, 150, 243, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(33, 150, 243, 0.15)',
                    transform: 'translateX(6px)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 45, color: '#2196f3' }}>
                  <Box
                    sx={{
                      bgcolor: 'rgba(33, 150, 243, 0.15)',
                      borderRadius: 2,
                      p: 0.8,
                      display: 'flex',
                      position: 'relative'
                    }}
                  >
                    <Badge
                      badgeContent={notifications.filter(n => !n.read).length}
                      color="error"
                      overlap="circular"
                      sx={{
                        '& .MuiBadge-badge': {
                          top: -4,
                          right: -4,
                          minWidth: 18,
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 700
                        }
                      }}
                    >
                      <NotificationsIcon />
                    </Badge>
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary="Notifications"
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#2d3748'
                  }}
                />
                {notifications.filter(n => !n.read).length > 0 && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#ff5252',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.5 }
                      }
                    }}
                  />
                )}
              </ListItemButton>
            </motion.div>
          </ListItem>
        )}

        {/* Items del menú */}
        {menuItems.map((item, index) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: index * 0.05,
                duration: 0.3,
                ease: "easeOut"
              }}
              style={{ width: '100%' }}
            >
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  position: 'relative',
                  bgcolor: location.pathname === item.path ? 'rgba(74, 124, 89, 0.12)' : 'transparent',
                  '&::after': location.pathname === item.path ? {
                    content: '""',
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 4,
                    height: '70%',
                    bgcolor: '#4a7c59',
                    borderRadius: '4px 0 0 4px',
                    boxShadow: '-2px 0 8px rgba(74, 124, 89, 0.3)'
                  } : {},
                  '&:hover': {
                    bgcolor: 'rgba(74, 124, 89, 0.08)',
                    transform: 'translateX(6px)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 45,
                    color: location.pathname === item.path ? '#4a7c59' : '#718096'
                  }}
                >
                  <Box sx={{
                    bgcolor: location.pathname === item.path ? 'rgba(74, 124, 89, 0.15)' : 'transparent',
                    borderRadius: 2,
                    p: 0.8,
                    display: 'flex'
                  }}>
                    {item.icon}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    color: location.pathname === item.path ? '#2d3748' : '#4a5568'
                  }}
                />
              </ListItemButton>
            </motion.div>
          </ListItem>
        ))}
      </List>

      {/* Toggle Button */}
      <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <IconButton
          onClick={() => setExpanded(false)}
          sx={{
            bgcolor: 'rgba(74, 124, 89, 0.1)',
            color: '#4a7c59',
            width: 36,
            height: 36,
            '&:hover': {
              bgcolor: 'rgba(74, 124, 89, 0.2)',
            }
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', position: 'relative' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: '#2d3748',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          zIndex: 1201
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setExpanded(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Box
              component="img"
              src="/images/logos/Logo_LakewoodOaks-05.png"
              alt="Lakewood Oaks"
              sx={{
                width: '100%',
                maxWidth: '200px',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          </Box>

          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* ✅ Notificaciones en el AppBar (solo para usuarios autenticados) */}
            {!publicView && user && (
              <IconButton
                onClick={() => setNotificationsOpen(true)}
                sx={{
                  color: '#2d3748',
                  '&:hover': {
                    bgcolor: 'rgba(33, 150, 243, 0.08)'
                  }
                }}
              >
                <Badge
                  badgeContent={notifications.filter(n => !n.read).length}
                  color="error"
                  overlap="circular"
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            )}

            {user ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#4a7c59',
                        width: 38,
                        height: 38,
                        border: '2px solid rgba(74, 124, 89, 0.2)'
                      }}
                    >
                      {user?.firstName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorElUser}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  sx={{ 
                    mt: 1.5,
                    '& .MuiPaper-root': {
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      minWidth: 200,
                      backdropFilter: 'blur(20px)',
                      bgcolor: 'rgba(255, 255, 255, 0.95)'
                    }
                  }}
                >
                  <MenuItem 
                    onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}
                    sx={{ py: 1.5 }}
                  >
                    <Typography>Profile</Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ py: 1.5, color: '#d32f2f' }}
                  >
                    <Typography>Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                sx={{
                  bgcolor: '#4a7c59',
                  color: '#fff',
                  '&:hover': { bgcolor: '#3a6249' }
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Backdrop con blur */}
      <Backdrop
        open={expanded}
        onClick={() => setExpanded(false)}
        sx={{
          zIndex: 1200,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          bgcolor: 'rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      {/* Drawer sobrepuesto */}
      <Drawer
        variant="temporary"
        open={expanded}
        onClose={() => setExpanded(false)}
        ModalProps={{
          keepMounted: true,
          BackdropProps: {
            invisible: true
          }
        }}
        sx={{
          zIndex: 1201,
          '& .MuiDrawer-paper': {
            width: drawerWidthExpanded,
            boxSizing: 'border-box',
            border: 'none',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* ✅ Drawer de Notificaciones */}
      <Drawer
        anchor="right"
        variant="temporary"
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        ModalProps={{
          keepMounted: true,
          BackdropProps: {
            sx: {
              bgcolor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(4px)'
            }
          }
        }}
        sx={{
          zIndex: 1202,
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 360 },
            boxSizing: 'border-box',
            border: 'none'
          }
        }}
      >
        <Box 
          sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e8f5ee 100%)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <Box 
            sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(74,124,89,0.2)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <NotificationsIcon sx={{ fontSize: 28 }} />
                <Typography variant="h6" fontWeight="bold">
                  Notifications
                </Typography>
              </Box>
              <Badge 
                badgeContent={notifications.filter(n => !n.read).length} 
                color="error"
              >
                <IconButton
                  onClick={() => setNotificationsOpen(false)}
                  size="small"
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    }
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
              </Badge>
            </Box>
          </Box>

          {/* Notifications List */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {notifications.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                gap: 2
              }}>
                <NotificationsIcon sx={{ fontSize: 64, color: '#ccc' }} />
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  No notifications yet
                </Typography>
              </Box>
            ) : (
              notifications.map((n, index) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 3,
                      bgcolor: n.read ? 'white' : 'rgba(74,124,89,0.08)',
                      border: n.read ? '1px solid #e0e0e0' : '1.5px solid rgba(74,124,89,0.2)',
                      boxShadow: n.read ? '0 2px 8px rgba(0,0,0,0.04)' : '0 4px 12px rgba(74,124,89,0.12)',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(74,124,89,0.18)',
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s'
                      }
                    }}
                    onClick={() => {
                      setNotifications(prev => 
                        prev.map(notif => 
                          notif.id === n.id ? { ...notif, read: true } : notif
                        )
                      )
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: n.read ? '#f5f5f5' : 'rgba(74,124,89,0.15)',
                          flexShrink: 0
                        }}
                      >
                        {n.title.includes('Payment') && <PaymentIcon sx={{ color: '#4a7c59' }} />}
                        {n.title.includes('message') && <ChatIcon sx={{ color: '#2196f3' }} />}
                        {n.title.includes('Document') && <CheckCircleIcon sx={{ color: '#4caf50' }} />}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="subtitle2" 
                          fontWeight={n.read ? 600 : 700}
                          sx={{ 
                            color: n.read ? '#4a5568' : '#2d3748',
                            mb: 0.5
                          }}
                        >
                          {n.title}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#718096',
                            display: 'block',
                            mb: 1
                          }}
                        >
                          {n.description}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#a0aec0',
                            fontSize: '0.7rem'
                          }}
                        >
                          2 hours ago
                        </Typography>
                      </Box>

                      {!n.read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#4a7c59',
                            flexShrink: 0,
                            mt: 0.5
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </motion.div>
              ))
            )}
          </Box>

          {/* Footer */}
          {notifications.length > 0 && (
            <Box sx={{ 
              p: 2, 
              borderTop: '1px solid #e0e0e0',
              bgcolor: 'white'
            }}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => {
                  setNotifications(prev => 
                    prev.map(n => ({ ...n, read: true }))
                  )
                }}
                sx={{
                  borderRadius: 2,
                  borderColor: '#4a7c59',
                  color: '#4a7c59',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#3d664a',
                    bgcolor: 'rgba(74,124,89,0.05)'
                  }
                }}
              >
                Mark all as read
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Main content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: '100%',
          minHeight: '100vh',
          bgcolor: '#f7fafc',
          pt: '64px'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  )
}

export default Layout