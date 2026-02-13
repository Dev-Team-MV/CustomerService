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

{/* ✅ Drawer de Notificaciones - BRANDBOOK */}
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
      width: { xs: '100%', sm: 380 },
      boxSizing: 'border-box',
      border: 'none'
    }
  }}
>
  <Box 
    sx={{ 
      height: '100%',
      bgcolor: '#fafafa',
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    {/* ✅ HEADER - Brandbook colors */}
    <Box 
      sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)',
        color: 'white',
        boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* ✅ Decorative blur circle */}
      <Box
        sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          bgcolor: 'rgba(140, 165, 81, 0.15)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}
      />

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <NotificationsIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              fontWeight={700}
              sx={{ 
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '0.5px'
              }}
            >
              Notifications
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                opacity: 0.9,
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {notifications.filter(n => !n.read).length} unread
            </Typography>
          </Box>
        </Box>
        
        <IconButton
          onClick={() => setNotificationsOpen(false)}
          size="small"
          sx={{
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.25)',
              transform: 'rotate(90deg)',
              transition: 'all 0.3s'
            }
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      </Box>
    </Box>

    {/* ✅ NOTIFICATIONS LIST */}
    <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
      {notifications.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          gap: 2
        }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 3,
              bgcolor: 'rgba(112, 111, 111, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <NotificationsIcon sx={{ fontSize: 48, color: '#706f6f', opacity: 0.4 }} />
          </Box>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 500
            }}
          >
            No notifications yet
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#9e9e9e',
              fontFamily: '"Poppins", sans-serif',
              textAlign: 'center',
              maxWidth: 240
            }}
          >
            We'll notify you when something important happens
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
                p: 2.5,
                borderRadius: 3,
                bgcolor: n.read ? 'white' : 'rgba(140, 165, 81, 0.06)',
                border: n.read ? '1px solid #e0e0e0' : '2px solid rgba(140, 165, 81, 0.2)',
                boxShadow: n.read 
                  ? '0 2px 8px rgba(0,0,0,0.04)' 
                  : '0 4px 12px rgba(140, 165, 81, 0.12)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: n.read
                    ? '0 4px 16px rgba(0,0,0,0.08)'
                    : '0 6px 20px rgba(140, 165, 81, 0.18)',
                  transform: 'translateX(-4px)',
                  borderColor: n.read ? '#706f6f' : '#8CA551'
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
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                {/* ✅ ICON BOX - Brandbook colors */}
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: n.read 
                      ? 'rgba(112, 111, 111, 0.08)' 
                      : 'rgba(140, 165, 81, 0.15)',
                    border: `1px solid ${n.read ? 'rgba(112, 111, 111, 0.2)' : 'rgba(140, 165, 81, 0.3)'}`,
                    flexShrink: 0,
                    transition: 'all 0.3s'
                  }}
                >
                  {n.title.includes('Payment') && (
                    <PaymentIcon sx={{ 
                      color: n.read ? '#706f6f' : '#333F1F',
                      fontSize: 22 
                    }} />
                  )}
                  {n.title.includes('message') && (
                    <ChatIcon sx={{ 
                      color: n.read ? '#706f6f' : '#8CA551',
                      fontSize: 22 
                    }} />
                  )}
                  {n.title.includes('Document') && (
                    <CheckCircleIcon sx={{ 
                      color: n.read ? '#706f6f' : '#8CA551',
                      fontSize: 22 
                    }} />
                  )}
                </Box>

                {/* ✅ CONTENT */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight={n.read ? 600 : 700}
                    sx={{ 
                      color: n.read ? '#706f6f' : '#333F1F',
                      mb: 0.5,
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '0.9rem',
                      letterSpacing: '0.3px'
                    }}
                  >
                    {n.title}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#9e9e9e',
                      display: 'block',
                      mb: 1,
                      fontFamily: '"Poppins", sans-serif',
                      lineHeight: 1.5
                    }}
                  >
                    {n.description}
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1 
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        bgcolor: '#9e9e9e'
                      }}
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#9e9e9e',
                        fontSize: '0.7rem',
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    >
                      2 hours ago
                    </Typography>
                  </Box>
                </Box>

                {/* ✅ UNREAD DOT - Brandbook color */}
                {!n.read && (
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: '#8CA551',
                      flexShrink: 0,
                      mt: 0.5,
                      boxShadow: '0 0 0 3px rgba(140, 165, 81, 0.2)',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { 
                          opacity: 1,
                          transform: 'scale(1)' 
                        },
                        '50%': { 
                          opacity: 0.6,
                          transform: 'scale(1.1)' 
                        }
                      }
                    }}
                  />
                )}
              </Box>
            </Box>
          </motion.div>
        ))
      )}
    </Box>

    {/* ✅ FOOTER - Brandbook */}
    {notifications.length > 0 && (
      <Box sx={{ 
        p: 2.5, 
        borderTop: '1px solid #e0e0e0',
        bgcolor: 'white',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.04)'
      }}>
        <Button
          fullWidth
          variant="outlined"
          size="medium"
          onClick={() => {
            setNotifications(prev => 
              prev.map(n => ({ ...n, read: true }))
            )
          }}
          sx={{
            borderRadius: 3,
            border: '2px solid #333F1F',
            color: '#333F1F',
            fontWeight: 600,
            py: 1.2,
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '0.5px',
            textTransform: 'none',
            fontSize: '0.9rem',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              bgcolor: '#333F1F',
              transition: 'left 0.4s ease',
              zIndex: 0
            },
            '&:hover': {
              borderColor: '#333F1F',
              bgcolor: 'transparent',
              '&::before': {
                left: 0
              },
              '& span': {
                color: 'white'
              }
            },
            '& span': {
              position: 'relative',
              zIndex: 1,
              transition: 'color 0.3s ease'
            }
          }}
        >
          <span>Mark all as read</span>
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