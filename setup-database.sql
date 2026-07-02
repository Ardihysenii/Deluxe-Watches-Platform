-- ============================================================
-- Alfa Accessories - full database setup
-- Run in SSMS as administrator (Windows auth or sa)
-- ============================================================

IF DB_ID(N'AlfaAccessoriesDB') IS NULL
BEGIN
    CREATE DATABASE [AlfaAccessoriesDB];
END
GO

USE [AlfaAccessoriesDB];
GO

-- Login + user for Spring Boot (skip if already exists)
USE [master];
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'AlfaAccessories')
BEGIN
    CREATE LOGIN [AlfaAccessories] WITH PASSWORD = N'Project458..', CHECK_POLICY = OFF;
END
GO

USE [AlfaAccessoriesDB];
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'AlfaAccessories')
BEGIN
    CREATE USER [AlfaAccessories] FOR LOGIN [AlfaAccessories];
    ALTER ROLE db_owner ADD MEMBER [AlfaAccessories];
END
GO

-- Drop existing tables (child first)
IF OBJECT_ID(N'dbo.Order_Items', N'U') IS NOT NULL DROP TABLE [dbo].[Order_Items];
IF OBJECT_ID(N'dbo.Orders', N'U') IS NOT NULL DROP TABLE [dbo].[Orders];
IF OBJECT_ID(N'dbo.product', N'U') IS NOT NULL DROP TABLE [dbo].[product];
GO

-- ============================================================
-- product (from your script)
-- ============================================================
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

CREATE TABLE [dbo].[product](
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [name] [nvarchar](255) NOT NULL,
    [description] [nvarchar](max) NULL,
    [price] [decimal](18, 2) NOT NULL,
    [color] [nvarchar](50) NULL,
    [material] [nvarchar](50) NULL,
    [category] [nvarchar](50) NULL,
    [search_tags] [nvarchar](max) NULL,
    [image_url] [nvarchar](500) NULL,
    [imageUrl2] [nvarchar](255) NULL,
    [imageUrl3] [nvarchar](255) NULL,
    [image_url2] [nvarchar](max) NULL,
    [image_url3] [nvarchar](max) NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];
GO

-- ============================================================
-- Orders (from Order.java entity)
-- ============================================================
CREATE TABLE [dbo].[Orders](
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [full_name] [nvarchar](255) NULL,
    [email] [nvarchar](255) NULL,
    [phone_number] [nvarchar](255) NULL,
    [address] [nvarchar](max) NULL,
    [total_price] [float] NULL,
    [order_date] [datetime2] NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];
GO

-- ============================================================
-- Order_Items (from your script)
-- ============================================================
CREATE TABLE [dbo].[Order_Items](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [order_id] [int] NULL,
    [product_name] [nvarchar](100) NULL,
    [price] [decimal](10, 2) NULL,
    [product_price] [nvarchar](100) NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY];
GO

ALTER TABLE [dbo].[Order_Items] WITH CHECK ADD CONSTRAINT [FK_OrderItems_Orders]
    FOREIGN KEY([order_id]) REFERENCES [dbo].[Orders] ([id]);
GO

-- ============================================================
-- Seed watches (from HTML templates in src/main/resources/templates)
-- ============================================================
INSERT INTO [dbo].[product]
    ([name], [description], [price], [color], [material], [category], [search_tags], [image_url], [imageUrl2], [imageUrl3])
VALUES
-- Classic
(N'Patek Philippe', N'Personalized watches are a job of quality and commitment.', 249.99, N'Silver', N'Steel', N'Classic', N'patek philippe classic', N'/img/unnamed (1).jpg', N'/img/unamed (1.2).png', N'/img/unnamed (1.3).jpg'),
(N'Audemars Piguet', N'This chronograph combines sport and luxury.', 399.99, N'Gold', N'Steel', N'Classic', N'audemars piguet classic', N'/img/gold-watch-hero.png', N'/img/unamed (3.2).png', N'/img/unnamed (3.3).jpg'),
(N'Jaeger-LeCoultre', N'Inspired by classic craftsmanship and heritage design.', 599.99, N'Silver', N'Leather', N'Classic', N'jaeger lecoultre classic', N'/img/unnamed (5).jpg', N'/img/unnamed (5.2).jpg', N'/img/unnamed (5.3).jpg'),
(N'Midnight Silver Heritage', N'Inspired by classic craftsmanship.', 599.99, N'Silver', N'Steel', N'Classic', N'midnight silver classic', N'/img/unnamed (6).jpg', N'/img/unnamed (6.2).jpg', N'/img/unnamed (6.3).jpg'),

-- Luxury
(N'Elegant Chronograph 42mm', N'This chronograph combines sport and luxury, made for precision and performance.', 449.99, N'Black', N'Steel', N'Luxury', N'elegant chronograph luxury', N'/img/unnamed (4).jpg', N'/img/unamed (4.2).jpg', N'/img/unnamed (4.3).jpg'),
(N'Baume Custom Timepiece', N'Personalized watches are a job of quality and commitment.', 399.99, N'Silver', N'Steel', N'Luxury', N'baume custom luxury', N'/img/unnamed (3).jpg', N'/img/unamed (3.2).png', N'/img/unnamed (3.3).jpg'),
(N'Baume Custom Timepiece Small Second', N'Each piece is the result of co-creation, innovation and responsible sensitivity.', 399.99, N'Silver', N'Steel', N'Luxury', N'baume small second luxury', N'/img/unnamed (6).jpg', N'/img/unnamed (6.2).jpg', N'/img/unnamed (6.3).jpg'),
(N'Midnight Silver Heritage Luxury', N'Inspired by classic craftsmanship with a modern luxury finish.', 499.99, N'Silver', N'Steel', N'Luxury', N'midnight silver luxury', N'/img/unnamed (6).jpg', N'/img/unnamed (6.2).jpg', N'/img/unnamed (6.3).jpg'),
(N'Silver Moon Edition', N'A rare model blending silver with Swiss movement.', 750.00, N'Silver', N'Steel', N'Luxury', N'silver moon luxury', N'/img/unnamed (1).jpg', N'/img/unamed (1.2).png', N'/img/unnamed (1.3).jpg'),
(N'Dark Night Chrono', N'For those who prefer modern minimalist style.', 680.00, N'Black', N'Steel', N'Luxury', N'dark night chrono luxury', N'/img/unnamed (4).jpg', N'/img/unamed (4.2).jpg', N'/img/unnamed (4.3).jpg'),

-- Sportive
(N'Richard Mille', N'High-performance sport watch built for endurance and style.', 249.99, N'Black', N'Carbon', N'Sportive', N'richard mille sport', N'/img/unnamed (4).jpg', N'/img/unamed (4.2).jpg', N'/img/unnamed (4.3).jpg'),
(N'Garmin Fenix 7S', N'Advanced GPS sport watch for outdoor adventures.', 399.99, N'Black', N'Polymer', N'Sportive', N'garmin fenix sport', N'/img/unnamed (5).jpg', N'/img/unnamed (5.2).jpg', N'/img/unnamed (5.3).jpg'),
(N'Coros Pace Pro', N'Lightweight sport watch designed for runners and athletes.', 599.99, N'Blue', N'Polymer', N'Sportive', N'coros pace sport', N'/img/unnamed (5).jpg', N'/img/unnamed (5.2).jpg', N'/img/unnamed (5.3).jpg');
GO

SELECT COUNT(*) AS product_count FROM [dbo].[product];
SELECT id, name, price, category, image_url FROM [dbo].[product] ORDER BY category, id;
GO
