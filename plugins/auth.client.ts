import { useAuthSession } from '~/stores/auth-session'

export default defineNuxtPlugin(async () => {
  const auth = useAuthSession()

  try {
    await auth.initialize()
  } catch (error) {
    console.error('Failed to initialize auth session', error)
  }
})
