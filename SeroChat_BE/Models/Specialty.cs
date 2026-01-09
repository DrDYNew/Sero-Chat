using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class Specialty
{
    public int SpecialtyId { get; set; }

    public string SpecialtyName { get; set; } = null!;

    public string? Description { get; set; }

    public virtual ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
}
