import api from '@shared/services/api'

const uploadService = {
  // ========================================
  // CORE UPLOAD FUNCTIONS
  // ========================================
  
  uploadImage: async (file, folder = '', fileName = '', isPublic = true) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      if (folder) formData.append('folder', folder)
      if (fileName) formData.append('fileName', fileName)
      formData.append('isPublic', isPublic)
  
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
      const uploadPromises = files.map(file => uploadService.uploadImage(file, folder, '', isPublic))
      const urls = await Promise.all(uploadPromises)
      return urls
    } catch (error) {
      console.error('❌ Error uploading images:', error)
      throw new Error(error.message || 'Failed to upload images')
    }
  },

  // ========================================
  // BUILDING-SPECIFIC FUNCTIONS
  // ========================================

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

  // ========================================
  // APARTMENT-SPECIFIC FUNCTIONS
  // ========================================

  uploadApartmentModelFloorPlan: async (file, isPublic = true) => {
    return uploadService.uploadImage(file, 'apartments/models/floor-plans', '', isPublic)
  },

  uploadApartmentInteriorBasic: async (file, isPublic = true) => {
    return uploadService.uploadImage(file, 'apartments/interior/basic', '', isPublic)
  },

  uploadApartmentInteriorUpgrade: async (file, isPublic = true) => {
    return uploadService.uploadImage(file, 'apartments/interior/upgrade', '', isPublic)
  },

  uploadApartmentInteriorImages: async (files, type = 'basic', isPublic = true) => {
    const folder = `apartments/interior/${type}`
    return uploadService.uploadMultipleImages(files, folder, isPublic)
  },

  // ========================================
  // PROPERTY-SPECIFIC FUNCTIONS
  // ========================================

  uploadPropertyImage: async (file, isPublic = true) => {
    return uploadService.uploadImage(file, 'properties', '', isPublic)
  },

  uploadPhaseImages: async (files, isPublic = true) => {
    return uploadService.uploadMultipleImages(files, 'construction-phases', isPublic)
  },

  uploadPhaseVideos: async (files, isPublic = true) => {
    return uploadService.uploadMultipleImages(files, 'construction-phases/videos', isPublic)
  },

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  getFilesByFolder: async (folder, urls = true) => {
    try {
      const response = await api.get('/upload/files', {
        params: { folder, urls }
      })
      return response.data
    } catch (error) {
      console.error(`❌ Error getting files from folder ${folder}:`, error.response?.data || error.message)
      throw new Error(error.response?.data?.message || `Failed to get files from ${folder}`)
    }
  },

  deleteImage: async (filename) => {
    try {
      const response = await api.delete('/upload/image', {
        data: { filename }
      })
      return response.data
    } catch (error) {
      console.error('❌ Error deleting image:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete image')
    }
  },

    // Sube una imagen de render interior básico de apartamento
  uploadApartmentInteriorBasic: async (file, isPublic = true) => {
    return uploadService.uploadImage(file, 'apartments/interior/basic', '', isPublic)
  },

  // Sube una imagen de render interior upgrade de apartamento
  uploadApartmentInteriorUpgrade: async (file, isPublic = true) => {
    return uploadService.uploadImage(file, 'apartments/interior/upgrade', '', isPublic)
  },

  // Sube múltiples imágenes de renders interiores (basic o upgrade)
  uploadApartmentInteriorImages: async (files, type = 'basic', isPublic = true) => {
    const folder = `apartments/interior/${type}`
    return uploadService.uploadMultipleImages(files, folder, isPublic)
  },
}

export default uploadService