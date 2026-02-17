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
   * Subir archivos de contratos (PDF, DOC, DOCX)
   * @param {File[]} files - Array de archivos de contratos
   * @returns {Promise<string[]>} Array de URLs de archivos subidos
   */
  uploadContractFiles: async (files) => {
    try {
      console.log(`📤 Uploading ${files.length} contract file(s) to GCS...`)
      
      // Subir cada contrato individualmente usando la misma lógica que las imágenes
      const uploadPromises = files.map(file => uploadService.uploadImage(file, 'contracts'))
      const urls = await Promise.all(uploadPromises)
      
      console.log('✅ All contract files uploaded:', urls)
      return urls
    } catch (error) {
      console.error('❌ Error uploading contract files:', error)
      throw new Error(error.message || 'Failed to upload contract files')
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
  },

  /**
   * Subir imagen de clubhouse (método legacy - mantener por compatibilidad)
   */
  uploadClubhouseImage: async (file) => {
    return uploadService.uploadImage(file, 'clubhouse')
  },

  // ========================================
  // ✅ NUEVAS FUNCIONES PARA CLUBHOUSE
  // ========================================

  /**
   * Subir imágenes al Clubhouse con secciones específicas
   * @param {File[]} files - Array de archivos de imagen
   * @param {string} section - Sección: 'exterior' | 'blueprints' | 'interior'
   * @param {string|null} interiorKey - Requerido cuando section='interior' (ej: 'Reception', 'Manager Office')
   * @returns {Promise<{urls: string[]}>} URLs de las imágenes subidas
   */
  uploadClubhouseImages: async (files, section, interiorKey = null) => {
    try {
      const formData = new FormData()
      formData.append('section', section)
      
      if (section === 'interior' && interiorKey) {
        formData.append('interiorKey', interiorKey)
      }
      
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

  /**
   * Obtener archivos de una carpeta específica en GCS
   * @param {string} folder - Nombre de la carpeta (ej: 'clubhouse', 'models', 'payloads')
   * @param {boolean} urls - Incluir URLs públicas (default: true)
   * @returns {Promise<{files: Array}>} Lista de archivos con metadata
   */
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

  /**
   * Obtener las claves válidas para amenidades interiores del clubhouse
   * @returns {Promise<{keys: string[]}>} Array de nombres de secciones interiores
   */
  getClubhouseInteriorKeys: async () => {
    try {
      console.log('📋 Getting clubhouse interior keys...')
      
      const response = await api.get('/clubhouse/interior-keys')

      console.log('✅ Interior keys loaded:', response.data.keys)
      return response.data
    } catch (error) {
      console.error('❌ Error getting clubhouse interior keys:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to get clubhouse interior keys')
    }
  }
}

export default uploadService