// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/Services/communitySpacesService.js

import api from '@shared/services/api'

const PHASE_2_PROJECT_SLUG = 'lakewood-f2'

const communitySpacesService = {
  /**
   * Get community space data by project ID and space ID
   * GET /api/projects/:id/community-spaces/:spaceId
   */
  getCommunitySpaceByProjectId: async (projectId, spaceId) => {
    try {
      const response = await api.get(`/projects/${projectId}/community-spaces/${spaceId}`)
      console.log(`🏛️ [CommunitySpaces] Fetched ${spaceId} for project ${projectId}:`, response.data)
      return response.data
    } catch (error) {
      console.error(`❌ [CommunitySpaces] Error fetching ${spaceId}:`, error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Get community space data by project slug and space ID
   * GET /api/projects/slug/:slug/community-spaces/:spaceId
   */
  getCommunitySpaceBySlug: async (slug = PHASE_2_PROJECT_SLUG, spaceId = 'agora') => {
    try {
      const response = await api.get(`/projects/slug/${slug}/community-spaces/${spaceId}`)
      console.log(`🏛️ [CommunitySpaces] Fetched ${spaceId} for slug ${slug}:`, response.data)
      return response.data
    } catch (error) {
      console.error(`❌ [CommunitySpaces] Error fetching ${spaceId} by slug:`, error.response?.data || error.message)
      // Return empty structure if not found
      return {
        label: spaceId.charAt(0).toUpperCase() + spaceId.slice(1),
        sections: {
          exterior: { title: { en: 'Exteriors', es: 'Exteriores' }, images: [] },
          planos: { items: [] }
        }
      }
    }
  },

  /**
   * Update community space data
   * PUT /api/projects/:id/community-spaces/:spaceId
   */
  updateCommunitySpace: async (projectId, spaceId, data) => {
    try {
      const response = await api.put(`/projects/${projectId}/community-spaces/${spaceId}`, {
        id: spaceId,
        ...data
      })
      console.log(`✅ [CommunitySpaces] Updated ${spaceId}:`, response.data)
      return response.data
    } catch (error) {
      console.error(`❌ [CommunitySpaces] Error updating ${spaceId}:`, error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Upload images for a specific section of a community space
   */
  uploadCommunitySpaceImages: async (filesWithVisibility, spaceId, section) => {
    try {
      const uploadPromises = filesWithVisibility.map(async ({ file, isPublic }) => {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('folder', `community-spaces/${spaceId}/${section}`)
        formData.append('isPublic', isPublic)

        const response = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        return {
          url: response.data.data.url,
          isPublic
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)
      console.log(`✅ [CommunitySpaces] Uploaded ${uploadedImages.length} images for ${spaceId}/${section}`)
      return uploadedImages
    } catch (error) {
      console.error(`❌ [CommunitySpaces] Error uploading images:`, error)
      throw error
    }
  }
}

export default communitySpacesService