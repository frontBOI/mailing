import { SendMailParams } from './../types/nodemailer.d'
import { forgeAccessToken } from './google'

import nodemailer from 'nodemailer'

export async function sendMailWithoutToken(params: SendMailParams) {
  const { to, from, body, subject, refreshToken, attachments } = params
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_SECRET
  const { accessToken, expires } = await forgeAccessToken(refreshToken)

  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: from,
      clientId,
      clientSecret,
      refreshToken,
      accessToken,
      expires,
    },
  })

  const mailOptions = {
    from,
    to,
    subject,
    html: body,
    attachments,
  }

  await transport.sendMail(mailOptions)
}
