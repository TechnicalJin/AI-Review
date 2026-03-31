/**
 * Slug utility for the frontend
 * Handles slug generation and validation
 * Note: Primary slug generation happens on the backend (SlugUtil.java)
 * This is used for validation and reference purposes only
 */

/**
 * Generates a URL-friendly slug from a company name
 * This matches the backend SlugUtil behavior
 *
 * @param {string} companyName - The company name to convert
 * @returns {string} A URL-friendly slug (lowercase, hyphens, alphanumeric only)
 */
export const generateSlug = (companyName) => {
  if (!companyName || companyName.trim() === '') {
    throw new Error('Company name cannot be null or empty');
  }

  // Convert to lowercase
  let slug = companyName.toLowerCase();

  // Replace spaces with hyphens
  slug = slug.replace(/\s+/g, '-');

  // Remove special characters except hyphens and alphanumeric
  slug = slug.replace(/[^a-z0-9-]/g, '');

  // Replace multiple consecutive hyphens with single hyphen
  slug = slug.replace(/-+/g, '-');

  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  if (slug === '') {
    throw new Error(`Generated slug is empty for company name: ${companyName}`);
  }

  return slug;
};

/**
 * Validates if a slug is properly formatted
 * A valid slug contains only lowercase alphanumeric characters and hyphens,
 * and doesn't start or end with a hyphen
 *
 * @param {string} slug - The slug to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidSlug = (slug) => {
  if (!slug || slug === '') {
    return false;
  }
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
};

/**
 * Normalizes a slug by applying standard slug transformation
 * Useful for comparing slugs or standardizing input
 *
 * @param {string} slug - The slug to normalize
 * @returns {string} The normalized slug
 */
export const normalizeSlug = (slug) => {
  if (!slug) return '';
  return slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
};
