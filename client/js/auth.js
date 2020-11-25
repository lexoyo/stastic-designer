const config = {
  "domain": "lexoyo.eu.auth0.com",
  "clientId": "meHkaCJ0uMJVSyUTHWIkOSqrj6dE3gnF"
}
let authClient = null

export async function login() {
  authClient = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId
  })
  if (await authClient.isAuthenticated()) {
    const user = authClient.getUser()
    console.log('Logged in', {user})
    return user
  } else {
    console.log('Not logged in')
    const query = window.location.search
    if (query.includes("code=") && query.includes("state=")) {
      await authClient.handleRedirectCallback()
      window.history.replaceState({}, document.title, "/")
    } else {
      authClient.loginWithRedirect({
        redirect_uri: window.location.origin,
      })
    }
  }
  return null
}

export async function logout() {
  if (authClient && await authClient.isAuthenticated()) {
    authClient.logout({
      returnTo: window.location.origin,
    })
  }
}
