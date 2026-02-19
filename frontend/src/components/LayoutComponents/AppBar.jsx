import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Tooltip,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Button,
  ListItemIcon,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const AppBarBrandbook = ({
  publicView,
  user,
  notifications,
  onMenuClick,
  onLogoClick,
  onNotificationsClick,
  onLoginClick,
  onProfileClick,
  onLogoutClick,
  anchorElUser,
  onOpenUserMenu,
  onCloseUserMenu,
}) => (
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
          onClick={onMenuClick}
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

      {/* LOGO CENTRADO */}
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
            onClick={onLogoClick}
          />
        </motion.div>
      </Box>

      {/* USER ACTIONS */}
      <Box sx={{ ml: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        {!publicView && user && (
          <Tooltip title="Notifications" placement="bottom">
            <IconButton
              onClick={onNotificationsClick}
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
              <IconButton onClick={onOpenUserMenu} sx={{ p: 0 }}>
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
            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={onCloseUserMenu}
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
                onClick={onProfileClick}
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
                onClick={onLogoutClick}
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
              onClick={onLoginClick}
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
              <Box component="span" sx={{ position: "relative", zIndex: 1 }}>
                Login
              </Box>
            </Button>
          </Tooltip>
        )}
      </Box>
    </Toolbar>
  </AppBar>
);

export default AppBarBrandbook;