-- Fix product image paths — strict order: (N), (N.2), (N.3)

UPDATE product SET image_url = '/img/unnamed (1).jpg', "imageUrl2" = '/img/unamed (1.2).png', "imageUrl3" = '/img/unnamed (1.3).jpg'
WHERE name IN ('Patek Philippe', 'Silver Moon Edition');

UPDATE product SET image_url = '/img/unnamed (3).jpg', "imageUrl2" = '/img/unamed (3.2).png', "imageUrl3" = '/img/unnamed (3.3).jpg'
WHERE name IN ('Audemars Piguet', 'Baume Custom Timepiece');

UPDATE product SET image_url = '/img/unnamed (4).jpg', "imageUrl2" = '/img/unamed (4.2).jpg', "imageUrl3" = '/img/unnamed (4.3).jpg'
WHERE name IN ('Elegant Chronograph 42mm', 'Dark Night Chrono', 'Richard Mille');

UPDATE product SET image_url = '/img/unnamed (5).jpg', "imageUrl2" = '/img/unnamed (5.2).jpg', "imageUrl3" = '/img/unnamed (5.3).jpg'
WHERE name IN ('Jaeger-LeCoultre', 'Garmin Fenix 7S', 'Coros Pace Pro');

UPDATE product SET image_url = '/img/unnamed (6).jpg', "imageUrl2" = '/img/unnamed (6.2).jpg', "imageUrl3" = '/img/unnamed (6.3).jpg'
WHERE name IN ('Midnight Silver Heritage', 'Baume Custom Timepiece Small Second');
