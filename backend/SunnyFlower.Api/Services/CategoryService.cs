using Microsoft.EntityFrameworkCore;
using SunnyFlower.Api.Data;
using SunnyFlower.Api.DTOs;
using SunnyFlower.Api.Entities;

namespace SunnyFlower.Api.Services;

public class CategoryService(AppDbContext db)
{
    // ─── Queries ────────────────────────────────────────────────────────────

    public async Task<List<CategoryDto>> GetAllAsync()
    {
        return await db.Categories
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto(
                c.Id, c.Name, c.Description, c.Image,
                c.Products.Count(p => p.Stock > 0)))
            .ToListAsync();
    }

    public async Task<CategoryDto?> GetByIdAsync(string id)
    {
        return await db.Categories
            .Where(c => c.Id == id)
            .Select(c => new CategoryDto(
                c.Id, c.Name, c.Description, c.Image,
                c.Products.Count(p => p.Stock > 0)))
            .FirstOrDefaultAsync();
    }

    // ─── Commands ────────────────────────────────────────────────────────────

    public async Task<(bool Ok, string? Error, CategoryDto? Result)> CreateAsync(CreateCategoryRequest req)
    {
        if (await db.Categories.AnyAsync(c => c.Id == req.Id))
            return (false, $"Danh mục với id '{req.Id}' đã tồn tại", null);

        var cat = new Category
        {
            Id = req.Id.Trim().ToLower(),
            Name = req.Name.Trim(),
            Description = req.Description?.Trim(),
            Image = req.Image?.Trim()
        };

        db.Categories.Add(cat);
        await db.SaveChangesAsync();

        return (true, null, new CategoryDto(cat.Id, cat.Name, cat.Description, cat.Image, 0));
    }

    public async Task<(bool Ok, string? Error, CategoryDto? Result)> UpdateAsync(string id, UpdateCategoryRequest req)
    {
        var cat = await db.Categories.FindAsync(id);
        if (cat is null) return (false, "Không tìm thấy danh mục", null);

        cat.Name = req.Name.Trim();
        cat.Description = req.Description?.Trim();
        cat.Image = req.Image?.Trim();

        await db.SaveChangesAsync();

        var count = await db.Products.CountAsync(p => p.CategoryId == id && p.Stock > 0);
        return (true, null, new CategoryDto(cat.Id, cat.Name, cat.Description, cat.Image, count));
    }

    public async Task<(bool Ok, string? Error)> DeleteAsync(string id)
    {
        var cat = await db.Categories.FindAsync(id);
        if (cat is null) return (false, "Không tìm thấy danh mục");

        var hasProducts = await db.Products.AnyAsync(p => p.CategoryId == id);
        if (hasProducts) return (false, "Không thể xóa danh mục còn chứa sản phẩm");

        db.Categories.Remove(cat);
        await db.SaveChangesAsync();
        return (true, null);
    }
}
