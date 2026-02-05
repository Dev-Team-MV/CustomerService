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
  
  const message = `Welcome to Customer Service! 🏡\n\n` +
    `Hello ${firstName},\n\n` +
    `Your account has been successfully created.\n` +
    `Email: ${email}\n\n` +
    `You can log in at: ${window.location.origin}\n\n` +
    `Thank you for trusting us!`


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
  
  const message = `🏡 Property Assigned!\n\n` +
    `Hello ${firstName},\n\n` +
    `A new property has been assigned to you:\n\n` +
    `📍 Lot: ${lotNumber} - Section ${section}\n` +
    `🏠 Model: ${modelName}\n` +
    `💰 Price: $${price?.toLocaleString() || 'N/A'}\n` +
    `📊 Status: ${status || 'Reserved'}\n\n` +
    `Log in to your portal for more details: ${window.location.origin}/my-property\n\n` +
    `Congratulations on your new property!`

  return await sendSMS(phoneNumber, message)
}

export default {
  sendSMS,
  sendWelcomeSMS,
  sendPropertyAssignmentSMS
}