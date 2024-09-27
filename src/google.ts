import { checkEnvironmentVariables } from './utils'

import { google } from 'googleapis'
import { OAuth2Client } from 'googleapis-common'

/**
 * Creates a new OAuth2Client using the environment variables provided, either from the scopes hard-listed or with the provided refresh token.
 * @param refreshToken - (optional) The refresh token to use to authenticate the user.
 * @returns The OAuth2Client instance.
 * */
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

/**
 * Generates the OAuth2 URL to redirect the user to in order to authenticate with Google.
 * @param state - (optional) state string to be passed to the Google API and received back after the authentication.
 * @returns The URL to redirect the user to.
 * */
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

/**
 * Validates the authentication code received from the Google API and returns the tokens if it is valid.
 * @param code - The authentication code received from the Google API after the user authenticates.
 * @returns Google OAuth2 tokens.
 * */
export async function validateAuthCode(code: string) {
  if (!code) {
    throw new Error('No code provided')
  }

  const oauth2Client = getAuthClient()
  const retval = await oauth2Client.getToken(code)
  return retval
}

/**
 * Forges an access token using the refresh token provided.
 * @param refreshToken - Google OAuth2 refresh token.
 * @returns Google OAuth2 access token and its expiration date.
 * */
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

/**
 * Retrieves the user's email and profile information using the refresh token provided.
 * @param refreshToken - Google OAuth2 refresh token.
 * @returns user's email and profile information.
 * */
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
