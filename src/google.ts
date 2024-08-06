import { GoogleOAuthClientAndTokens } from '../types/google.d'

import { google } from 'googleapis'
import { OAuth2Client } from 'googleapis-common'

export async function authenticateGmailOauth(state?: string) {
  const oauth2Client = getGoogleOauth2Client()
  const authUrl = oauth2Client.generateAuthUrl({
    state,
    access_type: 'offline',
    prompt: 'consent', // have the refresh token delivered every time
    scope: ['https://mail.google.com/', 'https://www.googleapis.com/auth/userinfo.email'],
  })

  return authUrl
}

export function getGoogleOauth2Client(): OAuth2Client {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_SECRET
  const googleRedirectURI = process.env.GOOGLE_REDIRECT_URI
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, googleRedirectURI)
  return oauth2Client
}

export async function getGoogleOauth2ClientAndTokens(code: string): Promise<GoogleOAuthClientAndTokens> {
  const oauth2Client = getGoogleOauth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)
  return {
    oauth2Client,
    tokens,
  }
}

export async function forgeAccessToken(refreshToken: string): Promise<{ accessToken: string; expires: string }> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_SECRET

  const auth = new google.auth.OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground')
  auth.setCredentials({ refresh_token: refreshToken })
  const response = await auth.getAccessToken()

  if (!response.res) {
    throw new Error('Réponse invalide de Google: ' + response)
  }

  if (!response.token) {
    throw new Error("L'access token reçu de Google est null")
  }

  return {
    accessToken: response.token,
    expires: response.res.config.data.expiry_date,
  }
}
