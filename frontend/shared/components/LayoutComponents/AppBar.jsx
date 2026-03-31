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
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher'
import { useTheme } from "@mui/material/styles";

const AppBarBrandbook = ({
  logoSrc = "/images/logos/Logo_LakewoodOaks-05.png", // logo por defecto
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
}) => {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: theme.palette.background.paper,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        color: theme.palette.text.primary,
        boxShadow: theme.shadows[2],
        borderBottom: `2px solid ${theme.palette.divider}`,
        zIndex: 1201,
        "&::before": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.main} 100%)`,
          opacity: 0.6,
        },
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <Tooltip title={t('navigation:tooltips.openMenu')} placement="right">
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{
              mr: 2,
              bgcolor: theme.palette.action.hover,
              border: `2px solid ${theme.palette.divider}`,
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                borderColor: theme.palette.primary.main,
                transform: "rotate(90deg)",
                boxShadow: theme.shadows[4],
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
              src={logoSrc}
              alt="Logo"
              sx={{
                width: "100%",
                maxWidth: "200px",
                // height: "auto",
                objectFit: "contain",
                filter: theme.shadows[1],
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  filter: theme.shadows[4],
                },
              }}
              onClick={onLogoClick}
            />
          </motion.div>
        </Box>

        {/* USER ACTIONS */}
        <Box sx={{ ml: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <LanguageSwitcher />
          {!publicView && user && (
            <Tooltip title={t('navigation:tooltips.notifications')} placement="bottom">
              <IconButton
                onClick={onNotificationsClick}
                sx={{
                  color: theme.palette.secondary.main,
                  bgcolor: theme.palette.action.hover,
                  border: `2px solid ${theme.palette.secondary.light}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText,
                    borderColor: theme.palette.secondary.main,
                    transform: "scale(1.1)",
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <Badge
                  badgeContent={notifications.filter((n) => !n.read).length}
                  color="error"
                  overlap="circular"
                  sx={{
                    "& .MuiBadge-badge": {
                      boxShadow: theme.shadows[2],
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
              <Tooltip title={t('navigation:tooltips.accountSettings')} placement="bottom">
                <IconButton onClick={onOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "transparent",
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      color: theme.palette.primary.contrastText,
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      fontFamily: '"Poppins", sans-serif',
                      border: `2px solid ${theme.palette.background.paper}`,
                      boxShadow: theme.shadows[4],
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                        borderColor: theme.palette.secondary.main,
                        boxShadow: theme.shadows[6],
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
                    boxShadow: theme.shadows[8],
                    minWidth: 240,
                    border: `2px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.background.paper,
                    backdropFilter: "blur(20px)",
                    overflow: "visible",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    background: `white`,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{
                      color: theme.palette.text.primary,
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
                      color: theme.palette.text.secondary,
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
                      bgcolor: theme.palette.action.hover,
                      pl: 3.5,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <PersonIcon sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
                  </ListItemIcon>
                  <Typography
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      color: theme.palette.text.primary,
                    }}
                  >
                    {t('navigation:userMenu.profile')}
                  </Typography>
                </MenuItem>
                <Divider sx={{ my: 0.5, borderColor: theme.palette.divider }} />
                <MenuItem
                  onClick={onLogoutClick}
                  sx={{
                    py: 2,
                    px: 3,
                    borderRadius: 0,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: 'white',
                      pl: 3.5,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LogoutIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />
                  </ListItemIcon>
                  <Typography
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      color: theme.palette.error.main,
                    }}
                  >
                    {t('navigation:userMenu.logout')}
                  </Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Tooltip title={t('auth:signInToAccount')} placement="bottom">
              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={onLoginClick}
                sx={{
                  borderRadius: 3,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontWeight: 600,
                  textTransform: "none",
                  letterSpacing: "1px",
                  fontFamily: '"Poppins", sans-serif',
                  px: 3,
                  py: 1.2,
                  boxShadow: theme.shadows[4],
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
                    bgcolor: theme.palette.secondary.main,
                    transition: "left 0.4s ease",
                    zIndex: 0,
                  },
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                    boxShadow: theme.shadows[8],
                    "&::before": {
                      left: 0,
                    },
                    "& .MuiButton-startIcon": {
                      color: theme.palette.primary.contrastText,
                    },
                  },
                  "& .MuiButton-startIcon": {
                    position: "relative",
                    zIndex: 1,
                    color: theme.palette.primary.contrastText,
                  },
                }}
              >
                <Box component="span" sx={{ position: "relative", zIndex: 1 }}>
                  {t('auth:login')}
                </Box>
              </Button>
            </Tooltip>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default AppBarBrandbook;