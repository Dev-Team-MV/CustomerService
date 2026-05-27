import { Box, Card, CardContent, Typography, Grid } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Home, Map, Construction } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const UploadsCategorySelector = ({ onSelectCategory }) => {
  const { t } = useTranslation('uploads')
  const theme = useTheme()

  const categories = [
    {
      id: 'clubhouse',
      title: t('categories.clubhouse.title', 'ClubHouse'),
      description: t('categories.clubhouse.description', 'Interior, Exterior, Planos, Deck y Timeline'),
      icon: Home,
      color: theme.palette.primary.main,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'masterplan',
      title: t('categories.masterplan.title', 'MasterPlan'),
      description: t('categories.masterplan.description', 'Plano Maestro, Recorrido, Amenidades y Eagle View'),
      icon: Map,
      color: theme.palette.secondary.main,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 'construction',
      title: t('categories.construction.title', 'Fases de Construcción'),
      description: t('categories.construction.description', 'Gestión de media por propiedad y fase'),
      icon: Construction,
      color: theme.palette.warning.main,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ]

  return (
    <Grid container spacing={3}>
      {categories.map((category, index) => {
        const Icon = category.icon
        return (
          <Grid item xs={12} md={4} key={category.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                onClick={() => onSelectCategory(category.id)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: `0 8px 24px ${category.color}40`,
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                {/* Gradient Header */}
                <Box
                  sx={{
                    background: category.gradient,
                    height: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: 64,
                      color: 'white',
                      opacity: 0.9,
                      zIndex: 1
                    }}
                  />
                  {/* Decorative circles */}
                  <Box
                    sx={{
                      position: 'absolute',
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      top: -100,
                      right: -100
                    }}
                  />
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 700,
                      mb: 1,
                      color: theme.palette.text.primary
                    }}
                  >
                    {category.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      color: theme.palette.text.secondary,
                      lineHeight: 1.6
                    }}
                  >
                    {category.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )
      })}
    </Grid>
  )
}

export default UploadsCategorySelector