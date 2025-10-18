import { createError, defineEventHandler, getRouterParam } from "h3"
import { getUserToken } from "~/server/utils/getUserToken"
import { requestWithRetry } from "~/server/utils/requestWithRetry"

export default defineEventHandler(async (event) => {
  const token = await getUserToken(event)
  const config = useRuntimeConfig()
  const jobId = getRouterParam(event, "jobId")
  const applicantId = getRouterParam(event, "applicantId")

  if (!jobId || !applicantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Job ID and applicant ID are required",
    })
  }

  const url = `${config.public.apiJobBase}/api/v1/job/${jobId}/application/${applicantId}`

  return await requestWithRetry("POST", url, { token })
})
