-- Alfa Accessories - PostgreSQL schema for Neon

-- Run in Neon SQL Editor: https://console.neon.tech



-- Drop existing objects (safe re-run)

DROP TABLE IF EXISTS "Order_Items";

DROP TABLE IF EXISTS "Orders";

DROP TABLE IF EXISTS product;



-- Product catalog

CREATE TABLE product (

    id          BIGSERIAL PRIMARY KEY,

    name        VARCHAR(255) NOT NULL,

    description TEXT,

    price       DECIMAL(18, 2) NOT NULL,

    color       VARCHAR(50),

    material    VARCHAR(50),

    category    VARCHAR(50),

    search_tags TEXT,

    image_url   VARCHAR(500),

    "imageUrl2" VARCHAR(500),

    "imageUrl3" VARCHAR(500)

);



-- Orders (quoted identifier matches JPA @Table(name = "Orders"))

CREATE TABLE "Orders" (

    id           BIGSERIAL PRIMARY KEY,

    full_name    VARCHAR(255),

    email        VARCHAR(255),

    phone_number VARCHAR(50),

    address      TEXT,

    total_price  DOUBLE PRECISION,

    order_date   TIMESTAMP

);



-- Order line items

CREATE TABLE "Order_Items" (

    id            BIGSERIAL PRIMARY KEY,

    order_id      BIGINT NOT NULL REFERENCES "Orders"(id) ON DELETE CASCADE,

    product_name  VARCHAR(100),

    product_price VARCHAR(100)

);



CREATE INDEX idx_order_items_order_id ON "Order_Items"(order_id);

CREATE INDEX idx_product_category ON product(category);

CREATE INDEX idx_product_name ON product(name);



-- Seed data — image paths match files in src/main/resources/static/img/



INSERT INTO product (name, description, price, color, material, category, search_tags, image_url, "imageUrl2", "imageUrl3") VALUES

(

    'Patek Philippe',

    'Personalized watches are a job of quality and commitment.',

    249.99, 'Brown', 'Leather', 'Classic',

    'patek philippe classic luxury swiss',

    '/img/unnamed (1).jpg',

    '/img/unamed (1.2).png',

    '/img/unnamed (1.3).jpg'

),

(

    'Audemars Piguet',

    'This chronograph combines sport and luxury.',

    399.99, 'Silver', 'Stainless Steel', 'Classic',

    'audemars piguet chronograph classic',

    '/img/unnamed (3).jpg',

    '/img/unamed (3.2).png',

    '/img/unnamed (3.3).jpg'

),

(

    'Midnight Silver Heritage',

    'Inspired by classic craftsmanship, this piece brings a perfect balance of modern elegance and vintage charm.',

    599.99, 'Silver', 'Stainless Steel', 'Classic',

    'midnight silver heritage classic vintage',

    '/img/unnamed (6).jpg',

    '/img/unnamed (6.2).jpg',

    '/img/unnamed (6.3).jpg'

),

(

    'Jaeger-LeCoultre',

    'Inspired by classic craftsmanship, this piece brings a perfect balance of modern elegance and vintage charm.',

    599.99, 'Gold', 'Gold', 'Classic',

    'jaeger lecoultre classic craftsmanship',

    '/img/unnamed (5).jpg',

    '/img/unnamed (5.2).jpg',

    '/img/unnamed (5.3).jpg'

),

(

    'Elegant Chronograph 42mm',

    'This chronograph combines sport and luxury.',

    449.99, 'Silver', 'Stainless Steel', 'Luxury',

    'elegant chronograph 42mm luxury sport',

    '/img/unnamed (4).jpg',

    '/img/unamed (4.2).jpg',

    '/img/unnamed (4.3).jpg'

),

(

    'Baume Custom Timepiece',

    'Personalized watches are a job of quality and commitment.',

    399.99, 'Gold', 'Gold', 'Luxury',

    'baume custom timepiece luxury personalized',

    '/img/unnamed (3).jpg',

    '/img/unamed (3.2).png',

    '/img/unnamed (3.3).jpg'

),

(

    'Baume Custom Timepiece Small Second',

    'Personalized watches are a job of quality and commitment.',

    399.99, 'Silver', 'Stainless Steel', 'Luxury',

    'baume custom small second luxury',

    '/img/unnamed (6).jpg',

    '/img/unnamed (6.2).jpg',

    '/img/unnamed (6.3).jpg'

),

(

    'Silver Moon Edition',

    'Një model i rrallë që ndërthur argjendin me mekanizmin zviceran.',

    750.00, 'Silver', 'Silver', 'Luxury',

    'silver moon edition luxury swiss',

    '/img/unnamed (1).jpg',

    '/img/unamed (1.2).png',

    '/img/unnamed (1.3).jpg'

),

(

    'Dark Night Chrono',

    'Për ata që preferojnë stilin modern dhe minimalist.',

    680.00, 'Black', 'Stainless Steel', 'Luxury',

    'dark night chrono luxury minimalist modern',

    '/img/unnamed (4).jpg',

    '/img/unamed (4.2).jpg',

    '/img/unnamed (4.3).jpg'

),

(

    'Richard Mille',

    'Personalized watches are a job of quality and commitment. Each piece is the result of a work of co-creation.',

    249.99, 'Black', 'Carbon', 'Sportive',

    'richard mille sportive performance',

    '/img/unnamed (4).jpg',

    '/img/unamed (4.2).jpg',

    '/img/unnamed (4.3).jpg'

),

(

    'Garmin Fenix 7S',

    'This chronograph combines sport and luxury, made for precision and performance in a timeless design.',

    399.99, 'Black', 'Polymer', 'Sportive',

    'garmin fenix 7s sportive gps fitness',

    '/img/unnamed (5).jpg',

    '/img/unnamed (5.2).jpg',

    '/img/unnamed (5.3).jpg'

),

(

    'Coros Pace Pro',

    'Inspired by modern performance, this piece brings a perfect balance of modern elegance and vintage charm.',

    599.99, 'Grey', 'Titanium', 'Sportive',

    'coros pace pro sportive athlete running',

    '/img/unnamed (5).jpg',

    '/img/unnamed (5.2).jpg',

    '/img/unnamed (5.3).jpg'

);



-- Reset sequences

SELECT setval(pg_get_serial_sequence('product', 'id'), (SELECT COALESCE(MAX(id), 1) FROM product));

