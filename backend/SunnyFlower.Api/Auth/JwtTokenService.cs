using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SunnyFlower.Api.Entities;

namespace SunnyFlower.Api.Auth;

public class JwtOptions
{
    public string Key { get; set; } = default!; // user-secrets hoặc biến môi trường Jwt__Key
    public string Issuer { get; set; } = "SunnyFlower";
    public string Audience { get; set; } = "SunnyFlower";
    public int ExpireMinutes { get; set; } = 120;
}

public class JwtTokenService(IConfiguration config)
{
    private readonly JwtOptions _opt = config.GetSection("Jwt").Get<JwtOptions>() ?? new();

    public static SymmetricSecurityKey SigningKey(JwtOptions o) => new(Encoding.UTF8.GetBytes(o.Key));

    public (string Token, DateTime ExpiresAt) Create(User user)
    {
        var expires = DateTime.UtcNow.AddMinutes(_opt.ExpireMinutes);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("role", user.RoleId)
        };
        claims.AddRange(user.Role.Permissions.Select(p => new Claim("permission", p.Permission)));

        var token = new JwtSecurityToken(_opt.Issuer, _opt.Audience, claims, expires: expires,
            signingCredentials: new SigningCredentials(SigningKey(_opt), SecurityAlgorithms.HmacSha256));
        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }
}
