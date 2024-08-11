import { checkEnvironmentVariables } from './utils'

import { google } from 'googleapis'
import { OAuth2Client } from 'googleapis-common'

function getAuthClient(refreshToken?: string): OAuth2Client {
  checkEnvironmentVariables()

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_SECRET
  const googleRedirectURI = process.env.GOOGLE_REDIRECT_URI

  if (refreshToken) {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground')
    oauth2Client.setCredentials({ refresh_token: refreshToken })
    return oauth2Client
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, googleRedirectURI)
  return oauth2Client
}

export function generateOAuthUrl(state?: string): string {
  const oauth2Client = getAuthClient()
  const authUrl = oauth2Client.generateAuthUrl({
    state,
    access_type: 'offline',
    prompt: 'consent', // have the refresh token delivered every time
    scope: [
      'https://mail.google.com/',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  })

  return authUrl
}

export async function validateAuthCode(code: string) {
  if (!code) {
    throw new Error('No code provided')
  }

  const oauth2Client = getAuthClient()
  const retval = await oauth2Client.getToken(code)
  return retval
}

export async function forgeAccessToken(refreshToken: string): Promise<{ accessToken: string; expires: string }> {
  if (!refreshToken) {
    throw new Error('No refresh token provided')
  }

  checkEnvironmentVariables()

  const oauth2Client = getAuthClient(refreshToken)
  const response = await oauth2Client.getAccessToken()

  if (!response.res) {
    throw new Error('Invalid response from Google: ' + response)
  }

  if (!response.token) {
    throw new Error('Access token is null')
  }

  return {
    accessToken: response.token,
    expires: response.res.config.data.expiry_date,
  }
}

export async function getUserInfos(refreshToken: string) {
  if (!refreshToken) {
    throw new Error('No refresh token provided')
  }

  const { accessToken } = await forgeAccessToken(refreshToken)
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })

  let oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2',
  })

  const { data } = await oauth2.userinfo.get()

  return data
}
