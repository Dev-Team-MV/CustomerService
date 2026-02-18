import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
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
  Badge,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  HomeWork as HomeWorkIcon,
  Landscape as LandscapeIcon,
  Home as HomeIcon,
  Payment as PaymentIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  ChevronLeft as ChevronLeftIcon,
  Login as LoginIcon,
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  CheckCircle as CheckCircleIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Deck,
  Article,
  Explore,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const drawerWidthExpanded = 280;

const Layout = ({ publicView = false }) => {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Payment received",
      description: "Your payment has been processed.",
      read: false,
    },
    {
      id: 2,
      title: "New message",
      description: "You have a new message from admin.",
      read: false,
    },
    {
      id: 3,
      title: "Document approved",
      description: "Your document was approved.",
      read: true,
    },
  ]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleLogout = () => {
    logout();
    navigate("/login");
    handleCloseUserMenu();
  };

  const privateMenuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
      roles: ["superadmin", "admin", "user"],
    },
    {
      text: "Club House",
      icon: <Deck />,
      path: "/clubhouse-manager",
      roles: ["superadmin", "admin"],
    },
    {
      text: "Properties",
      icon: <HomeWorkIcon />,
      path: "/properties",
      roles: ["superadmin", "admin"],
    },
    {
      text: "Lot Inventory",
      icon: <LandscapeIcon />,
      path: "/lots",
      roles: ["superadmin", "admin"],
    },
    {
      text: "Models",
      icon: <HomeIcon />,
      path: "/models",
      roles: ["superadmin", "admin"],
    },
    {
      text: "Payloads",
      icon: <PaymentIcon />,
      path: "/payloads",
      roles: ["superadmin", "admin"],
    },
    {
      text: "Residents",
      icon: <PeopleIcon />,
      path: "/residents",
      roles: ["superadmin", "admin"],
    },
    {
      text: "Analytics",
      icon: <BarChartIcon />,
      path: "/analytics",
      roles: ["superadmin", "admin"],
    },
    {
      text: "News",
      icon: <Article />,
      path: "/news",
      roles: ["superadmin", "admin"],
    },
    {
      text: "My Property",
      icon: <HomeIcon />,
      path: "/my-property",
      roles: ["superadmin", "admin", "user"],
    },
    {
      text: "Amenities",
      icon: <Deck />,
      path: "/amenities",
      roles: ["superadmin", "admin", "user"],
    },
  ];

  const publicMenuItems = [
    { text: "Home", icon: <HomeIcon />, path: "/" },
    { text: "News", icon: <Article />, path: "/explore/news" },
    { text: "Get Your Quote", icon: <Explore />, path: "/explore/properties" },
    { text: "Explore Amenities", icon: <Deck />, path: "/explore/amenities" },
  ];

  const menuItems = publicView
    ? publicMenuItems
    : privateMenuItems.filter((item) => item.roles.includes(user?.role));

  const handleNavigate = (path) => {
    navigate(path);
    setExpanded(false);
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        width: drawerWidthExpanded,
        background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
        borderRight: "1px solid rgba(140, 165, 81, 0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "4px 0 24px rgba(51, 63, 31, 0.08)",
      }}
    >
      {/* ✅ LOGO */}
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          position: "relative",
          borderBottom: "2px solid rgba(140, 165, 81, 0.1)",
          background:
            "linear-gradient(135deg, rgba(51, 63, 31, 0.03) 0%, rgba(140, 165, 81, 0.03) 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            component="img"
            src="/images/logos/Logo_LakewoodOaks-05.png"
            alt="Lakewood Oaks"
            sx={{
              width: "100%",
              maxWidth: "220px",
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 2px 8px rgba(51, 63, 31, 0.15))",
            }}
          />
        </motion.div>
      </Box>

      {/* ✅ NAVIGATION */}
      <List sx={{ flex: 1, px: 2, py: 3, overflowY: 'auto' }}>
        {/* ✅ Items del menú - BRANDBOOK */}
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1.5 }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: (index + 1) * 0.05,
                  duration: 0.3,
                  ease: "easeOut",
                }}
                style={{ width: "100%" }}
              >
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  selected={isActive}
                  sx={{
                    borderRadius: 3,
                    py: 1.8,
                    position: "relative",
                    bgcolor: isActive
                      ? "rgba(140, 165, 81, 0.08)"
                      : "transparent",
                    border: `2px solid ${isActive ? "rgba(140, 165, 81, 0.2)" : "transparent"}`,
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      background:
                        "linear-gradient(90deg, transparent, rgba(140, 165, 81, 0.08), transparent)",
                      transition: "left 0.5s ease",
                    },
                    "&::after": isActive
                      ? {
                          content: '""',
                          position: "absolute",
                          right: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 4,
                          height: "60%",
                          bgcolor: "#8CA551",
                          borderRadius: "4px 0 0 4px",
                          boxShadow: "-2px 0 8px rgba(140, 165, 81, 0.3)",
                        }
                      : {},
                    "&:hover": {
                      bgcolor: isActive
                        ? "rgba(140, 165, 81, 0.12)"
                        : "rgba(140, 165, 81, 0.06)",
                      borderColor: "rgba(140, 165, 81, 0.25)",
                      transform: "translateX(4px)",
                      boxShadow: "0 4px 12px rgba(140, 165, 81, 0.12)",
                      "&::before": {
                        left: "100%",
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2.5,
                        bgcolor: isActive
                          ? "rgba(140, 165, 81, 0.15)"
                          : "rgba(112, 111, 111, 0.05)",
                        border: `1px solid ${isActive ? "rgba(140, 165, 81, 0.3)" : "rgba(112, 111, 111, 0.1)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                        color: isActive ? "#333F1F" : "#706f6f",
                      }}
                    >
                      {item.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "0.95rem",
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? "#333F1F" : "#706f6f",
                      fontFamily: '"Poppins", sans-serif',
                      letterSpacing: "0.3px",
                    }}
                  />
                </ListItemButton>
              </motion.div>
            </ListItem>
          );
        })}
      </List>

      {/* ✅ TOGGLE BUTTON */}
      <Box
        sx={{
          p: 2.5,
          textAlign: "center",
          borderTop: "2px solid rgba(140, 165, 81, 0.1)",
          background:
            "linear-gradient(180deg, rgba(140, 165, 81, 0.03) 0%, transparent 100%)",
        }}
      >
        <Tooltip title="Close menu" placement="right">
          <IconButton
            onClick={() => setExpanded(false)}
            sx={{
              bgcolor: "rgba(51, 63, 31, 0.08)",
              color: "#333F1F",
              width: 44,
              height: 44,
              border: "2px solid rgba(140, 165, 81, 0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "#333F1F",
                color: "white",
                borderColor: "#333F1F",
                transform: "rotate(180deg)",
                boxShadow: "0 4px 12px rgba(51, 63, 31, 0.25)",
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", position: "relative" }}>
      {/* ✅ APPBAR - BRANDBOOK */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          color: "#333F1F",
          boxShadow: "0 2px 8px rgba(51, 63, 31, 0.08)",
          borderBottom: "2px solid rgba(140, 165, 81, 0.1)",
          zIndex: 1201,
          "&::before": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background:
              "linear-gradient(90deg, #333F1F 0%, #8CA551 50%, #333F1F 100%)",
            opacity: 0.6,
          },
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <Tooltip title="Open menu" placement="right">
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setExpanded(true)}
              sx={{
                mr: 2,
                bgcolor: "rgba(140, 165, 81, 0.08)",
                border: "2px solid rgba(140, 165, 81, 0.2)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "#333F1F",
                  color: "white",
                  borderColor: "#333F1F",
                  transform: "rotate(90deg)",
                  boxShadow: "0 4px 12px rgba(51, 63, 31, 0.2)",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>

          {/* ✅ LOGO CENTRADO */}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                component="img"
                src="/images/logos/Logo_LakewoodOaks-05.png"
                alt="Lakewood Oaks"
                sx={{
                  width: "100%",
                  maxWidth: "200px",
                  height: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 2px 8px rgba(51, 63, 31, 0.15))",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    filter: "drop-shadow(0 4px 12px rgba(51, 63, 31, 0.25))",
                  },
                }}
                onClick={() => navigate(publicView ? "/" : "/dashboard")}
              />
            </motion.div>
          </Box>

          {/* ✅ USER ACTIONS */}
          <Box sx={{ ml: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* ✅ Notificaciones - NARANJA del brandbook */}
            {!publicView && user && (
              <Tooltip title="Notifications" placement="bottom">
                <IconButton
                  onClick={() => setNotificationsOpen(true)}
                  sx={{
                    color: "#E5863C",
                    bgcolor: "rgba(229, 134, 60, 0.08)",
                    border: "2px solid rgba(229, 134, 60, 0.2)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "#E5863C",
                      color: "white",
                      borderColor: "#E5863C",
                      transform: "scale(1.1)",
                      boxShadow: "0 4px 12px rgba(229, 134, 60, 0.25)",
                    },
                  }}
                >
                  <Badge
                    badgeContent={notifications.filter((n) => !n.read).length}
                    color="error"
                    overlap="circular"
                    sx={{
                      "& .MuiBadge-badge": {
                        boxShadow: "0 2px 8px rgba(211, 47, 47, 0.3)",
                      },
                    }}
                  >
                    <NotificationsIcon sx={{ fontSize: 22 }} />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {user ? (
              <>
                <Tooltip title="Account settings" placement="bottom">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    {/* ✅ Avatar con degradado del Profile */}
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "transparent",
                        background:
                          "linear-gradient(135deg, #333F1F 0%, #8CA551 100%)",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        fontFamily: '"Poppins", sans-serif',
                        border: "2px solid rgba(255, 255, 255, 0.9)",
                        boxShadow: "0 4px 12px rgba(51, 63, 31, 0.2)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.1)",
                          borderColor: "#8CA551",
                          boxShadow: "0 6px 16px rgba(51, 63, 31, 0.3)",
                        },
                      }}
                    >
                      {user?.firstName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                {/* ✅ USER MENU - BRANDBOOK */}
                <Menu
                  anchorEl={anchorElUser}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  sx={{
                    mt: 2,
                    "& .MuiPaper-root": {
                      borderRadius: 4,
                      boxShadow: "0 8px 32px rgba(51, 63, 31, 0.15)",
                      minWidth: 240,
                      border: "2px solid rgba(140, 165, 81, 0.15)",
                      bgcolor: "rgba(255, 255, 255, 0.98)",
                      backdropFilter: "blur(20px)",
                      overflow: "visible",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background:
                          "linear-gradient(90deg, #333F1F, #8CA551, #333F1F)",
                      },
                    },
                  }}
                >
                  {/* ✅ User Info Header */}
                  <Box
                    sx={{
                      px: 3,
                      py: 2.5,
                      borderBottom: "2px solid rgba(140, 165, 81, 0.1)",
                      background:
                        "linear-gradient(135deg, rgba(51, 63, 31, 0.03) 0%, rgba(140, 165, 81, 0.03) 100%)",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      sx={{
                        color: "#333F1F",
                        fontFamily: '"Poppins", sans-serif',
                        letterSpacing: "0.5px",
                        mb: 0.5,
                      }}
                    >
                      {user?.firstName} {user?.lastName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#706f6f",
                        fontFamily: '"Poppins", sans-serif',
                        fontSize: "0.75rem",
                      }}
                    >
                      {user?.email}
                    </Typography>
                  </Box>

                  <MenuItem
                    onClick={() => {
                      navigate("/profile");
                      handleCloseUserMenu();
                    }}
                    sx={{
                      py: 2,
                      px: 3,
                      borderRadius: 0,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "rgba(140, 165, 81, 0.08)",
                        pl: 3.5,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <PersonIcon sx={{ color: "#8CA551", fontSize: 20 }} />
                    </ListItemIcon>
                    <Typography
                      sx={{
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        color: "#333F1F",
                      }}
                    >
                      Profile
                    </Typography>
                  </MenuItem>

                  <Divider
                    sx={{ my: 0.5, borderColor: "rgba(140, 165, 81, 0.15)" }}
                  />

                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      py: 2,
                      px: 3,
                      borderRadius: 0,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "rgba(211, 47, 47, 0.08)",
                        pl: 3.5,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <LogoutIcon sx={{ color: "#d32f2f", fontSize: 20 }} />
                    </ListItemIcon>
                    <Typography
                      sx={{
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        color: "#d32f2f",
                      }}
                    >
                      Logout
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Tooltip title="Sign in to your account" placement="bottom">
                <Button
                  variant="contained"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate("/login")}
                  sx={{
                    borderRadius: 3,
                    bgcolor: "#333F1F",
                    color: "white",
                    fontWeight: 600,
                    textTransform: "none",
                    letterSpacing: "1px",
                    fontFamily: '"Poppins", sans-serif',
                    px: 3,
                    py: 1.2,
                    boxShadow: "0 4px 12px rgba(51, 63, 31, 0.25)",
                    border: "2px solid transparent",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      bgcolor: "#8CA551",
                      transition: "left 0.4s ease",
                      zIndex: 0,
                    },
                    "&:hover": {
                      bgcolor: "#333F1F",
                      boxShadow: "0 8px 20px rgba(51, 63, 31, 0.35)",
                      "&::before": {
                        left: 0,
                      },
                      "& .MuiButton-startIcon": {
                        color: "white",
                      },
                    },
                    "& .MuiButton-startIcon": {
                      position: "relative",
                      zIndex: 1,
                      color: "white",
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{ position: "relative", zIndex: 1 }}
                  >
                    Login
                  </Box>
                </Button>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* ✅ BACKDROP - Mejorado */}
      <Backdrop
        open={expanded}
        onClick={() => setExpanded(false)}
        sx={{
          zIndex: 1200,
          backdropFilter: "blur(12px) saturate(180%)",
          WebkitBackdropFilter: "blur(12px) saturate(180%)",
          bgcolor: "rgba(51, 63, 31, 0.25)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      {/* ✅ DRAWER - Mejorado */}
      <Drawer
        variant="temporary"
        open={expanded}
        onClose={() => setExpanded(false)}
        ModalProps={{
          keepMounted: true,
          BackdropProps: {
            invisible: true,
          },
        }}
        sx={{
          zIndex: 1201,
          "& .MuiDrawer-paper": {
            width: drawerWidthExpanded,
            boxSizing: "border-box",
            border: "none",
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* ✅ DRAWER DE NOTIFICACIONES - Igual que antes (ya está perfecto) */}
      <Drawer
        anchor="right"
        variant="temporary"
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        ModalProps={{
          keepMounted: true,
          BackdropProps: {
            sx: {
              bgcolor: "rgba(51, 63, 31, 0.25)",
              backdropFilter: "blur(8px)",
            },
          },
        }}
        sx={{
          zIndex: 1202,
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 400 },
            boxSizing: "border-box",
            border: "none",
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            bgcolor: "#fafafa",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* HEADER */}
          <Box
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)",
              color: "white",
              boxShadow: "0 4px 12px rgba(51, 63, 31, 0.2)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                bgcolor: "rgba(140, 165, 81, 0.15)",
                borderRadius: "50%",
                filter: "blur(40px)",
              }}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
                zIndex: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    bgcolor: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
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
                      letterSpacing: "0.5px",
                    }}
                  >
                    Notifications
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.9,
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    {notifications.filter((n) => !n.read).length} unread
                  </Typography>
                </Box>
              </Box>

              <IconButton
                onClick={() => setNotificationsOpen(false)}
                size="small"
                sx={{
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.25)",
                    transform: "rotate(90deg)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
            </Box>
          </Box>

          {/* NOTIFICATIONS LIST */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
            {notifications.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 3,
                    bgcolor: "rgba(112, 111, 111, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <NotificationsIcon
                    sx={{ fontSize: 48, color: "#706f6f", opacity: 0.4 }}
                  />
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#706f6f",
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                  }}
                >
                  No notifications yet
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#9e9e9e",
                    fontFamily: '"Poppins", sans-serif',
                    textAlign: "center",
                    maxWidth: 240,
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
                      bgcolor: n.read ? "white" : "rgba(140, 165, 81, 0.06)",
                      border: n.read
                        ? "1px solid #e0e0e0"
                        : "2px solid rgba(140, 165, 81, 0.2)",
                      boxShadow: n.read
                        ? "0 2px 8px rgba(0,0,0,0.04)"
                        : "0 4px 12px rgba(140, 165, 81, 0.12)",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      "&:hover": {
                        boxShadow: n.read
                          ? "0 4px 16px rgba(0,0,0,0.08)"
                          : "0 6px 20px rgba(140, 165, 81, 0.18)",
                        transform: "translateX(-4px)",
                        borderColor: n.read ? "#706f6f" : "#8CA551",
                      },
                    }}
                    onClick={() => {
                      setNotifications((prev) =>
                        prev.map((notif) =>
                          notif.id === n.id ? { ...notif, read: true } : notif,
                        ),
                      );
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: n.read
                            ? "rgba(112, 111, 111, 0.08)"
                            : "rgba(140, 165, 81, 0.15)",
                          border: `1px solid ${n.read ? "rgba(112, 111, 111, 0.2)" : "rgba(140, 165, 81, 0.3)"}`,
                          flexShrink: 0,
                          transition: "all 0.3s",
                        }}
                      >
                        {n.title.includes("Payment") && (
                          <PaymentIcon
                            sx={{
                              color: n.read ? "#706f6f" : "#333F1F",
                              fontSize: 22,
                            }}
                          />
                        )}
                        {n.title.includes("message") && (
                          <ChatIcon
                            sx={{
                              color: n.read ? "#706f6f" : "#8CA551",
                              fontSize: 22,
                            }}
                          />
                        )}
                        {n.title.includes("Document") && (
                          <CheckCircleIcon
                            sx={{
                              color: n.read ? "#706f6f" : "#8CA551",
                              fontSize: 22,
                            }}
                          />
                        )}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={n.read ? 600 : 700}
                          sx={{
                            color: n.read ? "#706f6f" : "#333F1F",
                            mb: 0.5,
                            fontFamily: '"Poppins", sans-serif',
                            fontSize: "0.9rem",
                            letterSpacing: "0.3px",
                          }}
                        >
                          {n.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#9e9e9e",
                            display: "block",
                            mb: 1,
                            fontFamily: '"Poppins", sans-serif',
                            lineHeight: 1.5,
                          }}
                        >
                          {n.description}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              bgcolor: "#9e9e9e",
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#9e9e9e",
                              fontSize: "0.7rem",
                              fontFamily: '"Poppins", sans-serif',
                            }}
                          >
                            2 hours ago
                          </Typography>
                        </Box>
                      </Box>

                      {!n.read && (
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: "#8CA551",
                            flexShrink: 0,
                            mt: 0.5,
                            boxShadow: "0 0 0 3px rgba(140, 165, 81, 0.2)",
                            animation: "pulse 2s infinite",
                            "@keyframes pulse": {
                              "0%, 100%": {
                                opacity: 1,
                                transform: "scale(1)",
                              },
                              "50%": {
                                opacity: 0.6,
                                transform: "scale(1.1)",
                              },
                            },
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </motion.div>
              ))
            )}
          </Box>

          {/* FOOTER */}
          {notifications.length > 0 && (
            <Box
              sx={{
                p: 2.5,
                borderTop: "1px solid #e0e0e0",
                bgcolor: "white",
                boxShadow: "0 -4px 12px rgba(0,0,0,0.04)",
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                size="medium"
                onClick={() => {
                  setNotifications((prev) =>
                    prev.map((n) => ({ ...n, read: true })),
                  );
                }}
                sx={{
                  borderRadius: 3,
                  border: "2px solid #333F1F",
                  color: "#333F1F",
                  fontWeight: 600,
                  py: 1.2,
                  fontFamily: '"Poppins", sans-serif',
                  letterSpacing: "0.5px",
                  textTransform: "none",
                  fontSize: "0.9rem",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    bgcolor: "#333F1F",
                    transition: "left 0.4s ease",
                    zIndex: 0,
                  },
                  "&:hover": {
                    borderColor: "#333F1F",
                    bgcolor: "transparent",
                    "&::before": {
                      left: 0,
                    },
                    "& span": {
                      color: "white",
                    },
                  },
                  "& span": {
                    position: "relative",
                    zIndex: 1,
                    transition: "color 0.3s ease",
                  },
                }}
              >
                <span>Mark all as read</span>
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* ✅ MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          minHeight: "100vh",
          bgcolor: "#f7fafc",
          pt: "64px",
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
  );
};

export default Layout;
