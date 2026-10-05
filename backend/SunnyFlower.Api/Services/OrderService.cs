using Microsoft.EntityFrameworkCore;
using SunnyFlower.Api.Data;
using SunnyFlower.Api.DTOs;
using SunnyFlower.Api.Entities;

namespace SunnyFlower.Api.Services;

public class OrderService(AppDbContext db)
{
    // ─── Mapping helpers ────────────────────────────────────────────────────

    private static ShippingInfoDto ToShippingDto(ShippingInfo s) => new(
        s.FullName, s.Phone, s.Email, s.Address, s.Ward,
        s.District, s.City, s.DeliveryDate, s.CardMessage);

    private static OrderItemDto ToItemDto(OrderItem i) => new(
        i.Id, i.ProductId, i.Name, i.Image, i.UnitPrice, i.Quantity, i.LineTotal);

    private static OrderDto ToDto(Order o) => new(
        o.Id, o.Status.ToString(), o.PaymentMethod.ToString(),
        o.Subtotal, o.ShippingFee, o.Total, o.Note, o.CreatedAt,
        ToShippingDto(o.Shipping),
        o.Items.Select(ToItemDto).ToList());

    private static OrderSummaryDto ToSummary(Order o) => new(
        o.Id, o.Status.ToString(), o.PaymentMethod.ToString(),
        o.Total, o.Shipping.FullName, o.Shipping.Phone, o.Shipping.City,
        o.CreatedAt, o.Items.Count);

    // ─── Tạo mã đơn hàng dạng SF-20261005-0001 ───────────────────────────

    private async Task<string> GenerateOrderIdAsync()
    {
        var prefix = $"SF-{DateTime.UtcNow:yyyyMMdd}-";
        var todayCount = await db.Orders
            .CountAsync(o => o.Id.StartsWith(prefix));
        return $"{prefix}{(todayCount + 1):D4}";
    }

    // ─── Queries ────────────────────────────────────────────────────────────

    public async Task<OrderListResponse> GetAllAsync(OrderQueryParams q)
    {
        var query = db.Orders
            .Include(o => o.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(q.Status) &&
            Enum.TryParse<OrderStatus>(q.Status, true, out var status))
            query = query.Where(o => o.Status == status);

        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var kw = q.Search.Trim().ToLower();
            query = query.Where(o =>
                o.Shipping.FullName.ToLower().Contains(kw) ||
                o.Shipping.Phone.Contains(kw) ||
                o.Id.Contains(kw));
        }

        query = q.SortDir?.ToLower() == "asc"
            ? query.OrderBy(o => o.CreatedAt)
            : query.OrderByDescending(o => o.CreatedAt);

        var page     = Math.Max(1, q.Page);
        var pageSize = Math.Clamp(q.PageSize, 1, 100);
        var total    = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => ToSummary(o))
            .ToListAsync();

        return new OrderListResponse(items, total, page, pageSize,
            (int)Math.Ceiling((double)total / pageSize));
    }

    public async Task<OrderDto?> GetByIdAsync(string id)
    {
        var order = await db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);
        return order is null ? null : ToDto(order);
    }

    // ─── Tạo đơn hàng ────────────────────────────────────────────────────

    public async Task<(bool Ok, string? Error, OrderDto? Result)> CreateAsync(CreateOrderRequest req)
    {
        // Validate payment method
        if (!Enum.TryParse<PaymentMethod>(req.PaymentMethod, true, out var payMethod))
            return (false, "Phương thức thanh toán không hợp lệ. Dùng: Cod | BankTransfer", null);

        // Validate & fetch products
        var productIds = req.Items.Select(i => i.ProductId).Distinct().ToList();
        var products   = await db.Products
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id);

        var missingProduct = productIds.FirstOrDefault(id => !products.ContainsKey(id));
        if (missingProduct is not null)
            return (false, $"Sản phẩm '{missingProduct}' không tồn tại", null);

        // Check stock
        foreach (var item in req.Items)
        {
            var product = products[item.ProductId];
            if (product.Stock < item.Quantity)
                return (false, $"Sản phẩm '{product.Name}' chỉ còn {product.Stock} trong kho", null);
        }

        // Build order items (snapshot data at purchase time)
        var orderItems = req.Items.Select(i =>
        {
            var p = products[i.ProductId];
            return new OrderItem
            {
                ProductId = p.Id,
                Name      = p.Name,
                Image     = p.Image,
                UnitPrice = p.Price,
                Quantity  = i.Quantity,
                LineTotal = p.Price * i.Quantity
            };
        }).ToList();

        // Calculate price
        var subtotal    = orderItems.Sum(i => i.LineTotal);
        var shippingFee = CalculateShippingFee(req.Shipping.City, subtotal);
        var total       = subtotal + shippingFee;

        var shipping = req.Shipping;
        var order = new Order
        {
            Id            = await GenerateOrderIdAsync(),
            PaymentMethod = payMethod,
            Subtotal      = subtotal,
            ShippingFee   = shippingFee,
            Total         = total,
            Note          = req.Note?.Trim(),
            Items         = orderItems,
            Shipping = new ShippingInfo
            {
                FullName     = shipping.FullName.Trim(),
                Phone        = shipping.Phone.Trim(),
                Email        = shipping.Email?.Trim(),
                Address      = shipping.Address.Trim(),
                Ward         = shipping.Ward?.Trim(),
                District     = shipping.District.Trim(),
                City         = shipping.City.Trim(),
                DeliveryDate = shipping.DeliveryDate,
                CardMessage  = shipping.CardMessage?.Trim()
            }
        };

        db.Orders.Add(order);

        // Deduct stock
        foreach (var item in req.Items)
            products[item.ProductId].Stock -= item.Quantity;

        await db.SaveChangesAsync();

        // Reload
        var created = await db.Orders
            .Include(o => o.Items)
            .FirstAsync(o => o.Id == order.Id);

        return (true, null, ToDto(created));
    }

    // ─── Cập nhật trạng thái đơn hàng ────────────────────────────────────

    public async Task<(bool Ok, string? Error, OrderDto? Result)> UpdateStatusAsync(string id, UpdateOrderStatusRequest req)
    {
        var order = await db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null) return (false, "Không tìm thấy đơn hàng", null);

        if (!Enum.TryParse<OrderStatus>(req.Status, true, out var newStatus))
            return (false, "Trạng thái không hợp lệ. Dùng: Pending|Confirmed|Shipping|Completed|Cancelled", null);

        // Hoàn stock khi hủy
        if (newStatus == OrderStatus.Cancelled && order.Status != OrderStatus.Cancelled)
        {
            var productIds = order.Items.Select(i => i.ProductId).ToList();
            var products   = await db.Products.Where(p => productIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id);
            foreach (var item in order.Items)
                if (products.TryGetValue(item.ProductId, out var p))
                    p.Stock += item.Quantity;
        }

        order.Status = newStatus;
        await db.SaveChangesAsync();

        return (true, null, ToDto(order));
    }

    // ─── Tính phí ship ───────────────────────────────────────────────────

    private static int CalculateShippingFee(string city, int subtotal)
    {
        // Miễn phí ship khi đặt hàng >= 500.000 VND tại nội thành HCM/HN
        var innerCity = new[] { "Hồ Chí Minh", "Hà Nội" };
        if (innerCity.Any(c => city.Contains(c, StringComparison.OrdinalIgnoreCase)) && subtotal >= 500_000)
            return 0;

        return city.Contains("Hồ Chí Minh", StringComparison.OrdinalIgnoreCase) ||
               city.Contains("Hà Nội", StringComparison.OrdinalIgnoreCase)
            ? 30_000
            : 50_000;
    }
}
