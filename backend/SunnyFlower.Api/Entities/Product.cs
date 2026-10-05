namespace SunnyFlower.Api.Entities;

public class Product
{
    public string Id { get; set; } = default!; // slug
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public int Price { get; set; } // VND
    public string? Image { get; set; }
    public string CategoryId { get; set; } = default!;
    public int Stock { get; set; }
    public bool Featured { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Category Category { get; set; } = default!;
    public List<ProductImage> Images { get; set; } = [];
}

public class ProductImage
{
    public int Id { get; set; }
    public string ProductId { get; set; } = default!;
    public string Url { get; set; } = default!;
    public int SortOrder { get; set; }

    public Product Product { get; set; } = default!;
}
