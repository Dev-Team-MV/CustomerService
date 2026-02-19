import api from './api'

const uploadService = {
  uploadImage: async (file, folder = '', fileName = '') => {
  try {
    const formData = new FormData()
    formData.append('image', file)
    if (folder) formData.append('folder', folder)
    if (fileName) formData.append('fileName', fileName)
      
      console.log(`📤 Uploading image to folder: ${folder || 'root'}`)
    const response = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.data.url
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload image')
  }
},

  uploadMultipleImages: async (files, folder = '') => {
    try {
      console.log(`📤 Uploading ${files.length} images to folder: ${folder || 'root'}`)
      
      const uploadPromises = files.map(file => uploadService.uploadImage(file, folder))
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

  // ========================================
  // ✅ CLUBHOUSE FUNCTIONS - ENDPOINTS CORREGIDOS
  // ========================================
uploadClubhouseImages: async (files, section, interiorKey = null) => {
    try {
      const formData = new FormData()
      
      // ✅ IMPORTANTE: Enviar section
      formData.append('section', section)
      
      // ✅ CORREGIDO: Enviar interiorKey solo si existe Y section es interior
      if (section === 'interior' && interiorKey) {
        console.log(`📤 Uploading to interior section: ${interiorKey}`)
        formData.append('interiorKey', interiorKey)
      }
      
      // ✅ Agregar archivos
      files.forEach(file => {
        formData.append('images', file)
      })

      console.log(`📤 Uploading ${files.length} image(s) to clubhouse/${section}${interiorKey ? `/${interiorKey}` : ''}`)

      const response = await api.post('/clubhouse/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      console.log('✅ Clubhouse images uploaded:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error uploading clubhouse images:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to upload clubhouse images')
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

  // Subir imágenes a storage y retorna URLs
  uploadOutdoorAmenityImages: async (files, amenityId) => {
    // Sube a storage, folder: outdoor-amenities/{amenityId}
    return await uploadService.uploadMultipleImages(files, `outdoor-amenities/${amenityId}`)
  },

  // Asignar imágenes a un amenity específico
  saveOutdoorAmenityImages: async (amenityId, urls) => {
    return api.post('/outdoor-amenities', {
      amenities: [{ id: amenityId, images: urls }]
    })
  }
}

export default uploadService