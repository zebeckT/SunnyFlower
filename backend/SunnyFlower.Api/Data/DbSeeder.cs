using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SunnyFlower.Api.Auth;
using SunnyFlower.Api.Entities;

namespace SunnyFlower.Api.Data;

public static class DbSeeder
{
    private record SeedFile(List<Category> Categories, List<SeedProduct> Products);
    private record SeedProduct(string Id, string Name, string? Description, int Price, string? Image,
        List<string>? Images, string CategoryId, int Stock, bool Featured, DateTime CreatedAt);

    private static readonly (string Id, string Name, string Description, string[] Perms)[] Roles =
    [
        ("admin", "Quản trị viên", "Toàn quyền hệ thống",
            [Permissions.ProductsManage, Permissions.CategoriesManage, Permissions.OrdersRead,
             Permissions.OrdersUpdate, Permissions.ContactsRead, Permissions.UsersManage]),
        ("staff", "Nhân viên", "Quản lý sản phẩm, đơn hàng và liên hệ",
            [Permissions.ProductsManage, Permissions.OrdersRead, Permissions.OrdersUpdate, Permissions.ContactsRead]),
        ("customer", "Khách hàng", "Mua hàng và xem đơn của mình", [])
    ];

    private static async Task SeedAuthAsync(AppDbContext db, IConfiguration config)
    {
        if (!await db.Roles.AnyAsync())
        {
            db.Roles.AddRange(Roles.Select(r => new Role
            {
                Id = r.Id, Name = r.Name, Description = r.Description,
                Permissions = r.Perms.Select(p => new RolePermission { Permission = p }).ToList()
            }));
            await db.SaveChangesAsync();
        }

        // Tài khoản admin đầu tiên: email/mật khẩu lấy từ cấu hình (Seed:AdminEmail / Seed:AdminPassword), không hardcode.
        var email = config["Seed:AdminEmail"];
        var password = config["Seed:AdminPassword"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password)) return;
        if (await db.Users.AnyAsync(u => u.Email == email)) return;

        db.Users.Add(new User
        {
            Email = email.Trim().ToLowerInvariant(), FullName = "Quản trị viên",
            PasswordHash = PasswordHasher.Hash(password), RoleId = "admin"
        });
        await db.SaveChangesAsync();
    }

    public static async Task SeedAsync(AppDbContext db, IConfiguration config)
    {
        await db.Database.MigrateAsync();
        await SeedAuthAsync(db, config);
        if (await db.Categories.AnyAsync()) return;

        var path = Path.Combine(AppContext.BaseDirectory, "Data", "products.sample.json");
        var seed = JsonSerializer.Deserialize<SeedFile>(await File.ReadAllTextAsync(path),
            new JsonSerializerOptions(JsonSerializerDefaults.Web))!;

        db.Categories.AddRange(seed.Categories);
        db.Products.AddRange(seed.Products.Select(p => new Product
        {
            Id = p.Id, Name = p.Name, Description = p.Description, Price = p.Price, Image = p.Image,
            CategoryId = p.CategoryId, Stock = p.Stock, Featured = p.Featured,
            CreatedAt = DateTime.SpecifyKind(p.CreatedAt, DateTimeKind.Utc),
            Images = (p.Images ?? []).Select((u, i) => new ProductImage { Url = u, SortOrder = i }).ToList()
        }));
        await db.SaveChangesAsync();
    }
}
