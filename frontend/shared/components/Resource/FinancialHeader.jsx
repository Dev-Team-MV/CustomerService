// @shared/components/Resource/FinancialHeader.jsx
import { Box, Typography, Chip, Grid } from '@mui/material'
import { HomeOutlined, CheckCircleOutline, CancelOutlined } from '@mui/icons-material'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

const FinancialHeader = ({ financialSummary, user, config, t }) => {
  const ns = config.i18n.namespace
  const k  = config.i18n.keys
  const primary   = config.colors.primary
  const secondary = config.colors.secondary

  const isLoading = !financialSummary
  const count    = financialSummary?.properties ?? financialSummary?.apartments ?? 0
  const progress = Math.round(financialSummary?.paymentProgress ?? financialSummary?.progress ?? 0)

  const titleText  = t(`${ns}:${k.title}`)
  const titleWords = titleText.split(' ')
  const titleFirst = titleWords[0]
  const titleRest  = titleWords.slice(1).join(' ')

  const statCards = [
    {
      num:   '01',
      icon:  <HomeOutlined sx={{ fontSize: 20, color: secondary, opacity: 0.75 }} />,
      value: isLoading ? '—' : `$${financialSummary.totalInvestment?.toLocaleString() ?? '0'}`,
      label: t(`${ns}:${k.totalInvestment}`),
    },
    {
      num:   '02',
      icon:  <CheckCircleOutline sx={{ fontSize: 20, color: secondary, opacity: 0.75 }} />,
      value: isLoading ? '—' : `$${financialSummary.totalPaid?.toLocaleString() ?? '0'}`,
      label: t(`${ns}:${k.totalPaid}`),
      sub:   isLoading ? null : `${progress}% ${t(`${ns}:${k.completed}`)}`,
    },
    {
      num:   '03',
      icon:  <CancelOutlined sx={{ fontSize: 20, color: secondary, opacity: 0.75 }} />,
      value: isLoading ? '—' : `$${(financialSummary.totalPending ?? financialSummary.pending ?? 0).toLocaleString()}`,
      label: t(`${ns}:${k.pendingAmount}`),
    },
  ]

  return (
    <Box sx={{ mb: 4 }}>

      {/* ── Title row ── */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 300,
              color: primary,
              fontFamily: '"Poppins", sans-serif',
              fontSize: { xs: '2rem', md: '2.8rem' },
              lineHeight: 1.1,
            }}
          >
            {titleFirst}{' '}
            <Box component="span" sx={{ fontWeight: 800 }}>{titleRest}</Box>
          </Typography>

          <Box display="flex" alignItems="center" gap={1.5} mt={1}>
            <Typography
              variant="body2"
              sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif', fontSize: '0.9rem' }}
            >
              {t(`${ns}:${k.welcome}`)}
            </Typography>
            <Chip
              label={user?.firstName?.toUpperCase() || 'USER'}
              sx={{
                bgcolor: primary, color: 'white',
                fontWeight: 700, fontSize: '0.65rem',
                height: 24, borderRadius: 1,
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '1.5px',
              }}
            />
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: '#706f6f',
            maxWidth: 280,
            textAlign: 'right',
            lineHeight: 1.7,
            fontFamily: '"Poppins", sans-serif',
            fontSize: '0.85rem',
            mt: 0.5,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {t(`${ns}:subtitle`, {
            defaultValue: 'Find your property and all our available options, including their specifications and prices.',
          })}
        </Typography>
      </Box>

      {/* ── 3 dark stat cards ── */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {statCards.map((card, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Box
                sx={{
                  bgcolor: primary,
                  borderRadius: 3,
                  p: { xs: 2.5, md: 3 },
                  minHeight: { xs: 130, md: 150 },
                  position: 'relative',
                  overflow: 'hidden',
                  ...(isLoading && {
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%':      { opacity: 0.65 },
                    },
                  }),
                }}
              >
                {/* Number + Icon */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography
                    sx={{
                      fontSize: { xs: '1.8rem', md: '2.2rem' },
                      fontWeight: 300,
                      color: secondary,
                      fontFamily: '"Poppins", sans-serif',
                      lineHeight: 1,
                      letterSpacing: '-1px',
                    }}
                  >
                    {card.num}
                  </Typography>
                  {card.icon}
                </Box>

                {/* Value */}
                <Typography
                  sx={{
                    fontSize: { xs: '1.2rem', md: '1.55rem' },
                    fontWeight: 700,
                    color: 'white',
                    fontFamily: '"Poppins", sans-serif',
                    mt: { xs: 1.5, md: 2 },
                    lineHeight: 1.1,
                    letterSpacing: '-0.5px',
                  }}
                >
                  {card.value}
                </Typography>

                {/* Label + sub */}
                <Box mt={0.5} display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      color: 'rgba(255,255,255,0.55)',
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    {card.label}
                  </Typography>
                  {card.sub && (
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        color: secondary,
                        fontWeight: 700,
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      {card.sub}
                    </Typography>
                  )}
                </Box>
              </Box>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* ── Wide count card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.4 }}
      >
        <Box
          sx={{
            bgcolor: '#c8d9a3',
            borderRadius: 3,
            px: { xs: 2.5, md: 3 },
            pt: { xs: 6, md: 7 },
            pb: { xs: 2.5, md: 3 },
            minHeight: { xs: 110, md: 140 },
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            overflow: 'hidden',
          }}
        >
          {/* Icon — top left */}
          <HomeOutlined
            sx={{
              position: 'absolute',
              top: { xs: 16, md: 20 },
              left: { xs: 20, md: 24 },
              fontSize: 28,
              color: primary,
            }}
          />

          {/* Label — bottom left */}
          <Typography
            sx={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: primary,
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: '0.5px',
            }}
          >
            {t(`${ns}:${k.propertiesOwned}`)}
          </Typography>

          {/* Count — bottom right */}
          <Typography
            sx={{
              fontSize: { xs: '5rem', md: '7rem' },
              fontWeight: 700,
              color: primary,
              fontFamily: '"Poppins", sans-serif',
              lineHeight: 0.85,
              letterSpacing: '-4px',
            }}
          >
            {String(count).padStart(2, '0')}
          </Typography>
        </Box>
      </motion.div>
    </Box>
  )
}

FinancialHeader.propTypes = {
  financialSummary: PropTypes.object,
  user:             PropTypes.object,
  config:           PropTypes.object.isRequired,
  t:                PropTypes.func.isRequired,
}

export default FinancialHeader
