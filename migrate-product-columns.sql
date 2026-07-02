-- Fix product image column names for PostgreSQL + Hibernate (safe to re-run)

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_attribute a
        JOIN pg_class c ON a.attrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public'
          AND c.relname = 'product'
          AND a.attname = 'imageUrl2'
          AND NOT a.attisdropped
    ) THEN
        ALTER TABLE product RENAME COLUMN "imageUrl2" TO image_url2;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_attribute a
        JOIN pg_class c ON a.attrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public'
          AND c.relname = 'product'
          AND a.attname = 'imageUrl3'
          AND NOT a.attisdropped
    ) THEN
        ALTER TABLE product RENAME COLUMN "imageUrl3" TO image_url3;
    END IF;
END $$;

ALTER TABLE product ADD COLUMN IF NOT EXISTS image_url2 VARCHAR(500);
ALTER TABLE product ADD COLUMN IF NOT EXISTS image_url3 VARCHAR(500);
