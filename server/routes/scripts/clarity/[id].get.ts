import { defineEventHandler, getRouterParam, sendStream, setResponseHeader, setResponseStatus, createError } from "h3";
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, "id");
  const clarityId = idParam?.replace(/\.js$/i, "");

  if (!clarityId) {
    throw createError({ statusCode: 400, statusMessage: "Missing Clarity tag id" });
  }

  const upstreamUrl = `https://www.clarity.ms/tag/${clarityId}`;

  let response: Response;

  try {
    response = await fetch(upstreamUrl);
  }
  catch (error: unknown) {
    throw createError({
      statusCode: 502,
      statusMessage: "Failed to reach Clarity upstream",
      cause: error,
    });
  }

  if (!response.ok || !response.body) {
    throw createError({
      statusCode: response.status || 502,
      statusMessage: `Failed to fetch Clarity script: ${response.statusText || "Unknown error"}`,
    });
  }

  setResponseStatus(event, response.status);

  const cacheHeader = "public, max-age=31536000, immutable, stale-while-revalidate=60";
  setResponseHeader(event, "cache-control", cacheHeader);

  const passthroughHeaders = [
    "content-type",
    "content-encoding",
    "content-length",
    "etag",
    "last-modified",
    "accept-ranges",
    "vary",
  ];

  for (const headerName of passthroughHeaders) {
    const headerValue = response.headers.get(headerName);

    if (headerValue) {
      setResponseHeader(event, headerName, headerValue);
    }
  }

  const bodyStream = response.body as Readable | WebReadableStream<Uint8Array>;
  const nodeStream = bodyStream instanceof Readable ? bodyStream : Readable.fromWeb(bodyStream);

  return sendStream(event, nodeStream);
});
