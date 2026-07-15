// // frontend/apps/mv-crm/src/services/smsService.js
// import api from '@shared/services/api'

// const smsService = {
//   // Enviar SMS directo
//   send: async (to, message) => {
//     const res = await api.post('/sms/send', { to, message })
//     return res.data
//   },

//   // Enviar SMS con template
//   sendTemplate: async (to, template, variables = {}) => {
//     const res = await api.post('/sms/send-template', { to, template, variables })
//     return res.data
//   },

//   // Envío masivo (itera sobre destinatarios)
//   sendBulk: async (recipients, message, onProgress) => {
//     const results = {
//       success: [],
//       failed: []
//     }

//     for (let i = 0; i < recipients.length; i++) {
//       const recipient = recipients[i]
//       try {
//         const result = await api.post('/sms/send', {
//           to: recipient.phoneNumber,
//           message
//         })
//         results.success.push({ ...recipient, result: result.data })
//       } catch (err) {
//         results.failed.push({ 
//           ...recipient, 
//           error: err.response?.data?.message || err.message 
//         })
//       }
//       // Callback de progreso
//       onProgress?.({
//         current: i + 1,
//         total: recipients.length,
//         percent: Math.round(((i + 1) / recipients.length) * 100)
//       })
//     }

//     return results
//   },

//   // Envío masivo con template
//   sendBulkTemplate: async (recipients, template, getVariables, onProgress) => {
//     const results = {
//       success: [],
//       failed: []
//     }

//     for (let i = 0; i < recipients.length; i++) {
//       const recipient = recipients[i]
//       try {
//         const variables = getVariables(recipient)
//         const result = await api.post('/sms/send-template', {
//           to: recipient.phoneNumber,
//           template,
//           variables
//         })
//         results.success.push({ ...recipient, result: result.data })
//       } catch (err) {
//         results.failed.push({ 
//           ...recipient, 
//           error: err.response?.data?.message || err.message 
//         })
//       }
//       onProgress?.({
//         current: i + 1,
//         total: recipients.length,
//         percent: Math.round(((i + 1) / recipients.length) * 100)
//       })
//     }

//     return results
//   },

//   // Agregar al final del archivo smsService.js, antes del export

//   // Preview de template (no envía, solo renderiza)
//   previewTemplate: async (templateId, variables = {}) => {
//     const res = await api.post('/sms/preview-template', { templateId, variables })
//     return res.data
//   },

//   // Enviar SMS usando template guardado (por ID)
//   sendByTemplate: async (to, templateId, variables = {}) => {
//     const res = await api.post('/sms/send-by-template', { to, templateId, variables })
//     return res.data
//   },

//   // Envío masivo usando template guardado
//   sendBulkByTemplate: async (recipients, templateId, getVariables, onProgress) => {
//     const results = {
//       success: [],
//       failed: []
//     }

//     for (let i = 0; i < recipients.length; i++) {
//       const recipient = recipients[i]
//       try {
//         const variables = getVariables(recipient)
//         const result = await api.post('/sms/send-by-template', {
//           to: recipient.phoneNumber,
//           templateId,
//           variables
//         })
//         results.success.push({ ...recipient, result: result.data })
//       } catch (err) {
//         results.failed.push({ 
//           ...recipient, 
//           error: err.response?.data?.message || err.message 
//         })
//       }
//       onProgress?.({
//         current: i + 1,
//         total: recipients.length,
//         percent: Math.round(((i + 1) / recipients.length) * 100)
//       })
//     }

//     return results
//   }
// }

// export default smsService

// frontend/apps/mv-crm/src/services/smsService.js
import api from '@shared/services/api'

const smsService = {
  // ═══════════════════════════════════════════════════════════════
  // ENVÍO DIRECTO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Enviar SMS directo
   * @param {string} to - Número de teléfono
   * @param {string} message - Mensaje
   * @param {Object} options - { projectId, userId, leadId }
   */
  send: async (to, message, options = {}) => {
    const res = await api.post('/sms/send', { 
      to, 
      message,
      projectId: options.projectId || null,
      userId: options.userId || null,
      leadId: options.leadId || null
    })
    return res.data
  },

  /**
   * Enviar SMS con template inline (string)
   * @param {string} to - Número de teléfono
   * @param {string} template - Texto del template con {{variables}}
   * @param {Object} variables - Variables manuales
   * @param {Object} options - { projectId, userId, leadId }
   */
  sendTemplate: async (to, template, variables = {}, options = {}) => {
    const res = await api.post('/sms/send-template', { 
      to, 
      template, 
      variables,
      projectId: options.projectId || null,
      userId: options.userId || null,
      leadId: options.leadId || null
    })
    return res.data
  },

  // ═══════════════════════════════════════════════════════════════
  // ENVÍO POR TEMPLATE ID
  // ═══════════════════════════════════════════════════════════════

  /**
   * Preview de template (no envía, solo renderiza)
   * @param {string} templateId - ID del template
   * @param {Object} variables - Variables manuales
   * @param {Object} options - { projectId, userId, leadId }
   */
  previewTemplate: async (templateId, variables = {}, options = {}) => {
    const res = await api.post('/sms/preview-template', { 
      templateId, 
      variables,
      projectId: options.projectId || null,
      userId: options.userId || null,
      leadId: options.leadId || null
    })
    return res.data
  },

  /**
   * Enviar SMS usando template guardado (por ID)
   * @param {string} to - Número de teléfono
   * @param {string} templateId - ID del template
   * @param {Object} variables - Variables manuales
   * @param {Object} options - { projectId, userId, leadId }
   */
  sendByTemplate: async (to, templateId, variables = {}, options = {}) => {
    const res = await api.post('/sms/send-by-template', { 
      to, 
      templateId, 
      variables,
      projectId: options.projectId || null,
      userId: options.userId || null,
      leadId: options.leadId || null
    })
    return res.data
  },

  // ═══════════════════════════════════════════════════════════════
  // ENVÍO MASIVO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Envío masivo (itera sobre destinatarios)
   * @param {Array} recipients - Lista de destinatarios
   * @param {string} message - Mensaje
   * @param {Function} onProgress - Callback de progreso
   * @param {Object} options - { projectId }
   */
  sendBulk: async (recipients, message, onProgress, options = {}) => {
    const results = {
      success: [],
      failed: []
    }

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i]
      try {
        const result = await api.post('/sms/send', {
          to: recipient.phoneNumber,
          message,
          projectId: options.projectId || null,
          userId: recipient._id || null
        })
        results.success.push({ ...recipient, result: result.data })
      } catch (err) {
        results.failed.push({ 
          ...recipient, 
          error: err.response?.data?.message || err.message 
        })
      }
      onProgress?.({
        current: i + 1,
        total: recipients.length,
        percent: Math.round(((i + 1) / recipients.length) * 100)
      })
    }

    return results
  },

  /**
   * Envío masivo con template inline
   * @param {Array} recipients - Lista de destinatarios
   * @param {string} template - Texto del template
   * @param {Function} getVariables - Función que recibe recipient y retorna variables
   * @param {Function} onProgress - Callback de progreso
   * @param {Object} options - { projectId }
   */
  sendBulkTemplate: async (recipients, template, getVariables, onProgress, options = {}) => {
    const results = {
      success: [],
      failed: []
    }

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i]
      try {
        const variables = getVariables(recipient)
        const result = await api.post('/sms/send-template', {
          to: recipient.phoneNumber,
          template,
          variables,
          projectId: options.projectId || null,
          userId: recipient._id || null
        })
        results.success.push({ ...recipient, result: result.data })
      } catch (err) {
        results.failed.push({ 
          ...recipient, 
          error: err.response?.data?.message || err.message 
        })
      }
      onProgress?.({
        current: i + 1,
        total: recipients.length,
        percent: Math.round(((i + 1) / recipients.length) * 100)
      })
    }

    return results
  },

  /**
   * Envío masivo usando template guardado
   * @param {Array} recipients - Lista de destinatarios
   * @param {string} templateId - ID del template
   * @param {Function} getVariables - Función que recibe recipient y retorna variables
   * @param {Function} onProgress - Callback de progreso
   * @param {Object} options - { projectId }
   */
  sendBulkByTemplate: async (recipients, templateId, getVariables, onProgress, options = {}) => {
    const results = {
      success: [],
      failed: []
    }

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i]
      try {
        const variables = getVariables(recipient)
        const result = await api.post('/sms/send-by-template', {
          to: recipient.phoneNumber,
          templateId,
          variables,
          projectId: options.projectId || null,
          userId: recipient._id || null
        })
        results.success.push({ ...recipient, result: result.data })
      } catch (err) {
        results.failed.push({ 
          ...recipient, 
          error: err.response?.data?.message || err.message 
        })
      }
      onProgress?.({
        current: i + 1,
        total: recipients.length,
        percent: Math.round(((i + 1) / recipients.length) * 100)
      })
    }

    return results
  }
}

export default smsService