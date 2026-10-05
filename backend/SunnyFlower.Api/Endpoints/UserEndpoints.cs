using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SunnyFlower.Api.Auth;
using SunnyFlower.Api.Data;
using SunnyFlower.Api.DTOs;
using SunnyFlower.Api.Entities;

namespace SunnyFlower.Api.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this WebApplication app)
    {
        // ─── 1. Endpoints cho người dùng đang đăng nhập (/api/auth & /api/me) ──────
        var meGroup = app.MapGroup("/api").RequireAuthorization();

        // PUT /api/auth/profile — Cập nhật thông tin cá nhân
        meGroup.MapPut("/auth/profile", async (UpdateProfileRequest req, ClaimsPrincipal principal, AppDbContext db) =>
        {
            if (!int.TryParse(principal.FindFirstValue("sub"), out var id))
                return Results.Unauthorized();

            if (!Validator.TryValidateObject(req, new ValidationContext(req), null, true))
                return Results.BadRequest(new { error = "Dữ liệu không hợp lệ" });

            var user = await db.Users.Include(u => u.Role).ThenInclude(r => r.Permissions)
                                    .FirstOrDefaultAsync(u => u.Id == id && u.IsActive);
            if (user is null) return Results.Unauthorized();

            user.FullName = req.FullName.Trim();
            await db.SaveChangesAsync();

            return Results.Ok(new
            {
                user.Id,
                user.Email,
                user.FullName,
                role = user.RoleId,
                permissions = user.Role.Permissions.Select(p => p.Permission)
            });
        });

        // POST /api/auth/change-password — Đổi mật khẩu
        meGroup.MapPost("/auth/change-password", async (ChangePasswordRequest req, ClaimsPrincipal principal, AppDbContext db) =>
        {
            if (!int.TryParse(principal.FindFirstValue("sub"), out var id))
                return Results.Unauthorized();

            if (!Validator.TryValidateObject(req, new ValidationContext(req), null, true))
                return Results.BadRequest(new { error = "Mật khẩu mới phải có ít nhất 8 ký tự" });

            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id && u.IsActive);
            if (user is null) return Results.Unauthorized();

            if (!PasswordHasher.Verify(req.OldPassword, user.PasswordHash))
                return Results.BadRequest(new { error = "Mật khẩu hiện tại không chính xác" });

            user.PasswordHash = PasswordHasher.Hash(req.NewPassword);
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "Đổi mật khẩu thành công" });
        });

        // GET /api/me/orders — Xem danh sách đơn hàng của chính mình
        meGroup.MapGet("/me/orders", async (ClaimsPrincipal principal, AppDbContext db) =>
        {
            if (!int.TryParse(principal.FindFirstValue("sub"), out var id))
                return Results.Unauthorized();

            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id && u.IsActive);
            if (user is null) return Results.Unauthorized();

            var orders = await db.Orders
                .Include(o => o.Items)
                .Where(o => o.Shipping.Email == user.Email)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new
                {
                    o.Id,
                    status = o.Status.ToString().ToLowerInvariant(),
                    paymentMethod = o.PaymentMethod.ToString().ToLowerInvariant(),
                    o.Subtotal,
                    o.ShippingFee,
                    o.Total,
                    o.Note,
                    o.CreatedAt,
                    shipping = new
                    {
                        o.Shipping.FullName,
                        o.Shipping.Phone,
                        o.Shipping.Email,
                        o.Shipping.Address,
                        o.Shipping.District,
                        o.Shipping.City,
                        o.Shipping.DeliveryDate,
                        o.Shipping.CardMessage
                    },
                    items = o.Items.Select(i => new
                    {
                        i.ProductId,
                        i.Name,
                        i.Image,
                        i.UnitPrice,
                        i.Quantity,
                        i.LineTotal
                    })
                })
                .ToListAsync();

            return Results.Ok(orders);
        });

        // ─── 2. Quản lý người dùng cho Admin (/api/admin/users) ─────────────
        var adminGroup = app.MapGroup("/api/admin/users")
            .RequireAuthorization(p => p.RequireClaim("permission", Permissions.UsersManage));

        // GET /api/admin/users
        adminGroup.MapGet("/", async (string? search, string? role, bool? isActive, int? page, int? pageSize, AppDbContext db) =>
        {
            var p = Math.Max(1, page ?? 1);
            var ps = Math.Clamp(pageSize ?? 20, 1, 100);

            var query = db.Users.Include(u => u.Role).ThenInclude(r => r.Permissions).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var kw = search.Trim().ToLower();
                query = query.Where(u => u.FullName.ToLower().Contains(kw) || u.Email.ToLower().Contains(kw));
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                query = query.Where(u => u.RoleId == role);
            }

            if (isActive.HasValue)
            {
                query = query.Where(u => u.IsActive == isActive.Value);
            }

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((p - 1) * ps)
                .Take(ps)
                .Select(u => new UserDto(
                    u.Id,
                    u.Email,
                    u.FullName,
                    u.RoleId,
                    u.IsActive,
                    u.CreatedAt,
                    u.Role.Permissions.Select(x => x.Permission).ToList()
                ))
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)total / ps);
            return Results.Ok(new UserListResponse(items, total, p, ps, Math.Max(1, totalPages)));
        });

        // GET /api/admin/users/{id}
        adminGroup.MapGet("/{id:int}", async (int id, AppDbContext db) =>
        {
            var u = await db.Users.Include(u => u.Role).ThenInclude(r => r.Permissions)
                                  .FirstOrDefaultAsync(u => u.Id == id);
            if (u is null) return Results.NotFound(new { error = "Không tìm thấy người dùng" });

            return Results.Ok(new UserDto(
                u.Id,
                u.Email,
                u.FullName,
                u.RoleId,
                u.IsActive,
                u.CreatedAt,
                u.Role.Permissions.Select(x => x.Permission).ToList()
            ));
        });

        // POST /api/admin/users — Tạo user/staff mới
        adminGroup.MapPost("/", async (AdminCreateUserRequest req, AppDbContext db) =>
        {
            if (!Validator.TryValidateObject(req, new ValidationContext(req), null, true))
                return Results.BadRequest(new { error = "Dữ liệu không hợp lệ. Mật khẩu phải từ 8 ký tự." });

            var email = req.Email.Trim().ToLowerInvariant();
            if (await db.Users.AnyAsync(u => u.Email == email))
                return Results.Conflict(new { error = "Email đã tồn tại trong hệ thống" });

            if (!await db.Roles.AnyAsync(r => r.Id == req.RoleId))
                return Results.BadRequest(new { error = "Vai trò không hợp lệ (admin, staff, customer)" });

            var newUser = new User
            {
                Email = email,
                FullName = req.FullName.Trim(),
                PasswordHash = PasswordHasher.Hash(req.Password),
                RoleId = req.RoleId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            db.Users.Add(newUser);
            await db.SaveChangesAsync();

            var created = await db.Users.Include(u => u.Role).ThenInclude(r => r.Permissions)
                                       .FirstAsync(u => u.Id == newUser.Id);

            return Results.Created($"/api/admin/users/{created.Id}", new UserDto(
                created.Id,
                created.Email,
                created.FullName,
                created.RoleId,
                created.IsActive,
                created.CreatedAt,
                created.Role.Permissions.Select(x => x.Permission).ToList()
            ));
        });

        // PATCH /api/admin/users/{id}/role — Đổi vai trò
        adminGroup.MapPatch("/{id:int}/role", async (int id, AdminUpdateUserRoleRequest req, ClaimsPrincipal principal, AppDbContext db) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user is null) return Results.NotFound(new { error = "Không tìm thấy người dùng" });

            if (!await db.Roles.AnyAsync(r => r.Id == req.RoleId))
                return Results.BadRequest(new { error = "Vai trò không hợp lệ" });

            // Quy tắc bảo vệ: Không cho phép hạ quyền admin cuối cùng trong hệ thống
            if (user.RoleId == "admin" && req.RoleId != "admin")
            {
                var activeAdminCount = await db.Users.CountAsync(u => u.RoleId == "admin" && u.IsActive);
                if (activeAdminCount <= 1)
                    return Results.BadRequest(new { error = "Không thể hạ quyền Quản trị viên cuối cùng của hệ thống" });
            }

            user.RoleId = req.RoleId;
            await db.SaveChangesAsync();

            return Results.Ok(new { message = $"Đã cập nhật vai trò thành {req.RoleId}" });
        });

        // PATCH /api/admin/users/{id}/status — Khóa / mở khóa tài khoản
        adminGroup.MapPatch("/{id:int}/status", async (int id, AdminUpdateUserStatusRequest req, ClaimsPrincipal principal, AppDbContext db) =>
        {
            int.TryParse(principal.FindFirstValue("sub"), out var currentUserId);
            if (id == currentUserId && !req.IsActive)
                return Results.BadRequest(new { error = "Bạn không thể tự khóa tài khoản của chính mình" });

            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user is null) return Results.NotFound(new { error = "Không tìm thấy người dùng" });

            // Quy tắc bảo vệ: Không cho phép khóa admin cuối cùng
            if (user.RoleId == "admin" && !req.IsActive)
            {
                var activeAdminCount = await db.Users.CountAsync(u => u.RoleId == "admin" && u.IsActive && u.Id != id);
                if (activeAdminCount == 0)
                    return Results.BadRequest(new { error = "Không thể khóa Quản trị viên hoạt động duy nhất của hệ thống" });
            }

            user.IsActive = req.IsActive;
            await db.SaveChangesAsync();

            return Results.Ok(new { message = req.IsActive ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản người dùng" });
        });
    }
}
