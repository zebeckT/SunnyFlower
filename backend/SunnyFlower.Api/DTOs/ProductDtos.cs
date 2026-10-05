using System.ComponentModel.DataAnnotations;

namespace SunnyFlower.Api.DTOs;

// ─── Response ───────────────────────────────────────────────────────────────

public record ProductImageDto(int Id, string Url, int SortOrder);

public record ProductSummaryDto(
    string Id,
    string Name,
    int Price,
    string? Image,
    string CategoryId,
    string CategoryName,
    int Stock,
    bool Featured,
    DateTime CreatedAt);

public record ProductDetailDto(
    string Id,
    string Name,
    string? Description,
    int Price,
    string? Image,
    string CategoryId,
    string CategoryName,
    int Stock,
    bool Featured,
    DateTime CreatedAt,
    List<ProductImageDto> Images);

public record ProductListResponse(
    List<ProductSummaryDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages);

// ─── Request ─────────────────────────────────────────────────────────────────

public record CreateProductRequest(
    [Required, MinLength(2), MaxLength(100)] string Id,     // slug, vd: "hoa-hong-do-100"
    [Required, MinLength(2), MaxLength(200)] string Name,
    [MaxLength(2000)] string? Description,
    [Range(1, 100_000_000)] int Price,
    [MaxLength(500)] string? Image,
    [Required, MaxLength(100)] string CategoryId,
    [Range(0, 9999)] int Stock,
    bool Featured,
    List<string>? Images);

public record UpdateProductRequest(
    [Required, MinLength(2), MaxLength(200)] string Name,
    [MaxLength(2000)] string? Description,
    [Range(1, 100_000_000)] int Price,
    [MaxLength(500)] string? Image,
    [Required, MaxLength(100)] string CategoryId,
    [Range(0, 9999)] int Stock,
    bool Featured,
    List<string>? Images);

public record UpdateStockRequest([Range(0, 9999)] int Stock);

// ─── Query filter ─────────────────────────────────────────────────────────────

public record ProductQueryParams(
    string? CategoryId = null,
    string? Search = null,
    int? MinPrice = null,
    int? MaxPrice = null,
    bool? Featured = null,
    bool? InStock = null,
    string SortBy = "createdAt",   // createdAt | price | name
    string SortDir = "desc",        // asc | desc
    int Page = 1,
    int PageSize = 12);
