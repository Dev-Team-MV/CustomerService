// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Pages/Models.jsx

import { useState } from 'react'
import { Box, Container, Grid, Paper, Typography, Button, Snackbar, Alert } from '@mui/material'
import { Home, Add } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { AnimatePresence } from 'framer-motion'
import PageHeader from '@shared/components/PageHeader'
import { useModels } from '@shared/hooks/useModels'
import ModelCard from '../Components/models/ModelCard'
import ModelDialog from '../Components/models/ModelDialog'
import FacadeDialog from '../Components/models/FacadeDialog'

const Models = () => {
  const theme = useTheme()
  const projectId = import.meta.env.VITE_PROJECT_ID

  const [modelDialog, setModelDialog] = useState({ open: false, data: null })
  const [facadeDialog, setFacadeDialog] = useState({ open: false, model: null, facade: null })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const {
    models,
    facades,
    loading,
    handleSubmitModel,
    handleDeleteModel,
    handleSubmitFacade,
    handleDeleteFacade,
    getModelFacades,
  } = useModels(projectId)

  const handleOpenModelDialog = (model = null) => {
    setModelDialog({ open: true, data: model })
  }

  const handleCloseModelDialog = () => {
    setModelDialog({ open: false, data: null })
  }

  const handleOpenFacadeDialog = (model, facade = null) => {
    setFacadeDialog({ open: true, model, facade })
  }

  const handleCloseFacadeDialog = () => {
    setFacadeDialog({ open: false, model: null, facade: null })
  }

  const handleSaveModel = async (formData) => {
    try {
      await handleSubmitModel(formData, modelDialog.data, handleCloseModelDialog)
      setSnackbar({ open: true, message: modelDialog.data ? 'Modelo actualizado' : 'Modelo creado', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' })
    }
  }

  const handleSaveFacade = async (formData) => {
    try {
      await handleSubmitFacade(formData, facadeDialog.facade, handleCloseFacadeDialog)
      setSnackbar({ open: true, message: facadeDialog.facade ? 'Fachada actualizada' : 'Fachada creada', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' })
    }
  }

  const handleDeleteModelConfirm = async (model) => {
    if (!window.confirm(`¿Eliminar modelo ${model.model}?`)) return
    try {
      await handleDeleteModel(model._id)
      setSnackbar({ open: true, message: 'Modelo eliminado', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' })
    }
  }

  const handleDeleteFacadeConfirm = async (facade) => {
    if (!window.confirm(`¿Eliminar fachada ${facade.title}?`)) return
    try {
      await handleDeleteFacade(facade._id)
      setSnackbar({ open: true, message: 'Fachada eliminada', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' })
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={Home}
          title="Modelos"
          subtitle="Gestiona los modelos de casas y sus fachadas"
          actionButton={{
            label: 'Crear Modelo',
            onClick: () => handleOpenModelDialog(),
            icon: <Add />,
            tooltip: 'Crear nuevo modelo',
            disabled: loading
          }}
        />

        <AnimatePresence mode="wait">
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <Typography>Cargando...</Typography>
            </Box>
          ) : models.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 8,
                borderRadius: 4,
                textAlign: 'center',
                border: '2px dashed rgba(140, 165, 81, 0.3)',
                bgcolor: 'rgba(140, 165, 81, 0.03)'
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 4,
                  bgcolor: 'rgba(140, 165, 81, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 2
                }}
              >
                <Home sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif', mb: 1 }}>
                No hay modelos creados
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: '"Poppins", sans-serif', mb: 3 }}>
                Crea tu primer modelo de casa para comenzar
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenModelDialog()}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600,
                  px: 4
                }}
              >
                Crear Modelo
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {models.map((model, index) => (
                <ModelCard
                  key={model._id}
                  model={model}
                  index={index}
                  facades={getModelFacades(model._id)}
                  onEdit={handleOpenModelDialog}
                  onDelete={handleDeleteModelConfirm}
                  onOpenFacadeDialog={handleOpenFacadeDialog}
                  onDeleteFacade={handleDeleteFacadeConfirm}
                  theme={theme}
                />
              ))}
            </Grid>
          )}
        </AnimatePresence>

        <ModelDialog
          open={modelDialog.open}
          onClose={handleCloseModelDialog}
          selectedModel={modelDialog.data}
          onSubmit={handleSaveModel}
          projectId={projectId}
        />

        <FacadeDialog
          open={facadeDialog.open}
          onClose={handleCloseFacadeDialog}
          selectedModel={facadeDialog.model}
          selectedFacade={facadeDialog.facade}
          onSubmit={handleSaveFacade}
          projectId={projectId}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} sx={{ borderRadius: 3 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}

export default Models