import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const phoneFrom = process.env.TWILIO_PHONE_FROM

if (!accountSid || !authToken || !phoneFrom) {
  console.warn('Twilio credentials not configured. SMS functionality will be disabled.')
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null

/**
 * Send SMS message
 * @param {string} to - Phone number to send to (E.164 format: +1234567890)
 * @param {string} message - Message body
 * @returns {Promise<Object>} Twilio message object
 */
export const sendSMS = async (to, message) => {
  if (!client) {
    throw new Error('Twilio client not initialized. Please check your credentials.')
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: phoneFrom,
      to: to
    })

    console.log(`SMS sent successfully. SID: ${result.sid}`)
    return {
      success: true,
      messageSid: result.sid,
      status: result.status,
      to: result.to,
      from: result.from
    }
  } catch (error) {
    console.error('Error sending SMS:', error.message)
    throw new Error(`Failed to send SMS: ${error.message}`)
  }
}

/**
 * Send SMS with validation
 * @param {string} to - Phone number to send to
 * @param {string} message - Message body
 * @returns {Promise<Object>} Result object
 */
export const sendSMSWithValidation = async (to, message) => {
  // Validate phone number format (basic E.164 format check)
  if (!to || !to.startsWith('+')) {
    throw new Error('Phone number must be in E.164 format (e.g., +1234567890)')
  }

  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty')
  }

  if (message.length > 1600) {
    throw new Error('Message is too long. Maximum 1600 characters.')
  }

  return await sendSMS(to, message)
}

export default {
  sendSMS,
  sendSMSWithValidation
}
