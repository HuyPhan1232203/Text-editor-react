/**
 * The address to open for a link's href: web, mail and phone links as they are, a bare
 * domain ("example.com") as https, and nothing for other schemes such as javascript:.
 */
export function openableUrl (href: string | null | undefined): string | null {
  const value = href?.trim()

  if (!value) return null
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value
  // Any other scheme is not opened
  if (/^[a-z][a-z\d+.-]*:/i.test(value)) return null
  return `https://${value.replace(/^\/+/, '')}`
}
