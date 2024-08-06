import { Credentials } from 'google-auth-library'
import { OAuth2Client } from 'googleapis-common'

interface GoogleOAuthClientAndTokens {
  oauth2Client: OAuth2Client
  tokens: Credentials
}
