import { sendSMSWithValidation } from '../services/twilioService.js'

/**
 * Send SMS
 */
export const sendSMS = async (req, res) => {
  try {
    const { to, message } = req.body

    if (!to || !message) {
      return res.status(400).json({ 
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
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
}
