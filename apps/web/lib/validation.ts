/** Valid email regex (RFC 5322 simplified) */
export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/** Slug: lowercase letters, numbers, hyphens only. No leading/trailing hyphen. */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim())
}

export function isValidSlug(slug: string): boolean {
  if (!slug) return false
  return SLUG_REGEX.test(slug)
}

/** Normalize string to slug format (for input sanitization) */
export function toSlugFormat(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

/** Allowed chars for business/org name: letters (incl. accented), numbers, spaces, hyphens */
const VALID_NAME_REGEX = /^[\p{L}\p{N}\s\-]*$/u

/** Check if name has invalid (special) characters */
export function hasInvalidNameChars(value: string): boolean {
  if (!value.trim()) return false
  return !VALID_NAME_REGEX.test(value)
}

/** Get list of invalid characters found in the name (for real-time feedback) */
export function getInvalidNameChars(value: string): string[] {
  const invalid = value.split("").filter((c) => {
    if (!c.trim()) return false
    return !/[\p{L}\p{N}\s\-]/u.test(c)
  })
  return [...new Set(invalid)]
}
