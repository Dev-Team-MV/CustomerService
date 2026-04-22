// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/models/ModelCard.jsx

import { useState } from 'react'
import {
  Card, CardContent, CardMedia, Typography, Box, IconButton, Chip,
  Collapse, Button, Grid, Tooltip, Divider
} from '@mui/material'
import {
  Edit, Delete, ExpandMore, Add, Home, Bed, Bathtub, SquareFoot
} from '@mui/icons-material'
import { motion } from 'framer-motion'

const ModelCard = ({ model, index, facades, onEdit, onDelete, onOpenFacadeDialog, onDeleteFacade, theme }) => {
  const [expanded, setExpanded] = useState(false)

  const firstImage = Array.isArray(model.images?.exterior) 
    ? model.images.exterior[0]?.url || model.images.exterior[0]
    : null

  return (
    <Grid item xs={12} sm={6} md={4}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
      >
        <Card
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6
            }
          }}
        >
          <CardMedia
            component="div"
            sx={{
              height: 200,
              bgcolor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: firstImage ? `url(${firstImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!firstImage && (
              <Home sx={{ fontSize: 80, color: theme.palette.primary.main, opacity: 0.3 }} />
            )}
          </CardMedia>

          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
              <Box flex={1}>
                <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {model.model}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {model.modelNumber}
                </Typography>
              </Box>
              <Box display="flex" gap={0.5}>
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => onEdit(model)}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton size="small" onClick={() => onDelete(model)} color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box display="flex" gap={2} mb={2} flexWrap="wrap">
              {model.bedrooms && (
                <Chip
                  icon={<Bed />}
                  label={`${model.bedrooms} hab`}
                  size="small"
                  variant="outlined"
                />
              )}
              {model.bathrooms && (
                <Chip
                  icon={<Bathtub />}
                  label={`${model.bathrooms} baños`}
                  size="small"
                  variant="outlined"
                />
              )}
              {model.sqft && (
                <Chip
                  icon={<SquareFoot />}
                  label={`${model.sqft} ft²`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>

            <Typography variant="h6" fontWeight={700} color="primary" mb={2}>
              ${model.price?.toLocaleString() || 0}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight={600}>
                Fachadas ({facades.length})
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => onOpenFacadeDialog(model)}
                  sx={{ textTransform: 'none' }}
                >
                  Agregar
                </Button>
                <IconButton
                  size="small"
                  onClick={() => setExpanded(!expanded)}
                  sx={{
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s'
                  }}
                >
                  <ExpandMore />
                </IconButton>
              </Box>
            </Box>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 2 }}>
                {facades.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    No hay fachadas creadas
                  </Typography>
                ) : (
                  <Box display="flex" flexDirection="column" gap={1}>
                    {facades.map((facade) => (
                      <Box
                        key={facade._id}
                        sx={{
                          p: 2,
                          bgcolor: '#f5f5f5',
                          borderRadius: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {facade.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ${facade.price?.toLocaleString() || 0}
                          </Typography>
                        </Box>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => onOpenFacadeDialog(model, facade)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton size="small" onClick={() => onDeleteFacade(facade)} color="error">
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  )
}

export default ModelCard