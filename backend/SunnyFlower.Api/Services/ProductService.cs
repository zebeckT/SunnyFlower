using Microsoft.EntityFrameworkCore;
using SunnyFlower.Api.Data;
using SunnyFlower.Api.DTOs;
using SunnyFlower.Api.Entities;

namespace SunnyFlower.Api.Services;

public class ProductService(AppDbContext db)
{
    // ─── Mapping helpers ────────────────────────────────────────────────────

    private static ProductSummaryDto ToSummary(Product p) => new(
        p.Id, p.Name, p.Price, p.Image,
        p.CategoryId, p.Category?.Name ?? "",
        p.Stock, p.Featured, p.CreatedAt);

    private static ProductDetailDto ToDetail(Product p) => new(
        p.Id, p.Name, p.Description, p.Price, p.Image,
        p.CategoryId, p.Category?.Name ?? "",
        p.Stock, p.Featured, p.CreatedAt,
        p.Images.OrderBy(i => i.SortOrder)
                .Select(i => new ProductImageDto(i.Id, i.Url, i.SortOrder))
                .ToList());

    // ─── Queries ────────────────────────────────────────────────────────────

    public async Task<ProductListResponse> GetAllAsync(ProductQueryParams q)
    {
        var query = db.Products
            .Include(p => p.Category)
            .AsQueryable();

        // Filters
        if (!string.IsNullOrWhiteSpace(q.CategoryId))
            query = query.Where(p => p.CategoryId == q.CategoryId);

        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var kw = q.Search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(kw) ||
                                     (p.Description != null && p.Description.ToLower().Contains(kw)));
        }

        if (q.MinPrice.HasValue) query = query.Where(p => p.Price >= q.MinPrice.Value);
        if (q.MaxPrice.HasValue) query = query.Where(p => p.Price <= q.MaxPrice.Value);
        if (q.Featured.HasValue) query = query.Where(p => p.Featured == q.Featured.Value);
        if (q.InStock == true)   query = query.Where(p => p.Stock > 0);

        // Sort
        query = (q.SortBy?.ToLower(), q.SortDir?.ToLower()) switch
        {
            ("price", "asc")      => query.OrderBy(p => p.Price),
            ("price", _)          => query.OrderByDescending(p => p.Price),
            ("name", "asc")       => query.OrderBy(p => p.Name),
            ("name", _)           => query.OrderByDescending(p => p.Name),
            ("createdat", "asc")  => query.OrderBy(p => p.CreatedAt),
            _                     => query.OrderByDescending(p => p.CreatedAt),
        };

        // Paginate
        var page     = Math.Max(1, q.Page);
        var pageSize = Math.Clamp(q.PageSize, 1, 100);
        var total    = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => ToSummary(p))
            .ToListAsync();

        return new ProductListResponse(items, total, page, pageSize,
            (int)Math.Ceiling((double)total / pageSize));
    }

    public async Task<List<ProductSummaryDto>> GetFeaturedAsync(int take = 8)
    {
        return await db.Products
            .Include(p => p.Category)
            .Where(p => p.Featured && p.Stock > 0)
            .OrderByDescending(p => p.CreatedAt)
            .Take(take)
            .Select(p => ToSummary(p))
            .ToListAsync();
    }

    public async Task<ProductDetailDto?> GetByIdAsync(string id)
    {
        var product = await db.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        return product is null ? null : ToDetail(product);
    }

    // ─── Commands ────────────────────────────────────────────────────────────

    public async Task<(bool Ok, string? Error, ProductDetailDto? Result)> CreateAsync(CreateProductRequest req)
    {
        if (await db.Products.AnyAsync(p => p.Id == req.Id))
            return (false, $"Sản phẩm với id '{req.Id}' đã tồn tại", null);

        if (!await db.Categories.AnyAsync(c => c.Id == req.CategoryId))
            return (false, "Danh mục không tồn tại", null);

        var product = new Product
        {
            Id          = req.Id.Trim().ToLower(),
            Name        = req.Name.Trim(),
            Description = req.Description?.Trim(),
            Price       = req.Price,
            Image       = req.Image?.Trim(),
            CategoryId  = req.CategoryId,
            Stock       = req.Stock,
            Featured    = req.Featured,
            Images      = (req.Images ?? [])
                            .Select((u, i) => new ProductImage { Url = u, SortOrder = i })
                            .ToList()
        };

        db.Products.Add(product);
        await db.SaveChangesAsync();

        // Reload with Category
        var created = await db.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstAsync(p => p.Id == product.Id);

        return (true, null, ToDetail(created));
    }

    public async Task<(bool Ok, string? Error, ProductDetailDto? Result)> UpdateAsync(string id, UpdateProductRequest req)
    {
        var product = await db.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product is null) return (false, "Không tìm thấy sản phẩm", null);

        if (!await db.Categories.AnyAsync(c => c.Id == req.CategoryId))
            return (false, "Danh mục không tồn tại", null);

        product.Name        = req.Name.Trim();
        product.Description = req.Description?.Trim();
        product.Price       = req.Price;
        product.Image       = req.Image?.Trim();
        product.CategoryId  = req.CategoryId;
        product.Stock       = req.Stock;
        product.Featured    = req.Featured;

        // Replace images
        db.ProductImages.RemoveRange(product.Images);
        product.Images = (req.Images ?? [])
            .Select((u, i) => new ProductImage { ProductId = id, Url = u, SortOrder = i })
            .ToList();

        await db.SaveChangesAsync();
        await db.Entry(product).Reference(p => p.Category).LoadAsync();

        return (true, null, ToDetail(product));
    }

    public async Task<(bool Ok, string? Error)> UpdateStockAsync(string id, int stock)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return (false, "Không tìm thấy sản phẩm");

        product.Stock = stock;
        await db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool Ok, string? Error)> DeleteAsync(string id)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return (false, "Không tìm thấy sản phẩm");

        var inOrders = await db.OrderItems.AnyAsync(oi => oi.ProductId == id);
        if (inOrders) return (false, "Không thể xóa sản phẩm đã có trong đơn hàng. Hãy đặt Stock = 0 để ẩn.");

        db.Products.Remove(product);
        await db.SaveChangesAsync();
        return (true, null);
    }
}
