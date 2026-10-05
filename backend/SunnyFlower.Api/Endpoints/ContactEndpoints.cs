using System.ComponentModel.DataAnnotations;
using SunnyFlower.Api.DTOs;
using SunnyFlower.Api.Entities;
using SunnyFlower.Api.Services;

namespace SunnyFlower.Api.Endpoints;

public static class ContactEndpoints
{
    public static void MapContacts(this WebApplication app)
    {
        var g = app.MapGroup("/api/contact").WithTags("Contact");

        // POST /api/contact  (public)
        g.MapPost("/", async (CreateContactRequest req, ContactService svc) =>
        {
            if (!Validator.TryValidateObject(req, new ValidationContext(req), null, true))
                return Results.BadRequest(new { error = "Dữ liệu không hợp lệ" });

            var result = await svc.CreateAsync(req);
            return Results.Created($"/api/contact/{result.Id}", result);
        })
        .WithName("CreateContact")
        .WithSummary("Gửi form liên hệ (không cần đăng nhập)");

        // GET /api/contact?page=1&pageSize=20  [Admin/Staff]
        g.MapGet("/", async (int? page, int? pageSize, ContactService svc) =>
        {
            var result = await svc.GetAllAsync(page ?? 1, pageSize ?? 20);
            return Results.Ok(result);
        })
        .WithName("GetContacts")
        .WithSummary("Lấy danh sách tin nhắn liên hệ (chỉ Admin/Staff)")
        .RequireAuthorization(p => p.RequireClaim("permission", Permissions.ContactsRead));
    }
}
