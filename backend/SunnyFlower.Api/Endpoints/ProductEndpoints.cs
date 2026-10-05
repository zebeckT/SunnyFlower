using System.ComponentModel.DataAnnotations;
using SunnyFlower.Api.DTOs;
using SunnyFlower.Api.Entities;
using SunnyFlower.Api.Services;

namespace SunnyFlower.Api.Endpoints;

public static class ProductEndpoints
{
    public static void MapProducts(this WebApplication app)
    {
        var g = app.MapGroup("/api/products").WithTags("Products");

        // GET /api/products?categoryId=hoa-hong&search=...&page=1&pageSize=12
        g.MapGet("/", async (
            [AsParameters] ProductQueryParams q,
            ProductService svc) =>
        {
            var result = await svc.GetAllAsync(q);
            return Results.Ok(result);
        })
        .WithName("GetProducts")
        .WithSummary("Lấy danh sách sản phẩm (có filter, sort, phân trang)");

        // GET /api/products/featured?take=8
        g.MapGet("/featured", async (int? take, ProductService svc) =>
        {
            var result = await svc.GetFeaturedAsync(take ?? 8);
            return Results.Ok(result);
        })
        .WithName("GetFeaturedProducts")
        .WithSummary("Lấy sản phẩm nổi bật cho trang chủ");

        // GET /api/products/{id}
        g.MapGet("/{id}", async (string id, ProductService svc) =>
        {
            var product = await svc.GetByIdAsync(id);
            return product is null
                ? Results.NotFound(new { error = "Không tìm thấy sản phẩm" })
                : Results.Ok(product);
        })
        .WithName("GetProductById")
        .WithSummary("Lấy chi tiết sản phẩm");

        // POST /api/products  [Admin]
        g.MapPost("/", async (CreateProductRequest req, ProductService svc) =>
        {
            if (!Validator.TryValidateObject(req, new ValidationContext(req), null, true))
                return Results.BadRequest(new { error = "Dữ liệu không hợp lệ" });

            var (ok, error, result) = await svc.CreateAsync(req);
            return ok
                ? Results.Created($"/api/products/{result!.Id}", result)
                : Results.BadRequest(new { error });
        })
        .WithName("CreateProduct")
        .WithSummary("Thêm sản phẩm mới")
        .RequireAuthorization(p => p.RequireClaim("permission", Permissions.ProductsManage));

        // PUT /api/products/{id}  [Admin]
        g.MapPut("/{id}", async (string id, UpdateProductRequest req, ProductService svc) =>
        {
            if (!Validator.TryValidateObject(req, new ValidationContext(req), null, true))
                return Results.BadRequest(new { error = "Dữ liệu không hợp lệ" });

            var (ok, error, result) = await svc.UpdateAsync(id, req);
            return ok ? Results.Ok(result) : Results.NotFound(new { error });
        })
        .WithName("UpdateProduct")
        .WithSummary("Cập nhật sản phẩm")
        .RequireAuthorization(p => p.RequireClaim("permission", Permissions.ProductsManage));

        // PATCH /api/products/{id}/stock  [Admin]
        g.MapPatch("/{id}/stock", async (string id, UpdateStockRequest req, ProductService svc) =>
        {
            var (ok, error) = await svc.UpdateStockAsync(id, req.Stock);
            return ok ? Results.NoContent() : Results.NotFound(new { error });
        })
        .WithName("UpdateProductStock")
        .WithSummary("Cập nhật tồn kho sản phẩm")
        .RequireAuthorization(p => p.RequireClaim("permission", Permissions.ProductsManage));

        // DELETE /api/products/{id}  [Admin]
        g.MapDelete("/{id}", async (string id, ProductService svc) =>
        {
            var (ok, error) = await svc.DeleteAsync(id);
            return ok ? Results.NoContent() : Results.BadRequest(new { error });
        })
        .WithName("DeleteProduct")
        .WithSummary("Xóa sản phẩm")
        .RequireAuthorization(p => p.RequireClaim("permission", Permissions.ProductsManage));
    }
}
