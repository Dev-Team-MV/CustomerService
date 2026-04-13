import { Card, CardContent, Typography, Box, Button, Chip } from '@mui/material'
import { ViewModule, Bed, Bathtub, SquareFoot, Apartment } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
const ModelCard = ({ model, onEdit }) => {
  const theme = useTheme()
  const { t } = useTranslation(['buildings', 'common'])

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        type: "spring",
      }}
      whileHover={{ scale: 1.02 }}
      style={{ height: '100%', width: '100%' }}
    >
      <Card
        sx={{
          height: "100%",
          minHeight: { xs: 380, sm: 400, md: 420 },
          width: '100%',
          borderRadius: 6,
          cursor: "pointer",
          border: `1.5px solid ${theme.palette.cardBorder}`,
          boxShadow: "0 12px 32px rgba(26, 35, 126, 0.12)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          position: "relative",
          background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
          display: "flex",
          flexDirection: "column",
          '&:hover': {
            boxShadow: `0 24px 60px ${theme.palette.primary.main}40`,
            borderColor: theme.palette.primary.main,
          }
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: theme.palette.gradientInfo,
            transition: "all 0.3s ease",
          }}
        />

        {model.status && (
          <Chip
            label={model.status}
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: model.status === 'active' ? theme.palette.success.main : theme.palette.cardBg,
              color: model.status === 'active' ? 'white' : theme.palette.text.secondary,
              fontWeight: 700,
              fontFamily: '"Poppins", sans-serif',
              textTransform: 'capitalize',
              height: 28,
              px: 1.5,
              zIndex: 1
            }}
          />
        )}

        <CardContent
          sx={{
            p: { xs: 2.5, sm: 3 },
            pt: 3.5,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} mb={3}>
            <motion.div
              whileHover={{
                scale: [1, 1.05, 1],
                rotate: [0, 3, -3, 0],
              }}
              transition={{ duration: 0.6 }}
            >
              <Box
                sx={{
                  width: { xs: 64, sm: 70 },
                  height: { xs: 64, sm: 70 },
                  borderRadius: '50%',
                  background: theme.palette.gradientInfo,
                  boxShadow: theme.palette.avatarShadow,
                  border: "3px solid white",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ViewModule sx={{ fontSize: 32, color: "white" }} />
              </Box>
            </motion.div>

            <Box textAlign="center">
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  letterSpacing: "0.5px",
                  mb: 0.5
                }}
              >
                {model.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: "0.75rem",
                }}
              >
                             {t('buildings:modelNumber', 'Modelo')} #{model.modelNumber || 'N/A'}

              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              width: 40,
              height: 2,
              bgcolor: theme.palette.info.main,
              mx: "auto",
              mb: 2.5,
              opacity: 0.8,
            }}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 0,
              mb: 3,
              borderTop: `1px solid ${theme.palette.cardBorder}`,
              borderBottom: `1px solid ${theme.palette.cardBorder}`,
              py: 2,
            }}
          >
            {[
              { icon: <Bed />, value: model.bedrooms || 0, label: t('buildings:beds', 'Recámaras') },
              { icon: <Bathtub />, value: model.bathrooms || 0, label: t('buildings:baths', 'Baños') },
              { icon: <SquareFoot />, value: model.sqft || 0, label: t('buildings:sqft', 'm²') },
            ].map((spec, idx) => (
              <Box
                key={idx}
                sx={{
                  textAlign: "center",
                  borderRight: idx < 2 ? `1px solid ${theme.palette.cardBorder}` : "none",
                  px: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#999999",
                    fontSize: "0.65rem",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontFamily: '"Poppins", sans-serif',
                    display: "block",
                    mb: 0.8,
                  }}
                >
                  {spec.label}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: { xs: "1.1rem", md: "1.2rem" },
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
                    lineHeight: 1,
                  }}
                >
                  {spec.value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: theme.palette.cardBg,
              border: `1px solid ${theme.palette.cardBorder}`,
              textAlign: "center",
              mb: 2.5,
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={0.5}>
              <Apartment sx={{ fontSize: 18, color: theme.palette.info.main }} />
              <Typography
                variant="caption"
                sx={{
                  color: "#706f6f",
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                                {t('buildings:apartments', 'Departamentos')}

              </Typography>
            </Box>
            <Typography
              variant="h5"
              sx={{
                color: theme.palette.info.main,
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif',
                fontSize: { xs: "1.5rem", sm: "1.75rem" },
              }}
            >
              {model.apartmentCount || 0}
            </Typography>
          </Box>

          <Button
            fullWidth
            onClick={() => onEdit(model)}
            sx={{
              mt: "auto",
              borderRadius: 3,
              bgcolor: theme.palette.info.main,
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
                background: theme.palette.gradientInfo,
                transition: "left 0.4s ease",
                zIndex: 0,
              },
              "&:hover": {
                bgcolor: theme.palette.info.main,
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
       <span className="button-text">{t('buildings:edit', 'Editar Modelo')}</span>

          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ModelCard