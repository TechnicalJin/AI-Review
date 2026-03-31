-- Database Migration Script for Slug Field
-- Populates slug field for all existing client records

-- Add slug column if it doesn't exist (if not already been done in entity creation)
-- ALTER TABLE clients ADD COLUMN slug VARCHAR(255) NOT NULL UNIQUE DEFAULT '';

-- MySQL/MariaDB - Update existing records with generated slugs
UPDATE clients
SET slug = CONCAT(
  LOWER(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(name, '&', ''),
          ',', ''
        ),
        ' ', '-'
      ),
      '--', '-'
    )
  )
)
WHERE slug IS NULL OR slug = '';

-- PostgreSQL Alternative - Update existing records with generated slugs
UPDATE clients
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(name, '[^a-zA-Z0-9 ]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    ),
    '^-+|-+$', '', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- Verification - Check for any records still without slug
SELECT id, name, slug FROM clients WHERE slug IS NULL OR slug = '';

-- Count updated records
SELECT COUNT(*) as Total, COUNT(slug) as WithSlug, COUNT(CASE WHEN slug IS NULL THEN 1 END) as WithoutSlug FROM clients;

-- List all clients with their slugs (for verification)
SELECT id, name, slug FROM clients ORDER BY name;
