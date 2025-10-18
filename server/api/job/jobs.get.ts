import { defineEventHandler, getQuery } from "h3"
import { getUserToken } from "~/server/utils/getUserToken"
import { requestWithRetry } from "~/server/utils/requestWithRetry"

export default defineEventHandler(async (event) => {
  const token = await getUserToken(event)
  const config = useRuntimeConfig()
  const baseUrl = `${config.public.apiJobBase}/api/v1/job`
  const query = getQuery(event)

  const searchParams = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item))
        }
      })
    } else if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  const url = queryString ? `${baseUrl}?${queryString}` : baseUrl

  return await requestWithRetry("GET", url, { token })
})
