import { sendSMSWithValidation } from '../services/twilioService.js'
import SMSTemplate from '../models/SMSTemplate.js'
import { notifySmsMessage } from '../utils/notificationTriggers.js'
import { buildMessageFromTemplate } from '../services/templateRenderService.js'
import { resolveVariablesForSend } from '../services/projectVariableResolverService.js'

async function mergeSendVariables({
  projectId,
  templateProjectId,
  userId,
  leadId,
  manualVariables = {}
}) {
  const { effectiveProjectId, variables } = await resolveVariablesForSend({
    projectId,
    templateProjectId,
    userId,
    leadId,
    manualVariables
  })

  return { effectiveProjectId, variables }
}

function handleTwilioError(error, res) {
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
  return null
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

    await notifySmsMessage({
      to,
      message,
      actor: req.user,
      userId: req.body.userId
    })

    res.status(200).json({
      success: true,
      message: 'SMS sent successfully',
      data: result
    })
  } catch (error) {
    const twilioResponse = handleTwilioError(error, res)
    if (twilioResponse) return twilioResponse

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
    const { to, template, variables = {}, projectId, userId, leadId } = req.body

    if (!to || !template) {
      return res.status(400).json({
        success: false,
        message: 'Phone number (to) and template are required'
      })
    }

    const { effectiveProjectId, variables: mergedVariables } = await mergeSendVariables({
      projectId,
      userId,
      leadId,
      manualVariables: variables
    })

    const { renderedMessage, missingVariables } = buildMessageFromTemplate(template, mergedVariables)

    if (missingVariables.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing values for one or more template variables',
        missingVariables,
        projectId: effectiveProjectId,
        resolvedVariables: mergedVariables
      })
    }

    const result = await sendSMSWithValidation(to, renderedMessage)

    await notifySmsMessage({
      to,
      message: renderedMessage,
      actor: req.user,
      userId: req.body.userId || userId
    })

    res.status(200).json({
      success: true,
      message: 'Template SMS sent successfully',
      data: {
        ...result,
        renderedMessage,
        projectId: effectiveProjectId,
        resolvedVariables: mergedVariables
      }
    })
  } catch (error) {
    const twilioResponse = handleTwilioError(error, res)
    if (twilioResponse) return twilioResponse

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Send SMS using an existing templateId and variables
 */
export const sendSMSByTemplateId = async (req, res) => {
  try {
    const { to, templateId, variables = {}, projectId, userId, leadId } = req.body

    if (!to || !templateId) {
      return res.status(400).json({
        success: false,
        message: 'Phone number (to) and templateId are required'
      })
    }

    const storedTemplate = await SMSTemplate.findById(templateId)
    if (!storedTemplate) {
      return res.status(404).json({
        success: false,
        message: 'SMS template not found'
      })
    }

    if (!storedTemplate.isActive) {
      return res.status(400).json({
        success: false,
        message: 'SMS template is inactive and cannot be used'
      })
    }

    const { effectiveProjectId, variables: mergedVariables } = await mergeSendVariables({
      projectId,
      templateProjectId: storedTemplate.projectId,
      userId,
      leadId,
      manualVariables: variables
    })

    const { renderedMessage, missingVariables } = buildMessageFromTemplate(
      storedTemplate.template,
      mergedVariables
    )

    if (missingVariables.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing values for one or more template variables',
        missingVariables,
        templateId: storedTemplate._id,
        templateName: storedTemplate.name,
        requiredPlaceholders: storedTemplate.placeholders || [],
        projectId: effectiveProjectId,
        resolvedVariables: mergedVariables
      })
    }

    const result = await sendSMSWithValidation(to, renderedMessage)

    await notifySmsMessage({
      to,
      message: renderedMessage,
      actor: req.user,
      userId: req.body.userId || userId
    })

    res.status(200).json({
      success: true,
      message: 'Template SMS sent successfully',
      data: {
        ...result,
        templateId: storedTemplate._id,
        templateName: storedTemplate.name,
        renderedMessage,
        projectId: effectiveProjectId,
        resolvedVariables: mergedVariables
      }
    })
  } catch (error) {
    const twilioResponse = handleTwilioError(error, res)
    if (twilioResponse) return twilioResponse

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Preview SMS rendering using an existing templateId and variables
 */
export const previewSMSByTemplateId = async (req, res) => {
  try {
    const { templateId, variables = {}, projectId, userId, leadId } = req.body

    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: 'templateId is required'
      })
    }

    const storedTemplate = await SMSTemplate.findById(templateId)
    if (!storedTemplate) {
      return res.status(404).json({
        success: false,
        message: 'SMS template not found'
      })
    }

    const { effectiveProjectId, variables: mergedVariables } = await mergeSendVariables({
      projectId,
      templateProjectId: storedTemplate.projectId,
      userId,
      leadId,
      manualVariables: variables
    })

    const { renderedMessage, missingVariables } = buildMessageFromTemplate(
      storedTemplate.template,
      mergedVariables
    )

    res.status(200).json({
      success: true,
      message: 'Template preview generated successfully',
      data: {
        templateId: storedTemplate._id,
        templateName: storedTemplate.name,
        isActive: storedTemplate.isActive,
        renderedMessage,
        missingVariables,
        requiredPlaceholders: storedTemplate.placeholders || [],
        projectId: effectiveProjectId,
        resolvedVariables: mergedVariables
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
