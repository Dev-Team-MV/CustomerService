import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import uploadService from "../services/uploadService";
import { useTranslation } from "react-i18next";

// ─────────────────────────────────────────────────────────────
// Constantes compartidas
// ─────────────────────────────────────────────────────────────
export const EMPTY_FORM = {
  model: "",
  modelNumber: "",
  price: 0,
  bedrooms: 0,
  bathrooms: 0,
  sqft: 0,
  stories: 1,
  description: "",
  status: "active",
  project: "",
  projectId: "",
  images: { exterior: [], interior: [], blueprints: [] },
  hasBalcony: false,
  balconyId: null, // ✅ NUEVO
  balconyPrice: 0,
  balconyImages: { exterior: [], interior: [], blueprints: [] },
  hasUpgrade: false,
  upgradeId: null, // ✅ NUEVO
  upgradePrice: 0,
  upgradeImages: { exterior: [], interior: [], blueprints: [] },
  hasStorage: false,
  storageId: null, // ✅ NUEVO
  storagePrice: 0,
  storageImages: { exterior: [], interior: [], blueprints: [] },
};

// ─────────────────────────────────────────────────────────────
// Helpers de imágenes
// ─────────────────────────────────────────────────────────────
const normalizeImages = (images) => {
  if (!images) return { exterior: [], interior: [], blueprints: [] };
  return {
    exterior: Array.isArray(images.exterior) ? images.exterior : [],
    interior: Array.isArray(images.interior) ? images.interior : [],
    blueprints: Array.isArray(images.blueprints) ? images.blueprints : [],
  };
};

const groupImagesByRoomType = (images) => {
  const grouped = {
    general: [],
    bedroom_closet: [],
    bedroom_no_closet: [],
    bathroom: [],
    laundry: [],
    dining: [],
    living: [],
    kitchen: [],
    hallway: [],
    garage: [],
    balcony: [],
    patio: [],
    closet: [],
  };

  (images || []).forEach((img, originalIndex) => {
    if (!img) return;
    if (typeof img === "string") {
      grouped.general.push({ url: img, originalIndex, isPublic: false, raw: img });
    } else if (img && typeof img === "object" && img.url) {
      const roomType = img.roomType || "general";
      grouped[roomType] = grouped[roomType] || [];
      grouped[roomType].push({ url: img.url, originalIndex, roomType, isPublic: !!img.isPublic, raw: img });
    }
  });

  return grouped;
};

const getRoomTypeName = (roomType) => {
  const names = {
    general: "📷 General",
    bedroom_closet: "🛏️ Bedroom w/ Closet",
    bedroom_no_closet: "🛌 Bedroom w/o Closet",
    bathroom: "🚿 Bathroom",
    laundry: "🧺 Laundry",
    dining: "🍽️ Dining Room",
    living: "🛋️ Living Room",
    kitchen: "👨‍🍳 Kitchen",
    hallway: "🚪 Hallway",
    garage: "🚗 Garage",
    balcony: "🌳 Balcony",
    patio: "🏡 Patio",
    closet: "👔 Walk-in Closet",
  };
  return names[roomType] || roomType;
};

const getTotalImagesCount = (formData) => {
  let count = 0;
  count += formData.images?.exterior?.length || 0;
  count += formData.images?.interior?.length || 0;
  count += formData.images?.blueprints?.length || 0;
  if (formData.hasBalcony) {
    count += formData.balconyImages?.exterior?.length || 0;
    count += formData.balconyImages?.interior?.length || 0;
    count += formData.balconyImages?.blueprints?.length || 0;
  }
  if (formData.hasUpgrade) {
    count += formData.upgradeImages?.exterior?.length || 0;
    count += formData.upgradeImages?.interior?.length || 0;
    count += formData.upgradeImages?.blueprints?.length || 0;
  }
  if (formData.hasStorage) {
    count += formData.storageImages?.exterior?.length || 0;
    count += formData.storageImages?.interior?.length || 0;
    count += formData.storageImages?.blueprints?.length || 0;
  }
  return count;
};

const calculatePricingCombinations = (formData) => {
  if (!formData) return 1;
  const { hasBalcony, hasStorage, hasUpgrade } = formData;
  let count = 1;
  if (hasBalcony) count *= 2;
  if (hasStorage) count *= 2;
  if (hasUpgrade) count *= 2;
  return count;
};

// const calculateMaxPrice = (formData) => {
//   if (!formData) return 0;
//   const { price, hasBalcony, balconyPrice, hasUpgrade, upgradePrice, hasStorage, storagePrice } = formData;
//   return price + (hasBalcony ? balconyPrice : 0) + (hasUpgrade ? upgradePrice : 0) + (hasStorage ? storagePrice : 0);
// };
const calculateMaxPrice = (formData) => {
  if (!formData) return 0;
  const { price = 0, hasBalcony, balconyPrice, hasUpgrade, upgradePrice, hasStorage, storagePrice } = formData;
  return price + (hasBalcony ? balconyPrice : 0) + (hasUpgrade ? upgradePrice : 0) + (hasStorage ? storagePrice : 0);
};

// Helper para mapear modelo a formData
export const mapModelToFormData = (selectedModel) => {
  if (!selectedModel) return { ...EMPTY_FORM };

  const hasBalconyOption = selectedModel.balconies && selectedModel.balconies.length > 0;
  const hasUpgradeOption = selectedModel.upgrades && selectedModel.upgrades.length > 0;
  const hasStorageOption = selectedModel.storages && selectedModel.storages.length > 0;

  const blueprintsObj = selectedModel.blueprints || {};
  const defaultBlueprints = Array.isArray(blueprintsObj.default) ? blueprintsObj.default : [];
  const withBalconyBlueprints = Array.isArray(blueprintsObj.withBalcony) ? blueprintsObj.withBalcony : [];
  const withStorageBlueprints = Array.isArray(blueprintsObj.withStorage) ? blueprintsObj.withStorage : [];

  const projectId = typeof selectedModel.project === 'object'
    ? selectedModel.project?._id
    : selectedModel.project || selectedModel.projectId || '';

  return {
    model: selectedModel.model,
    modelNumber: selectedModel.modelNumber || "",
    price: selectedModel.price || 0,
    bedrooms: selectedModel.bedrooms,
    bathrooms: selectedModel.bathrooms,
    sqft: selectedModel.sqft,
    stories: selectedModel.stories || 1,
    description: selectedModel.description || "",
    status: selectedModel.status,
    project: projectId,
    projectId: projectId,
    images: {
      ...normalizeImages(selectedModel.images),
      blueprints: defaultBlueprints,
    },
    hasBalcony: hasBalconyOption,
    balconyId: hasBalconyOption ? selectedModel.balconies[0]._id : null, // ✅ NUEVO
    balconyPrice: hasBalconyOption ? selectedModel.balconies[0].price : 0,
    balconyImages: hasBalconyOption
      ? {
          ...normalizeImages(selectedModel.balconies[0].images),
          blueprints: withBalconyBlueprints,
        }
      : { exterior: [], interior: [], blueprints: [] },
    hasUpgrade: hasUpgradeOption,
    upgradeId: hasUpgradeOption ? selectedModel.upgrades[0]._id : null, // ✅ NUEVO
    upgradePrice: hasUpgradeOption ? selectedModel.upgrades[0].price : 0,
    upgradeImages: hasUpgradeOption
      ? normalizeImages(selectedModel.upgrades[0].images)
      : { exterior: [], interior: [], blueprints: [] },
    hasStorage: hasStorageOption,
    storageId: hasStorageOption ? selectedModel.storages[0]._id : null, // ✅ NUEVO
    storagePrice: hasStorageOption ? selectedModel.storages[0].price : 0,
    storageImages: hasStorageOption
      ? {
          ...normalizeImages(selectedModel.storages[0].images),
          blueprints: withStorageBlueprints,
        }
      : { exterior: [], interior: [], blueprints: [] },
  };
};

// ─────────────────────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────────────────────
export const useModels = () => {
  const { t } = useTranslation(['models', 'common']);
  const [models, setModels] = useState([]);
  const [facades, setFacades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Proyectos
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Proyecto actual
  const [currentProjectId, setCurrentProjectId] = useState(null);

  // Fetch models
  // const fetchModels = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const response = await api.get("/models");
  //     setModels(response.data);
  //   } catch (error) {
  //     console.error("Error fetching models:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);
  // Fetch models
  const fetchModels = useCallback(async (projectId = null) => {
    setLoading(true);
    try {
      if (projectId) setCurrentProjectId(projectId);
      const idToUse = projectId || currentProjectId;
      const params = idToUse ? { projectId: idToUse } : {};
      const response = await api.get("/models", { params });
      setModels(response.data);
    } catch (error) {
      console.error("Error fetching models:", error);
    } finally {
      setLoading(false);
    }
  }, [currentProjectId]);
  


  // Fetch facades
  const fetchFacades = useCallback(async () => {
    try {
      const response = await api.get("/facades");
      const validFacades = response.data.filter((facade) => {
        if (!facade.model) {
          console.warn("⚠️ Facade without model found:", facade._id);
          return false;
        }
        return true;
      });
      setFacades(validFacades);
    } catch (error) {
      console.error("Error fetching facades:", error);
    }
  }, []);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const response = await api.get("/projects");
      setProjects(response.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

useEffect(() => {
  // No llamar fetchModels aquí automáticamente
  // Se llamará desde el componente con el projectId
  fetchFacades();
}, [fetchFacades]);

  // Submit model (create/update)
  const handleSubmitModel = async (formData, selectedModel, onClose) => {
    try {
      const blueprints = {
        default: Array.isArray(formData.images?.blueprints) ? formData.images.blueprints : [],
        withBalcony: Array.isArray(formData.balconyImages?.blueprints) ? formData.balconyImages.blueprints : [],
        withStorage: Array.isArray(formData.storageImages?.blueprints) ? formData.storageImages.blueprints : [],
        withBalconyAndStorage:
          Array.isArray(formData.balconyImages?.blueprints) && Array.isArray(formData.storageImages?.blueprints)
            ? [...formData.balconyImages.blueprints, ...formData.storageImages.blueprints]
            : [],
      };

      const balconies = [];
      if (formData.hasBalcony && formData.balconyPrice > 0) {
        balconies.push({
          name: t('models:balconyOption'),
          price: formData.balconyPrice,
          description: t('models:balconyDescription'),
          sqft: 0,
          images: {
            exterior: Array.isArray(formData.balconyImages?.exterior) ? formData.balconyImages.exterior : [],
            interior: Array.isArray(formData.balconyImages?.interior) ? formData.balconyImages.interior : [],
          },
          status: "active",
        });
      }

      const upgrades = [];
      if (formData.hasUpgrade && formData.upgradePrice > 0) {
        upgrades.push({
          name: t('models:upgradeOption'),
          price: formData.upgradePrice,
          description: t('models:upgradeDescription'),
          features: [],
          images: {
            exterior: Array.isArray(formData.upgradeImages?.exterior) ? formData.upgradeImages.exterior : [],
            interior: Array.isArray(formData.upgradeImages?.interior) ? formData.upgradeImages.interior : [],
          },
          status: "active",
        });
      }

      const storages = [];
      if (formData.hasStorage && formData.storagePrice > 0) {
        storages.push({
          name: t('models:storageOption'),
          price: formData.storagePrice,
          description: t('models:storageDescription'),
          sqft: 0,
          images: {
            exterior: Array.isArray(formData.storageImages?.exterior) ? formData.storageImages.exterior : [],
            interior: Array.isArray(formData.storageImages?.interior) ? formData.storageImages.interior : [],
          },
          status: "active",
        });
      }

      const dataToSend = {
        model: formData.model,
        modelNumber: formData.modelNumber,
        price: formData.price || 0,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        sqft: formData.sqft,
        stories: formData.stories,
        description: formData.description,
        status: formData.status,
        project: String(formData.project),
        projectId: String(formData.projectId),
        images: {
          exterior: Array.isArray(formData.images?.exterior) ? formData.images.exterior : [],
          interior: Array.isArray(formData.images?.interior) ? formData.images.interior : [],
        },
        blueprints,
        balconies,
        upgrades,
        storages,
      };

      if (selectedModel) {
        await api.put(`/models/${selectedModel._id}`, dataToSend);
      } else {
        await api.post("/models", dataToSend);
      }

  await fetchModels(currentProjectId);
      if (onClose) onClose();
      return true;
    } catch (error) {
      console.error("❌ Error saving model:", error);
      throw error;
    }
  };

  // Delete model
  const handleDeleteModel = async (id) => {
    try {
      await api.delete(`/models/${id}`);
  await fetchModels(currentProjectId);
    } catch (error) {
      console.error("Error deleting model:", error);
      throw error;
    }
  };

  // Facade handlers
  const handleSubmitFacade = async (facadeFormData, selectedFacade, onClose) => {
    try {
      if (selectedFacade) {
        await api.put(`/facades/${selectedFacade._id}`, facadeFormData);
      } else {
        await api.post("/facades", facadeFormData);
      }
      await fetchFacades();
      if (onClose) onClose();
      return true;
    } catch (error) {
      console.error("Error saving facade:", error);
      throw error;
    }
  };

  const handleDeleteFacade = async (id) => {
    try {
      await api.delete(`/facades/${id}`);
      await fetchFacades();
    } catch (error) {
      console.error("Error deleting facade:", error);
      throw error;
    }
  };

  // Get facades for a model
  const getModelFacades = useCallback((modelId) => {
    return facades.filter((f) => {
      if (!f || !f.model) return false;
      if (typeof f.model === "object" && f.model !== null) {
        return f.model._id === modelId;
      }
      return f.model === modelId;
    });
  }, [facades]);

  // Handlers de imágenes
const handleFileImageUpload = async (file, roomType = null) => {
  try {
    const url = await uploadService.uploadModelImage(file);
    const lastSegment = String(url).split('/').pop() || url;
    const filename = decodeURIComponent(String(lastSegment).split('?')[0]);
    // Devuelve el objeto para el estado local del modal
    return roomType
      ? { url, isPublic: false, filename, roomType }
      : { url, isPublic: false, filename };
  } catch (error) {
    console.error('❌ Error uploading model image:', error);
    throw new Error(error.message || 'Failed to upload model image');
  }
};

const handleRemoveImage = async (filename) => {
  try {
    if (uploadService.deleteClubhouseImages) {
      await uploadService.deleteClubhouseImages({ filenames: [filename], deleteFromStorage: true });
    }
    return true;
  } catch (error) {
    console.error('❌ Error deleting model image:', error);
    throw new Error(error.message || 'Failed to delete model image');
  }
};

const handleToggleImageIsPublic = async ({ filename, isPublic }) => {
  try {
    if (uploadService.updateFileVisibility && filename) {
      await uploadService.updateFileVisibility({ filename, isPublic });
    }
    return true;
  } catch (error) {
    console.error('❌ Error updating image visibility:', error);
    throw new Error(error.message || 'Failed to update image visibility');
  }
};

  return {
    models,
    facades,
    loading,
    projects,
    loadingProjects,
    fetchModels,
    fetchFacades,
    fetchProjects,
    handleSubmitModel,
    handleDeleteModel,
    handleSubmitFacade,
    handleDeleteFacade,
    getModelFacades,
    normalizeImages,
    groupImagesByRoomType,
    getRoomTypeName,
    getTotalImagesCount,
    calculatePricingCombinations,
    calculateMaxPrice,
    handleFileImageUpload,
    handleToggleImageIsPublic,
    handleRemoveImage,
    EMPTY_FORM,
    mapModelToFormData,

    currentProjectId,
  };
};