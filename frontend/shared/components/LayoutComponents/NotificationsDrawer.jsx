import React from "react"
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
} from "@mui/material"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import NotificationsIcon from "@mui/icons-material/Notifications"
import PaymentIcon from "@mui/icons-material/Payment"
import ChatIcon from "@mui/icons-material/Chat"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"

const NotificationsDrawer = ({
  open,
  onClose,
  notifications,
  setNotifications,
  width = { xs: "100%", sm: 400 },
}) => {
  const { t } = useTranslation('navigation')
  const theme = useTheme()

  return (
  <Drawer
    anchor="right"
    variant="temporary"
    open={open}
    onClose={onClose}
    ModalProps={{
      keepMounted: true,
      BackdropProps: {
        sx: {
          bgcolor: theme.palette.action.disabledBackground,
          backdropFilter: "blur(8px)",
        },
      },
    }}
    sx={{
      zIndex: 1202,
      "& .MuiDrawer-paper": {
        width,
        boxSizing: "border-box",
        border: "none",
        bgcolor: theme.palette.background.paper,
      },
    }}
  >
    <Box
      sx={{
        height: "100%",
        bgcolor: theme.palette.background.default,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: theme.palette.primary.contrastText,
          boxShadow: theme.shadows[2],
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
            bgcolor: theme.palette.secondary.light,
            opacity: 0.15,
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
                boxShadow: theme.shadows[1],
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
                {t('notifications.title')}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.9,
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                {t('unread', { count: notifications.filter((n) => !n.read).length })}
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: theme.palette.primary.contrastText,
              bgcolor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.25)",
                transform: "rotate(90deg)",
                boxShadow: theme.shadows[2],
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
                bgcolor: theme.palette.action.hover,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NotificationsIcon
                sx={{ fontSize: 48, color: theme.palette.text.secondary, opacity: 0.4 }}
              />
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 500,
              }}
            >
              {t('noNotifications')}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.disabled,
                fontFamily: '"Poppins", sans-serif',
                textAlign: "center",
                maxWidth: 240,
              }}
            >
              {t('noNotificationsDesc')}
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
                  bgcolor: n.read ? theme.palette.background.paper : theme.palette.action.hover,
                  border: n.read
                    ? `1px solid ${theme.palette.divider}`
                    : `2px solid ${theme.palette.secondary.light}`,
                  boxShadow: n.read
                    ? theme.shadows[1]
                    : theme.shadows[3],
                  cursor: "pointer",
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: n.read
                      ? theme.shadows[2]
                      : theme.shadows[4],
                    transform: "translateX(-4px)",
                    borderColor: n.read ? theme.palette.text.secondary : theme.palette.secondary.main,
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
                        ? theme.palette.action.hover
                        : theme.palette.secondary.light,
                      border: `1px solid ${n.read ? theme.palette.text.disabled : theme.palette.secondary.main}`,
                      flexShrink: 0,
                      transition: "all 0.3s",
                    }}
                  >
                    {n.title.includes("Payment") && (
                      <PaymentIcon
                        sx={{
                          color: n.read ? theme.palette.text.secondary : theme.palette.primary.main,
                          fontSize: 22,
                        }}
                      />
                    )}
                    {n.title.includes("message") && (
                      <ChatIcon
                        sx={{
                          color: n.read ? theme.palette.text.secondary : theme.palette.secondary.main,
                          fontSize: 22,
                        }}
                      />
                    )}
                    {n.title.includes("Document") && (
                      <CheckCircleIcon
                        sx={{
                          color: n.read ? theme.palette.text.secondary : theme.palette.secondary.main,
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
                        color: n.read ? theme.palette.text.secondary : theme.palette.primary.main,
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
                        color: theme.palette.text.disabled,
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
                          bgcolor: theme.palette.text.disabled,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.disabled,
                          fontSize: "0.7rem",
                          fontFamily: '"Poppins", sans-serif',
                        }}
                      >
                        {t('hoursAgo', { count: 2 })}
                      </Typography>
                    </Box>
                  </Box>

                  {!n.read && (
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: theme.palette.secondary.main,
                        flexShrink: 0,
                        mt: 0.5,
                        boxShadow: `0 0 0 3px ${theme.palette.secondary.light}`,
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
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
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
              border: `2px solid ${theme.palette.primary.main}`,
              color: theme.palette.primary.main,
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
                bgcolor: theme.palette.primary.main,
                transition: "left 0.4s ease",
                zIndex: 0,
              },
              "&:hover": {
                borderColor: theme.palette.primary.main,
                bgcolor: "transparent",
                "&::before": {
                  left: 0,
                },
                "& span": {
                  color: theme.palette.primary.contrastText,
                },
              },
              "& span": {
                position: "relative",
                zIndex: 1,
                transition: "color 0.3s ease",
              },
            }}
          >
            <span>{t('markAllAsRead')}</span>
          </Button>
        </Box>
      )}
    </Box>
  </Drawer>
  )
}

export default NotificationsDrawer