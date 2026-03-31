package com.yrhp.crud.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

/**
 * Utility class for generating and handling URL-friendly slugs from company names.
 *
 * Slug generation rules:
 * - Convert to lowercase
 * - Replace spaces with hyphens
 * - Remove special characters, keeping only alphanumeric and hyphens
 * - Remove consecutive hyphens
 *
 * Examples:
 * "YRHP Pvt Ltd" -> "yrhp-pvt-ltd"
 * "ABC & Co. Ltd" -> "abc-co-ltd"
 * "Tech-Solutions 2024" -> "tech-solutions-2024"
 */
public class SlugUtil {

    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9-]");
    private static final Pattern MULTIPLE_HYPHENS = Pattern.compile("-+");

    /**
     * Generates a URL-friendly slug from the given company name.
     *
     * @param companyName the company name to convert
     * @return a URL-friendly slug (lowercase, hyphens, alphanumeric only)
     */
    public static String generateSlug(String companyName) {
        if (companyName == null || companyName.trim().isEmpty()) {
            throw new IllegalArgumentException("Company name cannot be null or empty");
        }

        // Step 1: Normalize unicode characters (e.g., accents)
        String normalized = Normalizer.normalize(companyName, Normalizer.Form.NFD);

        // Step 2: Convert to lowercase
        String lowercase = normalized.toLowerCase();

        // Step 3: Replace spaces with hyphens
        String withHyphens = lowercase.replaceAll("\\s+", "-");

        // Step 4: Remove special characters except hyphens and alphanumeric
        String cleaned = NON_ALPHANUMERIC.matcher(withHyphens).replaceAll("");

        // Step 5: Replace multiple consecutive hyphens with single hyphen
        String slug = MULTIPLE_HYPHENS.matcher(cleaned).replaceAll("-");

        // Step 6: Remove leading/trailing hyphens
        slug = slug.replaceAll("^-+|-+$", "");

        if (slug.isEmpty()) {
            throw new IllegalArgumentException("Generated slug is empty for company name: " + companyName);
        }

        return slug;
    }

    /**
     * Checks if the provided string is a valid slug.
     * A valid slug contains only lowercase alphanumeric characters and hyphens,
     * and doesn't start or end with a hyphen.
     *
     * @param slug the slug to validate
     * @return true if the slug is valid, false otherwise
     */
    public static boolean isValidSlug(String slug) {
        if (slug == null || slug.isEmpty()) {
            return false;
        }
        return slug.matches("^[a-z0-9]+(-[a-z0-9]+)*$");
    }
}
