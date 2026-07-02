-- Remove Gold Heritage from live Neon database (safe to re-run)
DELETE FROM "Order_Items"
WHERE product_name ILIKE '%Gold Heritage%';

DELETE FROM product
WHERE name ILIKE '%Gold Heritage%';
