using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class Doctor
{
    public int DoctorId { get; set; }

    public int SpecialtyId { get; set; }

    public string Name { get; set; } = null!;

    public int? ExperienceYears { get; set; }

    public string? Phone { get; set; }

    public string? ZaloUrl { get; set; }

    public string? Address { get; set; }

    public string? BioDetail { get; set; }

    public string? ImageUrl { get; set; }

    public bool? IsActive { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<DoctorCertificate> DoctorCertificates { get; set; } = new List<DoctorCertificate>();

    public virtual Specialty Specialty { get; set; } = null!;
}
