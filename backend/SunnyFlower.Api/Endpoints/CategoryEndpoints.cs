using System.ComponentModel.DataAnnotations;
using SunnyFlower.Api.DTOs;
using SunnyFlower.Api.Entities;
using SunnyFlower.Api.Services;

namespace SunnyFlower.Api.Endpoints;

public static class CategoryEndpoints
{
    public static void MapCategories(this WebApplication app)
    {
        var g = app.MapGroup("/api/categories").WithTags("Categories");

        // GET /api/categories
        // Trả về tất cả danh mục (public)
        g.MapGet("/", async (CategoryService svc) =>
        {
            var list = await svc.GetAllAsync();
            return Results.Ok(list);
        })
        .WithName("GetCategories")
        .WithSummary("Lấy danh sách tất cả danh mục");

        // GET /api/categories/{id}
        g.MapGet("/{id}", async (string id, CategoryService svc) =>
        {
            var cat = await svc.GetByIdAsync(id);
            return cat is null ? Results.NotFound(new { error = "Không tìm thấy danh mục" }) : Results.Ok(cat);
        })
        .WithName("GetCategoryById")
        .WithSummary("Lấy chi tiết danh mục theo id");

        // POST /api/categories  [Admin]
        g.MapPost("/", async (CreateCategoryRequest req, CategoryService svc) =>
        {
            if (!Validator.TryValidateObject(req, new ValidationContext(req), null, true))
                return Results.BadRequest(new { error = "Dữ liệu không hợp lệ" });

            var (ok, error, result) = await svc.CreateAsync(req);
            return ok
                ? Results.Created($"/api/categories/{result!.Id}", result)
                : Results.Conflict(new { error });
        })
        .WithName("CreateCategory")
        .WithSummary("Tạo danh mục mới")
        .RequireAuthorization(p => p.RequireClaim("permission", Permissions.CategoriesManage));

        // PUT /api/categories/{id}  [Admin]
        g.MapPut("/{id}", async (string id, UpdateCategoryRequest req, CategoryService svc) =>
        {
            if (!Validator.TryValidateObject(req, new ValidationContext(req), null, true))
                return Results.BadRequest(new { error = "Dữ liệu không hợp lệ" });

            var (ok, error, result) = await svc.UpdateAsync(id, req);
            return ok ? Results.Ok(result) : Results.NotFound(new { error });
        })
        .WithName("UpdateCategory")
        .WithSummary("Cập nhật danh mục")
        .RequireAuthorization(p => p.RequireClaim("permission", Permissions.CategoriesManage));

        // DELETE /api/categories/{id}  [Admin]
        g.MapDelete("/{id}", async (string id, CategoryService svc) =>
        {
            var (ok, error) = await svc.DeleteAsync(id);
            return ok ? Results.NoContent() : Results.BadRequest(new { error });
        })
        .WithName("DeleteCategory")
        .WithSummary("Xóa danh mục (chỉ được xóa khi không còn sản phẩm)")
        .RequireAuthorization(p => p.RequireClaim("permission", Permissions.CategoriesManage));
    }
}
