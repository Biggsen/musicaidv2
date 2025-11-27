/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
}

/**
 * Generate a unique slug by checking for existing slugs and appending a number if needed
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>,
  maxAttempts: number = 100
): Promise<string> {
  let slug = baseSlug
  let attempt = 0

  while (attempt < maxAttempts) {
    const exists = await checkExists(slug)
    if (!exists) {
      return slug
    }
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  // Fallback to timestamp if we can't find a unique slug
  return `${baseSlug}-${Date.now()}`
}

