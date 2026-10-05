using Microsoft.EntityFrameworkCore;
using SunnyFlower.Api.Data;
using SunnyFlower.Api.DTOs;
using SunnyFlower.Api.Entities;

namespace SunnyFlower.Api.Services;

public class ContactService(AppDbContext db)
{
    // ─── Queries ────────────────────────────────────────────────────────────

    public async Task<ContactListResponse> GetAllAsync(int page = 1, int pageSize = 20)
    {
        page     = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.ContactMessages.OrderByDescending(m => m.CreatedAt);
        var total = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new ContactMessageDto(m.Id, m.FullName, m.Email, m.Phone, m.Content, m.CreatedAt))
            .ToListAsync();

        return new ContactListResponse(items, total, page, pageSize,
            (int)Math.Ceiling((double)total / pageSize));
    }

    // ─── Commands ────────────────────────────────────────────────────────────

    public async Task<ContactMessageDto> CreateAsync(CreateContactRequest req)
    {
        var message = new ContactMessage
        {
            FullName = req.FullName.Trim(),
            Email    = req.Email?.Trim(),
            Phone    = req.Phone?.Trim(),
            Content  = req.Content.Trim()
        };

        db.ContactMessages.Add(message);
        await db.SaveChangesAsync();

        return new ContactMessageDto(message.Id, message.FullName, message.Email,
            message.Phone, message.Content, message.CreatedAt);
    }
}
