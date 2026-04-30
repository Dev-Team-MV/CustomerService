import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Container
} from "@mui/material";
import {
  Add,
  Home
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import GalleryModal from "../components/models/GalleryModal";
import CreateModelModal from "../components/models/CreateModelModal";
import CreateFacade from "../components/models/CreateFacade";
import ModelCard from "../components/models/listModels";
import PageHeader from '@shared/components/PageHeader'
import { useTranslation } from "react-i18next";
import Loader from "../components/Loader";
import useModalState from "@shared/hooks/useModalState";
import { useModels } from "../hooks/useModels";

const Models = () => {
  const { t } = useTranslation(['models', 'common']);
  const navigate = useNavigate();

  // Hooks para modales
  const modelModal = useModalState(null);
  const facadeModal = useModalState({ model: null, facade: null });
  const galleryModal = useModalState(null);

  const projectId = import.meta.env.VITE_PROJECT_ID;


  // Hook centralizado de modelos
  const {
    models,
    facades,
    loading,
    handleSubmitModel,
    handleDeleteModel,
    handleSubmitFacade,
    handleDeleteFacade,
    getModelFacades,
    fetchModels,
  } = useModels();

  // Navegación a detalle
  const handleGoToDetail = (modelId) => {
    navigate(`/models/${modelId}`);
  };

  // ✅ Cargar modelos filtrados por proyecto
useEffect(() => {
  if (projectId) {
    fetchModels(projectId);
  }
}, [projectId, fetchModels]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="xl">
        <PageHeader
          icon={Home}
          title={t('models:title')}
          subtitle={t('models:subtitle')}
          actionButton={{
            label: t('models:actions.add'),
            onClick: () => modelModal.openModal(),
            icon: <Add />,
            tooltip: t('models:actions.add')
          }}
        />

        <AnimatePresence mode="wait">
          {loading ? (
            <Loader 
              size="large" 
              message={t('common:loading')} 
              fullHeight={true}
            />
          ) : models.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
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
                  <Home sx={{ fontSize: 40, color: '#8CA551' }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#333F1F',
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
                    mb: 1
                  }}
                >
                  {t('models:empty.title')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif',
                    mb: 3
                  }}
                >
                  {t('models:empty.description')}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => modelModal.openModal()}
                  sx={{
                    borderRadius: 3,
                    bgcolor: '#333F1F',
                    textTransform: 'none',
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    px: 4,
                    '&:hover': {
                      bgcolor: '#8CA551'
                    }
                  }}
                >
                  {t('models:actions.add')}
                </Button>
              </Paper>
            </motion.div>
          ) : (
            <Grid container spacing={3}>
              {models.map((model, index) => (
                <ModelCard
                  key={model._id}
                  model={model}
                  index={index}
                  facades={getModelFacades(model._id)}
                  onEdit={m => modelModal.openModal(m)}
                  onDelete={handleDeleteModel}
                  onOpenGallery={m => galleryModal.openModal(m)}
                  onGoToDetail={handleGoToDetail}
                  onOpenFacadeDialog={(m, f) => facadeModal.openModal({ model: m, facade: f })}
                  onEditFacade={(m, f) => facadeModal.openModal({ model: m, facade: f })}
                  onDeleteFacade={handleDeleteFacade}
                />
              ))}
            </Grid>
          )}
        </AnimatePresence>

        {/* MODALS */}
        <CreateModelModal
          open={modelModal.open}
          onClose={modelModal.closeModal}
          selectedModel={modelModal.data}
          onSubmit={(formData) => handleSubmitModel(formData, modelModal.data, modelModal.closeModal)}
        />

        <CreateFacade
          open={facadeModal.open}
          onClose={facadeModal.closeModal}
          selectedModel={facadeModal.data?.model}
          selectedFacade={facadeModal.data?.facade}
          onSubmit={(formData) => handleSubmitFacade(formData, facadeModal.data?.facade, facadeModal.closeModal)}
        />

        <GalleryModal
          open={galleryModal.open}
          onClose={galleryModal.closeModal}
          model={galleryModal.data}
        />
      </Container>
    </Box>
  );
};

export default Models;