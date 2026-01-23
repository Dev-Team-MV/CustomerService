import { sendSMSWithValidation } from '../services/twilioService.js'

/**
 * Send SMS
 */
export const sendSMS = async (req, res) => {
  try {
    const { to, message } = req.body

    if (!to || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number (to) and message are required' 
      })
    }

    const result = await sendSMSWithValidation(to, message)

    res.status(200).json({
      success: true,
      message: 'SMS sent successfully',
      data: result
    })
  } catch (error) {
    // Check if it's a Twilio configuration error
    if (error.message.includes('Twilio client not initialized')) {
      return res.status(503).json({ 
        success: false,
        message: 'SMS service is not configured. Please configure Twilio credentials in environment variables.',
        error: 'Twilio client not initialized. Please check your credentials.',
        requiredEnvVars: [
          'TWILIO_ACCOUNT_SID',
          'TWILIO_AUTH_TOKEN',
          'TWILIO_PHONE_FROM'
        ]
      })
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
}
