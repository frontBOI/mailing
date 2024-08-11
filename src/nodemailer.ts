import { SendMailParams } from './../types/nodemailer.d'
import { forgeAccessToken } from './google'
import { checkEnvironmentVariables } from './utils'

import nodemailer from 'nodemailer'

export async function sendMail(params: SendMailParams) {
  checkEnvironmentVariables()

  const { to, from, body, subject, refreshToken, attachments } = params

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_SECRET

  const { accessToken, expires } = await forgeAccessToken(refreshToken)

  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      expires,
      clientId,
      user: from,
      accessToken,
      clientSecret,
      refreshToken,
      type: 'OAuth2',
    },
  })

  const mailOptions = {
    to,
    from,
    subject,
    html: body,
    attachments,
  }

  await transport.sendMail(mailOptions)
}
