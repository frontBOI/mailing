export function checkEnvironmentVariables() {
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
    console.warn("GOOGLE_OAUTH_CLIENT_ID n'est pas définie")
  }

  if (!process.env.GOOGLE_OAUTH_SECRET) {
    console.warn("GOOGLE_OAUTH_SECRET n'est pas définie")
  }

  if (!process.env.GOOGLE_REDIRECT_URI) {
    console.warn("GOOGLE_REDIRECT_URI n'est pas définie")
  }
}
