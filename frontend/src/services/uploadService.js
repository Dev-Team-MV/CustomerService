import api from './api'

const uploadService = {
  /**
   * Subir una sola imagen
   */
  uploadImage: async (file, folder = '') => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      if (folder) {
        formData.append('folder', folder)
      }

      console.log(`📤 Uploading image to folder: ${folder || 'root'}`)

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('✅ Image uploaded:', response.data)
      return response.data.data.url
    } catch (error) {
      console.error('❌ Error uploading image:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to upload image')
    }
  },

  /**
   * Subir múltiples imágenes (una por una)
   */
  uploadMultipleImages: async (files, folder = '') => {
    try {
      console.log(`📤 Uploading ${files.length} images to folder: ${folder || 'root'}`)
      
      // Subir cada imagen individualmente
      const uploadPromises = files.map(file => uploadService.uploadImage(file, folder))
      const urls = await Promise.all(uploadPromises)
      
      console.log('✅ All images uploaded:', urls)
      return urls
    } catch (error) {
      console.error('❌ Error uploading images:', error)
      throw new Error(error.message || 'Failed to upload images')
    }
  },

  /**
   * Subir imagen de payment/payload
   */
  uploadPaymentImage: async (file) => {
    return uploadService.uploadImage(file, 'payments')
  },

  /**
   * Subir imágenes de fases de construcción
   */
  uploadPhaseImages: async (files) => {
    return uploadService.uploadMultipleImages(files, 'construction-phases')
  },

  /**
   * Subir imagen de fachada
   */
  uploadFacadeImage: async (file) => {
    return uploadService.uploadImage(file, 'facades')
  },

  /**
   * Subir imagen de modelo
   */
  uploadModelImage: async (file) => {
    return uploadService.uploadImage(file, 'models')
  },

  /**
   * Subir imagen de lote
   */
  uploadLotImage: async (file) => {
    return uploadService.uploadImage(file, 'lots')
  },

  /**
   * Subir imagen de upgrade
   */
  uploadUpgradeImage: async (file) => {
    return uploadService.uploadImage(file, 'upgrades')
  }
}

export default uploadService