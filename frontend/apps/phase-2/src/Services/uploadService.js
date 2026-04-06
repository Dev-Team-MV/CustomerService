// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/services/uploadService.js

import api from '@shared/services/api'

const PHASE_2_PROJECT_SLUG = 'lakewood-f2'

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
  // OUTDOOR AMENITIES FUNCTIONS
  // ========================================

  /**
   * Get outdoor amenities by project slug (for Phase 2)
   * GET /api/projects/slug/:slug/outdoor-amenities
   */
  getOutdoorAmenitiesBySlug: async (slug = PHASE_2_PROJECT_SLUG) => {
    try {
      const response = await api.get(`/projects/slug/${slug}/outdoor-amenities`)
      return response.data
    } catch (error) {
      console.error('❌ Error getting outdoor amenities:', error.response?.data || error.message)
      return { outdoorAmenitySections: [] }
    }
  },

  /**
   * Get outdoor amenities by project ID (for admin)
   * GET /api/projects/:id/outdoor-amenities
   */
  getOutdoorAmenitiesByProjectId: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/outdoor-amenities`)
      return response.data
    } catch (error) {
      console.error('❌ Error getting outdoor amenities by project ID:', error.response?.data || error.message)
      return { outdoorAmenitySections: [] }
    }
  },

  /**
   * Upload outdoor amenity images for a specific amenity key
   * Returns array of { url, isPublic }
   */
  uploadOutdoorAmenityImages: async (filesWithVisibility, amenityKey) => {
    try {
      const uploadPromises = filesWithVisibility.map(async ({ file, isPublic }) => {
        const url = await uploadService.uploadImage(
          file, 
          `outdoor-amenities/${amenityKey}`, 
          '', 
          isPublic
        )
        return { url, isPublic }
      })
      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error('❌ Error uploading outdoor amenity images:', error)
      throw error
    }
  },

  /**
   * Save/update outdoor amenities for a project
   * PUT /api/projects/:id/outdoor-amenities
   * Body: { outdoorAmenitySections: [{ key, images: [{ url, isPublic }] }] }
   */
  saveOutdoorAmenities: async (projectId, outdoorAmenitySections) => {
    try {
      const response = await api.put(`/projects/${projectId}/outdoor-amenities`, {
        outdoorAmenitySections
      })
      return response.data
    } catch (error) {
      console.error('❌ Error saving outdoor amenities:', error.response?.data || error.message)
      throw error
    }
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
}

export default uploadService