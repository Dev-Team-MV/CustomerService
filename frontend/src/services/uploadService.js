import api from './api'

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
      return response.data.data.url
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload image')
    }
  },

  uploadMultipleImages: async (files, folder = '', isPublic = true) => {
    try {
      console.log(`📤 Uploading ${files.length} images to folder: ${folder || 'root'}`)
      
      const uploadPromises = files.map(file => uploadService.uploadImage(file, folder, '', isPublic))
      const urls = await Promise.all(uploadPromises)
      
      console.log('✅ All images uploaded:', urls)
      return urls
    } catch (error) {
      console.error('❌ Error uploading images:', error)
      throw new Error(error.message || 'Failed to upload images')
    }
  },

  uploadContractFiles: async (files) => {
    try {
      console.log(`📤 Uploading ${files.length} contract file(s) to GCS...`)
      
      const uploadPromises = files.map(file => uploadService.uploadImage(file, 'contracts'))
      const urls = await Promise.all(uploadPromises)
      
      console.log('✅ All contract files uploaded:', urls)
      return urls
    } catch (error) {
      console.error('❌ Error uploading contract files:', error)
      throw new Error(error.message || 'Failed to upload contract files')
    }
  },

  uploadPaymentImage: async (file) => {
    return uploadService.uploadImage(file, 'payments')
  },

  uploadPhaseImages: async (files) => {
    return uploadService.uploadMultipleImages(files, 'construction-phases')
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
  
  uploadDeckClubHouse: async (file) => {
    return uploadService.uploadImage(file, 'deck')
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
        console.log('Uploading clubhouse batch:', { section, interiorKey, isPublic, filesCount: files.length });
        for (const entry of formData.entries()) {
          // eslint-disable-next-line no-console
          console.log('FormData entry:', entry[0], entry[1] instanceof File ? entry[1].name : entry[1]);
        }
      } catch (e) {
        // ignore in prod
      }

      const response = await api.post('/clubhouse/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
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
      console.log(`📂 Getting files from folder: ${folder}`)
      
      const response = await api.get('/upload/files', {
        params: { folder, urls }
      })

      console.log(`✅ Found ${response.data.files?.length || 0} files in ${folder}`)
      return response.data
    } catch (error) {
      console.error(`❌ Error getting files from folder ${folder}:`, error.response?.data || error.message)
      throw new Error(error.response?.data?.message || `Failed to get files from ${folder}`)
    }
  },

  getClubhouseInteriorKeys: async () => {
    try {
      console.log('📋 Getting clubhouse interior keys...')
      
      const response = await api.get('/clubhouse/interior-keys')

      console.log('✅ Interior keys loaded:', response.data.interiorKeys)
      return response.data
    } catch (error) {
      console.error('❌ Error getting clubhouse interior keys:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to get clubhouse interior keys')
    }
  },

    // Obtener todas las amenities exteriores
  getOutdoorAmenities: async () => {
    const res = await api.get('/outdoor-amenities')
    return res.data // { amenities: [...] }
  },

    getDeckFiles: async (urls = true) => {
    try {
      console.log('📂 Getting files from folder: deck')
      const response = await api.get('/upload/files', {
        params: { folder: 'deck', urls }
      })
      console.log(`✅ Found ${response.data.files?.length || 0} files in deck`)
      return response.data
    } catch (error) {
      console.error('❌ Error getting files from folder deck:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to get files from deck')
    }
  },

  // Obtener archivos de la carpeta 'clubhouse/deck' (por si el backend usa ese path)
  getClubhouseDeckFiles: async (urls = true) => {
    try {
      console.log('📂 Getting files from folder: clubhouse/deck')
      const response = await api.get('/upload/files', {
        params: { folder: 'clubhouse/deck', urls }
      })
      console.log(`✅ Found ${response.data.files?.length || 0} files in clubhouse/deck`)
      return response.data
    } catch (error) {
      console.error('❌ Error getting files from folder clubhouse/deck:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to get files from clubhouse/deck')
    }
  },
  
  // // Subir imágenes a storage y retorna URLs
  // uploadOutdoorAmenityImages: async (files, amenityName) => {
  //   // Sube a storage, folder: outdoor-amenities/{amenityName}
  //   return await uploadService.uploadMultipleImages(files, `outdoor-amenities/${amenityName}`)
  // },
    uploadOutdoorAmenityImages: async (filesWithVisibility, amenityName) => {
    const uploadPromises = filesWithVisibility.map(async ({ file, isPublic }) => {
      const url = await uploadService.uploadImage(file, `outdoor-amenities/${amenityName}`, '', isPublic);
      return { url, isPublic };
    });
    return await Promise.all(uploadPromises);
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
  return api.patch('/clubhouse/images/visibility', {
    section,
    index,
    isPublic,
    ...(section === 'interior' && { interiorKey })
  });
},

  /**
   * Actualiza visibilidad de imagen de recorrido.
   * payload: { filename?, identifier?, isPublic }
   * - filename: nombre exacto esperado por el backend (ej: "recorrido.1.jpg")
   * - identifier: url completa o identificador; si se pasa, se extrae filename automáticamente
   * - isPublic: boolean
   */
  updateRecorridoImageVisibility: async (payload) => {
    try {
      const { filename, identifier, isPublic } = payload || {};
      let fileToSend = filename;

      if (!fileToSend && identifier) {
        // si identifier es una URL, extraer el último segmento antes de los query params
        try {
          const url = String(identifier);
          const lastSegment = url.split('/').pop() || url;
          fileToSend = decodeURIComponent(lastSegment.split('?')[0]);
        } catch (e) {
          // fallback a identifier bruto
          fileToSend = identifier;
        }
      }

      if (!fileToSend) {
        throw new Error('updateRecorridoImageVisibility: missing filename or identifier');
      }

      const body = { filename: fileToSend, isPublic: !!isPublic };
      // PATCH a la ruta indicada
      const res = await api.patch('/upload/recorrido/visibility', body);
      return res.data;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('updateRecorridoImageVisibility error:', err.response?.data || err.message);
      throw err;
    }
  },

}

export default uploadService