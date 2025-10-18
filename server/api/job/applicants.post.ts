import { defineEventHandler, readBody } from "h3"
import { getUserToken } from "~/server/utils/getUserToken"
import { requestWithRetry } from "~/server/utils/requestWithRetry"

export default defineEventHandler(async (event) => {
  const token = await getUserToken(event)
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const url = `${config.public.apiJobBase}/api/v1/applicants`

  return await requestWithRetry("POST", url, { token, body })
})
