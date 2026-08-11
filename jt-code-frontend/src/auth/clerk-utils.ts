export function getClerkErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (!error || typeof error !== 'object') return fallback

  const maybeError = error as {
    message?: string
    errors?: Array<{ longMessage?: string; message?: string }>
  }

  return (
    maybeError.errors?.[0]?.longMessage ||
    maybeError.errors?.[0]?.message ||
    maybeError.message ||
    fallback
  )
}

export function splitFullName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  const firstName = parts.shift() ?? ''
  const lastName = parts.join(' ')
  return { firstName, lastName }
}
