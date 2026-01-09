using System;
using System.Collections.Generic;

namespace SeroChat_BE.Models;

public partial class DoctorCertificate
{
    public int CertId { get; set; }

    public int DoctorId { get; set; }

    public string? CertificateName { get; set; }

    public string ImageUrl { get; set; } = null!;

    public DateTime? UploadedAt { get; set; }

    public virtual Doctor Doctor { get; set; } = null!;
}
