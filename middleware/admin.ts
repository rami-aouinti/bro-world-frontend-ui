import { useAuthSession } from "~/stores/auth-session";
import { createError } from '#imports'
import { ADMIN_ROLE_KEYS } from '~/lib/navigation/sidebar'

export default defineNuxtRouteMiddleware(async (_to) => {
  const auth = useAuthSession()
  await auth.initialize()

  const roles = auth.currentUser.value?.roles ?? []
  const hasAccess = auth.isAuthenticated.value && roles.some((role) => ADMIN_ROLE_KEYS.includes(role))

  if (hasAccess) {
    return
  }

  if (process.server) {
    return abortNavigation(
      createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
      }),
    )
  }

  const localePath = useLocalePath()
  return navigateTo(localePath('/'))
})