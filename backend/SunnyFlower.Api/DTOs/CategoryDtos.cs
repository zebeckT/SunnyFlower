using System.ComponentModel.DataAnnotations;

namespace SunnyFlower.Api.DTOs;

// ─── Response ───────────────────────────────────────────────────────────────

public record CategoryDto(
    string Id,
    string Name,
    string? Description,
    string? Image,
    int ProductCount);

// ─── Request ─────────────────────────────────────────────────────────────────

public record CreateCategoryRequest(
    [Required, MinLength(2), MaxLength(100)] string Id,   // slug, ví dụ: "hoa-hong"
    [Required, MinLength(2), MaxLength(200)] string Name,
    [MaxLength(500)] string? Description,
    [MaxLength(500)] string? Image);

public record UpdateCategoryRequest(
    [Required, MinLength(2), MaxLength(200)] string Name,
    [MaxLength(500)] string? Description,
    [MaxLength(500)] string? Image);
