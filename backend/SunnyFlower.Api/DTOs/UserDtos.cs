using System.ComponentModel.DataAnnotations;

namespace SunnyFlower.Api.DTOs;

public record UpdateProfileRequest(
    [Required, MinLength(2), MaxLength(100)] string FullName
);

public record ChangePasswordRequest(
    [Required] string OldPassword,
    [Required, MinLength(8), MaxLength(100)] string NewPassword
);

public record AdminCreateUserRequest(
    [Required, MinLength(2), MaxLength(100)] string FullName,
    [Required, EmailAddress, MaxLength(200)] string Email,
    [Required, MinLength(8), MaxLength(100)] string Password,
    [Required] string RoleId
);

public record AdminUpdateUserRoleRequest(
    [Required] string RoleId
);

public record AdminUpdateUserStatusRequest(
    bool IsActive
);

public record UserDto(
    int Id,
    string Email,
    string FullName,
    string RoleId,
    bool IsActive,
    DateTime CreatedAt,
    List<string>? Permissions = null
);

public record UserListResponse(
    List<UserDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);
