using System.ComponentModel.DataAnnotations;

namespace SunnyFlower.Api.DTOs;

// ─── Response ───────────────────────────────────────────────────────────────

public record ContactMessageDto(
    int Id,
    string FullName,
    string? Email,
    string? Phone,
    string Content,
    DateTime CreatedAt);

public record ContactListResponse(
    List<ContactMessageDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages);

// ─── Request ─────────────────────────────────────────────────────────────────

public record CreateContactRequest(
    [Required, MaxLength(100)] string FullName,
    [EmailAddress, MaxLength(200)] string? Email,
    [MaxLength(15)] string? Phone,
    [Required, MinLength(10), MaxLength(2000)] string Content);
