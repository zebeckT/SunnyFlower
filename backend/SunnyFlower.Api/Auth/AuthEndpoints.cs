using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SunnyFlower.Api.Data;
using SunnyFlower.Api.Entities;

namespace SunnyFlower.Api.Auth;

public record RegisterRequest([Required, EmailAddress] string Email, [Required, MinLength(6)] string Password,
    [Required] string FullName);
public record LoginRequest(string Email, string Password);

public static class AuthEndpoints
{
    private static object Profile(User u) => new
    {
        u.Id, u.Email, u.FullName, role = u.RoleId,
        permissions = u.Role.Permissions.Select(p => p.Permission)
    };

    private static Task<User?> FindUser(AppDbContext db, Func<IQueryable<User>, IQueryable<User>> filter) =>
        filter(db.Users.Include(u => u.Role).ThenInclude(r => r.Permissions)).FirstOrDefaultAsync();

    public static void MapAuth(this WebApplication app)
    {
        var g = app.MapGroup("/api/auth");

        g.MapPost("/register", async (RegisterRequest r, AppDbContext db, JwtTokenService jwt) =>
        {
            if (!Validator.TryValidateObject(r, new ValidationContext(r), null, true))
                return Results.BadRequest(new { error = "Dữ liệu không hợp lệ" });
            var email = r.Email.Trim().ToLowerInvariant();
            if (await db.Users.AnyAsync(u => u.Email == email))
                return Results.Conflict(new { error = "Email đã được sử dụng" });

            db.Users.Add(new User
            {
                Email = email, FullName = r.FullName.Trim(),
                PasswordHash = PasswordHasher.Hash(r.Password), RoleId = "customer" // đăng ký công khai luôn là customer
            });
            await db.SaveChangesAsync();

            var user = (await FindUser(db, q => q.Where(u => u.Email == email)))!;
            var (token, expires) = jwt.Create(user);
            return Results.Created("/api/auth/me", new { token, expiresAt = expires, user = Profile(user) });
        });

        g.MapPost("/login", async (LoginRequest r, AppDbContext db, JwtTokenService jwt) =>
        {
            var email = (r.Email ?? "").Trim().ToLowerInvariant();
            var user = await FindUser(db, q => q.Where(u => u.Email == email));
            if (user is null || !user.IsActive || !PasswordHasher.Verify(r.Password ?? "", user.PasswordHash))
                return Results.Json(new { error = "Email hoặc mật khẩu không đúng" }, statusCode: 401);

            var (token, expires) = jwt.Create(user);
            return Results.Ok(new { token, expiresAt = expires, user = Profile(user) });
        });

        g.MapGet("/me", async (ClaimsPrincipal principal, AppDbContext db) =>
        {
            if (!int.TryParse(principal.FindFirstValue("sub"), out var id)) return Results.Unauthorized();
            var user = await FindUser(db, q => q.Where(u => u.Id == id && u.IsActive));
            return user is null ? Results.Unauthorized() : Results.Ok(Profile(user));
        }).RequireAuthorization();
    }
}
