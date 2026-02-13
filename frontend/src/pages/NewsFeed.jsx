import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Tabs,
  Tab,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Search,
  CalendarToday,
  VideoLibrary,
  ArrowForward,
  Article
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import newsService from '../services/newsService';

const NewsFeed = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: 'all', label: 'All News', icon: '📰' },
    { value: 'construction', label: 'Construction', icon: '🏗️' },
    { value: 'announcement', label: 'Announcements', icon: '📢' },
    { value: 'report', label: 'Reports', icon: '📊' },
    { value: 'event', label: 'Events', icon: '🎉' }
  ];

  // ✅ Cargar noticias publicadas al montar
  useEffect(() => {
    fetchPublishedNews();
  }, []);

  const fetchPublishedNews = async () => {
    try {
      setLoading(true);
      const data = await newsService.getPublishedNews();
      setNews(data);
    } catch (error) {
      console.error('❌ Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Colores - Brandbook
  const getCategoryColor = (category) => {
    switch (category) {
      case 'construction': return '#E5863C';
      case 'announcement': return '#8CA551';
      case 'report': return '#333F1F';
      case 'event': return '#8CA551';
      default: return '#706f6f';
    }
  };

  const filteredNews = news.filter(newsItem => {
    const matchesSearch = newsItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         newsItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || newsItem.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredNews = filteredNews[0]; // Primera noticia como destacada
  const regularNews = filteredNews.slice(1);

  // ✅ Loading state - Brandbook
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} sx={{ color: '#8CA551' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="xl">
        {/* ✅ HEADER - Brandbook */}
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
                color: '#333F1F',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '-1px'
              }}
            >
              Community News & Updates
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
              Stay informed with the latest developments, events, and announcements from your community
            </Typography>
          </Box>
        </motion.div>

        {/* ✅ SEARCH & FILTERS - Brandbook */}
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
              boxShadow: '0 8px 24px rgba(51, 63, 31, 0.08)'
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search news articles..."
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
                        borderColor: 'rgba(140, 165, 81, 0.3)',
                        borderWidth: '2px'
                      },
                      '&:hover': { 
                        bgcolor: '#f5f5f5',
                        '& fieldset': {
                          borderColor: '#8CA551'
                        }
                      },
                      '&.Mui-focused': { 
                        bgcolor: 'white',
                        '& fieldset': {
                          borderColor: '#333F1F',
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
                        bgcolor: 'rgba(140, 165, 81, 0.08)'
                      }
                    },
                    '& .Mui-selected': {
                      bgcolor: 'rgba(140, 165, 81, 0.12)',
                      color: '#333F1F',
                      fontWeight: 700
                    },
                    '& .MuiTabs-indicator': {
                      bgcolor: '#8CA551',
                      height: 3,
                      borderRadius: '3px 3px 0 0'
                    }
                  }}
                >
                  {categories.map((cat) => (
                    <Tab
                      key={cat.value}
                      value={cat.value}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </Box>
                      }
                    />
                  ))}
                </Tabs>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* ✅ FEATURED NEWS - Brandbook */}
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
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid #e0e0e0',
                boxShadow: '0 12px 40px rgba(51, 63, 31, 0.12)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 60px rgba(51, 63, 31, 0.18)',
                  borderColor: 'rgba(140, 165, 81, 0.4)'
                }
              }}
            >
              <Grid container>
                <Grid item xs={12} md={7}>
                  <Box
                    sx={{
                      height: { xs: 300, md: 500 },
                      backgroundImage: `url(${featuredNews.heroImage})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      position: 'relative',
                      bgcolor: '#fafafa'
                    }}
                  >
                    <Chip
                      label={featuredNews.category}
                      sx={{
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        bgcolor: getCategoryColor(featuredNews.category),
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
                        label="Video"
                        sx={{
                          position: 'absolute',
                          bottom: 20,
                          left: 20,
                          bgcolor: 'rgba(229, 134, 60, 0.95)',
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
                        color: '#333F1F',
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

                    <Stack direction="row" spacing={2} mb={3}>
                      <Chip
                        icon={<CalendarToday sx={{ fontSize: 16 }} />}
                        label={new Date(featuredNews.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        size="small"
                        sx={{ 
                          bgcolor: '#fafafa',
                          border: '1px solid #e0e0e0',
                          fontFamily: '"Poppins", sans-serif',
                          fontWeight: 500
                        }}
                      />
                    </Stack>

                    <Button
                      variant="contained"
                      endIcon={<ArrowForward />}
                      sx={{
                        mt: 'auto',
                        borderRadius: 3,
                        bgcolor: '#333F1F',
                        color: 'white',
                        fontWeight: 700,
                        py: 1.5,
                        textTransform: 'none',
                        fontFamily: '"Poppins", sans-serif',
                        letterSpacing: '1px',
                        boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          bgcolor: '#8CA551',
                          transition: 'left 0.4s ease',
                          zIndex: 0,
                        },
                        '&:hover': {
                          bgcolor: '#333F1F',
                          boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
                          '&::before': {
                            left: 0,
                          },
                        },
                        '& .MuiButton-endIcon': {
                          position: 'relative',
                          zIndex: 1,
                        }
                      }}
                    >
                      <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
                        Read Full Article
                      </Box>
                    </Button>
                  </CardContent>
                </Grid>
              </Grid>
            </Card>
          </motion.div>
        )}

        {/* ✅ REGULAR NEWS GRID - Brandbook */}
        <Grid container spacing={4}>
          {regularNews.map((newsItem, index) => (
            <Grid item xs={12} sm={6} lg={4} key={newsItem._id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                style={{ height: '100%' }}
              >
                <Card
                  onClick={() => navigate(`/explore/news/${newsItem._id}`)}
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 4px 20px rgba(51, 63, 31, 0.08)',
                    transition: 'all 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(51, 63, 31, 0.15)',
                      borderColor: 'rgba(140, 165, 81, 0.4)'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', flexShrink: 0 }}>
                    <CardMedia
                      component="img"
                      height="220"
                      image={newsItem.heroImage}
                      alt={newsItem.title}
                      sx={{ 
                        objectFit: 'cover',
                        bgcolor: '#fafafa'
                      }}
                    />
        
                    <Chip
                      label={newsItem.category}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: getCategoryColor(newsItem.category),
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        fontFamily: '"Poppins", sans-serif',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        border: 'none'
                      }}
                    />
        
                    {newsItem.videos && newsItem.videos.length > 0 && (
                      <Chip
                        icon={<VideoLibrary sx={{ color: 'white !important', fontSize: 16 }} />}
                        label="Video"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          bgcolor: 'rgba(229, 134, 60, 0.95)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          fontFamily: '"Poppins", sans-serif',
                          border: 'none'
                        }}
                      />
                    )}
                  </Box>
        
                  <CardContent 
                    sx={{ 
                      p: 3, 
                      flex: 1,
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          color: '#333F1F',
                          mb: 1.5,
                          lineHeight: 1.3,
                          fontFamily: '"Poppins", sans-serif',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '2.6em'
                        }}
                      >
                        {newsItem.title}
                      </Typography>
        
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#706f6f',
                          mb: 2,
                          lineHeight: 1.6,
                          fontFamily: '"Poppins", sans-serif',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '4.8em'
                        }}
                      >
                        {newsItem.description}
                      </Typography>
                    </Box>
        
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Chip
                          icon={<CalendarToday sx={{ fontSize: 14 }} />}
                          label={new Date(newsItem.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          size="small"
                          sx={{ 
                            bgcolor: '#fafafa',
                            border: '1px solid #e0e0e0',
                            fontFamily: '"Poppins", sans-serif',
                            fontSize: '0.7rem',
                            height: 24
                          }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* ✅ EMPTY STATE - Brandbook */}
        {filteredNews.length === 0 && (
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
                color: '#333F1F',
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 700,
                mb: 1
              }}
            >
              No news found
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              Try adjusting your search or filters
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default NewsFeed;