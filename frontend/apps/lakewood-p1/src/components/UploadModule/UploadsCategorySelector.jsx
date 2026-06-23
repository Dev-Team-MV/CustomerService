import { Box, Typography, Grid, Divider } from '@mui/material'
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
    },
    {
      id: 'masterplan',
      title: t('categories.masterplan.title', 'MasterPlan'),
      description: t('categories.masterplan.description', 'Plano Maestro, Recorrido, Amenidades y Eagle View'),
      icon: Map,
      color: theme.palette.secondary.main,
    },
    {
      id: 'construction',
      title: t('categories.construction.title', 'Fases de Construcción'),
      description: t('categories.construction.description', 'Gestión de media por propiedad y fase'),
      icon: Construction,
      color: theme.palette.warning.main,
    }
  ]

  return (
    <Grid container spacing={2.5}>
      {categories.map((category, index) => {
        const Icon = category.icon
        return (
          <Grid item xs={12} md={4} key={category.id}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Box
                onClick={() => onSelectCategory(category.id)}
                sx={{
                  bgcolor: 'white',
                  borderRadius: '20px',
                  border: `1px solid #e5e7eb`,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                  '&:hover': {
                    border: `1px solid ${category.color}`,
                    boxShadow: `0 8px 28px ${category.color}15`,
                    transform: 'translateY(-4px)',
                  }
                }}
              >
                {/* ── Header: número + icono ── */}
                <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    {/* Número grande */}
                    <Typography
                      sx={{
                        fontSize: { xs: '3.5rem', md: '4.5rem' },
                        fontWeight: 300,
                        color: category.color,
                        fontFamily: '"DM Sans", sans-serif',
                        lineHeight: 0.88,
                        letterSpacing: '-3px',
                      }}
                    >
                      0{index + 1}
                    </Typography>

                    {/* Icono */}
                    <Icon 
                      sx={{ 
                        fontSize: 36, 
                        color: category.color, 
                        opacity: 0.85 
                      }} 
                    />
                  </Box>
                </Box>

                {/* ── Divider ── */}
                <Divider sx={{ borderColor: '#e5e7eb', mx: 2.5 }} />

                {/* ── Content ── */}
                <Box sx={{ px: 2.5, pt: 1.5, pb: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: category.color,
                      fontFamily: '"DM Sans", sans-serif',
                      mb: 0.5,
                      lineHeight: 1.2,
                    }}
                  >
                    {category.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.82rem',
                      color: '#706f6f',
                      fontFamily: '"DM Sans", sans-serif',
                      lineHeight: 1.6
                    }}
                  >
                    {category.description}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        )
      })}
    </Grid>
  )
}

export default UploadsCategorySelector