using System.ComponentModel.DataAnnotations;
using SunnyFlower.Api.DTOs;
using SunnyFlower.Api.Entities;
using SunnyFlower.Api.Services;

namespace SunnyFlower.Api.Endpoints;

public static class OrderEndpoints
{
    public static void MapOrders(this WebApplication app)
    {
        var g = app.MapGroup("/api/orders").WithTags("Orders");

        // POST /api/orders  (public - khách đặt hàng không cần đăng nhập)
        g.MapPost("/", async (CreateOrderRequest req, OrderService svc) =>
        {
            if (!Validator.TryValidateObject(req, new ValidationContext(req), null, true))
                return Results.BadRequest(new { error = "Dữ liệu không hợp lệ" });

            if (req.Items is null || req.Items.Count == 0)
                return Results.BadRequest(new { error = "Đơn hàng phải có ít nhất 1 sản phẩm" });

            var (ok, error, result) = await svc.CreateAsync(req);
            return ok
                ? Results.Created($"/api/orders/{result!.Id}", result)
                : Results.BadRequest(new { error });
        })
        .WithName("CreateOrder")
        .WithSummary("Đặt hàng mới (không cần đăng nhập)");

        // GET /api/orders  [Staff / Admin]
        g.MapGet("/", async ([AsParameters] OrderQueryParams q, OrderService svc) =>
        {
            var result = await svc.GetAllAsync(q);
            return Results.Ok(result);
        })
        .WithName("GetOrders")
        .WithSummary("Lấy danh sách đơn hàng (chỉ Admin/Staff)")
        .RequireAuthorization(p => p.RequireClaim("permission", Permissions.OrdersRead));

        // GET /api/orders/{id}  [Staff / Admin]
        g.MapGet("/{id}", async (string id, OrderService svc) =>
        {
            var order = await svc.GetByIdAsync(id);
            return order is null
                ? Results.NotFound(new { error = "Không tìm thấy đơn hàng" })
                : Results.Ok(order);
        })
        .WithName("GetOrderById")
        .WithSummary("Lấy chi tiết đơn hàng")
        .RequireAuthorization(p => p.RequireClaim("permission", Permissions.OrdersRead));

        // PATCH /api/orders/{id}/status  [Staff / Admin]
        g.MapPatch("/{id}/status", async (string id, UpdateOrderStatusRequest req, OrderService svc) =>
        {
            var (ok, error, result) = await svc.UpdateStatusAsync(id, req);
            return ok ? Results.Ok(result) : Results.BadRequest(new { error });
        })
        .WithName("UpdateOrderStatus")
        .WithSummary("Cập nhật trạng thái đơn hàng (Pending→Confirmed→Shipping→Completed / Cancelled)")
        .RequireAuthorization(p => p.RequireClaim("permission", Permissions.OrdersUpdate));
    }
}
