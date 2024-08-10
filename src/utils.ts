export function checkEnvironmentVariables() {
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
    console.warn('GOOGLE_OAUTH_CLIENT_ID is not defined')
  }

  if (!process.env.GOOGLE_OAUTH_SECRET) {
    console.warn('GOOGLE_OAUTH_SECRET is not defined')
  }

  if (!process.env.GOOGLE_REDIRECT_URI) {
    console.warn('GOOGLE_REDIRECT_URI is not defined')
  }
}
