import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search,
  CalendarToday,
  Visibility,
  TrendingUp,
  VideoLibrary,
  ArrowForward
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ✅ DATA QUEMADA TEMPORAL
const mockNewsFeed = [
  {
    id: 1,
    title: 'Club House Construction Begins',
    description: 'Today we officially started the construction of our new club house facility with state-of-the-art amenities...',
    category: 'construction',
    author: {
      name: 'John Admin',
      avatar: 'https://i.pravatar.cc/150?img=12',
      role: 'Project Manager'
    },
    date: '2026-02-10T10:30:00',
    views: 245,
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
    hasVideo: true,
    featured: true
  },
  {
    id: 2,
    title: 'New Model 10 Now Available',
    description: 'Exciting news! We are launching our new Model 10 with premium upgrades and enhanced features...',
    category: 'announcement',
    author: {
      name: 'Sarah Manager',
      avatar: 'https://i.pravatar.cc/150?img=45',
      role: 'Sales Director'
    },
    date: '2026-02-08T14:20:00',
    views: 189,
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    hasVideo: false,
    featured: false
  },
  {
    id: 3,
    title: 'Monthly Progress Report - January 2026',
    description: 'Check out our monthly progress report with construction updates, milestones achieved, and upcoming projects...',
    category: 'report',
    author: {
      name: 'Michael Thompson',
      avatar: 'https://i.pravatar.cc/150?img=33',
      role: 'Construction Manager'
    },
    date: '2026-02-01T09:00:00',
    views: 432,
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    hasVideo: true,
    featured: false
  },
  {
    id: 4,
    title: 'Community Event: Grand Opening Celebration',
    description: 'Join us for the grand opening celebration of our new amenities center. Food, music, and family fun activities...',
    category: 'event',
    author: {
      name: 'Emily Rodriguez',
      avatar: 'https://i.pravatar.cc/150?img=27',
      role: 'Community Manager'
    },
    date: '2026-01-28T16:45:00',
    views: 567,
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    hasVideo: false,
    featured: false
  },
  {
    id: 5,
    title: 'Infrastructure Upgrade: New Roads and Lighting',
    description: 'We are implementing major infrastructure improvements including new paved roads and LED street lighting...',
    category: 'construction',
    author: {
      name: 'John Admin',
      avatar: 'https://i.pravatar.cc/150?img=12',
      role: 'Project Manager'
    },
    date: '2026-01-25T11:30:00',
    views: 298,
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800',
    hasVideo: true,
    featured: false
  },
  {
    id: 6,
    title: 'Property Value Report Q4 2025',
    description: 'Our latest property value analysis shows strong growth trends and positive market indicators for the community...',
    category: 'report',
    author: {
      name: 'David Chen',
      avatar: 'https://i.pravatar.cc/150?img=60',
      role: 'Financial Analyst'
    },
    date: '2026-01-20T13:15:00',
    views: 412,
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    hasVideo: false,
    featured: false
  }
];

const NewsFeed = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All News', icon: '📰' },
    { value: 'construction', label: 'Construction', icon: '🏗️' },
    { value: 'announcement', label: 'Announcements', icon: '📢' },
    { value: 'report', label: 'Reports', icon: '📊' },
    { value: 'event', label: 'Events', icon: '🎉' }
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case 'construction': return '#f59e0b';
      case 'announcement': return '#3b82f6';
      case 'report': return '#8b5cf6';
      case 'event': return '#ec4899';
      default: return '#6c757d';
    }
  };

  const filteredNews = mockNewsFeed.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         news.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || news.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredNews = filteredNews.find(news => news.featured);
  const regularNews = filteredNews.filter(news => !news.featured);

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="xl">
        {/* ✅ HEADER */}
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
                background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Community News & Updates
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#6c757d',
                fontWeight: 400,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Stay informed with the latest developments, events, and announcements from your community
            </Typography>
          </Box>
        </motion.div>

        {/* ✅ SEARCH & FILTERS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: 4,
              p: 3,
              mb: 5,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}
          >
            <Grid container spacing={3} alignItems="center">
              {/* Search Bar */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search news articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: '#6c757d' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: '#f8f9fa',
                      '&:hover': { bgcolor: '#f1f3f5' },
                      '&.Mui-focused': { bgcolor: 'white' }
                    }
                  }}
                />
              </Grid>

              {/* Category Tabs */}
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
                      minHeight: 48,
                      borderRadius: 3,
                      mr: 1
                    },
                    '& .Mui-selected': {
                      bgcolor: '#e8f5ee',
                      color: '#4a7c59'
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
          </Box>
        </motion.div>

        {/* ✅ FEATURED NEWS (Grande) */}
        {featuredNews && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card
              onClick={() => navigate(`/explore/news/${featuredNews.id}`)}
              sx={{
                mb: 5,
                borderRadius: 5,
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.18)'
                }
              }}
            >
              <Grid container>
                <Grid item xs={12} md={7}>
                  <Box
                    sx={{
                      height: { xs: 300, md: 500 },
                      backgroundImage: `url(${featuredNews.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}
                  >
                    {/* Featured Badge */}
                    <Chip
                      icon={<TrendingUp />}
                      label="Featured"
                      sx={{
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        bgcolor: '#ef4444',
                        color: 'white',
                        fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(239,68,68,0.4)'
                      }}
                    />

                    {/* Category Badge */}
                    <Chip
                      label={featuredNews.category}
                      sx={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        bgcolor: getCategoryColor(featuredNews.category),
                        color: 'white',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}
                    />

                    {/* Video Badge */}
                    {featuredNews.hasVideo && (
                      <Chip
                        icon={<VideoLibrary sx={{ color: 'white !important' }} />}
                        label="Video"
                        sx={{
                          position: 'absolute',
                          bottom: 20,
                          left: 20,
                          bgcolor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          fontWeight: 600
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
                        color: '#2c3e50',
                        mb: 2,
                        fontSize: { xs: '1.8rem', md: '2.2rem' },
                        lineHeight: 1.2
                      }}
                    >
                      {featuredNews.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: '#6c757d',
                        mb: 3,
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {featuredNews.description}
                    </Typography>

                    {/* Author Info */}
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Avatar src={featuredNews.author.avatar} sx={{ width: 48, height: 48 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {featuredNews.author.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {featuredNews.author.role}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Meta Info */}
                    <Stack direction="row" spacing={2} mb={3}>
                      <Chip
                        icon={<CalendarToday />}
                        label={new Date(featuredNews.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        size="small"
                        sx={{ bgcolor: '#f8f9fa' }}
                      />
                      <Chip
                        icon={<Visibility />}
                        label={`${featuredNews.views} views`}
                        size="small"
                        sx={{ bgcolor: '#f8f9fa' }}
                      />
                      <Chip
                        label={featuredNews.readTime}
                        size="small"
                        sx={{ bgcolor: '#f8f9fa' }}
                      />
                    </Stack>

                    <Button
                      variant="contained"
                      endIcon={<ArrowForward />}
                      sx={{
                        mt: 'auto',
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                        color: 'white',
                        fontWeight: 700,
                        py: 1.5,
                        textTransform: 'none',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #3d664a 0%, #7ba843 100%)'
                        }
                      }}
                    >
                      Read Full Article
                    </Button>
                  </CardContent>
                </Grid>
              </Grid>
            </Card>
          </motion.div>
        )}

        {/* ✅ REGULAR NEWS GRID */}
        <Grid container spacing={4}>
          {regularNews.map((news, index) => (
            <Grid item xs={12} sm={6} lg={4} key={news.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                style={{ height: '100%' }} // ✅ Añadido
              >
                <Card
                  onClick={() => navigate(`/explore/news/${news.id}`)}
                  sx={{
                    height: '100%', // ✅ Ocupa todo el espacio del Grid
                    borderRadius: 4,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  {/* Image */}
                  <Box sx={{ position: 'relative', flexShrink: 0 }}> {/* ✅ flexShrink: 0 evita que la imagen se comprima */}
                    <CardMedia
                      component="img"
                      height="220"
                      image={news.image}
                      alt={news.title}
                      sx={{ objectFit: 'cover' }} // ✅ Asegura que la imagen mantenga proporción
                    />
        
                    {/* Category Badge */}
                    <Chip
                      label={news.category}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: getCategoryColor(news.category),
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                    />
        
                    {/* Video Badge */}
                    {news.hasVideo && (
                      <Chip
                        icon={<VideoLibrary sx={{ color: 'white !important', fontSize: 16 }} />}
                        label="Video"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          bgcolor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                    )}
                  </Box>
        
                  {/* Content */}
                  <CardContent 
                    sx={{ 
                      p: 3, 
                      flex: 1, // ✅ Ocupa el espacio restante
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'space-between' // ✅ Distribuye el contenido uniformemente
                    }}
                  >
                    {/* Título y descripción */}
                    <Box sx={{ flex: 1 }}> {/* ✅ Permite que este bloque crezca */}
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          color: '#2c3e50',
                          mb: 1.5,
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '2.6em' // ✅ Altura mínima para 2 líneas
                        }}
                      >
                        {news.title}
                      </Typography>
        
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#6c757d',
                          mb: 2,
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '4.8em' // ✅ Altura mínima para 3 líneas
                        }}
                      >
                        {news.description}
                      </Typography>
                    </Box>
        
                    {/* Author Info - Siempre al final */}
                    <Box>
                      <Box display="flex" alignItems="center" gap={1.5} mb={2} pb={2} borderBottom="1px solid #e9ecef">
                        <Avatar src={news.author.avatar} sx={{ width: 32, height: 32 }} />
                        <Box>
                          <Typography variant="caption" fontWeight={600} display="block">
                            {news.author.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                            {news.author.role}
                          </Typography>
                        </Box>
                      </Box>
        
                      {/* Meta Info */}
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                          <CalendarToday sx={{ fontSize: 14 }} />
                          {new Date(news.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                          <Visibility sx={{ fontSize: 14 }} />
                          {news.views}
                        </Typography>
                        <Typography variant="caption" fontWeight={600} color="primary">
                          {news.readTime}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* ✅ EMPTY STATE */}
        {filteredNews.length === 0 && (
          <Box textAlign="center" py={10}>
            <Typography variant="h5" color="text.secondary" mb={2}>
              No news found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default NewsFeed;