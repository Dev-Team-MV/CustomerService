import { useState, useEffect } from "react";
import {
  AppBar,
  IconButton,
  Box,
  Tooltip,
  Badge,
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
  Settings as SettingsIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher'

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
}) => {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "#eef2e8",
        color: "#333F1F",
        boxShadow: scrolled ? "0 2px 12px rgba(51,63,31,0.08)" : "none",
        borderBottom: "1px solid #c8d4b8",
        zIndex: 1201,
        height: "auto",
        transition: "box-shadow 0.3s ease",
      }}
    >
      {/* ── Top controls row ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, md: 4 },
          pt: scrolled ? 1 : 1.5,
          pb: scrolled ? 0.5 : 0.5,
          transition: "padding 0.35s ease",
        }}
      >
        <Tooltip title={t('navigation:tooltips.openMenu')} placement="right">
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{
              color: "#333F1F",
              "&:hover": { bgcolor: "rgba(51,63,31,0.08)" },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>

        {/* Logo compacto — solo visible cuando se hace scroll */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              key="compact-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
              style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", cursor: "pointer" }}
              onClick={onLogoClick}
            >
              <Box
                component="img"
                src="/images/logos/Logo_LakewoodOaks-05.png"
                alt="Lakewood Oaks"
                sx={{ height: 44, width: "auto", objectFit: "contain", display: "block" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <LanguageSwitcher />

          {!publicView && user && (
            <Tooltip title={t('navigation:tooltips.notifications')} placement="bottom">
              <IconButton
                onClick={onNotificationsClick}
                sx={{ color: "#333F1F", "&:hover": { bgcolor: "rgba(51,63,31,0.08)" } }}
              >
                <Badge badgeContent={notifications.filter((n) => !n.read).length} color="error" overlap="circular">
                  <NotificationsIcon sx={{ fontSize: 22 }} />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {user ? (
            <>
              <Tooltip title={t('navigation:tooltips.accountSettings')} placement="bottom">
                <IconButton
                  onClick={onOpenUserMenu}
                  sx={{ color: "#333F1F", "&:hover": { bgcolor: "rgba(51,63,31,0.08)" } }}
                >
                  <SettingsIcon sx={{ fontSize: 22 }} />
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={onCloseUserMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{
                  mt: 1,
                  "& .MuiPaper-root": {
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(51, 63, 31, 0.12)",
                    minWidth: 240,
                    border: "1px solid #d6ddc9",
                    bgcolor: "#ffffff",
                  },
                }}
              >
                <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #e8f0de" }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#333F1F", fontFamily: '"Poppins", sans-serif', mb: 0.3 }}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#706f6f", fontFamily: '"Poppins", sans-serif' }}>
                    {user?.email}
                  </Typography>
                </Box>

                <MenuItem onClick={onProfileClick} sx={{ py: 1.5, px: 3, "&:hover": { bgcolor: "rgba(140,165,81,0.08)" } }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PersonIcon sx={{ color: "#8CA551", fontSize: 20 }} />
                  </ListItemIcon>
                  <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "0.9rem", color: "#333F1F" }}>
                    {t('navigation:userMenu.profile')}
                  </Typography>
                </MenuItem>

                <Divider sx={{ borderColor: "#e8f0de" }} />

                <MenuItem onClick={onLogoutClick} sx={{ py: 1.5, px: 3, "&:hover": { bgcolor: "rgba(211,47,47,0.06)" } }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <LogoutIcon sx={{ color: "#d32f2f", fontSize: 20 }} />
                  </ListItemIcon>
                  <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "0.9rem", color: "#d32f2f" }}>
                    {t('navigation:userMenu.logout')}
                  </Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="text"
              startIcon={<LoginIcon />}
              onClick={onLoginClick}
              sx={{ color: "#333F1F", fontWeight: 600, textTransform: "none", fontFamily: '"Poppins", sans-serif', "&:hover": { bgcolor: "rgba(51,63,31,0.08)" } }}
            >
              {t('auth:login')}
            </Button>
          )}
        </Box>
      </Box>

      {/* ── Logo area — se colapsa con scroll ── */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            key="full-logo"
            initial={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: { xs: 2, md: 3 },
                cursor: "pointer",
              }}
              onClick={onLogoClick}
            >
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Box
                  component="img"
                  src="/images/logos/Logo_LakewoodOaks-05.png"
                  alt="Lakewood Oaks"
                  sx={{ height: { xs: 120, md: 160 }, width: "auto", objectFit: "contain", display: "block" }}
                />
              </motion.div>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </AppBar>
  )
}

export default AppBarBrandbook;
