// @shared/components/News/NewsFeed.jsx
import React from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  CircularProgress,
  Paper,
  Badge
} from '@mui/material'
import {
  Search,
  CalendarToday,
  VideoLibrary,
  ArrowForward,
  Article
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'

import { useNewsFeed } from '../../hooks/useNewsFeed'
import { getCategoryColor } from '../../config/newsConfig'
import NewsCard from './NewsCard'

const NewsFeed = ({ config }) => {
  const { t } = useTranslation([config.i18n.namespace, 'common'])
  const navigate = useNavigate()

  const {
    featuredNews,
    regularNews,
    loading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedProject,
    setSelectedProject,
    projectTabs
  } = useNewsFeed()

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} sx={{ color: config.colors.secondary }} />
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="xl">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h2"
              fontWeight={900}
              sx={{
                color: config.colors.primary,
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '-1px'
              }}
            >
              {t('news:feedTitle', 'Community News & Updates')}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#706f6f',
                fontWeight: 400,
                maxWidth: 600,
                mx: 'auto',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('news:feedSubtitle', 'Stay informed with the latest developments, events, and announcements from your community')}
            </Typography>
          </Box>
        </motion.div>

        {/* PROJECT TABS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Paper
            elevation={0}
            sx={{
              bgcolor: 'white',
              borderRadius: 4,
              p: 2,
              mb: 3,
              border: '1px solid #e0e0e0',
              boxShadow: `0 8px 24px ${config.colors.primary}14`
            }}
          >
            <Tabs
              value={selectedProject}
              onChange={(e, newValue) => setSelectedProject(newValue)}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '1rem',
                  minHeight: 56,
                  borderRadius: 3,
                  mx: 0.5,
                  color: '#706f6f',
                  '&:hover': {
                    bgcolor: `${config.colors.secondary}14`
                  }
                },
                '& .Mui-selected': {
                  bgcolor: `${config.colors.secondary}1A`,
                  color: config.colors.primary,
                  fontWeight: 700
                },
                '& .MuiTabs-indicator': {
                  bgcolor: config.colors.secondary,
                  height: 4,
                  borderRadius: '4px 4px 0 0'
                }
              }}
            >
              {projectTabs.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={
                    <Box display="flex" alignItems="center" gap={2}>
                      <span>{tab.label}</span>
                      <Badge
                        badgeContent={tab.count}
                        sx={{
                          '& .MuiBadge-badge': {
                            bgcolor: selectedProject === tab.value ? config.colors.secondary : '#e0e0e0',
                            color: selectedProject === tab.value ? 'white' : '#706f6f',
                            fontWeight: 700,
                            fontFamily: '"Poppins", sans-serif'
                          }
                        }}
                      />
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Paper>
        </motion.div>

        {/* SEARCH & FILTERS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper
            elevation={0}
            sx={{
              bgcolor: 'white',
              borderRadius: 4,
              p: 3,
              mb: 5,
              border: '1px solid #e0e0e0',
              boxShadow: `0 8px 24px ${config.colors.primary}14`
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder={t('news:searchPlaceholder', 'Search news articles...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: '#706f6f' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: '#fafafa',
                      fontFamily: '"Poppins", sans-serif',
                      '& fieldset': {
                        borderColor: `${config.colors.secondary}4D`,
                        borderWidth: '2px'
                      },
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                        '& fieldset': {
                          borderColor: config.colors.secondary
                        }
                      },
                      '&.Mui-focused': {
                        bgcolor: 'white',
                        '& fieldset': {
                          borderColor: config.colors.primary,
                          borderWidth: '2px'
                        }
                      }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Tabs
                  value={selectedCategory}
                  onChange={(e, newValue) => setSelectedCategory(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                      minHeight: 48,
                      borderRadius: 3,
                      mr: 1,
                      color: '#706f6f',
                      '&:hover': {
                        bgcolor: `${config.colors.secondary}14`
                      }
                    },
                    '& .Mui-selected': {
                      bgcolor: `${config.colors.secondary}1A`,
                      color: config.colors.primary,
                      fontWeight: 700
                    },
                    '& .MuiTabs-indicator': {
                      bgcolor: config.colors.secondary,
                      height: 3,
                      borderRadius: '3px 3px 0 0'
                    }
                  }}
                >
                  {config.categories.map((cat) => (
                    <Tab
                      key={cat.value}
                      value={cat.value}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <span>{cat.icon}</span>
                          <span>{t(`news:category${cat.label.replace(/\s/g, '')}`, cat.label)}</span>
                        </Box>
                      }
                    />
                  ))}
                </Tabs>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* FEATURED NEWS */}
        {featuredNews && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card
              onClick={() => navigate(`/explore/news/${featuredNews._id}`)}
              sx={{
                mb: 5,
                borderRadius: 4,
                p: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid #e0e0e0',
                boxShadow: `0 12px 40px ${config.colors.primary}1A`,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 20px 60px ${config.colors.primary}2D`,
                  borderColor: `${config.colors.secondary}66`
                }
              }}
            >
              <Grid container>
                <Grid item xs={12} md={7}>
                  <Box
                    sx={{
                      height: { xs: 300, md: 500 },
                      backgroundImage: `url(${featuredNews.heroImage})`,
                      backgroundSize: 'cover',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      position: 'relative',
                      bgcolor: '#fafafa'
                    }}
                  >
                    <Chip
                      label={t(`news:category${featuredNews.category.charAt(0).toUpperCase() + featuredNews.category.slice(1)}`, featuredNews.category)}
                      sx={{
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        bgcolor: getCategoryColor(featuredNews.category, config),
                        color: 'white',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        fontFamily: '"Poppins", sans-serif',
                        fontSize: '0.75rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        border: 'none'
                      }}
                    />

                    {featuredNews.videos && featuredNews.videos.length > 0 && (
                      <Chip
                        icon={<VideoLibrary sx={{ color: 'white !important' }} />}
                        label={t('news:video', 'Video')}
                        sx={{
                          position: 'absolute',
                          bottom: 20,
                          left: 20,
                          bgcolor: `${config.colors.accent}F0`,
                          color: 'white',
                          fontWeight: 600,
                          fontFamily: '"Poppins", sans-serif',
                          border: 'none'
                        }}
                      />
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={5}>
                  <CardContent sx={{ p: { xs: 3, md: 5 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      variant="h3"
                      fontWeight={800}
                      sx={{
                        color: config.colors.primary,
                        mb: 2,
                        fontSize: { xs: '1.8rem', md: '2.2rem' },
                        lineHeight: 1.2,
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    >
                      {featuredNews.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: '#706f6f',
                        mb: 3,
                        lineHeight: 1.6,
                        fontFamily: '"Poppins", sans-serif',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {featuredNews.description}
                    </Typography>

                    <Box mb={3}>
                      <Chip
                        icon={<CalendarToday sx={{ fontSize: 16 }} />}
                        label={new Date(featuredNews.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        size="small"
                        sx={{
                          bgcolor: '#fafafa',
                          border: '1px solid #e0e0e0',
                          fontFamily: '"Poppins", sans-serif',
                          fontWeight: 500
                        }}
                      />
                    </Box>

                    <Button
                      variant="contained"
                      endIcon={<ArrowForward />}
                      sx={{
                        mt: 'auto',
                        borderRadius: 3,
                        bgcolor: config.colors.primary,
                        color: 'white',
                        fontWeight: 700,
                        py: 1.5,
                        textTransform: 'none',
                        fontFamily: '"Poppins", sans-serif',
                        letterSpacing: '1px',
                        boxShadow: `0 4px 12px ${config.colors.primary}40`,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          bgcolor: config.colors.secondary,
                          transition: 'left 0.4s ease',
                          zIndex: 0
                        },
                        '&:hover': {
                          bgcolor: config.colors.primary,
                          boxShadow: `0 8px 20px ${config.colors.primary}59`,
                          '&::before': {
                            left: 0
                          }
                        },
                        '& .MuiButton-endIcon': {
                          position: 'relative',
                          zIndex: 1
                        }
                      }}
                    >
                      <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
                        {t('news:readFullArticle', 'Read Full Article')}
                      </Box>
                    </Button>
                  </CardContent>
                </Grid>
              </Grid>
            </Card>
          </motion.div>
        )}

        {/* REGULAR NEWS GRID */}
        <Grid container spacing={4}>
          {regularNews.map((newsItem, index) => (
            <Grid item xs={12} sm={6} lg={4} key={newsItem._id}>
              <NewsCard
                newsItem={newsItem}
                config={config}
                onClick={() => navigate(`/explore/news/${newsItem._id}`)}
                index={index}
              />
            </Grid>
          ))}
        </Grid>

        {/* EMPTY STATE */}
        {!featuredNews && regularNews.length === 0 && (
          <Box textAlign="center" py={10}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                bgcolor: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 3,
                border: '1px solid #e0e0e0'
              }}
            >
              <Article sx={{ fontSize: 40, color: '#706f6f' }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                color: config.colors.primary,
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 700,
                mb: 1
              }}
            >
              {t('news:noNewsFound', 'No news found')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('news:tryAdjustingSearch', 'Try adjusting your search or filters')}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  )
}

NewsFeed.propTypes = {
  config: PropTypes.object.isRequired
}

export default NewsFeed