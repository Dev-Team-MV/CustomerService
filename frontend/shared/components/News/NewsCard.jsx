// @shared/components/News/NewsCard.jsx
import React from 'react'
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box
} from '@mui/material'
import { CalendarToday, VideoLibrary } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import { getCategoryColor } from '../../config/newsConfig'

const NewsCard = ({ newsItem, config, onClick, index = 0 }) => {
  const { t } = useTranslation([config.i18n.namespace, 'common'])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      style={{ height: '100%' }}
    >
      <Card
        onClick={onClick}
        sx={{
          height: '100%',
          borderRadius: 4,
          overflow: 'hidden',
          cursor: 'pointer',
          border: '1px solid #e0e0e0',
          boxShadow: `0 4px 20px ${config.colors.primary}14`,
          transition: 'all 0.3s',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 12px 40px ${config.colors.primary}26`,
            borderColor: `${config.colors.secondary}66`
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
            label={t(`news:category${newsItem.category.charAt(0).toUpperCase() + newsItem.category.slice(1)}`, newsItem.category)}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: getCategoryColor(newsItem.category, config),
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
              label={t('news:video', 'Video')}
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                bgcolor: `${config.colors.accent}F0`,
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
                color: config.colors.primary,
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
                label={new Date(newsItem.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
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
  )
}

NewsCard.propTypes = {
  newsItem: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  index: PropTypes.number
}

export default NewsCard