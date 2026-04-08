import api from './api'

const communitySpacesService = {
  getCommunitySpaceByProjectId: async (projectId, spaceId) => {
    try {
      const response = await api.get(`/projects/${projectId}/community-spaces/${spaceId}`)
      return response.data
    } catch (error) {
      console.error(`❌ [CommunitySpaces] Error fetching ${spaceId}:`, error.response?.data || error.message)
      throw error
    }
  },

  getCommunitySpaceBySlug: async (slug, spaceId) => {
    try {
      const response = await api.get(`/projects/slug/${slug}/community-spaces/${spaceId}`)
      return response.data
    } catch (error) {
      console.error(`❌ [CommunitySpaces] Error fetching ${spaceId} by slug:`, error.response?.data || error.message)
      return {
        label: spaceId.charAt(0).toUpperCase() + spaceId.slice(1),
        sections: {
          exterior: { title: { en: 'Exteriors', es: 'Exteriores' }, images: [] },
          planos: { items: [] }
        }
      }
    }
  },

  updateCommunitySpace: async (projectId, spaceId, data) => {
    try {
      const response = await api.put(`/projects/${projectId}/community-spaces/${spaceId}`, {
        id: spaceId,
        ...data
      })
      return response.data
    } catch (error) {
      console.error(`❌ [CommunitySpaces] Error updating ${spaceId}:`, error.response?.data || error.message)
      throw error
    }
  },

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
        
        return { url: response.data.data.url, isPublic }
      })

      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error(`❌ [CommunitySpaces] Error uploading images:`, error)
      throw error
    }
  }
}

export default communitySpacesService