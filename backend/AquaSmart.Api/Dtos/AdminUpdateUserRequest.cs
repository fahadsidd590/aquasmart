using System.ComponentModel.DataAnnotations;

namespace AquaSmart.Api.Dtos;

public sealed class AdminUpdateUserRequest
{
    [MaxLength(100)]
    public string? Name { get; set; }

    public bool? IsActive { get; set; }

    [MaxLength(50)]
    public string? Role { get; set; }

    [MinLength(6)]
    [MaxLength(100)]
    public string? Password { get; set; }

    public int? AreaId { get; set; }
}
