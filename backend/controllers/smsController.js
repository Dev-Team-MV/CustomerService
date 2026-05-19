import { sendSMSWithValidation } from '../services/twilioService.js'

const getTemplateValue = (variables, key) => {
  if (!variables || typeof variables !== 'object') return undefined

  return key.split('.').reduce((accumulator, currentKey) => {
    if (accumulator === null || accumulator === undefined) return undefined
    return accumulator[currentKey]
  }, variables)
}

const buildMessageFromTemplate = (template, variables = {}) => {
  if (!template || typeof template !== 'string') {
    throw new Error('Template must be a non-empty string')
  }

  const missingVariables = new Set()
  const renderedMessage = template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key) => {
    const value = getTemplateValue(variables, key)

    if (value === undefined || value === null) {
      missingVariables.add(key)
      return ''
    }

    return String(value)
  })

  return {
    renderedMessage,
    missingVariables: [...missingVariables]
  }
}

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

/**
 * Send SMS using a template and variables
 */
export const sendSMSTemplate = async (req, res) => {
  try {
    const { to, template, variables = {} } = req.body

    if (!to || !template) {
      return res.status(400).json({
        success: false,
        message: 'Phone number (to) and template are required'
      })
    }

    const { renderedMessage, missingVariables } = buildMessageFromTemplate(template, variables)

    if (missingVariables.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing values for one or more template variables',
        missingVariables
      })
    }

    const result = await sendSMSWithValidation(to, renderedMessage)

    res.status(200).json({
      success: true,
      message: 'Template SMS sent successfully',
      data: {
        ...result,
        renderedMessage
      }
    })
  } catch (error) {
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
