import api from './api'

const FOLDER_FILES_TTL_MS = 60 * 1000
const folderFilesCache = new Map()
const folderFilesInFlight = new Map()

const getFolderCacheKey = (folder, urls) => `${String(folder || '').trim().toLowerCase()}|${urls ? '1' : '0'}`

const clearFolderFilesCache = (folder = null) => {
  if (!folder) {
    folderFilesCache.clear()
    folderFilesInFlight.clear()
    return
  }
  const normalized = String(folder).trim().toLowerCase()
  for (const key of Array.from(folderFilesCache.keys())) {
    if (key.startsWith(`${normalized}|`)) folderFilesCache.delete(key)
  }
  for (const key of Array.from(folderFilesInFlight.keys())) {
    if (key.startsWith(`${normalized}|`)) folderFilesInFlight.delete(key)
  }
}

const fetchFolderFilesWithCache = async (folder, urls = true) => {
  const cacheKey = getFolderCacheKey(folder, urls)
  const now = Date.now()
  const cached = folderFilesCache.get(cacheKey)
  if (cached && cached.expiresAt > now) return cached.data

  if (folderFilesInFlight.has(cacheKey)) return folderFilesInFlight.get(cacheKey)

  const requestPromise = (async () => {
    const response = await api.get('/upload/files', {
      params: { folder, urls }
    })
    folderFilesCache.set(cacheKey, {
      data: response.data,
      expiresAt: Date.now() + FOLDER_FILES_TTL_MS
    })
    return response.data
  })()

  folderFilesInFlight.set(cacheKey, requestPromise)
  try {
    return await requestPromise
  } finally {
    folderFilesInFlight.delete(cacheKey)
  }
}

const uploadService = {
  uploadImage: async (file, folder = '', fileName = '', isPublic = true) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      if (folder) formData.append('folder', folder)
      if (fileName) formData.append('fileName', fileName)
      formData.append('isPublic', isPublic) // <-- Nuevo
  
      const response = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      clearFolderFilesCache(folder)
      return response.data.data.url
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload image')
    }
  },

  uploadMultipleImages: async (files, folder = '', isPublic = true) => {
    try {      
      const uploadPromises = files.map(file => uploadService.uploadImage(file, folder, '', isPublic))
      const urls = await Promise.all(uploadPromises)
      
      return urls
    } catch (error) {
      console.error('❌ Error uploading images:', error)
      throw new Error(error.message || 'Failed to upload images')
    }
  },

  uploadContractFiles: async (files) => {
    try {      
      const uploadPromises = files.map(file => uploadService.uploadImage(file, 'contracts', file.name))
      const urls = await Promise.all(uploadPromises)
      
      return urls
    } catch (error) {
      console.error('❌ Error uploading contract files:', error)
      throw new Error(error.message || 'Failed to upload contract files')
    }
  },

    uploadContractFile: async (file) => {
    // Sube el archivo al folder 'contracts' y retorna la URL
    return uploadService.uploadImage(file, 'contracts', file.name)
  },

  uploadPaymentImage: async (file) => {
    return uploadService.uploadImage(file, 'payments')
  },

  uploadPhaseImages: async (files) => {
    return uploadService.uploadMultipleImages(files, 'construction-phases')
  },

  uploadPhaseVideos: async (files) => {
    return uploadService.uploadMultipleImages(files, 'construction-phases/videos');
  },
  
  uploadFacadeImage: async (file) => {
    return uploadService.uploadImage(file, 'facades')
  },

  uploadModelImage: async (file) => {
    return uploadService.uploadImage(file, 'models')
  },

  uploadLotImage: async (file) => {
    return uploadService.uploadImage(file, 'lots')
  },

  uploadUpgradeImage: async (file) => {
    return uploadService.uploadImage(file, 'upgrades')
  },

  uploadClubhouseImage: async (file) => {
    return uploadService.uploadImage(file, 'clubhouse')
  },

    uploadTimeLineImages: async (files) => {
    return uploadService.uploadMultipleImages(files, 'timeline')
  },
  
  uploadTimeLineImage: async (file) => {
    return uploadService.uploadImage(file, 'timeline')
  },


  // ========================================
  // ✅ CLUBHOUSE FUNCTIONS - ENDPOINTS CORREGIDOS
  // ========================================

uploadClubhouseImages: async (filesWithVisibility, section, interiorKey = null) => {
  try {
    if (!filesWithVisibility || filesWithVisibility.length === 0) {
      throw new Error('No files to upload');
    }

    // Agrupa por visibilidad: { "true": [File,...], "false": [File,...] }
    const batches = filesWithVisibility.reduce((acc, { file, isPublic }) => {
      const key = String(!!isPublic);
      if (!acc[key]) acc[key] = [];
      acc[key].push(file);
      return acc;
    }, {});

    const results = [];

    for (const [isPublic, files] of Object.entries(batches)) {
      const formData = new FormData();
      formData.append('section', section);
      if (section === 'interior' && interiorKey) {
        formData.append('interiorKey', interiorKey);
      }
      formData.append('isPublic', isPublic); // solo uno por batch

      files.forEach(file => formData.append('images', file));

      // DEBUG: listar entries del FormData (útil en dev)
      try {
        // eslint-disable-next-line no-console
        for (const entry of formData.entries()) {
          // eslint-disable-next-line no-console
        }
      } catch (e) {
        // ignore in prod
      }

      const response = await api.post('/clubhouse/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      clearFolderFilesCache('clubhouse')
      clearFolderFilesCache('deck')
      clearFolderFilesCache('clubhouse/deck')
      results.push(response.data);
    }

    return results; // array de respuestas por batch
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('uploadClubhouseImages error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to upload clubhouse images');
  }
},


  uploadDeckClubHouse: async (file, isPublic = true) => {
    try {
      // subir directamente al folder clubhouse/deck
      const url = await uploadService.uploadImage(file, 'clubhouse/deck', '', !!isPublic);
      return url;
    } catch (err) {
      console.error('❌ uploadDeckClubHouse error:', err.response?.data || err.message || err);
      throw err;
    }
  },

  getFilesByFolder: async (folder, urls = true) => {
    try {
      return await fetchFolderFilesWithCache(folder, urls)
    } catch (error) {
      console.error(`❌ Error getting files from folder ${folder}:`, error.response?.data || error.message)
      throw new Error(error.response?.data?.message || `Failed to get files from ${folder}`)
    }
  },

  getClubhouseInteriorKeys: async () => {
    try {      
      const response = await api.get('/clubhouse/interior-keys')
      return response.data
    } catch (error) {
      console.error('❌ Error getting clubhouse interior keys:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to get clubhouse interior keys')
    }
  },

  /** PATCH recorrido file visibility. Body: { filename, isPublic }. filename e.g. "recorrido.1.jpg" */
  updateRecorridoVisibility: async (filename, isPublic) => {
    const response = await api.patch('/upload/recorrido/visibility', { filename, isPublic })
    clearFolderFilesCache('recorrido')
    return response.data
  },

    // Obtener todas las amenities exteriores
  getOutdoorAmenities: async () => {
    const res = await api.get('/outdoor-amenities')
    return res.data // { amenities: [...] }
  },

    getDeckFiles: async (urls = true) => {
    try {
      return await fetchFolderFilesWithCache('deck', urls)
    } catch (error) {
      console.error('❌ Error getting files from folder deck:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to get files from deck')
    }
  },

  // Obtener archivos de la carpeta 'clubhouse/deck' (por si el backend usa ese path)
  getClubhouseDeckFiles: async (urls = true) => {
    try {
      return await fetchFolderFilesWithCache('clubhouse/deck', urls)
    } catch (error) {
      console.error('❌ Error getting files from folder clubhouse/deck:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to get files from clubhouse/deck')
    }
  },

    getPublicClubhouse: async () => {
    try {
      const res = await api.get('/clubhouse/public');
      return res.data;
    } catch (err) {
      console.error('❌ Error fetching public clubhouse:', err.response?.data || err.message);
      throw err;
    }
  },

  //   uploadOutdoorAmenityImages: async (filesWithVisibility, amenityName) => {
  //   const uploadPromises = filesWithVisibility.map(async ({ file, isPublic }) => {
  //     const url = await uploadService.uploadImage(file, `outdoor-amenities/${amenityName}`, '', isPublic);
  //     return { url, isPublic };
  //   });
  //   return await Promise.all(uploadPromises);
  // },
  uploadOutdoorAmenityImages: async (filesWithVisibility, amenityKey, floorNumber = null) => {
  try {
    const uploadPromises = filesWithVisibility.map(async ({ file, isPublic }) => {
      const folder = floorNumber 
        ? `outdoor-amenities/${amenityKey}/floor-${floorNumber}`
        : `outdoor-amenities/${amenityKey}`
      
      const url = await uploadService.uploadImage(file, folder, '', isPublic)
      return { url, isPublic, floorNumber }
    })
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error('❌ Error uploading outdoor amenity images:', error)
    throw error
  }
},
  
  // Recibe un objeto { id?, name, images }
  saveOutdoorAmenityImages: async (amenity) => {
    return api.post('/outdoor-amenities', amenity)
  },

    updateOutdoorAmenityImages: async (id, data) => {
    // PATCH o PUT según tu backend
    return api.put(`/outdoor-amenities/${id}`, data);
  },


  updateClubhouseImageVisibility: async ({ section, index, isPublic, interiorKey }) => {
    const response = await api.patch('/clubhouse/images/visibility', {
      section,
      index,
      isPublic,
      ...(section === 'interior' && { interiorKey })
    });
    clearFolderFilesCache('clubhouse')
    clearFolderFilesCache('deck')
    clearFolderFilesCache('clubhouse/deck')
    return response
  },


deleteClubhouseImages: async ({ filenames = [], names = [], deleteFromStorage = true }) => {
  // Log para debug
  const response = await api({
    url: '/clubhouse/images',
    method: 'delete',
    data: { filenames, names, deleteFromStorage },
    headers: filenames.length > 0 ? { 'X-Filename': filenames[0] } : {}
  });
  clearFolderFilesCache('clubhouse')
  clearFolderFilesCache('deck')
  clearFolderFilesCache('clubhouse/deck')
  return response
},

  /**
   * Actualiza visibilidad de imagen de recorrido.
   * payload: { filename?, identifier?, isPublic }
   * - filename: nombre exacto esperado por el backend (ej: "recorrido.1.jpg")
   * - identifier: url completa o identificador; si se pasa, se extrae filename automáticamente
   * - isPublic: boolean
   */
    updateRecorridoVisibility: async (filenameOrPayload, isPublic) => {
      try {
        // Normalize input: accept (filename, isPublic) OR ({ filename, isPublic })
        let payload;
        if (typeof filenameOrPayload === 'string') {
          payload = { filename: filenameOrPayload, isPublic: !!isPublic };
        } else if (filenameOrPayload && typeof filenameOrPayload === 'object') {
          payload = {
            filename: filenameOrPayload.filename || filenameOrPayload.name || null,
            isPublic: !!filenameOrPayload.isPublic
          };
        } else {
          throw new Error('Invalid arguments for updateRecorridoVisibility');
        }
  
        if (!payload.filename) {
          throw new Error('Filename is required for updateRecorridoVisibility');
        }
  
        const res = await api.patch('/upload/recorrido/visibility', payload);
        clearFolderFilesCache('recorrido')
        return res.data || res;
      } catch (err) {
        console.error('uploadService.updateRecorridoVisibility error:', err.response?.data || err.message || err);
        throw err;
      }
    },
  // ...existing code...

    // ── BUILDING UPLOADS ───────────────────────────────────────
  uploadBuildingExteriorImage: async (file, isPublic = true) => {
    return uploadService.uploadImage(file, 'buildings/exterior', '', isPublic)
  },

  uploadBuildingExteriorImages: async (files, isPublic = true) => {
    return uploadService.uploadMultipleImages(files, 'buildings/exterior', isPublic)
  },

  uploadBuildingFloorPlan: async (file, buildingId, floorNumber, isPublic = true) => {
    const fileName = `${buildingId}_floor_${floorNumber}`
    return uploadService.uploadImage(file, 'buildings/floor-plans', fileName, isPublic)
  },

  // ── APARTMENT UPLOADS ──────────────────────────────────────
  uploadApartmentModelFloorPlan: async (file, isPublic = true) => {
    return uploadService.uploadImage(file, 'apartments/models/floor-plans', '', isPublic)
  },

  uploadApartmentInteriorImages: async (files, type = 'basic', isPublic = true) => {
    return uploadService.uploadMultipleImages(files, `apartments/interior/${type}`, isPublic)
  },


  //   getOutdoorAmenitiesBySlug: async (slug) => {
  //   try {
  //     const response = await api.get(`/projects/slug/${slug}/outdoor-amenities`)
  //     return response.data
  //   } catch (error) {
  //     console.error('❌ Error getting outdoor amenities by slug:', error.response?.data || error.message)
  //     return { outdoorAmenitySections: [] }
  //   }
  // },
getOutdoorAmenitiesBySlug: async (slug, floorNumber = null) => {
  try {
    const params = floorNumber ? { floorNumber } : {}
    const response = await api.get(`/projects/slug/${slug}/outdoor-amenities`, { params })
    return response.data
  } catch (error) {
    console.error('❌ Error getting outdoor amenities:', error.response?.data || error.message)
    return { outdoorAmenitySections: [] }
  }
},

  getOutdoorAmenitiesByProjectId: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/outdoor-amenities`)
      return response.data
    } catch (error) {
      console.error('❌ Error getting outdoor amenities by project ID:', error.response?.data || error.message)
      return { outdoorAmenitySections: [] }
    }
  },

  // saveOutdoorAmenities: async (projectId, outdoorAmenitySections) => {
  //   try {
  //     const response = await api.put(`/projects/${projectId}/outdoor-amenities`, {
  //       outdoorAmenitySections
  //     })
  //     return response.data
  //   } catch (error) {
  //     console.error('❌ Error saving outdoor amenities:', error.response?.data || error.message)
  //     throw error
  //   }
  // },
  saveOutdoorAmenities: async (projectId, outdoorAmenitySections, floorNumber = null) => {
  try {
    const payload = {
      outdoorAmenitySections: outdoorAmenitySections.map(section => ({
        ...section,
        floorNumber: floorNumber || section.floorNumber || null
      }))
    }
    const response = await api.put(`/projects/${projectId}/outdoor-amenities`, payload)
    return response.data
  } catch (error) {
    console.error('❌ Error saving outdoor amenities:', error.response?.data || error.message)
    throw error
  }
},
}

export default uploadService