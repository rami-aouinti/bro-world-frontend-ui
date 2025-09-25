# Authentication Guide

This application ships with a credential-based authentication flow that persists
sessions via secure cookies and automatically decorates API calls with the
active access token. This document explains how to work with the session layer,
protect pages, and respond to authentication errors.

## Session model

- Successful logins write the backend token to an HTTP-only cookie and store
  the current user profile in a secondary cookie. Both cookies are marked as
  `Secure` in production and use a strict same-site policy for the token.
- Client-side state is synchronised through the `useAuthSession` store
  (`stores/auth-session.ts`). The store automatically rehydrates itself on
  startup through the `plugins/auth.client.ts` plugin.
- All API requests made with the injected `$api` client
  (`plugins/api.client.ts`) include credentials and automatically attach the
  session token when the server proxies the request. A `401` or `403` response
  clears the session, shows a localized message, and redirects to the login
  page.

## Logging in and out programmatically

```ts
const auth = useAuthSession()

// Initialise the session (normally handled by the auth plugin)
await auth.initialize()

// Attempt a login
const success = await auth.login({
  identifier: 'john@example.com',
  password: 'secret',
})

if (success) {
  // access auth.currentUser.value, auth.isAuthenticated.value, etc.
}

// Log out (redirects to the localized login route and shows a toast)
await auth.logout()
```

Additional helpers:

- `auth.clearLoginError()` clears the last login error message.
- `auth.setSessionMessage(message)` displays a dismissible banner on the login
  form (used for session-expiry notices).
- `auth.handleUnauthorized(message)` clears the session and routes to the login
  screen with an optional message.

## Protecting routes and redirecting after login

Protected pages should reference the shared `auth` middleware:

```ts
// pages/dashboard.vue
definePageMeta({
  middleware: ['auth'],
})
```

When an unauthenticated user visits a protected route, the middleware stores the
original URL and redirects to the localized login page with a `redirect`
query parameter. After a successful login the form will forward the user back to
that location.

## Calling APIs with the session token

Use the provided `$api` client to interact with backend endpoints:

```ts
const { $api } = useNuxtApp()
const profile = await $api('/v1/profile')
```

`$api` automatically attaches the necessary cookies, surfaces error
notifications, and triggers a session reset on authentication failures. To
suppress the global toast for a specific request, pass
`context: { suppressErrorNotification: true }`.

## Handling expired sessions and errors

- Invalid credentials, rate limits, and generic failures are surfaced via inline
  form messages and toasts in `components/auth/LoginForm.vue`.
- Any `401`/`403` response triggers `auth.handleUnauthorized`, which clears
  cookies, stores the current path as a return URL, shows a localized "session
  expired" banner, and redirects to the login page.
- Manual logouts call `auth.logout`, clear the session, display a success toast,
  and redirect to the login page.

These behaviours ensure that users remain authenticated across refreshes and are
safely returned to the page they intended to visit after signing in.
