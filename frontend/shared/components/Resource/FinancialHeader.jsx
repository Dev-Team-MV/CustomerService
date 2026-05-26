// @shared/components/Resource/FinancialHeader.jsx
import { Box, Typography, Chip, Grid } from '@mui/material'
import { HomeOutlined, CheckCircleOutline, CancelOutlined } from '@mui/icons-material'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

const FinancialHeader = ({ financialSummary, user, config, t }) => {
  const ns = config.i18n.namespace
  const k  = config.i18n.keys
  const primary    = config.colors.primary
  // Light accent for numbers/icons on dark stat cards — secondary is often too dark
  const cardAccent = config.colors.cardAccent || '#8CA551'

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
      icon:  <HomeOutlined sx={{ fontSize: 24, color: cardAccent, opacity: 0.85 }} />,
      value: isLoading ? '—' : `$${financialSummary.totalInvestment?.toLocaleString() ?? '0'}`,
      label: t(`${ns}:${k.totalInvestment}`),
    },
    {
      num:   '02',
      icon:  <CheckCircleOutline sx={{ fontSize: 24, color: cardAccent, opacity: 0.85 }} />,
      value: isLoading ? '—' : `$${financialSummary.totalPaid?.toLocaleString() ?? '0'}`,
      label: t(`${ns}:${k.totalPaid}`),
      sub:   isLoading ? null : `${progress}% ${t(`${ns}:${k.completed}`)}`,
    },
    {
      num:   '03',
      icon:  <CancelOutlined sx={{ fontSize: 24, color: cardAccent, opacity: 0.85 }} />,
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
              fontFamily: '"DM Sans", sans-serif',
              fontSize: { xs: '2.2rem', md: '3.5rem' },
              lineHeight: 1.1,
            }}
          >
            {titleFirst}{' '}
            <Box component="span" sx={{ fontWeight: 800 }}>{titleRest}</Box>
          </Typography>

          <Box display="flex" alignItems="center" gap={1.5} mt={1}>
            <Typography
              variant="body2"
              sx={{ color: '#706f6f', fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem' }}
            >
              {t(`${ns}:${k.welcome}`)}
            </Typography>
            <Chip
              label={user?.firstName?.toUpperCase() || 'USER'}
              sx={{
                bgcolor: primary, color: 'white',
                fontWeight: 700, fontSize: '0.7rem',
                height: 28, borderRadius: 1.5,
                fontFamily: '"DM Sans", sans-serif',
                letterSpacing: '1.5px',
                px: 0.5,
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
            fontFamily: '"DM Sans", sans-serif',
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
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
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
                  p: { xs: 3, md: 4 },
                  minHeight: { xs: 160, md: 200 },
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
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
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      fontWeight: 300,
                      color: cardAccent,
                      fontFamily: '"DM Sans", sans-serif',
                      lineHeight: 1,
                      letterSpacing: '-2px',
                    }}
                  >
                    {card.num}
                  </Typography>
                  {card.icon}
                </Box>

                {/* Value + Label */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      fontWeight: 700,
                      color: 'white',
                      fontFamily: '"DM Sans", sans-serif',
                      lineHeight: 1.1,
                      letterSpacing: '-0.5px',
                      mb: 0.5,
                    }}
                  >
                    {card.value}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
                    <Typography
                      sx={{
                        fontSize: '0.78rem',
                        color: 'rgba(255,255,255,0.55)',
                        fontFamily: '"DM Sans", sans-serif',
                      }}
                    >
                      {card.label}
                    </Typography>
                    {card.sub && (
                      <Typography
                        sx={{
                          fontSize: '0.78rem',
                          color: cardAccent,
                          fontWeight: 700,
                          fontFamily: '"DM Sans", sans-serif',
                        }}
                      >
                        {card.sub}
                      </Typography>
                    )}
                  </Box>
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
            px: { xs: 3, md: 4 },
            pt: { xs: 7, md: 8 },
            pb: { xs: 3, md: 4 },
            minHeight: { xs: 160, md: 220 },
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
              top: { xs: 20, md: 28 },
              left: { xs: 24, md: 32 },
              fontSize: { xs: 28, md: 36 },
              color: primary,
            }}
          />

          {/* Label — bottom left */}
          <Typography
            sx={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: primary,
              fontFamily: '"DM Sans", sans-serif',
              letterSpacing: '0.5px',
            }}
          >
            {t(`${ns}:${k.propertiesOwned}`)}
          </Typography>

          {/* Count — bottom right */}
          <Typography
            sx={{
              fontSize: { xs: '6rem', md: '9rem' },
              fontWeight: 700,
              color: primary,
              fontFamily: '"DM Sans", sans-serif',
              lineHeight: 0.85,
              letterSpacing: '-5px',
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
