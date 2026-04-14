import React, { useState } from 'react'
import {
  Container,
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Button,
  Chip,
  Grid
} from '@mui/material'
import {
  ExpandMore,
  Gavel,
  Security,
  Description,
  AccountBalance,
  Info,
  ArrowBack,
  CheckCircle
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

const TermsAndCondition = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { t } = useTranslation('termsConditions')
  const [expanded, setExpanded] = useState('panel1')

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  const sections = [
    {
      id: 'panel1',
      title: t('sections.generalTerms.title'),
      icon: <Description sx={{ color: theme.palette.primary.main }} />,
      color: theme.palette.primary.main,
      content: t('sections.generalTerms.content')
    },
    {
      id: 'panel2',
      title: t('sections.userResponsibilities.title'),
      icon: <AccountBalance sx={{ color: theme.palette.secondary.main }} />,
      color: theme.palette.secondary.main,
      content: t('sections.userResponsibilities.content')
    },
    {
      id: 'panel3',
      title: t('sections.privacyData.title'),
      icon: <Security sx={{ color: theme.palette.warning.main }} />,
      color: theme.palette.warning.main,
      content: t('sections.privacyData.content')
    },
    {
      id: 'panel4',
      title: t('sections.paymentTerms.title'),
      icon: <Gavel sx={{ color: theme.palette.info.main }} />,
      color: theme.palette.info.main,
      content: t('sections.paymentTerms.content')
    },
    {
      id: 'panel5',
      title: t('sections.intellectualProperty.title'),
      icon: <Info sx={{ color: theme.palette.primary.main }} />,
      color: theme.palette.primary.main,
      content: t('sections.intellectualProperty.content')
    },
    {
      id: 'panel6',
      title: t('sections.liability.title'),
      icon: <Security sx={{ color: theme.palette.secondary.main }} />,
      color: theme.palette.secondary.main,
      content: t('sections.liability.content')
    }
  ]

  const highlights = [
    { label: t('highlights.lastUpdated'), value: t('highlights.lastUpdatedValue'), color: theme.palette.primary.main },
    { label: t('highlights.effectiveDate'), value: t('highlights.effectiveDateValue'), color: theme.palette.secondary.main },
    { label: t('highlights.version'), value: t('highlights.versionValue'), color: theme.palette.warning.main }
  ]

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        {/* BACK BUTTON */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{
              mb: 3,
              color: theme.palette.text.secondary,
              textTransform: 'none',
              fontWeight: 600,
              fontFamily: '"Poppins", sans-serif',
              '&:hover': { bgcolor: 'transparent', color: theme.palette.primary.main }
            }}
          >
            {t('back')}
          </Button>
        </motion.div>

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              mb: 4,
              borderRadius: 4,
              background: theme.palette.gradient || `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(51, 63, 31, 0.15)'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                bgcolor: theme.palette.secondary.light || 'rgba(0, 172, 193, 0.1)',
                borderRadius: '50%',
                filter: 'blur(60px)'
              }}
            />

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Gavel sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box>
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{
                    fontSize: { xs: '2rem', md: '2.8rem' },
                    fontFamily: '"Poppins", sans-serif',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}
                >
                  {t('title')}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 400
                  }}
                >
                  {t('subtitle')}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* HIGHLIGHTS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Grid container spacing={3} mb={4}>
            {highlights.map((item, idx) => (
              <Grid item xs={12} sm={4} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `2px solid ${item.color}`,
                    bgcolor: 'white',
                    textAlign: 'center',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${item.color}20`
                    }
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '0.7rem'
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: item.color,
                      fontWeight: 700,
                      fontFamily: '"Poppins", sans-serif',
                      mt: 1
                    }}
                  >
                    {item.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* ACCEPTANCE NOTICE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              bgcolor: theme.palette.success.light || '#e8f5ee',
              border: `2px solid ${theme.palette.success.main}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <CheckCircle sx={{ fontSize: 40, color: theme.palette.success.main }} />
            <Box>
              <Typography
                variant="body1"
                fontWeight={600}
                sx={{ color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif', mb: 0.5 }}
              >
                {t('acceptance.message')}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}
              >
                {t('acceptance.disclaimer')}
              </Typography>
            </Box>
          </Paper>
        </motion.div>

        {/* ACCORDIONS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {sections.map((section, idx) => (
            <Accordion
              key={section.id}
              expanded={expanded === section.id}
              onChange={handleChange(section.id)}
              elevation={0}
              sx={{
                mb: 2,
                borderRadius: 3,
                border: `2px solid ${expanded === section.id ? section.color : '#e5e7eb'}`,
                bgcolor: 'white',
                overflow: 'hidden',
                transition: 'all 0.3s',
                '&:before': { display: 'none' },
                '&:hover': {
                  borderColor: section.color,
                  boxShadow: `0 8px 24px ${section.color}15`
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: section.color }} />}
                sx={{
                  bgcolor: expanded === section.id ? `${section.color}08` : 'transparent',
                  borderBottom: expanded === section.id ? `1px solid ${section.color}30` : 'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: `${section.color}08`
                  }
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: `${section.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {section.icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{
                        color: theme.palette.primary.main,
                        fontFamily: '"Poppins", sans-serif',
                        letterSpacing: '0.5px',
                        fontSize: { xs: '1rem', md: '1.1rem' }
                      }}
                    >
                      {section.title}
                    </Typography>
                    <Chip
                      label={t('sectionLabel', { number: idx + 1 })}
                      size="small"
                      sx={{
                        bgcolor: 'transparent',
                        border: `1px solid ${section.color}`,
                        color: section.color,
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        height: 20,
                        mt: 0.5,
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    />
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 4 }}>
                <Typography
                  sx={{
                    color: theme.palette.text.primary,
                    fontSize: '1rem',
                    lineHeight: 1.8,
                    fontFamily: '"Poppins", sans-serif',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {section.content}
                </Typography>

                <Divider sx={{ my: 3, borderColor: `${section.color}30` }} />

                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    label={t('chips.mandatory')}
                    size="small"
                    sx={{
                      bgcolor: `${section.color}15`,
                      color: section.color,
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  />
                  <Chip
                    label={t('chips.updated')}
                    size="small"
                    sx={{
                      bgcolor: theme.palette.background.default,
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </motion.div>

        {/* FOOTER ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mt: 4,
              borderRadius: 3,
              bgcolor: 'white',
              border: '1px solid #e5e7eb',
              textAlign: 'center'
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                color: theme.palette.primary.main,
                mb: 2,
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('footer.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                mb: 3,
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('footer.description')}
            </Typography>
            <Button
              variant="contained"
              sx={{
                borderRadius: 3,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                px: 4,
                py: 1.5,
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '1px',
                '&:hover': {
                  bgcolor: theme.palette.secondary.main
                }
              }}
            >
              {t('footer.button')}
            </Button>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  )
}

export default TermsAndCondition