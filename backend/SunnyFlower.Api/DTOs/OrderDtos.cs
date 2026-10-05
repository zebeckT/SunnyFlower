using System.ComponentModel.DataAnnotations;
using SunnyFlower.Api.Entities;

namespace SunnyFlower.Api.DTOs;

// ─── Response ───────────────────────────────────────────────────────────────

public record ShippingInfoDto(
    string FullName,
    string Phone,
    string? Email,
    string Address,
    string? Ward,
    string District,
    string City,
    DateOnly? DeliveryDate,
    string? CardMessage);

public record OrderItemDto(
    int Id,
    string ProductId,
    string Name,
    string? Image,
    int UnitPrice,
    int Quantity,
    int LineTotal);

public record OrderDto(
    string Id,
    string Status,
    string PaymentMethod,
    int Subtotal,
    int ShippingFee,
    int Total,
    string? Note,
    DateTime CreatedAt,
    ShippingInfoDto Shipping,
    List<OrderItemDto> Items);

public record OrderSummaryDto(
    string Id,
    string Status,
    string PaymentMethod,
    int Total,
    string CustomerName,
    string CustomerPhone,
    string City,
    DateTime CreatedAt,
    int ItemCount);

public record OrderListResponse(
    List<OrderSummaryDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages);

// ─── Request ─────────────────────────────────────────────────────────────────

public record OrderItemRequest(
    [Required, MaxLength(100)] string ProductId,
    [Range(1, 20)] int Quantity);

public record CreateOrderRequest(
    [Required] List<OrderItemRequest> Items,
    [Required] string PaymentMethod,           // "Cod" | "BankTransfer"
    [MaxLength(500)] string? Note,
    [Required] ShippingInfoRequest Shipping);

public record ShippingInfoRequest(
    [Required, MaxLength(100)] string FullName,
    [Required, MaxLength(15)] string Phone,
    [EmailAddress, MaxLength(200)] string? Email,
    [Required, MaxLength(300)] string Address,
    [MaxLength(100)] string? Ward,
    [Required, MaxLength(100)] string District,
    [Required, MaxLength(100)] string City,
    DateOnly? DeliveryDate,
    [MaxLength(200)] string? CardMessage);

public record UpdateOrderStatusRequest(
    [Required] string Status);   // Pending|Confirmed|Shipping|Completed|Cancelled

// ─── Query filter ─────────────────────────────────────────────────────────────

public record OrderQueryParams(
    string? Status = null,
    string? Search = null,       // tìm theo tên KH / SĐT
    string SortDir = "desc",
    int Page = 1,
    int PageSize = 20);
