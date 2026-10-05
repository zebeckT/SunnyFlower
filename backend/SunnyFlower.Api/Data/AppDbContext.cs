using Microsoft.EntityFrameworkCore;
using SunnyFlower.Api.Entities;

namespace SunnyFlower.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Role>(e =>
        {
            e.Property(x => x.Id).HasMaxLength(30);
            e.Property(x => x.Name).HasMaxLength(100).IsRequired();
            e.Property(x => x.Description).HasMaxLength(300);
        });

        b.Entity<RolePermission>(e =>
        {
            e.HasKey(x => new { x.RoleId, x.Permission });
            e.Property(x => x.RoleId).HasMaxLength(30);
            e.Property(x => x.Permission).HasMaxLength(60);
            e.HasOne(x => x.Role).WithMany(r => r.Permissions)
                .HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<User>(e =>
        {
            e.Property(x => x.Email).HasMaxLength(200).IsRequired();
            e.Property(x => x.FullName).HasMaxLength(100).IsRequired();
            e.Property(x => x.PasswordHash).HasMaxLength(200).IsRequired();
            e.Property(x => x.RoleId).HasMaxLength(30);
            e.HasIndex(x => x.Email).IsUnique();
            e.HasOne(x => x.Role).WithMany(r => r.Users)
                .HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<Category>(e =>
        {
            e.Property(x => x.Id).HasMaxLength(100);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasMaxLength(500);
            e.Property(x => x.Image).HasMaxLength(500);
        });

        b.Entity<Product>(e =>
        {
            e.Property(x => x.Id).HasMaxLength(100);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasMaxLength(2000);
            e.Property(x => x.Image).HasMaxLength(500);
            e.Property(x => x.CategoryId).HasMaxLength(100);
            e.ToTable(t =>
            {
                t.HasCheckConstraint("CK_Products_Price", "[Price] > 0");
                t.HasCheckConstraint("CK_Products_Stock", "[Stock] >= 0");
            });
            e.HasOne(x => x.Category).WithMany(c => c.Products)
                .HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.CategoryId, x.Price });
            e.HasIndex(x => x.CreatedAt);
            e.HasIndex(x => x.Featured);
        });

        b.Entity<ProductImage>(e =>
        {
            e.Property(x => x.ProductId).HasMaxLength(100);
            e.Property(x => x.Url).HasMaxLength(500).IsRequired();
            e.HasOne(x => x.Product).WithMany(p => p.Images)
                .HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Order>(e =>
        {
            e.Property(x => x.Id).HasMaxLength(30);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.PaymentMethod).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Note).HasMaxLength(500);
            e.HasIndex(x => x.CreatedAt);
            e.HasIndex(x => x.Status);
            e.OwnsOne(x => x.Shipping, s =>
            {
                s.Property(p => p.FullName).HasMaxLength(100).IsRequired();
                s.Property(p => p.Phone).HasMaxLength(15).IsRequired();
                s.Property(p => p.Email).HasMaxLength(200);
                s.Property(p => p.Address).HasMaxLength(300).IsRequired();
                s.Property(p => p.Ward).HasMaxLength(100);
                s.Property(p => p.District).HasMaxLength(100).IsRequired();
                s.Property(p => p.City).HasMaxLength(100).IsRequired();
                s.Property(p => p.CardMessage).HasMaxLength(200);
                s.HasIndex(p => p.Phone);
            });
            e.Navigation(x => x.Shipping).IsRequired();
        });

        b.Entity<OrderItem>(e =>
        {
            e.Property(x => x.OrderId).HasMaxLength(30);
            e.Property(x => x.ProductId).HasMaxLength(100);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.Image).HasMaxLength(500);
            e.ToTable(t => t.HasCheckConstraint("CK_OrderItems_Quantity", "[Quantity] BETWEEN 1 AND 20"));
            e.HasOne(x => x.Order).WithMany(o => o.Items)
                .HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product).WithMany()
                .HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.OrderId, x.ProductId }).IsUnique();
        });

        b.Entity<ContactMessage>(e =>
        {
            e.Property(x => x.FullName).HasMaxLength(100).IsRequired();
            e.Property(x => x.Email).HasMaxLength(200);
            e.Property(x => x.Phone).HasMaxLength(15);
            e.Property(x => x.Content).HasMaxLength(2000).IsRequired();
        });
    }
}
