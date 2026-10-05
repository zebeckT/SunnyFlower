namespace SunnyFlower.Api.Entities;

public enum OrderStatus { Pending, Confirmed, Shipping, Completed, Cancelled }

public enum PaymentMethod { Cod, BankTransfer }

public class Order
{
    public string Id { get; set; } = default!; // SF-yyyyMMdd-0001
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public PaymentMethod PaymentMethod { get; set; }
    public int Subtotal { get; set; }
    public int ShippingFee { get; set; }
    public int Total { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ShippingInfo Shipping { get; set; } = default!; // owned
    public List<OrderItem> Items { get; set; } = [];
}

public class ShippingInfo
{
    public string FullName { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public string? Email { get; set; }
    public string Address { get; set; } = default!;
    public string? Ward { get; set; }
    public string District { get; set; } = default!;
    public string City { get; set; } = default!;
    public DateOnly? DeliveryDate { get; set; }
    public string? CardMessage { get; set; }
}

/// <summary>Snapshot of product data at purchase time.</summary>
public class OrderItem
{
    public int Id { get; set; }
    public string OrderId { get; set; } = default!;
    public string ProductId { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Image { get; set; }
    public int UnitPrice { get; set; }
    public int Quantity { get; set; }
    public int LineTotal { get; set; }

    public Order Order { get; set; } = default!;
    public Product? Product { get; set; }
}

/// <summary>Contact form (/lien-he).</summary>
public class ContactMessage
{
    public int Id { get; set; }
    public string FullName { get; set; } = default!;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Content { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
