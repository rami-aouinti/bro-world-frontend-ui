export function isHeadersSentError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const nodeError = error as NodeJS.ErrnoException;

  return (
    nodeError.code === "ERR_HTTP_HEADERS_SENT" ||
    error.message.includes("Cannot append headers after they are sent")
  );
}
