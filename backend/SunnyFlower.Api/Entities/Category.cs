namespace SunnyFlower.Api.Entities;

public class Category
{
    public string Id { get; set; } = default!; // slug
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public string? Image { get; set; }

    public List<Product> Products { get; set; } = [];
}
