// import React from 'react';
// import {
//   Box,
//   Container,
//   Typography,
//   Chip,
//   Avatar,
//   IconButton,
//   Divider,
//   Grid,
//   Paper,
//   Button
// } from '@mui/material';
// import {
//   ArrowBack,
//   CalendarToday,
//   Visibility,
//   Person,
//   Share,
//   Bookmark,
//   BookmarkBorder
// } from '@mui/icons-material';
// import { motion } from 'framer-motion';
// import { useNavigate, useParams } from 'react-router-dom';

// // ✅ DATA QUEMADA TEMPORAL
// const mockNewsDetail = {
//   id: 1,
//   title: 'Club House Construction Begins',
//   description: 'Today we officially started the construction of our new club house facility with state-of-the-art amenities.',
//   category: 'construction',
//   status: 'published',
//   author: {
//     name: 'John Admin',
//     avatar: 'https://i.pravatar.cc/150?img=12',
//     role: 'Project Manager'
//   },
//   date: '2026-02-10T10:30:00',
//   views: 245,
//   readTime: '5 min read',
  
//   // ✅ Contenido completo
//   content: `
//     <h2>Major Milestone Achieved</h2>
//     <p>We are thrilled to announce that construction has officially begun on our brand-new club house facility. This state-of-the-art building will serve as the heart of our community, providing residents with premium amenities and gathering spaces.</p>
    
//     <h3>What's Included</h3>
//     <p>The new club house will feature:</p>
//     <ul>
//       <li><strong>Fitness Center:</strong> Fully equipped with modern exercise equipment</li>
//       <li><strong>Swimming Pool:</strong> Olympic-sized pool with dedicated lap lanes</li>
//       <li><strong>Event Spaces:</strong> Multiple rooms for community gatherings and private events</li>
//       <li><strong>Lounge Areas:</strong> Comfortable spaces for relaxation and socializing</li>
//       <li><strong>Children's Play Area:</strong> Safe and fun environment for kids</li>
//     </ul>
    
//     <h3>Construction Timeline</h3>
//     <p>The project is expected to be completed in <strong>12 months</strong>, with the following phases:</p>
//     <ol>
//       <li>Foundation and structural work (Months 1-3)</li>
//       <li>Building construction (Months 4-8)</li>
//       <li>Interior finishing and amenities installation (Months 9-11)</li>
//       <li>Final inspections and grand opening (Month 12)</li>
//     </ol>
    
//     <h3>Community Impact</h3>
//     <p>This facility represents our commitment to creating a vibrant, connected community. Residents will have access to world-class amenities that promote health, wellness, and social connection.</p>
    
//     <blockquote>
//       "We're building more than just a club house – we're creating the foundation for lasting memories and friendships within our community."
//       <br/><em>- Development Team</em>
//     </blockquote>
    
//     <p>Stay tuned for regular updates as construction progresses. We'll be sharing photos, videos, and milestone celebrations throughout the build process.</p>
//   `,
  
//   // ✅ Galería de imágenes
//   images: [
//     'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
//     'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
//     'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
//     'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800'
//   ],
  
//   // ✅ Videos
//   videos: [
//     {
//       url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
//       thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400',
//       title: 'Construction Progress - Week 1'
//     }
//   ],
  
//   tags: ['Construction', 'Club House', 'Amenities', 'Community']
// };

// const NewsDetail = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const [bookmarked, setBookmarked] = React.useState(false);
  
//   // ✅ En producción, aquí harías fetch del newsId
//   const news = mockNewsDetail;

//   const getCategoryColor = (category) => {
//     switch (category) {
//       case 'construction': return '#f59e0b';
//       case 'announcement': return '#3b82f6';
//       case 'report': return '#8b5cf6';
//       default: return '#6c757d';
//     }
//   };

//   const handleShare = () => {
//     if (navigator.share) {
//       navigator.share({
//         title: news.title,
//         text: news.description,
//         url: window.location.href
//       });
//     } else {
//       navigator.clipboard.writeText(window.location.href);
//       alert('Link copied to clipboard!');
//     }
//   };

//   return (
//     <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
//       <Container maxWidth="lg">
//         {/* ✅ HEADER - Back Button */}
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.4 }}
//         >
//           <Button
//             startIcon={<ArrowBack />}
//             onClick={() => navigate('/explore/news')} // ✅ Cambiar de -1 a ruta específica
//             sx={{
//               mb: 3,
//               color: '#6c757d',
//               textTransform: 'none',
//               fontWeight: 600,
//               '&:hover': { bgcolor: 'transparent', color: '#2c3e50' }
//             }}
//           >
//             Back to News
//           </Button>
//         </motion.div>

//         {/* ✅ MAIN CONTENT */}
//         <Grid container spacing={4}>
//           {/* LEFT COLUMN - Article */}
//           <Grid item xs={12} md={8}>
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//             >
//               <Paper
//                 elevation={0}
//                 sx={{
//                   borderRadius: 4,
//                   overflow: 'hidden',
//                   boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
//                   border: '1px solid rgba(0,0,0,0.06)'
//                 }}
//               >
//                 {/* HERO IMAGE */}
//                 <Box
//                   sx={{
//                     width: '100%',
//                     height: { xs: 250, md: 400 },
//                     backgroundImage: `url(${news.images[0]})`,
//                     backgroundSize: 'cover',
//                     backgroundPosition: 'center',
//                     position: 'relative'
//                   }}
//                 >
//                   {/* Category Badge */}
//                   <Chip
//                     label={news.category}
//                     sx={{
//                       position: 'absolute',
//                       top: 20,
//                       left: 20,
//                       bgcolor: getCategoryColor(news.category),
//                       color: 'white',
//                       fontWeight: 700,
//                       textTransform: 'uppercase',
//                       fontSize: '0.75rem',
//                       boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
//                     }}
//                   />
//                 </Box>

//                 {/* ARTICLE CONTENT */}
//                 <Box sx={{ p: { xs: 3, md: 5 } }}>
//                   {/* Title */}
//                   <Typography
//                     variant="h3"
//                     fontWeight={800}
//                     sx={{
//                       color: '#2c3e50',
//                       mb: 2,
//                       fontSize: { xs: '1.8rem', md: '2.5rem' },
//                       lineHeight: 1.2
//                     }}
//                   >
//                     {news.title}
//                   </Typography>

//                   {/* Meta Info */}
//                   <Box
//                     display="flex"
//                     alignItems="center"
//                     gap={3}
//                     flexWrap="wrap"
//                     mb={3}
//                     pb={3}
//                     borderBottom="1px solid #dee2e6"
//                   >
//                     <Box display="flex" alignItems="center" gap={1}>
//                       <Avatar
//                         src={news.author.avatar}
//                         sx={{ width: 40, height: 40 }}
//                       />
//                       <Box>
//                         <Typography variant="body2" fontWeight={600}>
//                           {news.author.name}
//                         </Typography>
//                         <Typography variant="caption" color="text.secondary">
//                           {news.author.role}
//                         </Typography>
//                       </Box>
//                     </Box>

//                     <Box display="flex" alignItems="center" gap={0.5} color="#6c757d">
//                       <CalendarToday sx={{ fontSize: 16 }} />
//                       <Typography variant="body2">
//                         {new Date(news.date).toLocaleDateString('en-US', {
//                           month: 'long',
//                           day: 'numeric',
//                           year: 'numeric'
//                         })}
//                       </Typography>
//                     </Box>

//                     <Box display="flex" alignItems="center" gap={0.5} color="#6c757d">
//                       <Visibility sx={{ fontSize: 16 }} />
//                       <Typography variant="body2">{news.views} views</Typography>
//                     </Box>

//                     <Chip
//                       label={news.readTime}
//                       size="small"
//                       sx={{
//                         bgcolor: '#e3f2fd',
//                         color: '#2196f3',
//                         fontWeight: 600
//                       }}
//                     />
//                   </Box>

//                   {/* Description */}
//                   <Typography
//                     variant="h6"
//                     sx={{
//                       color: '#6c757d',
//                       fontWeight: 400,
//                       mb: 4,
//                       lineHeight: 1.6,
//                       fontStyle: 'italic'
//                     }}
//                   >
//                     {news.description}
//                   </Typography>

//                   {/* Full Content */}
//                   <Box
//                     sx={{
//                       '& h2': {
//                         color: '#2c3e50',
//                         fontWeight: 700,
//                         fontSize: '1.8rem',
//                         mt: 4,
//                         mb: 2
//                       },
//                       '& h3': {
//                         color: '#2c3e50',
//                         fontWeight: 600,
//                         fontSize: '1.4rem',
//                         mt: 3,
//                         mb: 2
//                       },
//                       '& p': {
//                         color: '#495057',
//                         fontSize: '1.05rem',
//                         lineHeight: 1.8,
//                         mb: 2
//                       },
//                       '& ul, & ol': {
//                         color: '#495057',
//                         fontSize: '1.05rem',
//                         lineHeight: 1.8,
//                         mb: 2,
//                         pl: 3
//                       },
//                       '& li': {
//                         mb: 1
//                       },
//                       '& strong': {
//                         color: '#2c3e50',
//                         fontWeight: 600
//                       },
//                       '& blockquote': {
//                         borderLeft: '4px solid #f59e0b',
//                         bgcolor: '#fffbf0',
//                         p: 3,
//                         my: 3,
//                         borderRadius: 2,
//                         fontStyle: 'italic',
//                         color: '#6c757d'
//                       }
//                     }}
//                     dangerouslySetInnerHTML={{ __html: news.content }}
//                   />

//                   {/* Image Gallery */}
//                   {news.images.length > 1 && (
//                     <Box sx={{ mt: 5 }}>
//                       <Typography variant="h5" fontWeight={700} mb={3}>
//                         Photo Gallery
//                       </Typography>
//                       <Grid container spacing={2}>
//                         {news.images.slice(1).map((image, idx) => (
//                           <Grid item xs={12} sm={6} key={idx}>
//                             <Box
//                               component="img"
//                               src={image}
//                               alt={`Gallery ${idx + 1}`}
//                               sx={{
//                                 width: '100%',
//                                 height: 250,
//                                 objectFit: 'cover',
//                                 borderRadius: 3,
//                                 cursor: 'pointer',
//                                 transition: 'transform 0.3s',
//                                 '&:hover': { transform: 'scale(1.05)' }
//                               }}
//                             />
//                           </Grid>
//                         ))}
//                       </Grid>
//                     </Box>
//                   )}

//                   {/* Videos */}
//                   {news.videos.length > 0 && (
//                     <Box sx={{ mt: 5 }}>
//                       <Typography variant="h5" fontWeight={700} mb={3}>
//                         Videos
//                       </Typography>
//                       {news.videos.map((video, idx) => (
//                         <Box
//                           key={idx}
//                           sx={{
//                             position: 'relative',
//                             paddingBottom: '56.25%',
//                             height: 0,
//                             overflow: 'hidden',
//                             borderRadius: 3,
//                             mb: 2
//                           }}
//                         >
//                           <iframe
//                             src={video.url}
//                             title={video.title}
//                             frameBorder="0"
//                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                             allowFullScreen
//                             style={{
//                               position: 'absolute',
//                               top: 0,
//                               left: 0,
//                               width: '100%',
//                               height: '100%'
//                             }}
//                           />
//                         </Box>
//                       ))}
//                     </Box>
//                   )}

//                   {/* Tags */}
//                   <Box sx={{ mt: 5, pt: 4, borderTop: '1px solid #dee2e6' }}>
//                     <Typography variant="body2" fontWeight={600} mb={2}>
//                       Tags:
//                     </Typography>
//                     <Box display="flex" gap={1} flexWrap="wrap">
//                       {news.tags.map((tag, idx) => (
//                         <Chip
//                           key={idx}
//                           label={tag}
//                           size="small"
//                           sx={{
//                             bgcolor: '#f8f9fa',
//                             '&:hover': { bgcolor: '#e9ecef' }
//                           }}
//                         />
//                       ))}
//                     </Box>
//                   </Box>
//                 </Box>
//               </Paper>
//             </motion.div>
//           </Grid>

//           {/* RIGHT COLUMN - Sidebar */}
//           <Grid item xs={12} md={4}>
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//             >
//               {/* Actions Card */}
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: 3,
//                   borderRadius: 4,
//                   mb: 3,
//                   boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
//                   border: '1px solid rgba(0,0,0,0.06)',
//                   position: 'sticky',
//                   top: 20
//                 }}
//               >
//                 <Typography variant="h6" fontWeight={700} mb={2}>
//                   Actions
//                 </Typography>

//                 <Button
//                   fullWidth
//                   variant="outlined"
//                   startIcon={bookmarked ? <Bookmark /> : <BookmarkBorder />}
//                   onClick={() => setBookmarked(!bookmarked)}
//                   sx={{
//                     mb: 2,
//                     borderRadius: 3,
//                     textTransform: 'none',
//                     fontWeight: 600,
//                     py: 1.5,
//                     borderColor: bookmarked ? '#f59e0b' : '#dee2e6',
//                     color: bookmarked ? '#f59e0b' : '#6c757d',
//                     '&:hover': {
//                       borderColor: '#f59e0b',
//                       bgcolor: '#fffbf0'
//                     }
//                   }}
//                 >
//                   {bookmarked ? 'Saved' : 'Save for Later'}
//                 </Button>

//                 <Button
//                   fullWidth
//                   variant="outlined"
//                   startIcon={<Share />}
//                   onClick={handleShare}
//                   sx={{
//                     borderRadius: 3,
//                     textTransform: 'none',
//                     fontWeight: 600,
//                     py: 1.5,
//                     borderColor: '#dee2e6',
//                     color: '#6c757d',
//                     '&:hover': {
//                       borderColor: '#3b82f6',
//                       color: '#3b82f6',
//                       bgcolor: '#f0f7ff'
//                     }
//                   }}
//                 >
//                   Share Article
//                 </Button>

//                 <Divider sx={{ my: 3 }} />

//                 <Box>
//                   <Typography variant="body2" fontWeight={600} mb={2}>
//                     Published by
//                   </Typography>
//                   <Box display="flex" alignItems="center" gap={2}>
//                     <Avatar
//                       src={news.author.avatar}
//                       sx={{ width: 48, height: 48 }}
//                     />
//                     <Box>
//                       <Typography variant="body2" fontWeight={600}>
//                         {news.author.name}
//                       </Typography>
//                       <Typography variant="caption" color="text.secondary">
//                         {news.author.role}
//                       </Typography>
//                     </Box>
//                   </Box>
//                 </Box>
//               </Paper>

//               {/* Stats Card */}
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: 3,
//                   borderRadius: 4,
//                   boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
//                   border: '1px solid rgba(0,0,0,0.06)'
//                 }}
//               >
//                 <Typography variant="h6" fontWeight={700} mb={3}>
//                   Article Stats
//                 </Typography>

//                 <Box display="flex" flexDirection="column" gap={2}>
//                   <Box display="flex" justifyContent="space-between">
//                     <Typography variant="body2" color="text.secondary">
//                       Views
//                     </Typography>
//                     <Typography variant="body2" fontWeight={600}>
//                       {news.views}
//                     </Typography>
//                   </Box>

//                   <Box display="flex" justifyContent="space-between">
//                     <Typography variant="body2" color="text.secondary">
//                       Reading Time
//                     </Typography>
//                     <Typography variant="body2" fontWeight={600}>
//                       {news.readTime}
//                     </Typography>
//                   </Box>

//                   <Box display="flex" justifyContent="space-between">
//                     <Typography variant="body2" color="text.secondary">
//                       Photos
//                     </Typography>
//                     <Typography variant="body2" fontWeight={600}>
//                       {news.images.length}
//                     </Typography>
//                   </Box>

//                   <Box display="flex" justifyContent="space-between">
//                     <Typography variant="body2" color="text.secondary">
//                       Videos
//                     </Typography>
//                     <Typography variant="body2" fontWeight={600}>
//                       {news.videos.length}
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Paper>
//             </motion.div>
//           </Grid>
//         </Grid>
//       </Container>
//     </Box>
//   );
// };

// export default NewsDetail;

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Avatar,
  Divider,
  Grid,
  Paper,
  Button,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  Visibility,
  Share,
  Bookmark,
  BookmarkBorder,
  TrendingUp,
  AccessTime
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';

// ✅ DATA QUEMADA TEMPORAL
const mockNewsDetail = {
  id: 1,
  title: 'Club House Construction Begins',
  description: 'Today we officially started the construction of our new club house facility with state-of-the-art amenities.',
  category: 'construction',
  status: 'published',
  author: {
    name: 'John Admin',
    avatar: 'https://i.pravatar.cc/150?img=12',
    role: 'Project Manager'
  },
  date: '2026-02-10T10:30:00',
  views: 245,
  readTime: '5 min read',
  
  // ✅ Contenido completo usando contentBlocks
  contentBlocks: [
    {
      type: 'heading',
      level: 2,
      text: 'Major Milestone Achieved'
    },
    {
      type: 'paragraph',
      text: 'We are thrilled to announce that construction has officially begun on our brand-new club house facility. This state-of-the-art building will serve as the heart of our community, providing residents with premium amenities and gathering spaces.'
    },
    {
      type: 'heading',
      level: 3,
      text: "What's Included"
    },
    {
      type: 'paragraph',
      text: 'The new club house will feature:'
    },
    {
      type: 'list',
      items: [
        '<strong>Fitness Center:</strong> Fully equipped with modern exercise equipment',
        '<strong>Swimming Pool:</strong> Olympic-sized pool with dedicated lap lanes',
        '<strong>Event Spaces:</strong> Multiple rooms for community gatherings and private events',
        '<strong>Lounge Areas:</strong> Comfortable spaces for relaxation and socializing',
        "<strong>Children's Play Area:</strong> Safe and fun environment for kids"
      ]
    },
    {
      type: 'heading',
      level: 3,
      text: 'Construction Timeline'
    },
    {
      type: 'paragraph',
      text: 'The project is expected to be completed in <strong>12 months</strong>, with the following phases:'
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'Foundation and structural work (Months 1-3)',
        'Building construction (Months 4-8)',
        'Interior finishing and amenities installation (Months 9-11)',
        'Final inspections and grand opening (Month 12)'
      ]
    },
    {
      type: 'quote',
      text: "We're building more than just a club house – we're creating the foundation for lasting memories and friendships within our community.",
      author: 'Development Team'
    }
  ],
  
  images: [
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800'
  ],
  
  videos: [
    {
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400',
      title: 'Construction Progress - Week 1'
    }
  ],
  
  tags: ['Construction', 'Club House', 'Amenities', 'Community'],
  
  // ✅ Related news
  relatedNews: [
    {
      id: 2,
      title: 'New Amenities Preview',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
      category: 'announcement',
      date: '2026-02-05'
    },
    {
      id: 3,
      title: 'Community Survey Results',
      image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400',
      category: 'report',
      date: '2026-01-28'
    }
  ]
};

const NewsDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [bookmarked, setBookmarked] = React.useState(false);
  
  const news = mockNewsDetail;

  const getCategoryColor = (category) => {
    switch (category) {
      case 'construction': return '#f59e0b';
      case 'announcement': return '#3b82f6';
      case 'report': return '#8b5cf6';
      default: return '#6c757d';
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

  // ✅ Renderizar bloques de contenido dinámicamente
  const renderContentBlock = (block, index) => {
    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level}`;
        return (
          <Typography
            key={index}
            component={HeadingTag}
            sx={{
              color: '#2c3e50',
              fontWeight: block.level === 2 ? 700 : 600,
              fontSize: block.level === 2 ? '1.8rem' : '1.4rem',
              mt: 4,
              mb: 2
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
              fontSize: '1.05rem',
              lineHeight: 1.8,
              mb: 2
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
              fontSize: '1.05rem',
              lineHeight: 1.8,
              mb: 2,
              pl: 3
            }}
          >
            {block.items.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: item }} style={{ marginBottom: '8px' }} />
            ))}
          </Box>
        );
      
      case 'quote':
        return (
          <Box
            key={index}
            sx={{
              borderLeft: '4px solid #f59e0b',
              bgcolor: '#fffbf0',
              p: 3,
              my: 3,
              borderRadius: 2,
              fontStyle: 'italic',
              color: '#6c757d'
            }}
          >
            <Typography sx={{ mb: 1 }}>"{block.text}"</Typography>
            {block.author && (
              <Typography variant="caption" sx={{ color: '#999' }}>
                — {block.author}
              </Typography>
            )}
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/explore/news')}
            sx={{
              mb: 3,
              color: '#6c757d',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: 'transparent', color: '#2c3e50' }
            }}
          >
            Back to News
          </Button>
        </motion.div>

        <Grid container spacing={4}>
          {/* ✅ LEFT COLUMN - Más ancho */}
          <Grid item xs={12} md={9}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(0,0,0,0.06)'
                }}
              >
                {/* HERO IMAGE */}
                <Box
                  sx={{
                    width: '100%',
                    height: { xs: 250, md: 450 },
                    backgroundImage: `url(${news.images[0]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                >
                  <Chip
                    label={news.category}
                    sx={{
                      position: 'absolute',
                      top: 20,
                      left: 20,
                      bgcolor: getCategoryColor(news.category),
                      color: 'white',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                  />
                </Box>

                {/* ARTICLE CONTENT */}
                <Box sx={{ p: { xs: 3, md: 5 } }}>
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{
                      color: '#2c3e50',
                      mb: 2,
                      fontSize: { xs: '1.8rem', md: '2.5rem' },
                      lineHeight: 1.2
                    }}
                  >
                    {news.title}
                  </Typography>

                  {/* Meta Info */}
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={3}
                    flexWrap="wrap"
                    mb={3}
                    pb={3}
                    borderBottom="1px solid #dee2e6"
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar src={news.author.avatar} sx={{ width: 40, height: 40 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {news.author.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {news.author.role}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={0.5} color="#6c757d">
                      <CalendarToday sx={{ fontSize: 16 }} />
                      <Typography variant="body2">
                        {new Date(news.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={0.5} color="#6c757d">
                      <Visibility sx={{ fontSize: 16 }} />
                      <Typography variant="body2">{news.views} views</Typography>
                    </Box>

                    <Chip
                      label={news.readTime}
                      size="small"
                      icon={<AccessTime sx={{ fontSize: 14 }} />}
                      sx={{ bgcolor: '#e3f2fd', color: '#2196f3', fontWeight: 600 }}
                    />
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      color: '#6c757d',
                      fontWeight: 400,
                      mb: 4,
                      lineHeight: 1.6,
                      fontStyle: 'italic'
                    }}
                  >
                    {news.description}
                  </Typography>

                  {/* ✅ Renderizar bloques dinámicamente */}
                  <Box>{news.contentBlocks.map((block, idx) => renderContentBlock(block, idx))}</Box>

                  {/* Image Gallery */}
                  {news.images.length > 1 && (
                    <Box sx={{ mt: 5 }}>
                      <Typography variant="h5" fontWeight={700} mb={3}>
                        Photo Gallery
                      </Typography>
                      <Grid container spacing={2}>
                        {news.images.slice(1).map((image, idx) => (
                          <Grid item xs={12} sm={6} md={4} key={idx}>
                            <Box
                              component="img"
                              src={image}
                              alt={`Gallery ${idx + 1}`}
                              sx={{
                                width: '100%',
                                height: 200,
                                objectFit: 'cover',
                                borderRadius: 3,
                                cursor: 'pointer',
                                transition: 'transform 0.3s',
                                '&:hover': { transform: 'scale(1.05)' }
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Tags */}
                  <Box sx={{ mt: 5, pt: 4, borderTop: '1px solid #dee2e6' }}>
                    <Typography variant="body2" fontWeight={600} mb={2}>
                      Tags:
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {news.tags.map((tag, idx) => (
                        <Chip
                          key={idx}
                          label={tag}
                          size="small"
                          sx={{ bgcolor: '#f8f9fa', '&:hover': { bgcolor: '#e9ecef' } }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          {/* ✅ RIGHT COLUMN - Más compacto y útil */}
          <Grid item xs={12} md={3}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Quick Actions */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    mb: 3,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    Quick Actions
                  </Typography>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={bookmarked ? <Bookmark /> : <BookmarkBorder />}
                    onClick={() => setBookmarked(!bookmarked)}
                    sx={{
                      mb: 1.5,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1,
                      borderColor: bookmarked ? '#f59e0b' : '#dee2e6',
                      color: bookmarked ? '#f59e0b' : '#6c757d',
                      '&:hover': { borderColor: '#f59e0b', bgcolor: '#fffbf0' }
                    }}
                  >
                    {bookmarked ? 'Saved' : 'Save'}
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Share />}
                    onClick={handleShare}
                    sx={{
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1,
                      borderColor: '#dee2e6',
                      color: '#6c757d',
                      '&:hover': { borderColor: '#3b82f6', color: '#3b82f6', bgcolor: '#f0f7ff' }
                    }}
                  >
                    Share
                  </Button>
                </Paper>

                {/* Article Stats */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    mb: 3,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    Article Stats
                  </Typography>

                  <Box display="flex" flexDirection="column" gap={1.5}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Visibility sx={{ fontSize: 16, color: '#6c757d' }} />
                        <Typography variant="body2" color="text.secondary">
                          Views
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={700}>
                        {news.views}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AccessTime sx={{ fontSize: 16, color: '#6c757d' }} />
                        <Typography variant="body2" color="text.secondary">
                          Read Time
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={700}>
                        {news.readTime}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Related News */}
                {news.relatedNews && news.relatedNews.length > 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 4,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(0,0,0,0.06)'
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700} mb={2}>
                      Related News
                    </Typography>

                    {news.relatedNews.map((related) => (
                      <Card
                        key={related.id}
                        onClick={() => navigate(`/explore/news/${related.id}`)}
                        sx={{
                          mb: 1.5,
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
                        }}
                      >
                        <Box display="flex" gap={1.5} p={1.5}>
                          <Box
                            component="img"
                            src={related.image}
                            sx={{
                              width: 60,
                              height: 60,
                              objectFit: 'cover',
                              borderRadius: 2
                            }}
                          />
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                              {related.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(related.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    ))}
                  </Paper>
                )}
              </motion.div>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default NewsDetail;