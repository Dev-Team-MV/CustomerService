// // @shared/components/News/NewsDetails.jsx
// import React, { useState, useEffect } from 'react'
// import {
//   Box,
//   Container,
//   Typography,
//   Chip,
//   Button,
//   Grid,
//   Paper,
//   Divider,
//   CircularProgress,
//   IconButton
// } from '@mui/material'
// import {
//   ArrowBack,
//   CalendarToday,
//   Person,
//   Share,
//   Bookmark,
//   BookmarkBorder,
//   VideoLibrary
// } from '@mui/icons-material'
// import { motion } from 'framer-motion'
// import { useNavigate, useParams } from 'react-router-dom'
// import { useTranslation } from 'react-i18next'
// import PropTypes from 'prop-types'

// import newsService from '../../services/newsService'
// import { getCategoryColor } from '../../config/newsConfig'

// const NewsDetails = ({ config }) => {
//   const { t } = useTranslation([config.i18n.namespace, 'common'])
//   const navigate = useNavigate()
//   const { id } = useParams()
  
//   const [news, setNews] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [bookmarked, setBookmarked] = useState(false)

//   useEffect(() => {
//     const fetchNews = async () => {
//       try {
//         setLoading(true)
//         const data = await newsService.getNewsById(id)
//         setNews(data)
//       } catch (error) {
//         console.error('❌ Error loading news:', error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     if (id) {
//       fetchNews()
//     }
//   }, [id])

//   const handleShare = () => {
//     if (navigator.share) {
//       navigator.share({
//         title: news.title,
//         text: news.description,
//         url: window.location.href
//       })
//     } else {
//       navigator.clipboard.writeText(window.location.href)
//       alert(t('news:linkCopied', 'Link copied to clipboard!'))
//     }
//   }

//   const renderContentBlock = (block, index) => {
//     switch (block.type) {
//       case 'heading':
//         const HeadingTag = `h${block.level}`
//         return (
//           <Typography
//             key={index}
//             component={HeadingTag}
//             variant={`h${block.level}`}
//             fontWeight={700}
//             sx={{
//               color: config.colors.primary,
//               mb: 2,
//               mt: 4,
//               fontFamily: '"Poppins", sans-serif'
//             }}
//           >
//             {block.text}
//           </Typography>
//         )

//       case 'paragraph':
//         return (
//           <Typography
//             key={index}
//             variant="body1"
//             sx={{
//               color: '#4a4a4a',
//               mb: 3,
//               lineHeight: 1.8,
//               fontFamily: '"Poppins", sans-serif',
//               fontSize: '1.05rem'
//             }}
//           >
//             {block.text}
//           </Typography>
//         )

//       case 'list':
//         return (
//           <Box key={index} component={block.ordered ? 'ol' : 'ul'} sx={{ mb: 3, pl: 3 }}>
//             {block.items.map((item, idx) => (
//               <Typography
//                 key={idx}
//                 component="li"
//                 variant="body1"
//                 sx={{
//                   color: '#4a4a4a',
//                   mb: 1,
//                   lineHeight: 1.8,
//                   fontFamily: '"Poppins", sans-serif',
//                   fontSize: '1.05rem'
//                 }}
//               >
//                 {item}
//               </Typography>
//             ))}
//           </Box>
//         )

//       case 'quote':
//         return (
//           <Paper
//             key={index}
//             elevation={0}
//             sx={{
//               p: 3,
//               mb: 3,
//               borderLeft: `4px solid ${config.colors.secondary}`,
//               bgcolor: `${config.colors.secondary}0A`,
//               borderRadius: 2
//             }}
//           >
//             <Typography
//               variant="body1"
//               sx={{
//                 color: '#4a4a4a',
//                 fontStyle: 'italic',
//                 lineHeight: 1.8,
//                 fontFamily: '"Poppins", sans-serif',
//                 fontSize: '1.1rem',
//                 mb: block.author ? 2 : 0
//               }}
//             >
//               "{block.text}"
//             </Typography>
//             {block.author && (
//               <Typography
//                 variant="body2"
//                 sx={{
//                   color: config.colors.primary,
//                   fontWeight: 600,
//                   fontFamily: '"Poppins", sans-serif'
//                 }}
//               >
//                 — {block.author}
//               </Typography>
//             )}
//           </Paper>
//         )

//       default:
//         return null
//     }
//   }

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
//         <CircularProgress size={60} sx={{ color: config.colors.secondary }} />
//       </Box>
//     )
//   }

//   if (!news) {
//     return (
//       <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
//         <Typography variant="h5" color="error" mb={3}>
//           {t('news:newsNotFound', 'News article not found')}
//         </Typography>
//         <Button
//           variant="contained"
//           startIcon={<ArrowBack />}
//           onClick={() => navigate('/explore/news')}
//           sx={{ bgcolor: config.colors.primary }}
//         >
//           {t('news:backToNews', 'Back to News')}
//         </Button>
//       </Container>
//     )
//   }

//   return (
//     <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 6 }}>
//       <Container maxWidth="lg">
//         {/* Back Button */}
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           <Button
//             startIcon={<ArrowBack />}
//             onClick={() => navigate('/explore/news')}
//             sx={{
//               mb: 4,
//               color: config.colors.primary,
//               fontWeight: 600,
//               textTransform: 'none',
//               fontSize: '1rem',
//               fontFamily: '"Poppins", sans-serif',
//               '&:hover': {
//                 bgcolor: `${config.colors.secondary}14`
//               }
//             }}
//           >
//             {t('news:backToNews', 'Back to News')}
//           </Button>
//         </motion.div>

//         {/* Article Container */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//         >
//           <Paper
//             elevation={0}
//             sx={{
//               borderRadius: 4,
//               overflow: 'hidden',
//               border: '1px solid #e0e0e0',
//               boxShadow: `0 8px 32px ${config.colors.primary}14`
//             }}
//           >
//             {/* Hero Image */}
//             <Box
//               sx={{
//                 height: { xs: 300, md: 500 },
//                 backgroundImage: `url(${news.heroImage})`,
//                 backgroundSize: 'cover',
//                 backgroundPosition: 'center',
//                 position: 'relative',
//                 bgcolor: '#fafafa'
//               }}
//             >
//               <Box
//                 sx={{
//                   position: 'absolute',
//                   bottom: 0,
//                   left: 0,
//                   right: 0,
//                   background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
//                   p: 3
//                 }}
//               >
//                 <Chip
//                   label={t(`news:category${news.category.charAt(0).toUpperCase() + news.category.slice(1)}`, news.category)}
//                   sx={{
//                     bgcolor: getCategoryColor(news.category, config),
//                     color: 'white',
//                     fontWeight: 700,
//                     textTransform: 'uppercase',
//                     fontFamily: '"Poppins", sans-serif',
//                     fontSize: '0.75rem',
//                     mb: 2
//                   }}
//                 />
//               </Box>
//             </Box>

//             {/* Article Content */}
//             <Box sx={{ p: { xs: 3, md: 6 } }}>
//               {/* Title */}
//               <Typography
//                 variant="h2"
//                 fontWeight={800}
//                 sx={{
//                   color: config.colors.primary,
//                   mb: 3,
//                   fontSize: { xs: '2rem', md: '3rem' },
//                   lineHeight: 1.2,
//                   fontFamily: '"Poppins", sans-serif'
//                 }}
//               >
//                 {news.title}
//               </Typography>

//               {/* Meta Info */}
//               <Box
//                 display="flex"
//                 flexWrap="wrap"
//                 gap={2}
//                 alignItems="center"
//                 mb={4}
//                 pb={4}
//                 borderBottom="2px solid #f0f0f0"
//               >
//                 <Chip
//                   icon={<CalendarToday sx={{ fontSize: 18 }} />}
//                   label={new Date(news.createdAt).toLocaleDateString('en-US', {
//                     month: 'long',
//                     day: 'numeric',
//                     year: 'numeric'
//                   })}
//                   sx={{
//                     bgcolor: '#fafafa',
//                     border: '1px solid #e0e0e0',
//                     fontFamily: '"Poppins", sans-serif',
//                     fontWeight: 500
//                   }}
//                 />
                
//                 {news.author && (
//                   <Chip
//                     icon={<Person sx={{ fontSize: 18 }} />}
//                     label={news.author}
//                     sx={{
//                       bgcolor: '#fafafa',
//                       border: '1px solid #e0e0e0',
//                       fontFamily: '"Poppins", sans-serif',
//                       fontWeight: 500
//                     }}
//                   />
//                 )}

//                 <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
//                   <IconButton
//                     onClick={handleShare}
//                     sx={{
//                       bgcolor: '#fafafa',
//                       border: '1px solid #e0e0e0',
//                       '&:hover': { bgcolor: `${config.colors.secondary}14` }
//                     }}
//                   >
//                     <Share sx={{ fontSize: 20 }} />
//                   </IconButton>
//                   <IconButton
//                     onClick={() => setBookmarked(!bookmarked)}
//                     sx={{
//                       bgcolor: bookmarked ? `${config.colors.secondary}14` : '#fafafa',
//                       border: `1px solid ${bookmarked ? config.colors.secondary : '#e0e0e0'}`,
//                       color: bookmarked ? config.colors.secondary : 'inherit',
//                       '&:hover': { bgcolor: `${config.colors.secondary}14` }
//                     }}
//                   >
//                     {bookmarked ? <Bookmark sx={{ fontSize: 20 }} /> : <BookmarkBorder sx={{ fontSize: 20 }} />}
//                   </IconButton>
//                 </Box>
//               </Box>

//               {/* Description */}
//               <Typography
//                 variant="h6"
//                 sx={{
//                   color: '#706f6f',
//                   mb: 4,
//                   lineHeight: 1.6,
//                   fontFamily: '"Poppins", sans-serif',
//                   fontWeight: 400,
//                   fontSize: '1.2rem'
//                 }}
//               >
//                 {news.description}
//               </Typography>

//               <Divider sx={{ my: 4 }} />

//               {/* Content Blocks */}
//               <Box sx={{ mb: 4 }}>
//                 {news.contentBlocks?.map((block, index) => renderContentBlock(block, index))}
//               </Box>

//               {/* Gallery Images */}
//               {news.images && news.images.length > 0 && (
//                 <>
//                   <Divider sx={{ my: 4 }} />
//                   <Typography
//                     variant="h5"
//                     fontWeight={700}
//                     sx={{
//                       color: config.colors.primary,
//                       mb: 3,
//                       fontFamily: '"Poppins", sans-serif'
//                     }}
//                   >
//                     {t('news:gallery', 'Gallery')}
//                   </Typography>
//                   <Grid container spacing={2} mb={4}>
//                     {news.images.map((img, idx) => (
//                       <Grid item xs={12} sm={6} md={4} key={idx}>
//                         <Box
//                           component="img"
//                           src={img}
//                           sx={{
//                             width: '100%',
//                             height: 250,
//                             objectFit: 'cover',
//                             borderRadius: 3,
//                             border: '1px solid #e0e0e0',
//                             cursor: 'pointer',
//                             transition: 'transform 0.3s',
//                             '&:hover': {
//                               transform: 'scale(1.05)'
//                             }
//                           }}
//                         />
//                       </Grid>
//                     ))}
//                   </Grid>
//                 </>
//               )}

//               {/* Videos */}
//               {news.videos && news.videos.length > 0 && (
//                 <>
//                   <Divider sx={{ my: 4 }} />
//                   <Typography
//                     variant="h5"
//                     fontWeight={700}
//                     sx={{
//                       color: config.colors.primary,
//                       mb: 3,
//                       fontFamily: '"Poppins", sans-serif'
//                     }}
//                   >
//                     {t('news:videos', 'Videos')}
//                   </Typography>
//                   <Grid container spacing={2} mb={4}>
//                     {news.videos.map((video, idx) => (
//                       <Grid item xs={12} md={6} key={idx}>
//                         <Paper
//                           elevation={0}
//                           sx={{
//                             p: 3,
//                             borderRadius: 3,
//                             border: '1px solid #e0e0e0',
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: 2,
//                             cursor: 'pointer',
//                             transition: 'all 0.3s',
//                             '&:hover': {
//                               bgcolor: `${config.colors.secondary}0A`,
//                               borderColor: config.colors.secondary
//                             }
//                           }}
//                         >
//                           <VideoLibrary sx={{ fontSize: 40, color: config.colors.accent }} />
//                           <Typography
//                             variant="body1"
//                             fontWeight={600}
//                             sx={{ fontFamily: '"Poppins", sans-serif' }}
//                           >
//                             {t('news:video', 'Video')} {idx + 1}
//                           </Typography>
//                         </Paper>
//                       </Grid>
//                     ))}
//                   </Grid>
//                 </>
//               )}

//               {/* Tags */}
//               {news.tags && news.tags.length > 0 && (
//                 <>
//                   <Divider sx={{ my: 4 }} />
//                   <Box display="flex" gap={1} flexWrap="wrap">
//                     {news.tags.map((tag, idx) => (
//                       <Chip
//                         key={idx}
//                         label={`#${tag}`}
//                         size="small"
//                         sx={{
//                           bgcolor: `${config.colors.secondary}14`,
//                           color: config.colors.primary,
//                           fontWeight: 600,
//                           fontFamily: '"Poppins", sans-serif',
//                           '&:hover': {
//                             bgcolor: `${config.colors.secondary}26`
//                           }
//                         }}
//                       />
//                     ))}
//                   </Box>
//                 </>
//               )}
//             </Box>
//           </Paper>
//         </motion.div>
//       </Container>
//     </Box>
//   )
// }

// NewsDetails.propTypes = {
//   config: PropTypes.object.isRequired
// }

// export default NewsDetails


// @shared/components/News/NewsDetails.jsx
import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Container,
  Typography,
  Chip,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
  Button
} from '@mui/material'
import {
  ArrowBack,
  CalendarToday,
  Share,
  Bookmark,
  BookmarkBorder,
  AccessTime
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'

import newsService from '../../services/newsService'
import { getCategoryColor } from '../../config/newsConfig'

const NewsDetails = ({ config }) => {
  const { t } = useTranslation([config.i18n.namespace, 'common'])
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [relatedNews, setRelatedNews] = useState([])
  const [loadingRelated, setLoadingRelated] = useState(false)

  // Scroll progress bar
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight - windowHeight
      const scrolled = (window.scrollY / documentHeight) * 100
      setScrollProgress(scrolled)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch news detail
  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true)
        const data = await newsService.getNewsById(id)
        console.log('📰 News data:', data)
        console.log('📝 Content blocks:', data.contentBlocks)
        setNews(data)
        setError(null)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchNewsDetail()
    }
  }, [id])

  // Fetch related news
  const fetchRelatedNews = useCallback(async () => {
    if (!news?.category) return
    setLoadingRelated(true)
    try {
      const allNews = await newsService.getPublishedNews()
      const filtered = allNews.filter(
        n => n.category === news.category && n._id !== news._id
      )
      setRelatedNews(filtered.slice(0, 3))
    } catch (err) {
      setRelatedNews([])
    } finally {
      setLoadingRelated(false)
    }
  }, [news])

  useEffect(() => {
    fetchRelatedNews()
  }, [news, fetchRelatedNews])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert(t('news:linkCopied', 'Link copied to clipboard!'))
    }
  }

  const renderContentBlock = (block, index) => {
    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level}`
        return (
          <Typography
            key={index}
            component={HeadingTag}
            sx={{
              color: config.colors.primary,
              fontWeight: block.level === 2 ? 800 : 700,
              fontSize: block.level === 2 
                ? { xs: '1.8rem', md: '2.2rem' } 
                : { xs: '1.4rem', md: '1.8rem' },
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
                bgcolor: config.colors.secondary,
                borderRadius: 2
              } : {}
            }}
          >
            {block.text}
          </Typography>
        )

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
                color: config.colors.primary,
                fontWeight: 700
              },
              '& em': {
                fontStyle: 'italic',
                color: '#706f6f'
              }
            }}
          >
            {block.text}
          </Typography>
        )

      case 'list':
        const ListTag = block.ordered ? 'ol' : 'ul'
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
                  color: config.colors.secondary,
                  fontWeight: 700
                }
              }
            }}
          >
            {block.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </Box>
        )

      case 'quote':
        return (
          <Paper
            key={index}
            elevation={0}
            sx={{
              borderLeft: '6px solid',
              borderImage: `linear-gradient(180deg, ${config.colors.secondary} 0%, ${config.colors.primary} 100%) 1`,
              bgcolor: `${config.colors.secondary}0A`,
              p: { xs: 3, md: 4 },
              my: { xs: 4, md: 5 },
              borderRadius: '0 12px 12px 0',
              position: 'relative',
              boxShadow: `0 4px 20px ${config.colors.primary}14`,
              '&::before': {
                content: '"❝"',
                position: 'absolute',
                top: -20,
                left: 20,
                fontSize: '6rem',
                color: `${config.colors.secondary}26`,
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
                color: config.colors.primary,
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
                  color: config.colors.secondary,
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '0.95rem'
                }}
              >
                — {block.author}
              </Typography>
            )}
          </Paper>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#fafafa">
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: config.colors.secondary, mb: 2 }} />
          <Typography sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
            {t('news:loadingArticle', 'Loading article...')}
          </Typography>
        </Box>
      </Box>
    )
  }

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
          {t('news:articleNotFound', 'News article not found')}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/explore/news')}
          variant="contained"
          sx={{
            borderRadius: 3,
            bgcolor: config.colors.primary,
            textTransform: 'none',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
            '&:hover': {
              bgcolor: config.colors.secondary
            }
          }}
        >
          {t('news:backToNews', 'Back to News')}
        </Button>
      </Container>
    )
  }

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>
      {/* Scroll Progress Bar */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: `${config.colors.secondary}33`,
          zIndex: 9999
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${scrollProgress}%`,
            bgcolor: config.colors.secondary,
            transition: 'width 0.1s ease'
          }}
        />
      </Box>

      {/* Hero Section with Parallax */}
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
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${config.colors.primary}B3 100%), url(${news.heroImage})`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundAttachment: { xs: 'scroll', md: 'fixed' }
            }}
          />
        </motion.div>

        {/* Hero Content */}
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
              label={t(`news:category${news.category.charAt(0).toUpperCase() + news.category.slice(1)}`, news.category)}
              sx={{
                bgcolor: getCategoryColor(news.category, config),
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
          <ArrowBack sx={{ color: config.colors.primary }} />
        </IconButton>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: { xs: 6, md: 10 }, position: 'relative', zIndex: 10 }}>
        <Grid container spacing={{ xs: 4, md: 8 }}>
          {/* Article Content */}
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
                  boxShadow: `0 20px 60px ${config.colors.primary}26`,
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                <Box sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
                  {/* Meta Info */}
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    gap={2}
                    mb={5}
                    pb={4}
                    borderBottom={`1px solid ${config.colors.secondary}33`}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          bgcolor: `${config.colors.secondary}1A`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${config.colors.secondary}4D`
                        }}
                      >
                        <CalendarToday sx={{ color: config.colors.secondary, fontSize: 20 }} />
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
                          {t('news:published', 'Published')}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{
                            color: config.colors.primary,
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
                  </Box>

                  {/* First Paragraph with Drop Cap */}
                  {news.contentBlocks?.[0]?.type === 'paragraph' && (
                    <Typography
                      sx={{
                        fontSize: { xs: '1.05rem', md: '1.15rem' },
                        lineHeight: 1.9,
                        fontFamily: '"Poppins", sans-serif',
                        color: '#495057',
                        mb: 4,
                        textAlign: 'justify',
                        '&::first-letter': {
                          float: 'left',
                          fontSize: '5rem',
                          lineHeight: 0.8,
                          fontFamily: '"Poppins", sans-serif',
                          fontWeight: 900,
                          color: config.colors.primary,
                          pr: 1.5,
                          pt: 0.5
                        }
                      }}
                    >
                      {news.contentBlocks[0].text}
                    </Typography>
                  )}

                  {/* Rest of Content Blocks */}
<Box>
  {news.contentBlocks
    ?.slice(news.contentBlocks[0]?.type === 'paragraph' ? 1 : 0)
    .map((block, idx) => renderContentBlock(block, idx))}
</Box>

                  {/* Gallery */}
                  {news.images && news.images.length > 0 && (
                    <Box sx={{ mt: { xs: 6, md: 8 } }}>
                      <Box mb={4}>
                        <Typography 
                          variant="h4" 
                          fontWeight={800}
                          sx={{
                            color: config.colors.primary,
                            fontFamily: '"Poppins", sans-serif',
                            mb: 1
                          }}
                        >
                          {t('news:visualGallery', 'Visual Gallery')}
                        </Typography>
                        <Box width={60} height={4} bgcolor={config.colors.secondary} borderRadius={2} />
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
                                  boxShadow: `0 4px 20px ${config.colors.primary}1A`,
                                  border: '1px solid rgba(0,0,0,0.05)',
                                  '&:hover': { 
                                    transform: 'translateY(-8px) scale(1.02)',
                                    boxShadow: `0 20px 50px ${config.colors.primary}33`
                                  }
                                }}
                              />
                            </motion.div>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Videos */}
                  {news.videos && news.videos.length > 0 && (
                    <Box sx={{ mt: { xs: 6, md: 8 } }}>
                      <Box mb={4}>
                        <Typography 
                          variant="h4" 
                          fontWeight={800}
                          sx={{
                            color: config.colors.primary,
                            fontFamily: '"Poppins", sans-serif',
                            mb: 1
                          }}
                        >
                          {t('news:videoCoverage', 'Video Coverage')}
                        </Typography>
                        <Box width={60} height={4} bgcolor={config.colors.secondary} borderRadius={2} />
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

                  {/* Tags */}
                  {news.tags && news.tags.length > 0 && (
                    <Box 
                      sx={{ 
                        mt: { xs: 6, md: 8 }, 
                        pt: 4, 
                        borderTop: `1px solid ${config.colors.secondary}33`
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        fontWeight={700} 
                        mb={2}
                        sx={{
                          color: config.colors.primary,
                          fontFamily: '"Poppins", sans-serif',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          fontSize: '0.75rem'
                        }}
                      >
                        {t('news:relatedTopics', 'Related Topics')}
                      </Typography>
                      <Box display="flex" gap={1.5} flexWrap="wrap">
                        {news.tags.map((tag, idx) => (
                          <Chip
                            key={idx}
                            label={tag}
                            sx={{ 
                              bgcolor: `${config.colors.secondary}14`,
                              color: config.colors.primary,
                              fontFamily: '"Poppins", sans-serif',
                              fontWeight: 600,
                              border: `1px solid ${config.colors.secondary}33`,
                              transition: 'all 0.3s',
                              '&:hover': { 
                                bgcolor: `${config.colors.secondary}26`,
                                borderColor: config.colors.secondary,
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

          {/* Sidebar */}
          <Grid item xs={12} md={3.5}>
            <Box sx={{ position: 'sticky', top: 120 }}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Grid container spacing={3}>
                  {/* Article Info */}
                  <Grid item xs={12} md={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        bgcolor: `${config.colors.secondary}0A`,
                        border: `1px solid ${config.colors.secondary}33`,
                        height: '100%'
                      }}
                    >
                      <Typography 
                        variant="subtitle1" 
                        fontWeight={700} 
                        mb={3}
                        sx={{
                          color: config.colors.primary,
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        {t('news:articleInfo', 'Article Info')}
                      </Typography>
                      <Stack spacing={2}>
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
                              border: `1px solid ${config.colors.secondary}33`
                            }}
                          >
                            <CalendarToday sx={{ fontSize: 18, color: config.colors.secondary }} />
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif', display: 'block' }}>
                              {t('news:published', 'Published')}
                            </Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ color: config.colors.primary, fontFamily: '"Poppins", sans-serif' }}>
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
                              border: `1px solid ${config.colors.secondary}33`
                            }}
                          >
                            <AccessTime sx={{ fontSize: 18, color: config.colors.secondary }} />
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif', display: 'block' }}>
                              {t('news:readingTime', 'Reading Time')}
                            </Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ color: config.colors.primary, fontFamily: '"Poppins", sans-serif' }}>
                              {Math.ceil((news.contentBlocks?.length || 3) * 0.5)} min
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Related News */}
                  <Grid item xs={12} md={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        border: '1px solid #e0e0e0',
                        bgcolor: 'white',
                        height: '100%'
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        mb={3}
                        sx={{
                          color: config.colors.primary,
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        {t('news:relatedNews', 'Related News')}
                      </Typography>
                      {loadingRelated ? (
                        <Box display="flex" justifyContent="center" py={3}>
                          <CircularProgress size={30} sx={{ color: config.colors.secondary }} />
                        </Box>
                      ) : relatedNews.length === 0 ? (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#706f6f',
                            fontFamily: '"Poppins", sans-serif',
                            display: 'block',
                            textAlign: 'center',
                            py: 2
                          }}
                        >
                          {t('news:noRelatedArticles', 'No related articles found')}
                        </Typography>
                      ) : (
                        <Stack spacing={2}>
                          {relatedNews.map((item) => (
                            <Box
                              key={item._id}
                              onClick={() => {
                                navigate(`/explore/news/${item._id}`)
                                window.scrollTo(0, 0)
                              }}
                              sx={{
                                display: 'flex',
                                gap: 2,
                                p: 2,
                                borderRadius: 3,
                                border: '1px solid #e0e0e0',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                '&:hover': {
                                  bgcolor: '#fafafa',
                                  borderColor: `${config.colors.secondary}66`,
                                  transform: 'translateX(4px)'
                                }
                              }}
                            >
                              <Box
                                sx={{
                                  width: 80,
                                  height: 80,
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                  bgcolor: '#fafafa'
                                }}
                              >
                                <Box
                                  component="img"
                                  src={item.heroImage}
                                  alt={item.title}
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              </Box>
                              <Box flex={1}>
                                <Chip
                                  label={t(`news:category${item.category.charAt(0).toUpperCase() + item.category.slice(1)}`, item.category)}
                                  size="small"
                                  sx={{
                                    bgcolor: getCategoryColor(item.category, config),
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    height: 20,
                                    mb: 1,
                                    fontFamily: '"Poppins", sans-serif'
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  sx={{
                                    color: config.colors.primary,
                                    fontFamily: '"Poppins", sans-serif',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    lineHeight: 1.4,
                                    mb: 0.5
                                  }}
                                >
                                  {item.title}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#706f6f',
                                    fontFamily: '"Poppins", sans-serif',
                                    display: 'block'
                                  }}
                                >
                                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </motion.div>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Box sx={{ height: { xs: 60, md: 100 } }} />
    </Box>
  )
}

NewsDetails.propTypes = {
  config: PropTypes.object.isRequired
}

export default NewsDetails