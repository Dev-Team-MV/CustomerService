import { useState } from "react"
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Paper,
  Alert,
  Chip,
  CircularProgress,
  useTheme,
} from "@mui/material"
import {
  CloudUpload,
  Map,
  Layers,
  Check,
} from "@mui/icons-material"
import ModalWrapper from "@shared/constants/ModalWrapper"
import PrimaryButton from "@shared/constants/PrimaryButton"

const initialImages = {
  exterior: [
    { url: "/images/agora/exterior1.jpg", isPublic: true },
    { url: "/images/agora/exterior2.jpg", isPublic: true }
  ],
  blueprints: [
    { url: "/images/agora/plan1.jpg", isPublic: true }
  ],
}

const AgoraImagesModal = ({ open, onClose, images = initialImages }) => {
  const theme = useTheme()
  const [tab, setTab] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState({
    exterior: [],
    blueprints: [],
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  // Mock: no backend, so just local state for selected files
  const getCurrentExistingImages = () => {
    if (tab === 0) return images.exterior || []
    if (tab === 1) return images.blueprints || []
    return []
  }
  const getCurrentSelectedFiles = () => {
    if (tab === 0) return selectedFiles.exterior
    if (tab === 1) return selectedFiles.blueprints
    return []
  }
  const getCurrentSection = () => {
    if (tab === 0) return "exterior"
    if (tab === 1) return "blueprints"
    return "exterior"
  }
  const getTotalSelectedFiles = () => {
    return selectedFiles.exterior.length + selectedFiles.blueprints.length
  }
  const handleFileSelect = (event, section) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return
    setSelectedFiles(prev => ({
      ...prev,
      [section]: [
        ...(Array.isArray(prev[section]) ? prev[section] : []),
        ...files.map(file => ({ file, isPublic: false }))
      ]
    }))
  }
  const handleRemoveSelectedFile = (section, index) => {
    setSelectedFiles(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }))
  }

  // Mock upload
  const handleConfirmUpload = async () => {
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      setSelectedFiles({
        exterior: [],
        blueprints: [],
      })
      setError(null)
    }, 1200)
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={CloudUpload}
      title="Gestión de imágenes del Ágora"
      subtitle={
        getTotalSelectedFiles() > 0
          ? `Listo para subir ${getTotalSelectedFiles()} archivo(s)`
          : undefined
      }
      actions={
        <PrimaryButton
          onClick={handleConfirmUpload}
          disabled={getTotalSelectedFiles() === 0 || uploading}
          loading={uploading}
          startIcon={!uploading ? <Check /> : undefined}
        >
          {uploading ? "Subiendo..." : `Subir (${getTotalSelectedFiles()})`}
        </PrimaryButton>
      }
      maxWidth="md"
      fullWidth
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{
          mb: 3,
          "& .MuiTabs-indicator": {
            backgroundColor: theme.palette.primary.main,
          },
          "& .MuiTab-root": {
            color: theme.palette.text.secondary,
            "&.Mui-selected": {
              color: theme.palette.primary.main,
            },
          },
        }}
      >
        <Tab icon={<Map />} label="Exterior" iconPosition="start" />
        <Tab icon={<Layers />} label="Planos" iconPosition="start" />
      </Tabs>

      <Box mb={3}>
        <PrimaryButton component="label" startIcon={<CloudUpload />} disabled={uploading}>
          Seleccionar imágenes
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={e => handleFileSelect(e, getCurrentSection())}
          />
        </PrimaryButton>
        <Typography variant="caption" display="block" mt={1}>
          {`Seleccionando para: ${getCurrentSection()}`}
        </Typography>
      </Box>

      {uploading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <>
          {getCurrentSelectedFiles().length > 0 && (
            <Box mb={3}>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5} color={theme.palette.secondary.main}>
                <CloudUpload fontSize="small" />
                {`Listo para subir (${getCurrentSelectedFiles().length})`}
              </Typography>
              <Grid container spacing={2}>
                {getCurrentSelectedFiles().map((file, idx) => (
                  <Grid item xs={6} sm={4} key={idx}>
                    <Box
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                        p: 1,
                        textAlign: "center",
                        bgcolor: theme.palette.background.default,
                        position: "relative"
                      }}
                    >
                      <img
                        src={file.file instanceof File ? URL.createObjectURL(file.file) : ""}
                        alt={`Preview ${idx + 1}`}
                        style={{ width: "100%", height: 120, objectFit: "contain", borderRadius: 8 }}
                      />
                      <Chip
                        label="NEW"
                        color="info"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          bgcolor: theme.palette.info.main,
                          color: theme.palette.info.contrastText,
                          fontWeight: 700,
                        }}
                      />
                      <Box mt={1}>
                        <PrimaryButton
                          size="small"
                          color="error"
                          onClick={() =>
                            handleRemoveSelectedFile(
                              getCurrentSection(),
                              idx
                            )
                          }
                        >
                          Eliminar
                        </PrimaryButton>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {getCurrentExistingImages().length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                {`Imágenes cargadas (${getCurrentExistingImages().length})`}
              </Typography>
              <Grid container spacing={2}>
                {getCurrentExistingImages().map((img, idx) => (
                  <Grid item xs={6} sm={4} key={idx}>
                    <Box
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                        p: 1,
                        textAlign: "center",
                        bgcolor: theme.palette.background.default,
                        position: "relative"
                      }}
                    >
                      <img
                        src={img.url}
                        alt={`Image ${idx + 1}`}
                        style={{ width: "100%", height: 120, objectFit: "contain", borderRadius: 8 }}
                      />
                      {img.isPublic && (
                        <Chip
                          label="Public"
                          color="success"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            bgcolor: theme.palette.success.main,
                            color: theme.palette.success.contrastText,
                            fontWeight: 700,
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {getCurrentExistingImages().length === 0 && getCurrentSelectedFiles().length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: theme.palette.background.default }}>
              <Typography variant="body2">
                No hay imágenes aún.
              </Typography>
            </Paper>
          )}
        </>
      )}
    </ModalWrapper>
  )
}

export default AgoraImagesModal