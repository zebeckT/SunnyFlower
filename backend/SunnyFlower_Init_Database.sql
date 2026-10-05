-- ==============================================================================
-- Script Khởi Tạo CSDL & Dữ Liệu Mẫu Cho Website Bán Hoa SunnyFlower
-- Hệ quản trị CSDL: Microsoft SQL Server (T-SQL)
-- Script này được thiết kế IDEMPOTENT (chạy nhiều lần không bao giờ bị lỗi trùng khóa)
-- ==============================================================================

USE [master];
GO

-- 1. TẠO CSDL NẾU CHƯA TỒN TẠI
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'SunnyFlower')
BEGIN
    CREATE DATABASE [SunnyFlower];
    PRINT N'Đã tạo Database [SunnyFlower] thành công.';
END
GO

USE [SunnyFlower];
GO

-- ==============================================================================
-- 2. TẠO CÁC BẢNG (TABLES) NẾU CHƯA CÓ
-- ==============================================================================

-- 2.1 Bảng Roles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE [Roles] (
        [Id] NVARCHAR(30) NOT NULL,
        [Name] NVARCHAR(100) NOT NULL,
        [Description] NVARCHAR(300) NULL,
        CONSTRAINT [PK_Roles] PRIMARY KEY ([Id])
    );
END
GO

-- 2.2 Bảng RolePermissions
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RolePermissions')
BEGIN
    CREATE TABLE [RolePermissions] (
        [RoleId] NVARCHAR(30) NOT NULL,
        [Permission] NVARCHAR(60) NOT NULL,
        CONSTRAINT [PK_RolePermissions] PRIMARY KEY ([RoleId], [Permission]),
        CONSTRAINT [FK_RolePermissions_Roles_RoleId] FOREIGN KEY ([RoleId]) 
            REFERENCES [Roles] ([Id]) ON DELETE CASCADE
    );
END
GO

-- 2.3 Bảng Users
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE [Users] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [Email] NVARCHAR(200) NOT NULL,
        [FullName] NVARCHAR(100) NOT NULL,
        [PasswordHash] NVARCHAR(200) NOT NULL,
        [RoleId] NVARCHAR(30) NOT NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Users_Roles_RoleId] FOREIGN KEY ([RoleId]) 
            REFERENCES [Roles] ([Id]) ON DELETE NO ACTION
    );
    CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
    CREATE INDEX [IX_Users_RoleId] ON [Users] ([RoleId]);
END
GO

-- 2.4 Bảng Categories
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
BEGIN
    CREATE TABLE [Categories] (
        [Id] NVARCHAR(100) NOT NULL,
        [Name] NVARCHAR(200) NOT NULL,
        [Description] NVARCHAR(500) NULL,
        [Image] NVARCHAR(500) NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
    );
END
GO

-- 2.5 Bảng Products
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
BEGIN
    CREATE TABLE [Products] (
        [Id] NVARCHAR(100) NOT NULL,
        [Name] NVARCHAR(200) NOT NULL,
        [Description] NVARCHAR(2000) NULL,
        [Price] INT NOT NULL,
        [Image] NVARCHAR(500) NULL,
        [CategoryId] NVARCHAR(100) NOT NULL,
        [Stock] INT NOT NULL DEFAULT 0,
        [Featured] BIT NOT NULL DEFAULT 0,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_Products] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Products_Price] CHECK ([Price] > 0),
        CONSTRAINT [CK_Products_Stock] CHECK ([Stock] >= 0),
        CONSTRAINT [FK_Products_Categories_CategoryId] FOREIGN KEY ([CategoryId]) 
            REFERENCES [Categories] ([Id]) ON DELETE NO ACTION
    );
    CREATE INDEX [IX_Products_CategoryId_Price] ON [Products] ([CategoryId], [Price]);
    CREATE INDEX [IX_Products_CreatedAt] ON [Products] ([CreatedAt]);
    CREATE INDEX [IX_Products_Featured] ON [Products] ([Featured]);
END
GO

-- 2.6 Bảng ProductImages
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProductImages')
BEGIN
    CREATE TABLE [ProductImages] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [ProductId] NVARCHAR(100) NOT NULL,
        [Url] NVARCHAR(500) NOT NULL,
        [SortOrder] INT NOT NULL DEFAULT 0,
        CONSTRAINT [PK_ProductImages] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductImages_Products_ProductId] FOREIGN KEY ([ProductId]) 
            REFERENCES [Products] ([Id]) ON DELETE CASCADE
    );
    CREATE INDEX [IX_ProductImages_ProductId] ON [ProductImages] ([ProductId]);
END
GO

-- 2.7 Bảng Orders
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Orders')
BEGIN
    CREATE TABLE [Orders] (
        [Id] NVARCHAR(30) NOT NULL,
        [Status] NVARCHAR(20) NOT NULL DEFAULT N'Pending',
        [PaymentMethod] NVARCHAR(20) NOT NULL DEFAULT N'Cod',
        [Subtotal] INT NOT NULL,
        [ShippingFee] INT NOT NULL DEFAULT 0,
        [Total] INT NOT NULL,
        [Note] NVARCHAR(500) NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [Shipping_FullName] NVARCHAR(100) NOT NULL,
        [Shipping_Phone] NVARCHAR(15) NOT NULL,
        [Shipping_Email] NVARCHAR(200) NULL,
        [Shipping_Address] NVARCHAR(300) NOT NULL,
        [Shipping_Ward] NVARCHAR(100) NULL,
        [Shipping_District] NVARCHAR(100) NOT NULL,
        [Shipping_City] NVARCHAR(100) NOT NULL,
        [Shipping_DeliveryDate] DATE NULL,
        [Shipping_CardMessage] NVARCHAR(200) NULL,
        CONSTRAINT [PK_Orders] PRIMARY KEY ([Id])
    );
    CREATE INDEX [IX_Orders_CreatedAt] ON [Orders] ([CreatedAt]);
    CREATE INDEX [IX_Orders_Status] ON [Orders] ([Status]);
    CREATE INDEX [IX_Orders_ShippingPhone] ON [Orders] ([Shipping_Phone]);
END
GO

-- 2.8 Bảng OrderItems
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderItems')
BEGIN
    CREATE TABLE [OrderItems] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [OrderId] NVARCHAR(30) NOT NULL,
        [ProductId] NVARCHAR(100) NOT NULL,
        [Name] NVARCHAR(200) NOT NULL,
        [Image] NVARCHAR(500) NULL,
        [UnitPrice] INT NOT NULL,
        [Quantity] INT NOT NULL,
        [LineTotal] INT NOT NULL,
        CONSTRAINT [PK_OrderItems] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_OrderItems_Quantity] CHECK ([Quantity] BETWEEN 1 AND 20),
        CONSTRAINT [FK_OrderItems_Orders_OrderId] FOREIGN KEY ([OrderId]) 
            REFERENCES [Orders] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_OrderItems_Products_ProductId] FOREIGN KEY ([ProductId]) 
            REFERENCES [Products] ([Id]) ON DELETE NO ACTION
    );
    CREATE UNIQUE INDEX [IX_OrderItems_OrderId_ProductId] ON [OrderItems] ([OrderId], [ProductId]);
END
GO

-- 2.9 Bảng ContactMessages
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ContactMessages')
BEGIN
    CREATE TABLE [ContactMessages] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [FullName] NVARCHAR(100) NOT NULL,
        [Email] NVARCHAR(200) NULL,
        [Phone] NVARCHAR(15) NULL,
        [Content] NVARCHAR(2000) NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_ContactMessages] PRIMARY KEY ([Id])
    );
END
GO

-- ==============================================================================
-- 3. NẠP DỮ LIỆU MẪU (CHÈN AN TOÀN - CHỈ INSERT NẾU CHƯA CÓ)
-- ==============================================================================

-- 3.1 Nạp Roles
MERGE INTO [Roles] AS Target
USING (VALUES 
    ('admin', N'Quản trị viên', N'Toàn quyền quản lý hệ thống'),
    ('staff', N'Nhân viên', N'Quản lý sản phẩm, đơn hàng và liên hệ'),
    ('customer', N'Khách hàng', N'Mua hàng và theo dõi đơn hàng cá nhân')
) AS Source ([Id], [Name], [Description])
ON Target.[Id] = Source.[Id]
WHEN NOT MATCHED THEN
    INSERT ([Id], [Name], [Description]) VALUES (Source.[Id], Source.[Name], Source.[Description]);
GO

-- 3.2 Nạp Quyền Permissions
MERGE INTO [RolePermissions] AS Target
USING (VALUES
    ('admin', 'products.manage'),
    ('admin', 'categories.manage'),
    ('admin', 'orders.read'),
    ('admin', 'orders.update'),
    ('admin', 'contacts.read'),
    ('admin', 'users.manage'),
    ('staff', 'products.manage'),
    ('staff', 'orders.read'),
    ('staff', 'orders.update'),
    ('staff', 'contacts.read')
) AS Source ([RoleId], [Permission])
ON Target.[RoleId] = Source.[RoleId] AND Target.[Permission] = Source.[Permission]
WHEN NOT MATCHED THEN
    INSERT ([RoleId], [Permission]) VALUES (Source.[RoleId], Source.[Permission]);
GO

-- 3.3 Nạp Tài khoản Quản trị Admin
IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = 'admin@sunnyflower.vn')
BEGIN
    INSERT INTO [Users] ([Email], [FullName], [PasswordHash], [RoleId], [IsActive], [CreatedAt])
    VALUES (
        N'admin@sunnyflower.vn',
        N'Quản trị viên SunnyFlower',
        N'100000.ftlQ6frcQLKxsy2FxrY8RQ==.gav0Vc06p3lPTjm/HjgvUn3VOjxJ/NyEQolpVSBCQ+I=',
        'admin',
        1,
        GETUTCDATE()
    );
END
GO

-- 3.4 Nạp Categories
MERGE INTO [Categories] AS Target
USING (VALUES
    ('hoa-hong', N'Hoa hồng', N'Hồng nhập và hồng Đà Lạt tươi mỗi ngày', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600'),
    ('hoa-sinh-nhat', N'Hoa sinh nhật', N'Bó và giỏ hoa rực rỡ cho ngày đặc biệt', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600'),
    ('hoa-khai-truong', N'Hoa khai trương', N'Kệ hoa chúc mừng, phát tài phát lộc', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600'),
    ('hoa-cuoi', N'Hoa cưới', N'Hoa cầm tay và trang trí tiệc cưới', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600')
) AS Source ([Id], [Name], [Description], [Image])
ON Target.[Id] = Source.[Id]
WHEN NOT MATCHED THEN
    INSERT ([Id], [Name], [Description], [Image]) 
    VALUES (Source.[Id], Source.[Name], Source.[Description], Source.[Image]);
GO

-- 3.5 Nạp Products
MERGE INTO [Products] AS Target
USING (VALUES
    ('bo-hong-do-20-bong', N'Bó hồng đỏ 20 bông', N'Hồng đỏ Đà Lạt tuyển chọn, bọc giấy kraft sang trọng.', 350000, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800', 'hoa-hong', 15, 1, '2026-09-01'),
    ('bo-hong-pastel-10-bong', N'Bó hồng pastel 10 bông', N'Tone hồng phấn ngọt ngào, phù hợp tặng bạn gái.', 220000, 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800', 'hoa-hong', 20, 0, '2026-09-02'),
    ('hop-hong-vang', N'Hộp hồng vàng 15 bông', N'Hộp hoa sang trọng, phối baby trắng.', 420000, 'https://images.unsplash.com/photo-1533616688419-b7a585564566?w=800', 'hoa-hong', 8, 1, '2026-09-03'),
    ('gio-huong-duong-sinh-nhat', N'Giỏ hướng dương rạng rỡ', N'Hướng dương kết hợp đồng tiền và lá bạc.', 480000, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800', 'hoa-sinh-nhat', 12, 1, '2026-09-04'),
    ('bo-cam-chuong-mix', N'Bó cẩm chướng mix màu', N'Cẩm chướng hồng, trắng, viền tím dịu dàng.', 260000, 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800', 'hoa-sinh-nhat', 18, 0, '2026-09-05'),
    ('bo-tulip-hong-15', N'Bó tulip hồng 15 bông', N'Tulip Hà Lan nhập khẩu, tươi lâu.', 890000, 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800', 'hoa-sinh-nhat', 6, 1, '2026-09-06'),
    ('hoa-cam-tay-cuoi-trang', N'Hoa cầm tay cô dâu trắng', N'Hồng trắng phối bi, ruy băng lụa cao cấp.', 1200000, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', 'hoa-cuoi', 5, 1, '2026-09-07'),
    ('hoa-cuoi-pastel-hong', N'Hoa cưới cầm tay pastel', N'Tone hồng - trắng nhã nhặn, chụp hình cực đẹp.', 950000, 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800', 'hoa-cuoi', 4, 0, '2026-09-08'),
    ('ke-hoa-khai-truong-phat-tai', N'Kệ hoa khai trương Phát Tài', N'Kệ 2 tầng hoa hướng dương, lan hồ điệp vàng.', 1800000, 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800', 'hoa-khai-truong', 7, 1, '2026-09-09'),
    ('ke-hoa-chuc-mung-hong-phat', N'Kệ hoa chúc mừng Hồng Phát', N'Kệ 1 tầng tone đỏ - vàng rực rỡ, mừng khai trương.', 1100000, 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800', 'hoa-khai-truong', 10, 0, '2026-09-10')
) AS Source ([Id], [Name], [Description], [Price], [Image], [CategoryId], [Stock], [Featured], [CreatedAt])
ON Target.[Id] = Source.[Id]
WHEN NOT MATCHED THEN
    INSERT ([Id], [Name], [Description], [Price], [Image], [CategoryId], [Stock], [Featured], [CreatedAt])
    VALUES (Source.[Id], Source.[Name], Source.[Description], Source.[Price], Source.[Image], Source.[CategoryId], Source.[Stock], Source.[Featured], CAST(Source.[CreatedAt] AS DATETIME2));
GO

-- 3.6 Nạp ProductImages
IF NOT EXISTS (SELECT 1 FROM [ProductImages] WHERE [ProductId] = 'bo-hong-do-20-bong')
BEGIN
    INSERT INTO [ProductImages] ([ProductId], [Url], [SortOrder])
    VALUES 
    ('bo-hong-do-20-bong', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800', 0),
    ('bo-tulip-hong-15', 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800', 0),
    ('ke-hoa-khai-truong-phat-tai', 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800', 0);
END
GO

-- 3.7 Nạp Orders & OrderItems mẫu
IF NOT EXISTS (SELECT 1 FROM [Orders] WHERE [Id] = 'SF-20261005-0001')
BEGIN
    INSERT INTO [Orders] (
        [Id], [Status], [PaymentMethod], [Subtotal], [ShippingFee], [Total], [Note], [CreatedAt],
        [Shipping_FullName], [Shipping_Phone], [Shipping_Email], [Shipping_Address],
        [Shipping_Ward], [Shipping_District], [Shipping_City], [Shipping_DeliveryDate], [Shipping_CardMessage]
    ) VALUES (
        'SF-20261005-0001',
        N'Confirmed',
        N'Cod',
        350000,
        30000,
        380000,
        N'Giao trước 10h sáng giúp mình',
        GETUTCDATE(),
        N'Nguyễn Văn An',
        '0912345678',
        'an.nguyen@gmail.com',
        N'123 Nguyễn Huệ',
        N'Bến Nghé',
        N'Quận 1',
        N'Hồ Chí Minh',
        CAST(GETDATE() AS DATE),
        N'Chúc mừng sinh nhật em yêu!'
    );

    INSERT INTO [OrderItems] ([OrderId], [ProductId], [Name], [Image], [UnitPrice], [Quantity], [LineTotal])
    VALUES (
        'SF-20261005-0001',
        'bo-hong-do-20-bong',
        N'Bó hồng đỏ 20 bông',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
        350000,
        1,
        350000
    );
END
GO

PRINT N'==============================================================================';
PRINT N' HOÀN TẤT KHỞI TẠO CSDL VÀ DỮ LIỆU MẪU CHO SUNNYFLOWER THÀNH CÔNG!';
PRINT N'==============================================================================';
GO
