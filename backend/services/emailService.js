import nodemailer from 'nodemailer'

const smtpHost = process.env.SMTP_HOST
const smtpPort = Number.parseInt(process.env.SMTP_PORT || '587', 10)
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const smtpFrom = process.env.SMTP_FROM || smtpUser

const isConfigured = Boolean(smtpHost && smtpFrom)

if (!isConfigured) {
  console.warn('SMTP not configured. Email OTP functionality will be disabled.')
  console.warn('Missing variables:', {
    SMTP_HOST: !smtpHost ? 'SMTP_HOST' : '✓',
    SMTP_FROM: !smtpFrom ? 'SMTP_FROM' : '✓'
  })
}

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined
    })
  : null

export function isEmailConfigured () {
  return isConfigured
}

/**
 * Send a plain-text email.
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 */
export async function sendEmail ({ to, subject, text }) {
  if (!transporter) {
    throw new Error('Email service is not configured. Please set SMTP environment variables.')
  }

  if (!to || !subject || !text) {
    throw new Error('to, subject and text are required')
  }

  const info = await transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    text
  })

  return {
    success: true,
    messageId: info.messageId,
    to
  }
}

export async function sendPasswordResetOtpEmail ({ to, firstName, code }) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,'
  const subject = 'Your password reset verification code'
  const text = `${greeting}

Your verification code is: ${code}

This code expires in 10 minutes. If you did not request a password reset, you can ignore this email.`

  return sendEmail({ to, subject, text })
}
