export function getClientPortalBaseUrl(): string {
  // Use environment variable if available
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // In production, use the specific domain as fallback
  if (process.env.NODE_ENV === 'production') {
    return 'https://platform.wealthwisemarketing.pro'
  }

  // In development, check if we're in browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Fallback for server-side rendering in development
  return 'http://localhost:3000'
}

export function getRedirectUrl(path: string = ''): string {
  const baseUrl = getClientPortalBaseUrl()
  return path ? `${baseUrl}${path}` : baseUrl
}