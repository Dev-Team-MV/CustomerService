import api from './api'

/**
 * Servicio para enviar SMS a través del backend
 */

/**
 * Enviar SMS usando el endpoint del backend
 */
export const sendSMS = async (to, message) => {
  try {
    const response = await api.post('/sms/send', {
      to,
      message
    })
    
    console.log('✅ SMS sent successfully:', response.data)
    return {
      success: true,
      ...response.data
    }
  } catch (error) {
    console.error('❌ Error sending SMS:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

/**
 * Enviar SMS de bienvenida al registrar usuario
 */
export const sendWelcomeSMS = async (userInfo) => {
  const { firstName, email, phoneNumber } = userInfo
  
  const message = `¡Bienvenido a Customer Service! 🏡\n\n` +
    `Hola ${firstName},\n\n` +
    `Tu cuenta ha sido creada exitosamente.\n` +
    `Email: ${email}\n\n` +
    `Puedes iniciar sesión en: ${window.location.origin}\n\n` +
    `¡Gracias por confiar en nosotros!`

  return await sendSMS(phoneNumber, message)
}

/**
 * Enviar SMS de asignación de propiedad
 */
export const sendPropertyAssignmentSMS = async (propertyInfo) => {
  const { 
    firstName, 
    phoneNumber, 
    lotNumber, 
    section, 
    modelName, 
    price, 
    status 
  } = propertyInfo
  
  const message = `🏡 ¡Propiedad Asignada!\n\n` +
    `Hola ${firstName},\n\n` +
    `Se te ha asignado una nueva propiedad:\n\n` +
    `📍 Lote: ${lotNumber} - Sección ${section}\n` +
    `🏠 Modelo: ${modelName}\n` +
    `💰 Precio: $${price?.toLocaleString() || 'N/A'}\n` +
    `📊 Estado: ${status || 'Reservado'}\n\n` +
    `Ingresa a tu portal para ver más detalles: ${window.location.origin}/my-property\n\n` +
    `¡Felicidades por tu nueva propiedad!`

  return await sendSMS(phoneNumber, message)
}

export default {
  sendSMS,
  sendWelcomeSMS,
  sendPropertyAssignmentSMS
}