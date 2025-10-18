import { createError, defineEventHandler, readMultipartFormData } from "h3"
import { useRuntimeConfig } from "#imports"
import { getUserToken } from "~/server/utils/getUserToken"

function resolveProfileApiBase(event: Parameters<typeof useRuntimeConfig>[0]) {
  const config = useRuntimeConfig(event)
  const base = config.public?.apiProfileBase

  if (typeof base === "string" && base.trim()) {
    return base.replace(/\/$/, "")
  }

  return "https://bro-world.org"
}

function buildFormData(entries: Awaited<ReturnType<typeof readMultipartFormData>>): FormData {
  const formData = new FormData()

  for (const entry of entries ?? []) {
    const name = entry.name?.trim()

    if (!name) {
      continue
    }

    if (entry.filename) {
      const blob = new Blob([entry.data], { type: entry.type || "application/octet-stream" })
      formData.append(name, blob, entry.filename)
    } else {
      formData.append(name, entry.data.toString("utf-8"))
    }
  }

  return formData
}

export default defineEventHandler(async (event) => {
  const token = await getUserToken(event)

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication is required to access this resource.",
    })
  }

  const id = event.context.params?.id
  const trimmedId = typeof id === "string" ? id.trim() : ""

  if (!trimmedId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing event identifier.",
    })
  }

  const entries = await readMultipartFormData(event)

  if (!entries || entries.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No form data received.",
    })
  }

  const formData = buildFormData(entries)
  const baseUrl = resolveProfileApiBase(event)
  const url = `${baseUrl}/api/v1/profile/events/${encodeURIComponent(trimmedId)}`

  return await $fetch(url, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
})
