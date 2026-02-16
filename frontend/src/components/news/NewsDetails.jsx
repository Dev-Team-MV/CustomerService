import React, { useState, useEffect } from 'react';
import { useCallback } from 'react';

import {
  Box,
  Container,
  Typography,
  Chip,
  Divider,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Fade
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  Share,
  Bookmark,
  BookmarkBorder,
  AccessTime,
  ChevronRight
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import newsService from '../../services/newsService';

const NewsDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [bookmarked, setBookmarked] = useState(false);
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // ✅ Scroll progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = (window.scrollY / documentHeight) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Fetch news on mount
  useEffect(() => {
    fetchNewsDetail();
  }, [id]);

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      const data = await newsService.getNewsById(id);
      setNews(data);
      setError(null);
    } catch (err) {
      console.error('❌ Error loading news:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const [relatedNews, setRelatedNews] = useState([]);
const [loadingRelated, setLoadingRelated] = useState(false);

const fetchRelatedNews = useCallback(async () => {
  if (!news?.category) return;
  setLoadingRelated(true);
  try {
    const allNews = await newsService.getAllNews();
    // Filtra por categoría, excluyendo la noticia actual
    const filtered = allNews.filter(
      n => n.category === news.category && n._id !== news._id
    );
    setRelatedNews(filtered.slice(0, 4)); // Muestra máximo 4
  } catch (err) {
    setRelatedNews([]);
  } finally {
    setLoadingRelated(false);
  }
}, [news]);

useEffect(() => {
  fetchRelatedNews();
}, [news, fetchRelatedNews]);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'construction': return '#E5863C';
      case 'announcement': return '#8CA551';
      case 'report': return '#333F1F';
      case 'event': return '#8CA551';
      default: return '#706f6f';
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // ✅ Renderizar bloques de contenido con estilo premium
  const renderContentBlock = (block, index) => {
    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level}`;
        return (
          <Typography
            key={index}
            component={HeadingTag}
            sx={{
              color: '#333F1F',
              fontWeight: block.level === 2 ? 800 : 700,
              fontSize: block.level === 2 ? { xs: '1.8rem', md: '2.2rem' } : { xs: '1.4rem', md: '1.8rem' },
              fontFamily: '"Poppins", sans-serif',
              mt: { xs: 4, md: 6 },
              mb: { xs: 2, md: 3 },
              lineHeight: 1.3,
              letterSpacing: '-0.5px',
              position: 'relative',
              '&::after': block.level === 2 ? {
                content: '""',
                position: 'absolute',
                bottom: -16,
                left: 0,
                width: 60,
                height: 4,
                bgcolor: '#8CA551',
                borderRadius: 2
              } : {}
            }}
          >
            {block.text}
          </Typography>
        );
      
      case 'paragraph':
        return (
          <Typography
            key={index}
            sx={{
              color: '#495057',
              fontSize: { xs: '1.05rem', md: '1.15rem' },
              lineHeight: 1.9,
              mb: { xs: 2.5, md: 3 },
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 400,
              textAlign: 'justify',
              '& strong': {
                color: '#333F1F',
                fontWeight: 700
              },
              '& em': {
                fontStyle: 'italic',
                color: '#706f6f'
              }
            }}
            dangerouslySetInnerHTML={{ __html: block.text }}
          />
        );
      
      case 'list':
        const ListTag = block.ordered ? 'ol' : 'ul';
        return (
          <Box
            key={index}
            component={ListTag}
            sx={{
              color: '#495057',
              fontSize: { xs: '1.05rem', md: '1.15rem' },
              lineHeight: 1.9,
              mb: { xs: 2.5, md: 3 },
              pl: { xs: 3, md: 4 },
              fontFamily: '"Poppins", sans-serif',
              '& li': {
                mb: 1.5,
                position: 'relative',
                '&::marker': {
                  color: '#8CA551',
                  fontWeight: 700
                }
              }
            }}
          >
            {block.items.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </Box>
        );
      
      case 'quote':
        return (
          <Paper
            key={index}
            elevation={0}
            sx={{
              borderLeft: '6px solid',
              borderImage: 'linear-gradient(180deg, #8CA551 0%, #333F1F 100%) 1',
              bgcolor: 'rgba(140, 165, 81, 0.04)',
              p: { xs: 3, md: 4 },
              my: { xs: 4, md: 5 },
              borderRadius: '0 12px 12px 0',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(51, 63, 31, 0.08)',
              '&::before': {
                content: '"❝"',
                position: 'absolute',
                top: -20,
                left: 20,
                fontSize: '6rem',
                color: 'rgba(140, 165, 81, 0.15)',
                fontFamily: '"Poppins", sans-serif',
                lineHeight: 1
              }
            }}
          >
            <Typography 
              sx={{ 
                fontSize: { xs: '1.15rem', md: '1.3rem' },
                lineHeight: 1.7,
                fontFamily: '"Poppins", sans-serif',
                fontStyle: 'italic',
                color: '#333F1F',
                fontWeight: 500,
                position: 'relative',
                zIndex: 1
              }}
            >
              {block.text}
            </Typography>
            {block.author && (
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 2, 
                  color: '#8CA551',
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '0.95rem'
                }}
              >
                — {block.author}
              </Typography>
            )}
          </Paper>
        );
      
      default:
        return null;
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#fafafa">
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: '#8CA551', mb: 2 }} />
          <Typography sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
            Loading article...
          </Typography>
        </Box>
      </Box>
    );
  }

  // ✅ Error state
  if (error || !news) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 3,
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          {error || 'News article not found'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/explore/news')}
          variant="contained"
          sx={{
            borderRadius: 3,
            bgcolor: '#333F1F',
            textTransform: 'none',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#8CA551'
            }
          }}
        >
          Back to News
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>
      {/* ✅ SCROLL PROGRESS BAR */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: 'rgba(140, 165, 81, 0.2)',
          zIndex: 9999
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${scrollProgress}%`,
            bgcolor: '#8CA551',
            transition: 'width 0.1s ease'
          }}
        />
      </Box>

      {/* ✅ HERO SECTION - Full width parallax */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: '60vh', md: '75vh' },
          overflow: 'hidden'
        }}
      >
  <motion.div
    initial={{ scale: 1.1 }}
    animate={{ scale: 1 }}
    transition={{ duration: 1.5, ease: 'easeOut' }}
    style={{ width: '100%', height: '100%' }}
  >
<Box
  sx={{
    width: '100%',
    height: '100%',
    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(51, 63, 31, 0.7) 100%), url(${news.heroImage})`,
    backgroundSize: '100% auto', // Fuerza ancho completo, altura proporcional
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center top',
    backgroundAttachment: { xs: 'scroll', md: 'fixed' }
  }}
/>
  </motion.div>

        {/* Overlay Content */}
        <Container 
          maxWidth="lg" 
          sx={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            pb: { xs: 4, md: 6 },
            width: '100%'
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Chip
              label={news.category}
              sx={{
                bgcolor: getCategoryColor(news.category),
                color: 'white',
                fontWeight: 700,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '1.5px',
                mb: 3,
                height: 32,
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            />

            <Typography
              variant="h1"
              sx={{
                color: 'white',
                fontWeight: 900,
                fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                fontFamily: '"Poppins", sans-serif',
                lineHeight: 1.1,
                mb: 2,
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                maxWidth: '900px'
              }}
            >
              {news.title}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.95)',
                fontWeight: 400,
                fontFamily: '"Poppins", sans-serif',
                fontStyle: 'italic',
                maxWidth: '800px',
                fontSize: { xs: '1rem', md: '1.25rem' },
                lineHeight: 1.6,
                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
              }}
            >
              {news.description}
            </Typography>
          </motion.div>
        </Container>

        {/* Back Button */}
        <IconButton
          onClick={() => navigate('/explore/news')}
          sx={{
            position: 'absolute',
            top: { xs: 20, md: 40 },
            left: { xs: 20, md: 40 },
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            '&:hover': {
              bgcolor: 'white',
              transform: 'scale(1.05)',
              boxShadow: '0 6px 30px rgba(0,0,0,0.2)'
            },
            transition: 'all 0.3s'
          }}
        >
          <ArrowBack sx={{ color: '#333F1F' }} />
        </IconButton>
      </Box>

      {/* ✅ CONTENT AREA - Más espaciado y ancho optimizado */}
      <Container maxWidth="xl" sx={{ mt: { xs: 6, md: 10 }, position: 'relative', zIndex: 10 }}>
        <Grid container spacing={{ xs: 4, md: 8 }}>
          {/* MAIN CONTENT - Ahora más ancho (70%) */}
          <Grid item xs={12} md={8.5}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Paper
                elevation={0}
                sx={{
                  bgcolor: 'white',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(51, 63, 31, 0.15)',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                <Box sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
                  {/* META INFO */}
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    gap={2}
                    mb={5}
                    pb={4}
                    borderBottom="1px solid rgba(140, 165, 81, 0.2)"
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          bgcolor: 'rgba(140, 165, 81, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(140, 165, 81, 0.3)'
                        }}
                      >
                        <CalendarToday sx={{ color: '#8CA551', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#706f6f',
                            fontFamily: '"Poppins", sans-serif',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontWeight: 600,
                            fontSize: '0.65rem'
                          }}
                        >
                          Published
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{
                            color: '#333F1F',
                            fontWeight: 600,
                            fontFamily: '"Poppins", sans-serif'
                          }}
                        >
                          {new Date(news.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" gap={1}>
                      <IconButton
                        onClick={() => setBookmarked(!bookmarked)}
                        sx={{
                          bgcolor: bookmarked ? 'rgba(140, 165, 81, 0.12)' : 'rgba(0,0,0,0.04)',
                          color: bookmarked ? '#8CA551' : '#706f6f',
                          border: bookmarked ? '1px solid rgba(140, 165, 81, 0.3)' : '1px solid transparent',
                          '&:hover': {
                            bgcolor: 'rgba(140, 165, 81, 0.15)',
                            transform: 'scale(1.05)'
                          },
                          transition: 'all 0.3s'
                        }}
                      >
                        {bookmarked ? <Bookmark /> : <BookmarkBorder />}
                      </IconButton>
                      <IconButton
                        onClick={handleShare}
                        sx={{
                          bgcolor: 'rgba(0,0,0,0.04)',
                          color: '#706f6f',
                          '&:hover': {
                            bgcolor: 'rgba(140, 165, 81, 0.15)',
                            color: '#8CA551',
                            transform: 'scale(1.05)'
                          },
                          transition: 'all 0.3s'
                        }}
                      >
                        <Share />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* DROP CAP FIRST PARAGRAPH */}
                  <Typography
                    sx={{
                      fontSize: { xs: '1.05rem', md: '1.15rem' },
                      lineHeight: 1.9,
                      fontFamily: '"Poppins", sans-serif',
                      color: '#495057',
                      mb: 4,
                      '&::first-letter': {
                        float: 'left',
                        fontSize: '5rem',
                        lineHeight: 0.8,
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 900,
                        color: '#333F1F',
                        pr: 1.5,
                        pt: 0.5
                      }
                    }}
                  >
                    {news.contentBlocks?.[0]?.type === 'paragraph' 
                      ? news.contentBlocks[0].text 
                      : 'This article begins with an elegant introduction to set the tone.'}
                  </Typography>

                  {/* CONTENT BLOCKS */}
                  <Box>
                    {news.contentBlocks?.slice(1).map((block, idx) => renderContentBlock(block, idx))}
                  </Box>

                  {/* IMAGE GALLERY - Masonry style */}
                  {news.images && news.images.length > 0 && (
                    <Box sx={{ mt: { xs: 6, md: 8 } }}>
                      <Box mb={4}>
                        <Typography 
                          variant="h4" 
                          fontWeight={800}
                          sx={{
                            color: '#333F1F',
                            fontFamily: '"Poppins", sans-serif',
                            mb: 1
                          }}
                        >
                          Visual Gallery
                        </Typography>
                        <Box width={60} height={4} bgcolor="#8CA551" borderRadius={2} />
                      </Box>
                      
                      <Grid container spacing={2}>
                        {news.images.map((image, idx) => (
                          <Grid item xs={12} sm={news.images.length === 1 ? 12 : 6} key={idx}>
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.6, delay: idx * 0.1 }}
                            >
                              <Box
                                component="img"
                                src={image}
                                alt={`Gallery ${idx + 1}`}
                                sx={{
                                  width: '100%',
                                  height: news.images.length === 1 ? 500 : 300,
                                  objectFit: 'cover',
                                  borderRadius: 3,
                                  cursor: 'pointer',
                                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: '0 4px 20px rgba(51, 63, 31, 0.1)',
                                  border: '1px solid rgba(0,0,0,0.05)',
                                  '&:hover': { 
                                    transform: 'translateY(-8px) scale(1.02)',
                                    boxShadow: '0 20px 50px rgba(51, 63, 31, 0.2)'
                                  }
                                }}
                              />
                            </motion.div>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* VIDEOS */}
                  {news.videos && news.videos.length > 0 && (
                    <Box sx={{ mt: { xs: 6, md: 8 } }}>
                      <Box mb={4}>
                        <Typography 
                          variant="h4" 
                          fontWeight={800}
                          sx={{
                            color: '#333F1F',
                            fontFamily: '"Poppins", sans-serif',
                            mb: 1
                          }}
                        >
                          Video Coverage
                        </Typography>
                        <Box width={60} height={4} bgcolor="#8CA551" borderRadius={2} />
                      </Box>
                      
                      <Grid container spacing={3}>
                        {news.videos.map((videoUrl, idx) => (
                          <Grid item xs={12} key={idx}>
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.6 }}
                            >
                              <Box
                                component="video"
                                controls
                                src={videoUrl}
                                sx={{
                                  width: '100%',
                                  maxHeight: 500,
                                  borderRadius: 3,
                                  bgcolor: '#000',
                                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                                }}
                              />
                            </motion.div>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* TAGS */}
                  {news.tags && news.tags.length > 0 && (
                    <Box 
                      sx={{ 
                        mt: { xs: 6, md: 8 }, 
                        pt: 4, 
                        borderTop: '1px solid rgba(140, 165, 81, 0.2)' 
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        fontWeight={700} 
                        mb={2}
                        sx={{
                          color: '#333F1F',
                          fontFamily: '"Poppins", sans-serif',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          fontSize: '0.75rem'
                        }}
                      >
                        Related Topics
                      </Typography>
                      <Box display="flex" gap={1.5} flexWrap="wrap">
                        {news.tags.map((tag, idx) => (
                          <Chip
                            key={idx}
                            label={tag}
                            sx={{ 
                              bgcolor: 'rgba(140, 165, 81, 0.08)',
                              color: '#333F1F',
                              fontFamily: '"Poppins", sans-serif',
                              fontWeight: 600,
                              border: '1px solid rgba(140, 165, 81, 0.2)',
                              transition: 'all 0.3s',
                              '&:hover': { 
                                bgcolor: 'rgba(140, 165, 81, 0.15)',
                                borderColor: '#8CA551',
                                transform: 'translateY(-2px)'
                              } 
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          {/* SIDEBAR */}
          <Grid item xs={12} md={3.5}>
            <Box sx={{ position: 'sticky', top: 120 }}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {/* QUICK INFO */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: 'rgba(140, 165, 81, 0.05)',
                    border: '1px solid rgba(140, 165, 81, 0.2)',
                    mb: 3
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    fontWeight={700} 
                    mb={3}
                    sx={{
                      color: '#333F1F',
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  >
                    Article Info
                  </Typography>

                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(140, 165, 81, 0.2)'
                        }}
                      >
                        <CalendarToday sx={{ fontSize: 18, color: '#8CA551' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
                          Published
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
                          {new Date(news.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(140, 165, 81, 0.2)'
                        }}
                      >
                        <AccessTime sx={{ fontSize: 18, color: '#8CA551' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
                          Reading Time
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
                          {Math.ceil((news.contentBlocks?.length || 3) * 0.5)} min read
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                {/* SHARE CARD */}

                
                <Grid item xs={12} md={3.5}>
                  <Box sx={{ position: 'sticky', top: 120 }}>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      {/* QUICK INFO */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 4,
                          bgcolor: 'rgba(140, 165, 81, 0.05)',
                          border: '1px solid rgba(140, 165, 81, 0.2)',
                          mb: 3
                        }}
                      >
                        {/* ...existing quick info... */}
                      </Paper>
                
                      {/* ✅ Noticias relacionadas */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 4,
                          bgcolor: 'white',
                          boxShadow: '0 8px 24px rgba(51, 63, 31, 0.1)',
                          border: '1px solid rgba(0,0,0,0.05)'
                        }}
                      >
                        <Typography 
                          variant="subtitle1" 
                          fontWeight={700} 
                          mb={2}
                          sx={{
                            color: '#333F1F',
                            fontFamily: '"Poppins", sans-serif'
                          }}
                        >
                          Related News
                        </Typography>
                        {loadingRelated ? (
                          <Box display="flex" justifyContent="center" py={2}>
                            <CircularProgress size={28} sx={{ color: '#8CA551' }} />
                          </Box>
                        ) : relatedNews.length === 0 ? (
                          <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
                            No related news found.
                          </Typography>
                        ) : (
                          <Box display="flex" flexDirection="column" gap={2}>
                            {relatedNews.map(item => (
                              <Button
                                key={item._id}
                                fullWidth
                                variant="outlined"
                                onClick={() => navigate(`/explore/news/${item._id}`)}
                                sx={{
                                  borderRadius: 3,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  fontFamily: '"Poppins", sans-serif',
                                  py: 1.2,
                                  borderColor: 'rgba(140, 165, 81, 0.3)',
                                  borderWidth: '2px',
                                  color: '#333F1F',
                                  justifyContent: 'flex-start',
                                  alignItems: 'center',
                                  gap: 1.5,
                                  '&:hover': { 
                                    borderColor: '#8CA551',
                                    borderWidth: '2px',
                                    bgcolor: 'rgba(140, 165, 81, 0.08)',
                                    transform: 'translateY(-2px)'
                                  },
                                  transition: 'all 0.3s'
                                }}
                                startIcon={
                                  <Box
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: 2,
                                      bgcolor: 'rgba(140, 165, 81, 0.08)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      border: '1px solid rgba(140, 165, 81, 0.2)'
                                    }}
                                  >
                                    <CalendarToday sx={{ fontSize: 18, color: '#8CA551' }} />
                                  </Box>
                                }
                              >
                                <Box>
                                  <Typography variant="body2" fontWeight={700} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
                                    {item.title}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
                                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </Typography>
                                </Box>
                              </Button>
                            ))}
                          </Box>
                        )}
                      </Paper>
                    </motion.div>
                  </Box>
                </Grid>
                

              </motion.div>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* SPACER */}
      <Box sx={{ height: { xs: 60, md: 100 } }} />
    </Box>
  );
};

export default NewsDetail;