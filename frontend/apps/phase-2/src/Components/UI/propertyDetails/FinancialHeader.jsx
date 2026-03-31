import React from 'react'
import { Grid, Card, CardContent, Box, Typography, Chip } from '@mui/material'
import { CheckCircle, Pending, AccountBalance, Home, Star, TrendingUp } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@mui/material/styles'
import PropTypes from 'prop-types'

// ── Skeleton card ──────────────────────────────────────────
const SkeletonCard = ({ index }) => {
  const theme = useTheme()
  
  return (
    <Grid item xs={6} sm={6} md={3}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 }}
        style={{ height: '100%' }}
      >
        <Card
          sx={{
            height: '100%', 
            minHeight: { xs: 140, sm: 160, md: 180 },
            borderRadius: { xs: 3, md: 4 }, 
            border: `1.5px solid ${theme.palette.cardBorder}`,
            overflow: 'hidden', 
            background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            {[
              { w: '100%', h: { xs: 12, sm: 14, md: 16 }, mb: 2 }, 
              { w: '60%', h: { xs: 28, sm: 32, md: 36 }, mb: 0 }
            ].map((s, i) => (
              <Box key={i} sx={{
                width: s.w, height: s.h, mb: s.mb,
                bgcolor: `${theme.palette.secondary.main}26`, 
                borderRadius: 1,
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.5 } }
              }} />
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  )
}

// ── Stat card ──────────────────────────────────────────────
const StatCard = ({ stat, index }) => {
  const theme = useTheme()
  
  return (
    <Grid item xs={6} sm={6} md={3}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.1, duration: 0.5, type: 'spring', stiffness: 100 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        style={{ height: '100%' }}
      >
        <Card
          sx={{
            height: '100%', 
            minHeight: { xs: 140, sm: 160, md: 180 },
            borderRadius: { xs: 3, md: 4 },
            border: `1.5px solid ${stat.borderColor}30`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative', 
            overflow: 'hidden',
            background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
            display: 'flex', 
            flexDirection: 'column',
            '&:hover': {
              boxShadow: `0 16px 48px ${stat.color}33`,
              borderColor: stat.borderColor,
              transform: 'translateY(-2px)'
            },
            '&::before': {
              content: '""', 
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: { xs: 3, md: 4 },
              background: stat.color, 
              opacity: 0.9
            }
          }}
        >
          <CardContent sx={{ 
            p: { xs: 2, sm: 2.5, md: 3 }, 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between' 
          }}>
            <Box>
              <Box 
                display="flex" 
                alignItems="flex-start" 
                justifyContent="space-between"
                mb={{ xs: 1.5, md: 2 }} 
                flexDirection={{ xs: 'column', sm: 'row' }} 
                gap={{ xs: 1, sm: 0 }}
              >
                <Typography variant="caption" sx={{
                  color: '#999999', 
                  fontWeight: 500, 
                  textTransform: 'uppercase',
                  letterSpacing: '1px', 
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: '0.65rem', sm: '0.7rem' }
                }}>
                  {stat.label}
                </Typography>
                <Box sx={{
                  width: { xs: 36, sm: 40, md: 44 }, 
                  height: { xs: 36, sm: 40, md: 44 },
                  borderRadius: '50%', 
                  bgcolor: `${stat.color}14`,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: stat.color, 
                  transition: 'all 0.3s ease'
                }}>
                  {React.cloneElement(stat.icon, { sx: { fontSize: { xs: 18, sm: 20, md: 22 } } })}
                </Box>
              </Box>
              <Typography variant="h4" sx={{
                color: stat.color, 
                fontWeight: 600, 
                fontFamily: '"Poppins", sans-serif',
                mb: 0.5, 
                letterSpacing: '-0.5px',
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
              }}>
                {stat.value}
              </Typography>
            </Box>
            {stat.sub ? (
              <Box display="flex" alignItems="center" gap={0.5} mt="auto">
                <TrendingUp sx={{ fontSize: { xs: 12, sm: 14 }, color: stat.color }} />
                <Typography variant="caption" sx={{
                  color: '#706f6f', 
                  fontWeight: 500,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: '0.65rem', sm: '0.75rem' }
                }}>
                  {stat.sub}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ height: { xs: 18, sm: 20 } }} />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  )
}

// ── FinancialHeader ────────────────────────────────────────
const FinancialHeader = ({ financialSummary, user, t }) => {
  const theme = useTheme()
  
  const stats = financialSummary ? [
    {
      label: t('myApartment:totalInvestment', 'Total Investment'),
      value: `$${financialSummary.totalInvestment?.toLocaleString() ?? '0'}`,
      icon: <AccountBalance />,
      color: theme.palette.primary.main,
      borderColor: theme.palette.primary.main,
    },
    {
      label: t('myApartment:totalPaid', 'Total Paid'),
      value: `$${financialSummary.totalPaid?.toLocaleString() ?? '0'}`,
      icon: <CheckCircle />,
      sub: `${Math.round(financialSummary.progress ?? 0)}% ${t('myApartment:completed', 'completed')}`,
      color: theme.palette.success.main,
      borderColor: theme.palette.success.main,
    },
    {
      label: t('myApartment:pendingAmount', 'Pending Amount'),
      value: `$${financialSummary.pending?.toLocaleString() ?? '0'}`,
      icon: <Pending />,
      color: theme.palette.warning.main,
      borderColor: theme.palette.warning.main,
    },
    {
      label: t('myApartment:apartmentsOwned', 'Apartments Owned'),
      value: financialSummary.apartments ?? 0,
      icon: <Home />,
      color: theme.palette.secondary.main,
      borderColor: theme.palette.secondary.main,
    },
  ] : null

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 }, 
        mb: 4,
        background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
        borderRadius: { xs: 4, md: 6 },
        border: `1.5px solid ${theme.palette.cardBorder}`,
        boxShadow: `0 12px 32px ${theme.palette.primary.main}1A`,
        overflow: 'hidden', 
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 24px 48px ${theme.palette.primary.main}26`,
          border: `2px solid ${theme.palette.secondary.main}4D`
        },
        '&::before': {
          content: '""', 
          position: 'absolute',
          top: 0, left: 0, right: 0, 
          height: 4,
          background: theme.palette.gradient,
          opacity: 0.9
        }
      }}
    >
      {/* TITLE ROW */}
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={{ xs: 2, sm: 3 }} 
        mb={4} 
        position="relative" 
        zIndex={1}
      >
        <Box sx={{
          width: { xs: 60, sm: 70, md: 90 }, 
          height: { xs: 60, sm: 70, md: 90 },
          borderRadius: { xs: 3, md: 4 },
          background: theme.palette.gradient,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: theme.palette.avatarShadow,
          border: '3px solid white', 
          flexShrink: 0
        }}>
          <Home sx={{ fontSize: { xs: 30, sm: 38, md: 45 }, color: 'white' }} />
        </Box>
        <Box flex={1}>
          <Typography variant="h3" sx={{
            fontFamily: '"Poppins", sans-serif', 
            color: theme.palette.primary.main,
            fontWeight: 700, 
            letterSpacing: '0.5px',
            mb: { xs: 0.5, sm: 1 },
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
            textTransform: 'uppercase'
          }}>
            {t('myApartment:title', 'My Apartments')}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="h6" sx={{
              color: '#706f6f', 
              fontWeight: 400,
              fontFamily: '"Poppins", sans-serif',
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }
            }}>
              {t('myApartment:welcome', 'Welcome back')}
            </Typography>
            <Chip
              label={user?.firstName || t('myApartment:resident', 'Resident')}
              size="small"
              icon={<Star sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />}
              sx={{
                bgcolor: 'transparent', 
                border: `1.5px solid ${theme.palette.secondary.main}`,
                color: theme.palette.primary.main, 
                fontWeight: 700,
                fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                height: { xs: 26, sm: 30, md: 32 }, 
                px: { xs: 1.5, sm: 2 },
                fontFamily: '"Poppins", sans-serif', 
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  bgcolor: `${theme.palette.secondary.main}14`, 
                  borderColor: theme.palette.secondary.main 
                },
                '& .MuiChip-icon': { color: theme.palette.secondary.main }
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* STATS GRID */}
      <AnimatePresence>
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {stats
            ? stats.map((stat, i) => <StatCard key={i} stat={stat} index={i} />)
            : [0, 1, 2, 3].map(i => <SkeletonCard key={i} index={i} />)
          }
        </Grid>
      </AnimatePresence>
    </Box>
  )
}

FinancialHeader.propTypes = {
  financialSummary: PropTypes.object,
  user: PropTypes.object,
  t: PropTypes.func.isRequired,
}

export default FinancialHeader