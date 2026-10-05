using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SunnyFlower.Api.Auth;
using SunnyFlower.Api.Data;
using SunnyFlower.Api.Endpoints;
using SunnyFlower.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── Database ────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// ─── JWT Authentication ───────────────────────────────────────────────────────
var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();
if (string.IsNullOrWhiteSpace(jwtOptions.Key) || jwtOptions.Key.Length < 32)
    throw new InvalidOperationException(
        "Thiếu Jwt:Key (>= 32 ký tự). Dùng: dotnet user-secrets set \"Jwt:Key\" \"...\" hoặc biến môi trường Jwt__Key.");

builder.Services.AddSingleton<JwtTokenService>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.MapInboundClaims = false;
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true, ValidIssuer           = jwtOptions.Issuer,
            ValidateAudience         = true, ValidAudience         = jwtOptions.Audience,
            ValidateIssuerSigningKey = true, IssuerSigningKey      = JwtTokenService.SigningKey(jwtOptions),
            ValidateLifetime         = true, ClockSkew             = TimeSpan.FromMinutes(1),
            NameClaimType            = "sub", RoleClaimType        = "role"
        };
    });
builder.Services.AddAuthorization();

// ─── CORS ─────────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173", "http://localhost:3000"];

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins(allowedOrigins)
     .AllowAnyMethod()
     .AllowAnyHeader()
     .AllowCredentials()));

// ─── Application Services ─────────────────────────────────────────────────────
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<ContactService>();

// ─── Swagger / OpenAPI ────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "🌸 SunnyFlower API",
        Version     = "v1",
        Description = "REST API cho website Bán Hoa SunnyFlower",
        Contact     = new OpenApiContact { Name = "SunnyFlower Dev", Email = "dev@sunnyflower.vn" }
    });

    // Thêm JWT auth vào Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type         = SecuritySchemeType.Http,
        Scheme       = "bearer",
        BearerFormat = "JWT",
        Description  = "Nhập JWT token (không cần tiền tố Bearer)"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            []
        }
    });
});

// ─── Build ────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ─── Seed Database ────────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
    await DbSeeder.SeedAsync(
        scope.ServiceProvider.GetRequiredService<AppDbContext>(),
        app.Configuration);

// ─── Middleware Pipeline ──────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SunnyFlower API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// ─── Routes ───────────────────────────────────────────────────────────────────
app.MapGet("/health", () => Results.Ok(new { status = "ok", timestamp = DateTime.UtcNow }))
   .WithTags("Health");

app.MapAuth();
app.MapCategories();
app.MapProducts();
app.MapOrders();
app.MapContacts();

app.Run();
