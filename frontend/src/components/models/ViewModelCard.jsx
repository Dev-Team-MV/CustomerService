import React from "react"
import { Card, CardContent, Box, Typography, Chip, Button, Checkbox } from "@mui/material"
import { useMotionValue, useTransform, motion } from "framer-motion"

const modelImages = {} // Puedes importar o definir tu objeto de imágenes aquí

function ViewModelCard({ model, onGoDetail, selected, onSelect, imgSrc }) {

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [15, -15])
  const rotateY = useTransform(x, [-100, 100], [-15, 15])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(e.clientX - centerX)
    y.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div whileHover={{ scale: 1.04 }}>
      <Card
        sx={{
          borderRadius: 6,
          boxShadow: '0 12px 32px rgba(74,124,89,0.12)',
          border: '1.5px solid #e8f5ee',
          overflow: 'visible',
          height: '100%',
          minHeight: { xs: 420, sm: 480, md: 460 },
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'box-shadow 0.3s, border 0.3s',
          '&:hover': {
            boxShadow: '0 24px 48px rgba(74,124,89,0.18)',
            border: '2px solid #4a7c59',
          },
        }}
      >
        <Checkbox
          checked={selected}
          onClick={e => { e.stopPropagation(); onSelect(model._id); }}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 3,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 2,
            '&:hover': {
              boxShadow: '0 24px 48px rgba(74,124,89,0.18)',
              border: '2px solid #4a7c59',
              bgcolor: 'white',
            },
          }}
        />

        <Box

          sx={{
            position: 'absolute',
            top: { xs: '-115px', sm: '-140px', md: '-12pc' },
            left: '50%',
            transform: 'translateX(-50%)',
            width: '85%',
            height: { xs: 200, sm: 250, md: 300 },
            zIndex: 2,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <motion.img
            src={imgSrc}
            alt={model.model}
            style={{
              width: '90%',
              height: '90%',
              objectFit: 'cover',
              rotateX,
              rotateY,
              transition: 'transform 0.1s ease-out',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        </Box>

        <CardContent
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 2, sm: 3, md: 3.5 },
            mt: { xs: 8, sm: 10, md: 13 },
            background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
            borderRadius: 6,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Poppins", sans-serif',
              color: '#1a1a1a',
              fontWeight: 600,
              mb: 0.5,
              fontSize: { xs: '1.5rem', sm: '1.7rem', md: '1.9rem' },
              letterSpacing: '1px',
              textAlign: 'center',
              textTransform: 'uppercase'
            }}
          >
            {model.model}
          </Typography>

          <Box
            sx={{
              width: 60,
              height: 2,
              bgcolor: '#8CA551',
              mx: 'auto',
              mb: 2,
              opacity: 0.8
            }}
          />

          <Typography
            variant="h6"
            sx={{
              color: '#2c5530',
              fontWeight: 500,
              mb: 3,
              fontSize: { xs: '1.15rem', sm: '1.25rem', md: '1.35rem' },
              textAlign: 'center',
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: '0.5px'
            }} >
            ${model.price ? `${model.price.toLocaleString()}` : 'Consult'}
          </Typography>

          <Box sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            mb: 3,
            justifyContent: 'center',
            minHeight: 56,
            alignContent: 'flex-start'
          }}>
            {model.modelNumber === "10" ? (
              <>
                <Chip
                  label="Dining Room"
                  size="small"
                  sx={{
                    bgcolor: 'transparent',
                    border: '1.5px solid #E5863C ',
                    color: '#8b6f47',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 28,
                    px: 1.5,
                    fontFamily: '"Poppins", sans-serif',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    '&:hover': {
                      bgcolor: 'rgba(212, 165, 116, 0.08)'
                    }
                  }}
                />
                <Chip
                  label="Study"
                  size="small"
                  sx={{
                    bgcolor: 'transparent',
                    border: '1.5px solid #706f6f',
                    color: '#4a5d6f',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 28,
                    px: 1.5,
                    fontFamily: '"Poppins", sans-serif',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    '&:hover': {
                      bgcolor: 'rgba(123, 140, 158, 0.08)'
                    }
                  }}
                />
                {model.storages && model.storages.length > 0 && (
                  <Chip
                    label="Storage"
                    size="small"
                    sx={{
                      bgcolor: 'transparent',
                      border: '1.5px solid #706f6f',
                      color: '#5a5a5a',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 28,
                      px: 1.5,
                      fontFamily: '"Poppins", sans-serif',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      '&:hover': {
                        bgcolor: 'rgba(158, 158, 158, 0.08)'
                      }
                    }}
                  />
                )}
                {model.upgrades && model.upgrades.length > 0 && (
                  <Chip
                    label="Upgrades"
                    size="small"
                    sx={{
                      bgcolor: 'transparent',
                      border: '1.5px solid #333F1F',
                      color: '#2c5530',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 28,
                      px: 1.5,
                      fontFamily: '"Poppins", sans-serif',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      '&:hover': {
                        bgcolor: 'rgba(74, 124, 89, 0.08)'
                      }
                    }}
                  />
                )}
              </>
            ) : (
              <>
                {model.balconies && model.balconies.length > 0 && (
                  <Chip
                    label="Balcony"
                    size="small"
                    sx={{
                      bgcolor: 'transparent',
                      border: '1.5px solid #8CA551',
                      color: '#3d5a4d',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 28,
                      px: 1.5,
                      fontFamily: '"Poppins", sans-serif',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      '&:hover': {
                        bgcolor: 'rgba(107, 144, 128, 0.08)'
                      }
                    }}
                  />
                )}
                {model.storages && model.storages.length > 0 && (
                  <Chip
                    label="Storage"
                    size="small"
                    sx={{
                      bgcolor: 'transparent',
                      border: '1.5px solid #9e9e9e',
                      color: '#5a5a5a',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 28,
                      px: 1.5,
                      fontFamily: '"Poppins", sans-serif',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      '&:hover': {
                        bgcolor: 'rgba(158, 158, 158, 0.08)'
                      }
                    }}
                  />
                )}
                {model.upgrades && model.upgrades.length > 0 && (
                  <Chip
                    label="Upgrades"
                    size="small"
                    sx={{
                      bgcolor: 'transparent',
                      border: '1.5px solid #4a7c59',
                      color: '#2c5530',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 28,
                      px: 1.5,
                      fontFamily: '"Poppins", sans-serif',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      '&:hover': {
                        bgcolor: 'rgba(74, 124, 89, 0.08)'
                      }
                    }}
                  />
                )}
              </>
            )}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 0,
              mb: 3,
              borderTop: '1px solid #e0e0e0',
              borderBottom: '1px solid #e0e0e0',
              py: 2
            }}
          >
            <Box
              sx={{
                textAlign: 'center',
                borderRight: '1px solid #e0e0e0',
                px: 1
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#999999',
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontFamily: '"Poppins", sans-serif',
                  display: 'block',
                  mb: 0.8
                }}
              >
                SQFT
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#1a1a1a',
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  lineHeight: 1
                }}
              >
                {model.sqft?.toLocaleString()}
              </Typography>
            </Box>

            <Box
              sx={{
                textAlign: 'center',
                borderRight: '1px solid #e0e0e0',
                px: 1
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#999999',
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontFamily: '"Poppins", sans-serif',
                  display: 'block',
                  mb: 0.8
                }}
              >
                BEDS
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#1a1a1a',
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  lineHeight: 1
                }}
              >
                {model.bedrooms}
              </Typography>
            </Box>

            <Box
              sx={{
                textAlign: 'center',
                borderRight: '1px solid #e0e0e0',
                px: 1
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#999999',
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontFamily: '"Poppins", sans-serif',
                  display: 'block',
                  mb: 0.8
                }}
              >
                BATHS
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#1a1a1a',
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  lineHeight: 1
                }}
              >
                {model.bathrooms}
              </Typography>
            </Box>

            <Box
              sx={{
                textAlign: 'center',
                px: 1
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#999999',
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontFamily: '"Poppins", sans-serif',
                  display: 'block',
                  mb: 0.8
                }}
              >
                STORIES
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#1a1a1a',
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  lineHeight: 1
                }}
              >
                {model.stories}
              </Typography>
            </Box>
          </Box>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              onGoDetail(model._id);
            }}
            fullWidth
            sx={{
            //   mt: "auto",
              borderRadius: 0,
              bgcolor: "#333F1F",
              color: "white",
              fontWeight: 600,
              fontSize: { xs: "0.85rem", md: "0.9rem" },
              px: 3,
              py: { xs: 1.5, md: 1.8 },
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontFamily: '"Poppins", sans-serif',
              border: "none",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                bgcolor: "#8CA551",
                transition: "left 0.4s ease",
                zIndex: 0,
              },
              "&:hover": {
                bgcolor: "#333F1F",
                "&::before": {
                  left: 0,
                },
                "& .button-text": {
                  color: "white",
                },
              },
              "& .button-text": {
                position: "relative",
                zIndex: 1,
                transition: "color 0.3s ease",
              },
            }}
          >
            <span className="button-text">View Details</span>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ViewModelCard