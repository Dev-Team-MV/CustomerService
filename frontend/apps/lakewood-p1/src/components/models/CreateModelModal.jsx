import { useState, useEffect } from 'react';
import {
  Box, Grid, 
} from '@mui/material';
import {
  Home, Add, Edit
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../constants/PrimaryButton';
import ModalWrapper from '../../constants/ModalWrapper';
import { useModels, EMPTY_FORM, mapModelToFormData } from '../../hooks/useModels';
import ModelBasicInfoForm from './ModelSections/ModelBasicInfoForm';
import ModelPriceSummary from './ModelSections/ModelPriceSummary';
import ModelPricingOptions from './ModelSections/ModelPricingOptions';
import ModelImagesPanel from './ModelSections/ModelImagesPanel';

const CreateModelModal = ({
  open,
  onClose,
  selectedModel,
  onSubmit
}) => {
  const { t } = useTranslation(['models', 'common']);
  const {
    projects,
    loadingProjects,
    fetchProjects,
    groupImagesByRoomType,
    getRoomTypeName,
    getTotalImagesCount,
    calculatePricingCombinations,
    calculateMaxPrice,
    handleFileImageUpload,
    handleToggleImageIsPublic,
    handleRemoveImage
  } = useModels();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [currentImageType, setCurrentImageType] = useState("exterior");
  const [currentImageSection, setCurrentImageSection] = useState("base");
  const [currentRoomType, setCurrentRoomType] = useState("general");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [expandedAccordions, setExpandedAccordions] = useState({
    base: true,
    balcony: false,
    upgrade: false,
    storage: false,
  });

  // Cargar proyectos al abrir
  useEffect(() => {
    if (open) fetchProjects();
  }, [open, fetchProjects]);

  // Cargar datos del modelo seleccionado
  useEffect(() => {
    if (selectedModel) {
      setFormData(mapModelToFormData(selectedModel));
      setExpandedAccordions({
        base: true,
        balcony: !!(selectedModel.balconies && selectedModel.balconies.length > 0),
        upgrade: !!(selectedModel.upgrades && selectedModel.upgrades.length > 0),
        storage: !!(selectedModel.storages && selectedModel.storages.length > 0),
      });
    } else {
      setFormData({ ...EMPTY_FORM });
      setExpandedAccordions({
        base: true,
        balcony: false,
        upgrade: false,
        storage: false,
      });
    }
    setCurrentImageType("exterior");
    setCurrentImageSection("base");
    setCurrentRoomType("general");
  }, [selectedModel, open]);

  // Handlers
  const handleClose = () => {
    setCurrentImageType("exterior");
    setCurrentImageSection("base");
    setCurrentRoomType("general");
    onClose();
  };

  const handleSubmit = () => {
    if (!formData.project) {
      alert("Please select a project");
      return;
    }
    onSubmit(formData);
  };

  // Remover imagen local y en storage
  const handleRemoveImageLocal = async (section, type, index) => {
    let arr = [];
    if (section === "base") arr = formData.images[type];
    else if (section === "balcony") arr = formData.balconyImages[type];
    else if (section === "upgrade") arr = formData.upgradeImages[type];
    else if (section === "storage") arr = formData.storageImages[type];

    const filename = arr[index]?.filename || arr[index]?.url?.split('/').pop()?.split('?')[0];
    if (filename) await handleRemoveImage(filename);

    // Elimina localmente
    setFormData(prev => {
      const update = { ...prev };
      if (section === "base") update.images[type] = prev.images[type].filter((_, i) => i !== index);
      else if (section === "balcony") update.balconyImages[type] = prev.balconyImages[type].filter((_, i) => i !== index);
      else if (section === "upgrade") update.upgradeImages[type] = prev.upgradeImages[type].filter((_, i) => i !== index);
      else if (section === "storage") update.storageImages[type] = prev.storageImages[type].filter((_, i) => i !== index);
      return update;
    });
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [panel]: isExpanded,
    }));
  };

  // Subir imágenes
  const handleFileImageUploadLocal = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImage(true);
    try {
      const urls = [];
      for (const file of files) {
        const { url, isPublic, filename } = await handleFileImageUpload(file);
        urls.push({ url, isPublic, filename });
      }
      const section = currentImageSection;
      const type = currentImageType;
      const imagesData =
        type === "interior" && currentRoomType !== "general"
          ? urls.map(u => ({ ...u, roomType: currentRoomType }))
          : urls;

      setFormData(prev => {
        const update = { ...prev };
        if (section === "base") update.images[type] = [...prev.images[type], ...imagesData];
        else if (section === "balcony") update.balconyImages[type] = [...prev.balconyImages[type], ...imagesData];
        else if (section === "upgrade") update.upgradeImages[type] = [...prev.upgradeImages[type], ...imagesData];
        else if (section === "storage") update.storageImages[type] = [...prev.storageImages[type], ...imagesData];
        return update;
      });
    } catch (err) {
      alert("Error uploading image(s)");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  // Cambiar visibilidad de imagen
  const handleToggleImageIsPublicLocal = async (section, type, index, checked) => {
    const prev = JSON.parse(JSON.stringify(formData));
    const keyMap = {
      base: 'images',
      balcony: 'balconyImages',
      upgrade: 'upgradeImages',
      storage: 'storageImages'
    };
    const rootKey = keyMap[section] || 'images';

    setFormData(fd => {
      const arr = Array.isArray(fd[rootKey][type]) ? [...fd[rootKey][type]] : [];
      const item = arr[index];
      arr[index] = (typeof item === 'string') ? { url: item, isPublic: !!checked } : { ...item, isPublic: !!checked };
      return { ...fd, [rootKey]: { ...fd[rootKey], [type]: arr } };
    });

    try {
      const item = formData[rootKey][type][index];
      const filename = item?.filename || (typeof item === 'string' ? String(item).split('/').pop().split('?')[0] : item?.url?.split('/').pop()?.split('?')[0]);
      await handleToggleImageIsPublic({ filename, isPublic: !!checked });
    } catch (err) {
      setFormData(prev);
    }
  };

  return (
  <ModalWrapper
    open={open}
    onClose={handleClose}
    icon={Home}
    title={selectedModel ? t('models:editModel') : t('models:addModel')}
    subtitle={t('models:manageModelSubtitle')}
    actions={
      <>
        <PrimaryButton
          onClick={handleClose}
          size="small"
          variant="outlined"
          color="secondary"
        >
          {t('common:actions.cancel')}
        </PrimaryButton>
        <PrimaryButton
          onClick={handleSubmit}
          variant="contained"
          size="small"
          startIcon={selectedModel ? <Edit fontSize="small" /> : <Add fontSize="small" />}
        >
          {selectedModel ? t('common:actions.update') : t('common:actions.create')}
        </PrimaryButton>
      </>
    }
    maxWidth="xl"
    fullWidth
  >
    <Box display="flex" height="100%" flexDirection={{ xs: "column", md: "row" }}>
      {/* LEFT SIDE - Form */}
  <Box
    sx={{
      width: { xs: "100%", md: "50%" },
      p: { xs: 2, md: 3 },
      bgcolor: '#fafafa',
      borderRight: { xs: "none", md: "1px solid #e0e0e0" },
      borderBottom: { xs: "1px solid #e0e0e0", md: "none" },
      position: { md: "sticky" },
      top: 0,
      height: { xs: "auto", md: "100vh" },
      zIndex: 2,
      overflowY: { xs: "auto", md: "hidden" },
      "&::-webkit-scrollbar": { width: "8px" },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "rgba(51, 63, 31, 0.2)",
        borderRadius: "4px",
      },
    }}
  >
    <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
      <ModelBasicInfoForm
        formData={formData}
        setFormData={setFormData}
        projects={projects}
        loadingProjects={loadingProjects}
        t={t}
      />
      <ModelPricingOptions
        formData={formData}
        setFormData={setFormData}
        expandedAccordions={expandedAccordions}
        setExpandedAccordions={setExpandedAccordions}
        t={t}
      />
      <ModelPriceSummary
        formData={formData}
        calculateMaxPrice={calculateMaxPrice}
        calculatePricingCombinations={calculatePricingCombinations}
        t={t}
      />
    </Grid>
  </Box>
      {/* RIGHT SIDE - Images */}
      <ModelImagesPanel
        formData={formData}
        setFormData={setFormData}
        modelId={selectedModel?._id}
        currentImageType={currentImageType}
        setCurrentImageType={setCurrentImageType}
        currentImageSection={currentImageSection}
        setCurrentImageSection={setCurrentImageSection}
        currentRoomType={currentRoomType}
        setCurrentRoomType={setCurrentRoomType}
        uploadingImage={uploadingImage}
        handleFileImageUploadLocal={handleFileImageUploadLocal}
        handleRemoveImageLocal={handleRemoveImageLocal}
        handleToggleImageIsPublicLocal={handleToggleImageIsPublicLocal}
        groupImagesByRoomType={groupImagesByRoomType}
        getRoomTypeName={getRoomTypeName}
        expandedAccordions={expandedAccordions}
        handleAccordionChange={handleAccordionChange}
        t={t}
      />
    </Box>
  </ModalWrapper>
);
};

export default CreateModelModal;