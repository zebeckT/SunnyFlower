namespace SunnyFlower.Api.Entities;

public class Role
{
    public string Id { get; set; } = default!; // admin | staff | customer
    public string Name { get; set; } = default!;
    public string? Description { get; set; }

    public List<RolePermission> Permissions { get; set; } = [];
    public List<User> Users { get; set; } = [];
}

public class RolePermission
{
    public string RoleId { get; set; } = default!;
    public string Permission { get; set; } = default!; // vd "orders.read"

    public Role Role { get; set; } = default!;
}

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string PasswordHash { get; set; } = default!; // PBKDF2: iterations.salt.hash (base64)
    public string RoleId { get; set; } = default!;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Role Role { get; set; } = default!;
}

public static class Permissions
{
    public const string ProductsManage = "products.manage";
    public const string CategoriesManage = "categories.manage";
    public const string OrdersRead = "orders.read";
    public const string OrdersUpdate = "orders.update";
    public const string ContactsRead = "contacts.read";
    public const string UsersManage = "users.manage";
}
